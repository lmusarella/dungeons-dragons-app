-- Profilazione e policy del catalogo centralizzato.
-- Tutti gli utenti autenticati possono leggere i contenuti.
-- Soltanto gli amministratori possono creare, modificare o eliminare contenuti condivisi.

create table if not exists public.catalog_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.catalog_admins enable row level security;

-- Nessuna policy di scrittura: la tabella si gestisce dallo SQL editor o con service_role.
drop policy if exists catalog_admins_select_own on public.catalog_admins;
drop policy if exists catalog_admins_insert_own on public.catalog_admins;
drop policy if exists catalog_admins_update_own on public.catalog_admins;
drop policy if exists catalog_admins_delete_own on public.catalog_admins;

create or replace function public.is_catalog_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.catalog_admins
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_catalog_admin() from public;
grant execute on function public.is_catalog_admin() to authenticated;

alter table public.shared_spells enable row level security;

drop policy if exists shared_spells_select_authenticated on public.shared_spells;
drop policy if exists shared_spells_insert_own on public.shared_spells;
drop policy if exists shared_spells_insert_admin on public.shared_spells;
drop policy if exists shared_spells_update_own on public.shared_spells;
drop policy if exists shared_spells_delete_own on public.shared_spells;
drop policy if exists shared_spells_update_admin on public.shared_spells;
drop policy if exists shared_spells_delete_admin on public.shared_spells;

create policy shared_spells_select_authenticated
  on public.shared_spells
  for select
  to authenticated
  using (true);

create policy shared_spells_insert_admin
  on public.shared_spells
  for insert
  to authenticated
  with check (created_by = auth.uid() and public.is_catalog_admin());

create policy shared_spells_update_admin
  on public.shared_spells
  for update
  to authenticated
  using (public.is_catalog_admin())
  with check (public.is_catalog_admin());

create policy shared_spells_delete_admin
  on public.shared_spells
  for delete
  to authenticated
  using (public.is_catalog_admin());

alter table public.shared_items enable row level security;

drop policy if exists "Authenticated users can read shared items" on public.shared_items;
drop policy if exists "Authenticated users can create shared items" on public.shared_items;
drop policy if exists "Authenticated users can update shared items" on public.shared_items;
drop policy if exists "Authenticated users can delete shared items" on public.shared_items;
drop policy if exists shared_items_select_authenticated on public.shared_items;
drop policy if exists shared_items_insert_own on public.shared_items;
drop policy if exists shared_items_insert_admin on public.shared_items;
drop policy if exists shared_items_update_admin on public.shared_items;
drop policy if exists shared_items_delete_admin on public.shared_items;

create policy shared_items_select_authenticated
  on public.shared_items
  for select
  to authenticated
  using (true);

create policy shared_items_insert_admin
  on public.shared_items
  for insert
  to authenticated
  with check (created_by = auth.uid() and public.is_catalog_admin());

create policy shared_items_update_admin
  on public.shared_items
  for update
  to authenticated
  using (public.is_catalog_admin())
  with check (public.is_catalog_admin());

create policy shared_items_delete_admin
  on public.shared_items
  for delete
  to authenticated
  using (public.is_catalog_admin());

comment on table public.catalog_admins is 'Utenti autorizzati a modificare ed eliminare il catalogo centralizzato.';
comment on function public.is_catalog_admin() is 'Indica se l utente autenticato puo gestire il catalogo centralizzato.';

notify pgrst, 'reload schema';
select pg_notify('pgrst', 'reload schema');

-- Dopo aver eseguito lo script, assegna esplicitamente il ruolo agli amministratori:
-- insert into public.catalog_admins (user_id) values ('<UUID_UTENTE>') on conflict do nothing;
