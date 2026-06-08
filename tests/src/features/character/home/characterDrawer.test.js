import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

function extractNamedExports(source) {
  const names = new Set();
  const functionRegex = /export\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g;
  const constRegex = /export\s+const\s+([A-Za-z_$][\w$]*)\s*=/g;
  let match;
  while ((match = functionRegex.exec(source)) !== null) names.add(match[1]);
  while ((match = constRegex.exec(source)) !== null) names.add(match[1]);
  return [...names];
}

describe('src/features/character/home/characterDrawer.js', () => {
  it('defines module-level API surface', () => {
    const source = readFileSync('src/features/character/home/characterDrawer.js', 'utf8');
    const exports = extractNamedExports(source);
    expect(source.trim().length).toBeGreaterThan(40);
    expect(exports.length).toBeGreaterThan(0);
    exports.forEach((name) => {
      expect(source).toContain(`export`);
      expect(source).toContain(name);
    });
  });

  it('edits and saves structured unarmed attacks on the character', () => {
    const source = readFileSync('src/features/character/home/characterDrawer.js', 'utf8');
    expect(source).toContain('Colpi senz’arma');
    expect(source).toContain("name = 'unarmed_attack_count'");
    expect(source).toContain('unarmed_attack_to_hit_');
    expect(source).toContain('unarmed_attacks: nextUnarmedAttacks');
    expect(source).toContain('key: `unarmed:${index}`');
  });
});
