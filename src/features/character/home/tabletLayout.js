import { createInventoryShortcut } from './inventoryShortcut.js';
import { createCharacterShortcuts } from './shortcutViews.js';
import { polishEquipmentCards } from './itemDetail.js';
import { installSavingThrowFilters, installSkillRankFilters, mergeSkillRolls } from './skillGroups.js';
import { installResourceFilters } from './resourceFilters.js';
import { buildPlayCards } from './playCards.js';
import { optimizeCatalog, polishCatalogCards } from './catalogLayout.js';
import { presentSheetDetail } from './sheetDetail.js';
import './tabletLayout.css?v=roll-grid';
import './fantasyTheme.css?v=power-footer7';
import './characterSheetPolish.css?v=sheet-polish10';

const retainedDialogs = new WeakMap();

function installTabletPullToRefresh(scroller) {
  if (!scroller) return;
  const indicator = document.createElement('div');
  indicator.className = 'sheet-pull-refresh';
  indicator.setAttribute('aria-hidden', 'true');
  indicator.innerHTML = '<span>↻</span><strong>Trascina per aggiornare</strong>';
  scroller.prepend(indicator);
  let startY = null;
  let pullDistance = 0;
  const isAtPageStart = () => scroller.scrollTop <= 0
    && window.scrollY <= 0
    && document.documentElement.scrollTop <= 0;
  const reset = () => {
    startY = null;
    pullDistance = 0;
    scroller.style.removeProperty('--sheet-pull-distance');
    indicator.classList.remove('is-visible', 'is-ready');
  };
  scroller.addEventListener('touchstart', (event) => {
    const diceOverlay = document.querySelector('#dice-overlay:not([hidden])');
    if (event.touches.length !== 1 || !isAtPageStart() || diceOverlay || document.querySelector('dialog[open]')) {
      reset();
      return;
    }
    startY = event.touches[0].clientY;
  }, { passive: true });
  scroller.addEventListener('touchmove', (event) => {
    if (startY === null || event.touches.length !== 1 || !isAtPageStart()) return;
    pullDistance = Math.max(0, event.touches[0].clientY - startY);
    const visualDistance = Math.min(72, pullDistance * .45);
    scroller.style.setProperty('--sheet-pull-distance', `${visualDistance}px`);
    indicator.classList.toggle('is-visible', pullDistance > 12);
    indicator.classList.toggle('is-ready', pullDistance >= 96);
  }, { passive: true });
  scroller.addEventListener('touchend', () => {
    const shouldRefresh = pullDistance >= 96 && isAtPageStart();
    reset();
    if (shouldRefresh) window.location.reload();
  }, { passive: true });
  scroller.addEventListener('touchcancel', reset, { passive: true });
}

export function retainOpenSheetPanel(container) {
  if (!document.body.moveBefore) return;
  const dialog = container.querySelector('dialog.sheet-detail[open]');
  if (!dialog) return;
  retainedDialogs.set(container, dialog);
  document.body.moveBefore(dialog, null);
}
// Move the original nodes so their controls and subsequent event bindings survive.
export function mountTabletLayout(container, configuration = {}) {
  const layout = container.querySelector('.home-layout');
  if (!layout?.querySelector('.character-overview')) return;
  layout.classList.add('sheet-dashboard');
  mergeSkillRolls(layout);
  const shortcuts = document.createElement('nav');
  shortcuts.className = 'sheet-shortcuts';
  shortcuts.setAttribute('aria-label', 'Azioni della scheda');
  const panels = [
    ['attacks', '⚔', 'Attacchi', 'Armi e danni'],
    ['spells', '✦', 'Lista incantesimi', 'Incantesimi e preparazione'],
    ['skills', '◇', 'Tiri Abilità', 'Prove e modificatori'],
    ['saves', '◈', 'Tiri salvezza', 'Resisti agli effetti'],
    ['resources', '◉', 'Abilità & Poteri', 'Poteri e utilizzi'],

  ];
  function addPanel(node, icon, title, hint) {
    if (!node) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'sheet-shortcut';
    button.innerHTML = `<span aria-hidden="true">${icon}</span><strong>${title}</strong><small>${hint}</small>`;
    const panelIdentifier = node.matches('.home-feature-panel--spells') ? 'Lancia incantesimi' : title;
    const retained = retainedDialogs.get(container);
    const dialog = retained?.dataset.sheetPanel === panelIdentifier ? retained : document.createElement('dialog');
    const characterName = String(configuration.characterName || '').trim();
    const dialogTitle = characterName ? `${title} di ${characterName}` : title;
    const dice = dialog.querySelector('#dice-overlay');
    dialog._sheetEvents?.abort();
    const events = new AbortController();
    dialog._sheetEvents = events;
    dialog.replaceChildren();
    dialog.className = 'modal-card modal-card--wide sheet-detail';
    dialog.setAttribute('aria-label', dialogTitle);
    dialog.dataset.sheetPanel = panelIdentifier;
    dialog.presentForm = options => presentSheetDetail(dialog, options);
    if (node.matches('.home-feature-panel--skills, .home-feature-panel--saves, .home-feature-panel--special-skills')) {
      dialog.classList.add('sheet-detail--rolls');
      node.classList.add('sheet-roll-options');
    }
    if (node.matches('.home-feature-panel--attacks, .home-feature-panel--resources, .sheet-preparation, .home-feature-panel--spells')) {
      dialog.classList.add('sheet-detail--catalog');
    }
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'ghost-button sheet-detail-close';
    close.textContent = 'Chiudi ×';
    close.addEventListener('click', () => { delete dialog.dataset.resumePanel; delete dialog.dataset.resourceId; dialog.close(); }, { signal: events.signal });
    dialog.addEventListener('cancel', () => { delete dialog.dataset.resumePanel; }, { signal: events.signal });
    const header = document.createElement('header');
    header.className = 'modal-header';
    const heading = document.createElement('h2');
    heading.className = 'modal-title';
    heading.textContent = dialogTitle;
    const navigation = document.createElement('div');
    navigation.className = 'sheet-modal-navigation';
    const headerActions = document.createElement('div');
    headerActions.className = 'sheet-modal-actions';
    const originalHeader = node.querySelector(':scope > .card-header');
    if (originalHeader) {
      const tools = originalHeader.querySelector('.actions');
      if (tools) headerActions.append(...tools.children);
      originalHeader.querySelectorAll(':scope > button').forEach(control => headerActions.append(control));
      const summary = originalHeader.querySelector('.equipment-summary');
      if (summary) node.prepend(summary);
      originalHeader.remove();
    }
    if (['Attacchi', 'Tiri Abilità', 'Tiri salvezza'].includes(title)) {
      headerActions.querySelectorAll('[data-open-dice]').forEach(control => control.remove());
      if (title === 'Attacchi' && configuration.onConfigureAttack) {
        const configure = document.createElement('button');
        configure.type = 'button';
        configure.className = 'ghost-button attack-configure-button';
        configure.textContent = 'Configura attacco';
        configure.addEventListener('click', () => configuration.onConfigureAttack());
        headerActions.append(configure);
      } else if (title === 'Tiri Abilità' && configuration.onAddRoll) {
        const add = document.createElement('button'); add.type = 'button'; add.className = 'icon-button'; add.textContent = '+';
        add.setAttribute('aria-label', 'Aggiungi tiro speciale');
        add.addEventListener('click', () => configuration.onAddRoll('skill'));
        headerActions.append(add);
      }
    }
    const footer = document.createElement('footer');
    footer.className = 'modal-footer sheet-view-footer';
    close.textContent = 'Chiudi';
    footer.append(close);
    header.append(navigation, heading, headerActions);
    node.classList.add('sheet-modal-content');
    const body = document.createElement('div');
    body.className = 'modal-body';
    body.append(node);
    dialog.append(header, body, footer);
    optimizeCatalog(dialog);
    polishCatalogCards(dialog);
    buildPlayCards(dialog);
    dialog.querySelectorAll('[data-custom-attack-preview]').forEach(control => control.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      const index = Number(control.dataset.customAttackPreview);
      if (Number.isInteger(index)) configuration.onOpenAttack?.(index);
    }));
    polishEquipmentCards(node);
    installResourceFilters(dialog);
    if (title === 'Tiri Abilità') installSkillRankFilters(node, configuration.proficiencyBonus, configuration.abilityModifiers);
    if (title === 'Tiri salvezza') installSavingThrowFilters(node, configuration.proficiencyBonus, configuration.abilityModifiers);
    if (dialog.parentElement && layout.moveBefore) layout.moveBefore(dialog, null);
    else layout.append(dialog);
    if (dice) dialog.append(dice);
    button.addEventListener('click', () => { delete dialog.dataset.resumePanel; dialog.showModal(); });
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
    shortcuts.append(button);
    return button;
  }
  panels.forEach(([key, icon, title, hint]) => addPanel(layout.querySelector(`.home-feature-panel--${key}`), icon, title, hint));
  layout.querySelector('[data-open-spell-catalog]')?.addEventListener('click', () => {
    [...layout.querySelectorAll('.sheet-shortcut')].find(button => button.querySelector('strong')?.textContent === 'Lista incantesimi')?.click();
  });
  const spellPanel = layout.querySelector('.home-feature-panel--spells');
  const spellDialog = spellPanel?.closest('dialog');
  const addSpellControl = spellDialog?.querySelector('[data-add-spell]');
  const prepareControl = spellDialog?.querySelector('[data-open-prepared-spells]');
  if (addSpellControl) {
    addSpellControl.classList.add('sheet-spell-action', 'sheet-spell-action--add');
    addSpellControl.setAttribute('aria-label', 'Aggiungi incantesimi');
    addSpellControl.innerHTML = '<span aria-hidden="true">+</span><span>Aggiungi incantesimi</span>';
  }
  if (prepareControl) {
    prepareControl.classList.add('sheet-spell-action', 'sheet-spell-action--prepare');
    prepareControl.innerHTML = '<span aria-hidden="true">📖</span><span>Prepara incantesimi</span>';
  }
  const resourcePanel = layout.querySelector('.home-feature-panel--resources');
  const resourceDialog = resourcePanel?.closest('dialog');
  const addResourceControl = resourceDialog?.querySelector('[data-add-resource]');
  if (addResourceControl) {
    addResourceControl.classList.add('sheet-resource-action', 'sheet-resource-action--add');
    addResourceControl.setAttribute('aria-label', 'Aggiungi abilità');
    addResourceControl.innerHTML = '<span aria-hidden="true">+</span><span>Aggiungi Abilità</span>';
  }
  addPanel(layout.querySelector('.home-column--center > :nth-child(2)'), '♙', 'Equipaggiamento', 'Oggetti e dotazioni');
  createInventoryShortcut(addPanel, configuration);
  createCharacterShortcuts(addPanel, configuration);
  const skillsTitle = layout.querySelector('.home-feature-panel--skills .eyebrow');
  if (skillsTitle) skillsTitle.textContent = 'Tiri Abilità';
  layout.querySelector('.home-column--left')?.remove();
  layout.querySelector('.home-column--right')?.remove();
  const leftRail = document.createElement('nav');
  leftRail.className = 'sheet-shortcuts sheet-shortcuts--left';
  leftRail.setAttribute('aria-label', 'Scorciatoie della scheda');
  [...shortcuts.children].forEach((button) => leftRail.append(button));
  layout.prepend(leftRail);
  installTabletPullToRefresh(layout);
  const toolbar = document.createElement('footer');
  toolbar.className = 'sheet-quickbar sheet-action-footer';
  toolbar.dataset.sheetActionFooter = '';
  toolbar.setAttribute('aria-label', 'Azioni rapide di gioco');
  const actions = [
    ['◆', 'Dadi', 'openDice', 'roller', 'dice'],
    ['−', 'Danno', 'hpAction', 'damage', 'damage'],
    ['+', 'Cura', 'hpAction', 'heal', 'heal'],
    ['◐', 'Riposo breve', 'rest', 'short_rest', 'short-rest'],
    ['☾', 'Riposo lungo', 'rest', 'long_rest', 'long-rest'],
    ['↑', 'Paga', 'moneyAction', 'pay', 'pay'],
    ['↓', 'Ricevi', 'moneyAction', 'receive', 'receive'],
    ['◇', 'Loot rapido', 'addLoot', '', 'loot'],
  ];
  actions.forEach(([icon, label, dataKey, dataValue, tone]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `sheet-action-footer__button sheet-action-footer__button--${tone}`;
    button.innerHTML = `<span class="sheet-action-footer__icon" aria-hidden="true">${icon}</span><strong>${label}</strong>`;
    button.dataset.gameAction = '';
    button.dataset[dataKey] = dataValue;
    toolbar.append(button);
  });
  layout.after(toolbar);
}














export function captureSheetPanel(container) {
  const dialog = [...container.querySelectorAll('dialog[data-sheet-panel]')]
    .find(entry => entry.open || entry.dataset.resumePanel === 'true');
  if (!dialog) return null;
  return {
    panel: dialog.dataset.sheetPanel,
    ...(dialog.dataset.activeCategory !== undefined ? { category: dialog.dataset.activeCategory } : {}),
    ...(dialog.dataset.actionFilter !== undefined ? { actionFilter: dialog.dataset.actionFilter } : {}),
    ...(dialog.dataset.resourceKindFilter !== undefined ? { resourceKind: dialog.dataset.resourceKindFilter } : {}),
    ...(dialog.dataset.spellTraitFilters !== undefined ? { spellTraits: dialog.dataset.spellTraitFilters } : {}),
    ...(dialog.dataset.spellLevelFilter !== undefined ? { spellLevel: dialog.dataset.spellLevelFilter } : {}),
    shortcutView: dialog.dataset.shortcutView,
    resourceId: dialog.dataset.resourceId,
    scroll: dialog.querySelector('.modal-body')?.scrollTop || 0,
    expanded: [...dialog.querySelectorAll('details')].map(entry => entry.open)
  };
}

export function restoreSheetPanel(container, context) {
  if (!context) return;
  const dialog = [...container.querySelectorAll('dialog[data-sheet-panel]')]
    .find(entry => entry.dataset.sheetPanel === context.panel);
  if (!dialog) return;
  dialog.querySelectorAll('details').forEach((entry, index) => {
    if (context.expanded[index] !== undefined) entry.open = context.expanded[index];
  });
  if (context.category !== undefined) [...dialog.querySelectorAll('[data-catalog-category]')].find(tab => tab.dataset.catalogCategory === context.category)?.click();
  if (context.actionFilter !== undefined) dialog.applyActionFilter?.(context.actionFilter);
  if (context.resourceKind !== undefined) dialog.applyResourceKindFilter?.(context.resourceKind);
  if (context.spellTraits !== undefined) dialog.applySpellTraitFilters?.(context.spellTraits);
  if (context.spellLevel !== undefined) dialog.applySpellLevelFilter?.(context.spellLevel);
  if (context.shortcutView !== undefined) {
    const host = dialog.querySelector('[data-shortcut-kind], [data-inventory-shortcut]');
    if (host) host.dataset.shortcutView = context.shortcutView;
  }
  if (!dialog.open) dialog.showModal();
  if (context.panel === 'Inventario') dialog.loadInventory?.();
  if (['Famigli & Evocazioni', 'Diario'].includes(context.panel)) dialog.loadShortcut?.();
  const resource = context.resourceId && [...dialog.querySelectorAll('[data-resource-card]')]
    .find(entry => entry.dataset.resourceCard === context.resourceId);
  // Deleted resources return to the refreshed list.
  resource?.click();
  dialog.querySelector('.modal-body').scrollTop = context.scroll;
}
