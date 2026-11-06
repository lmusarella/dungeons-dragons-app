import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

function extractNamedExports(source) {
  const names = new Set();
  const functionRegex = /export\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g;
  const constRegex = /export\s+const\s+([A-Za-z_$][\w$]*)\s*=/g;
  let match;
  while ((match = functionRegex.exec(source)) !== null) names.add(match[1]);
  while ((match = constRegex.exec(source)) !== null) names.add(match[1]);
  return [...names];
}

describe('src/features/inventory/modals.js', () => {
  it('defines module-level API surface', () => {
    const source = readFileSync('src/features/inventory/modals.js', 'utf8');
    const exports = extractNamedExports(source);
    expect(source.trim().length).toBeGreaterThan(40);
    expect(exports.length).toBeGreaterThan(0);
    exports.forEach((name) => {
      expect(source).toContain(`export`);
      expect(source).toContain(name);
    });
  });

  it('groups item editor fields in the requested rows', () => {
    const source = readFileSync('src/features/inventory/modals.js', 'utf8');
    const constants = readFileSync('src/features/inventory/constants.js', 'utf8');
    const styles = readFileSync('src/styles/base.css', 'utf8');
    const theme = readFileSync('src/styles/theme.css', 'utf8');

    expect(source).toContain("const categorySelect = buildSelect(itemCategories, item?.category ?? 'loot')");
    expect(source).toContain("categoryField.className = 'item-category-card-list'");
    expect(source).not.toContain('item-category-card-field');
    expect(source).toContain('type="radio" name="item_category_card"');
    expect(source).toContain('categorySelect.value = input.value');
    expect(source).toContain("[buildRow([containerField, locationField], 'balanced')]");
    expect(source).toContain("buildRow([qtyField, weightField, valueField], 'compact')");
    expect(source).toContain("label: 'Valore (monete rame)'");
    expect(source).not.toContain("label: 'Volume', name: 'volume'");
    expect(source).toContain('volume: Number(item?.volume) || 0');
    expect(source).not.toContain("name: 'max_volume'");
    expect(source).toContain('max_volume: item?.max_volume ?? null');
    expect(source).toContain("name: 'inventory_location'");
    expect(source).toContain("inventory_location: formData.get('inventory_location')?.trim() || null");
    expect(source).toContain("buildRow([weaponTypeField, weaponRangeField, meleeRangeField, weaponAbilityField, weaponMasteryField], 'compact')");
    expect(source).toContain('rangeGrid.append(thrownField, rangeNormalField, rangeDisadvantageField)');
    expect(source).toContain("const isMeleeWeapon = isWeapon && weaponRangeSelect.value === 'melee'");
    expect(source).toContain("const usesRangedDistance = isWeapon && (weaponRangeSelect.value === 'ranged' || isThrown)");
    expect(source).toContain('toggleFieldVisibility(meleeRangeField, isMeleeWeapon)');
    expect(source).toContain('toggleFieldVisibility(rangeNormalField, usesRangedDistance)');
    expect(source).toContain('toggleFieldVisibility(rangeDisadvantageField, usesRangedDistance)');
    expect(source.indexOf('proficiencySection.appendChild(rangeGrid)'))
      .toBeLessThan(source.indexOf('proficiencySection.appendChild(weaponAmmoRow)'));
    expect(source).toContain("buildRow([armorTypeField, armorClassField, armorBonusField], 'compact')");
    expect(source).toContain("buildRow([shieldField, shieldBonusField], 'compact')");
    expect(source).toContain('toggleFieldVisibility(shieldBonusField, isArmor && Boolean(shieldInput?.checked))');
    expect(source).toContain("ammunitionTypeField.innerHTML = '<span>Tipo munizione</span>'");
    expect(source).toContain("const isConsumable = categorySelect.value === 'consumable'");
    expect(source).toContain('toggleFieldVisibility(ammunitionTypeField, isConsumable)');
    expect(source).toContain('ammunitionTypeSelect.disabled = !isConsumable');
    expect(source).toContain('toggleFieldVisibility(weaponAmmoTypeField, consumesAmmo)');
    expect(source).toContain("formData.getAll('weapon_properties')");
    expect(source).toContain('weapon_properties: weaponProperties');
    expect(source).toContain("weaponProperties.includes('due_mani')");
    expect(source).toContain('weaponPropertyOptions.map');
    expect(source).not.toContain('weaponMasteryHelp');
    expect(source).not.toContain('getWeaponMasterySummary');
    expect(constants).toContain("{ value: 'improvised', label: 'Arma improvvisata' }");
    expect(source).not.toContain('const ammunitionTypeRow');
    expect(source).toContain('toggleFieldVisibility(armorShieldRow, showArmorFields)');
    expect(source).toContain("armorShieldRow.classList.add('item-modal-row--conditional-control', 'item-modal-row--armor-shield')");
    expect(source).not.toContain('toggleFieldVisibility(weaponMasteryRow');
    expect(source).not.toContain('toggleFieldVisibility(weaponThrownRow');
    expect(source).not.toContain('toggleFieldVisibility(armorBonusRow');
    expect(source).toContain("labelField.classList.add('weapon-damage-mode-field--name')");
    expect(source).toContain("attackModifierField.classList.add('weapon-damage-mode-field--attack-modifier')");
    expect(source).toContain("{ label: 'Identità', hint: 'Nome e tipologia'");
    expect(source).toContain("{ label: 'Inventario', hint: 'Quantità e stato', sections: [logisticsSection, ...(catalogMode ? [] : [placementSection]), statusSection] }");
    expect(source).toContain("{ label: 'Equipaggiamento', hint: 'Uso e vestibilità'");
    expect(source).toContain("{ label: 'Statistiche e combattimento', hint: 'Arma o armatura'");
    expect(source).toContain('combatOnly: true');
    expect(source).toContain('getVisibleWizardStepIndexes');
    expect(source).toContain("{ label: 'Descrizione', hint: 'Dettagli dell’oggetto'");
    expect(source).not.toContain("'Riepilogo'");
    expect(source).toContain('data-item-editor-next');
    expect(source).toContain('validateWizardStep');
    expect(source).toContain('wizardSubmitButton.hidden = false');
    expect(source).toContain('wizardSubmitButton.disabled = !item && !finalStep');
    expect(source).toContain('if (item || activeWizardStep === visibleStepIndexes[visibleStepIndexes.length - 1]) return');
    expect(source).toContain("submitLabel: 'Salva'");
    expect(source).toContain("localizeRequiredField(nameInput, 'Inserisci il nome dell’oggetto.')");
    expect(source).toContain("localizeRequiredField(input, 'Seleziona una categoria per l’oggetto.')");
    expect(source).toContain("${catalogMode ? 'Modifica oggetto del compendio' : 'Modifica oggetto'}: ${item.name?.trim() || 'Senza nome'}");
    expect(source).toContain('if (!catalogMode) basicToggleList.appendChild(attunement)');
    expect(source).toContain('...(catalogMode ? [] : [placementSection])');
    expect(source).not.toContain('data-item-review-');
    expect(source).toContain("buildTextarea({ label: 'Descrizione', name: 'notes'");
    expect(source).toContain("formEl?.addEventListener('submit', guardIntermediateSubmit, true)");
    expect(source).toContain("centeredActions.className = 'modal-actions__center item-editor-wizard__footer-center'");
    expect(source).toContain("modalActions.classList.add('modal-actions--with-center')");
    expect(source).toContain('character-edit-stepper-actions--footer');
    expect(source).not.toContain('Tipologia rapida');
    expect(source).not.toContain('item-choice-card__body--kind');
    expect(source).toContain('item-choice-card__input');
    expect(source.indexOf('basicToggleList.appendChild(magicField)'))
      .toBeLessThan(source.indexOf('basicToggleList.appendChild(attunement)'));
    expect(source).toContain('attunement.hidden = catalogMode || !isMagic');
    expect(source).toContain('if ((catalogMode || !isMagic) && attunementInput) attunementInput.checked = false');
    expect(source).toContain('toggleFieldVisibility(overlayableField, equipableEnabled)');
    expect(source).toContain('wizardNext.hidden = false');
    expect(source).toContain('wizardNext.disabled = finalStep');
    expect(styles).toContain('.item-equipment-workspace');
    expect(styles).toContain('grid-template-columns: repeat(2, minmax(0, 1fr))');
    expect(styles).toContain('grid-template-rows: auto minmax(360px, 1fr)');
    expect(styles).toContain('.item-editor-wizard__panel[data-item-editor-panel="4"] .field textarea');
    expect(styles).toContain('min-height: 260px');
    expect(source).toContain("equipSlotsField.querySelector('.item-equip-3d__summary')");
    expect(source).toContain("removeButton.innerHTML = '<span aria-hidden=\"true\">×</span>'");
    expect(theme).toContain('grid-template-areas: "name die damage attack type remove"');
  });

  it('stores allowed body parts without equipping a newly saved item', () => {
    const source = readFileSync('src/features/inventory/modals.js', 'utf8');
    const mannequinSource = readFileSync('src/features/character/home/equipmentMannequin.js', 'utf8');
    expect(mannequinSource).toContain("input.name = 'compatible_equip_slots'");
    expect(source).toContain('buildEquipmentCompatibilityPicker3D(selectedSlots)');
    expect(source).toContain('disposeEquipPicker = mountEquipPicker()');
    expect(source).toContain('activeWizardStep === 2 && !equipPickerMounted');
    expect(source).toContain("formData.getAll('compatible_equip_slots')");
    expect(source).toContain('const equippedSlots = equipableEnabled && item ? getEquipSlots(item) : []');
    expect(source).toContain('compatible_equip_slots: compatibleEquipSlots');
  });

  it('accepts arbitrary decimal weights in the item editor', () => {
    const source = readFileSync('src/features/inventory/modals.js', 'utf8');
    expect(source).toContain("weightInput.step = 'any'");
    expect(source).not.toContain("weightInput.step = unit === 'kg' ? '0.1' : '1'");
  });
});
