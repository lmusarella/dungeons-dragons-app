-- RLS hardening for new shared-spells / companions tables
-- Run this after creating tables in docs/supabase-spells-companions-schema.sql

-- 1) shared_spells
alter table public.shared_spells enable row level security;

create table if not exists public.catalog_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.catalog_admins enable row level security;

create or replace function public.is_catalog_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.catalog_admins
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_catalog_admin() from public;
grant execute on function public.is_catalog_admin() to authenticated;

-- Read access for authenticated users (shared catalog)
drop policy if exists shared_spells_select_authenticated on public.shared_spells;
create policy shared_spells_select_authenticated
  on public.shared_spells
  for select
  to authenticated
  using (true);

-- Insert only as an application administrator, preserving authorship.
drop policy if exists shared_spells_insert_own on public.shared_spells;
drop policy if exists shared_spells_insert_admin on public.shared_spells;
create policy shared_spells_insert_admin
  on public.shared_spells
  for insert
  to authenticated
  with check (created_by = auth.uid() and public.is_catalog_admin());

-- Update/delete only by an application administrator.
drop policy if exists shared_spells_update_own on public.shared_spells;
drop policy if exists shared_spells_update_admin on public.shared_spells;
create policy shared_spells_update_admin
  on public.shared_spells
  for update
  to authenticated
  using (public.is_catalog_admin())
  with check (public.is_catalog_admin());

drop policy if exists shared_spells_delete_own on public.shared_spells;
drop policy if exists shared_spells_delete_admin on public.shared_spells;
create policy shared_spells_delete_admin
  on public.shared_spells
  for delete
  to authenticated
  using (public.is_catalog_admin());

-- 2) character_spells
alter table public.character_spells enable row level security;

drop policy if exists character_spells_select_own on public.character_spells;
create policy character_spells_select_own
  on public.character_spells
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists character_spells_insert_own on public.character_spells;
create policy character_spells_insert_own
  on public.character_spells
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.characters c
      where c.id = character_spells.character_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists character_spells_update_own on public.character_spells;
create policy character_spells_update_own
  on public.character_spells
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists character_spells_delete_own on public.character_spells;
create policy character_spells_delete_own
  on public.character_spells
  for delete
  to authenticated
  using (user_id = auth.uid());

-- 3) character_companions
alter table public.character_companions enable row level security;

drop policy if exists character_companions_select_own on public.character_companions;
create policy character_companions_select_own
  on public.character_companions
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists character_companions_insert_own on public.character_companions;
create policy character_companions_insert_own
  on public.character_companions
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.characters c
      where c.id = character_companions.character_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists character_companions_update_own on public.character_companions;
create policy character_companions_update_own
  on public.character_companions
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists character_companions_delete_own on public.character_companions;
create policy character_companions_delete_own
  on public.character_companions
  for delete
  to authenticated
  using (user_id = auth.uid());
