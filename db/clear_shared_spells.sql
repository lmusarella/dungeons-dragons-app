-- Sbiancamento completo del catalogo degli incantesimi condivisi.
--
-- Per ogni associazione esistente:
--   1. copia i dati dell'incantesimo condiviso in character_spells.custom_spell;
--   2. azzera shared_spell_id, conservando record, preparazione e note del giocatore;
--   3. elimina tutti i record di public.shared_spells.
--
-- Gli incantesimi scollegati diventano copie personali e possono essere mantenuti
-- finché il giocatore non associa la nuova versione importata e rimuove quella vecchia.

begin;

do $clear_shared_spells$
declare
  v_assignment_count bigint;
  v_spell_count bigint;
  v_remaining_assignments bigint;
  v_remaining_spells bigint;
  v_preserved_count bigint;
begin
  select count(*)
  into v_assignment_count
  from public.character_spells
  where shared_spell_id is not null;

  select count(*)
  into v_spell_count
  from public.shared_spells;

  update public.character_spells as character_spell
  set custom_spell = coalesce(character_spell.custom_spell, '{}'::jsonb)
      || (to_jsonb(shared_spell) - 'id' - 'created_by' - 'created_at' - 'updated_at')
      || jsonb_build_object(
        'legacy_shared_spell_id', shared_spell.id,
        'detached_from_catalog_at', now()
      ),
      shared_spell_id = null,
      updated_at = now()
  from public.shared_spells as shared_spell
  where character_spell.shared_spell_id = shared_spell.id;

  get diagnostics v_preserved_count = row_count;

  delete from public.shared_spells;

  select count(*)
  into v_remaining_assignments
  from public.character_spells
  where shared_spell_id is not null;

  select count(*)
  into v_remaining_spells
  from public.shared_spells;

  if v_remaining_assignments <> 0 or v_remaining_spells <> 0 then
    raise exception
      'Sbiancamento incompleto: % associazioni e % incantesimi ancora presenti.',
      v_remaining_assignments,
      v_remaining_spells;
  end if;

  raise notice
    'Sbiancamento completato: % associazioni convertite in copie personali e % incantesimi condivisi eliminati.',
    v_preserved_count,
    v_spell_count;

  if v_preserved_count <> v_assignment_count then
    raise warning
      'Associazioni rilevate: %, copie personali create: %. Verificare eventuali riferimenti non validi preesistenti.',
      v_assignment_count,
      v_preserved_count;
  end if;
end
$clear_shared_spells$;

commit;

select
  (select count(*) from public.shared_spells) as shared_spells_rimanenti,
  (select count(*) from public.character_spells where shared_spell_id is not null) as associazioni_condivise_rimanenti,
  (select count(*) from public.character_spells where custom_spell is not null) as incantesimi_personalizzati_preservati,
  (select count(*) from public.character_spells where custom_spell ? 'legacy_shared_spell_id') as vecchie_associazioni_convertite;
