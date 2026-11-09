-- Correzione additiva per installazioni che hanno già eseguito
-- db/dnd_stanze_battaglia.sql prima dell'introduzione della RPC.
-- La creazione non accetta master_user_id dal client: usa auth.uid().
BEGIN;

CREATE OR REPLACE FUNCTION public.create_game_room(
  p_title text,
  p_description text,
  p_max_players integer
) RETURNS public.game_rooms LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_room public.game_rooms%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Autenticazione richiesta'; END IF;
  IF length(btrim(coalesce(p_title,''))) NOT BETWEEN 1 AND 120 THEN
    RAISE EXCEPTION 'Il nome della stanza deve contenere da 1 a 120 caratteri';
  END IF;
  IF p_max_players NOT BETWEEN 1 AND 20 THEN
    RAISE EXCEPTION 'Il numero massimo di giocatori deve essere compreso tra 1 e 20';
  END IF;

  INSERT INTO public.game_rooms(master_user_id,title,description,max_players)
  VALUES(v_uid,btrim(p_title),nullif(btrim(coalesce(p_description,'')),''),p_max_players::smallint)
  RETURNING * INTO v_room;
  RETURN v_room;
END; $$;

REVOKE ALL ON FUNCTION public.create_game_room(text,text,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_game_room(text,text,integer) TO authenticated;

COMMIT;
