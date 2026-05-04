import { supabase } from '../../lib/supabase.js';

const SHARED_SPELLS_TABLE = 'shared_spells';
const CHARACTER_SPELLS_TABLE = 'character_spells';

export async function searchSharedSpells({ query = '', rulesVersion = null } = {}) {
  let request = supabase
    .from(SHARED_SPELLS_TABLE)
    .select('*')
    .order('name', { ascending: true })
    .limit(100);

  if (rulesVersion) {
    request = request.eq('rules_version', rulesVersion);
  }

  if (query?.trim()) {
    request = request.ilike('name', `%${query.trim()}%`);
  }

  const { data, error } = await request;
  if (error) throw error;
  return data ?? [];
}

export async function createSharedSpell(payload) {
  const { data, error } = await supabase
    .from(SHARED_SPELLS_TABLE)
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function fetchCharacterSpells(characterId) {
  const { data, error } = await supabase
    .from(CHARACTER_SPELLS_TABLE)
    .select('*, shared_spell:shared_spells(*)')
    .eq('character_id', characterId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function assignSharedSpellToCharacter(payload) {
  const { data, error } = await supabase
    .from(CHARACTER_SPELLS_TABLE)
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function removeCharacterSpell(id) {
  const { error } = await supabase
    .from(CHARACTER_SPELLS_TABLE)
    .delete()
    .eq('id', id);
  if (error) throw error;
}
