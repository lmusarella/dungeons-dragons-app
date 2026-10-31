alter table public.shared_spells
  add column if not exists damage_type text;

comment on column public.shared_spells.damage_type is
  'Tipo di danno principale dell''incantesimo (fire, cold, force, ecc.).';
