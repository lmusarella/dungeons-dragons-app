import { describe, expect, it } from 'vitest';
import {
  isKnownSpellSchool,
  normalizeSpellSchool,
  spellSchoolsEqual
} from '../../../../src/features/character/spellSchools.js';

describe('spell school normalization', () => {
  it('links lowercase imported values to the canonical Italian label', () => {
    expect(normalizeSpellSchool('invocazione')).toBe('Invocazione');
    expect(normalizeSpellSchool('  NECROMANZIA ')).toBe('Necromanzia');
    expect(spellSchoolsEqual('evocazione', 'Evocazione')).toBe(true);
    expect(isKnownSpellSchool('trasmutazione')).toBe(true);
  });

  it('preserves an unknown custom school without treating it as canonical', () => {
    expect(normalizeSpellSchool('Cronomanzia')).toBe('Cronomanzia');
    expect(isKnownSpellSchool('Cronomanzia')).toBe(false);
  });
});
