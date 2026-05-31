-- Fix rapido per lo switch delle impugnature/modalità nella sezione Attacchi.
-- Esegui questo script se hai già lanciato una versione precedente di
-- db/items_ammunition_weapon_modes.sql e Supabase restituisce:
-- "Could not find the 'selected_damage_mode' column of 'items' in the schema cache".

alter table public.items
  add column if not exists selected_damage_mode text;

comment on column public.items.selected_damage_mode is 'Modalità danno/impugnatura attualmente selezionata nella scheda attacchi.';

-- Forza il refresh della schema cache di PostgREST/Supabase.
notify pgrst, 'reload schema';
select pg_notify('pgrst', 'reload schema');
