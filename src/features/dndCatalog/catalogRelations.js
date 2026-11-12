import { supabase } from '../../lib/supabase.js';
import { catalogName } from './catalogLocale.js';
import { getCopyReference, sourceCode } from '../character/speciesAsiResolver.js';

const cache = new Map();

const SOURCE_FIELDS = {
  classId: ['shared_class_id', 'source_class_id'],
  subclassId: ['shared_subclass_id', 'source_subclass_id'],
  speciesId: ['shared_species_id', 'source_species_id'],
  speciesVariantId: ['shared_species_variant_id', 'source_species_variant_id'],
  backgroundId: ['shared_background_id', 'source_background_id'],
  featIds: ['shared_feat_id', 'source_feat_id'],
  fightingStyleIds: ['shared_fighting_style_id', 'source_fighting_style_id'],
  featureIds: ['parent_feature_id', 'source_feature_id']
};

const TARGETS = [
  [['granted_feature_id', 'target_feature_id'], 'shared_features', 'feature'],
  [['granted_feat_id', 'target_feat_id'], 'shared_feats', 'feat'],
  [['granted_fighting_style_id', 'target_fighting_style_id'], 'shared_fighting_styles', 'fighting_style'],
  [['granted_spell_id', 'target_spell_id'], 'shared_spells', 'spell'],
  [['granted_item_id', 'target_item_id'], 'shared_items', 'item']
];

const OPTION_TARGETS = [
  [['shared_feature_id'], 'shared_features'],
  [['shared_fighting_style_id'], 'shared_fighting_styles'],
  [['shared_feat_id'], 'shared_feats'],
  [['shared_spell_id'], 'shared_spells'],
  [['shared_subclass_id'], 'shared_subclasses'],
  [['shared_species_variant_id'], 'shared_species_variants'],
  [['shared_item_id'], 'shared_items'],
  [['shared_creature_id'], 'shared_creatures']
];

const ORIGINS = [
  [['shared_class_id', 'source_class_id'], 'shared_classes', 'Classe'],
  [['shared_subclass_id', 'source_subclass_id'], 'shared_subclasses', 'Sottoclasse'],
  [['shared_species_id', 'source_species_id'], 'shared_species', 'Specie'],
  [['shared_species_variant_id', 'source_species_variant_id'], 'shared_species_variants', 'Variante di specie'],
  [['shared_background_id', 'source_background_id'], 'shared_backgrounds', 'Background'],
  [['shared_feat_id', 'source_feat_id'], 'shared_feats', 'Talento'],
  [['shared_fighting_style_id', 'source_fighting_style_id'], 'shared_fighting_styles', 'Stile di combattimento'],
  [['parent_feature_id', 'source_feature_id'], 'shared_features', 'Privilegio']
];

function unwrap(result) {
  if (result.error) throw result.error;
  return result.data || [];
}

function cached(key, loader) {
  if (!cache.has(key)) cache.set(key, Promise.resolve().then(loader).catch((error) => {
    cache.delete(key);
    throw error;
  }));
  return cache.get(key);
}

function contextSources(context = {}) {
  return Object.entries(SOURCE_FIELDS).flatMap(([key, columns]) => {
    const value = context[key];
    const ids = Array.isArray(value) ? value : [value];
    return ids.filter(Boolean).map((id) => ({ columns, id }));
  });
}

function isMissingColumn(error) {
  return ['42703', 'PGRST204'].includes(error?.code)
    || /column .* does not exist|could not find the .* column/i.test(error?.message || '');
}

const missingColumns = new Set();

async function queryCompatibleColumns(table, columns, id) {
  const rows = [];
  for (const column of columns) {
    if (missingColumns.has(`${table}.${column}`)) continue;
    const result = await supabase.from(table).select('*').eq(column, id);
    if (result.error) {
      if (isMissingColumn(result.error)) { missingColumns.add(`${table}.${column}`); continue; }
      throw result.error;
    }
    rows.push(...(result.data || []));
  }
  return rows;
}

async function queryCompatibleColumnValues(table, columns, ids) {
  const rows = [];
  for (const column of columns) {
    if (missingColumns.has(`${table}.${column}`)) continue;
    const result = await supabase.from(table).select('*').in(column, ids);
    if (result.error) {
      if (isMissingColumn(result.error)) { missingColumns.add(`${table}.${column}`); continue; }
      throw result.error;
    }
    rows.push(...(result.data || []));
  }
  return rows;
}

function firstValue(row, columns) {
  const column = columns.find((candidate) => row[candidate]);
  return column ? { column, value: row[column] } : null;
}

function levelFor(scope, context) {
  return Number(scope === 'class' ? context.classLevel ?? context.level : context.level) || 1;
}

function isUnlocked(entry, context) {
  const required = Number(entry.unlock_level ?? entry.minimum_level ?? 1) || 1;
  return required <= levelFor(entry.level_scope, context);
}

async function fetchBySources(table, context) {
  const sources = contextSources(context);
  if (!sources.length) return [];
  const rows = await Promise.all(sources.map(({ columns, id }) => queryCompatibleColumns(table, columns, id)));
  return [...new Map(rows.flat().map((row) => [row.id, row])).values()];
}

async function resolveTargets(rows, targets, rulesVersion) {
  const lookups = await Promise.all(targets.map(async ([columns, table]) => {
    const ids = [...new Set(rows.map((row) => firstValue(row, columns)?.value).filter(Boolean))];
    if (!ids.length) return [];
    return unwrap(await supabase.from(table).select('*').in('id', ids));
  }));
  const byId = new Map(lookups.flat().map((row) => [row.id, row]));
  return rows.map((row) => {
    const descriptor = targets.find(([columns]) => firstValue(row, columns));
    const target = descriptor ? firstValue(row, descriptor[0]) : null;
    const entity = target ? byId.get(target.value) || null : null;
    if (entity?.rules_version && rulesVersion && entity.rules_version !== rulesVersion) return null;
    return { ...row, target_type: descriptor?.[2] || row.option_type || 'other', entity };
  }).filter(Boolean);
}

export function clearCatalogRelationsCache() {
  cache.clear();
}

export async function getCharacterCatalogOptions(rulesVersion) {
  const version = String(rulesVersion || '2014');
  const tables = ['shared_classes', 'shared_species', 'shared_backgrounds'];
  const results = await Promise.allSettled(tables.map(async (table) => unwrap(
    await supabase.from(table).select('id,name,name_it,rules_version').eq('rules_version', version).order('name_it', { ascending: true, nullsFirst: false }).order('name', { ascending: true })
  )));
  const [classes, species, backgrounds] = results.map((result) => result.status === 'fulfilled' ? result.value : []);
  const errors = results.flatMap((result, index) => result.status === 'rejected' ? [{ table: tables[index], error: result.reason }] : []);
  return {
    classes: classes.sort((a, b) => catalogName(a).localeCompare(catalogName(b), 'it')),
    species: species.sort((a, b) => catalogName(a).localeCompare(catalogName(b), 'it')),
    backgrounds: backgrounds.sort((a, b) => catalogName(a).localeCompare(catalogName(b), 'it')),
    errors
  };
}

export async function getClassDetails(classId, rulesVersion) {
  if (!classId) return null;
  return cached(`class:${classId}:${rulesVersion}`, async () => {
    const classRecord = unwrap(await supabase.from('shared_classes').select('*').eq('id', classId).eq('rules_version', rulesVersion).limit(1))[0] || null;
    if (!classRecord) return null;
    const subclasses = unwrap(await supabase.from('shared_subclasses').select('*').eq('shared_class_id', classId).eq('rules_version', rulesVersion).order('name_it', { ascending: true, nullsFirst: false }).order('name', { ascending: true }));
    return { ...classRecord, subclasses, subclass_selection_level: Number(classRecord.subclass_selection_level ?? classRecord.data?.subclass_selection_level ?? 1) || 1 };
  });
}

export async function getSubclassFeatures(subclassId, level, rulesVersion) {
  return getAutomaticGrants({ subclassId, level, classLevel: level, rulesVersion });
}

export async function getSubclassProgressions(subclassIds, rulesVersion) {
  const ids = [...new Set((subclassIds || []).filter(Boolean))];
  if (!ids.length) return [];
  const sourceColumns = SOURCE_FIELDS.subclassId;
  const rows = await queryCompatibleColumnValues('shared_grants', sourceColumns, ids);
  const resolved = await resolveTargets(rows, TARGETS, rulesVersion);
  return ids.map((subclassId) => ({
    subclassId,
    grants: resolved
      .filter((grant) => String(firstValue(grant, sourceColumns)?.value) === String(subclassId))
      .sort((a, b) => (Number(a.unlock_level) || 0) - (Number(b.unlock_level) || 0))
  }));
}

export async function getResolvedFeatureOrigins(featureId, rulesVersion) {
  if (!featureId) return [];
  const grants = await queryCompatibleColumns('shared_grants', ['granted_feature_id', 'target_feature_id'], featureId);
  const lookupRows = await Promise.all(ORIGINS.map(async ([columns, table]) => {
    const ids = [...new Set(grants.map((grant) => firstValue(grant, columns)?.value).filter(Boolean))];
    if (!ids.length) return [];
    return unwrap(await supabase.from(table).select('id,name,name_it,rules_version').in('id', ids));
  }));
  const byId = new Map(lookupRows.flat().map((row) => [row.id, row]));
  return grants.map((grant) => {
    const descriptor = ORIGINS.find(([columns]) => firstValue(grant, columns));
    const source = descriptor ? firstValue(grant, descriptor[0]) : null;
    const entity = source ? byId.get(source.value) || null : null;
    if (entity?.rules_version && rulesVersion && entity.rules_version !== rulesVersion) return null;
    return { ...grant, origin: entity ? { ...entity, type: descriptor[2] } : null };
  }).filter(Boolean);
}

export async function getSpeciesDetails(speciesId, variantId, rulesVersion) {
  if (!speciesId) return null;
  return cached(`species:${speciesId}:${variantId || ''}:${rulesVersion}`, async () => {
    const species = unwrap(await supabase.from('shared_species').select('*').eq('id', speciesId).eq('rules_version', rulesVersion).limit(1))[0] || null;
    if (!species) return null;
    const variants = unwrap(await supabase.from('shared_species_variants').select('*').eq('shared_species_id', speciesId).eq('rules_version', rulesVersion).order('name_it', { ascending: true, nullsFirst: false }).order('name', { ascending: true }));
    const variant = variants.find((entry) => String(entry.id) === String(variantId)) || null;
    return { ...species, variants, variant };
  });
}

export async function getCatalogParent(catalogKey, item) {
  const relation = {
    subclasses: ['shared_class_id', 'shared_classes', 'Classe'],
    'species-variants': ['shared_species_id', 'shared_species', 'Specie'],
    'fighting-styles': ['shared_feat_id', 'shared_feats', 'Talento associato']
  }[catalogKey];
  if (!relation || !item?.[relation[0]]) return null;
  const [column, table, type] = relation;
  return cached(`parent:${table}:${item[column]}`, async () => {
    const row = unwrap(await supabase.from(table).select('*').eq('id', item[column]).limit(1))[0] || null;
    return row ? { ...row, relation_type: type } : null;
  });
}

export async function getAutomaticGrants(context = {}) {
  const rows = (await fetchBySources('shared_grants', context)).filter((grant) => isUnlocked(grant, context));
  const resolved = await resolveTargets(rows, TARGETS, context.rulesVersion);
  return [...new Map(resolved.map((grant) => [`${grant.target_type}:${grant.entity?.id || grant.id}`, grant])).values()]
    .sort((a, b) => (Number(a.unlock_level) || 0) - (Number(b.unlock_level) || 0));
}

export async function getAvailableChoiceOptions(groupId, context = {}) {
  if (!groupId) return [];
  const rows = unwrap(await supabase.from('shared_choice_options').select('*').eq('choice_group_id', groupId).order('sort_order', { ascending: true }));
  const normalized = rows.map((option) => ({ ...option, minimum_level: option.required_level ?? option.minimum_level }));
  return resolveTargets(normalized.filter((option) => isUnlocked(option, context)), OPTION_TARGETS, context.rulesVersion);
}

export async function getAvailableChoiceGroups(context = {}) {
  const groups = (await fetchBySources('shared_choice_groups', context))
    .filter((group) => !context.rulesVersion || group.rules_version === context.rulesVersion)
    .map((group) => ({
      ...group,
      required: group.is_required ?? group.required ?? true,
      allow_duplicates: group.allow_duplicate_choices ?? group.allow_duplicates ?? false
    }));
  if (!groups.length) return [];
  const ids = groups.map((group) => group.id);
  const progression = unwrap(await supabase.from('shared_choice_progression').select('*').in('choice_group_id', ids))
    .map((row) => ({
      ...row,
      level: row.unlock_level ?? row.required_level ?? row.level,
      new_choices: row.choices_granted ?? row.new_choices
    }))
    .sort((a, b) => (Number(a.level) || 0) - (Number(b.level) || 0));
  const progressionByGroup = new Map();
  progression.forEach((row) => {
    if (!progressionByGroup.has(row.choice_group_id)) progressionByGroup.set(row.choice_group_id, []);
    progressionByGroup.get(row.choice_group_id).push(row);
  });
  return Promise.all(groups.map(async (group) => {
    const rows = progressionByGroup.get(group.id) || [];
    const choicesGranted = rows
      .filter((row) => Number(row.level) <= levelFor(group.level_scope, context))
      .reduce((total, row) => total + Number(row.choices_granted ?? row.new_choices ?? 0), 0);
    const options = await getAvailableChoiceOptions(group.id, context);
    return { ...group, progression: rows, choices_granted: choicesGranted, options };
  })).then((resolved) => resolved.filter((group) => group.choices_granted > 0 || !group.progression.length));
}

export async function getCharacterProgression(context = {}) {
  const [grantResult, choiceResult] = await Promise.allSettled([
    getAutomaticGrants(context),
    getAvailableChoiceGroups(context)
  ]);
  if (import.meta.env?.DEV && grantResult.status === 'rejected') console.warn('Grant del catalogo non disponibili', grantResult.reason);
  if (import.meta.env?.DEV && choiceResult.status === 'rejected') console.warn('Scelte del catalogo non disponibili', choiceResult.reason);
  return {
    automaticGrants: grantResult.status === 'fulfilled' ? grantResult.value : [],
    choiceGroups: choiceResult.status === 'fulfilled' ? choiceResult.value : [],
    errors: [grantResult, choiceResult].filter((result) => result.status === 'rejected').map((result) => result.reason)
  };
}

export async function getSpeciesAsiSources(speciesId, variantId, rulesVersion) {
  const details = await getSpeciesDetails(speciesId, variantId, rulesVersion);
  if (!details) return null;
  const copyChain = [];
  const visited = new Set([String(details.id)]);
  let reference = getCopyReference(details);
  while (reference && copyChain.length < 5) {
    const candidates = unwrap(await supabase.from('shared_species').select('*').eq('rules_version', rulesVersion).eq('name', reference.name));
    const normalized = String(reference.source || '').toUpperCase();
    const original = candidates.find((row) => !normalized || sourceCode(row) === normalized.replace(/[\s_-]+/g, '')) || null;
    if (!original || visited.has(String(original.id))) break;
    visited.add(String(original.id));
    copyChain.push(original);
    reference = getCopyReference(original);
  }
  return { species: details, variants: details.variants || [], variant: details.variant, copyChain };
}
