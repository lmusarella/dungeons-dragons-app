-- Associazioni incantesimi: RPC amministrative per shared_spell_aliases / shared_spell_references.
--
-- Schema verificato:
--   shared_spell_references(id, rules_version NOT NULL, source_system default '5etools', source_json_path NOT NULL, source_ref,
--     shared_spell_id, shared_class_id, shared_subclass_id, shared_species_id, shared_species_variant_id, shared_background_id,
--     shared_feat_id, shared_feature_id, grant_type NOT NULL, unlock_level, level_scope default 'character',
--     shared_choice_option_id, casting_mode default 'unspecified', uses_formula, recovery_type, conditions jsonb, selector jsonb,
--     source_payload jsonb, notes, manual_link, linked_by, linked_at, created_at, updated_at)
--   shared_spell_reference_catalog: vista che risolve gli alias con source_system + lower(btrim(source_ref)) = source_key.
--   shared_spell_aliases(source_system, source_key, shared_spell_id, ...)  [colonne extra non verificate]
-- Poiche' la vista risolve da sola gli alias, salvare un alias NON richiede di aggiornare le righe delle references:
-- restano solo gli override per singola voce (shared_spell_id + manual_link) che hanno la precedenza.
-- Le tabelle restano in sola lettura per gli utenti: si scrive SOLO da queste RPC (SECURITY DEFINER + is_catalog_admin()).
--
-- Se grant_type / casting_mode / level_scope hanno CHECK constraint con valori diversi da quelli usati dall'importer
-- (grant_type: known|prepared|innate|expanded; casting_mode: known|always_prepared|at_will|daily|rest|innate|list|unspecified;
--  level_scope: character|class) l'importazione fallira' con un errore esplicito: comunicare il vincolo per allinearlo.

-- Prerequisito: db/spell_aliases_rules_version.sql (colonne rules_version / allow_cross_version e nuova unicita').
alter table public.shared_spell_aliases
  add column if not exists is_manual boolean not null default false,
  add column if not exists updated_by uuid,
  add column if not exists updated_at timestamptz default now();

drop function if exists public.admin_save_spell_alias(text, uuid);
drop function if exists public.admin_delete_spell_alias(text);
drop function if exists public.admin_set_spell_reference(uuid, uuid);

-- Alias per edizione: (source_key, rules_version). Un alias non puo' puntare a un'altra edizione salvo p_allow_cross_version.
create or replace function public.admin_save_spell_alias(p_source_key text, p_rules_version text, p_shared_spell_id uuid, p_allow_cross_version boolean default false)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_key text := lower(btrim(p_source_key)); v_old uuid; v_rows integer := 0; v_existing boolean; v_version text;
begin
  if not public.is_catalog_admin() then raise exception 'Permission denied' using errcode = '42501'; end if;
  if coalesce(v_key, '') = '' then raise exception 'source_key required'; end if;
  if p_rules_version not in ('2014', '2024') then raise exception 'rules_version non valida: %', p_rules_version; end if;
  select rules_version into v_version from public.shared_spells where id = p_shared_spell_id;
  if v_version is null then raise exception 'shared_spell % not found', p_shared_spell_id; end if;
  if v_version <> p_rules_version and not coalesce(p_allow_cross_version, false) then
    raise exception 'Incantesimo % (%) incompatibile con l''edizione %', p_shared_spell_id, v_version, p_rules_version using errcode = '23514';
  end if;
  select shared_spell_id into v_old from public.shared_spell_aliases where source_system = '5etools' and source_key = v_key and rules_version = p_rules_version;
  v_existing := found;
  if v_existing then
    update public.shared_spell_aliases
    set shared_spell_id = p_shared_spell_id, allow_cross_version = coalesce(p_allow_cross_version, false), is_manual = true, updated_by = auth.uid(), updated_at = now()
    where source_system = '5etools' and source_key = v_key and rules_version = p_rules_version;
  else
    insert into public.shared_spell_aliases (source_system, source_key, rules_version, shared_spell_id, allow_cross_version, is_manual, updated_by, updated_at)
    values ('5etools', v_key, p_rules_version, p_shared_spell_id, coalesce(p_allow_cross_version, false), true, auth.uid(), now());
  end if;
  select count(*) into v_rows from public.shared_spell_references
  where source_system = '5etools' and rules_version = p_rules_version and lower(btrim(source_ref)) = v_key and shared_spell_id is null;
  return jsonb_build_object('created', not v_existing, 'previous_spell_id', v_old, 'references_updated', v_rows);
end; $$;

create or replace function public.admin_delete_spell_alias(p_source_key text, p_rules_version text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_rows integer := 0;
begin
  if not public.is_catalog_admin() then raise exception 'Permission denied' using errcode = '42501'; end if;
  delete from public.shared_spell_aliases where source_system = '5etools' and source_key = lower(btrim(p_source_key)) and rules_version = p_rules_version;
  get diagnostics v_rows = row_count;
  return jsonb_build_object('deleted', v_rows > 0);
end; $$;

create or replace function public.admin_set_spell_reference(p_reference_id uuid, p_shared_spell_id uuid, p_allow_cross_version boolean default false)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_ref text; v_spell text;
begin
  if not public.is_catalog_admin() then raise exception 'Permission denied' using errcode = '42501'; end if;
  select rules_version into v_ref from public.shared_spell_references where id = p_reference_id;
  if not found then raise exception 'reference % not found', p_reference_id; end if;
  select rules_version into v_spell from public.shared_spells where id = p_shared_spell_id;
  if v_spell is null then raise exception 'shared_spell % not found', p_shared_spell_id; end if;
  if v_spell <> v_ref and not coalesce(p_allow_cross_version, false) then
    raise exception 'Incantesimo % incompatibile con l''edizione % del riferimento', v_spell, v_ref using errcode = '23514';
  end if;
  update public.shared_spell_references
  set shared_spell_id = p_shared_spell_id, manual_link = true, linked_by = auth.uid(), linked_at = now(), updated_at = now()
  where id = p_reference_id;
  return jsonb_build_object('reference_id', p_reference_id);
end; $$;

create or replace function public.admin_clear_spell_reference(p_reference_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  if not public.is_catalog_admin() then raise exception 'Permission denied' using errcode = '42501'; end if;
  update public.shared_spell_references
  set shared_spell_id = null, manual_link = false, linked_by = auth.uid(), linked_at = now(), updated_at = now()
  where id = p_reference_id;
  if not found then raise exception 'reference % not found', p_reference_id; end if;
  return jsonb_build_object('reference_id', p_reference_id);
end; $$;

-- Importazione idempotente. Chiave naturale: (source_system, proprietario, source_json_path).
-- Le righe esistenti vengono aggiornate nei soli campi derivati dal JSON: shared_spell_id e manual_link non si toccano.
create or replace function public.admin_import_spell_references(p_rows jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_row jsonb; v_type text; v_owner uuid; v_id uuid; v_inserted integer := 0; v_updated integer := 0;
  v_class uuid; v_sub uuid; v_species uuid; v_variant uuid; v_feature uuid;
  v_scope text; v_selector jsonb;
begin
  if not public.is_catalog_admin() then raise exception 'Permission denied' using errcode = '42501'; end if;
  for v_row in select * from jsonb_array_elements(p_rows) loop
    v_type := v_row->>'owner_type';
    v_owner := (v_row->>'owner_id')::uuid;
    v_class := case when v_type = 'class' then v_owner end;
    v_sub := case when v_type = 'subclass' then v_owner end;
    v_species := case when v_type = 'species' then v_owner end;
    v_variant := case when v_type = 'variant' then v_owner end;
    v_feature := case when v_type = 'feature' then v_owner end;
    v_scope := case when v_type in ('class', 'subclass') then 'class' else 'character' end;
    v_selector := coalesce(v_row->'selector', '{}'::jsonb);

    select id into v_id from public.shared_spell_references
    where source_system = '5etools' and source_json_path = v_row->>'source_json_path'
      and shared_class_id is not distinct from v_class and shared_subclass_id is not distinct from v_sub
      and shared_species_id is not distinct from v_species and shared_species_variant_id is not distinct from v_variant
      and shared_feature_id is not distinct from v_feature;

    if v_id is null then
      insert into public.shared_spell_references (
        rules_version, source_system, source_json_path, source_ref, shared_class_id, shared_subclass_id, shared_species_id,
        shared_species_variant_id, shared_feature_id, grant_type, unlock_level, level_scope, casting_mode, uses_formula,
        recovery_type, conditions, selector, source_payload)
      values (
        coalesce(v_row->>'rules_version', '2014'), '5etools', v_row->>'source_json_path', v_row->>'source_ref', v_class, v_sub, v_species,
        v_variant, v_feature, v_row->>'grant_type', (v_row->>'unlock_level')::smallint, v_scope, coalesce(v_row->>'casting_mode', 'unspecified'),
        v_row->>'uses_formula', v_row->>'recovery_type', coalesce(v_row->'conditions', '{}'::jsonb), v_selector, v_row->'source_payload');
      v_inserted := v_inserted + 1;
    else
      update public.shared_spell_references set
        source_ref = v_row->>'source_ref', grant_type = v_row->>'grant_type', unlock_level = (v_row->>'unlock_level')::smallint,
        casting_mode = coalesce(v_row->>'casting_mode', 'unspecified'), uses_formula = v_row->>'uses_formula', recovery_type = v_row->>'recovery_type',
        conditions = coalesce(v_row->'conditions', '{}'::jsonb), selector = v_selector, source_payload = v_row->'source_payload', updated_at = now()
      where id = v_id;
      v_updated := v_updated + 1;
    end if;
    v_id := null;
  end loop;
  return jsonb_build_object('inserted', v_inserted, 'updated', v_updated);
end; $$;

revoke all on function public.admin_save_spell_alias(text, text, uuid, boolean) from public;
revoke all on function public.admin_delete_spell_alias(text, text) from public;
revoke all on function public.admin_set_spell_reference(uuid, uuid, boolean) from public;
revoke all on function public.admin_clear_spell_reference(uuid) from public;
revoke all on function public.admin_import_spell_references(jsonb) from public;
grant execute on function public.admin_save_spell_alias(text, text, uuid, boolean) to authenticated;
grant execute on function public.admin_delete_spell_alias(text, text) to authenticated;
grant execute on function public.admin_set_spell_reference(uuid, uuid, boolean) to authenticated;
grant execute on function public.admin_clear_spell_reference(uuid) to authenticated;
grant execute on function public.admin_import_spell_references(jsonb) to authenticated;

notify pgrst, 'reload schema';
