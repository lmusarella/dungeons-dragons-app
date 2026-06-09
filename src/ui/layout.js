import { closeDrawer, openDrawer } from './components.js';
import { getState } from '../app/state.js';

export function renderLayout(container) {
  const baseUrl = import.meta.env.BASE_URL;
  container.innerHTML = `
    <div class="app-shell">
      <header class="app-header" data-app-header>
        <div class="app-header-left">
          <div class="app-logo">
            <img src="${baseUrl}icons/logo_dd.png" alt="Dungeons & Dragons" class="app-logo-image" />
          </div>
          <div class="app-brand">
            <strong>Companion</strong>
            <span>Scheda digitale</span>
          </div>
        </div>
        <div class="app-header-right">
          <div class="header-meta" data-header-meta>
            <div class="header-meta-item" data-user-row>
              <div class="header-avatar" data-user-avatar></div>
              <div class="header-meta-text">
                <span class="header-meta-label">Utente</span>
                <strong data-user-name></strong>
              </div>
            </div>
            <div class="header-meta-item" data-character-row>
              <div class="header-avatar" data-character-avatar></div>
              <div class="header-meta-text">
                <span class="header-meta-label">Personaggio</span>
                <strong data-character-name></strong>
              </div>
            </div>
          </div>
          <div class="header-action-wrap">
            <button class="menu-button" type="button" data-menu-button aria-label="Apri menu" aria-expanded="false">
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>
      <div class="offline-banner" data-offline-banner hidden>
        Offline (solo lettura)
      </div>
      <main class="app-main" data-route-outlet></main>
      <div class="actions-fab" data-actions-fab>
        <div class="actions-fab-menu" data-actions-menu>
          <section class="actions-fab-group" data-fab-group aria-label="Riposo">
            <p class="actions-fab-group__title">Riposo</p>
            <div class="actions-fab-group__items">
              <button class="actions-fab-item" type="button" data-rest="short_rest"><span class="actions-fab-item__icon" aria-hidden="true">◐</span><span>Breve</span></button>
              <button class="actions-fab-item" type="button" data-rest="long_rest"><span class="actions-fab-item__icon" aria-hidden="true">☾</span><span>Lungo</span></button>
            </div>
          </section>
          <section class="actions-fab-group" data-fab-group aria-label="Azioni">
            <p class="actions-fab-group__title">Azioni</p>
            <div class="actions-fab-group__items">
              <button class="actions-fab-item" type="button" data-hp-action="heal"><span class="actions-fab-item__icon" aria-hidden="true">＋</span><span>Cura</span></button>
              <button class="actions-fab-item" type="button" data-hp-action="damage"><span class="actions-fab-item__icon" aria-hidden="true">−</span><span>Danno</span></button>
              <button class="actions-fab-item" type="button" data-open-dice="roller"><span class="actions-fab-item__icon" aria-hidden="true">◆</span><span>Dadi</span></button>
            </div>
          </section>
          <section class="actions-fab-group" data-fab-group aria-label="Effetti temporanei">
            <p class="actions-fab-group__title">Effetti temporanei</p>
            <div class="actions-fab-group__items">
              <button class="actions-fab-item" type="button" data-edit-conditions data-fab-scope="home"><span class="actions-fab-item__icon" aria-hidden="true">!</span><span>Condizioni</span></button>
              <button class="actions-fab-item" type="button" data-edit-resistances data-fab-scope="home"><span class="actions-fab-item__icon" aria-hidden="true">◈</span><span>Resistenze</span></button>
              <button class="actions-fab-item" type="button" data-edit-roll-adjustments data-fab-scope="home"><span class="actions-fab-item__icon" aria-hidden="true">±</span><span>Vant/Svant</span></button>
            </div>
          </section>
          <section class="actions-fab-group" data-fab-group aria-label="Inventario">
            <p class="actions-fab-group__title">Inventario</p>
            <div class="actions-fab-group__items">
              <button class="actions-fab-item" type="button" data-add-loot><span class="actions-fab-item__icon" aria-hidden="true">◇</span><span>Loot</span></button>
              <button class="actions-fab-item" type="button" data-money-action="pay" data-fab-scope="inventory"><span class="actions-fab-item__icon" aria-hidden="true">↑</span><span>Paga</span></button>
              <button class="actions-fab-item" type="button" data-money-action="receive" data-fab-scope="inventory"><span class="actions-fab-item__icon" aria-hidden="true">↓</span><span>Ricevi</span></button>
            </div>
          </section>
        </div>
        <button class="actions-fab-toggle" type="button" data-actions-toggle aria-expanded="false">
          <span class="actions-fab-toggle__icon" aria-hidden="true">＋</span><span>Azioni</span>
        </button>
      </div>
      <div class="actions-fab-backdrop" aria-hidden="true"></div>
      <nav class="bottom-nav" data-bottom-nav aria-label="Navigazione principale">
        <a href="#/home" data-tab="home"><span class="bottom-nav__pill"><span class="bottom-nav__icon" aria-hidden="true">⌂</span><span>Scheda</span></span></a>
        <a href="#/familiars" data-tab="familiars"><span class="bottom-nav__pill"><span class="bottom-nav__icon" aria-hidden="true">♞</span><span>Famigli</span></span></a>
        <a href="#/inventory" data-tab="inventory"><span class="bottom-nav__pill"><span class="bottom-nav__icon" aria-hidden="true">◇</span><span>Inventario</span></span></a>
        <a href="#/journal" data-tab="journal"><span class="bottom-nav__pill"><span class="bottom-nav__icon" aria-hidden="true">☷</span><span>Diario</span></span></a>
      </nav>
      <div class="drawer" data-drawer>
        <div class="drawer-overlay" data-drawer-close></div>
        <div class="drawer-panel">          
          <div data-drawer-body></div>
        </div>
      </div>
      <div class="modal" data-confirm-modal hidden>
        <div class="modal-overlay" data-confirm-overlay></div>
        <div class="modal-card" role="dialog" aria-modal="true">
          <div class="modal-header">
            <p class="modal-title" data-confirm-title>Conferma</p>
            <div class="modal-divider" aria-hidden="true"></div>
          </div>
          <div class="modal-body">
            <p data-confirm-message></p>
          </div>
          <div class="modal-footer">
            <div class="modal-divider" aria-hidden="true"></div>
            <div class="modal-actions">
              <div class="modal-actions__left">
                <button class="ghost-button" data-confirm-cancel>Annulla</button>
              </div>
              <div class="modal-actions__right">
                <button class="primary" data-confirm-ok>Conferma</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal" data-form-modal hidden>
        <div class="modal-overlay" data-form-overlay></div>
        <div class="modal-card" role="dialog" aria-modal="true">
          <div class="modal-header">
            <div class="modal-header__top">
              <p class="modal-title" data-form-title>Inserisci dati</p>
              <div class="modal-header__actions" data-form-header-actions></div>
            </div>
            <div class="modal-divider" aria-hidden="true"></div>
          </div>
          <form data-form-body class="modal-form">
            <div class="modal-body" data-form-fields></div>
            <div class="modal-footer">
              <div class="modal-divider" aria-hidden="true"></div>
              <div class="modal-actions">
                <div class="modal-actions__left">
                  <button class="ghost-button" type="button" data-form-cancel>Annulla</button>
                </div>
                <div class="modal-actions__right">
                  <button class="primary" type="submit" data-form-submit>Conferma</button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      <div class="toast-container" data-toast-container></div>
      <div class="app-loading-overlay" data-app-loader hidden>
        <div class="app-loading-spinner" aria-hidden="true"></div>
        <p class="app-loading-text">Caricamento in corso...</p>
      </div>
    </div>
  `;

  container.querySelectorAll('[data-drawer-close]')
    .forEach((btn) => btn.addEventListener('click', closeDrawer));

  const menuButton = container.querySelector('[data-menu-button]');
  if (menuButton) {
    menuButton.addEventListener('click', () => {
      openDrawer(buildMenuContent());
      menuButton.setAttribute('aria-expanded', 'true');
    });
  }

  const actionsFab = container.querySelector('[data-actions-fab]');
  const actionsToggle = container.querySelector('[data-actions-toggle]');
  if (actionsFab && actionsToggle) {
    actionsToggle.addEventListener('click', (event) => {
      event.stopPropagation();
      actionsFab.classList.toggle('is-open');
      actionsToggle.setAttribute('aria-expanded', actionsFab.classList.contains('is-open'));
    });
  }

  container.addEventListener('click', (event) => {
    const target = event.target.closest('[data-drawer-close]');
    if (target) {
      closeDrawer();
      menuButton?.setAttribute('aria-expanded', 'false');
    }
    if (actionsFab && actionsFab.classList.contains('is-open')) {
      const insideFab = event.target.closest('[data-actions-fab]');
      if (!insideFab) {
        actionsFab.classList.remove('is-open');
        actionsToggle?.setAttribute('aria-expanded', 'false');
      }
    }
  });
}

export function updateActiveTab(route) {
  document.querySelectorAll('[data-bottom-nav] a').forEach((link) => {
    const isActive = link.getAttribute('href') === `#/${route}`;
    link.classList.toggle('active', isActive);
  });
}

export function updateOfflineBanner() {
  const banner = document.querySelector('[data-offline-banner]');
  if (!banner) return;
  const { offline } = getState();
  const route = window.location.hash.replace('#/', '') || 'home';
  banner.hidden = route === 'login' || !offline;
}

export function updateHeaderInfo() {
  const headerMeta = document.querySelector('[data-header-meta]');
  const menuButton = document.querySelector('[data-menu-button]');
  if (!headerMeta) return;
  const { user, characters, activeCharacterId } = getState();
  const activeCharacter = characters.find((char) => char.id === activeCharacterId);
  const userRow = headerMeta.querySelector('[data-user-row]');
  const characterRow = headerMeta.querySelector('[data-character-row]');
  const userNameEl = headerMeta.querySelector('[data-user-name]');
  const characterNameEl = headerMeta.querySelector('[data-character-name]');
  const userAvatarEl = headerMeta.querySelector('[data-user-avatar]');
  const characterAvatarEl = headerMeta.querySelector('[data-character-avatar]');

  const userName = user?.user_metadata?.display_name || user?.email || 'Utente';
  if (userRow) {
    userRow.hidden = !user;
  }
  if (userNameEl) {
    userNameEl.textContent = user ? userName : '';
  }
  if (userAvatarEl) {
    renderAvatar(userAvatarEl, userName, user?.user_metadata?.avatar_url);
  }

  if (characterRow) {
    characterRow.hidden = !activeCharacter;
  }
  if (characterNameEl) {
    characterNameEl.textContent = activeCharacter?.name ?? '';
  }
  if (characterAvatarEl) {
    renderAvatar(characterAvatarEl, activeCharacter?.name, activeCharacter?.data?.avatar_url);
  }

  headerMeta.hidden = !user;
  if (menuButton) {
    menuButton.hidden = !user;
  }

}

function buildMenuContent() {
  const { user, characters, activeCharacterId } = getState();
  const activeCharacter = characters.find((character) => character.id === activeCharacterId);
  const currentRoute = window.location.hash.replace('#/', '') || 'home';
  const userName = user?.user_metadata?.display_name || user?.email || 'Utente';
  const menuEntries = [
    { route: 'characters', icon: '♙', label: 'Personaggi', description: 'Seleziona o crea un personaggio' },
    { route: 'library', icon: '☷', label: 'Archivio centralizzato', description: 'Gestisci gli incantesimi condivisi' },
    { route: 'settings', icon: '⚙', label: 'Impostazioni', description: 'Configura il personaggio attivo' }
  ];

  const wrapper = document.createElement('div');
  wrapper.className = 'menu-list menu-navigation';
  wrapper.innerHTML = `
    <header class="menu-navigation__header">
      <div class="menu-navigation__profile">
        <span class="menu-navigation__avatar" data-menu-avatar></span>
        <span class="menu-navigation__identity">
          <small>Profilo</small>
          <strong data-menu-user></strong>
          <span data-menu-character></span>
        </span>
      </div>
      <button class="menu-navigation__close" type="button" data-drawer-close aria-label="Chiudi menu">×</button>
    </header>
    <nav class="menu-navigation__section" aria-label="Menu account">
      <span class="menu-navigation__section-title">Gestione</span>
      ${menuEntries.map((entry) => `
        <a class="menu-item menu-navigation__item ${currentRoute === entry.route ? 'is-active' : ''}" href="#/${entry.route}" data-drawer-close ${currentRoute === entry.route ? 'aria-current="page"' : ''}>
          <span class="menu-navigation__item-icon" aria-hidden="true">${entry.icon}</span>
          <span class="menu-navigation__item-copy"><strong>${entry.label}</strong><small>${entry.description}</small></span>
          <span class="menu-navigation__chevron" aria-hidden="true">›</span>
        </a>
      `).join('')}
    </nav>
    <footer class="menu-navigation__footer">
      <button class="menu-item menu-item--danger menu-navigation__logout" type="button" data-logout data-drawer-close>
        <span class="menu-navigation__item-icon" aria-hidden="true">↪</span>
        <span class="menu-navigation__item-copy"><strong>Esci</strong><small>Termina la sessione corrente</small></span>
      </button>
    </footer>
  `;

  const avatar = wrapper.querySelector('[data-menu-avatar]');
  const userNameElement = wrapper.querySelector('[data-menu-user]');
  const characterNameElement = wrapper.querySelector('[data-menu-character]');
  if (avatar) renderAvatar(avatar, userName, user?.user_metadata?.avatar_url);
  if (userNameElement) userNameElement.textContent = userName;
  if (characterNameElement) characterNameElement.textContent = activeCharacter?.name
    ? `Personaggio: ${activeCharacter.name}`
    : 'Nessun personaggio attivo';

  return wrapper;
}

function renderAvatar(container, name, imageUrl) {
  container.innerHTML = '';
  if (imageUrl) {
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = name ? `Avatar di ${name}` : 'Avatar';
    container.appendChild(img);
    return;
  }
  const initials = getInitials(name);
  const fallback = document.createElement('span');
  fallback.textContent = initials;
  container.appendChild(fallback);
}

function getInitials(name = '') {
  const parts = name.split(' ').filter(Boolean);
  if (!parts.length) return '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}
