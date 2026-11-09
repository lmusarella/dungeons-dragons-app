-- Porta i codici invito delle stanze esistenti da 16 a 6 caratteri.
-- Eseguire una volta nel SQL Editor di Supabase sulle installazioni già attive.
BEGIN;

ALTER TABLE public.game_rooms
  DROP CONSTRAINT IF EXISTS game_rooms_invite_code_check;

DO $$
DECLARE
  v_room record;
  v_code text;
BEGIN
  FOR v_room IN SELECT id FROM public.game_rooms LOOP
    LOOP
      v_code := lpad((floor(random() * 1000000))::integer::text, 6, '0');
      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM public.game_rooms
        WHERE invite_code = v_code AND id <> v_room.id
      );
    END LOOP;
    UPDATE public.game_rooms SET invite_code = v_code WHERE id = v_room.id;
  END LOOP;
END $$;

ALTER TABLE public.game_rooms
  ALTER COLUMN invite_code SET DEFAULT lpad((floor(random() * 1000000))::integer::text, 6, '0');

ALTER TABLE public.game_rooms
  ADD CONSTRAINT game_rooms_invite_code_check
  CHECK (invite_code ~ '^[0-9]{6}$');

CREATE OR REPLACE FUNCTION public.rotate_game_room_invite(p_room_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_code text;
BEGIN
  IF NOT dnd_game_private.is_game_master(p_room_id) THEN
    RAISE EXCEPTION 'Solo il master puo'' cambiare codice';
  END IF;
  LOOP
    v_code := lpad((floor(random() * 1000000))::integer::text, 6, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.game_rooms WHERE invite_code = v_code);
  END LOOP;
  UPDATE public.game_rooms SET invite_code = v_code
  WHERE id = p_room_id RETURNING invite_code INTO v_code;
  RETURN v_code;
END; $$;

REVOKE ALL ON FUNCTION public.rotate_game_room_invite(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rotate_game_room_invite(uuid) TO authenticated;

COMMIT;
