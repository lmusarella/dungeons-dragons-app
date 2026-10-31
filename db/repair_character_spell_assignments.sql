-- Ripara associazioni incantesimo legacy e rende le policy indipendenti
-- da un eventuale user_id sporco nella riga di character_spells.
begin;

update public.character_spells as spell_link
set user_id = character.user_id
from public.characters as character
where character.id = spell_link.character_id
  and spell_link.user_id is distinct from character.user_id;

update public.character_spells
set prep_state = 'always_prepared'
where prep_state = 'always';

with ranked_links as (
  select
    id,
    row_number() over (
      partition by character_id, shared_spell_id
      order by
        case prep_state
          when 'always_prepared' then 3
          when 'prepared' then 2
          else 1
        end desc,
        created_at asc,
        id asc
    ) as duplicate_rank
  from public.character_spells
  where shared_spell_id is not null
)
delete from public.character_spells as spell_link
using ranked_links
where spell_link.id = ranked_links.id
  and ranked_links.duplicate_rank > 1;

create unique index if not exists character_spells_character_shared_spell_uidx
  on public.character_spells (character_id, shared_spell_id)
  where shared_spell_id is not null;

alter table public.character_spells enable row level security;

drop policy if exists character_spells_select_own on public.character_spells;
create policy character_spells_select_own
  on public.character_spells for select to authenticated
  using (exists (
    select 1 from public.characters character
    where character.id = character_spells.character_id
      and character.user_id = auth.uid()
  ));

drop policy if exists character_spells_insert_own on public.character_spells;
create policy character_spells_insert_own
  on public.character_spells for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.characters character
      where character.id = character_spells.character_id
        and character.user_id = auth.uid()
    )
  );

drop policy if exists character_spells_update_own on public.character_spells;
create policy character_spells_update_own
  on public.character_spells for update to authenticated
  using (exists (
    select 1 from public.characters character
    where character.id = character_spells.character_id
      and character.user_id = auth.uid()
  ))
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.characters character
      where character.id = character_spells.character_id
        and character.user_id = auth.uid()
    )
  );

drop policy if exists character_spells_delete_own on public.character_spells;
create policy character_spells_delete_own
  on public.character_spells for delete to authenticated
  using (exists (
    select 1 from public.characters character
    where character.id = character_spells.character_id
      and character.user_id = auth.uid()
  ));

commit;
