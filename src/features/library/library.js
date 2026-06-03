import { assignSharedSpellToCharacter, createSharedSpell, removeSharedSpellAndAssignments, searchSharedSpells } from '../character/spellbookApi.js';
import { attachNumberStepper, buildInput, createToast, openConfirmModal } from '../../ui/components.js';
import { getState } from '../../app/state.js';
import { saveCharacterData } from '../character/home/data.js';
import { openSpellDrawer, openSpellQuickDetailModal } from '../character/home/modals.js';

const SPELL_SCHOOL_OPTIONS = ['', 'Abiurazione', 'Ammaliamento', 'Divinazione', 'Evocazione', 'Illusione', 'Invocazione', 'Necromanzia', 'Trasmutazione'];
const SPELL_CASTER_CLASS_OPTIONS = ['mago', 'warlock', 'stregone', 'chierico', 'druido', 'ranger', 'artefice', 'paladino', 'bardo'];
const SPELL_RULES_VERSION_OPTIONS = ['2024', '2014', 'Custom'];
const PAGE_SIZE = 8;
const LIBRARY_SEARCH_PAGE_SIZE = 50;

async function loadSharedSpellsForLibrary(filters) {
  const firstPage = await searchSharedSpells({
    ...filters,
    page: 1,
    pageSize: LIBRARY_SEARCH_PAGE_SIZE
  });
  const items = [...(firstPage.items || [])];
  const total = Number(firstPage.total) || items.length;
  let page = 2;

  while (items.length < total) {
    const nextPage = await searchSharedSpells({
      ...filters,
      page,
      pageSize: LIBRARY_SEARCH_PAGE_SIZE
    });
    const nextItems = nextPage.items || [];
    if (!nextItems.length) break;
    items.push(...nextItems);
    page += 1;
  }

  return {
    ...firstPage,
    items,
    total
  };
}

function sortSpells(spells, mode) {
  const items = [...spells];
  if (mode === 'level') {
    return items.sort((a, b) => {
      const levelDiff = (Number(a.level) || 0) - (Number(b.level) || 0);
      if (levelDiff !== 0) return levelDiff;
      return String(a.name || '').localeCompare(String(b.name || ''), 'it', { sensitivity: 'base' });
    });
  }
  return items.sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'it', { sensitivity: 'base' }));
}

export async function renderLibrary(container) {
  container.innerHTML = `
    <section class="auth-screen character-select-view library-view">
      <div class="card character-select-card library-shell">
        <header class="character-select-header library-hero">
          <div class="library-hero__copy">
            <span class="library-hero__eyebrow">Compendio condiviso</span>
            <p class="title-car-select">Archivio centralizzato</p>
            <p class="muted">Trova, filtra e mantieni ordinati gli incantesimi condivisi tra i personaggi.</p>
          </div>
          <button class="primary library-add-button" type="button" data-library-add-spell aria-label="Nuovo incantesimo">
            <span aria-hidden="true">＋</span>
            <span>Nuovo incantesimo</span>
          </button>
        </header>
        <div class="library-filter-panel" data-library-filters></div>
        <div class="library-results-heading" data-library-results-heading></div>
        <div class="library-spell-list-header" aria-hidden="true">
          <span>Livello</span>
          <span>Incantesimo</span>
          <span>Scuola</span>
          <span>Regole</span>
          <span>Concentrazione</span>
          <span>Rituale</span>
          <span>Azioni</span>
        </div>
        <div class="character-card-grid library-results-grid" data-library-spells></div>
      </div>
    </section>
  `;

  const filters = container.querySelector('[data-library-filters]');
  const list = container.querySelector('[data-library-spells]');
  if (!filters || !list) return;

  const filtersRow = document.createElement('div');
  filtersRow.className = 'modal-form-row modal-form-row--compact library-filters-row';
  filtersRow.appendChild(buildInput({ label: 'Nome', name: 'q', placeholder: 'Cerca incantesimo' }));
  const levelFilterField = buildInput({ label: 'Livello', name: 'level', type: 'number' });
  levelFilterField.classList.add('library-level-filter');
  const levelFilterInput = levelFilterField.querySelector('input[name="level"]');
  if (levelFilterInput) {
    levelFilterInput.min = '0';
    levelFilterInput.max = '9';
    levelFilterInput.step = '1';
    levelFilterInput.inputMode = 'numeric';
    attachNumberStepper(levelFilterInput, {
      decrementLabel: 'Riduci livello incantesimo',
      incrementLabel: 'Aumenta livello incantesimo'
    });
  }
  filtersRow.appendChild(levelFilterField);
  const schoolFilterField = document.createElement('label');
  schoolFilterField.className = 'field';
  schoolFilterField.innerHTML = '<span>Scuola</span>';
  const schoolFilterSelect = document.createElement('select');
  schoolFilterSelect.name = 'school';
  SPELL_SCHOOL_OPTIONS.forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value || 'Tutte';
    schoolFilterSelect.appendChild(option);
  });
  schoolFilterField.appendChild(schoolFilterSelect);
  filtersRow.appendChild(schoolFilterField);
  const classFilterField = document.createElement('label');
  classFilterField.className = 'field';
  classFilterField.innerHTML = '<span>Classe</span>';
  const classFilterSelect = document.createElement('select');
  classFilterSelect.name = 'caster';
  [{ value: '', label: 'Tutte' }, ...SPELL_CASTER_CLASS_OPTIONS.map((entry) => ({ value: entry, label: entry }))].forEach((entry) => {
    const option = document.createElement('option');
    option.value = entry.value;
    option.textContent = entry.label;
    classFilterSelect.appendChild(option);
  });
  classFilterField.appendChild(classFilterSelect);
  filtersRow.appendChild(classFilterField);
  const versionFilterField = document.createElement('label');
  versionFilterField.className = 'field';
  versionFilterField.innerHTML = '<span>Versione regole</span>';
  const versionFilterSelect = document.createElement('select');
  versionFilterSelect.name = 'rules_version';
  [{ value: '', label: 'Tutte' }, ...SPELL_RULES_VERSION_OPTIONS.map((entry) => ({ value: entry, label: entry }))]
    .forEach((entry) => {
      const option = document.createElement('option');
      option.value = entry.value;
      option.textContent = entry.label;
      versionFilterSelect.appendChild(option);
    });
  versionFilterField.appendChild(versionFilterSelect);
  filtersRow.appendChild(versionFilterField);

  const concentrationFilterField = document.createElement('label');
  concentrationFilterField.className = 'field';
  concentrationFilterField.innerHTML = '<span>Concentrazione</span>';
  const concentrationFilterSelect = document.createElement('select');
  concentrationFilterSelect.name = 'concentration';
  [
    { value: '', label: 'Tutte' },
    { value: 'true', label: 'Sì' },
    { value: 'false', label: 'No' }
  ].forEach((entry) => {
    const option = document.createElement('option');
    option.value = entry.value;
    option.textContent = entry.label;
    concentrationFilterSelect.appendChild(option);
  });
  concentrationFilterField.appendChild(concentrationFilterSelect);
  filtersRow.appendChild(concentrationFilterField);
  const ritualFilterField = document.createElement('label');
  ritualFilterField.className = 'field';
  ritualFilterField.innerHTML = '<span>Rituale</span>';
  const ritualFilterSelect = document.createElement('select');
  ritualFilterSelect.name = 'ritual';
  [
    { value: '', label: 'Tutti' },
    { value: 'true', label: 'Sì' },
    { value: 'false', label: 'No' }
  ].forEach((entry) => {
    const option = document.createElement('option');
    option.value = entry.value;
    option.textContent = entry.label;
    ritualFilterSelect.appendChild(option);
  });
  ritualFilterField.appendChild(ritualFilterSelect);
  filtersRow.appendChild(ritualFilterField);
  const searchButton = document.createElement('button');
  searchButton.className = 'primary library-search-button';
  searchButton.type = 'button';
  searchButton.innerHTML = '<span aria-hidden="true">🔎</span><span>Cerca</span>';
  const filtersActions = document.createElement('div');
  filtersActions.className = 'library-filter-actions';
  filtersActions.appendChild(searchButton);


  filters.append(filtersRow, filtersActions);

  const resultsHeading = container.querySelector('[data-library-results-heading]');
  const pagination = document.createElement('div');
  pagination.className = 'library-pagination';
  list.insertAdjacentElement('afterend', pagination);

  let currentPage = 1;

  const renderSpells = async () => {
    const query = filters.querySelector('input[name="q"]')?.value || '';
    const level = filters.querySelector('input[name="level"]')?.value || '';
    const school = filters.querySelector('select[name="school"]')?.value || '';
    const casterClass = filters.querySelector('select[name="caster"]')?.value || '';
    const rulesVersion = filters.querySelector('select[name="rules_version"]')?.value || '';
    const concentration = filters.querySelector('select[name="concentration"]')?.value || '';
    const ritual = filters.querySelector('select[name="ritual"]')?.value || '';
    const result = await loadSharedSpellsForLibrary({
      query,
      level,
      school,
      rulesVersion,
      casterClasses: casterClass ? [casterClass] : [],
      concentration,
      ritual
    });
    const spells = result.items || [];
    const sortMode = filters.querySelector('select[name="sort"]')?.value || 'name';
    const sortedSpells = sortSpells(spells, sortMode);
    const totalPages = Math.max(1, Math.ceil(sortedSpells.length / PAGE_SIZE));
    currentPage = Math.min(currentPage, totalPages);
    const pageStart = (currentPage - 1) * PAGE_SIZE;
    const pagedSpells = sortedSpells.slice(pageStart, pageStart + PAGE_SIZE);

    if (resultsHeading) {
      const shownFrom = sortedSpells.length ? pageStart + 1 : 0;
      const shownTo = Math.min(pageStart + pagedSpells.length, sortedSpells.length);
      resultsHeading.innerHTML = `
        <div>
          <span class="library-results-heading__eyebrow">Risultati</span>
          <strong>${sortedSpells.length} incantesimi</strong>
        </div>
        <span class="muted">${sortedSpells.length ? `${shownFrom}-${shownTo} mostrati` : 'Nessun risultato con questi filtri'}</span>
      `;
    }
    list.innerHTML = pagedSpells.length
      ? pagedSpells.map((spell) => {
        const classes = (spell.caster_classes || []).join(', ') || 'Nessuna classe';
        const rulesVersionLabel = spell.rules_version || '—';
        const concentrationLabel = spell.concentration ? 'Sì' : 'No';
        const ritualLabel = spell.ritual ? 'Sì' : 'No';
        return `
        <article class="character-card library-spell-card" data-library-view-spell="${spell.id}" role="button" tabindex="0" aria-label="Apri dettaglio incantesimo ${spell.name}">
          <div class="library-spell-card__level" aria-label="Livello ${spell.level ?? 0}">
            <span>Lv</span>
            <strong>${spell.level ?? 0}</strong>
          </div>
          <div class="character-card-info library-spell-card__info">
            <h3>${spell.name}</h3>
            <p class="muted library-spell-card__classes">${classes}</p>
          </div>
          <span class="library-spell-card__school">${spell.school || 'Scuola n/d'}</span>
          <span class="library-spell-card__rules">${rulesVersionLabel}</span>
          <span class="library-spell-card__flag ${spell.concentration ? 'is-active' : ''}">${concentrationLabel}</span>
          <span class="library-spell-card__flag ${spell.ritual ? 'is-active' : ''}">${ritualLabel}</span>
          <div class="button-row library-spell-card__actions">
            <button class="icon-button icon-button--danger" type="button" data-library-delete-spell="${spell.id}" aria-label="Elimina incantesimo ${spell.name}" title="Elimina">🗑️</button>
          </div>
        </article>`;
      }).join('')
      : '<div class="library-empty-state"><strong>Nessun incantesimo trovato</strong><span class="muted">Prova a rimuovere un filtro o cerca un altro nome.</span></div>';
    pagination.innerHTML = sortedSpells.length
      ? `<button class="secondary" type="button" data-library-page="prev" ${currentPage <= 1 ? 'disabled' : ''}>← Precedente</button>
         <span class="muted">Pagina ${currentPage} di ${totalPages}</span>
         <button class="secondary" type="button" data-library-page="next" ${currentPage >= totalPages ? 'disabled' : ''}>Successiva →</button>`
      : '';

    const openLibrarySpell = (spellId) => {
      const spell = sortedSpells.find((entry) => entry.id === spellId);
      if (!spell) return;
      openSpellQuickDetailModal(null, {
        ...spell,
        kind: Number(spell.level) === 0 ? 'cantrip' : 'spell',
        is_ritual: Boolean(spell.ritual || spell.is_ritual)
      });
    };
    list.querySelectorAll('[data-library-view-spell]').forEach((card) => {
      card.addEventListener('click', (event) => {
        if (event.target.closest('button')) return;
        openLibrarySpell(card.dataset.libraryViewSpell);
      });
      card.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        openLibrarySpell(card.dataset.libraryViewSpell);
      });
    });
    list.querySelectorAll('[data-library-delete-spell]').forEach((button) => button.addEventListener('click', async () => {
      const spellId = button.dataset.libraryDeleteSpell;
      if (!spellId) return;
      const spell = sortedSpells.find((entry) => entry.id === spellId);
      if (!spell) return;
      const ok = await openConfirmModal({
        title: 'Conferma eliminazione incantesimo',
        message: `Eliminare "${spell.name}" dal catalogo centralizzato e da tutte le associazioni personaggio?`,
        confirmLabel: 'Elimina'
      });
      if (!ok) return;
      await removeSharedSpellAndAssignments(spellId);
      const activeCharacterId = getState().activeCharacterId;
      const activeCharacter = getState().characters.find((char) => char.id === activeCharacterId);
      if (activeCharacter) {
        const currentSpells = Array.isArray(activeCharacter.data?.spells) ? activeCharacter.data.spells : [];
        const nextData = {
          ...(activeCharacter.data || {}),
          spells: currentSpells.filter((entry) => entry.shared_spell_id !== spellId)
        };
        await saveCharacterData(activeCharacter, nextData, 'Incantesimo rimosso dal personaggio');
      }
      createToast('Incantesimo centralizzato eliminato', 'success');
      await renderSpells();
    }));
    pagination.querySelector('[data-library-page="prev"]')?.addEventListener('click', () => {
      currentPage = Math.max(1, currentPage - 1);
      void renderSpells();
    });
    pagination.querySelector('[data-library-page="next"]')?.addEventListener('click', () => {
      currentPage = Math.min(totalPages, currentPage + 1);
      void renderSpells();
    });
  };

  searchButton.addEventListener('click', () => { currentPage = 1; void renderSpells(); });
  filters.querySelector('select[name="sort"]')?.addEventListener('change', () => { currentPage = 1; void renderSpells(); });
  container.querySelector('[data-library-add-spell]')?.addEventListener('click', async () => {
    const { user } = getState();
    await openSpellDrawer(null, async (createdSpell) => {
      try {
        const createdSpellRow = await createSharedSpell({
          created_by: user?.id,
          name: createdSpell.name,
          rules_version: createdSpell.rules_version || '2024',
          level: Number(createdSpell.level) || 0,
          school: createdSpell.school || null,
          cast_time: createdSpell.cast_time || null,
          duration: createdSpell.duration || null,
          range: createdSpell.range || null,
          components: createdSpell.components || null,
          caster_classes: Array.isArray(createdSpell.caster_classes) ? createdSpell.caster_classes : [],
          damage_die: createdSpell.damage_die || null,
          damage_modifier: createdSpell.damage_modifier ?? null,
          upcast_damage_die: createdSpell.upcast_damage_die || null,
          upcast_damage_modifier: createdSpell.upcast_damage_modifier ?? null,
          upcast_start_level: createdSpell.upcast_start_level ?? null,
          concentration: Boolean(createdSpell.concentration),
          attack_roll: Boolean(createdSpell.attack_roll),
          ritual: Boolean(createdSpell.is_ritual),
          description: createdSpell.description || null
        });
        const activeCharacterId = getState().activeCharacterId;
        const activeCharacter = getState().characters.find((char) => char.id === activeCharacterId);
        if (activeCharacter?.data?.is_spellcaster) {
          const nextSpell = {
            id: `spell-${Date.now()}-${Math.random().toString(16).slice(2)}`,
            shared_spell_id: createdSpellRow.id,
            name: createdSpellRow.name,
            level: createdSpellRow.level,
            kind: Number(createdSpellRow.level) === 0 ? 'cantrip' : 'spell',
            cast_time: createdSpellRow.cast_time || null,
            duration: createdSpellRow.duration || null,
            range: createdSpellRow.range || null,
            components: createdSpellRow.components || null,
            concentration: Boolean(createdSpellRow.concentration),
            attack_roll: Boolean(createdSpellRow.attack_roll),
            is_ritual: Boolean(createdSpellRow.ritual),
            damage_die: createdSpellRow.damage_die || null,
            damage_modifier: createdSpellRow.damage_modifier ?? null,
            upcast_damage_die: createdSpellRow.upcast_damage_die || null,
            upcast_damage_modifier: createdSpellRow.upcast_damage_modifier ?? null,
            upcast_start_level: createdSpellRow.upcast_start_level ?? null,
            description: createdSpellRow.description || null,
            school: createdSpellRow.school || null,
            caster_classes: createdSpellRow.caster_classes || [],
            rules_version: createdSpellRow.rules_version || '2024',
            prep_state: 'known'
          };
          const currentSpells = Array.isArray(activeCharacter.data?.spells) ? activeCharacter.data.spells : [];
          await saveCharacterData(activeCharacter, {
            ...(activeCharacter.data || {}),
            spells: [...currentSpells, nextSpell]
          }, 'Incantesimo aggiunto alla scheda personaggio');
          await assignSharedSpellToCharacter({
            user_id: activeCharacter.user_id,
            character_id: activeCharacter.id,
            shared_spell_id: createdSpellRow.id,
            prep_state: 'known'
          });
        }
        createToast('Incantesimo condiviso creato', 'success');
        void renderSpells();
      } catch (error) {
        const message = String(error?.message || error || "Errore durante la creazione dell'incantesimo");
        const isDuplicateSpell = message.includes('shared_spells_name_rules_version_key')
          || message.toLowerCase().includes('duplicate key value violates unique constraint');
        createToast(
          isDuplicateSpell
            ? 'Esiste già un incantesimo simile nel catalogo centralizzato.'
            : message,
          'error'
        );
      }
    }, null, { catalogMode: true });
  });

  await renderSpells();
}
