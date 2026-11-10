import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { tacticalRangeCells } from '../../../../src/features/gameRooms/gameRooms.js';

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
    expect(api).toContain("rpc('get_game_room_participants'");
    expect(api).toContain("from('shared_creatures')");
    expect(api).toContain('export async function createCreatureMapToken');
    expect(api).toContain('export async function updateGameMapSettings');
    expect(api).toContain('export async function deleteGameMap');
    expect(api).toContain('export async function createCharacterMapToken');
    expect(api).toContain('export async function moveGameMapToken');
    expect(api).toContain('export async function deleteGameMapToken');
    expect(api).toContain("rpc('remove_game_map_token'");
    expect(api).toContain("rpc('place_own_game_token'");
    expect(api).toContain('cleanup.updatePresence');
    expect(api).toContain('config: { private: true');
    expect(api).toContain("table: 'game_room_members'");
    expect(api).toContain("table: 'game_maps'");
    expect(api).toContain("table: 'game_map_tokens'");
    expect(api).toContain("table: 'game_map_cells'");
    expect(api).toContain('export async function setGameMapCell');
    expect(api).toContain("createSignedUrl(path");
    expect(api).not.toContain("master_user_id: userId");
  });

  it('starts creation and joining from the rooms page', () => {
    const view = readFileSync('src/features/gameRooms/gameRooms.js', 'utf8');
    const styles = readFileSync('src/features/gameRooms/gameRooms.css', 'utf8');
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
    expect(view).toContain('game-map-color-picker');
    expect(view).toContain('game-map-participant-picker');
    expect(view).toContain('data-delete-map');
    expect(view).toContain('game-room-member-avatar');
    expect(view).toContain('game-map-drop-target');
    expect(view).not.toContain('data-token-action="status"');
    expect(view).not.toContain('data-token-action="more"');
    expect(view).toContain('game-room-legend');
    expect(view).toContain('data-position-token');
    expect(view).toContain('data-remove-map-token');
    expect(view).toContain('is-lobby-selectable');
    expect(view).not.toContain('game-room-member-drag-ghost');
    expect(view).not.toContain('game-room-creature-drag-ghost');
    expect(view).toContain('game-room-creature-palette');
    expect(view).toContain('game-room-member-hp');
    expect(view).toContain('game-room-invite--inline');
    expect(view).not.toContain('data-creature-rules');
    expect(view).toContain('data-creature-search');
    expect(view).toContain('game-room-placed-creatures');
    expect(view).toContain('rules_version');
    expect(view).toContain('game-room-member-self');
    expect(view).not.toContain('game-map-token-hp');
    expect(view).toContain('focusTokenId');
    expect(view).toContain('setGlobalLoading(true)');
    expect(view).toContain('data-token-details');
    expect(view).toContain('data-tactical-mode="attack"');
    expect(view).toContain('data-tactical-mode="movement"');
    expect(view).toContain('data-terrain-mode="difficult"');
    expect(view).toContain('data-terrain-mode="obstacle"');
    expect(view).toContain('data-native-width');
    expect(view).toContain('data-map-stage');
    expect(view).toContain('const fitScale =');
    expect(view).toContain('viewport.clientWidth / nativeWidth, viewport.clientHeight / nativeHeight');
    expect(view).not.toContain('Math.min(viewport.clientWidth / nativeWidth, viewport.clientHeight / nativeHeight)');
    expect(view).toContain('game-map-placement-overlay');
    expect(view).toContain('const players = members');
    expect(view).not.toContain('masterListed');
    expect(view).toContain('data-dm-character-id');
    expect(view).toContain('I tuoi personaggi');
    expect(view).toContain('dmCharacters =');
    expect(view).toContain("token.querySelector('.game-map-token__detail-action')?.remove()");
    expect(view).toContain("container.querySelector('[data-map-range-layer]')?.replaceChildren()");
    expect(view).toContain("container.querySelector('[data-tactical-actions]')?.remove()");
    expect(styles).not.toContain('transition: width .16s ease,height .16s ease');
  });

  it('calcola il movimento in caselle, raddoppia il costo difficile e blocca gli ostacoli', () => {
    const map = { grid_columns: 10, grid_rows: 10, image_width_px: 640, image_height_px: 640, grid_cell_size_px: 64 };
    const token = { grid_x: 4, grid_y: 4 };
    const cells = tacticalRangeCells(map, token, 2, [
      { grid_x: 5, grid_y: 4, cell_type: 'difficult' },
      { grid_x: 4, grid_y: 5, cell_type: 'obstacle' }
    ], true);
    const oneCellMovement = tacticalRangeCells(map, token, 1, [
      { grid_x: 5, grid_y: 4, cell_type: 'difficult' }
    ], true);
    expect(cells).toContainEqual({ gridX: 5, gridY: 4 });
    expect(cells).not.toContainEqual({ gridX: 4, gridY: 5 });
    expect(oneCellMovement).not.toContainEqual({ gridX: 5, gridY: 4 });
  });

  it('protegge terreno e ostacoli con RLS riservata al Dungeon Master', () => {
    const migration = readFileSync('db/extend_game_map_tactical_cells.sql', 'utf8');
    expect(migration).toContain('create table if not exists public.game_map_cells');
    expect(migration).toContain("cell_type in ('difficult','obstacle')");
    expect(migration).toContain('dnd_game_private.is_game_master(room_id)');
    expect(migration).toContain('game_map_cells_position_unique');
    expect(migration).toContain('grid_columns between 1 and 5000');
    expect(migration).toContain('speed_m text');
  });
});
