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

describe('src/features/character/home/sections.js', () => {
  it('defines module-level API surface', () => {
    const source = readFileSync('src/features/character/home/sections.js', 'utf8');
    const exports = extractNamedExports(source);
    expect(source.trim().length).toBeGreaterThan(40);
    expect(exports.length).toBeGreaterThan(0);
    exports.forEach((name) => {
      expect(source).toContain(`export`);
      expect(source).toContain(name);
    });
  });
  it('renders the death save dice action and the redesigned profile status cards', () => {
    const source = readFileSync('src/features/character/home/sections.js', 'utf8');
    const styles = readFileSync('src/styles/base.css', 'utf8');
    expect(source).toContain('data-roll-death-save');
    expect(source).not.toContain('profile-status-card--proficiency');
    expect(source).toContain('profile-status-card--background');
    expect(source).toContain('character-profile-body');
    expect(styles).toContain('container-type: inline-size');
    expect(styles).toContain('@container (max-width: 430px)');
    expect(source).toContain('profile-status-card__label">Concentrazione');
    expect(source).toContain('<small>Archetipo</small>');
    expect(source).toContain('<small>Bonus Competenza</small><strong>${formatSigned(proficiencyBonus)}</strong>');
    expect(source).toContain("<small>Background</small><strong>${data.background ?? '-'}</strong>");
    expect(source).not.toContain('meta-tag--background');
    expect(source).toContain('profile-status-card__label">Storia Personaggio');
    expect(source).toContain("profile-status-card__state\">${hasInspiration ? 'Attiva' : 'Non attiva'}");
    expect(source).toContain("profile-status-card__state\">${hasConcentration ? 'Attiva' : 'Non attiva'}");
    expect(styles).toMatch(/\.character-meta\s*\{[^}]*display:\s*flex;[^}]*flex-wrap:\s*wrap;/s);
    expect(styles).toContain('grid-template-columns: minmax(112px, 1fr)');
    expect(styles).toMatch(/\.profile-status-card__label\s*\{[^}]*white-space:\s*nowrap;[^}]*\}/s);
    expect(styles).not.toMatch(/\.profile-status-card__label\s*\{[^}]*text-overflow:\s*ellipsis;/s);
  });

  it('renders the combat vitals panel with readable stats and preserved controls', () => {
    const source = readFileSync('src/features/character/home/sections.js', 'utf8');
    const styles = readFileSync('src/styles/base.css', 'utf8');
    expect(source).not.toContain('Difesa e vitalità');
    expect(source).toContain('class="combat-vitals-grid"');
    expect(source).toContain('class="combat-stat combat-stat--armor"');
    expect(source).toContain('data-roll-hit-dice');
    expect(source).toContain('data-weakness-level');
    expect(source).toContain('data-death-save');
    expect(source).toContain('role="meter"');
    expect(source).toContain('data-edit-conditions');
    expect(source).toContain("const isActive = level.value <= weakPoints");
    expect(source).toContain("const isCurrent = level.value === weakPoints");
    expect(source).toContain('Punti ferita temporanei');
    expect(source).toContain('Percezione passiva');
    expect(source).toContain('Scurovisione');
    expect(source).toContain('Dadi vita');
    expect(source).toContain('data-hp-action="heal"');
    expect(source).toContain('data-hp-action="damage"');
    expect(source).toContain('buildResourcePool(res)');
    expect(source).not.toContain('data-edit-resource="${res.id}"');
    expect(source).not.toContain('data-delete-resource="${res.id}"');
    expect(source).not.toContain('data-edit-spell="${spell.id}"');
    expect(source).not.toContain('data-delete-spell="${spell.id}"');
    expect(source).toContain('Trasformati (${wildShapeForms.length})');
    expect(source).toContain('Punti ferita forma');
    expect(source).toContain('hp-bar__fill--wild');
    expect(source).toContain('wildShapeDarkvisionLabel');
    expect(source).toContain('effectiveArmorClass');
    expect(source).toContain('effectiveSpeed');
    expect(source).not.toContain('Math.max(Number(abilities.str)');
    expect(source).not.toContain('${weaknessEffectsTooltip}');
    expect(source).not.toContain('${conditionsEffectsTooltip}');
    expect(styles).toContain('.combat-vitals-grid');
    expect(styles).toContain('.combat-status-card--weakness');
    expect(styles).toContain('@container (max-width: 470px)');
  });

  it('groups linked ability options under their parent resource', () => {
    const source = readFileSync('src/features/character/home/sections.js', 'utf8');
    expect(source).toContain('resources.filter((resource) => !resource.parent_resource_id)');
    expect(source).toContain('child_resource_count');
    expect(source).toContain('opzioni');
  });


  it('renders unarmed attacks alongside equipped weapons', () => {
    const source = readFileSync('src/features/character/home/sections.js', 'utf8');
    expect(source).toContain('const unarmedAttacks = Array.isArray(data.unarmed_attacks)');
    expect(source).toContain('data-roll-attack="unarmed:${index}"');
    expect(source).toContain('data-roll-damage="unarmed:${index}"');
    expect(source).toContain('Colpo senz’arma');
    expect(source).toContain('calculateUnarmedAttackBonuses(data, attack)');
    expect(source).toContain('modifier-ability--${abilityKey}');
  });
});
