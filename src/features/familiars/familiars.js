import { createCompanion, deleteCompanion, fetchCompanions, updateCompanion } from '../character/companionsApi.js';
import { getState, normalizeCharacterId } from '../../app/state.js';
import { attachNumberSteppers, buildInput, buildTextarea, createToast, openConfirmModal, openFormModal, setGlobalLoading } from '../../ui/components.js';
import { openDiceOverlay } from '../dice-roller/overlay/dice.js';
import { getAbilityModifier } from '../character/home/utils.js';
import { buildHpActionFields } from '../character/home/hpModal.js';
import { openAvatarModal } from '../character/home/modals.js';

const ABILITY_KEYS = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
const ABILITY_LABELS = { str: 'FOR', dex: 'DES', con: 'COS', wis: 'SAG', int: 'INT', cha: 'CAR' };
const KIND_OPTIONS = [
  { value: 'familiar', label: 'Famiglio' },
  { value: 'summon', label: 'Evocazione' },
  { value: 'transformation', label: 'Trasformazione' },
  { value: 'animal', label: 'Animale' }
];

const SPEED_LABELS = {
  walk: { label: 'Terra', icon: '🏃' },
  swim: { label: 'Nuoto', icon: '🌊' },
  fly: { label: 'Volo', icon: '🪽' },
  climb: { label: 'Scalata', icon: '🧗' },
  burrow: { label: 'Scavare', icon: '⛏️' }
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatSigned(value) {
  const n = Number(value) || 0;
  return n >= 0 ? `+${n}` : `${n}`;
}

function formatKind(kind) {
  return KIND_OPTIONS.find((option) => option.value === kind)?.label || kind || 'Famiglio';
}

function formatSpeed(value) {
  return value === null || value === undefined || value === '' ? '-' : `${Number(value) || 0} m`;
}

function getDefaultStatBlock() {
  return {
    image_url: '',
    proficiency_bonus: 2,
    abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    saving_throws: {},
    armor_class: null,
    initiative: null,
    darkvision_range_m: null,
    hp: { current: 1, max: 1, temp: 0 },
    speeds: { walk: 9, swim: null, fly: null, climb: null, burrow: null },
    attacks: []
  };
}

function normalizeStatBlock(raw) {
  const base = getDefaultStatBlock();
  const source = raw && typeof raw === 'object' ? raw : {};
  return {
    image_url: source.image_url || '',
    proficiency_bonus: Number(source.proficiency_bonus) || base.proficiency_bonus,
    abilities: { ...base.abilities, ...(source.abilities || {}) },
    saving_throws: { ...base.saving_throws, ...(source.saving_throws || {}) },
    armor_class: source.armor_class ?? base.armor_class,
    initiative: source.initiative ?? base.initiative,
    darkvision_range_m: source.darkvision_range_m ?? base.darkvision_range_m,
    hp: { ...base.hp, ...(source.hp || {}) },
    speeds: { ...base.speeds, ...(source.speeds || {}) },
    attacks: Array.isArray(source.attacks) ? source.attacks : []
  };
}

function getSavingThrowModifier(statBlock, abilityKey) {
  const score = Number(statBlock.abilities?.[abilityKey]) || 10;
  const abilityModifier = getAbilityModifier(score) ?? 0;
  const proficiencyBonus = Number(statBlock.proficiency_bonus) || 0;
  return abilityModifier + (statBlock.saving_throws?.[abilityKey] ? proficiencyBonus : 0);
}

function buildCompanionQuickButton(companion, isSelected = false) {
  const statBlock = normalizeStatBlock(companion.stat_block);
  const hpCurrent = Number(statBlock.hp.current) || 0;
  const hpMax = Math.max(Number(statBlock.hp.max) || hpCurrent || 1, 1);
  const hpPercent = Math.min(Math.max((hpCurrent / hpMax) * 100, 0), 100);
  const armorClass = statBlock.armor_class ?? (10 + (getAbilityModifier(Number(statBlock.abilities?.dex) || 10) ?? 0));
  const imageUrl = statBlock.image_url?.trim();
  const avatar = imageUrl
    ? `<img src="${escapeHtml(imageUrl)}" alt="Foto di ${escapeHtml(companion.name)}" draggable="false" />`
    : '<span aria-hidden="true">🐾</span>';

  return `
    <button class="familiar-quick-card ${isSelected ? 'is-active' : ''}" type="button" data-select-companion="${escapeHtml(companion.id)}" aria-pressed="${isSelected}">
      <span class="familiar-quick-card__avatar">${avatar}</span>
      <span class="familiar-quick-card__body">
        <strong>${escapeHtml(companion.name)}</strong>
        <span>${escapeHtml(formatKind(companion.kind))}</span>
        <small><b>${hpCurrent}/${hpMax}</b> PF · <b>${armorClass}</b> CA</small>
        <span class="familiar-quick-card__health" role="meter" aria-label="Punti ferita ${hpCurrent} su ${hpMax}" aria-valuemin="0" aria-valuemax="${hpMax}" aria-valuenow="${hpCurrent}"><i style="width:${hpPercent}%"></i></span>
      </span>
      <span class="familiar-quick-card__selected" aria-hidden="true">✓ Attivo</span>
    </button>
  `;
}

function buildCompanionCard(companion, isSelected = false) {
  const statBlock = normalizeStatBlock(companion.stat_block);
  const imageUrl = statBlock.image_url?.trim();
  const avatar = imageUrl
    ? `<img src="${escapeHtml(imageUrl)}" alt="Foto di ${escapeHtml(companion.name)}" draggable="false" />`
    : '<span aria-hidden="true">🐾</span>';
  const abilities = ABILITY_KEYS.map((key) => {
    const score = Number(statBlock.abilities?.[key]) || 10;
    const mod = getAbilityModifier(score) ?? 0;
    return `
      <button class="stat-card stat-card--${key} stat-card--button familiar-ability-card" type="button" data-roll-ability="${escapeHtml(companion.id)}:${key}" aria-label="Tira ${ABILITY_LABELS[key]} per ${escapeHtml(companion.name)}">
        <span>${ABILITY_LABELS[key]}</span>
        <strong>${score}</strong>
        <span class="stat-card__modifier">${formatSigned(mod)}</span>
      </button>
    `;
  }).join('');
  const speeds = Object.entries(SPEED_LABELS)
    .map(([key, config]) => `
      <div class="combat-stat familiar-operation-card familiar-operation-card--speed">
        <span class="combat-stat__label"><span aria-hidden="true">${config.icon}</span> ${config.label}</span>
        <strong>${formatSpeed(statBlock.speeds?.[key])}</strong>
      </div>
    `).join('');
  const initiative = statBlock.initiative === null || statBlock.initiative === undefined || statBlock.initiative === ''
    ? (getAbilityModifier(Number(statBlock.abilities?.dex) || 10) ?? 0)
    : Number(statBlock.initiative) || 0;
  const darkvisionLabel = statBlock.darkvision_range_m === null || statBlock.darkvision_range_m === undefined || statBlock.darkvision_range_m === ''
    ? '-'
    : `${Number(statBlock.darkvision_range_m) || 0} m`;
  const armorClass = statBlock.armor_class ?? (10 + (getAbilityModifier(Number(statBlock.abilities?.dex) || 10) ?? 0));
  const attacks = statBlock.attacks.length
    ? statBlock.attacks.map((attack, index) => {
      const damageModifier = Number(attack.damage_modifier) || 0;
      const damageLabel = `${attack.damage || '-'}${damageModifier ? ` (${formatSigned(damageModifier)})` : ''}`;
      return `
      <article class="play-card play-card--attack familiar-attack-card" aria-label="Attacco ${escapeHtml(attack.name || `Attacco ${index + 1}`)}">
        <div class="play-card__header">
          <div class="play-card__metadata play-card__metadata--heading">
            <span class="play-card__eyebrow">Mischia · ${escapeHtml(formatKind(companion.kind))}</span>
          </div>
          <h3 class="play-card__title">${escapeHtml(attack.name || `Attacco ${index + 1}`)}</h3>
        </div>
        <div class="play-card__footer">
          <button class="play-card__button play-card__button--with-value play-card__button--primary" type="button" data-roll-attack="${escapeHtml(companion.id)}:${index}" aria-label="Tiro per colpire con ${escapeHtml(attack.name || `Attacco ${index + 1}`)}">
            <span class="play-card__button-label">Tiro per colpire</span>
            <strong class="play-card__button-value">${formatSigned(attack.to_hit || 0)}</strong>
          </button>
          <span class="play-card__damage-actions">
            <button class="play-card__button play-card__button--damage familiar-damage-button" type="button" data-roll-damage="${escapeHtml(companion.id)}:${index}" aria-label="Danni con ${escapeHtml(attack.name || `Attacco ${index + 1}`)}">${escapeHtml(damageLabel)}</button>
          </span>
        </div>
      </article>
    `;
    }).join('')
    : '<p class="muted">Nessun attacco configurato.</p>';
  const notes = companion.notes?.trim() ? escapeHtml(companion.notes) : '';
  const hpCurrent = Number(statBlock.hp.current) || 0;
  const hpMax = Math.max(Number(statBlock.hp.max) || hpCurrent || 1, 1);
  const hpTemp = Math.max(Number(statBlock.hp.temp) || 0, 0);
  const hpPercent = Math.min(Math.max((hpCurrent / hpMax) * 100, 0), 100);
  const hasTempHp = hpTemp > 0;
  const tempHpPercent = Math.min(Math.max((hpTemp / hpMax) * 100, 0), 100);

  return `
    <article class="card home-card home-section familiar-sheet familiar-sheet--refined ${isSelected ? 'is-active' : ''}" data-familiar-panel="${escapeHtml(companion.id)}" ${isSelected ? '' : 'hidden'}>
      <header class="card-header familiar-sheet__header">
        ${imageUrl ? `
        <button class="familiar-avatar familiar-avatar--image familiar-avatar--button" type="button" data-preview-companion="${escapeHtml(companion.id)}" aria-label="Apri foto di ${escapeHtml(companion.name)}">${avatar}</button>
        ` : `<span class="familiar-avatar" aria-hidden="true">${avatar}</span>`}
        <button
          class="familiar-sheet__toggle"
          type="button"
          data-toggle-familiar-sheet="${escapeHtml(companion.id)}"
          aria-expanded="true"
          aria-controls="familiar-content-${escapeHtml(companion.id)}"
        >
          <span class="familiar-sheet__title">
            <span class="familiar-sheet__kicker">Compagno attivo · ${escapeHtml(formatKind(companion.kind))}</span>
            <strong>${escapeHtml(companion.name)}</strong>
             ${notes ? `<span class="familiar-sheet__notes">${notes}</span>` : ''}
          </span>
        </button>
        <details class="familiar-sheet__menu">
          <summary aria-label="Azioni per ${escapeHtml(companion.name)}">•••</summary>
          <div class="familiar-sheet__menu-popover">
            <button data-edit-companion="${escapeHtml(companion.id)}" type="button"><span aria-hidden="true">✎</span> Modifica</button>
            <button class="familiar-sheet__menu-delete" data-delete-companion="${escapeHtml(companion.id)}" type="button"><span aria-hidden="true">×</span> Elimina</button>
          </div>
        </details>
      </header>
      <div class="familiar-dashboard" id="familiar-content-${escapeHtml(companion.id)}" data-familiar-content>
        <section class="character-sheet-section familiar-detail-panel familiar-characteristics-panel familiar-detail-panel--abilities">
          <header class="character-sheet-section__header familiar-panel-title">
            <div><strong>Caratteristiche</strong><small>Valori e modificatori principali</small></div>
          </header>
          <div class="stat-panel"><div class="stat-grid stat-grid--compact stat-grid--abilities familiar-characteristics-grid familiar-ability-grid">${abilities}</div></div>
        </section>
        <section class="character-sheet-section familiar-detail-panel familiar-operations-panel familiar-detail-panel--operations" aria-label="Statistiche operative di ${escapeHtml(companion.name)}">
          <header class="character-sheet-section__header familiar-panel-title">
            <div><strong>Statistiche operative</strong><small>Iniziativa, difesa, movimento e sensi</small></div>
          </header>
          <div class="character-quick-stats familiar-operational-stats">
            <div class="combat-stat combat-stat--armor" title="Classe armatura" aria-label="Classe armatura ${armorClass}">
              <span class="combat-stat__label">Classe armatura</span>
              <strong>${armorClass}</strong>
            </div>
            <div class="combat-stat combat-stat--initiative" title="Iniziativa" aria-label="Iniziativa ${formatSigned(initiative)}">
              <span class="combat-stat__label">Iniziativa</span>
              <strong>${formatSigned(initiative)}</strong>
            </div>
            <div class="combat-stat combat-stat--proficiency" title="Bonus competenza" aria-label="Bonus competenza ${formatSigned(statBlock.proficiency_bonus)}">
              <span class="combat-stat__label">Bonus competenza</span>
              <strong>${formatSigned(statBlock.proficiency_bonus)}</strong>
            </div>
            <div class="familiar-operational-movement" aria-label="Movimento e sensi">
              <div class="familiar-movement-grid">${speeds}</div>
              <div class="combat-stat familiar-operation-card familiar-operation-card--darkvision"><span class="combat-stat__label">Scurovisione</span><strong>${darkvisionLabel}</strong></div>
            </div>
          </div>
        </section>
        <section class="character-sheet-section familiar-detail-panel familiar-combat-panel familiar-detail-panel--combat" aria-label="Salute e combattimento di ${escapeHtml(companion.name)}">
          <header class="character-sheet-section__header familiar-panel-title">
            <div><strong>Salute e combattimento</strong><small>Punti ferita e stato corrente</small></div>
          </header>
          <div class="familiar-health-combat-grid">
            <div class="hp-vitals-card familiar-hp-card">
              <div class="hp-vitals-card__controls">
                <div class="hp-vitals-card__action-zone hp-vitals-card__action-zone--damage">
                  <button class="hp-inline-action hp-inline-action--damage familiar-hp-action" type="button" data-companion-hp-action="damage" data-companion-id="${escapeHtml(companion.id)}" aria-label="Fai subire danno a ${escapeHtml(companion.name)}"><span aria-hidden="true">−</span><strong>Danno</strong></button>
                </div>
                <div class="hp-vitals-card__life-zone">
                  <div class="hp-vitals-card__header">
                    <span class="hp-vitals-card__heading"><span class="hp-vitals-card__icon" aria-hidden="true">♥</span><strong class="hp-bar-label__title">Punti ferita</strong></span>
                    <span class="hp-vitals-card__values"><strong class="hp-bar-label__value">${hpCurrent}/${hpMax}</strong><span class="hp-bar-label__percent" aria-label="Percentuale vita ${Math.round(hpPercent)}%">${Math.round(hpPercent)}%</span></span>
                  </div>
                  <div class="hp-vitals-card__bars">
                    <div class="hp-bar-track" role="meter" aria-label="Punti ferita attuali" aria-valuemin="0" aria-valuemax="${hpMax}" aria-valuenow="${hpCurrent}"><div class="hp-bar"><div class="hp-bar__fill" style="width: ${hpPercent}%;"></div></div></div>
                    ${hasTempHp ? `<div class="hp-vitals-card__temp-label familiar-temp-hp-label is-active"><span>PF temporanei</span><strong>${hpTemp}</strong></div><div class="hp-bar-track hp-bar-track--temp-secondary" role="meter" aria-label="Punti ferita temporanei" aria-valuemin="0" aria-valuemax="${hpMax}" aria-valuenow="${hpTemp}"><div class="hp-bar hp-bar--temp is-active"><div class="hp-bar__fill hp-bar__fill--temp" style="width: ${tempHpPercent}%;"></div></div></div>` : ''}
                  </div>
                </div>
                <div class="hp-vitals-card__action-zone hp-vitals-card__action-zone--heal">
                  <button class="hp-inline-action hp-inline-action--heal familiar-hp-action" type="button" data-companion-hp-action="heal" data-companion-id="${escapeHtml(companion.id)}" aria-label="Cura o assegna punti ferita temporanei a ${escapeHtml(companion.name)}"><span aria-hidden="true">+</span><strong>Cura</strong></button>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section class="character-sheet-section familiar-detail-panel familiar-attacks-panel familiar-detail-panel--attacks" aria-label="Attacchi di ${escapeHtml(companion.name)}">
          <header class="character-sheet-section__header familiar-panel-title">
            <div><strong>Attacchi</strong><small>Tiri per colpire e danni</small></div>
          </header>
          <div class="detail-grid detail-grid--compact familiar-attacks-grid">${attacks}</div>
        </section>
      </div>
    </article>
  `;
}

function openRollWithModifier(label, modifier, rollType = 'TA') {
  openDiceOverlay({
    keepOpen: true,
    title: label,
    mode: 'd20',
    modifier: Number(modifier) || 0,
    rollType,
    historyLabel: label
  });
}

export async function renderFamiliars(container) {
  const state = getState();
  const normalizedActiveId = normalizeCharacterId(state.activeCharacterId);
  const activeCharacter = state.characters.find((char) => normalizeCharacterId(char.id) === normalizedActiveId);
  if (!activeCharacter) {
    container.innerHTML = '<section class="card"><p>Nessun personaggio selezionato.</p></section>';
    return;
  }

  const usesContextualLoader = container.hasAttribute('data-shortcut-kind');
  if (!usesContextualLoader) setGlobalLoading(true);
  let companions = [];
  try {
    companions = state.offline ? [] : await fetchCompanions(activeCharacter.id);
  } catch {
    createToast('Errore caricamento famigli', 'error');
  } finally {
    if (!usesContextualLoader) setGlobalLoading(false);
  }

  const selectedCompanionId = companions.find(companion => String(companion.id) === container.dataset.selectedCompanion)?.id || companions[0]?.id;
  const showsShortcutDetail = !usesContextualLoader || container.dataset.familiarDetailOpen === 'true';
  container.innerHTML = `
    <div class="home-layout familiars-layout familiars-layout--refined ${companions.length ? '' : 'is-empty'}">
      ${companions.length ? `<aside class="card home-card home-section familiars-quick-panel familiars-quick-panel--refined" aria-label="Seleziona famiglio">
        <div class="familiars-quick-panel__header">
          <div>
            <p class="eyebrow">Compagni</p>
            <span class="muted">${companions.length} ${companions.length === 1 ? 'scheda' : 'schede'}</span>
          </div>
          <button class="familiar-add-button" type="button" data-add-companion aria-label="Aggiungi famiglio o evocazione"><span aria-hidden="true">+</span><strong>Nuovo</strong></button>
        </div>
        <div class="familiars-quick-list">
          ${companions.map((companion) => buildCompanionQuickButton(companion, showsShortcutDetail && companion.id === selectedCompanionId)).join('')}
        </div>
      </aside>` : ''}
      <main class="familiars-detail-area">
        ${companions.length ? companions.map((companion) => buildCompanionCard(companion, companion.id === selectedCompanionId)).join('') : `
          <section class="card home-card home-section familiar-empty-state">
            <span class="familiar-empty-state__icon" aria-hidden="true">♞</span>
            <p class="eyebrow">Nessuna scheda</p>
            <h3>Crea il primo famiglio</h3>
            <p class="muted">Aggiungi foto, caratteristiche, punti ferita, velocità, tiri salvezza e attacchi per tirare rapidamente durante la sessione.</p>
            <button class="familiar-add-button familiar-empty-state__action" type="button" data-add-companion aria-label="Aggiungi il primo famiglio o evocazione"><span aria-hidden="true">+</span><strong>Aggiungi il primo compagno</strong></button>
          </section>
        `}
      </main>
    </div>
  `;

  container.polishShortcut?.();
  const refreshAfterMutation = async () => {
    container.dataset.shortcutChanged = 'true';
    await renderFamiliars(container);
  };
  const openCompanionForm = async (companion = null) => {
    const current = normalizeStatBlock(companion?.stat_block);
    let draftAttacks = (current.attacks || []).map((attack) => ({
      name: attack?.name || '',
      to_hit: Number(attack?.to_hit) || 0,
      damage: attack?.damage || '',
      damage_modifier: Number(attack?.damage_modifier) || 0
    }));

    const form = document.createElement('div');
    form.className = 'character-edit-form character-edit-form--guided familiar-edit-form';

    const buildEditGroup = (title, sections, { icon = '', description = '' } = {}) => {
      const group = document.createElement('section');
      group.className = 'character-edit-group familiar-edit-group';

      const header = document.createElement('header');
      header.className = 'character-edit-group__header';
      if (icon) {
        const iconEl = document.createElement('span');
        iconEl.className = 'character-edit-group__icon';
        iconEl.setAttribute('aria-hidden', 'true');
        iconEl.textContent = icon;
        header.appendChild(iconEl);
      }
      const heading = document.createElement('div');
      heading.className = 'character-edit-group__heading';
      heading.innerHTML = `<h3>${title}</h3>${description ? `<p>${description}</p>` : ''}`;
      header.appendChild(heading);

      const body = document.createElement('div');
      body.className = 'character-edit-group__content';
      sections.forEach((section) => {
        section.classList.add('character-edit-subsection');
        body.appendChild(section);
      });
      group.append(header, body);
      return group;
    };

    const identitySection = document.createElement('div');
    identitySection.className = 'character-edit-section compact-character-section';
    const identityGrid = document.createElement('div');
    identityGrid.className = 'character-edit-grid character-edit-grid--identity familiar-edit-identity-grid';
    const nameField = buildInput({ label: 'Nome', name: 'name', value: companion?.name || '' });
    nameField.querySelector('input').required = true;
    identityGrid.appendChild(nameField);
    const kindField = document.createElement('label');
    kindField.className = 'field';
    const kindLabel = document.createElement('span');
    kindLabel.textContent = 'Tipologia';
    const kindSelect = document.createElement('select');
    kindSelect.name = 'kind';
    KIND_OPTIONS.forEach((opt) => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.label;
      if ((companion?.kind || 'familiar') === opt.value) option.selected = true;
      kindSelect.appendChild(option);
    });
    kindField.append(kindLabel, kindSelect);
    identityGrid.appendChild(kindField);
    identityGrid.appendChild(buildInput({ label: 'Versione regole', name: 'rules_version', value: companion?.rules_version || '2024' }));
    identitySection.appendChild(identityGrid);
    identitySection.appendChild(buildInput({
      label: 'Foto (URL)',
      name: 'image_url',
      value: current.image_url || '',
      placeholder: 'https://.../famiglio.png'
    }));

    const notesSection = document.createElement('div');
    notesSection.className = 'character-edit-section compact-character-section';
    notesSection.appendChild(buildTextarea({
      label: 'Note',
      name: 'notes',
      value: companion?.notes || '',
      placeholder: 'Tratti, sensi, azioni speciali o promemoria utili in gioco.'
    }));

    const abilitiesSection = document.createElement('div');
    abilitiesSection.className = 'character-edit-section compact-character-section';
    abilitiesSection.innerHTML = '<h4>Caratteristiche</h4>';
    const abilityGrid = document.createElement('div');
    abilityGrid.className = 'compact-ability-grid familiar-edit-ability-grid';
    ABILITY_KEYS.forEach((key) => {
      const field = buildInput({ label: ABILITY_LABELS[key], name: `ab_${key}`, type: 'number', value: current.abilities[key] ?? 10 });
      const input = field.querySelector('input');
      input.min = '1';
      input.step = '1';
      abilityGrid.appendChild(field);
    });
    abilitiesSection.appendChild(abilityGrid);

    const savesSection = document.createElement('div');
    savesSection.className = 'character-edit-section compact-character-section familiar-edit-saves-section';
    savesSection.innerHTML = `
      <h4>Tiri salvezza</h4>
      <div class="compact-pill-grid familiar-edit-saves-grid">
        ${ABILITY_KEYS.map((key) => `
          <label class="toggle-pill">
            <input type="checkbox" name="save_${key}" ${current.saving_throws?.[key] ? 'checked' : ''} />
            <span>${ABILITY_LABELS[key]}</span>
          </label>
        `).join('')}
      </div>
    `;

    const vitalsSection = document.createElement('div');
    vitalsSection.className = 'character-edit-section compact-character-section';
    vitalsSection.innerHTML = '<h4>Punti ferita e velocità</h4>';
    const vitalsGrid = document.createElement('div');
    vitalsGrid.className = 'character-edit-grid familiar-edit-vitals-grid';
    [
      { label: 'HP attuali', name: 'hp_current', value: current.hp.current ?? 1 },
      { label: 'HP massimi', name: 'hp_max', value: current.hp.max ?? 1 },
      { label: 'Bonus competenza', name: 'proficiency_bonus', value: current.proficiency_bonus ?? 2 },
      { label: 'Classe armatura', name: 'armor_class', value: current.armor_class ?? (10 + (getAbilityModifier(Number(current.abilities.dex) || 10) ?? 0)) },
      { label: 'Iniziativa', name: 'initiative', value: current.initiative ?? (getAbilityModifier(Number(current.abilities.dex) || 10) ?? 0), allowNegative: true },
      { label: 'Scurovisione (m)', name: 'darkvision_range_m', value: current.darkvision_range_m ?? '' },
      { label: 'Terra (m)', name: 'speed_walk', value: current.speeds.walk ?? 9 },
      { label: 'Nuoto (m)', name: 'speed_swim', value: current.speeds.swim ?? '' },
      { label: 'Volo (m)', name: 'speed_fly', value: current.speeds.fly ?? '' },
      { label: 'Scalata (m)', name: 'speed_climb', value: current.speeds.climb ?? '' },
      { label: 'Scavare (m)', name: 'speed_burrow', value: current.speeds.burrow ?? '' }
    ].forEach((config) => {
      const field = buildInput({ label: config.label, name: config.name, type: 'number', value: config.value });
      const input = field.querySelector('input');
      if (!config.allowNegative) input.min = '0';
      input.step = '1';
      vitalsGrid.appendChild(field);
    });
    vitalsSection.appendChild(vitalsGrid);

    const attacksSection = document.createElement('div');
    attacksSection.className = 'character-edit-section compact-character-section familiar-edit-attacks-section';
    attacksSection.innerHTML = `
      <div class="familiar-edit-section-header">
        <h4>Attacchi</h4>
        <p class="muted">Aggiungi righe strutturate invece di modificare il JSON manualmente.</p>
      </div>
    `;
    const attackCountInput = document.createElement('input');
    attackCountInput.type = 'hidden';
    attackCountInput.name = 'attack_count';
    const attackList = document.createElement('div');
    attackList.className = 'familiar-edit-attack-list';
    const addAttackButton = document.createElement('button');
    addAttackButton.type = 'button';
    addAttackButton.className = 'ghost-button ghost-button--compact familiar-edit-add-attack';
    addAttackButton.textContent = '+ Aggiungi attacco';

    const readAttackRows = () => {
      draftAttacks = Array.from(attackList.querySelectorAll('[data-attack-row]')).map((row) => ({
        name: row.querySelector('[name^="attack_name_"]')?.value || '',
        to_hit: Number(row.querySelector('[name^="attack_to_hit_"]')?.value) || 0,
        damage: row.querySelector('[name^="attack_damage_"]')?.value || '',
        damage_modifier: Number(row.querySelector('[name^="attack_damage_modifier_"]')?.value) || 0
      }));
    };

    const renderAttackRows = () => {
      attackList.innerHTML = '';
      attackCountInput.value = String(draftAttacks.length);
      if (!draftAttacks.length) {
        const empty = document.createElement('p');
        empty.className = 'muted familiar-edit-empty-attacks';
        empty.textContent = 'Nessun attacco configurato.';
        attackList.appendChild(empty);
        return;
      }
      draftAttacks.forEach((attack, index) => {
        const row = document.createElement('div');
        row.className = 'compact-special-skill-row familiar-edit-attack-row';
        row.dataset.attackRow = String(index);
        const grid = document.createElement('div');
        grid.className = 'compact-special-skill-grid familiar-edit-attack-grid';
        grid.appendChild(buildInput({ label: 'Nome', name: `attack_name_${index}`, value: attack.name, placeholder: 'Es. Morso' }));
        const hitField = buildInput({ label: 'Tiro per colpire', name: `attack_to_hit_${index}`, type: 'number', value: attack.to_hit ?? 0 });
        const hitInput = hitField.querySelector('input');
        hitInput.step = '1';
        grid.appendChild(hitField);
        grid.appendChild(buildInput({ label: 'Danni', name: `attack_damage_${index}`, value: attack.damage, placeholder: 'Es. 1d6' }));
        const damageModifierField = buildInput({ label: 'Mod. danni', name: `attack_damage_modifier_${index}`, type: 'number', value: attack.damage_modifier ?? 0 });
        damageModifierField.querySelector('input').step = '1';
        grid.appendChild(damageModifierField);
        const actions = document.createElement('div');
        actions.className = 'character-toggle-group familiar-edit-attack-actions';
        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'ghost-button ghost-button--compact';
        removeButton.textContent = 'Rimuovi';
        removeButton.addEventListener('click', () => {
          readAttackRows();
          draftAttacks.splice(index, 1);
          renderAttackRows();
          attachNumberSteppers(attackList);
        });
        actions.appendChild(removeButton);
        row.append(grid, actions);
        attackList.appendChild(row);
      });
    };

    addAttackButton.addEventListener('click', () => {
      readAttackRows();
      draftAttacks.push({ name: '', to_hit: 0, damage: '', damage_modifier: 0 });
      renderAttackRows();
      attachNumberSteppers(attackList);
    });
    renderAttackRows();
    attacksSection.append(attackCountInput, attackList, addAttackButton);

    const steps = [
      {
        title: 'Identità',
        icon: '🐾',
        description: 'Nome, tipologia e note.',
        content: buildEditGroup('Identità del famiglio', [identitySection, notesSection], {
          icon: '🐾',
          description: 'Dati principali mostrati nella scheda famiglio.'
        })
      },
      {
        title: 'Statistiche',
        icon: '📊',
        description: 'Caratteristiche, HP e velocità.',
        content: buildEditGroup('Statistiche', [abilitiesSection, savesSection, vitalsSection], {
          icon: '📊',
          description: 'Valori usati per la mini-scheda e per i tiri rapidi.'
        })
      },
      {
        title: 'Attacchi',
        icon: '⚔️',
        description: 'Azioni offensive.',
        content: buildEditGroup('Attacchi', [attacksSection], {
          icon: '⚔️',
          description: 'Configura i tiri per colpire che saranno lanciabili dalla scheda.'
        })
      }
    ];

    const stepper = document.createElement('div');
    stepper.className = 'character-edit-stepper familiar-edit-stepper';
    const stepperNav = document.createElement('ol');
    stepperNav.className = 'character-edit-stepper-nav';
    const stepperContent = document.createElement('div');
    stepperContent.className = 'character-edit-stepper-content';
    const stepperActions = document.createElement('div');
    stepperActions.className = 'character-edit-stepper-actions character-edit-stepper-actions--footer';
    const backButton = document.createElement('button');
    backButton.type = 'button';
    backButton.className = 'secondary';
    backButton.textContent = 'Indietro';
    const nextButton = document.createElement('button');
    nextButton.type = 'button';
    nextButton.className = 'primary';
    nextButton.textContent = 'Avanti';
    stepperActions.append(backButton, nextButton);

    const stepButtons = [];
    const stepPanels = [];
    steps.forEach((step, index) => {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'character-edit-stepper-button';
      button.innerHTML = `
        <span class="step-index">${index + 1}</span>
        <span class="character-edit-stepper-label">
          <span class="character-edit-stepper-title">${step.icon} ${step.title}</span>
          <span class="character-edit-stepper-description">${step.description}</span>
        </span>
      `;
      item.appendChild(button);
      stepperNav.appendChild(item);
      stepButtons.push(button);

      const panel = document.createElement('div');
      panel.className = 'character-edit-step';
      panel.dataset.step = String(index);
      panel.appendChild(step.content);
      stepperContent.appendChild(panel);
      stepPanels.push(panel);
    });

    let activeStepIndex = 0;
    const getStepFields = (panel) => Array.from(panel.querySelectorAll('input, select, textarea'));
    const isStepComplete = (panel) => getStepFields(panel)
      .filter((field) => field.required)
      .every((field) => field.checkValidity());
    const updateStepperState = () => {
      const completion = stepPanels.map((panel) => isStepComplete(panel));
      const firstIncomplete = completion.findIndex((done) => !done);
      const maxAllowed = firstIncomplete === -1 ? stepPanels.length - 1 : firstIncomplete;
      stepPanels.forEach((panel, index) => panel.classList.toggle('is-active', index === activeStepIndex));
      stepButtons.forEach((button, index) => {
        button.classList.toggle('is-active', index === activeStepIndex);
        button.classList.toggle('is-complete', completion[index]);
        button.disabled = index > maxAllowed;
      });
      backButton.disabled = activeStepIndex === 0;
      nextButton.disabled = !completion[activeStepIndex] || activeStepIndex >= stepPanels.length - 1;
    };
    const setActiveStep = (index) => {
      activeStepIndex = Math.min(Math.max(index, 0), stepPanels.length - 1);
      updateStepperState();
    };
    stepButtons.forEach((button, index) => button.addEventListener('click', () => setActiveStep(index)));
    backButton.addEventListener('click', () => setActiveStep(activeStepIndex - 1));
    nextButton.addEventListener('click', () => setActiveStep(activeStepIndex + 1));
    form.addEventListener('input', updateStepperState);
    form.addEventListener('change', updateStepperState);

    stepper.append(stepperNav, stepperContent);
    form.appendChild(stepper);
    updateStepperState();

    const formData = await openFormModal({
      title: companion ? 'Modifica famiglio' : 'Nuovo famiglio',
      submitLabel: companion ? 'Salva' : 'Crea',
      content: form,
      cardClass: ['modal-card--wide', 'modal-card--character-editor', 'modal-card--familiar-editor'],
      onOpen: ({ modal, fieldsEl }) => {
        attachNumberSteppers(fieldsEl || form);
        const footer = modal.querySelector('.modal-footer');
        const modalActions = footer?.querySelector('.modal-actions');
        if (!modalActions) return null;
        const centeredActions = document.createElement('div');
        centeredActions.className = 'modal-actions__center';
        centeredActions.appendChild(stepperActions);
        modalActions.classList.add('modal-actions--with-center');
        modalActions.insertBefore(centeredActions, modalActions.querySelector('.modal-actions__right'));
        return () => {
          centeredActions.remove();
          modalActions.classList.remove('modal-actions--with-center');
          stepper.appendChild(stepperActions);
        };
      }
    });
    if (!formData) return;

    const toNumberOrNull = (value) => (value === null || value === '' ? null : Number(value));
    const abilities = ABILITY_KEYS.reduce((acc, key) => {
      acc[key] = Number(formData.get(`ab_${key}`) || 10);
      return acc;
    }, {});
    const attackCount = Number(formData.get('attack_count')) || 0;
    const attacks = Array.from({ length: attackCount }, (_, index) => ({
      name: String(formData.get(`attack_name_${index}`) || '').trim(),
      to_hit: Number(formData.get(`attack_to_hit_${index}`) || 0),
      damage: String(formData.get(`attack_damage_${index}`) || '').trim(),
      damage_modifier: Number(formData.get(`attack_damage_modifier_${index}`) || 0)
    })).filter((attack) => attack.name || attack.damage);

    const payload = {
      user_id: activeCharacter.user_id,
      character_id: activeCharacter.id,
      name: String(formData.get('name') || '').trim(),
      kind: formData.get('kind') || 'familiar',
      rules_version: String(formData.get('rules_version') || '2024').trim() || '2024',
      stat_block: {
        image_url: String(formData.get('image_url') || '').trim(),
        proficiency_bonus: Number(formData.get('proficiency_bonus') || 2),
        armor_class: toNumberOrNull(formData.get('armor_class')),
        initiative: toNumberOrNull(formData.get('initiative')),
        darkvision_range_m: toNumberOrNull(formData.get('darkvision_range_m')),
        abilities,
        saving_throws: ABILITY_KEYS.reduce((acc, key) => {
          acc[key] = formData.get(`save_${key}`) === 'on';
          return acc;
        }, {}),
        hp: {
          current: Number(formData.get('hp_current') || 1),
          max: Number(formData.get('hp_max') || 1),
          temp: Math.max(Number(current.hp.temp) || 0, 0)
        },
        speeds: {
          walk: Number(formData.get('speed_walk') || 0),
          swim: toNumberOrNull(formData.get('speed_swim')),
          fly: toNumberOrNull(formData.get('speed_fly')),
          climb: toNumberOrNull(formData.get('speed_climb')),
          burrow: toNumberOrNull(formData.get('speed_burrow'))
        },
        attacks
      },
      notes: String(formData.get('notes') || '').trim() || null
    };

    if (!payload.name) {
      createToast('Inserisci un nome', 'error');
      return;
    }

    if (companion) await updateCompanion(companion.id, payload);
    else await createCompanion(payload);
    await refreshAfterMutation();
  };

  container.querySelectorAll('[data-add-companion]').forEach((button) => button.addEventListener('click', () => { void openCompanionForm(); }));
  container.querySelectorAll('[data-select-companion]').forEach((btn) => btn.addEventListener('click', () => {
    const companionId = btn.dataset.selectCompanion;
    container.dataset.selectedCompanion = companionId;
    if (usesContextualLoader) container.dataset.familiarDetailOpen = 'true';
    container.querySelectorAll('[data-select-companion]').forEach((entry) => {
      const isActive = entry.dataset.selectCompanion === companionId;
      entry.classList.toggle('is-active', isActive);
      entry.setAttribute('aria-pressed', String(isActive));
    });
    container.querySelectorAll('[data-familiar-panel]').forEach((panel) => {
      const isActive = panel.dataset.familiarPanel === companionId;
      panel.hidden = !isActive;
      panel.classList.toggle('is-active', isActive);
    });
    container.polishShortcut?.();
    container.querySelector('.familiars-detail-area')?.scrollTo({ top: 0, behavior: 'instant' });
  }));
  container.querySelectorAll('[data-toggle-familiar-sheet]').forEach((btn) => btn.addEventListener('click', () => {
    const panel = btn.closest('[data-familiar-panel]');
    const content = panel?.querySelector('[data-familiar-content]');
    const isExpanded = btn.getAttribute('aria-expanded') !== 'false';
    btn.setAttribute('aria-expanded', String(!isExpanded));
    panel?.classList.toggle('is-collapsed', isExpanded);
    if (content) content.hidden = isExpanded;
  }));
  container.querySelectorAll('[data-preview-companion]').forEach((btn) => btn.addEventListener('click', () => {
    const companion = companions.find((entry) => String(entry.id) === String(btn.dataset.previewCompanion));
    if (companion) openAvatarModal(companion);
  }));
  container.querySelectorAll('[data-companion-hp-action]').forEach((btn) => btn.addEventListener('click', async () => {
    const companion = companions.find((entry) => String(entry.id) === String(btn.dataset.companionId));
    const action = btn.dataset.companionHpAction;
    if (!companion || !['heal', 'damage'].includes(action)) return;
    const current = normalizeStatBlock(companion.stat_block);
    const formData = await openFormModal({
      title: action === 'heal' ? `Cura PF · ${companion.name}` : `Subisci danno · ${companion.name}`,
      submitLabel: action === 'heal' ? 'Cura' : 'Danno',
      cardClass: ['modal-card--quick-action', 'modal-card--hp-action'],
      content: buildHpActionFields({ data: { hp: current.hp } }, action)
    });
    if (!formData) return;
    const amount = Number(formData.get('amount'));
    if (!Number.isFinite(amount) || amount <= 0) {
      createToast('Inserisci un valore valido', 'error');
      return;
    }
    const hpCurrent = Math.max(Number(current.hp.current) || 0, 0);
    const hpMax = Math.max(Number(current.hp.max) || hpCurrent || 1, 1);
    const hpTemp = Math.max(Number(current.hp.temp) || 0, 0);
    let nextHp;
    const useTempHp = action === 'heal' && formData.get('healing_target') === 'temp';
    if (useTempHp) {
      nextHp = { ...current.hp, temp: hpTemp + amount };
    } else if (action === 'heal') {
      nextHp = { ...current.hp, current: Math.min(hpCurrent + amount, hpMax) };
    } else {
      const maxOverrideRaw = formData.get('hp_max_override');
      const maxOverride = maxOverrideRaw === null || maxOverrideRaw === '' ? hpMax : Number(maxOverrideRaw);
      if (!Number.isFinite(maxOverride) || maxOverride <= 0) {
        createToast('Inserisci un massimo PF valido', 'error');
        return;
      }
      const absorbed = Math.min(hpTemp, amount);
      const remainingDamage = amount - absorbed;
      nextHp = {
        ...current.hp,
        current: Math.max(Math.min(hpCurrent, maxOverride) - remainingDamage, 0),
        max: maxOverride,
        temp: hpTemp - absorbed
      };
    }
    try {
      await updateCompanion(companion.id, { stat_block: { ...current, hp: nextHp } });
      const message = action === 'damage'
        ? `${companion.name} subisce ${amount} danni`
        : (useTempHp ? `PF temporanei +${amount} a ${companion.name}` : `${companion.name} curato di ${amount} PF`);
      createToast(message);
      await refreshAfterMutation();
    } catch {
      createToast('Errore aggiornamento punti ferita', 'error');
    }
  }));

  container.querySelectorAll('[data-edit-companion]').forEach((btn) => btn.addEventListener('click', () => {
    const companion = companions.find((entry) => entry.id === btn.dataset.editCompanion);
    if (companion) void openCompanionForm(companion);
  }));
  container.querySelectorAll('[data-delete-companion]').forEach((btn) => btn.addEventListener('click', async () => {
    const companion = companions.find((entry) => entry.id === btn.dataset.deleteCompanion);
    if (!companion) return;
    const shouldDelete = await openConfirmModal({ title: 'Conferma eliminazione', message: `Eliminare ${companion.name}?`, confirmLabel: 'Elimina' });
    if (!shouldDelete) return;
    await deleteCompanion(companion.id);
    await refreshAfterMutation();
  }));

  container.querySelectorAll('[data-roll-ability]').forEach((btn) => btn.addEventListener('click', () => {
    const [companionId, abilityKey] = String(btn.dataset.rollAbility || '').split(':');
    const companion = companions.find((entry) => String(entry.id) === companionId);
    if (!companion || !ABILITY_KEYS.includes(abilityKey)) return;
    const score = Number(normalizeStatBlock(companion.stat_block).abilities[abilityKey]) || 10;
    const modifier = getAbilityModifier(score) ?? 0;
    openRollWithModifier(`${companion.name} · ${ABILITY_LABELS[abilityKey]}`, modifier, 'TA');
  }));
  container.querySelectorAll('[data-roll-save]').forEach((btn) => btn.addEventListener('click', () => {
    const [companionId, abilityKey] = String(btn.dataset.rollSave || '').split(':');
    const companion = companions.find((entry) => String(entry.id) === companionId);
    if (!companion || !ABILITY_KEYS.includes(abilityKey)) return;
    const modifier = getSavingThrowModifier(normalizeStatBlock(companion.stat_block), abilityKey);
    openRollWithModifier(`${companion.name} · TS ${ABILITY_LABELS[abilityKey]}`, modifier, 'TS');
  }));
  container.querySelectorAll('[data-roll-damage]').forEach((btn) => btn.addEventListener('click', () => {
    const [companionId, attackIndex] = String(btn.dataset.rollDamage || '').split(':');
    const companion = companions.find((entry) => String(entry.id) === companionId);
    if (!companion) return;
    const attack = normalizeStatBlock(companion.stat_block).attacks[Number(attackIndex) || 0];
    const damageNotation = String(attack?.damage || '').trim();
    if (!damageNotation || damageNotation === '-') {
      createToast('Danni non configurati per questo attacco', 'error');
      return;
    }
    openDiceOverlay({
      keepOpen: true,
      title: `${companion.name} · Danni ${attack.name || 'Attacco'}`,
      mode: 'generic',
      notation: damageNotation,
      modifier: Number(attack.damage_modifier) || 0,
      rollType: 'DMG',
      historyLabel: `${companion.name} · ${attack.name || 'Danni'}`
    });
  }));
  const rollCompanionAttack = (rollKey) => {
    const [companionId, attackIndex] = String(rollKey || '').split(':');
    const companion = companions.find((entry) => String(entry.id) === companionId);
    if (!companion) return;
    const attack = normalizeStatBlock(companion.stat_block).attacks[Number(attackIndex) || 0];
    if (!attack) return;
    openRollWithModifier(`${companion.name} · Tiro per colpire · ${attack.name || 'Attacco'}`, Number(attack.to_hit) || 0, 'TC');
  };
  container.querySelectorAll('[data-roll-attack-card]').forEach((card) => {
    card.addEventListener('click', (event) => {
      if (event.target.closest('button')) return;
      rollCompanionAttack(card.dataset.rollAttackCard);
    });
    card.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      rollCompanionAttack(card.dataset.rollAttackCard);
    });
  });
  container.querySelectorAll('[data-roll-attack]').forEach((btn) => btn.addEventListener('click', () => {
    rollCompanionAttack(btn.dataset.rollAttack);
  }));
}
