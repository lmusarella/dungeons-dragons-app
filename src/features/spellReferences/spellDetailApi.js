import { supabase } from '../../lib/supabase.js';

/** Dettaglio completo degli incantesimi tramite UUID di shared_spells. */
export async function fetchSharedSpellsByIds(ids = []) {
  const unique = [...new Set(ids.filter(Boolean).map(String))];
  if (!unique.length) return [];
  const { data, error } = await supabase.from('shared_spells').select('*').in('id', unique);
  if (error) throw error;
  return data || [];
}
