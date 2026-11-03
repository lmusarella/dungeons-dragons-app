import { describe, expect, it } from 'vitest';
import { buildCompactItemList, buildCompactTransactionList } from '../../../../src/features/inventory/compactTables.js';
describe('compact shortcut tables', () => {
  it('keeps item preview and operations in a table while escaping custom names', () => {
    const html = buildCompactItemList([{ id: 'item', name: '<Arma>', category: 'weapon', qty: 2, weight: 1 }]);
    expect(html).toContain('<table'); expect(html).toContain('&lt;Arma&gt;');
    expect(html).toContain('data-item-preview="item"'); expect(html).not.toContain('data-edit="item"'); expect(html).not.toContain('<Arma>');
    expect(html).not.toContain('<th>Vol.</th>');
  });
  it('puts the consume action before every other available row action', () => {
    const html = buildCompactItemList([{ id: 'potion', name: 'Pozione', category: 'consumable', qty: 2 }], 'lb', { allowExtract: true });
    expect(html.indexOf('data-use="potion"')).toBeLessThan(html.indexOf('data-extract-item="potion"'));
    expect(html).toContain('>Estrai</button>');
  });
  it('shows Equipaggia only for equipable loose items', () => {
    const item = [{ id: 'sword', name: 'Spada', category: 'weapon', qty: 1, equipable: true }];
    expect(buildCompactItemList(item, 'kg', { allowEquip: true })).toContain('data-equip-item="sword"');
    expect(buildCompactItemList(item)).not.toContain('data-equip-item');
  });
  it('adds a row-level unequip action only inside the equipped container', () => {
    const item = [{ id: 'sword', name: 'Spada', category: 'weapon', qty: 1 }];
    expect(buildCompactItemList(item, 'kg', { allowUnequip: true })).toContain('data-unequip-item="sword"');
    expect(buildCompactItemList(item)).not.toContain('data-unequip-item');
  });
  it('shows the filtered contained-object count beside a container name', () => {
    const html = buildCompactItemList([{
      id: 'bag', name: 'Zaino', category: 'container', qty: 1, visibleContainedItemCount: 3
    }]);
    expect(html).toContain('compact-item-contained-count');
    expect(html).toContain('3 oggetti');
  });
  it('displays both sides of an exchange and allows its removal without a single-currency edit', () => {
    const html = buildCompactTransactionList([{ id: 'exchange', direction: 'receive', amount: { gp: -2, sp: 20 }, reason: '<Cambio>', occurred_on: '2026-10-26' }]);
    expect(html).toContain('Scambio'); expect(html).toContain('+20'); expect(html).toContain('-2');
    expect(html).toContain('moneta_oro.png'); expect(html).toContain('moneta_argento.png');
    expect(html).toContain('table-coin-icon');
    expect(html).toContain('&lt;Cambio&gt;'); expect(html).toContain('data-delete-transaction="exchange"');
    expect(html).not.toContain('data-edit-transaction');
  });
});
