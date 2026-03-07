import { describe, it, expect } from 'vitest';
import { formatWeight, formatCoin, formatWallet } from '../../../src/lib/format.js';

describe('src/lib/format.js', () => {
  it('formatWeight handles valid and invalid values', () => {
    expect(formatWeight(10)).toBe('10 lb');
    expect(formatWeight(2.5, 'kg')).toBe('2.50 kg');
    expect(formatWeight(null)).toBe('-');
  });

  it('formatCoin formats numeric values', () => {
    expect(formatCoin(12, 'gp')).toBe('12 gp');
    expect(formatCoin(undefined, 'sp')).toBe('0 sp');
  });

  it('formatWallet formats all coins in order', () => {
    expect(formatWallet({ gp: 3, cp: 5 })).toBe('0 pp · 3 gp · 0 sp · 5 cp');
    expect(formatWallet(null)).toBe('-');
  });
});
