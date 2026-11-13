-- Gestione delle edizioni (2014/2024) nelle associazioni incantesimi.
-- ORDINE: eseguire questo script, POI db/admin_spell_aliases.sql (nuove firme delle RPC).
--
-- Stato verificato: shared_spell_aliases e' vuota (nessuna associazione da preservare).
-- shared_spells ha una riga per edizione (UUID diversi, rules_version, unique (source_key, rules_version)).
-- Obiettivi:
--   1. un alias vale per (source_system, source_key, rules_version): lo stesso riferimento puo' puntare a incantesimi diversi nelle due edizioni;
--   2. un alias non collega mai edizioni diverse, salvo compatibilita' esplicita (allow_cross_version = true);
--   3. la vista aggancia l'alias per edizione ed espone le edizioni del riferimento e dell'incantesimo risolto.
-- Nessuna tabella viene ricreata. Nessun collegamento 2014 -> 2024 e' dedotto dal nome.

begin;

-- 1) Colonne
alter table public.shared_spell_aliases
  add column if not exists rules_version text,
  add column if not exists allow_cross_version boolean not null default false;

-- Alias eventualmente esistenti: la versione ereditata e' quella dell'incantesimo collegato.
update public.shared_spell_aliases a
set rules_version = s.rules_version
from public.shared_spells s
where s.id = a.shared_spell_id and a.rules_version is null;

alter table public.shared_spell_aliases alter column rules_version set not null;

alter table public.shared_spell_aliases drop constraint if exists shared_spell_aliases_rules_version_check;
alter table public.shared_spell_aliases
  add constraint shared_spell_aliases_rules_version_check check (rules_version in ('2014', '2024'));

-- 2) Unicita': rimuove (senza conoscerne il nome) i vincoli/indici UNIQUE su (source_system, source_key) e li sostituisce.
do $$
declare r record;
begin
  for r in
    select c.conname
    from pg_constraint c
    where c.conrelid = 'public.shared_spell_aliases'::regclass and c.contype = 'u'
      and not exists (select 1 from unnest(c.conkey) k join pg_attribute at on at.attrelid = c.conrelid and at.attnum = k where at.attname = 'rules_version')
  loop
    execute format('alter table public.shared_spell_aliases drop constraint %I', r.conname);
  end loop;

  for r in
    select i.relname as indexname
    from pg_index x
    join pg_class i on i.oid = x.indexrelid
    where x.indrelid = 'public.shared_spell_aliases'::regclass and x.indisunique and not x.indisprimary
      and not exists (select 1 from pg_constraint c where c.conindid = x.indexrelid)
      and not exists (select 1 from unnest(x.indkey) k join pg_attribute at on at.attrelid = x.indrelid and at.attnum = k where at.attname = 'rules_version')
  loop
    execute format('drop index public.%I', r.indexname);
  end loop;
end $$;

alter table public.shared_spell_aliases drop constraint if exists shared_spell_aliases_system_key_version_key;
alter table public.shared_spell_aliases
  add constraint shared_spell_aliases_system_key_version_key unique (source_system, source_key, rules_version);

-- 3) Coerenza edizione alias <-> incantesimo
create or replace function public.shared_spell_aliases_version_guard()
returns trigger language plpgsql as $$
declare v_version text;
begin
  select rules_version into v_version from public.shared_spells where id = new.shared_spell_id;
  if v_version is null then
    raise exception 'shared_spell % non trovato', new.shared_spell_id;
  end if;
  if v_version <> new.rules_version and not new.allow_cross_version then
    raise exception 'L''alias %/% punta a un incantesimo %, edizione diversa: serve una compatibilita'' esplicita (allow_cross_version).', new.source_key, new.rules_version, v_version;
  end if;
  return new;
end $$;

drop trigger if exists shared_spell_aliases_version_guard on public.shared_spell_aliases;
create trigger shared_spell_aliases_version_guard
  before insert or update of shared_spell_id, rules_version, allow_cross_version on public.shared_spell_aliases
  for each row execute function public.shared_spell_aliases_version_guard();

-- 4) Vista: alias agganciato per edizione; colonne aggiuntive in coda (CREATE OR REPLACE le consente).
create or replace view public.shared_spell_reference_catalog as
 select r.id,
    r.rules_version,
    r.source_system,
    r.source_json_path,
    r.source_ref,
    r.grant_type,
    r.unlock_level,
    r.level_scope,
    r.shared_choice_option_id,
    r.casting_mode,
    r.uses_formula,
    r.recovery_type,
    r.conditions,
    r.selector,
    r.source_payload,
    r.notes,
        case
            when r.shared_class_id is not null then 'class'::text
            when r.shared_subclass_id is not null then 'subclass'::text
            when r.shared_species_id is not null then 'species'::text
            when r.shared_species_variant_id is not null then 'species_variant'::text
            when r.shared_background_id is not null then 'background'::text
            when r.shared_feat_id is not null then 'feat'::text
            else 'feature'::text
        end as owner_type,
    coalesce(r.shared_class_id, r.shared_subclass_id, r.shared_species_id, r.shared_species_variant_id, r.shared_background_id, r.shared_feat_id, r.shared_feature_id) as owner_id,
    coalesce(c.name, sc.name, sp.name, sv.name, bg.name, ft.name, fe.name) as owner_name,
    coalesce(r.shared_spell_id, a.shared_spell_id) as resolved_spell_id,
    coalesce(to_jsonb(s.*) ->> 'name_it'::text, to_jsonb(s.*) ->> 'name'::text) as resolved_spell_name,
        case
            when r.shared_spell_id is not null then 'manual'::text
            when r.source_ref is null and r.selector <> '{}'::jsonb then 'selector'::text
            when a.shared_spell_id is not null then 'matched'::text
            else 'missing'::text
        end as match_status,
    s.rules_version as resolved_spell_rules_version,
    (s.id is not null and s.rules_version <> r.rules_version) as version_mismatch
   from public.shared_spell_references r
     left join public.shared_spell_aliases a on a.source_system = r.source_system and a.rules_version = r.rules_version and a.source_key = lower(btrim(r.source_ref))
     left join public.shared_spells s on s.id = coalesce(r.shared_spell_id, a.shared_spell_id)
     left join public.shared_classes c on c.id = r.shared_class_id
     left join public.shared_subclasses sc on sc.id = r.shared_subclass_id
     left join public.shared_species sp on sp.id = r.shared_species_id
     left join public.shared_species_variants sv on sv.id = r.shared_species_variant_id
     left join public.shared_backgrounds bg on bg.id = r.shared_background_id
     left join public.shared_feats ft on ft.id = r.shared_feat_id
     left join public.shared_features fe on fe.id = r.shared_feature_id;

commit;

notify pgrst, 'reload schema';
