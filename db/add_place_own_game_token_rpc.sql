-- Consente a un partecipante di posizionare esclusivamente il proprio personaggio.
BEGIN;

CREATE OR REPLACE FUNCTION public.place_own_game_token(
  p_room_id uuid,
  p_map_id uuid,
  p_grid_x integer,
  p_grid_y integer
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_character public.characters%ROWTYPE;
  v_token_id uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Autenticazione richiesta'; END IF;
  SELECT character.* INTO v_character
  FROM public.game_room_members AS member
  JOIN public.characters AS character ON character.id=member.character_id
  WHERE member.room_id=p_room_id AND member.user_id=v_uid
    AND member.membership_status='joined' AND character.user_id=v_uid;
  IF NOT FOUND THEN RAISE EXCEPTION 'Nessun personaggio associato alla stanza'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.game_maps WHERE id=p_map_id AND room_id=p_room_id) THEN
    RAISE EXCEPTION 'Mappa non valida';
  END IF;

  SELECT id INTO v_token_id FROM public.game_map_tokens
  WHERE room_id=p_room_id AND map_id=p_map_id
    AND token_type='character' AND character_id=v_character.id
  ORDER BY created_at LIMIT 1;

  IF v_token_id IS NOT NULL THEN
    UPDATE public.game_map_tokens
    SET grid_x=p_grid_x,grid_y=p_grid_y,is_removed=false,
        token_data=jsonb_build_object('hp',coalesce(v_character.data->'hp','{}'::jsonb))
    WHERE id=v_token_id;
    RETURN v_token_id;
  END IF;

  INSERT INTO public.game_map_tokens(
    room_id,map_id,token_type,character_id,owner_user_id,name,
    image_url,grid_x,grid_y,created_by,token_data
  ) VALUES(
    p_room_id,p_map_id,'character',v_character.id,v_uid,v_character.name,
    nullif(v_character.data->>'avatar_url',''),p_grid_x,p_grid_y,v_uid,
    jsonb_build_object('hp',coalesce(v_character.data->'hp','{}'::jsonb))
  ) RETURNING id INTO v_token_id;
  RETURN v_token_id;
END; $$;

REVOKE ALL ON FUNCTION public.place_own_game_token(uuid,uuid,integer,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_own_game_token(uuid,uuid,integer,integer) TO authenticated;

COMMIT;
