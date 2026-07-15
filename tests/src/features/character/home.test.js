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

  it('offers a large, searchable shared spell picker with filters and previews', () => {
    const source = readFileSync('src/features/character/home.js', 'utf8');
    const styles = readFileSync('src/styles/base.css', 'utf8');
    const picker = source.slice(
      source.indexOf('async function openSharedSpellPicker()'),
      source.indexOf('function shouldAutoUsageDice')
    );

    expect(picker).toContain("content.className = 'shared-spell-picker'");
    expect(picker).toContain('Scrivi il nome di un incantesimo...');
    expect(picker).toContain('Tutte le versioni');
    expect(picker).toContain('data-reset-spell-filters');
    expect(picker).toContain('data-spell-preview');
    expect(picker).toContain("pageSize: PAGE_SIZE");
    expect(picker).toContain("cardClass: ['modal-card--form', 'modal-card--shared-spell-picker']");
    expect(picker).toContain('submitButton.disabled = !selectedSpell');
    expect(styles).toContain('.modal-card--shared-spell-picker');
    expect(styles).toContain('width: min(1180px, calc(100vw - 32px))');
    expect(styles).toContain('.shared-spell-picker__workspace');
    expect(styles).toContain('@media (max-width: 820px)');
  });

  it('keeps the death save dice modal open after a roll', () => {
    const source = readFileSync('src/features/character/home.js', 'utf8');
    const deathSaveHandler = source.slice(
      source.indexOf("const deathSaveRollButton = container.querySelector('[data-roll-death-save]')"),
      source.indexOf("container.querySelectorAll('[data-death-save]')")
    );
    expect(deathSaveHandler).toContain('keepOpen: true');
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

  it('keeps equipment assignment inside the mannequin workflow without quick creation', () => {
    const source = readFileSync('src/features/character/home.js', 'utf8');
    expect(source).toContain('openEquipmentMannequin({');
    expect(source).toContain('onEquip: canEditCharacter ? equipFromMannequin : null');
    expect(source).toContain('onUnequip: canEditCharacter ? async (item) =>');
    expect(source).toContain('weightUnit: getWeightUnit(activeCharacter)');
    expect(source).not.toContain('onCreateItem: canEditCharacter');
    expect(source).not.toContain("container.querySelector('[data-add-equip]')");
  });

});
