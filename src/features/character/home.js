import { openEquipmentItemDetail } from './home/itemDetail.js';
import { openAttackConfigurator, openQuickAttackDetail, openQuickRollEditor } from './home/quickRollEditor.js';
import { openEquipmentMannequin } from './home/equipmentMannequin.js';
import { weaponForAttackRange } from './home/attackRanges.js';
import { deleteResource, fetchCharacters, fetchResources, updateResource, updateResourcesReset } from './characterApi.js';
import { fetchItems, updateItem } from '../inventory/inventoryApi.js';
import { getState, normalizeCharacterId, setActiveCharacter, setState, updateCache } from '../../app/state.js';
import { buildSelect, createToast, openConfirmModal, openFormModal, setGlobalLoading } from '../../ui/components.js';
import { cacheSnapshot } from '../../lib/offline/cache.js';
import { escapeHtml } from '../../lib/html.js';
import { openDiceOverlay, updateDiceOverlayWarning } from '../dice-roller/overlay/dice.js';
import { openCharacterDrawer } from './home/characterDrawer.js';
import { presentSheetDetail } from './home/sheetDetail.js';
import { openGeneralModifierEditor } from './home/generalModifiers.js';
import { mountTabletLayout, captureSheetPanel, restoreSheetPanel, retainOpenSheetPanel } from './home/tabletLayout.js';
import { showShortcutLoader } from './home/shortcutViews.js';
import {
  buildAttackSection,
  buildCharacterOverview,
  buildEmptyState,
  buildProficiencyOverview,
  buildResourceSections,
  buildSavingThrowSection,
  buildSkillList,
  buildSpecialSkillList,
  buildSpellSection
} from './home/sections.js';
import { bindMoneyReasonPicker, moneyBundleFields } from '../inventory/render.js';
import { openItemModal } from '../inventory/modals.js';
import { addSharedItemsToInventory, openSharedItemPicker } from '../inventory/catalogPicker.js';
import { getWeightUnit } from '../inventory/utils.js';
import { ammunitionTypeLabels, itemCategories } from '../inventory/constants.js';
import { getWeaponMasteryLabel, getWeaponMasterySummary } from '../rules/weaponMasteries.js';
import { fetchWallet, createTransaction } from '../wallet/walletApi.js';
import { buildCoinBundleMovement } from '../wallet/coinMovements.js';
import { fetchCompanions } from './companionsApi.js';
import { assignSharedSpellToCharacter, fetchCharacterSpells, fetchSharedSpellSources, removeCharacterSpell, searchSharedSpells } from './spellbookApi.js';
import { dedupeCharacterSpells, normalizeSpellPreparationState } from './spellPreparation.js';
import {
  openAvatarModal,
  openBackgroundModal,
  openConditionsModal,
  openWeaknessModal,
  openPreparedSpellsModal,
  openResourceDetail,
  openResourcePoolConsumeModal,
  openVariableResourceCostModal,
  openResourceOptionModal,
  openResourceDrawer,
  openSpellDrawer,
  openSpellQuickDetailModal
} from './home/modals.js';
import { consumeSpellSlot, restoreSpellSlot, saveCharacterData } from './home/data.js';
import { attachModalValueStepper, buildHpActionFields } from './home/hpModal.js';
import { abilityShortLabel, conditionList, damageTypeList, savingThrowList, skillList } from './home/constants.js';
import { normalizeSpellSchool } from './spellSchools.js';
import { expandSpellSourceSelection, groupSpellSources } from './spellSources.js';
import {
  applyDeathSaveRoll,
  applyRestRecovery,
  buildSpellDamageOverlayConfig,
  buildWeaponDamageOverlayConfig,
  getWeaponDamageModes,
  calculateSkillModifier,
  calculateUnarmedAttackBonuses,
  formatSigned,
  getAbilityModifier,
  getCastableSpellSlotLevels,
  getEquipSlots,
  getHitDiceSides,
  normalizeNumber,
  parseDamageDice,
  rollDie
} from './home/utils.js';

const homeRenderSequences = new WeakMap();

function normalizeWildShapeStatBlock(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};
  return {
    abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10, ...(source.abilities || {}) },
    armor_class: source.armor_class ?? null,
    initiative: source.initiative ?? null,
    darkvision_range_m: source.darkvision_range_m ?? null,
    hp: { current: 1, max: 1, ...(source.hp || {}) },
    speeds: { walk: null, fly: null, climb: null, burrow: null, ...(source.speeds || {}) },
    attacks: Array.isArray(source.attacks) ? source.attacks : []
  };
}

function bindProficiencyTabs(root) {
  root?.querySelectorAll('[data-proficiency-tabs]').forEach((tabGroup) => {
    const buttons = Array.from(tabGroup.querySelectorAll('[data-proficiency-tab]'));
    const panels = Array.from(tabGroup.querySelectorAll('[data-proficiency-panel]'));
    if (!buttons.length || !panels.length) return;
    const setActiveTab = (tabKey) => {
      buttons.forEach((button) => {
        const isActive = button.dataset.proficiencyTab === tabKey;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-selected', String(isActive));
      });
      panels.forEach((panel) => {
        panel.classList.toggle('is-active', panel.dataset.proficiencyPanel === tabKey);
      });
    };
    buttons.forEach((button) => button.addEventListener('click', () => setActiveTab(button.dataset.proficiencyTab)));
    setActiveTab(buttons.find((button) => button.classList.contains('is-active'))?.dataset.proficiencyTab ?? buttons[0].dataset.proficiencyTab);
  });
}

function buildDeathSaveManagerContent(deathSaves = {}) {
  const successes = Math.max(0, Math.min(3, Number(deathSaves.successes) || 0));
  const failures = Math.max(0, Math.min(3, Number(deathSaves.failures) || 0));
  const track = (group, label, symbol, value) => `
    <section class="death-save-manager__track death-save-manager__track--${group}">
      <div><span aria-hidden="true">${symbol}</span><strong>${label}</strong><output data-death-save-output="${group}">${value}/3</output></div>
      <div class="death-save-manager__dots" role="group" aria-label="${label}">
        ${Array.from({ length: 3 }, (_, index) => `<button class="death-save-dot ${index < value ? 'is-filled' : ''}" type="button" data-modal-death-save="${group}" data-death-save-index="${index + 1}" aria-label="${label} ${index + 1}"><span aria-hidden="true"></span></button>`).join('')}
      </div>
    </section>`;
  return `
    <div class="death-save-manager">
      <div class="death-save-manager__intro">
        <span aria-hidden="true">†</span>
        <div><strong>Tiri salvezza contro morte</strong><small>Registra manualmente gli esiti oppure tira un d20.</small></div>
      </div>
      <input type="hidden" name="death_save_successes" value="${successes}" />
      <input type="hidden" name="death_save_failures" value="${failures}" />
      <div class="death-save-manager__tracks">
        ${track('successes', 'Successi', '✓', successes)}
        ${track('failures', 'Fallimenti', '✕', failures)}
      </div>
      <div class="death-save-manager__actions">
        <button class="ghost-button death-save-manager__reset" type="button" data-reset-death-saves><span aria-hidden="true">↺</span> Azzera</button>
        <button class="primary death-save-manager__roll" type="button" data-modal-roll-death-save><span aria-hidden="true">🎲</span> Tira TS morte</button>
      </div>
    </div>`;
}

function getActiveWildShapeDetails(character, companions = []) {
  const data = character?.data || {};
  if (!data.wild_shape_enabled) return null;
  const wildShape = data.wild_shape || {};
  if (!wildShape.active_companion_id) return null;
  const companion = (companions || []).find((entry) => String(entry.id) === String(wildShape.active_companion_id));
  if (!companion) return null;
  const statBlock = normalizeWildShapeStatBlock(companion.stat_block);
  const hpMax = Math.max(Number(statBlock.hp.max) || Number(statBlock.hp.current) || 1, 1);
  const hpCurrent = Math.max(0, Math.min(Number(wildShape.hp_current ?? statBlock.hp.current ?? hpMax) || 0, hpMax));
  return { companion, statBlock, hpCurrent, hpMax };
}

function buildWildShapeAdjustedCharacter(character, companions = []) {
  const activeWildShape = getActiveWildShapeDetails(character, companions);
  if (!character || !activeWildShape) return character;
  const data = character.data || {};
  const abilities = data.abilities || {};
  return {
    ...character,
    data: {
      ...data,
      abilities: {
        ...abilities,
        str: Number(activeWildShape.statBlock.abilities.str) || 10,
        dex: Number(activeWildShape.statBlock.abilities.dex) || 10,
        con: Number(activeWildShape.statBlock.abilities.con) || 10
      },
      initiative: activeWildShape.statBlock.initiative ?? getAbilityModifier(activeWildShape.statBlock.abilities.dex),
      speed: activeWildShape.statBlock.speeds.walk ?? data.speed
    }
  };
}

function getWildShapeForms(companions = []) {
  return (companions || []).filter((entry) => ['familiar', 'summon', 'transformation', 'animal'].includes(entry.kind || 'familiar'));
}

async function openWildShapePicker(character, companions, container) {
  if (!character?.data?.wild_shape_enabled) return;
  const forms = getWildShapeForms(companions);
  if (!forms.length) {
    createToast('Crea prima una forma nella sezione Famigli', 'error');
    return;
  }
  const currentWildShape = character.data?.wild_shape || {};
  const content = document.createElement('div');
  content.className = 'modal-form-grid wild-shape-picker';
  const field = document.createElement('label');
  field.className = 'field';
  field.innerHTML = '<span>Forma animale</span>';
  const select = buildSelect(forms.map((form) => {
    const statBlock = normalizeWildShapeStatBlock(form.stat_block);
    const hpMax = Math.max(Number(statBlock.hp.max) || Number(statBlock.hp.current) || 1, 1);
    return { value: form.id, label: `${form.name} · HP ${hpMax}` };
  }), currentWildShape.active_companion_id || forms[0]?.id || '');
  select.name = 'wild_shape_companion_id';
  field.appendChild(select);
  content.appendChild(field);
  const formData = await openFormModal({
    title: 'Scegli forma selvatica',
    submitLabel: 'Trasformati',
    content,
    cardClass: 'modal-card--form'
  });
  if (!formData) return;
  const companionId = String(formData.get('wild_shape_companion_id') || '');
  const selected = forms.find((entry) => String(entry.id) === companionId);
  if (!selected) return;
  const statBlock = normalizeWildShapeStatBlock(selected.stat_block);
  const hpMax = Math.max(Number(statBlock.hp.max) || Number(statBlock.hp.current) || 1, 1);
  await saveCharacterData(character, {
    ...(character.data || {}),
    wild_shape: {
      active_companion_id: selected.id,
      hp_current: hpMax,
      activated_at: new Date().toISOString()
    }
  }, `Forma selvatica: ${selected.name}`, () => renderHome(container));
}

async function endWildShape(character, container) {
  await saveCharacterData(character, {
    ...(character.data || {}),
    wild_shape: null
  }, 'Forma selvatica terminata', () => renderHome(container));
}


let fabHandlersBound = false;
let lastHomeContainer = null;

function captureHomeScrollState(container) {
  if (!container || !container.querySelector('.home-layout')) return null;
  return {
    windowX: window.scrollX || 0,
    windowY: window.scrollY || 0,
    panels: Array.from(container.querySelectorAll('.home-scroll-body, .home-scroll-panel'))
      .map((element, index) => ({
        index,
        top: element.scrollTop || 0,
        left: element.scrollLeft || 0
      }))
  };
}

function restoreHomeScrollState(container, scrollState) {
  if (!container || !scrollState) return;
  const restore = () => {
    const panels = Array.from(container.querySelectorAll('.home-scroll-body, .home-scroll-panel'));
    scrollState.panels.forEach((entry) => {
      const panel = panels[entry.index];
      if (!panel) return;
      panel.scrollTop = entry.top;
      panel.scrollLeft = entry.left;
    });
    window.scrollTo(scrollState.windowX, scrollState.windowY);
  };
  if (typeof window.requestAnimationFrame === 'function') {
    window.requestAnimationFrame(restore);
  } else {
    setTimeout(restore, 0);
  }
}

function mapSharedSpellToCharacterSpell(sharedSpell, { prepState = 'prepared' } = {}) {
  if (!sharedSpell) return null;
  return {
    id: `spell-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    shared_spell_id: sharedSpell.id,
    name: sharedSpell.name,
    level: sharedSpell.level,
    kind: Number(sharedSpell.level) === 0 ? 'cantrip' : 'spell',
    cast_time: sharedSpell.cast_time,
    duration: sharedSpell.duration,
    range: sharedSpell.range,
    components: sharedSpell.components,
    material: sharedSpell.material || null,
    concentration: Boolean(sharedSpell.concentration),
    attack_roll: Boolean(sharedSpell.attack_roll),
    saving_throw_ability: sharedSpell.saving_throw_ability || null,
    attack_range_type: sharedSpell.attack_range_type || null,
    is_ritual: Boolean(sharedSpell.ritual),
    damage_die: sharedSpell.damage_die,
    damage_modifier: sharedSpell.damage_modifier,
    damage_type: sharedSpell.damage_type || null,
    upcast_damage_die: sharedSpell.upcast_damage_die,
    upcast_damage_modifier: sharedSpell.upcast_damage_modifier,
    upcast_start_level: sharedSpell.upcast_start_level,
    upcast_description: sharedSpell.upcast_description || null,
    description: sharedSpell.description,
    source: sharedSpell.source || null,
    source_url: sharedSpell.source_url || null,
    source_key: sharedSpell.source_key || null,
    school: sharedSpell.school || null,
    caster_classes: sharedSpell.caster_classes || [],
    rules_version: sharedSpell.rules_version,
    prep_state: normalizeSpellPreparationState(prepState)
  };
}

function mapCharacterSpellRowToSpell(row) {
  const sharedSpell = row?.shared_spell || {};
  const customSpell = row?.custom_spell || {};
  const source = row?.shared_spell_id ? sharedSpell : customSpell;
  if (!source?.name) return null;
  const level = Number(source.level) || 0;
  const prepState = normalizeSpellPreparationState(row.prep_state);
  return {
    id: row.id || `spell-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    shared_spell_id: row.shared_spell_id || null,
    name: source.name,
    level,
    kind: source.kind || (level === 0 ? 'cantrip' : 'spell'),
    cast_time: source.cast_time || null,
    duration: source.duration || null,
    range: source.range || null,
    components: source.components || null,
    material: source.material || null,
    concentration: Boolean(source.concentration),
    attack_roll: Boolean(source.attack_roll),
    saving_throw_ability: source.saving_throw_ability || null,
    attack_range_type: source.attack_range_type || null,
    is_ritual: Boolean(source.ritual ?? source.is_ritual),
    damage_die: source.damage_die || null,
    damage_modifier: source.damage_modifier ?? null,
    damage_type: source.damage_type || null,
    upcast_damage_die: source.upcast_damage_die || null,
    upcast_damage_modifier: source.upcast_damage_modifier ?? null,
    upcast_start_level: source.upcast_start_level ?? null,
    upcast_description: source.upcast_description || null,
    description: source.description || null,
    source: source.source || null,
    source_url: source.source_url || null,
    source_key: source.source_key || null,
    school: source.school || null,
    caster_classes: source.caster_classes || [],
    rules_version: source.rules_version || null,
    prep_state: prepState
  };
}

export async function openSharedSpellPicker(present = openFormModal, { defaultRulesVersion = '2014', canPrepare = true, onCreateSpell = null } = {}) {
  const SCHOOLS = ['', 'Abiurazione', 'Ammaliamento', 'Divinazione', 'Evocazione', 'Illusione', 'Invocazione', 'Necromanzia', 'Trasmutazione'];
  const CASTER_CLASSES = ['mago', 'warlock', 'stregone', 'chierico', 'druido', 'ranger', 'artefice', 'paladino', 'bardo'];
  const PAGE_SIZE = 24;
  const initialRulesVersion = ['2014', '2024'].includes(String(defaultRulesVersion)) ? String(defaultRulesVersion) : '2014';
  const content = document.createElement('div');
  content.className = 'shared-spell-picker';
  content.innerHTML = `
    <section class="shared-spell-picker__filters" aria-label="Filtri incantesimi">
      <div class="shared-spell-picker__search-wrap">
        <label class="field shared-spell-picker__search">
          <span>Cerca per nome</span>
          <input type="search" name="spell_query" placeholder="Scrivi il nome di un incantesimo..." autocomplete="off" />
        </label>
      </div>
      <div class="shared-spell-picker__filter-toolbar">
        <label class="field">
          <span>Scuola</span>
          <select name="spell_school_filter">
            ${SCHOOLS.map((school) => `<option value="${school}">${school || 'Tutte le scuole'}</option>`).join('')}
          </select>
        </label>
        <details class="spell-manual-filter shared-spell-picker__source-filter" data-picker-source-filter>
          <summary><span>Manuali</span><strong data-picker-source-summary>Tutti</strong></summary>
          <div class="spell-manual-filter__options" data-picker-source-options>
            <span class="muted">Caricamento manuali…</span>
          </div>
        </details>
        <div class="shared-spell-picker__edition-filter" role="group" aria-label="Edizione delle regole">
          <span class="shared-spell-picker__filter-label">Regole</span>
          <div>
            <button type="button" data-picker-version="2014" aria-pressed="${initialRulesVersion === '2014'}" class="${initialRulesVersion === '2014' ? 'is-active' : ''}">2014</button>
            <button type="button" data-picker-version="2024" aria-pressed="${initialRulesVersion === '2024'}" class="${initialRulesVersion === '2024' ? 'is-active' : ''}">2024</button>
          </div>
        </div>
        <div class="shared-spell-picker__property-filter" role="group" aria-label="Proprietà incantesimo">
          <div>
            <button type="button" data-picker-property="concentration" aria-pressed="false">Concentrazione</button>
            <button type="button" data-picker-property="ritual" aria-pressed="false">Rituale</button>
          </div>
        </div>
      </div>
      <div class="shared-spell-picker__levels" role="group" aria-label="Filtra per livello">
        <span class="shared-spell-picker__filter-label">Livello</span>
        <div>
          <button type="button" data-picker-level="0" aria-pressed="false">Trucchetti</button>
          ${Array.from({ length: 9 }, (_, index) => `<button type="button" data-picker-level="${index + 1}" aria-pressed="false">${index + 1}°</button>`).join('')}
        </div>
      </div>
      <div class="shared-spell-picker__classes">
        <span class="shared-spell-picker__filter-label">Classi</span>
        <div class="shared-spell-picker__class-list">
          ${CASTER_CLASSES.map((casterClass) => `
            <label class="shared-spell-picker__class-chip">
              <input type="checkbox" name="spell_caster_filter" value="${casterClass}" />
              <span>${casterClass}</span>
            </label>
          `).join('')}
        </div>
      </div>
      <button type="button" class="ghost-button shared-spell-picker__reset" data-reset-spell-filters>Azzera filtri</button>
    </section>
    <div class="shared-spell-picker__workspace">
      <section class="shared-spell-picker__results" aria-label="Risultati ricerca">
        <div class="shared-spell-picker__results-header">
          <div>
            <strong data-spell-results-title>Incantesimi</strong>
            <span class="muted" data-spell-results-count>Caricamento...</span>
          </div>
          <div class="shared-spell-picker__selection-summary">
            <strong data-spell-selected-count>0 selezionati</strong>
            <button type="button" class="ghost-button" data-clear-spell-selection hidden>Deseleziona</button>
          </div>
        </div>
        <div class="shared-spell-picker__list" data-spell-results aria-live="polite"></div>
        <nav class="catalog-pagination shared-spell-picker__paging" data-spell-pagination aria-label="Pagine incantesimi" hidden>
          <button type="button" data-spell-page="previous">‹ Precedente</button>
          <span><strong data-spell-page-label>Pagina 1</strong><small data-spell-page-range></small></span>
          <button type="button" data-spell-page="next">Successiva ›</button>
        </nav>
      </section>
    </div>
  `;

  const queryInput = content.querySelector('input[name="spell_query"]');
  const schoolSelect = content.querySelector('select[name="spell_school_filter"]');
  const sourceOptions = content.querySelector('[data-picker-source-options]');
  const sourceSummary = content.querySelector('[data-picker-source-summary]');
  const resultsEl = content.querySelector('[data-spell-results]');
  const resultsCountEl = content.querySelector('[data-spell-results-count]');
  const selectedCountEl = content.querySelector('[data-spell-selected-count]');
  const clearSelectionButton = content.querySelector('[data-clear-spell-selection]');
  const pagination = content.querySelector('[data-spell-pagination]');
  const pageLabel = content.querySelector('[data-spell-page-label]');
  const pageRange = content.querySelector('[data-spell-page-range]');
  const previousPageButton = content.querySelector('[data-spell-page="previous"]');
  const nextPageButton = content.querySelector('[data-spell-page="next"]');
  let loadSequence = 0;
  let searchTimer = null;
  let submitButtons = [];
  let selectedLevel = '';
  let selectedRulesVersion = initialRulesVersion;
  let currentPage = 1;
  let totalResults = 0;
  let totalPages = 1;
  const selectedProperties = new Set();
  const selectedSpells = new Map();
  const selectedSourceKeys = new Set();
  let sourceGroups = [];
  let sourceLoadSequence = 0;

  const formatSpellLevel = (level) => Number(level) === 0 ? 'Trucchetto' : `Livello ${level}`;
  const syncPagination = () => {
    totalPages = Math.max(1, Math.ceil(totalResults / PAGE_SIZE));
    pagination.hidden = totalResults <= PAGE_SIZE;
    pageLabel.textContent = `Pagina ${currentPage} di ${totalPages}`;
    const first = totalResults ? ((currentPage - 1) * PAGE_SIZE) + 1 : 0;
    const last = Math.min(currentPage * PAGE_SIZE, totalResults);
    pageRange.textContent = totalResults ? `${first}–${last} di ${totalResults}` : 'Nessun risultato';
    previousPageButton.disabled = currentPage <= 1;
    nextPageButton.disabled = currentPage >= totalPages;
  };
  const setSubmitState = () => {
    const count = selectedSpells.size;
    submitButtons.forEach((button) => { button.disabled = count === 0; });
    const preparedButton = submitButtons.find((button) => button.value === 'prepared');
    const alwaysButton = submitButtons.find((button) => button.value === 'always');
    const countLabel = count ? ` ${count}` : '';
    if (preparedButton) preparedButton.textContent = `Aggiungi${countLabel} come preparati`;
    if (alwaysButton) alwaysButton.textContent = `Aggiungi${countLabel} come sempre preparati`;
    if (selectedCountEl) selectedCountEl.textContent = `${count} ${count === 1 ? 'selezionato' : 'selezionati'}`;
    if (clearSelectionButton) clearSelectionButton.hidden = count === 0;
  };
  const loadSourceOptions = async () => {
    const sequence = ++sourceLoadSequence;
    sourceOptions.setAttribute('aria-busy', 'true');
    try {
      const sources = await fetchSharedSpellSources({ rulesVersion: selectedRulesVersion });
      if (sequence !== sourceLoadSequence) return;
      sourceGroups = groupSpellSources(sources);
      const availableKeys = new Set(sourceGroups.map((group) => group.key));
      [...selectedSourceKeys].forEach((key) => { if (!availableKeys.has(key)) selectedSourceKeys.delete(key); });
      sourceOptions.innerHTML = sourceGroups.length
        ? sourceGroups.map((group) => `
          <label class="spell-manual-filter__option">
            <input type="checkbox" value="${escapeHtml(group.key)}" ${selectedSourceKeys.has(group.key) ? 'checked' : ''} />
            <span>${escapeHtml(group.label)}</span>
          </label>`).join('')
        : '<span class="muted">Nessun manuale disponibile</span>';
    } catch (error) {
      if (sequence !== sourceLoadSequence) return;
      sourceGroups = [];
      selectedSourceKeys.clear();
      sourceOptions.innerHTML = '<span class="muted">Manuali non disponibili</span>';
    } finally {
      if (sequence === sourceLoadSequence) sourceOptions.removeAttribute('aria-busy');
      sourceSummary.textContent = selectedSourceKeys.size
        ? (selectedSourceKeys.size === 1 ? sourceGroups.find((group) => selectedSourceKeys.has(group.key))?.label || '1' : `${selectedSourceKeys.size} scelti`)
        : 'Tutti';
    }
  };

  const syncVisibleSelection = () => {
    content.querySelectorAll('[data-shared-spell-id]').forEach((card) => {
      const selected = selectedSpells.has(String(card.dataset.sharedSpellId));
      card.classList.toggle('is-selected', selected);
      const toggle = card.querySelector('[data-spell-selection-toggle]');
      toggle?.classList.toggle('is-active', selected);
      toggle?.setAttribute('aria-pressed', String(selected));
      const marker = card.querySelector('[data-spell-selection-marker]');
      if (marker) marker.textContent = selected ? 'Selezionato' : 'Seleziona';
    });
    setSubmitState();
  };

  const clearSelection = () => {
    selectedSpells.clear();
    syncVisibleSelection();
  };

  const selectSpell = (spell, card) => {
    const spellId = String(spell.id);
    selectedSpells.has(spellId) ? selectedSpells.delete(spellId) : selectedSpells.set(spellId, spell);
    syncVisibleSelection();
    card?.focus({ preventScroll: true });
  };

  const renderResults = (items, total) => {
    resultsEl.innerHTML = '';
    totalResults = Number(total) || 0;
    resultsCountEl.textContent = `${total} ${total === 1 ? 'risultato' : 'risultati'}`;
    syncPagination();
    if (!items.length) {
      resultsEl.innerHTML = `
        <div class="shared-spell-picker__state">
          <span aria-hidden="true">⌕</span>
          <strong>Nessun incantesimo trovato</strong>
          <p>Prova a cambiare il nome o ad azzerare uno dei filtri.</p>
        </div>
      `;
      return;
    }
    items.forEach((spell) => {
      const card = document.createElement('article');
      card.className = 'shared-spell-picker__spell prepared-spells-modal__spell play-card play-card--spell';
      card.dataset.sharedSpellId = spell.id;
      const isSelected = selectedSpells.has(String(spell.id));
      if (isSelected) card.classList.add('is-selected');
      const surface = document.createElement('button');
      surface.type = 'button';
      surface.className = 'play-card__surface shared-spell-picker__detail-surface';
      surface.setAttribute('aria-label', `Mostra i dettagli di ${spell.name}`);
      const main = document.createElement('header');
      main.className = 'play-card__header prepared-spells-modal__spell-heading shared-spell-picker__spell-main';
      const meta = document.createElement('span');
      meta.className = 'play-card__eyebrow';
      meta.textContent = [formatSpellLevel(spell.level), normalizeSpellSchool(spell.school) || 'Scuola non indicata'].join(' · ');
      const name = document.createElement('strong');
      name.className = 'play-card__title';
      name.textContent = spell.name;
      main.append(meta, name);
      const openArrow = document.createElement('span');
      openArrow.className = 'shared-spell-picker__spell-arrow';
      openArrow.setAttribute('aria-hidden', 'true');
      openArrow.textContent = '›';
      surface.append(main, openArrow);
      surface.addEventListener('click', () => openSpellQuickDetailModal(null, spell, null, { present }));

      const footer = document.createElement('footer');
      footer.className = 'play-card__footer prepared-spells-modal__card-actions';
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = `play-card__button play-card__button--primary shared-spell-picker__select ${isSelected ? 'is-active' : ''}`;
      toggle.dataset.spellSelectionToggle = '';
      toggle.setAttribute('aria-pressed', String(isSelected));
      toggle.innerHTML = `<span class="prepared-spells-modal__check" aria-hidden="true">✓</span><span data-spell-selection-marker>${isSelected ? 'Selezionato' : 'Seleziona'}</span>`;
      toggle.addEventListener('click', () => selectSpell(spell, toggle));
      footer.append(toggle);
      card.append(surface, footer);
      resultsEl.appendChild(card);
    });
  };

  const loadResults = async (page = currentPage) => {
    const sequence = ++loadSequence;
    currentPage = Math.max(1, Number(page) || 1);
    pagination.hidden = true;
    resultsEl.innerHTML = `
      <div class="shared-spell-picker__state shared-spell-picker__state--loading">
        <span class="shared-spell-picker__spinner" aria-hidden="true"></span>
        <strong>Ricerca in corso...</strong>
      </div>
    `;
    resultsCountEl.textContent = 'Caricamento...';
    const selectedClasses = Array.from(content.querySelectorAll('input[name="spell_caster_filter"]:checked')).map((el) => el.value);
    try {
      const request = {
        query: queryInput.value,
        rulesVersion: selectedRulesVersion,
        level: selectedLevel,
        school: schoolSelect.value,
        sources: expandSpellSourceSelection(sourceGroups, selectedSourceKeys),
        casterClasses: selectedClasses,
        concentration: selectedProperties.has('concentration') ? true : '',
        ritual: selectedProperties.has('ritual') ? true : '',
        pageSize: PAGE_SIZE
      };
      const result = await searchSharedSpells({ ...request, page: currentPage });
      if (sequence !== loadSequence) return;
      totalResults = Number(result.total) || 0;
      totalPages = Math.max(1, Math.ceil(totalResults / PAGE_SIZE));
      if (currentPage > totalPages) return loadResults(totalPages);
      renderResults(result.items || [], totalResults);
      resultsEl.scrollTop = 0;
    } catch (error) {
      if (sequence !== loadSequence) return;
      resultsCountEl.textContent = 'Errore di caricamento';
      resultsEl.innerHTML = `
        <div class="shared-spell-picker__state shared-spell-picker__state--error">
          <span aria-hidden="true">!</span>
          <strong>Impossibile caricare gli incantesimi</strong>
          <p>Controlla la connessione e riprova.</p>
          <button type="button" class="ghost-button" data-retry-spells>Riprova</button>
        </div>
      `;
      resultsEl.querySelector('[data-retry-spells]')?.addEventListener('click', () => void loadResults());
    }
  };

  const refreshFromFirstPage = () => {
    void loadResults(1);
  };
  queryInput.addEventListener('input', () => {
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(refreshFromFirstPage, 250);
  });
  schoolSelect.addEventListener('change', refreshFromFirstPage);
  sourceOptions.addEventListener('change', (event) => {
    const checkbox = event.target.closest('input[type="checkbox"]');
    if (!checkbox) return;
    checkbox.checked ? selectedSourceKeys.add(checkbox.value) : selectedSourceKeys.delete(checkbox.value);
    sourceSummary.textContent = selectedSourceKeys.size
      ? (selectedSourceKeys.size === 1 ? sourceGroups.find((group) => selectedSourceKeys.has(group.key))?.label || '1' : `${selectedSourceKeys.size} scelti`)
      : 'Tutti';
    refreshFromFirstPage();
  });
  content.querySelectorAll('[data-picker-version]').forEach((button) => button.addEventListener('click', () => {
    const nextRulesVersion = button.dataset.pickerVersion;
    if (nextRulesVersion !== selectedRulesVersion) {
      selectedRulesVersion = nextRulesVersion;
      clearSelection();
    }
    content.querySelectorAll('[data-picker-version]').forEach((entry) => {
      const active = entry.dataset.pickerVersion === selectedRulesVersion;
      entry.classList.toggle('is-active', active);
      entry.setAttribute('aria-pressed', String(active));
    });
    selectedSourceKeys.clear();
    void loadSourceOptions();
    refreshFromFirstPage();
  }));
  content.querySelectorAll('[data-picker-level]').forEach((button) => button.addEventListener('click', () => {
    const level = button.dataset.pickerLevel || '';
    selectedLevel = selectedLevel === level ? '' : level;
    content.querySelectorAll('[data-picker-level]').forEach((entry) => {
      const active = entry.dataset.pickerLevel === selectedLevel;
      entry.classList.toggle('is-active', active);
      entry.setAttribute('aria-pressed', String(active));
    });
    refreshFromFirstPage();
  }));
  content.querySelectorAll('[data-picker-property]').forEach((button) => button.addEventListener('click', () => {
    const property = button.dataset.pickerProperty;
    selectedProperties.has(property) ? selectedProperties.delete(property) : selectedProperties.add(property);
    button.classList.toggle('is-active', selectedProperties.has(property));
    button.setAttribute('aria-pressed', String(selectedProperties.has(property)));
    refreshFromFirstPage();
  }));
  content.querySelectorAll('input[name="spell_caster_filter"]').forEach((control) => control.addEventListener('change', refreshFromFirstPage));
  clearSelectionButton?.addEventListener('click', clearSelection);
  previousPageButton?.addEventListener('click', () => void loadResults(currentPage - 1));
  nextPageButton?.addEventListener('click', () => void loadResults(currentPage + 1));
  content.querySelector('[data-reset-spell-filters]')?.addEventListener('click', () => {
    queryInput.value = '';
    selectedLevel = '';
    selectedRulesVersion = initialRulesVersion;
    selectedProperties.clear();
    schoolSelect.value = '';
    selectedSourceKeys.clear();
    content.querySelectorAll('input[name="spell_caster_filter"]').forEach((control) => { control.checked = false; });
    content.querySelectorAll('[data-picker-level], [data-picker-property]').forEach((button) => {
      button.classList.remove('is-active');
      button.setAttribute('aria-pressed', 'false');
    });
    content.querySelectorAll('[data-picker-version]').forEach((button) => {
      const active = button.dataset.pickerVersion === selectedRulesVersion;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    void loadSourceOptions();
    queryInput.focus();
    refreshFromFirstPage();
  });
  const formData = await present({
    title: 'Scegli un incantesimo dalla raccolta',
    submitLabel: 'Aggiungi come sempre preparati',
    cancelLabel: 'Annulla',
    content,
    cardClass: ['modal-card--form', 'modal-card--shared-spell-picker'],
    onOpen: ({ modal, formEl }) => {
      let createButton = null;
      let headerActionHost = null;
      if (typeof onCreateSpell === 'function') {
        const sheetActions = modal?.querySelector(':scope > .modal-header .sheet-modal-actions');
        let headerActions = modal?.querySelector('[data-form-header-actions]');
        if (sheetActions && modal?.classList.contains('sheet-detail--inline')) {
          headerActionHost = document.createElement('div');
          headerActionHost.className = 'modal-header__actions shared-spell-picker__header-actions';
          headerActionHost.dataset.formHeaderActions = '';
          sheetActions.prepend(headerActionHost);
          headerActions = headerActionHost;
        }
        if (headerActions) {
          createButton = document.createElement('button');
          createButton.type = 'button';
          createButton.className = 'resource-action-button shared-spell-picker__create-action';
          createButton.innerHTML = '<span aria-hidden="true">＋</span><strong>Crea incantesimo</strong>';
          createButton.addEventListener('click', () => {
            onCreateSpell();
          });
          headerActions.prepend(createButton);
        }
      }
      const primaryButton = modal.querySelector('[data-form-submit]');
      const actions = primaryButton?.closest('.modal-actions__right') || primaryButton?.parentElement;
      const preparedButton = canPrepare ? document.createElement('button') : null;
      if (preparedButton) {
        preparedButton.type = 'submit';
        preparedButton.classList.add('ghost-button', 'shared-spell-picker__assignment-submit', 'shared-spell-picker__assignment-submit--prepared');
        preparedButton.name = 'assignment_prep_state';
        preparedButton.value = 'prepared';
        if (formEl?.id) preparedButton.setAttribute('form', formEl.id);
      }
      const alwaysButton = primaryButton;
      if (alwaysButton) {
        alwaysButton.name = 'assignment_prep_state';
        alwaysButton.value = 'always';
        alwaysButton.classList.add('shared-spell-picker__assignment-submit', 'shared-spell-picker__assignment-submit--always');
        if (preparedButton) actions?.insertBefore(preparedButton, alwaysButton);
      }
      submitButtons = [preparedButton, alwaysButton].filter(Boolean);
      setSubmitState();
      queryInput.focus();
      void loadSourceOptions();
      void loadResults(1);
      return () => {
        window.clearTimeout(searchTimer);
        preparedButton?.remove();
        alwaysButton?.removeAttribute('name');
        alwaysButton?.removeAttribute('value');
        alwaysButton?.classList.remove('shared-spell-picker__assignment-submit', 'shared-spell-picker__assignment-submit--always');
        createButton?.remove();
        headerActionHost?.remove();
        submitButtons = [];
      };
    }
  });
  if (!formData) return null;
  const assignmentState = formData.get('assignment_prep_state') === 'prepared' ? 'prepared' : 'always';
  return [...selectedSpells.values()].map((spell) => ({ ...spell, assignment_prep_state: assignmentState }));
}

function getAvailableSpellSlotLevels(character, spellLevel) {
  return getCastableSpellSlotLevels(character?.data?.spellcasting?.slots, spellLevel);
}

async function chooseSpellSlotLevel(character, spell) {
  const baseLevel = Math.max(1, Number(spell?.level) || 1);
  const options = getAvailableSpellSlotLevels(character, baseLevel);
  if (!options.length) {
    createToast('Slot incantesimo esauriti', 'error');
    return null;
  }
  const hasHigherLevelOption = options.some((option) => option.level > baseLevel);
  if (options.length === 1 && !hasHigherLevelOption) {
    return options[0].level;
  }
  const field = document.createElement('label');
  field.className = 'field';
  field.innerHTML = '<span>Seleziona slot da consumare</span>';
  const select = document.createElement('select');
  select.name = 'cast_slot_level';
  select.className = 'input';
  options.forEach((option) => {
    const choice = document.createElement('option');
    choice.value = String(option.level);
    choice.textContent = `${option.level}° livello (${option.available} slot)`;
    select.appendChild(choice);
  });
  field.appendChild(select);
  const content = document.createElement('div');
  content.className = 'modal-form-grid';
  content.appendChild(field);
  const formData = await openFormModal({
    title: spell?.name ? `Lancia ${spell.name}` : 'Scegli slot incantesimo',
    submitLabel: 'Conferma',
    cancelLabel: 'Annulla',
    content,
    cardClass: 'modal-card--form'
  });
  if (!formData) return null;
  const selected = Math.max(baseLevel, Number(formData.get('cast_slot_level')) || baseLevel);
  return selected;
}

export async function renderHome(container) {
  const renderSequence = (homeRenderSequences.get(container) || 0) + 1;
  homeRenderSequences.set(container, renderSequence);
  const scrollState = captureHomeScrollState(container);
  const panelContext = captureSheetPanel(container);

  lastHomeContainer = container;
  const state = getState();
  const { user, offline } = state;
  const loadingErrors = [];

  setGlobalLoading(true);
  try {
    let characters = state.characters;
    if (!offline && user) {
      try {
      characters = await fetchCharacters(user.id);
      setState({ characters });
      await cacheSnapshot({ characters });
      } catch (error) {
        console.warn('Aggiornamento personaggi non riuscito, uso i dati locali', error);
        if (!characters.length) loadingErrors.push('Errore caricamento personaggi');
      }
    }

    const activeId = normalizeCharacterId(state.activeCharacterId);
  const hasActive = characters.some((char) => normalizeCharacterId(char.id) === activeId);
  if (!hasActive && characters.length) {
    setActiveCharacter(characters[0].id);
  }

  const resolvedActiveId = normalizeCharacterId(getState().activeCharacterId);
  const activeCharacter = characters.find((char) => normalizeCharacterId(char.id) === resolvedActiveId);
  const canCreateCharacter = Boolean(user) && !offline;
  const canManageResources = Boolean(user) && !offline;
  const canEditCharacter = Boolean(user) && !offline;

  let resources = Array.isArray(state.cache.resources) ? state.cache.resources : [];
  let items = Array.isArray(state.cache.items) ? state.cache.items : [];
  let companions = Array.isArray(state.cache.companions) ? state.cache.companions : [];
  if (!offline && activeCharacter) {
    const [resourcesResult, itemsResult, characterSpellsResult, companionsResult] = await Promise.allSettled([
      fetchResources(activeCharacter.id),
      fetchItems(activeCharacter.id),
      fetchCharacterSpells(activeCharacter.id),
      fetchCompanions(activeCharacter.id)
    ]);
    const snapshot = {};
    if (resourcesResult.status === 'fulfilled') {
      resources = resourcesResult.value;
      updateCache('resources', resources);
      snapshot.resources = resources;
    } else {
      console.warn('Aggiornamento risorse non riuscito, uso i dati locali', resourcesResult.reason);
      if (!resources.length) loadingErrors.push('Errore caricamento risorse');
    }
    if (itemsResult.status === 'fulfilled') {
      items = itemsResult.value;
      updateCache('items', items);
      snapshot.items = items;
    } else {
      console.warn('Aggiornamento equipaggiamento non riuscito, uso i dati locali', itemsResult.reason);
      if (!items.length) loadingErrors.push('Errore caricamento equip');
    }
    if (companionsResult.status === 'fulfilled') {
      companions = companionsResult.value || [];
      updateCache('companions', companions);
    } else {
      console.warn('Aggiornamento forme animali non riuscito, uso i dati locali', companionsResult.reason);
      if (!companions.length) loadingErrors.push('Errore caricamento forme animali');
    }
    if (characterSpellsResult.status === 'fulfilled') {
      const linkedSpells = (characterSpellsResult.value || [])
        .map((row) => mapCharacterSpellRowToSpell(row))
        .filter(Boolean);
      if (linkedSpells.length) {
        const currentSpells = Array.isArray(activeCharacter.data?.spells) ? activeCharacter.data.spells : [];
        const linkedToMerge = activeCharacter.data?.spell_preparation_synced
          ? linkedSpells.filter((linkedSpell) => currentSpells.some((spell) => (
            (spell.shared_spell_id && String(spell.shared_spell_id) === String(linkedSpell.shared_spell_id))
            || (!spell.shared_spell_id && spell.source_key && linkedSpell.source_key
              && String(spell.source_key) === String(linkedSpell.source_key)
              && String(spell.rules_version || '') === String(linkedSpell.rules_version || ''))
          )))
          : linkedSpells;
        const merged = dedupeCharacterSpells([...currentSpells, ...linkedToMerge]);
        activeCharacter.data = { ...(activeCharacter.data || {}), spells: merged };
      }
    }
    if (Object.keys(snapshot).length) {
      await cacheSnapshot(snapshot);
    }
  }

  // A newer refresh owns the screen. The stale one must never rebuild shortcuts or footer.
  if (homeRenderSequences.get(container) !== renderSequence) return;
  loadingErrors.forEach((message) => createToast(message, 'error'));

  const sheetCharacter = buildWildShapeAdjustedCharacter(activeCharacter, companions);

  retainOpenSheetPanel(container);
  container.innerHTML = `
    <div class="home-layout">
      <div class="home-column home-column--left">
        <section class="card home-card home-section home-feature-panel home-feature-panel--saves">
          <header class="card-header home-feature-header">
            <div>
              <p class="eyebrow">Tiri salvezza</p>
              <h3></h3>
            </div>
            <div class="actions">
              <button class="icon-button" data-open-dice="saving-throws" aria-label="Lancia dadi tiri salvezza">
                <span aria-hidden="true">🎲</span>
              </button>
            </div>
          </header>
          ${sheetCharacter ? buildSavingThrowSection(sheetCharacter, canEditCharacter) : '<p>Nessun personaggio selezionato.</p>'}
        </section>
        <section class="card home-card home-section home-scroll-panel home-feature-panel home-feature-panel--skills">
          <header class="card-header home-feature-header">
            <div>
              <p class="eyebrow">Abilità</p>            
            </div>
            <div class="actions">
              <button class="icon-button" data-open-dice="skills" aria-label="Lancia dadi abilità">
                <span aria-hidden="true">🎲</span>
              </button>
            </div>
          </header>
          <div class="home-scroll-body">
            ${sheetCharacter ? buildSkillList(sheetCharacter, canEditCharacter) : '<p>Nessun personaggio selezionato.</p>'}
          </div>
        </section>
        <section class="card home-card home-section home-scroll-panel home-feature-panel home-feature-panel--special-skills">
          <header class="card-header home-feature-header">
            <div>
              <p class="eyebrow">Tiri abilità speciali</p>
            </div>
            <div class="actions">
              <button class="icon-button" data-open-dice="special-skills" aria-label="Lancia dadi abilità speciali">
                <span aria-hidden="true">🎲</span>
              </button>
            </div>
          </header>
          <div class="home-scroll-body">
            ${sheetCharacter ? buildSpecialSkillList(sheetCharacter) : '<p>Nessun personaggio selezionato.</p>'}
          </div>
        </section>
      </div>
      <div class="home-column home-column--center">
        <section class="card home-card home-section character-sheet-card">
          ${sheetCharacter ? buildCharacterOverview(sheetCharacter, canEditCharacter, items, companions) : buildEmptyState(canCreateCharacter, offline)}
        </section>
      </div>
      <div class="home-column home-column--right">
        <section class="card home-card home-section home-scroll-panel home-feature-panel home-feature-panel--attacks">
          <header class="card-header home-feature-header">
            <div>
              <p class="eyebrow">Attacchi</p>
            </div>
            <div class="actions">
              <button class="icon-button icon-button--dice" data-open-dice="attack-roll" aria-label="Lancia dadi attacchi">
                <span aria-hidden="true">🎲</span>
              </button>
            </div>
          </header>
          <div class="home-scroll-body">
            ${activeCharacter
    ? buildAttackSection(sheetCharacter, items || [], companions, canEditCharacter)
    : '<p>Nessun personaggio selezionato.</p>'}
          </div>
        </section>
        ${activeCharacter?.data?.is_spellcaster ? `
        <section class="card home-card home-section home-scroll-panel home-feature-panel home-feature-panel--spells">
          <header class="card-header home-feature-header">
            <div>
              <p class="eyebrow">Incantesimi</p>
            </div>
            <div class="actions">
              ${activeCharacter?.data?.spellcasting?.can_prepare ? `
                <button class="icon-button icon-button--spell-prepare" type="button" data-open-prepared-spells aria-label="Prepara incantesimi" title="Prepara incantesimi">
                  <span aria-hidden="true">📖</span>
                </button>
              ` : ''}
              ${activeCharacter && canEditCharacter ? `
                <button class="icon-button icon-button--add icon-button--section-add" type="button" data-add-spell aria-label="Aggiungi incantesimo">
                  <span aria-hidden="true">+</span>
                </button>
              ` : ''}
            </div>
          </header>
          <div class="home-scroll-body">
            ${buildSpellSection(activeCharacter, canEditCharacter)}
          </div>
        </section>
        ` : ''}
        <section class="card home-card home-section home-scroll-panel home-feature-panel home-feature-panel--resources">
          <header class="card-header home-feature-header">
            <div>
              <p class="eyebrow">Risorse</p>           
            </div>
            ${activeCharacter && canManageResources ? `
              <button class="icon-button icon-button--add" data-add-resource aria-label="Nuova risorsa">
                <span aria-hidden="true">+</span>
              </button>
            ` : ''}
          </header>
          <div class="home-scroll-body home-scroll-body--resources">
            ${activeCharacter
    ? buildResourceSections(resources.map((resource) => ({
      ...resource,
      child_resource_count: resources.filter((entry) => String(entry.parent_resource_id) === String(resource.id)).length
    })), canManageResources)
    : '<p>Nessun personaggio selezionato.</p>'}
            ${activeCharacter && !canManageResources ? '<p class="muted">Connettiti per aggiungere nuove risorse.</p>' : ''}
          </div>
        </section>
      </div>
    </div>
  `;

  const configureAttack = async () => openAttackConfigurator(activeCharacter, items, () => renderHome(container), {
    onEquipWeapon: async (weapon) => {
      const result = await openEquipmentMannequin({
        items,
        initialItemId: weapon.id,
        singleItem: true,
        canEdit: true,
        title: `Equipaggia · ${weapon.name || 'Arma'}`,
        onEquip: async (item, equipSlots, currentItems) => {
          if (!item.weapon_type) {
            createToast('Definisci il tipo di arma prima di equipaggiarla', 'error');
            return false;
          }
          const proficiencies = activeCharacter?.data?.proficiencies || {};
          const proficient = item.weapon_type === 'improvised'
            ? true
            : item.weapon_type === 'simple'
              ? Boolean(proficiencies.weapon_simple)
              : Boolean(proficiencies.weapon_martial);
          if (!proficient) {
            createToast('Non hai la competenza per equipaggiare questa arma', 'error');
            return false;
          }
          if (!item.sovrapponibile) {
            const conflicting = currentItems
              .filter((entry) => String(entry.id) !== String(item.id))
              .filter((entry) => getEquipSlots(entry).some((slot) => equipSlots.includes(slot)));
            if (conflicting.length) {
              createToast('Lo slot selezionato è già occupato', 'error');
              return false;
            }
          }
          try {
            const updated = await updateItem(item.id, { equip_slot: equipSlots[0] || null, equip_slots: equipSlots });
            createToast('Arma aggiunta agli attacchi');
            return updated;
          } catch (error) {
            createToast('Errore durante la configurazione dell’arma', 'error');
            return false;
          }
        }
      });
      if (result?.changed) await renderHome(container);
    }
  });

  mountTabletLayout(container, {
    characterName: activeCharacter?.name || '',
    proficiencyBonus: formatSigned(normalizeNumber(activeCharacter?.data?.proficiency_bonus)),
    abilityModifiers: Object.fromEntries(['str', 'dex', 'con', 'int', 'wis', 'cha'].map((key) => [
      key,
      formatSigned(getAbilityModifier(activeCharacter?.data?.abilities?.[key]))
    ])),
    onRefresh: () => renderHome(container),
    onAddRoll: container.querySelector('[data-edit-character]') ? kind => openQuickRollEditor(activeCharacter, kind, () => renderHome(container)) : null,
    onConfigureAttack: container.querySelector('[data-edit-character]') ? configureAttack : null,
    onOpenAttack: index => openQuickAttackDetail(activeCharacter, index, () => renderHome(container))
  });
  bindFabHandlers();

  container.querySelectorAll('[data-edit-general-modifier]')
    .forEach((button) => button.addEventListener('click', async (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!activeCharacter || !canEditCharacter) return;
      const dialog = button.closest('dialog.sheet-detail');
      const present = dialog?.open
        ? (options) => presentSheetDetail(dialog, options)
        : openFormModal;
      await openGeneralModifierEditor(
        activeCharacter,
        button.dataset.editGeneralModifier,
        () => renderHome(container),
        { present }
      );
    }));

  const createButton = container.querySelector('[data-create-character]');
  if (createButton) {
    createButton.addEventListener('click', () => {
      openCharacterDrawer(user, () => renderHome(container));
    });
  }

  const editButton = container.querySelector('[data-edit-character]');
  if (editButton) {
    editButton.addEventListener('click', () => {
      openCharacterDrawer(user, () => renderHome(container), activeCharacter);
    });
  }

  const addResourceButton = container.querySelector('[data-add-resource]');
  if (addResourceButton) {
    addResourceButton.addEventListener('click', () => {
      openResourceDrawer(activeCharacter, () => renderHome(container));
    });
  }

  const addSpellButton = container.querySelector('[data-add-spell]');
  if (addSpellButton) {
    addSpellButton.addEventListener('click', async () => {
      if (!activeCharacter) return;
      const spellDialog = addSpellButton.closest('dialog');
      const presentInShortcut = (modalOptions) => presentSheetDetail(spellDialog, modalOptions);
      try {
          const preferredRulesVersion = (activeCharacter.data?.spells || [])
            .find((entry) => ['2014', '2024'].includes(String(entry.rules_version)))?.rules_version || '2014';
          const sharedSpells = await openSharedSpellPicker(presentInShortcut, {
            defaultRulesVersion: preferredRulesVersion,
            canPrepare: Boolean(activeCharacter.data?.spellcasting?.can_prepare),
            onCreateSpell: () => openSpellDrawer(activeCharacter, () => renderHome(container), null, { present: presentInShortcut })
          });
          if (!sharedSpells?.length) return;
          const currentSpells = Array.isArray(activeCharacter.data?.spells) ? activeCharacter.data.spells : [];
          const linkedIds = new Set(currentSpells.map((entry) => String(entry.shared_spell_id || '')).filter(Boolean));
          const spellsToAdd = sharedSpells.filter((spell) => !linkedIds.has(String(spell.id)));
          const duplicateCount = sharedSpells.length - spellsToAdd.length;
          if (!spellsToAdd.length) {
            createToast('Gli incantesimi selezionati sono già presenti nella scheda', 'info');
            return;
          }
          const nextSpells = spellsToAdd.map((sharedSpell) => mapSharedSpellToCharacterSpell(sharedSpell, {
            prepState: sharedSpell.assignment_prep_state === 'always' ? 'always' : 'prepared'
          }));
          if (activeCharacter.user_id) {
            await Promise.all(spellsToAdd.map((sharedSpell, index) => assignSharedSpellToCharacter({
              user_id: activeCharacter.user_id,
              character_id: activeCharacter.id,
              shared_spell_id: sharedSpell.id,
              prep_state: nextSpells[index].prep_state === 'always' ? 'always_prepared' : 'prepared'
            })));
          }
          const nextData = { ...(activeCharacter.data || {}), spells: [...currentSpells, ...nextSpells] };
          const addedLabel = `${nextSpells.length} ${nextSpells.length === 1 ? 'incantesimo aggiunto' : 'incantesimi aggiunti'} dalla raccolta`;
          await saveCharacterData(activeCharacter, nextData, addedLabel, () => renderHome(container));
          if (duplicateCount) createToast(`${duplicateCount} ${duplicateCount === 1 ? 'incantesimo già presente è stato ignorato' : 'incantesimi già presenti sono stati ignorati'}`, 'info');
          return;
      } catch (error) {
          createToast('Errore durante l\'associazione dell\'incantesimo condiviso', 'error');
          return;
      }
    });
  }

  const deleteSpellWithConfirmation = async (spell) => {
    if (!spell || !activeCharacter) return;
    const shouldDelete = await openConfirmModal({
      title: 'Conferma eliminazione incantesimo',
      message: `Stai per eliminare l'incantesimo "${spell.name}" dalla scheda del personaggio. Questa azione non può essere annullata.`,
      confirmLabel: 'Elimina'
    });
    if (!shouldDelete) return;
    if (spell.shared_spell_id) {
      try {
        const linkedRows = await fetchCharacterSpells(activeCharacter.id);
        const linkedRow = linkedRows.find((row) => row.shared_spell_id === spell.shared_spell_id);
        if (linkedRow?.id) await removeCharacterSpell(linkedRow.id);
      } catch (error) {
        createToast('Errore rimozione associazione incantesimo', 'error');
        return;
      }
    }
    const spells = Array.isArray(activeCharacter.data?.spells) ? activeCharacter.data.spells : [];
    await saveCharacterData(activeCharacter, {
      ...(activeCharacter.data || {}),
      spells: spells.filter((entry) => entry.id !== spell.id)
    }, 'Incantesimo eliminato', () => renderHome(container));
  };

  container.querySelectorAll('[data-edit-spell]')
    .forEach((button) => button.addEventListener('click', () => {
      const spellId = button.dataset.editSpell;
      if (!spellId || !activeCharacter) return;
      const spells = Array.isArray(activeCharacter.data?.spells) ? activeCharacter.data.spells : [];
      const spell = spells.find((entry) => entry.id === spellId);
      if (!spell) return;
      openSpellDrawer(activeCharacter, () => renderHome(container), spell);
    }));

  container.querySelectorAll('[data-delete-spell]')
    .forEach((button) => button.addEventListener('click', async () => {
      const spellId = button.dataset.deleteSpell;
      const spells = Array.isArray(activeCharacter?.data?.spells) ? activeCharacter.data.spells : [];
      const spell = spells.find((entry) => entry.id === spellId);
      await deleteSpellWithConfirmation(spell);
    }));

  const preparedSpellsButton = container.querySelector('[data-open-prepared-spells]');
  if (preparedSpellsButton) {
    preparedSpellsButton.addEventListener('click', async () => {
      await openPreparedSpellsModal(activeCharacter, () => renderHome(container));
    });
  }

  container.querySelectorAll('[data-spell-quick-open]')
    .forEach((button) => button.addEventListener('click', () => {
      const spellId = button.dataset.spellQuickOpen;
      if (!spellId || !activeCharacter) return;
      const spells = Array.isArray(activeCharacter.data?.spells) ? activeCharacter.data.spells : [];
      const spell = spells.find((entry) => String(entry.id) === String(spellId));
      if (!spell) return;
      openSpellQuickDetailModal(activeCharacter, spell, () => renderHome(container), {
        present: (options) => presentSheetDetail(button.closest('dialog'), options),
        onEdit: canEditCharacter ? () => openSpellDrawer(activeCharacter, () => renderHome(container), spell) : null,
        onDelete: canEditCharacter ? () => deleteSpellWithConfirmation(spell) : null
      });
    }));

  const backgroundButton = container.querySelector('[data-show-background]');
  if (backgroundButton) {
    backgroundButton.addEventListener('click', () => {
      openBackgroundModal(activeCharacter);
    });
  }

  const proficienciesButton = container.querySelector('[data-show-proficiencies]');
  if (proficienciesButton && activeCharacter) {
    proficienciesButton.addEventListener('click', () => {
      const content = document.createElement('div');
      content.className = 'proficiency-modal';
      content.innerHTML = buildProficiencyOverview(activeCharacter, items, canEditCharacter);
      void openFormModal({
        title: `Competenze di ${activeCharacter.name}`,
        content,
        submitLabel: 'Chiudi',
        cancelLabel: null,
        cardClass: ['modal-card--wide', 'modal-card--proficiencies'],
        onOpen: ({ modal, fieldsEl }) => {
          bindProficiencyTabs(fieldsEl);
          const submitButton = modal?.querySelector('[data-form-submit]');
          const leftActions = modal?.querySelector('.modal-footer .modal-actions__left');
          const rightActions = modal?.querySelector('.modal-footer .modal-actions__right');
          if (!submitButton || !leftActions || !rightActions) return undefined;
          submitButton.classList.remove('primary');
          submitButton.classList.add('ghost-button', 'proficiency-modal__close');
          leftActions.appendChild(submitButton);
          return () => {
            submitButton.classList.remove('ghost-button', 'proficiency-modal__close');
            submitButton.classList.add('primary');
            rightActions.appendChild(submitButton);
          };
        }
      });
    });
  }

  const conditionsButton = container.querySelector('[data-edit-conditions]');
  if (conditionsButton) {
    conditionsButton.addEventListener('click', async () => {
      await handleConditionsAction(container);
    });
  }
  const weaknessButton = container.querySelector('[data-edit-weakness]');
  if (weaknessButton) {
    weaknessButton.addEventListener('click', async () => {
      await handleWeaknessAction(container);
    });
  }

  bindProficiencyTabs(container);

  const inspirationButton = container.querySelector('[data-toggle-inspiration]');
  if (inspirationButton && activeCharacter && canEditCharacter) {
    inspirationButton.addEventListener('click', async () => {
      const currentData = activeCharacter.data || {};
      const nextData = {
        ...currentData,
        inspiration: !currentData.inspiration
      };
      await saveCharacterData(activeCharacter, nextData, 'Ispirazione aggiornata', () => renderHome(container));
    });
  }

  const concentrationButton = container.querySelector('[data-toggle-concentration]');
  if (concentrationButton && activeCharacter && canEditCharacter) {
    concentrationButton.addEventListener('click', async () => {
      const currentData = activeCharacter.data || {};
      const nextData = {
        ...currentData,
        concentration_active: !currentData.concentration_active
      };
      await saveCharacterData(activeCharacter, nextData, 'Concentrazione aggiornata', () => renderHome(container));
    });
  }

  container.querySelectorAll('[data-open-wild-shape]')
    .forEach((button) => button.addEventListener('click', () => {
      if (!activeCharacter || !canEditCharacter) return;
      void openWildShapePicker(activeCharacter, companions, container);
    }));

  container.querySelectorAll('[data-end-wild-shape]')
    .forEach((button) => button.addEventListener('click', () => {
      if (!activeCharacter || !canEditCharacter) return;
      void endWildShape(activeCharacter, container);
    }));

  container.querySelectorAll('[data-open-dice]')
    .forEach((button) => button.addEventListener('click', () => {
      handleDiceAction(button.dataset.openDice);
    }));

  container.querySelectorAll('[data-saving-throw-card]')
    .forEach((card) => card.addEventListener('click', () => {
      if (!activeCharacter) return;
      const saveKey = card.dataset.savingThrowCard;
      if (!saveKey) return;
      const options = buildSavingThrowRollOptions(activeCharacter);
      const selected = options.find((entry) => entry.value === saveKey);
      if (!selected) return;
      openDiceRollerModal({
        title: `Tiro salvezza • ${selected.shortLabel || selected.label}`,
        mode: 'd20',
        rollType: 'TS',
        selection: {
          label: 'Tiro salvezza',
          options,
          value: selected.value
        },
        allowInspiration: Boolean(activeCharacter?.data?.inspiration) && canEditCharacter,
        weakPoints: Number(activeCharacter?.data?.hp?.weak_points) || 0,
        characterId: activeCharacter.id
      });
    }));

  container.querySelectorAll('[data-skill-card]')
    .forEach((card) => card.addEventListener('click', () => {
      if (!activeCharacter) return;
      const skillKey = card.dataset.skillCard;
      if (!skillKey) return;
      const options = buildSkillRollOptions(activeCharacter, items || []);
      const selected = options.find((entry) => entry.value === skillKey);
      if (!selected) return;
      openDiceRollerModal({
        title: `Tiro abilità • ${selected.shortLabel || selected.label}`,
        mode: 'd20',
        rollType: 'TA',
        selection: {
          label: 'Abilità',
          options,
          value: selected.value
        },
        allowInspiration: Boolean(activeCharacter?.data?.inspiration) && canEditCharacter,
        weakPoints: Number(activeCharacter?.data?.hp?.weak_points) || 0,
        characterId: activeCharacter.id
      });
    }));
  container.querySelectorAll('[data-ability-card]')
    .forEach((card) => card.addEventListener('click', () => {
      if (!activeCharacter) return;
      const abilityKey = card.dataset.abilityCard;
      const options = buildAbilityRollOptions(sheetCharacter || activeCharacter, items || []);
      const selected = options.find((entry) => entry.value === abilityKey);
      if (!selected) return;
      openDiceRollerModal({
        title: `Prova di caratteristica • ${selected.shortLabel}`,
        mode: 'd20',
        rollType: 'TA',
        selection: { label: 'Caratteristica', options, value: selected.value },
        allowInspiration: Boolean(activeCharacter?.data?.inspiration) && canEditCharacter,
        weakPoints: Number(activeCharacter?.data?.hp?.weak_points) || 0,
        characterId: activeCharacter.id
      });
    }));
  container.querySelectorAll('[data-special-skill-card]')
    .forEach((card) => card.addEventListener('click', () => {
      if (!activeCharacter) return;
      const specialKey = card.dataset.specialSkillCard;
      if (!specialKey) return;
      const options = buildSpecialSkillRollOptions(activeCharacter, items || []);
      const selected = options.find((entry) => entry.value === specialKey);
      if (!selected) return;
      openDiceRollerModal({
        title: `Tiro abilità speciale • ${selected.shortLabel || selected.label}`,
        mode: 'd20',
        rollType: 'TA',
        selection: {
          label: 'Abilità speciale',
          options,
          value: selected.value
        },
        allowInspiration: Boolean(activeCharacter?.data?.inspiration) && canEditCharacter,
        weakPoints: Number(activeCharacter?.data?.hp?.weak_points) || 0,
        characterId: activeCharacter.id
      });
    }));

  container.querySelectorAll('[data-edit-resource]')
    .forEach((button) => button.addEventListener('click', () => {
      const resource = resources.find((entry) => entry.id === button.dataset.editResource);
      if (!resource) return;
      openResourceDrawer(activeCharacter, () => renderHome(container), resource);
    }));

  container.querySelectorAll('[data-hp-action]')
    .forEach((button) => button.addEventListener('click', async () => {
      await handleHpAction(button.dataset.hpAction, container);
    }));

  container.querySelectorAll('[data-roll-hit-dice]')
    .forEach((button) => button.addEventListener('click', async () => {
      await handleHitDiceHeal(activeCharacter, container);
    }));

  container.querySelectorAll('[data-roll-attack]')
    .forEach((control) => control.addEventListener('click', (event) => {
      if (!control.matches('button') && event.target.closest('button')) return;
      openPresetAttackRoll(control.dataset.rollAttack, control.dataset.attackRange);
    }));

  container.querySelectorAll('[data-cycle-weapon-mode]')
    .forEach((button) => button.addEventListener('click', () => {
      if (!activeCharacter) return;
      const weaponKey = button.dataset.cycleWeaponMode;
      const weapon = items?.find((entry) => String(entry.id) === weaponKey || entry.name === weaponKey);
      if (!weapon) return;
      const modes = getWeaponDamageModes(weapon).filter((mode) => mode.damageDie);
      if (modes.length <= 1) return;
      const currentMode = weapon.selected_damage_mode || modes[0].id;
      const currentIndex = Math.max(modes.findIndex((mode) => mode.id === currentMode), 0);
      const nextMode = modes[(currentIndex + 1) % modes.length];
      updateItem(weapon.id, { selected_damage_mode: nextMode.id })
        .then((saved) => {
          const nextItems = (getState().cache.items || items || []).map((entry) => String(entry.id) === String(weapon.id)
            ? { ...entry, ...(saved || {}), selected_damage_mode: nextMode.id }
            : entry);
          updateCache('items', nextItems);
          return cacheSnapshot({ items: nextItems });
        })
        .then(() => {
          createToast(`Modalità ${nextMode.label}`);
          renderHome(container);
        })
        .catch(() => createToast('Errore cambio modalità arma', 'error'));
    }));

  container.querySelectorAll('[data-roll-damage]')
    .forEach((button) => button.addEventListener('click', () => {
      if (!activeCharacter) return;
      const rollKey = button.dataset.rollDamage;
      if (!rollKey) return;
      if (rollKey.startsWith('wildshape:')) {
        const attackIndex = Number(rollKey.replace('wildshape:', '')) || 0;
        const activeWildShape = getActiveWildShapeDetails(activeCharacter, companions);
        const attack = activeWildShape?.statBlock.attacks?.[attackIndex];
        const damageNotation = String(attack?.damage || '').trim();
        if (!damageNotation || damageNotation === '-') {
          createToast('Danni non configurati per questo attacco', 'error');
          return;
        }
        openDiceOverlay({
          keepOpen: true,
          title: `${activeWildShape.companion.name} · Danni ${attack.name || 'Attacco'}`,
          mode: 'generic',
          notation: damageNotation,
          modifier: Number(attack.damage_modifier) || 0,
          rollType: 'DMG',
          characterId: activeCharacter?.id,
          historyLabel: `${activeWildShape.companion.name} · ${attack.name || 'Danni'}`
        });
        return;
      }
      if (rollKey.startsWith('unarmed:')) {
        const attackIndex = Number(rollKey.replace('unarmed:', '')) || 0;
        const attacks = Array.isArray(activeCharacter.data?.unarmed_attacks) ? activeCharacter.data.unarmed_attacks : [];
        const attack = attacks[attackIndex];
        const damageNotation = String(attack?.damage || '').trim();
        if (!damageNotation || damageNotation === '-') {
          createToast('Danni non configurati per questo colpo senz’arma', 'error');
          return;
        }
        const attackStats = calculateUnarmedAttackBonuses(activeCharacter.data || {}, attack);
        openDiceOverlay({
          keepOpen: true,
          title: `Danni ${attack.name || 'Colpo senz’arma'}`,
          mode: 'generic',
          notation: damageNotation,
          modifier: attackStats.damageModifier,
          rollType: 'DMG',
          characterId: activeCharacter?.id,
          historyLabel: attack.name || 'Colpo senz’arma',
          sneakAttackDice: activeCharacter?.data?.sneak_attack_dice || null
        });
        return;
      }
      if (rollKey.startsWith('spell:')) {
        const spellId = rollKey.replace('spell:', '');
        const spells = Array.isArray(activeCharacter.data?.spells) ? activeCharacter.data.spells : [];
        const spell = spells.find((entry) => entry.id === spellId);
        if (!spell) return;
        const selectedLevel = Number(spell.cast_level ?? spell.level) || 0;
        const overlayConfig = buildSpellDamageOverlayConfig(spell, selectedLevel);
        if (!overlayConfig) {
          createToast('Danno non calcolabile per questo trucchetto.', 'error');
          return;
        }
        openDiceOverlay({
          keepOpen: true,
          title: overlayConfig.title,
          mode: 'generic',
          notation: overlayConfig.notation,
          modifier: overlayConfig.modifier,
          rollType: 'DMG',
          characterId: activeCharacter?.id,
          historyLabel: spell.name || null,
          sneakAttackDice: activeCharacter?.data?.sneak_attack_dice || null
        });
        return;
      }
      const weaponParts = rollKey.startsWith('weapon:') ? rollKey.split(':') : [null, rollKey, 'default'];
      const weaponLookup = weaponParts[1] || rollKey;
      const weaponMode = weaponParts[2] || 'default';
      const weapon = items?.find((entry) => String(entry.id) === weaponLookup || entry.name === weaponLookup);
      if (!weapon) return;
      const overlayConfig = buildWeaponDamageOverlayConfig(activeCharacter, button.closest('[data-attack-range]') ? weaponForAttackRange(weapon, button.closest('[data-attack-range]').dataset.attackRange) : weapon, weaponMode);
      if (!overlayConfig) {
        createToast('Danno non calcolabile per questa arma.', 'error');
        return;
      }
      openDiceOverlay({
        keepOpen: true,
        title: overlayConfig.title,
        mode: 'generic',
        notation: overlayConfig.notation,
        modifier: overlayConfig.modifier,
        rollType: 'DMG',
        characterId: activeCharacter?.id,
        historyLabel: weapon.name || null,
        sneakAttackDice: activeCharacter?.data?.sneak_attack_dice || null
      });
    }));

  const openResourceRollOverlay = (resource) => {
    const notation = resource?.damage_dice_notation?.trim();
    if (!notation) return;
    const parsed = parseDamageDice(notation);
    if (!parsed?.notation) {
      createToast('Notazione dado non valida per questa risorsa', 'error');
      return;
    }
    openDiceOverlay({
      keepOpen: true,
      title: resource.name || 'Tiro abilità',
      mode: 'generic',
      notation: parsed.notation,
      modifier: Number(resource.damage_modifier) || 0,
      rollType: 'GEN',
      characterId: activeCharacter?.id,
      historyLabel: resource.name || null
    });
  };

  const getResourceChildren = (resource) => resources.filter(
    (entry) => String(entry.parent_resource_id) === String(resource?.id)
  );

  const useResource = async (resource, amount = 1, usageResource = resource) => {
    const parentResource = resource.parent_resource_id
      ? resources.find((entry) => String(entry.id) === String(resource.parent_resource_id))
      : resource;
    const maxUses = Number(parentResource?.max_uses) || 0;
    const used = Math.max(0, Number(parentResource?.used) || 0);
    const remaining = Math.max(maxUses - used, 0);
    const consumedAmount = Math.max(1, Number(amount) || 1);
    if (!parentResource || !maxUses || remaining < consumedAmount) {
      createToast(`Risorse insufficienti: ne servono ${consumedAmount}, disponibili ${remaining}`, 'error');
      return false;
    }
    try {
      await updateResource(parentResource.id, {
        used: used + consumedAmount
      });
      createToast(usageResource === parentResource ? 'Risorsa usata' : `${usageResource.name} usata`);
      renderHome(container);
      return true;
    } catch (error) {
      createToast('Errore utilizzo risorsa', 'error');
      return false;
    }
  };

  const requestResourceUse = async (resource) => {
    if (!resource) return;
    const parentResource = resource.parent_resource_id
      ? resources.find((entry) => String(entry.id) === String(resource.parent_resource_id))
      : resource;
    if (!parentResource) return;
    const childResources = getResourceChildren(parentResource);
    let usageResource = resource.parent_resource_id ? resource : parentResource;
    if (!resource.parent_resource_id && childResources.length) {
      const resourceDialog = container.querySelector('.home-feature-panel--resources')?.closest('dialog');
      const selectedChildId = await openResourceOptionModal(parentResource, childResources, {
        present: (options) => presentSheetDetail(resourceDialog, options),
        onRollOption: (child) => openResourceRollOverlay(child)
      });
      if (!selectedChildId) return;
      usageResource = childResources.find((entry) => String(entry.id) === String(selectedChildId));
      if (!usageResource) return;
    }
    if (usageResource !== parentResource) {
      let resourceCost = Math.max(1, Number(usageResource.resource_cost) || 1);
      if (usageResource.resource_cost_variable) {
        resourceCost = await openVariableResourceCostModal(usageResource, parentResource);
        if (resourceCost === null) return;
      }
      await useResource(parentResource, resourceCost, usageResource);
      return;
    }
    if (parentResource.resource_type === 'pool') {
      const amount = await openResourcePoolConsumeModal(parentResource);
      if (amount === null) return;
      await useResource(parentResource, amount, usageResource);
      return;
    }
    await useResource(parentResource, 1, usageResource);
  };

  const editResource = (resource) => {
    if (!resource || !canManageResources) return;
    openResourceDrawer(activeCharacter, () => renderHome(container), resource);
  };
  const deleteResourceWithConfirmation = async (resource) => {
    if (!resource || !canManageResources) return;
    const shouldDelete = await openConfirmModal({
      title: 'Conferma eliminazione risorsa',
      message: `Stai per eliminare la risorsa "${resource.name}". Questa azione non può essere annullata.`,
      confirmLabel: 'Elimina'
    });
    if (!shouldDelete) return;
    try {
      await deleteResource(resource.id);
      createToast('Risorsa eliminata');
      renderHome(container);
    } catch (error) {
      createToast('Errore eliminazione risorsa', 'error');
    }
  };

  const openResourceDetails = (resource) => {
    if (!resource) return;
    const childResources = getResourceChildren(resource);
    const canHaveChildren = Boolean(resource.can_have_children);
    const canManageChildResources = canManageResources && canHaveChildren;
    const resourceDialog = container.querySelector('.home-feature-panel--resources')?.closest('dialog');
    const presentResourceView = (options) => presentSheetDetail(resourceDialog, options);
    if (resourceDialog) resourceDialog.dataset.resourceId = String(resource.id);
    openResourceDetail(resource, {
      present: presentResourceView,
      childResources,
      canHaveChildren,
      onUse: () => requestResourceUse(resource),
      onCreateChild: canManageChildResources ? () => openResourceDrawer(activeCharacter, null, null, { parentResourceId: resource.id, present: presentResourceView }) : null,
      onOpenChild: (childId) => {
        const child = childResources.find((entry) => String(entry.id) === String(childId));
        if (!child) return;
        openResourceDetail(child, {
          present: presentResourceView,
          canHaveChildren: false,
          onEdit: canManageResources ? () => openResourceDrawer(activeCharacter, null, child, { present: presentResourceView }) : null,
          onDelete: canManageResources ? () => deleteResourceWithConfirmation(child) : null
        });
      },
      onEdit: canManageResources ? () => editResource(resource) : null,
      onDelete: canManageResources ? () => deleteResourceWithConfirmation(resource) : null,
      onReset: async () => {
        try {
          await updateResource(resource.id, { used: 0 });
          createToast('Risorsa ripristinata');
          renderHome(container);
        } catch (error) {
          createToast('Errore ripristino risorsa', 'error');
        }
      },
      onRecover: async () => {
        try {
          await updateResource(resource.id, { used: Math.max((Number(resource.used) || 0) - 1, 0) });
          createToast('Carica recuperata');
          renderHome(container);
        } catch (error) {
          createToast('Errore recupero carica', 'error');
        }
      }
    });
  };

  container.querySelectorAll('[data-roll-resource]')
    .forEach((button) => button.addEventListener('click', () => {
      const resource = resources.find((entry) => String(entry.id) === String(button.dataset.rollResource));
      if (resource) openResourceRollOverlay(resource);
    }));

  container.querySelectorAll('[data-resource-card]')
    .forEach((card) => {
      card.addEventListener('click', (event) => {
        if (event.target.closest('button')) return;
        const resource = resources.find((entry) => entry.id === card.dataset.resourceCard);
        openResourceDetails(resource);
      });
    });

  container.querySelectorAll('[data-use-resource]')
    .forEach((button) => button.addEventListener('click', async () => {
      const resource = resources.find((entry) => entry.id === button.dataset.useResource);
      const dialog = button.closest('dialog');
      if (dialog) delete dialog.dataset.resourceId;
      if (!resource) return;
      await requestResourceUse(resource);
    }));

  container.querySelectorAll('[data-use-spell]')
    .forEach((button) => button.addEventListener('click', async () => {
      if (!activeCharacter) return;
      const spellId = button.dataset.useSpell;
      if (!spellId) return;
      const spells = Array.isArray(activeCharacter.data?.spells) ? activeCharacter.data.spells : [];
      const spell = spells.find((entry) => entry.id === spellId);
      if (!spell) return;
      const level = Number(spell.level) || 0;
      if (level < 1) return;
      const selectedLevel = await chooseSpellSlotLevel(activeCharacter, spell);
      if (!selectedLevel) return;
      const consumed = await consumeSpellSlot(activeCharacter, selectedLevel, () => renderHome(container));
      if (!consumed) return;

      const refreshedCharacter = getState().characters.find((char) => normalizeCharacterId(char.id) === normalizeCharacterId(activeCharacter.id)) || activeCharacter;

      if (spell.concentration) {
        const currentData = refreshedCharacter.data || {};
        if (!currentData.concentration_active) {
          await saveCharacterData(refreshedCharacter, {
            ...currentData,
            concentration_active: true
          }, 'Concentrazione attiva', () => renderHome(container));
        }
      }
      await renderHome(container);
      const overlayConfig = buildSpellDamageOverlayConfig(spell, selectedLevel);
      if (overlayConfig) {
        openDiceOverlay({
          keepOpen: true,
          title: overlayConfig.title,
          mode: 'generic',
          notation: overlayConfig.notation,
          modifier: overlayConfig.modifier,
          rollType: 'DMG',
          characterId: activeCharacter.id,
          historyLabel: spell.name || null
        });
      }
    }));


  container.querySelectorAll('[data-consume-spell-slot]')
    .forEach((button) => button.addEventListener('click', async () => {
      if (!activeCharacter) return;
      const level = Number(button.dataset.consumeSpellSlot);
      if (!Number.isFinite(level) || level < 1) return;
      await consumeSpellSlot(activeCharacter, level, () => renderHome(container));
    }));

  container.querySelectorAll('[data-restore-spell-slot]')
    .forEach((button) => button.addEventListener('click', async () => {
      if (!activeCharacter) return;
      const level = Number(button.dataset.restoreSpellSlot);
      if (!Number.isFinite(level) || level < 1) return;
      await restoreSpellSlot(activeCharacter, level, () => renderHome(container));
    }));
  container.querySelectorAll('[data-delete-resource]')
    .forEach((button) => button.addEventListener('click', async () => {
      const resource = resources.find((entry) => entry.id === button.dataset.deleteResource);
      await deleteResourceWithConfirmation(resource);
    }));

  const deathSaveManagerButton = container.querySelector('[data-manage-death-saves]');
  if (deathSaveManagerButton && activeCharacter && canEditCharacter) {
    deathSaveManagerButton.addEventListener('click', async () => {
      const initialDeathSaves = activeCharacter.data?.death_saves || {};
      const content = document.createElement('div');
      content.innerHTML = buildDeathSaveManagerContent(initialDeathSaves);
      const values = {
        successes: Math.max(0, Math.min(3, Number(initialDeathSaves.successes) || 0)),
        failures: Math.max(0, Math.min(3, Number(initialDeathSaves.failures) || 0))
      };
      const syncManager = () => {
        ['successes', 'failures'].forEach((group) => {
          const input = content.querySelector(`[name="death_save_${group}"]`);
          const output = content.querySelector(`[data-death-save-output="${group}"]`);
          if (input) input.value = String(values[group]);
          if (output) output.textContent = `${values[group]}/3`;
          content.querySelectorAll(`[data-modal-death-save="${group}"]`).forEach((dot) => {
            dot.classList.toggle('is-filled', Number(dot.dataset.deathSaveIndex) <= values[group]);
          });
        });
        const rollButton = content.querySelector('[data-modal-roll-death-save]');
        if (rollButton) rollButton.disabled = values.successes >= 3 || values.failures >= 3;
      };
      const formData = await openFormModal({
        title: 'Gestisci TS contro morte',
        content,
        submitLabel: 'Salva',
        cancelLabel: 'Annulla',
        cardClass: 'modal-card--death-saves',
        onOpen: () => {
          const dotHandlers = [];
          content.querySelectorAll('[data-modal-death-save]').forEach((dot) => {
            const handler = () => {
              const group = dot.dataset.modalDeathSave;
              const index = Number(dot.dataset.deathSaveIndex);
              values[group] = values[group] === index ? index - 1 : index;
              syncManager();
            };
            dot.addEventListener('click', handler);
            dotHandlers.push([dot, handler]);
          });
          const resetButton = content.querySelector('[data-reset-death-saves]');
          const resetHandler = () => {
            values.successes = 0;
            values.failures = 0;
            syncManager();
          };
          resetButton?.addEventListener('click', resetHandler);
          const rollButton = content.querySelector('[data-modal-roll-death-save]');
          const rollHandler = () => {
            if (values.successes >= 3 || values.failures >= 3) {
              createToast('Azzera i TS morte prima di effettuare un nuovo tiro', 'error');
              return;
            }
            openDiceOverlay({
              title: 'Tiro salvezza su morte',
              mode: 'death-save',
              keepOpen: true,
              modifier: 0,
              rollType: 'TS',
              characterId: activeCharacter.id,
              historyLabel: 'TS morte',
              onRollComplete: ({ value }) => {
                const result = applyDeathSaveRoll(values, value);
                if (!result) return;
                values.successes = result.successes;
                values.failures = result.failures;
                syncManager();
                const messages = {
                  'critical-success': '20 naturale: 2 successi',
                  'critical-failure': '1 naturale: 2 fallimenti',
                  success: 'TS morte superato: 1 successo',
                  failure: 'TS morte fallito: 1 fallimento'
                };
                createToast(messages[result.outcome], result.outcome.includes('failure') ? 'error' : 'success');
              }
            });
          };
          rollButton?.addEventListener('click', rollHandler);
          syncManager();
          return () => {
            dotHandlers.forEach(([dot, handler]) => dot.removeEventListener('click', handler));
            resetButton?.removeEventListener('click', resetHandler);
            rollButton?.removeEventListener('click', rollHandler);
          };
        }
      });
      if (!formData) return;
      const nextDeathSaves = {
        successes: Math.max(0, Math.min(3, Number(formData.get('death_save_successes')) || 0)),
        failures: Math.max(0, Math.min(3, Number(formData.get('death_save_failures')) || 0))
      };
      await saveCharacterData(activeCharacter, {
        ...(activeCharacter.data || {}),
        death_saves: nextDeathSaves
      }, 'Tiri salvezza contro morte aggiornati', () => renderHome(container));
    });
  }

  container.querySelectorAll('[data-weakness-level]')
    .forEach((button) => button.addEventListener('click', async () => {
      if (!activeCharacter || !canEditCharacter) return;
      const level = Number(button.dataset.weaknessLevel);
      if (!level) return;
      const data = activeCharacter.data || {};
      const hp = data.hp || {};
      const current = Math.max(0, Math.min(6, Number(hp.weak_points) || 0));
      const nextValue = level === current ? 0 : level;
      await saveCharacterData(activeCharacter, {
        ...data,
        hp: {
          ...hp,
          weak_points: nextValue
        }
      }, 'Punti indebolimento aggiornati', () => renderHome(container));
    }));

  const avatarUpload = container.querySelector('[data-upload-avatar]');
  if (avatarUpload) {
    avatarUpload.addEventListener('click', (event) => {
      event.preventDefault();
      openAvatarModal(activeCharacter, () => renderHome(container));
    });
  }

  const avatar = avatarUpload ? null : container.querySelector('.character-avatar');
  if (avatar) {
    avatar.setAttribute('draggable', 'false');
    avatar.addEventListener('click', (event) => {
      event.preventDefault();
      openAvatarModal(activeCharacter);
    });
    avatar.addEventListener('contextmenu', (event) => {
      event.preventDefault();
    });
    avatar.addEventListener('dragstart', (event) => {
      event.preventDefault();
    });
  }

  const openItemDetails = async (item, { attackDetail = false } = {}) => {
    let modeChanged = false;
    const formData = await openEquipmentItemDetail(item, {
      items,
      weightUnit: getWeightUnit(activeCharacter),
      onEdit: canEditCharacter
        ? () => openItemModal(activeCharacter, item, items, () => renderHome(container))
        : null,
      removeLabel: 'Disequipaggia',
      onRemove: canEditCharacter && attackDetail
        ? async () => {
          const confirmed = await openConfirmModal({
            title: 'Disequipaggia arma',
            message: `${item.name || 'Questa arma'} resterà nell’inventario, ma non comparirà più tra gli attacchi.`,
            confirmLabel: 'Disequipaggia',
            cancelLabel: 'Annulla',
            danger: true
          });
          if (!confirmed) return false;
          try {
            await updateItem(item.id, { equip_slot: null, equip_slots: [] });
            createToast('Arma disequipaggiata');
            await renderHome(container);
            return true;
          } catch (error) {
            createToast('Errore durante il disequipaggiamento', 'error');
            return false;
          }
        }
        : null,
      onModeChange: canEditCharacter && attackDetail
        ? async (modeId) => {
          try {
            const saved = await updateItem(item.id, { selected_damage_mode: modeId });
            const nextItems = (getState().cache.items || items || []).map(entry => String(entry.id) === String(item.id)
              ? { ...entry, ...(saved || {}), selected_damage_mode: modeId }
              : entry);
            updateCache('items', nextItems);
            await cacheSnapshot({ items: nextItems });
            modeChanged = true;
            createToast('Impugnatura aggiornata');
            return saved || { selected_damage_mode: modeId };
          } catch (error) {
            createToast('Errore cambio impugnatura', 'error');
            return null;
          }
        }
        : null
    });
    if (modeChanged && !formData?.get?.('item_detail_action')) await renderHome(container);
  };

  container.querySelectorAll('[data-item-image]')
    .forEach((image) => {
      image.setAttribute('draggable', 'false');
      image.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const item = items?.find((entry) => String(entry.id) === image.dataset.itemImage);
        if (item) openItemDetails(item);
      });
    });
  container.querySelectorAll('[data-item-preview]')
    .forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const item = items?.find((entry) => String(entry.id) === button.dataset.itemPreview);
        if (item) openItemDetails(item, { attackDetail: Boolean(button.closest('.play-card--attack')) });
      });
    });
  restoreHomeScrollState(container, scrollState);
  restoreSheetPanel(container, panelContext);
  } finally {
    setGlobalLoading(false);
  }
}

export function bindGlobalFabHandlers() {
  bindFabHandlers();
}

function bindFabHandlers() {
  if (fabHandlersBound) return;
  document.addEventListener('click', async (event) => {
    const gameAction = event.target.closest('[data-game-action]');
    if (!gameAction) return;
    const hpButton = event.target.closest('[data-hp-action]');
    const moneyButton = event.target.closest('[data-money-action]');
    const restButton = event.target.closest('[data-rest]');
    const diceButton = event.target.closest('[data-open-dice]');
    const lootButton = event.target.closest('[data-add-loot]');
    const conditionsButton = event.target.closest('[data-edit-conditions]');
    const resistancesButton = event.target.closest('[data-edit-resistances]');
    const rollAdjustmentsButton = event.target.closest('[data-edit-roll-adjustments]');
    if (!hpButton && !moneyButton && !restButton && !diceButton && !lootButton && !conditionsButton && !resistancesButton && !rollAdjustmentsButton) return;
    event.preventDefault();
    const container = lastHomeContainer ?? null;
    if (hpButton) {
      await handleHpAction(hpButton.dataset.hpAction, container);
      return;
    }
    if (moneyButton) {
      const route = window.location.hash.replace('#/', '') || 'home';
      if (route === 'inventory') {
        return;
      }
      await handleMoneyAction(moneyButton.dataset.moneyAction, container);
      return;
    }
    if (restButton) {
      await handleRestAction(restButton.dataset.rest, container);
      return;
    }
    if (diceButton) {
      handleDiceAction(diceButton.dataset.openDice);
      return;
    }
    if (lootButton) {
      await handleLootAction(container);
      return;
    }
    if (conditionsButton) {
      await handleConditionsAction(container);
      return;
    }
    if (resistancesButton) {
      await handleResistancesAction(container);
      return;
    }
    if (rollAdjustmentsButton) {
      await handleRollAdjustmentsAction(container);
    }
  });
  fabHandlersBound = true;
}

function getHomeContext() {
  const state = getState();
  const { user, offline, characters, activeCharacterId } = state;
  const normalizedActiveId = normalizeCharacterId(activeCharacterId);
  const activeCharacter = characters.find((char) => normalizeCharacterId(char.id) === normalizedActiveId);
  const companions = state.cache.companions || [];
  const sheetCharacter = buildWildShapeAdjustedCharacter(activeCharacter, companions);
  return {
    activeCharacter,
    sheetCharacter,
    companions,
    canEditCharacter: Boolean(user) && !offline
  };
}

function getConsumeInspirationHandler(character, canEditCharacter) {
  const characterId = normalizeCharacterId(character?.id);
  const allowInspiration = Boolean(character?.data?.inspiration) && canEditCharacter;
  if (!allowInspiration || !characterId) return null;
  return async () => {
    const latestCharacter = getState().characters.find((entry) => normalizeCharacterId(entry.id) === characterId) || character;
    const currentData = latestCharacter.data || {};
    if (!currentData.inspiration) return;
    await saveCharacterData(
      latestCharacter,
      { ...currentData, inspiration: false },
      'Ispirazione consumata',
      lastHomeContainer ? () => renderHome(lastHomeContainer) : null
    );
  };
}

async function handleConditionsAction(container) {
  const { activeCharacter, canEditCharacter } = getHomeContext();
  if (!activeCharacter || !canEditCharacter) return;
  const formData = await openConditionsModal(activeCharacter);
  if (!formData) return;
  const selected = formData.getAll('conditions');
  await saveCharacterData(activeCharacter, {
    ...activeCharacter.data,
    conditions: selected
  }, 'Condizioni aggiornate', () => {
    if (container) renderHome(container);
  });
}
async function handleWeaknessAction(container) {
  const { activeCharacter, canEditCharacter } = getHomeContext();
  if (!activeCharacter || !canEditCharacter) return;
  const formData = await openWeaknessModal(activeCharacter);
  if (!formData) return;
  const level = Math.max(0, Math.min(6, Number(formData.get('weakness_level')) || 0));
  await saveCharacterData(activeCharacter, {
    ...activeCharacter.data,
    hp: { ...(activeCharacter.data?.hp || {}), weak_points: level }
  }, 'Punti indebolimento aggiornati', () => {
    if (container) renderHome(container);
  });
}
function getRollAdjustmentData(character) {
  const adjustments = character?.data?.roll_adjustments || {};
  return {
    attack_rolls: adjustments.attack_rolls || {},
    saving_throws: adjustments.saving_throws || {},
    skills: adjustments.skills || {}
  };
}

function buildRollAdjustmentFields(character) {
  const adjustments = getRollAdjustmentData(character);
  const items = getState().cache.items || [];
  const form = document.createElement('div');
  form.className = 'modal-form-grid compact-settings-form compact-settings-form--rolls';
  const modeOptions = [
    { value: '', label: 'Nessuno' },
    { value: 'advantage', label: 'Vantaggio' },
    { value: 'disadvantage', label: 'Svantaggio' }
  ];
  const buildRows = (title, scope, entries) => {
    const section = document.createElement('section');
    section.className = 'character-edit-section compact-settings-section';
    section.innerHTML = `<h4>${title}</h4><p class="muted compact-settings-help">Indica solo gli override manuali; gli effetti automatici restano visibili sotto la riga.</p>`;
    const grid = document.createElement('div');
    grid.className = 'compact-setting-grid compact-setting-grid--roll';
    entries.forEach((entry) => {
      const current = adjustments[scope]?.[entry.key] || {};
      const automaticEffects = getAutomaticRollEffects(character, items, scope, entry);
      const automaticRollMode = resolveRollModeEffects(automaticEffects).rollMode || '';
      const automaticSource = automaticEffects.length === 1 ? (automaticEffects[0].source || '') : '';
      const selectedMode = current.mode || automaticRollMode;
      const selectedSource = current.source || automaticSource;
      const row = document.createElement('div');
      row.className = 'compact-setting-row compact-setting-row--roll';
      const modeField = document.createElement('label');
      modeField.className = 'field compact-setting-field';
      const modeLabel = document.createElement('span');
      modeLabel.textContent = entry.label;
      const modeSelect = buildSelect(modeOptions, selectedMode);
      modeSelect.name = `roll_${scope}_${entry.key}_mode`;
      modeField.append(modeLabel, modeSelect);
      const sourceField = document.createElement('label');
      sourceField.className = 'field compact-setting-field';
      const sourceLabel = document.createElement('span');
      sourceLabel.textContent = 'Fonte manuale';
      const sourceSelect = buildSelect(rollAdjustmentSourceOptions, selectedSource);
      sourceSelect.name = `roll_${scope}_${entry.key}_source`;
      sourceField.append(sourceLabel, sourceSelect);
      row.append(modeField, sourceField);
      if (automaticEffects.length) {
        const automaticList = document.createElement('p');
        automaticList.className = 'muted compact-setting-note';
        automaticList.textContent = `Automatico: ${automaticEffects.map((effect) => effect.reason).join(' ')}`;
        row.appendChild(automaticList);
      }
      grid.appendChild(row);
    });
    section.appendChild(grid);
    form.appendChild(section);
  };
  buildRows('Tiri per colpire', 'attack_rolls', getAttackRollAdjustmentEntries(character, items));
  buildRows('Tiri salvezza', 'saving_throws', savingThrowList);
  buildRows('Abilità', 'skills', skillList);
  return form;
}

function parseRollAdjustmentsForm(formData, character) {
  const items = getState().cache.items || [];
  const next = { attack_rolls: {}, saving_throws: {}, skills: {} };
  [
    { scope: 'attack_rolls', entries: getAttackRollAdjustmentEntries(character, items) },
    { scope: 'saving_throws', entries: savingThrowList },
    { scope: 'skills', entries: skillList }
  ].forEach(({ scope, entries }) => {
    entries.forEach((entry) => {
      const mode = formData.get(`roll_${scope}_${entry.key}_mode`)?.toString() || '';
      const source = formData.get(`roll_${scope}_${entry.key}_source`)?.toString().trim() || '';
      const automaticEffects = getAutomaticRollEffects(character, items, scope, entry);
      const automaticMode = resolveRollModeEffects(automaticEffects).rollMode || '';
      const automaticSource = automaticEffects.length === 1 ? (automaticEffects[0].source || '') : '';
      const matchesAutomatic = mode === automaticMode && source === automaticSource;
      if ((mode === 'advantage' || mode === 'disadvantage') && !matchesAutomatic) {
        next[scope][entry.key] = { mode, source };
      }
    });
  });
  return next;
}

async function handleRollAdjustmentsAction(container) {
  const { activeCharacter, canEditCharacter } = getHomeContext();
  if (!activeCharacter || !canEditCharacter) return;
  const formData = await openFormModal({
    title: 'Vantaggi / Svantaggi situazionali',
    submitLabel: 'Salva',
    content: buildRollAdjustmentFields(activeCharacter),
    cardClass: 'modal-card--wide'
  });
  if (!formData) return;
  await saveCharacterData(activeCharacter, {
    ...activeCharacter.data,
    roll_adjustments: parseRollAdjustmentsForm(formData, activeCharacter)
  }, 'Vantaggi/svantaggi aggiornati', () => {
    if (container) renderHome(container);
  });
}

function buildDamageDefenseFields(character) {
  const defenses = character?.data?.damage_defenses || {};
  const grouped = damageTypeList.reduce((groups, type) => {
    const group = type.group || 'Altro';
    if (!groups[group]) groups[group] = [];
    groups[group].push(type);
    return groups;
  }, {});
  const form = document.createElement('div');
  form.className = 'modal-form-grid compact-settings-form compact-settings-form--defenses';
  form.innerHTML = Object.entries(grouped).map(([group, types]) => `
    <section class="character-edit-section compact-settings-section">
      <h4>${group}</h4>
      <div class="compact-setting-grid compact-setting-grid--defense">
        ${types.map((type) => `
          <div class="compact-setting-row compact-setting-row--defense">
            <strong>${type.label}</strong>
            <div class="character-toggle-group">
              <label class="toggle-pill">
                <input type="checkbox" name="damage_resistance_${type.key}" ${(Array.isArray(defenses.resistances) && defenses.resistances.includes(type.key)) ? 'checked' : ''} />
                <span>Resistenza</span>
              </label>
              <label class="toggle-pill">
                <input type="checkbox" name="damage_immunity_${type.key}" ${(Array.isArray(defenses.immunities) && defenses.immunities.includes(type.key)) ? 'checked' : ''} />
                <span>Immunità</span>
              </label>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `).join('');
  return form;
}

function parseDamageDefensesForm(formData) {
  return {
    resistances: damageTypeList.filter((type) => formData.has(`damage_resistance_${type.key}`)).map((type) => type.key),
    immunities: damageTypeList.filter((type) => formData.has(`damage_immunity_${type.key}`)).map((type) => type.key)
  };
}

async function handleResistancesAction(container) {
  const { activeCharacter, canEditCharacter } = getHomeContext();
  if (!activeCharacter || !canEditCharacter) return;
  const formData = await openFormModal({
    title: 'Resistenze & Immunità',
    submitLabel: 'Salva',
    content: buildDamageDefenseFields(activeCharacter),
    cardClass: 'modal-card--wide'
  });
  if (!formData) return;
  await saveCharacterData(activeCharacter, {
    ...activeCharacter.data,
    damage_defenses: parseDamageDefensesForm(formData)
  }, 'Resistenze aggiornate', () => {
    if (container) renderHome(container);
  });
}

async function handleLootAction(container) {
  const { activeCharacter } = getHomeContext();
  const state = getState();
  if (!activeCharacter) return;
  if (state.offline) {
    createToast('Loot disponibile solo online.', 'error');
    return;
  }
  let manualItemCreated = false;
  let stopCatalogLoader = null;
  const selected = await openSharedItemPicker({
    title: 'Loot rapido',
    allowQuantities: true,
    headerActionLabel: 'Nuovo oggetto',
    onHeaderAction: async ({ present }) => {
      try {
        await openItemModal(activeCharacter, null, state.cache.items || [], () => { manualItemCreated = true; }, { present });
      } catch (error) {
        createToast('Errore loot', 'error');
      }
    },
    shortcutSize: true,
    onLoadingChange: (isLoading, context = {}) => {
      if (isLoading) {
        stopCatalogLoader = showShortcutLoader(context.fieldsEl || context.modal || container, 'Caricamento archivio oggetti');
      } else {
        stopCatalogLoader?.();
        stopCatalogLoader = null;
      }
    }
  });
  if (selected.length) {
    setGlobalLoading(true);
    try {
      await addSharedItemsToInventory(selected, activeCharacter);
      const totalQuantity = selected.reduce((total, item) => total + Math.max(1, Number(item.selected_quantity) || 1), 0);
      createToast(`${totalQuantity} ${totalQuantity === 1 ? 'unità aggiunta' : 'unità aggiunte'} al loot`, 'success');
      if (container) await renderHome(container);
    } catch (error) {
      createToast('Errore durante l’aggiunta del loot dall’archivio', 'error');
    } finally {
      setGlobalLoading(false);
    }
    return;
  }
  if (manualItemCreated && container) await renderHome(container);
}


async function handleMoneyAction(direction, container) {
  const { activeCharacter, canEditCharacter } = getHomeContext();
  if (!activeCharacter) return;
  if (!canEditCharacter) {
    createToast('Azioni denaro disponibili solo con profilo online', 'error');
    return;
  }
  const state = getState();
  let wallet = state.cache.wallet;
  if (!wallet && !state.offline) {
    try {
      wallet = await fetchWallet(activeCharacter.id);
      updateCache('wallet', wallet);
      if (wallet) {
        await cacheSnapshot({ wallet });
      }
    } catch (error) {
      createToast('Errore caricamento wallet', 'error');
    }
  }
  const title = direction === 'pay' ? 'Paga monete' : 'Ricevi monete';
  const submitLabel = direction === 'pay' ? 'Paga' : 'Ricevi';
  const formData = await openFormModal({
    title,
    submitLabel,
    cardClass: 'modal-card--quick-action',
    content: moneyBundleFields({ direction, wallet, showDate: false }),
    onOpen: ({ fieldsEl }) => {
      bindMoneyReasonPicker(fieldsEl);
      fieldsEl?.querySelectorAll('.money-bundle__coin input[type="number"]').forEach((input) => {
        attachModalValueStepper(input, { min: 0, max: input.max === '' ? null : Number(input.max) });
      });
    }
  });
  if (!formData) return;
  if (!wallet) {
    wallet = {
      user_id: activeCharacter.user_id,
      character_id: activeCharacter.id,
      cp: 0,
      sp: 0,
      gp: 0,
      pp: 0
    };
  }
  let signedDelta;
  try {
    signedDelta = buildCoinBundleMovement(wallet, {
      pp: formData.get('amount_pp'), gp: formData.get('amount_gp'),
      sp: formData.get('amount_sp'), cp: formData.get('amount_cp')
    }, direction);
  } catch (error) {
    createToast(error.message, 'error');
    return;
  }
  try {
    const saved = await createTransaction({
      user_id: wallet.user_id,
      character_id: wallet.character_id,
      direction,
      amount: signedDelta,
      reason: formData.get('reason'),
      occurred_on: formData.get('occurred_on')
    });
    updateCache('wallet', saved);
    await cacheSnapshot({ wallet: saved });
    createToast('Wallet aggiornato');
    if (container) {
      renderHome(container);
    }
  } catch (error) {
    createToast('Errore aggiornamento denaro', 'error');
  }
}

const conditionLabels = conditionList.reduce((acc, condition) => {
  acc[condition.key] = condition.label;
  return acc;
}, {});

const attackRollEffects = {
  advantage: ['invisibile'],
  disadvantage: ['accecato', 'avvelenato', 'intralciato', 'prono', 'spaventato']
};

const savingThrowEffects = {
  disadvantage: {
    dex: ['intralciato']
  },
  autoFail: {
    str: ['paralizzato', 'privo_di_sensi', 'stordito'],
    dex: ['paralizzato', 'privo_di_sensi', 'stordito']
  }
};

const rollAdjustmentSourceOptions = [
  { value: '', label: 'Seleziona fonte' },
  { value: 'situational', label: 'Situazionale' },
  { value: 'effect', label: 'Effetto temporaneo' },
  { value: 'condition', label: 'Condizione' },
  { value: 'armor', label: 'Armatura' },
  { value: 'racial', label: 'Abilità razziale' },
  { value: 'class', label: 'Privilegio di classe' },
  { value: 'spell', label: 'Incantesimo' },
  { value: 'item', label: 'Oggetto magico/equipaggiamento' },
  { value: 'other', label: 'Altro' }
];


function getConditionState(character) {
  const data = character?.data || {};
  if (Array.isArray(data.conditions)) return data.conditions;
  if (data.condition) return [data.condition];
  return [];
}

function formatConditionList(keys) {
  return keys
    .map((key) => conditionLabels[key] || key)
    .filter(Boolean);
}

function hasEquippedHeavyArmor(items = []) {
  return (items || []).some((item) => item.category === 'armor'
    && item.armor_type === 'heavy'
    && item.equipable
    && getEquipSlots(item).length);
}

function hasEquippedStealthDisadvantage(items = []) {
  return (items || []).some((item) => item.category === 'armor'
    && (item.stealth_disadvantage ?? item.armor_type === 'heavy')
    && item.equipable
    && getEquipSlots(item).length);
}

function getAttackRollAdjustmentEntries(character, items = []) {
  const data = character?.data || {};
  const equippedWeapons = (items || []).filter((item) => item.category === 'weapon' && item.equipable && getEquipSlots(item).length);
  const weaponEntries = equippedWeapons.map((weapon) => ({
    key: `weapon:${weapon.id ?? weapon.name}`,
    label: weapon.name || 'Arma'
  }));
  const spells = Array.isArray(data.spells) ? data.spells : [];
  const spellEntries = spells
    .filter((spell) => {
      const isCantrip = spell.kind === 'cantrip' || Number(spell.level) === 0;
      return isCantrip && spell.attack_roll && spell.damage_die;
    })
    .map((spell) => ({
      key: `spell:${spell.id}`,
      label: spell.name || 'Incantesimo'
    }));
  const spellcasting = data.spellcasting || {};
  const hasSpellAttack = Boolean(spellcasting.ability && normalizeNumber(data.proficiency_bonus) !== null);
  const genericSpellEntry = hasSpellAttack
    ? [{ key: 'spell-attack', label: 'Incantesimi' }]
    : [];
  return [...weaponEntries, ...spellEntries, ...genericSpellEntry];
}

function getAutomaticAttackRollEffects(character) {
  const conditionState = getConditionState(character);
  const advantageKeys = attackRollEffects.advantage.filter((key) => conditionState.includes(key));
  const disadvantageKeys = attackRollEffects.disadvantage.filter((key) => conditionState.includes(key));
  const effects = [];
  if (advantageKeys.length) {
    effects.push({ mode: 'advantage', source: 'condition', reason: `Vantaggio: condizioni ${formatConditionList(advantageKeys).join(', ')}.` });
  }
  if (disadvantageKeys.length) {
    effects.push({ mode: 'disadvantage', source: 'condition', reason: `Svantaggio: condizioni ${formatConditionList(disadvantageKeys).join(', ')}.` });
  }
  return effects;
}

function getAutomaticSkillRollEffects(character, items, skill) {
  const conditionState = getConditionState(character);
  const poisonedConditions = conditionState.includes('avvelenato') ? ['avvelenato'] : [];
  const hasStealthDisadvantage = hasEquippedStealthDisadvantage(items);
  const effects = [];
  if (poisonedConditions.length) {
    effects.push({ mode: 'disadvantage', source: 'condition', reason: `Svantaggio: condizioni ${formatConditionList(poisonedConditions).join(', ')}.` });
  }
  if (skill.key === 'stealth' && hasStealthDisadvantage) {
    effects.push({ mode: 'disadvantage', source: 'armor', reason: 'Svantaggio automatico: l’armatura equipaggiata penalizza le prove di Furtività.' });
  }
  return effects;
}

function isInitiativeSpecialSkill(skill) {
  const id = String(skill?.id ?? '').toLowerCase();
  const name = String(skill?.name ?? '').trim().toLowerCase();
  return id === 'initiative' || id === 'default_initiative' || name === 'iniziativa';
}

function getAutomaticSpecialSkillRollEffects(character, items, abilityKey, skill = null) {
  const conditionState = getConditionState(character);
  const poisonedConditions = conditionState.includes('avvelenato') ? ['avvelenato'] : [];
  const hasHeavyArmor = hasEquippedHeavyArmor(items);
  const effects = [];
  if (poisonedConditions.length) {
    effects.push({ mode: 'disadvantage', source: 'condition', reason: `Svantaggio: condizioni ${formatConditionList(poisonedConditions).join(', ')}.` });
  }
  if (abilityKey === 'dex' && hasHeavyArmor && !isInitiativeSpecialSkill(skill)) {
    effects.push({ mode: 'disadvantage', source: 'armor', reason: 'Svantaggio automatico: armatura pesante su tiri speciali basati su DES.' });
  }
  return effects;
}

function getAutomaticSavingThrowRollEffects(character, save) {
  const effects = getSavingThrowEffects(getConditionState(character), save.key);
  if (!effects.rollMode) return [];
  return [{ mode: effects.rollMode, source: 'condition', reason: effects.rollModeReason }];
}

function getAutomaticRollEffects(character, items, scope, entry) {
  if (scope === 'attack_rolls') return getAutomaticAttackRollEffects(character, entry);
  if (scope === 'skills') return getAutomaticSkillRollEffects(character, items, entry);
  if (scope === 'saving_throws') return getAutomaticSavingThrowRollEffects(character, entry);
  return [];
}

function getRollAdjustmentSourceLabel(source) {
  return rollAdjustmentSourceOptions.find((option) => option.value === source)?.label || source;
}

function getManualRollAdjustment(character, scope, key, label) {
  const entry = character?.data?.roll_adjustments?.[scope]?.[key];
  if (!entry || (entry.mode !== 'advantage' && entry.mode !== 'disadvantage')) return null;
  const modeLabel = entry.mode === 'advantage' ? 'Vantaggio' : 'Svantaggio';
  const source = entry.source?.toString().trim();
  const sourceLabel = source ? getRollAdjustmentSourceLabel(source) : 'Situazionale';
  return {
    mode: entry.mode,
    reason: `${modeLabel}: ${label} (${sourceLabel}).`
  };
}

function resolveRollModeEffects(effects) {
  const validEffects = effects.filter(Boolean);
  const advantageReasons = validEffects.filter((effect) => effect.mode === 'advantage').map((effect) => effect.reason).filter(Boolean);
  const disadvantageReasons = validEffects.filter((effect) => effect.mode === 'disadvantage').map((effect) => effect.reason).filter(Boolean);
  if (advantageReasons.length && disadvantageReasons.length) {
    return {
      rollMode: null,
      rollModeReason: `Vantaggio e svantaggio si annullano. ${[...advantageReasons, ...disadvantageReasons].join(' ')}`
    };
  }
  if (advantageReasons.length) {
    return { rollMode: 'advantage', rollModeReason: advantageReasons.join(' ') };
  }
  if (disadvantageReasons.length) {
    return { rollMode: 'disadvantage', rollModeReason: disadvantageReasons.join(' ') };
  }
  return { rollMode: null, rollModeReason: null };
}

function getSavingThrowEffects(conditionState, saveKey) {
  const autoFailKeys = savingThrowEffects.autoFail[saveKey] || [];
  const autoFailConditions = autoFailKeys.filter((key) => conditionState.includes(key));
  if (autoFailConditions.length) {
    return {
      disabled: true,
      disabledReason: `Condizioni: ${formatConditionList(autoFailConditions).join(', ')}`
    };
  }
  const disadvantageKeys = savingThrowEffects.disadvantage[saveKey] || [];
  const disadvantageConditions = disadvantageKeys.filter((key) => conditionState.includes(key));
  if (disadvantageConditions.length) {
    return {
      rollMode: 'disadvantage',
      rollModeReason: `Svantaggio: condizioni ${formatConditionList(disadvantageConditions).join(', ')}.`
    };
  }
  return {};
}

function buildSkillRollOptions(character, items = []) {
  const data = character.data || {};
  const abilities = data.abilities || {};
  const proficiencyBonus = normalizeNumber(data.proficiency_bonus);
  const skillStates = data.skills || {};
  const skillMasteryStates = data.skill_mastery || {};
  const generalBonus = Number(data.skill_check_bonus) || 0;
  return skillList.map((skill) => {
    const proficient = Boolean(skillStates[skill.key]);
    const mastery = Boolean(skillMasteryStates[skill.key]);
    const baseTotal = calculateSkillModifier(abilities[skill.ability], proficiencyBonus, proficient ? (mastery ? 2 : 1) : 0);
    const total = baseTotal === null ? null : baseTotal + generalBonus;
    const modifierValue = total ?? 0;
    const rollEffects = getAutomaticSkillRollEffects(character, items, skill);
    rollEffects.push(getManualRollAdjustment(character, 'skills', skill.key, skill.label));
    const rollMode = resolveRollModeEffects(rollEffects);
    return {
      value: skill.key,
      label: `${skill.label} (${formatSigned(total)})`,
      shortLabel: skill.label,
      modifier: modifierValue,
      rollMode: rollMode.rollMode,
      rollModeReason: rollMode.rollModeReason
    };
  });
}

function buildAbilityRollOptions(character, items = []) {
  const data = character.data || {};
  const abilities = data.abilities || {};
  const generalBonus = Number(data.skill_check_bonus) || 0;
  return savingThrowList.map((ability) => {
    const modifier = getAbilityModifier(abilities[ability.key]) ?? 0;
    const total = modifier + generalBonus;
    const effects = getAutomaticSpecialSkillRollEffects(character, items, ability.key, {
      id: `ability_${ability.key}`,
      name: ability.label,
      ability: ability.key
    });
    const rollMode = resolveRollModeEffects(effects);
    return {
      value: ability.key,
      label: `${ability.label} (${formatSigned(total)})`,
      shortLabel: ability.label,
      modifier: total,
      rollMode: rollMode.rollMode,
      rollModeReason: rollMode.rollModeReason
    };
  });
}

function buildSpecialSkillRollOptions(character, items = []) {
  const data = character.data || {};
  const abilities = data.abilities || {};
  const proficiencyBonus = normalizeNumber(data.proficiency_bonus);
  const generalBonus = Number(data.skill_check_bonus) || 0;
  const configuredSpecialSkills = Array.isArray(data.special_skill_rolls) ? data.special_skill_rolls : [];
  const hasInitiative = configuredSpecialSkills.some((skill) => {
    const id = String(skill?.id ?? '').toLowerCase();
    const name = String(skill?.name ?? '').trim().toLowerCase();
    return id === 'initiative' || id === 'default_initiative' || name === 'iniziativa';
  });
  const specialSkills = hasInitiative
    ? configuredSpecialSkills
    : [{ id: 'default_initiative', name: 'Iniziativa', ability: 'dex', proficient: false, mastery: false, bonus: 0 }, ...configuredSpecialSkills];

  return specialSkills.map((skill, index) => {
    const abilityKey = abilityShortLabel[skill.ability] ? skill.ability : 'str';
    const proficient = Boolean(skill.proficient);
    const mastery = Boolean(skill.mastery) && proficient;
    const baseTotal = calculateSkillModifier(abilities[abilityKey], proficiencyBonus, proficient ? (mastery ? 2 : 1) : 0);
    const extraBonus = Number(skill.bonus) || 0;
    const total = (baseTotal ?? 0) + extraBonus + generalBonus;
    const name = skill.name?.trim() || `Tiro speciale ${index + 1}`;
    const rollEffects = getAutomaticSpecialSkillRollEffects(character, items, abilityKey, skill);
    const rollMode = resolveRollModeEffects(rollEffects);
    return {
      value: String(skill.id ?? index),
      label: `${name} (${formatSigned(total)})`,
      shortLabel: name,
      modifier: total,
      rollMode: rollMode.rollMode,
      rollModeReason: rollMode.rollModeReason
    };
  });
}

function buildSavingThrowRollOptions(character) {
  const data = character.data || {};
  const abilities = data.abilities || {};
  const proficiencyBonus = normalizeNumber(data.proficiency_bonus);
  const savingStates = data.saving_throws || {};
  const generalBonus = Number(data.saving_throw_bonus) || 0;
  const conditionState = getConditionState(character);
  return savingThrowList.map((save) => {
    const proficient = Boolean(savingStates[save.key]);
    const baseTotal = calculateSkillModifier(abilities[save.key], proficiencyBonus, proficient ? 1 : 0);
    const total = baseTotal === null ? null : baseTotal + generalBonus;
    const modifierValue = total ?? 0;
    const effects = getSavingThrowEffects(conditionState, save.key);
    const manualEffect = getManualRollAdjustment(character, 'saving_throws', save.key, save.label);
    const rollMode = effects.disabled
      ? { rollMode: null, rollModeReason: null }
      : resolveRollModeEffects([
        ...getAutomaticSavingThrowRollEffects(character, save),
        manualEffect
      ]);
    const autoFailLabel = effects.disabled ? ' · fallimento diretto' : '';
    return {
      value: save.key,
      label: `${save.label} (${formatSigned(total)})${autoFailLabel}`,
      shortLabel: abilityShortLabel[save.key] || save.label,
      modifier: modifierValue,
      rollMode: rollMode.rollMode,
      rollModeReason: rollMode.rollModeReason,
      disabled: effects.disabled || false,
      disabledReason: effects.disabledReason || null
    };
  });
}

function buildAttackRollOptions(character, items = [], companions = []) {
  const data = character.data || {};
  const attackBonusMelee = Number(data.attack_bonus_melee ?? data.attack_bonus) || 0;
  const attackBonusRanged = Number(data.attack_bonus_ranged ?? data.attack_bonus) || 0;
  const equippedWeapons = (items || []).filter((item) => item.category === 'weapon' && item.equipable && getEquipSlots(item).length);
  const proficiencyBonus = normalizeNumber(data.proficiency_bonus) ?? 0;
  const proficiencies = data.proficiencies || {};
  const automaticAttackEffects = getAutomaticAttackRollEffects(character);
  const options = equippedWeapons.map((weapon) => {
    const weaponRange = weapon.weapon_range || (weapon.range_normal ? 'ranged' : 'melee');
    const attackAbility = weapon.attack_ability || (weaponRange === 'ranged' ? 'dex' : 'str');
    const abilityMod = getAbilityModifier(data.abilities?.[attackAbility]) ?? 0;
    const proficient = weapon.weapon_type === 'simple'
      ? Boolean(proficiencies.weapon_simple)
      : weapon.weapon_type === 'martial'
        ? Boolean(proficiencies.weapon_martial)
        : false;
    const weaponProficiencyBonus = proficient ? proficiencyBonus : 0;
    const attackBonus = weaponRange === 'ranged' ? attackBonusRanged : attackBonusMelee;
    const modes = getWeaponDamageModes(weapon);
    const selectedMode = modes.find((mode) => mode.id === weapon.selected_damage_mode) || modes[0];
    const attackTotal = abilityMod + weaponProficiencyBonus + (Number(selectedMode?.attackModifier) || 0) + attackBonus;
    const value = `weapon:${weapon.id ?? weapon.name}`;
    const rollMode = resolveRollModeEffects([
      ...automaticAttackEffects,
      getManualRollAdjustment(character, 'attack_rolls', value, weapon.name)
    ]);
    return {
      value,
      label: `${weapon.name} (${formatSigned(attackTotal)})`,
      shortLabel: weapon.name,
      modifier: attackTotal,
      rollMode: rollMode.rollMode,
      rollModeReason: rollMode.rollModeReason
    };
  });

  const unarmedAttacks = Array.isArray(data.unarmed_attacks) ? data.unarmed_attacks : [];
  unarmedAttacks.forEach((attack, index) => {
    const value = `unarmed:${index}`;
    const name = attack.name || `Colpo senz’arma ${index + 1}`;
    const attackStats = calculateUnarmedAttackBonuses(data, attack);
    const rollMode = resolveRollModeEffects([
      ...automaticAttackEffects,
      getManualRollAdjustment(character, 'attack_rolls', value, name)
    ]);
    options.push({
      value,
      label: `${name} (${formatSigned(attackStats.attackTotal)})`,
      shortLabel: name,
      modifier: attackStats.attackTotal,
      rollMode: rollMode.rollMode,
      rollModeReason: rollMode.rollModeReason
    });
  });

  const activeWildShape = getActiveWildShapeDetails(character, companions);
  if (activeWildShape?.statBlock.attacks.length) {
    activeWildShape.statBlock.attacks.forEach((attack, index) => {
      const value = `wildshape:${index}`;
      const rollMode = resolveRollModeEffects([
        ...automaticAttackEffects,
        getManualRollAdjustment(character, 'attack_rolls', value, attack.name || `Attacco ${index + 1}`)
      ]);
      options.push({
        value,
        label: `${attack.name || `Attacco ${index + 1}`} (${formatSigned(attack.to_hit || 0)})`,
        shortLabel: attack.name || `Attacco ${index + 1}`,
        modifier: Number(attack.to_hit) || 0,
        rollMode: rollMode.rollMode,
        rollModeReason: rollMode.rollModeReason
      });
    });
  }

  const spellcasting = data.spellcasting || {};
  const spellAbilityKey = spellcasting.ability;
  const spellAbilityScore = spellAbilityKey ? data.abilities?.[spellAbilityKey] : null;
  const spellAbilityMod = getAbilityModifier(spellAbilityScore);
  const spellAttackBonus = spellAbilityMod === null || proficiencyBonus === null
    ? null
    : spellAbilityMod + proficiencyBonus;
  const spells = Array.isArray(data.spells) ? data.spells : [];
  const cantripAttacks = spells.filter((spell) => {
    const isCantrip = spell.kind === 'cantrip' || Number(spell.level) === 0;
    return isCantrip && spell.attack_roll;
  });
  if (spellAbilityKey && spellAttackBonus !== null) {
    cantripAttacks.forEach((spell) => {
      const value = `spell:${spell.id}`;
      const rollMode = resolveRollModeEffects([
        ...automaticAttackEffects,
        getManualRollAdjustment(character, 'attack_rolls', value, spell.name)
      ]);
      options.push({
        value,
        label: `${spell.name} (${formatSigned(spellAttackBonus)})`,
        shortLabel: spell.name,
        modifier: spellAttackBonus,
        rollMode: rollMode.rollMode,
        rollModeReason: rollMode.rollModeReason
      });
    });
  }

  return options;
}

function buildSpellAttackRollOptions(character) {
  const data = character.data || {};
  const proficiencyBonus = normalizeNumber(data.proficiency_bonus);
  const spellcasting = data.spellcasting || {};
  const spellAbilityKey = spellcasting.ability;
  const spellAbilityScore = spellAbilityKey ? data.abilities?.[spellAbilityKey] : null;
  const spellAbilityMod = getAbilityModifier(spellAbilityScore);
  if (!spellAbilityKey || spellAbilityMod === null || proficiencyBonus === null) {
    return [];
  }
  const attackBonus = spellAbilityMod + proficiencyBonus;
  const value = 'spell-attack';
  const rollMode = resolveRollModeEffects([
    ...getAutomaticAttackRollEffects(character),
    getManualRollAdjustment(character, 'attack_rolls', value, 'Incantesimi')
  ]);
  return [{
    value,
    label: `Incantesimi (${formatSigned(attackBonus)})`,
    shortLabel: 'Incantesimi',
    modifier: attackBonus,
    rollMode: rollMode.rollMode,
    rollModeReason: rollMode.rollModeReason
  }];
}


function getDamageTypeLabel(typeKey) {
  return damageTypeList.find((type) => type.key === typeKey)?.label || typeKey;
}

function calculateEffectiveDamage(character, rawAmount, damageType) {
  const amount = Math.max(Number(rawAmount) || 0, 0);
  if (!damageType) {
    return { amount, reason: null };
  }
  const defenses = character?.data?.damage_defenses || {};
  const resistances = Array.isArray(defenses.resistances) ? defenses.resistances : [];
  const immunities = Array.isArray(defenses.immunities) ? defenses.immunities : [];
  if (immunities.includes('all') || immunities.includes(damageType)) {
    return { amount: 0, reason: `immunità a ${getDamageTypeLabel(damageType)}` };
  }
  if (resistances.includes('all') || resistances.includes(damageType)) {
    return { amount: Math.floor(amount / 2), reason: `resistenza a ${getDamageTypeLabel(damageType)}` };
  }
  return { amount, reason: null };
}

function findAmmunitionForWeapon(items, weapon) {
  if (!weapon?.consumes_ammunition) return null;
  const requiredType = weapon.required_ammunition_type || weapon.ammunition_type;
  return (items || [])
    .filter((item) => item.id !== weapon.id)
    .filter((item) => item.category !== 'container')
    .filter((item) => !requiredType || item.ammunition_type === requiredType)
    .filter((item) => Number(item.qty) > 0)
    .sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'it', { sensitivity: 'base' }))[0] || null;
}

function buildAmmunitionWarning(weapon, ammunition) {
  if (!ammunition) return null;
  const ammunitionName = ammunition.name
    || ammunitionTypeLabels.get(weapon.required_ammunition_type || weapon.ammunition_type)
    || 'munizione';
  const availableQty = Number(ammunition.qty) || 0;
  if (availableQty <= 0) return `Munizioni esaurite: ${ammunitionName}.`;
  return `Questo tiro consumerà 1 munizione: ${ammunitionName} (${availableQty} disponibili).`;
}

async function consumeWeaponAmmunition(items, weapon) {
  const ammunition = findAmmunitionForWeapon(items, weapon);
  if (!ammunition) return null;
  const nextQty = Math.max((Number(ammunition.qty) || 0) - 1, 0);
  const saved = await updateItem(ammunition.id, { qty: nextQty });
  const cachedItems = getState().cache.items || [];
  const updatedAmmunition = { ...ammunition, ...(saved || {}), qty: nextQty };
  const nextItems = cachedItems.map((entry) => String(entry.id) === String(ammunition.id)
    ? { ...entry, ...updatedAmmunition }
    : entry);
  updateCache('items', nextItems);
  await cacheSnapshot({ items: nextItems });
  createToast(`${ammunition.name} consumato (${nextQty} rimasti)`, 'warning');
  if (lastHomeContainer) {
    void renderHome(lastHomeContainer);
  }
  return { ammunition: updatedAmmunition, nextQty };
}

function openPresetAttackRoll(attackKey, range) {
  const { activeCharacter, sheetCharacter, canEditCharacter, companions } = getHomeContext();
  if (!activeCharacter || !attackKey) return;
  const items = getState().cache.items || [];
  const rollItems = range ? items.map(item => 'weapon:' + (item.id ?? item.name) === attackKey ? weaponForAttackRange(item, range) : item) : items;
  const options = buildAttackRollOptions(sheetCharacter || activeCharacter, rollItems, companions);
  const selected = options.find((entry) => entry.value === attackKey);
  if (!selected) return;
  const weaponId = attackKey.startsWith('weapon:') ? attackKey.replace('weapon:', '') : null;
  const weapon = weaponId ? items.find((entry) => String(entry.id) === weaponId || entry.name === weaponId) : null;
  const ammunition = weapon?.consumes_ammunition ? findAmmunitionForWeapon(items, weapon) : null;
  if (weapon?.consumes_ammunition && !ammunition) {
    createToast('Munizioni esaurite o non disponibili per questa arma.', 'error');
    return;
  }
  const ammunitionWarning = buildAmmunitionWarning(weapon, ammunition);
  let ammunitionConsumptionQueue = Promise.resolve();
  openDiceRollerModal({
    title: `Tiro per Colpire • ${selected.shortLabel || selected.label}`,
    mode: 'd20',
    rollType: 'TC',
    selection: {
      label: 'Attacco',
      options,
      value: selected.value
    },
    allowInspiration: Boolean(activeCharacter?.data?.inspiration) && canEditCharacter,
    weakPoints: Number(activeCharacter?.data?.hp?.weak_points) || 0,
    characterId: activeCharacter.id,
    historyLabel: selected.shortLabel || selected.label,
    warning: ammunitionWarning,
    onRollComplete: () => {
      if (!weapon?.consumes_ammunition) return;
      ammunitionConsumptionQueue = ammunitionConsumptionQueue
        .then(async () => {
          const consumed = await consumeWeaponAmmunition(getState().cache.items || items, weapon);
          if (!consumed) {
            createToast('Munizioni esaurite o non disponibili per questa arma.', 'error');
            updateDiceOverlayWarning('Munizioni esaurite o non disponibili per questa arma.');
            return;
          }
          updateDiceOverlayWarning(buildAmmunitionWarning(weapon, consumed.ammunition));
        })
        .catch(() => createToast('Errore consumo munizioni', 'error'));
    }
  });
}

function handleDiceAction(type) {
  const { activeCharacter, sheetCharacter, companions, canEditCharacter } = getHomeContext();
  const items = getState().cache.items || [];
  const allowInspiration = Boolean(activeCharacter?.data?.inspiration) && canEditCharacter;
  const weakPoints = Number(activeCharacter?.data?.hp?.weak_points) || 0;
  const onConsumeInspiration = getConsumeInspirationHandler(activeCharacter, canEditCharacter);
  const configs = {
    'saving-throws': {
      title: 'Tiro Salvezza',
      mode: 'd20',
      rollType: 'TS',
      selection: activeCharacter
        ? { label: 'Tiro salvezza', options: buildSavingThrowRollOptions(sheetCharacter || activeCharacter) }
        : null
    },
    skills: {
      title: 'Tiro Abilità',
      mode: 'd20',
      rollType: 'TA',
      selection: activeCharacter
        ? { label: 'Abilità', options: buildSkillRollOptions(sheetCharacter || activeCharacter, items) }
        : null
    },
    'special-skills': {
      title: 'Tiro Abilità Speciale',
      mode: 'd20',
      rollType: 'TA',
      selection: activeCharacter
        ? { label: 'Abilità speciale', options: buildSpecialSkillRollOptions(sheetCharacter || activeCharacter, items) }
        : null
    },
    'attack-roll': {
      title: 'Tiro per Colpire',
      mode: 'd20',
      rollType: 'TC',
      selection: activeCharacter
        ? { label: 'Attacco', options: buildAttackRollOptions(sheetCharacter || activeCharacter, items, companions) }
        : null
    },
    'spell-attack': {
      title: 'Tiro per Colpire Incantesimi',
      mode: 'd20',
      rollType: 'TC',
      selection: activeCharacter
        ? { label: 'Incantesimi', options: buildSpellAttackRollOptions(activeCharacter) }
        : null
    },
    roller: { title: 'Lancia Dadi Generico', mode: 'generic', rollType: 'GEN' }
  };
  const config = configs[type] ?? { title: 'Lancia dadi', mode: 'generic' };
  if (type === 'spell-attack' && (!config.selection?.options?.length)) {
    createToast('Configura abilità da incantatore e bonus competenza per usare questo tiro.', 'error');
    return;
  }
  openDiceRollerModal({
    ...config,
    allowInspiration,
    onConsumeInspiration,
    weakPoints,
    characterId: activeCharacter?.id
  });
}


async function openLongRestWeaponMasteryModal(character, items = [], container = null) {
  const currentMasteries = Array.isArray(character?.data?.weapon_masteries) ? character.data.weapon_masteries : [];
  const canUseWeaponMasteries = Boolean(character?.data?.weapon_mastery_enabled) || currentMasteries.length > 0;
  if (!canUseWeaponMasteries) return;
  const availableMasteryKeys = [...new Set((items || [])
    .filter((item) => item.category === 'weapon' && item.weapon_mastery)
    .map((item) => item.weapon_mastery))];
  if (!availableMasteryKeys.length) return;
  const content = document.createElement('div');
  content.className = 'drawer-form modal-form-grid';
  content.innerHTML = `
    <p class="muted">A fine riposo lungo puoi riconfigurare le maestrie tra quelle disponibili sulle armi nel tuo inventario.</p>
    <div class="weapon-mastery-list">
      ${availableMasteryKeys.map((key) => `
        <label class="toggle-pill weapon-mastery-card">
          <input type="checkbox" name="rest_weapon_mastery_${key}" ${currentMasteries.includes(key) ? 'checked' : ''} />
          <span class="weapon-mastery-card__body">
            <strong>${getWeaponMasteryLabel(key)}</strong>
            <small>${getWeaponMasterySummary(key)}</small>
          </span>
        </label>
      `).join('')}
    </div>
  `;
  const formData = await openFormModal({
    title: 'Maestrie armi dopo riposo lungo',
    submitLabel: 'Salva maestrie',
    content,
    cardClass: ['modal-card--wide', 'modal-card--scrollable']
  });
  if (!formData) return;
  const nextMasteries = availableMasteryKeys.filter((key) => formData.has(`rest_weapon_mastery_${key}`));
  const nextData = {
    ...(character.data || {}),
    weapon_masteries: nextMasteries
  };
  await saveCharacterData(character, nextData, null, container ? () => renderHome(container) : null);
}

async function handleRestAction(resetOn, container) {
  const { activeCharacter } = getHomeContext();
  if (!activeCharacter) return;
  const shouldRest = await openConfirmModal({
    title: 'Conferma riposo',
    message: resetOn === 'long_rest'
      ? 'Stai per effettuare un riposo lungo: risorse, slot e recuperi verranno aggiornati in base alle regole configurate.'
      : 'Stai per effettuare un riposo breve: verranno aggiornate solo le risorse che si recuperano con questo tipo di riposo.',
    confirmLabel: 'Conferma riposo'
  });
  if (!shouldRest) return;
  try {
    await updateResourcesReset(activeCharacter.id, resetOn);
    const toastLabel = resetOn === 'long_rest' ? 'Riposo lungo completato' : 'Riposo breve completato';
    createToast(toastLabel);
    const refreshed = await fetchResources(activeCharacter.id);
    updateCache('resources', refreshed);
    await cacheSnapshot({ resources: refreshed });
    const nextData = applyRestRecovery(activeCharacter.data, resetOn);
    if (nextData) {
      await saveCharacterData(activeCharacter, nextData, null, container ? () => renderHome(container) : null);
    } else if (container) {
      renderHome(container);
    }
    if (resetOn === 'long_rest') {
      const refreshed = getState().characters.find((char) => char.id === activeCharacter.id);
      const restItems = getState().cache.items || [];
      if (refreshed) {
        await openLongRestWeaponMasteryModal(refreshed, restItems, container);
      }
      const afterMastery = getState().characters.find((char) => char.id === activeCharacter.id) || refreshed;
      if (afterMastery?.data?.spellcasting?.can_prepare) {
        const spellShortcut = container?.querySelector("dialog.sheet-detail[data-sheet-panel='Lancia incantesimi']");
        if (spellShortcut?.isConnected && !spellShortcut.open && typeof spellShortcut.showModal === 'function') {
          spellShortcut.showModal();
        }
        await openPreparedSpellsModal(afterMastery, container ? () => renderHome(container) : null);
      }
    }
  } catch (error) {
    createToast('Errore aggiornamento risorse', 'error');
  }
}


async function handleHitDiceHeal(activeCharacter, container) {
  const { canEditCharacter } = getHomeContext();
  if (!activeCharacter) return;
  if (!canEditCharacter) {
    createToast('Azioni HP disponibili solo con profilo online', 'error');
    return;
  }

  const hitDice = activeCharacter.data?.hit_dice || {};
  const hitDiceUsed = Number(hitDice.used) || 0;
  const hitDiceMax = Number(hitDice.max) || 0;
  const remaining = Math.max(hitDiceMax - hitDiceUsed, 0);
  const hitDiceSides = getHitDiceSides(hitDice.die);
  if (!hitDiceSides) {
    createToast('Configura un dado vita valido', 'error');
    return;
  }
  if (remaining <= 0) {
    createToast('Nessun dado vita disponibile', 'error');
    return;
  }

  const conMod = getAbilityModifier(activeCharacter.data?.abilities?.con) ?? 0;
  let rolledDiceCount = 1;
  const rollSession = openDiceOverlay({
    keepOpen: false,
    title: `Dado vita • ${hitDice.die || `d${hitDiceSides}`}`,
    mode: 'generic',
    notation: `1d${hitDiceSides}`,
    modifier: conMod,
    rollType: 'GEN',
    characterId: activeCharacter.id,
    historyLabel: 'Dado vita',
    genericDiceMax: remaining,
    warning: 'Attenzione: ogni dado vita lanciato verrà sottratto ai dadi vita disponibili.',
    onRollComplete: ({ diceCount }) => {
      rolledDiceCount = Math.max(Number(diceCount) || 1, 1);
    }
  });
  const amount = await rollSession.waitForRoll;
  if (!amount || amount <= 0) return;
  if (rolledDiceCount > remaining) {
    createToast(`Hai solo ${remaining} dadi vita disponibili`, 'error');
    return;
  }

  const currentHp = Number(activeCharacter.data?.hp?.current) || 0;
  const maxHp = activeCharacter.data?.hp?.max;
  const nextCurrent = currentHp + Number(amount);
  const adjusted = maxHp !== null && maxHp !== undefined
    ? Math.min(nextCurrent, Number(maxHp))
    : nextCurrent;

  await saveCharacterData(activeCharacter, {
    ...activeCharacter.data,
    hp: {
      ...activeCharacter.data?.hp,
      current: adjusted
    },
    hit_dice: {
      ...hitDice,
      used: Math.min(hitDiceUsed + rolledDiceCount, hitDiceMax)
    }
  }, `PF curati +${amount} (${rolledDiceCount}d${hitDiceSides})`, () => {
    if (container) renderHome(container);
  });
}

async function handleHpAction(action, container) {
  const { activeCharacter, companions, canEditCharacter } = getHomeContext();
  if (!activeCharacter) return;
  if (!canEditCharacter) {
    createToast('Azioni HP disponibili solo con profilo online', 'error');
    return;
  }
  const title = action === 'heal' ? 'Cura PF' : 'Subisci danno';
  const submitLabel = action === 'heal' ? 'Cura' : 'Danno';
  const formData = await openFormModal({
    title,
    submitLabel,
    cardClass: ['modal-card--quick-action', 'modal-card--hp-action'],
    content: buildHpActionFields(activeCharacter, action)
  });
  if (!formData) return;
  const useHitDice = formData.has('use_hit_dice');
  const useTempHp = formData.get('healing_target') === 'temp';
  const hitDice = activeCharacter.data?.hit_dice || {};
  const abilities = activeCharacter.data?.abilities || {};
  const hitDiceUsed = Number(hitDice.used) || 0;
  const hitDiceMax = Number(hitDice.max) || 0;
  const hitDiceSides = getHitDiceSides(hitDice.die);
  const diceCount = Math.max(Number(formData.get('hit_dice_count')) || 1, 1);
  let amount = Number(formData.get('amount'));

  if (action === 'heal' && useHitDice) {
    if (!hitDiceSides) {
      createToast('Configura un dado vita valido', 'error');
      return;
    }
    if (hitDiceUsed >= hitDiceMax) {
      createToast('Nessun dado vita disponibile', 'error');
      return;
    }
    const remaining = Math.max(hitDiceMax - hitDiceUsed, 0);
    if (diceCount > remaining) {
      createToast(`Hai solo ${remaining} dadi vita disponibili`, 'error');
      return;
    }
    const conMod = getAbilityModifier(abilities.con) ?? 0;
    const rolls = Array.from({ length: diceCount }, () => rollDie(hitDiceSides));
    const totalRoll = rolls.reduce((sum, roll) => sum + roll, 0);
    amount = Math.max(totalRoll + conMod * diceCount, 1);
  }

  if (!amount || amount <= 0) {
    createToast('Inserisci un valore valido', 'error');
    return;
  }
  const currentHp = Number(activeCharacter.data?.hp?.current) || 0;
  const currentTempHp = Number(activeCharacter.data?.hp?.temp) || 0;
  const maxHp = activeCharacter.data?.hp?.max;
  const activeWildShape = action === 'damage'
    ? getActiveWildShapeDetails(activeCharacter, companions)
    : null;
  const maxOverrideRaw = formData.get('hp_max_override');
  const maxOverrideValue = maxOverrideRaw === null || maxOverrideRaw === '' ? null : Number(maxOverrideRaw);
  if (action === 'damage' && maxOverrideValue !== null && (!Number.isFinite(maxOverrideValue) || maxOverrideValue <= 0)) {
    createToast('Inserisci un massimo PF valido', 'error');
    return;
  }
  let nextCurrent = currentHp;
  let nextTemp = currentTempHp;
  let nextWildShape = activeCharacter.data?.wild_shape ?? null;
  let wildShapeDamageTaken = 0;
  let normalDamageTaken = 0;
  if (action === 'heal' && useTempHp) {
    nextTemp = currentTempHp + amount;
  } else if (action === 'heal') {
    nextCurrent = currentHp + amount;
  } else {
    const absorbed = Math.min(currentTempHp, amount);
    nextTemp = currentTempHp - absorbed;
    let remainingDamage = amount - absorbed;
    if (activeWildShape && remainingDamage > 0) {
      wildShapeDamageTaken = Math.min(activeWildShape.hpCurrent, remainingDamage);
      const nextWildHp = Math.max(activeWildShape.hpCurrent - wildShapeDamageTaken, 0);
      remainingDamage -= wildShapeDamageTaken;
      nextWildShape = nextWildHp > 0
        ? {
          ...(activeCharacter.data?.wild_shape || {}),
          active_companion_id: activeWildShape.companion.id,
          hp_current: nextWildHp
        }
        : null;
    }
    if (remainingDamage > 0) {
      normalDamageTaken = remainingDamage;
      nextCurrent = Math.max(currentHp - remainingDamage, 0);
    }
  }
  const effectiveMax = maxOverrideValue !== null && maxOverrideValue !== undefined
    ? maxOverrideValue
    : maxHp;
  const adjusted = effectiveMax !== null && effectiveMax !== undefined
    ? Math.min(nextCurrent, Number(effectiveMax))
    : nextCurrent;
  const nextHitDice = action === 'heal' && useHitDice
    ? {
      ...hitDice,
      used: Math.min(hitDiceUsed + diceCount, hitDiceMax)
    }
    : hitDice;
  const wildShapeLabel = action === 'damage' && wildShapeDamageTaken > 0
    ? ` · forma selvatica -${wildShapeDamageTaken}`
    : '';
  const normalHpLabel = action === 'damage' && normalDamageTaken > 0
    ? ` · PF -${normalDamageTaken}`
    : '';
  const message = action === 'heal'
    ? `${useTempHp ? 'HP temporanei +' : 'PF curati +'}${amount}${useHitDice ? ` (${diceCount}d${hitDiceSides})` : ''}`
    : `Danno ${amount}${wildShapeLabel}${normalHpLabel}`;
  const shouldOpenConcentrationSave = action === 'damage' && Number(amount) > 0 && Boolean(activeCharacter.data?.concentration_active);
  const saveOnComplete = async () => {
    if (container) await renderHome(container);
    if (!shouldOpenConcentrationSave) return;
    const concentrationCharacter = buildWildShapeAdjustedCharacter(activeCharacter, companions);
    const options = buildSavingThrowRollOptions(concentrationCharacter || activeCharacter);
    const conSave = options.find((entry) => entry.value === 'con');
    if (!conSave || conSave.disabled) return;
    openDiceRollerModal({
      title: 'Tiro salvezza concentrazione • COS',
      mode: 'd20',
      rollType: 'TS',
      selection: {
        label: 'Tiro salvezza',
        options,
        value: conSave.value
      },
      allowInspiration: Boolean(activeCharacter?.data?.inspiration) && canEditCharacter,
      weakPoints: Number(activeCharacter?.data?.hp?.weak_points) || 0,
      characterId: activeCharacter.id,
      historyLabel: 'TS concentrazione'
    });
  };
  await saveCharacterData(activeCharacter, {
    ...activeCharacter.data,
    hp: {
      ...activeCharacter.data?.hp,
      current: adjusted,
      temp: nextTemp,
      max: maxOverrideValue !== null && maxOverrideValue !== undefined ? maxOverrideValue : maxHp
    },
    wild_shape: nextWildShape,
    hit_dice: nextHitDice
  }, message, saveOnComplete);
}

function openDiceRollerModal({
  title,
  mode,
  selection = null,
  allowInspiration = false,
  onConsumeInspiration = null,
  rollType = null,
  weakPoints = 0,
  characterId = null,
  historyLabel = null,
  onRollComplete = null,
  warning = null
}) {
  const { activeCharacter, canEditCharacter } = getHomeContext();
  const resolvedConsumeInspiration = onConsumeInspiration
    || (allowInspiration ? getConsumeInspirationHandler(activeCharacter, canEditCharacter) : null);
  openDiceOverlay({
    keepOpen: true,
    title,
    mode,
    selection,
    allowInspiration,
    onConsumeInspiration: resolvedConsumeInspiration,
    rollType,
    weakPoints,
    characterId,
    historyLabel,
    warning,
    onRollComplete
  });
}
