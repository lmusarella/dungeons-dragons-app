import { createItem, updateItem } from './inventoryApi.js';
import { buildInput, buildSelect, buildTextarea, createToast, openFormModal, setGlobalLoading, attachNumberStepper } from '../../ui/components.js';
import { ammunitionTypes, armorTypes, bodyParts, damageTypeOptions, itemCategories, weaponAbilities, weaponRanges, weaponTypes } from './constants.js';
import { getWeaponMasterySummary, weaponMasteryOptions } from '../rules/weaponMasteries.js';
import { getEquipSlots, getWeightUnit, hasProficiencyForItem } from './utils.js';

export async function openItemModal(character, item, items, onSave) {
  const enhanceNumericFields = (root) => {
    root?.querySelectorAll('input[type="number"]').forEach((input) => {
      const fieldLabel = input.closest('.field')?.querySelector('span')?.textContent?.trim();
      attachNumberStepper(input, {
        decrementLabel: fieldLabel ? `Riduci ${fieldLabel}` : 'Diminuisci valore',
        incrementLabel: fieldLabel ? `Aumenta ${fieldLabel}` : 'Aumenta valore'
      });
    });
  };
  const fields = document.createElement('div');
  fields.className = 'drawer-form modal-form-grid item-editor-form';
  const buildSection = (title, elements = [], { icon = '', description = '', className = '' } = {}) => {
    const section = document.createElement('section');
    section.className = ['item-modal-section', className].filter(Boolean).join(' ');
    const header = document.createElement('div');
    header.className = 'item-modal-section__header';
    if (icon) {
      const iconEl = document.createElement('span');
      iconEl.className = 'item-modal-section__icon';
      iconEl.setAttribute('aria-hidden', 'true');
      iconEl.textContent = icon;
      header.appendChild(iconEl);
    }
    const headingGroup = document.createElement('div');
    headingGroup.className = 'item-modal-section__heading';
    const heading = document.createElement('h4');
    heading.className = 'item-modal-section__title';
    heading.textContent = title;
    headingGroup.appendChild(heading);
    if (description) {
      const helper = document.createElement('p');
      helper.className = 'item-modal-section__description';
      helper.textContent = description;
      headingGroup.appendChild(helper);
    }
    header.appendChild(headingGroup);
    section.appendChild(header);
    elements.filter(Boolean).forEach((element) => section.appendChild(element));
    return section;
  };
  const buildRow = (elements, variant = 'balanced') => {
    const row = document.createElement('div');
    row.className = `modal-form-row modal-form-row--${variant}`;
    elements.filter(Boolean).forEach((element) => row.appendChild(element));
    return row;
  };
  const buildToggleField = ({ name, label, checked = false, type = 'checkbox', value = '' }) => {
    const field = document.createElement('label');
    field.className = 'condition-modal__item item-modal-toggle-field';
    const valueAttribute = value ? ` value="${value}"` : '';
    field.innerHTML = `
      <span class="condition-modal__item-label"><strong>${label}</strong></span>
      <span class="diceov-toggle condition-modal__toggle">
        <input type="${type}" name="${name}"${valueAttribute} ${checked ? 'checked' : ''} />
        <span class="diceov-toggle-track" aria-hidden="true"></span>
      </span>
    `;
    const input = field.querySelector('input');
    field.classList.toggle('is-selected', Boolean(input?.checked));
    input?.addEventListener('change', () => {
      field.classList.toggle('is-selected', input.checked);
    });
    return { field, input };
  };
  const nameField = buildInput({ label: 'Nome', name: 'name', value: item?.name ?? '' });
  const imageField = buildInput({
    label: 'Foto (URL)',
    name: 'image_url',
    placeholder: 'https://.../oggetto.png',
    value: item?.image_url ?? ''
  });
  const identitySection = buildSection(
    'Identità oggetto',
    [buildRow([nameField, imageField], 'balanced')],
    { icon: '✦', description: 'Parti dalle informazioni che riconosci subito nella lista inventario.', className: 'item-modal-section--identity' }
  );
  const qtyField = buildInput({ label: 'Quantità', name: 'qty', type: 'number', value: item?.qty ?? 1 });
  const qtyInput = qtyField.querySelector('input');
  if (qtyInput) {
    qtyInput.min = '0';
    qtyInput.step = '1';
  }
  const weightField = buildInput({ label: 'Peso', name: 'weight', type: 'number', value: item?.weight ?? 0 });
  const weightInput = weightField.querySelector('input');
  if (weightInput) {
    const unit = getWeightUnit(character);
    weightInput.min = '0';
    weightInput.step = unit === 'kg' ? '0.1' : '1';
  }
  const volumeField = buildInput({ label: 'Volume', name: 'volume', type: 'number', value: item?.volume ?? 0 });
  const volumeInput = volumeField.querySelector('input');
  if (volumeInput) {
    volumeInput.min = '0';
    volumeInput.step = '0.1';
  }
  const valueField = buildInput({ label: 'Valore (cp)', name: 'value_cp', type: 'number', value: item?.value_cp ?? 0 });
  const valueInput = valueField.querySelector('input');
  if (valueInput) {
    valueInput.min = '0';
    valueInput.step = '1';
  }
  const logisticsSection = buildSection(
    'Quantità, peso e valore',
    [buildRow([qtyField, weightField, volumeField, valueField], 'compact')],
    { icon: '⚖️', description: 'Numeri essenziali per carico, scorte e tesoro.' }
  );
  const categorySelect = buildSelect(
    [{ value: '', label: 'Seleziona' }, ...itemCategories],
    item?.category ?? ''
  );
  categorySelect.name = 'category';
  const categoryField = document.createElement('label');
  categoryField.className = 'field';
  categoryField.innerHTML = '<span>Categoria</span>';
  categoryField.appendChild(categorySelect);

  const containerOptions = [{ value: '', label: 'Nessuno' }].concat(
    items.filter((entry) => entry.category === 'container').map((entry) => ({
      value: entry.id,
      label: entry.name
    }))
  );
  const containerSelect = buildSelect(containerOptions, item?.container_item_id ?? '');
  containerSelect.name = 'container_item_id';
  const containerField = document.createElement('label');
  containerField.className = 'field';
  containerField.innerHTML = '<span>Contenitore</span>';
  containerField.appendChild(containerSelect);
  const maxVolumeField = buildInput({
    label: 'Volume massimo contenitore',
    name: 'max_volume',
    type: 'number',
    value: item?.max_volume ?? ''
  });
  const maxVolumeInput = maxVolumeField.querySelector('input');
  const ammunitionTypeField = document.createElement('label');
  ammunitionTypeField.className = 'field';
  ammunitionTypeField.innerHTML = '<span>Tipo munizione</span>';
  const ammunitionTypeSelect = buildSelect(ammunitionTypes, item?.ammunition_type ?? '');
  ammunitionTypeSelect.name = 'ammunition_type';
  ammunitionTypeField.appendChild(ammunitionTypeSelect);
  const categoryKindField = document.createElement('div');
  categoryKindField.className = 'item-modal-kind';
  categoryKindField.innerHTML = '<span class="item-modal-kind__label">Tipologia rapida</span><p class="item-modal-kind__hint">Scegli una tipologia per mostrare solo i campi davvero utili.</p>';
  const categoryKindList = document.createElement('div');
  categoryKindList.className = 'condition-modal__list item-modal-kind__list';
  const kindOptions = [
    { value: 'generic', label: 'Oggetto' },
    { value: 'weapon', label: 'Arma' },
    { value: 'armor', label: 'Armatura' }
  ];
  const kindInputs = kindOptions.map((option) => {
    const optionLabel = document.createElement('label');
    optionLabel.className = 'condition-modal__item item-modal-kind__item';
    optionLabel.innerHTML = `
      <span class="condition-modal__item-label"><strong>${option.label}</strong></span>
      <span class="diceov-toggle condition-modal__toggle">
        <input type="radio" name="item_kind" value="${option.value}" />
        <span class="diceov-toggle-track" aria-hidden="true"></span>
      </span>
    `;
    categoryKindList.appendChild(optionLabel);
    return optionLabel.querySelector('input');
  });
  categoryKindField.appendChild(categoryKindList);
  const categoryRow = buildRow([categoryField, containerField, maxVolumeField, ammunitionTypeField], 'compact');
  categoryRow.classList.add('item-modal-row--classification');
  const classificationSection = buildSection(
    'Categoria e collocazione',
    [categoryKindField, categoryRow],
    { icon: '🧭', description: 'Definisci tipo, contenitore e dettagli contestuali.' }
  );

  const basicToggleList = document.createElement('div');
  basicToggleList.className = 'condition-modal__list item-modal-toggle-list';
  const { field: attunement, input: attunementInput } = buildToggleField({
    name: 'attunement_active',
    label: 'Sintonia attiva',
    checked: item?.attunement_active ?? false
  });
  const { field: magicField, input: magicInput } = buildToggleField({
    name: 'is_magic',
    label: 'Magico',
    checked: item?.is_magic ?? false
  });
  basicToggleList.appendChild(attunement);
  basicToggleList.appendChild(magicField);
  const statusSection = buildSection(
    'Stato speciale',
    [basicToggleList],
    { icon: '✨', description: 'Flag rapidi per magia e sintonia.' }
  );

  const equipToggleList = document.createElement('div');
  equipToggleList.className = 'condition-modal__list item-modal-toggle-list';
  const { field: equipableField, input: equipableInput } = buildToggleField({
    name: 'equipable',
    label: 'Equipaggiabile',
    checked: item?.equipable ?? false
  });
  const { field: overlayableField, input: overlayableInput } = buildToggleField({
    name: 'sovrapponibile',
    label: 'Sovrapponibile',
    checked: item?.sovrapponibile ?? false
  });
  equipToggleList.appendChild(equipableField);
  equipToggleList.appendChild(overlayableField);
  const equipSlotsField = document.createElement('fieldset');
  equipSlotsField.className = 'equip-slot-field';
  equipSlotsField.innerHTML = '<legend>Punti del corpo</legend>';
  const equipSlotList = document.createElement('div');
  equipSlotList.className = 'equip-slot-list';
  const selectedSlots = getEquipSlots(item);
  const equipSlotInputs = bodyParts.map((part) => {
    const label = document.createElement('label');
    label.className = 'checkbox';
    label.innerHTML = `<input type="checkbox" name="equip_slots" value="${part.value}" /> <span>${part.label}</span>`;
    const input = label.querySelector('input');
    if (input && selectedSlots.includes(part.value)) {
      input.checked = true;
    }
    equipSlotList.appendChild(label);
    return input;
  });
  equipSlotsField.appendChild(equipSlotList);
  const equipmentSection = buildSection(
    'Equipaggiamento',
    [equipToggleList, equipSlotsField],
    { icon: '🛡️', description: 'Attiva l’equipaggiamento solo se l’oggetto occupa slot del corpo.' }
  );

  const notesSection = buildSection(
    'Note e descrizione',
    [buildTextarea({ label: 'Note', name: 'notes', value: item?.notes ?? '' })],
    { icon: '📝', description: 'Descrizione, effetti particolari o promemoria di gioco.' }
  );

  const proficiencySection = document.createElement('div');
  proficiencySection.className = 'drawer-form modal-form-grid';
  const weaponTypeField = document.createElement('label');
  weaponTypeField.className = 'field';
  weaponTypeField.innerHTML = '<span>Tipo arma</span>';
  const weaponTypeSelect = buildSelect(weaponTypes, item?.weapon_type ?? '');
  weaponTypeSelect.name = 'weapon_type';
  weaponTypeField.appendChild(weaponTypeSelect);
  const weaponRangeField = document.createElement('label');
  weaponRangeField.className = 'field';
  weaponRangeField.innerHTML = '<span>Proprietà arma</span>';
  const weaponRangeSelect = buildSelect(weaponRanges, item?.weapon_range ?? '');
  weaponRangeSelect.name = 'weapon_range';
  weaponRangeField.appendChild(weaponRangeSelect);
  const weaponAbilityField = document.createElement('label');
  weaponAbilityField.className = 'field';
  weaponAbilityField.innerHTML = '<span>Caratteristica tiro per colpire</span>';
  const weaponAbilitySelect = buildSelect(weaponAbilities, item?.attack_ability ?? '');
  weaponAbilitySelect.name = 'attack_ability';
  weaponAbilityField.appendChild(weaponAbilitySelect);
  const weaponMasteryField = document.createElement('label');
  weaponMasteryField.className = 'field';
  weaponMasteryField.innerHTML = '<span>Maestria arma (2024)</span>';
  const weaponMasterySelect = buildSelect(weaponMasteryOptions, item?.weapon_mastery ?? '');
  weaponMasterySelect.name = 'weapon_mastery';
  weaponMasteryField.appendChild(weaponMasterySelect);
  const weaponMasteryHelp = document.createElement('p');
  weaponMasteryHelp.className = 'muted weapon-mastery-help';
  weaponMasteryField.appendChild(weaponMasteryHelp);
  const updateWeaponMasteryHelp = () => {
    weaponMasteryHelp.textContent = getWeaponMasterySummary(weaponMasterySelect.value);
  };
  weaponMasterySelect.addEventListener('change', updateWeaponMasteryHelp);
  updateWeaponMasteryHelp();
  const damageDieField = buildInput({
    label: 'Dado danno',
    name: 'damage_die',
    placeholder: 'Es. 1d8',
    value: item?.damage_die ?? ''
  });
  const attackModifierField = buildInput({
    label: 'Modificatore per colpire',
    name: 'attack_modifier',
    type: 'number',
    value: item?.attack_modifier ?? 0
  });
  const damageModifierField = buildInput({
    label: 'Modificatore danno',
    name: 'damage_modifier',
    type: 'number',
    value: item?.damage_modifier ?? 0
  });
  const damageTypeField = document.createElement('label');
  damageTypeField.className = 'field';
  damageTypeField.innerHTML = '<span>Tipo danno</span>';
  const damageTypeSelect = buildSelect(damageTypeOptions, item?.damage_type ?? '');
  damageTypeSelect.name = 'damage_type';
  damageTypeField.appendChild(damageTypeSelect);
  const { field: consumesAmmoField, input: consumesAmmoInput } = buildToggleField({
    name: 'consumes_ammunition',
    label: 'Consuma munizioni',
    checked: item?.consumes_ammunition ?? false
  });
  consumesAmmoField.classList.add('item-modal-toggle-field--compact');
  const weaponAmmoTypeField = document.createElement('label');
  weaponAmmoTypeField.className = 'field';
  weaponAmmoTypeField.innerHTML = '<span>Munizione richiesta</span>';
  const weaponAmmoTypeSelect = buildSelect(ammunitionTypes, item?.required_ammunition_type ?? item?.ammunition_type ?? '');
  weaponAmmoTypeSelect.name = 'required_ammunition_type';
  weaponAmmoTypeField.appendChild(weaponAmmoTypeSelect);
  const parseWeaponDamageModes = (sourceItem) => {
    const rawModes = sourceItem?.weapon_damage_modes;
    let parsedModes = [];
    if (Array.isArray(rawModes)) {
      parsedModes = rawModes;
    } else if (typeof rawModes === 'string' && rawModes.trim()) {
      try {
        const parsed = JSON.parse(rawModes);
        parsedModes = Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        parsedModes = [];
      }
    }
    const normalized = parsedModes
      .map((mode) => ({
        label: mode.label || mode.name || '',
        damage_die: mode.damage_die || mode.damageDie || '',
        damage_modifier: mode.damage_modifier ?? mode.damageModifier ?? 0,
        attack_modifier: mode.attack_modifier ?? mode.attackModifier ?? sourceItem?.attack_modifier ?? 0,
        damage_type: mode.damage_type || mode.damageType || sourceItem?.damage_type || ''
      }))
      .filter((mode) => mode.label || mode.damage_die);
    if (!normalized.length && sourceItem?.has_alternate_damage_mode && sourceItem?.alternate_damage_die) {
      normalized.push({
        label: sourceItem.alternate_damage_label || 'Due mani',
        damage_die: sourceItem.alternate_damage_die,
        damage_modifier: sourceItem.alternate_damage_modifier ?? sourceItem.damage_modifier ?? 0,
        attack_modifier: sourceItem.alternate_attack_modifier ?? sourceItem.attack_modifier ?? 0,
        damage_type: sourceItem.alternate_damage_type || sourceItem.damage_type || ''
      });
    }
    return normalized;
  };
  const weaponDamageModesField = document.createElement('div');
  weaponDamageModesField.className = 'weapon-damage-modes-field';
  weaponDamageModesField.innerHTML = `
    <div class="weapon-damage-modes-field__header">
      <div>
        <strong>Impugnature aggiuntive</strong>
        <p class="muted">Aggiungi più modalità oltre al danno base dell'arma.</p>
      </div>
      <button type="button" class="resource-action-button" data-add-weapon-damage-mode>Aggiungi</button>
    </div>
    <div class="weapon-damage-modes-field__list" data-weapon-damage-modes></div>
  `;
  const weaponDamageModesList = weaponDamageModesField.querySelector('[data-weapon-damage-modes]');
  const addWeaponDamageModeButton = weaponDamageModesField.querySelector('[data-add-weapon-damage-mode]');
  const createWeaponDamageModeRow = ({ label = '', damage_die = '', damage_modifier = 0, attack_modifier = 0, damage_type = '' } = {}) => {
    const row = document.createElement('div');
    row.className = 'weapon-damage-mode-row';
    const labelField = buildInput({
      label: 'Nome',
      name: 'weapon_damage_mode_label',
      placeholder: 'Es. Due mani',
      value: label
    });
    const dieField = buildInput({
      label: 'Dado',
      name: 'weapon_damage_mode_die',
      placeholder: 'Es. 1d10',
      value: damage_die
    });
    const modifierField = buildInput({
      label: 'Mod. danno',
      name: 'weapon_damage_mode_modifier',
      type: 'number',
      value: damage_modifier ?? 0
    });
    const attackModifierField = buildInput({
      label: 'Mod. colpire',
      name: 'weapon_damage_mode_attack_modifier',
      type: 'number',
      value: attack_modifier ?? 0
    });
    const typeField = document.createElement('label');
    typeField.className = 'field';
    typeField.innerHTML = '<span>Tipo</span>';
    const typeSelect = buildSelect(damageTypeOptions, damage_type || item?.damage_type || '');
    typeSelect.name = 'weapon_damage_mode_type';
    typeField.appendChild(typeSelect);
    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'icon-button weapon-damage-mode-row__remove';
    removeButton.setAttribute('aria-label', 'Rimuovi impugnatura');
    removeButton.title = 'Rimuovi';
    removeButton.innerHTML = '<span aria-hidden="true">🗑️</span>';
    removeButton.addEventListener('click', () => row.remove());
    row.append(labelField, dieField, modifierField, attackModifierField, typeField, removeButton);
    enhanceNumericFields(row);
    return row;
  };
  const addWeaponDamageModeRow = (mode = {}) => {
    weaponDamageModesList?.appendChild(createWeaponDamageModeRow(mode));
  };
  parseWeaponDamageModes(item).forEach((mode) => addWeaponDamageModeRow(mode));
  addWeaponDamageModeButton?.addEventListener('click', () => addWeaponDamageModeRow({ damage_type: damageTypeSelect.value }));
  const { field: thrownField, input: thrownInput } = buildToggleField({
    name: 'is_thrown',
    label: 'Proprietà lancio',
    checked: item?.is_thrown ?? false
  });
  const rangeGrid = buildRow([], 'compact');
  rangeGrid.classList.add('item-modal-row--weapon-range');
  const meleeRangeField = buildInput({
    label: 'Portata arma (m)',
    name: 'melee_range',
    type: 'text',
    placeholder: 'Es. 1,5',
    value: item?.melee_range ?? 1.5
  });
  const rangeNormalField = buildInput({
    label: 'Gittata normale',
    name: 'range_normal',
    type: 'number',
    value: item?.range_normal ?? ''
  });
  const rangeDisadvantageField = buildInput({
    label: 'Gittata svantaggio',
    name: 'range_disadvantage',
    type: 'number',
    value: item?.range_disadvantage ?? ''
  });
  rangeGrid.append(thrownField, meleeRangeField, rangeNormalField, rangeDisadvantageField);

  const armorTypeField = document.createElement('label');
  armorTypeField.className = 'field';
  armorTypeField.innerHTML = '<span>Tipo armatura</span>';
  const armorTypeSelect = buildSelect(armorTypes, item?.armor_type ?? '');
  armorTypeSelect.name = 'armor_type';
  armorTypeField.appendChild(armorTypeSelect);

  const { field: shieldField, input: shieldInput } = buildToggleField({
    name: 'is_shield',
    label: 'Scudo',
    checked: item?.is_shield ?? false
  });
  shieldField.classList.add('item-modal-toggle-field--compact');

  const armorClassField = buildInput({
    label: 'Classe armatura base',
    name: 'armor_class',
    type: 'number',
    value: item?.armor_class ?? ''
  });
  const armorClassInput = armorClassField.querySelector('input');
  const armorBonusField = buildInput({
    label: 'Bonus armatura',
    name: 'armor_bonus',
    type: 'number',
    value: item?.armor_bonus ?? 0
  });
  const armorBonusInput = armorBonusField.querySelector('input');
  const shieldBonusField = buildInput({
    label: 'Bonus scudo',
    name: 'shield_bonus',
    type: 'number',
    value: item?.shield_bonus ?? 2
  });
  const shieldBonusInput = shieldBonusField.querySelector('input');

  const weaponPrimaryRow = buildRow([weaponTypeField, weaponRangeField, weaponAbilityField, weaponMasteryField], 'compact');
  weaponPrimaryRow.classList.add('item-modal-row--weapon-primary');
  const weaponDamageRow = buildRow([damageDieField, damageTypeField, attackModifierField, damageModifierField], 'compact');
  const weaponAmmoRow = buildRow([consumesAmmoField, weaponAmmoTypeField], 'compact');
  const armorPrimaryRow = buildRow([armorTypeField, armorClassField, armorBonusField, shieldBonusField], 'compact');
  armorPrimaryRow.classList.add('item-modal-row--armor-primary');
  const armorShieldRow = buildRow([shieldField], 'compact');
  proficiencySection.appendChild(weaponPrimaryRow);
  proficiencySection.appendChild(weaponDamageRow);
  proficiencySection.appendChild(rangeGrid);
  proficiencySection.appendChild(weaponAmmoRow);
  proficiencySection.appendChild(weaponDamageModesField);
  proficiencySection.appendChild(armorPrimaryRow);
  proficiencySection.appendChild(armorShieldRow);
  const combatSection = buildSection(
    'Statistiche da combattimento',
    [proficiencySection],
    { icon: '⚔️', description: 'Questa sezione appare solo per armi e armature.' }
  );
  fields.appendChild(identitySection);
  fields.appendChild(logisticsSection);
  fields.appendChild(classificationSection);
  fields.appendChild(statusSection);
  fields.appendChild(equipmentSection);
  fields.appendChild(combatSection);
  fields.appendChild(notesSection);

  const getKindFromCategory = (categoryValue) => {
    if (categoryValue === 'weapon') return 'weapon';
    if (categoryValue === 'armor') return 'armor';
    return 'generic';
  };
  const syncKindWithCategory = () => {
    const selectedKind = getKindFromCategory(categorySelect.value);
    kindInputs.forEach((input) => {
      if (!input) return;
      const isActive = input.value === selectedKind;
      input.checked = isActive;
      input.closest('.condition-modal__item')?.classList.toggle('is-selected', isActive);
    });
  };
  kindInputs.forEach((input) => {
    input?.addEventListener('change', () => {
      if (!input.checked) return;
      if (input.value === 'weapon') {
        categorySelect.value = 'weapon';
      } else if (input.value === 'armor') {
        categorySelect.value = 'armor';
      } else if (categorySelect.value === 'weapon' || categorySelect.value === 'armor') {
        categorySelect.value = 'gear';
      }
      syncKindWithCategory();
      updateEquipmentFields();
    });
  });
  const toggleFieldVisibility = (element, visible) => {
    if (!element) return;
    element.hidden = !visible;
  };
  const updateEquipmentFields = () => {
    const equipableEnabled = equipableInput?.checked ?? false;
    equipSlotInputs.forEach((input) => {
      if (!input) return;
      input.disabled = !equipableEnabled;
      if (!equipableEnabled) {
        input.checked = false;
      }
    });
    if (overlayableInput) {
      overlayableInput.disabled = !equipableEnabled;
      if (!equipableEnabled) {
        overlayableInput.checked = false;
      }
      overlayableInput.closest('.condition-modal__item')?.classList.toggle('is-selected', overlayableInput.checked);
    }
    toggleFieldVisibility(equipSlotsField, equipableEnabled);
    const isWeapon = categorySelect.value === 'weapon';
    const isArmor = categorySelect.value === 'armor';
    const isContainer = categorySelect.value === 'container';
    const isConsumable = categorySelect.value === 'consumable';
    const itemKind = getKindFromCategory(categorySelect.value);
    weaponTypeSelect.disabled = !isWeapon;
    weaponRangeSelect.disabled = !isWeapon;
    weaponAbilitySelect.disabled = !isWeapon;
    weaponMasterySelect.disabled = !isWeapon;
    damageDieField.querySelector('input').disabled = !isWeapon;
    damageTypeSelect.disabled = !isWeapon;
    attackModifierField.querySelector('input').disabled = !isWeapon;
    damageModifierField.querySelector('input').disabled = !isWeapon;
    if (consumesAmmoInput) {
      consumesAmmoInput.disabled = !isWeapon;
      consumesAmmoInput.closest('.condition-modal__item')?.classList.toggle('is-selected', consumesAmmoInput.checked);
    }
    weaponAmmoTypeSelect.disabled = !isWeapon || !(consumesAmmoInput?.checked ?? false);
    weaponDamageModesField.querySelectorAll('input, select, button').forEach((field) => {
      field.disabled = !isWeapon;
    });
    if (thrownInput) {
      thrownInput.disabled = !isWeapon;
      thrownInput.closest('.condition-modal__item')?.classList.toggle('is-selected', thrownInput.checked);
    }
    const rangeInputs = rangeGrid.querySelectorAll('input');
    rangeInputs.forEach((input) => {
      input.disabled = !isWeapon;
      if (!isWeapon) {
        input.value = '';
      } else if (input.name === 'melee_range' && !input.value) {
        input.value = '1.5';
      }
    });
    armorTypeSelect.disabled = !isArmor;
    if (shieldInput) {
      shieldInput.disabled = !isArmor;
      shieldInput.closest('.condition-modal__item')?.classList.toggle('is-selected', shieldInput.checked);
    }
    if (armorClassInput) {
      armorClassInput.disabled = !isArmor;
    }
    if (armorBonusInput) {
      armorBonusInput.disabled = !isArmor;
    }
    if (shieldBonusInput) {
      shieldBonusInput.disabled = !isArmor || !(shieldInput?.checked ?? false);
    }

    const showWeaponFields = itemKind === 'weapon';
    const showArmorFields = itemKind === 'armor';
    toggleFieldVisibility(weaponPrimaryRow, showWeaponFields);
    toggleFieldVisibility(weaponDamageRow, showWeaponFields);
    toggleFieldVisibility(rangeGrid, showWeaponFields);
    toggleFieldVisibility(weaponAmmoRow, showWeaponFields);
    toggleFieldVisibility(weaponDamageModesField, showWeaponFields);
    toggleFieldVisibility(armorPrimaryRow, showArmorFields);
    toggleFieldVisibility(armorShieldRow, showArmorFields);
    toggleFieldVisibility(combatSection, showWeaponFields || showArmorFields);
    toggleFieldVisibility(maxVolumeField, isContainer);
    toggleFieldVisibility(ammunitionTypeField, isConsumable);
    ammunitionTypeSelect.disabled = !isConsumable;
    if (maxVolumeInput) {
      maxVolumeInput.disabled = !isContainer;
      if (!isContainer) {
        maxVolumeInput.value = '';
      }
    }
  };
  equipableInput?.addEventListener('change', updateEquipmentFields);
  categorySelect.addEventListener('change', () => {
    syncKindWithCategory();
    updateEquipmentFields();
  });
  shieldInput?.addEventListener('change', updateEquipmentFields);
  thrownInput?.addEventListener('change', updateEquipmentFields);
  consumesAmmoInput?.addEventListener('change', updateEquipmentFields);
  syncKindWithCategory();
  updateEquipmentFields();

  enhanceNumericFields(fields);

  const formData = await openFormModal({
    title: item ? 'Modifica oggetto' : 'Nuovo oggetto',
    submitLabel: item ? 'Salva' : 'Crea',
    content: fields,
    cardClass: ['modal-card--wide', 'modal-card--scrollable', 'modal-card--item-editor']
  });
  if (!formData) return;
  const equipableEnabled = formData.get('equipable') === 'on';
  const equipSlots = equipableEnabled ? formData.getAll('equip_slots') : [];
  const equipSlot = equipSlots[0] || null;
  const category = formData.get('category');
  if (equipSlots.length && !hasProficiencyForItem(character, formData)) {
    createToast('Non hai la competenza per equipaggiare questo oggetto', 'error');
    return;
  }
  const isOverlayable = formData.get('sovrapponibile') === 'on';
  if (equipSlots.length && !isOverlayable) {
    const conflicting = items.filter((entry) => entry.id !== item?.id)
      .filter((entry) => getEquipSlots(entry).some((slot) => equipSlots.includes(slot)));
    if (conflicting.length) {
      createToast('Uno o più slot selezionati sono già occupati', 'error');
      return;
    }
  }
  const modeLabels = formData.getAll('weapon_damage_mode_label');
  const modeDice = formData.getAll('weapon_damage_mode_die');
  const modeModifiers = formData.getAll('weapon_damage_mode_modifier');
  const modeAttackModifiers = formData.getAll('weapon_damage_mode_attack_modifier');
  const modeTypes = formData.getAll('weapon_damage_mode_type');
  const weaponDamageModes = modeDice.map((die, index) => ({
    id: `mode-${index + 1}`,
    label: String(modeLabels[index] || '').trim() || `Impugnatura ${index + 1}`,
    damage_die: String(die || '').trim(),
    damage_modifier: Number(modeModifiers[index]) || 0,
    attack_modifier: Number(modeAttackModifiers[index]) || 0,
    damage_type: modeTypes[index] || null
  })).filter((mode) => mode.damage_die);

  const payload = {
    user_id: character.user_id,
    character_id: character.id,
    name: formData.get('name'),
    image_url: formData.get('image_url')?.trim() || null,
    qty: Number(formData.get('qty')),
    weight: Number(formData.get('weight')),
    volume: Number(formData.get('volume')) || 0,
    value_cp: Number(formData.get('value_cp')),
    category,
    container_item_id: formData.get('container_item_id') || null,
    max_volume: formData.get('max_volume') === '' ? null : Number(formData.get('max_volume')),
    equipable: equipableEnabled,
    equip_slot: equipSlot,
    equip_slots: equipSlots,
    sovrapponibile: isOverlayable,
    attunement_active: formData.get('attunement_active') === 'on',
    is_magic: formData.get('is_magic') === 'on',
    notes: formData.get('notes'),
    weapon_type: formData.get('weapon_type') || null,
    weapon_range: formData.get('weapon_range') || null,
    attack_ability: formData.get('attack_ability') || null,
    weapon_mastery: formData.get('weapon_mastery') || null,
    ammunition_type: formData.get('ammunition_type') || null,
    required_ammunition_type: formData.get('required_ammunition_type') || null,
    consumes_ammunition: formData.get('consumes_ammunition') === 'on',
    damage_die: formData.get('damage_die')?.trim() || null,
    damage_type: formData.get('damage_type') || null,
    attack_modifier: Number(formData.get('attack_modifier')) || 0,
    damage_modifier: Number(formData.get('damage_modifier')) || 0,
    weapon_damage_modes: weaponDamageModes,
    has_alternate_damage_mode: weaponDamageModes.length > 0,
    alternate_damage_label: weaponDamageModes[0]?.label || null,
    alternate_damage_die: weaponDamageModes[0]?.damage_die || null,
    alternate_damage_modifier: Number(weaponDamageModes[0]?.damage_modifier) || 0,
    alternate_attack_modifier: Number(weaponDamageModes[0]?.attack_modifier) || 0,
    alternate_damage_type: weaponDamageModes[0]?.damage_type || null,
    is_thrown: formData.get('is_thrown') === 'on',
    melee_range: (() => {
      const meleeRange = String(formData.get('melee_range') ?? '').trim().replace(',', '.');
      if (!meleeRange) return null;
      const parsed = Number(meleeRange);
      return Number.isNaN(parsed) ? null : parsed;
    })(),
    range_normal: Number(formData.get('range_normal')) || null,
    range_disadvantage: Number(formData.get('range_disadvantage')) || null,
    armor_type: formData.get('armor_type') || null,
    is_shield: formData.get('is_shield') === 'on',
    armor_class: Number(formData.get('armor_class')) || null,
    armor_bonus: Number(formData.get('armor_bonus')) || 0,
    shield_bonus: Number(formData.get('shield_bonus')) || 0
  };

  setGlobalLoading(true);
  try {
    if (item) {
      await updateItem(item.id, payload);
      createToast('Oggetto aggiornato');
    } else {
      await createItem(payload);
      createToast('Oggetto creato');
    }
    await onSave?.();
  } catch (error) {
    createToast('Errore salvataggio oggetto', 'error');
  } finally {
    setGlobalLoading(false);
  }
}

export function openItemImageModal(item) {
  if (!item?.image_url) return;
  const content = document.createElement('div');
  content.className = 'equipment-preview-modal';
  const description = item.description?.trim() || item.notes?.trim() || 'Nessuna descrizione disponibile per questo equipaggiamento.';
  content.innerHTML = `
    <div class="detail-card detail-card--text equipment-preview-card">
      <img class="equipment-preview-image" src="${item.image_url}" alt="Foto di ${item.name}" />
      <div class="equipment-preview-content">
        <p>${description}</p>
      </div>
    </div>
  `;
  openFormModal({
    title: item.name || 'Equipaggiamento',
    cancelLabel: null,
    content,
    cardClass: 'modal-card--equipment-preview',
    showFooter: false
  });
}
