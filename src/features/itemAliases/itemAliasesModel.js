import { normalizeRow } from '../startingEquipment/startingEquipmentModel.js';
import { normalizeBundleRow } from '../startingEquipment/bundleApi.js';

/**
 * Raggruppa i riferimenti originali non (o già) collegati. Il riferimento resta completo (`dagger|xphb`):
 * i qualificatori di fonte non vengono mai eliminati.
 * Sistemi alias: `5etools` per classi/background, `dnd5eapi` per i contenuti delle dotazioni.
 *
 * @typedef {{ kind: 'class'|'background'|'bundle', ownerName: string, entryId: string|null, itemId: string|null, status: string }} ReferenceOrigin
 * @typedef {{ id: string, system: '5etools'|'dnd5eapi', ref: string, status: 'linked'|'missing'|'ambiguous', itemId: string|null, itemName: string, category: string|null, occurrences: number, origins: ReferenceOrigin[], alias: object|null, mixed: boolean }} ReferenceGroup
 */

export const SOURCE_LABELS = { class: 'Classe', background: 'Background', bundle: 'Contenuto di dotazione' };
export const STATUS_LABELS = { linked: 'Collegato', missing: 'Mancante', ambiguous: 'Ambiguo' };

const pick = (row, ...keys) => keys.map((key) => row?.[key]).find((value) => value !== undefined && value !== null && value !== '');
const refKey = (system, ref) => `${system}|${String(ref).trim().toLowerCase()}`;
const REFERENCE_KINDS = new Set(['item', 'missing', 'ambiguous', 'unresolved']);

export function referencesFromEquipment(rows = []) {
  return rows.map((row) => ({ row, entry: normalizeRow(row) }))
    .filter(({ entry }) => entry.sourceRef && REFERENCE_KINDS.has(entry.kind))
    .map(({ row, entry }) => ({
      system: '5etools',
      ref: entry.sourceRef,
      origin: { kind: row.source_type === 'background' ? 'background' : 'class', ownerName: row.owner_name || '', entryId: entry.entryId, itemId: entry.itemId, status: entry.kind === 'item' ? 'linked' : entry.kind === 'ambiguous' ? 'ambiguous' : 'missing' },
      itemName: entry.itemName,
      category: entry.itemCategory
    }));
}

export function referencesFromBundles(rows = []) {
  return rows.map((row) => ({ row, entry: normalizeBundleRow(row) }))
    .filter(({ entry }) => entry.sourceRef)
    .map(({ row, entry }) => ({
      system: 'dnd5eapi',
      ref: entry.sourceRef,
      origin: {
        kind: 'bundle', ownerName: String(pick(row, 'bundle_name_it', 'bundle_name', 'owner_name') || entry.bundleId), entryId: null, itemId: entry.itemId,
        status: entry.matchStatus === 'ambiguous' ? 'ambiguous' : entry.linked ? 'linked' : 'missing'
      },
      itemName: entry.name,
      category: entry.category
    }));
}

/** @returns {ReferenceGroup[]} */
export function groupReferences(references = [], aliases = []) {
  const aliasMap = new Map(aliases.map((alias) => [refKey(alias.source_system, alias.source_key), alias]));
  const groups = new Map();
  references.forEach((reference) => {
    const key = refKey(reference.system, reference.ref);
    if (!groups.has(key)) groups.set(key, { id: key, system: reference.system, ref: reference.ref, origins: [], names: new Map(), categories: new Map() });
    const group = groups.get(key);
    group.origins.push(reference.origin);
    if (reference.origin.itemId) {
      group.names.set(reference.origin.itemId, reference.itemName);
      group.categories.set(reference.origin.itemId, reference.category);
    }
  });
  return [...groups.values()].map((group) => {
    const alias = aliasMap.get(group.id) || null;
    const counts = new Map();
    group.origins.forEach((origin) => { if (origin.itemId) counts.set(origin.itemId, (counts.get(origin.itemId) || 0) + 1); });
    const itemId = alias?.shared_item_id || [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    const ambiguous = group.origins.some((origin) => origin.status === 'ambiguous');
    const allLinked = group.origins.every((origin) => origin.status === 'linked');
    return {
      id: group.id, system: group.system, ref: group.ref, occurrences: group.origins.length, origins: group.origins, alias,
      status: ambiguous ? 'ambiguous' : allLinked && itemId ? 'linked' : 'missing',
      itemId, itemName: group.names.get(itemId) || '', category: group.categories.get(itemId) || null,
      mixed: counts.size > 1 || (Boolean(alias) && [...counts.keys()].some((id) => id !== alias.shared_item_id))
    };
  }).sort((a, b) => b.occurrences - a.occurrences || a.ref.localeCompare(b.ref));
}

/** Un alias per un riferimento senza occorrenze note (es. creato in anticipo) resta consultabile. */
export function addOrphanAliases(groups, aliases = [], itemNames = new Map()) {
  const known = new Set(groups.map((group) => group.id));
  const extra = aliases.filter((alias) => !known.has(refKey(alias.source_system, alias.source_key))).map((alias) => ({
    id: refKey(alias.source_system, alias.source_key), system: alias.source_system, ref: alias.source_key, occurrences: 0, origins: [], alias,
    status: 'linked', itemId: alias.shared_item_id, itemName: itemNames.get(String(alias.shared_item_id)) || '', category: null, mixed: false
  }));
  return [...groups, ...extra];
}

export function filterGroups(groups, { source = '', status = '', category = '', text = '' } = {}) {
  const needle = text.trim().toLowerCase();
  return groups.filter((group) => (!source || group.origins.some((origin) => origin.kind === source))
    && (!status || group.status === status)
    && (!category || group.category === category)
    && (!needle || group.ref.toLowerCase().includes(needle) || group.itemName.toLowerCase().includes(needle)
      || group.origins.some((origin) => origin.ownerName.toLowerCase().includes(needle))));
}

export function summarizeOrigins(group) {
  const names = [...new Set(group.origins.map((origin) => `${SOURCE_LABELS[origin.kind]}: ${origin.ownerName}`))];
  return { shown: names.slice(0, 3), more: Math.max(0, names.length - 3) };
}

export const aliasScope = (group, origin) => (group.alias && origin.itemId && origin.itemId !== group.alias.shared_item_id ? 'specific' : group.alias ? 'global' : origin.itemId ? 'import' : 'none');
