import { createCharacter, updateCharacter } from '../characterApi.js';
import { getState, setActiveCharacter, setState } from '../../../app/state.js';
import { cacheSnapshot } from '../../../lib/offline/cache.js';
import {
  buildInput,
  buildSelect,
  buildTextarea,
  createToast,
  openFormModal,
} from '../../../ui/components.js';
import {
  abilityShortLabel,
  conditionList,
  damageTypeList,
  equipmentProficiencyList,
  savingThrowList,
  skillList
} from './constants.js';
import { getAbilityModifier, getEquipSlots, normalizeNumber } from './utils.js';


function attachDrawerNumberStepper(input, {
  decrementLabel = 'Diminuisci valore',
  incrementLabel = 'Aumenta valore'
} = {}) {
  if (!(input instanceof HTMLInputElement) || input.type !== 'number') return;
  if (input.closest('.drawer-number-stepper')) return;
  const wrapper = document.createElement('div');
  wrapper.className = 'number-stepper drawer-number-stepper';
  const dec = document.createElement('button');
  dec.type = 'button';
  dec.className = 'number-stepper__button';
  dec.textContent = '−';
  dec.setAttribute('aria-label', decrementLabel);
  const inc = document.createElement('button');
  inc.type = 'button';
  inc.className = 'number-stepper__button';
  inc.textContent = '+';
  inc.setAttribute('aria-label', incrementLabel);
  const parent = input.parentNode;
  if (!parent) return;
  parent.insertBefore(wrapper, input);
  wrapper.append(dec, input, inc);
  const step = (direction) => {
    const current = Number.isFinite(input.valueAsNumber) ? input.valueAsNumber : Number(input.value || 0);
    const stepValue = Number(input.step);
    const delta = Number.isFinite(stepValue) && stepValue > 0 ? stepValue : 1;
    let next = current + (delta * direction);
    const min = input.min !== '' ? Number(input.min) : null;
    const max = input.max !== '' ? Number(input.max) : null;
    if (Number.isFinite(min)) next = Math.max(min, next);
    if (Number.isFinite(max)) next = Math.min(max, next);
    input.value = String(next);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  };

  let pointerHandled = false;
  const onPointerStep = (event, direction) => {
    if (typeof event.button === 'number' && event.button !== 0) return;
    event.preventDefault();
    pointerHandled = true;
    input.focus({ preventScroll: true });
    step(direction);
  };
  const onClickStep = (direction) => {
    if (pointerHandled) {
      pointerHandled = false;
      return;
    }
    step(direction);
  };

  dec.addEventListener('pointerdown', (event) => onPointerStep(event, -1));
  inc.addEventListener('pointerdown', (event) => onPointerStep(event, 1));
  dec.addEventListener('click', () => onClickStep(-1));
  inc.addEventListener('click', () => onClickStep(1));
}

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

const conditionLabels = conditionList.reduce((acc, condition) => {
  acc[condition.key] = condition.label;
  return acc;
}, {});

function escapeAttribute(value) {
  return (value || '').toString()
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getCharacterConditions(data) {
  if (Array.isArray(data?.conditions)) return data.conditions;
  if (data?.condition) return [data.condition];
  return [];
}

function formatConditionNames(keys) {
  return keys.map((key) => conditionLabels[key] || key).filter(Boolean).join(', ');
}

function hasEquippedHeavyArmor(items = []) {
  return (items || []).some((item) => item.category === 'armor'
    && item.armor_type === 'heavy'
    && item.equipable
    && getEquipSlots(item).length);
}

function getDrawerAttackRollEntries(characterData, items = []) {
  const equippedWeapons = (items || []).filter((item) => item.category === 'weapon' && item.equipable && getEquipSlots(item).length);
  const weaponEntries = equippedWeapons.map((weapon) => ({
    key: `weapon:${weapon.id ?? weapon.name}`,
    label: weapon.name || 'Arma'
  }));
  const spells = Array.isArray(characterData?.spells) ? characterData.spells : [];
  const spellEntries = spells
    .filter((spell) => {
      const isCantrip = spell.kind === 'cantrip' || Number(spell.level) === 0;
      return isCantrip && spell.attack_roll && spell.damage_die;
    })
    .map((spell) => ({
      key: `spell:${spell.id}`,
      label: spell.name || 'Incantesimo'
    }));
  const spellcasting = characterData?.spellcasting || {};
  const hasSpellAttack = Boolean(spellcasting.ability && normalizeNumber(characterData?.proficiency_bonus) !== null);
  const genericSpellEntry = hasSpellAttack ? [{ key: 'spell-attack', label: 'Incantesimi' }] : [];
  return [...weaponEntries, ...spellEntries, ...genericSpellEntry];
}

function getAutomaticDrawerAttackEffects(characterData) {
  const conditions = getCharacterConditions(characterData);
  const advantage = conditions.filter((key) => ['invisibile'].includes(key));
  const disadvantage = conditions.filter((key) => ['accecato', 'avvelenato', 'intralciato', 'prono', 'spaventato'].includes(key));
  const effects = [];
  if (advantage.length) effects.push(`Vantaggio: condizioni ${formatConditionNames(advantage)}.`);
  if (disadvantage.length) effects.push(`Svantaggio: condizioni ${formatConditionNames(disadvantage)}.`);
  return effects;
}

function getAutomaticDrawerRollEffects(characterData, items, scope, entry) {
  const conditions = getCharacterConditions(characterData);
  const effects = [];
  if (scope === 'attack_rolls') {
    effects.push(...getAutomaticDrawerAttackEffects(characterData));
  }
  if (scope === 'skills') {
    const poisoned = conditions.includes('avvelenato') ? ['avvelenato'] : [];
    if (poisoned.length) {
      effects.push(`Svantaggio: condizioni ${formatConditionNames(poisoned)}.`);
    }
    if (entry.key === 'stealth' && hasEquippedHeavyArmor(items)) {
      effects.push('Svantaggio automatico: armatura pesante su Furtività.');
    }
  }
  if (scope === 'saving_throws' && entry.key === 'dex' && conditions.includes('intralciato')) {
    effects.push('Svantaggio: condizioni Intralciato.');
  }
  return effects;
}

export async function openCharacterDrawer(user, onSave, character = null) {
  if (!user) return;
  const characterData = character?.data || {};
  const hp = characterData.hp || {};
  const hitDice = characterData.hit_dice || {};
  const abilities = characterData.abilities || {};
  const skillStates = characterData.skills || {};
  const skillMasteryStates = characterData.skill_mastery || {};
  const specialSkillRolls = Array.isArray(characterData.special_skill_rolls) ? characterData.special_skill_rolls : [];
  const savingStates = characterData.saving_throws || {};
  const proficiencies = characterData.proficiencies || {};
  const damageDefenses = characterData.damage_defenses || {};
  const rollAdjustments = characterData.roll_adjustments || {};
  const drawerItems = getState().cache.items || [];
  const acAbilityModifiers = characterData.ac_ability_modifiers || {};
  const spellcasting = characterData.spellcasting || {};
  const spellSlots = spellcasting.slots || {};
  const spellSlotsMax = spellcasting.slots_max || {};
  const enhanceNumericFields = (root) => {
    root?.querySelectorAll('input[type="number"]').forEach((input) => {
      const fieldLabel = input.closest('.field')?.querySelector('span')?.textContent?.trim();
      attachDrawerNumberStepper(input, {
        decrementLabel: fieldLabel ? `Riduci ${fieldLabel}` : 'Diminuisci valore',
        incrementLabel: fieldLabel ? `Aumenta ${fieldLabel}` : 'Aumenta valore'
      });
    });
  };
  const form = document.createElement('div');
  form.className = 'character-edit-form character-edit-form--guided';
  const buildEditGroup = (title, sections, { icon = '', description = '' } = {}) => {
    const group = document.createElement('section');
    group.className = 'character-edit-group';

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

    const content = document.createElement('div');
    content.className = 'character-edit-group__content';
    sections.forEach((section) => {
      section.classList.add('character-edit-subsection');
      content.appendChild(section);
    });
    group.append(header, content);
    return group;
  };

  const mainSection = document.createElement('div');
  mainSection.className = 'character-edit-section';
 
  const identityRow = document.createElement('div');
  identityRow.className = 'character-edit-grid character-edit-grid--identity';
  const nameField = buildInput({ label: 'Nome', name: 'name', placeholder: 'Es. Aria', value: character?.name ?? '' });
  nameField.querySelector('input').required = true;
  identityRow.appendChild(nameField);
  identityRow.appendChild(buildInput({ label: 'Classe', name: 'class_name', value: characterData.class_name ?? characterData.class_archetype ?? '' }));
  identityRow.appendChild(buildInput({ label: 'Archetipo', name: 'archetype', value: characterData.archetype ?? '' }));
  mainSection.appendChild(identityRow);
  const mainGrid = document.createElement('div');
  mainGrid.className = 'character-edit-grid';
  mainGrid.appendChild(buildInput({ label: 'Livello', name: 'level', type: 'number', value: characterData.level ?? '' }));
  mainGrid.appendChild(buildInput({ label: 'Razza', name: 'race', value: characterData.race ?? '' }));
  mainGrid.appendChild(buildInput({ label: 'Allineamento', name: 'alignment', value: characterData.alignment ?? '' }));
  mainSection.appendChild(mainGrid);
  mainSection.appendChild(buildInput({
    label: 'Foto (URL)',
    name: 'avatar_url',
    placeholder: 'https://.../ritratto.png',
    value: characterData.avatar_url ?? ''
  }));
  const backgroundSection = document.createElement('div');
  backgroundSection.className = 'character-edit-section';
  const backgroundGrid = document.createElement('div');
  backgroundGrid.className = 'character-edit-grid';
  backgroundGrid.appendChild(buildInput({ label: 'Background', name: 'background', value: characterData.background ?? '' }));
  backgroundSection.appendChild(backgroundGrid);
  backgroundSection.appendChild(buildTextarea({
    label: 'Descrizione background',
    name: 'description',
    placeholder: 'Dettagli sul background, origini e tratti distintivi...',
    value: characterData.description ?? ''
  }));

  const statsSection = document.createElement('div');
  statsSection.className = 'character-edit-section';

  const hpRow = document.createElement('div');
  hpRow.className = 'life-armor-row life-armor-row--hp';
  hpRow.appendChild(buildInput({ label: 'HP attuali', name: 'hp_current', type: 'number', value: hp.current ?? 0 }));
  hpRow.appendChild(buildInput({ label: 'HP massimi', name: 'hp_max', type: 'number', value: hp.max ?? 0 }));
  hpRow.appendChild(buildInput({ label: 'HP temporanei', name: 'hp_temp', type: 'number', value: hp.temp ?? 0 }));

  const hitDiceRow = document.createElement('div');
  hitDiceRow.className = 'life-armor-row life-armor-row--hit-dice';
  hitDiceRow.appendChild(buildInput({ label: 'Dado vita (es. d8)', name: 'hit_dice_die', value: hitDice.die ?? '' }));
  hitDiceRow.appendChild(buildInput({ label: 'Dadi vita totali', name: 'hit_dice_max', type: 'number', value: hitDice.max ?? 0 }));
  hitDiceRow.appendChild(buildInput({ label: 'Dadi vita usati', name: 'hit_dice_used', type: 'number', value: hitDice.used ?? 0 }));

  const armorRow = document.createElement('div');
  armorRow.className = 'life-armor-row life-armor-row--armor';
  armorRow.appendChild(buildInput({ label: 'Classe Armatura', name: 'ac', type: 'number', value: characterData.ac ?? 0 }));
  armorRow.appendChild(buildInput({
    label: 'Modificatore CA totale',
    name: 'ac_bonus',
    type: 'number',
    value: characterData.ac_bonus ?? 0
  }));

  statsSection.append(hpRow, hitDiceRow, armorRow);

  const acSection = document.createElement('div');
  acSection.className = 'character-edit-section compact-ac-options';
  acSection.innerHTML = `
    <div class="compact-ac-options__header">
      <h4>Opzioni CA base</h4>
      <span class="muted">Base 10 + DES; extra mod.</span>
    </div>
    <div class="compact-pill-grid compact-ac-options__grid">
      ${[
    { key: 'str', label: 'Forza' },
    { key: 'con', label: 'Costituzione' },
    { key: 'int', label: 'Intelligenza' },
    { key: 'wis', label: 'Saggezza' },
    { key: 'cha', label: 'Carisma' }
  ].map((ability) => `
        <label class="toggle-pill">
          <input type="checkbox" name="ac_mod_${ability.key}" ${acAbilityModifiers[ability.key] ? 'checked' : ''} />
          <span>${ability.label}</span>
        </label>
      `).join('')}
    </div>
  `;
  const abilitySection = document.createElement('div');
  abilitySection.className = 'character-edit-section compact-character-section';
  abilitySection.innerHTML = '<h4>Caratteristiche</h4>';
  const abilityGrid = document.createElement('div');
  abilityGrid.className = 'compact-ability-grid';
  abilityGrid.appendChild(buildInput({ label: 'Forza', name: 'ability_str', type: 'number', value: abilities.str ?? 0 }));
  abilityGrid.appendChild(buildInput({ label: 'Destrezza', name: 'ability_dex', type: 'number', value: abilities.dex ?? 0 }));
  abilityGrid.appendChild(buildInput({ label: 'Costituzione', name: 'ability_con', type: 'number', value: abilities.con ?? 0 }));
  abilityGrid.appendChild(buildInput({ label: 'Intelligenza', name: 'ability_int', type: 'number', value: abilities.int ?? 0 }));
  abilityGrid.appendChild(buildInput({ label: 'Saggezza', name: 'ability_wis', type: 'number', value: abilities.wis ?? 0 }));
  abilityGrid.appendChild(buildInput({ label: 'Carisma', name: 'ability_cha', type: 'number', value: abilities.cha ?? 0 }));
  abilitySection.appendChild(abilityGrid);
  const abilityMetaGrid = document.createElement('div');
  abilityMetaGrid.className = 'compact-character-meta-grid';
  abilityMetaGrid.appendChild(buildInput({ label: 'Bonus competenza', name: 'proficiency_bonus', type: 'number', value: characterData.proficiency_bonus ?? 0 }));
  abilityMetaGrid.appendChild(buildInput({ label: 'Iniziativa', name: 'initiative', type: 'number', value: characterData.initiative ?? 0 }));
  abilityMetaGrid.appendChild(buildInput({ label: 'Velocità', name: 'speed', type: 'number', value: characterData.speed ?? 0 }));
  const darkvisionField = document.createElement('div');
  darkvisionField.className = 'modal-toggle-field compact-darkvision-toggle';
  darkvisionField.innerHTML = `
    <span class="modal-toggle-field__label">Scurovisione</span>
    <label class="diceov-toggle condition-modal__toggle">
      <input type="checkbox" name="darkvision_enabled" ${characterData.darkvision_enabled ? 'checked' : ''} />
      <span class="diceov-toggle-track" aria-hidden="true"></span>
    </label>
  `;
  const darkvisionRangeField = buildInput({
    label: 'Range scurovisione (m)',
    name: 'darkvision_range_m',
    type: 'number',
    value: characterData.darkvision_range_m ?? 18
  });
  abilityMetaGrid.appendChild(darkvisionField);
  abilityMetaGrid.appendChild(darkvisionRangeField);
  abilitySection.appendChild(abilityMetaGrid);

  const skillSection = document.createElement('div');
  skillSection.className = 'character-edit-section compact-character-section';
  skillSection.innerHTML = `
    <h4>Competenze e maestria</h4>
    <div class="compact-competency-grid">
      ${skillList.map((skill) => {
    const proficient = Boolean(skillStates[skill.key]);
    const mastery = Boolean(skillMasteryStates[skill.key]);
    return `
        <div class="compact-competency-row">
          <div class="character-skill-row__meta">
            <strong>${skill.label}</strong>
            <span class="muted">${abilityShortLabel[skill.ability]}</span>
          </div>
          <div class="character-toggle-group">
            <label class="toggle-pill">
              <input type="checkbox" name="skill_${skill.key}" ${proficient ? 'checked' : ''} />
              <span>Competenza</span>
            </label>
            <label class="toggle-pill">
              <input type="checkbox" name="mastery_${skill.key}" ${mastery ? 'checked' : ''} />
              <span>Maestria</span>
            </label>
          </div>
        </div>
      `;
  }).join('')}
    </div>
  `;

  const createSpecialSkillId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `special-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  };
  const normalizedSpecialSkillRolls = specialSkillRolls.map((entry, index) => ({
    id: String(entry?.id ?? `special-${index + 1}`),
    name: entry?.name ?? '',
    ability: abilityShortLabel[entry?.ability] ? entry.ability : 'str',
    proficient: Boolean(entry?.proficient),
    mastery: Boolean(entry?.mastery),
    bonus: Number(entry?.bonus ?? entry?.extra_bonus ?? entry?.modifier) || 0
  }));
  const hasInitiativeSpecialSkill = normalizedSpecialSkillRolls.some((entry) => {
    const id = String(entry.id ?? '').toLowerCase();
    const name = String(entry.name ?? '').trim().toLowerCase();
    return id === 'initiative' || id === 'default_initiative' || name === 'iniziativa';
  });
  let draftSpecialSkills = hasInitiativeSpecialSkill
    ? normalizedSpecialSkillRolls
    : [{
      id: 'default_initiative',
      name: 'Iniziativa',
      ability: 'dex',
      proficient: false,
      mastery: false,
      bonus: 0
    }, ...normalizedSpecialSkillRolls];

  const specialSkillAbilityOptions = [
    { value: 'str', label: 'Forza (FOR)' },
    { value: 'dex', label: 'Destrezza (DES)' },
    { value: 'con', label: 'Costituzione (COS)' },
    { value: 'int', label: 'Intelligenza (INT)' },
    { value: 'wis', label: 'Saggezza (SAG)' },
    { value: 'cha', label: 'Carisma (CAR)' }
  ];

  const specialSkillSection = document.createElement('div');
  specialSkillSection.className = 'character-edit-section compact-character-section';
  specialSkillSection.innerHTML = '<h4>Tiri abilità speciali</h4><p class="muted compact-settings-help">Crea tiri personalizzati (es. Forgiatura = FOR + competenza + 8).</p>';
  const specialSkillList = document.createElement('div');
  specialSkillList.className = 'compact-special-skill-list';
  const addSpecialSkillButton = document.createElement('button');
  addSpecialSkillButton.type = 'button';
  addSpecialSkillButton.className = 'ghost-button ghost-button--compact';
  addSpecialSkillButton.textContent = '+ Aggiungi tiro speciale';

  const readSpecialSkillRows = () => {
    draftSpecialSkills = draftSpecialSkills.map((entry, index) => {
      const row = specialSkillList.querySelector(`[data-special-skill-row="${entry.id}"]`);
      if (!row) return entry;
      const mastery = Boolean(row.querySelector(`input[name="special_skill_mastery_${index}"]`)?.checked);
      const proficient = Boolean(row.querySelector(`input[name="special_skill_proficient_${index}"]`)?.checked) || mastery;
      const ability = row.querySelector(`select[name="special_skill_ability_${index}"]`)?.value || entry.ability || 'str';
      return {
        ...entry,
        name: row.querySelector(`input[name="special_skill_name_${index}"]`)?.value ?? entry.name,
        ability: abilityShortLabel[ability] ? ability : 'str',
        proficient,
        mastery: mastery && proficient,
        bonus: Number(row.querySelector(`input[name="special_skill_bonus_${index}"]`)?.value || 0) || 0
      };
    });
  };

  const renderSpecialSkillRows = () => {
    specialSkillList.innerHTML = '';
    if (!draftSpecialSkills.length) {
      const emptyState = document.createElement('p');
      emptyState.className = 'muted';
      emptyState.textContent = 'Nessun tiro speciale configurato.';
      specialSkillList.appendChild(emptyState);
      return;
    }
    draftSpecialSkills.forEach((entry, index) => {
      const row = document.createElement('div');
      row.className = 'compact-special-skill-row';
      row.dataset.specialSkillRow = entry.id;

      const grid = document.createElement('div');
      grid.className = 'compact-special-skill-grid';
      grid.appendChild(buildInput({
        label: 'Nome',
        name: `special_skill_name_${index}`,
        value: entry.name,
        placeholder: 'Es. Forgiatura'
      }));

      const abilityField = document.createElement('label');
      abilityField.className = 'field';
      const abilityLabel = document.createElement('span');
      abilityLabel.textContent = 'Caratteristica';
      const abilitySelect = buildSelect(specialSkillAbilityOptions, entry.ability);
      abilitySelect.name = `special_skill_ability_${index}`;
      abilityField.append(abilityLabel, abilitySelect);
      grid.appendChild(abilityField);

      grid.appendChild(buildInput({
        label: 'Bonus extra',
        name: `special_skill_bonus_${index}`,
        type: 'number',
        value: entry.bonus
      }));

      const toggleGroup = document.createElement('div');
      toggleGroup.className = 'character-toggle-group';
      const proficiencyLabel = document.createElement('label');
      proficiencyLabel.className = 'toggle-pill';
      const proficiencyInput = document.createElement('input');
      proficiencyInput.type = 'checkbox';
      proficiencyInput.name = `special_skill_proficient_${index}`;
      proficiencyInput.checked = Boolean(entry.proficient);
      const proficiencyText = document.createElement('span');
      proficiencyText.textContent = 'Competenza';
      proficiencyLabel.append(proficiencyInput, proficiencyText);

      const masteryLabel = document.createElement('label');
      masteryLabel.className = 'toggle-pill';
      const masteryInput = document.createElement('input');
      masteryInput.type = 'checkbox';
      masteryInput.name = `special_skill_mastery_${index}`;
      masteryInput.checked = Boolean(entry.mastery);
      const masteryText = document.createElement('span');
      masteryText.textContent = 'Maestria';
      masteryLabel.append(masteryInput, masteryText);

      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'ghost-button ghost-button--compact';
      removeButton.textContent = 'Rimuovi';
      removeButton.dataset.removeSpecialSkill = entry.id;

      toggleGroup.append(proficiencyLabel, masteryLabel, removeButton);
      row.append(grid, toggleGroup);

      masteryInput.addEventListener('change', () => {
        if (masteryInput.checked) proficiencyInput.checked = true;
      });
      row.querySelectorAll('input[type="number"]').forEach((input) => {
        attachDrawerNumberStepper(input, {
          decrementLabel: 'Riduci bonus extra',
          incrementLabel: 'Aumenta bonus extra'
        });
      });
      removeButton.addEventListener('click', () => {
        readSpecialSkillRows();
        draftSpecialSkills = draftSpecialSkills.filter((item) => item.id !== entry.id);
        renderSpecialSkillRows();
      });
      specialSkillList.appendChild(row);
    });
  };
  addSpecialSkillButton.addEventListener('click', () => {
    readSpecialSkillRows();
    draftSpecialSkills.push({
      id: createSpecialSkillId(),
      name: '',
      ability: 'str',
      proficient: false,
      mastery: false,
      bonus: 0
    });
    renderSpecialSkillRows();
  });
  specialSkillSection.append(specialSkillList, addSpecialSkillButton);
  renderSpecialSkillRows();

  const savingSection = document.createElement('div');
  savingSection.className = 'character-edit-section compact-character-section';
  savingSection.innerHTML = `
    <h4>Tiri salvezza</h4>
    <div class="compact-pill-grid">
      ${savingThrowList.map((save) => {
    const proficient = Boolean(savingStates[save.key]);
    return `
        <label class="toggle-pill">
          <input type="checkbox" name="save_${save.key}" ${proficient ? 'checked' : ''} />
          <span>${save.label}</span>
        </label>
      `;
  }).join('')}
    </div>
  `;

  const proficiencySection = document.createElement('div');
  proficiencySection.className = 'character-edit-section compact-character-section';
  proficiencySection.innerHTML = `
    <h4>Competenze equipaggiamento</h4>
    <div class="compact-pill-grid">
      ${equipmentProficiencyList.map((prof) => {
    const proficient = Boolean(proficiencies[prof.key]);
    return `
        <label class="toggle-pill">
          <input type="checkbox" name="prof_${prof.key}" ${proficient ? 'checked' : ''} />
          <span>${prof.label}</span>
        </label>
      `;
  }).join('')}
    </div>
  `;

  const combatSection = document.createElement('div');
  combatSection.className = 'character-edit-section';
  combatSection.innerHTML = '<h4>Combattimento e magia</h4>';
  const combatBonusRow = document.createElement('div');
  combatBonusRow.className = 'character-edit-grid';
  combatBonusRow.appendChild(buildInput({
    label: 'Bonus danni extra (mischia)',
    name: 'damage_bonus_melee',
    type: 'number',
    value: characterData.damage_bonus_melee ?? characterData.damage_bonus ?? 0
  }));
  combatBonusRow.appendChild(buildInput({
    label: 'Bonus danni extra (distanza)',
    name: 'damage_bonus_ranged',
    type: 'number',
    value: characterData.damage_bonus_ranged ?? characterData.damage_bonus ?? 0
  }));
  combatSection.appendChild(combatBonusRow);
  const combatOtherRow = document.createElement('div');
  combatOtherRow.className = 'character-edit-grid';
  combatOtherRow.appendChild(buildInput({
    label: 'Attacchi extra',
    name: 'extra_attacks',
    type: 'number',
    value: characterData.extra_attacks ?? 0
  }));
  combatOtherRow.appendChild(buildInput({
    label: 'Dadi attacco furtivo',
    name: 'sneak_attack_dice',
    placeholder: 'Es. 2d6',
    value: characterData.sneak_attack_dice ?? ''
  }));
  combatSection.appendChild(combatOtherRow);
  const spellcasterField = document.createElement('div');
  spellcasterField.className = 'modal-toggle-field';
  spellcasterField.innerHTML = `
    <span class="modal-toggle-field__label">Incantatore</span>
    <label class="diceov-toggle condition-modal__toggle">
      <input type="checkbox" name="is_spellcaster" />
      <span class="diceov-toggle-track" aria-hidden="true"></span>
    </label>
  `;
  const spellcasterInput = spellcasterField.querySelector('input');
  if (spellcasterInput) {
    spellcasterInput.checked = Boolean(characterData.is_spellcaster);
  }
  combatSection.appendChild(spellcasterField);
  const spellcastingSection = document.createElement('div');
  spellcastingSection.className = 'character-edit-section spellcasting-section';
  spellcastingSection.innerHTML = '<h4>Incantesimi</h4>';
  const spellcastingGrid = document.createElement('div');
  spellcastingGrid.className = 'character-edit-grid';
  const spellcastingAbilityField = document.createElement('label');
  spellcastingAbilityField.className = 'field';
  spellcastingAbilityField.innerHTML = '<span>Caratteristica da incantatore</span>';
  const spellcastingAbilitySelect = buildSelect([
    { value: '', label: 'Seleziona...' },
    { value: 'int', label: 'Intelligenza' },
    { value: 'wis', label: 'Saggezza' },
    { value: 'cha', label: 'Carisma' },
    { value: 'str', label: 'Forza' },
    { value: 'dex', label: 'Destrezza' },
    { value: 'con', label: 'Costituzione' }
  ], spellcasting.ability ?? '');
  spellcastingAbilitySelect.name = 'spellcasting_ability';
  spellcastingAbilityField.appendChild(spellcastingAbilitySelect);
  spellcastingGrid.appendChild(spellcastingAbilityField);
  const spellSaveField = buildInput({
    label: 'CD incantesimi',
    name: 'spell_save_dc',
    type: 'number',
    value: ''
  });
  const spellSaveInput = spellSaveField.querySelector('input');
  if (spellSaveInput) {
    spellSaveInput.readOnly = true;
    spellSaveInput.disabled = true;
  }
  spellcastingGrid.appendChild(spellSaveField);
  const spellAttackField = buildInput({
    label: 'Tiro per colpire incantesimi',
    name: 'spell_attack_bonus',
    type: 'number',
    value: ''
  });
  const spellAttackInput = spellAttackField.querySelector('input');
  if (spellAttackInput) {
    spellAttackInput.readOnly = true;
    spellAttackInput.disabled = true;
  }
  spellcastingGrid.appendChild(spellAttackField);
  spellcastingSection.appendChild(spellcastingGrid);
  const slotGrid = document.createElement('div');
  slotGrid.className = 'spell-slot-edit-grid';
  Array.from({ length: 9 }, (_, index) => index + 1).forEach((level) => {
    const remainingSlots = Math.max(0, Number(spellSlots[level]) || 0);
    const totalSlots = Math.max(remainingSlots, Number(spellSlotsMax[level]) || 0);
    const usedSlots = Math.max(0, totalSlots - remainingSlots);
    const slotRow = document.createElement('div');
    slotRow.className = 'spell-slot-edit-row';
    slotRow.appendChild(buildInput({
      label: `Slot ${level}° totali`,
      name: `spell_slot_max_${level}`,
      type: 'number',
      value: totalSlots
    }));
    slotRow.appendChild(buildInput({
      label: 'Consumati',
      name: `spell_slot_used_${level}`,
      type: 'number',
      value: usedSlots
    }));
    slotGrid.appendChild(slotRow);
  });
  spellcastingSection.appendChild(slotGrid);
  const slotRechargeField = document.createElement('label');
  slotRechargeField.className = 'field';
  slotRechargeField.innerHTML = '<span>Ricarica slot</span>';
  const slotRechargeSelect = buildSelect([
    { value: 'short_rest', label: 'Riposo breve' },
    { value: 'long_rest', label: 'Riposo lungo' }
  ], spellcasting.recharge ?? 'long_rest');
  slotRechargeSelect.name = 'spell_slot_recharge';
  slotRechargeField.appendChild(slotRechargeSelect);
  spellcastingSection.appendChild(slotRechargeField);
  const canPrepareField = document.createElement('div');
  canPrepareField.className = 'modal-toggle-field';
  canPrepareField.innerHTML = `
    <span class="modal-toggle-field__label">Incantatore con preparazione</span>
    <label class="diceov-toggle condition-modal__toggle">
      <input type="checkbox" name="spell_can_prepare" />
      <span class="diceov-toggle-track" aria-hidden="true"></span>
    </label>
  `;
  const canPrepareInput = canPrepareField.querySelector('input');
  if (canPrepareInput) {
    canPrepareInput.checked = Boolean(spellcasting.can_prepare);
  }
  spellcastingSection.appendChild(canPrepareField);
  combatSection.appendChild(spellcastingSection);
  const abilityInputs = {
    str: abilitySection.querySelector('input[name="ability_str"]'),
    dex: abilitySection.querySelector('input[name="ability_dex"]'),
    con: abilitySection.querySelector('input[name="ability_con"]'),
    int: abilitySection.querySelector('input[name="ability_int"]'),
    wis: abilitySection.querySelector('input[name="ability_wis"]'),
    cha: abilitySection.querySelector('input[name="ability_cha"]')
  };
  const proficiencyInput = abilitySection.querySelector('input[name="proficiency_bonus"]');
  const syncSpellcastingDerived = () => {
    const selectedAbility = spellcastingAbilitySelect.value;
    const abilityValue = selectedAbility ? abilityInputs[selectedAbility]?.value : null;
    const abilityMod = getAbilityModifier(abilityValue);
    const proficiencyBonus = normalizeNumber(proficiencyInput?.value);
    const saveValue = abilityMod === null || proficiencyBonus === null
      ? ''
      : String(8 + abilityMod + proficiencyBonus);
    const attackValue = abilityMod === null || proficiencyBonus === null
      ? ''
      : String(abilityMod + proficiencyBonus);
    if (spellSaveInput) spellSaveInput.value = saveValue;
    if (spellAttackInput) spellAttackInput.value = attackValue;
  };
  const toggleSpellcastingSection = () => {
    if (!spellcasterInput) return;
    spellcastingSection.style.display = spellcasterInput.checked ? '' : 'none';
  };
  spellcasterInput?.addEventListener('change', toggleSpellcastingSection);
  spellcastingAbilitySelect.addEventListener('change', syncSpellcastingDerived);
  Object.values(abilityInputs).forEach((input) => input?.addEventListener('input', syncSpellcastingDerived));
  proficiencyInput?.addEventListener('input', syncSpellcastingDerived);
  toggleSpellcastingSection();
  syncSpellcastingDerived();

  const rollAdjustmentSection = document.createElement('div');
  rollAdjustmentSection.className = 'character-edit-section compact-settings-form compact-settings-form--rolls';
  const rollModeOptions = [
    { value: '', label: 'Nessuno' },
    { value: 'advantage', label: 'Vantaggio' },
    { value: 'disadvantage', label: 'Svantaggio' }
  ];
  const getAutomaticDrawerRollMode = (effects) => {
    const hasAdvantage = effects.some((effect) => effect.startsWith('Vantaggio'));
    const hasDisadvantage = effects.some((effect) => effect.startsWith('Svantaggio'));
    if (hasAdvantage && hasDisadvantage) return '';
    if (hasAdvantage) return 'advantage';
    if (hasDisadvantage) return 'disadvantage';
    return '';
  };
  const getAutomaticDrawerSource = (effects) => {
    if (effects.length !== 1) return '';
    if (effects[0].toLowerCase().includes('armatura')) return 'armor';
    if (effects[0].toLowerCase().includes('condizion')) return 'condition';
    return '';
  };
  const renderRollAdjustmentRows = (scope, entries) => entries.map((entry) => {
    const current = rollAdjustments?.[scope]?.[entry.key] || {};
    const automaticEffects = getAutomaticDrawerRollEffects(characterData, drawerItems, scope, entry);
    const selectedMode = current.mode || getAutomaticDrawerRollMode(automaticEffects);
    const selectedSource = current.source || getAutomaticDrawerSource(automaticEffects);
    return `
      <div class="compact-setting-row compact-setting-row--roll">
        <label class="field compact-setting-field">
          <span>${entry.label}</span>
          <select name="roll_${scope}_${entry.key}_mode">
            ${rollModeOptions.map((option) => `<option value="${option.value}" ${option.value === selectedMode ? 'selected' : ''}>${option.label}</option>`).join('')}
          </select>
        </label>
        <label class="field compact-setting-field">
          <span>Fonte manuale</span>
          <select name="roll_${scope}_${entry.key}_source">
            ${rollAdjustmentSourceOptions.map((option) => `<option value="${option.value}" ${option.value === selectedSource ? 'selected' : ''}>${option.label}</option>`).join('')}
          </select>
        </label>
        ${automaticEffects.length ? `<p class="muted compact-setting-note">Automatico: ${escapeAttribute(automaticEffects.join(' '))}</p>` : ''}
      </div>
    `;
  }).join('');
  rollAdjustmentSection.innerHTML = `
    <h4>Vantaggi & Svantaggi</h4>
    <p class="muted compact-settings-help">Registra solo override manuali; condizioni, armature ed effetti automatici vengono mostrati direttamente nelle righe.</p>
    <div class="character-edit-subsection compact-settings-section">
      <h5>Tiri per colpire</h5>
      <div class="compact-setting-grid compact-setting-grid--roll">
        ${renderRollAdjustmentRows('attack_rolls', getDrawerAttackRollEntries(characterData, drawerItems))}
      </div>
    </div>
    <div class="character-edit-subsection compact-settings-section">
      <h5>Tiri salvezza</h5>
      <div class="compact-setting-grid compact-setting-grid--roll">
        ${renderRollAdjustmentRows('saving_throws', savingThrowList)}
      </div>
    </div>
    <div class="character-edit-subsection compact-settings-section">
      <h5>Abilità</h5>
      <div class="compact-setting-grid compact-setting-grid--roll">
        ${renderRollAdjustmentRows('skills', skillList)}
      </div>
    </div>
  `;

  const damageDefenseSection = document.createElement('div');
  damageDefenseSection.className = 'character-edit-section compact-settings-form compact-settings-form--defenses';
  const groupedDamageTypes = damageTypeList.reduce((groups, type) => {
    const group = type.group || 'Altro';
    if (!groups[group]) groups[group] = [];
    groups[group].push(type);
    return groups;
  }, {});
  damageDefenseSection.innerHTML = `
    <h4>Resistenze & Immunità</h4>
    <p class="muted compact-settings-help">Seleziona rapidamente resistenza o immunità. “Tutti i danni” copre ogni tipo nella modale Subisci danno.</p>
    ${Object.entries(groupedDamageTypes).map(([group, types]) => `
      <div class="character-edit-subsection compact-settings-section">
        <h5>${group}</h5>
        <div class="compact-setting-grid compact-setting-grid--defense">
          ${types.map((type) => `
            <div class="compact-setting-row compact-setting-row--defense">
              <strong>${type.label}</strong>
              <div class="character-toggle-group">
                <label class="toggle-pill">
                  <input type="checkbox" name="damage_resistance_${type.key}" ${(Array.isArray(damageDefenses.resistances) && damageDefenses.resistances.includes(type.key)) ? 'checked' : ''} />
                  <span>Resistenza</span>
                </label>
                <label class="toggle-pill">
                  <input type="checkbox" name="damage_immunity_${type.key}" ${(Array.isArray(damageDefenses.immunities) && damageDefenses.immunities.includes(type.key)) ? 'checked' : ''} />
                  <span>Immunità</span>
                </label>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('')}
  `;

  const proficiencyNotesSection = document.createElement('div');
  proficiencyNotesSection.className = 'character-edit-section';
  proficiencyNotesSection.appendChild(buildTextarea({
    label: 'Competenze (strumenti, lingue, ecc.)',
    name: 'proficiency_notes',
    placeholder: 'Es. Strumenti: kit da ladro, strumenti musicali; Lingue: comune, elfico',
    value: characterData.proficiency_notes ?? ''
  }));
  const languageNotesSection = document.createElement('div');
  languageNotesSection.className = 'character-edit-section';
  languageNotesSection.appendChild(buildTextarea({
    label: 'Lingue conosciute',
    name: 'language_proficiencies',
    placeholder: 'Es. comune, elfico, draconico',
    value: characterData.language_proficiencies ?? ''
  }));
  const talentNotesSection = document.createElement('div');
  talentNotesSection.className = 'character-edit-section';
  talentNotesSection.appendChild(buildTextarea({
    label: 'Talenti',
    name: 'talents',
    placeholder: 'Es. Maestro d\'armi, Tiratore scelto',
    value: characterData.talents ?? ''
  }));

  const steps = [
    {
      title: 'Identità',
      icon: '🪪',
      description: 'Nome, classe, livello e ritratto: ciò che identifica subito il personaggio.',
      content: buildEditGroup('Identità', [mainSection], {
        icon: '🪪',
        description: 'Compila solo i dati narrativi e di scheda che vuoi vedere sempre in evidenza.'
      })
    },
    {
      title: 'Background',
      icon: '📜',
      description: 'Origini, storia e tratti descrittivi.',
      content: buildEditGroup('Background', [backgroundSection], {
        icon: '📜',
        description: 'Tieni qui storia, provenienza e dettagli di interpretazione senza mescolarli ai numeri.'
      })
    },
    {
      title: 'Caratteristiche e TS',
      icon: '🎲',
      description: 'Punteggi base, iniziativa, velocità e tiri salvezza.',
      content: buildEditGroup('Caratteristiche e Tiri Salvezza', [abilitySection, savingSection], {
        icon: '🎲',
        description: 'Imposta i punteggi principali: da qui derivano bonus, CD e molte prove.'
      })
    },
    {
      title: 'Vita e CA',
      icon: '❤️',
      description: 'Punti ferita, dadi vita e classe armatura.',
      content: buildEditGroup('Vita e Classe Armatura', [statsSection, acSection], {
        icon: '❤️',
        description: 'Controlla sopravvivenza e difesa senza cercare tra le impostazioni avanzate.'
      })
    },
    {
      title: 'Abilità',
      icon: '🧠',
      description: 'Competenze, maestrie e prove speciali.',
      content: buildEditGroup('Abilità', [skillSection, specialSkillSection], {
        icon: '🧠',
        description: 'Gestisci competenza, maestria e abilità personalizzate in un unico punto.'
      })
    },
    {
      title: 'Competenze e talenti',
      icon: '🏅',
      description: 'Equipaggiamenti, strumenti, lingue e talenti.',
      content: buildEditGroup('Competenze e Talenti', [
        proficiencySection,
        proficiencyNotesSection,
        languageNotesSection,
        talentNotesSection
      ], {
        icon: '🏅',
        description: 'Separa le competenze operative dalle note libere su lingue e talenti.'
      })
    },
    {
      title: 'Combattimento e magia',
      icon: '⚔️',
      description: 'Attacchi, danni, incantesimi e slot.',
      content: buildEditGroup('Combattimento e magia', [combatSection], {
        icon: '⚔️',
        description: 'Raccoglie i parametri usati durante il turno: attacchi, bonus, incantesimi e risorse.'
      })
    },
    {
      title: 'Vantaggi & Svantaggi',
      icon: '↕️',
      description: 'Override manuali per tiri e prove.',
      content: buildEditGroup('Vantaggi & Svantaggi', [rollAdjustmentSection], {
        icon: '↕️',
        description: 'Imposta solo le eccezioni manuali: gli effetti automatici restano indicati nelle righe.'
      })
    },
    {
      title: 'Resistenze & Immunità',
      icon: '🛡️',
      description: 'Riduzioni e immunità per tipo di danno.',
      content: buildEditGroup('Resistenze & Immunità', [damageDefenseSection], {
        icon: '🛡️',
        description: 'Seleziona difese e immunità in modo compatto, raggruppate per famiglia di danno.'
      })
    }
  ];

  const stepper = document.createElement('div');
  stepper.className = 'character-edit-stepper';
  const stepperNav = document.createElement('ol');
  stepperNav.className = 'character-edit-stepper-nav';
  const stepperContent = document.createElement('div');
  stepperContent.className = 'character-edit-stepper-content';
  const stepperActions = document.createElement('div');
  stepperActions.className = 'character-edit-stepper-actions';
  stepperActions.classList.add('character-edit-stepper-actions--footer');
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
        <span class="character-edit-stepper-title">${step.icon ? `${step.icon} ` : ''}${step.title}</span>
        <span class="character-edit-stepper-description">${step.description ?? ''}</span>
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

  const getStepFields = (panel) => Array.from(panel.querySelectorAll('input, select, textarea'));
  const isStepComplete = (panel) => {
    const fields = getStepFields(panel);
    if (!fields.length) return true;
    return fields
      .filter((field) => field.required)
      .every((field) => field.checkValidity());
  };

  let activeStepIndex = 0;
  const updateStepperState = () => {
    const completion = stepPanels.map((panel) => isStepComplete(panel));
    const firstIncomplete = completion.findIndex((done) => !done);
    const maxAllowed = firstIncomplete === -1 ? stepPanels.length - 1 : firstIncomplete;
    stepPanels.forEach((panel, index) => {
      panel.classList.toggle('is-active', index === activeStepIndex);
    });
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
    stepPanels[activeStepIndex]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  stepButtons.forEach((button, index) => {
    button.addEventListener('click', () => setActiveStep(index));
  });
  backButton.addEventListener('click', () => setActiveStep(activeStepIndex - 1));
  nextButton.addEventListener('click', () => setActiveStep(activeStepIndex + 1));
  form.addEventListener('input', updateStepperState);
  form.addEventListener('change', updateStepperState);

  stepper.append(stepperNav, stepperContent);
  form.appendChild(stepper);
  updateStepperState();

  const modal = document.querySelector('[data-form-modal]');
  const modalCard = modal?.querySelector('.modal-card');
  modalCard?.classList.add('modal-card--wide', 'modal-card--character-editor');

  const tooltipHints = {
    name: 'Nome del personaggio mostrato in scheda.',
    race: 'Razza o origine del personaggio.',
    class_name: 'Classe principale del personaggio.',
    level: 'Livello attuale usato per progressione e risorse.',
    hp_current: 'Punti ferita correnti.',
    hp_max: 'Punti ferita massimi.',
    hp_temp: 'Punti ferita temporanei attivi.',
    ac: 'Classe armatura totale.',
    initiative: 'Bonus iniziativa ai tiri di iniziativa.',
    proficiency_bonus: 'Bonus competenza globale.',
    extra_attacks: 'Numero di attacchi extra disponibili.',
    damage_bonus_melee: 'Bonus fisso ai danni in mischia.',
    damage_bonus_ranged: 'Bonus fisso ai danni a distanza.'
  };
  form.querySelectorAll('input, select, textarea').forEach((field) => {
    const name = field.getAttribute('name');
    const hint = name ? tooltipHints[name] : null;
    if (!hint) return;
    const label = field.closest('.field')?.querySelector('span');
    if (!label || label.querySelector('.field-help')) return;
    const help = document.createElement('button');
    help.type = 'button';
    help.className = 'field-help';
    help.textContent = '?';
    help.setAttribute('aria-label', hint);
    help.setAttribute('aria-expanded', 'false');
    help.setAttribute('data-tooltip', hint);
    label.appendChild(document.createTextNode(' '));
    label.appendChild(help);
  });

  const hideHelpTooltips = (except = null) => {
    form.querySelectorAll('.field-help.is-open').forEach((button) => {
      if (except && button === except) return;
      button.classList.remove('is-open');
      button.setAttribute('aria-expanded', 'false');
    });
  };

  form.querySelectorAll('.field-help').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const willOpen = !button.classList.contains('is-open');
      hideHelpTooltips(button);
      button.classList.toggle('is-open', willOpen);
      button.setAttribute('aria-expanded', String(willOpen));
    });
    button.addEventListener('blur', () => {
      button.classList.remove('is-open');
      button.setAttribute('aria-expanded', 'false');
    });
  });

  const darkvisionInput = form.querySelector('input[name="darkvision_enabled"]');
  const darkvisionRangeInput = form.querySelector('input[name="darkvision_range_m"]');
  const syncDarkvisionRange = () => {
    const enabled = Boolean(darkvisionInput?.checked);
    if (darkvisionRangeInput) {
      darkvisionRangeInput.disabled = !enabled;
      darkvisionRangeInput.required = enabled;
      if (enabled && !darkvisionRangeInput.value) darkvisionRangeInput.value = '18';
    }
  };
  darkvisionInput?.addEventListener('change', syncDarkvisionRange);
  syncDarkvisionRange();

  form.addEventListener('click', (event) => {
    if (!event.target.closest('.field-help')) {
      hideHelpTooltips();
    }
  });

  const formData = await openFormModal({
    title: character ? 'Modifica personaggio' : 'Nuovo personaggio',
    submitLabel: character ? 'Salva' : 'Crea',
    content: form,
    onOpen: ({ modal, fieldsEl }) => {
      enhanceNumericFields(fieldsEl || form);
      const footer = modal.querySelector('.modal-footer');
      if (!footer) return null;
      const modalActions = footer.querySelector('.modal-actions');
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
  modalCard?.classList.remove('modal-card--wide', 'modal-card--character-editor');
  if (!formData) return;
  const name = formData.get('name')?.trim();
  if (!name) {
    createToast('Inserisci un nome per il personaggio', 'error');
    return;
  }
  const toNumberOrNull = (value) => (value === '' ? null : Number(value));
  const nextSkills = { ...characterData.skills };
  const nextMastery = { ...characterData.skill_mastery };
  skillList.forEach((skill) => {
    const masteryChecked = formData.has(`mastery_${skill.key}`);
    const proficiencyChecked = formData.has(`skill_${skill.key}`) || masteryChecked;
    nextSkills[skill.key] = proficiencyChecked;
    nextMastery[skill.key] = masteryChecked && proficiencyChecked;
  });
  const nextSaving = { ...characterData.saving_throws };
  savingThrowList.forEach((save) => {
    nextSaving[save.key] = formData.has(`save_${save.key}`);
  });
  const nextProficiencies = { ...characterData.proficiencies };
  equipmentProficiencyList.forEach((prof) => {
    nextProficiencies[prof.key] = formData.has(`prof_${prof.key}`);
  });
  const nextRollAdjustments = { attack_rolls: {}, saving_throws: {}, skills: {} };
  [
    { scope: 'attack_rolls', entries: getDrawerAttackRollEntries(characterData, drawerItems) },
    { scope: 'saving_throws', entries: savingThrowList },
    { scope: 'skills', entries: skillList }
  ].forEach(({ scope, entries }) => {
    entries.forEach((entry) => {
      const mode = formData.get(`roll_${scope}_${entry.key}_mode`)?.toString() || '';
      const source = formData.get(`roll_${scope}_${entry.key}_source`)?.toString().trim() || '';
      const automaticEffects = getAutomaticDrawerRollEffects(characterData, drawerItems, scope, entry);
      const matchesAutomatic = mode === getAutomaticDrawerRollMode(automaticEffects) && source === getAutomaticDrawerSource(automaticEffects);
      if ((mode === 'advantage' || mode === 'disadvantage') && !matchesAutomatic) {
        nextRollAdjustments[scope][entry.key] = { mode, source };
      }
    });
  });
  const nextDamageDefenses = {
    resistances: damageTypeList.filter((type) => formData.has(`damage_resistance_${type.key}`)).map((type) => type.key),
    immunities: damageTypeList.filter((type) => formData.has(`damage_immunity_${type.key}`)).map((type) => type.key)
  };
  const nextAcModifiers = { ...characterData.ac_ability_modifiers };
  ['str', 'con', 'int', 'wis', 'cha'].forEach((ability) => {
    nextAcModifiers[ability] = formData.has(`ac_mod_${ability}`);
  });
  const nextSpecialSkillRolls = draftSpecialSkills.map((entry, index) => {
    const name = formData.get(`special_skill_name_${index}`)?.toString().trim() || '';
    if (!name) return null;
    const ability = formData.get(`special_skill_ability_${index}`)?.toString() || 'str';
    const masteryChecked = formData.has(`special_skill_mastery_${index}`);
    const proficientChecked = formData.has(`special_skill_proficient_${index}`) || masteryChecked;
    return {
      id: entry.id,
      name,
      ability: abilityShortLabel[ability] ? ability : 'str',
      proficient: proficientChecked,
      mastery: masteryChecked && proficientChecked,
      bonus: toNumberOrNull(formData.get(`special_skill_bonus_${index}`)) ?? 0
    };
  }).filter(Boolean);
  const isSpellcaster = formData.get('is_spellcaster') === 'on';
  const canPrepare = formData.get('spell_can_prepare') === 'on';
  const spellSlotLevels = Array.from({ length: 9 }, (_, index) => index + 1);
  const nextSpellcasting = isSpellcaster
    ? {
      ability: formData.get('spellcasting_ability') || null,
      recharge: formData.get('spell_slot_recharge') || 'long_rest',
      can_prepare: canPrepare,
      slots: spellSlotLevels.reduce((acc, level) => {
        const maxSlots = Math.max(0, toNumberOrNull(formData.get(`spell_slot_max_${level}`)) ?? 0);
        const usedSlots = Math.min(maxSlots, Math.max(0, toNumberOrNull(formData.get(`spell_slot_used_${level}`)) ?? 0));
        acc[level] = Math.max(maxSlots - usedSlots, 0);
        return acc;
      }, {}),
      slots_max: spellSlotLevels.reduce((acc, level) => {
        acc[level] = Math.max(0, toNumberOrNull(formData.get(`spell_slot_max_${level}`)) ?? 0);
        return acc;
      }, {})
    }
    : characterData.spellcasting ?? null;
  const nextData = {
    ...characterData,
    avatar_url: formData.get('avatar_url')?.trim() || null,
    description: formData.get('description')?.trim() || null,
    hp: {
      current: toNumberOrNull(formData.get('hp_current')),
      temp: toNumberOrNull(formData.get('hp_temp')),
      max: toNumberOrNull(formData.get('hp_max'))
    },
    hit_dice: {
      die: formData.get('hit_dice_die')?.trim() || null,
      max: toNumberOrNull(formData.get('hit_dice_max')),
      used: toNumberOrNull(formData.get('hit_dice_used'))
    },
    ac: toNumberOrNull(formData.get('ac')),
    level: toNumberOrNull(formData.get('level')),
    race: formData.get('race')?.trim() || null,
    alignment: formData.get('alignment')?.trim() || null,
    background: formData.get('background')?.trim() || null,
    class_name: formData.get('class_name')?.trim() || null,
    archetype: formData.get('archetype')?.trim() || null,
    speed: toNumberOrNull(formData.get('speed')),
    darkvision_enabled: formData.has('darkvision_enabled'),
    darkvision_range_m: formData.has('darkvision_enabled') ? (toNumberOrNull(formData.get('darkvision_range_m')) ?? 18) : null,
    proficiency_bonus: toNumberOrNull(formData.get('proficiency_bonus')),
    initiative: toNumberOrNull(formData.get('initiative')),
    attack_bonus_melee: toNumberOrNull(formData.get('attack_bonus_melee')) ?? (Number(characterData.attack_bonus_melee ?? characterData.attack_bonus) || 0),
    attack_bonus_ranged: toNumberOrNull(formData.get('attack_bonus_ranged')) ?? (Number(characterData.attack_bonus_ranged ?? characterData.attack_bonus) || 0),
    extra_attacks: toNumberOrNull(formData.get('extra_attacks')) ?? 0,
    damage_bonus_melee: toNumberOrNull(formData.get('damage_bonus_melee')) ?? 0,
    damage_bonus_ranged: toNumberOrNull(formData.get('damage_bonus_ranged')) ?? 0,
    sneak_attack_dice: formData.get('sneak_attack_dice')?.toString().trim() || null,
    ac_bonus: toNumberOrNull(formData.get('ac_bonus')) ?? 0,
    is_spellcaster: isSpellcaster,
    spellcasting: nextSpellcasting,
    ac_ability_modifiers: nextAcModifiers,
    proficiency_notes: formData.get('proficiency_notes')?.trim() || null,
    language_proficiencies: formData.get('language_proficiencies')?.trim() || null,
    talents: formData.get('talents')?.trim() || null,
    abilities: {
      str: toNumberOrNull(formData.get('ability_str')),
      dex: toNumberOrNull(formData.get('ability_dex')),
      con: toNumberOrNull(formData.get('ability_con')),
      int: toNumberOrNull(formData.get('ability_int')),
      wis: toNumberOrNull(formData.get('ability_wis')),
      cha: toNumberOrNull(formData.get('ability_cha'))
    },
    skills: nextSkills,
    skill_mastery: nextMastery,
    special_skill_rolls: nextSpecialSkillRolls,
    saving_throws: nextSaving,
    proficiencies: nextProficiencies,
    damage_defenses: nextDamageDefenses,
    roll_adjustments: nextRollAdjustments
  };
  const payload = {
    name,
    system: character ? (character.system?.trim() || '5e') : '5e',
    data: nextData
  };

  try {
    if (character) {
      const updated = await updateCharacter(character.id, payload);
      const nextCharacters = getState().characters.map((char) => (char.id === updated.id ? updated : char));
      setState({ characters: nextCharacters });
      await cacheSnapshot({ characters: nextCharacters });
      createToast('Personaggio aggiornato');
    } else {
      const created = await createCharacter({ ...payload, user_id: user.id });
      const nextCharacters = [...getState().characters, created];
      setState({ characters: nextCharacters });
      setActiveCharacter(created.id);
      await cacheSnapshot({ characters: nextCharacters });
      createToast('Personaggio creato');
    }
    onSave();
  } catch (error) {
    createToast(character ? 'Errore aggiornamento personaggio' : 'Errore creazione personaggio', 'error');
  }
}
