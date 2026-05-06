import { assignSharedSpellToCharacter, createSharedSpell, removeSharedSpellAndAssignments, searchSharedSpells } from '../character/spellbookApi.js';
import { buildInput, createToast, openConfirmModal, openFormModal } from '../../ui/components.js';
import { getState } from '../../app/state.js';
import { saveCharacterData } from '../character/home/data.js';
import { openSpellDrawer } from '../character/home/modals.js';

const SPELL_SCHOOL_OPTIONS = ['', 'Abiurazione', 'Ammaliamento', 'Divinazione', 'Evocazione', 'Illusione', 'Invocazione', 'Necromanzia', 'Trasmutazione'];
const SPELL_CASTER_CLASS_OPTIONS = ['mago', 'warlock', 'stregone', 'chierico', 'druido', 'ranger', 'artefice', 'paladino', 'bardo'];
const SPELL_RULES_VERSION_OPTIONS = ['2024', '2014', 'Custom'];
const PAGE_SIZE = 8;

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
      <div class="card character-select-card">
        <header class="character-select-header">
          <div>
            <p class="title-car-select">Archivio centralizzato</p>
            <p class="muted">Gestisci contenuti condivisi (incantesimi ora, oggetti in futuro).</p>
          </div>
          <button class="icon-button icon-button--add character-select-add" type="button" data-library-add-spell aria-label="Nuovo incantesimo">+</button>
        </header>
        <div class="modal-form-grid" data-library-filters></div>
        <div class="character-card-grid" data-library-spells></div>
      </div>
    </section>
  `;

  const filters = container.querySelector('[data-library-filters]');
  const list = container.querySelector('[data-library-spells]');
  if (!filters || !list) return;

  const filtersRow = document.createElement('div');
  filtersRow.className = 'modal-form-row modal-form-row--compact library-filters-row';
  filtersRow.appendChild(buildInput({ label: 'Nome', name: 'q', placeholder: 'Cerca incantesimo' }));
  filtersRow.appendChild(buildInput({ label: 'Livello', name: 'level', type: 'number' }));
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
  const searchButton = document.createElement('button');
  searchButton.className = 'primary';
  searchButton.type = 'button';
  searchButton.textContent = 'Cerca';
  filtersRow.appendChild(searchButton);
  filters.appendChild(filtersRow);

  const listToolbar = document.createElement('div');
  listToolbar.className = 'library-list-toolbar';
  listToolbar.innerHTML = `
    <label class="field">
      <span>Ordina per</span>
      <select name="sort">
        <option value="name">Nome (A-Z)</option>
        <option value="level">Livello (0-9)</option>
      </select>
    </label>
  `;
  filters.appendChild(listToolbar);

  const pagination = document.createElement('div');
  pagination.className = 'library-pagination';
  filters.appendChild(pagination);

  let currentPage = 1;

  const renderSpells = async () => {
    const query = filters.querySelector('input[name="q"]')?.value || '';
    const level = filters.querySelector('input[name="level"]')?.value || '';
    const school = filters.querySelector('select[name="school"]')?.value || '';
    const casterClass = filters.querySelector('select[name="caster"]')?.value || '';
    const rulesVersion = filters.querySelector('select[name="rules_version"]')?.value || '';
    const result = await searchSharedSpells({
      query,
      level,
      school,
      rulesVersion,
      casterClasses: casterClass ? [casterClass] : []
    });
    const spells = result.items || [];
    const sortMode = filters.querySelector('select[name="sort"]')?.value || 'name';
    const sortedSpells = sortSpells(spells, sortMode);
    const totalPages = Math.max(1, Math.ceil(sortedSpells.length / PAGE_SIZE));
    currentPage = Math.min(currentPage, totalPages);
    const pageStart = (currentPage - 1) * PAGE_SIZE;
    const pagedSpells = sortedSpells.slice(pageStart, pageStart + PAGE_SIZE);

    list.innerHTML = pagedSpells.length
      ? pagedSpells.map((spell) => `
        <article class="character-card library-spell-card">
          <div class="character-card-info">
            <h3>${spell.name}</h3>
            <p class="muted">Lv ${spell.level} · ${spell.school || '-'} · ${(spell.caster_classes || []).join(', ') || '-'}</p>
          </div>
          <div class="button-row library-spell-card__actions">
            <button class="icon-button" type="button" data-library-view-spell="${spell.id}" aria-label="Dettagli incantesimo">👁️</button>
            <button class="icon-button" type="button" data-library-delete-spell="${spell.id}" aria-label="Elimina incantesimo">🗑️</button>
          </div>
        </article>`).join('')
      : '<p>Nessun incantesimo trovato.</p>';
    pagination.innerHTML = sortedSpells.length
      ? `<button class="secondary" type="button" data-library-page="prev" ${currentPage <= 1 ? 'disabled' : ''}>← Precedente</button>
         <span class="muted">Pagina ${currentPage} di ${totalPages}</span>
         <button class="secondary" type="button" data-library-page="next" ${currentPage >= totalPages ? 'disabled' : ''}>Successiva →</button>`
      : '';

    list.querySelectorAll('[data-library-view-spell]').forEach((button) => button.addEventListener('click', async () => {
      const spell = sortedSpells.find((entry) => entry.id === button.dataset.libraryViewSpell);
      if (!spell) return;
      const content = document.createElement('div');
      content.className = 'library-spell-detail';
      content.innerHTML = `
        <p><strong>Livello:</strong> ${spell.level ?? '-'}</p>
        <p><strong>Scuola:</strong> ${spell.school || '-'}</p>
        <p><strong>Classi:</strong> ${(spell.caster_classes || []).join(', ') || '-'}</p>
        <p><strong>Lancio:</strong> ${spell.cast_time || '-'}</p>
        <p><strong>Durata:</strong> ${spell.duration || '-'}</p>
        <p><strong>Range:</strong> ${spell.range || '-'}</p>
        <p><strong>Componenti:</strong> ${spell.components || '-'}</p>
        <p><strong>Versione:</strong> ${spell.rules_version || '-'}</p>
        <p><strong>Descrizione:</strong> ${spell.description || 'Nessuna descrizione disponibile.'}</p>
      `;
      await openFormModal({ title: spell.name || 'Dettagli incantesimo', content, submitLabel: 'Chiudi', showFooter: false, cancelLabel: 'Chiudi' });
    }));
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
