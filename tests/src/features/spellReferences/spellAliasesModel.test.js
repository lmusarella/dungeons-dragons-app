import { describe, expect, it } from 'vitest';
import { aliasScope, filterSpellGroups, groupSpellReferences, referencesFromCatalog } from '../../../../src/features/spellReferences/spellAliasesModel.js';
import { castingModeOf, grantTypeOf, referenceToRow } from '../../../../src/features/spellReferences/spellAliasesApi.js';
import { extractFromRecord } from '../../../../src/features/spellReferences/spellReferenceExtractor.js';

const row = (overrides = {}) => ({
  id: `r${Math.random()}`, rules_version: '2014', source_ref: 'burning hands', owner_type: 'subclass', owner_name: 'Dominio del Fuoco', grant_type: 'always_prepared', casting_mode: 'normal',
  unlock_level: 1, match_status: 'missing', resolved_spell_id: null, resolved_spell_name: null, selector: {}, ...overrides
});

describe('associazioni incantesimi (schema reale della vista)', () => {
  it('raggruppa per riferimento ed esclude i selettori dinamici', () => {
    const refs = referencesFromCatalog([row(), row({ owner_name: 'Mago' }), row({ source_ref: null, match_status: 'selector', selector: { type: 'all' } }), row({ source_ref: 'light', grant_type: 'known' })]);
    const groups = groupSpellReferences(refs, []);
    expect(groups.map((group) => [group.ref, group.occurrences])).toEqual([['burning hands', 2], ['light', 1]]);
    expect(groups[0].status).toBe('missing');
  });

  it('alias globale (chiave minuscola con fonte), override manuale e filtri', () => {
    const refs = referencesFromCatalog([
      row({ source_ref: 'Healing Word|XPHB', match_status: 'matched', resolved_spell_id: 'parola', resolved_spell_name: 'Parola di guarigione', owner_type: 'class', grant_type: 'known' }),
      row({ source_ref: 'healing word|xphb', match_status: 'manual', resolved_spell_id: 'altro', owner_type: 'species_variant', grant_type: 'innate' })
    ]);
    const [group] = groupSpellReferences(refs, [{ source_system: '5etools', source_key: 'healing word|xphb', rules_version: '2014', shared_spell_id: 'parola' }]);
    expect(group).toMatchObject({ status: 'linked', spellId: 'parola', mixed: true, occurrences: 2 });
    expect(aliasScope(group, group.origins[0])).toBe('global');
    expect(aliasScope(group, group.origins[1])).toBe('specific');
    expect(filterSpellGroups([group], { owner: 'species_variant' })).toHaveLength(1);
    expect(filterSpellGroups([group], { kind: 'expanded_list' })).toHaveLength(0);
    expect(filterSpellGroups([group], { text: 'guarigione' })).toHaveLength(1);
  });

  it('la riga inviata alla RPC usa le colonne reali di shared_spell_references', () => {
    const [reference] = extractFromRecord('subclass', { id: 'sc', slug: 'x', rules_version: '2024', subclass_data: { '5etools': { additionalSpells: [{ name: 'Good', innate: { 3: { daily: { 1: ['healing word|xphb'] } } } }] } } });
    const payload = referenceToRow(reference, { rules_version: '2024' });
    expect(payload).toMatchObject({
      rules_version: '2024', owner_type: 'subclass', owner_id: 'sc', source_ref: 'healing word|xphb', grant_type: 'innate', casting_mode: 'free',
      unlock_level: 3, uses_formula: '1', recovery_type: 'long_rest', selector: {}
    });
    expect(payload.source_json_path).toBe('additionalSpells[0].innate.3.daily.1[0]');
    expect(payload.conditions.block_name).toBe('Good');
  });

  it('i valori rispettano i CHECK di shared_spell_references', () => {
    const grants = ['known', 'always_prepared', 'innate', 'at_will', 'expanded_list', 'choice', 'other'];
    const modes = ['unspecified', 'normal', 'free', 'both', 'at_will'];
    const refs = extractFromRecord('species', { id: 's', subclass_data: null, species_data: { '5etools': { additionalSpells: [{
      known: { 1: ['light#c', { choose: 'level=0|class=Wizard' }] }, prepared: { 3: ['bless'] },
      innate: { 1: { will: ['minor illusion'] }, 3: { daily: { 1: ['misty step'] } }, _: { rest: { 1: ['fog cloud'] } } },
      expanded: { s1: ['sleep', { all: 'level=1|class=Warlock' }] }
    }] } } });
    expect(refs.length).toBe(8);
    refs.forEach((reference) => {
      expect(grants).toContain(grantTypeOf(reference));
      expect(modes).toContain(castingModeOf(reference));
    });
    expect(grantTypeOf(refs.find((r) => r.mode === 'at_will'))).toBe('at_will');
    expect(grantTypeOf(refs.find((r) => r.selector?.type === 'choose'))).toBe('choice');
    expect(castingModeOf(refs.find((r) => r.spellName === 'bless'))).toBe('normal');
  });

  it('stesso riferimento in edizioni diverse: gruppi e alias separati, nessun collegamento dedotto dal nome', () => {
    const refs = referencesFromCatalog([
      row({ source_ref: 'healing word', rules_version: '2014', match_status: 'matched', resolved_spell_id: 'hw-2014' }),
      row({ source_ref: 'healing word', rules_version: '2024', owner_name: 'Chierico 2024' })
    ]);
    const groups = groupSpellReferences(refs, [{ source_system: '5etools', source_key: 'healing word', rules_version: '2014', shared_spell_id: 'hw-2014' }]);
    expect(groups).toHaveLength(2);
    const g2014 = groups.find((group) => group.rulesVersion === '2014');
    const g2024 = groups.find((group) => group.rulesVersion === '2024');
    expect(g2014).toMatchObject({ status: 'linked', spellId: 'hw-2014' });
    expect(g2024).toMatchObject({ status: 'missing', spellId: null, alias: null });
    expect(filterSpellGroups(groups, { version: '2024' })).toEqual([g2024]);
  });

  it('segnala quando l’incantesimo risolto appartiene a un’altra edizione', () => {
    const [group] = groupSpellReferences(referencesFromCatalog([row({ match_status: 'manual', resolved_spell_id: 'x', version_mismatch: true, resolved_spell_rules_version: '2024' })]), []);
    expect(group.versionMismatch).toBe(true);
  });
});
