import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('src/features/character/home/hpModal.js', () => {
  it('provides the shared healing fields for characters and companions', () => {
    const source = readFileSync('src/features/character/home/hpModal.js', 'utf8');
    expect(source).toContain('export function buildHpShortcutFields(');
    expect(source).toContain('if (allowTempHp)');
    expect(source).toContain('name="temp_hp"');
    expect(source).toContain('if (!allowHitDice)');
  });
});
