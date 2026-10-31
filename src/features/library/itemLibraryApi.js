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

export async function searchSharedItems({ query = '', category = '', rulesVersion = '', page = 1, pageSize = 50 } = {}) {
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
  if (category) request = request.eq('category', category);
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
