-- Cataloghi D&D condivisi 2014/2024.
-- Migrazione additiva: non modifica characters, resources, items,
-- character_spells o character_companions.

create table if not exists public.catalog_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_catalog_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.catalog_admins where user_id = auth.uid());
$$;
revoke all on function public.is_catalog_admin() from public;
grant execute on function public.is_catalog_admin() to authenticated;

create table if not exists public.shared_classes (
  id uuid primary key default gen_random_uuid(), created_by uuid references auth.users(id) on delete set null,
  name text not null, slug text not null, rules_version text not null,
  description text, hit_die text, primary_abilities text, saving_throws text,
  image_url text, source text, data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint shared_classes_rules_version_check check (rules_version in ('2014','2024'))
);
create unique index if not exists shared_classes_slug_rules_key on public.shared_classes(slug, rules_version);

create table if not exists public.shared_subclasses (
  id uuid primary key default gen_random_uuid(), created_by uuid references auth.users(id) on delete set null,
  shared_class_id uuid not null references public.shared_classes(id) on delete restrict,
  name text not null, slug text not null, rules_version text not null,
  description text, image_url text, source text, data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint shared_subclasses_rules_version_check check (rules_version in ('2014','2024'))
);
create unique index if not exists shared_subclasses_slug_class_rules_key on public.shared_subclasses(shared_class_id, slug, rules_version);

create table if not exists public.shared_species (
  id uuid primary key default gen_random_uuid(), created_by uuid references auth.users(id) on delete set null,
  name text not null, slug text not null, rules_version text not null,
  description text, size text, speed numeric, image_url text, source text,
  data jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint shared_species_rules_version_check check (rules_version in ('2014','2024')),
  constraint shared_species_speed_check check (speed is null or speed >= 0)
);
create unique index if not exists shared_species_slug_rules_key on public.shared_species(slug, rules_version);

create table if not exists public.shared_species_variants (
  id uuid primary key default gen_random_uuid(), created_by uuid references auth.users(id) on delete set null,
  shared_species_id uuid not null references public.shared_species(id) on delete restrict,
  name text not null, slug text not null, rules_version text not null,
  description text, image_url text, source text, data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint shared_species_variants_rules_version_check check (rules_version in ('2014','2024'))
);
create unique index if not exists shared_species_variants_slug_species_rules_key on public.shared_species_variants(shared_species_id, slug, rules_version);

create table if not exists public.shared_backgrounds (
  id uuid primary key default gen_random_uuid(), created_by uuid references auth.users(id) on delete set null,
  name text not null, slug text not null, rules_version text not null, description text,
  image_url text, source text, data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint shared_backgrounds_rules_version_check check (rules_version in ('2014','2024'))
);
create unique index if not exists shared_backgrounds_slug_rules_key on public.shared_backgrounds(slug, rules_version);

create table if not exists public.shared_features (
  id uuid primary key default gen_random_uuid(), created_by uuid references auth.users(id) on delete set null,
  name text not null, slug text not null, rules_version text not null, description text,
  category text, activation_type text, uses integer, recovery text, image_url text, source text,
  mechanics jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint shared_features_rules_version_check check (rules_version in ('2014','2024')),
  constraint shared_features_uses_check check (uses is null or uses >= 0)
);
create unique index if not exists shared_features_slug_rules_key on public.shared_features(slug, rules_version);

create table if not exists public.shared_feats (
  id uuid primary key default gen_random_uuid(), created_by uuid references auth.users(id) on delete set null,
  name text not null, slug text not null, rules_version text not null, description text,
  category text not null default 'other', prerequisites text, repeatable boolean not null default false,
  image_url text, source text, data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint shared_feats_rules_version_check check (rules_version in ('2014','2024')),
  constraint shared_feats_category_check check (category in ('general','origin','fighting_style','epic_boon','other'))
);
create unique index if not exists shared_feats_slug_rules_key on public.shared_feats(slug, rules_version);

create table if not exists public.shared_fighting_styles (
  id uuid primary key default gen_random_uuid(), created_by uuid references auth.users(id) on delete set null,
  shared_feat_id uuid references public.shared_feats(id) on delete restrict,
  name text not null, slug text not null, rules_version text not null, description text,
  image_url text, source text, data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint shared_fighting_styles_rules_version_check check (rules_version in ('2014','2024'))
);
create unique index if not exists shared_fighting_styles_slug_rules_key on public.shared_fighting_styles(slug, rules_version);

-- La tabella può essere già presente per le stanze di gioco: le colonne sono aggiunte in modo idempotente.
create table if not exists public.shared_creatures (id uuid primary key default gen_random_uuid());
alter table public.shared_creatures add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table public.shared_creatures add column if not exists name text;
alter table public.shared_creatures add column if not exists slug text;
alter table public.shared_creatures add column if not exists rules_version text;
alter table public.shared_creatures add column if not exists description text;
alter table public.shared_creatures add column if not exists creature_type text;
alter table public.shared_creatures add column if not exists size text;
alter table public.shared_creatures add column if not exists challenge_rating text;
alter table public.shared_creatures add column if not exists image_url text;
alter table public.shared_creatures add column if not exists source text;
alter table public.shared_creatures add column if not exists stat_block jsonb not null default '{}'::jsonb;
alter table public.shared_creatures add column if not exists created_at timestamptz not null default now();
alter table public.shared_creatures add column if not exists updated_at timestamptz not null default now();
create unique index if not exists shared_creatures_slug_rules_key on public.shared_creatures(slug, rules_version) where slug is not null and rules_version is not null;

create table if not exists public.shared_class_spells (
  id uuid primary key default gen_random_uuid(), shared_class_id uuid not null references public.shared_classes(id) on delete cascade,
  shared_spell_id uuid not null references public.shared_spells(id) on delete cascade,
  created_at timestamptz not null default now(), unique(shared_class_id, shared_spell_id)
);

create table if not exists public.shared_grants (
  id uuid primary key default gen_random_uuid(),
  source_class_id uuid references public.shared_classes(id) on delete cascade,
  source_subclass_id uuid references public.shared_subclasses(id) on delete cascade,
  source_species_id uuid references public.shared_species(id) on delete cascade,
  source_species_variant_id uuid references public.shared_species_variants(id) on delete cascade,
  source_background_id uuid references public.shared_backgrounds(id) on delete cascade,
  source_feat_id uuid references public.shared_feats(id) on delete cascade,
  source_fighting_style_id uuid references public.shared_fighting_styles(id) on delete cascade,
  source_feature_id uuid references public.shared_features(id) on delete cascade,
  target_feature_id uuid references public.shared_features(id) on delete restrict,
  target_feat_id uuid references public.shared_feats(id) on delete restrict,
  target_fighting_style_id uuid references public.shared_fighting_styles(id) on delete restrict,
  target_spell_id uuid references public.shared_spells(id) on delete restrict,
  target_item_id uuid references public.shared_items(id) on delete restrict,
  unlock_level integer, level_scope text, quantity integer not null default 1, notes text,
  created_at timestamptz not null default now(),
  constraint shared_grants_one_source check (num_nonnulls(source_class_id,source_subclass_id,source_species_id,source_species_variant_id,source_background_id,source_feat_id,source_fighting_style_id,source_feature_id)=1),
  constraint shared_grants_one_target check (num_nonnulls(target_feature_id,target_feat_id,target_fighting_style_id,target_spell_id,target_item_id)=1),
  constraint shared_grants_level_check check (unlock_level is null or unlock_level between 1 and 20),
  constraint shared_grants_scope_check check (level_scope is null or level_scope in ('character','class')),
  constraint shared_grants_quantity_check check (quantity > 0)
);

create table if not exists public.shared_choice_groups (
  id uuid primary key default gen_random_uuid(), name text not null, description text, rules_version text not null,
  source_class_id uuid references public.shared_classes(id) on delete cascade,
  source_subclass_id uuid references public.shared_subclasses(id) on delete cascade,
  source_species_id uuid references public.shared_species(id) on delete cascade,
  source_species_variant_id uuid references public.shared_species_variants(id) on delete cascade,
  source_feat_id uuid references public.shared_feats(id) on delete cascade,
  source_fighting_style_id uuid references public.shared_fighting_styles(id) on delete cascade,
  source_feature_id uuid references public.shared_features(id) on delete cascade,
  level_scope text not null default 'character', required boolean not null default true,
  allow_duplicates boolean not null default false, sort_order integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint shared_choice_groups_one_source check (num_nonnulls(source_class_id,source_subclass_id,source_species_id,source_species_variant_id,source_feat_id,source_fighting_style_id,source_feature_id)=1),
  constraint shared_choice_groups_rules_version_check check (rules_version in ('2014','2024')),
  constraint shared_choice_groups_scope_check check (level_scope in ('character','class'))
);

create table if not exists public.shared_choice_options (
  id uuid primary key default gen_random_uuid(), choice_group_id uuid not null references public.shared_choice_groups(id) on delete cascade,
  option_type text not null,
  shared_feature_id uuid references public.shared_features(id) on delete restrict,
  shared_fighting_style_id uuid references public.shared_fighting_styles(id) on delete restrict,
  shared_feat_id uuid references public.shared_feats(id) on delete restrict,
  shared_spell_id uuid references public.shared_spells(id) on delete restrict,
  shared_subclass_id uuid references public.shared_subclasses(id) on delete restrict,
  shared_species_variant_id uuid references public.shared_species_variants(id) on delete restrict,
  shared_item_id uuid references public.shared_items(id) on delete restrict,
  shared_creature_id uuid references public.shared_creatures(id) on delete restrict,
  static_code text, minimum_level integer, sort_order integer not null default 0, label_override text, notes text,
  created_at timestamptz not null default now(),
  constraint shared_choice_options_level_check check (minimum_level is null or minimum_level between 1 and 20),
  constraint shared_choice_options_target_check check (
    num_nonnulls(shared_feature_id,shared_fighting_style_id,shared_feat_id,shared_spell_id,shared_subclass_id,shared_species_variant_id,shared_item_id,shared_creature_id,static_code)=1
  ),
  constraint shared_choice_options_type_check check (option_type in ('feature','fighting_style','feat','spell','subclass','species_variant','item','creature','skill','ability','language','tool','other'))
);

create table if not exists public.shared_choice_progression (
  id uuid primary key default gen_random_uuid(), choice_group_id uuid not null references public.shared_choice_groups(id) on delete cascade,
  level integer not null, new_choices integer not null, created_at timestamptz not null default now(),
  constraint shared_choice_progression_level_check check (level between 1 and 20),
  constraint shared_choice_progression_choices_check check (new_choices > 0),
  unique(choice_group_id, level)
);

-- Lettura per ogni utente autenticato; scritture protette anche dal database.
do $$
declare table_name text;
begin
  foreach table_name in array array[
    'shared_classes','shared_subclasses','shared_species','shared_species_variants','shared_backgrounds',
    'shared_features','shared_feats','shared_fighting_styles','shared_creatures','shared_class_spells',
    'shared_grants','shared_choice_groups','shared_choice_options','shared_choice_progression'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('drop policy if exists %I on public.%I', table_name || '_select_authenticated', table_name);
    execute format('drop policy if exists %I on public.%I', table_name || '_insert_admin', table_name);
    execute format('drop policy if exists %I on public.%I', table_name || '_update_admin', table_name);
    execute format('drop policy if exists %I on public.%I', table_name || '_delete_admin', table_name);
    execute format('create policy %I on public.%I for select to authenticated using (true)', table_name || '_select_authenticated', table_name);
    execute format('create policy %I on public.%I for insert to authenticated with check (public.is_catalog_admin())', table_name || '_insert_admin', table_name);
    execute format('create policy %I on public.%I for update to authenticated using (public.is_catalog_admin()) with check (public.is_catalog_admin())', table_name || '_update_admin', table_name);
    execute format('create policy %I on public.%I for delete to authenticated using (public.is_catalog_admin())', table_name || '_delete_admin', table_name);
  end loop;
end $$;

notify pgrst, 'reload schema';
select pg_notify('pgrst', 'reload schema');
