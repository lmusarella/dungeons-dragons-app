import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { calcItemWeight, calcSelectionWeight, calcTotalWeight } from '../../../src/lib/calc.js';

function extractNamedExports(source) {
  const names = new Set();
  const functionRegex = /export\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g;
  const constRegex = /export\s+const\s+([A-Za-z_$][\w$]*)\s*=/g;
  let match;
  while ((match = functionRegex.exec(source)) !== null) names.add(match[1]);
  while ((match = constRegex.exec(source)) !== null) names.add(match[1]);
  return [...names];
}

describe('src/lib/calc.js', () => {
  it('defines module-level API surface', () => {
    const source = readFileSync('src/lib/calc.js', 'utf8');
    const exports = extractNamedExports(source);
    expect(source.trim().length).toBeGreaterThan(40);
    expect(exports.length).toBeGreaterThan(0);
    exports.forEach((name) => {
      expect(source).toContain('export');
      expect(source).toContain(name);
    });
  });

  it('calculates total weight defensively', () => {
    expect(calcTotalWeight([
      { qty: 2, weight: 1.5 },
      null,
      { qty: 'bad', weight: 4 }
    ])).toBe(3);
    expect(calcTotalWeight(null)).toBe(0);
  });

  it('includes nested contents in a container without double counting a selected child', () => {
    const items = [
      { id: 'pack', qty: 1, weight: 2 },
      { id: 'pouch', container_item_id: 'pack', qty: 1, weight: 0.5 },
      { id: 'coin', container_item_id: 'pouch', qty: 10, weight: 0.02 }
    ];
    expect(calcItemWeight(items[0], items)).toBeCloseTo(2.7);
    expect(calcSelectionWeight([items[0], items[1]], items)).toBeCloseTo(2.7);
  });

  it('terminates safely when imported containment data contains a cycle', () => {
    const items = [
      { id: 'a', container_item_id: 'b', qty: 1, weight: 1 },
      { id: 'b', container_item_id: 'a', qty: 1, weight: 2 }
    ];
    expect(calcItemWeight(items[0], items)).toBe(3);
  });
});
