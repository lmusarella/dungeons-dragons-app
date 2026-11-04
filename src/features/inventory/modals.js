import { createItem, updateItem } from './inventoryApi.js';
import { buildInput, buildSelect, buildTextarea, createToast, openFormModal, setGlobalLoading, attachNumberStepper } from '../../ui/components.js';
import { ammunitionTypes, armorTypes, damageTypeOptions, itemCategories, weaponAbilities, weaponRanges, weaponTypes } from './constants.js';
import { weaponMasteryOptions } from '../rules/weaponMasteries.js';
import { getCompatibleEquipSlots, getEquipSlots } from './utils.js';
import { buildEquipmentCompatibilityPicker3D } from '../character/home/equipmentMannequin.js';
import { normalizeWeaponProperties, weaponPropertyOptions } from './weaponProperties.js';

export async function openItemModal(character, item, items = [], onSave, options = {}) {
  const catalogMode = Boolean(options.catalogMode);
  const present = options.present || openFormModal;
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
  const localizeRequiredField = (input, message) => {
    if (!input) return;
    input.title = message;
    const clearMessage = () => input.setCustomValidity('');
    input.addEventListener('input', clearMessage);
    input.addEventListener('change', clearMessage);
    input.addEventListener('invalid', () => {
      if (input.validity.valueMissing) input.setCustomValidity(message);
    });
  };
  const buildToggleField = ({ name, label, checked = false, type = 'checkbox', value = '' }) => {
    const field = document.createElement('label');
    field.className = 'condition-modal__item item-choice-card item-modal-toggle-field';
    const valueAttribute = value ? ` value="${value}"` : '';
    field.innerHTML = `
      <input class="item-choice-card__input" type="${type}" name="${name}"${valueAttribute} ${checked ? 'checked' : ''} />
      <span class="item-choice-card__body">
        <span class="item-choice-card__check" aria-hidden="true">✓</span>
        <strong>${label}</strong>
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
  const nameInput = nameField.querySelector('input');
  if (nameInput) {
    nameInput.required = true;
    localizeRequiredField(nameInput, 'Inserisci il nome dell’oggetto.');
  }
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
    weightInput.min = '0';
    weightInput.step = 'any';
  }
  const valueField = buildInput({ label: 'Valore (monete rame)', name: 'value_cp', type: 'number', value: item?.value_cp ?? 0 });
  const valueInput = valueField.querySelector('input');
  if (valueInput) {
    valueInput.min = '0';
    valueInput.step = '1';
  }
  const logisticsSection = buildSection(
    'Quantità, peso e valore',
    [buildRow([qtyField, weightField, valueField], 'compact')],
    { icon: '⚖️', description: 'Numeri essenziali per carico, scorte e tesoro.' }
  );
  const categorySelect = buildSelect(itemCategories, item?.category ?? 'loot');
  categorySelect.name = 'category';
  categorySelect.hidden = true;
  categorySelect.tabIndex = -1;
  categorySelect.setAttribute('aria-hidden', 'true');
  const categoryField = document.createElement('div');
  categoryField.className = 'item-category-card-list';
  const categoryIcons = {
    gear: '♙', loot: '◇', consumable: '✚', weapon: '⚔', armor: '⛨', jewelry: '✦', tool: '⚒', container: '▱'
  };
  const categoryInputs = itemCategories.map((category) => {
    const card = document.createElement('label');
    card.className = 'item-choice-card item-category-card';
    card.innerHTML = `
      <input class="item-choice-card__input" type="radio" name="item_category_card" value="${category.value}" ${categorySelect.value === category.value ? 'checked' : ''} required />
      <span class="item-choice-card__body item-choice-card__body--category">
        <span class="item-choice-card__icon" aria-hidden="true">${categoryIcons[category.value] || '◇'}</span>
        <strong>${category.label}</strong>
        <span class="item-choice-card__check" aria-hidden="true">✓</span>
      </span>
    `;
    categoryField.appendChild(card);
    const input = card.querySelector('input');
    localizeRequiredField(input, 'Seleziona una categoria per l’oggetto.');
    return input;
  });
  categoryField.prepend(categorySelect);
  const syncCategoryCards = () => {
    categoryInputs.forEach((input) => {
      const selected = input.value === categorySelect.value;
      input.checked = selected;
      input.closest('.item-category-card')?.classList.toggle('is-selected', selected);
    });
  };
  categoryInputs.forEach((input) => input.addEventListener('change', () => {
    if (!input.checked) return;
    categorySelect.value = input.value;
    syncCategoryCards();
    updateEquipmentFields();
  }));
  syncCategoryCards();

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
  const locationField = catalogMode ? null : buildInput({
    label: 'Luogo',
    name: 'inventory_location',
    placeholder: 'Es. Casa, carro o deposito',
    value: item?.inventory_location ?? ''
  });
  const locationInput = locationField?.querySelector('input');
  const syncPlacementFields = () => {
    if (locationInput) locationInput.disabled = Boolean(containerSelect.value);
  };
  containerSelect.addEventListener('change', syncPlacementFields);
  syncPlacementFields();
  const ammunitionTypeField = document.createElement('label');
  ammunitionTypeField.className = 'field';
  ammunitionTypeField.innerHTML = '<span>Tipo munizione</span>';
  const ammunitionTypeSelect = buildSelect(ammunitionTypes, item?.ammunition_type ?? '');
  ammunitionTypeSelect.name = 'ammunition_type';
  ammunitionTypeField.appendChild(ammunitionTypeSelect);
  const categoryContextRow = buildRow([ammunitionTypeField], 'balanced');
  categoryContextRow.classList.add('item-modal-row--classification-context');
  const classificationSection = buildSection(
    'Categoria',
    [categoryField, categoryContextRow],
    { icon: '🧭', description: 'Scegli la categoria più adatta all’oggetto.' }
  );
  const placementSection = buildSection(
    'Collocazione',
    [buildRow([containerField, locationField], 'balanced')],
    { icon: '⌂', description: 'Scegli un contenitore oppure indica il luogo in cui si trova.' }
  );

  const basicToggleList = document.createElement('div');
  basicToggleList.className = 'condition-modal__list item-modal-toggle-list';
  const { field: magicField, input: magicInput } = buildToggleField({
    name: 'is_magic',
    label: 'Magico',
    checked: Boolean(item?.is_magic || item?.attunement_active)
  });
  const { field: attunement, input: attunementInput } = buildToggleField({
    name: 'attunement_active',
    label: 'Sintonia attiva',
    checked: !catalogMode && (item?.attunement_active ?? false)
  });
  basicToggleList.appendChild(magicField);
  if (!catalogMode) basicToggleList.appendChild(attunement);
  const syncMagicAndAttunement = () => {
    if (!catalogMode && attunementInput?.checked && magicInput) magicInput.checked = true;
    const isMagic = Boolean(magicInput?.checked);
    if ((catalogMode || !isMagic) && attunementInput) attunementInput.checked = false;
    attunement.hidden = catalogMode || !isMagic;
    magicField.classList.toggle('is-selected', isMagic);
    attunement.classList.toggle('is-selected', Boolean(attunementInput?.checked));
  };
  magicInput?.addEventListener('change', syncMagicAndAttunement);
  attunementInput?.addEventListener('change', syncMagicAndAttunement);
  syncMagicAndAttunement();
  const statusSection = buildSection(
    'Stato speciale',
    [basicToggleList],
    { icon: '✨', description: catalogMode ? 'Indica se l’oggetto è magico.' : 'Flag rapidi per magia e sintonia.' }
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
  const selectedSlots = getCompatibleEquipSlots(item);
  const {
    field: equipSlotsField,
    inputs: equipSlotInputs,
    sync: syncEquipPickerState,
    mount: mountEquipPicker
  } = buildEquipmentCompatibilityPicker3D(selectedSlots);
  const equipSelectionSummary = equipSlotsField.querySelector('.item-equip-3d__summary');
  const equipmentWorkspace = document.createElement('div');
  equipmentWorkspace.className = 'item-equipment-workspace';
  equipmentWorkspace.appendChild(equipToggleList);
  if (equipSelectionSummary) equipmentWorkspace.appendChild(equipSelectionSummary);
  equipmentWorkspace.appendChild(equipSlotsField);
  const equipmentSection = buildSection(
    'Equipaggiamento',
    [equipmentWorkspace],
    { icon: '🛡️', description: 'Attiva l’equipaggiamento e seleziona sul manichino le zone consentite.' }
  );

  const notesSection = buildSection(
    'Descrizione',
    [buildTextarea({ label: 'Descrizione', name: 'notes', value: item?.notes ?? item?.description ?? '' })],
    { icon: '📝', description: 'Descrivi l’oggetto, i suoi effetti particolari o altre informazioni utili.' }
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
  weaponRangeField.innerHTML = '<span>Uso dell’arma</span>';
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
  const selectedWeaponProperties = new Set(normalizeWeaponProperties(item));
  if (selectedWeaponProperties.has('munizioni') && consumesAmmoInput) consumesAmmoInput.checked = true;
  const weaponPropertiesField = document.createElement('fieldset');
  weaponPropertiesField.className = 'weapon-properties-field';
  weaponPropertiesField.innerHTML = `
    <legend>Proprietà delle armi</legend>
    <p class="muted">Seleziona tutte le regole speciali applicabili all’arma.</p>
    <div class="weapon-properties-field__grid">
      ${weaponPropertyOptions.map((property) => `
        <label class="weapon-property-option">
          <input type="checkbox" name="weapon_properties" value="${property.value}" ${selectedWeaponProperties.has(property.value) ? 'checked' : ''} />
          <span><strong>${property.label}</strong><small>${property.description}</small></span>
        </label>
      `).join('')}
    </div>
  `;
  const weaponPropertyInputs = [...weaponPropertiesField.querySelectorAll('input[name="weapon_properties"]')];
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
    labelField.classList.add('weapon-damage-mode-field--name');
    const dieField = buildInput({
      label: 'Dado',
      name: 'weapon_damage_mode_die',
      placeholder: 'Es. 1d10',
      value: damage_die
    });
    dieField.classList.add('weapon-damage-mode-field--die');
    const modifierField = buildInput({
      label: 'Mod. danno',
      name: 'weapon_damage_mode_modifier',
      type: 'number',
      value: damage_modifier ?? 0
    });
    modifierField.classList.add('weapon-damage-mode-field--damage-modifier');
    const attackModifierField = buildInput({
      label: 'Mod. colpire',
      name: 'weapon_damage_mode_attack_modifier',
      type: 'number',
      value: attack_modifier ?? 0
    });
    attackModifierField.classList.add('weapon-damage-mode-field--attack-modifier');
    const typeField = document.createElement('label');
    typeField.className = 'field weapon-damage-mode-field--type';
    typeField.innerHTML = '<span>Tipo</span>';
    const typeSelect = buildSelect(damageTypeOptions, damage_type || item?.damage_type || '');
    typeSelect.name = 'weapon_damage_mode_type';
    typeField.appendChild(typeSelect);
    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'icon-button weapon-damage-mode-row__remove';
    removeButton.setAttribute('aria-label', 'Rimuovi impugnatura');
    removeButton.title = 'Rimuovi';
    removeButton.innerHTML = '<span aria-hidden="true">×</span>';
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
  if (selectedWeaponProperties.has('lancio') && thrownInput) thrownInput.checked = true;
  const rangeGrid = buildRow([], 'compact');
  rangeGrid.classList.add('item-modal-row--weapon-range');
  const meleeRangeField = buildInput({
    label: 'Portata arma (m)',
    name: 'melee_range',
    type: 'text',
    placeholder: 'Es. 1,5',
    value: item?.melee_range ?? 1.5
  });
  const meleeRangeInput = meleeRangeField.querySelector('input');
  const rangeNormalField = buildInput({
    label: 'Gittata normale',
    name: 'range_normal',
    type: 'number',
    value: item?.range_normal ?? ''
  });
  const rangeNormalInput = rangeNormalField.querySelector('input');
  const rangeDisadvantageField = buildInput({
    label: 'Gittata svantaggio',
    name: 'range_disadvantage',
    type: 'number',
    value: item?.range_disadvantage ?? ''
  });
  const rangeDisadvantageInput = rangeDisadvantageField.querySelector('input');
  rangeGrid.append(thrownField, rangeNormalField, rangeDisadvantageField);
  rangeGrid.classList.add('item-modal-row--conditional-control');

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

  const weaponPrimaryRow = buildRow([weaponTypeField, weaponRangeField, meleeRangeField, weaponAbilityField, weaponMasteryField], 'compact');
  weaponPrimaryRow.classList.add('item-modal-row--weapon-primary');
  const weaponDamageRow = buildRow([damageDieField, damageTypeField, attackModifierField, damageModifierField], 'compact');
  const weaponAmmoRow = buildRow([consumesAmmoField, weaponAmmoTypeField], 'compact');
  weaponAmmoRow.classList.add('item-modal-row--conditional-control');
  const armorPrimaryRow = buildRow([armorTypeField, armorClassField, armorBonusField], 'compact');
  armorPrimaryRow.classList.add('item-modal-row--armor-primary');
  const armorShieldRow = buildRow([shieldField, shieldBonusField], 'compact');
  armorShieldRow.classList.add('item-modal-row--conditional-control', 'item-modal-row--armor-shield');
  proficiencySection.appendChild(weaponPrimaryRow);
  proficiencySection.appendChild(weaponDamageRow);
  proficiencySection.appendChild(rangeGrid);
  proficiencySection.appendChild(weaponAmmoRow);
  proficiencySection.appendChild(weaponPropertiesField);
  proficiencySection.appendChild(weaponDamageModesField);
  proficiencySection.appendChild(armorPrimaryRow);
  proficiencySection.appendChild(armorShieldRow);
  const combatSection = buildSection(
    'Statistiche da combattimento',
    [proficiencySection],
    { icon: '⚔️', description: 'Questa sezione appare solo per armi e armature.' }
  );
  const wizard = document.createElement('div');
  wizard.className = 'item-editor-wizard';
  const wizardNav = document.createElement('nav');
  wizardNav.className = 'item-editor-wizard__nav';
  wizardNav.setAttribute('aria-label', 'Passaggi modifica oggetto');
  const wizardBody = document.createElement('div');
  wizardBody.className = 'item-editor-wizard__body';
  const wizardSteps = [
    { label: 'Identità', hint: 'Nome e tipologia', sections: [identitySection, classificationSection] },
    { label: 'Inventario', hint: 'Quantità e stato', sections: [logisticsSection, ...(catalogMode ? [] : [placementSection]), statusSection] },
    { label: 'Equipaggiamento', hint: 'Uso e vestibilità', sections: [equipmentSection] },
    { label: 'Statistiche e combattimento', hint: 'Arma o armatura', sections: [combatSection], combatOnly: true },
    { label: 'Descrizione', hint: 'Dettagli dell’oggetto', sections: [notesSection] }
  ].map((step, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'item-editor-wizard__step-button';
    button.dataset.itemEditorStep = String(index);
    button.innerHTML = `<span>${index + 1}</span><strong>${step.label}</strong><small>${step.hint}</small>`;
    const panel = document.createElement('div');
    panel.className = 'item-editor-wizard__panel';
    panel.dataset.itemEditorPanel = String(index);
    panel.setAttribute('role', 'group');
    panel.setAttribute('aria-label', `Passaggio ${index + 1}: ${step.label}`);
    step.sections.forEach((section) => panel.appendChild(section));
    wizardNav.appendChild(button);
    wizardBody.appendChild(panel);
    return { ...step, button, panel };
  });
  const wizardActions = document.createElement('div');
  wizardActions.className = 'item-editor-wizard__actions item-editor-wizard__actions--footer character-edit-stepper-actions character-edit-stepper-actions--footer';
  wizardActions.innerHTML = `
    <button type="button" class="ghost-button" data-item-editor-back>Indietro</button>
    <span data-item-editor-progress aria-live="polite"></span>
    <button type="button" class="primary" data-item-editor-next>Continua</button>
  `;
  wizard.append(wizardNav, wizardBody, wizardActions);
  fields.appendChild(wizard);
  const wizardBack = wizardActions.querySelector('[data-item-editor-back]');
  const wizardNext = wizardActions.querySelector('[data-item-editor-next]');
  const wizardProgress = wizardActions.querySelector('[data-item-editor-progress]');
  let activeWizardStep = 0;
  let wizardSubmitButton = null;
  let disposeEquipPicker = null;
  let equipPickerMounted = false;

  const validateWizardStep = (index) => {
    const invalid = wizardSteps[index]?.panel.querySelector('input:invalid, select:invalid, textarea:invalid');
    if (!invalid) return true;
    invalid.reportValidity?.();
    invalid.focus?.();
    return false;
  };
  const getVisibleWizardStepIndexes = () => wizardSteps
    .map((step, index) => (!step.combatOnly || ['weapon', 'armor'].includes(categorySelect.value) ? index : -1))
    .filter((index) => index >= 0);
  const showWizardStep = (nextIndex, { validateForward = false } = {}) => {
    const visibleIndexes = getVisibleWizardStepIndexes();
    let boundedIndex = Math.max(0, Math.min(wizardSteps.length - 1, nextIndex));
    if (!visibleIndexes.includes(boundedIndex)) {
      boundedIndex = [...visibleIndexes].reverse().find((index) => index < boundedIndex) ?? visibleIndexes[0];
    }
    if (validateForward && boundedIndex > activeWizardStep && !validateWizardStep(activeWizardStep)) return;
    activeWizardStep = boundedIndex;
    wizardSteps.forEach((step, index) => {
      const visiblePosition = visibleIndexes.indexOf(index);
      const visible = visiblePosition >= 0;
      const active = index === activeWizardStep;
      step.button.hidden = !visible;
      step.panel.hidden = !active || !visible;
      step.button.classList.toggle('is-active', active);
      step.button.classList.toggle('is-complete', visible && visiblePosition < visibleIndexes.indexOf(activeWizardStep));
      step.button.setAttribute('aria-current', active ? 'step' : 'false');
      const stepNumber = step.button.querySelector(':scope > span');
      if (stepNumber && visible) stepNumber.textContent = String(visiblePosition + 1);
    });
    const activeVisiblePosition = visibleIndexes.indexOf(activeWizardStep);
    const finalStep = activeVisiblePosition === visibleIndexes.length - 1;
    wizardNav.style.gridTemplateColumns = `repeat(${visibleIndexes.length}, minmax(0, 1fr))`;
    wizardBack.disabled = activeVisiblePosition === 0;
    wizardNext.hidden = false;
    wizardNext.disabled = finalStep;
    if (wizardSubmitButton) {
      wizardSubmitButton.hidden = false;
      wizardSubmitButton.disabled = !item && !finalStep;
    }
    wizardProgress.textContent = `Passaggio ${activeVisiblePosition + 1} di ${visibleIndexes.length}`;
    if (activeWizardStep === 2 && !equipPickerMounted) {
      equipPickerMounted = true;
      disposeEquipPicker = mountEquipPicker();
    }
    wizardSteps[activeWizardStep].panel.scrollIntoView?.({ block: 'start', behavior: 'smooth' });
  };
  const moveWizardStep = (direction) => {
    const visibleIndexes = getVisibleWizardStepIndexes();
    const currentPosition = visibleIndexes.indexOf(activeWizardStep);
    const nextPosition = Math.max(0, Math.min(visibleIndexes.length - 1, currentPosition + direction));
    showWizardStep(visibleIndexes[nextPosition], { validateForward: direction > 0 });
  };
  wizardBack.addEventListener('click', () => moveWizardStep(-1));
  wizardNext.addEventListener('click', () => moveWizardStep(1));
  wizardSteps.forEach((step, index) => step.button.addEventListener('click', () => {
    showWizardStep(index, { validateForward: index > activeWizardStep });
  }));
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
    toggleFieldVisibility(overlayableField, equipableEnabled);
    toggleFieldVisibility(equipSlotsField, equipableEnabled);
    toggleFieldVisibility(equipSelectionSummary, equipableEnabled);
    syncEquipPickerState();
    const isWeapon = categorySelect.value === 'weapon';
    const isArmor = categorySelect.value === 'armor';
    const isConsumable = categorySelect.value === 'consumable';
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
    const consumesAmmo = isWeapon && Boolean(consumesAmmoInput?.checked);
    weaponAmmoTypeSelect.disabled = !consumesAmmo;
    toggleFieldVisibility(weaponAmmoTypeField, consumesAmmo);
    weaponPropertyInputs.forEach((input) => { input.disabled = !isWeapon; });
    weaponDamageModesField.querySelectorAll('input, select, button').forEach((field) => {
      field.disabled = !isWeapon;
    });
    if (thrownInput) {
      thrownInput.disabled = !isWeapon;
      thrownInput.closest('.condition-modal__item')?.classList.toggle('is-selected', thrownInput.checked);
    }
    const isThrown = isWeapon && Boolean(thrownInput?.checked);
    const isMeleeWeapon = isWeapon && weaponRangeSelect.value === 'melee';
    if (meleeRangeInput) {
      meleeRangeInput.disabled = !isMeleeWeapon;
      if (isMeleeWeapon && !meleeRangeInput.value) meleeRangeInput.value = '1.5';
    }
    toggleFieldVisibility(meleeRangeField, isMeleeWeapon);
    [rangeNormalInput, rangeDisadvantageInput].forEach((input) => {
      if (input) input.disabled = !isThrown;
    });
    toggleFieldVisibility(rangeNormalField, isThrown);
    toggleFieldVisibility(rangeDisadvantageField, isThrown);
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
    toggleFieldVisibility(shieldBonusField, isArmor && Boolean(shieldInput?.checked));

    const showWeaponFields = isWeapon;
    const showArmorFields = isArmor;
    toggleFieldVisibility(weaponPrimaryRow, showWeaponFields);
    toggleFieldVisibility(weaponDamageRow, showWeaponFields);
    toggleFieldVisibility(rangeGrid, showWeaponFields);
    toggleFieldVisibility(weaponAmmoRow, showWeaponFields);
    toggleFieldVisibility(weaponPropertiesField, showWeaponFields);
    toggleFieldVisibility(weaponDamageModesField, showWeaponFields);
    toggleFieldVisibility(armorPrimaryRow, showArmorFields);
    toggleFieldVisibility(armorShieldRow, showArmorFields);
    toggleFieldVisibility(combatSection, showWeaponFields || showArmorFields);
    toggleFieldVisibility(ammunitionTypeField, isConsumable);
    ammunitionTypeSelect.disabled = !isConsumable;
    showWizardStep(activeWizardStep);
  };
  equipableInput?.addEventListener('change', updateEquipmentFields);
  categorySelect.addEventListener('change', () => {
    syncCategoryCards();
    updateEquipmentFields();
  });
  shieldInput?.addEventListener('change', updateEquipmentFields);
  thrownInput?.addEventListener('change', updateEquipmentFields);
  consumesAmmoInput?.addEventListener('change', updateEquipmentFields);
  weaponRangeSelect.addEventListener('change', updateEquipmentFields);
  weaponPropertyInputs.forEach((input) => input.addEventListener('change', () => {
    if (input.checked && ['due_mani', 'versatile'].includes(input.value)) {
      weaponPropertyInputs
        .filter((propertyInput) => propertyInput !== input && ['due_mani', 'versatile'].includes(propertyInput.value))
        .forEach((propertyInput) => { propertyInput.checked = false; });
    }
    if (input.value === 'lancio' && thrownInput) {
      thrownInput.checked = input.checked;
      thrownInput.closest('.condition-modal__item')?.classList.toggle('is-selected', thrownInput.checked);
    }
    if (input.value === 'munizioni' && consumesAmmoInput) {
      consumesAmmoInput.checked = input.checked;
      consumesAmmoInput.closest('.condition-modal__item')?.classList.toggle('is-selected', consumesAmmoInput.checked);
    }
    updateEquipmentFields();
  }));
  syncCategoryCards();
  updateEquipmentFields();

  enhanceNumericFields(fields);

  const formData = await present({
    title: item
      ? `${catalogMode ? 'Modifica oggetto del compendio' : 'Modifica oggetto'}: ${item.name?.trim() || 'Senza nome'}`
      : (catalogMode ? 'Nuovo oggetto del compendio' : 'Nuovo oggetto'),
    submitLabel: 'Salva',
    content: fields,
    cardClass: ['modal-card--wide', 'modal-card--scrollable', 'modal-card--item-editor'],
    onOpen: ({ modal, formEl }) => {
      modal?.classList.add('item-editor-modal-active');
      wizardSubmitButton = modal?.querySelector('[data-form-submit]') || formEl?.querySelector('button[type="submit"]');
      const modalActions = modal?.querySelector('.modal-footer .modal-actions');
      const centeredActions = document.createElement('div');
      centeredActions.className = 'modal-actions__center item-editor-wizard__footer-center';
      if (modalActions) {
        centeredActions.appendChild(wizardActions);
        modalActions.classList.add('modal-actions--with-center');
        modalActions.insertBefore(centeredActions, modalActions.querySelector('.modal-actions__right'));
      }
      const guardIntermediateSubmit = (event) => {
        const visibleStepIndexes = getVisibleWizardStepIndexes();
        if (item || activeWizardStep === visibleStepIndexes[visibleStepIndexes.length - 1]) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        moveWizardStep(1);
      };
      formEl?.addEventListener('submit', guardIntermediateSubmit, true);
      showWizardStep(0);
      nameInput?.focus();
      return () => {
        formEl?.removeEventListener('submit', guardIntermediateSubmit, true);
        if (wizardSubmitButton) {
          wizardSubmitButton.hidden = false;
          wizardSubmitButton.disabled = false;
        }
        modal?.classList.remove('item-editor-modal-active');
        centeredActions.remove();
        modalActions?.classList.remove('modal-actions--with-center');
        wizard.appendChild(wizardActions);
        disposeEquipPicker?.();
      };
    }
  });
  if (!formData) return;
  const equipableEnabled = formData.get('equipable') === 'on';
  const compatibleEquipSlots = equipableEnabled ? formData.getAll('compatible_equip_slots') : [];
  const equippedSlots = equipableEnabled && item ? getEquipSlots(item) : [];
  const equipSlot = equippedSlots[0] || null;
  const category = formData.get('category');
  if (equipableEnabled && !compatibleEquipSlots.length) {
    createToast('Seleziona almeno una parte del corpo consentita', 'error');
    return;
  }
  const isOverlayable = formData.get('sovrapponibile') === 'on';
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
  const weaponPropertySet = new Set(formData.getAll('weapon_properties').map(String));
  if (formData.get('consumes_ammunition') === 'on') weaponPropertySet.add('munizioni');
  if (formData.get('is_thrown') === 'on') weaponPropertySet.add('lancio');
  const weaponProperties = [...weaponPropertySet];

  const payload = {
    ...(catalogMode ? {} : {
      user_id: character?.user_id,
      character_id: character?.id
    }),
    name: formData.get('name'),
    image_url: formData.get('image_url')?.trim() || null,
    qty: Number(formData.get('qty')),
    weight: Number(formData.get('weight')),
    volume: Number(item?.volume) || 0,
    value_cp: Number(formData.get('value_cp')),
    category,
    container_item_id: catalogMode ? null : (formData.get('container_item_id') || null),
    ...(catalogMode ? {} : { inventory_location: formData.get('inventory_location')?.trim() || null }),
    max_volume: item?.max_volume ?? null,
    equipable: equipableEnabled,
    equip_slot: equipSlot,
    equip_slots: equippedSlots,
    compatible_equip_slots: compatibleEquipSlots,
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
    consumes_ammunition: formData.get('consumes_ammunition') === 'on' || weaponProperties.includes('munizioni'),
    weapon_properties: weaponProperties,
    grip_type: weaponProperties.includes('due_mani')
      ? 'two_handed'
      : (weaponProperties.includes('versatile') ? 'versatile' : 'one_handed'),
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
    is_thrown: formData.get('is_thrown') === 'on' || weaponProperties.includes('lancio'),
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
    if (catalogMode) {
      await onSave?.(payload);
      createToast(item ? 'Oggetto del compendio aggiornato' : 'Oggetto aggiunto al compendio');
      return payload;
    }
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
