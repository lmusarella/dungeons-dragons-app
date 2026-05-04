import { supabase } from '../../lib/supabase.js';

const COMPANIONS_TABLE = 'character_companions';

export async function fetchCompanions(characterId) {
  const { data, error } = await supabase
    .from(COMPANIONS_TABLE)
    .select('*')
    .eq('character_id', characterId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createCompanion(payload) {
  const { data, error } = await supabase
    .from(COMPANIONS_TABLE)
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function updateCompanion(id, payload) {
  const { data, error } = await supabase
    .from(COMPANIONS_TABLE)
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCompanion(id) {
  const { error } = await supabase
    .from(COMPANIONS_TABLE)
    .delete()
    .eq('id', id);
  if (error) throw error;
}
