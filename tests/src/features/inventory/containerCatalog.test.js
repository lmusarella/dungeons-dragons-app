import { describe, it, expect } from 'vitest';
import { getContainerView, buildContainerCatalog, EQUIPPED_CONTAINER_ID } from '../../../../src/features/inventory/containerCatalog.js';
const items = [
  { id: 'bag', name: 'Zaino', category: 'container' },
  { id: 'pouch', name: 'Borsa piccola', category: 'container', container_item_id: 'bag' },
  { id: 'potion', name: 'Pozione', category: 'consumable', container_item_id: 'bag', qty: 2 },
  { id: 'focus', name: 'Cristallo', category: 'gear', is_magic: true, container_item_id: 'pouch' },
  { id: 'sword', name: 'Spada', category: 'weapon' },
  { id: 'armor', name: 'Corazza', category: 'armor', equipped: true, equip_slots: ['torso'] }
];
describe('container navigation and persistent filters', () => {
  it('shows containers as cards and keeps their contents out of the loose table', () => {
    const view = getContainerView(items);
    expect(view.containers.map(item => item.id)).toEqual([EQUIPPED_CONTAINER_ID, 'bag']);
    expect(view.items.map(item => item.id)).toEqual(['sword']);
    expect(buildContainerCatalog(view)).toContain('data-open-container="bag"');
  });
  it('groups equipped items in a virtual container and removes them from loose locations', () => {
    const root = getContainerView(items);
    const equipped = getContainerView(items, {}, EQUIPPED_CONTAINER_ID);
    expect(root.items.map(item => item.id)).not.toContain('armor');
    expect(equipped.container).toMatchObject({ name: 'Equipaggiati', isVirtual: true });
    expect(equipped.items.map(item => item.id)).toEqual(['armor']);
    expect(buildContainerCatalog(equipped)).toContain('Oggetti equipaggiati');
    expect(buildContainerCatalog(equipped)).not.toContain('data-extract-item');
  });
  it('keeps filters active inside the equipped group', () => {
    expect(getContainerView(items, { category: 'weapon' }, EQUIPPED_CONTAINER_ID).items).toEqual([]);
    expect(getContainerView(items, { term: 'corazza' }, EQUIPPED_CONTAINER_ID).items.map(item => item.id)).toEqual(['armor']);
  });
  it('keeps an ancestor visible when a nested item matches the search', () => {
    expect(getContainerView(items, { term: 'cristallo' }).containers.map(item => item.id)).toEqual(['bag']);
    const bag = getContainerView(items, { term: 'cristallo' }, 'bag');
    expect(bag.items).toEqual([]); expect(bag.containers.map(item => item.id)).toEqual(['pouch']);
    expect(getContainerView(items, { term: 'cristallo' }, 'pouch').items.map(item => item.id)).toEqual(['focus']);
  });
  it('applies category and magic filters inside the current container', () => {
    expect(getContainerView(items, { category: 'consumable' }, 'bag').items.map(item => item.id)).toEqual(['potion']);
    expect(getContainerView(items, { category: 'weapon' }, 'bag').items).toEqual([]);
    expect(getContainerView(items, { magicOnly: true }, 'pouch').items.map(item => item.id)).toEqual(['focus']);
    expect(getContainerView(items, { magicOnly: true }, 'bag').items).toEqual([]);
  });
  it('builds nested breadcrumbs and exposes extraction only inside a container', () => {
    const nested = getContainerView(items, {}, 'pouch');
    expect(nested.trail.map(item => item.id)).toEqual(['bag', 'pouch']);
    expect(buildContainerCatalog(nested)).toContain('data-extract-item="focus"');
    expect(buildContainerCatalog(getContainerView(items))).not.toContain('data-extract-item');
    expect(getContainerView(items, {}, 'deleted').container).toBeNull();
  });
  it('terminates when imported data contains a containment cycle', () => {
    const cyclic = [{ id: 'a', name: 'A', category: 'container', container_item_id: 'b' }, { id: 'b', name: 'B', category: 'container', container_item_id: 'a' }];
    expect(getContainerView(cyclic, { term: 'missing' }, 'a').containers).toEqual([]);
  });
});
