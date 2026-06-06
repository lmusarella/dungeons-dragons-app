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

describe('src/features/character/home.js', () => {
  it('defines module-level API surface', () => {
    const source = readFileSync('src/features/character/home.js', 'utf8');
    const exports = extractNamedExports(source);
    expect(source.trim().length).toBeGreaterThan(40);
    expect(exports.length).toBeGreaterThan(0);
    exports.forEach((name) => {
      expect(source).toContain(`export`);
      expect(source).toContain(name);
    });
  });

  it('uses the selected wild shape physical scores instead of the highest values', () => {
    const source = readFileSync('src/features/character/home.js', 'utf8');
    const adjustedCharacter = source.slice(
      source.indexOf('function buildWildShapeAdjustedCharacter'),
      source.indexOf('function getWildShapeForms')
    );
    expect(adjustedCharacter).toContain('str: Number(activeWildShape.statBlock.abilities.str) || 10');
    expect(adjustedCharacter).toContain('dex: Number(activeWildShape.statBlock.abilities.dex) || 10');
    expect(adjustedCharacter).toContain('con: Number(activeWildShape.statBlock.abilities.con) || 10');
    expect(adjustedCharacter).toContain('initiative: activeWildShape.statBlock.initiative');
    expect(adjustedCharacter).toContain('speed: activeWildShape.statBlock.speeds.walk');
    expect(adjustedCharacter).not.toContain('Math.max');
  });

  it('keeps the death save dice modal open after a roll', () => {
    const source = readFileSync('src/features/character/home.js', 'utf8');
    const deathSaveHandler = source.slice(
      source.indexOf("const deathSaveRollButton = container.querySelector('[data-roll-death-save]')"),
      source.indexOf("container.querySelectorAll('[data-death-save]')")
    );
    expect(deathSaveHandler).toContain('keepOpen: true');
  });

});
