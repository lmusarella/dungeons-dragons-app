import { describe, expect, it, vi } from 'vitest';
import {
  averageGoldFromFormula, buildSources, categoryOptions, cpToCoins, formatCoins, resolveEquipment
} from '../../../../src/features/startingEquipment/startingEquipmentModel.js';

let counter = 0;
const row = (overrides = {}) => {
  counter += 1;
  return {
    source_id: 'src-class', source_type: 'class', shared_class_id: 'class-1', shared_background_id: null, rules_version: '2014', owner_name: 'Guerriero',
    gold_alternative: null, group_id: 'g1', group_index: 0, is_choice: false, option_id: 'o1', option_code: 'a', is_mandatory: true,
    entry_id: `e${counter}`, entry_index: counter, entry_type: 'item', source_ref: 'dagger|phb', quantity: 1, currency_cp: null, contained_currency_cp: null,
    match_status: 'matched', shared_item_id: `item-${counter}`, item_name_it: `Oggetto ${counter}`, item_category: 'weapon', raw_entry: {}, ...overrides
  };
};

describe('ricostruzione della gerarchia', () => {
  it('Sorgente → Gruppi → Opzioni → Voci, ordinati e senza duplicare le sorgenti', () => {
    const sources = buildSources([
      row({ group_id: 'g2', group_index: 1, is_choice: true, option_id: 'g2b', option_code: 'b', entry_index: 1 }),
      row({ group_id: 'g2', group_index: 1, is_choice: true, option_id: 'g2a', option_code: 'a', entry_index: 1 }),
      row({ group_id: 'g1', group_index: 0, entry_index: 2 }),
      row({ group_id: 'g1', group_index: 0, entry_index: 1 }),
      row({ source_id: 'src-bg', source_type: 'background', shared_class_id: null, shared_background_id: 'bg-1', rules_version: '2024', group_id: 'bg-g', option_id: 'bg-o' })
    ]);
    expect(sources).toHaveLength(2);
    const classSource = sources.find((source) => source.type === 'class');
    expect(classSource.groups.map((group) => group.groupId)).toEqual(['g1', 'g2']);
    expect(classSource.groups[0].options[0].entries.map((entry) => entry.index)).toEqual([1, 2]);
    expect(classSource.groups[1].options.map((option) => option.code)).toEqual(['a', 'b']);
    expect(classSource.groups[1].isChoice).toBe(true);
    expect(sources.find((source) => source.type === 'background').ownerId).toBe('bg-1');
  });
});

describe('risoluzione della dotazione', () => {
  it('classe 2014 e 2024: oggetti obbligatori con quantità e oggetto di versione diversa dalla sorgente', () => {
    [['2014', 'item-a'], ['2024', 'item-b']].forEach(([version, itemId]) => {
      const sources = buildSources([row({ rules_version: version, shared_item_id: itemId, quantity: 4, entry_id: `x${version}` })]);
      const resolution = resolveEquipment(sources, {});
      expect(resolution.complete).toBe(true);
      expect(resolution.items).toEqual([expect.objectContaining({ sharedItemId: itemId, quantity: 4 })]);
    });
  });

  it('gruppo A/B: una sola alternativa, richiesta finché non scelta', () => {
    const sources = buildSources([
      row({ group_id: 'g', is_choice: true, option_id: 'oa', option_code: 'a', shared_item_id: 'mace', entry_id: 'ea' }),
      row({ group_id: 'g', is_choice: true, option_id: 'ob', option_code: 'b', shared_item_id: 'hammer', entry_id: 'eb' }),
      row({ group_id: 'fixed', group_index: 1, shared_item_id: 'shield', entry_id: 'ec' })
    ]);
    const open = resolveEquipment(sources, {});
    expect(open.complete).toBe(false);
    expect(open.pending[0]).toMatchObject({ kind: 'alternative', groupId: 'g' });
    const chosen = resolveEquipment(sources, { alternatives: { g: 'ob' } });
    expect(chosen.complete).toBe(true);
    expect(chosen.items.map((entry) => entry.sharedItemId).sort()).toEqual(['hammer', 'shield']);
  });

  it('categoria di strumenti: richiede la scelta di un oggetto della categoria corretta', () => {
    const entry = row({ entry_type: 'category', match_status: 'structured', shared_item_id: null, source_ref: 'toolArtisan', raw_entry: { equipmentType: 'toolArtisan' }, entry_id: 'cat' });
    const sources = buildSources([entry]);
    expect(resolveEquipment(sources, {}).pending[0]).toMatchObject({ kind: 'category' });
    const tools = [
      { id: 't1', category: 'tool', tool_subcategory: 'artisan' },
      { id: 't2', category: 'tool', tool_subcategory: 'musical' },
      { id: 'w1', category: 'weapon', weapon_type: 'simple' }
    ];
    expect(categoryOptions('toolArtisan', tools).items.map((item) => item.id)).toEqual(['t1']);
    expect(resolveEquipment(sources, { categoryPicks: { cat: 't1' } }).items).toEqual([expect.objectContaining({ sharedItemId: 't1', quantity: 1 })]);
  });

  it('categoria senza campo discriminante: mostra l’intera categoria come filtro approssimato; non supportata se sconosciuta', () => {
    const items = [{ id: 'a', category: 'weapon', weapon_type: 'martial' }];
    expect(categoryOptions('weaponSimple', items)).toMatchObject({ supported: true, approximate: true, items });
    expect(categoryOptions('unknownThing', items).supported).toBe(false);
  });

  it('monete e alternativa in denaro', () => {
    const sources = buildSources([
      row({ entry_type: 'currency', match_status: 'structured', shared_item_id: null, currency_cp: 1500, entry_id: 'coin', gold_alternative: '5d4 × 10' }),
      row({ shared_item_id: 'sword', entry_id: 'sw', group_id: 'g9', gold_alternative: '5d4 × 10' })
    ]);
    const base = resolveEquipment(sources, {});
    expect(base.coinsCp).toBe(1500);
    expect(formatCoins(1550)).toBe('15 mo 5 ma');
    expect(cpToCoins(1234)).toEqual({ pp: 0, gp: 12, sp: 3, cp: 4 });
    const gold = resolveEquipment(sources, { goldAlt: { 'src-class': 125 } });
    expect(gold.items).toHaveLength(0);
    expect(gold.coinsCp).toBe(12500);
    expect(averageGoldFromFormula('5d4 × 10')).toBe(125);
  });

  it('riferimenti missing/ambiguous/unresolved: non vengono persi e bloccano finché non gestiti esplicitamente', () => {
    const sources = buildSources([
      row({ match_status: 'missing', shared_item_id: null, source_ref: 'holy symbol|phb', entry_id: 'm' }),
      row({ match_status: 'ambiguous', shared_item_id: null, source_ref: 'pack', entry_id: 'a', group_id: 'g2', option_id: 'o2' }),
      row({ match_status: 'unresolved', shared_item_id: null, source_ref: '???', entry_id: 'u', group_id: 'g3', option_id: 'o3' })
    ]);
    const unresolved = resolveEquipment(sources, {});
    expect(unresolved.complete).toBe(false);
    expect(unresolved.anomalies.map((entry) => entry.kind).sort()).toEqual(['ambiguous', 'missing', 'unresolved']);
    expect(unresolved.items).toHaveLength(0);
    const acknowledged = resolveEquipment(sources, { acknowledged: { m: true, a: true, u: true } });
    expect(acknowledged.complete).toBe(true);
    expect(acknowledged.skipped).toHaveLength(3);
  });

  it('classe e background con lo stesso oggetto: quantità complessive con provenienza', () => {
    const sources = buildSources([
      row({ shared_item_id: 'rope', quantity: 1, entry_id: 'r1' }),
      row({ source_id: 'src-bg', source_type: 'background', shared_class_id: null, shared_background_id: 'bg-1', shared_item_id: 'rope', quantity: 2, entry_id: 'r2', group_id: 'bg-g', option_id: 'bg-o' })
    ]);
    const resolution = resolveEquipment(sources, {});
    expect(resolution.items).toHaveLength(1);
    expect(resolution.items[0]).toMatchObject({ sharedItemId: 'rope', quantity: 3 });
    expect(resolution.items[0].origins.map((origin) => origin.sourceType).sort()).toEqual(['background', 'class']);
  });
});

describe('applicazione unica nell’inventario', () => {
  it('riapertura o nuovo tentativo non duplicano oggetti né monete', async () => {
    vi.resetModules();
    const added = [];
    const transactions = [];
    let inventory = [];
    vi.doMock('../../../../src/lib/supabase.js', () => ({ supabase: {} }));
    vi.doMock('../../../../src/features/inventory/inventoryApi.js', () => ({ fetchItems: async () => inventory }));
    vi.doMock('../../../../src/features/inventory/catalogPicker.js', () => ({
      addSharedItemsToInventory: async (items) => { items.forEach((item) => { added.push({ id: item.id, qty: item.selected_quantity }); inventory.push({ shared_item_id: item.id, qty: item.selected_quantity }); }); }
    }));
    vi.doMock('../../../../src/features/library/itemLibraryApi.js', () => ({ getSharedItemsByIds: async (ids) => ids.map((id) => ({ id, name: id })) }));
    vi.doMock('../../../../src/features/wallet/walletApi.js', () => ({
      fetchTransactions: async () => transactions,
      createTransaction: async (payload) => { transactions.push(payload); }
    }));
    vi.doMock('../../../../src/features/character/characterApi.js', () => ({ updateCharacter: async () => ({}) }));
    const { applyStartingEquipmentOnce } = await import('../../../../src/features/startingEquipment/startingEquipmentApi.js');
    const character = { id: 'c1', data: {} };
    const record = { version: 1, status: 'pending', items: [{ shared_item_id: 'rope', quantity: 3 }, { shared_item_id: 'torch', quantity: 2 }], coins_cp: 1500 };
    const applied = await applyStartingEquipmentOnce(character, record);
    expect(applied.status).toBe('applied');
    expect(added).toEqual([{ id: 'rope', qty: 3 }, { id: 'torch', qty: 2 }]);
    expect(transactions).toHaveLength(1);
    expect(transactions[0]).toMatchObject({ direction: 'receive', amount: { gp: 15, sp: 0, cp: 0 } });
    // riapertura: il registro è già "applied"
    await applyStartingEquipmentOnce(character, applied);
    // nuovo tentativo dopo un salvataggio parziale: scala quanto già presente
    await applyStartingEquipmentOnce(character, { ...record, status: 'pending' });
    expect(added).toHaveLength(2);
    expect(transactions).toHaveLength(1);
  });
});
