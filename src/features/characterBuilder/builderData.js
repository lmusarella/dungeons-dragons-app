import { supabase } from '../../lib/supabase.js';
import { catalogName } from '../dndCatalog/catalogLocale.js';

const BASE_COLUMNS = 'id,name,name_it,rules_version';
const LIST_COLUMNS = {
  shared_classes: `${BASE_COLUMNS},description,description_it,image_url,source,hit_die`,
  shared_species: `${BASE_COLUMNS},description,description_it,image_url,source,size,speed`,
  shared_backgrounds: `${BASE_COLUMNS},description,description_it,image_url,source`
};
const MISSING_COLUMN = ['42703', 'PGRST204'];

function missingColumnName(error) {
  const text = String(error?.message || '');
  return text.match(/column (?:[\w]+\.)*([a-z_]+) does not exist/i)?.[1] || text.match(/Could not find the '([a-z_]+)' column/i)?.[1] || null;
}

/**
 * Elenco leggero di una tabella. Se una colonna opzionale non esiste nel database, viene tolta dalla select
 * e la richiesta ripetuta: così le altre (source, size, ...) restano disponibili per card e filtri.
 */
async function listTable(table, version) {
  let columns = (LIST_COLUMNS[table] || BASE_COLUMNS).split(',');
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const result = await supabase.from(table).select(columns.join(',')).eq('rules_version', version).order('name', { ascending: true });
    if (!result.error) return (result.data || []).sort((x, y) => catalogName(x).localeCompare(catalogName(y), 'it'));
    const missing = MISSING_COLUMN.includes(result.error.code) ? missingColumnName(result.error) : null;
    if (!missing || !columns.includes(missing) || ['id', 'name', 'rules_version'].includes(missing)) throw result.error;
    console.warn(`Colonna ${table}.${missing} assente: omessa dall'elenco`);
    columns = columns.filter((column) => column !== missing);
  }
  return [];
}

/** Manuali che contribuiscono solo con sottoclassi (es. espansioni): codici distinti della versione. */
async function listSubclassSources(version) {
  const { data, error } = await supabase.from('shared_subclasses').select('source').eq('rules_version', version).range(0, 999);
  if (error) throw error;
  return [...new Set((data || []).map((row) => row.source).filter(Boolean).map(String))];
}

const optionsCache = new Map();

/** Classi, specie e background di una versione delle regole (colonne leggere, niente dati pesanti). */
export function loadBuilderOptions(version) {
  if (!optionsCache.has(version)) {
    const request = Promise.allSettled([listTable('shared_classes', version), listTable('shared_species', version), listTable('shared_backgrounds', version), listSubclassSources(version)])
      .then(([classes, species, backgrounds, subclassSources]) => {
        [classes, species, backgrounds].forEach((entry, index) => { if (entry.status === 'rejected') console.error(`Elenco ${['classi', 'specie', 'background'][index]} non caricato`, entry.reason); });
        const value = (entry) => (entry.status === 'fulfilled' ? entry.value : []);
        const counts = new Map();
        [...value(classes), ...value(species), ...value(backgrounds)].forEach((row) => { if (row.source) counts.set(String(row.source), (counts.get(String(row.source)) || 0) + 1); });
        value(subclassSources).forEach((code) => { if (!counts.has(code)) counts.set(code, 0); });
        return {
          classes: value(classes), species: value(species), backgrounds: value(backgrounds),
          availableSources: [...counts.entries()].map(([code, count]) => ({ code, count })).sort((a, b) => a.code.localeCompare(b.code)),
          errors: [classes, species, backgrounds].filter((entry) => entry.status === 'rejected').length
        };
      });
    optionsCache.set(version, request);
  }
  return optionsCache.get(version);
}

export async function loadBackgroundRecord(id, version) {
  const { data, error } = await supabase.from('shared_backgrounds').select('*').eq('id', id).eq('rules_version', version).limit(1);
  if (error) throw error;
  return data?.[0] || null;
}
