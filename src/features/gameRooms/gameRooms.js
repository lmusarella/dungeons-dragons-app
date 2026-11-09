import './gameRooms.css';
import { getState } from '../../app/state.js';
import { createToast, openConfirmModal, openFormModal } from '../../ui/components.js';
import { escapeHtml, sanitizeImageUrl } from '../../lib/html.js';
import {
  createGameMap,
  createGameRoom,
  deleteGameRoom,
  fetchGameRoom,
  fetchGameRooms,
  joinGameRoom,
  kickGameRoomMember,
  leaveGameRoom,
  rotateGameRoomInvite,
  subscribeToGameRoom
} from './gameRoomsApi.js';

const STATUS_LABELS = { lobby: 'Lobby', active: 'Attiva', closed: 'Chiusa' };

function formatError(error) {
  const message = String(error?.message || error || 'Operazione non riuscita');
  if (/create_game_room/i.test(message)) return 'La funzione sicura di creazione stanza non è ancora installata. Applica la migrazione db/add_create_game_room_rpc.sql su Supabase.';
  if (/game_rooms|schema cache|does not exist/i.test(message)) return 'Il modulo multiplayer non è ancora configurato su Supabase. Applica la migrazione db/dnd_stanze_battaglia.sql.';
  return message;
}

function characterOptions(characters, selectedId) {
  return characters.map((character) => `<label class="game-room-character-card"><input type="radio" name="character_id" value="${escapeHtml(character.id)}" ${String(character.id) === String(selectedId) ? 'checked' : ''} required><span>${character.data?.avatar_url ? `<img src="${escapeHtml(character.data.avatar_url)}" alt="">` : '<i aria-hidden="true">♙</i>'}<strong>${escapeHtml(character.name)}</strong></span></label>`).join('');
}

async function openCreateRoom() {
  const data = await openFormModal({
    title: 'Crea stanza di gioco', submitLabel: 'Crea stanza', cardClass: 'modal-card--game-room',
    content: `<div class="game-room-form"><label class="field"><span>Nome della stanza</span><input name="title" maxlength="120" required placeholder="Es. Sessione del venerdì"></label><label class="field"><span>Descrizione <small>facoltativa</small></span><textarea name="description" rows="4" maxlength="1000" placeholder="Tema, appuntamento o indicazioni per i giocatori"></textarea></label><label class="field"><span>Numero massimo di giocatori</span><input name="max_players" type="number" min="1" max="20" value="8" required></label></div>`
  });
  if (!data) return null;
  return createGameRoom({ title: data.get('title'), description: data.get('description'), maxPlayers: data.get('max_players') });
}

async function openJoinRoom(state) {
  if (!state.characters.length) {
    createToast('Crea prima un personaggio per partecipare a una stanza', 'error');
    return null;
  }
  const activeId = state.activeCharacterId || state.characters[0]?.id;
  const data = await openFormModal({
    title: 'Entra in una stanza', submitLabel: 'Entra nella lobby', cardClass: 'modal-card--game-room',
    content: `<div class="game-room-form"><label class="field"><span>Codice di invito</span><input class="game-room-code-input" name="invite_code" minlength="6" maxlength="16" inputmode="numeric" autocomplete="off" spellcheck="false" required placeholder="6 cifre"></label><fieldset class="game-room-character-picker"><legend>Scegli il personaggio</legend><div>${characterOptions(state.characters, activeId)}</div></fieldset><label class="field"><span>Nome mostrato nella lobby</span><input name="display_name" maxlength="60" value="${escapeHtml(state.user?.user_metadata?.display_name || state.user?.email?.split('@')[0] || 'Giocatore')}" required></label></div>`,
    onOpen: ({ fieldsEl }) => {
      const code = fieldsEl.querySelector('[name="invite_code"]');
      code?.addEventListener('input', () => { code.value = code.value.replace(/[^0-9a-f]/gi, '').toUpperCase(); });
    }
  });
  if (!data) return null;
  return joinGameRoom({ inviteCode: data.get('invite_code'), characterId: data.get('character_id'), displayName: data.get('display_name') });
}

function readMapDimensions(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.addEventListener('load', () => {
      URL.revokeObjectURL(url);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    }, { once: true });
    image.addEventListener('error', () => {
      URL.revokeObjectURL(url);
      reject(new Error('Il file selezionato non è un’immagine valida.'));
    }, { once: true });
    image.src = url;
  });
}

async function openMapUpload(roomId) {
  const data = await openFormModal({
    title: 'Carica una mappa',
    submitLabel: 'Carica e usa',
    cardClass: 'modal-card--game-room-map',
    content: `<div class="game-map-upload-form"><label class="game-map-dropzone"><span class="game-map-dropzone__icon" aria-hidden="true">▧</span><strong>Scegli l’immagine della mappa</strong><small>PNG, JPG o WebP · massimo 15 MB</small><input type="file" name="map_image" accept="image/png,image/jpeg,image/webp" required></label><label class="field"><span>Nome della mappa</span><input name="title" maxlength="120" required placeholder="Es. Cripta abbandonata"></label><div class="game-map-upload-grid"><label class="field"><span>Dimensione cella</span><input name="grid_cell_size" type="number" min="4" max="1000" step="1" value="64" required></label><label class="game-map-grid-toggle"><input name="grid_visible" type="checkbox" value="true" checked><span><strong>Mostra griglia</strong><small>Visualizza le celle sulla mappa</small></span></label></div></div>`,
    onOpen: ({ fieldsEl }) => {
      const fileInput = fieldsEl.querySelector('[name="map_image"]');
      const titleInput = fieldsEl.querySelector('[name="title"]');
      fileInput?.addEventListener('change', () => {
        const file = fileInput.files?.[0];
        if (file && titleInput && !titleInput.value.trim()) titleInput.value = file.name.replace(/\.[^.]+$/, '');
      });
    }
  });
  if (!data) return false;
  const file = data.get('map_image');
  if (!(file instanceof File) || !file.size) throw new Error('Seleziona un’immagine per la mappa.');
  if (!/^image\/(?:png|jpe?g|webp)$/i.test(file.type)) throw new Error('Scegli un’immagine PNG, JPG o WebP.');
  if (file.size > 15 * 1024 * 1024) throw new Error('La mappa non può superare 15 MB.');
  const { width, height } = await readMapDimensions(file);
  if (!width || !height || width > 12000 || height > 12000) throw new Error('La mappa deve avere dimensioni comprese tra 1 e 12.000 pixel.');
  await createGameMap({
    roomId,
    title: data.get('title'),
    file,
    width,
    height,
    gridCellSize: Number(data.get('grid_cell_size')) || 64,
    gridVisible: data.get('grid_visible') === 'true'
  });
  return true;
}

function renderRoomList(container, rooms) {
  container.innerHTML = `<section class="game-rooms-page"><header class="game-rooms-hero"><div><span class="eyebrow">Multiplayer</span><h1>Stanze di gioco</h1><p>Crea una sessione come Dungeon Master oppure raggiungi il tuo gruppo con un codice d’invito.</p></div><div class="game-rooms-primary-actions"><button class="ghost-button" type="button" data-join-room>Entra in una stanza</button><button class="primary" type="button" data-create-room>+ Crea stanza</button></div></header><section class="game-room-collection"><header><div><h2>Le tue sessioni</h2><small>${rooms.length} ${rooms.length === 1 ? 'stanza disponibile' : 'stanze disponibili'}</small></div></header>${rooms.length ? `<div class="game-room-grid">${rooms.map((room) => `<article class="game-room-card"><header><span class="game-room-role">${room.isMaster ? 'Dungeon Master' : 'Giocatore'}</span><span class="game-room-status game-room-status--${room.status}">${STATUS_LABELS[room.status] || room.status}</span></header><h3>${escapeHtml(room.title)}</h3><p>${escapeHtml(room.description || 'Nessuna descrizione')}</p><dl><div><dt>Partecipanti</dt><dd>${room.participantCount}/${room.max_players}</dd></div><div><dt>Master</dt><dd>${room.isMaster ? 'Tu' : 'Dungeon Master'}</dd></div></dl><button class="primary game-room-card__open" type="button" data-open-room="${escapeHtml(room.id)}">Accedi alla stanza <span aria-hidden="true">→</span></button></article>`).join('')}</div>` : '<div class="game-room-empty"><span aria-hidden="true">⌗</span><h3>Nessuna stanza disponibile</h3><p>Crea la tua prima sessione oppure usa il codice ricevuto dal Dungeon Master.</p></div>'}</section></section>`;
}

function buildTacticalMap(activeMap, tokens = []) {
  if (!activeMap) return `<div class="game-map-empty"><span aria-hidden="true">▦</span><strong>Nessuna mappa attiva</strong><p>Il Dungeon Master può preparare e attivare una mappa per la sessione.</p></div>`;
  const width = Math.max(1, Number(activeMap.image_width_px) || (Number(activeMap.grid_columns) || 20) * (Number(activeMap.grid_cell_size_px) || 64));
  const height = Math.max(1, Number(activeMap.image_height_px) || (Number(activeMap.grid_rows) || 15) * (Number(activeMap.grid_cell_size_px) || 64));
  const cell = Math.max(1, Number(activeMap.grid_cell_size_px) || 64);
  const offsetX = Number(activeMap.grid_offset_x_px) || 0;
  const offsetY = Number(activeMap.grid_offset_y_px) || 0;
  const gridStyle = `--grid-color:${escapeHtml(activeMap.grid_color || '#000000')};--grid-opacity:${Number(activeMap.grid_opacity ?? .4)};--cell-x:${(cell / width) * 100}%;--cell-y:${(cell / height) * 100}%;--offset-x:${(offsetX / width) * 100}%;--offset-y:${(offsetY / height) * 100}%`;
  const tokenMarkup = tokens.map((token) => {
    const left = ((offsetX + Number(token.grid_x) * cell) / width) * 100;
    const top = ((offsetY + Number(token.grid_y) * cell) / height) * 100;
    const tokenWidth = ((Number(token.size_columns) || 1) * cell / width) * 100;
    const tokenHeight = ((Number(token.size_rows) || 1) * cell / height) * 100;
    const image = sanitizeImageUrl(token.image_url);
    return `<span class="game-map-token game-map-token--${escapeHtml(token.token_type)}" style="left:${left}%;top:${top}%;width:${tokenWidth}%;height:${tokenHeight}%" title="${escapeHtml(token.name)}">${image ? `<img src="${image}" alt="">` : `<b>${escapeHtml(String(token.name || '?').slice(0, 2).toUpperCase())}</b>`}<small>${escapeHtml(token.name)}</small></span>`;
  }).join('');
  return `<div class="game-map-viewport" data-map-viewport><div class="game-map-canvas" data-map-canvas style="aspect-ratio:${width}/${height};${activeMap.imageUrl ? `background-image:url('${escapeHtml(activeMap.imageUrl)}')` : ''}">${activeMap.grid_visible ? `<span class="game-map-grid" style="${gridStyle}"></span>` : ''}<span class="game-map-tokens">${tokenMarkup}</span></div></div>`;
}

function renderLobby(container, data, userId, onlineUsers = new Set()) {
  const { room, members, maps, tokens = [] } = data;
  const isMaster = String(room.master_user_id) === String(userId);
  const activeMap = maps.find((map) => map.is_active);
  const players = [{ user_id: room.master_user_id, display_name: 'Dungeon Master', isMaster: true }, ...members];
  container.innerHTML = `<section class="game-room-lobby"><header class="game-room-sessionbar"><div class="game-room-sessionbar__identity"><button class="game-room-back" type="button" data-room-list aria-label="Torna alle stanze">‹</button><span><small>Sessione multiplayer</small><strong>${escapeHtml(room.title)}</strong></span><span class="game-room-status game-room-status--${room.status}">${STATUS_LABELS[room.status] || room.status}</span></div><div class="game-room-sessionbar__actions">${isMaster ? '<button class="ghost-button game-room-delete" type="button" data-delete-room>Elimina sessione</button>' : '<button class="ghost-button game-room-danger" type="button" data-leave-room>Esci</button>'}</div></header><div class="game-room-workspace"><main class="game-room-map-panel"><header><div class="game-room-map-title"><span class="eyebrow">Mappa attiva</span><h1>${activeMap ? escapeHtml(activeMap.title) : 'Tavolo di gioco'}</h1></div><div class="game-map-toolbar"><button type="button" data-map-zoom-out aria-label="Riduci zoom">−</button><output data-map-zoom>100%</output><button type="button" data-map-zoom-in aria-label="Aumenta zoom">+</button><button type="button" data-map-fit>Adatta</button></div><div class="game-room-map-actions">${isMaster ? '<button class="primary" type="button" data-manage-maps>Mappe</button>' : ''}</div></header>${buildTacticalMap(activeMap, tokens)}</main><aside class="game-room-sidebar"><section class="game-room-panel game-room-members"><header><div><span class="eyebrow">Lobby</span><h2>Partecipanti</h2></div><strong>${players.length}/${room.max_players}</strong></header><div>${players.map((member) => { const online = onlineUsers.has(String(member.user_id)) || String(member.user_id) === String(userId); return `<article><span class="game-room-presence ${online ? 'is-online' : ''}" title="${online ? 'Online' : 'Offline'}"></span><span><strong>${escapeHtml(member.display_name || 'Giocatore')}</strong><small>${member.isMaster ? 'Dungeon Master' : member.character_id ? 'Personaggio selezionato' : 'Nessun personaggio'}</small></span>${isMaster && !member.isMaster ? `<button class="icon-button" type="button" data-kick-member="${escapeHtml(member.user_id)}" aria-label="Espelli ${escapeHtml(member.display_name)}">×</button>` : ''}</article>`; }).join('')}</div></section>${isMaster ? `<section class="game-room-panel game-room-invite"><header><div><span class="eyebrow">Invito</span><h2>Codice stanza</h2></div><div class="game-room-invite__actions"><button class="game-room-icon-action" type="button" data-copy-invite aria-label="Copia codice" title="Copia codice">⧉</button><button class="game-room-icon-action" type="button" data-rotate-invite aria-label="Genera un nuovo codice" title="Nuovo codice">↻</button></div></header><code>${escapeHtml(room.invite_code)}</code></section>` : ''}<section class="game-room-panel game-room-session-note"><span class="eyebrow">Sessione</span><p>${escapeHtml(room.description || 'Nessuna nota della sessione.')}</p></section></aside></div></section>`;
}

export async function renderGameRooms(container) {
  const state = getState();
  if (!state.user) return;
  let cleanupRealtime = null;
  const showList = async () => {
    cleanupRealtime?.(); cleanupRealtime = null;
    try {
      const rooms = await fetchGameRooms(state.user.id);
      renderRoomList(container, rooms);
      container.querySelector('[data-create-room]')?.addEventListener('click', async () => {
        try { const room = await openCreateRoom(); if (room) await showLobby(room.id); }
        catch (error) { createToast(formatError(error), 'error'); }
      });
      container.querySelector('[data-join-room]')?.addEventListener('click', async () => {
        try { const roomId = await openJoinRoom(state); if (roomId) await showLobby(roomId); }
        catch (error) { createToast(formatError(error), 'error'); }
      });
      container.querySelectorAll('[data-open-room]').forEach((button) => button.addEventListener('click', () => { void showLobby(button.dataset.openRoom); }));
    } catch (error) {
      container.innerHTML = `<section class="game-rooms-page"><div class="game-room-error"><h1>Stanze di gioco</h1><p>${escapeHtml(formatError(error))}</p><button class="ghost-button" type="button" data-room-retry>Riprova</button></div></section>`;
      container.querySelector('[data-room-retry]')?.addEventListener('click', () => { void showList(); });
    }
  };
  const showLobby = async (roomId) => {
    cleanupRealtime?.();
    try {
      let lobby = await fetchGameRoom(roomId);
      const online = new Set();
      let mapZoom = 1;
      const paint = () => {
        renderLobby(container, lobby, state.user.id, online);
        const syncMapZoom = () => {
          const canvas = container.querySelector('[data-map-canvas]');
          const output = container.querySelector('[data-map-zoom]');
          if (canvas) canvas.style.transform = `scale(${mapZoom})`;
          if (output) output.textContent = `${Math.round(mapZoom * 100)}%`;
        };
        container.querySelector('[data-map-zoom-in]')?.addEventListener('click', () => { mapZoom = Math.min(2.5, mapZoom + .25); syncMapZoom(); });
        container.querySelector('[data-map-zoom-out]')?.addEventListener('click', () => { mapZoom = Math.max(.5, mapZoom - .25); syncMapZoom(); });
        container.querySelector('[data-map-fit]')?.addEventListener('click', () => { mapZoom = 1; container.querySelector('[data-map-viewport]')?.scrollTo({ top: 0, left: 0 }); syncMapZoom(); });
        syncMapZoom();
        container.querySelector('[data-room-list]')?.addEventListener('click', () => { void showList(); });
        container.querySelector('[data-copy-invite]')?.addEventListener('click', async () => { await navigator.clipboard.writeText(lobby.room.invite_code); createToast('Codice copiato'); });
        container.querySelector('[data-rotate-invite]')?.addEventListener('click', async () => { try { lobby.room.invite_code = await rotateGameRoomInvite(roomId); paint(); createToast('Codice rigenerato'); } catch (error) { createToast(formatError(error), 'error'); } });
        container.querySelector('[data-delete-room]')?.addEventListener('click', async () => {
          if (!await openConfirmModal({ title: 'Eliminare la sessione?', message: 'La stanza, le mappe e tutte le pedine verranno eliminate definitivamente.', confirmLabel: 'Elimina sessione' })) return;
          try { cleanupRealtime?.(); cleanupRealtime = null; await deleteGameRoom(roomId); createToast('Sessione eliminata'); await showList(); }
          catch (error) { createToast(formatError(error), 'error'); }
        });
        container.querySelector('[data-leave-room]')?.addEventListener('click', async () => { if (!await openConfirmModal({ title: 'Uscire dalla stanza?', message: 'Potrai rientrare soltanto usando nuovamente il codice.', confirmLabel: 'Esci' })) return; await leaveGameRoom(roomId); await showList(); });
        container.querySelectorAll('[data-kick-member]').forEach((button) => button.addEventListener('click', async () => { if (!await openConfirmModal({ title: 'Espelli giocatore?', message: 'Il giocatore non potrà rientrare con lo stesso codice.', confirmLabel: 'Espelli' })) return; await kickGameRoomMember(roomId, button.dataset.kickMember); lobby = await fetchGameRoom(roomId); paint(); }));
        container.querySelector('[data-manage-maps]')?.addEventListener('click', async () => {
          try {
            if (!await openMapUpload(roomId)) return;
            lobby = await fetchGameRoom(roomId);
            mapZoom = 1;
            paint();
            createToast('Mappa caricata e attivata');
          } catch (error) {
            createToast(formatError(error), 'error');
          }
        });
      };
      paint();
      cleanupRealtime = subscribeToGameRoom(roomId, {
        userId: state.user.id,
        displayName: state.user.user_metadata?.display_name || state.user.email,
        onPersistentChange: async () => { lobby = await fetchGameRoom(roomId); paint(); },
        onPresence: (presence) => { online.clear(); Object.values(presence).flat().forEach((entry) => online.add(String(entry.userId))); paint(); }
      });
    } catch (error) { createToast(formatError(error), 'error'); await showList(); }
  };
  await showList();
  window.addEventListener('hashchange', () => cleanupRealtime?.(), { once: true });
}
