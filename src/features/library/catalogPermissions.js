import { supabase } from '../../lib/supabase.js';

export async function canManageSharedCatalog() {
  try {
    const { data, error } = await supabase.rpc('is_catalog_admin');
    if (error) return false;
    return data === true;
  } catch {
    return false;
  }
}
