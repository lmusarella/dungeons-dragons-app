import { describe, it, expect } from 'vitest';
import { getContainerView, buildContainerCatalog, EQUIPPED_CONTAINER_ID, getLocationContainerId } from '../../../../src/features/inventory/containerCatalog.js';
const items = [
  { id: 'bag', name: 'Zaino', category: 'container' },
  { id: 'pouch', name: 'Borsa piccola', category: 'container', container_item_id: 'bag' },
  { id: 'potion', name: 'Pozione', category: 'consumable', container_item_id: 'bag', qty: 2 },
  { id: 'focus', name: 'Cristallo', category: 'gear', is_magic: true, container_item_id: 'pouch' },
  { id: 'sword', name: 'Spada', category: 'weapon' },
  { id: 'armor', name: 'Corazza', category: 'armor', equipped: true, equip_slots: ['torso'] }
];
describe('container navigation and persistent filters', () => {
  it('shows containers as navigable cards and keeps them present in the table', () => {
    const view = getContainerView(items);
    expect(view.containers.map(item => item.id)).toEqual([EQUIPPED_CONTAINER_ID, 'bag']);
    expect(view.items.map(item => item.id)).toEqual(['bag', 'sword']);
    expect(buildContainerCatalog(view)).toContain('data-open-container="bag"');
  });
  it('groups equipped items in a virtual container and removes them from loose locations', () => {
    const root = getContainerView(items);
    const equipped = getContainerView(items, {}, EQUIPPED_CONTAINER_ID);
    expect(root.items.map(item => item.id)).not.toContain('armor');
    expect(equipped.container).toMatchObject({ name: 'Equipaggiati', isVirtual: true });
    expect(equipped.trail.map(item => item.name)).toEqual(['Equipaggiati']);
    expect(equipped.items.map(item => item.id)).toEqual(['armor']);
    const html = buildContainerCatalog(equipped);
    expect(html).toContain('Oggetti equipaggiati');
    expect(html).toContain('Tutti gli oggetti');
    expect(html).toContain('aria-current="page">Equipaggiati');
    expect(html).toContain('data-equip-container');
    expect(html).toContain('data-unequip-item="armor"');
    expect(html).not.toContain('Carico trasportato');
    expect(html).not.toContain('data-extract-item');
  });
  it('keeps filters active inside the equipped group', () => {
    expect(getContainerView(items, { category: 'weapon' }, EQUIPPED_CONTAINER_ID).items).toEqual([]);
    expect(getContainerView(items, { term: 'corazza' }, EQUIPPED_CONTAINER_ID).items.map(item => item.id)).toEqual(['armor']);
  });
  it('combines multiple selected categories and counts only matching container contents', () => {
    const equippedHierarchy = [
      { id: 'pack', name: 'Zaino', category: 'container', equip_slots: ['back'] },
      { id: 'potion', name: 'Pozione', category: 'consumable', container_item_id: 'pack' },
      { id: 'gem', name: 'Gemma', category: 'loot', container_item_id: 'pack' },
      { id: 'book', name: 'Libro', category: 'gear', container_item_id: 'pack' }
    ];
    const view = getContainerView(equippedHierarchy, { categories: ['consumable', 'loot'] }, EQUIPPED_CONTAINER_ID);
    expect(view.items[0]).toMatchObject({ id: 'pack', containedItemCount: 3, visibleContainedItemCount: 2 });
    expect(buildContainerCatalog(view)).toContain('2 oggetti');
  });
  it('keeps an ancestor visible when a nested item matches the search', () => {
    expect(getContainerView(items, { term: 'cristallo' }).containers.map(item => item.id)).toEqual(['bag']);
    const bag = getContainerView(items, { term: 'cristallo' }, 'bag');
    expect(bag.items.map(item => item.id)).toEqual(['pouch']); expect(bag.containers.map(item => item.id)).toEqual(['pouch']);
    expect(getContainerView(items, { term: 'cristallo' }, 'pouch').items.map(item => item.id)).toEqual(['focus']);
  });
  it('applies category and magic filters inside the current container', () => {
    expect(getContainerView(items, { category: 'consumable' }, 'bag').items.map(item => item.id)).toEqual(['potion']);
    expect(getContainerView(items, { category: 'weapon' }, 'bag').items).toEqual([]);
    expect(getContainerView(items, { magicOnly: true }, 'pouch').items.map(item => item.id)).toEqual(['focus']);
    expect(getContainerView(items, { magicOnly: true }, 'bag').items.map(item => item.id)).toEqual(['pouch']);
  });
  it('builds nested breadcrumbs and exposes extraction only inside a container', () => {
    const nested = getContainerView(items, {}, 'pouch');
    expect(nested.trail.map(item => item.id)).toEqual(['bag', 'pouch']);
    expect(buildContainerCatalog(nested)).toContain('data-extract-item="focus"');
    expect(buildContainerCatalog(nested)).toContain('container-breadcrumb--prominent');
    expect(buildContainerCatalog(nested)).not.toContain('inventory-hierarchy-back');
    expect(buildContainerCatalog(getContainerView(items))).not.toContain('data-extract-item');
    expect(getContainerView(items, {}, 'deleted').container).toBeNull();
  });
  it('terminates when imported data contains a containment cycle', () => {
    const cyclic = [{ id: 'a', name: 'A', category: 'container', container_item_id: 'b' }, { id: 'b', name: 'B', category: 'container', container_item_id: 'a' }];
    expect(getContainerView(cyclic, { term: 'missing' }, 'a').containers).toEqual([]);
  });
  it('keeps the equipped container reachable even when it is empty', () => {
    const view = getContainerView([{ id: 'rope', name: 'Corda', category: 'gear' }]);
    expect(view.containers[0]).toMatchObject({ id: EQUIPPED_CONTAINER_ID, childCount: 0 });
  });
  it('keeps Equipaggiati in the breadcrumb when navigating inside an equipped container', () => {
    const equippedHierarchy = [
      { id: 'pack', name: 'Zaino equipaggiato', category: 'container', equipable: true, equip_slots: ['back'] },
      { id: 'pouch', name: 'Tasca', category: 'container', container_item_id: 'pack' },
      { id: 'gem', name: 'Gemma', category: 'gear', container_item_id: 'pouch' }
    ];
    const view = getContainerView(equippedHierarchy, {}, 'pouch');
    expect(view.trail.map((item) => item.name)).toEqual(['Equipaggiati', 'Zaino equipaggiato', 'Tasca']);
    const html = buildContainerCatalog(view);
    expect(html.indexOf('>Equipaggiati</button>')).toBeLessThan(html.indexOf('>Zaino equipaggiato</button>'));
    expect(html.indexOf('>Zaino equipaggiato</button>')).toBeLessThan(html.indexOf('>Tasca</button>'));
  });
  it('keeps an equipped container both in the table and as a navigation card', () => {
    const equippedHierarchy = [
      { id: 'pack', name: 'Zaino equipaggiato', category: 'container', equipable: true, equip_slots: ['back'], qty: 1 },
      { id: 'gem', name: 'Gemma', category: 'gear', container_item_id: 'pack', qty: 1 }
    ];
    const view = getContainerView(equippedHierarchy, {}, EQUIPPED_CONTAINER_ID);
    expect(view.containers.map((item) => item.id)).toEqual(['pack']);
    expect(view.items.map((item) => item.id)).toEqual(['pack']);
    const html = buildContainerCatalog(view);
    expect(html).toContain('data-item-preview="pack"');
    expect(html).toContain('data-open-container="pack"');
    expect(html).toContain('inventory-container-card');
  });
  it('shows real container weight while excluding ignored contents from equipped load', () => {
    const equippedHierarchy = [
      { id: 'pack', name: 'Zaino magico', category: 'container', equip_slots: ['back'], qty: 1, weight: 2, ignore_contents_weight: true },
      { id: 'stone', name: 'Pietra', category: 'loot', container_item_id: 'pack', qty: 1, weight: 8 }
    ];
    const root = getContainerView(equippedHierarchy);
    const equipped = root.containers.find((item) => item.id === EQUIPPED_CONTAINER_ID);
    const equippedView = getContainerView(equippedHierarchy, {}, EQUIPPED_CONTAINER_ID);
    expect(equipped.totalWeight).toBe(2);
    expect(equippedView.containers[0].totalWeight).toBe(10);
  });
  it('groups top-level objects by place and preserves the place in nested breadcrumbs', () => {
    const located = [
      { id: 'chest', name: 'Baule', category: 'container', inventory_location: 'Casa', qty: 1 },
      { id: 'book', name: 'Libro', category: 'gear', container_item_id: 'chest', qty: 1 },
      { id: 'torch', name: 'Torcia', category: 'gear', inventory_location: 'Campo', qty: 1 },
      { id: 'rope', name: 'Corda', category: 'gear', qty: 1 }
    ];
    const root = getContainerView(located);
    expect(root.items.map((item) => item.id)).toEqual(['rope']);
    expect(root.containers.map((item) => item.name)).toEqual(['Equipaggiati', 'Casa', 'Campo']);
    const home = getContainerView(located, {}, getLocationContainerId('Casa'));
    expect(home.containers.map((item) => item.id)).toEqual(['chest']);
    expect(getContainerView(located, {}, 'chest').trail.map((item) => item.name)).toEqual(['Casa', 'Baule']);
  });
});
