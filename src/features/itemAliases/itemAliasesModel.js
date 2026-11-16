import { normalizeRow } from '../startingEquipment/startingEquipmentModel.js';
import { normalizeBundleRow } from '../startingEquipment/bundleApi.js';

/**
 * Raggruppa i riferimenti originali non (o già) collegati. Il riferimento resta completo (`dagger|xphb`):
 * i qualificatori di fonte non vengono mai eliminati.
 * Sistemi alias: `5etools` per classi/background, `dnd5eapi` per i contenuti delle dotazioni.
 *
 * @typedef {{ kind: 'class'|'background'|'bundle', ownerName: string, entryId: string|null, itemId: string|null, status: string }} ReferenceOrigin
 * @typedef {{ id: string, system: '5etools'|'dnd5eapi', sourceId: string, ref: string, status: 'linked'|'missing'|'ambiguous', itemId: string|null, itemName: string, category: string|null, occurrences: number, origins: ReferenceOrigin[], alias: object|null, mixed: boolean }} ReferenceGroup
 */

export const SOURCE_LABELS = { class: 'Classe', background: 'Background', bundle: 'Contenuto di dotazione' };
export const STATUS_LABELS = { linked: 'Collegato', missing: 'Mancante', ambiguous: 'Ambiguo' };

const pick = (row, ...keys) => keys.map((key) => row?.[key]).find((value) => value !== undefined && value !== null && value !== '');
export const normalizeSourceId = (value) => String(value ?? '').trim().toLowerCase();
const refKey = (system, sourceId) => `${system}|${normalizeSourceId(sourceId)}`;
const REFERENCE_KINDS = new Set(['item', 'missing', 'ambiguous', 'unresolved']);

function uniqueAliases(aliases = []) {
  const byKey = new Map();
  aliases.forEach((alias) => {
    const key = refKey(alias.source_system, alias.source_key);
    const current = byKey.get(key);
    const isCanonical = alias.source_key === normalizeSourceId(alias.source_key);
    const currentIsCanonical = current?.source_key === normalizeSourceId(current?.source_key);
    if (!current || (isCanonical && !currentIsCanonical)
      || (isCanonical === currentIsCanonical && String(alias.updated_at || '') > String(current.updated_at || ''))) {
      byKey.set(key, { ...alias, source_key: normalizeSourceId(alias.source_key) });
    }
  });
  return byKey;
}

export function referencesFromEquipment(rows = []) {
  return rows.map((row) => ({ row, entry: normalizeRow(row) }))
    .filter(({ entry }) => entry.sourceRef && REFERENCE_KINDS.has(entry.kind))
    .map(({ row, entry }) => ({
      system: '5etools',
      sourceId: normalizeSourceId(entry.sourceRef),
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
      sourceId: normalizeSourceId(entry.sourceId || entry.sourceRef),
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
  const aliasMap = uniqueAliases(aliases);
  const groups = new Map();
  references.forEach((reference) => {
    const sourceId = normalizeSourceId(reference.sourceId || reference.ref);
    const key = refKey(reference.system, sourceId);
    if (!groups.has(key)) groups.set(key, { id: key, system: reference.system, sourceId, ref: reference.ref || sourceId, origins: [], names: new Map(), categories: new Map(), linkedName: '', linkedCategory: null });
    const group = groups.get(key);
    group.origins.push(reference.origin);
    if (reference.origin.status === 'linked') {
      group.linkedName ||= reference.itemName || '';
      group.linkedCategory ||= reference.category || null;
    }
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
      id: group.id, system: group.system, sourceId: group.sourceId, ref: group.ref, occurrences: group.origins.length, origins: group.origins, alias,
      status: alias ? 'linked' : ambiguous ? 'ambiguous' : allLinked ? 'linked' : 'missing',
      itemId, itemName: group.names.get(itemId) || group.linkedName, category: group.categories.get(itemId) || group.linkedCategory,
      mixed: counts.size > 1 || (Boolean(alias) && [...counts.keys()].some((id) => id !== alias.shared_item_id))
    };
  }).sort((a, b) => b.occurrences - a.occurrences || a.ref.localeCompare(b.ref));
}

/** Un alias per un riferimento senza occorrenze note (es. creato in anticipo) resta consultabile. */
export function addOrphanAliases(groups, aliases = [], itemNames = new Map()) {
  const known = new Set(groups.map((group) => group.id));
  const extra = [...uniqueAliases(aliases).values()].filter((alias) => !known.has(refKey(alias.source_system, alias.source_key))).map((alias) => ({
    id: refKey(alias.source_system, alias.source_key), system: alias.source_system, sourceId: normalizeSourceId(alias.source_key), ref: normalizeSourceId(alias.source_key), occurrences: 0, origins: [], alias,
    status: 'linked', itemId: alias.shared_item_id, itemName: itemNames.get(String(alias.shared_item_id)) || '', category: null, mixed: false
  }));
  return [...groups, ...extra];
}

/**
 * Mantiene visibili gli alias confermati da una RPC anche quando la SELECT
 * client-side non può leggere shared_item_aliases (per esempio per RLS).
 */
export function applyAliasOverrides(groups = [], aliases = []) {
  const aliasMap = uniqueAliases(aliases);
  return groups.map((group) => {
    const alias = aliasMap.get(group.id);
    if (!alias) return group;
    return {
      ...group,
      alias,
      status: 'linked',
      itemId: alias.shared_item_id,
      mixed: group.origins.some((origin) => origin.itemId && origin.itemId !== alias.shared_item_id)
    };
  });
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
