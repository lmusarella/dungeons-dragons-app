import { supabase } from '../../lib/supabase.js';
import { fetchItems } from '../inventory/inventoryApi.js';
import { addSharedItemsToInventory } from '../inventory/catalogPicker.js';
import { getSharedItemsByIds } from '../library/itemLibraryApi.js';
import { createTransaction, fetchTransactions } from '../wallet/walletApi.js';
import { updateCharacter } from '../character/characterApi.js';
import { fetchBundleContents } from './bundleApi.js';
import { buildSources, cpToCoins } from './startingEquipmentModel.js';

const VIEW = 'shared_starting_equipment_catalog';
const cache = new Map();
export const STARTING_EQUIPMENT_REASON = 'Equipaggiamento iniziale';

/** Dotazione di una classe o di un background, sempre per UUID (mai per nome). */
export function fetchStartingEquipment({ classId = null, backgroundId = null } = {}) {
  const requests = [['shared_class_id', classId], ['shared_background_id', backgroundId]].filter(([, id]) => id);
  const key = requests.map(([column, id]) => `${column}:${id}`).join('|');
  if (!key) return Promise.resolve([]);
  if (!cache.has(key)) {
    cache.set(key, Promise.all(requests.map(async ([column, id]) => {
      const { data, error } = await supabase.from(VIEW).select('*').eq(column, id);
      if (error) throw error;
      return data || [];
    })).then((lists) => attachBundleContents(buildSources(lists.flat()))).catch((error) => { cache.delete(key); throw error; }));
  }
  return cache.get(key);
}

/** Aggiunge a ogni voce-oggetto i contenuti della dotazione (vista shared_item_bundle_catalog, per UUID). */
async function attachBundleContents(sources) {
  const entries = sources.flatMap((source) => source.groups.flatMap((group) => group.options.flatMap((option) => option.entries))).filter((entry) => entry.kind === 'item');
  if (!entries.length) return sources;
  try {
    const contents = await fetchBundleContents(entries.map((entry) => entry.itemId));
    entries.forEach((entry) => { const list = contents.get(String(entry.itemId)) || []; if (list.length) entry.bundle = list; });
  } catch (error) {
    console.warn('Contenuti delle dotazioni non disponibili', error);
  }
  return sources;
}

export const clearStartingEquipmentCache = () => cache.clear();

/** Registro della dotazione salvato nel personaggio: serve a non riapplicarla e a una futura riconciliazione. */
export function buildStartingEquipmentRecord({ sources, resolution, status = 'pending', selection = {} }) {
  return {
    version: 1,
    status,
    sources: sources.map((source) => ({ source_id: source.sourceId, type: source.type, owner_id: source.ownerId })),
    items: resolution.items.map((entry) => ({ shared_item_id: entry.sharedItemId, quantity: entry.quantity, origins: entry.origins })),
    coins_cp: resolution.coinsCp,
    gold_alternative: Object.keys(selection.goldAlt || {}).filter((id) => selection.goldAlt[id] !== null && selection.goldAlt[id] !== undefined),
    skipped: resolution.skipped.map((entry) => ({ entry_id: entry.entryId, kind: entry.kind, label: entry.label })),
    applied_at: null
  };
}

/**
 * Applica la dotazione una sola volta usando inventario e portafoglio esistenti.
 * - Non equipaggia nulla (gli slot restano vuoti).
 * - Su un nuovo tentativo scala quanto già presente per `shared_item_id` e non riaccredita monete già registrate.
 */
export async function applyStartingEquipmentOnce(character, record) {
  if (!record || record.status === 'applied') return record;
  const failures = [];
  const warnings = [];
  // Le monete non dipendono dagli oggetti: un pacchetto con contenuto mancante non deve bloccarle.
  if (record.coins_cp > 0) {
    try {
      const transactions = await fetchTransactions(character.id).catch(() => []);
      if (!transactions.some((entry) => entry.reason === STARTING_EQUIPMENT_REASON)) {
        await createTransaction({ character_id: character.id, direction: 'receive', amount: cpToCoins(record.coins_cp), reason: STARTING_EQUIPMENT_REASON });
      }
    } catch (error) {
      console.error('Monete iniziali non applicate', error);
      failures.push(`monete: ${error?.message || 'errore'}`);
    }
  }
  let owned = new Map();
  try {
    const existing = await fetchItems(character.id);
    existing.forEach((item) => { if (item.shared_item_id) owned.set(String(item.shared_item_id), (owned.get(String(item.shared_item_id)) || 0) + (Number(item.qty) || 1)); });
  } catch (error) {
    console.error('Inventario non leggibile', error);
    failures.push(`inventario: ${error?.message || 'errore'}`);
    owned = null;
  }
  if (owned) {
    const missing = record.items
      .map((entry) => ({ id: String(entry.shared_item_id), quantity: Math.max(0, entry.quantity - (owned.get(String(entry.shared_item_id)) || 0)) }))
      .filter((entry) => entry.quantity > 0);
    const sharedItems = missing.length ? await getSharedItemsByIds(missing.map((entry) => entry.id)).catch((error) => { failures.push(`oggetti: ${error?.message || 'errore'}`); return []; }) : [];
    const byId = new Map(sharedItems.map((item) => [String(item.id), item]));
    for (const entry of missing) {
      const item = byId.get(entry.id);
      if (!item) { failures.push(`oggetto ${entry.id} non trovato nel catalogo`); continue; }
      try {
        await addSharedItemsToInventory([{ ...item, selected_quantity: entry.quantity }], character, {}, {
          onMissingContents: (pack, names) => warnings.push(`${pack.name}: contenuti non presenti nel catalogo (${names.join(', ')})`)
        });
      } catch (error) {
        console.error('Oggetto iniziale non aggiunto', item.name, error);
        failures.push(`${item.name}: ${error?.message || 'errore'}`);
      }
    }
  }
  const next = failures.length
    ? { ...record, status: 'partial', failures }
    : { ...record, status: 'applied', applied_at: new Date().toISOString(), failures: [], warnings };
  await updateCharacter(character.id, { data: { ...(character.data || {}), starting_equipment: next } });
  if (failures.length) {
    const error = new Error(failures.slice(0, 3).join('; '));
    error.record = next;
    throw error;
  }
  if (warnings.length) {
    console.warn('Equipaggiamento iniziale applicato con contenuti mancanti', warnings);
    next.warnings = warnings;
  }
  return next;
}
