import { supabase } from '../../lib/supabase.js';

const SHARED_SPELLS_TABLE = 'shared_spells';
const CHARACTER_SPELLS_TABLE = 'character_spells';

export async function searchSharedSpells({
  query = '',
  rulesVersion = null,
  level = null,
  school = '',
  casterClass = ''
} = {}) {
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
  if (level !== null && level !== '') {
    request = request.eq('level', Number(level));
  }
  if (school?.trim()) {
    request = request.ilike('school', `%${school.trim()}%`);
  }
  if (casterClass?.trim()) {
    request = request.contains('caster_classes', [casterClass.trim().toLowerCase()]);
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
