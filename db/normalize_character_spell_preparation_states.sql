-- Uniforma le associazioni degli incantesimi ai due soli stati supportati.
update public.character_spells
set prep_state = case
  when prep_state in ('always', 'always_prepared') then 'always_prepared'
  else 'prepared'
end
where prep_state is null
   or prep_state not in ('prepared', 'always_prepared');

alter table public.character_spells
  drop constraint if exists character_spells_prep_state_check;

alter table public.character_spells
  add constraint character_spells_prep_state_check
  check (prep_state in ('prepared', 'always_prepared'));

alter table public.character_spells
  alter column prep_state set default 'prepared',
  alter column prep_state set not null;
