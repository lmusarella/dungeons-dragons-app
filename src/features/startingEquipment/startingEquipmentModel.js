/**
 * Modello puro dell'equipaggiamento iniziale. Ricostruisce la gerarchia
 * Sorgente -> Gruppi -> Opzioni -> Voci dalle righe appiattite della vista
 * `shared_starting_equipment_catalog` e risolve la dotazione effettiva in base alle scelte.
 * Gli oggetti sono trasversali alle edizioni: nessun filtro su `rules_version`.
 *
 * @typedef {{ entryId: string, index: number, type: string, quantity: number, matchStatus: string, itemId: string|null, itemName: string, itemCategory: string|null, sourceRef: string, currencyCp: number, containedCp: number, raw: object, kind: string }} EquipmentEntry
 * @typedef {{ optionId: string, code: string, mandatory: boolean, entries: EquipmentEntry[] }} EquipmentOption
 * @typedef {{ groupId: string, index: number, isChoice: boolean, options: EquipmentOption[] }} EquipmentGroup
 * @typedef {{ sourceId: string, type: string, ownerId: string|null, ownerName: string, rulesVersion: string|null, goldAlternative: string, groups: EquipmentGroup[] }} EquipmentSource
 */

const toBool = (value) => value === true || value === 'true' || value === 1 || value === 't';
const toNumber = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0);
const asObject = (value) => {
  if (value && typeof value === 'object') return value;
  try { return value ? JSON.parse(value) : {}; } catch { return {}; }
};

export function classifyEntry(entry) {
  if (entry.type === 'currency' || (entry.currencyCp > 0 && !entry.itemId)) return 'currency';
  if (entry.type === 'category' || entry.raw?.equipmentType) return 'category';
  if (entry.matchStatus === 'matched' && entry.itemId) return 'item';
  if (entry.matchStatus === 'missing') return 'missing';
  if (entry.matchStatus === 'ambiguous') return 'ambiguous';
  if (entry.matchStatus === 'structured') return 'structured';
  return 'unresolved';
}

export function normalizeRow(row) {
  const raw = asObject(row.raw_entry);
  const entry = {
    entryId: String(row.entry_id ?? `${row.source_id}:${row.group_index}:${row.option_code}:${row.entry_index}`),
    index: toNumber(row.entry_index),
    type: String(row.entry_type || '').toLowerCase(),
    quantity: Math.max(1, toNumber(row.quantity) || 1),
    matchStatus: String(row.match_status || '').toLowerCase(),
    itemId: row.shared_item_id ? String(row.shared_item_id) : null,
    itemName: row.item_name_it || '',
    itemCategory: row.item_category || null,
    sourceRef: String(row.source_ref || ''),
    currencyCp: toNumber(row.currency_cp),
    containedCp: toNumber(row.contained_currency_cp),
    raw
  };
  return { ...entry, kind: classifyEntry(entry) };
}

/** Ricostruisce le sorgenti (classe/background) dalle righe della vista. */
export function buildSources(rows = []) {
  const sources = new Map();
  [...rows].sort((a, b) => toNumber(a.group_index) - toNumber(b.group_index) || String(a.option_code ?? '').localeCompare(String(b.option_code ?? '')) || toNumber(a.entry_index) - toNumber(b.entry_index)).forEach((row) => {
    const sourceKey = String(row.source_id ?? `${row.source_type}:${row.shared_class_id || row.shared_background_id}`);
    if (!sources.has(sourceKey)) {
      sources.set(sourceKey, {
        sourceId: sourceKey, type: row.source_type, ownerId: row.shared_class_id || row.shared_background_id || null,
        ownerName: row.owner_name || '', rulesVersion: row.rules_version || null, goldAlternative: row.gold_alternative ? String(row.gold_alternative) : '', groups: []
      });
    }
    const source = sources.get(sourceKey);
    if (row.group_id === null || row.group_id === undefined) return;
    const groupKey = String(row.group_id);
    let group = source.groups.find((entry) => entry.groupId === groupKey);
    if (!group) { group = { groupId: groupKey, index: toNumber(row.group_index), isChoice: toBool(row.is_choice), options: [] }; source.groups.push(group); }
    const optionKey = String(row.option_id ?? row.option_code ?? 'default');
    let option = group.options.find((entry) => entry.optionId === optionKey);
    if (!option) { option = { optionId: optionKey, code: String(row.option_code ?? ''), mandatory: toBool(row.is_mandatory), entries: [] }; group.options.push(option); }
    if (row.entry_id === null || row.entry_id === undefined) return;
    option.entries.push(normalizeRow(row));
  });
  return [...sources.values()];
}

export const cpToCoins = (cp) => {
  const total = Math.max(0, Math.floor(Number(cp) || 0));
  return { pp: 0, gp: Math.floor(total / 100), sp: Math.floor((total % 100) / 10), cp: total % 10 };
};

export const formatCoins = (cp) => {
  const coins = cpToCoins(cp);
  const parts = [[coins.gp, 'mo'], [coins.sp, 'ma'], [coins.cp, 'mr']].filter(([amount]) => amount > 0).map(([amount, label]) => `${amount} ${label}`);
  return parts.join(' ') || '0 mo';
};

/** Media di una formula come `5d4 × 10` (in mo); null se non interpretabile. */
export function averageGoldFromFormula(text) {
  const match = String(text || '').replace(/\{@\w+\s+([^|}]*)[^}]*\}/g, '$1').match(/(\d+)\s*d\s*(\d+)(?:\s*[×x*]\s*(\d+))?/i);
  if (!match) return null;
  return Math.round(Number(match[1]) * ((Number(match[2]) + 1) / 2) * Number(match[3] || 1));
}

const TOOL_SUB = {
  toolArtisan: /artisan|artigian/i, instrumentMusical: /music|strument/i, setGaming: /gam|gioc/i
};

const lowerList = (value) => [].concat(value || []).map((entry) => String(entry).toLowerCase());
const isRanged = (item) => lowerList(item.weapon_properties ?? item.properties).some((entry) => /ammunition|munizion/.test(entry))
  || /ranged|distanza/i.test(String(item.weapon_range_type ?? item.range_type ?? ''));

/**
 * Filtro per le voci `category` (es. `weaponSimpleMelee`, `toolArtisan`), basato sui campi realmente presenti negli oggetti.
 * `approximate` indica che il campo discriminante manca e viene mostrata l'intera categoria.
 * @returns {{ categories: string[], predicate: (item: object) => boolean, label: string } | null}
 */
export function categoryFilter(equipmentType) {
  const type = String(equipmentType || '');
  const weapon = type.match(/^weapon(Simple|Martial)(Melee|Ranged)?$/);
  if (weapon) {
    const [, kind, range] = weapon;
    return {
      categories: ['weapon'],
      label: `Arma ${kind === 'Simple' ? 'semplice' : 'da guerra'}${range ? (range === 'Melee' ? ' da mischia' : ' a distanza') : ''}`,
      predicate: (item) => item.weapon_type === kind.toLowerCase() && (!range || (range === 'Ranged') === isRanged(item))
    };
  }
  const armor = type.match(/^armor(Light|Medium|Heavy)$/);
  if (armor) return { categories: ['armor'], label: `Armatura ${{ Light: 'leggera', Medium: 'media', Heavy: 'pesante' }[armor[1]]}`, predicate: (item) => item.armor_type === armor[1].toLowerCase() && !item.is_shield };
  if (type === 'shield') return { categories: ['armor'], label: 'Scudo', predicate: (item) => Boolean(item.is_shield) };
  if (TOOL_SUB[type]) return { categories: ['tool'], label: { toolArtisan: 'Strumenti da artigiano', instrumentMusical: 'Strumento musicale', setGaming: 'Set da gioco' }[type], predicate: (item) => TOOL_SUB[type].test(String(item.tool_subcategory || '')) };
  return null;
}

export function categoryOptions(equipmentType, items) {
  const filter = categoryFilter(equipmentType);
  if (!filter) return { supported: false, items: [], approximate: false, label: String(equipmentType || 'Categoria') };
  const inCategory = items.filter((item) => filter.categories.includes(item.category));
  const exact = inCategory.filter(filter.predicate);
  return exact.length
    ? { supported: true, items: exact, approximate: false, label: filter.label, categories: filter.categories }
    : { supported: true, items: inCategory, approximate: inCategory.length > 0, label: filter.label, categories: filter.categories };
}

export const entryEquipmentType = (entry) => entry.raw?.equipmentType || entry.sourceRef || '';

/**
 * Risolve la dotazione effettiva.
 * @param {EquipmentSource[]} sources
 * @param {{ alternatives?: Record<string,string>, categoryPicks?: Record<string,string>, goldAlt?: Record<string, number|null>, acknowledged?: Record<string, boolean> }} selection
 */
export function resolveEquipment(sources, selection = {}) {
  const alternatives = selection.alternatives || {};
  const categoryPicks = selection.categoryPicks || {};
  const goldAlt = selection.goldAlt || {};
  const acknowledged = selection.acknowledged || {};
  const items = new Map();
  const anomalies = [];
  const pending = [];
  const skipped = [];
  let coinsCp = 0;
  const addItem = (itemId, quantity, entry, source) => {
    const current = items.get(itemId) || { sharedItemId: itemId, quantity: 0, origins: [] };
    current.quantity += quantity;
    current.origins.push({ sourceId: source.sourceId, sourceType: source.type, ownerId: source.ownerId, entryId: entry.entryId, quantity });
    items.set(itemId, current);
  };

  sources.forEach((source) => {
    const gold = goldAlt[source.sourceId];
    if (gold !== undefined && gold !== null) { coinsCp += Math.max(0, Math.floor(Number(gold) || 0)) * 100; return; }
    source.groups.forEach((group) => {
      let chosen = group.options;
      if (group.isChoice && group.options.length > 1) {
        const picked = group.options.find((option) => option.optionId === alternatives[group.groupId]);
        if (!picked) { pending.push({ kind: 'alternative', sourceId: source.sourceId, groupId: group.groupId }); return; }
        chosen = [picked];
      }
      chosen.forEach((option) => option.entries.forEach((entry) => {
        if (entry.kind === 'item') {
          addItem(entry.itemId, entry.quantity, entry, source);
          coinsCp += entry.containedCp;
        } else if (entry.kind === 'currency') {
          coinsCp += (entry.currencyCp || entry.containedCp) * entry.quantity;
        } else if (entry.kind === 'category') {
          const pick = categoryPicks[entry.entryId];
          if (pick) addItem(pick, entry.quantity, entry, source);
          else if (acknowledged[entry.entryId]) skipped.push({ entryId: entry.entryId, sourceId: source.sourceId, kind: 'category', label: entryEquipmentType(entry) });
          else pending.push({ kind: 'category', sourceId: source.sourceId, entryId: entry.entryId });
        } else {
          const anomaly = { entryId: entry.entryId, sourceId: source.sourceId, kind: entry.kind, label: entry.sourceRef || entry.itemName || entry.entryId };
          anomalies.push(anomaly);
          if (acknowledged[entry.entryId]) skipped.push(anomaly);
          else pending.push({ kind: 'anomaly', sourceId: source.sourceId, entryId: entry.entryId, anomalyKind: entry.kind });
        }
      }));
    });
  });

  return { items: [...items.values()], coinsCp, anomalies, pending, skipped, complete: pending.length === 0 };
}
