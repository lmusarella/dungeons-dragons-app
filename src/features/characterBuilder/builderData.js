import { supabase } from '../../lib/supabase.js';
import { catalogName } from '../dndCatalog/catalogLocale.js';

const BASE_COLUMNS = 'id,name,name_it,rules_version';
const LIST_COLUMNS = {
  shared_classes: `${BASE_COLUMNS},description,description_it,image_url,source,hit_die`,
  shared_species: `${BASE_COLUMNS},description,description_it,image_url,source,size,speed`,
  shared_backgrounds: `${BASE_COLUMNS},description,description_it,image_url,source`
};
const MISSING_COLUMN = ['42703', 'PGRST204'];

async function listTable(table, version) {
  for (const columns of [LIST_COLUMNS[table], BASE_COLUMNS]) {
    const result = await supabase.from(table).select(columns).eq('rules_version', version)
      .order('name_it', { ascending: true, nullsFirst: false }).order('name', { ascending: true });
    if (!result.error) return (result.data || []).sort((a, b) => catalogName(a).localeCompare(catalogName(b), 'it'));
    if (!MISSING_COLUMN.includes(result.error.code)) throw result.error;
  }
  return [];
}

const optionsCache = new Map();

/** Classi, specie e background di una versione delle regole (colonne leggere, niente dati pesanti). */
export function loadBuilderOptions(version) {
  if (!optionsCache.has(version)) {
    const request = Promise.allSettled([listTable('shared_classes', version), listTable('shared_species', version), listTable('shared_backgrounds', version)])
      .then(([classes, species, backgrounds]) => ({
        classes: classes.status === 'fulfilled' ? classes.value : [],
        species: species.status === 'fulfilled' ? species.value : [],
        backgrounds: backgrounds.status === 'fulfilled' ? backgrounds.value : [],
        errors: [classes, species, backgrounds].filter((entry) => entry.status === 'rejected').length
      }));
    optionsCache.set(version, request);
  }
  return optionsCache.get(version);
}

export async function loadBackgroundRecord(id, version) {
  const { data, error } = await supabase.from('shared_backgrounds').select('*').eq('id', id).eq('rules_version', version).limit(1);
  if (error) throw error;
  return data?.[0] || null;
}
