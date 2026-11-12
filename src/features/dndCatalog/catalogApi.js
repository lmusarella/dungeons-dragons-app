import { supabase } from '../../lib/supabase.js';

const PAGE_SIZE_LIMIT = 100;

function unwrap(result) {
  if (result.error) throw result.error;
  return result.data;
}

export function normalizeCatalogError(error) {
  if (error?.code === '23505') return 'Esiste già un elemento con lo stesso nome, slug e versione.';
  if (error?.code === '23503') return 'Operazione non consentita: il record è collegato ad altri contenuti.';
  if (error?.code === '42501') return 'Non hai i permessi necessari per modificare il catalogo.';
  return error?.message || 'Operazione sul catalogo non riuscita.';
}

const MISSING_COLUMN = ['42703', 'PGRST204'];
const CATEGORY_COLUMNS = ['feature_category', 'category'];
let featureCategoryColumn = 'category';

async function selectColumnValues(table, column, ids, values) {
  const result = await supabase.from(table).select('*').in(column, ids);
  if (result.error) {
    if (MISSING_COLUMN.includes(result.error.code) || /column .* does not exist|could not find/i.test(result.error.message || '')) return;
    throw result.error;
  }
  values.push(...(result.data || []));
}

/** Id dei privilegi collegati a classi/sottoclassi, via concessioni dirette e opzioni di scelta. */
export async function getFeatureIdsForOrigin({ classIds = [], subclassIds = [] }) {
  const sources = [
    ['source_class_id', classIds], ['shared_class_id', classIds],
    ['source_subclass_id', subclassIds], ['shared_subclass_id', subclassIds]
  ].filter(([, ids]) => ids.length);
  const grants = [];
  const groups = [];
  await Promise.all(sources.map(async ([column, ids]) => {
    await selectColumnValues('shared_grants', column, ids, grants);
    await selectColumnValues('shared_choice_groups', column, ids, groups);
  }));
  const featureIds = new Set(grants.map((row) => row.target_feature_id || row.granted_feature_id).filter(Boolean).map(String));
  const groupIds = [...new Set(groups.map((row) => row.id))];
  if (groupIds.length) {
    const options = [];
    await selectColumnValues('shared_choice_options', 'choice_group_id', groupIds, options);
    options.forEach((row) => { if (row.shared_feature_id) featureIds.add(String(row.shared_feature_id)); });
  }
  return [...featureIds];
}

async function searchFeaturesByOrigin(catalog, filters) {
  const { query, rulesVersion, featureCategory, activationType, classId, subclassId, classSubclassIds, page, pageSize } = filters;
  const ids = await getFeatureIdsForOrigin(subclassId ? { subclassIds: [subclassId] } : { classIds: [classId], subclassIds: classSubclassIds.filter(Boolean) });
  const chunks = [];
  for (let index = 0; index < ids.length; index += 80) chunks.push(ids.slice(index, index + 80));
  const rows = (await Promise.all(chunks.map(async (chunk) => {
    let request = supabase.from(catalog.table).select('*').in('id', chunk);
    if (query.trim()) {
      const safeQuery = query.trim().replace(/[,%()]/g, ' ');
      request = request.or('name.ilike.%' + safeQuery + '%,name_it.ilike.%' + safeQuery + '%');
    }
    if (rulesVersion) request = request.eq('rules_version', rulesVersion);
    if (featureCategory) request = request.eq(featureCategoryColumn, featureCategory);
    if (activationType) request = request.eq('activation_type', activationType);
    return unwrap(await request) || [];
  }))).flat();
  rows.sort((a, b) => String(a.name_it || a.name || '').localeCompare(String(b.name_it || b.name || ''), 'it'));
  const from = (page - 1) * pageSize;
  return { items: rows.slice(from, from + pageSize), total: rows.length, page, pageSize };
}

export async function searchCatalog(catalog, {
  query = '', rulesVersion = '', creatureType = '', challengeRating = '', page = 1, pageSize = 18,
  featureCategory = '', activationType = '', classId = '', subclassId = '', classSubclassIds = []
} = {}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = Math.min(PAGE_SIZE_LIMIT, Math.max(1, Number(pageSize) || 18));
  if (catalog.key === 'features' && (classId || subclassId)) {
    return searchFeaturesByOrigin(catalog, { query, rulesVersion, featureCategory, activationType, classId, subclassId, classSubclassIds, page: safePage, pageSize: safePageSize });
  }
  const from = (safePage - 1) * safePageSize;
  let request = supabase
    .from(catalog.table)
    .select('*', { count: 'exact' })
    .order('name_it', { ascending: true, nullsFirst: false })
    .order('name', { ascending: true })
    .range(from, from + safePageSize - 1);
  if (query.trim()) {
    const safeQuery = query.trim().replace(/[,%()]/g, ' ');
    request = request.or('name.ilike.%' + safeQuery + '%,name_it.ilike.%' + safeQuery + '%');
  }
  if (rulesVersion) request = request.eq('rules_version', rulesVersion);
  if (catalog.key === 'creatures' && creatureType.trim()) request = request.ilike('creature_type', creatureType.trim());
  if (catalog.key === 'creatures' && challengeRating.trim()) request = request.eq('challenge_rating', challengeRating.trim());
  if (catalog.key === 'features' && featureCategory) request = request.eq(featureCategoryColumn, featureCategory);
  if (catalog.key === 'features' && activationType) request = request.eq('activation_type', activationType);
  const { data, error, count } = await request;
  if (error) throw error;
  return { items: data || [], total: count ?? data?.length ?? 0, page: safePage, pageSize: safePageSize };
}

async function distinctColumnValues(column) {
  const values = new Set();
  for (let page = 0; page < 10; page += 1) {
    const result = await supabase.from('shared_features').select(column).range(page * 1000, page * 1000 + 999);
    if (result.error) throw result.error;
    (result.data || []).forEach((row) => { if (row[column]) values.add(String(row[column])); });
    if ((result.data || []).length < 1000) break;
  }
  return [...values].sort();
}

let featureFacetsPromise = null;
/** Valori distinti di categoria e attivazione dei privilegi, per i filtri del compendio. */
export function getFeatureFacets() {
  if (!featureFacetsPromise) {
    featureFacetsPromise = (async () => {
      let categories = [];
      for (const column of CATEGORY_COLUMNS) {
        try {
          const values = await distinctColumnValues(column);
          featureCategoryColumn = column;
          if (values.length) { categories = values; break; }
        } catch { /* colonna assente: prova la successiva */ }
      }
      let activations = [];
      try { activations = await distinctColumnValues('activation_type'); } catch { /* assente */ }
      return { categories, activations };
    })().catch((error) => { featureFacetsPromise = null; throw error; });
  }
  return featureFacetsPromise;
}

let originOptionsPromise = null;
/** Classi e sottoclassi per i filtri dei privilegi. */
export function getFeatureOriginOptions() {
  if (!originOptionsPromise) {
    originOptionsPromise = Promise.all([
      supabase.from('shared_classes').select('id,name,name_it,rules_version').order('name', { ascending: true }),
      supabase.from('shared_subclasses').select('id,name,name_it,rules_version,shared_class_id').order('name', { ascending: true })
    ]).then(([classes, subclasses]) => ({ classes: unwrap(classes) || [], subclasses: unwrap(subclasses) || [] }))
      .catch((error) => { originOptionsPromise = null; throw error; });
  }
  return originOptionsPromise;
}

export async function getCatalogRecord(catalog, id) {
  return unwrap(await supabase.from(catalog.table).select('*').eq('id', id).single());
}

export async function getClassFeatureGrants(classId) {
  const grants = unwrap(await supabase
    .from('shared_grants')
    .select('id,target_feature_id,unlock_level,level_scope,quantity,notes')
    .eq('source_class_id', classId)
    .not('target_feature_id', 'is', null)
    .order('unlock_level', { ascending: true })) || [];
  const featureIds = [...new Set(grants.map((grant) => grant.target_feature_id).filter(Boolean))];
  if (!featureIds.length) return [];
  const features = unwrap(await supabase.from('shared_features').select('*').in('id', featureIds)) || [];
  const byId = new Map(features.map((feature) => [feature.id, feature]));
  return grants.map((grant) => ({ ...grant, feature: byId.get(grant.target_feature_id) || null }));
}

const ORIGIN_TABLES = [
  ['source_class_id', 'shared_classes', 'Classe'],
  ['source_subclass_id', 'shared_subclasses', 'Sottoclasse'],
  ['source_species_id', 'shared_species', 'Specie'],
  ['source_species_variant_id', 'shared_species_variants', 'Variante di specie'],
  ['source_background_id', 'shared_backgrounds', 'Background'],
  ['source_feat_id', 'shared_feats', 'Talento'],
  ['source_fighting_style_id', 'shared_fighting_styles', 'Stile di combattimento'],
  ['source_feature_id', 'shared_features', 'Privilegio']
];

export async function getFeatureOrigins(featureId) {
  const sourceColumns = ORIGIN_TABLES.map(([column]) => column).join(',');
  const grants = unwrap(await supabase
    .from('shared_grants')
    .select(`id,unlock_level,level_scope,notes,${sourceColumns}`)
    .eq('target_feature_id', featureId)
    .order('unlock_level', { ascending: true })) || [];
  const lookupRequests = ORIGIN_TABLES.map(async ([column, table, type]) => {
    const ids = [...new Set(grants.map((grant) => grant[column]).filter(Boolean))];
    if (!ids.length) return [];
    const rows = unwrap(await supabase.from(table).select('id,name,name_it,rules_version').in('id', ids)) || [];
    return rows.map((row) => ({ ...row, type, column }));
  });
  const origins = (await Promise.all(lookupRequests)).flat();
  const byKey = new Map(origins.map((origin) => [`${origin.column}:${origin.id}`, origin]));
  return grants.map((grant) => {
    const originEntry = ORIGIN_TABLES.find(([column]) => grant[column]);
    const origin = originEntry ? byKey.get(`${originEntry[0]}:${grant[originEntry[0]]}`) : null;
    return { ...grant, origin };
  });
}

async function withCurrentUser(payload) {
  const { data } = await supabase.auth.getUser();
  return { ...payload, created_by: data?.user?.id || null };
}

export async function createCatalogRecord(catalog, payload) {
  const row = await withCurrentUser(payload);
  return unwrap(await supabase.from(catalog.table).insert(row).select('*').single());
}

export async function updateCatalogRecord(catalog, id, payload) {
  const row = { ...payload, updated_at: new Date().toISOString() };
  delete row.created_by;
  return unwrap(await supabase.from(catalog.table).update(row).eq('id', id).select('*').single());
}

export async function deleteCatalogRecord(catalog, id) {
  unwrap(await supabase.from(catalog.table).delete().eq('id', id));
}
