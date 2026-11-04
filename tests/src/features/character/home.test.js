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

describe('src/features/character/home.js', () => {
  it('adds catalog spells with the assignment state explicitly chosen by the user', () => {
    const source = readFileSync('src/features/character/home.js', 'utf8');
    const catalogPicker = readFileSync('src/features/inventory/catalogPicker.js', 'utf8');
    expect(source).toContain("prepState: sharedSpell.assignment_prep_state === 'always' ? 'always' : 'prepared'");
    expect(source).toContain("nextSpells[index].prep_state === 'always' ? 'always_prepared' : 'prepared'");
    expect(source).toContain('const prepState = normalizeSpellPreparationState(row.prep_state)');
  });

  it('reconnects an edited archive snapshot through its source key', () => {
    const source = readFileSync('src/features/character/home.js', 'utf8');
    expect(source).toContain('!spell.shared_spell_id && spell.source_key && linkedSpell.source_key');
    expect(source).toContain('String(spell.source_key) === String(linkedSpell.source_key)');
  });

  it('defines module-level API surface', () => {
    const source = readFileSync('src/features/character/home.js', 'utf8');
    const exports = extractNamedExports(source);
    expect(source.trim().length).toBeGreaterThan(40);
    expect(exports.length).toBeGreaterThan(0);
    exports.forEach((name) => {
      expect(source).toContain(`export`);
      expect(source).toContain(name);
    });
  });

  it('uses the selected wild shape physical scores instead of the highest values', () => {
    const source = readFileSync('src/features/character/home.js', 'utf8');
    const adjustedCharacter = source.slice(
      source.indexOf('function buildWildShapeAdjustedCharacter'),
      source.indexOf('function getWildShapeForms')
    );
    expect(adjustedCharacter).toContain('str: Number(activeWildShape.statBlock.abilities.str) || 10');
    expect(adjustedCharacter).toContain('dex: Number(activeWildShape.statBlock.abilities.dex) || 10');
    expect(adjustedCharacter).toContain('con: Number(activeWildShape.statBlock.abilities.con) || 10');
    expect(adjustedCharacter).toContain('initiative: activeWildShape.statBlock.initiative');
    expect(adjustedCharacter).toContain('speed: activeWildShape.statBlock.speeds.walk');
    expect(adjustedCharacter).not.toContain('Math.max');
  });

  it('offers a large, searchable shared spell picker with filters and card details', () => {
    const source = readFileSync('src/features/character/home.js', 'utf8');
    const styles = readFileSync('src/styles/base.css', 'utf8');
    const picker = source.slice(
      source.indexOf('async function openSharedSpellPicker('),
      source.indexOf('function getAvailableSpellSlotLevels')
    );

    expect(picker).toContain("content.className = 'shared-spell-picker'");
    expect(picker).toContain('Scrivi il nome di un incantesimo...');
    expect(picker).toContain('data-picker-version="2014"');
    expect(picker).toContain('data-picker-version="2024"');
    expect(picker).toContain('data-picker-level="0"');
    expect(picker).toContain('data-picker-property="concentration"');
    expect(picker).toContain("let selectedRulesVersion = initialRulesVersion");
    expect(picker).toContain("const selectedProperties = new Set()");
    expect(picker).toContain('rulesVersion: selectedRulesVersion');
    expect(picker).toContain('level: selectedLevel');
    expect(picker).not.toContain('Tutte le versioni');
    expect(picker).toContain('data-reset-spell-filters');
    expect(picker).toContain('data-picker-source-options');
    expect(picker).toContain('fetchSharedSpellSources({ rulesVersion: selectedRulesVersion })');
    expect(picker).toContain('sources: expandSpellSourceSelection(sourceGroups, selectedSourceKeys)');
    expect(picker).toContain('const selectedSourceKeys = new Set()');
    expect(picker).not.toContain('data-spell-preview');
    expect(picker).toContain('openSpellQuickDetailModal(null, spell, null, { present })');
    expect(picker).toContain("pageSize: PAGE_SIZE");
    expect(picker).toContain("cardClass: ['modal-card--form', 'modal-card--shared-spell-picker']");
    expect(picker).toContain('const selectedSpells = new Map()');
    expect(picker).toContain('submitButtons.forEach((button) => { button.disabled = count === 0; })');
    expect(picker).toContain('return [...selectedSpells.values()]');
    expect(picker).toContain('data-clear-spell-selection');
    expect(picker).toContain('if (nextRulesVersion !== selectedRulesVersion)');
    expect(picker).toContain('const formData = await present({');
    expect(styles).toContain('.modal-card--shared-spell-picker');
    expect(styles).toContain('width: min(1180px, calc(100vw - 32px))');
    expect(styles).toContain('.shared-spell-picker__workspace');
    expect(styles).toContain('.sheet-inline-detail.modal-card--shared-spell-picker');
    expect(styles).toContain('scrollbar-gutter: stable');
    expect(styles).toContain('@media (max-width: 820px)');
  });

  it('keeps spell creation and the shared collection inside the shortcut flow', () => {
    const source = readFileSync('src/features/character/home.js', 'utf8');
    const addFlow = source.slice(
      source.indexOf("const addSpellButton = container.querySelector('[data-add-spell]')"),
      source.indexOf('const deleteSpellWithConfirmation')
    );
    expect(addFlow).toContain('const presentInShortcut = (modalOptions) => presentSheetDetail(spellDialog, modalOptions)');
    expect(addFlow).toContain('openSpellSourceModal({ present: presentInShortcut })');
    expect(addFlow).toContain('openSharedSpellPicker(presentInShortcut, {');
    expect(addFlow).toContain('defaultRulesVersion: preferredRulesVersion');
    expect(addFlow).toContain('canPrepare: Boolean(activeCharacter.data?.spellcasting?.can_prepare)');
    expect(addFlow).toContain('const spellsToAdd = sharedSpells.filter');
    expect(addFlow).toContain('await Promise.all(spellsToAdd.map');
    expect(addFlow).toContain('spells: [...currentSpells, ...nextSpells]');
    expect(addFlow).toContain('{ present: presentInShortcut }');
    expect(addFlow).not.toContain('createSharedSpell');
    expect(addFlow).toContain('openSpellDrawer(activeCharacter, () => renderHome(container), null');
  });

  it('does not open dice automatically when consuming an ability option', () => {
    const source = readFileSync('src/features/character/home.js', 'utf8');
    const useResource = source.slice(
      source.indexOf('const useResource = async'),
      source.indexOf('const requestResourceUse = async')
    );
    expect(useResource).toContain('await updateResource(parentResource.id');
    expect(useResource).not.toContain('openResourceRollOverlay');
  });

  it('shows ability option selection inside the shortcut dialog', () => {
    const source = readFileSync('src/features/character/home.js', 'utf8');
    const requestHandler = source.slice(
      source.indexOf('const requestResourceUse = async'),
      source.indexOf('const editResource')
    );
    expect(requestHandler).toContain("const resourceDialog = container.querySelector('.home-feature-panel--resources')?.closest('dialog')");
    expect(requestHandler).toContain('present: (options) => presentSheetDetail(resourceDialog, options)');
    expect(requestHandler).toContain('onRollOption: (child) => openResourceRollOverlay(child)');
  });

  it('opens spell details inside the launch shortcut dialog', () => {
    const source = readFileSync('src/features/character/home.js', 'utf8');
    const spellDetails = source.slice(
      source.indexOf("container.querySelectorAll('[data-spell-quick-open]')"),
      source.indexOf('const backgroundButton')
    );
    expect(spellDetails).toContain("String(entry.id) === String(spellId)");
    expect(spellDetails).toContain("present: (options) => presentSheetDetail(button.closest('dialog'), options)");
  });

  it('keeps the death save dice modal open after a roll', () => {
    const source = readFileSync('src/features/character/home.js', 'utf8');
    const deathSaveHandler = source.slice(
      source.indexOf("const deathSaveManagerButton = container.querySelector('[data-manage-death-saves]')"),
      source.indexOf("container.querySelectorAll('[data-weakness-level]')")
    );
    expect(deathSaveHandler).toContain('keepOpen: true');
    expect(deathSaveHandler).toContain("cardClass: 'modal-card--death-saves'");
  });

  it('consumes the selected slot and opens configured spell damage dice', () => {
    const source = readFileSync('src/features/character/home.js', 'utf8');
    const launchHandler = source.slice(
      source.indexOf("container.querySelectorAll('[data-use-spell]')"),
      source.indexOf("container.querySelectorAll('[data-consume-spell-slot]')")
    );
    expect(launchHandler).toContain('consumeSpellSlot(activeCharacter, selectedLevel');
    expect(launchHandler).toContain('buildSpellDamageOverlayConfig(spell, selectedLevel)');
    expect(launchHandler).toContain('openDiceOverlay');
    expect(launchHandler).toContain("rollType: 'DMG'");
  });

  it('asks for confirmation when only a higher-level spell slot remains', () => {
    const source = readFileSync('src/features/character/home.js', 'utf8');
    const slotPicker = source.slice(
      source.indexOf('async function chooseSpellSlotLevel'),
      source.indexOf('export async function renderHome')
    );
    expect(slotPicker).toContain('options.some((option) => option.level > baseLevel)');
    expect(slotPicker).toContain('options.length === 1 && !hasHigherLevelOption');
  });

  it('opens a compact amount picker when consuming a pool resource', () => {
    const source = readFileSync('src/features/character/home.js', 'utf8');
    const requestHandler = source.slice(
      source.indexOf('const requestResourceUse'),
      source.indexOf('const editResource')
    );
    const useHandler = source.slice(
      source.indexOf("container.querySelectorAll('[data-use-resource]')"),
      source.indexOf("container.querySelectorAll('[data-use-spell]')")
    );
    expect(requestHandler).toContain("parentResource.resource_type === 'pool'");
    expect(requestHandler).toContain('openResourcePoolConsumeModal(parentResource)');
    expect(requestHandler).toContain('useResource(parentResource, amount, usageResource)');
    expect(useHandler).toContain('requestResourceUse(resource)');
    expect(useHandler).not.toContain('openResourceDetails(resource)');
  });

  it('consumes the configured child cost and rejects insufficient parent resources', () => {
    const source = readFileSync('src/features/character/home.js', 'utf8');
    const useHandler = source.slice(
      source.indexOf('const useResource'),
      source.indexOf('const editResource')
    );
    expect(useHandler).toContain('const consumedAmount = Math.max(1, Number(amount) || 1)');
    expect(useHandler).toContain('remaining < consumedAmount');
    expect(useHandler).toContain('let resourceCost = Math.max(1, Number(usageResource.resource_cost) || 1)');
    expect(useHandler).toContain('useResource(parentResource, resourceCost, usageResource)');
  });

  it('asks for the cost when a child resource has a variable cost', () => {
    const source = readFileSync('src/features/character/home.js', 'utf8');
    const useHandler = source.slice(
      source.indexOf('const requestResourceUse'),
      source.indexOf('const editResource')
    );
    expect(useHandler).toContain('usageResource.resource_cost_variable');
    expect(useHandler).toContain('openVariableResourceCostModal(usageResource, parentResource)');
    expect(useHandler).toContain('if (resourceCost === null) return');
  });

  it('supports attack and damage rolls for unarmed attacks', () => {
    const source = readFileSync('src/features/character/home.js', 'utf8');
    expect(source).toContain("rollKey.startsWith('unarmed:')");
    expect(source).toContain('const unarmedAttacks = Array.isArray(data.unarmed_attacks)');
    expect(source).toContain('value = `unarmed:${index}`');
    expect(source).toContain('calculateUnarmedAttackBonuses(activeCharacter.data || {}, attack)');
    expect(source).toContain('calculateUnarmedAttackBonuses(data, attack)');
  });

  it('keeps equipment assignment in inventory instead of a duplicate home shortcut', () => {
    const source = readFileSync('src/features/character/home.js', 'utf8');
    const inventory = readFileSync('src/features/inventory/inventory.js', 'utf8');
    expect(source).not.toContain('data-open-equipment-mannequin');
    expect(source).not.toContain('buildEquipSection');
    expect(inventory).toContain('openEquipmentPicker({');
    expect(inventory).toContain('onEquip: (item, equipSlots, currentItems)');
    expect(inventory).toContain("listEl.querySelectorAll('[data-unequip-item]')");
  });

  it('routes footer game actions directly and uses aligned compact dialogs', () => {
    const source = readFileSync('src/features/character/home.js', 'utf8');
    const catalogPicker = readFileSync('src/features/inventory/catalogPicker.js', 'utf8');
    const styles = readFileSync('src/styles/shellExperience.css', 'utf8');
    expect(source).toContain("event.target.closest('[data-game-action]')");
    expect(source).not.toContain("event.target.closest('[data-actions-fab]')");
    const quickActionUses = (source.match(/modal-card--quick-action/g)?.length || 0)
      + (catalogPicker.match(/modal-card--quick-action/g)?.length || 0);
    expect(quickActionUses).toBeGreaterThanOrEqual(3);
    expect(styles).toContain('.modal-card--quick-action .modal-footer');
    expect(styles).toContain('.modal-card--quick-action .modal-actions');
  });

  it('removes the redundant character header and keeps editing inside the wide profile card', () => {
    const source = readFileSync('src/features/character/home.js', 'utf8');
    const sections = readFileSync('src/features/character/home/sections.js', 'utf8');
    const styles = readFileSync('src/features/character/home/characterSheetPolish.css', 'utf8');
    expect(source).not.toContain('character-sheet-header__crest');
    expect(source).not.toContain('Panoramica di gioco');
    expect(sections).toContain('character-edit-trigger character-edit-trigger--identity');
    expect(sections).toContain('<span>Modifica personaggio</span>');
    expect(styles).toContain('.character-edit-trigger--identity');
    expect(styles).toContain(".app-shell[data-route='home'] > .app-main");
    expect(styles).toContain('grid-template-columns: 160px minmax(300px,1fr)');
    expect(styles).toContain('width: 160px; height: 160px; min-height: 160px; max-height: 160px');
    expect(styles).toContain('grid-template-columns: repeat(4,minmax(0,1fr)); grid-template-rows: 54px');
  });

  it('edits shortcut modifiers in place and includes them in actual rolls', () => {
    const source = readFileSync('src/features/character/home.js', 'utf8');
    const editor = readFileSync('src/features/character/home/generalModifiers.js', 'utf8');
    expect(source).toContain("container.querySelectorAll('[data-edit-general-modifier]')");
    expect(source).toContain('presentSheetDetail(dialog, options)');
    expect(source).toContain('button.dataset.editGeneralModifier');
    expect(source).toContain('const generalBonus = Number(data.skill_check_bonus) || 0');
    expect(source).toContain('const generalBonus = Number(data.saving_throw_bonus) || 0');
    expect(editor).toContain("key: 'damage_bonus_melee'");
    expect(editor).toContain("key: 'damage_bonus_ranged'");
    expect(editor).toContain('await saveCharacterData(character, nextData');
  });

  it('carries imported spellbook metadata into character spell details', () => {
    const source = readFileSync('src/features/character/home.js', 'utf8');
    expect(source).toContain('material: sharedSpell.material || null');
    expect(source).toContain('upcast_description: sharedSpell.upcast_description || null');
    expect(source).toContain('source_url: sharedSpell.source_url || null');
    expect(source).toContain('material: source.material || null');
    expect(source).toContain('upcast_description: source.upcast_description || null');
  });

});
