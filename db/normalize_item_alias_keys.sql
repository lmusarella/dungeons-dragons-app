-- Normalizza gli alias oggetti gia' presenti: chiavi in lower(btrim) e un solo alias per (source_system, chiave).
-- Se due alias differivano solo per le maiuscole si tiene prima quello gia' normalizzato, poi quello manuale.
-- Nessun collegamento valido viene sovrascritto da questo script: i duplicati con oggetto diverso vanno verificati prima
-- (query di controllo in fondo).
--
-- Controllo preliminare (sola lettura): duplicati che puntano a oggetti diversi
--   select source_system, lower(btrim(source_key)) as chiave, count(*), count(distinct shared_item_id) as oggetti
--   from public.shared_item_aliases group by 1, 2 having count(*) > 1;

begin;

with ranked as (
  select ctid as row_id,
         row_number() over (
           partition by source_system, lower(btrim(source_key))
           order by (source_key = lower(btrim(source_key))) desc, coalesce(is_manual, false) desc
         ) as rn
  from public.shared_item_aliases
)
delete from public.shared_item_aliases a
using ranked r
where a.ctid = r.row_id and r.rn > 1;

update public.shared_item_aliases
set source_key = lower(btrim(source_key))
where source_key <> lower(btrim(source_key));

commit;

-- Verifica: ogni riferimento di kit collegato risulta 'matched' nella vista
--   select source_ref, match_status, shared_item_id from public.shared_item_bundle_catalog where lower(source_ref) = 'vestments';
