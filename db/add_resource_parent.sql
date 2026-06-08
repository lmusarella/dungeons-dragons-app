alter table public.resources
  add column if not exists parent_resource_id uuid null;

alter table public.resources
  add column if not exists can_have_children boolean not null default false;

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

create index if not exists resources_parent_resource_id_idx
  on public.resources(parent_resource_id);


update public.resources parent
set can_have_children = true
where exists (
  select 1
  from public.resources child
  where child.parent_resource_id = parent.id
);
