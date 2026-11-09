-- Profili minimi dei partecipanti, leggibili soltanto da chi appartiene alla stanza.
BEGIN;

CREATE OR REPLACE FUNCTION public.get_game_room_participants(p_room_id uuid)
RETURNS TABLE(
  user_id uuid,
  character_id uuid,
  display_name text,
  character_name text,
  avatar_url text
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT
    member.user_id,
    member.character_id,
    member.display_name,
    character.name,
    nullif(character.data->>'avatar_url','')
  FROM public.game_room_members AS member
  LEFT JOIN public.characters AS character ON character.id=member.character_id
  WHERE member.room_id=p_room_id
    AND member.membership_status='joined'
    AND dnd_game_private.is_game_participant(p_room_id)
  ORDER BY member.joined_at;
$$;

REVOKE ALL ON FUNCTION public.get_game_room_participants(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_game_room_participants(uuid) TO authenticated;

COMMIT;
