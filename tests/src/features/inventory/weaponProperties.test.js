import { describe, expect, it } from 'vitest';
import { normalizeWeaponProperties } from '../../../../src/features/inventory/weaponProperties.js';

describe('weapon property normalization', () => {
  it('accepts an empty new item', () => {
    expect(normalizeWeaponProperties(null)).toEqual([]);
    expect(normalizeWeaponProperties()).toEqual([]);
  });

  it('merges explicit and legacy weapon properties', () => {
    expect(normalizeWeaponProperties({
      weapon_properties: ['leggera'],
      is_thrown: true,
      grip_type: 'two_handed'
    })).toEqual(['leggera', 'lancio', 'due_mani']);
  });
});
