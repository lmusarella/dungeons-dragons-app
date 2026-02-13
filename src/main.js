import './styles/base.css';
import './styles/theme.css';
import './features/dice-roller/styles.css';
import { renderLayout, updateHeaderInfo, updateOfflineBanner } from './ui/layout.js';
import { initRouter, registerRoute } from './app/router.js';
import { initSession, ensureProfile, signOut } from './app/session.js';
import { getState, setState, subscribe } from './app/state.js';
import { loadCachedData } from './lib/offline/cache.js';
import { registerSW } from 'virtual:pwa-register';

const app = document.querySelector('#app');
renderLayout(app);

const ensureFabHandlers = async () => {
  const { bindGlobalFabHandlers } = await import('./features/character/home.js');
  bindGlobalFabHandlers();
};


document.addEventListener('pointerdown', (event) => {
  const target = event.target.closest('button, .bottom-nav a, .menu-item');
  if (!target) return;
  target.classList.remove('is-pressed');
  // force reflow to restart animation on repeated clicks
  void target.offsetWidth;
  target.classList.add('is-pressed');
  window.setTimeout(() => target.classList.remove('is-pressed'), 220);
});

document.addEventListener('click', async (event) => {
  const target = event.target.closest('[data-logout]');
  if (target) {
    event.preventDefault();
    try {
      await signOut();
    } finally {
      window.location.hash = '#/login';
    }
  }
});

registerRoute('login', async (container) => {
  const { renderLogin } = await import('./features/auth/login.js');
  await renderLogin(container);
});
registerRoute('home', async (container) => {
  const { renderHome } = await import('./features/character/home.js');
  await renderHome(container);
});
registerRoute('characters', async (container) => {
  const { renderCharacterSelect } = await import('./features/character/select.js');
  await renderCharacterSelect(container);
});
registerRoute('inventory', async (container) => {
  const { renderInventory } = await import('./features/inventory/inventory.js');
  await renderInventory(container);
});
registerRoute('journal', async (container) => {
  const { renderJournal } = await import('./features/journal/journal.js');
  await renderJournal(container);
});
registerRoute('settings', async (container) => {
  const { renderSettings } = await import('./features/character/settings.js');
  await renderSettings(container);
});

subscribe(() => {
  updateOfflineBanner();
  updateHeaderInfo();
});

window.addEventListener('online', () => setState({ offline: false }));
window.addEventListener('offline', () => setState({ offline: true }));
setState({ offline: !navigator.onLine });

const bootstrapApp = async () => {
  await ensureFabHandlers();
  await initSession();
  const { user } = getState();
  if (user) {
    await ensureProfile(user);
  }
  updateHeaderInfo();

  await loadCachedData();
  initRouter();
};

registerSW({ immediate: true });

bootstrapApp();
