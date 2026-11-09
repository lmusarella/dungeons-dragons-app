import { describe, it, expect } from 'vitest';
import {
  formatTransactionAmount,
  combineCoinValue,
  normalizeTransactionAmount,
  formatTransactionDate,
  getCategoryLabel,
  getCompatibleEquipSlots,
  getEquipSlots,
  getInventoryItemValueDisplay,
  splitCopperValue,
  getWeightUnit,
  getBodyPartLabels,
  hasProficiencyForItem
} from '../../../../src/features/inventory/utils.js';

describe('src/features/inventory/utils.js', () => {
  it('converts item values up to gold without using platinum', () => {
    expect(getInventoryItemValueDisplay({ value_cp: 20 })).toMatchObject({ key: 'sp', amount: 2, unitLabel: "monete d'argento" });
    expect(getInventoryItemValueDisplay({ value_cp: 100 })).toMatchObject({ key: 'gp', amount: 1, unitLabel: "moneta d'oro" });
    expect(getInventoryItemValueDisplay({ value_cp: 300 })).toMatchObject({ key: 'gp', amount: 3, unitLabel: "monete d'oro" });
    expect(getInventoryItemValueDisplay({ value_cp: 3000 })).toMatchObject({ key: 'gp', amount: 30, unitLabel: "monete d'oro" });
    expect(getInventoryItemValueDisplay({ value_cp: 20, qty: 3 })).toMatchObject({ key: 'sp', amount: 6, copper: 60 });
    expect(getInventoryItemValueDisplay({ value_cp: 150, qty: 2 })).toMatchObject({ key: 'gp', amount: 3, copper: 300 });
  });
  it('splits and combines the gold, silver and copper editor values', () => {
    expect(splitCopperValue(1234)).toEqual({ gp: 12, sp: 3, cp: 4 });
    expect(combineCoinValue({ gp: 12, sp: 3, cp: 4 })).toBe(1234);
    expect(combineCoinValue({ gp: 1, sp: 15, cp: 25 })).toBe(275);
  });
  it('formats and normalizes transaction amount', () => {
    expect(normalizeTransactionAmount('{"gp":2}')).toEqual({ gp: 2 });
    expect(normalizeTransactionAmount('{bad')).toEqual({});
    expect(formatTransactionAmount({ gp: 2, cp: 3 })).toBe('2 gp · 3 cp');
  });

  it('formats date and labels fallback', () => {
    expect(formatTransactionDate('2024-01-02')).toContain('2024');
    expect(formatTransactionDate('bad-date')).toBe('Data non disponibile');
    expect(getCategoryLabel('unknown')).toBe('unknown');
  });

  it('extracts equip slots from array/json/fallback field', () => {
    expect(getEquipSlots({ equip_slots: ['head', ''] })).toEqual(['head']);
    expect(getEquipSlots({ equip_slots: '["body"]' })).toEqual(['body']);
    expect(getEquipSlots({ equip_slot: 'ring' })).toEqual(['ring']);
    expect(getBodyPartLabels(null)).toBe('');
    expect(getWeightUnit(undefined)).toBe('kg');
    expect(getWeightUnit({ data: { settings: { weight_unit: 'lb' } } })).toBe('kg');
  });

  it('keeps compatible destinations separate from equipped slots', () => {
    expect(getCompatibleEquipSlots({
      compatible_equip_slots: ['head', 'neck'],
      equip_slots: []
    })).toEqual(['head', 'neck']);
    expect(getCompatibleEquipSlots({ allowed_equip_slots: '["hands"]' })).toEqual(['hands']);
    expect(getCompatibleEquipSlots({ equip_slots: ['head'] })).toEqual([]);
  });

  it('evaluates weapon proficiency from form data', () => {
    const character = { data: { proficiencies: { weapon_simple: true, weapon_martial: false } } };
    const simple = new FormData();
    simple.set('category', 'weapon');
    simple.set('weapon_type', 'simple');
    expect(hasProficiencyForItem(character, simple)).toBe(true);

    const martial = new FormData();
    martial.set('category', 'weapon');
    martial.set('weapon_type', 'martial');
    expect(hasProficiencyForItem(character, martial)).toBe(false);
  });
});
