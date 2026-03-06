import { describe, it, expect, vi } from 'vitest';
import {
  parseDamageDice,
  getHitDiceSides,
  formatSigned,
  formatAbility,
  calculateArmorClass,
  rollDie
} from '../../../../../src/features/character/home/utils.js';

describe('src/features/character/home/utils.js', () => {
  it('parses damage dice expressions', () => {
    expect(parseDamageDice('2d6+1d4')?.notation).toBe('2d6+1d4');
    expect(parseDamageDice('bad')).toBeNull();
  });

  it('formats modifiers and abilities', () => {
    expect(formatSigned(2)).toBe('+2');
    expect(formatSigned(-1)).toBe('-1');
    expect(formatAbility(14)).toBe('14 (+2)');
  });

  it('derives hit dice sides and roll range', () => {
    expect(getHitDiceSides('d10')).toBe(10);
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.5);
    expect(rollDie(20)).toBe(11);
  });

  it('calculates armor class with equipped armor and shield', () => {
    const ac = calculateArmorClass(
      { ac_bonus: 1 },
      { dex: 14 },
      [
        { category: 'armor', equipable: true, equip_slot: 'body', armor_class: 12, armor_type: 'light' },
        { category: 'armor', equipable: true, equip_slot: 'hand', is_shield: true, shield_bonus: 2 }
      ]
    );
    expect(ac).toBe(17);
  });
});
