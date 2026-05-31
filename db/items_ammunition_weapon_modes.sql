-- Campi richiesti per munizioni, tipi di danno e modalità alternative delle armi.
-- Esegui questo script nel SQL editor di Supabase/PostgreSQL.

alter table public.items
  add column if not exists ammunition_type text,
  add column if not exists required_ammunition_type text,
  add column if not exists consumes_ammunition boolean not null default false,
  add column if not exists damage_type text,
  add column if not exists has_alternate_damage_mode boolean not null default false,
  add column if not exists alternate_damage_label text,
  add column if not exists alternate_damage_die text,
  add column if not exists alternate_damage_modifier numeric not null default 0,
  add column if not exists alternate_damage_type text;

comment on column public.items.ammunition_type is 'Tipo munizione rappresentato dall''oggetto: arrow, bolt, bullet.';
comment on column public.items.required_ammunition_type is 'Tipo munizione consumata dall''arma: arrow, bolt, bullet.';
comment on column public.items.consumes_ammunition is 'Se true, l''arma consuma una munizione compatibile quando viene effettuato un tiro per colpire.';
comment on column public.items.damage_type is 'Tipo di danno base dell''arma.';
comment on column public.items.has_alternate_damage_mode is 'Abilita una modalità danno alternativa, ad esempio impugnatura a due mani.';
comment on column public.items.alternate_damage_label is 'Etichetta della modalità alternativa, ad esempio Due mani.';
comment on column public.items.alternate_damage_die is 'Dado danno della modalità alternativa, ad esempio 1d10.';
comment on column public.items.alternate_damage_modifier is 'Modificatore danno specifico della modalità alternativa.';
comment on column public.items.alternate_damage_type is 'Tipo di danno specifico della modalità alternativa.';

-- Opzionale: se usi PostgREST/Supabase e la cache schema non si aggiorna subito,
-- esegui anche questa notifica o attendi il refresh automatico.
notify pgrst, 'reload schema';
