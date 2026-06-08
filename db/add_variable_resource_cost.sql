-- Consente alle sotto-abilità di richiedere un costo scelto al momento dell'uso.
alter table public.resources
  add column if not exists resource_cost_variable boolean not null default false;

update public.resources
set resource_cost_variable = false
where resource_cost_variable is null;

comment on column public.resources.resource_cost_variable is
  'Se true, il costo della sotto-abilità viene scelto al momento dell''uso.';

notify pgrst, 'reload schema';
select pg_notify('pgrst', 'reload schema');
