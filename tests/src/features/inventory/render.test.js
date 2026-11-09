import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { buildInventoryTree, moneyBundleFields, moneyFields, buildLootFields } from '../../../../src/features/inventory/render.js';

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
    expect(markup).not.toContain('data-edit=');
    expect(markup).toContain('Oggetti Sfusi');
  });

  it('offers Equipaggia for equipable loose items and keeps editing in the detail', () => {
    const markup = buildInventoryTree([{
      id: 'sword-1', name: 'Spada', category: 'weapon', qty: 1, weight: 1, equipable: true
    }]);
    expect(markup).toContain('data-equip-item="sword-1"');
    expect(markup).toContain('data-item-preview="sword-1"');
    expect(markup).not.toContain('data-edit="sword-1"');
  });

  it('adds the converted value and coin image to inventory item tables', () => {
    const markup = buildInventoryTree([{
      id: 'treasure-1', name: 'Tesoro', category: 'gear', qty: 1, value_cp: 20
    }]);
    expect(markup).toContain('<span>Valore</span>');
    expect(markup).toContain('inventory-item-value');
    expect(markup).toContain('coin-avatar coin-avatar--sp');
    expect(markup).toContain('moneta_argento.png');
    expect(markup).toContain('<strong>2</strong>');
    expect(markup).toContain("monete d'argento");
    expect(markup).not.toContain('<small>SP</small>');
  });

  it('renders the refined inventory item hierarchy and empty state', () => {
    const styles = readFileSync('src/styles/base.css', 'utf8');
    const itemMarkup = buildInventoryTree([{
      id: 'sword-1',
      name: 'Spada lunga',
      category: 'weapon',
      qty: 1,
      weight: 3,
      volume: 2
    }]);
    const emptyMarkup = buildInventoryTree([]);

    expect(itemMarkup).toContain('inventory-item-row');
    expect(itemMarkup).toContain('inventory-item-row__placeholder');
    expect(itemMarkup).toContain('inventory-table__metric');
    expect(emptyMarkup).toContain('inventory-empty-state');
    expect(styles).toContain('.inventory-toolbar');
    expect(styles).toContain('.inventory-item-row.inventory-table__row');
    expect(styles).toContain('.inventory-side-card--wallet');
  });

  it('escapes stored values and rejects executable image URLs', () => {
    const markup = buildInventoryTree([{
      id: 'item-1" onmouseover="alert(1)',
      name: '<img src=x onerror=alert(1)>',
      image_url: 'javascript:alert(1)',
      category: 'gear',
      qty: 1,
      weight: 1
    }]);
    const fields = moneyFields({ reason: '" autofocus onfocus="alert(1)' });

    expect(markup).not.toContain('<img src=x onerror=alert(1)>');
    expect(markup).not.toContain('javascript:alert(1)');
    expect(markup).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(fields).toContain('&quot; autofocus onfocus=&quot;alert(1)');
  });

  it('builds a compact multi-currency operation and a loot form without volume', () => {
    const fields = moneyBundleFields({ direction: 'pay', amounts: { gp: 2 }, wallet: { gp: 7, pp: 1 } });
    ['amount_pp', 'amount_gp', 'amount_sp', 'amount_cp'].forEach((name) => expect(fields).toContain(`name="${name}"`));
    expect(fields).toContain('7 disponibili');
    expect(fields).toContain('value="2"');
    const loot = buildLootFields();
    expect(loot).not.toContain('name="volume"');
    expect(loot).not.toContain('name="value_cp"');
    expect(loot).not.toContain('name="weight"');
    expect(loot).toContain('name="category"');
    expect(loot).toContain('name="inventory_location"');
    expect(loot).toContain('type="radio"');
    expect(loot).toContain('value="loot" checked');
  });

});
