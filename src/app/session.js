import { supabase } from '../lib/supabase.js';
import { clearStoredActiveCharacterIds, getState, resetSessionState, setState } from './state.js';
import { clearLocalCache } from '../lib/offline/cache.js';

export async function initSession() {
  const { data } = await supabase.auth.getSession();
  setState({ user: data.session?.user ?? null });
  supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      setState({ user: session.user });
    } else {
      resetSessionState();
    }
  });
}

export async function ensureProfile(user) {
  if (!user) return;
  await supabase.from('profiles').upsert({
    id: user.id,
    display_name: user.user_metadata?.display_name ?? ''
  });
}

export async function signOut() {
  const userId = getState().user?.id;
  try {
    await supabase.auth.signOut();
  } finally {
    clearStoredActiveCharacterIds(userId);
    await clearLocalCache();
    resetSessionState();
  }
}
