export const SPELLCASTER_CLASS_OPTIONS = [
  'mago',
  'stregone',
  'warlock',
  'chierico',
  'druido',
  'bardo',
  'paladino',
  'ranger',
  'artefice'
];

const PREPARATION_PRIORITY = {
  known: 0,
  prepared: 1,
  always: 2
};

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

export function normalizeCasterClasses(values = []) {
  const source = Array.isArray(values) ? values : [values];
  return [...new Set(source
    .map(normalizeText)
    .filter((entry) => SPELLCASTER_CLASS_OPTIONS.includes(entry)))];
}

export function inferCharacterCasterClasses(character) {
  const data = character?.data || character || {};
  const configured = normalizeCasterClasses(data.spellcasting?.caster_classes || []);
  if (configured.length) return configured;

  const className = normalizeText(data.class_name || data.class_archetype);
  return SPELLCASTER_CLASS_OPTIONS.filter((entry) => {
    const pattern = new RegExp(`(^|[^a-z])${entry}([^a-z]|$)`, 'i');
    return pattern.test(className);
  });
}

export function getCharacterRulesVersion(character) {
  const root = character || {};
  const data = root.data || root;
  const candidates = [
    root.system,
    data.system,
    data.rules_version,
    data.spellcasting?.rules_version
  ];
  for (const candidate of candidates) {
    const normalized = String(candidate || '').trim();
    if (normalized === '2014' || normalized.includes('2014')) return '2014';
    if (normalized === '2024' || normalized.includes('2024')) return '2024';
  }
  return '2014';
}

export function getCharacterMaxSpellLevel(character) {
  const spellcasting = character?.data?.spellcasting || character?.spellcasting || {};
  const totals = spellcasting.slots_max || {};
  const remaining = spellcasting.slots || {};
  let maximum = 0;
  for (let level = 1; level <= 9; level += 1) {
    if (Number(totals[level] ?? totals[String(level)]) > 0 || Number(remaining[level] ?? remaining[String(level)]) > 0) {
      maximum = level;
    }
  }
  return maximum;
}

export function getSpellSignature(spell) {
  const name = normalizeText(spell?.name);
  if (!name) return '';
  const origin = spell?.shared_spell_id || spell?.source_key ? 'archive' : 'custom';
  const sourceKey = normalizeText(spell?.source_key || '');
  const level = Math.max(0, Number(spell?.level) || 0);
  const rulesVersion = normalizeText(spell?.rules_version || '');
  return `${origin}|${sourceKey || name}|${name}|${level}|${rulesVersion}`;
}

function pickPreparationState(left, right) {
  const leftState = left || 'known';
  const rightState = right || 'known';
  return (PREPARATION_PRIORITY[rightState] ?? 0) > (PREPARATION_PRIORITY[leftState] ?? 0)
    ? rightState
    : leftState;
}

function mergeSpellRecords(current, incoming) {
  const currentLinked = Boolean(current?.shared_spell_id);
  const incomingLinked = Boolean(incoming?.shared_spell_id);
  const primary = incomingLinked && !currentLinked ? incoming : current;
  const secondary = primary === current ? incoming : current;
  const merged = {
    ...secondary,
    ...primary,
    id: primary.id || secondary.id,
    shared_spell_id: primary.shared_spell_id || secondary.shared_spell_id || null,
    prep_state: pickPreparationState(current?.prep_state, incoming?.prep_state)
  };
  // Le associazioni del personaggio possono contenere snapshot creati prima
  // dei backfill del catalogo. Manteniamo un valore locale esplicito, ma se
  // la notazione era assente recuperiamo quella aggiornata dall'archivio.
  merged.damage_die = primary?.damage_die || secondary?.damage_die || null;
  return merged;
}

export function dedupeCharacterSpells(spells = []) {
  const result = [];
  const sharedIndexes = new Map();
  const signatureIndexes = new Map();

  (Array.isArray(spells) ? spells : []).filter(Boolean).forEach((spell) => {
    const sharedKey = spell.shared_spell_id ? String(spell.shared_spell_id) : '';
    const signature = getSpellSignature(spell);
    const existingIndex = (sharedKey && sharedIndexes.has(sharedKey))
      ? sharedIndexes.get(sharedKey)
      : (signature && signatureIndexes.has(signature) ? signatureIndexes.get(signature) : -1);

    if (existingIndex >= 0) {
      result[existingIndex] = mergeSpellRecords(result[existingIndex], spell);
      const merged = result[existingIndex];
      if (merged.shared_spell_id) sharedIndexes.set(String(merged.shared_spell_id), existingIndex);
      const mergedSignature = getSpellSignature(merged);
      if (mergedSignature) signatureIndexes.set(mergedSignature, existingIndex);
      return;
    }

    const nextIndex = result.length;
    result.push({ ...spell });
    if (sharedKey) sharedIndexes.set(sharedKey, nextIndex);
    if (signature) signatureIndexes.set(signature, nextIndex);
  });

  return result;
}

export function mapSharedSpellForPreparation(sharedSpell) {
  if (!sharedSpell?.id || !sharedSpell?.name) return null;
  const level = Math.max(0, Number(sharedSpell.level) || 0);
  return {
    id: `catalog-${sharedSpell.id}`,
    shared_spell_id: sharedSpell.id,
    catalog_only: true,
    name: sharedSpell.name,
    level,
    kind: level === 0 ? 'cantrip' : 'spell',
    cast_time: sharedSpell.cast_time || null,
    duration: sharedSpell.duration || null,
    range: sharedSpell.range || null,
    components: sharedSpell.components || null,
    material: sharedSpell.material || null,
    concentration: Boolean(sharedSpell.concentration),
    attack_roll: Boolean(sharedSpell.attack_roll),
    saving_throw_ability: sharedSpell.saving_throw_ability || null,
    attack_range_type: sharedSpell.attack_range_type || null,
    is_ritual: Boolean(sharedSpell.ritual),
    damage_die: sharedSpell.damage_die || null,
    damage_modifier: sharedSpell.damage_modifier ?? null,
    damage_type: sharedSpell.damage_type || null,
    upcast_damage_die: sharedSpell.upcast_damage_die || null,
    upcast_damage_modifier: sharedSpell.upcast_damage_modifier ?? null,
    upcast_start_level: sharedSpell.upcast_start_level ?? null,
    upcast_description: sharedSpell.upcast_description || null,
    description: sharedSpell.description || null,
    source: sharedSpell.source || null,
    source_url: sharedSpell.source_url || null,
    source_key: sharedSpell.source_key || null,
    school: sharedSpell.school || null,
    caster_classes: sharedSpell.caster_classes || [],
    rules_version: sharedSpell.rules_version || null,
    prep_state: 'known'
  };
}
