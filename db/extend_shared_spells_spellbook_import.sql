-- Adegua il compendio condiviso all'importazione del catalogo 5e-spellbook.
-- Eseguire prima degli script import_shared_spells_2014.sql e import_shared_spells_2024.sql.

alter table public.shared_spells
  add column if not exists source_key text,
  add column if not exists material text,
  add column if not exists source_url text,
  add column if not exists upcast_description text,
  add column if not exists saving_throw_ability text,
  add column if not exists attack_range_type text,
  add column if not exists damage_type text;

comment on column public.shared_spells.source_key is
  'Identificatore stabile dell''incantesimo nella sorgente esterna, condiviso tra le edizioni.';
comment on column public.shared_spells.material is
  'Componente materiale estesa, separata dalla sigla V/S/M.';
comment on column public.shared_spells.source_url is
  'Link alla pagina sorgente dalla quale provengono i dati dell''incantesimo.';
comment on column public.shared_spells.upcast_description is
  'Descrizione completa del potenziamento con slot superiori o della progressione del trucchetto.';
alter table public.shared_spells
  drop constraint if exists shared_spells_name_rules_version_key;

alter table public.shared_spells
  drop constraint if exists shared_spells_source_key_rules_version_key;

alter table public.shared_spells
  add constraint shared_spells_source_key_rules_version_key
  unique (source_key, rules_version);

-- Gli incantesimi creati manualmente non hanno source_key: per questi manteniamo
-- l'unicità case-insensitive del nome all'interno della stessa edizione.
create unique index if not exists shared_spells_manual_name_rules_version_uidx
  on public.shared_spells (lower(name), rules_version)
  where source_key is null;

alter table public.shared_spells
  drop constraint if exists shared_spells_saving_throw_ability_check;

alter table public.shared_spells
  add constraint shared_spells_saving_throw_ability_check
  check (saving_throw_ability is null or saving_throw_ability in ('str', 'dex', 'con', 'int', 'wis', 'cha'));

alter table public.shared_spells
  drop constraint if exists shared_spells_attack_range_type_check;

alter table public.shared_spells
  add constraint shared_spells_attack_range_type_check
  check (attack_range_type is null or attack_range_type in ('melee', 'ranged'));

create index if not exists idx_shared_spells_source
  on public.shared_spells (source);

notify pgrst, 'reload schema';
select pg_notify('pgrst', 'reload schema');
