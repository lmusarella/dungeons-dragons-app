-- Gestione amministrativa dei collegamenti tra riferimenti originali (5etools / dnd5eapi) e shared_items.
--
-- Prerequisiti: public.is_catalog_admin() (db/admin_shared_catalog_rls.sql) e le tabelle
--   shared_item_aliases(source_system, source_key, shared_item_id, ...)
--   shared_starting_equipment_entries(id, source_ref, shared_item_id, match_status, ...)
-- Le tabelle restano in sola lettura per gli utenti autenticati: la scrittura passa SOLO da queste RPC
-- (SECURITY DEFINER, controllo is_catalog_admin(), transazionali). Nessuna service_role nel browser.
--
-- Tracciabilita':
--   * shared_item_aliases.is_manual / updated_by / updated_at   -> gli alias creati qui sono "manuali";
--   * shared_starting_equipment_entries.manual_link / linked_by / linked_at -> voci collegate a mano;
--   * shared_item_link_audit -> storico di ogni modifica.
-- Le importazioni devono NON sovrascrivere le righe con manual_link = true e gli alias con is_manual = true.

alter table public.shared_item_aliases
  add column if not exists is_manual boolean not null default false,
  add column if not exists updated_by uuid,
  add column if not exists updated_at timestamptz default now();

alter table public.shared_starting_equipment_entries
  add column if not exists manual_link boolean not null default false,
  add column if not exists linked_by uuid,
  add column if not exists linked_at timestamptz;

create table if not exists public.shared_item_link_audit (
  id bigint generated always as identity primary key,
  action text not null,
  source_system text,
  source_key text,
  entry_id uuid,
  old_item_id uuid,
  new_item_id uuid,
  affected integer not null default 0,
  changed_by uuid default auth.uid(),
  changed_at timestamptz not null default now()
);

alter table public.shared_item_link_audit enable row level security;
drop policy if exists shared_item_link_audit_select_admin on public.shared_item_link_audit;
create policy shared_item_link_audit_select_admin
  on public.shared_item_link_audit for select to authenticated
  using (public.is_catalog_admin());

create or replace function public.admin_save_item_alias(p_source_system text, p_source_key text, p_shared_item_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old uuid;
  v_entries integer := 0;
  v_existing boolean;
begin
  if not public.is_catalog_admin() then
    raise exception 'Permission denied' using errcode = '42501';
  end if;
  if p_source_system not in ('5etools', 'dnd5eapi') then
    raise exception 'Invalid source_system %', p_source_system;
  end if;
  if coalesce(trim(p_source_key), '') = '' then
    raise exception 'source_key required';
  end if;
  if not exists (select 1 from public.shared_items where id = p_shared_item_id) then
    raise exception 'shared_item % not found', p_shared_item_id;
  end if;

  select shared_item_id into v_old
  from public.shared_item_aliases
  where source_system = p_source_system and source_key = p_source_key;
  v_existing := found;

  if v_existing then
    update public.shared_item_aliases
    set shared_item_id = p_shared_item_id, is_manual = true, updated_by = auth.uid(), updated_at = now()
    where source_system = p_source_system and source_key = p_source_key;
  else
    insert into public.shared_item_aliases (source_system, source_key, shared_item_id, is_manual, updated_by, updated_at)
    values (p_source_system, p_source_key, p_shared_item_id, true, auth.uid(), now());
  end if;

  -- Propagazione alle dotazioni di classi/background: solo righe non risolte (o collegate dal vecchio alias),
  -- mai quelle confermate a mano. Quantita', gruppi, alternative e monete non vengono toccati.
  if p_source_system = '5etools' then
    update public.shared_starting_equipment_entries e
    set shared_item_id = p_shared_item_id, match_status = 'matched'
    where lower(e.source_ref) = lower(p_source_key)
      and coalesce(e.manual_link, false) = false
      and (
        e.shared_item_id is null
        or e.match_status in ('missing', 'ambiguous', 'unresolved')
        or (v_old is not null and e.shared_item_id = v_old)
      );
    get diagnostics v_entries = row_count;
  end if;

  insert into public.shared_item_link_audit (action, source_system, source_key, old_item_id, new_item_id, affected)
  values (case when v_existing then 'alias_update' else 'alias_create' end, p_source_system, p_source_key, v_old, p_shared_item_id, v_entries);

  return jsonb_build_object('created', not v_existing, 'previous_item_id', v_old, 'entries_updated', v_entries);
end;
$$;

create or replace function public.admin_delete_item_alias(p_source_system text, p_source_key text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old uuid;
  v_entries integer := 0;
begin
  if not public.is_catalog_admin() then
    raise exception 'Permission denied' using errcode = '42501';
  end if;
  select shared_item_id into v_old
  from public.shared_item_aliases
  where source_system = p_source_system and source_key = p_source_key;
  if not found then
    return jsonb_build_object('deleted', false, 'entries_updated', 0);
  end if;

  delete from public.shared_item_aliases where source_system = p_source_system and source_key = p_source_key;

  if p_source_system = '5etools' then
    update public.shared_starting_equipment_entries e
    set shared_item_id = null, match_status = 'missing'
    where lower(e.source_ref) = lower(p_source_key)
      and coalesce(e.manual_link, false) = false
      and e.shared_item_id = v_old;
    get diagnostics v_entries = row_count;
  end if;

  insert into public.shared_item_link_audit (action, source_system, source_key, old_item_id, affected)
  values ('alias_delete', p_source_system, p_source_key, v_old, v_entries);

  return jsonb_build_object('deleted', true, 'entries_updated', v_entries);
end;
$$;

create or replace function public.admin_set_entry_item(p_entry_id uuid, p_shared_item_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old uuid;
begin
  if not public.is_catalog_admin() then
    raise exception 'Permission denied' using errcode = '42501';
  end if;
  if not exists (select 1 from public.shared_items where id = p_shared_item_id) then
    raise exception 'shared_item % not found', p_shared_item_id;
  end if;
  select shared_item_id into v_old from public.shared_starting_equipment_entries where id = p_entry_id;
  if not found then
    raise exception 'entry % not found', p_entry_id;
  end if;
  update public.shared_starting_equipment_entries
  set shared_item_id = p_shared_item_id, match_status = 'matched', manual_link = true, linked_by = auth.uid(), linked_at = now()
  where id = p_entry_id;
  insert into public.shared_item_link_audit (action, entry_id, old_item_id, new_item_id, affected)
  values ('entry_set', p_entry_id, v_old, p_shared_item_id, 1);
  return jsonb_build_object('entry_id', p_entry_id, 'previous_item_id', v_old);
end;
$$;

create or replace function public.admin_clear_entry_item(p_entry_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old uuid;
begin
  if not public.is_catalog_admin() then
    raise exception 'Permission denied' using errcode = '42501';
  end if;
  select shared_item_id into v_old from public.shared_starting_equipment_entries where id = p_entry_id;
  if not found then
    raise exception 'entry % not found', p_entry_id;
  end if;
  update public.shared_starting_equipment_entries
  set shared_item_id = null, match_status = 'missing', manual_link = false, linked_by = auth.uid(), linked_at = now()
  where id = p_entry_id;
  insert into public.shared_item_link_audit (action, entry_id, old_item_id, affected)
  values ('entry_clear', p_entry_id, v_old, 1);
  return jsonb_build_object('entry_id', p_entry_id, 'previous_item_id', v_old);
end;
$$;

revoke all on function public.admin_save_item_alias(text, text, uuid) from public;
revoke all on function public.admin_delete_item_alias(text, text) from public;
revoke all on function public.admin_set_entry_item(uuid, uuid) from public;
revoke all on function public.admin_clear_entry_item(uuid) from public;
grant execute on function public.admin_save_item_alias(text, text, uuid) to authenticated;
grant execute on function public.admin_delete_item_alias(text, text) to authenticated;
grant execute on function public.admin_set_entry_item(uuid, uuid) to authenticated;
grant execute on function public.admin_clear_entry_item(uuid) to authenticated;

notify pgrst, 'reload schema';
