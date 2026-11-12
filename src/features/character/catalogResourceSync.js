import { supabase } from '../../lib/supabase.js';
import { getState } from '../../app/state.js';
import { getCharacterProgression } from '../dndCatalog/catalogRelations.js';
import { createResource, fetchResources, updateResource } from './characterApi.js';
import { planCatalogResources } from './characterResourceResolver.js';

const MISSING_TABLE = ['42P01', 'PGRST205'];

function unwrap(result, { optional = false } = {}) {
  if (result.error) {
    if (optional && MISSING_TABLE.includes(result.error.code)) return [];
    throw result.error;
  }
  return result.data || [];
}

export const catalogRulesVersion = (character) => String(character?.data?.rules_version || character?.system || '2014').replace(/\D/g, '') || '2014';

export function hasCatalogSelection(character) {
  const data = character?.data || {};
  return Boolean(data.shared_class_id || data.shared_subclass_id || data.shared_species_id || data.shared_species_variant_id || data.shared_background_id);
}

/** Capacità effettivamente possedute: concessioni automatiche sbloccate + opzioni di scelta selezionate. */
export function collectOwnedFeatures(progression, selectedOptionIds = []) {
  const selected = new Set(selectedOptionIds.map(String));
  const owned = new Map();
  (progression?.automaticGrants || []).forEach((grant) => {
    if (grant.target_type === 'feature' && grant.entity?.id) owned.set(`feature:${grant.entity.id}`, { feature: grant.entity, optionId: null });
  });
  const options = new Map();
  (progression?.choiceGroups || []).flatMap((group) => group.options || []).forEach((option) => {
    if (!selected.has(String(option.id))) return;
    options.set(String(option.id), option);
    if (option.entity?.id && option.target_type === 'feature') owned.set(`option:${option.id}`, { feature: option.entity, optionId: option.id, option });
    else owned.set(`option:${option.id}`, { feature: null, optionId: option.id, option });
  });
  return { owned: [...owned.values()], options };
}

/**
 * Carica le definizioni condivise collegate alle capacità e alle opzioni possedute.
 * Le relazioni sono sempre UUID: mai il nome tradotto.
 */
export async function loadResourceDefinitions({ featureIds, optionIds, rulesVersion }) {
  const byFeature = featureIds.length
    ? await Promise.all([
      supabase.from('shared_resource_providers').select('*').in('shared_feature_id', featureIds),
      supabase.from('shared_resource_actions').select('*').in('shared_feature_id', featureIds)
    ]).then(([providers, actions]) => [unwrap(providers, { optional: true }), unwrap(actions, { optional: true })])
    : [[], []];
  const optionActions = optionIds.length
    ? unwrap(await supabase.from('shared_resource_actions').select('*').in('shared_choice_option_id', optionIds), { optional: true })
    : [];
  const providers = byFeature[0];
  const actions = [...new Map([...byFeature[1], ...optionActions].map((action) => [`${action.pool_id}:${action.shared_feature_id || ''}:${action.shared_choice_option_id || ''}:${action.variant_key || ''}:${action.operation || ''}`, action])).values()];
  const poolIds = [...new Set([...providers, ...actions].map((row) => row.pool_id).filter(Boolean))];
  const pools = poolIds.length
    ? unwrap(await supabase.from('shared_resource_pools').select('*').in('id', poolIds).eq('rules_version', rulesVersion), { optional: true })
    : [];
  return { pools: new Map(pools.map((pool) => [String(pool.id), pool])), providers, actions };
}

/** Esegue il piano con la persistenza esistente. Non scrive mai `used`. */
export async function executeResourcePlan(character, operations, existing = []) {
  const ids = new Map(existing.filter((row) => row.catalog_key).map((row) => [row.catalog_key, row.id]));
  const userId = getState().user?.id ?? character.user_id;
  try {
    for (const operation of operations) {
      if (operation.op === 'update') {
        await updateResource(operation.id, operation.payload);
        continue;
      }
      const parentId = operation.parentKey ? ids.get(operation.parentKey) : null;
      if (operation.parentKey && !parentId) continue;
      const created = await createResource({
        ...operation.payload,
        user_id: userId,
        character_id: character.id,
        parent_resource_id: parentId || null
      });
      ids.set(operation.key, created.id);
    }
  } catch (error) {
    if (['42703', 'PGRST204'].includes(error?.code) && /catalog_key/.test(error?.message || '')) {
      throw new Error('Colonna resources.catalog_key mancante: esegui db/add_resource_catalog_link.sql');
    }
    throw error;
  }
}

/**
 * Sincronizza le risorse del personaggio con le definizioni condivise.
 * Idempotente: crea le righe mancanti, aggiorna solo massimi/recuperi/costi e conserva `used`.
 */
export async function syncCatalogResources(character) {
  const data = character?.data || {};
  const rulesVersion = catalogRulesVersion(character);
  const level = Number(data.level) || 1;
  const progression = await getCharacterProgression({
    classId: data.shared_class_id,
    subclassId: data.shared_subclass_id,
    speciesId: data.shared_species_id,
    speciesVariantId: data.shared_species_variant_id,
    backgroundId: data.shared_background_id,
    level,
    classLevel: level,
    rulesVersion
  });
  const { owned, options } = collectOwnedFeatures(progression, data.catalog_choice_option_ids || []);
  const featureIds = [...new Set(owned.map((entry) => entry.feature?.id).filter(Boolean).map(String))];
  const optionIds = [...options.keys()];
  const [definitions, existing] = await Promise.all([
    loadResourceDefinitions({ featureIds, optionIds, rulesVersion }),
    fetchResources(character.id)
  ]);
  const plan = planCatalogResources({ character, owned, definitions: { ...definitions, options }, existing, rulesVersion });
  if (plan.operations.length) await executeResourcePlan(character, plan.operations, existing);
  return { ...plan.summary, operations: plan.operations.length };
}
