-- Rimuove le associazioni duplicate tra personaggio e incantesimo condiviso
-- e impedisce che vengano ricreate. Eseguire una sola volta su Supabase.
begin;

with ranked_links as (
  select
    id,
    row_number() over (
      partition by character_id, shared_spell_id
      order by
        case prep_state
          when 'always' then 3
          when 'prepared' then 2
          else 1
        end desc,
        created_at asc,
        id asc
    ) as duplicate_rank
  from public.character_spells
  where shared_spell_id is not null
)
delete from public.character_spells as character_spell
using ranked_links
where character_spell.id = ranked_links.id
  and ranked_links.duplicate_rank > 1;

create unique index if not exists character_spells_character_shared_spell_uidx
  on public.character_spells (character_id, shared_spell_id)
  where shared_spell_id is not null;

commit;
