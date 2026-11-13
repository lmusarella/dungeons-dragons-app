import { SPELL_ALIAS_SYSTEM, VIEW_COLUMNS, aliasKeyOf, pickColumn } from './spellSchema.js';

export const OWNER_LABELS = { class: 'Classe', subclass: 'Sottoclasse', species: 'Specie', species_variant: 'Variante', background: 'Background', feat: 'Talento', feature: 'Privilegio' };
export const KIND_LABELS = { known: 'Conosciuto', always_prepared: 'Sempre preparato', innate: 'Innato', at_will: 'A volontà', expanded_list: 'Lista ampliata', choice: 'Da scegliere', other: 'Altro' };
export const STATUS_LABELS = { linked: 'Collegato', missing: 'Mancante', ambiguous: 'Ambiguo' };

const get = (row, key) => pickColumn(row, VIEW_COLUMNS[key]);

/** Voci che puntano a un incantesimo concreto: i selettori (choose/all, match_status = 'selector') restano regole dinamiche. */
export function referencesFromCatalog(rows = []) {
  return rows.filter((row) => String(get(row, 'matchStatus') || '').toLowerCase() !== 'selector' && get(row, 'spellRef')).map((row) => {
    const status = String(get(row, 'matchStatus') || '').toLowerCase();
    const spellId = get(row, 'spellId') ? String(get(row, 'spellId')) : null;
    return {
      ref: String(get(row, 'spellRef')),
      rulesVersion: String(get(row, 'rulesVersion') || ''),
      spellName: String(get(row, 'spellName') || ''),
      origin: {
        ownerType: String(get(row, 'ownerType') || 'class'), ownerName: String(get(row, 'ownerName') || ''), referenceId: get(row, 'referenceId') ? String(get(row, 'referenceId')) : null,
        kind: String(get(row, 'kind') || 'known'), mode: String(get(row, 'mode') || ''), unlockLevel: get(row, 'unlockLevel') ?? null,
        versionMismatch: get(row, 'versionMismatch') === true, resolvedVersion: get(row, 'resolvedVersion') || null,
        manual: status === 'manual', spellId, status: spellId && ['matched', 'manual'].includes(status) ? 'linked' : 'missing'
      }
    };
  });
}

export function groupSpellReferences(references = [], aliases = []) {
  const groupKey = (version, ref) => `${version}|${aliasKeyOf(ref)}`;
  const aliasMap = new Map(aliases.filter((alias) => !alias.source_system || alias.source_system === SPELL_ALIAS_SYSTEM).map((alias) => [groupKey(alias.rules_version || '', alias.source_key), alias]));
  const groups = new Map();
  references.forEach((reference) => {
    const key = groupKey(reference.rulesVersion, reference.ref);
    if (!groups.has(key)) groups.set(key, { id: key, ref: reference.ref, rulesVersion: reference.rulesVersion, origins: [], names: new Map() });
    const group = groups.get(key);
    group.origins.push(reference.origin);
    if (reference.origin.spellId) group.names.set(reference.origin.spellId, reference.spellName);
  });
  return [...groups.values()].map((group) => {
    const alias = aliasMap.get(group.id) || null;
    const counts = new Map();
    group.origins.forEach((origin) => { if (origin.spellId) counts.set(origin.spellId, (counts.get(origin.spellId) || 0) + 1); });
    const spellId = alias?.shared_spell_id || [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    const allLinked = group.origins.every((origin) => origin.status === 'linked');
    return {
      id: group.id, ref: group.ref, rulesVersion: group.rulesVersion, occurrences: group.origins.length, origins: group.origins, alias, spellId, spellName: group.names.get(spellId) || '',
      status: allLinked && spellId ? 'linked' : 'missing',
      versionMismatch: group.origins.some((origin) => origin.versionMismatch),
      mixed: counts.size > 1 || (Boolean(alias) && [...counts.keys()].some((id) => id !== alias.shared_spell_id))
    };
  }).sort((a, b) => b.occurrences - a.occurrences || a.ref.localeCompare(b.ref));
}

export function filterSpellGroups(groups, { owner = '', kind = '', status = '', text = '', version = '' } = {}) {
  const needle = text.trim().toLowerCase();
  return groups.filter((group) => (!version || group.rulesVersion === version) && (!owner || group.origins.some((origin) => origin.ownerType === owner))
    && (!kind || group.origins.some((origin) => origin.kind === kind))
    && (!status || group.status === status)
    && (!needle || group.ref.toLowerCase().includes(needle) || group.spellName.toLowerCase().includes(needle) || group.origins.some((origin) => origin.ownerName.toLowerCase().includes(needle))));
}

export const aliasScope = (group, origin) => (group.alias && origin.spellId && origin.spellId !== group.alias.shared_spell_id ? 'specific' : group.alias ? 'global' : origin.manual ? 'specific' : origin.spellId ? 'import' : 'none');
