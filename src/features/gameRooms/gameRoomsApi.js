import { supabase } from '../../lib/supabase.js';

function unwrap({ data, error }) {
  if (error) throw error;
  return data;
}

export async function fetchGameRooms(userId) {
  const rooms = unwrap(await supabase
    .from('game_rooms')
    .select('id,master_user_id,title,description,invite_code,status,max_players,created_at,updated_at')
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

export async function createGameRoom({ title, description, maxPlayers }) {
  const room = unwrap(await supabase.rpc('create_game_room', {
    p_title: String(title || '').trim(),
    p_description: String(description || '').trim() || null,
    p_max_players: Number(maxPlayers) || 8
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
  const rawMaps = unwrap(await supabase.from('game_maps').select('*').eq('room_id', roomId).order('created_at')) || [];
  const maps = await Promise.all(rawMaps.map(async (map) => {
    if (!map.image_storage_path) return { ...map, imageUrl: '' };
    const { data } = await supabase.storage.from('game-maps').createSignedUrl(map.image_storage_path, 3600);
    return { ...map, imageUrl: data?.signedUrl || '' };
  }));
  const activeMap = maps.find((map) => map.is_active);
  const tokens = activeMap
    ? (unwrap(await supabase.from('game_map_tokens').select('*').eq('room_id', roomId).eq('map_id', activeMap.id).eq('is_removed', false).order('created_at')) || [])
    : [];
  return { room, members, maps, tokens };
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

export async function deleteGameRoom(roomId) {
  const maps = unwrap(await supabase.from('game_maps').select('image_storage_path').eq('room_id', roomId)) || [];
  const paths = maps.map((map) => map.image_storage_path).filter(Boolean);
  if (paths.length) unwrap(await supabase.storage.from('game-maps').remove(paths));
  unwrap(await supabase.from('game_rooms').delete().eq('id', roomId));
}

export function subscribeToGameRoom(roomId, handlers = {}) {
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
        await channel.track({ userId: handlers.userId, displayName: handlers.displayName || 'Giocatore' });
      }
    });
  return () => { void supabase.removeChannel(channel); };
}
