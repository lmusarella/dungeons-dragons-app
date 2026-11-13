import { supabase } from '../../lib/supabase.js';

const VIEW = 'shared_item_bundle_catalog';
const cache = new Map();
const pick = (row, ...keys) => keys.map((key) => row?.[key]).find((value) => value !== undefined && value !== null && value !== '');

/** Una riga della vista: un oggetto contenuto in una dotazione, collegato (o no) a shared_items tramite UUID. */
export function normalizeBundleRow(row) {
  const itemId = pick(row, 'shared_item_id', 'content_item_id', 'item_id');
  const matchStatus = String(pick(row, 'match_status') || '').toLowerCase();
  return {
    bundleId: String(pick(row, 'bundle_id', 'bundle_item_id')),
    index: Number(pick(row, 'entry_index', 'content_index', 'position', 'sort_order')) || 0,
    quantity: Math.max(1, Number(pick(row, 'quantity', 'qty')) || 1),
    itemId: itemId ? String(itemId) : null,
    name: String(pick(row, 'item_name_it', 'content_name_it', 'name_it', 'item_name') || ''),
    category: pick(row, 'item_category') || null,
    matchStatus,
    sourceRef: String(pick(row, 'source_ref', 'content_source_id', 'source_id', 'original_name') || ''),
    linked: Boolean(itemId) && matchStatus !== 'missing'
  };
}

/**
 * Contenuti delle dotazioni, per `bundle_id`. Restituisce una Map bundleId -> voci ordinate
 * (comprese quelle non collegate, che non vanno perse). Nessun filtro su rules_version.
 * @returns {Promise<Map<string, ReturnType<typeof normalizeBundleRow>[]>>}
 */
export async function fetchBundleContents(bundleIds = []) {
  const ids = [...new Set(bundleIds.filter(Boolean).map(String))];
  const pending = ids.filter((id) => !cache.has(id));
  for (let index = 0; index < pending.length; index += 80) {
    const chunk = pending.slice(index, index + 80);
    const { data, error } = await supabase.from(VIEW).select('*').in('bundle_id', chunk);
    if (error) throw error;
    const grouped = new Map(chunk.map((id) => [id, []]));
    (data || []).map(normalizeBundleRow).forEach((entry) => grouped.get(entry.bundleId)?.push(entry));
    grouped.forEach((entries, id) => cache.set(id, entries.sort((a, b) => a.index - b.index)));
  }
  return new Map(ids.map((id) => [id, cache.get(id) || []]));
}

export const clearBundleCache = () => cache.clear();
