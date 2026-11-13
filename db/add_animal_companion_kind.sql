-- Consente di salvare gli animali tra i famigli/compagni dei personaggi.
-- Esegui questo script nel SQL editor di Supabase/PostgreSQL sui database
-- creati prima dell'aggiunta della tipologia `animal` nell'app.

alter table public.character_companions
  drop constraint if exists character_companions_kind_check;

alter table public.character_companions
  add constraint character_companions_kind_check
  check (kind in ('familiar', 'summon', 'transformation', 'animal'));

-- Forza il refresh della schema cache di PostgREST/Supabase.
notify pgrst, 'reload schema';
select pg_notify('pgrst', 'reload schema');
