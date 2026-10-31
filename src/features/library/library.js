import {
  assignSharedSpellToCharacter,
  createSharedSpell,
  removeSharedSpellAndAssignments,
  searchSharedSpells,
  updateSharedSpell
} from '../character/spellbookApi.js';
import { itemCategories, damageTypeLabels } from '../inventory/constants.js';
import { addSharedItemsToInventory } from '../inventory/catalogPicker.js';
import { getCategoryLabel } from '../inventory/utils.js';
import { openItemModal } from '../inventory/modals.js';
import { openEquipmentItemDetail } from '../character/home/itemDetail.js';
import { createToast, openConfirmModal } from '../../ui/components.js';
import { getState } from '../../app/state.js';
import { saveCharacterData } from '../character/home/data.js';
import { openSpellDrawer, openSpellQuickDetailModal } from '../character/home/modals.js';
import { escapeHtml, sanitizeImageUrl } from '../../lib/html.js';
import { createSharedItem, deleteSharedItem, searchSharedItems, updateSharedItem } from './itemLibraryApi.js';
import { canManageSharedCatalog } from './catalogPermissions.js';
import { normalizeSpellSchool, spellSchoolLabels, spellSchoolsEqual } from '../character/spellSchools.js';
import { groupSpellSources, normalizeSpellSource, spellSourceKey } from '../character/spellSources.js';
import './library.css';

const SPELL_SCHOOLS = spellSchoolLabels;
const SPELL_CASTER_CLASSES = [
  ['mago', 'Mago'], ['stregone', 'Stregone'], ['warlock', 'Warlock'], ['chierico', 'Chierico'],
  ['druido', 'Druido'], ['bardo', 'Bardo'], ['paladino', 'Paladino'], ['ranger', 'Ranger'], ['artefice', 'Artefice']
];
const PAGE_SIZE = 12;

async function loadWholeCatalog(search, pageSize) {
  const first = await search({ page: 1, pageSize });
  const items = [...(first.items || [])];
  const total = Number(first.total) || items.length;
  let page = 2;
  while (items.length < total) {
    const next = await search({ page, pageSize });
    if (!next.items?.length) break;
    items.push(...next.items);
    page += 1;
  }
  return items;
}

function activeCharacter() {
  const state = getState();
  return state.characters.find((character) => String(character.id) === String(state.activeCharacterId)) || null;
}

function spellPayload(spell = {}) {
  return {
    name: spell.name,
    rules_version: spell.rules_version || '2024',
    level: Number(spell.level) || 0,
    school: spell.school || null,
    cast_time: spell.cast_time || null,
    duration: spell.duration || null,
    range: spell.range || null,
    components: spell.components || null,
    material: spell.material || null,
    caster_classes: Array.isArray(spell.caster_classes) ? spell.caster_classes : [],
    damage_die: spell.damage_die || null,
    damage_modifier: spell.damage_modifier ?? null,
    damage_type: spell.damage_type || null,
    upcast_damage_die: spell.upcast_damage_die || null,
    upcast_damage_modifier: spell.upcast_damage_modifier ?? null,
    upcast_start_level: spell.upcast_start_level ?? null,
    upcast_description: spell.upcast_description || null,
    concentration: Boolean(spell.concentration),
    attack_roll: Boolean(spell.attack_roll),
    saving_throw_ability: spell.saving_throw_ability || null,
    attack_range_type: spell.attack_range_type || null,
    ritual: Boolean(spell.is_ritual || spell.ritual),
    description: spell.description || null,
    source: normalizeSpellSource(spell.source) || null,
    source_url: spell.source_url || null,
    source_key: spell.source_key || null
  };
}

function characterSpellFromShared(spell, existing = {}) {
  return {
    ...existing,
    id: existing.id || `spell-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    shared_spell_id: spell.id,
    ...spellPayload(spell),
    kind: Number(spell.level) === 0 ? 'cantrip' : 'spell',
    is_ritual: Boolean(spell.ritual),
    prep_state: existing.prep_state || 'known'
  };
}

async function syncUpdatedSpell(spellId, spell) {
  const character = activeCharacter();
  if (!character) return;
  const current = Array.isArray(character.data?.spells) ? character.data.spells : [];
  if (!current.some((entry) => entry.shared_spell_id === spellId)) return;
  await saveCharacterData(character, {
    ...(character.data || {}),
    spells: current.map((entry) => entry.shared_spell_id === spellId ? characterSpellFromShared(spell, entry) : entry)
  });
}

async function syncDeletedSpell(spellId) {
  const character = activeCharacter();
  if (!character) return;
  const current = Array.isArray(character.data?.spells) ? character.data.spells : [];
  if (!current.some((entry) => entry.shared_spell_id === spellId)) return;
  await saveCharacterData(character, {
    ...(character.data || {}),
    spells: current.filter((entry) => entry.shared_spell_id !== spellId)
  });
}

function spellLevelLabel(level) {
  return Number(level) === 0 ? 'Trucchetto' : `${Number(level)}° livello`;
}

function spellCard(spell) {
  const id = escapeHtml(spell.id);
  const name = escapeHtml(spell.name || 'Incantesimo senza nome');
  const classes = Array.isArray(spell.caster_classes) ? spell.caster_classes.join(' · ') : '';
  return `
    <article class="library-entry-card library-spell-card play-card play-card--spell" data-library-view-spell="${id}" tabindex="0" role="button" aria-label="Apri ${name}">
      <div class="library-entry-card__body">
        <header class="library-entry-card__header">
          <div>
            <span class="library-entry-card__eyebrow">${escapeHtml(spellLevelLabel(spell.level))} · ${escapeHtml(normalizeSpellSchool(spell.school) || 'Scuola non definita')}</span>
            <h3>${name}</h3>
          </div>
          <span class="library-entry-card__edition">${escapeHtml(spell.rules_version || '2024')}</span>
        </header>
        <div class="library-entry-card__meta">
          ${classes ? `<span class="library-entry-card__classes">${escapeHtml(classes)}</span>` : '<span></span>'}
          <span class="library-entry-card__traits">
            ${spell.concentration ? '<i>Concentrazione</i>' : ''}
            ${spell.ritual ? '<i>Rituale</i>' : ''}
          </span>
        </div>
      </div>
    </article>`;
}

function itemCard(item, character, canManageCatalog = false) {
  const id = escapeHtml(item.id);
  const name = escapeHtml(item.name || 'Oggetto senza nome');
  const image = sanitizeImageUrl(item.image_url);
  const weight = Number(item.weight) || 0;
  const damage = item.damage_die ? `${item.damage_die}${item.damage_type ? ` · ${damageTypeLabels.get(item.damage_type) || item.damage_type}` : ''}` : '';
  return `
    <article class="library-entry-card library-item-card" data-library-view-item="${id}" tabindex="0" role="button" aria-label="Apri ${name}">
      <div class="library-entry-card__body library-item-card__body">
        <div class="library-item-card__media">
          ${image ? `<img src="${image}" alt="" />` : '<span aria-hidden="true">♙</span>'}
        </div>
        <div class="library-item-card__content">
          <header class="library-entry-card__header">
            <div>
              <span class="library-entry-card__eyebrow">${escapeHtml(getCategoryLabel(item.category))}</span>
              <h3>${name}</h3>
            </div>
            ${item.is_magic ? '<span class="library-entry-card__edition is-magic">Magico</span>' : ''}
          </header>
          <div class="library-entry-card__facts">
            <span><small>Peso</small><strong>${weight || '—'} kg</strong></span>
            <span><small>Quantità</small><strong>${Number(item.qty) || 1}</strong></span>
            ${damage ? `<span><small>Danni</small><strong>${escapeHtml(damage)}</strong></span>` : ''}
            ${item.armor_class ? `<span><small>CA</small><strong>${escapeHtml(item.armor_class)}</strong></span>` : ''}
          </div>
          <div class="library-entry-card__meta">
            <span>${item.equipable ? 'Equipaggiabile' : 'Oggetto di inventario'}</span>
            ${item.attunement_active ? '<span class="library-entry-card__traits"><i>Sintonia</i></span>' : ''}
          </div>
        </div>
      </div>
      <footer class="library-entry-card__footer">
        <button type="button" class="library-item-copy" data-library-copy-item="${id}" ${character ? '' : 'disabled'}>${character ? `Aggiungi a ${escapeHtml(character.name)}` : 'Seleziona un personaggio'}</button>
        ${canManageCatalog ? `<div>
          <button type="button" data-library-edit-item="${id}" aria-label="Modifica ${name}" title="Modifica">✎</button>
          <button type="button" class="is-danger" data-library-delete-item="${id}" aria-label="Elimina ${name}" title="Elimina">⌫</button>
        </div>` : ''}
      </footer>
    </article>`;
}

function renderPagination(host, page, totalPages, key) {
  if (totalPages <= 1) {
    host.innerHTML = '';
    return;
  }
  host.innerHTML = `
    <button type="button" data-library-page="${key}:prev" ${page <= 1 ? 'disabled' : ''}>← Precedente</button>
    <span>Pagina ${page} di ${totalPages}</span>
    <button type="button" data-library-page="${key}:next" ${page >= totalPages ? 'disabled' : ''}>Successiva →</button>`;
}

function setBusy(list, label) {
  list.innerHTML = `<div class="library-context-loader"><span aria-hidden="true"></span><strong>${escapeHtml(label)}</strong></div>`;
}

function bindOpenableCard(card, callback) {
  card.addEventListener('click', (event) => {
    if (event.target.closest('button, a, input')) return;
    callback();
  });
  card.addEventListener('keydown', (event) => {
    if (!['Enter', ' '].includes(event.key) || event.target !== card) return;
    event.preventDefault();
    callback();
  });
}

export async function renderLibrary(container) {
  const canManageCatalog = await canManageSharedCatalog();
  container.innerHTML = `
    <section class="auth-screen character-select-view library-view">
      <div class="card character-select-card library-shell library-shell--refined">
        <header class="character-select-header library-hero library-hero--refined">
          <div class="library-hero__copy">
            <span class="library-hero__icon" aria-hidden="true">☷</span>
            <div>
              <span class="library-hero__eyebrow">Compendio condiviso</span>
              <h1 class="title-car-select">Archivio centralizzato</h1>
              <p class="muted">Un solo posto per incantesimi e oggetti riutilizzabili in tutte le schede.</p>
            </div>
          </div>
          <div class="library-hero__actions">
            ${canManageCatalog ? `
              <button class="primary library-add-button" type="button" data-library-add-spell><span>＋</span> Nuovo incantesimo</button>
              <button class="primary library-add-button" type="button" data-library-add-item hidden><span>＋</span> Nuovo oggetto</button>
            ` : '<span class="library-readonly-badge"><span aria-hidden="true">◈</span> Catalogo in consultazione</span>'}
          </div>
        </header>

        <nav class="library-mode-tabs" aria-label="Sezioni del compendio">
          <button type="button" class="is-active" data-library-tab="spells" aria-pressed="true"><span>✦</span><strong>Incantesimi</strong><small>Grimorio condiviso</small></button>
          <button type="button" data-library-tab="items" aria-pressed="false"><span>♙</span><strong>Oggetti</strong><small>Equipaggiamento e tesori</small></button>
        </nav>

        <section class="library-pane is-active" data-library-pane="spells">
          <div class="library-filter-panel library-filter-panel--refined library-filter-panel--shortcut">
            <div class="library-search-line library-search-line--spells">
              <label class="library-search-field"><span>Nome</span><input type="search" placeholder="Cerca un incantesimo…" data-spell-query /></label>
              <label class="library-compact-select"><span>Scuola</span><select data-spell-school><option value="">Tutte</option>${SPELL_SCHOOLS.map((school) => `<option>${school}</option>`).join('')}</select></label>
              <details class="spell-manual-filter library-manual-filter" data-library-source-filter>
                <summary><span>Manuali</span><strong data-spell-source-summary>Tutti</strong></summary>
                <div class="spell-manual-filter__options" data-spell-source-options></div>
              </details>
              <div class="library-version-switch" role="group" aria-label="Versione delle regole">
                <span>Regole</span><div><button type="button" class="is-active" data-spell-version="2014">2014</button><button type="button" data-spell-version="2024">2024</button></div>
              </div>
              <button type="button" class="library-reset-button" data-reset-spells>↺ Azzera</button>
            </div>
            <div class="library-filter-strip library-filter-strip--classes">
              <span class="library-filter-strip__label">Classe</span>
              <div class="library-class-pills">${SPELL_CASTER_CLASSES.map(([value, label]) => `<button type="button" data-spell-class="${value}">${label}</button>`).join('')}</div>
            </div>
            <div class="library-filter-strip">
              <span class="library-filter-strip__label">Livello</span>
              <div class="library-level-pills" data-spell-levels>
                <button type="button" data-level="0">Trucchetti</button>
                ${Array.from({ length: 9 }, (_, index) => `<button type="button" data-level="${index + 1}">${index + 1}°</button>`).join('')}
              </div>
              <div class="library-trait-pills">
                <button type="button" data-spell-trait="concentration">Concentrazione</button>
                <button type="button" data-spell-trait="ritual">Rituale</button>
              </div>
            </div>
          </div>
          <div class="library-results-heading" data-spell-results-heading></div>
          <div class="library-results-grid library-card-grid" data-library-spells></div>
          <div class="library-pagination" data-spell-pagination></div>
        </section>

        <section class="library-pane" data-library-pane="items" hidden>
          <div class="library-filter-panel library-filter-panel--refined library-filter-panel--shortcut">
            <div class="library-search-line library-search-line--items">
              <label class="library-search-field"><span>Nome</span><input type="search" placeholder="Cerca un oggetto…" data-item-query /></label>
              <div class="library-trait-pills">
                <button type="button" data-item-trait="magic">Magici</button>
                <button type="button" data-item-trait="equipable">Equipaggiabili</button>
              </div>
              <button type="button" class="library-reset-button" data-reset-items>↺ Azzera</button>
            </div>
            <div class="library-filter-strip library-filter-strip--categories">
              <span class="library-filter-strip__label">Categoria</span>
              <div class="library-category-pills" data-item-categories>
                ${itemCategories.map((category) => `<button type="button" data-category="${escapeHtml(category.value)}">${escapeHtml(category.label)}</button>`).join('')}
              </div>
            </div>
          </div>
          <div class="library-results-heading" data-item-results-heading></div>
          <div class="library-results-grid library-card-grid" data-library-items></div>
          <div class="library-pagination" data-item-pagination></div>
        </section>
      </div>
    </section>`;

  const state = {
    tab: 'spells', spells: [], items: [], spellPage: 1, itemPage: 1,
    spellLevels: new Set(), spellTraits: new Set(), spellRulesVersion: '2014', spellCasterClasses: new Set(), spellSources: new Set(), sourceGroups: [],
    itemCategory: '', itemTraits: new Set()
  };
  const spellList = container.querySelector('[data-library-spells]');
  const itemList = container.querySelector('[data-library-items]');

  const syncSpellSourceOptions = () => {
    const options = container.querySelector('[data-spell-source-options]');
    const summary = container.querySelector('[data-spell-source-summary]');
    if (!options || !summary) return;
    const sources = state.spells
      .filter((spell) => String(spell.rules_version || '2014') === state.spellRulesVersion)
      .map((spell) => String(spell.source || '').trim())
      .filter(Boolean);
    state.sourceGroups = groupSpellSources(sources);
    const availableKeys = new Set(state.sourceGroups.map((group) => group.key));
    [...state.spellSources].forEach((key) => { if (!availableKeys.has(key)) state.spellSources.delete(key); });
    options.innerHTML = state.sourceGroups.length
      ? state.sourceGroups.map((group) => `
        <label class="spell-manual-filter__option">
          <input type="checkbox" value="${escapeHtml(group.key)}" ${state.spellSources.has(group.key) ? 'checked' : ''} />
          <span>${escapeHtml(group.label)}</span>
        </label>`).join('')
      : '<span class="muted">Nessun manuale disponibile</span>';
    summary.textContent = state.spellSources.size
      ? (state.spellSources.size === 1 ? state.sourceGroups.find((group) => state.spellSources.has(group.key))?.label || '1' : `${state.spellSources.size} scelti`)
      : 'Tutti';
  };

  const loadSpells = async () => {
    setBusy(spellList, 'Apro il grimorio condiviso…');
    try {
      state.spells = await loadWholeCatalog(searchSharedSpells, 50);
      syncSpellSourceOptions();
      renderSpells();
    } catch (error) {
      spellList.innerHTML = '<div class="library-empty-state"><strong>Impossibile caricare gli incantesimi</strong><span>Controlla la connessione e riprova.</span></div>';
      createToast('Errore caricamento compendio incantesimi', 'error');
    }
  };

  const loadItems = async () => {
    setBusy(itemList, 'Apro il catalogo degli oggetti…');
    try {
      state.items = await loadWholeCatalog(searchSharedItems, 100);
      renderItems();
    } catch (error) {
      itemList.innerHTML = '<div class="library-empty-state"><strong>Catalogo oggetti non disponibile</strong><span>Esegui lo script db/shared_items_catalog.sql su Supabase, poi riprova.</span></div>';
    }
  };

  const editSpell = async (spell) => {
    await openSpellDrawer(null, async (updated) => {
      try {
        const row = await updateSharedSpell(spell.id, spellPayload({ ...spell, ...updated }));
        await syncUpdatedSpell(spell.id, row);
        createToast('Incantesimo aggiornato', 'success');
        await loadSpells();
      } catch (error) {
        createToast("Errore durante la modifica dell'incantesimo", 'error');
      }
    }, { ...spell, kind: Number(spell.level) === 0 ? 'cantrip' : 'spell', is_ritual: Boolean(spell.ritual) }, { catalogMode: true });
  };

  const deleteSpell = async (spell) => {
    const confirmed = await openConfirmModal({ title: 'Elimina incantesimo', message: `Eliminare “${spell.name}” dal compendio e dalle schede collegate?`, confirmLabel: 'Elimina' });
    if (!confirmed) return;
    try {
      await removeSharedSpellAndAssignments(spell.id);
      await syncDeletedSpell(spell.id);
      createToast('Incantesimo eliminato', 'success');
      await loadSpells();
    } catch (error) {
      createToast("Errore durante l'eliminazione dell'incantesimo", 'error');
    }
  };

  const renderSpells = () => {
    const query = container.querySelector('[data-spell-query]')?.value.trim().toLocaleLowerCase('it') || '';
    const school = container.querySelector('[data-spell-school]')?.value || '';
    const filtered = state.spells
      .filter((spell) => !query || String(spell.name || '').toLocaleLowerCase('it').includes(query))
      .filter((spell) => !state.spellLevels.size || state.spellLevels.has(String(Number(spell.level) || 0)))
      .filter((spell) => !school || spellSchoolsEqual(spell.school, school))
      .filter((spell) => !state.spellSources.size || state.spellSources.has(spellSourceKey(spell.source)))
      .filter((spell) => String(spell.rules_version || '2014') === state.spellRulesVersion)
      .filter((spell) => !state.spellCasterClasses.size || (Array.isArray(spell.caster_classes) && spell.caster_classes.some((entry) => state.spellCasterClasses.has(String(entry).toLowerCase()))))
      .filter((spell) => !state.spellTraits.has('concentration') || spell.concentration)
      .filter((spell) => !state.spellTraits.has('ritual') || spell.ritual)
      .sort((a, b) => (Number(a.level) - Number(b.level)) || String(a.name).localeCompare(String(b.name), 'it'));
    const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    state.spellPage = Math.min(state.spellPage, pages);
    const visible = filtered.slice((state.spellPage - 1) * PAGE_SIZE, state.spellPage * PAGE_SIZE);
    const selectedClassLabels = SPELL_CASTER_CLASSES.filter(([value]) => state.spellCasterClasses.has(value)).map(([, label]) => label);
    const selectedManualLabels = state.sourceGroups.filter((group) => state.spellSources.has(group.key)).map((group) => group.label);
    container.querySelector('[data-spell-results-heading]').innerHTML = `<div><span class="library-results-heading__eyebrow">Grimorio ${state.spellRulesVersion}</span><strong>${filtered.length} ${filtered.length === 1 ? 'incantesimo' : 'incantesimi'}</strong></div><span>${selectedManualLabels.length ? `Manuali: ${escapeHtml(selectedManualLabels.join(', '))}` : selectedClassLabels.length ? `Classi: ${escapeHtml(selectedClassLabels.join(', '))}` : 'Tutti i manuali'} · ordine per livello e nome</span>`;
    spellList.innerHTML = visible.length ? visible.map(spellCard).join('') : '<div class="library-empty-state"><strong>Nessun incantesimo trovato</strong><span>Modifica i filtri o aggiungi un nuovo incantesimo.</span></div>';
    renderPagination(container.querySelector('[data-spell-pagination]'), state.spellPage, pages, 'spells');

    spellList.querySelectorAll('[data-library-view-spell]').forEach((card) => {
      const spell = state.spells.find((entry) => String(entry.id) === card.dataset.libraryViewSpell);
      if (!spell) return;
      bindOpenableCard(card, () => openSpellQuickDetailModal(
        null,
        { ...spell, kind: Number(spell.level) === 0 ? 'cantrip' : 'spell', is_ritual: Boolean(spell.ritual) },
        null,
        canManageCatalog ? { onEdit: () => editSpell(spell), onDelete: () => deleteSpell(spell) } : {}
      ));
    });
  };

  const editItem = async (item) => {
    await openItemModal(null, item, [], async (payload) => {
      try {
        await updateSharedItem(item.id, payload);
        await loadItems();
      } catch (error) {
        createToast("Errore durante la modifica dell'oggetto", 'error');
        throw error;
      }
    }, { catalogMode: true });
  };

  const deleteItem = async (item) => {
    const confirmed = await openConfirmModal({ title: 'Elimina oggetto', message: `Eliminare “${item.name}” dal compendio? Gli oggetti già copiati nei personaggi resteranno disponibili.`, confirmLabel: 'Elimina' });
    if (!confirmed) return;
    try {
      await deleteSharedItem(item.id);
      createToast('Oggetto eliminato dal compendio', 'success');
      await loadItems();
    } catch (error) {
      createToast("Errore durante l'eliminazione dell'oggetto", 'error');
    }
  };

  const copyItem = async (item) => {
    const character = activeCharacter();
    if (!character) return;
    try {
      await addSharedItemsToInventory([item], character);
      createToast(`${item.name} aggiunto all’inventario di ${character.name}`, 'success');
    } catch (error) {
      createToast("Errore durante l'aggiunta all'inventario", 'error');
    }
  };

  const renderItems = () => {
    const query = container.querySelector('[data-item-query]')?.value.trim().toLocaleLowerCase('it') || '';
    const filtered = state.items
      .filter((item) => !query || String(item.name || '').toLocaleLowerCase('it').includes(query))
      .filter((item) => !state.itemCategory || item.category === state.itemCategory)
      .filter((item) => !state.itemTraits.has('magic') || item.is_magic)
      .filter((item) => !state.itemTraits.has('equipable') || item.equipable)
      .sort((a, b) => String(a.name).localeCompare(String(b.name), 'it'));
    const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    state.itemPage = Math.min(state.itemPage, pages);
    const visible = filtered.slice((state.itemPage - 1) * PAGE_SIZE, state.itemPage * PAGE_SIZE);
    const character = activeCharacter();
    container.querySelector('[data-item-results-heading]').innerHTML = `<div><span class="library-results-heading__eyebrow">Catalogo oggetti</span><strong>${filtered.length} ${filtered.length === 1 ? 'oggetto' : 'oggetti'}</strong></div><span>${character ? `Personaggio attivo: ${escapeHtml(character.name)}` : 'Seleziona un personaggio per copiare gli oggetti'}</span>`;
    itemList.innerHTML = visible.length ? visible.map((item) => itemCard(item, character, canManageCatalog)).join('') : '<div class="library-empty-state"><strong>Nessun oggetto trovato</strong><span>Modifica i filtri o crea il primo oggetto condiviso.</span></div>';
    renderPagination(container.querySelector('[data-item-pagination]'), state.itemPage, pages, 'items');

    itemList.querySelectorAll('[data-library-view-item]').forEach((card) => {
      const item = state.items.find((entry) => String(entry.id) === card.dataset.libraryViewItem);
      if (!item) return;
      bindOpenableCard(card, () => openEquipmentItemDetail(item, {
        weightUnit: 'kg',
        onEdit: canManageCatalog ? () => editItem(item) : null,
        onRemove: canManageCatalog ? () => deleteItem(item) : null,
        removeLabel: 'Elimina'
      }));
    });
    itemList.querySelectorAll('[data-library-edit-item]').forEach((button) => button.addEventListener('click', () => {
      const item = state.items.find((entry) => String(entry.id) === button.dataset.libraryEditItem);
      if (item) void editItem(item);
    }));
    itemList.querySelectorAll('[data-library-delete-item]').forEach((button) => button.addEventListener('click', () => {
      const item = state.items.find((entry) => String(entry.id) === button.dataset.libraryDeleteItem);
      if (item) void deleteItem(item);
    }));
    itemList.querySelectorAll('[data-library-copy-item]').forEach((button) => button.addEventListener('click', () => {
      const item = state.items.find((entry) => String(entry.id) === button.dataset.libraryCopyItem);
      if (item) void copyItem(item);
    }));
  };

  container.querySelectorAll('[data-library-tab]').forEach((button) => button.addEventListener('click', () => {
    state.tab = button.dataset.libraryTab;
    container.querySelectorAll('[data-library-tab]').forEach((entry) => {
      const active = entry === button;
      entry.classList.toggle('is-active', active);
      entry.setAttribute('aria-pressed', String(active));
    });
    container.querySelectorAll('[data-library-pane]').forEach((pane) => {
      const active = pane.dataset.libraryPane === state.tab;
      pane.hidden = !active;
      pane.classList.toggle('is-active', active);
    });
    const addSpellButton = container.querySelector('[data-library-add-spell]');
    const addItemButton = container.querySelector('[data-library-add-item]');
    if (addSpellButton) addSpellButton.hidden = state.tab !== 'spells';
    if (addItemButton) addItemButton.hidden = state.tab !== 'items';
    if (state.tab === 'items' && !state.items.length) void loadItems();
  }));

  container.querySelector('[data-spell-query]').addEventListener('input', () => { state.spellPage = 1; renderSpells(); });
  container.querySelector('[data-spell-school]').addEventListener('change', () => { state.spellPage = 1; renderSpells(); });
  container.querySelector('[data-spell-source-options]').addEventListener('change', (event) => {
    const checkbox = event.target.closest('input[type="checkbox"]');
    if (!checkbox) return;
    checkbox.checked ? state.spellSources.add(checkbox.value) : state.spellSources.delete(checkbox.value);
    syncSpellSourceOptions();
    state.spellPage = 1;
    renderSpells();
  });
  container.querySelectorAll('[data-level]').forEach((button) => button.addEventListener('click', () => {
    const level = button.dataset.level;
    state.spellLevels.has(level) ? state.spellLevels.delete(level) : state.spellLevels.add(level);
    button.classList.toggle('is-active', state.spellLevels.has(level));
    state.spellPage = 1;
    renderSpells();
  }));
  container.querySelectorAll('[data-spell-trait]').forEach((button) => button.addEventListener('click', () => {
    const trait = button.dataset.spellTrait;
    state.spellTraits.has(trait) ? state.spellTraits.delete(trait) : state.spellTraits.add(trait);
    button.classList.toggle('is-active', state.spellTraits.has(trait));
    state.spellPage = 1;
    renderSpells();
  }));
  container.querySelectorAll('[data-spell-version]').forEach((button) => button.addEventListener('click', () => {
    state.spellRulesVersion = button.dataset.spellVersion;
    container.querySelectorAll('[data-spell-version]').forEach((entry) => entry.classList.toggle('is-active', entry === button));
    state.spellPage = 1;
    syncSpellSourceOptions();
    renderSpells();
  }));
  container.querySelectorAll('[data-spell-class]').forEach((button) => button.addEventListener('click', () => {
    const casterClass = button.dataset.spellClass;
    state.spellCasterClasses.has(casterClass) ? state.spellCasterClasses.delete(casterClass) : state.spellCasterClasses.add(casterClass);
    button.classList.toggle('is-active', state.spellCasterClasses.has(casterClass));
    state.spellPage = 1;
    renderSpells();
  }));
  container.querySelector('[data-reset-spells]').addEventListener('click', () => {
    container.querySelector('[data-spell-query]').value = '';
    container.querySelector('[data-spell-school]').value = '';
    state.spellSources.clear();
    state.spellLevels.clear();
    state.spellRulesVersion = '2014';
    state.spellCasterClasses.clear();
    state.spellTraits.clear();
    container.querySelectorAll('[data-level], [data-spell-trait], [data-spell-class]').forEach((button) => button.classList.remove('is-active'));
    container.querySelectorAll('[data-spell-version]').forEach((button) => button.classList.toggle('is-active', button.dataset.spellVersion === '2014'));
    syncSpellSourceOptions();
    state.spellPage = 1;
    renderSpells();
  });

  container.querySelector('[data-item-query]').addEventListener('input', () => { state.itemPage = 1; renderItems(); });
  container.querySelectorAll('[data-category]').forEach((button) => button.addEventListener('click', () => {
    state.itemCategory = state.itemCategory === button.dataset.category ? '' : button.dataset.category;
    container.querySelectorAll('[data-category]').forEach((entry) => entry.classList.toggle('is-active', entry.dataset.category === state.itemCategory));
    state.itemPage = 1;
    renderItems();
  }));
  container.querySelectorAll('[data-item-trait]').forEach((button) => button.addEventListener('click', () => {
    const trait = button.dataset.itemTrait;
    state.itemTraits.has(trait) ? state.itemTraits.delete(trait) : state.itemTraits.add(trait);
    button.classList.toggle('is-active', state.itemTraits.has(trait));
    state.itemPage = 1;
    renderItems();
  }));
  container.querySelector('[data-reset-items]').addEventListener('click', () => {
    container.querySelector('[data-item-query]').value = '';
    state.itemCategory = '';
    state.itemTraits.clear();
    container.querySelectorAll('[data-category], [data-item-trait]').forEach((button) => button.classList.remove('is-active'));
    state.itemPage = 1;
    renderItems();
  });

  container.addEventListener('click', (event) => {
    const button = event.target.closest('[data-library-page]');
    if (!button) return;
    const [kind, direction] = button.dataset.libraryPage.split(':');
    if (kind === 'spells') {
      state.spellPage += direction === 'next' ? 1 : -1;
      renderSpells();
    } else {
      state.itemPage += direction === 'next' ? 1 : -1;
      renderItems();
    }
  });

  container.querySelector('[data-library-add-spell]')?.addEventListener('click', async () => {
    await openSpellDrawer(null, async (spell) => {
      try {
        const row = await createSharedSpell({ created_by: getState().user?.id, ...spellPayload(spell) });
        const character = activeCharacter();
        if (character?.data?.is_spellcaster) {
          const current = Array.isArray(character.data?.spells) ? character.data.spells : [];
          await saveCharacterData(character, { ...(character.data || {}), spells: [...current, characterSpellFromShared(row)] });
          await assignSharedSpellToCharacter({ user_id: character.user_id, character_id: character.id, shared_spell_id: row.id, prep_state: 'known' });
        }
        createToast('Incantesimo aggiunto al compendio', 'success');
        await loadSpells();
      } catch (error) {
        createToast(String(error?.message || "Errore durante la creazione dell'incantesimo"), 'error');
      }
    }, null, { catalogMode: true, defaultRulesVersion: state.spellRulesVersion });
  });

  container.querySelector('[data-library-add-item]')?.addEventListener('click', async () => {
    await openItemModal(null, null, [], async (payload) => {
      await createSharedItem({ ...payload, created_by: getState().user?.id, rules_version: '2024' });
      await loadItems();
    }, { catalogMode: true });
  });

  await loadSpells();
}
