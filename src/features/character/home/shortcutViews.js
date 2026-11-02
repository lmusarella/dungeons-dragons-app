// Move existing renderer nodes into views; keep their listeners and forms intact.
export function tabShortcutViews(host, views, label) {
  const tabs = document.createElement('div');
  tabs.className = 'catalog-tabs shortcut-view-tabs';
  tabs.setAttribute('role', 'tablist');
  tabs.setAttribute('aria-label', label);
  const active = views.some(view => view.key === host.dataset.shortcutView) ? host.dataset.shortcutView : views[0].key;
  views.forEach((view, index) => {
    const tab = document.createElement('button');
    tab.type = 'button'; tab.textContent = view.label;
    tab.setAttribute('role', 'tab');
    const prefix = host.dataset.shortcutKind || 'inventory';
    tab.id = `${prefix}-tab-${view.key}`;
    view.node.id = `${prefix}-view-${view.key}`;
    tab.setAttribute('aria-controls', view.node.id);
    view.node.setAttribute('role', 'tabpanel');
    view.node.setAttribute('aria-labelledby', tab.id);
    tab.addEventListener('click', () => {
      host.dataset.shortcutView = view.key;
      const dialog = host.closest('dialog');
      if (dialog) dialog.dataset.shortcutView = view.key;
      views.forEach(entry => { entry.node.hidden = entry.key !== view.key; });
      [...tabs.children].forEach(button => {
        const selected = button === tab;
        button.setAttribute('aria-selected', String(selected));
        button.tabIndex = selected ? 0 : -1;
      });
      host.updateShortcutAction?.(view.key);
    });
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? views.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + views.length) % views.length;
      tabs.children[next].click(); tabs.children[next].focus();
    });
    tabs.append(tab);
  });
  host.prepend(tabs);
  tabs.children[views.findIndex(view => view.key === active)].click();
}

export function showShortcutLoader(host, label = 'Caricamento contenuti') {
  const loadingSurface = host.closest('.modal-body') || host;
  const existing = loadingSurface.querySelector(':scope > .shortcut-context-loader');
  existing?.remove();
  const loader = document.createElement('div');
  loader.className = 'shortcut-context-loader';
  loader.setAttribute('role', 'status');
  loader.setAttribute('aria-live', 'polite');
  loader.innerHTML = `<span class="shortcut-context-loader__spinner" aria-hidden="true"></span><span><strong>${label}</strong><small>Sto preparando i dati della scheda…</small></span>`;
  loadingSurface.classList.add('is-context-loading');
  loadingSurface.append(loader);
  return () => {
    loader.classList.add('is-leaving');
    window.setTimeout(() => {
      loader.remove();
      if (!loadingSurface.querySelector(':scope > .shortcut-context-loader')) {
        loadingSurface.classList.remove('is-context-loading');
      }
    }, 140);
  };
}

export function polishInventoryShortcut(host, { offline = false, wallet: balance = null } = {}) {
  const main = host.querySelector('.inventory-main');
  const wallet = host.querySelector('.inventory-wallet');
  const transactions = host.querySelector('.inventory-side-card--transactions');
  if (!main || !wallet || !transactions) return;
  wallet.querySelector('[data-edit-wallet]')?.remove();
  wallet.querySelector('.eyebrow')?.remove();
  const exchange = transactions.querySelector('[data-exchange-coins]');
  if (exchange) {
    exchange.className = 'ghost-button coin-exchange-button'; exchange.textContent = '⇄ Scambia monete'; exchange.disabled = offline;
    wallet.querySelector('.inventory-side-card__header').append(exchange);
  }
  transactions.querySelector('.inventory-side-card__header')?.remove();
  wallet.querySelectorAll('[data-wallet-coin]').forEach(card => {
    const coin = card.dataset.walletCoin;
    const actions = document.createElement('div'); actions.className = 'coin-card-actions';
    [['pay','−','Sottrai'],['receive','+','Aggiungi']].forEach(([direction,symbol,label]) => {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'coin-card-action coin-card-action--' + direction;
      button.dataset.moneyAction = direction; button.dataset.coin = coin; button.textContent = symbol;
      button.setAttribute('aria-label',label + ' monete ' + card.querySelector('.wallet-card__info strong').textContent);
      button.disabled = offline || (direction === 'pay' && Number(balance?.[coin] || 0) <= 0);
      actions.append(button);
    });
    card.prepend(actions);
  });

  const moneyPage = document.createElement('section');
  moneyPage.className = 'inventory-money-workspace';
  moneyPage.append(wallet, transactions);
  const pages = document.createElement('div'); pages.className = 'shortcut-view-pages';
  pages.append(main, moneyPage);
  host.replaceChildren(pages);
  tabShortcutViews(host, [
    { key: 'items', label: 'Oggetti', node: main },
    { key: 'coins', label: 'Monete', node: moneyPage }
  ], 'Sezioni inventario');
}

export function polishJournalShortcut(host) {
  const entries = host.querySelector('.journal-section-card--entries');
  const files = host.querySelector('.journal-section-card--files');
  if (!entries || !files) return;
  const pages = document.createElement('div'); pages.className = 'shortcut-view-pages';
  pages.append(entries, files);
  host.replaceChildren(pages);
  tabShortcutViews(host, [
    { key: 'entries', label: 'Appunti', node: entries },
    { key: 'files', label: 'File di sessione', node: files }
  ], 'Sezioni diario');
}

export function polishFamiliarsShortcut(host) {
  const layout = host.querySelector('.familiars-layout');
  const roster = host.querySelector('.familiars-quick-panel');
  layout?.classList.add('companion-shortcut-layout');
  roster?.classList.add('companion-roster');
  host.querySelectorAll('[data-toggle-familiar-sheet]').forEach(toggle => {
    const identity = document.createElement('div');
    identity.className = 'familiar-sheet__identity';
    identity.append(...toggle.children);
    toggle.replaceWith(identity);
  });
  host.querySelectorAll('.familiar-sheet__header').forEach(header => header.classList.add('companion-sheet-hero'));
  host.querySelectorAll('[data-familiar-content]').forEach(dashboard => {
    const abilities = dashboard.querySelector('.familiar-detail-panel--abilities');
    const vitals = dashboard.querySelector('.familiar-detail-panel--vitals');
    const attacks = dashboard.querySelector('.familiar-detail-panel--attacks');
    const notes = dashboard.querySelector('.familiar-detail-panel--notes');
    if (!abilities || !vitals || !attacks || !notes) return;
    const overview = document.createElement('div'); overview.className = 'companion-shortcut-overview';
    overview.append(abilities, vitals);
    dashboard.replaceChildren(overview, attacks, notes);
    dashboard.dataset.shortcutKind = dashboard.id;
    tabShortcutViews(dashboard, [
      { key: 'overview', label: 'Scheda', node: overview },
      { key: 'attacks', label: 'Attacchi', node: attacks },
      { key: 'notes', label: 'Note', node: notes }
    ], 'Sezioni della creatura');
  });
}

export function createCharacterShortcuts(addPanel, configuration = {}) {
  const definitions = [
    { key: 'familiars', title: 'Famigli & Evocazioni', icon: '♞', hint: 'Alleati e creature', selector: '[data-add-companion]', action: 'Nuovo famiglio o evocazione', load: () => import('../../familiars/familiars.js').then(module => module.renderFamiliars) },
    { key: 'journal', title: 'Diario', icon: '☷', hint: 'Appunti e sessioni', selector: '[data-add-entry]', action: 'Nuovo appunto', load: () => import('../../journal/journal.js').then(module => module.renderJournal) }
  ];
  definitions.forEach(definition => {
    const host = document.createElement('section');
    host.className = `sheet-${definition.key}-host`; host.dataset.shortcutKind = definition.key;
    const shortcut = addPanel(host, definition.icon, definition.title, definition.hint);
    const dialog = host.closest('dialog'); dialog.classList.add('sheet-detail--catalog', `sheet-detail--${definition.key}`);
    const add = document.createElement('button'); add.type = 'button'; add.className = 'icon-button'; add.textContent = '+'; add.disabled = true;
    add.setAttribute('aria-label', definition.action);
    if (definition.key === 'familiars') add.hidden = true;
    host.updateShortcutAction = key => {
      add.setAttribute('aria-label', key === 'files' ? 'Carica file sessione' : definition.action);
      add.disabled = Boolean(host.querySelector(key === 'files' ? '[data-upload-session-file]' : definition.selector)?.disabled);
    };
    add.addEventListener('click', () => host.querySelector(host.dataset.shortcutView === 'files' ? '[data-upload-session-file]' : definition.selector)?.click());
    dialog.querySelector('.sheet-modal-actions').append(add);
    if (definition.key === 'journal') host.polishShortcut = () => polishJournalShortcut(host);
    if (definition.key === 'familiars') host.polishShortcut = () => polishFamiliarsShortcut(host);
    let loading = false, loaded = false;
    dialog.loadShortcut = async () => {
      if (loading) return;
      loading = true; add.disabled = true;
      const hideLoader = showShortcutLoader(host, `Caricamento ${definition.title.toLocaleLowerCase('it')}`);
      try {
        const render = await definition.load(); await render(host);
        loaded = true; add.disabled = false;
        host.updateShortcutAction?.(host.dataset.shortcutView);
      } catch (error) { console.error('Errore caricamento shortcut', error); host.textContent = 'Caricamento non riuscito. Chiudi e riapri per riprovare.'; }
      finally { hideLoader(); loading = false; }
    };
    shortcut.addEventListener('click', dialog.loadShortcut);
    dialog.addEventListener('close', () => {
      if (host.dataset.shortcutChanged !== 'true') return;
      delete host.dataset.shortcutChanged;
      configuration.onRefresh?.();
    }, { signal: dialog._sheetEvents.signal });
  });
}
