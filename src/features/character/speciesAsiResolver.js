import { ABILITY_KEYS, ABILITY_LABELS_IT, DEFAULT_ASI_RULES, SOURCE_ASI_RULES, TASHA_PATTERNS } from './speciesAsiConfig.js';

/**
 * @typedef {'str'|'dex'|'con'|'int'|'wis'|'cha'} AbilityKey
 * @typedef {Record<AbilityKey, number>} AsiTotals
 * @typedef {{ type: 'weighted'|'count', from: AbilityKey[], weights?: number[], count?: number, amount?: number }} AsiPick
 * @typedef {'fixed'|'flexible'|'variant'|'inherited'|'special'|'unresolved'} AsiKind
 * @typedef {{ id: string, kind: AsiKind, origin: string, fixed: Partial<AsiTotals>, picks: AsiPick[], label: string }} AsiOption
 * @typedef {{ status: string, kind: AsiKind|null, source: 'species'|'background'|'none', options: AsiOption[], warnings: string[], rulesVersion: string }} AsiResolution
 * @typedef {{ optionId?: string|null, picks?: AbilityKey[][] }} AsiChoice
 */

const isObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export const emptyAsi = () => Object.fromEntries(ABILITY_KEYS.map((key) => [key, 0]));

export function rulesData(row) {
  const raw = row?.species_data ?? row?.variant_data ?? row?.background_data ?? row?.class_data ?? row?.subclass_data ?? row?.data;
  if (!isObject(raw)) return {};
  return isObject(raw['5etools']) ? { ...raw, ...raw['5etools'] } : raw;
}

export function sourceCode(row) {
  const data = rulesData(row);
  return String(data.source || row?.source || '').replace(/[\s_-]+/g, '').toUpperCase();
}

export function getCopyReference(row) {
  const data = rulesData(row);
  const raw = data._copy ?? row?.species_data?._copy ?? row?.data?._copy;
  return isObject(raw) && raw.name ? raw : null;
}

const normalizeFrom = (from) => (Array.isArray(from) ? from : ABILITY_KEYS)
  .map((key) => String(key).toLowerCase()).filter((key) => ABILITY_KEYS.includes(key));

function parseAbilityEntries(ability) {
  const entries = Array.isArray(ability) ? ability : isObject(ability) ? [ability] : [];
  const options = [];
  const warnings = [];
  entries.forEach((entry) => {
    if (!isObject(entry)) return;
    const fixed = {};
    ABILITY_KEYS.forEach((key) => {
      const value = Number(entry[key]);
      if (Number.isFinite(value) && value !== 0) fixed[key] = value;
    });
    const picks = [];
    const choose = entry.choose;
    if (isObject(choose)) {
      const weighted = choose.weighted;
      if (isObject(weighted) && Array.isArray(weighted.weights)) {
        picks.push({ type: 'weighted', from: normalizeFrom(weighted.from), weights: weighted.weights.map(Number).filter(Number.isFinite) });
      } else {
        picks.push({ type: 'count', from: normalizeFrom(choose.from), count: Number(choose.count ?? 1) || 1, amount: Number(choose.amount ?? 1) || 1 });
      }
    }
    if (!Object.keys(fixed).length && !picks.length) {
      if (Object.keys(entry).some((key) => !['hidden', 'entry'].includes(key))) warnings.push('Formato degli incrementi non riconosciuto in una voce dei dati.');
      return;
    }
    const impossible = picks.some((pick) => (pick.type === 'weighted' ? pick.weights.length : pick.count) > pick.from.length);
    if (impossible) {
      warnings.push('Una scelta richiede più caratteristiche di quelle disponibili: dati incoerenti.');
      return;
    }
    options.push({ fixed, picks });
  });
  return { options, warnings };
}

const pickSlots = (pick) => (pick.type === 'weighted' ? pick.weights.length : pick.count);
const signed = (value) => `${value >= 0 ? '+' : ''}${value}`;

export function describeOption(option) {
  const fixed = Object.entries(option.fixed).map(([key, value]) => `${ABILITY_LABELS_IT[key]} ${signed(value)}`);
  const picks = option.picks.map((pick) => (pick.type === 'weighted'
    ? `a scelta ${pick.weights.map(signed).join('/')}`
    : `${pick.count} a scelta ${signed(pick.amount)}`));
  return [...fixed, ...picks].join(' · ') || 'Nessun incremento';
}

function makeOption(id, base, origin, kindOverride = null) {
  const hasWeighted = base.picks.some((pick) => pick.type === 'weighted');
  const kind = kindOverride || (origin === 'variant' ? 'variant' : origin === 'inherited' ? 'inherited' : origin === 'source-rule' || hasWeighted ? 'flexible' : base.picks.length ? 'special' : 'fixed');
  const option = { id, kind, origin, fixed: base.fixed, picks: base.picks, label: '' };
  option.label = describeOption(option);
  return option;
}

function flexibleOptions(prefix, patterns) {
  return patterns.map((pattern) => ({ fixed: {}, picks: [{ type: 'weighted', from: [...ABILITY_KEYS], weights: pattern.weights }], id: `${prefix}${pattern.id}` }));
}

function resolveSpeciesPart(species, copyChain, warnings) {
  const data = rulesData(species);
  const own = parseAbilityEntries(data.ability);
  warnings.push(...own.warnings);
  if (own.options.length) return { options: own.options, origin: 'own' };
  const copy = getCopyReference(species);
  if (copy) {
    const modTouchesAbility = JSON.stringify(copy._mod ?? {}).toLowerCase().includes('"ability"');
    for (const original of copyChain) {
      const parsed = parseAbilityEntries(rulesData(original).ability);
      if (parsed.options.length) {
        if (modTouchesAbility) {
          warnings.push(`La specie copia “${copy.name}” ma modifica gli incrementi tramite _mod: non applicabili automaticamente.`);
          return { options: [], origin: 'unresolved' };
        }
        return { options: parsed.options, origin: 'inherited' };
      }
    }
    warnings.push(`La specie deriva da “${copy.name}” (${copy.source || 'fonte non indicata'}) ma l’originale non è disponibile o non contiene incrementi.`);
    return { options: [], origin: 'unresolved' };
  }
  const rule = SOURCE_ASI_RULES[sourceCode(species)];
  if (rule?.flexible) return { options: flexibleOptions('', rule.patterns), origin: 'source-rule', preBuilt: true };
  return { options: [], origin: 'missing' };
}

function mergeOptions(speciesOptions, variantOptions) {
  const merged = [];
  speciesOptions.forEach((a) => variantOptions.forEach((b) => {
    const fixed = { ...a.fixed };
    Object.entries(b.fixed).forEach(([key, value]) => { fixed[key] = (fixed[key] || 0) + value; });
    merged.push({ fixed, picks: [...a.picks, ...b.picks] });
  }));
  return merged;
}

/**
 * Risolve gli incrementi ai punteggi di caratteristica di una specie, senza controlli sul nome.
 * @param {{ species: object|null, variant?: object|null, variants?: object[], copyChain?: object[], rulesVersion?: string, rules?: { tashaCustomOrigin?: boolean } }} input
 * @returns {AsiResolution}
 */
export function resolveSpeciesAsi({ species, variant = null, variants = [], copyChain = [], rulesVersion, rules = DEFAULT_ASI_RULES } = {}) {
  const version = String(rulesVersion ?? species?.rules_version ?? '');
  const base = { rulesVersion: version, warnings: [], options: [], kind: null, source: 'species', status: 'empty' };
  if (!species) return base;
  if (version === '2024') {
    return { ...base, source: 'background', status: 'background', warnings: ['Nelle regole 2024 gli incrementi alle caratteristiche provengono dal background, non dalla specie.'] };
  }
  const warnings = [];
  const speciesPart = resolveSpeciesPart(species, copyChain, warnings);
  const variantParsed = variant ? parseAbilityEntries(rulesData(variant).ability) : { options: [], warnings: [] };
  warnings.push(...variantParsed.warnings);
  const variantReplaces = variantParsed.options.some((entry) => entry.picks.length
    || speciesPart.options.some((base) => Object.keys(entry.fixed).some((key) => key in base.fixed)));
  const overwrite = Boolean(variant && (rulesData(variant).overwrite?.ability || variantReplaces));
  let options;
  if (variantParsed.options.length && speciesPart.options.length && !overwrite) {
    options = mergeOptions(speciesPart.options, variantParsed.options).map((entry, index) => makeOption(`opt-${index}`, entry, 'variant'));
  } else if (variantParsed.options.length) {
    options = variantParsed.options.map((entry, index) => makeOption(`opt-${index}`, entry, 'variant'));
  } else {
    options = speciesPart.options.map((entry, index) => makeOption(entry.id || `opt-${index}`, entry, speciesPart.origin));
  }
  if (!options.length && variants.length && !variant && speciesPart.origin !== 'unresolved') warnings.push('Seleziona una variante: gli incrementi di questa specie sono definiti dalla variante.');
  if (!options.length && !warnings.length) warnings.push('Dati incompleti: il catalogo non contiene incrementi di caratteristica per questa specie.');
  if (rules?.tashaCustomOrigin && !options.some((option) => option.kind === 'flexible')) {
    flexibleOptions('tasha-', TASHA_PATTERNS).forEach((entry) => options.push(makeOption(entry.id, entry, 'tasha', 'special')));
  }
  const unresolved = !options.length;
  return {
    ...base,
    options,
    warnings,
    kind: unresolved ? 'unresolved' : options[0].kind,
    status: unresolved ? 'unresolved' : options.length > 1 || options[0].picks.length ? 'needs-choice' : 'resolved'
  };
}

/**
 * Valuta una scelta: calcola i punteggi applicabili e segnala combinazioni non consentite.
 * Una scelta parziale applica solo i blocchi completi.
 * @param {AsiResolution} resolution
 * @param {AsiChoice} choice
 */
export function evaluateAsiChoice(resolution, choice = {}) {
  const applied = emptyAsi();
  const errors = [];
  const options = resolution?.options || [];
  const option = options.find((entry) => entry.id === choice?.optionId) || (options.length === 1 ? options[0] : null);
  if (choice?.optionId && !options.some((entry) => entry.id === choice.optionId)) errors.push('Opzione di incremento non valida per la specie selezionata.');
  if (!option) return { valid: !errors.length, complete: !options.length, errors, applied, option: null };
  Object.entries(option.fixed).forEach(([key, value]) => { applied[key] += value; });
  let complete = true;
  option.picks.forEach((pick, index) => {
    const selection = (choice?.picks?.[index] || []).map((key) => String(key || '').toLowerCase());
    const slots = pickSlots(pick);
    const chosen = selection.filter(Boolean);
    const invalid = chosen.filter((key) => !pick.from.includes(key));
    const duplicated = new Set(chosen).size !== chosen.length;
    if (invalid.length) errors.push(`Caratteristica non consentita per questo incremento: ${invalid.map((key) => ABILITY_LABELS_IT[key] || key).join(', ')}.`);
    if (duplicated) errors.push('Le caratteristiche scelte devono essere tutte diverse.');
    if (selection.length > slots) errors.push(`Puoi scegliere al massimo ${slots} caratteristiche.`);
    if (invalid.length || duplicated || selection.length > slots || chosen.length < slots) { complete = false; return; }
    selection.forEach((key, slot) => { applied[key] += pick.type === 'weighted' ? pick.weights[slot] : pick.amount; });
  });
  return { valid: !errors.length, complete: complete && !errors.length, errors, applied: errors.length ? emptyAsi() : applied, option };
}

/** Scarta le scelte non più coerenti con la risoluzione corrente (es. cambio di specie o variante). */
export function reconcileAsiChoice(resolution, choice = {}) {
  const options = resolution?.options || [];
  const option = options.find((entry) => entry.id === choice?.optionId) || (options.length === 1 ? options[0] : null);
  if (!option) return { optionId: null, picks: [] };
  const picks = option.picks.map((pick, index) => (choice?.optionId === option.id || options.length === 1 ? (choice?.picks?.[index] || []) : [])
    .map((key) => String(key || '').toLowerCase()).filter((key, position, list) => key === '' || (pick.from.includes(key) && list.indexOf(key) === position)).slice(0, pickSlots(pick)));
  return { optionId: option.id, picks };
}

/** Applica una sola volta la differenza tra i bonus già inclusi e quelli nuovi. */
export function applyAsiDelta(abilities = {}, previous = emptyAsi(), next = emptyAsi()) {
  return Object.fromEntries(ABILITY_KEYS.map((key) => {
    const delta = (Number(next[key]) || 0) - (Number(previous[key]) || 0);
    const current = abilities[key];
    return [key, current === null || current === undefined || current === '' ? (delta || current) : Number(current) + delta];
  }));
}

export function buildSpeciesAsiRecord({ resolution, choice, evaluation, speciesId, variantId, tashaCustomOrigin = false }) {
  return {
    version: 1,
    rules_version: resolution?.rulesVersion || null,
    species_id: speciesId || null,
    variant_id: variantId || null,
    kind: resolution?.kind || null,
    status: resolution?.status || 'empty',
    option_id: evaluation?.option?.id || choice?.optionId || null,
    picks: choice?.picks || [],
    complete: Boolean(evaluation?.complete),
    tasha_custom_origin: Boolean(tashaCustomOrigin),
    applied: evaluation?.applied || emptyAsi()
  };
}

/**
 * Regole 2024: gli incrementi alle caratteristiche provengono dal background. Per le regole 2014 il background
 * non concede incrementi. Stessa struttura di risoluzione degli incrementi di specie.
 * @returns {AsiResolution}
 */
export function resolveBackgroundAsi({ background, rulesVersion } = {}) {
  const version = String(rulesVersion ?? background?.rules_version ?? '');
  const base = { rulesVersion: version, warnings: [], options: [], kind: null, source: 'background', status: 'empty' };
  if (!background) return base;
  if (version !== '2024') return { ...base, status: 'not-applicable' };
  const parsed = parseAbilityEntries(rulesData(background).ability);
  const options = parsed.options.map((entry, index) => makeOption(`opt-${index}`, entry, 'own'));
  const warnings = [...parsed.warnings];
  if (!options.length) warnings.push('Dati incompleti: il catalogo non contiene incrementi di caratteristica per questo background.');
  return {
    ...base,
    options,
    warnings,
    kind: options.length ? options[0].kind : 'unresolved',
    status: !options.length ? 'unresolved' : options.length > 1 || options[0].picks.length ? 'needs-choice' : 'resolved'
  };
}
