import { describe, it, expect } from 'vitest';
import { weaponAttackVariants, weaponForAttackRange } from '../../../../src/features/character/home/attackRanges.js';
import { buildAttackSection, buildSpellSection } from '../../../../src/features/character/home/sections.js';
describe('hybrid weapon categories', () => {
  const dagger = { id: 'dagger', name: 'Pugnale', category: 'weapon', equipable: true, equip_slots: ['hand'], weapon_range: 'melee', is_thrown: true, damage_die: '1d4' };
  it('makes melee and thrown variants without changing the weapon', () => {
    const variants = weaponAttackVariants(dagger);
    expect(variants.map(v => v.weapon_range)).toEqual(['melee', 'ranged']);
    expect(variants.map(v => v.attack_ability)).toEqual(['str', 'str']);
    expect(dagger.weapon_range).toBe('melee');
  });
  it('preserves an explicitly configured ability', () => {
    expect(weaponForAttackRange({ ...dagger, attack_ability: 'dex' }, 'ranged').attack_ability).toBe('dex');
  });
  it('keeps ordinary melee and ranged weapons in one category', () => {
    expect(weaponAttackVariants({ ...dagger, is_thrown: false })).toHaveLength(1);
    expect(weaponAttackVariants({ ...dagger, weapon_range: 'ranged' }).map(v => v.weapon_range)).toEqual(['ranged']);
  });
  it('renders one hybrid card while retaining both attack bonuses', () => {
    const character = { data: { abilities: { str: 16 }, attack_bonus_melee: 1, attack_bonus_ranged: 4 } };
    const markup = buildAttackSection(character, [dagger]);
    expect(markup.match(/attack-card--weapon/g)).toHaveLength(1);
    expect(markup).toContain('data-attack-range="hybrid"');
    expect(markup).toContain('data-attack-melee-bonus="+4"');
    expect(markup).toContain('data-attack-ranged-bonus="+7"');
  });
  it('keeps cantrips out of weapon attacks and classifies them in the unified spell shortcut', () => {
    const character = { data: { abilities: { int: 16 }, proficiency_bonus: 2, spellcasting: { ability: 'int' }, spells: [
      { id: 'bolt', name: 'Dardo di fuoco', level: 0, attack_roll: true, damage_die: '1d10', range: '36 m', attack_range_type: 'melee' },
      { id: 'touch', name: 'Tocco gelido', level: 0, attack_roll: true, damage_die: '1d8', attack_range_type: 'ranged' },
      { id: 'burst', name: 'Esplosione', level: 0, attack_roll: false, damage_die: '1d6', attack_range_type: 'melee' }
    ] } };
    const attacks = buildAttackSection(character, []);
    const cantrips = buildSpellSection(character);
    expect(attacks).not.toContain('Dardo di fuoco');
    expect(attacks).not.toContain('Tocco gelido');
    expect(cantrips).toContain('data-roll-attack="spell:bolt" data-attack-range="melee"');
    expect(cantrips).toContain('data-roll-attack="spell:touch" data-attack-range="ranged"');
    expect(cantrips).toContain('Esplosione');
    expect(cantrips).not.toContain('data-roll-attack="spell:burst"');
  });
});
