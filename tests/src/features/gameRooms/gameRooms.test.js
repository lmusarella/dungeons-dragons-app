import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('game rooms entry point and Supabase integration', () => {
  it('registers the authenticated route and exposes it from the main menu', () => {
    const main = readFileSync('src/main.js', 'utf8');
    const layout = readFileSync('src/ui/layout.js', 'utf8');
    const router = readFileSync('src/app/router.js', 'utf8');
    expect(main).toContain("registerRoute('game-rooms'");
    expect(layout).toContain("route: 'game-rooms'");
    expect(layout).toContain("label: 'Stanze di gioco'");
    expect(router).toContain("route === 'game-rooms'");
  });

  it('uses the secured room RPCs and a private realtime channel', () => {
    const api = readFileSync('src/features/gameRooms/gameRoomsApi.js', 'utf8');
    expect(api).toContain("rpc('create_game_room'");
    expect(api).toContain("rpc('join_game_room'");
    expect(api).toContain("rpc('leave_game_room'");
    expect(api).toContain("rpc('kick_game_room_member'");
    expect(api).toContain("rpc('rotate_game_room_invite'");
    expect(api).toContain('export async function deleteGameRoom');
    expect(api).toContain('export async function createGameMap');
    expect(api).toContain("storage.from('game-maps').upload");
    expect(api).toContain("rpc('activate_game_map'");
    expect(api).toContain('config: { private: true');
    expect(api).toContain("table: 'game_room_members'");
    expect(api).toContain("table: 'game_maps'");
    expect(api).toContain("table: 'game_map_tokens'");
    expect(api).toContain("createSignedUrl(map.image_storage_path");
    expect(api).not.toContain("master_user_id: userId");
  });

  it('starts creation and joining from the rooms page', () => {
    const view = readFileSync('src/features/gameRooms/gameRooms.js', 'utf8');
    expect(view).toContain('data-create-room');
    expect(view).toContain('data-join-room');
    expect(view).toContain('Crea stanza di gioco');
    expect(view).toContain('Entra in una stanza');
    expect(view).toContain('game-room-character-picker');
    expect(view).toContain('game-room-map-panel');
    expect(view).toContain('game-map-canvas');
    expect(view).toContain('data-map-zoom-in');
    expect(view).toContain('data-delete-room');
    expect(view).toContain('game-room-invite__actions');
    expect(view).toContain('data-rotate-invite');
    expect(view).toContain('openMapUpload');
    expect(view).not.toContain('Editor mappe: prossimo passaggio');
  });
});
