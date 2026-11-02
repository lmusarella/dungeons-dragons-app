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

describe('src/features/inventory/inventory.js', () => {
  it('defines module-level API surface', () => {
    const source = readFileSync('src/features/inventory/inventory.js', 'utf8');
    const exports = extractNamedExports(source);
    expect(source.trim().length).toBeGreaterThan(40);
    expect(exports.length).toBeGreaterThan(0);
    exports.forEach((name) => {
      expect(source).toContain(`export`);
      expect(source).toContain(name);
    });
  });

  it('uses compact category buttons in the shortcut and image-led container insertion cards', () => {
    const source = readFileSync('src/features/inventory/inventory.js', 'utf8');
    const styles = readFileSync('src/features/character/home/fantasyTheme.css', 'utf8');
    const modalStyles = readFileSync('src/styles/theme.css', 'utf8');
    expect(source).toContain('inventory-category-pills');
    expect(source).toContain('data-category-option');
    expect(source).toContain('categories.filter((category) => category.value)');
    expect(source).toContain('openItemSourceModal');
    expect(source).toContain('openSharedItemPicker');
    expect(source).toContain("showShortcutLoader(container, 'Caricamento archivio oggetti')");
    expect(source).toContain('onLoadingChange: (isLoading)');
    expect(source).toContain("sanitizeImageUrl(item.image_url)");
    expect(source).toContain('inventory-insert-picker__visual');
    expect(styles).toContain('.inventory-category-pills button');
    expect(modalStyles).toContain('grid-template-rows: auto minmax(0, 1fr)');
    expect(modalStyles).toContain('.inventory-insert-picker__visual img');
  });

  it('supports a quantity for every selected quick-loot catalog item', () => {
    const home = readFileSync('src/features/character/home.js', 'utf8');
    const picker = readFileSync('src/features/inventory/catalogPicker.js', 'utf8');
    const styles = readFileSync('src/styles/shellExperience.css', 'utf8');
    expect(home).toContain('allowQuantities: true');
    expect(picker).toContain('selected_quantity: Math.max(1');
    expect(picker).toContain('shared_item_qty_${item.id}');
    expect(picker).toContain('qty: getSelectedQuantity(item)');
    expect(picker).toContain('for (let copy = 0; copy < bundleQuantity; copy += 1)');
    expect(styles).toContain('.shared-item-picker__stepper');
  });
});
