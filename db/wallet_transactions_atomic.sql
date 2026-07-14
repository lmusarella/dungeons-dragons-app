-- Applica saldo e registro del denaro nella stessa transazione PostgreSQL.
-- Eseguire nel SQL Editor di Supabase prima di distribuire il client aggiornato.

create or replace function public.apply_money_transaction(
  p_character_id text,
  p_direction text,
  p_amount jsonb,
  p_reason text default null,
  p_occurred_on date default current_date
)
returns public.wallets
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_character public.characters%rowtype;
  v_wallet public.wallets;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;
  if p_direction not in ('pay', 'receive') then
    raise exception 'Invalid transaction direction';
  end if;
  select * into v_character
  from public.characters
  where id::text = p_character_id and user_id = auth.uid();
  if not found then
    raise exception 'Character not found or not owned by current user';
  end if;

  insert into public.wallets (character_id, user_id, cp, sp, gp, pp, updated_at)
  values (
    v_character.id,
    auth.uid(),
    coalesce((p_amount ->> 'cp')::numeric, 0),
    coalesce((p_amount ->> 'sp')::numeric, 0),
    coalesce((p_amount ->> 'gp')::numeric, 0),
    coalesce((p_amount ->> 'pp')::numeric, 0),
    now()
  )
  on conflict (character_id) do update set
    cp = public.wallets.cp + excluded.cp,
    sp = public.wallets.sp + excluded.sp,
    gp = public.wallets.gp + excluded.gp,
    pp = public.wallets.pp + excluded.pp,
    updated_at = now()
  where public.wallets.user_id = auth.uid()
  returning * into v_wallet;

  if v_wallet.character_id is null then
    raise exception 'Wallet not found or not owned by current user';
  end if;

  insert into public.money_transactions (
    user_id, character_id, direction, amount, reason, occurred_on
  ) values (
    auth.uid(), v_character.id, p_direction, p_amount, p_reason,
    coalesce(p_occurred_on, current_date)
  );

  return v_wallet;
end;
$$;

create or replace function public.update_money_transaction_atomic(
  p_transaction_id text,
  p_direction text,
  p_amount jsonb,
  p_reason text default null,
  p_occurred_on date default current_date
)
returns public.wallets
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_transaction public.money_transactions%rowtype;
  v_previous_amount jsonb;
  v_wallet public.wallets;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;
  if p_direction not in ('pay', 'receive') then
    raise exception 'Invalid transaction direction';
  end if;

  select * into v_transaction
  from public.money_transactions
  where id::text = p_transaction_id and user_id = auth.uid()
  for update;
  if not found then
    raise exception 'Transaction not found or not owned by current user';
  end if;
  v_previous_amount := v_transaction.amount::jsonb;

  update public.wallets set
    cp = cp - coalesce((v_previous_amount ->> 'cp')::numeric, 0) + coalesce((p_amount ->> 'cp')::numeric, 0),
    sp = sp - coalesce((v_previous_amount ->> 'sp')::numeric, 0) + coalesce((p_amount ->> 'sp')::numeric, 0),
    gp = gp - coalesce((v_previous_amount ->> 'gp')::numeric, 0) + coalesce((p_amount ->> 'gp')::numeric, 0),
    pp = pp - coalesce((v_previous_amount ->> 'pp')::numeric, 0) + coalesce((p_amount ->> 'pp')::numeric, 0),
    updated_at = now()
  where character_id = v_transaction.character_id and user_id = auth.uid()
  returning * into v_wallet;
  if not found then
    raise exception 'Wallet not found or not owned by current user';
  end if;

  update public.money_transactions set
    direction = p_direction,
    amount = p_amount,
    reason = p_reason,
    occurred_on = coalesce(p_occurred_on, current_date)
  where id::text = p_transaction_id and user_id = auth.uid();

  return v_wallet;
end;
$$;

create or replace function public.delete_money_transaction_atomic(p_transaction_id text)
returns public.wallets
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_transaction public.money_transactions%rowtype;
  v_amount jsonb;
  v_wallet public.wallets;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select * into v_transaction
  from public.money_transactions
  where id::text = p_transaction_id and user_id = auth.uid()
  for update;
  if not found then
    raise exception 'Transaction not found or not owned by current user';
  end if;
  v_amount := v_transaction.amount::jsonb;

  update public.wallets set
    cp = cp - coalesce((v_amount ->> 'cp')::numeric, 0),
    sp = sp - coalesce((v_amount ->> 'sp')::numeric, 0),
    gp = gp - coalesce((v_amount ->> 'gp')::numeric, 0),
    pp = pp - coalesce((v_amount ->> 'pp')::numeric, 0),
    updated_at = now()
  where character_id = v_transaction.character_id and user_id = auth.uid()
  returning * into v_wallet;
  if not found then
    raise exception 'Wallet not found or not owned by current user';
  end if;

  delete from public.money_transactions
  where id::text = p_transaction_id and user_id = auth.uid();

  return v_wallet;
end;
$$;

revoke all on function public.apply_money_transaction(text, text, jsonb, text, date) from public;
revoke all on function public.update_money_transaction_atomic(text, text, jsonb, text, date) from public;
revoke all on function public.delete_money_transaction_atomic(text) from public;
grant execute on function public.apply_money_transaction(text, text, jsonb, text, date) to authenticated;
grant execute on function public.update_money_transaction_atomic(text, text, jsonb, text, date) to authenticated;
grant execute on function public.delete_money_transaction_atomic(text) to authenticated;

notify pgrst, 'reload schema';
select pg_notify('pgrst', 'reload schema');
