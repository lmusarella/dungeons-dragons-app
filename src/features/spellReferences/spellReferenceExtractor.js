/**
 * Estrae i riferimenti strutturati agli incantesimi da `5etools.additionalSpells`.
 * Modulo puro: non dipende dallo schema delle tabelle `shared_spell_*` (ancora da verificare).
 *
 * Distinzioni mantenute:
 *  - known     -> incantesimo conosciuto
 *  - prepared  -> sempre preparato (NON un lancio gratuito)
 *  - innate    -> lancio innato: `at_will` (a volontà), `daily` / `rest` (N usi con recupero) oppure `innate` senza limite dichiarato
 *  - expanded  -> ampliamento della lista (non concede nulla)
 * Le voci `{ all: ... }` e `{ choose: ... }` restano selettori dinamici (mai incantesimi concessi automaticamente).
 *
 * @typedef {{
 *   ownerType: string, ownerId: string|null, jsonPath: string, ordinal: number, key: string,
 *   kind: 'known'|'prepared'|'innate'|'expanded', mode: string,
 *   spellRef: string|null, spellName: string|null, spellSource: string|null, modifier: string|null,
 *   selector: { type: 'all'|'choose', expression: string, count: number }|null,
 *   unlockLevel: number|null, spellLevel: number|null,
 *   uses: number|null, usesEach: boolean, recovery: string|null,
 *   ability: string|null, abilityChoices: string[]|null, blockName: string|null, resourceName: string|null, raw: unknown
 * }} SpellReference
 */

const isObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

function asObject(value) {
  if (isObject(value)) return value;
  if (typeof value !== 'string' || !value.trim()) return {};
  try { return JSON.parse(value); } catch { return {}; }
}

/** Cerca ricorsivamente (profondità limitata) una chiave nei JSON di una riga, anche se salvati come testo. */
function findKey(value, key, depth = 0) {
  if (depth > 5 || value === null || value === undefined) return undefined;
  if (typeof value === 'string') {
    const text = value.trim();
    if (!(text.startsWith('{') || text.startsWith('['))) return undefined;
    try { return findKey(JSON.parse(text), key, depth + 1); } catch { return undefined; }
  }
  if (Array.isArray(value)) {
    for (const entry of value) { const found = findKey(entry, key, depth + 1); if (found !== undefined) return found; }
    return undefined;
  }
  if (!isObject(value)) return undefined;
  if (value[key] !== undefined) return value[key];
  for (const child of Object.values(value)) { const found = findKey(child, key, depth + 1); if (found !== undefined) return found; }
  return undefined;
}

/**
 * Blocchi `additionalSpells` di un record. Prima le colonne note (`5etools` annidato incluso), poi una ricerca
 * ricorsiva su tutte le colonne JSON: nessun blocco viene perso se il JSON è salvato in una colonna diversa.
 */
export function additionalSpellsOf(row) {
  if (!row) return [];
  const known = [row.class_data, row.subclass_data, row.species_data, row.variant_data, row.mechanics, row.data].map(asObject);
  for (const data of known) {
    const blocks = data['5etools']?.additionalSpells ?? data.additionalSpells;
    if (Array.isArray(blocks) && blocks.length) return blocks;
    if (isObject(blocks)) return [blocks];
  }
  const found = findKey(row, 'additionalSpells');
  if (Array.isArray(found)) return found;
  return isObject(found) ? [found] : [];
}

/** `burning hands|phb#2` -> { name, source, modifier }. */
export function parseSpellString(value) {
  const text = String(value || '').trim();
  const [head, modifier = null] = text.split('#');
  const [name, source = null] = head.split('|');
  return { spellRef: head.trim() || null, spellName: name.trim().toLowerCase() || null, spellSource: source ? source.trim().toLowerCase() : null, modifier: modifier ? modifier.trim() : null };
}

const levelKey = (key) => (/^\d+$/.test(key) ? Number(key) : null);

function entryFields(entry) {
  if (typeof entry === 'string') return { ...parseSpellString(entry), selector: null };
  if (isObject(entry) && entry.all !== undefined) return { spellRef: null, spellName: null, spellSource: null, modifier: null, selector: { type: 'all', expression: String(typeof entry.all === 'string' ? entry.all : JSON.stringify(entry.all)), count: 0 } };
  if (isObject(entry) && entry.choose !== undefined) {
    return { spellRef: null, spellName: null, spellSource: null, modifier: null, selector: { type: 'choose', expression: String(typeof entry.choose === 'string' ? entry.choose : JSON.stringify(entry.choose)), count: Math.max(1, Number(entry.count) || 1) } };
  }
  return null;
}

function* walkEntries(value, path) {
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) yield { entry: value[index], path: `${path}[${index}]` };
  }
}

/**
 * @param {{ ownerType: string, ownerId?: string|null }} owner
 * @param {unknown[]} blocks contenuto di additionalSpells
 * @returns {SpellReference[]}
 */
export function extractSpellReferences(owner, blocks) {
  const references = [];
  const base = { ownerType: owner.ownerType, ownerId: owner.ownerId ?? null };
  const push = (entry, path, context) => {
    const fields = entryFields(entry);
    if (!fields) return;
    const ordinal = references.length;
    references.push({
      ...base, jsonPath: path, ordinal, key: `${base.ownerType}:${base.ownerId}:${path}`,
      kind: context.kind, mode: context.mode, ...fields,
      unlockLevel: context.unlockLevel ?? null, spellLevel: context.spellLevel ?? null,
      uses: context.uses ?? null, usesEach: Boolean(context.usesEach), recovery: context.recovery ?? null,
      ability: context.ability, abilityChoices: context.abilityChoices, blockName: context.blockName, resourceName: context.resourceName, raw: entry
    });
  };

  (Array.isArray(blocks) ? blocks : [blocks]).forEach((block, blockIndex) => {
    if (!isObject(block)) return;
    const blockPath = `additionalSpells[${blockIndex}]`;
    const ability = typeof block.ability === 'string' ? block.ability : null;
    const abilityChoices = isObject(block.ability) && Array.isArray(block.ability.choose) ? block.ability.choose : null;
    const common = { ability, abilityChoices, blockName: block.name ?? null, resourceName: block.resourceName ?? null };

    ['known', 'prepared'].forEach((kind) => {
      const group = block[kind];
      if (!group) return;
      const mode = kind === 'known' ? 'known' : 'always_prepared';
      const groups = Array.isArray(group) ? { _: group } : group;
      Object.entries(groups).forEach(([key, list]) => {
        const path = `${blockPath}.${kind}.${key}`;
        for (const { entry, path: entryPath } of walkEntries(list, path)) push(entry, entryPath, { ...common, kind, mode, unlockLevel: levelKey(key) });
      });
    });

    if (block.innate) {
      Object.entries(Array.isArray(block.innate) ? { _: block.innate } : block.innate).forEach(([key, value]) => {
        const unlockLevel = levelKey(key);
        const path = `${blockPath}.innate.${key}`;
        if (Array.isArray(value)) {
          for (const { entry, path: entryPath } of walkEntries(value, path)) push(entry, entryPath, { ...common, kind: 'innate', mode: 'innate', unlockLevel });
          return;
        }
        if (!isObject(value)) return;
        Object.entries(value).forEach(([usage, spells]) => {
          const usagePath = `${path}.${usage}`;
          if (usage === 'will' || usage === 'atWill' || usage === 'at_will') {
            for (const { entry, path: entryPath } of walkEntries(spells, usagePath)) push(entry, entryPath, { ...common, kind: 'innate', mode: 'at_will', unlockLevel });
          } else if (usage === 'daily' || usage === 'rest') {
            Object.entries(isObject(spells) ? spells : {}).forEach(([usesKey, list]) => {
              const uses = Number.parseInt(usesKey, 10) || null;
              for (const { entry, path: entryPath } of walkEntries(list, `${usagePath}.${usesKey}`)) {
                push(entry, entryPath, { ...common, kind: 'innate', mode: usage, unlockLevel, uses, usesEach: usesKey.endsWith('e'), recovery: usage === 'daily' ? 'long_rest' : 'short_or_long_rest' });
              }
            });
          } else if (Array.isArray(spells)) {
            for (const { entry, path: entryPath } of walkEntries(spells, usagePath)) push(entry, entryPath, { ...common, kind: 'innate', mode: usage, unlockLevel });
          }
        });
      });
    }

    if (block.expanded) {
      Object.entries(Array.isArray(block.expanded) ? { _: block.expanded } : block.expanded).forEach(([key, list]) => {
        const spellLevel = /^s\d+$/.test(key) ? Number(key.slice(1)) : null;
        for (const { entry, path } of walkEntries(list, `${blockPath}.expanded.${key}`)) push(entry, path, { ...common, kind: 'expanded', mode: 'list', spellLevel });
      });
    }
  });
  return references;
}

export function extractFromRecord(ownerType, row) {
  return extractSpellReferences({ ownerType, ownerId: row?.id ?? null }, additionalSpellsOf(row));
}

/**
 * Confronto idempotente tra riferimenti estratti e righe già presenti: non tocca mai le associazioni manuali
 * (`shared_spell_id` valorizzato a mano) e segnala come orfane le righe non più presenti nel JSON.
 * @param {SpellReference[]} extracted
 * @param {object[]} existing
 * @param {{ keyOf: (row: object) => string, isManual?: (row: object) => boolean, same: (row: object, reference: SpellReference) => boolean }} options
 */
export function diffReferences(extracted, existing, { keyOf, isManual = () => false, same }) {
  const current = new Map(existing.map((row) => [keyOf(row), row]));
  const wanted = new Set(extracted.map((reference) => reference.key));
  const toInsert = [];
  const toUpdate = [];
  let unchanged = 0;
  extracted.forEach((reference) => {
    const row = current.get(reference.key);
    if (!row) toInsert.push(reference);
    else if (same(row, reference)) unchanged += 1;
    else toUpdate.push({ row, reference });
  });
  const orphaned = existing.filter((row) => !wanted.has(keyOf(row)));
  return { toInsert, toUpdate, unchanged, orphaned: orphaned.filter((row) => !isManual(row)), keptManual: orphaned.filter(isManual) };
}
