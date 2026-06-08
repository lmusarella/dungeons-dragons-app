alter table public.resources
  add column if not exists resource_type text not null default 'charges';

alter table public.resources
  drop constraint if exists resources_resource_type_check;

alter table public.resources
  add constraint resources_resource_type_check
  check (resource_type in ('charges', 'pool', 'passive'));

update public.resources
set resource_type = 'passive'
where max_uses = 0 or reset_on is null or reset_on = 'none';
