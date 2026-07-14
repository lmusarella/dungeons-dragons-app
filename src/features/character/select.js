import { fetchCharacters } from './characterApi.js';
import { navigate } from '../../app/router.js';
import { getState, normalizeCharacterId, setActiveCharacter, setState } from '../../app/state.js';
import { createToast, setGlobalLoading } from '../../ui/components.js';
import { cacheSnapshot } from '../../lib/offline/cache.js';
import { openCharacterDrawer } from './home/characterDrawer.js';
import { escapeHtml, sanitizeImageUrl } from '../../lib/html.js';

export async function renderCharacterSelect(container) {
  const state = getState();
  const { user, offline } = state;

  setGlobalLoading(true);
  let characters = state.characters;
  try {
    if (!offline && user) {
      try {
        characters = await fetchCharacters(user.id);
        setState({ characters });
        await cacheSnapshot({ characters });
      } catch (error) {
        createToast('Errore caricamento personaggi', 'error');
      }
    }

    const activeId = normalizeCharacterId(state.activeCharacterId);
    const activeCharacter = characters.find((char) => normalizeCharacterId(char.id) === activeId);

    const canCreateCharacter = Boolean(user) && !offline;

    container.innerHTML = `
    <section class="auth-screen character-select-view">
      <div class="card character-select-card character-select-card--refined">
      <header class="character-select-header">
        <div>
          <span class="character-select-header__eyebrow">Personaggi</span>
          <p class="title-car-select">Seleziona o crea un personaggio</p>
          <small class="character-select-header__count">${characters.length} ${characters.length === 1 ? 'personaggio disponibile' : 'personaggi disponibili'}</small>
        </div>
        ${canCreateCharacter ? '<button class="icon-button icon-button--add character-select-add" type="button" data-create-character aria-label="Nuovo personaggio" title="Nuovo personaggio">+</button>' : ''}
      </header>
        <div class="character-card-grid">
        ${characters.length
    ? characters.map((character) => buildCharacterCard(character, character.id === activeCharacter?.id)).join('')
    : '<div class="character-select-empty"><span aria-hidden="true">◇</span><div><strong>Nessun personaggio</strong><small>Crea il tuo primo personaggio per iniziare l’avventura.</small></div></div>'}
        </div>
      </div>
    </section>
  `;

  container.querySelectorAll('[data-character-card]')
    .forEach((card) => {
      card.addEventListener('click', () => {
        setActiveCharacter(card.dataset.characterCard);
        navigate('home');
      });
    });

  const createButton = container.querySelector('[data-create-character]');
    if (createButton) {
      createButton.addEventListener('click', () => {
        openCharacterDrawer(user, () => renderCharacterSelect(container));
      });
    }
  } finally {
    setGlobalLoading(false);
  }
}

function buildCharacterCard(character, isActive) {
  const data = character.data || {};
  const safeName = escapeHtml(character.name);
  const safeAvatarUrl = sanitizeImageUrl(data.avatar_url);
  const avatar = safeAvatarUrl
    ? `<img src="${safeAvatarUrl}" alt="Ritratto di ${safeName}" />`
    : `<span>${escapeHtml(getInitials(character.name))}</span>`;
  const levelLabel = data.level ? `Livello ${data.level}` : null;
  const classLabel = data.class_name || data.class_archetype || data.archetype;
  const primaryMeta = [levelLabel, classLabel].filter(Boolean);
  const tagMeta = [...primaryMeta, data.race].filter(Boolean);
  return `
    <button class="character-card ${isActive ? 'is-active' : ''}" type="button" data-character-card="${escapeHtml(character.id)}">
      <div class="character-card-avatar">
        ${avatar}
      </div>
      <div class="character-card-info">
        <h3>${safeName}</h3>
        ${tagMeta.length
    ? `<div class="character-card-tags">
            ${tagMeta.map((item) => `<span class="character-tag">${escapeHtml(item)}</span>`).join('')}
          </div>`
    : '<p class="character-card-meta muted">Dettagli base non specificati</p>'}
      </div>
    </button>
  `;
}

function getInitials(name = '') {
  const parts = String(name ?? '').split(' ').filter(Boolean);
  if (!parts.length) return '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}
