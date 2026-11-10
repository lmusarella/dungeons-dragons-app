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

export async function searchCatalog(catalog, { query = '', rulesVersion = '', page = 1, pageSize = 18 } = {}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = Math.min(PAGE_SIZE_LIMIT, Math.max(1, Number(pageSize) || 18));
  const from = (safePage - 1) * safePageSize;
  let request = supabase
    .from(catalog.table)
    .select('*', { count: 'exact' })
    .order('name', { ascending: true })
    .range(from, from + safePageSize - 1);
  if (query.trim()) request = request.ilike('name', `%${query.trim()}%`);
  if (rulesVersion) request = request.eq('rules_version', rulesVersion);
  const { data, error, count } = await request;
  if (error) throw error;
  return { items: data || [], total: count ?? data?.length ?? 0, page: safePage, pageSize: safePageSize };
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
    const rows = unwrap(await supabase.from(table).select('id,name,rules_version').in('id', ids)) || [];
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
