import { describe, expect, it, vi } from 'vitest';
import { normalizeBundleRow } from '../../../../src/features/startingEquipment/bundleApi.js';
import { renderBundleSection } from '../../../../src/features/startingEquipment/bundleView.js';

describe('contenuti delle dotazioni', () => {
  it('normalizza le righe della vista e distingue gli oggetti collegati dai missing', () => {
    const linked = normalizeBundleRow({ bundle_id: 'pack', entry_index: 2, quantity: 3, shared_item_id: 'torch-id', item_name_it: 'Torcia', match_status: 'matched' });
    const missing = normalizeBundleRow({ bundle_id: 'pack', entry_index: 1, quantity: 1, shared_item_id: null, source_ref: 'bedroll|phb', match_status: 'missing' });
    expect(linked).toMatchObject({ bundleId: 'pack', quantity: 3, itemId: 'torch-id', name: 'Torcia', linked: true });
    expect(missing).toMatchObject({ linked: false, matchStatus: 'missing' });
  });

  it('mostra nome italiano e quantità, e non perde le voci non collegate', () => {
    const html = renderBundleSection([
      { itemId: 'torch-id', name: 'Torcia', quantity: 10, linked: true, sourceRef: '' },
      { itemId: null, name: '', quantity: 1, linked: false, sourceRef: 'bedroll|phb' }
    ]);
    expect(html).toContain('data-bundle-item="torch-id"');
    expect(html).toContain('Torcia ×10');
    expect(html).toContain('bedroll');
    expect(html).toContain('non collegato al catalogo');
  });
});

describe('inserimento di una dotazione in inventario', () => {
  it('usa la vista per UUID, include i contenuti collegati e segnala i missing senza errore', async () => {
    vi.resetModules();
    const created = [];
    vi.doMock('../../../../src/lib/supabase.js', () => ({ supabase: {} }));
    vi.doMock('../../../../src/features/startingEquipment/bundleApi.js', () => ({
      fetchBundleContents: async () => new Map([['pack', [
        { itemId: 'rope', name: 'Corda', quantity: 1, linked: true, sourceRef: '' },
        { itemId: 'torch', name: 'Torcia', quantity: 10, linked: true, sourceRef: '' },
        { itemId: null, name: '', quantity: 1, linked: false, sourceRef: 'bedroll|phb' }
      ]]])
    }));
    vi.doMock('../../../../src/features/library/itemLibraryApi.js', () => ({
      searchSharedItems: async () => ({ items: [], total: 0 }),
      getSharedItemsByIds: async (ids) => ids.map((id) => ({ id, name: id, category: 'gear' }))
    }));
    vi.doMock('../../../../src/features/inventory/inventoryApi.js', () => ({
      createItem: async (payload) => { const row = { id: `row-${created.length}`, ...payload }; created.push(row); return row; },
      createItems: async (payloads) => payloads.map((payload) => { const row = { id: `row-${created.length}`, ...payload }; created.push(row); return row; })
    }));
    vi.doMock('../../../../src/features/character/home/itemDetail.js', () => ({ openEquipmentItemDetail: () => {} }));
    const { addSharedItemsToInventory } = await import('../../../../src/features/inventory/catalogPicker.js');
    const missing = [];
    await addSharedItemsToInventory([{ id: 'pack', name: 'Dotazione da esploratore', category: 'gear' }], { id: 'c1', user_id: 'u1' }, {}, { onMissingContents: (pack, names) => missing.push(...names) });
    const container = created.find((row) => row.shared_item_id === 'pack');
    expect(container).toMatchObject({ category: 'container' });
    const children = created.filter((row) => row.container_item_id === container.id);
    expect(children.map((row) => [row.shared_item_id, row.qty])).toEqual([['rope', 1], ['torch', 10]]);
    expect(missing).toHaveLength(1);
  });
});
