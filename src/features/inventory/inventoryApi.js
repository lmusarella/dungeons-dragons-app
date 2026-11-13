import { supabase } from '../../lib/supabase.js';

export async function fetchItems(characterId) {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('character_id', characterId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createItem(payload) {
  const { data, error } = await supabase
    .from('items')
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

/**
 * Inserimento multiplo. PostgREST usa l'unione delle colonne di tutte le righe e imposta NULL dove una riga non
 * ha la chiave (ignorando i default del database): per questo le righe con insiemi di colonne diversi
 * vengono inserite in richieste separate, mantenendo l'ordine originale nel risultato.
 */
export async function createItems(payloads = []) {
  if (!Array.isArray(payloads) || !payloads.length) return [];
  const groups = new Map();
  payloads.forEach((payload, index) => {
    const signature = Object.keys(payload).sort().join('|');
    if (!groups.has(signature)) groups.set(signature, []);
    groups.get(signature).push({ payload, index });
  });
  const results = [];
  for (const entries of groups.values()) {
    const { data, error } = await supabase
      .from('items')
      .insert(entries.map((entry) => entry.payload))
      .select('*');
    if (error) throw error;
    (data ?? []).forEach((row, position) => results.push({ row, index: entries[position]?.index ?? Number.MAX_SAFE_INTEGER }));
  }
  return results.sort((a, b) => a.index - b.index).map((entry) => entry.row);
}

export async function updateItem(id, payload) {
  const { data, error } = await supabase
    .from('items')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function deleteItem(id) {
  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
