import { supabase } from '../../lib/supabase.js';

const SHARED_ITEMS_TABLE = 'shared_items';

function normalizeSharedItem(row = {}) {
  const details = row.item_data && typeof row.item_data === 'object' ? row.item_data : {};
  return {
    ...details,
    ...row,
    name: row.name || details.name || 'Oggetto senza nome',
    category: row.category || details.category || 'gear',
    rules_version: row.rules_version || details.rules_version || '2024',
    image_url: row.image_url || details.image_url || null,
    notes: row.description ?? details.notes ?? '',
    description: row.description ?? details.description ?? details.notes ?? ''
  };
}

function buildSharedItemPayload(payload = {}) {
  return {
    created_by: payload.created_by || null,
    name: String(payload.name || '').trim(),
    category: payload.category || 'gear',
    rules_version: payload.rules_version || '2024',
    image_url: payload.image_url || null,
    description: payload.notes || payload.description || null,
    item_data: {
      ...payload,
      user_id: undefined,
      character_id: undefined,
      container_item_id: null,
      equip_slot: null,
      equip_slots: []
    },
    updated_at: new Date().toISOString()
  };
}

export async function searchSharedItems({ query = '', category = '', categories = [], rulesVersion = '', page = 1, pageSize = 50 } = {}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = Math.min(100, Math.max(1, Number(pageSize) || 50));
  const from = (safePage - 1) * safePageSize;
  const to = from + safePageSize - 1;
  let request = supabase
    .from(SHARED_ITEMS_TABLE)
    .select('*', { count: 'exact' })
    .order('name', { ascending: true })
    .range(from, to);

  if (query.trim()) request = request.ilike('name', `%${query.trim()}%`);
  const normalizedCategories = Array.isArray(categories)
    ? [...new Set(categories.map((entry) => String(entry).trim()).filter(Boolean))]
    : [];
  if (normalizedCategories.length) request = request.in('category', normalizedCategories);
  else if (category) request = request.eq('category', category);
  if (rulesVersion) request = request.eq('rules_version', rulesVersion);

  const { data, error, count } = await request;
  if (error) throw error;
  return {
    items: (data || []).map(normalizeSharedItem),
    total: count ?? data?.length ?? 0,
    page: safePage,
    pageSize: safePageSize
  };
}

export async function createSharedItem(payload) {
  const { data, error } = await supabase
    .from(SHARED_ITEMS_TABLE)
    .insert(buildSharedItemPayload(payload))
    .select('*')
    .single();
  if (error) throw error;
  return normalizeSharedItem(data);
}

export async function createSharedItems(payloads = []) {
  if (!Array.isArray(payloads) || !payloads.length) return [];
  const { data, error } = await supabase
    .from(SHARED_ITEMS_TABLE)
    .insert(payloads.map(buildSharedItemPayload))
    .select('*');
  if (error) throw error;
  return (data || []).map(normalizeSharedItem);
}

export async function updateSharedItem(id, payload) {
  const nextPayload = buildSharedItemPayload(payload);
  delete nextPayload.created_by;
  const { data, error } = await supabase
    .from(SHARED_ITEMS_TABLE)
    .update(nextPayload)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return normalizeSharedItem(data);
}

export async function deleteSharedItem(id) {
  const { error } = await supabase.from(SHARED_ITEMS_TABLE).delete().eq('id', id);
  if (error) throw error;
}

/** Dettaglio completo degli oggetti tramite UUID: gli oggetti sono trasversali alle edizioni, nessun filtro sulla versione. */
export async function getSharedItemsByIds(ids = []) {
  const unique = [...new Set(ids.filter(Boolean).map(String))];
  if (!unique.length) return [];
  const rows = [];
  for (let index = 0; index < unique.length; index += 80) {
    const { data, error } = await supabase.from(SHARED_ITEMS_TABLE).select('*').in('id', unique.slice(index, index + 80));
    if (error) throw error;
    rows.push(...(data || []));
  }
  return rows.map(normalizeSharedItem);
}

/** Tutti gli oggetti di una o più categorie (paginati a blocchi da 100), senza filtro di versione. */
export async function listSharedItemsByCategories(categories = []) {
  const items = [];
  for (let page = 1; page <= 20; page += 1) {
    const result = await searchSharedItems({ categories, page, pageSize: 100 });
    items.push(...result.items);
    if (items.length >= result.total || !result.items.length) break;
  }
  return items;
}
