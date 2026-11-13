/**
 * Schema reale (verificato dal DDL): shared_spell_references, shared_spell_reference_catalog (vista), shared_spell_aliases.
 *
 * Vista `shared_spell_reference_catalog`:
 *   id, rules_version, source_system, source_json_path, source_ref, grant_type, unlock_level, level_scope,
 *   shared_choice_option_id, casting_mode, uses_formula, recovery_type, conditions, selector, source_payload, notes,
 *   owner_type (class|subclass|species|species_variant|background|feat|feature), owner_id, owner_name,
 *   resolved_spell_id, resolved_spell_name, match_status (manual|matched|missing|selector)
 * La vista risolve da sola gli alias: `source_system = '5etools'` e `source_key = lower(btrim(source_ref))`.
 */
export const SPELL_VIEW = 'shared_spell_reference_catalog';
export const SPELL_ALIAS_TABLE = 'shared_spell_aliases';
export const SPELL_ALIAS_SYSTEM = '5etools';

export const VIEW_COLUMNS = {
  referenceId: ['id'],
  spellRef: ['source_ref'],
  ownerType: ['owner_type'],
  ownerId: ['owner_id'],
  ownerName: ['owner_name'],
  kind: ['grant_type'],
  mode: ['casting_mode'],
  unlockLevel: ['unlock_level'],
  uses: ['uses_formula'],
  recovery: ['recovery_type'],
  matchStatus: ['match_status'],
  spellId: ['resolved_spell_id'],
  spellName: ['resolved_spell_name'],
  jsonPath: ['source_json_path'],
  rulesVersion: ['rules_version'],
  resolvedVersion: ['resolved_spell_rules_version'],
  versionMismatch: ['version_mismatch']
};

export const pickColumn = (row, names) => names.map((name) => row?.[name]).find((value) => value !== undefined && value !== null && value !== '');

/** Chiave dell'alias: coincide con quella usata dalla vista (`lower(btrim(source_ref))`, riferimento completo con fonte). */
export const aliasKeyOf = (ref) => String(ref ?? '').trim().toLowerCase();
