import { supabase } from '../../lib/supabase.js';
import { searchSharedSpells } from '../character/spellbookApi.js';
import { clearCatalogRelationsCache } from '../dndCatalog/catalogRelations.js';
import { extractFromRecord } from './spellReferenceExtractor.js';
import { SPELL_ALIAS_TABLE, SPELL_VIEW, aliasKeyOf } from './spellSchema.js';
import { groupSpellReferences, referencesFromCatalog } from './spellAliasesModel.js';

const PAGE = 1000;

async function fetchAll(table) {
  const rows = [];
  for (let page = 0; page < 30; page += 1) {
    const { data, error } = await supabase.from(table).select('*').order('id', { ascending: true }).range(page * PAGE, page * PAGE + PAGE - 1);
    if (error) throw error;
    rows.push(...(data || []));
    if ((data || []).length < PAGE) break;
  }
  return rows;
}

export async function loadSpellGroups() {
  const [rows, aliases] = await Promise.all([
    fetchAll(SPELL_VIEW),
    fetchAll(SPELL_ALIAS_TABLE).catch((error) => { console.warn('Alias degli incantesimi non disponibili', error); return []; })
  ]);
  const references = referencesFromCatalog(rows);
  return { groups: groupSpellReferences(references, aliases), aliases, viewRows: rows.length, usableRows: references.length, columns: Object.keys(rows[0] || {}) };
}

/** Ricerca nel catalogo esistente degli incantesimi: l'associazione usa sempre l'UUID di shared_spells. */
/**
 * Prima gli incantesimi della stessa edizione del riferimento; con `includeOther` anche quelli dell'altra edizione
 * (marcati `_compatible: false`): il collegamento tra edizioni richiede una scelta esplicita, mai dedotta dal nome.
 */
export async function searchSpellsForAlias(query, { rulesVersion = null, includeOther = false } = {}) {
  const unwrap = (result) => result.items || result.spells || [];
  if (!rulesVersion) return unwrap(await searchSharedSpells({ query, pageSize: 15 })).map((spell) => ({ ...spell, _compatible: true }));
  const same = unwrap(await searchSharedSpells({ query, rulesVersion, pageSize: 15 })).map((spell) => ({ ...spell, _compatible: true }));
  if (!includeOther) return same;
  const other = unwrap(await searchSharedSpells({ query, rulesVersion: rulesVersion === '2014' ? '2024' : '2014', pageSize: 10 })).map((spell) => ({ ...spell, _compatible: false }));
  return [...same, ...other];
}

async function callRpc(name, args) {
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw error;
  clearCatalogRelationsCache();
  return data;
}

export const saveSpellAlias = (key, rulesVersion, spellId, allowCrossVersion = false) => callRpc('admin_save_spell_alias', { p_source_key: aliasKeyOf(key), p_rules_version: rulesVersion, p_shared_spell_id: spellId, p_allow_cross_version: allowCrossVersion });
export const deleteSpellAlias = (key, rulesVersion) => callRpc('admin_delete_spell_alias', { p_source_key: aliasKeyOf(key), p_rules_version: rulesVersion });
export const setSpellReference = (referenceId, spellId, allowCrossVersion = false) => callRpc('admin_set_spell_reference', { p_reference_id: referenceId, p_shared_spell_id: spellId, p_allow_cross_version: allowCrossVersion });
export const clearSpellReference = (referenceId) => callRpc('admin_clear_spell_reference', { p_reference_id: referenceId });

const OWNER_TABLES = [['class', 'shared_classes'], ['subclass', 'shared_subclasses'], ['species', 'shared_species'], ['variant', 'shared_species_variants'], ['feature', 'shared_features']];

/** Valori ammessi dai CHECK di shared_spell_references (grant_type, casting_mode). */
export function grantTypeOf(reference) {
  if (reference.selector?.type === 'choose') return 'choice';
  if (reference.kind === 'prepared') return 'always_prepared';
  if (reference.kind === 'expanded') return 'expanded_list';
  if (reference.kind === 'innate') return reference.mode === 'at_will' ? 'at_will' : 'innate';
  if (reference.kind === 'known') return reference.selector ? 'other' : 'known';
  return 'other';
}

export function castingModeOf(reference) {
  if (reference.mode === 'at_will') return 'at_will';
  if (reference.mode === 'daily' || reference.mode === 'rest') return 'free';
  if (reference.kind === 'known' || reference.kind === 'prepared') return 'normal';
  return 'unspecified';
}

/** Riga inviata alla RPC: nomi allineati alle colonne reali di shared_spell_references. */
export function referenceToRow(reference, record = {}) {
  return {
    rules_version: record.rules_version ?? null,
    owner_type: reference.ownerType,
    owner_id: reference.ownerId,
    source_json_path: reference.jsonPath,
    source_ref: reference.spellRef,
    grant_type: grantTypeOf(reference),
    casting_mode: castingModeOf(reference),
    unlock_level: reference.unlockLevel,
    uses_formula: reference.uses === null ? null : `${reference.uses}${reference.usesEach ? 'e' : ''}`,
    recovery_type: reference.recovery,
    conditions: {
      block_name: reference.blockName, ability: reference.ability, ability_choices: reference.abilityChoices, resource_name: reference.resourceName,
      extracted_kind: reference.kind, extracted_mode: reference.mode, modifier: reference.modifier, spell_source: reference.spellSource, spell_level: reference.spellLevel
    },
    selector: reference.selector ? { type: reference.selector.type, expression: reference.selector.expression, count: reference.selector.count } : {},
    source_payload: reference.raw
  };
}

/** Legge tutti i proprietari (paginato). Gli errori (RLS, tabella assente) NON diventano risultati vuoti: vengono raccolti e propagati. */
async function collectReferences({ slugs = [] } = {}) {
  const rows = [];
  const byOwner = {};
  const bySlug = {};
  const errors = [];
  for (const [ownerType, table] of OWNER_TABLES) {
    let records = [];
    try { records = await fetchAll(table); } catch (error) { errors.push(`${table}: ${error?.message || error?.code || 'errore'}`); continue; }
    byOwner[ownerType] = { records: records.length, withSpells: 0, references: 0 };
    records.forEach((record) => {
      const references = extractFromRecord(ownerType, record);
      if (references.length) byOwner[ownerType].withSpells += 1;
      byOwner[ownerType].references += references.length;
      if (slugs.includes(record.slug)) {
        bySlug[record.slug] = {
          spells: references.filter((reference) => reference.spellName).length,
          selectors: references.filter((reference) => reference.selector).length,
          byKind: references.reduce((acc, reference) => ({ ...acc, [reference.kind]: (acc[reference.kind] || 0) + 1 }), {})
        };
      }
      references.forEach((reference) => rows.push(referenceToRow(reference, record)));
    });
  }
  return { rows, byOwner, bySlug, errors };
}

/** Anteprima di sola lettura: nessuna scrittura, utile per verificare l'estrazione (anche su slug specifici). */
export async function previewSpellReferences({ slugs = ['artificer-alchemist-tce', 'artificer-alchemist-efa', 'sorcerer-divine-soul-xge'] } = {}) {
  const { rows, byOwner, bySlug, errors } = await collectReferences({ slugs });
  return { total: rows.length, byOwner, bySlug, errors };
}

/** Fase 1: estrae i riferimenti dai JSON e li invia a una RPC idempotente riservata agli amministratori. */
export async function importSpellReferences() {
  const { rows, byOwner, errors } = await collectReferences();
  if (errors.length) throw new Error(`Lettura non riuscita: ${errors.join(' | ')}`);
  if (!rows.length) throw new Error(`Nessun riferimento trovato nei JSON (${JSON.stringify(byOwner)}).`);
  const result = { extracted: rows.length, inserted: 0, updated: 0, byOwner };
  for (let index = 0; index < rows.length; index += 400) {
    const data = await callRpc('admin_import_spell_references', { p_rows: rows.slice(index, index + 400) });
    result.inserted += Number(data?.inserted) || 0;
    result.updated += Number(data?.updated) || 0;
  }
  return result;
}
