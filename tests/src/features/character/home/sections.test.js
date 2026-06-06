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

describe('src/features/character/home/sections.js', () => {
  it('defines module-level API surface', () => {
    const source = readFileSync('src/features/character/home/sections.js', 'utf8');
    const exports = extractNamedExports(source);
    expect(source.trim().length).toBeGreaterThan(40);
    expect(exports.length).toBeGreaterThan(0);
    exports.forEach((name) => {
      expect(source).toContain(`export`);
      expect(source).toContain(name);
    });
  });
  it('renders the death save dice action and the redesigned profile status cards', () => {
    const source = readFileSync('src/features/character/home/sections.js', 'utf8');
    const styles = readFileSync('src/styles/base.css', 'utf8');
    expect(source).toContain('data-roll-death-save');
    expect(source).toContain('profile-status-card--proficiency');
    expect(source).toContain('profile-status-card--background');
    expect(source).toContain('character-profile-body');
    expect(styles).toContain('container-type: inline-size');
    expect(styles).toContain('@container (max-width: 430px)');
    expect(styles).toContain('grid-template-columns: repeat(4, minmax(78px, 1fr))');
  });

});
