-- Proprietà rapida "Tiro salvezza" per incantesimi condivisi e abilità.
-- I valori usano le chiavi delle caratteristiche D&D: str, dex, con, int, wis, cha.

alter table public.shared_spells
  add column if not exists saving_throw_ability text;

alter table public.shared_spells
  drop constraint if exists shared_spells_saving_throw_ability_check;

alter table public.shared_spells
  add constraint shared_spells_saving_throw_ability_check
  check (saving_throw_ability is null or saving_throw_ability in ('str', 'dex', 'con', 'int', 'wis', 'cha'));

comment on column public.shared_spells.saving_throw_ability is
  'Caratteristica richiesta dal tiro salvezza dell''incantesimo: str, dex, con, int, wis oppure cha.';

alter table public.resources
  add column if not exists saving_throw_ability text;

alter table public.resources
  drop constraint if exists resources_saving_throw_ability_check;

alter table public.resources
  add constraint resources_saving_throw_ability_check
  check (saving_throw_ability is null or saving_throw_ability in ('str', 'dex', 'con', 'int', 'wis', 'cha'));

comment on column public.resources.saving_throw_ability is
  'Caratteristica richiesta dal tiro salvezza dell''abilità: str, dex, con, int, wis oppure cha.';

notify pgrst, 'reload schema';
select pg_notify('pgrst', 'reload schema');
