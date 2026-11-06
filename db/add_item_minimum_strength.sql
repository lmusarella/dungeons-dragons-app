-- Memorizza il requisito di Forza delle armature personali.
alter table public.items
  add column if not exists minimum_strength integer not null default 0;

-- Recupera il requisito corretto per gli oggetti già copiati dal compendio.
do $$
begin
  if to_regclass('public.shared_items') is not null then
    update public.items as inventory_item
    set minimum_strength = greatest(
      0,
      coalesce(
        nullif(shared_item.item_data ->> 'minimum_strength', '')::integer,
        inventory_item.minimum_strength
      )
    )
    from public.shared_items as shared_item
    where inventory_item.shared_item_id = shared_item.id
      and inventory_item.category = 'armor'
      and shared_item.item_data ? 'minimum_strength';
  end if;
end $$;

comment on column public.items.minimum_strength is 'Punteggio minimo di Forza richiesto dall armatura; 0 indica nessun requisito.';

notify pgrst, 'reload schema';
select pg_notify('pgrst', 'reload schema');
