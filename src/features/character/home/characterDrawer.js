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
  damageTypeList,
  equipmentProficiencyList,
  savingThrowList,
  skillList
} from './constants.js';
import { weaponMasteries2024 } from '../../rules/weaponMasteries.js';
import { getAbilityModifier, normalizeNumber } from './utils.js';
import { getCharacterRulesVersion, inferCharacterCasterClasses, SPELLCASTER_CLASS_OPTIONS } from '../spellPreparation.js';


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

export async function openCharacterDrawer(user, onSave, character = null) {
  if (!user) return;
  const characterData = character?.data || {};
  const hp = characterData.hp || {};
  const hitDice = characterData.hit_dice || {};
  const abilities = characterData.abilities || {};
  const skillStates = characterData.skills || {};
  const skillMasteryStates = characterData.skill_mastery || {};
  const savingStates = characterData.saving_throws || {};
  const proficiencies = characterData.proficiencies || {};
  const selectedWeaponMasteries = Array.isArray(characterData.weapon_masteries) ? characterData.weapon_masteries : [];
  const hasWeaponMasteryFeature = Boolean(characterData.weapon_mastery_enabled) || selectedWeaponMasteries.length > 0;
  const damageDefenses = characterData.damage_defenses || {};
  const rollAdjustments = characterData.roll_adjustments || { attack_rolls: {}, saving_throws: {}, skills: {} };
  const acAbilityModifiers = characterData.ac_ability_modifiers || {};
  const spellcasting = characterData.spellcasting || {};
  const characterRulesVersion = getCharacterRulesVersion(character || characterData);
  const selectedCasterClasses = new Set(inferCharacterCasterClasses(characterData));
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
  const buildEditGroup = (title, sections, { icon = '', description = '', layoutClass = '' } = {}) => {
    const group = document.createElement('section');
    group.className = 'character-edit-group';
    if (layoutClass) group.classList.add(layoutClass);

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
    if (layoutClass) content.classList.add(`${layoutClass}__content`);
    sections.forEach((section) => {
      section.classList.add('character-edit-subsection');
      content.appendChild(section);
    });
    group.append(header, content);
    return group;
  };

  const mainSection = document.createElement('div');
  mainSection.className = 'character-edit-section character-edit-section--identity';
 
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
  const characterSystemField = document.createElement('label');
  characterSystemField.className = 'field';
  characterSystemField.innerHTML = '<span>Regole del personaggio</span>';
  const characterSystemSelect = buildSelect([
    { value: '2014', label: 'D&D 2014' },
    { value: '2024', label: 'D&D 2024' }
  ], characterRulesVersion);
  characterSystemSelect.name = 'spell_rules_version';
  characterSystemField.appendChild(characterSystemSelect);
  mainGrid.appendChild(characterSystemField);
  mainSection.appendChild(mainGrid);
  const backgroundSection = document.createElement('div');
  backgroundSection.className = 'character-edit-section character-edit-section--background';
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
  statsSection.className = 'character-edit-section character-edit-section--vitals compact-character-section';
  statsSection.innerHTML = '<h4>Vita e difesa</h4>';
  const vitalGrid = document.createElement('div');
  vitalGrid.className = 'character-vitals-grid';
  vitalGrid.appendChild(buildInput({ label: 'HP attuali', name: 'hp_current', type: 'number', value: hp.current ?? 0 }));
  vitalGrid.appendChild(buildInput({ label: 'HP massimi', name: 'hp_max', type: 'number', value: hp.max ?? 0 }));
  vitalGrid.appendChild(buildInput({ label: 'HP temporanei', name: 'hp_temp', type: 'number', value: hp.temp ?? 0 }));
  vitalGrid.appendChild(buildInput({ label: 'Classe Armatura', name: 'ac', type: 'number', value: characterData.ac ?? 0 }));
  vitalGrid.appendChild(buildInput({ label: 'Dado vita', name: 'hit_dice_die', placeholder: 'Es. d8', value: hitDice.die ?? '' }));
  vitalGrid.appendChild(buildInput({ label: 'Dadi vita totali', name: 'hit_dice_max', type: 'number', value: hitDice.max ?? 0 }));
  vitalGrid.appendChild(buildInput({ label: 'Dadi vita usati', name: 'hit_dice_used', type: 'number', value: hitDice.used ?? 0 }));
  vitalGrid.appendChild(buildInput({
    label: 'Modificatore CA totale',
    name: 'ac_bonus',
    type: 'number',
    value: characterData.ac_bonus ?? 0
  }));
  statsSection.appendChild(vitalGrid);

  const acSection = document.createElement('div');
  acSection.className = 'character-edit-section character-edit-section--armor-options compact-ac-options';
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
  abilitySection.className = 'character-edit-section character-edit-section--abilities compact-character-section';
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
  skillSection.className = 'character-edit-section character-edit-section--skills compact-character-section';
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
  const skillGeneralBonusField = buildInput({
    label: 'Bonus generale tiri abilità',
    name: 'skill_check_bonus',
    type: 'number',
    value: characterData.skill_check_bonus ?? 0
  });
  skillGeneralBonusField.classList.add('character-general-modifier-field');
  skillSection.querySelector('h4')?.after(skillGeneralBonusField);

  const savingSection = document.createElement('div');
  savingSection.className = 'character-edit-section character-edit-section--saving-throws compact-character-section';
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
  const savingThrowGeneralBonusField = buildInput({
    label: 'Bonus generale tiri salvezza',
    name: 'saving_throw_bonus',
    type: 'number',
    value: characterData.saving_throw_bonus ?? 0
  });
  savingThrowGeneralBonusField.classList.add('character-general-modifier-field');
  savingSection.querySelector('h4')?.after(savingThrowGeneralBonusField);

  const proficiencySection = document.createElement('div');
  proficiencySection.className = 'character-edit-section character-edit-section--equipment-proficiencies compact-character-section';
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
  combatSection.className = 'character-edit-section character-edit-section--combat compact-character-section';
  combatSection.innerHTML = '<h4>Combattimento</h4>';
  const combatValuesGrid = document.createElement('div');
  combatValuesGrid.className = 'character-edit-grid character-combat-values-grid';
  combatValuesGrid.appendChild(buildInput({
    label: 'Bonus danni extra (mischia)',
    name: 'damage_bonus_melee',
    type: 'number',
    value: characterData.damage_bonus_melee ?? characterData.damage_bonus ?? 0
  }));
  combatValuesGrid.appendChild(buildInput({
    label: 'Bonus danni extra (distanza)',
    name: 'damage_bonus_ranged',
    type: 'number',
    value: characterData.damage_bonus_ranged ?? characterData.damage_bonus ?? 0
  }));
  combatValuesGrid.appendChild(buildInput({
    label: 'Attacchi extra',
    name: 'extra_attacks',
    type: 'number',
    value: characterData.extra_attacks ?? 0
  }));
  combatValuesGrid.appendChild(buildInput({
    label: 'Dadi attacco furtivo',
    name: 'sneak_attack_dice',
    placeholder: 'Es. 2d6',
    value: characterData.sneak_attack_dice ?? ''
  }));
  combatSection.appendChild(combatValuesGrid);

  const weaponMasteryFeatureField = document.createElement('div');
  weaponMasteryFeatureField.className = 'modal-toggle-field';
  weaponMasteryFeatureField.innerHTML = `
    <span class="modal-toggle-field__label">Maestria armi</span>
    <label class="diceov-toggle condition-modal__toggle">
      <input type="checkbox" name="weapon_mastery_enabled" />
      <span class="diceov-toggle-track" aria-hidden="true"></span>
    </label>
  `;
  const weaponMasteryFeatureInput = weaponMasteryFeatureField.querySelector('input');
  if (weaponMasteryFeatureInput) {
    weaponMasteryFeatureInput.checked = hasWeaponMasteryFeature;
  }
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
  const wildShapeField = document.createElement('div');
  wildShapeField.className = 'modal-toggle-field';
  wildShapeField.innerHTML = `
    <span class="modal-toggle-field__label">Può trasformarsi</span>
    <label class="diceov-toggle condition-modal__toggle">
      <input type="checkbox" name="wild_shape_enabled" />
      <span class="diceov-toggle-track" aria-hidden="true"></span>
    </label>
  `;
  const wildShapeInput = wildShapeField.querySelector('input');
  if (wildShapeInput) {
    wildShapeInput.checked = Boolean(characterData.wild_shape_enabled);
  }
  const combatFeatureGrid = document.createElement('div');
  combatFeatureGrid.className = 'character-combat-feature-grid';
  combatFeatureGrid.append(wildShapeField, weaponMasteryFeatureField, spellcasterField);
  combatSection.appendChild(combatFeatureGrid);
  const spellcastingSection = document.createElement('div');
  spellcastingSection.className = 'character-edit-section character-edit-section--spellcasting spellcasting-section compact-character-section';
  spellcastingSection.innerHTML = '<h4>Magia</h4>';
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
  const spellListConfig = document.createElement('section');
  spellListConfig.className = 'spell-list-config';
  spellListConfig.innerHTML = `
    <div class="spell-list-config__heading">
      <div>
        <strong>Liste disponibili per la preparazione</strong>
        <small>Puoi combinare più classi per personaggi multiclasse.</small>
      </div>
    </div>
    <div class="spell-list-config__classes" role="group" aria-label="Liste incantesimi disponibili">
      ${SPELLCASTER_CLASS_OPTIONS.map((casterClass) => `
        <label class="toggle-pill">
          <input type="checkbox" name="spell_caster_classes" value="${casterClass}" ${selectedCasterClasses.has(casterClass) ? 'checked' : ''} />
          <span>${casterClass.charAt(0).toUpperCase()}${casterClass.slice(1)}</span>
        </label>
      `).join('')}
    </div>
  `;
  spellcastingSection.appendChild(spellListConfig);
  const slotGrid = document.createElement('div');
  slotGrid.className = 'spell-slot-edit-grid';
  Array.from({ length: 9 }, (_, index) => index + 1).forEach((level) => {
    const remainingSlots = Math.max(0, Number(spellSlots[level]) || 0);
    const totalSlots = Math.max(remainingSlots, Number(spellSlotsMax[level]) || 0);
    const usedSlots = Math.max(0, totalSlots - remainingSlots);
    const slotRow = document.createElement('div');
    slotRow.className = 'spell-slot-edit-row';
    slotRow.appendChild(buildInput({
      label: `${level}° totali`,
      name: `spell_slot_max_${level}`,
      type: 'number',
      value: totalSlots
    }));
    slotRow.appendChild(buildInput({
      label: 'Usati',
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
  const spellcastingOptions = document.createElement('div');
  spellcastingOptions.className = 'spellcasting-options-grid';
  spellcastingOptions.append(slotRechargeField, canPrepareField);
  spellcastingSection.appendChild(spellcastingOptions);
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
    const enabled = spellcasterInput.checked;
    spellcastingSection.hidden = !enabled;
    spellcastingSection.setAttribute('aria-hidden', String(!enabled));
    combatSection.classList.toggle('is-combat-only', !enabled);
  };
  spellcasterInput?.addEventListener('change', toggleSpellcastingSection);
  spellcastingAbilitySelect.addEventListener('change', syncSpellcastingDerived);
  Object.values(abilityInputs).forEach((input) => input?.addEventListener('input', syncSpellcastingDerived));
  proficiencyInput?.addEventListener('input', syncSpellcastingDerived);
  toggleSpellcastingSection();
  syncSpellcastingDerived();

  const damageDefenseSection = document.createElement('div');
  damageDefenseSection.className = 'character-edit-section compact-settings-form compact-settings-form--defenses';
  damageDefenseSection.innerHTML = `
    <div class="defense-editor-heading">
      <div>
        <h4>Resistenze & Immunità</h4>
        <p class="muted compact-settings-help">“Tutti i danni” copre ogni tipo nella modale Subisci danno.</p>
      </div>
    </div>
    <div class="defense-type-grid">
      ${damageTypeList.map((type) => `
        <div class="defense-type-card">
          <span class="defense-type-card__name">
            <small>${type.group || 'Altro'}</small>
            <strong>${type.label}</strong>
          </span>
          <label class="defense-choice defense-choice--resistance">
            <input type="checkbox" name="damage_resistance_${type.key}" ${(Array.isArray(damageDefenses.resistances) && damageDefenses.resistances.includes(type.key)) ? 'checked' : ''} />
            <span>Resistenza</span>
          </label>
          <label class="defense-choice defense-choice--immunity">
            <input type="checkbox" name="damage_immunity_${type.key}" ${(Array.isArray(damageDefenses.immunities) && damageDefenses.immunities.includes(type.key)) ? 'checked' : ''} />
            <span>Immunità</span>
          </label>
        </div>
      `).join('')}
    </div>
  `;

  const adjustmentModeOptions = [
    { value: '', label: 'Nessuno' },
    { value: 'advantage', label: 'Vantaggio' },
    { value: 'disadvantage', label: 'Svantaggio' }
  ];
  const adjustmentSourceOptions = [
    { value: '', label: 'Seleziona fonte' },
    { value: 'situational', label: 'Situazionale' },
    { value: 'effect', label: 'Effetto temporaneo' },
    { value: 'condition', label: 'Condizione' },
    { value: 'armor', label: 'Armatura' },
    { value: 'racial', label: 'Abilità razziale' },
    { value: 'class', label: 'Privilegio di classe' },
    { value: 'spell', label: 'Incantesimo' },
    { value: 'item', label: 'Oggetto o equipaggiamento' },
    { value: 'other', label: 'Altro' }
  ];
  const attackAdjustmentLabels = new Map();
  const cachedItems = Array.isArray(getState().cache?.items) ? getState().cache.items : [];
  cachedItems
    .filter((item) => item.category === 'weapon'
      && item.equipable
      && (!character?.id || !item.character_id || String(item.character_id) === String(character.id))
      && (item.equip_slot || (Array.isArray(item.equip_slots) && item.equip_slots.length)))
    .forEach((item) => attackAdjustmentLabels.set(`weapon:${item.id ?? item.name}`, item.name || 'Arma'));
  (Array.isArray(characterData.spells) ? characterData.spells : [])
    .filter((spell) => (spell.kind === 'cantrip' || Number(spell.level) === 0) && spell.attack_roll && spell.damage_die)
    .forEach((spell) => attackAdjustmentLabels.set(`spell:${spell.id}`, spell.name || 'Incantesimo'));
  if (spellcasting.ability && normalizeNumber(characterData.proficiency_bonus) !== null) {
    attackAdjustmentLabels.set('spell-attack', 'Incantesimi');
  }
  Object.keys(rollAdjustments.attack_rolls || {}).forEach((key) => {
    if (!attackAdjustmentLabels.has(key)) attackAdjustmentLabels.set(key, key.replace(/^(weapon|spell):/, ''));
  });
  const adjustmentEntriesByScope = {
    attack_rolls: [...attackAdjustmentLabels].map(([key, label]) => ({ key, label })),
    saving_throws: savingThrowList.map((entry) => ({ key: entry.key, label: entry.label })),
    skills: skillList.map((entry) => ({ key: entry.key, label: entry.label }))
  };
  const rollAdjustmentSection = document.createElement('div');
  rollAdjustmentSection.className = 'character-edit-section character-edit-section--roll-adjustments compact-character-section';
  rollAdjustmentSection.innerHTML = `
    <div class="roll-adjustment-editor__intro">
      <h4>Vantaggi e svantaggi</h4>
      <p class="muted">Configura soltanto gli effetti manuali persistenti. Condizioni e altri effetti automatici continuano ad applicarsi durante il tiro.</p>
    </div>
  `;
  const buildAdjustmentGroup = (title, scope, entries) => {
    const section = document.createElement('section');
    section.className = 'roll-adjustment-editor__group';
    section.innerHTML = `<h5>${title}</h5>`;
    const grid = document.createElement('div');
    grid.className = 'roll-adjustment-editor__grid';
    if (!entries.length) {
      grid.innerHTML = '<p class="muted roll-adjustment-editor__empty">Nessun tiro configurato in questa categoria.</p>';
    }
    entries.forEach((entry) => {
      const current = rollAdjustments[scope]?.[entry.key] || {};
      const row = document.createElement('div');
      row.className = 'roll-adjustment-editor__row';
      const name = document.createElement('strong');
      name.textContent = entry.label;
      const mode = buildSelect(adjustmentModeOptions, current.mode || '');
      mode.name = `roll_${scope}_${entry.key}_mode`;
      mode.setAttribute('aria-label', `Modalità per ${entry.label}`);
      const source = buildSelect(adjustmentSourceOptions, current.source || '');
      source.name = `roll_${scope}_${entry.key}_source`;
      source.setAttribute('aria-label', `Fonte per ${entry.label}`);
      row.append(name, mode, source);
      grid.appendChild(row);
    });
    section.appendChild(grid);
    return section;
  };
  rollAdjustmentSection.append(
    buildAdjustmentGroup('Tiri per colpire', 'attack_rolls', adjustmentEntriesByScope.attack_rolls),
    buildAdjustmentGroup('Tiri salvezza', 'saving_throws', adjustmentEntriesByScope.saving_throws),
    buildAdjustmentGroup('Abilità', 'skills', adjustmentEntriesByScope.skills)
  );

  const proficiencyNotesSection = document.createElement('div');
  proficiencyNotesSection.className = 'character-edit-section character-edit-section--proficiency-notes compact-character-section';
  proficiencyNotesSection.innerHTML = '<h4>Note e talenti</h4>';
  const proficiencyNotesGrid = document.createElement('div');
  proficiencyNotesGrid.className = 'character-edit-notes-grid';
  proficiencyNotesGrid.appendChild(buildTextarea({
    label: 'Competenze (strumenti, lingue, ecc.)',
    name: 'proficiency_notes',
    placeholder: 'Es. Strumenti: kit da ladro, strumenti musicali; Lingue: comune, elfico',
    value: characterData.proficiency_notes ?? ''
  }));
  proficiencyNotesGrid.appendChild(buildTextarea({
    label: 'Lingue conosciute',
    name: 'language_proficiencies',
    placeholder: 'Es. comune, elfico, draconico',
    value: characterData.language_proficiencies ?? ''
  }));
  proficiencyNotesGrid.appendChild(buildTextarea({
    label: 'Talenti',
    name: 'talents',
    placeholder: 'Es. Maestro d\'armi, Tiratore scelto',
    value: characterData.talents ?? ''
  }));
  proficiencyNotesGrid.appendChild(buildTextarea({
    label: 'Stili di combattimento',
    name: 'fighting_styles',
    placeholder: 'Es. Duellare, Difesa, Tiro con l’arco',
    value: characterData.fighting_styles ?? ''
  }));
  proficiencyNotesSection.appendChild(proficiencyNotesGrid);

  const weaponMasterySection = document.createElement('div');
  weaponMasterySection.className = 'character-edit-section character-edit-section--weapon-masteries compact-character-section';
  weaponMasterySection.innerHTML = `
    <h4>Maestrie delle armi (2024)</h4>
    <p class="muted compact-settings-help">Attiva il flag "Maestria armi" in questo step per selezionare le maestrie conosciute dal personaggio. Ogni arma dell'inventario può indicare quale maestria usa.</p>
    <div class="weapon-mastery-list">
      ${weaponMasteries2024.map((mastery) => `
        <label class="toggle-pill weapon-mastery-card">
          <input type="checkbox" name="weapon_mastery_${mastery.key}" ${selectedWeaponMasteries.includes(mastery.key) ? 'checked' : ''} />
          <span class="weapon-mastery-card__body">
            <strong>${mastery.label}</strong>
            <small>${mastery.summary}</small>
          </span>
        </label>
      `).join('')}
    </div>
  `;
  const syncWeaponMasteryControls = () => {
    const enabled = Boolean(weaponMasteryFeatureInput?.checked);
    weaponMasterySection.hidden = !enabled;
    weaponMasterySection.setAttribute('aria-hidden', String(!enabled));
    weaponMasterySection.querySelectorAll('input[type="checkbox"]').forEach((input) => {
      input.disabled = !enabled;
    });
  };
  weaponMasteryFeatureInput?.addEventListener('change', syncWeaponMasteryControls);
  syncWeaponMasteryControls();

  const steps = [
    {
      title: 'Identità & Background',
      icon: '🪪',
      description: 'Identità, origini e storia del personaggio.',
      content: buildEditGroup('Identità & Background', [mainSection, backgroundSection], {
        icon: '🪪',
        description: 'Tutte le informazioni narrative e identificative, organizzate in un’unica schermata.',
        layoutClass: 'character-edit-group--identity-background'
      })
    },
    {
      title: 'Caratteristiche & Vita',
      icon: '❤️',
      description: 'Punteggi, PF, difesa, movimento e tiri salvezza.',
      content: buildEditGroup('Caratteristiche & Vita', [abilitySection, statsSection, savingSection, acSection], {
        icon: '❤️',
        description: 'I numeri principali della scheda sono allineati e leggibili in un solo passaggio.',
        layoutClass: 'character-edit-group--core-stats'
      })
    },
    {
      title: 'Abilità & Competenze',
      icon: '🧠',
      description: 'Abilità, maestrie, equipaggiamento, lingue e talenti.',
      content: buildEditGroup('Abilità & Competenze', [
        skillSection,
        proficiencySection,
        proficiencyNotesSection
      ], {
        icon: '🧠',
        description: 'Competenze operative e note libere sono raccolte senza duplicazioni.',
        layoutClass: 'character-edit-group--skills-proficiencies'
      })
    },
    {
      title: 'Combattimento e magia',
      icon: '⚔️',
      description: 'Attacchi, danni, incantesimi e slot.',
      content: buildEditGroup('Combattimento e magia', [combatSection, spellcastingSection, weaponMasterySection], {
        icon: '⚔️',
        description: 'Raccoglie i parametri globali di attacchi e incantesimi; le azioni si gestiscono dalle shortcut.',
        layoutClass: 'character-edit-group--combat-magic'
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
    },
    {
      title: 'Vantaggi & Svantaggi',
      icon: '⚖️',
      description: 'Effetti manuali persistenti sui tiri. ',
      content: buildEditGroup('Vantaggi & Svantaggi', [rollAdjustmentSection], {
        icon: '⚖️',
        description: 'Imposta vantaggi e svantaggi situazionali dopo aver configurato resistenze e immunità.'
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
    skill_check_bonus: 'Modificatore aggiunto a tutte le prove di abilità.',
    saving_throw_bonus: 'Modificatore aggiunto a tutti i tiri salvezza.',
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
  Object.entries(adjustmentEntriesByScope).forEach(([scope, entries]) => {
    entries.forEach((entry) => {
      const mode = String(formData.get(`roll_${scope}_${entry.key}_mode`) || '');
      const source = String(formData.get(`roll_${scope}_${entry.key}_source`) || '').trim();
      if (mode === 'advantage' || mode === 'disadvantage') {
        nextRollAdjustments[scope][entry.key] = { mode, source: source || 'situational' };
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
  // Tiri speciali e colpi senz'arma sono gestiti dalle rispettive shortcut.
  // Il salvataggio del wizard non deve modificarli o cancellarli.
  const nextSpecialSkillRolls = Array.isArray(characterData.special_skill_rolls)
    ? characterData.special_skill_rolls
    : [];
  const isSpellcaster = formData.get('is_spellcaster') === 'on';
  const canPrepare = formData.get('spell_can_prepare') === 'on';
  const selectedRulesVersion = ['2014', '2024'].includes(String(formData.get('spell_rules_version')))
    ? String(formData.get('spell_rules_version'))
    : characterRulesVersion;
  const spellSlotLevels = Array.from({ length: 9 }, (_, index) => index + 1);
  const nextSpellcasting = isSpellcaster
    ? {
      ability: formData.get('spellcasting_ability') || null,
      recharge: formData.get('spell_slot_recharge') || 'long_rest',
      can_prepare: canPrepare,
      caster_classes: formData.getAll('spell_caster_classes'),
      rules_version: selectedRulesVersion,
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
  const nextAbilities = {
    str: toNumberOrNull(formData.get('ability_str')),
    dex: toNumberOrNull(formData.get('ability_dex')),
    con: toNumberOrNull(formData.get('ability_con')),
    int: toNumberOrNull(formData.get('ability_int')),
    wis: toNumberOrNull(formData.get('ability_wis')),
    cha: toNumberOrNull(formData.get('ability_cha'))
  };
  const nextProficiencyBonus = toNumberOrNull(formData.get('proficiency_bonus'));
  const nextUnarmedAttacks = Array.isArray(characterData.unarmed_attacks)
    ? characterData.unarmed_attacks
    : [];
  const nextData = {
    ...characterData,
    avatar_url: characterData.avatar_url ?? null,
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
    proficiency_bonus: nextProficiencyBonus,
    skill_check_bonus: toNumberOrNull(formData.get('skill_check_bonus')) ?? 0,
    saving_throw_bonus: toNumberOrNull(formData.get('saving_throw_bonus')) ?? 0,
    initiative: toNumberOrNull(formData.get('initiative')),
    attack_bonus_melee: toNumberOrNull(formData.get('attack_bonus_melee')) ?? (Number(characterData.attack_bonus_melee ?? characterData.attack_bonus) || 0),
    attack_bonus_ranged: toNumberOrNull(formData.get('attack_bonus_ranged')) ?? (Number(characterData.attack_bonus_ranged ?? characterData.attack_bonus) || 0),
    extra_attacks: toNumberOrNull(formData.get('extra_attacks')) ?? 0,
    damage_bonus_melee: toNumberOrNull(formData.get('damage_bonus_melee')) ?? 0,
    damage_bonus_ranged: toNumberOrNull(formData.get('damage_bonus_ranged')) ?? 0,
    sneak_attack_dice: formData.get('sneak_attack_dice')?.toString().trim() || null,
    ac_bonus: toNumberOrNull(formData.get('ac_bonus')) ?? 0,
    is_spellcaster: isSpellcaster,
    rules_version: selectedRulesVersion,
    wild_shape_enabled: formData.get('wild_shape_enabled') === 'on',
    wild_shape: formData.get('wild_shape_enabled') === 'on' ? (characterData.wild_shape || null) : null,
    spellcasting: nextSpellcasting,
    ac_ability_modifiers: nextAcModifiers,
    proficiency_notes: formData.get('proficiency_notes')?.trim() || null,
    language_proficiencies: formData.get('language_proficiencies')?.trim() || null,
    talents: formData.get('talents')?.trim() || null,
    fighting_styles: formData.get('fighting_styles')?.trim() || null,
    abilities: nextAbilities,
    skills: nextSkills,
    skill_mastery: nextMastery,
    special_skill_rolls: nextSpecialSkillRolls,
    unarmed_attacks: nextUnarmedAttacks,
    saving_throws: nextSaving,
    weapon_mastery_enabled: formData.has('weapon_mastery_enabled'),
    weapon_masteries: formData.has('weapon_mastery_enabled')
      ? weaponMasteries2024
        .filter((mastery) => formData.has(`weapon_mastery_${mastery.key}`))
        .map((mastery) => mastery.key)
      : [],
    proficiencies: nextProficiencies,
    damage_defenses: nextDamageDefenses,
    roll_adjustments: nextRollAdjustments
  };
  const payload = {
    name,
    system: selectedRulesVersion,
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
