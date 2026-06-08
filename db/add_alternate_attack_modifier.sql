-- Aggiunge il modificatore per colpire della prima impugnatura alternativa.
-- Esegui questo script se la tabella items esiste già e Supabase restituisce:
-- "Could not find the 'alternate_attack_modifier' column of 'items' in the schema cache".

alter table public.items
  add column if not exists alternate_attack_modifier numeric not null default 0;

comment on column public.items.alternate_attack_modifier is 'Modificatore per colpire specifico della prima modalità o impugnatura alternativa.';

-- Forza il refresh della schema cache di PostgREST/Supabase.
notify pgrst, 'reload schema';
select pg_notify('pgrst', 'reload schema');
