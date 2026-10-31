import { describe, it, expect } from 'vitest';
import { matchesResourceAction, matchesResourceKind, matchesSpellTraits, actionFilters } from '../../../../src/features/character/home/resourceFilters.js';
describe('consumable action filters', () => {
  it('distinguishes actions, bonus actions and free actions', () => {
    expect(matchesResourceAction('Azione Bonus','Azione')).toBe(false);
    expect(matchesResourceAction('Azione Gratuita','Azione')).toBe(false);
    expect(matchesResourceAction('Azione','Azione')).toBe(true);
  });
  it('accepts case and surrounding whitespace', () => {
    expect(matchesResourceAction(' Reazione ','reazione')).toBe(true);
  });
  it('includes uncategorized resources in the all view', () => {
    expect(matchesResourceAction('','')).toBe(true);
    expect(matchesResourceAction('Durata','')).toBe(true);
    expect(matchesResourceAction('','Reazione')).toBe(false);
  });
  it('exposes the four game action categories', () => {
    expect(actionFilters).toEqual(['Azione','Azione Bonus','Reazione','Azione Gratuita']);
  });
  it('defaults the ability catalog to consumables and keeps always-active powers separate', () => {
    expect(matchesResourceKind('consumable')).toBe(true);
    expect(matchesResourceKind('always')).toBe(false);
    expect(matchesResourceKind('always', 'always')).toBe(true);
    expect(matchesResourceKind('consumable', 'always')).toBe(false);
  });
  it('combines ritual and concentration filters without weakening either one', () => {
    expect(matchesSpellTraits({ ritual: true, concentration: false }, ['ritual'])).toBe(true);
    expect(matchesSpellTraits({ ritual: true, concentration: false }, ['concentration'])).toBe(false);
    expect(matchesSpellTraits({ ritual: 'true', concentration: 'true' }, ['ritual', 'concentration'])).toBe(true);
    expect(matchesSpellTraits({ ritual: true, concentration: false }, ['ritual', 'concentration'])).toBe(false);
    expect(matchesSpellTraits({ ritual: false, concentration: false }, new Set(['concentration']))).toBe(false);
  });
});
