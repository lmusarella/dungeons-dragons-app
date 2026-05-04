import { supabase } from '../../lib/supabase.js';

const SHARED_SPELLS_TABLE = 'shared_spells';
const CHARACTER_SPELLS_TABLE = 'character_spells';

export async function searchSharedSpells({
  query = '',
  rulesVersion = null,
  level = null,
  school = '',
  casterClasses = [],
  page = 1,
  pageSize = 20
} = {}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = Math.min(50, Math.max(1, Number(pageSize) || 20));
  const from = (safePage - 1) * safePageSize;
  const to = from + safePageSize - 1;
  let request = supabase
    .from(SHARED_SPELLS_TABLE)
    .select('*', { count: 'exact' })
    .order('name', { ascending: true })
    .range(from, to);

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
  const normalizedClasses = Array.isArray(casterClasses)
    ? casterClasses.map((entry) => String(entry).trim().toLowerCase()).filter(Boolean)
    : [];
  if (normalizedClasses.length) {
    request = request.overlaps('caster_classes', normalizedClasses);
  }

  const { data, error, count } = await request;
  if (error) throw error;
  return {
    items: data ?? [],
    total: count ?? 0,
    page: safePage,
    pageSize: safePageSize
  };
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
