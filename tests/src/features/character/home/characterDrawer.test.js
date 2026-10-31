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

describe('src/features/character/home/characterDrawer.js', () => {
  it('defines module-level API surface', () => {
    const source = readFileSync('src/features/character/home/characterDrawer.js', 'utf8');
    const exports = extractNamedExports(source);
    expect(source.trim().length).toBeGreaterThan(40);
    expect(exports.length).toBeGreaterThan(0);
    exports.forEach((name) => {
      expect(source).toContain(`export`);
      expect(source).toContain(name);
    });
  });

  it('leaves shortcut-managed attacks and special rolls out of the character wizard', () => {
    const source = readFileSync('src/features/character/home/characterDrawer.js', 'utf8');
    expect(source).not.toContain('+ Aggiungi colpo senz’arma');
    expect(source).not.toContain('+ Aggiungi tiro speciale');
    expect(source).not.toContain('unarmed_attack_count');
    expect(source).not.toContain('special_skill_name_');
    expect(source).toContain('unarmed_attacks: nextUnarmedAttacks');
    expect(source).toContain('const nextUnarmedAttacks = Array.isArray(characterData.unarmed_attacks)');
    expect(source).toContain('const nextSpecialSkillRolls = Array.isArray(characterData.special_skill_rolls)');
  });

  it('reveals the verified 2024 mastery choices only when the feature is enabled', () => {
    const source = readFileSync('src/features/character/home/characterDrawer.js', 'utf8');
    const masteries = readFileSync('src/features/rules/weaponMasteries.js', 'utf8');
    expect(source).toContain('weaponMasterySection.hidden = !enabled');
    expect(source).toContain("weaponMasterySection.setAttribute('aria-hidden', String(!enabled))");
    expect(source).toContain("name=\"weapon_mastery_enabled\"");
    ['cleave', 'graze', 'nick', 'push', 'sap', 'slow', 'topple', 'vex'].forEach((key) => {
      expect(masteries).toContain(`key: '${key}'`);
    });
    expect((masteries.match(/key:\s*'/g) || [])).toHaveLength(8);
  });

  it('presents the character editor as a horizontal guided workflow', () => {
    const source = readFileSync('src/features/character/home/characterDrawer.js', 'utf8');
    const styles = readFileSync('src/features/character/home/fantasyTheme.css', 'utf8');
    expect(source).toContain("stepperNav.className = 'character-edit-stepper-nav'");
    expect(source).toContain("stepperActions.classList.add('character-edit-stepper-actions--footer')");
    expect(styles).toMatch(/\.character-edit-stepper\s*\{[^}]*grid-template-rows:\s*auto minmax\(0,1fr\)/s);
    expect(styles).toMatch(/\.character-edit-stepper-nav\s*\{[^}]*grid-auto-flow:\s*column/s);
    expect(styles).toContain('overflow-x: auto');
    expect(styles).toMatch(/\.field input,[\s\S]*?\.field textarea\s*\{[^}]*min-height:\s*40px/s);
    expect(styles).toContain('.modal-actions.modal-actions--with-center');
    expect(styles).toContain('grid-template-columns: minmax(0,1fr) auto minmax(0,1fr)');
  });

  it('groups related character data into five compact steps', () => {
    const source = readFileSync('src/features/character/home/characterDrawer.js', 'utf8');
    const styles = readFileSync('src/features/character/home/fantasyTheme.css', 'utf8');
    expect(source).toContain("title: 'Identità & Background'");
    expect(source).toContain("title: 'Caratteristiche & Vita'");
    expect(source).toContain("title: 'Abilità & Competenze'");
    expect(source).toContain("title: 'Combattimento e magia'");
    expect(source).toContain("title: 'Resistenze & Immunità'");
    expect(source).not.toContain("title: 'Vantaggi & Svantaggi'");
    expect(source).not.toContain("title: 'Background'");
    expect(source).not.toContain("title: 'Vita e CA'");
    expect(source).toContain("layoutClass: 'character-edit-group--core-stats'");
    expect(source).toContain("layoutClass: 'character-edit-group--skills-proficiencies'");
    expect(source).toContain("layoutClass: 'character-edit-group--combat-magic'");
    expect(source).toContain('const nextRollAdjustments = characterData.roll_adjustments');
    expect(styles).toContain('.character-vitals-grid');
    expect(styles).toContain('grid-template-columns: repeat(6,minmax(0,1fr))');
    expect(source).toContain('class="defense-type-grid"');
    expect(source).toContain('class="defense-choice defense-choice--resistance"');
    expect(source).toContain('class="defense-choice defense-choice--immunity"');
    expect(source).toContain("name: 'fighting_styles'");
    expect(source).toContain("fighting_styles: formData.get('fighting_styles')");
    expect(source).toContain('spellcastingSection.hidden = !enabled');
    expect(styles).toContain('.character-edit-group--combat-magic__content:has(.character-edit-section--spellcasting[hidden])');
    expect(styles).toContain('.character-edit-section--background');
    expect(styles).toContain('grid-template-columns: minmax(220px,.35fr) minmax(0,1.65fr)');
  });

  it('persists the general skill and saving throw modifiers from the character editor', () => {
    const source = readFileSync('src/features/character/home/characterDrawer.js', 'utf8');
    expect(source).toContain("name: 'skill_check_bonus'");
    expect(source).toContain("name: 'saving_throw_bonus'");
    expect(source).toContain("skill_check_bonus: toNumberOrNull(formData.get('skill_check_bonus')) ?? 0");
    expect(source).toContain("saving_throw_bonus: toNumberOrNull(formData.get('saving_throw_bonus')) ?? 0");
    expect(source).toContain("name: 'damage_bonus_melee'");
    expect(source).toContain("name: 'damage_bonus_ranged'");
  });
});
