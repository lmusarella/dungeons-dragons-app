-- Estende le mappe tattiche con griglie grandi, terreno difficile e ostacoli.
-- Migrazione additiva da applicare dopo db/dnd_stanze_battaglia.sql.
begin;

alter table public.game_maps drop constraint if exists game_maps_grid_columns_check;
alter table public.game_maps drop constraint if exists game_maps_grid_rows_check;
alter table public.game_maps add constraint game_maps_grid_columns_check check (grid_columns between 1 and 5000);
alter table public.game_maps add constraint game_maps_grid_rows_check check (grid_rows between 1 and 5000);

update public.game_maps
set grid_columns = least(5000, greatest(1, ceil(image_width_px / grid_cell_size_px)::integer)),
    grid_rows = least(5000, greatest(1, ceil(image_height_px / grid_cell_size_px)::integer))
where image_width_px is not null and image_height_px is not null;

create table if not exists public.game_map_cells (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null,
  map_id uuid not null,
  grid_x smallint not null check (grid_x >= 0),
  grid_y smallint not null check (grid_y >= 0),
  cell_type text not null check (cell_type in ('difficult','obstacle')),
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint game_map_cells_map_room_fk foreign key (room_id,map_id)
    references public.game_maps(room_id,id) on delete cascade,
  constraint game_map_cells_position_unique unique(map_id,grid_x,grid_y)
);

create index if not exists game_map_cells_room_map_idx on public.game_map_cells(room_id,map_id);
alter table public.game_map_cells enable row level security;
grant select,insert,update,delete on public.game_map_cells to authenticated;

drop policy if exists game_map_cells_read on public.game_map_cells;
drop policy if exists game_map_cells_insert_master on public.game_map_cells;
drop policy if exists game_map_cells_update_master on public.game_map_cells;
drop policy if exists game_map_cells_delete_master on public.game_map_cells;
create policy game_map_cells_read on public.game_map_cells for select to authenticated
  using (dnd_game_private.is_game_participant(room_id));
create policy game_map_cells_insert_master on public.game_map_cells for insert to authenticated
  with check (dnd_game_private.is_game_master(room_id) and created_by=(select auth.uid()));
create policy game_map_cells_update_master on public.game_map_cells for update to authenticated
  using (dnd_game_private.is_game_master(room_id)) with check (dnd_game_private.is_game_master(room_id));
create policy game_map_cells_delete_master on public.game_map_cells for delete to authenticated
  using (dnd_game_private.is_game_master(room_id));

create or replace function dnd_game_private.game_map_cell_validate()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_cols integer; v_rows integer;
begin
  select grid_columns,grid_rows into v_cols,v_rows from public.game_maps
  where id=new.map_id and room_id=new.room_id;
  if not found then raise exception 'Mappa inesistente'; end if;
  if new.grid_x >= v_cols or new.grid_y >= v_rows then raise exception 'Cella fuori dalla griglia'; end if;
  if tg_op='UPDATE' and (new.room_id<>old.room_id or new.map_id<>old.map_id or new.id<>old.id or new.created_by<>old.created_by) then
    raise exception 'Identificativi cella immutabili';
  end if;
  new.updated_at := now();
  return new;
end; $$;

drop trigger if exists game_map_cells_validate on public.game_map_cells;
create trigger game_map_cells_validate before insert or update on public.game_map_cells
for each row execute function dnd_game_private.game_map_cell_validate();

drop function if exists public.get_game_room_participants(uuid);
create function public.get_game_room_participants(p_room_id uuid)
returns table(
  user_id uuid, character_id uuid, display_name text, character_name text,
  avatar_url text, hp_current text, hp_max text, speed_m text
) language sql stable security definer set search_path = '' as $$
  select member.user_id,member.character_id,member.display_name,character.name,
    nullif(character.data->>'avatar_url',''),character.data#>>'{hp,current}',
    character.data#>>'{hp,max}',character.data->>'speed'
  from public.game_room_members as member
  left join public.characters as character on character.id=member.character_id
  where member.room_id=p_room_id and member.membership_status='joined'
    and dnd_game_private.is_game_participant(p_room_id)
  order by member.joined_at;
$$;
revoke all on function public.get_game_room_participants(uuid) from public;
grant execute on function public.get_game_room_participants(uuid) to authenticated;

create or replace function public.place_own_game_token(
  p_room_id uuid,p_map_id uuid,p_grid_x integer,p_grid_y integer
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := (select auth.uid()); v_character public.characters%rowtype; v_token_id uuid;
begin
  if v_uid is null then raise exception 'Autenticazione richiesta'; end if;
  select character.* into v_character from public.game_room_members as member
  join public.characters as character on character.id=member.character_id
  where member.room_id=p_room_id and member.user_id=v_uid
    and member.membership_status='joined' and character.user_id=v_uid;
  if not found then raise exception 'Nessun personaggio associato alla stanza'; end if;
  if not exists(select 1 from public.game_maps where id=p_map_id and room_id=p_room_id) then raise exception 'Mappa non valida'; end if;
  select id into v_token_id from public.game_map_tokens where room_id=p_room_id and map_id=p_map_id
    and token_type='character' and character_id=v_character.id order by created_at limit 1;
  if v_token_id is not null then
    update public.game_map_tokens set grid_x=p_grid_x,grid_y=p_grid_y,is_removed=false,
      token_data=jsonb_build_object('hp',coalesce(v_character.data->'hp','{}'::jsonb),'speed_m',coalesce((nullif(v_character.data->>'speed',''))::numeric,9))
    where id=v_token_id;
    return v_token_id;
  end if;
  insert into public.game_map_tokens(room_id,map_id,token_type,character_id,owner_user_id,name,image_url,grid_x,grid_y,created_by,token_data)
  values(p_room_id,p_map_id,'character',v_character.id,v_uid,v_character.name,nullif(v_character.data->>'avatar_url',''),p_grid_x,p_grid_y,v_uid,
    jsonb_build_object('hp',coalesce(v_character.data->'hp','{}'::jsonb),'speed_m',coalesce((nullif(v_character.data->>'speed',''))::numeric,9)))
  returning id into v_token_id;
  return v_token_id;
end; $$;
revoke all on function public.place_own_game_token(uuid,uuid,integer,integer) from public;
grant execute on function public.place_own_game_token(uuid,uuid,integer,integer) to authenticated;

notify pgrst, 'reload schema';
select pg_notify('pgrst','reload schema');
commit;
