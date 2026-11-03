-- Conserva le proprietà delle armi negli oggetti personali e le rende disponibili
-- sia dal dettaglio inventario sia dalla shortcut Attacchi.

alter table public.items
  add column if not exists weapon_properties jsonb not null default '[]'::jsonb,
  add column if not exists grip_type text;

comment on column public.items.weapon_properties is 'Proprietà regolistiche dell''arma, ad esempio accurata, lancio, pesante o versatile.';
comment on column public.items.grip_type is 'Tipo di impugnatura dell''arma: one_handed, two_handed o versatile.';

-- Recupera le proprietà degli oggetti già copiati dal compendio, quando il
-- collegamento shared_item_id è ancora presente.
do $$
begin
  if to_regclass('public.shared_items') is not null then
    update public.items as inventory_item
    set
      weapon_properties = case
        when jsonb_typeof(shared_item.item_data -> 'weapon_properties') = 'array'
          then shared_item.item_data -> 'weapon_properties'
        else inventory_item.weapon_properties
      end,
      grip_type = coalesce(
        nullif(shared_item.item_data ->> 'grip_type', ''),
        inventory_item.grip_type
      )
    from public.shared_items as shared_item
    where inventory_item.shared_item_id = shared_item.id
      and inventory_item.category = 'weapon';
  end if;
end $$;

notify pgrst, 'reload schema';
select pg_notify('pgrst', 'reload schema');
