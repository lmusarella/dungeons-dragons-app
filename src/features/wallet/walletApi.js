import { supabase } from '../../lib/supabase.js';

export async function fetchWallet(characterId) {
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('character_id', characterId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data ?? null;
}

export async function upsertWallet(payload) {
  const { data, error } = await supabase
    .from('wallets')
    .upsert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function createTransaction(payload) {
  const { data, error } = await supabase
    .rpc('apply_money_transaction', {
      p_character_id: String(payload.character_id),
      p_direction: payload.direction,
      p_amount: payload.amount,
      p_reason: payload.reason || null,
      p_occurred_on: payload.occurred_on || null
    })
    .single();
  if (error) throw error;
  return data;
}

export async function fetchTransactions(characterId) {
  const { data, error } = await supabase
    .from('money_transactions')
    .select('*')
    .eq('character_id', characterId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function updateTransaction(id, payload) {
  const { data, error } = await supabase
    .rpc('update_money_transaction_atomic', {
      p_transaction_id: String(id),
      p_direction: payload.direction,
      p_amount: payload.amount,
      p_reason: payload.reason || null,
      p_occurred_on: payload.occurred_on || null
    })
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTransaction(id) {
  const { data, error } = await supabase
    .rpc('delete_money_transaction_atomic', { p_transaction_id: String(id) })
    .single();
  if (error) throw error;
  return data;
}
