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

    expect(source).toContain("buildRow([categoryField, containerField, maxVolumeField, ammunitionTypeField], 'compact')");
    expect(source).toContain("buildRow([weaponTypeField, weaponRangeField, weaponAbilityField, weaponMasteryField], 'compact')");
    expect(source).toContain('rangeGrid.append(thrownField, meleeRangeField, rangeNormalField, rangeDisadvantageField)');
    expect(source.indexOf('proficiencySection.appendChild(rangeGrid)'))
      .toBeLessThan(source.indexOf('proficiencySection.appendChild(weaponAmmoRow)'));
    expect(source).toContain("buildRow([armorTypeField, armorClassField, armorBonusField, shieldBonusField], 'compact')");
    expect(source).toContain("ammunitionTypeField.innerHTML = '<span>Tipo munizione</span>'");
    expect(source).toContain("const isConsumable = categorySelect.value === 'consumable'");
    expect(source).toContain('toggleFieldVisibility(ammunitionTypeField, isConsumable)');
    expect(source).toContain('ammunitionTypeSelect.disabled = !isConsumable');
    expect(source).not.toContain('const ammunitionTypeRow');
    expect(source).toContain('toggleFieldVisibility(armorShieldRow, showArmorFields)');
    expect(source).not.toContain('toggleFieldVisibility(weaponMasteryRow');
    expect(source).not.toContain('toggleFieldVisibility(weaponThrownRow');
    expect(source).not.toContain('toggleFieldVisibility(armorBonusRow');
    expect(source).toContain("labelField.classList.add('weapon-damage-mode-field--name')");
    expect(source).toContain("attackModifierField.classList.add('weapon-damage-mode-field--attack-modifier')");
  });
});
