-- Esegui questo script sui database che hanno già applicato add_resource_parent.sql.
-- Aggiunge il flag padre e il costo configurabile delle sotto-abilità.

alter table public.resources
  add column if not exists can_have_children boolean not null default false;

alter table public.resources
  add column if not exists resource_cost integer not null default 1;

alter table public.resources
  drop constraint if exists resources_resource_cost_check;

update public.resources
set resource_cost = 1
where resource_cost is null or resource_cost < 1;

alter table public.resources
  add constraint resources_resource_cost_check
  check (resource_cost >= 1);

update public.resources parent
set can_have_children = true
where exists (
  select 1
  from public.resources child
  where child.parent_resource_id = parent.id
);

comment on column public.resources.can_have_children is
  'Indica se la risorsa può contenere sotto-abilità collegate.';

comment on column public.resources.resource_cost is
  'Numero di cariche o punti del padre consumati usando questa opzione.';

notify pgrst, 'reload schema';
select pg_notify('pgrst', 'reload schema');
