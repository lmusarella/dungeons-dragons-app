-- Optional top-level inventory grouping such as home, cart, vault or camp.
alter table public.items
  add column if not exists inventory_location text;

create index if not exists items_character_inventory_location_idx
  on public.items (character_id, inventory_location)
  where inventory_location is not null;

notify pgrst, 'reload schema';
