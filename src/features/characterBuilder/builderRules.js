import { ABILITY_KEYS } from '../character/speciesAsiConfig.js';
import { abilityModifier, proficiencyBonusForLevel } from '../character/resourceFormula.js';
import { skillList } from '../character/home/constants.js';
import { catalogName } from '../dndCatalog/catalogLocale.js';
import { emptyAsi, rulesData } from '../character/speciesAsiResolver.js';

export const POINT_BUY_BUDGET = 27;
export const POINT_BUY_MIN = 8;
export const POINT_BUY_MAX = 15;
export const POINT_BUY_COST = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };
export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];
export const ABILITY_SCORE_CAP = 20;
export const DEFAULT_ASI_LEVELS = [4, 8, 12, 16, 19];

const SKILL_KEYS = new Set(skillList.map((skill) => skill.key));
const ASI_NAME = /ability score (improvement|increase)|aumento (dei )?punteggi|incremento (dei )?punteggi/i;

export const defaultBaseScores = () => Object.fromEntries(ABILITY_KEYS.map((key) => [key, POINT_BUY_MIN]));

export const pointBuySpent = (base) => ABILITY_KEYS.reduce((total, key) => total + (POINT_BUY_COST[base[key]] ?? Infinity), 0);

export function validatePointBuy(base) {
  const errors = [];
  ABILITY_KEYS.forEach((key) => { if (!(base[key] in POINT_BUY_COST)) errors.push(`${key}: il valore deve essere tra ${POINT_BUY_MIN} e ${POINT_BUY_MAX}`); });
  const spent = pointBuySpent(base);
  if (spent > POINT_BUY_BUDGET) errors.push(`Hai speso ${spent} punti su ${POINT_BUY_BUDGET}`);
  return { valid: !errors.length, spent, remaining: POINT_BUY_BUDGET - spent, errors };
}

/** Il punto d'acquisto consente un incremento solo se resta budget e il massimo non e' superato. */
export function canIncreasePointBuy(base, key) {
  const next = base[key] + 1;
  return next <= POINT_BUY_MAX && pointBuySpent({ ...base, [key]: next }) <= POINT_BUY_BUDGET;
}

export function validateStandardArray(assignment) {
  const values = ABILITY_KEYS.map((key) => Number(assignment[key]) || null);
  const remaining = [...STANDARD_ARRAY];
  const errors = [];
  values.forEach((value) => {
    if (value === null) return;
    const index = remaining.indexOf(value);
    if (index === -1) errors.push(`Il valore ${value} è già stato usato o non appartiene allo standard array`);
    else remaining.splice(index, 1);
  });
  const complete = values.every((value) => value !== null);
  return { valid: complete && !errors.length, complete, errors, available: remaining };
}

export function resolveBaseScores({ mode, pointBuy, standard, manual }) {
  if (mode === 'standard') return Object.fromEntries(ABILITY_KEYS.map((key) => [key, Number(standard[key]) || null]));
  if (mode === 'manual') return Object.fromEntries(ABILITY_KEYS.map((key) => [key, Number(manual[key]) || null]));
  return { ...pointBuy };
}

export function validateBaseScores(abilityState) {
  if (abilityState.mode === 'standard') return validateStandardArray(abilityState.standard);
  if (abilityState.mode === 'manual') {
    const errors = ABILITY_KEYS.filter((key) => !(Number(abilityState.manual[key]) >= 3 && Number(abilityState.manual[key]) <= 18)).map((key) => `${key}: inserisci un valore da 3 a 18`);
    return { valid: !errors.length, errors };
  }
  return validatePointBuy(abilityState.pointBuy);
}

/** Livelli in cui la classe concede un aumento dei punteggi: dai dati del catalogo, altrimenti i livelli standard. */
export function asiLevelsFromFeatures(rows, fallback = DEFAULT_ASI_LEVELS) {
  const levels = [...new Set((rows || [])
    .filter((row) => row?.entity && ASI_NAME.test(`${row.entity.name || ''} ${row.entity.name_it || ''} ${row.entity.slug || ''}`.replaceAll('-', ' ')))
    .map((row) => Number(row.unlock_level)).filter((level) => level > 0))].sort((a, b) => a - b);
  return levels.length ? { levels, fromCatalog: true } : { levels: [...fallback], fromCatalog: false };
}

export const asiPointsForLevel = (levels, characterLevel) => 2 * levels.filter((level) => level <= characterLevel).length;

export function distributeAsi(totalsBefore, asi) {
  return Object.fromEntries(ABILITY_KEYS.map((key) => [key, (totalsBefore[key] ?? 0) + (asi[key] || 0)]));
}

export function asiRemaining(points, asi) {
  return points - ABILITY_KEYS.reduce((sum, key) => sum + (asi[key] || 0), 0);
}

export function canAddAsi(points, asi, preAsiTotals, key) {
  return asiRemaining(points, asi) > 0 && (preAsiTotals[key] ?? 0) + (asi[key] || 0) < ABILITY_SCORE_CAP;
}

export function computeAbilityTotals({ base, species = emptyAsi(), background = emptyAsi(), asi = {} }) {
  const preAsi = Object.fromEntries(ABILITY_KEYS.map((key) => [key, (Number(base[key]) || 0) + (species[key] || 0) + (background[key] || 0)]));
  return { preAsi, final: distributeAsi(preAsi, asi) };
}

export function normalizeSkillKey(value) {
  const key = String(value || '').toLowerCase().replace(/\{@\w+\s+([^|}]*)[^}]*\}/g, '$1').trim().replace(/[^a-z]+/g, '_').replace(/^_|_$/g, '');
  return SKILL_KEYS.has(key) ? key : null;
}

function parseSkillEntry(raw) {
  const entries = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const fixed = new Set();
  const choices = [];
  entries.forEach((entry) => {
    if (typeof entry === 'string') { const key = normalizeSkillKey(entry); if (key) fixed.add(key); return; }
    if (!entry || typeof entry !== 'object') return;
    Object.entries(entry).forEach(([name, value]) => {
      if (name === 'choose' && value && typeof value === 'object') {
        const from = (value.from || skillList.map((skill) => skill.key)).map(normalizeSkillKey).filter(Boolean);
        choices.push({ count: Math.max(1, Number(value.count ?? value.amount ?? 1) || 1), from: [...new Set(from)] });
      } else if (name === 'any') {
        choices.push({ count: Math.max(1, Number(value) || 1), from: skillList.map((skill) => skill.key) });
      } else if (value === true) {
        const key = normalizeSkillKey(name);
        if (key) fixed.add(key);
      }
    });
  });
  return { fixed: [...fixed], choices };
}

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '');
}

export function extractClassSkills(record) {
  const rules = rulesData(record);
  const starting = firstDefined(rules.startingProficiencies, rules.starting_proficiencies, record?.starting_proficiencies) || {};
  return parseSkillEntry(firstDefined(record?.skill_proficiencies, rules.skillProficiencies, rules.skill_proficiencies, starting.skills));
}

export function extractBackgroundSkills(record) {
  const rules = rulesData(record);
  const raw = firstDefined(record?.skill_proficiencies, rules.skillProficiencies, rules.skill_proficiencies, record?.benefits?.skill_proficiencies);
  if (Array.isArray(raw) && raw.length > 1 && raw.every((entry) => entry && typeof entry === 'object')) return parseSkillEntry(raw[0]);
  return parseSkillEntry(raw);
}

export function extractClassSaves(record) {
  const rules = rulesData(record);
  const raw = firstDefined(record?.saving_throw_proficiencies, record?.saving_throws, rules.proficiency, rules.savingThrows, rules.saving_throws) || [];
  const list = Array.isArray(raw) ? raw : typeof raw === 'string' ? raw.split(/[,;]/) : [];
  return list.map((entry) => String(entry).trim().toLowerCase().slice(0, 3)).filter((key) => ABILITY_KEYS.includes(key));
}

export function parseHitDie(record) {
  const raw = firstDefined(record?.hit_die, rulesData(record).hd?.faces, rulesData(record).hit_die);
  const faces = Number(String(raw ?? '').replace(/\D/g, ''));
  return faces >= 4 ? faces : null;
}

export function hitPointsAtLevel(hitDie, level, conModifier) {
  if (!hitDie) return null;
  const perLevel = Math.max(1, Math.floor(hitDie / 2) + 1 + conModifier);
  return Math.max(1, hitDie + conModifier) + (Math.max(1, level) - 1) * perLevel;
}

/** Scelte di competenza: le fisse sono sempre incluse, le altre devono essere complete e senza duplicati. */
export function resolveSkillSelection({ classSkills, backgroundSkills, classPicks = [], backgroundPicks = [] }) {
  const fixed = [...new Set([...classSkills.fixed, ...backgroundSkills.fixed])];
  const errors = [];
  const groups = [
    ...classSkills.choices.map((choice, index) => ({ source: 'class', index, choice, picks: classPicks[index] || [] })),
    ...backgroundSkills.choices.map((choice, index) => ({ source: 'background', index, choice, picks: backgroundPicks[index] || [] }))
  ];
  const taken = new Set(fixed);
  let complete = true;
  groups.forEach((group) => {
    const unique = [...new Set(group.picks)];
    if (unique.length !== group.picks.length) errors.push('Una competenza è stata scelta più volte.');
    if (unique.some((key) => !group.choice.from.includes(key))) errors.push('Competenza non consentita per questa scelta.');
    if (unique.some((key) => taken.has(key))) errors.push('Una competenza scelta è già concessa da un’altra fonte.');
    unique.forEach((key) => taken.add(key));
    if (unique.length !== group.choice.count) complete = false;
  });
  return { fixed, selected: [...taken], complete: complete && !errors.length, errors };
}

const LABEL_SPEED_FEET = 0.3;
export const speedInMeters = (species) => (species?.speed_m !== undefined && species?.speed_m !== null ? Number(species.speed_m)
  : Number(species?.speed) ? Math.round(Number(species.speed) * LABEL_SPEED_FEET * 10) / 10 : null);

/** Payload coerente con quello del drawer personaggio: stessi campi, nessuna tabella nuova. */
export function buildCharacterPayload({ userId, state, classRecord, speciesRecord, backgroundRecord, finalScores, skillSelection, speciesAsiRecord }) {
  const level = Math.min(20, Math.max(1, Number(state.level) || 1));
  const conMod = abilityModifier(finalScores.con);
  const dexMod = abilityModifier(finalScores.dex);
  const hitDie = parseHitDie(classRecord);
  const hp = hitPointsAtLevel(hitDie, level, conMod);
  const saves = extractClassSaves(classRecord);
  const skills = Object.fromEntries(skillList.map((skill) => [skill.key, skillSelection.selected.includes(skill.key)]));
  const savingThrows = Object.fromEntries(ABILITY_KEYS.map((key) => [key, saves.includes(key)]));
  const subclass = state.subclass || null;
  return {
    name: state.name.trim(),
    system: state.version,
    user_id: userId,
    data: {
      level,
      rules_version: state.version,
      race: speciesRecord ? catalogName(speciesRecord) : null,
      background: backgroundRecord ? catalogName(backgroundRecord) : null,
      class_name: catalogName(classRecord),
      archetype: subclass ? catalogName(subclass) : null,
      shared_class_id: classRecord.id,
      shared_subclass_id: subclass?.id || null,
      shared_species_id: speciesRecord?.id || null,
      shared_species_variant_id: state.variantId || null,
      shared_background_id: backgroundRecord?.id || null,
      catalog_choice_option_ids: [],
      species_asi: speciesAsiRecord || null,
      abilities: { ...finalScores },
      proficiency_bonus: proficiencyBonusForLevel(level),
      initiative: dexMod,
      ac: 10 + dexMod,
      speed: speedInMeters(speciesRecord),
      hp: { current: hp, max: hp, temp: 0 },
      hit_dice: { die: hitDie ? `d${hitDie}` : null, max: level, used: 0 },
      saving_throws: savingThrows,
      skills,
      skill_mastery: {},
      builder: { version: 1, completed_at: new Date().toISOString() }
    }
  };
}

