import { describe, expect, it } from 'vitest';
import { expandSpellSourceSelection, groupSpellSources, normalizeSpellSource } from '../../../../src/features/character/spellSources.js';

describe('spell source filters', () => {
  it('groups typographic apostrophe variants without losing their raw database values', () => {
    const groups = groupSpellSources(["Xanathar's Guide to Everything", 'Xanathar’s Guide to Everything', 'Player Handbook']);
    expect(groups).toHaveLength(2);
    const xanathar = groups.find((group) => group.label.startsWith('Xanathar'));
    expect(xanathar.values).toHaveLength(2);
    expect(expandSpellSourceSelection(groups, new Set([xanathar.key]))).toEqual([
      "Xanathar's Guide to Everything",
      'Xanathar’s Guide to Everything'
    ]);
    expect(normalizeSpellSource('  Xanathar’s   Guide  ')).toBe("Xanathar's Guide");
  });
});
