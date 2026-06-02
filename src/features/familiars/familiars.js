import { createCompanion, deleteCompanion, fetchCompanions, updateCompanion } from '../character/companionsApi.js';
import { getState, normalizeCharacterId } from '../../app/state.js';
import { attachNumberSteppers, buildInput, buildTextarea, createToast, openConfirmModal, openFormModal, setGlobalLoading } from '../../ui/components.js';
import { openDiceOverlay } from '../dice-roller/overlay/dice.js';
import { getAbilityModifier } from '../character/home/utils.js';

const ABILITY_KEYS = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
const ABILITY_LABELS = { str: 'FOR', dex: 'DES', con: 'COS', int: 'INT', wis: 'WIS', cha: 'CAR' };
const KIND_OPTIONS = [
  { value: 'familiar', label: 'Famiglio' },
  { value: 'summon', label: 'Evocazione' },
  { value: 'transformation', label: 'Trasformazione' }
];

const SPEED_LABELS = {
  walk: { label: 'Terra', icon: '🏃' },
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
    hp: { current: 1, max: 1 },
    speeds: { walk: 9, fly: null, climb: null, burrow: null },
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
  const imageUrl = statBlock.image_url?.trim();
  const avatar = imageUrl
    ? `<img src="${escapeHtml(imageUrl)}" alt="Foto di ${escapeHtml(companion.name)}" />`
    : '<span aria-hidden="true">🐾</span>';

  return `
    <button class="familiar-quick-card ${isSelected ? 'is-active' : ''}" type="button" data-select-companion="${escapeHtml(companion.id)}" aria-pressed="${isSelected}">
      <span class="familiar-quick-card__avatar">${avatar}</span>
      <span class="familiar-quick-card__body">
        <strong>${escapeHtml(companion.name)}</strong>
        <span>${escapeHtml(formatKind(companion.kind))} · HP ${hpCurrent}/${hpMax}</span>
      </span>
    </button>
  `;
}

function buildCompanionCard(companion, isSelected = false) {
  const statBlock = normalizeStatBlock(companion.stat_block);
  const imageUrl = statBlock.image_url?.trim();
  const avatar = imageUrl
    ? `<img src="${escapeHtml(imageUrl)}" alt="Foto di ${escapeHtml(companion.name)}" />`
    : '<span aria-hidden="true">🐾</span>';
  const abilities = ABILITY_KEYS.map((key) => {
    const score = Number(statBlock.abilities?.[key]) || 10;
    const mod = getAbilityModifier(score) ?? 0;
    return `
      <button class="stat-card stat-card--${key} stat-card--button" type="button" data-roll-ability="${escapeHtml(companion.id)}:${key}" aria-label="Tira ${ABILITY_LABELS[key]} per ${escapeHtml(companion.name)}">
        <span>${ABILITY_LABELS[key]}</span>
        <strong>${score}</strong>
        <span class="stat-card__modifier">${formatSigned(mod)}</span>
      </button>
    `;
  }).join('');
  const savingThrows = ABILITY_KEYS.map((key) => {
    const modifier = getSavingThrowModifier(statBlock, key);
    const isProficient = Boolean(statBlock.saving_throws?.[key]);
    return `
      <button class="modifier-card modifier-card--interactive familiar-save-card ${isProficient ? 'modifier-card--proficiency' : ''}" type="button" data-roll-save="${escapeHtml(companion.id)}:${key}" aria-label="Tira salvezza ${ABILITY_LABELS[key]} per ${escapeHtml(companion.name)}">
        <div class="modifier-title">
          <strong>${ABILITY_LABELS[key]}</strong>
          ${isProficient ? '<span class="modifier-ability">Comp.</span>' : ''}
        </div>
        <div class="modifier-value">${formatSigned(modifier)}</div>
      </button>
    `;
  }).join('');
  const speeds = Object.entries(SPEED_LABELS).map(([key, config]) => `
    <div class="armor-class-card armor-class-card--speed familiar-speed-card">
      <span>${config.label}</span>
      <strong>${formatSpeed(statBlock.speeds?.[key])}</strong>
      <span class="armor-class-card__sigil" aria-hidden="true">${config.icon}</span>
    </div>
  `).join('');
  const attacks = statBlock.attacks.length
    ? statBlock.attacks.map((attack, index) => `
      <div class="weapon-card familiar-attack-card">
        <div class="weapon-card__main">
          <strong>${escapeHtml(attack.name || `Attacco ${index + 1}`)}</strong>
          <p class="muted">Tiro per colpire ${formatSigned(attack.to_hit || 0)} · Danni ${escapeHtml(attack.damage || '-')}</p>
        </div>
        <button class="icon-button icon-button--dice" type="button" data-roll-attack="${escapeHtml(companion.id)}:${index}" aria-label="Tira ${escapeHtml(attack.name || `Attacco ${index + 1}`)}">🎲</button>
      </div>
    `).join('')
    : '<p class="muted">Nessun attacco configurato.</p>';
  const notes = companion.notes?.trim()
    ? `<div class="detail-card detail-card--text familiar-notes"><p>${escapeHtml(companion.notes)}</p></div>`
    : '<p class="muted">Nessuna nota aggiunta.</p>';
  const hpCurrent = Number(statBlock.hp.current) || 0;
  const hpMax = Math.max(Number(statBlock.hp.max) || hpCurrent || 1, 1);
  const hpPercent = Math.min(Math.max((hpCurrent / hpMax) * 100, 0), 100);

  return `
    <article class="card home-card home-section familiar-sheet ${isSelected ? 'is-active' : ''}" data-familiar-panel="${escapeHtml(companion.id)}" ${isSelected ? '' : 'hidden'}>
      <header class="card-header familiar-sheet__header">
        <div>
          <p class="eyebrow">${escapeHtml(formatKind(companion.kind))}</p>
          <h3>${escapeHtml(companion.name)}</h3>
        </div>
        <div class="button-row">
          <button class="icon-button" data-edit-companion="${escapeHtml(companion.id)}" type="button" aria-label="Modifica ${escapeHtml(companion.name)}">✏️</button>
          <button class="icon-button" data-delete-companion="${escapeHtml(companion.id)}" type="button" aria-label="Elimina ${escapeHtml(companion.name)}">🗑️</button>
        </div>
      </header>
      <div class="familiar-dashboard">
        <div class="character-summary familiar-summary">
          <div class="character-hero">
            <div class="familiar-avatar ${imageUrl ? 'familiar-avatar--image' : ''}">${avatar}</div>
            <div>
              <h3 class="character-name">${escapeHtml(companion.name)}</h3>
              <div class="character-meta">
                <span class="meta-tag">${escapeHtml(formatKind(companion.kind))}</span>
                <span class="meta-tag">Regole ${escapeHtml(companion.rules_version || '2024')}</span>
                <span class="meta-tag">Bonus comp. ${formatSigned(statBlock.proficiency_bonus)}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="stat-panel familiar-abilities-panel">
          <header class="familiar-panel-title">
            <p class="eyebrow">Tiri abilità</p>
          </header>
          <div class="stat-grid stat-grid--compact stat-grid--abilities familiar-ability-grid">${abilities}</div>
        </div>
        <div class="hp-panel familiar-vitals-panel">
          <div class="hp-bar-row familiar-hp-row">
            <div class="hp-bar-stack">
              <div class="hp-bar-label">
                <span>HP</span>
                <strong>${hpCurrent}/${hpMax}</strong>
              </div>
              <div class="hp-bar-track">
                <div class="hp-bar" style="flex: 1;">
                  <div class="hp-bar__fill" style="width: ${hpPercent}%;"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="familiar-speed-grid">${speeds}</div>
        </div>
        <section class="home-section familiar-detail-panel familiar-saves-panel">
          <header class="familiar-panel-title">
            <p class="eyebrow">Tiri salvezza</p>
          </header>
          <div class="familiar-save-grid">${savingThrows}</div>
        </section>
        <section class="home-section home-scroll-panel familiar-detail-panel familiar-attacks-panel">
          <header class="familiar-panel-title">
            <p class="eyebrow">Attacchi</p>
          </header>
          <div class="home-scroll-body">${attacks}</div>
        </section>
        <section class="home-section familiar-detail-panel familiar-notes-panel">
          <header class="familiar-panel-title">
            <p class="eyebrow">Note</p>
          </header>
          ${notes}
        </section>
      </div>
    </article>
  `;
}

function openRollWithModifier(label, modifier) {
  openDiceOverlay({
    keepOpen: true,
    title: label,
    mode: 'generic',
    notation: '1d20',
    modifier: Number(modifier) || 0,
    rollType: 'CHECK',
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

  setGlobalLoading(true);
  let companions = [];
  try {
    companions = state.offline ? [] : await fetchCompanions(activeCharacter.id);
  } catch {
    createToast('Errore caricamento famigli', 'error');
  } finally {
    setGlobalLoading(false);
  }

  const selectedCompanionId = companions[0]?.id;
  container.innerHTML = `
    <div class="home-layout familiars-layout">
      <section class="card home-card home-section familiars-page-header">
        <header class="card-header">
          <div>
            <p class="eyebrow">Famigli & Mostri</p>
            <h3>Schede famiglio</h3>
          </div>
          <div class="button-row">
            <button class="icon-button icon-button--add" type="button" data-add-companion aria-label="Nuova scheda"><span aria-hidden="true">+</span></button>
          </div>
        </header>
        <p class="muted">Gestisci più famigli con una selezione rapida e una scheda compatta ispirata alla scheda personaggio.</p>
      </section>
      ${companions.length ? `
        <aside class="card home-card home-section familiars-quick-panel" aria-label="Seleziona famiglio">
          <div class="familiars-quick-panel__header">
            <p class="eyebrow">Selezione rapida</p>
            <span class="meta-tag">${companions.length} schede</span>
          </div>
          <div class="familiars-quick-list">
            ${companions.map((companion) => buildCompanionQuickButton(companion, companion.id === selectedCompanionId)).join('')}
          </div>
        </aside>
        <main class="familiars-detail-area">
          ${companions.map((companion) => buildCompanionCard(companion, companion.id === selectedCompanionId)).join('')}
        </main>
      ` : `
        <section class="card home-card home-section familiar-empty-state">
          <p class="eyebrow">Nessuna scheda</p>
          <h3>Crea il primo famiglio</h3>
          <p class="muted">Aggiungi foto, caratteristiche, punti ferita, velocità, tiri salvezza e attacchi per tirare rapidamente durante la sessione.</p>
        </section>
      `}
    </div>
  `;

  const openCompanionForm = async (companion = null) => {
    const current = normalizeStatBlock(companion?.stat_block);
    let draftAttacks = (current.attacks || []).map((attack) => ({
      name: attack?.name || '',
      to_hit: Number(attack?.to_hit) || 0,
      damage: attack?.damage || ''
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
      { label: 'Terra (m)', name: 'speed_walk', value: current.speeds.walk ?? 9 },
      { label: 'Volo (m)', name: 'speed_fly', value: current.speeds.fly ?? '' },
      { label: 'Scalata (m)', name: 'speed_climb', value: current.speeds.climb ?? '' },
      { label: 'Scavare (m)', name: 'speed_burrow', value: current.speeds.burrow ?? '' }
    ].forEach((config) => {
      const field = buildInput({ label: config.label, name: config.name, type: 'number', value: config.value });
      const input = field.querySelector('input');
      input.min = '0';
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
        damage: row.querySelector('[name^="attack_damage_"]')?.value || ''
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
        grid.appendChild(buildInput({ label: 'Danni', name: `attack_damage_${index}`, value: attack.damage, placeholder: 'Es. 1d6+2' }));
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
      draftAttacks.push({ name: '', to_hit: 0, damage: '' });
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
      damage: String(formData.get(`attack_damage_${index}`) || '').trim()
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
        abilities,
        saving_throws: ABILITY_KEYS.reduce((acc, key) => {
          acc[key] = formData.get(`save_${key}`) === 'on';
          return acc;
        }, {}),
        hp: { current: Number(formData.get('hp_current') || 1), max: Number(formData.get('hp_max') || 1) },
        speeds: {
          walk: Number(formData.get('speed_walk') || 0),
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
    await renderFamiliars(container);
  };

  container.querySelector('[data-add-companion]')?.addEventListener('click', () => { void openCompanionForm(); });
  container.querySelectorAll('[data-select-companion]').forEach((btn) => btn.addEventListener('click', () => {
    const companionId = btn.dataset.selectCompanion;
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
    await renderFamiliars(container);
  }));

  container.querySelectorAll('[data-roll-ability]').forEach((btn) => btn.addEventListener('click', () => {
    const [companionId, abilityKey] = String(btn.dataset.rollAbility || '').split(':');
    const companion = companions.find((entry) => String(entry.id) === companionId);
    if (!companion || !ABILITY_KEYS.includes(abilityKey)) return;
    const score = Number(normalizeStatBlock(companion.stat_block).abilities[abilityKey]) || 10;
    const modifier = getAbilityModifier(score) ?? 0;
    openRollWithModifier(`${companion.name} · ${ABILITY_LABELS[abilityKey]}`, modifier);
  }));
  container.querySelectorAll('[data-roll-save]').forEach((btn) => btn.addEventListener('click', () => {
    const [companionId, abilityKey] = String(btn.dataset.rollSave || '').split(':');
    const companion = companions.find((entry) => String(entry.id) === companionId);
    if (!companion || !ABILITY_KEYS.includes(abilityKey)) return;
    const modifier = getSavingThrowModifier(normalizeStatBlock(companion.stat_block), abilityKey);
    openRollWithModifier(`${companion.name} · TS ${ABILITY_LABELS[abilityKey]}`, modifier);
  }));
  container.querySelectorAll('[data-roll-attack]').forEach((btn) => btn.addEventListener('click', () => {
    const [companionId, attackIndex] = String(btn.dataset.rollAttack || '').split(':');
    const companion = companions.find((entry) => String(entry.id) === companionId);
    if (!companion) return;
    const attack = normalizeStatBlock(companion.stat_block).attacks[Number(attackIndex) || 0];
    if (!attack) return;
    openRollWithModifier(`${companion.name} · ${attack.name || 'Attacco'}`, Number(attack.to_hit) || 0);
  }));
}
