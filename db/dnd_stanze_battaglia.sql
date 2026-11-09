-- ================================================================
-- D&D: stanze multiplayer e mappe tattiche - migrazione additiva v1
-- Per Supabase PostgreSQL 15+. Eseguire una sola volta (SQL Editor).
-- Prerequisiti: auth.users, public.characters(id uuid PK,user_id uuid),
-- public.shared_creatures(id uuid PK) (catalogo creato nel passo precedente).
-- Non modifica i dati dei personaggi né i cataloghi shared.
-- ================================================================
BEGIN;

CREATE SCHEMA IF NOT EXISTS dnd_game_private;
REVOKE ALL ON SCHEMA dnd_game_private FROM PUBLIC;
GRANT USAGE ON SCHEMA dnd_game_private TO authenticated;

-- 1. ROOM --------------------------------------------------------
CREATE TABLE public.game_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  master_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 120),
  description text,
  invite_code text NOT NULL DEFAULT lpad((floor(random() * 1000000))::integer::text, 6, '0')
    UNIQUE CHECK (invite_code ~ '^[0-9]{6}$'),
  status text NOT NULL DEFAULT 'lobby' CHECK (status IN ('lobby','active','closed')),
  max_players smallint NOT NULL DEFAULT 8 CHECK (max_players BETWEEN 1 AND 20),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX game_rooms_master_idx ON public.game_rooms(master_user_id);

-- 2. MEMBERSHIP: il master e' gia' identificato in game_rooms; 
--    i giocatori restano iscritti anche quando si disconnettono.
CREATE TABLE public.game_room_members (
  room_id uuid NOT NULL REFERENCES public.game_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  character_id uuid REFERENCES public.characters(id) ON DELETE SET NULL,
  display_name text NOT NULL DEFAULT 'Giocatore' CHECK (length(btrim(display_name)) BETWEEN 1 AND 60),
  membership_status text NOT NULL DEFAULT 'joined'
    CHECK (membership_status IN ('joined','left','kicked')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (room_id,user_id)
);
CREATE UNIQUE INDEX game_room_members_character_unique
  ON public.game_room_members(room_id,character_id) WHERE character_id IS NOT NULL;
CREATE INDEX game_room_members_user_idx ON public.game_room_members(user_id, membership_status);
CREATE INDEX game_room_members_room_status_idx ON public.game_room_members(room_id, membership_status);

-- 3. MAPS: immagine in Storage; geometria relativa ai pixel NATIVI
--    dell'immagine. Griglia a celle quadrate; 1 pedina = N celle.
CREATE TABLE public.game_maps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.game_rooms(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 120),
  image_storage_path text,
  image_width_px integer CHECK (image_width_px BETWEEN 1 AND 12000),
  image_height_px integer CHECK (image_height_px BETWEEN 1 AND 12000),
  grid_columns smallint NOT NULL DEFAULT 20 CHECK (grid_columns BETWEEN 1 AND 250),
  grid_rows smallint NOT NULL DEFAULT 15 CHECK (grid_rows BETWEEN 1 AND 250),
  grid_cell_size_px numeric(8,2) NOT NULL DEFAULT 64 CHECK (grid_cell_size_px BETWEEN 4 AND 1000),
  grid_offset_x_px numeric(9,2) NOT NULL DEFAULT 0,
  grid_offset_y_px numeric(9,2) NOT NULL DEFAULT 0,
  grid_color text NOT NULL DEFAULT '#000000' CHECK (grid_color ~ '^#[0-9A-Fa-f]{6}$'),
  grid_opacity numeric(3,2) NOT NULL DEFAULT 0.40 CHECK (grid_opacity BETWEEN 0 AND 1),
  grid_visible boolean NOT NULL DEFAULT true,
  feet_per_cell numeric(5,2) NOT NULL DEFAULT 5 CHECK (feet_per_cell > 0),
  is_active boolean NOT NULL DEFAULT false,
  created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT game_maps_room_id_id_unique UNIQUE(room_id,id),
  CONSTRAINT game_maps_image_dimensions_pair CHECK (
    (image_width_px IS NULL AND image_height_px IS NULL) OR
    (image_width_px IS NOT NULL AND image_height_px IS NOT NULL)
  ),
  CONSTRAINT game_maps_image_path_room CHECK (
    image_storage_path IS NULL OR
    left(image_storage_path, length(room_id::text || '/' || id::text || '/'))
      = room_id::text || '/' || id::text || '/'
  )
);
CREATE UNIQUE INDEX game_maps_one_active_per_room
  ON public.game_maps(room_id) WHERE is_active;
CREATE INDEX game_maps_room_idx ON public.game_maps(room_id);

-- 4. TOKENS: posizioni a coordinate di CELLA (zero based).
--    Usa l'ID del personaggio gia' esistente o del bestiario condiviso.
CREATE TABLE public.game_map_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL,
  map_id uuid NOT NULL,
  token_type text NOT NULL CHECK (token_type IN ('character','creature','custom')),
  character_id uuid REFERENCES public.characters(id) ON DELETE CASCADE,
  shared_creature_id uuid REFERENCES public.shared_creatures(id) ON DELETE CASCADE,
  owner_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 100),
  grid_x smallint NOT NULL CHECK (grid_x >= 0),
  grid_y smallint NOT NULL CHECK (grid_y >= 0),
  size_columns smallint NOT NULL DEFAULT 1 CHECK (size_columns BETWEEN 1 AND 20),
  size_rows smallint NOT NULL DEFAULT 1 CHECK (size_rows BETWEEN 1 AND 20),
  image_url text,
  is_hidden boolean NOT NULL DEFAULT false,
  is_removed boolean NOT NULL DEFAULT false,
  initiative integer,
  notes text,
  token_data jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(token_data)='object'),
  created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT game_map_tokens_map_room_fk
    FOREIGN KEY (room_id,map_id) REFERENCES public.game_maps(room_id,id) ON DELETE CASCADE,
  CONSTRAINT game_map_tokens_type_ref_check CHECK (
    (token_type='character' AND character_id IS NOT NULL AND shared_creature_id IS NULL AND owner_user_id IS NOT NULL) OR
    (token_type='creature' AND character_id IS NULL AND shared_creature_id IS NOT NULL AND owner_user_id IS NULL) OR
    (token_type='custom' AND character_id IS NULL AND shared_creature_id IS NULL AND owner_user_id IS NULL)
  )
);
CREATE INDEX game_map_tokens_room_map_idx ON public.game_map_tokens(room_id,map_id);
CREATE INDEX game_map_tokens_owner_idx ON public.game_map_tokens(owner_user_id);
CREATE INDEX game_map_tokens_character_idx ON public.game_map_tokens(character_id) WHERE character_id IS NOT NULL;

-- 5. SECURITY HELPERS: SECURITY DEFINER per evitare ricorsione RLS
--    e non esporre membership/characters di altre persone.
CREATE FUNCTION dnd_game_private.is_game_master(p_room_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.game_rooms r
    WHERE r.id = p_room_id AND r.master_user_id = (SELECT auth.uid())
  );
$$;

CREATE FUNCTION dnd_game_private.is_game_participant(p_room_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.game_rooms r WHERE r.id = p_room_id AND (
      r.master_user_id = (SELECT auth.uid()) OR
      EXISTS (
        SELECT 1 FROM public.game_room_members m
        WHERE m.room_id = r.id AND m.user_id = (SELECT auth.uid())
          AND m.membership_status = 'joined'
      )
    )
  );
$$;

REVOKE ALL ON FUNCTION dnd_game_private.is_game_master(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION dnd_game_private.is_game_participant(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION dnd_game_private.is_game_master(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION dnd_game_private.is_game_participant(uuid) TO authenticated;

-- 6. TRIGGERS: modelli, ownership e limiti della mappa.
CREATE FUNCTION dnd_game_private.game_touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END; $$;

CREATE FUNCTION dnd_game_private.game_member_validate()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND
    (NEW.room_id <> OLD.room_id OR NEW.user_id <> OLD.user_id) THEN
    RAISE EXCEPTION 'Impossibile cambiare stanza o utente del membro';
  END IF;
  IF NEW.character_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.characters c
    WHERE c.id = NEW.character_id AND c.user_id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'Il personaggio non appartiene al giocatore';
  END IF;
  RETURN NEW;
END; $$;

CREATE FUNCTION dnd_game_private.game_map_validate()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND
     (NEW.id <> OLD.id OR NEW.room_id <> OLD.room_id OR NEW.created_by <> OLD.created_by)
  THEN RAISE EXCEPTION 'Identificativi mappa immutabili'; END IF;
  RETURN NEW;
END; $$;

CREATE FUNCTION dnd_game_private.game_token_validate()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_cols integer;
  v_rows integer;
  v_char_owner uuid;
BEGIN
  SELECT grid_columns,grid_rows INTO v_cols,v_rows
  FROM public.game_maps WHERE id=NEW.map_id AND room_id=NEW.room_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Mappa inesistente'; END IF;
  IF NEW.grid_x::integer + NEW.size_columns::integer > v_cols OR
     NEW.grid_y::integer + NEW.size_rows::integer > v_rows THEN
    RAISE EXCEPTION 'Pedina fuori dalla griglia';
  END IF;

  IF TG_OP='UPDATE' THEN
    IF NEW.room_id <> OLD.room_id OR NEW.map_id <> OLD.map_id OR
       NEW.id <> OLD.id OR NEW.created_by <> OLD.created_by THEN
      RAISE EXCEPTION 'Non puoi spostare una pedina tra mappe';
    END IF;
    -- Un giocatore non-master puo' aggiornare solo le coordinate.
    IF (SELECT auth.uid()) IS NOT NULL AND
       NOT dnd_game_private.is_game_master(NEW.room_id) THEN
      IF OLD.owner_user_id IS DISTINCT FROM (SELECT auth.uid()) OR
         (to_jsonb(NEW) - ARRAY['grid_x','grid_y','updated_at']) IS DISTINCT FROM
         (to_jsonb(OLD) - ARRAY['grid_x','grid_y','updated_at']) THEN
        RAISE EXCEPTION 'Solo il master puo'' modificare i dati della pedina';
      END IF;
    END IF;
  END IF;

  IF NEW.token_type = 'character' THEN
    SELECT c.user_id INTO v_char_owner
    FROM public.characters c WHERE c.id=NEW.character_id;
    IF v_char_owner IS NULL OR v_char_owner <> NEW.owner_user_id THEN
      RAISE EXCEPTION 'La pedina non corrisponde al proprietario del personaggio';
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM public.game_rooms r
      WHERE r.id=NEW.room_id AND r.master_user_id=NEW.owner_user_id
    ) AND NOT EXISTS (
      SELECT 1 FROM public.game_room_members m
      WHERE m.room_id=NEW.room_id AND m.user_id=NEW.owner_user_id
        AND m.character_id=NEW.character_id AND m.membership_status='joined'
    ) THEN
      RAISE EXCEPTION 'Personaggio non assegnato a un membro attivo';
    END IF;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER game_rooms_touch BEFORE UPDATE ON public.game_rooms
  FOR EACH ROW EXECUTE FUNCTION dnd_game_private.game_touch_updated_at();
CREATE TRIGGER game_room_members_a_touch BEFORE UPDATE ON public.game_room_members
  FOR EACH ROW EXECUTE FUNCTION dnd_game_private.game_touch_updated_at();
CREATE TRIGGER game_room_members_z_check BEFORE INSERT OR UPDATE ON public.game_room_members
  FOR EACH ROW EXECUTE FUNCTION dnd_game_private.game_member_validate();
CREATE TRIGGER game_maps_a_touch BEFORE UPDATE ON public.game_maps
  FOR EACH ROW EXECUTE FUNCTION dnd_game_private.game_touch_updated_at();
CREATE TRIGGER game_maps_z_check BEFORE INSERT OR UPDATE ON public.game_maps
  FOR EACH ROW EXECUTE FUNCTION dnd_game_private.game_map_validate();
CREATE TRIGGER game_map_tokens_a_touch BEFORE UPDATE ON public.game_map_tokens
  FOR EACH ROW EXECUTE FUNCTION dnd_game_private.game_touch_updated_at();
CREATE TRIGGER game_map_tokens_z_check BEFORE INSERT OR UPDATE ON public.game_map_tokens
  FOR EACH ROW EXECUTE FUNCTION dnd_game_private.game_token_validate();

-- 7. RLS ---------------------------------------------------------
ALTER TABLE public.game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_map_tokens ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.game_rooms, public.game_room_members,
  public.game_maps,public.game_map_tokens FROM anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.game_rooms TO authenticated;
GRANT SELECT ON public.game_room_members TO authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.game_maps TO authenticated;
GRANT SELECT,INSERT,UPDATE ON public.game_map_tokens TO authenticated;

CREATE POLICY gr_read ON public.game_rooms FOR SELECT TO authenticated
  USING (dnd_game_private.is_game_participant(id));
CREATE POLICY gr_create ON public.game_rooms FOR INSERT TO authenticated
  WITH CHECK (master_user_id = (SELECT auth.uid()));
CREATE POLICY gr_edit ON public.game_rooms FOR UPDATE TO authenticated
  USING (dnd_game_private.is_game_master(id))
  WITH CHECK (master_user_id=(SELECT auth.uid()));
CREATE POLICY gr_delete ON public.game_rooms FOR DELETE TO authenticated
  USING (dnd_game_private.is_game_master(id));

CREATE POLICY gm_read ON public.game_room_members FOR SELECT TO authenticated
  USING (dnd_game_private.is_game_participant(room_id));
-- Le scritture su game_room_members sono consentite SOLO alle RPC sicure.

CREATE POLICY gmap_read ON public.game_maps FOR SELECT TO authenticated
  USING (dnd_game_private.is_game_participant(room_id));
CREATE POLICY gmap_insert ON public.game_maps FOR INSERT TO authenticated
  WITH CHECK (dnd_game_private.is_game_master(room_id) AND created_by=(SELECT auth.uid()));
CREATE POLICY gmap_update ON public.game_maps FOR UPDATE TO authenticated
  USING (dnd_game_private.is_game_master(room_id))
  WITH CHECK (dnd_game_private.is_game_master(room_id));
CREATE POLICY gmap_delete ON public.game_maps FOR DELETE TO authenticated
  USING (dnd_game_private.is_game_master(room_id));

CREATE POLICY gtoken_read ON public.game_map_tokens FOR SELECT TO authenticated
  USING (dnd_game_private.is_game_participant(room_id) AND (
    NOT is_hidden OR dnd_game_private.is_game_master(room_id) OR owner_user_id=(SELECT auth.uid())
  ));
CREATE POLICY gtoken_insert ON public.game_map_tokens FOR INSERT TO authenticated
  WITH CHECK (dnd_game_private.is_game_master(room_id) AND created_by=(SELECT auth.uid()));
CREATE POLICY gtoken_update ON public.game_map_tokens FOR UPDATE TO authenticated
  USING (dnd_game_private.is_game_participant(room_id) AND (
    dnd_game_private.is_game_master(room_id) OR
    (token_type='character' AND owner_user_id=(SELECT auth.uid()))
  ))
  WITH CHECK (dnd_game_private.is_game_participant(room_id) AND (
    dnd_game_private.is_game_master(room_id) OR
    (token_type='character' AND owner_user_id=(SELECT auth.uid()))
  ));
-- Eliminazione logica is_removed=true gestita solo dal master.

-- 8. RPC: creazione sicura e JOIN con invito segreto.
--    Il master viene sempre ricavato dalla sessione, mai accettato dal client.
CREATE FUNCTION public.create_game_room(
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

CREATE FUNCTION public.join_game_room(
  p_invite_code text,
  p_character_id uuid DEFAULT NULL,
  p_display_name text DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_room public.game_rooms%ROWTYPE;
  v_status text;
  v_count integer;
  v_name text;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Autenticazione richiesta'; END IF;
  SELECT * INTO v_room FROM public.game_rooms
    WHERE invite_code=upper(btrim(p_invite_code)) FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Codice stanza non valido'; END IF;
  IF v_room.master_user_id=v_uid THEN RETURN v_room.id; END IF;
  IF v_room.status='closed' THEN RAISE EXCEPTION 'Stanza chiusa'; END IF;
  IF p_character_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.characters c WHERE c.id=p_character_id AND c.user_id=v_uid
  ) THEN RAISE EXCEPTION 'Personaggio non tuo'; END IF;
  SELECT membership_status INTO v_status FROM public.game_room_members
  WHERE room_id=v_room.id AND user_id=v_uid;
  IF v_status='kicked' THEN RAISE EXCEPTION 'Accesso revocato dal master'; END IF;
  IF v_status IS DISTINCT FROM 'joined' THEN
    SELECT count(*) INTO v_count FROM public.game_room_members
      WHERE room_id=v_room.id AND membership_status='joined';
    IF v_count >= v_room.max_players THEN RAISE EXCEPTION 'Stanza piena'; END IF;
  END IF;
  v_name := left(coalesce(nullif(btrim(p_display_name),''),'Giocatore'),60);
  INSERT INTO public.game_room_members(room_id,user_id,character_id,display_name)
  VALUES(v_room.id,v_uid,p_character_id,v_name)
  ON CONFLICT (room_id,user_id) DO UPDATE SET
    membership_status='joined',
    character_id=EXCLUDED.character_id,
    display_name=EXCLUDED.display_name,
    joined_at=now();
  RETURN v_room.id;
END; $$;

CREATE FUNCTION public.set_game_room_character(p_room_id uuid,p_character_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN RAISE EXCEPTION 'Autenticazione richiesta'; END IF;
  IF p_character_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.characters c WHERE c.id=p_character_id AND c.user_id=(SELECT auth.uid())
  ) THEN RAISE EXCEPTION 'Personaggio non tuo'; END IF;
  UPDATE public.game_room_members SET character_id=p_character_id
  WHERE room_id=p_room_id AND user_id=(SELECT auth.uid()) AND membership_status='joined';
  IF NOT FOUND THEN RAISE EXCEPTION 'Non sei un giocatore attivo'; END IF;
END; $$;

CREATE FUNCTION public.leave_game_room(p_room_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN RAISE EXCEPTION 'Autenticazione richiesta'; END IF;
  UPDATE public.game_room_members SET membership_status='left'
  WHERE room_id=p_room_id AND user_id=(SELECT auth.uid()) AND membership_status='joined';
  IF NOT FOUND THEN RAISE EXCEPTION 'Non sei iscritto a questa stanza'; END IF;
END; $$;

CREATE FUNCTION public.kick_game_room_member(p_room_id uuid,p_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF NOT dnd_game_private.is_game_master(p_room_id) THEN
    RAISE EXCEPTION 'Solo il master puo'' rimuovere partecipanti';
  END IF;
  UPDATE public.game_room_members SET membership_status='kicked',character_id=NULL
  WHERE room_id=p_room_id AND user_id=p_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Giocatore non trovato'; END IF;
END; $$;

CREATE FUNCTION public.activate_game_map(p_room_id uuid,p_map_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF NOT dnd_game_private.is_game_master(p_room_id) THEN
    RAISE EXCEPTION 'Solo il master puo'' cambiare mappa'; END IF;
  PERFORM 1 FROM public.game_rooms WHERE id=p_room_id FOR UPDATE;
  IF NOT EXISTS(SELECT 1 FROM public.game_maps
                WHERE id=p_map_id AND room_id=p_room_id) THEN
    RAISE EXCEPTION 'Mappa non trovata nella stanza'; END IF;
  UPDATE public.game_maps SET is_active=false
    WHERE room_id=p_room_id AND is_active;
  UPDATE public.game_maps SET is_active=true
    WHERE id=p_map_id AND room_id=p_room_id;
END; $$;

CREATE FUNCTION public.rotate_game_room_invite(p_room_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_code text;
BEGIN
  IF NOT dnd_game_private.is_game_master(p_room_id) THEN
    RAISE EXCEPTION 'Solo il master puo'' cambiare codice'; END IF;
  LOOP
    v_code := lpad((floor(random() * 1000000))::integer::text,6,'0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.game_rooms WHERE invite_code=v_code);
  END LOOP;
  UPDATE public.game_rooms SET invite_code=v_code WHERE id=p_room_id;
  RETURN v_code;
END; $$;

REVOKE ALL ON FUNCTION public.create_game_room(text,text,integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.join_game_room(text,uuid,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_game_room_character(uuid,uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.leave_game_room(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.kick_game_room_member(uuid,uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.activate_game_map(uuid,uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.rotate_game_room_invite(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_game_room(text,text,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_game_room(text,uuid,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_game_room_character(uuid,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.leave_game_room(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.kick_game_room_member(uuid,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.activate_game_map(uuid,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rotate_game_room_invite(uuid) TO authenticated;

-- 9. STORAGE: bucket privato; path = room_uuid/map_uuid/filename.png
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
VALUES('game-maps','game-maps',false,10485760,
       ARRAY['image/png','image/jpeg','image/webp'])
ON CONFLICT (id) DO NOTHING;
DO $$ BEGIN
  IF EXISTS(SELECT 1 FROM storage.buckets WHERE id='game-maps' AND public) THEN
    RAISE EXCEPTION 'Il bucket game-maps esiste ma e'' pubblico: impostarlo privato prima della migrazione';
  END IF;
END $$;

CREATE FUNCTION dnd_game_private.can_use_game_map_storage(p_path text,p_write boolean)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_room text := split_part(p_path,'/',1);
  v_map text := split_part(p_path,'/',2);
BEGIN
  IF v_room !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    OR v_map !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    OR split_part(p_path,'/',3) = '' THEN
    RETURN false;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.game_maps m
    WHERE m.id=v_map::uuid AND m.room_id=v_room::uuid
      AND CASE WHEN p_write THEN dnd_game_private.is_game_master(m.room_id)
               ELSE dnd_game_private.is_game_participant(m.room_id) END
  );
END; $$;
REVOKE ALL ON FUNCTION dnd_game_private.can_use_game_map_storage(text,boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION dnd_game_private.can_use_game_map_storage(text,boolean) TO authenticated;

CREATE POLICY game_map_storage_read ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id='game-maps' AND dnd_game_private.can_use_game_map_storage(name,false));
CREATE POLICY game_map_storage_upload ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id='game-maps' AND dnd_game_private.can_use_game_map_storage(name,true));
CREATE POLICY game_map_storage_update ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id='game-maps' AND dnd_game_private.can_use_game_map_storage(name,true))
  WITH CHECK (bucket_id='game-maps' AND dnd_game_private.can_use_game_map_storage(name,true));
CREATE POLICY game_map_storage_delete ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id='game-maps' AND dnd_game_private.can_use_game_map_storage(name,true));

-- 10. REALTIME POSTGRES CHANGES: replica dei dati persistenti.
-- L'operazione non modifica le publication options delle altre tabelle.
DO $$
DECLARE v_table text;
BEGIN
  FOREACH v_table IN ARRAY ARRAY[
    'game_rooms','game_room_members','game_maps','game_map_tokens'
  ] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname='supabase_realtime' AND schemaname='public'
        AND tablename=v_table
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I',v_table);
    END IF;
  END LOOP;
END $$;

-- Realtime Presence/Broadcast privati: topic "game-room:<room_uuid>".
CREATE FUNCTION dnd_game_private.can_join_game_realtime(p_topic text)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_room text;
BEGIN
  IF split_part(p_topic,':',1) <> 'game-room' THEN RETURN false; END IF;
  v_room := split_part(p_topic,':',2);
  IF p_topic <> 'game-room:' || v_room OR
     v_room !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  THEN RETURN false; END IF;
  RETURN dnd_game_private.is_game_participant(v_room::uuid);
END; $$;
REVOKE ALL ON FUNCTION dnd_game_private.can_join_game_realtime(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION dnd_game_private.can_join_game_realtime(text) TO authenticated;

-- realtime.messages ha gia' RLS abilitata in Supabase.
CREATE POLICY game_realtime_receive ON realtime.messages FOR SELECT TO authenticated
  USING (dnd_game_private.can_join_game_realtime(realtime.topic()));
CREATE POLICY game_realtime_send ON realtime.messages FOR INSERT TO authenticated
  WITH CHECK (dnd_game_private.can_join_game_realtime(realtime.topic()));

COMMIT;
