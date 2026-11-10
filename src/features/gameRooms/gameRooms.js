import './gameRooms.css';
import { getState } from '../../app/state.js';
import { createToast, openConfirmModal, openFormModal, setGlobalLoading } from '../../ui/components.js';
import { escapeHtml, sanitizeImageUrl } from '../../lib/html.js';
import {
  createCharacterMapToken,
  createCreatureMapToken,
  createGameMap,
  createGameRoom,
  deleteGameMap,
  deleteGameMapToken,
  deleteGameRoom,
  fetchGameRoom,
  fetchGameRooms,
  fetchSharedGameCreatures,
  joinGameRoom,
  kickGameRoomMember,
  leaveGameRoom,
  moveGameMapToken,
  placeOwnGameMapToken,
  rotateGameRoomInvite,
  setGameMapCell,
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
    content: `<div class="game-room-form"><label class="field"><span>Nome della stanza</span><input name="title" maxlength="120" required placeholder="Es. Sessione del venerdì"></label><fieldset class="game-room-rules-picker"><legend>Regole della sessione</legend><div><label><input type="radio" name="rules_version" value="2014" checked><span><strong>2014</strong><small>Regole classiche</small></span></label><label><input type="radio" name="rules_version" value="2024"><span><strong>2024</strong><small>Regole aggiornate</small></span></label></div></fieldset><label class="field"><span>Descrizione <small>facoltativa</small></span><textarea name="description" rows="4" maxlength="1000" placeholder="Tema, appuntamento o indicazioni per i giocatori"></textarea></label><label class="field"><span>Numero massimo di giocatori</span><input name="max_players" type="number" min="1" max="20" value="8" required></label></div>`
  });
  if (!data) return null;
  return createGameRoom({ title: data.get('title'), description: data.get('description'), maxPlayers: data.get('max_players'), rulesVersion: data.get('rules_version') });
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
  setGlobalLoading(true);
  try {
    return await joinGameRoom({ inviteCode: data.get('invite_code'), characterId: data.get('character_id'), displayName: data.get('display_name') });
  } finally {
    setGlobalLoading(false);
  }
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
    gridVisible: data.get('grid_visible') === 'true',
    imageWidth: Number(map.image_width_px) || 1,
    imageHeight: Number(map.image_height_px) || 1
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
  const isMaster = String(lobby.room.master_user_id) === String(state.user.id);
  return [
    isMaster && activeCharacter ? { userId: state.user.id, characterId: activeCharacter.id, name: activeCharacter.name || 'Dungeon Master', imageUrl: sanitizeImageUrl(activeCharacter.data?.avatar_url || ''), hpCurrent: activeCharacter.data?.hp?.current, hpMax: activeCharacter.data?.hp?.max, speed: activeCharacter.data?.speed, isMaster: true } : null,
    ...lobby.members.map((member) => member.character ? ({ userId: member.user_id, characterId: member.character.id, name: member.character.name || member.display_name, imageUrl: sanitizeImageUrl(member.character.data?.avatar_url || ''), hpCurrent: member.character.data?.hp?.current, hpMax: member.character.data?.hp?.max, speed: member.character.data?.speed, isMaster: false }) : null)
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

function buildTacticalMap(activeMap, tokens = [], mapCells = []) {
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
    return `<span class="game-map-token game-map-token--${escapeHtml(token.token_type)}" style="left:${left}%;top:${top}%;width:${tokenWidth}%;height:${tokenHeight}%" title="${escapeHtml(token.name)}">${image ? `<img src="${image}" alt="" draggable="false">` : `<b>${escapeHtml(String(token.name || '?').slice(0, 2).toUpperCase())}</b>`}<small>${escapeHtml(token.name)}</small></span>`;
  }).join('');
  const cellMarkup = mapCells.map((entry) => {
    const left = ((offsetX + Number(entry.grid_x) * cell) / width) * 100;
    const top = ((offsetY + Number(entry.grid_y) * cell) / height) * 100;
    return `<span class="game-map-cell game-map-cell--${escapeHtml(entry.cell_type)}" style="left:${left}%;top:${top}%;width:${(cell / width) * 100}%;height:${(cell / height) * 100}%" aria-hidden="true"></span>`;
  }).join('');
  return `<div class="game-map-viewport" data-map-viewport><div class="game-map-stage" data-map-stage style="--map-stage-width:${width}px;--map-stage-height:${height}px"><div class="game-map-canvas" data-map-canvas data-native-width="${width}" data-native-height="${height}" style="width:${width}px;height:${height}px;${activeMap.imageUrl ? `background-image:url('${escapeHtml(activeMap.imageUrl)}')` : ''}">${activeMap.grid_visible ? `<span class="game-map-grid" style="${gridStyle}"></span>` : ''}<span class="game-map-cell-layer">${cellMarkup}</span><span class="game-map-range-layer" data-map-range-layer></span><span class="game-map-tokens">${tokenMarkup}</span></div></div></div>`;
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
  const columns = Math.max(Number(map.grid_columns) || 0, Math.ceil((nativeWidth - (Number(map.grid_offset_x_px) || 0)) / cell));
  const rows = Math.max(Number(map.grid_rows) || 0, Math.ceil((nativeHeight - (Number(map.grid_offset_y_px) || 0)) / cell));
  const valid = gridX >= 0 && gridY >= 0 && gridX < columns && gridY < rows;
  return { gridX, gridY, valid, nativeWidth, nativeHeight, cell };
}

function tokenDetailMarkup(token) {
  const hp = token.token_data?.hp || {};
  const type = token.token_type === 'character' ? 'Personaggio' : token.token_type === 'creature' ? 'Creatura' : 'Pedina';
  return `<div class="game-token-quick-detail"><header>${token.image_url ? `<img src="${escapeHtml(sanitizeImageUrl(token.image_url))}" alt="">` : '<span aria-hidden="true">♟</span>'}<div><small>${type}</small><strong>${escapeHtml(token.name)}</strong></div><button type="button" data-token-detail-close aria-label="Chiudi">×</button></header><div class="game-token-quick-detail__stats"><span><small>PF</small><b>${escapeHtml(hp.current ?? '—')} / ${escapeHtml(hp.max ?? '—')}</b></span><span><small>Iniziativa</small><b>${escapeHtml(token.initiative ?? '—')}</b></span><span><small>Posizione</small><b>${Number(token.grid_x) + 1}, ${Number(token.grid_y) + 1}</b></span><span><small>Ingombro</small><b>${Number(token.size_columns) || 1}×${Number(token.size_rows) || 1}</b></span></div>${token.notes ? `<p>${escapeHtml(token.notes)}</p>` : ''}</div>`;
}

function openTokenQuickDetail(token) {
  document.querySelector('.game-token-detail-popover')?.remove();
  const host = document.createElement('div');
  host.className = 'game-token-detail-popover';
  host.innerHTML = `<div data-token-detail-close></div>${tokenDetailMarkup(token)}`;
  document.body.append(host);
  const close = () => host.remove();
  host.querySelectorAll('[data-token-detail-close]').forEach((element) => element.addEventListener('click', close));
}

export function tacticalRangeCells(map, token, radius, mapCells = [], movement = false) {
  const columns = Math.max(Number(map.grid_columns) || 0, Math.ceil(Number(map.image_width_px || 1) / Number(map.grid_cell_size_px || 64)));
  const rows = Math.max(Number(map.grid_rows) || 0, Math.ceil(Number(map.image_height_px || 1) / Number(map.grid_cell_size_px || 64)));
  const obstacles = new Set(mapCells.filter((cell) => cell.cell_type === 'obstacle').map((cell) => `${cell.grid_x}:${cell.grid_y}`));
  const difficult = new Set(mapCells.filter((cell) => cell.cell_type === 'difficult').map((cell) => `${cell.grid_x}:${cell.grid_y}`));
  const start = { x: Number(token.grid_x), y: Number(token.grid_y), cost: 0 };
  const queue = [start];
  const best = new Map([[`${start.x}:${start.y}`, 0]]);
  const result = [];
  while (queue.length) {
    const current = queue.shift();
    if (current.cost > 0) result.push({ gridX: current.x, gridY: current.y });
    for (let dy = -1; dy <= 1; dy += 1) for (let dx = -1; dx <= 1; dx += 1) {
      if (!dx && !dy) continue;
      const x = current.x + dx; const y = current.y + dy; const key = `${x}:${y}`;
      if (x < 0 || y < 0 || x >= columns || y >= rows || obstacles.has(key)) continue;
      const cost = current.cost + (movement && difficult.has(key) ? 2 : 1);
      if (cost > radius || (best.has(key) && best.get(key) <= cost)) continue;
      best.set(key, cost); queue.push({ x, y, cost });
    }
  }
  return result;
}

function renderTacticalRange(canvas, map, token, cells, kind) {
  const layer = canvas?.querySelector('[data-map-range-layer]');
  if (!layer || !token || !cells.length) return;
  const width = Number(map.image_width_px) || 1; const height = Number(map.image_height_px) || 1;
  const cell = Number(map.grid_cell_size_px) || 64; const offsetX = Number(map.grid_offset_x_px) || 0; const offsetY = Number(map.grid_offset_y_px) || 0;
  layer.innerHTML = cells.map((entry) => `<span class="game-map-range-cell game-map-range-cell--${kind}" style="left:${((offsetX + entry.gridX * cell) / width) * 100}%;top:${((offsetY + entry.gridY * cell) / height) * 100}%;width:${(cell / width) * 100}%;height:${(cell / height) * 100}%"></span>`).join('');
}

function numberCreatureTokens(tokens = []) {
  const groupTotals = new Map();
  tokens.forEach((token) => {
    if (token.token_type !== 'creature') return;
    const key = String(token.shared_creature_id || token.name || '').toLowerCase();
    groupTotals.set(key, (groupTotals.get(key) || 0) + 1);
  });
  const groupIndexes = new Map();
  return tokens.map((token) => {
    if (token.token_type !== 'creature') return token;
    const key = String(token.shared_creature_id || token.name || '').toLowerCase();
    if ((groupTotals.get(key) || 0) < 2) return token;
    const index = (groupIndexes.get(key) || 0) + 1;
    groupIndexes.set(key, index);
    return { ...token, name: `${token.name} ${index}` };
  });
}

function healthBarMarkup(currentValue, maxValue, className) {
  const current = Number(currentValue);
  const max = Number(maxValue);
  if (!Number.isFinite(current) || !Number.isFinite(max) || max <= 0) return '';
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  const color = percentage > 50 ? '#3f9564' : percentage > 25 ? '#d4872d' : '#c64d52';
  return `<span class="${className}" style="--hp:${percentage}%;--hp-color:${color}"><i></i><b>${current}/${max} PF</b></span>`;
}

function renderLobby(container, data, userId, onlineUsers = new Set(), masterCharacter = null, tokenSelections = new Map(), options = {}) {
  const { room, members, maps, tokens = [], mapCells = [] } = data;
  const { creaturePaletteOpen = false, sharedCreatures = [], dmCharacters = [], selectedLobbyUserId = null, selectedCreatureId = null, selectedDmCharacterId = null, creatureSearch = '', tacticalMode = null, terrainMode = null, weaponOptions = [] } = options;
  const roomRulesVersion = String(room.rules_version || '2014').includes('2024') ? '2024' : '2014';
  const normalizedCreatureSearch = creatureSearch.trim().toLocaleLowerCase('it');
  const visibleCreatures = sharedCreatures.filter((creature) => creature.rules === roomRulesVersion && (!normalizedCreatureSearch || creature.name.toLocaleLowerCase('it').includes(normalizedCreatureSearch)));
  const visibleDmCharacters = dmCharacters.filter((character) => !normalizedCreatureSearch || character.name.toLocaleLowerCase('it').includes(normalizedCreatureSearch));
  const isMaster = String(room.master_user_id) === String(userId);
  const activeMap = maps.find((map) => map.is_active);
  const players = members;
  const displayTokens = numberCreatureTokens(tokens);
  const placedMapTokens = displayTokens.filter((token) => !activeMap || String(token.map_id) === String(activeMap.id));
  const selectedToken = displayTokens.find((token) => String(token.id) === String(options.selectedMapTokenId));
  const canControlSelected = selectedToken && (isMaster || String(selectedToken.owner_user_id) === String(userId));
  const controlledWeapons = selectedToken && String(selectedToken.owner_user_id) === String(userId) ? weaponOptions : [];
  const tacticalActions = canControlSelected && selectedToken.token_type === 'character' ? `<div class="game-map-tactical-actions" data-tactical-actions><button type="button" data-tactical-mode="attack" class="${tacticalMode === 'attack' ? 'is-active' : ''}"><span>⚔</span>Attacco</button><button type="button" data-tactical-mode="movement" class="${tacticalMode === 'movement' ? 'is-active' : ''}"><span>➜</span>Movimento</button>${tacticalMode === 'attack' ? `<label><span>Arma</span><select data-tactical-weapon>${controlledWeapons.length ? controlledWeapons.map((weapon) => `<option value="${escapeHtml(weapon.id)}" ${String(options.selectedWeaponId) === String(weapon.id) ? 'selected' : ''}>${escapeHtml(weapon.name)}</option>`).join('') : '<option value="melee">Attacco in mischia</option>'}</select></label>` : ''}</div>` : '';
  const terrainActions = isMaster && activeMap && !tacticalActions ? `<div class="game-map-terrain-actions"><small>Strumenti DM</small><button type="button" data-terrain-mode="difficult" class="${terrainMode === 'difficult' ? 'is-active' : ''}">Terreno difficile</button><button type="button" data-terrain-mode="obstacle" class="${terrainMode === 'obstacle' ? 'is-active' : ''}">Ostacolo</button><button type="button" data-terrain-mode="erase" class="${terrainMode === 'erase' ? 'is-active' : ''}">Cancella</button></div>` : '';
  container.innerHTML = `<section class="game-room-lobby"><header class="game-room-sessionbar"><div class="game-room-sessionbar__identity"><button class="game-room-back" type="button" data-room-list aria-label="Torna alle stanze">‹</button><span><small>Sessione multiplayer</small><strong>${escapeHtml(room.title)}</strong></span></div><div class="game-room-sessionbar__actions">${isMaster ? '<button class="ghost-button game-room-delete" type="button" data-delete-room>Elimina sessione</button>' : '<button class="ghost-button game-room-danger" type="button" data-leave-room>Esci</button>'}</div></header><div class="game-room-workspace"><main class="game-room-map-panel"><header><div class="game-room-map-title"><span class="eyebrow">Mappa attiva</span><h1>${activeMap ? escapeHtml(activeMap.title) : 'Tavolo di gioco'}</h1></div><div class="game-map-toolbar"><button type="button" data-map-zoom-out aria-label="Riduci zoom">−</button><output data-map-zoom>100%</output><button type="button" data-map-zoom-in aria-label="Aumenta zoom">+</button><button type="button" data-map-fit>Adatta</button></div><div class="game-room-map-actions">${isMaster ? '<button class="primary" type="button" data-manage-maps>Mappe</button>' : ''}</div></header>${buildTacticalMap(activeMap, displayTokens, mapCells)}${terrainActions}${tacticalActions}</main><aside class="game-room-sidebar"><section class="game-room-panel game-room-members"><header><div><span class="eyebrow">Lobby</span><h2>Partecipanti</h2></div><strong>${players.length}/${room.max_players}</strong></header><div>${players.length ? players.map((member) => { const online = onlineUsers.has(String(member.user_id)) || String(member.user_id) === String(userId); return `<article><span class="game-room-presence ${online ? 'is-online' : ''}" title="${online ? 'Online' : 'Offline'}"></span><span><strong>${escapeHtml(member.display_name || 'Giocatore')}${String(member.user_id) === String(userId) ? '<em class="game-room-member-self">Tu</em>' : ''}</strong></span>${isMaster ? `<button class="icon-button" type="button" data-kick-member="${escapeHtml(member.user_id)}" aria-label="Espelli ${escapeHtml(member.display_name)}">×</button>` : ''}</article>`; }).join('') : '<p class="game-room-members-empty">Nessun partecipante collegato.</p>'}</div></section>${isMaster ? `<section class="game-room-panel game-room-invite"><header><div><span class="eyebrow">Invito</span><h2>Codice stanza</h2></div><div class="game-room-invite__actions"><button class="game-room-icon-action" type="button" data-copy-invite aria-label="Copia codice" title="Copia codice">⧉</button><button class="game-room-icon-action" type="button" data-rotate-invite aria-label="Genera un nuovo codice" title="Nuovo codice">↻</button></div></header><code>${escapeHtml(room.invite_code)}</code></section>` : ''}<section class="game-room-panel game-room-legend"><span class="eyebrow">Legenda</span><p><i aria-hidden="true"></i><strong>1 casella</strong><span>= 1,5 m</span></p></section></aside></div></section>`;
  const invite = container.querySelector('.game-room-invite');
  const sessionbar = container.querySelector('.game-room-sessionbar');
  const sessionActions = container.querySelector('.game-room-sessionbar__actions');
  if (invite && sessionbar) {
    invite.classList.add('game-room-invite--inline');
    sessionbar.insertBefore(invite, sessionActions);
  }
  const workspace = container.querySelector('.game-room-workspace');
  if (isMaster && creaturePaletteOpen && workspace) {
    workspace.classList.add('has-creature-palette');
    workspace.insertAdjacentHTML('afterbegin', `<aside class="game-room-creature-palette"><header><span><small>Personaggi e bestiario ${roomRulesVersion}</small><strong>Pedine</strong></span><button type="button" data-close-creature-palette aria-label="Chiudi pedine">×</button></header><label class="game-room-creature-search"><input type="search" data-creature-search aria-label="Cerca pedina" value="${escapeHtml(creatureSearch)}" placeholder="Cerca una pedina…" autocomplete="off"></label><section class="game-room-dm-character-palette"><header><strong>I tuoi personaggi</strong><small>${visibleDmCharacters.length}</small></header><div>${visibleDmCharacters.length ? visibleDmCharacters.map((character) => `<button class="game-room-creature-card game-room-dm-character-card ${String(character.id) === String(selectedDmCharacterId) ? 'is-selected' : ''}" type="button" data-dm-character-id="${escapeHtml(character.id)}">${character.imageUrl ? `<img src="${escapeHtml(sanitizeImageUrl(character.imageUrl))}" alt="" draggable="false">` : '<i aria-hidden="true">♙</i>'}<strong>${escapeHtml(character.name)}</strong></button>`).join('') : '<p class="game-room-creature-empty">Nessun personaggio creato.</p>'}</div></section><section class="game-room-creature-source"><header><strong>Bestiario ${roomRulesVersion}</strong><small>${visibleCreatures.length}</small></header><div class="game-room-creature-catalog">${visibleCreatures.length ? visibleCreatures.map((creature) => `<button class="game-room-creature-card ${String(creature.id) === String(selectedCreatureId) ? 'is-selected' : ''}" type="button" data-creature-id="${escapeHtml(creature.id)}">${creature.imageUrl ? `<img src="${escapeHtml(sanitizeImageUrl(creature.imageUrl))}" alt="" draggable="false">` : '<i aria-hidden="true">♞</i>'}<strong>${escapeHtml(creature.name)}</strong></button>`).join('') : `<p class="game-room-creature-empty">Nessuna creatura trovata.</p>`}</div></section><section class="game-room-placed-creatures"><header><strong>Pedine sulla mappa</strong><small>${placedMapTokens.length}</small></header><div>${placedMapTokens.length ? placedMapTokens.map((token) => { const source = sharedCreatures.find((creature) => String(creature.id) === String(token.shared_creature_id)); const hp = token.token_data?.hp || { current: source?.hpCurrent, max: source?.hpMax }; return `<button type="button" class="game-room-placed-creature ${String(token.id) === String(options.selectedMapTokenId) ? 'is-selected' : ''}" data-placed-token-id="${escapeHtml(token.id)}">${token.image_url ? `<img src="${escapeHtml(sanitizeImageUrl(token.image_url))}" alt="" draggable="false">` : `<i aria-hidden="true">${token.token_type === 'character' ? '♙' : '♞'}</i>`}<span><strong>${escapeHtml(token.name)}</strong>${healthBarMarkup(hp.current, hp.max, 'game-room-creature-hp')}</span></button>`; }).join('') : '<p>Nessuna pedina inserita.</p>'}</div></section></aside>`);
  }
  container.querySelectorAll('.game-room-members article').forEach((article, index) => {
    const player = players[index];
    if (String(player?.user_id) === String(room.master_user_id)) article.querySelector('[data-kick-member]')?.remove();
    const info = article.children[1];
    info?.classList.add('game-room-member-info');
    const avatarUrl = sanitizeImageUrl(player?.character?.data?.avatar_url || '');
    const avatar = document.createElement(avatarUrl ? 'img' : 'span');
    avatar.className = 'game-room-member-avatar';
    if (avatarUrl) {
      avatar.src = avatarUrl;
      avatar.alt = '';
      avatar.draggable = false;
    } else {
      avatar.textContent = String(player?.display_name || '?').slice(0, 1).toUpperCase();
      avatar.setAttribute('aria-hidden', 'true');
    }
    article.insertBefore(avatar, info);
    info?.querySelector(':scope > small')?.remove();
    const hpCurrent = Number(player?.character?.data?.hp?.current);
    const hpMax = Number(player?.character?.data?.hp?.max);
    info?.insertAdjacentHTML('beforeend', healthBarMarkup(hpCurrent, hpMax, 'game-room-member-hp'));
    if (player?.character) {
      article.dataset.lobbyUserId = String(player.user_id);
      if (isMaster) article.classList.add('is-master-selectable');
      if (String(player.user_id) === String(selectedLobbyUserId)) article.classList.add('is-lobby-selected');
    }
    if (player?.character && String(player.user_id) === String(userId)) {
      article.classList.add('is-own-character', 'is-lobby-selectable');
    }
  });
  container.querySelectorAll('.game-map-token').forEach((tokenElement, index) => {
    const token = displayTokens[index];
    if (!token) return;
    tokenElement.dataset.mapTokenId = token.id;
    if (isMaster || String(token.owner_user_id) === String(userId)) {
      tokenElement.classList.add('is-draggable');
      tokenElement.setAttribute('aria-label', `Sposta ${token.name}`);
    }
    const selectedBy = tokenSelections.get(String(token.id)) || [];
    if (selectedBy.length) {
      tokenElement.classList.add('is-selected');
      tokenElement.dataset.selectedBy = selectedBy.join(', ');
      tokenElement.insertAdjacentHTML('beforeend', `<em class="game-map-token__selection">${escapeHtml(selectedBy.join(', '))}</em>`);
      if (String(options.selectedMapTokenId) === String(token.id)) {
        tokenElement.insertAdjacentHTML('beforeend', '<span class="game-map-token__detail-action"><button type="button" data-token-details>Dettagli</button></span>');
        if (isMaster) tokenElement.insertAdjacentHTML('beforeend', '<span class="game-map-token__selected-actions"><button type="button" data-remove-map-token>Rimuovi dalla griglia</button></span>');
      }
    }
  });
  const mapActions = container.querySelector('.game-room-map-actions');
  if (isMaster && mapActions) {
    mapActions.innerHTML = activeMap
      ? `<button class="game-map-action game-map-action--token" type="button" data-position-token><span aria-hidden="true">♟</span> Pedine</button><button class="game-map-action game-map-action--settings" type="button" data-map-settings><span aria-hidden="true">✎</span> Modifica</button><button class="game-map-action game-map-action--danger" type="button" data-delete-map aria-label="Elimina ${escapeHtml(activeMap.title)}" title="Elimina mappa">×</button>`
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
    setGlobalLoading(true);
    cleanupRealtime?.();
    try {
      let lobby = await fetchGameRoom(roomId);
      let sharedCreatures = [];
      if (String(lobby.room.master_user_id) === String(state.user.id)) {
        try { sharedCreatures = await fetchSharedGameCreatures(); }
        catch (error) { createToast(`Bestiario non disponibile: ${formatError(error)}`, 'error'); }
      }
      const online = new Set();
      const tokenSelections = new Map();
      let localSelectedTokenId = null;
      let mapZoom = 1;
      let pendingToken = null;
      let creaturePaletteOpen = false;
      let selectedLobbyUserId = null;
      let selectedCreatureId = null;
      let selectedDmCharacterId = null;
      let creatureSearch = '';
      let focusTokenId = null;
      let tacticalMode = null;
      let selectedWeaponId = null;
      let terrainMode = null;
      const paint = () => {
        const previousViewport = container.querySelector('[data-map-viewport]');
        const previousScroll = previousViewport ? { left: previousViewport.scrollLeft, top: previousViewport.scrollTop } : null;
        const activeCharacter = state.characters.find((character) => String(character.id) === String(state.activeCharacterId)) || state.characters[0] || null;
        const masterCharacter = String(lobby.room.master_user_id) === String(state.user.id) ? activeCharacter : null;
        const dmCharacters = String(lobby.room.master_user_id) === String(state.user.id) ? state.characters.map((character) => ({ userId: state.user.id, characterId: character.id, id: character.id, name: character.name || 'Personaggio', imageUrl: sanitizeImageUrl(character.data?.avatar_url || ''), hpCurrent: character.data?.hp?.current, hpMax: character.data?.hp?.max, speed: character.data?.speed, isMaster: true, tokenType: 'character' })) : [];
        const equippedWeapons = (state.cache?.items || []).filter((item) => item.category === 'weapon' && item.equipable && ((Array.isArray(item.equip_slots) && item.equip_slots.length) || item.equip_slot));
        if (!selectedWeaponId && equippedWeapons.length) selectedWeaponId = String(equippedWeapons[0].id);
        renderLobby(container, lobby, state.user.id, online, masterCharacter, tokenSelections, { creaturePaletteOpen, sharedCreatures, dmCharacters, selectedLobbyUserId, selectedCreatureId, selectedDmCharacterId, selectedMapTokenId: localSelectedTokenId, creatureSearch, tacticalMode, selectedWeaponId, weaponOptions: equippedWeapons, terrainMode });
        const syncMapZoom = () => {
          const canvas = container.querySelector('[data-map-canvas]');
          const viewport = container.querySelector('[data-map-viewport]');
          const output = container.querySelector('[data-map-zoom]');
          if (canvas && viewport) {
            const nativeWidth = Number(canvas.dataset.nativeWidth) || 1;
            const nativeHeight = Number(canvas.dataset.nativeHeight) || 1;
            // Il 100% riempie l'intero pannello: la dimensione eccedente resta scrollabile.
            const fitScale = Math.max(.01, viewport.clientWidth / nativeWidth, viewport.clientHeight / nativeHeight);
            const scaledWidth = nativeWidth * fitScale * mapZoom;
            const scaledHeight = nativeHeight * fitScale * mapZoom;
            canvas.style.width = `${scaledWidth}px`;
            canvas.style.height = `${scaledHeight}px`;
            canvas.style.transform = 'none';
            const stage = container.querySelector('[data-map-stage]');
            if (stage) {
              stage.style.setProperty('--map-stage-width', `${scaledWidth}px`);
              stage.style.setProperty('--map-stage-height', `${scaledHeight}px`);
            }
          }
          if (output) output.textContent = `${Math.round(mapZoom * 100)}%`;
        };
        container.querySelector('[data-map-zoom-in]')?.addEventListener('click', () => { mapZoom = Math.min(2.5, mapZoom + .25); syncMapZoom(); });
        container.querySelector('[data-map-zoom-out]')?.addEventListener('click', () => { mapZoom = Math.max(.5, mapZoom - .25); syncMapZoom(); });
        container.querySelector('[data-map-fit]')?.addEventListener('click', () => {
          const viewport = container.querySelector('[data-map-viewport]');
          mapZoom = 1;
          viewport?.scrollTo({ top: 0, left: 0 }); syncMapZoom();
        });
        const mapCanvas = container.querySelector('[data-map-canvas]');
        if (pendingToken && mapCanvas) {
          mapCanvas.classList.add('is-placing-token');
          container.querySelector('.game-room-map-panel')?.insertAdjacentHTML('beforeend', `<div class="game-map-placement-overlay" role="status"><span aria-hidden="true">⌖</span><div><strong>Posiziona ${escapeHtml(pendingToken.name)}</strong><small>Seleziona una casella libera sulla mappa</small></div></div>`);
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
              if (participant.tokenType === 'creature') {
                await createCreatureMapToken({ roomId, mapId: currentMap.id, creature: participant, gridX, gridY });
              } else {
                const existingToken = lobby.tokens.find((token) => String(token.character_id) === String(participant.characterId));
                const isMaster = String(lobby.room.master_user_id) === String(state.user.id);
                if (isMaster && existingToken) await moveGameMapToken(roomId, currentMap.id, existingToken.id, gridX, gridY);
                else if (isMaster) await createCharacterMapToken({ roomId, mapId: currentMap.id, participant, gridX, gridY });
                else await placeOwnGameMapToken(roomId, currentMap.id, gridX, gridY);
              }
              lobby = await fetchGameRoom(roomId);
              const placedToken = participant.tokenType === 'creature'
                ? null
                : lobby.tokens.find((token) => String(token.character_id) === String(participant.characterId));
              if (placedToken) {
                localSelectedTokenId = String(placedToken.id);
                tokenSelections.clear();
                tokenSelections.set(String(placedToken.id), [participant.name]);
                focusTokenId = String(placedToken.id);
              }
              paint();
              createToast(`Pedina di ${participant.name} posizionata`);
            } catch (error) { createToast(formatError(error), 'error'); }
          });
        }
        const currentMapForDrag = lobby.maps.find((map) => map.is_active);
        if (mapCanvas && currentMapForDrag) {
          const selectedMapToken = lobby.tokens.find((token) => String(token.id) === String(localSelectedTokenId));
          if (selectedMapToken && tacticalMode) {
            const selectedCharacter = state.characters.find((character) => String(character.id) === String(selectedMapToken.character_id));
            if (tacticalMode === 'movement') {
              const speedMeters = Math.max(1.5, Number(selectedCharacter?.data?.speed ?? selectedMapToken.token_data?.speed_m ?? 9));
              const cells = tacticalRangeCells(currentMapForDrag, selectedMapToken, Math.floor(speedMeters / 1.5), lobby.mapCells || [], true);
              renderTacticalRange(mapCanvas, currentMapForDrag, selectedMapToken, cells, 'movement');
            } else if (tacticalMode === 'attack') {
              const weapon = String(selectedMapToken.owner_user_id) === String(state.user.id)
                ? (state.cache?.items || []).find((item) => String(item.id) === String(selectedWeaponId))
                : null;
              const rangeMeters = weapon?.weapon_range === 'ranged' || weapon?.range_normal
                ? Number(weapon.range_normal) || 1.5
                : Number(weapon?.melee_range) || 1.5;
              const cells = tacticalRangeCells(currentMapForDrag, selectedMapToken, Math.max(1, Math.ceil(rangeMeters / 1.5)), lobby.mapCells || [], false);
              renderTacticalRange(mapCanvas, currentMapForDrag, selectedMapToken, cells, 'attack');
            }
          }
          if (String(lobby.room.master_user_id) === String(state.user.id) && terrainMode) {
            mapCanvas.classList.add('is-editing-terrain');
            mapCanvas.addEventListener('click', async (event) => {
              if (event.target.closest('.game-map-token')) return;
              event.preventDefault(); event.stopPropagation();
              const position = mapGridPosition(event, mapCanvas, currentMapForDrag);
              if (!position.valid) return;
              const existing = (lobby.mapCells || []).find((cell) => Number(cell.grid_x) === position.gridX && Number(cell.grid_y) === position.gridY);
              try {
                const cellType = terrainMode === 'erase' ? null : terrainMode;
                await setGameMapCell({ roomId, mapId: currentMapForDrag.id, gridX: position.gridX, gridY: position.gridY, cellType });
                lobby.mapCells = (lobby.mapCells || []).filter((cell) => cell !== existing);
                if (cellType) lobby.mapCells.push({ id: existing?.id || `pending-cell-${Date.now()}`, room_id: roomId, map_id: currentMapForDrag.id, grid_x: position.gridX, grid_y: position.gridY, cell_type: cellType });
                paint();
              } catch (error) { createToast(formatError(error), 'error'); }
            }, { capture: true });
          }
          const ownRoomMember = lobby.members.find((member) => String(member.user_id) === String(state.user.id));
          const currentPresenceName = ownRoomMember?.display_name || (String(lobby.room.master_user_id) === String(state.user.id) ? 'Dungeon Master' : 'Giocatore');
          const selectToken = (tokenId) => {
            const nextTokenId = localSelectedTokenId === String(tokenId) ? null : String(tokenId);
            tacticalMode = null;
            localSelectedTokenId = nextTokenId;
            tokenSelections.clear();
            if (nextTokenId) tokenSelections.set(nextTokenId, [currentPresenceName]);
            void cleanupRealtime?.updatePresence?.({ selectedTokenId: nextTokenId, selectedAt: Date.now() });
            paint();
          };
          const clearSelectionForDrag = () => {
            tacticalMode = null;
            localSelectedTokenId = null;
            tokenSelections.clear();
            container.querySelectorAll('.game-map-token.is-selected').forEach((token) => {
              token.classList.remove('is-selected');
              token.querySelector('.game-map-token__selection')?.remove();
              token.querySelector('.game-map-token__detail-action')?.remove();
              token.querySelector('.game-map-token__selected-actions')?.remove();
            });
            container.querySelector('[data-map-range-layer]')?.replaceChildren();
            container.querySelector('[data-tactical-actions]')?.remove();
            void cleanupRealtime?.updatePresence?.({ selectedTokenId: null, selectedAt: Date.now() });
          };
          container.querySelectorAll('.game-map-token').forEach((tokenElement) => {
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
            tacticalMode = null;
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
          container.querySelectorAll('[data-token-details]').forEach((button) => button.addEventListener('click', (event) => {
            event.preventDefault(); event.stopPropagation();
            const tokenElement = button.closest('[data-map-token-id]');
            const token = lobby.tokens.find((entry) => String(entry.id) === String(tokenElement?.dataset.mapTokenId));
            if (token) openTokenQuickDetail(token);
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
        if (previousScroll || focusTokenId) requestAnimationFrame(() => {
          const nextViewport = container.querySelector('[data-map-viewport]');
          const focusedToken = focusTokenId ? container.querySelector(`[data-map-token-id="${CSS.escape(focusTokenId)}"]`) : null;
          if (nextViewport && focusedToken) {
            const viewportRect = nextViewport.getBoundingClientRect();
            const tokenRect = focusedToken.getBoundingClientRect();
            nextViewport.scrollBy({ left: tokenRect.left + tokenRect.width / 2 - viewportRect.left - viewportRect.width / 2, top: tokenRect.top + tokenRect.height / 2 - viewportRect.top - viewportRect.height / 2, behavior: 'smooth' });
            focusTokenId = null;
          } else if (nextViewport && previousScroll) nextViewport.scrollTo({ left: previousScroll.left, top: previousScroll.top, behavior: 'auto' });
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
        container.querySelector('[data-position-token]')?.addEventListener('click', () => {
          creaturePaletteOpen = !creaturePaletteOpen;
          selectedCreatureId = null;
          selectedDmCharacterId = null;
          if (!creaturePaletteOpen && pendingToken?.paletteSource) pendingToken = null;
          paint();
        });
        container.querySelector('[data-close-creature-palette]')?.addEventListener('click', () => {
          creaturePaletteOpen = false;
          selectedCreatureId = null;
          selectedDmCharacterId = null;
          if (pendingToken?.paletteSource) pendingToken = null;
          paint();
        });
        container.querySelector('[data-creature-search]')?.addEventListener('input', (event) => {
          creatureSearch = event.currentTarget.value;
          const query = creatureSearch.trim().toLocaleLowerCase('it');
          container.querySelectorAll('.game-room-creature-card').forEach((card) => {
            card.hidden = Boolean(query) && !card.textContent.toLocaleLowerCase('it').includes(query);
          });
        });
        container.querySelectorAll('[data-placed-token-id]').forEach((button) => button.addEventListener('click', () => {
          const tokenId = String(button.dataset.placedTokenId);
          const nextTokenId = localSelectedTokenId === tokenId ? null : tokenId;
          localSelectedTokenId = nextTokenId;
          tokenSelections.clear();
          if (nextTokenId) {
            tokenSelections.set(nextTokenId, ['Dungeon Master']);
            focusTokenId = nextTokenId;
          }
          void cleanupRealtime?.updatePresence?.({ selectedTokenId: nextTokenId, selectedAt: Date.now() });
          paint();
        }));
        container.querySelectorAll('[data-creature-id]').forEach((button) => button.addEventListener('click', () => {
          if (button.dataset.suppressCreatureClick === 'true') { delete button.dataset.suppressCreatureClick; return; }
          const creature = sharedCreatures.find((entry) => String(entry.id) === String(button.dataset.creatureId));
          if (!creature) return;
          const isSameCreature = String(selectedCreatureId) === String(creature.id);
          selectedCreatureId = isSameCreature ? null : String(creature.id);
          selectedDmCharacterId = null;
          selectedLobbyUserId = null;
          pendingToken = isSameCreature ? null : { ...creature, sharedCreatureId: creature.id, tokenType: 'creature', paletteSource: 'creature' };
          paint();
          if (!isSameCreature) createToast(`Tocca una casella per posizionare ${creature.name}`);
        }));
        container.querySelectorAll('[data-dm-character-id]').forEach((button) => button.addEventListener('click', () => {
          const character = state.characters.find((entry) => String(entry.id) === String(button.dataset.dmCharacterId));
          if (!character) return;
          const isSameCharacter = String(selectedDmCharacterId) === String(character.id);
          selectedDmCharacterId = isSameCharacter ? null : String(character.id);
          selectedCreatureId = null;
          selectedLobbyUserId = null;
          pendingToken = isSameCharacter ? null : { userId: state.user.id, characterId: character.id, id: character.id, name: character.name || 'Personaggio', imageUrl: sanitizeImageUrl(character.data?.avatar_url || ''), hpCurrent: character.data?.hp?.current, hpMax: character.data?.hp?.max, speed: character.data?.speed, isMaster: true, tokenType: 'character', paletteSource: 'dm-character' };
          paint();
          if (!isSameCharacter) createToast(`Seleziona una casella per posizionare ${character.name}`);
        }));
        container.querySelectorAll('[data-tactical-mode]').forEach((button) => button.addEventListener('click', () => {
          const nextMode = button.dataset.tacticalMode;
          tacticalMode = tacticalMode === nextMode ? null : nextMode;
          terrainMode = null;
          paint();
        }));
        container.querySelector('[data-tactical-weapon]')?.addEventListener('change', (event) => {
          selectedWeaponId = event.currentTarget.value;
          tacticalMode = 'attack';
          paint();
        });
        container.querySelectorAll('[data-terrain-mode]').forEach((button) => button.addEventListener('click', () => {
          const nextMode = button.dataset.terrainMode;
          terrainMode = terrainMode === nextMode ? null : nextMode;
          tacticalMode = null;
          pendingToken = null;
          paint();
        }));
        container.querySelectorAll('.game-room-members article.is-master-selectable, .game-room-members article.is-lobby-selectable').forEach((article) => article.addEventListener('click', (event) => {
          if (event.target.closest('button')) return;
          const userId = article.dataset.lobbyUserId;
          const canSelectParticipant = String(lobby.room.master_user_id) === String(state.user.id) || String(userId) === String(state.user.id);
          if (!canSelectParticipant) return;
          const participant = roomTokenParticipants(lobby, state).find((entry) => String(entry.userId) === String(userId));
          if (!participant) return;
          const isSame = String(selectedLobbyUserId) === String(userId);
          selectedLobbyUserId = isSame ? null : userId;
          selectedCreatureId = null;
          const characterToken = lobby.tokens.find((token) => String(token.character_id) === String(participant.characterId));
          if (isSame) {
            pendingToken = null;
            localSelectedTokenId = null;
            tokenSelections.clear();
            void cleanupRealtime?.updatePresence?.({ selectedTokenId: null, selectedAt: Date.now() });
          } else if (characterToken) {
            pendingToken = null;
            tacticalMode = null;
            localSelectedTokenId = String(characterToken.id);
            tokenSelections.clear();
            tokenSelections.set(String(characterToken.id), ['Dungeon Master']);
            focusTokenId = String(characterToken.id);
            void cleanupRealtime?.updatePresence?.({ selectedTokenId: characterToken.id, selectedAt: Date.now() });
          } else {
            pendingToken = participant;
            tacticalMode = null;
            createToast(`Seleziona una casella in cui posizionare ${participant.name}`);
          }
          paint();
        }));
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
    finally { setGlobalLoading(false); }
  };
  await showList();
  window.addEventListener('hashchange', () => cleanupRealtime?.(), { once: true });
}
