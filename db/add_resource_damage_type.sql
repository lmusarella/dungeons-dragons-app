-- Tipo di danno opzionale per abilità e poteri.
-- I valori seguono le chiavi dei tipi di danno usate dall'applicazione.

alter table public.resources
  add column if not exists damage_type text;

alter table public.resources
  drop constraint if exists resources_damage_type_check;

alter table public.resources
  add constraint resources_damage_type_check
  check (
    damage_type is null
    or damage_type in (
      'acid', 'bludgeoning', 'piercing', 'slashing', 'cold', 'fire',
      'force', 'lightning', 'thunder', 'necrotic', 'poison', 'psychic', 'radiant'
    )
  );

comment on column public.resources.damage_type is
  'Tipo di danno opzionale dell''abilità o potere.';

notify pgrst, 'reload schema';
select pg_notify('pgrst', 'reload schema');
