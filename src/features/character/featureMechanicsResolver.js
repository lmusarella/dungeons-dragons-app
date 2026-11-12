import { catalogDescription, catalogName } from '../dndCatalog/catalogLocale.js';

function asObject(value) {
  if (value && typeof value === 'object') return value;
  if (typeof value !== 'string' || !value.trim()) return {};
  try { return JSON.parse(value); } catch { return {}; }
}

function visit(value, callback, path = []) {
  if (!value || typeof value !== 'object') return;
  callback(value, path);
  if (Array.isArray(value)) {
    value.forEach((entry, index) => visit(entry, callback, [...path, index]));
    return;
  }
  Object.entries(value).forEach(([key, entry]) => visit(entry, callback, [...path, key]));
}

function stripTags(value) {
  return String(value || '')
    .replace(/\{@(?:dice|damage)\s+([^}|]+)(?:\|[^}]*)?}/gi, '$1')
    .replace(/\{@(?:dc)\s+([^}|]+)(?:\|[^}]*)?}/gi, 'CD $1')
    .replace(/\{@(?:condition|spell|item|creature|skill|action|sense|status|chance|filter|book|class|race|feat|variantrule)\s+([^}|]+)(?:\|[^}]*)?}/gi, '$1')
    .replace(/\{@(?:b|i|u|s|note)\s+([^}]+)}/gi, '$1')
    .replace(/\{@[^\s}]+\s+([^}|]+)(?:\|[^}]*)?}/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

export function mechanicsText(value) {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') return stripTags(value);
  if (Array.isArray(value)) return value.map(mechanicsText).filter(Boolean).join(' ');
  if (typeof value !== 'object') return '';
  if (value.type === 'list' && Array.isArray(value.items)) return value.items.map((item) => `• ${mechanicsText(item)}`).join('\n');
  if (value.type === 'item') return [value.name, mechanicsText(value.entry ?? value.entries)].filter(Boolean).join(' ');
  return mechanicsText(value.entry ?? value.entries ?? value.text ?? value.name ?? '');
}

function rollRange(value, fallback) {
  if (Number.isFinite(Number(value))) {
    const exact = Number(value);
    return { minRoll: exact, maxRoll: exact };
  }
  if (typeof value === 'string') {
    const match = value.trim().match(/^(\d+)\s*(?:[-–—]\s*(\d+))?$/);
    if (match) return { minRoll: Number(match[1]), maxRoll: Number(match[2] || match[1]) };
  }
  const roll = value?.roll ?? value;
  const exact = Number(roll?.exact ?? roll?.value);
  if (Number.isFinite(exact)) return { minRoll: exact, maxRoll: exact };
  const minRoll = Number(roll?.min ?? roll?.minimum);
  const maxRoll = Number(roll?.max ?? roll?.maximum ?? minRoll);
  if (Number.isFinite(minRoll)) return { minRoll, maxRoll: Number.isFinite(maxRoll) ? maxRoll : minRoll };
  return { minRoll: fallback, maxRoll: fallback };
}

function inferDiceFormula(table, entries) {
  const candidates = [table.diceFormula, table.dice, ...(table.colLabels || []), table.caption, table.name];
  for (const candidate of candidates) {
    const match = String(candidate || '').match(/\b(\d+d\d+)\b/i);
    if (match) return match[1].toLowerCase();
  }
  const maximum = Math.max(0, ...entries.map((entry) => entry.maxRoll));
  return maximum ? `1d${maximum}` : '';
}

function normalizeTableRow(row, index) {
  const cells = Array.isArray(row) ? row : row?.row || row?.cells || [];
  const range = rollRange(cells[0] ?? row?.roll, index + 1);
  const description = mechanicsText(cells.length > 1 ? cells.slice(1) : row?.result ?? row?.entry ?? row);
  return { ...range, description, metadata: { source: row } };
}

export function findFeatureRollTables(mechanics, feature = {}) {
  const source = asObject(mechanics);
  const tables = [];
  visit(source?.['5etools']?.entries ?? source, (node, path) => {
    if (node?.type !== 'table' && !Array.isArray(node?.rows)) return;
    const entries = (node.rows || []).map(normalizeTableRow).filter((entry) => entry.description);
    if (!entries.length) return;
    tables.push({
      id: `${feature.id || feature.slug || 'feature'}:${path.join('.') || tables.length}`,
      title: mechanicsText(node.caption || node.name || catalogName(feature, 'Tabella degli effetti')),
      diceFormula: inferDiceFormula(node, entries),
      entries,
      metadata: { featureId: feature.id || null, path, source: node }
    });
  });
  return tables;
}

export function findStructuredDiceFormulas(mechanics) {
  const formulas = new Set();
  visit(asObject(mechanics)?.['5etools']?.entries ?? asObject(mechanics), (node) => {
    Object.values(node).forEach((value) => {
      if (typeof value !== 'string') return;
      [...value.matchAll(/(?:\{@(?:dice|damage)\s+|\b)(\d+d\d+)\b/gi)].forEach((match) => formulas.add(match[1].toLowerCase()));
    });
  });
  return [...formulas];
}

export function getRollTableEntry(table, roll) {
  const value = Number(roll);
  return table?.entries?.find((entry) => value >= entry.minRoll && value <= entry.maxRoll) || null;
}

const PHYSICAL_DICE = [4, 6, 8, 10, 12, 20, 100];

export function getFeatureDiceAdapter(formula) {
  const normalized = String(formula || '').trim().toLowerCase();
  const match = normalized.match(/^1d(\d+)$/);
  if (!match) return { requestedFormula: normalized, engineFormula: normalized, mapResult: (value) => Number(value) };
  const requestedSides = Number(match[1]);
  if (PHYSICAL_DICE.includes(requestedSides)) {
    return { requestedFormula: normalized, engineFormula: normalized, mapResult: (value) => Number(value) };
  }
  const engineSides = PHYSICAL_DICE.find((sides) => sides >= requestedSides && sides % requestedSides === 0);
  if (!engineSides) return { requestedFormula: normalized, engineFormula: normalized, mapResult: (value) => Number(value) };
  const bucketSize = engineSides / requestedSides;
  return {
    requestedFormula: normalized,
    engineFormula: `1d${engineSides}`,
    mapResult: (value) => Math.min(requestedSides, Math.max(1, Math.ceil(Number(value) / bucketSize)))
  };
}

function featureIdentity(feature) {
  return [feature?.slug, feature?.key, feature?.source_key, feature?.name].filter(Boolean).join(' ').toLowerCase();
}

function hasIdentity(features, identifiers) {
  return features.some((feature) => identifiers.some((identifier) => featureIdentity(feature).includes(identifier)));
}

export function resolveCharacterFeatureMechanics(progression, character = {}) {
  const selected = new Set((character.data?.catalog_choice_option_ids || []).map(String));
  const granted = (progression?.automaticGrants || []).map((grant) => ({
    ...grant.entity,
    unlock_level: grant.unlock_level ?? grant.entity?.unlock_level ?? 1,
    grant
  })).filter((feature) => feature.id);
  const chosen = (progression?.choiceGroups || []).flatMap((group) => group.options || [])
    .filter((option) => selected.has(String(option.id)) && option.entity)
    .map((option) => ({ ...option.entity, unlock_level: option.minimum_level ?? 1, choiceOption: option }));
  const features = [...new Map([...granted, ...chosen].map((feature) => [String(feature.id), feature])).values()];
  const controlledSurge = hasIdentity(features, ['controlled-surge', 'controlled surge']);
  const unstableBacklash = hasIdentity(features, ['unstable-backlash', 'unstable backlash']);
  return features.map((feature) => ({
    id: feature.id,
    slug: feature.slug || feature.source_key || '',
    name: catalogName(feature, 'Capacità'),
    description: catalogDescription(feature),
    unlockLevel: Number(feature.unlock_level) || 1,
    activationType: feature.activation_type || feature.activation?.type || feature.mechanics?.activation?.type || null,
    uses: feature.uses || feature.mechanics?.uses || null,
    tables: findFeatureRollTables(feature.mechanics, feature),
    diceFormulas: findStructuredDiceFormulas(feature.mechanics),
    capabilities: {
      controlledSelection: controlledSurge && hasIdentity([feature], ['wild-surge', 'wild surge']),
      reactionRoll: unstableBacklash && hasIdentity([feature], ['wild-surge', 'wild surge'])
    },
    raw: feature
  }));
}

export function resolveAdditionalSpells(subclassData) {
  const source = asObject(subclassData)?.['5etools']?.additionalSpells ?? asObject(subclassData)?.additionalSpells;
  if (!source) return [];
  const categories = [];
  visit(source, (node, path) => {
    if (Array.isArray(node) || !node || typeof node !== 'object') return;
    ['known', 'prepared', 'expanded', 'innate'].forEach((kind) => {
      if (!(kind in node)) return;
      categories.push({ kind, path: [...path, kind], value: node[kind] });
    });
  });
  return categories;
}
