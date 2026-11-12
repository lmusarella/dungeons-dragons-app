import { catalogDescription, catalogName } from '../dndCatalog/catalogLocale.js';
import { buildFormulaContext, evaluateFormula, resolveProgression, resolveRecovery } from './resourceFormula.js';

/**
 * Risolutore delle risorse condivise D&D. Funzioni pure: producono un piano di operazioni da eseguire
 * con la persistenza esistente (`createResource` / `updateResource`) senza mai toccare `used`.
 *
 * @typedef {{ feature: object, optionId?: string|null, option?: object|null }} OwnedFeature
 * @typedef {{ pools: Map<string, object>, providers: object[], actions: object[], options?: Map<string, object> }} ResourceDefinitions
 * @typedef {{ op: 'create'|'update', key: string, parentKey?: string|null, id?: string, payload: object, reasons?: string[] }} ResourceOperation
 */

const MANAGED_FIELDS = ['max_uses', 'reset_on', 'recovery_short', 'recovery_long', 'resource_cost', 'resource_cost_variable', 'cast_time', 'can_have_children', 'resource_type'];

const ACTIVATION_LABELS = {
  action: 'Azione', bonus: 'Azione Bonus', bonus_action: 'Azione Bonus', reaction: 'Reazione', free: 'Azione Gratuita', free_action: 'Azione Gratuita', no_action: 'Azione Gratuita'
};

export const activationLabel = (type) => ACTIVATION_LABELS[String(type || '').toLowerCase().replace(/[\s-]+/g, '_')] || null;

const normalizeName = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export const poolKey = (poolId) => `pool:${poolId}`;
export const featureKey = (featureId) => `feature:${featureId}`;
export const consumeKey = (action) => `consume:${action.pool_id}:${action.shared_feature_id || ''}:${action.shared_choice_option_id || ''}:${action.variant_key || ''}`;

export function describeConditions(value) {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(describeConditions).filter(Boolean).join('; ');
  if (typeof value === 'object') return Object.entries(value).map(([key, entry]) => {
    const text = describeConditions(entry);
    return text ? `${key.replaceAll('_', ' ')}: ${text}` : '';
  }).filter(Boolean).join('; ');
  return '';
}

function joinDescription(parts) {
  return parts.map((part) => String(part || '').trim()).filter(Boolean).join('\n\n') || null;
}

function recoveryPlan(source, max, variables, label, unresolved) {
  const short = resolveRecovery(source.recovery_short_formula, max, variables);
  const long = resolveRecovery(source.recovery_long_formula, max, variables);
  if (short === undefined || long === undefined) unresolved.push({ key: label, reason: 'Formula di recupero mancante o non supportata: recupero non automatizzato.' });
  const resetOn = (short || 0) > 0 ? 'short_rest' : (long || 0) > 0 ? 'long_rest' : 'none';
  return { recovery_short: short ?? null, recovery_long: long ?? null, reset_on: resetOn };
}

/**
 * @param {{ character: { data?: object }, owned: OwnedFeature[], definitions: ResourceDefinitions, existing?: object[], rulesVersion?: string }} input
 */
export function planCatalogResources({ character, owned = [], definitions, existing = [], rulesVersion }) {
  const data = character?.data || {};
  const level = Number(data.level) || 1;
  const variables = buildFormulaContext({ level, classLevel: level, proficiencyBonus: data.proficiency_bonus, abilities: data.abilities || {} });
  const version = String(rulesVersion || data.rules_version || '');
  const summary = { created: 0, updated: 0, unchanged: 0, skipped: [], unresolved: [], review: [], info: [] };
  const operations = [];

  const ownedFeatures = new Map();
  const ownedOptionIds = new Set();
  owned.forEach(({ feature, optionId }) => {
    if (feature?.id) ownedFeatures.set(String(feature.id), feature);
    if (optionId) ownedOptionIds.add(String(optionId));
  });
  const optionOwned = (id) => ownedOptionIds.has(String(id));
  const pools = definitions.pools || new Map();
  const matchesVersion = (pool) => !version || !pool.rules_version || String(pool.rules_version) === version;

  const actionOwner = (action) => (action.shared_choice_option_id
    ? optionOwned(action.shared_choice_option_id)
    : Boolean(action.shared_feature_id && ownedFeatures.has(String(action.shared_feature_id))));
  const providerOwned = (provider) => ownedFeatures.has(String(provider.shared_feature_id));

  const activePoolIds = new Set([
    ...definitions.providers.filter(providerOwned).map((provider) => String(provider.pool_id)),
    ...definitions.actions.filter(actionOwner).map((action) => String(action.pool_id))
  ]);

  const linked = new Map(existing.filter((row) => row.catalog_key).map((row) => [row.catalog_key, row]));
  const manualByName = new Map(existing.filter((row) => !row.catalog_key).map((row) => [normalizeName(row.name), row]));

  const emit = (key, payload, { parentKey = null, label }) => {
    const current = linked.get(key);
    if (current) {
      const changes = {};
      MANAGED_FIELDS.forEach((field) => {
        if (field in payload && (current[field] ?? null) !== (payload[field] ?? null)) changes[field] = payload[field];
      });
      if (!Object.keys(changes).length) { summary.unchanged += 1; return { id: current.id, key }; }
      operations.push({ op: 'update', key, id: current.id, parentKey, payload: changes });
      summary.updated += 1;
      return { id: current.id, key };
    }
    const duplicate = manualByName.get(normalizeName(payload.name));
    if (duplicate && !parentKey) {
      summary.skipped.push({ key, name: label, reason: 'Esiste già una risorsa manuale con lo stesso nome: non duplicata né modificata.' });
      return null;
    }
    operations.push({ op: 'create', key, parentKey, payload: { ...payload, catalog_key: key } });
    summary.created += 1;
    return { id: null, key };
  };

  const resolvedParents = new Map();

  pools.forEach((pool) => {
    if (!activePoolIds.has(String(pool.id)) || !matchesVersion(pool)) return;
    const key = poolKey(pool.id);
    const name = catalogName(pool, pool.resource_key);
    const progressionMax = resolveProgression(pool.max_progression, level, variables);
    const rawMax = progressionMax ?? evaluateFormula(pool.max_formula, variables);
    if (rawMax === null || rawMax === undefined) {
      summary.unresolved.push({ key, name, reason: 'Massimo del pool non determinabile (formula o progressione mancante/non supportata): nessun contatore creato.' });
      return;
    }
    const max = Math.max(0, Math.floor(rawMax));
    const providerNotes = definitions.providers
      .filter((provider) => String(provider.pool_id) === String(pool.id) && providerOwned(provider) && provider.rule_details)
      .map((provider) => describeConditions(provider.rule_details));
    const restores = definitions.actions
      .filter((action) => String(action.pool_id) === String(pool.id) && actionOwner(action) && action.operation && action.operation !== 'consume')
      .map((action) => `${action.operation === 'restore' ? 'Ripristina' : action.operation}: ${describeConditions(action.amount_formula) || 'da valutare'}`);
    const recovery = recoveryPlan(pool, max, variables, name, summary.unresolved);
    const target = emit(key, {
      name,
      resource_type: 'pool',
      can_have_children: true,
      max_uses: max,
      cast_time: null,
      description: joinDescription([pool.resource_unit ? `Unità: ${pool.resource_unit}` : '', ...providerNotes, ...restores.length ? [`Ripristini speciali: ${[...new Set(restores)].join('; ')}`] : [], describeConditions(pool.resource_rules)]),
      ...recovery
    }, { label: name });
    if (target) resolvedParents.set(String(pool.id), key);
    else summary.skipped.push({ key, name, reason: 'Opzioni del pool non create perché il pool è una risorsa manuale.' });
  });

  const seenChildren = new Set();
  definitions.actions.forEach((action) => {
    if (!actionOwner(action)) return;
    if (action.operation && action.operation !== 'consume') return;
    const parentKey = resolvedParents.get(String(action.pool_id));
    if (!parentKey) return;
    const key = consumeKey(action);
    if (seenChildren.has(key)) return;
    seenChildren.add(key);
    const feature = action.shared_feature_id ? ownedFeatures.get(String(action.shared_feature_id)) : null;
    const option = action.shared_choice_option_id ? definitions.options?.get(String(action.shared_choice_option_id)) : null;
    const baseName = option ? (option.label_override_it || catalogName(option.entity) || option.label_override || option.static_code) : catalogName(feature);
    if (!baseName) { summary.unresolved.push({ key, name: key, reason: 'Nome della capacità o dell’opzione non disponibile.' }); return; }
    const name = action.variant_key ? `${baseName} (${String(action.variant_key).replaceAll('_', ' ')})` : baseName;
    const amount = evaluateFormula(action.amount_formula, variables);
    const review = Boolean(action.requires_review) || amount === null;
    const known = amount !== null && Number.isFinite(amount) ? Math.floor(amount) : null;
    if (known === 0 && !review) { summary.info.push({ key, name, reason: 'Costo 0: nessuna riga di consumo creata.' }); return; }
    if (review) summary.review.push({ key, name, reason: 'Costo da revisionare: il consumo è manuale (costo variabile).' });
    const owner = feature || option?.entity || null;
    emit(key, {
      name,
      resource_type: 'passive',
      parent_resource_id: null,
      can_have_children: false,
      max_uses: 0,
      used: 0,
      reset_on: null,
      recovery_short: null,
      recovery_long: null,
      resource_cost: Math.max(1, known || 1),
      resource_cost_variable: review,
      cast_time: activationLabel(owner?.activation_type),
      description: joinDescription([owner ? catalogDescription(owner) : '', describeConditions(action.conditions) ? `Condizioni: ${describeConditions(action.conditions)}` : '', review ? 'Costo da revisionare: scegli il costo al momento dell’uso.' : ''])
    }, { parentKey, label: name });
  });

  ownedFeatures.forEach((feature) => {
    const model = feature.resource_model;
    if (model === 'unlimited') { summary.info.push({ key: featureKey(feature.id), name: catalogName(feature), reason: 'Utilizzi illimitati: nessun contatore.' }); return; }
    if (model === 'own_charges') {
      const key = featureKey(feature.id);
      const name = catalogName(feature);
      const max = evaluateFormula(feature.max_uses_formula, variables);
      if (max === null) { summary.unresolved.push({ key, name, reason: 'Utilizzi massimi mancanti o non supportati: nessun contatore creato.' }); return; }
      const total = Math.max(0, Math.floor(max));
      emit(key, {
        name,
        resource_type: 'charges',
        can_have_children: false,
        max_uses: total,
        cast_time: activationLabel(feature.activation_type),
        description: joinDescription([catalogDescription(feature), describeConditions(feature.resource_details)]),
        ...recoveryPlan(feature, total, variables, name, summary.unresolved)
      }, { label: name });
      return;
    }
    if (model === 'unresolved') summary.unresolved.push({ key: featureKey(feature.id), name: catalogName(feature), reason: 'Modello di risorsa non ancora classificato nel catalogo.' });
    if ((model === 'pool_consumer') && !definitions.actions.some((action) => String(action.shared_feature_id) === String(feature.id))) {
      summary.unresolved.push({ key: featureKey(feature.id), name: catalogName(feature), reason: 'Consuma un pool ma il catalogo non definisce l’azione di consumo.' });
    }
  });

  return { operations, summary };
}
