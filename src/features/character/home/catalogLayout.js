let tabSequence = 0;
function tabbedCatalog(dialog, sections, initial = 0) {
  if (!sections.length) return;
  const tabs = document.createElement('div');
  tabs.className = 'catalog-tabs';
  tabs.setAttribute('role', 'tablist');
  tabs.setAttribute('aria-label', dialog.dataset.sheetPanel);
  const host = document.createElement('div');
  host.className = 'catalog-pages';
  const key = ++tabSequence;
  sections.forEach(({ title, content, count }, index) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.dataset.catalogCategory = String(index);
    tab.id = 'catalog-tab-' + key + '-' + index;
    tab.setAttribute('role', 'tab');
    tab.textContent = title + ' · ' + count;
    const page = document.createElement('section');
    page.className = 'catalog-page';
    page.id = 'catalog-page-' + key + '-' + index;
    page.setAttribute('role', 'tabpanel');
    page.setAttribute('aria-labelledby', tab.id);
    tab.setAttribute('aria-controls', page.id);
    page.append(content);
    tab.addEventListener('click', () => {
      dialog.dataset.activeCategory = String(index);
      [...tabs.children].forEach((entry, n) => {
        entry.setAttribute('aria-selected', String(n === index));
        entry.tabIndex = n === index ? 0 : -1;
      });
      [...host.children].forEach((entry, n) => entry.hidden = n !== index);
    });
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      const target = event.key === 'Home' ? 0 : event.key === 'End' ? sections.length-1 : (index+(event.key === 'ArrowRight' ? 1 : -1)+sections.length)%sections.length;
      tabs.children[target].click(); tabs.children[target].focus();
    });
    tabs.append(tab); host.append(page);
  });
  dialog.querySelector('.sheet-modal-content').append(tabs, host);
  tabs.children[initial].click();
}
export function optimizeCatalog(dialog) {
  const node = dialog.querySelector('.sheet-modal-content');
  if (node.matches('.home-feature-panel--attacks')) {
    const source = node.querySelector('.detail-grid');
    if (source) {
      const cards = [...source.children];
      const grid = document.createElement('div');
      grid.className = 'detail-grid detail-grid--compact attack-catalog-grid';
      cards.forEach(card => grid.append(card));
      if (!cards.length) grid.innerHTML = '<p class="muted">Nessun attacco configurato.</p>';
      source.parentElement.remove();
      node.querySelectorAll(':scope > .tag-row').forEach(label => label.remove());
      const pages = document.createElement('div');
      pages.className = 'catalog-pages catalog-pages--single';
      const page = document.createElement('section');
      page.className = 'catalog-page';
      page.append(grid);
      pages.append(page);
      node.append(pages);
    }
  }
  if (node.matches('.home-feature-panel--resources, .home-feature-panel--spells')) {
    const isSpell = node.matches('.home-feature-panel--spells');
    const sections = [...node.querySelectorAll(isSpell ? '.spell-list-accordion' : '.resource-accordion')].map((entry,index) => {
      const content = document.createElement('div');
      const summary = entry.querySelector('summary');
      [...entry.children].filter(child => child !== summary).forEach(child => content.append(child));
      const count = content.querySelectorAll(isSpell ? '.spell-prepared-list__card' : '[data-resource-card]').length;
      const title = isSpell
        ? (summary?.querySelector('.spell-list-accordion__title')?.textContent.trim() || 'Incantesimi')
        : ['Consumabili','Sempre attiva'][index];
      entry.remove(); return { title, content, count };
    });
    if (isSpell) {
      sections.forEach(section => {
        const grid = document.createElement('div');
        grid.className = 'spell-prepared-list__items spell-launch-grid';
        const cards = [...section.content.querySelectorAll('.spell-prepared-list__card')];
        cards.sort((a,b) => Number(a.dataset.spellLevel) - Number(b.dataset.spellLevel)).forEach(card => grid.append(card));
        if (!cards.length) grid.innerHTML = `<p class="muted">Nessun ${section.title.toLocaleLowerCase('it')} pronto da lanciare.</p>`;
        section.content = grid;
      });
      if (sections.length > 1) tabbedCatalog(dialog, sections);
      else if (sections[0]) {
        const pages = document.createElement('div');
        pages.className = 'catalog-pages catalog-pages--single';
        const page = document.createElement('section');
        page.className = 'catalog-page';
        page.append(sections[0].content);
        pages.append(page);
        node.append(pages);
      }
    } else {
      const cards = sections.flatMap((section) => [...section.content.querySelectorAll('[data-resource-card]')]);
      const grid = document.createElement('ul');
      grid.className = 'resource-list resource-list--compact resource-catalog-grid';
      cards.forEach((card) => grid.append(card));
      if (!cards.length) grid.innerHTML = '<li class="muted">Nessuna abilità configurata.</li>';
      const pages = document.createElement('div');
      pages.className = 'catalog-pages catalog-pages--single';
      const page = document.createElement('section');
      page.className = 'catalog-page';
      page.append(grid);
      pages.append(page);
      node.append(pages);
    }

    if (isSpell) {
      const stats = node.querySelector('.spell-stats');
      const slots = node.querySelector('.spell-summary-card');
      if (stats && slots) {
        slots.classList.add('catalog-magic-summary');
        stats.classList.add('catalog-filter-stats');
        slots.querySelectorAll('[data-spell-slot-filter]').forEach(row => {
          const toggleLevel = () => {
            const nextLevel = row.classList.contains('is-selected') ? '' : row.dataset.spellSlotFilter;
            dialog.applySpellLevelFilter?.(nextLevel);
          };
          row.addEventListener('click', event => {
            if (event.target.closest('button')) return;
            toggleLevel();
          });
          row.addEventListener('keydown', event => {
            if (!['Enter', ' '].includes(event.key)) return;
            event.preventDefault();
            toggleLevel();
          });
        });
      }
    }
  }
}


export function polishCatalogCards(dialog) {
  dialog.querySelectorAll('.catalog-pages .modifier-card').forEach(card => {
    card.classList.add('catalog-game-card');
    const badges = [...card.querySelectorAll('.resource-chip--floating')];
    if (badges.length) {
      const strip = document.createElement('div');
      strip.className = 'catalog-card-badges';
      badges.forEach(badge => strip.append(badge));
      card.prepend(strip);
    }
  });
  dialog.querySelectorAll('.catalog-magic-summary .spell-slot-row').forEach(row => {
    const count = row.querySelector('.spell-slot-count');
    const max = row.querySelectorAll('.charge-indicator').length;
    if (count && max) {
      const total = document.createElement('small');
      total.textContent = '/' + max;
      count.append(total);
    }
  });
}
