import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { getContainerDescendants } from '../../../../src/features/inventory/inventory.js';

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
    expect(source).not.toContain('data-search');
    expect(source).not.toContain('inventory-search');
    expect(source).toContain('data-category-option');
    expect(source).toContain('activeCategories.add(nextCategory)');
    expect(source).toContain('data-reset-filters');
    expect(source).toContain('resetFiltersButton.disabled');
    expect(source).toContain('categories.filter((category) => category.value)');
    expect(source).toContain('openItemSourceModal');
    expect(source).toContain('openSharedItemPicker');
    expect(source).toContain("showShortcutLoader(container, 'Caricamento archivio oggetti')");
    expect(source).toContain('onLoadingChange: (isLoading)');
    expect(source).toContain("sanitizeImageUrl(item.image_url)");
    expect(source).toContain('inventory-insert-picker__visual');
    expect(source).toContain('>+ Aggiungi oggetti</button>');
    expect(styles).toContain('.inventory-category-pills button');
    expect(styles).toContain("button[aria-pressed='true']::before");
    expect(modalStyles).toContain('grid-template-rows: auto minmax(0, 1fr)');
    expect(modalStyles).toContain('.inventory-insert-picker__visual img');
  });

  it('supports a quantity for every selected quick-loot catalog item', () => {
    const home = readFileSync('src/features/character/home.js', 'utf8');
    const inventory = readFileSync('src/features/inventory/inventory.js', 'utf8');
    const picker = readFileSync('src/features/inventory/catalogPicker.js', 'utf8');
    const styles = readFileSync('src/styles/shellExperience.css', 'utf8');
    expect(home).toContain('allowQuantities: true');
    expect(picker).toContain('selected_quantity: Math.max(1');
    expect(picker).toContain('shared_item_qty_${item.id}');
    expect(picker).toContain('qty: getSelectedQuantity(item)');
    expect(picker).toContain('for (let copy = 0; copy < bundleQuantity; copy += 1)');
    expect(styles).toContain('.shared-item-picker__stepper');
    expect(styles).toContain('grid-auto-rows: max-content');
    expect(styles).toContain('align-content: start');
    expect(picker).toContain('const syncCategoryButtons = () =>');
    expect(picker).toContain('button.blur()');
    expect(inventory).toContain("title: 'Loot rapido'");
    expect(inventory).toContain('openQuickLootItemModal(activeCharacter');
    expect(inventory).toContain('allowQuantities: true');
    expect(picker).toContain('modal-card--shortcut-size');
    expect(inventory).toContain("headerActionLabel: 'Nuovo oggetto'");
    expect(picker).toContain('data-shared-item-detail');
    expect(picker).toContain('data-shared-item-select');
    expect(picker).toContain("label.textContent = selection.checked ? 'Selezionato' : 'Seleziona'");
    expect(picker).toContain('openEquipmentItemDetail({ ...template, ...item');
    expect(styles).toContain('.shared-item-picker__select');
    expect(styles).toContain(".shared-item-picker__category.is-active::after");
    expect(picker).toContain("headerActionHost.dataset.formHeaderActions = ''");
    expect(picker).toContain('sheetActions.prepend(headerActionHost)');
    expect(styles).toContain('.modal-card--shortcut-size');
  });

  it('preserves weapon properties when copying a compendium weapon into inventory', () => {
    const picker = readFileSync('src/features/inventory/catalogPicker.js', 'utf8');
    const detail = readFileSync('src/features/character/home/itemDetail.js', 'utf8');
    const home = readFileSync('src/features/character/home.js', 'utf8');
    expect(picker).not.toContain("'cost', 'weapon_properties', 'grip_type'");
    expect(detail).toContain('normalizeWeaponProperties(item)');
    expect(home).toContain('openItemDetails(item, { attackDetail: Boolean');
  });

  it('collects nested container contents from deepest to shallowest for deletion', () => {
    const items = [
      { id: 'bag', category: 'container' },
      { id: 'pouch', category: 'container', container_item_id: 'bag' },
      { id: 'gem', category: 'gear', container_item_id: 'pouch' },
      { id: 'rope', category: 'gear', container_item_id: 'bag' }
    ];
    expect(getContainerDescendants(items, 'bag').map((item) => item.id)).toEqual(['gem', 'pouch', 'rope']);
  });

  it('offers keeping or deleting the contents when removing a non-empty container', () => {
    const source = readFileSync('src/features/inventory/inventory.js', 'utf8');
    const styles = readFileSync('src/styles/theme.css', 'utf8');
    expect(source).toContain('name="container_delete_mode" value="keep"');
    expect(source).toContain('name="container_delete_mode" value="delete"');
    expect(source).toContain('container-delete-choice__card');
    expect(source).toContain("containerDeleteMode === 'delete'");
    expect(styles).toContain('grid-template-columns: repeat(2,minmax(0,1fr))');
  });
});
