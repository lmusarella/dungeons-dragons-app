import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { buildInventoryTree } from '../../../../src/features/inventory/render.js';

function extractNamedExports(source) {
  const names = new Set();
  const functionRegex = /export\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g;
  const constRegex = /export\s+const\s+([A-Za-z_$][\w$]*)\s*=/g;
  let match;
  while ((match = functionRegex.exec(source)) !== null) names.add(match[1]);
  while ((match = constRegex.exec(source)) !== null) names.add(match[1]);
  return [...names];
}

describe('src/features/inventory/render.js', () => {
  it('defines module-level API surface', () => {
    const source = readFileSync('src/features/inventory/render.js', 'utf8');
    const exports = extractNamedExports(source);
    expect(source.trim().length).toBeGreaterThan(40);
    expect(exports.length).toBeGreaterThan(0);
    exports.forEach((name) => {
      expect(source).toContain(`export`);
      expect(source).toContain(name);
    });
  });

  it('renders a quick insert action on container accordions', () => {
    const markup = buildInventoryTree([
      {
        id: 'bag-1',
        name: 'Zaino',
        category: 'container',
        qty: 1,
        weight: 2,
        max_volume: 30
      },
      {
        id: 'rope-1',
        name: 'Corda',
        category: 'gear',
        qty: 1,
        weight: 10,
        volume: 2,
        container_item_id: null
      }
    ]);

    expect(markup).toContain('data-insert-container="bag-1"');
    expect(markup).toContain('Inserisci oggetti sfusi in Zaino');
    expect(markup).toContain('<span>Inserisci</span>');
    expect(markup).toContain('Oggetti Sfusi');
  });
});
