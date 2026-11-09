import './gameRooms.css';
import { getState } from '../../app/state.js';
import { createToast, openConfirmModal, openFormModal } from '../../ui/components.js';
import { escapeHtml, sanitizeImageUrl } from '../../lib/html.js';
import {
  createCharacterMapToken,
  createGameMap,
  createGameRoom,
  deleteGameMap,
  deleteGameMapToken,
  deleteGameRoom,
  fetchGameRoom,
  fetchGameRooms,
  joinGameRoom,
  kickGameRoomMember,
  leaveGameRoom,
  moveGameMapToken,
  placeOwnGameMapToken,
  rotateGameRoomInvite,
  subscribeToGameRoom,
  updateGameMapSettings
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

const GRID_COLORS = [
  { value: '#000000', label: 'Nero' },
  { value: '#FFFFFF', label: 'Bianco' },
  { value: '#C53D43', label: 'Rosso' },
  { value: '#347052', label: 'Verde' },
  { value: '#356F9F', label: 'Blu' },
  { value: '#D09A2D', label: 'Giallo' }
];

async function openMapSettings(roomId, map, participants = []) {
  const data = await openFormModal({
    title: `Modifica · ${map.title}`,
    submitLabel: 'Salva modifiche',
    cardClass: 'modal-card--game-room-map',
    content: `<div class="game-map-settings"><header><span class="eyebrow">Mappa attiva</span><strong>${escapeHtml(map.title)}</strong></header><section class="game-map-settings__section"><div class="game-map-settings__heading"><strong>Griglia</strong><small>Aspetto e dimensione delle caselle</small></div><label class="field"><span>Dimensione delle celle</span><input name="grid_cell_size" type="number" min="4" max="1000" step="1" value="${Number(map.grid_cell_size_px) || 64}" required></label><fieldset class="game-map-color-picker"><legend>Colore</legend><div>${GRID_COLORS.map((color) => `<label><input type="radio" name="grid_color" value="${color.value}" ${String(map.grid_color).toUpperCase() === color.value ? 'checked' : ''}><span><i style="--grid-swatch:${color.value}"></i>${color.label}</span></label>`).join('')}</div></fieldset><label class="game-map-grid-toggle"><input name="grid_visible" type="checkbox" value="true" ${map.grid_visible ? 'checked' : ''}><span><strong>Mostra griglia</strong><small>Nascondila senza perdere le impostazioni.</small></span></label></section>${participants.length ? `<section class="game-map-settings__section"><div class="game-map-settings__heading"><strong>Posiziona una pedina</strong><small>Seleziona il personaggio, poi tocca una casella sulla mappa.</small></div><div class="game-map-participant-picker">${participants.map((participant, index) => `<label><input type="radio" name="token_participant" value="${index}"><span>${participant.imageUrl ? `<img src="${escapeHtml(participant.imageUrl)}" alt="">` : '<i aria-hidden="true">♟</i>'}<b>${escapeHtml(participant.name)}</b><small>${participant.isMaster ? 'Dungeon Master' : 'Giocatore'}</small></span></label>`).join('')}</div></section>` : ''}<details class="game-map-new-map"><summary><span><strong>Nuova mappa</strong><small>Carica e attiva un’altra immagine</small></span><b aria-hidden="true">＋</b></summary><div><label class="game-map-dropzone"><strong>Scegli l’immagine</strong><small>PNG, JPG o WebP · massimo 15 MB</small><input type="file" name="new_map_image" accept="image/png,image/jpeg,image/webp"></label><label class="field"><span>Nome nuova mappa</span><input name="new_map_title" maxlength="120" placeholder="Es. Segrete del castello"></label><label class="field"><span>Dimensione celle</span><input name="new_grid_cell_size" type="number" min="4" max="1000" step="1" value="64"></label></div></details></div>`
  });
  if (!data) return null;
  const newFile = data.get('new_map_image');
  if (newFile instanceof File && newFile.size) {
    if (!/^image\/(?:png|jpe?g|webp)$/i.test(newFile.type)) throw new Error('Scegli un’immagine PNG, JPG o WebP.');
    if (newFile.size > 15 * 1024 * 1024) throw new Error('La mappa non può superare 15 MB.');
    const title = String(data.get('new_map_title') || '').trim();
    if (!title) throw new Error('Inserisci il nome della nuova mappa.');
    const { width, height } = await readMapDimensions(newFile);
    if (!width || !height || width > 12000 || height > 12000) throw new Error('La mappa deve avere dimensioni comprese tra 1 e 12.000 pixel.');
    await createGameMap({ roomId, title, file: newFile, width, height, gridCellSize: Number(data.get('new_grid_cell_size')) || 64, gridVisible: true });
    return { mapChanged: true, participant: null };
  }
  const settings = {
    gridCellSize: Number(data.get('grid_cell_size')) || 64,
    gridColor: data.get('grid_color') || '#000000',
    gridVisible: data.get('grid_visible') === 'true'
  };
  await updateGameMapSettings(roomId, map.id, settings);
  const participantIndex = data.get('token_participant');
  return {
    mapChanged: false,
    settings,
    participant: participantIndex === null ? null : participants[Number(participantIndex)] || null
  };
}

function roomTokenParticipants(lobby, state) {
  const activeCharacter = state.characters.find((character) => String(character.id) === String(state.activeCharacterId)) || state.characters[0] || null;
  return [
    activeCharacter ? { userId: state.user.id, characterId: activeCharacter.id, name: activeCharacter.name || 'Dungeon Master', imageUrl: sanitizeImageUrl(activeCharacter.data?.avatar_url || ''), isMaster: true } : null,
    ...lobby.members.map((member) => member.character ? ({ userId: member.user_id, characterId: member.character.id, name: member.character.name || member.display_name, imageUrl: sanitizeImageUrl(member.character.data?.avatar_url || ''), isMaster: false }) : null)
  ].filter(Boolean);
}

async function openTokenPicker(participants) {
  const data = await openFormModal({
    title: 'Posiziona una pedina',
    submitLabel: 'Scegli posizione',
    cardClass: 'modal-card--game-room-map',
    content: `<div class="game-token-picker"><p>Seleziona un personaggio, poi tocca la casella della mappa in cui vuoi posizionarlo.</p><div class="game-map-participant-picker">${participants.map((participant, index) => `<label><input type="radio" name="token_participant" value="${index}" required><span>${participant.imageUrl ? `<img src="${escapeHtml(participant.imageUrl)}" alt="">` : '<i aria-hidden="true">♟</i>'}<b>${escapeHtml(participant.name)}</b><small>${participant.isMaster ? 'Dungeon Master' : 'Giocatore'}</small></span></label>`).join('')}</div></div>`
  });
  if (!data) return null;
  return participants[Number(data.get('token_participant'))] || null;
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

function mapGridPosition(event, canvas, map) {
  const rect = canvas.getBoundingClientRect();
  const nativeWidth = Number(map.image_width_px) || 1;
  const nativeHeight = Number(map.image_height_px) || 1;
  const cell = Number(map.grid_cell_size_px) || 64;
  const pixelX = ((event.clientX - rect.left) / rect.width) * nativeWidth;
  const pixelY = ((event.clientY - rect.top) / rect.height) * nativeHeight;
  const gridX = Math.floor((pixelX - (Number(map.grid_offset_x_px) || 0)) / cell);
  const gridY = Math.floor((pixelY - (Number(map.grid_offset_y_px) || 0)) / cell);
  const valid = gridX >= 0 && gridY >= 0 && gridX < Number(map.grid_columns) && gridY < Number(map.grid_rows);
  return { gridX, gridY, valid, nativeWidth, nativeHeight, cell };
}

function renderLobby(container, data, userId, onlineUsers = new Set(), masterCharacter = null, tokenSelections = new Map()) {
  const { room, members, maps, tokens = [] } = data;
  const isMaster = String(room.master_user_id) === String(userId);
  const activeMap = maps.find((map) => map.is_active);
  const players = [{ user_id: room.master_user_id, display_name: 'Dungeon Master', isMaster: true, character: masterCharacter }, ...members];
  container.innerHTML = `<section class="game-room-lobby"><header class="game-room-sessionbar"><div class="game-room-sessionbar__identity"><button class="game-room-back" type="button" data-room-list aria-label="Torna alle stanze">‹</button><span><small>Sessione multiplayer</small><strong>${escapeHtml(room.title)}</strong></span><span class="game-room-status game-room-status--${room.status}">${STATUS_LABELS[room.status] || room.status}</span></div><div class="game-room-sessionbar__actions">${isMaster ? '<button class="ghost-button game-room-delete" type="button" data-delete-room>Elimina sessione</button>' : '<button class="ghost-button game-room-danger" type="button" data-leave-room>Esci</button>'}</div></header><div class="game-room-workspace"><main class="game-room-map-panel"><header><div class="game-room-map-title"><span class="eyebrow">Mappa attiva</span><h1>${activeMap ? escapeHtml(activeMap.title) : 'Tavolo di gioco'}</h1></div><div class="game-map-toolbar"><button type="button" data-map-zoom-out aria-label="Riduci zoom">−</button><output data-map-zoom>100%</output><button type="button" data-map-zoom-in aria-label="Aumenta zoom">+</button><button type="button" data-map-fit>Adatta</button></div><div class="game-room-map-actions">${isMaster ? '<button class="primary" type="button" data-manage-maps>Mappe</button>' : ''}</div></header>${buildTacticalMap(activeMap, tokens)}</main><aside class="game-room-sidebar"><section class="game-room-panel game-room-members"><header><div><span class="eyebrow">Lobby</span><h2>Partecipanti</h2></div><strong>${players.length}/${room.max_players}</strong></header><div>${players.map((member) => { const online = onlineUsers.has(String(member.user_id)) || String(member.user_id) === String(userId); return `<article><span class="game-room-presence ${online ? 'is-online' : ''}" title="${online ? 'Online' : 'Offline'}"></span><span><strong>${escapeHtml(member.display_name || 'Giocatore')}</strong><small>${member.isMaster ? 'Dungeon Master' : member.character_id ? 'Personaggio selezionato' : 'Nessun personaggio'}</small></span>${isMaster && !member.isMaster ? `<button class="icon-button" type="button" data-kick-member="${escapeHtml(member.user_id)}" aria-label="Espelli ${escapeHtml(member.display_name)}">×</button>` : ''}</article>`; }).join('')}</div></section>${isMaster ? `<section class="game-room-panel game-room-invite"><header><div><span class="eyebrow">Invito</span><h2>Codice stanza</h2></div><div class="game-room-invite__actions"><button class="game-room-icon-action" type="button" data-copy-invite aria-label="Copia codice" title="Copia codice">⧉</button><button class="game-room-icon-action" type="button" data-rotate-invite aria-label="Genera un nuovo codice" title="Nuovo codice">↻</button></div></header><code>${escapeHtml(room.invite_code)}</code></section>` : ''}<section class="game-room-panel game-room-session-note"><span class="eyebrow">Sessione</span><p>${escapeHtml(room.description || 'Nessuna nota della sessione.')}</p></section></aside></div></section>`;
  container.querySelectorAll('.game-room-members article').forEach((article, index) => {
    const player = players[index];
    const info = article.children[1];
    info?.classList.add('game-room-member-info');
    const avatarUrl = sanitizeImageUrl(player?.character?.data?.avatar_url || '');
    const avatar = document.createElement(avatarUrl ? 'img' : 'span');
    avatar.className = 'game-room-member-avatar';
    if (avatarUrl) {
      avatar.src = avatarUrl;
      avatar.alt = '';
    } else {
      avatar.textContent = String(player?.display_name || '?').slice(0, 1).toUpperCase();
      avatar.setAttribute('aria-hidden', 'true');
    }
    article.insertBefore(avatar, info);
    if (player?.character && String(player.user_id) === String(userId)) {
      article.classList.add('is-own-character', 'is-token-source');
      article.draggable = true;
      article.dataset.lobbyUserId = String(player.user_id);
      article.title = 'Trascina il personaggio sulla mappa';
    }
  });
  container.querySelectorAll('.game-map-token').forEach((tokenElement, index) => {
    const token = tokens[index];
    if (!token) return;
    tokenElement.dataset.mapTokenId = token.id;
    if (isMaster) {
      tokenElement.classList.add('is-draggable');
      tokenElement.setAttribute('aria-label', `Sposta ${token.name}`);
    }
    const selectedBy = tokenSelections.get(String(token.id)) || [];
    if (selectedBy.length) {
      tokenElement.classList.add('is-selected');
      tokenElement.dataset.selectedBy = selectedBy.join(', ');
      tokenElement.insertAdjacentHTML('beforeend', `<em class="game-map-token__selection">${escapeHtml(selectedBy.join(', '))}</em>`);
      if (isMaster) tokenElement.insertAdjacentHTML('beforeend', '<span class="game-map-token__selected-actions"><button type="button" data-remove-map-token>Rimuovi dalla griglia</button></span>');
    }
  });
  if (activeMap) container.querySelector('.game-room-map-title')?.insertAdjacentHTML('beforeend', '<span class="game-map-scale-legend"><i aria-hidden="true"></i>1 casella = 1,5 m</span>');
  const mapActions = container.querySelector('.game-room-map-actions');
  if (isMaster && mapActions) {
    mapActions.innerHTML = activeMap
      ? `<button class="game-map-action game-map-action--token" type="button" data-position-token><span aria-hidden="true">♟</span> Posiziona pedina</button><button class="game-map-action game-map-action--settings" type="button" data-map-settings><span aria-hidden="true">✎</span> Modifica</button><button class="game-map-action game-map-action--danger" type="button" data-delete-map aria-label="Elimina ${escapeHtml(activeMap.title)}" title="Elimina mappa">×</button>`
      : '<button class="game-map-action game-map-action--primary" type="button" data-manage-maps>Carica mappa</button>';
  }
}

export async function renderGameRooms(container) {
  const state = getState();
  if (!state.user) return;
  let cleanupRealtime = null;
  let realtimeRefreshTimer = null;
  const showList = async () => {
    clearTimeout(realtimeRefreshTimer);
    realtimeRefreshTimer = null;
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
      const tokenSelections = new Map();
      let localSelectedTokenId = null;
      let mapZoom = 1;
      let pendingToken = null;
      const paint = () => {
        const previousViewport = container.querySelector('[data-map-viewport]');
        const previousScroll = previousViewport ? { left: previousViewport.scrollLeft, top: previousViewport.scrollTop } : null;
        const activeCharacter = state.characters.find((character) => String(character.id) === String(state.activeCharacterId)) || state.characters[0] || null;
        renderLobby(container, lobby, state.user.id, online, activeCharacter, tokenSelections);
        const syncMapZoom = () => {
          const canvas = container.querySelector('[data-map-canvas]');
          const output = container.querySelector('[data-map-zoom]');
          if (canvas) canvas.style.transform = `scale(${mapZoom})`;
          if (output) output.textContent = `${Math.round(mapZoom * 100)}%`;
        };
        container.querySelector('[data-map-zoom-in]')?.addEventListener('click', () => { mapZoom = Math.min(2.5, mapZoom + .25); syncMapZoom(); });
        container.querySelector('[data-map-zoom-out]')?.addEventListener('click', () => { mapZoom = Math.max(.5, mapZoom - .25); syncMapZoom(); });
        container.querySelector('[data-map-fit]')?.addEventListener('click', () => { mapZoom = 1; container.querySelector('[data-map-viewport]')?.scrollTo({ top: 0, left: 0 }); syncMapZoom(); });
        const mapCanvas = container.querySelector('[data-map-canvas]');
        if (pendingToken && mapCanvas) {
          mapCanvas.classList.add('is-placing-token');
          const title = container.querySelector('.game-room-map-title');
          title?.insertAdjacentHTML('beforeend', `<small class="game-map-placement-hint">Tocca una casella per posizionare ${escapeHtml(pendingToken.name)}</small>`);
          mapCanvas.addEventListener('click', async (event) => {
            if (event.target.closest('.game-map-token')) return;
            const currentMap = lobby.maps.find((map) => map.is_active);
            if (!currentMap || !pendingToken) return;
            const { gridX, gridY, valid } = mapGridPosition(event, mapCanvas, currentMap);
            if (!valid) {
              createToast('Seleziona una casella valida della griglia', 'error');
              return;
            }
            try {
              const participant = pendingToken;
              pendingToken = null;
              const existingToken = lobby.tokens.find((token) => String(token.character_id) === String(participant.characterId));
              if (existingToken) await moveGameMapToken(roomId, currentMap.id, existingToken.id, gridX, gridY);
              else await createCharacterMapToken({ roomId, mapId: currentMap.id, participant, gridX, gridY });
              lobby = await fetchGameRoom(roomId);
              paint();
              createToast(`Pedina di ${participant.name} posizionata`);
            } catch (error) { createToast(formatError(error), 'error'); }
          });
        }
        const currentMapForDrag = lobby.maps.find((map) => map.is_active);
        if (mapCanvas && currentMapForDrag) {
          const ownRoomMember = lobby.members.find((member) => String(member.user_id) === String(state.user.id));
          const currentPresenceName = ownRoomMember?.display_name || (String(lobby.room.master_user_id) === String(state.user.id) ? 'Dungeon Master' : 'Giocatore');
          const selectToken = (tokenId) => {
            const nextTokenId = localSelectedTokenId === String(tokenId) ? null : String(tokenId);
            localSelectedTokenId = nextTokenId;
            tokenSelections.clear();
            if (nextTokenId) tokenSelections.set(nextTokenId, [currentPresenceName]);
            void cleanupRealtime?.updatePresence?.({ selectedTokenId: nextTokenId, selectedAt: Date.now() });
            paint();
          };
          const clearSelectionForDrag = () => {
            localSelectedTokenId = null;
            tokenSelections.clear();
            container.querySelectorAll('.game-map-token.is-selected').forEach((token) => {
              token.classList.remove('is-selected');
              token.querySelector('.game-map-token__selection')?.remove();
              token.querySelector('.game-map-token__selected-actions')?.remove();
            });
            void cleanupRealtime?.updatePresence?.({ selectedTokenId: null, selectedAt: Date.now() });
          };
          const ownParticipant = roomTokenParticipants(lobby, state).find((participant) => String(participant.userId) === String(state.user.id));
          const placeLobbyParticipant = async (position) => {
            if (!ownParticipant || !position?.valid) return;
            const existingToken = lobby.tokens.find((token) => String(token.character_id) === String(ownParticipant.characterId));
            const previousPosition = existingToken ? { x: existingToken.grid_x, y: existingToken.grid_y } : null;
            const optimisticToken = existingToken || {
              id: `pending-${Date.now()}`,
              room_id: roomId,
              map_id: currentMapForDrag.id,
              token_type: 'character',
              character_id: ownParticipant.characterId,
              owner_user_id: ownParticipant.userId,
              name: ownParticipant.name,
              image_url: ownParticipant.imageUrl,
              grid_x: position.gridX,
              grid_y: position.gridY,
              size_columns: 1,
              size_rows: 1
            };
            optimisticToken.grid_x = position.gridX;
            optimisticToken.grid_y = position.gridY;
            if (!existingToken) lobby.tokens.push(optimisticToken);
            paint();
            try {
              const isMaster = String(lobby.room.master_user_id) === String(state.user.id);
              if (existingToken && isMaster) {
                await moveGameMapToken(roomId, currentMapForDrag.id, existingToken.id, position.gridX, position.gridY);
              } else if (isMaster) {
                const created = await createCharacterMapToken({ roomId, mapId: currentMapForDrag.id, participant: ownParticipant, gridX: position.gridX, gridY: position.gridY });
                optimisticToken.id = created.id;
              } else {
                const tokenId = await placeOwnGameMapToken(roomId, currentMapForDrag.id, position.gridX, position.gridY);
                optimisticToken.id = tokenId;
              }
            } catch (error) {
              if (existingToken) {
                existingToken.grid_x = previousPosition.x;
                existingToken.grid_y = previousPosition.y;
              } else lobby.tokens = lobby.tokens.filter((token) => token !== optimisticToken);
              paint();
              createToast(formatError(error), 'error');
            }
          };
          const lobbySource = container.querySelector('.game-room-members article.is-token-source');
          if (lobbySource && ownParticipant) {
            const lobbyDropTarget = document.createElement('span');
            lobbyDropTarget.className = 'game-map-drop-target';
            const showLobbyDropTarget = (position) => {
              if (!position.valid) { lobbyDropTarget.remove(); return; }
              const offsetX = Number(currentMapForDrag.grid_offset_x_px) || 0;
              const offsetY = Number(currentMapForDrag.grid_offset_y_px) || 0;
              lobbyDropTarget.style.left = `${((offsetX + position.gridX * position.cell) / position.nativeWidth) * 100}%`;
              lobbyDropTarget.style.top = `${((offsetY + position.gridY * position.cell) / position.nativeHeight) * 100}%`;
              lobbyDropTarget.style.width = `${(position.cell / position.nativeWidth) * 100}%`;
              lobbyDropTarget.style.height = `${(position.cell / position.nativeHeight) * 100}%`;
              mapCanvas.append(lobbyDropTarget);
            };
            let nativeDragPreview = null;
            lobbySource.addEventListener('dragstart', (event) => {
              clearSelectionForDrag();
              event.dataTransfer.effectAllowed = 'move';
              event.dataTransfer.setData('text/x-dnd-character', ownParticipant.characterId);
              const sourceAvatar = lobbySource.querySelector('.game-room-member-avatar');
              nativeDragPreview = sourceAvatar?.cloneNode(true) || document.createElement('span');
              nativeDragPreview.className = 'game-room-avatar-drag-preview';
              document.body.append(nativeDragPreview);
              event.dataTransfer.setDragImage(nativeDragPreview, 22, 22);
              lobbySource.classList.add('is-dragging-character');
            });
            lobbySource.addEventListener('dragend', () => { lobbySource.classList.remove('is-dragging-character'); lobbyDropTarget.remove(); nativeDragPreview?.remove(); nativeDragPreview = null; });
            mapCanvas.addEventListener('dragover', (event) => {
              if (!event.dataTransfer.types.includes('text/x-dnd-character')) return;
              event.preventDefault();
              showLobbyDropTarget(mapGridPosition(event, mapCanvas, currentMapForDrag));
            });
            mapCanvas.addEventListener('drop', (event) => {
              if (!event.dataTransfer.types.includes('text/x-dnd-character')) return;
              event.preventDefault();
              const position = mapGridPosition(event, mapCanvas, currentMapForDrag);
              lobbyDropTarget.remove();
              void placeLobbyParticipant(position);
            });
            let touchDrag = null;
            lobbySource.addEventListener('pointerdown', (event) => {
              if (!['touch', 'pen'].includes(event.pointerType) || event.target.closest('button')) return;
              touchDrag = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, active: false, ghost: null, position: null };
              lobbySource.setPointerCapture(event.pointerId);
            });
            lobbySource.addEventListener('pointermove', (event) => {
              if (!touchDrag || touchDrag.pointerId !== event.pointerId) return;
              const distance = Math.hypot(event.clientX - touchDrag.startX, event.clientY - touchDrag.startY);
              if (!touchDrag.active && distance > 10 && Math.abs(event.clientX - touchDrag.startX) > Math.abs(event.clientY - touchDrag.startY)) {
                touchDrag.active = true;
                clearSelectionForDrag();
                touchDrag.ghost = lobbySource.querySelector('.game-room-member-avatar')?.cloneNode(true) || document.createElement('span');
                touchDrag.ghost.className = 'game-room-member-drag-ghost';
                document.body.append(touchDrag.ghost);
              }
              if (!touchDrag.active) return;
              event.preventDefault();
              touchDrag.ghost.style.left = `${event.clientX + 12}px`;
              touchDrag.ghost.style.top = `${event.clientY + 12}px`;
              touchDrag.position = mapGridPosition(event, mapCanvas, currentMapForDrag);
              showLobbyDropTarget(touchDrag.position);
            });
            const finishTouchDrag = (event) => {
              if (!touchDrag || touchDrag.pointerId !== event.pointerId) return;
              const completed = touchDrag.active && touchDrag.position?.valid ? touchDrag.position : null;
              touchDrag.ghost?.remove();
              lobbyDropTarget.remove();
              touchDrag = null;
              if (completed) void placeLobbyParticipant(completed);
            };
            lobbySource.addEventListener('pointerup', finishTouchDrag);
            lobbySource.addEventListener('pointercancel', finishTouchDrag);
          }
          container.querySelectorAll('.game-map-token').forEach((tokenElement) => {
            let pressTimer = null;
            let pressStart = null;
            const closeActions = () => tokenElement.querySelector('.game-map-token-actions')?.remove();
            tokenElement.addEventListener('pointerdown', (event) => {
              pressStart = { x: event.clientX, y: event.clientY };
              clearTimeout(pressTimer);
              pressTimer = setTimeout(() => {
                tokenElement.dataset.suppressClick = 'true';
                container.querySelectorAll('.game-map-token-actions').forEach((actions) => actions.remove());
                tokenElement.insertAdjacentHTML('beforeend', '<span class="game-map-token-actions"><button type="button" data-token-action="details">Dettagli</button><button type="button" data-token-action="status">Stato</button><button type="button" data-token-action="more">Altro</button></span>');
                tokenElement.querySelectorAll('[data-token-action]').forEach((button) => button.addEventListener('click', (actionEvent) => {
                  actionEvent.preventDefault();
                  actionEvent.stopPropagation();
                  createToast('Azione disponibile in un prossimo aggiornamento');
                  closeActions();
                }));
              }, 600);
            });
            tokenElement.addEventListener('pointermove', (event) => {
              if (pressStart && Math.hypot(event.clientX - pressStart.x, event.clientY - pressStart.y) > 7) clearTimeout(pressTimer);
            });
            tokenElement.addEventListener('pointerup', () => clearTimeout(pressTimer));
            tokenElement.addEventListener('pointercancel', () => clearTimeout(pressTimer));
            tokenElement.addEventListener('contextmenu', (event) => event.preventDefault());
            tokenElement.addEventListener('click', (event) => {
              event.stopPropagation();
              if (tokenElement.dataset.suppressClick === 'true') {
                delete tokenElement.dataset.suppressClick;
                return;
              }
              selectToken(tokenElement.dataset.mapTokenId);
            });
          });
          if (!pendingToken) mapCanvas.addEventListener('click', (event) => {
            if (event.target.closest('.game-map-token')) return;
            tokenSelections.clear();
            localSelectedTokenId = null;
            void cleanupRealtime?.updatePresence?.({ selectedTokenId: null, selectedAt: Date.now() });
            paint();
          });
          container.querySelectorAll('[data-remove-map-token]').forEach((button) => button.addEventListener('click', async (event) => {
            event.preventDefault();
            event.stopPropagation();
            const tokenElement = button.closest('[data-map-token-id]');
            const token = lobby.tokens.find((entry) => String(entry.id) === String(tokenElement?.dataset.mapTokenId));
            if (!token || !await openConfirmModal({ title: `Rimuovere ${token.name}?`, message: 'La pedina verrà rimossa dalla griglia.', confirmLabel: 'Rimuovi pedina' })) return;
            try {
              await deleteGameMapToken(roomId, currentMapForDrag.id, token.id);
              lobby.tokens = lobby.tokens.filter((entry) => String(entry.id) !== String(token.id));
              tokenSelections.clear();
              localSelectedTokenId = null;
              void cleanupRealtime?.updatePresence?.({ selectedTokenId: null, selectedAt: Date.now() });
              paint();
              createToast('Pedina rimossa dalla griglia');
            } catch (error) { createToast(formatError(error), 'error'); }
          }));
          container.querySelectorAll('.game-map-token.is-draggable').forEach((tokenElement) => {
            let dragPosition = null;
            let hasMoved = false;
            const originalLeft = tokenElement.style.left;
            const originalTop = tokenElement.style.top;
            const dropTarget = document.createElement('span');
            dropTarget.className = 'game-map-drop-target';
            const updateDropTarget = (position) => {
              const offsetX = Number(currentMapForDrag.grid_offset_x_px) || 0;
              const offsetY = Number(currentMapForDrag.grid_offset_y_px) || 0;
              dropTarget.style.left = `${((offsetX + position.gridX * position.cell) / position.nativeWidth) * 100}%`;
              dropTarget.style.top = `${((offsetY + position.gridY * position.cell) / position.nativeHeight) * 100}%`;
              dropTarget.style.width = `${(position.cell / position.nativeWidth) * 100}%`;
              dropTarget.style.height = `${(position.cell / position.nativeHeight) * 100}%`;
            };
            tokenElement.addEventListener('pointerdown', (event) => {
              if (event.button !== 0) return;
              event.preventDefault();
              event.stopPropagation();
              hasMoved = false;
              dragPosition = mapGridPosition(event, mapCanvas, currentMapForDrag);
              if (dragPosition.valid) {
                updateDropTarget(dragPosition);
                mapCanvas.append(dropTarget);
              }
              tokenElement.setPointerCapture(event.pointerId);
              tokenElement.classList.add('is-dragging');
            });
            tokenElement.addEventListener('pointermove', (event) => {
              if (!tokenElement.hasPointerCapture(event.pointerId)) return;
              const next = mapGridPosition(event, mapCanvas, currentMapForDrag);
              if (!next.valid) return;
              if (!hasMoved) clearSelectionForDrag();
              hasMoved = true;
              dragPosition = next;
              updateDropTarget(next);
              const offsetX = Number(currentMapForDrag.grid_offset_x_px) || 0;
              const offsetY = Number(currentMapForDrag.grid_offset_y_px) || 0;
              tokenElement.style.left = `${((offsetX + next.gridX * next.cell) / next.nativeWidth) * 100}%`;
              tokenElement.style.top = `${((offsetY + next.gridY * next.cell) / next.nativeHeight) * 100}%`;
            });
            tokenElement.addEventListener('pointerup', async (event) => {
              if (!tokenElement.hasPointerCapture(event.pointerId)) return;
              tokenElement.releasePointerCapture(event.pointerId);
              tokenElement.classList.remove('is-dragging');
              dropTarget.remove();
              if (hasMoved) tokenElement.dataset.suppressClick = 'true';
              if (!hasMoved || !dragPosition?.valid) return;
              const token = lobby.tokens.find((entry) => String(entry.id) === String(tokenElement.dataset.mapTokenId));
              if (!token || (Number(token.grid_x) === dragPosition.gridX && Number(token.grid_y) === dragPosition.gridY)) return;
              const previous = { gridX: token.grid_x, gridY: token.grid_y };
              token.grid_x = dragPosition.gridX;
              token.grid_y = dragPosition.gridY;
              try {
                await moveGameMapToken(roomId, currentMapForDrag.id, token.id, dragPosition.gridX, dragPosition.gridY);
              } catch (error) {
                token.grid_x = previous.gridX;
                token.grid_y = previous.gridY;
                tokenElement.style.left = originalLeft;
                tokenElement.style.top = originalTop;
                createToast(formatError(error), 'error');
              }
            });
            tokenElement.addEventListener('pointercancel', () => {
              tokenElement.classList.remove('is-dragging');
              dropTarget.remove();
              tokenElement.style.left = originalLeft;
              tokenElement.style.top = originalTop;
            });
          });
        }
        syncMapZoom();
        if (previousScroll) requestAnimationFrame(() => {
          const nextViewport = container.querySelector('[data-map-viewport]');
          if (nextViewport) nextViewport.scrollTo({ left: previousScroll.left, top: previousScroll.top, behavior: 'auto' });
        });
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
        container.querySelector('[data-position-token]')?.addEventListener('click', async () => {
          const participant = await openTokenPicker(roomTokenParticipants(lobby, state));
          if (!participant) return;
          pendingToken = participant;
          paint();
          createToast('Tocca una casella per posizionare la pedina');
        });
        container.querySelector('[data-map-settings]')?.addEventListener('click', async () => {
          try {
            const currentMap = lobby.maps.find((map) => map.is_active);
            const result = currentMap && await openMapSettings(roomId, currentMap);
            if (!result) return;
            pendingToken = result.participant;
            if (result.mapChanged) {
              lobby = await fetchGameRoom(roomId);
            } else if (result.settings) {
              currentMap.grid_cell_size_px = result.settings.gridCellSize;
              currentMap.grid_color = result.settings.gridColor;
              currentMap.grid_visible = result.settings.gridVisible;
            }
            paint();
            createToast(result.mapChanged ? 'Nuova mappa attivata' : pendingToken ? 'Tocca una casella per posizionare la pedina' : 'Mappa aggiornata');
          } catch (error) { createToast(formatError(error), 'error'); }
        });
        container.querySelector('[data-delete-map]')?.addEventListener('click', async () => {
          const currentMap = lobby.maps.find((map) => map.is_active);
          if (!currentMap || !await openConfirmModal({
            title: `Eliminare ${currentMap.title}?`,
            message: 'La mappa e tutte le pedine posizionate verranno eliminate definitivamente. Il tavolo tornerà vuoto.',
            confirmLabel: 'Elimina mappa'
          })) return;
          try {
            await deleteGameMap(roomId, currentMap.id);
            lobby = await fetchGameRoom(roomId);
            mapZoom = 1;
            paint();
            createToast('Mappa eliminata');
          } catch (error) { createToast(formatError(error), 'error'); }
        });
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
      const ownRoomMember = lobby.members.find((member) => String(member.user_id) === String(state.user.id));
      const presenceDisplayName = ownRoomMember?.display_name || (String(lobby.room.master_user_id) === String(state.user.id) ? 'Dungeon Master' : 'Giocatore');
      cleanupRealtime = subscribeToGameRoom(roomId, {
        userId: state.user.id,
        displayName: presenceDisplayName,
        onPersistentChange: () => {
          clearTimeout(realtimeRefreshTimer);
          realtimeRefreshTimer = setTimeout(async () => {
            lobby = await fetchGameRoom(roomId);
            paint();
          }, 120);
        },
        onPresence: (presence) => {
          online.clear();
          tokenSelections.clear();
          const entries = Object.values(presence).flat();
          let newestSelection = null;
          entries.forEach((entry) => {
            online.add(String(entry.userId));
            if (entry.selectedTokenId && (!newestSelection || Number(entry.selectedAt || 0) > Number(newestSelection.selectedAt || 0))) newestSelection = entry;
          });
          const ownSelections = entries.filter((entry) => String(entry.userId) === String(state.user.id)).sort((a, b) => Number(b.selectedAt || 0) - Number(a.selectedAt || 0));
          localSelectedTokenId = ownSelections[0]?.selectedTokenId ? String(ownSelections[0].selectedTokenId) : null;
          if (newestSelection) tokenSelections.set(String(newestSelection.selectedTokenId), [newestSelection.displayName || 'Giocatore']);
          paint();
        }
      });
    } catch (error) { createToast(formatError(error), 'error'); await showList(); }
  };
  await showList();
  window.addEventListener('hashchange', () => cleanupRealtime?.(), { once: true });
}
