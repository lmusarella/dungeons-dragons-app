alter table public.shared_spells
  add column if not exists attack_range_type text;

comment on column public.shared_spells.attack_range_type is
  'Categoria di attacco del trucchetto: melee oppure ranged. Null per gli incantesimi non classificati.';

alter table public.shared_spells
  drop constraint if exists shared_spells_attack_range_type_check;

alter table public.shared_spells
  add constraint shared_spells_attack_range_type_check
  check (attack_range_type is null or attack_range_type in ('melee', 'ranged'));
