import { supabase } from '../../lib/supabase.js';
import { searchSharedItems } from '../library/itemLibraryApi.js';
import { clearStartingEquipmentCache } from '../startingEquipment/startingEquipmentApi.js';
import { clearBundleCache } from '../startingEquipment/bundleApi.js';
import { clearCatalogRelationsCache } from '../dndCatalog/catalogRelations.js';
import { addOrphanAliases, groupReferences, referencesFromBundles, referencesFromEquipment } from './itemAliasesModel.js';

const PAGE = 1000;

async function fetchAll(table) {
  const rows = [];
  for (let page = 0; page < 30; page += 1) {
    const { data, error } = await supabase.from(table).select('*').range(page * PAGE, page * PAGE + PAGE - 1);
    if (error) throw error;
    rows.push(...(data || []));
    if ((data || []).length < PAGE) break;
  }
  return rows;
}

/** Carica i riferimenti da dotazioni di classi/background e dai contenuti dei kit, già raggruppati. */
export async function loadReferenceGroups() {
  const [equipment, bundles, aliases] = await Promise.all([
    fetchAll('shared_starting_equipment_catalog'),
    fetchAll('shared_item_bundle_catalog').catch((error) => { console.warn('Vista dei contenuti dei kit non disponibile', error); return []; }),
    fetchAll('shared_item_aliases').catch((error) => { console.warn('Alias non disponibili', error); return []; })
  ]);
  const groups = groupReferences([...referencesFromEquipment(equipment), ...referencesFromBundles(bundles)], aliases);
  return { groups: addOrphanAliases(groups, aliases), aliases };
}

/** Ricerca per autocomplete sugli oggetti esistenti (nessun filtro di versione). */
export async function searchItemsForAlias(query) {
  const result = await searchSharedItems({ query, pageSize: 15 });
  return result.items;
}

export function invalidateCatalogCaches() {
  clearStartingEquipmentCache();
  clearBundleCache();
  clearCatalogRelationsCache();
}

async function callRpc(name, args) {
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw error;
  invalidateCatalogCaches();
  return data;
}

export const saveAlias = (system, key, itemId) => callRpc('admin_save_item_alias', { p_source_system: system, p_source_key: key, p_shared_item_id: itemId });
export const deleteAlias = (system, key) => callRpc('admin_delete_item_alias', { p_source_system: system, p_source_key: key });
export const setEntryItem = (entryId, itemId) => callRpc('admin_set_entry_item', { p_entry_id: entryId, p_shared_item_id: itemId });
export const clearEntryItem = (entryId) => callRpc('admin_clear_entry_item', { p_entry_id: entryId });
