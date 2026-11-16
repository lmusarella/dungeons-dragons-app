-- Corregge la risoluzione degli alias oggetti per il ruolo usato dal frontend.
--
-- Sintomo:
--   * admin_save_item_alias restituisce successo;
--   * SELECT shared_item_aliases dal browser restituisce [];
--   * shared_item_bundle_catalog continua a restituire match_status = 'missing'.
--
-- Gli alias contengono solo mapping del catalogo condiviso. Sono quindi leggibili
-- dagli utenti autenticati; le scritture continuano a passare esclusivamente
-- dalle RPC SECURITY DEFINER amministrative.

begin;

alter table public.shared_item_aliases enable row level security;

drop policy if exists shared_item_aliases_select_authenticated
  on public.shared_item_aliases;

create policy shared_item_aliases_select_authenticated
  on public.shared_item_aliases
  for select
  to authenticated
  using (true);

grant select on table public.shared_item_aliases to authenticated;

commit;

notify pgrst, 'reload schema';
select pg_notify('pgrst', 'reload schema');

-- Verifica dalla stessa sessione autenticata usata dal frontend:
-- select source_system, source_key, shared_item_id
-- from public.shared_item_aliases
-- where source_system = 'dnd5eapi' and lower(btrim(source_key)) = 'vestments';
--
-- select bundle_name, source_key, shared_item_id, item_name_it, match_status
-- from public.shared_item_bundle_catalog
-- where lower(btrim(source_key)) = 'vestments';
