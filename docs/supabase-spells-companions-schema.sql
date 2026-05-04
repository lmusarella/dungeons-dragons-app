-- Shared spell registry (cross-player)
create table if not exists public.shared_spells (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id),
  rules_version text not null check (rules_version in ('2014', '2024')),
  name text not null,
  level smallint not null check (level between 0 and 9),
  school text,
  cast_time text,
  range text,
  duration text,
  components text,
  concentration boolean not null default false,
  ritual boolean not null default false,
  attack_roll boolean not null default false,
  damage_die text,
  damage_modifier integer,
  upcast_damage_die text,
  upcast_damage_modifier integer,
  upcast_start_level smallint,
  description text,
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (name, rules_version)
);

create index if not exists idx_shared_spells_name on public.shared_spells (name);
create index if not exists idx_shared_spells_rules_version on public.shared_spells (rules_version);

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
  kind text not null check (kind in ('familiar', 'summon', 'transformation')),
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
