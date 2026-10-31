-- Catalogo centralizzato degli oggetti. Eseguire nello SQL editor di Supabase.
create table if not exists public.shared_items (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references auth.users(id) on delete set null,
  name text not null,
  category text not null default 'gear',
  rules_version text not null default '2024',
  image_url text,
  description text,
  item_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists shared_items_name_category_rules_key
  on public.shared_items (lower(name), category, rules_version);
create index if not exists shared_items_category_idx on public.shared_items (category);
create index if not exists shared_items_name_idx on public.shared_items (lower(name));

alter table public.items
  add column if not exists shared_item_id uuid references public.shared_items(id) on delete set null;
create index if not exists items_shared_item_id_idx on public.items (shared_item_id);

alter table public.shared_items enable row level security;

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

drop policy if exists "Authenticated users can read shared items" on public.shared_items;
create policy "Authenticated users can read shared items"
  on public.shared_items for select to authenticated using (true);

drop policy if exists "Authenticated users can create shared items" on public.shared_items;
create policy "Authenticated users can create shared items"
  on public.shared_items for insert to authenticated
  with check (created_by = auth.uid() and public.is_catalog_admin());

drop policy if exists "Authenticated users can update shared items" on public.shared_items;
create policy "Authenticated users can update shared items"
  on public.shared_items for update to authenticated
  using (public.is_catalog_admin())
  with check (public.is_catalog_admin());

drop policy if exists "Authenticated users can delete shared items" on public.shared_items;
create policy "Authenticated users can delete shared items"
  on public.shared_items for delete to authenticated using (public.is_catalog_admin());

comment on table public.shared_items is 'Catalogo condiviso degli oggetti riutilizzabili tra personaggi.';
comment on column public.shared_items.item_data is 'Proprietà complete dell oggetto nel formato usato dall inventario.';
comment on column public.items.shared_item_id is 'Template del catalogo centralizzato da cui deriva l oggetto.';

notify pgrst, 'reload schema';
select pg_notify('pgrst', 'reload schema');
