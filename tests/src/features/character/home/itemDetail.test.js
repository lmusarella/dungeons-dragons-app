import { describe, expect, it } from 'vitest';
import { getArmorDetailDisplay } from '../../../../../src/features/character/home/itemDetail.js';

describe('getArmorDetailDisplay', () => {
  it('describes light armor with the full Dexterity modifier', () => {
    expect(getArmorDetailDisplay({
      category: 'armor',
      armor_type: 'light',
      armor_class: 12,
      armor_bonus: 5
    })).toMatchObject({
      typeLabel: 'Leggera',
      armorClassLabel: 'CA 12 + Destrezza'
    });
  });

  it('describes medium armor with the +2 Dexterity cap', () => {
    expect(getArmorDetailDisplay({
      category: 'armor',
      armor_type: 'medium',
      armor_class: 14,
      armor_bonus: 5,
      stealth_disadvantage: true,
      minimum_strength: 13
    })).toMatchObject({
      typeLabel: 'Media',
      armorClassLabel: 'CA 14 + Destrezza (massimo +2)',
      stealthDisadvantage: true,
      minimumStrength: 13
    });
  });

  it('does not add Dexterity or the separate armor bonus to heavy armor', () => {
    expect(getArmorDetailDisplay({
      category: 'armor',
      armor_type: 'heavy',
      armor_class: 18,
      armor_bonus: 5,
      stealth_disadvantage: false
    })).toMatchObject({
      typeLabel: 'Pesante',
      armorClassLabel: 'CA 18',
      stealthDisadvantage: false
    });
  });

  it('keeps the legacy heavy-armor stealth rule when the property is missing', () => {
    expect(getArmorDetailDisplay({
      category: 'armor',
      armor_type: 'heavy',
      armor_class: 16
    })?.stealthDisadvantage).toBe(true);
  });

  it('normalizes an absent armor Strength requirement to zero', () => {
    expect(getArmorDetailDisplay({
      category: 'armor',
      armor_type: 'light',
      armor_class: 12
    })?.minimumStrength).toBe(0);
  });
});
