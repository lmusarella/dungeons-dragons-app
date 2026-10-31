export const actionFilters = ['Azione', 'Azione Bonus', 'Reazione', 'Azione Gratuita'];
export function matchesResourceAction(action, filter) {
  const selected = filter instanceof Set
    ? [...filter]
    : Array.isArray(filter)
      ? filter
      : String(filter || '').split(',').filter(Boolean);
  if (!selected.length) return true;
  const normalizedAction = String(action || '').trim().toLocaleLowerCase('it');
  return selected.some(entry => normalizedAction === String(entry).trim().toLocaleLowerCase('it'));
}

export function matchesSpellTraits({ ritual = false, concentration = false } = {}, filters = []) {
  const active = filters instanceof Set
    ? filters
    : new Set(Array.isArray(filters) ? filters : String(filters || '').split(',').filter(Boolean));
  return (!active.has('ritual') || ritual === true || ritual === 'true')
    && (!active.has('concentration') || concentration === true || concentration === 'true');
}

export function matchesResourceKind(kind, filter = 'consumable') {
  const selected = String(filter || '').trim();
  return !selected || String(kind || '').trim() === selected;
}

export function installResourceFilters(dialog) {
  const pages = [...dialog.querySelectorAll('.catalog-page')].map(page => ({
    page, cards: [...page.querySelectorAll('[data-resource-action]')]
  })).filter(group => group.cards.length);
  if (!pages.length) return;
  const allControls = [];
  const traitControls = [];
  const kindControls = [];
  const isSpellDialog = dialog.dataset.sheetPanel === 'Lancia incantesimi';
  let activeActions = new Set();
  let activeTraits = new Set();
  let activeSpellLevel = '';
  let activeResourceKind = isSpellDialog ? '' : 'consumable';
  pages.forEach(group => {
    const toolbar = document.createElement('div');
    toolbar.className = 'resource-action-filters';
    toolbar.setAttribute('role', 'group');
    toolbar.setAttribute('aria-label', 'Filtra per tipo di azione');
    const empty = document.createElement('p');
    empty.className = 'resource-filter-empty';
    empty.textContent = isSpellDialog
      ? 'Nessun incantesimo corrisponde ai filtri selezionati.'
      : 'Nessuna abilità o potere per questa azione.';
    empty.setAttribute('role', 'status');
    group.empty = empty;
    if (!isSpellDialog) {
      const kindGroup = document.createElement('div');
      kindGroup.className = 'resource-kind-filters';
      kindGroup.setAttribute('role', 'group');
      kindGroup.setAttribute('aria-label', 'Filtra abilità e poteri');
      [['consumable', 'Consumabili'], ['always', 'Sempre attive']].forEach(([kind, label]) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.resourceKindFilter = kind;
        button.textContent = label;
        button.addEventListener('click', () => dialog.applyResourceKindFilter(kind));
        kindGroup.append(button);
        kindControls.push(button);
      });
      toolbar.append(kindGroup);
    }
    const visibleActionFilters = isSpellDialog
      ? actionFilters.filter((filter) => filter !== 'Azione Gratuita')
      : actionFilters;
    visibleActionFilters.forEach(filter => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.resourceActionFilter = filter;
      button.textContent = filter;
      button.addEventListener('click', () => {
        if (isSpellDialog) {
          dialog.applyActionFilter(activeActions.has(filter) ? '' : filter);
          return;
        }
        if (activeActions.has(filter)) activeActions.delete(filter);
        else activeActions.add(filter);
        applyFilters();
      });
      toolbar.append(button);
      allControls.push(button);
    });
    if (isSpellDialog) {
      const separator = document.createElement('span');
      separator.className = 'resource-action-filters__separator';
      separator.setAttribute('aria-hidden', 'true');
      toolbar.append(separator);
      [['ritual', 'Rituale'], ['concentration', 'Concentrazione']].forEach(([filter, label]) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `spell-trait-filter spell-trait-filter--${filter}`;
        button.dataset.spellTraitFilter = filter;
        button.textContent = label;
        button.addEventListener('click', () => {
          if (activeTraits.has(filter)) activeTraits.delete(filter);
          else activeTraits.add(filter);
          applyFilters();
        });
        toolbar.append(button);
        traitControls.push(button);
      });
      const spellStats = dialog.querySelector('.catalog-filter-stats');
      if (spellStats && !toolbar.contains(spellStats)) toolbar.append(spellStats);
    }
    if (isSpellDialog) {
      const content = dialog.querySelector('.sheet-modal-content');
      let sticky = dialog.querySelector('.spell-launch-sticky-filters');
      if (!sticky && content) {
        sticky = document.createElement('div');
        sticky.className = 'spell-launch-sticky-filters';
        const summary = content.querySelector('.catalog-magic-summary');
        content.insertBefore(sticky, content.querySelector(':scope > .catalog-pages'));
        if (summary) sticky.append(summary);
      }
      sticky?.append(toolbar);
      const body = dialog.querySelector(':scope > .modal-body');
      if (body && sticky && sticky.parentElement !== body) body.insertBefore(sticky, content);
    } else {
      group.page.prepend(toolbar);
    }
    group.page.append(empty);
  });

  const applyFilters = () => {
    dialog.dataset.actionFilter = [...activeActions].join(',');
    dialog.dataset.spellTraitFilters = [...activeTraits].join(',');
    if (!isSpellDialog) dialog.dataset.resourceKindFilter = activeResourceKind;
    allControls.forEach(button => button.setAttribute('aria-pressed', String(activeActions.has(button.dataset.resourceActionFilter))));
    traitControls.forEach(button => button.setAttribute('aria-pressed', String(activeTraits.has(button.dataset.spellTraitFilter))));
    kindControls.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.resourceKindFilter === activeResourceKind)));
    pages.forEach(({ cards, empty }) => {
      let visible = 0;
      cards.forEach(card => {
        const actionMatches = matchesResourceAction(card.dataset.resourceAction, activeActions);
        const traitsMatch = matchesSpellTraits({
          ritual: card.dataset.spellRitual,
          concentration: card.dataset.spellConcentration
        }, activeTraits);
        const levelMatches = !activeSpellLevel || card.dataset.spellLevel === activeSpellLevel;
        const kindMatches = matchesResourceKind(card.dataset.resourceKind, activeResourceKind);
        card.hidden = !actionMatches || !traitsMatch || !levelMatches || !kindMatches;
        if (!card.hidden) visible++;
      });
      empty.hidden = visible > 0;
    });
  };

  dialog.applyActionFilter = filter => {
    activeActions = new Set(Array.isArray(filter) ? filter : String(filter || '').split(',').filter(Boolean));
    applyFilters();
  };
  dialog.applyResourceKindFilter = kind => {
    if (isSpellDialog) return;
    activeResourceKind = ['consumable', 'always'].includes(String(kind)) ? String(kind) : 'consumable';
    applyFilters();
  };
  dialog.applySpellTraitFilters = filters => {
    activeTraits = new Set(Array.isArray(filters) ? filters : String(filters || '').split(',').filter(Boolean));
    applyFilters();
  };
  dialog.applySpellLevelFilter = level => {
    activeSpellLevel = String(level || '');
    dialog.dataset.spellLevelFilter = activeSpellLevel;
    dialog.querySelectorAll('[data-spell-slot-filter]').forEach(row => {
      const selected = row.dataset.spellSlotFilter === activeSpellLevel;
      row.classList.toggle('is-selected', selected);
      row.setAttribute('aria-pressed', String(selected));
    });
    applyFilters();
  };
  dialog.applyActionFilter('');
}
