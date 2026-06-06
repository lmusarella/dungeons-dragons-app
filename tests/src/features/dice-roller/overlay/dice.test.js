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

describe('src/features/dice-roller/overlay/dice.js', () => {
  it('defines module-level API surface', () => {
    const source = readFileSync('src/features/dice-roller/overlay/dice.js', 'utf8');
    const exports = extractNamedExports(source);
    expect(source.trim().length).toBeGreaterThan(40);
    expect(exports.length).toBeGreaterThan(0);
    exports.forEach((name) => {
      expect(source).toContain(`export`);
      expect(source).toContain(name);
    });
  });
  it('uses the damage modal width for generic rolls', () => {
    const source = readFileSync('src/features/dice-roller/overlay/dice.js', 'utf8');
    const styles = readFileSync('src/features/dice-roller/styles.css', 'utf8');
    expect(source).toContain("classList.toggle('diceov-stage--generic-roll', mode === 'generic')");
    expect(styles).toMatch(/\.diceov-stage--generic-roll,\s*\.diceov-stage--damage-roll\s*\{\s*width:\s*min\(760px,/s);
  });

});
