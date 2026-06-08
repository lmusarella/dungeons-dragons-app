alter table public.resources
  add column if not exists parent_resource_id uuid null;

alter table public.resources
  add column if not exists can_have_children boolean not null default false;

alter table public.resources
  add column if not exists resource_cost integer not null default 1;

alter table public.resources
  drop constraint if exists resources_parent_resource_id_fkey;

alter table public.resources
  add constraint resources_parent_resource_id_fkey
  foreign key (parent_resource_id)
  references public.resources(id)
  on delete cascade;

alter table public.resources
  drop constraint if exists resources_parent_not_self_check;

alter table public.resources
  add constraint resources_parent_not_self_check
  check (parent_resource_id is null or parent_resource_id <> id);

alter table public.resources
  drop constraint if exists resources_resource_cost_check;

update public.resources
set resource_cost = 1
where resource_cost is null or resource_cost < 1;

alter table public.resources
  add constraint resources_resource_cost_check
  check (resource_cost >= 1);

create index if not exists resources_parent_resource_id_idx
  on public.resources(parent_resource_id);


update public.resources parent
set can_have_children = true
where exists (
  select 1
  from public.resources child
  where child.parent_resource_id = parent.id
);


notify pgrst, 'reload schema';
select pg_notify('pgrst', 'reload schema');
