-- Memorizza la penalità alle prove di Furtività delle armature personali.
alter table public.items
  add column if not exists stealth_disadvantage boolean not null default false;

-- Mantiene il comportamento precedente per le armature pesanti già presenti.
update public.items
set stealth_disadvantage = true
where category = 'armor'
  and armor_type = 'heavy';

-- Quando l'oggetto deriva dal compendio, recupera la regola esatta del template
-- (necessario anche per armature leggere o medie con questa penalità).
do $$
begin
  if to_regclass('public.shared_items') is not null then
    update public.items as inventory_item
    set stealth_disadvantage = coalesce(
      (shared_item.item_data ->> 'stealth_disadvantage')::boolean,
      inventory_item.stealth_disadvantage
    )
    from public.shared_items as shared_item
    where inventory_item.shared_item_id = shared_item.id
      and inventory_item.category = 'armor'
      and shared_item.item_data ? 'stealth_disadvantage';
  end if;
end $$;

comment on column public.items.stealth_disadvantage is 'Se l armatura impone svantaggio alle prove di Furtività.';

notify pgrst, 'reload schema';
select pg_notify('pgrst', 'reload schema');
