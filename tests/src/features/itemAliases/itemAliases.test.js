import { describe, expect, it, vi } from 'vitest';
import {
  addOrphanAliases, aliasScope, filterGroups, groupReferences, referencesFromBundles, referencesFromEquipment
} from '../../../../src/features/itemAliases/itemAliasesModel.js';

let counter = 0;
const equipmentRow = (overrides = {}) => {
  counter += 1;
  return {
    source_id: 's', source_type: 'class', owner_name: 'Guerriero', group_id: 'g', group_index: 0, option_id: 'o', option_code: 'a', entry_id: `e${counter}`, entry_index: counter,
    entry_type: 'item', source_ref: 'torch', quantity: 1, match_status: 'missing', shared_item_id: null, item_name_it: null, item_category: null, raw_entry: {}, ...overrides
  };
};
const bundleRow = (overrides = {}) => ({ bundle_id: 'pack', bundle_name_it: 'Dotazione da esploratore', source_ref: 'backpack', quantity: 1, match_status: 'missing', shared_item_id: null, ...overrides });

describe('raggruppamento dei riferimenti', () => {
  it('raggruppa i riferimenti identici e conserva i qualificatori di fonte', () => {
    const refs = [
      ...referencesFromEquipment([equipmentRow(), equipmentRow({ owner_name: 'Ladro' }), equipmentRow({ source_ref: 'dagger|xphb' }), equipmentRow({ source_ref: 'dagger' })]),
      ...referencesFromBundles([bundleRow(), bundleRow({ bundle_name_it: 'Dotazione da scassinatore' })])
    ];
    const groups = groupReferences(refs, []);
    const torch = groups.find((group) => group.ref === 'torch');
    expect(torch).toMatchObject({ occurrences: 2, system: '5etools', status: 'missing' });
    expect(groups.find((group) => group.ref === 'dagger|xphb')).toBeTruthy();
    expect(groups.find((group) => group.ref === 'dagger')).toBeTruthy();
    expect(groups.find((group) => group.ref === 'backpack')).toMatchObject({ system: 'dnd5eapi', occurrences: 2 });
  });

  it('distingue stato collegato/ambiguo, alias globale e voce specifica', () => {
    const refs = referencesFromEquipment([
      equipmentRow({ source_ref: 'rope', match_status: 'matched', shared_item_id: 'corda', item_name_it: 'Corda' }),
      equipmentRow({ source_ref: 'pack', match_status: 'ambiguous' })
    ]);
    const groups = groupReferences(refs, [{ source_system: '5etools', source_key: 'rope', shared_item_id: 'corda' }]);
    const rope = groups.find((group) => group.ref === 'rope');
    expect(rope).toMatchObject({ status: 'linked', itemId: 'corda', itemName: 'Corda' });
    expect(aliasScope(rope, rope.origins[0])).toBe('global');
    expect(groups.find((group) => group.ref === 'pack').status).toBe('ambiguous');
    const withException = groupReferences(referencesFromEquipment([
      equipmentRow({ source_ref: 'rope', match_status: 'matched', shared_item_id: 'corda' }),
      equipmentRow({ source_ref: 'rope', match_status: 'matched', shared_item_id: 'fune' })
    ]), [{ source_system: '5etools', source_key: 'rope', shared_item_id: 'corda' }]);
    expect(withException[0].mixed).toBe(true);
    expect(aliasScope(withException[0], withException[0].origins[1])).toBe('specific');
  });

  it('filtra per fonte, stato, categoria e testo; mostra anche gli alias senza occorrenze', () => {
    const groups = groupReferences([
      ...referencesFromEquipment([equipmentRow({ source_type: 'background', owner_name: 'Accolito' }), equipmentRow({ source_ref: 'rope', match_status: 'matched', shared_item_id: 'corda', item_name_it: 'Corda', item_category: 'gear' })]),
      ...referencesFromBundles([bundleRow()])
    ], []);
    expect(filterGroups(groups, { source: 'background' }).map((group) => group.ref)).toEqual(['torch']);
    expect(filterGroups(groups, { status: 'linked' }).map((group) => group.ref)).toEqual(['rope']);
    expect(filterGroups(groups, { category: 'gear' })).toHaveLength(1);
    expect(filterGroups(groups, { text: 'accolito' }).map((group) => group.ref)).toEqual(['torch']);
    expect(filterGroups(groups, { source: 'bundle' }).map((group) => group.ref)).toEqual(['backpack']);
    const withOrphan = addOrphanAliases(groups, [{ source_system: '5etools', source_key: 'lantern', shared_item_id: 'lanterna' }]);
    expect(withOrphan.find((group) => group.ref === 'lantern')).toMatchObject({ occurrences: 0, status: 'linked' });
  });
});

describe('operazioni sulle associazioni', () => {
  const setup = async () => {
    vi.resetModules();
    const calls = [];
    const cleared = [];
    vi.doMock('../../../../src/lib/supabase.js', () => ({ supabase: { rpc: async (name, args) => { calls.push({ name, args }); return { data: { entries_updated: 3 }, error: null }; } } }));
    vi.doMock('../../../../src/features/startingEquipment/startingEquipmentApi.js', () => ({ clearStartingEquipmentCache: () => cleared.push('equipment') }));
    vi.doMock('../../../../src/features/startingEquipment/bundleApi.js', () => ({ clearBundleCache: () => cleared.push('bundle'), normalizeBundleRow: (row) => ({ ...row }) }));
    vi.doMock('../../../../src/features/dndCatalog/catalogRelations.js', () => ({ clearCatalogRelationsCache: () => cleared.push('relations') }));
    vi.doMock('../../../../src/features/library/itemLibraryApi.js', () => ({ searchSharedItems: async ({ query }) => ({ items: [{ id: 'torcia-id', name: 'Torcia', query }], total: 1 }) }));
    return { calls, cleared, api: await import('../../../../src/features/itemAliases/itemAliasesApi.js') };
  };

  it('torch → Torcia: salva l’alias per UUID e invalida le cache', async () => {
    const { api, calls, cleared } = await setup();
    const [torcia] = await api.searchItemsForAlias('torc');
    expect(torcia.id).toBe('torcia-id');
    await api.saveAlias('5etools', 'torch', torcia.id);
    expect(calls[0]).toEqual({ name: 'admin_save_item_alias', args: { p_source_system: '5etools', p_source_key: 'torch', p_shared_item_id: 'torcia-id' } });
    expect(cleared).toEqual(expect.arrayContaining(['equipment', 'bundle', 'relations']));
  });

  it('modifica di un collegamento errato e rimozione usano le RPC protette', async () => {
    const { api, calls } = await setup();
    await api.saveAlias('dnd5eapi', 'backpack', 'zaino-corretto');
    await api.deleteAlias('dnd5eapi', 'backpack');
    expect(calls.map((call) => call.name)).toEqual(['admin_save_item_alias', 'admin_delete_item_alias']);
    expect(calls[0].args).toMatchObject({ p_source_system: 'dnd5eapi', p_shared_item_id: 'zaino-corretto' });
  });

  it('voce mancante dell’equipaggiamento di una classe: collegamento solo della singola voce', async () => {
    const { api, calls } = await setup();
    await api.setEntryItem('entry-1', 'torcia-id');
    await api.clearEntryItem('entry-1');
    expect(calls).toEqual([
      { name: 'admin_set_entry_item', args: { p_entry_id: 'entry-1', p_shared_item_id: 'torcia-id' } },
      { name: 'admin_clear_entry_item', args: { p_entry_id: 'entry-1' } }
    ]);
  });

  it('dopo il collegamento la voce della classe risulta risolta (stesso modello del compendio)', async () => {
    const { buildSources, resolveEquipment } = await import('../../../../src/features/startingEquipment/startingEquipmentModel.js');
    const base = { source_id: 's', source_type: 'class', shared_class_id: 'c', group_id: 'g', group_index: 0, is_choice: false, option_id: 'o', option_code: 'a', entry_id: 'e1', entry_index: 1, entry_type: 'item', source_ref: 'torch', quantity: 10 };
    const before = resolveEquipment(buildSources([{ ...base, match_status: 'missing', shared_item_id: null }]), {});
    expect(before.complete).toBe(false);
    const after = resolveEquipment(buildSources([{ ...base, match_status: 'matched', shared_item_id: 'torcia-id', item_name_it: 'Torcia' }]), {});
    expect(after.complete).toBe(true);
    expect(after.items).toEqual([expect.objectContaining({ sharedItemId: 'torcia-id', quantity: 10 })]);
  });
});
