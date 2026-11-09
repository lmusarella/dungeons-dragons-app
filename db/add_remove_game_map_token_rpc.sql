-- Rimozione sicura di una pedina, consentita soltanto al master della stanza.
BEGIN;

CREATE OR REPLACE FUNCTION public.remove_game_map_token(
  p_room_id uuid,
  p_map_id uuid,
  p_token_id uuid
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF NOT dnd_game_private.is_game_master(p_room_id) THEN
    RAISE EXCEPTION 'Solo il Dungeon Master può rimuovere una pedina';
  END IF;
  DELETE FROM public.game_map_tokens
  WHERE id=p_token_id AND room_id=p_room_id AND map_id=p_map_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Pedina non trovata'; END IF;
END; $$;

REVOKE ALL ON FUNCTION public.remove_game_map_token(uuid,uuid,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.remove_game_map_token(uuid,uuid,uuid) TO authenticated;

COMMIT;
