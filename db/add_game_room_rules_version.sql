BEGIN;

ALTER TABLE public.game_rooms
  ADD COLUMN IF NOT EXISTS rules_version text NOT NULL DEFAULT '2014';

ALTER TABLE public.game_rooms
  DROP CONSTRAINT IF EXISTS game_rooms_rules_version_check;

ALTER TABLE public.game_rooms
  ADD CONSTRAINT game_rooms_rules_version_check
  CHECK (rules_version IN ('2014','2024'));

CREATE OR REPLACE FUNCTION public.create_game_room(
  p_title text,
  p_description text,
  p_max_players integer,
  p_rules_version text DEFAULT '2014'
) RETURNS public.game_rooms
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
  IF p_rules_version NOT IN ('2014','2024') THEN
    RAISE EXCEPTION 'Edizione delle regole non valida';
  END IF;

  INSERT INTO public.game_rooms(master_user_id,title,description,max_players,rules_version)
  VALUES(v_uid,btrim(p_title),nullif(btrim(coalesce(p_description,'')),''),p_max_players::smallint,p_rules_version)
  RETURNING * INTO v_room;
  RETURN v_room;
END;
$$;

REVOKE ALL ON FUNCTION public.create_game_room(text,text,integer,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_game_room(text,text,integer,text) TO authenticated;

COMMIT;
