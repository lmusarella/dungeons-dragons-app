-- Shared spell registry (cross-player)
create table if not exists public.shared_spells (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id),
  rules_version text not null check (rules_version in ('2014', '2024')),
  name text not null,
  source_key text,
  level smallint not null check (level between 0 and 9),
  school text,
  caster_classes text[] not null default '{}',
  cast_time text,
  range text,
  duration text,
  components text,
  material text,
  concentration boolean not null default false,
  ritual boolean not null default false,
  attack_roll boolean not null default false,
  saving_throw_ability text check (saving_throw_ability is null or saving_throw_ability in ('str', 'dex', 'con', 'int', 'wis', 'cha')),
  attack_range_type text check (attack_range_type is null or attack_range_type in ('melee', 'ranged')),
  damage_die text,
  damage_modifier integer,
  damage_type text,
  upcast_damage_die text,
  upcast_damage_modifier integer,
  upcast_start_level smallint,
  upcast_description text,
  description text,
  source text,
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_key, rules_version)
);

create index if not exists idx_shared_spells_name on public.shared_spells (name);
create index if not exists idx_shared_spells_rules_version on public.shared_spells (rules_version);
create index if not exists idx_shared_spells_source on public.shared_spells (source);
create unique index if not exists shared_spells_manual_name_rules_version_uidx
  on public.shared_spells (lower(name), rules_version)
  where source_key is null;

-- Spell assignments per character
create table if not exists public.character_spells (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  character_id uuid not null references public.characters(id) on delete cascade,
  shared_spell_id uuid references public.shared_spells(id),
  custom_spell jsonb,
  prep_state text default 'known' check (prep_state in ('known', 'prepared', 'always_prepared')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (shared_spell_id is not null or custom_spell is not null)
);

create index if not exists idx_character_spells_character_id on public.character_spells (character_id);

-- Familiars / summons / wild-shape-like transformations
create table if not exists public.character_companions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  character_id uuid not null references public.characters(id) on delete cascade,
  kind text not null check (kind in ('familiar', 'summon', 'transformation', 'animal')),
  name text not null,
  rules_version text check (rules_version in ('2014', '2024')),
  stat_block jsonb not null default '{}'::jsonb,
  notes text,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_character_companions_character_id on public.character_companions (character_id);
create index if not exists idx_character_companions_kind on public.character_companions (kind);
