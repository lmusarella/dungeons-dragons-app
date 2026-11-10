import { supabase } from '../../lib/supabase.js';

const signedMapUrlCache = new Map();

function unwrap({ data, error }) {
  if (error) throw error;
  return data;
}

async function getSignedMapUrl(path) {
  const cached = signedMapUrlCache.get(path);
  if (cached?.expiresAt > Date.now()) return cached.url;
  const { data, error } = await supabase.storage.from('game-maps').createSignedUrl(path, 3600);
  if (error) throw error;
  const url = data?.signedUrl || '';
  signedMapUrlCache.set(path, { url, expiresAt: Date.now() + 50 * 60 * 1000 });
  return url;
}

export async function fetchGameRooms(userId) {
  const rooms = unwrap(await supabase
    .from('game_rooms')
    .select('id,master_user_id,title,description,invite_code,status,max_players,rules_version,created_at,updated_at')
    .order('updated_at', { ascending: false })) || [];
  if (!rooms.length) return [];
  const members = unwrap(await supabase
    .from('game_room_members')
    .select('room_id,user_id,membership_status')
    .in('room_id', rooms.map((room) => room.id))
    .eq('membership_status', 'joined')) || [];
  const counts = members.reduce((map, member) => map.set(member.room_id, (map.get(member.room_id) || 0) + 1), new Map());
  return rooms.map((room) => ({
    ...room,
    isMaster: String(room.master_user_id) === String(userId),
    participantCount: (counts.get(room.id) || 0) + 1
  }));
}

export async function createGameRoom({ title, description, maxPlayers, rulesVersion = '2014' }) {
  const room = unwrap(await supabase.rpc('create_game_room', {
    p_title: String(title || '').trim(),
    p_description: String(description || '').trim() || null,
    p_max_players: Number(maxPlayers) || 8,
    p_rules_version: String(rulesVersion).includes('2024') ? '2024' : '2014'
  }));
  return Array.isArray(room) ? room[0] : room;
}

export async function joinGameRoom({ inviteCode, characterId, displayName }) {
  return unwrap(await supabase.rpc('join_game_room', {
    p_invite_code: String(inviteCode || '').trim().toUpperCase(),
    p_character_id: characterId || null,
    p_display_name: String(displayName || '').trim() || null
  }));
}

export async function fetchGameRoom(roomId) {
  const room = unwrap(await supabase.from('game_rooms').select('*').eq('id', roomId).single());
  const members = unwrap(await supabase
    .from('game_room_members')
    .select('room_id,user_id,character_id,display_name,membership_status,joined_at,updated_at')
    .eq('room_id', roomId)
    .eq('membership_status', 'joined')
    .order('joined_at')) || [];
  const { data: participantProfiles, error: profilesError } = await supabase.rpc('get_game_room_participants', { p_room_id: roomId });
  let characters = [];
  if (!profilesError) {
    characters = (participantProfiles || []).filter((profile) => profile.character_id).map((profile) => ({
      id: profile.character_id,
      user_id: profile.user_id,
      name: profile.character_name || profile.display_name,
      data: {
        avatar_url: profile.avatar_url || '',
        hp: {
          current: profile.hp_current === null ? null : Number(profile.hp_current),
          max: profile.hp_max === null ? null : Number(profile.hp_max)
        }
      }
    }));
  } else {
    const characterIds = members.map((member) => member.character_id).filter(Boolean);
    characters = characterIds.length
      ? (unwrap(await supabase.from('characters').select('id,user_id,name,data').in('id', characterIds)) || [])
      : [];
  }
  const charactersById = new Map(characters.map((character) => [String(character.id), character]));
  const enrichedMembers = members.map((member) => ({
    ...member,
    character: member.character_id ? charactersById.get(String(member.character_id)) || null : null
  }));
  const rawMaps = unwrap(await supabase.from('game_maps').select('*').eq('room_id', roomId).order('created_at')) || [];
  const maps = await Promise.all(rawMaps.map(async (map) => {
    if (!map.image_storage_path) return { ...map, imageUrl: '' };
    return { ...map, imageUrl: await getSignedMapUrl(map.image_storage_path) };
  }));
  const activeMap = maps.find((map) => map.is_active);
  const tokens = activeMap
    ? (unwrap(await supabase.from('game_map_tokens').select('*').eq('room_id', roomId).eq('map_id', activeMap.id).eq('is_removed', false).order('created_at')) || [])
    : [];
  return { room, members: enrichedMembers, maps, tokens };
}

export async function fetchSharedGameCreatures() {
  const rows = unwrap(await supabase.from('shared_creatures').select('*').limit(250)) || [];
  return rows.map((row) => {
    const data = row.data || row.creature_data || row.stat_block || {};
    const hpSource = data.hp ?? data.hit_points ?? data.hitPoints ?? row.hit_points ?? row.hp ?? {};
    const hp = typeof hpSource === 'number' || typeof hpSource === 'string'
      ? { current: Number(hpSource), max: Number(hpSource) }
      : hpSource;
    return {
      id: row.id,
      name: row.name || data.name || 'Creatura',
      imageUrl: row.image_url || row.avatar_url || data.image_url || data.avatar_url || '',
      type: row.type || data.type || data.creature_type || 'Creatura',
      rules: String(row.rules_version || row.rules || row.edition || data.rules_version || data.rules || data.edition || data.source_year || '2014').includes('2024') ? '2024' : '2014',
      hpCurrent: Number(hp.current ?? row.hp_current ?? hp.max ?? row.hp_max ?? 0),
      hpMax: Number(hp.max ?? row.hp_max ?? hp.current ?? row.hp_current ?? 0)
    };
  }).sort((a, b) => a.name.localeCompare(b.name, 'it'));
}

export async function leaveGameRoom(roomId) {
  return unwrap(await supabase.rpc('leave_game_room', { p_room_id: roomId }));
}

export async function kickGameRoomMember(roomId, userId) {
  return unwrap(await supabase.rpc('kick_game_room_member', { p_room_id: roomId, p_user_id: userId }));
}

export async function rotateGameRoomInvite(roomId) {
  return unwrap(await supabase.rpc('rotate_game_room_invite', { p_room_id: roomId }));
}

export async function createGameMap({ roomId, title, file, width, height, gridCellSize, gridVisible }) {
  const mapId = crypto.randomUUID();
  const extension = String(file?.name || '').split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'webp';
  const storagePath = `${roomId}/${mapId}/map.${extension}`;
  const map = unwrap(await supabase.from('game_maps').insert({
    id: mapId,
    room_id: roomId,
    title: String(title || '').trim(),
    image_width_px: width,
    image_height_px: height,
    grid_cell_size_px: gridCellSize,
    grid_visible: Boolean(gridVisible)
  }).select().single());
  try {
    unwrap(await supabase.storage.from('game-maps').upload(storagePath, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false
    }));
    unwrap(await supabase.from('game_maps').update({ image_storage_path: storagePath }).eq('id', mapId).eq('room_id', roomId));
    unwrap(await supabase.rpc('activate_game_map', { p_room_id: roomId, p_map_id: mapId }));
    return map;
  } catch (error) {
    await supabase.storage.from('game-maps').remove([storagePath]);
    await supabase.from('game_maps').delete().eq('id', mapId).eq('room_id', roomId);
    throw error;
  }
}

export async function updateGameMapSettings(roomId, mapId, settings) {
  return unwrap(await supabase.from('game_maps').update({
    grid_cell_size_px: Number(settings.gridCellSize),
    grid_color: settings.gridColor,
    grid_visible: Boolean(settings.gridVisible)
  }).eq('id', mapId).eq('room_id', roomId).select().single());
}

export async function deleteGameMap(roomId, mapId) {
  const map = unwrap(await supabase.from('game_maps')
    .select('image_storage_path')
    .eq('id', mapId)
    .eq('room_id', roomId)
    .single());
  if (map.image_storage_path) unwrap(await supabase.storage.from('game-maps').remove([map.image_storage_path]));
  if (map.image_storage_path) signedMapUrlCache.delete(map.image_storage_path);
  unwrap(await supabase.from('game_maps').delete().eq('id', mapId).eq('room_id', roomId));
}

export async function createCharacterMapToken({ roomId, mapId, participant, gridX, gridY }) {
  return unwrap(await supabase.from('game_map_tokens').insert({
    room_id: roomId,
    map_id: mapId,
    token_type: 'character',
    character_id: participant.characterId,
    owner_user_id: participant.userId,
    name: participant.name,
    image_url: participant.imageUrl || null,
    grid_x: gridX,
    grid_y: gridY,
    token_data: { hp: { current: participant.hpCurrent ?? null, max: participant.hpMax ?? null } }
  }).select().single());
}

export async function createCreatureMapToken({ roomId, mapId, creature, gridX, gridY }) {
  return unwrap(await supabase.from('game_map_tokens').insert({
    room_id: roomId,
    map_id: mapId,
    token_type: 'creature',
    shared_creature_id: creature.id,
    name: creature.name,
    image_url: creature.imageUrl || null,
    grid_x: gridX,
    grid_y: gridY,
    token_data: { hp: { current: creature.hpCurrent, max: creature.hpMax } }
  }).select().single());
}

export async function moveGameMapToken(roomId, mapId, tokenId, gridX, gridY) {
  return unwrap(await supabase.from('game_map_tokens').update({
    grid_x: gridX,
    grid_y: gridY
  }).eq('id', tokenId).eq('room_id', roomId).eq('map_id', mapId).select().single());
}

export async function deleteGameMapToken(roomId, mapId, tokenId) {
  return unwrap(await supabase.rpc('remove_game_map_token', {
    p_room_id: roomId,
    p_map_id: mapId,
    p_token_id: tokenId
  }));
}

export async function placeOwnGameMapToken(roomId, mapId, gridX, gridY) {
  return unwrap(await supabase.rpc('place_own_game_token', {
    p_room_id: roomId,
    p_map_id: mapId,
    p_grid_x: gridX,
    p_grid_y: gridY
  }));
}

export async function deleteGameRoom(roomId) {
  const maps = unwrap(await supabase.from('game_maps').select('image_storage_path').eq('room_id', roomId)) || [];
  const paths = maps.map((map) => map.image_storage_path).filter(Boolean);
  if (paths.length) unwrap(await supabase.storage.from('game-maps').remove(paths));
  unwrap(await supabase.from('game_rooms').delete().eq('id', roomId));
}

export function subscribeToGameRoom(roomId, handlers = {}) {
  let presencePayload = { userId: handlers.userId, displayName: handlers.displayName || 'Giocatore', selectedTokenId: null };
  const channel = supabase.channel(`game-room:${roomId}`, {
    config: { private: true, presence: { key: handlers.userId } }
  });
  channel
    .on('postgres_changes', { event: '*', schema: 'public', table: 'game_room_members', filter: `room_id=eq.${roomId}` }, () => handlers.onPersistentChange?.())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'game_maps', filter: `room_id=eq.${roomId}` }, () => handlers.onPersistentChange?.())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'game_map_tokens', filter: `room_id=eq.${roomId}` }, () => handlers.onPersistentChange?.())
    .on('presence', { event: 'sync' }, () => handlers.onPresence?.(channel.presenceState()))
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED' && handlers.userId) {
        await channel.track(presencePayload);
      }
    });
  const cleanup = () => { void supabase.removeChannel(channel); };
  cleanup.updatePresence = async (patch = {}) => {
    presencePayload = { ...presencePayload, ...patch };
    await channel.track(presencePayload);
  };
  return cleanup;
}
