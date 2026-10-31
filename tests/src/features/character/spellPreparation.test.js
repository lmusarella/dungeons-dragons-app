import { describe, expect, it } from 'vitest';
import {
  dedupeCharacterSpells,
  getCharacterMaxSpellLevel,
  getCharacterRulesVersion,
  inferCharacterCasterClasses
} from '../../../../src/features/character/spellPreparation.js';

describe('spell preparation helpers', () => {
  it('hydrates a missing base die from the updated shared spell snapshot', () => {
    const spells = dedupeCharacterSpells([
      { id: 'local', shared_spell_id: 'cure-wounds-2024', name: 'Cura Ferite', level: 1, damage_die: null, prep_state: 'prepared' },
      { id: 'link', shared_spell_id: 'cure-wounds-2024', name: 'Cura Ferite', level: 1, damage_die: '2d8', prep_state: 'prepared' }
    ]);
    expect(spells).toHaveLength(1);
    expect(spells[0].damage_die).toBe('2d8');
  });

  it('deduplicates shared copies while preserving custom spells as distinct entries', () => {
    const spells = dedupeCharacterSpells([
      { id: 'legacy', name: 'Desiderio', level: 9, rules_version: '2014', prep_state: 'known' },
      { id: 'link-1', shared_spell_id: 'wish-2014', name: 'Desiderio', level: 9, rules_version: '2014', prep_state: 'prepared' },
      { id: 'link-2', shared_spell_id: 'wish-2014', name: 'Desiderio', level: 9, rules_version: '2014', prep_state: 'known' }
    ]);

    expect(spells).toHaveLength(2);
    expect(spells.find((entry) => entry.shared_spell_id)).toMatchObject({ shared_spell_id: 'wish-2014', prep_state: 'prepared' });
    expect(spells.find((entry) => !entry.shared_spell_id)).toMatchObject({ id: 'legacy', prep_state: 'known' });
  });

  it('rejoins an edited catalog snapshot that temporarily lost its shared id', () => {
    const spells = dedupeCharacterSpells([
      { id: 'edited-copy', source_key: 'bless', name: 'Benedizione', level: 1, rules_version: '2024', prep_state: 'always' },
      { id: 'assignment', shared_spell_id: 'bless-2024', source_key: 'bless', name: 'Benedizione', level: 1, rules_version: '2024', prep_state: 'known' }
    ]);
    expect(spells).toHaveLength(1);
    expect(spells[0]).toMatchObject({ shared_spell_id: 'bless-2024', prep_state: 'always' });
  });

  it('keeps editions separate when they are distinct catalog entries', () => {
    const spells = dedupeCharacterSpells([
      { id: 'a', shared_spell_id: 'spell-2014', name: 'Scudo', level: 1, rules_version: '2014' },
      { id: 'b', shared_spell_id: 'spell-2024', name: 'Scudo', level: 1, rules_version: '2024' }
    ]);
    expect(spells).toHaveLength(2);
  });

  it('uses configured class lists and otherwise infers them from the character class', () => {
    expect(inferCharacterCasterClasses({ class_name: 'Guerriero / Mago' })).toEqual(['mago']);
    expect(inferCharacterCasterClasses({
      class_name: 'Mago',
      spellcasting: { caster_classes: ['chierico', 'druido'] }
    })).toEqual(['chierico', 'druido']);
  });

  it('derives the maximum preparable level from total or remaining slots', () => {
    expect(getCharacterMaxSpellLevel({ spellcasting: {
      slots: { 1: 0, 2: 1 },
      slots_max: { 1: 4, 2: 2, 3: 0 }
    } })).toBe(2);
  });

  it('uses the character rules edition before the spellcasting fallback', () => {
    expect(getCharacterRulesVersion({ system: '2024', data: { rules_version: '2014' } })).toBe('2024');
    expect(getCharacterRulesVersion({ system: 'dnd-2024', data: { spellcasting: { rules_version: '2014' } } })).toBe('2024');
    expect(getCharacterRulesVersion({ rules_version: '2024', spellcasting: { rules_version: '2014' } })).toBe('2024');
    expect(getCharacterRulesVersion({ spellcasting: { rules_version: '2024' } })).toBe('2024');
    expect(getCharacterRulesVersion({})).toBe('2014');
  });
});
