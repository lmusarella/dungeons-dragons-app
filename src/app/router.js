import { setGlobalLoading } from '../ui/components.js';
import { updateActiveTab } from '../ui/layout.js';
import { getState } from './state.js';

const routes = new Map();
let navigationSequence = 0;
export function registerRoute(path, renderFn) {
  routes.set(path, renderFn);
}

export function navigate(path) {
  window.location.hash = `#/${path}`;
}

export function initRouter() {
  window.addEventListener('hashchange', () => {
    void renderRoute();
  });
  void renderRoute();
}

async function renderRoute() {
  const navigationId = ++navigationSequence;
  const outlet = document.querySelector('[data-route-outlet]');
  if (!outlet) return;
  const requestedRoute = window.location.hash.replace('#/', '') || 'home';
  const route = routes.has(requestedRoute) ? requestedRoute : 'home';
  const { user } = getState();
  const bottomNav = document.querySelector('[data-bottom-nav]');
  const actionsFab = document.querySelector('[data-actions-fab]');
  const actionsBackdrop = document.querySelector('.actions-fab-backdrop');
  const appHeader = document.querySelector('[data-app-header]');
  const offlineBanner = document.querySelector('[data-offline-banner]');
  const appShell = document.querySelector('.app-shell');
  const hideShell = route === 'login' || route === 'characters' || route === 'library' || route === 'settings';
  const hideHeader = route === 'login';
  const fabAlwaysVisibleRoutes = ['home', 'inventory', 'journal'];
  const showFab = fabAlwaysVisibleRoutes.includes(route);
  const isAuthRoute = route === 'login' || route === 'characters';
  const applyRouteShellState = () => {
    if (appShell) {
      appShell.classList.toggle('app-shell--auth', isAuthRoute);
      appShell.dataset.route = route;
    }
    document.body.classList.toggle('no-route-scroll', isAuthRoute);
  };
  const applyShellVisibility = (shouldHide, shouldShowFab) => {
    const { offline } = getState();
    if (bottomNav) bottomNav.hidden = shouldHide;
    if (actionsFab) {
      actionsFab.hidden = !shouldShowFab;
      actionsFab.classList.remove('is-open');
    }
    if (actionsBackdrop) actionsBackdrop.hidden = !shouldShowFab;
    if (appHeader) appHeader.hidden = hideHeader;
    if (offlineBanner) offlineBanner.hidden = hideHeader || !offline;
    if (actionsFab) {
      actionsFab.querySelectorAll('[data-fab-scope]')
        .forEach((item) => {
          item.hidden = !fabAlwaysVisibleRoutes.includes(route) && item.dataset.fabScope !== route;
        });
      actionsFab.querySelectorAll('[data-fab-group]')
        .forEach((group) => {
          const visibleActions = Array.from(group.querySelectorAll('.actions-fab-item'))
            .filter((item) => !item.hidden);
          group.hidden = visibleActions.length === 0;
        });
    }
  };

  setGlobalLoading(true);
  try {
    if (!user && route !== 'login') {
      applyShellVisibility(true, false);
      window.location.hash = '#/login';
      return;
    }
    if (user && route === 'login') {
      applyShellVisibility(false, showFab);
      window.location.hash = '#/home';
      return;
    }

    const view = routes.get(route) || routes.get('home');
    const routeBuffer = outlet.cloneNode(false);
    await view?.(routeBuffer);
    if (navigationId !== navigationSequence) return;
    applyRouteShellState();
    updateActiveTab(route);
    applyShellVisibility(hideShell, showFab);
    outlet.replaceWith(routeBuffer);
  } finally {
    if (navigationId === navigationSequence) {
      setGlobalLoading(false);
    }
  }
}
