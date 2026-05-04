import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

function extractNamedExports(source) {
  const names = new Set();
  const functionRegex = /export\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g;
  let match;
  while ((match = functionRegex.exec(source)) !== null) names.add(match[1]);
  return [...names];
}

describe('src/features/character/spellbookApi.js', () => {
  it('defines spellbook API surface', () => {
    const source = readFileSync('src/features/character/spellbookApi.js', 'utf8');
    const exports = extractNamedExports(source);
    expect(exports).toEqual([
      'searchSharedSpells',
      'createSharedSpell',
      'fetchCharacterSpells',
      'assignSharedSpellToCharacter',
      'removeCharacterSpell'
    ]);
  });
});
