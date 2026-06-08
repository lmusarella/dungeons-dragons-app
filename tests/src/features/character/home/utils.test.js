import { describe, it, expect, vi } from 'vitest';
import {
  parseDamageDice,
  getHitDiceSides,
  formatSigned,
  formatAbility,
  calculateArmorClass,
  rollDie,
  buildSpellDamageOverlayConfig,
  getCastableSpellSlotLevels,
  applyDeathSaveRoll,
  getWeaponDamageModes,
  calculateUnarmedAttackBonuses
} from '../../../../../src/features/character/home/utils.js';

describe('src/features/character/home/utils.js', () => {
  it('parses damage dice expressions', () => {
    expect(parseDamageDice('2d6+1d4')?.notation).toBe('2d6+1d4');
    expect(parseDamageDice('bad')).toBeNull();
  });

  it('keeps separate attack modifiers for weapon grips', () => {
    const modes = getWeaponDamageModes({
      damage_die: '1d8',
      attack_modifier: 1,
      weapon_damage_modes: [{
        id: 'two-handed',
        label: 'Due mani',
        damage_die: '1d10',
        damage_modifier: 2,
        attack_modifier: 4
      }]
    });
    expect(modes[0].attackModifier).toBe(1);
    expect(modes[1].attackModifier).toBe(4);
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


  it('returns only castable slot levels for a spell', () => {
    const options = getCastableSpellSlotLevels({
      1: 0,
      2: 1,
      3: 0,
      4: 2
    }, 2);
    expect(options).toEqual([
      { level: 2, available: 1 },
      { level: 4, available: 2 }
    ]);
  });

  it('supports direct cast when only one valid slot exists', () => {
    const options = getCastableSpellSlotLevels({
      1: 0,
      2: 0,
      3: 1
    }, 3);
    expect(options).toEqual([{ level: 3, available: 1 }]);
  });

  it('builds scaled spell damage config for upcast slots', () => {
    const config = buildSpellDamageOverlayConfig({
      name: 'Cura Ferite',
      level: 1,
      damage_die: '1d8',
      damage_modifier: 3,
      upcast_damage_die: '1d8',
      upcast_damage_modifier: 1
    }, 3);
    expect(config).toEqual({
      title: 'Danni Cura Ferite (slot 3°)',
      notation: '1d8+2d8',
      modifier: 5
    });
  });

  it('applies death saving throw successes and failures from the natural d20', () => {
    expect(applyDeathSaveRoll({ successes: 0, failures: 0 }, 10)).toMatchObject({
      successes: 1,
      failures: 0,
      outcome: 'success'
    });
    expect(applyDeathSaveRoll({ successes: 1, failures: 0 }, 20)).toMatchObject({
      successes: 3,
      failures: 0,
      successDelta: 2,
      outcome: 'critical-success'
    });
    expect(applyDeathSaveRoll({ successes: 0, failures: 1 }, 1)).toMatchObject({
      successes: 0,
      failures: 3,
      failureDelta: 2,
      outcome: 'critical-failure'
    });
    expect(applyDeathSaveRoll({ successes: 0, failures: 0 }, 9)).toMatchObject({
      successes: 0,
      failures: 1,
      outcome: 'failure'
    });
  });

  it('rejects invalid death saving throw values and clamps tracks', () => {
    expect(applyDeathSaveRoll({}, 0)).toBeNull();
    expect(applyDeathSaveRoll({ successes: 2, failures: 3 }, 20)).toMatchObject({
      successes: 3,
      failures: 3,
      successDelta: 1
    });
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

  it('calculates unarmed attack totals from the selected physical ability', () => {
    expect(calculateUnarmedAttackBonuses({
      abilities: { str: 10, dex: 16 },
      proficiency_bonus: 3
    }, {
      ability: 'dex',
      attack_bonus: 1,
      damage_bonus: 2
    })).toMatchObject({
      ability: 'dex',
      abilityMod: 3,
      attackTotal: 7,
      damageModifier: 5
    });
  });

});
