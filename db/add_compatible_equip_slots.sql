-- Le parti consentite sono distinte dagli slot effettivamente equipaggiati.
alter table public.items
  add column if not exists compatible_equip_slots jsonb not null default '[]'::jsonb;

comment on column public.items.compatible_equip_slots is 'Parti del corpo consentite; non rappresentano gli slot attualmente equipaggiati.';

notify pgrst, 'reload schema';
select pg_notify('pgrst', 'reload schema');
