import { describe, it, expect } from 'vitest';
import {
  formatTransactionAmount,
  normalizeTransactionAmount,
  formatTransactionDate,
  getCategoryLabel,
  getEquipSlots,
  hasProficiencyForItem
} from '../../../../src/features/inventory/utils.js';

describe('src/features/inventory/utils.js', () => {
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
