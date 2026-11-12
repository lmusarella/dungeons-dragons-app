-- Collega le righe di `resources` del personaggio alle definizioni condivise del catalogo
-- (shared_features / shared_resource_pools / shared_resource_actions).
--
-- Necessita' documentata: `resources` non ha alcun riferimento al catalogo, quindi senza questa
-- colonna non e' possibile ritrovare in modo affidabile la riga di un pool o di una capacita'
-- senza usare il nome tradotto (che duplicherebbe le risorse). Non crea nuove tabelle e non
-- modifica i dati esistenti: le righe gia' presenti restano con catalog_key = NULL.
--
-- Formato di catalog_key (una sola riga per personaggio e per chiave):
--   pool:<pool_id>
--   feature:<shared_feature_id>
--   consume:<pool_id>:<shared_feature_id>:<shared_choice_option_id>:<variant_key>

alter table public.resources
  add column if not exists catalog_key text;

create unique index if not exists resources_character_catalog_key_idx
  on public.resources(character_id, catalog_key)
  where catalog_key is not null;

comment on column public.resources.catalog_key is
  'Chiave stabile della definizione condivisa D&D da cui deriva la risorsa (NULL per risorse manuali).';

notify pgrst, 'reload schema';
select pg_notify('pgrst', 'reload schema');
