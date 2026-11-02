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
  it('renders focused proficiency and death-save actions in the profile overview', () => {
    const source = readFileSync('src/features/character/home/sections.js', 'utf8');
    const styles = readFileSync('src/styles/base.css', 'utf8');
    expect(source).toContain('data-manage-death-saves');
    expect(source).toContain('profile-status-card--proficiencies');
    expect(source).toContain('profile-status-card--background');
    expect(source).toContain('character-profile-body');
    expect(styles).toContain('container-type: inline-size');
    expect(styles).toContain('@container (max-width: 430px)');
    expect(source).toContain('profile-status-card__label">Concentrazione');
    expect(source).toContain('class="character-identity__kicker"');
    expect(source).toContain('class="character-level-seal"');
    expect(source).toContain('character-identity__kicker--background');
    expect(source).toContain('character-identity__kicker--alignment');
    expect(source).toContain('combat-stat combat-stat--proficiency');
    expect(source).toContain('<span class="combat-stat__label">Bonus competenza</span>');
    expect(source).toContain('character-identity__kicker character-identity__kicker--race');
    expect(source).not.toContain("<small>Background</small><strong>${data.background ?? '-'}</strong>");
    expect(source).not.toContain("<small>Razza</small><strong>${data.race ?? '-'}</strong>");
    expect(source).not.toContain('meta-tag--background');
    expect(source).toContain('profile-status-card__label">Background');
    expect(source).toContain('profile-status-card__label">Competenze');
    expect(source).toContain("profile-status-card__state\">${hasInspiration ? 'Attiva' : 'Non attiva'}");
    expect(source).toContain("profile-status-card__state\">${hasConcentration ? 'Attiva' : 'Non attiva'}");
    expect(styles).toMatch(/\.character-meta\s*\{[^}]*display:\s*flex;[^}]*flex-wrap:\s*wrap;/s);
    expect(styles).toContain('grid-template-columns: minmax(112px, 1fr)');
    expect(styles).toMatch(/\.profile-status-card__label\s*\{[^}]*white-space:\s*nowrap;[^}]*\}/s);
    expect(styles).not.toMatch(/\.profile-status-card__label\s*\{[^}]*text-overflow:\s*ellipsis;/s);
    expect(source).toContain('aria-label="Stati rapidi del personaggio"');
    expect(source).toContain('status-launch-card--conditions');
    expect(source).toContain('status-launch-card--weakness');
    expect(source).not.toContain('character-proficiency-section');
    expect(source).toContain('data-proficiency-tab="fighting-styles"');
    expect(source).toContain('const currentWeakness = weakPoints > 0');
    expect(source).toContain('data-upload-avatar');
    expect(source).toContain('const initiativeRollKey = configuredInitiativeIndex >= 0');
    expect(source).toContain('data-special-skill-card="${escapeHtml(initiativeRollKey)}"');
  });

  it('renders proficiency summaries without decorative diamonds', () => {
    const source = readFileSync('src/features/character/home/sections.js', 'utf8');
    const attackSummary = source.slice(
      source.indexOf('<section class="attack-turn-summary"'),
      source.indexOf('<div class="attack-turn-summary__primary"')
    );
    expect(attackSummary).toContain('<small>Bonus competenza</small>');
    expect(attackSummary).not.toContain('◆');
  });

  it('renders the combat vitals panel with readable stats and preserved controls', () => {
    const source = readFileSync('src/features/character/home/sections.js', 'utf8');
    const styles = readFileSync('src/styles/base.css', 'utf8');
    expect(source).not.toContain('Difesa e vitalità');
    expect(source).toContain('class="combat-vitals-grid"');
    expect(source).toContain('class="combat-stat combat-stat--armor"');
    expect(source).toContain('data-roll-hit-dice');
    expect(source).toContain('data-edit-weakness');
    expect(source).toContain('data-manage-death-saves');
    expect(source).toContain('role="meter"');
    expect(source).toContain('data-edit-conditions');
    expect(source).toContain('weaknessLevelList.filter');
    expect(source).toContain('Punti ferita temporanei');
    expect(source).toContain('Percezione passiva');
    expect(source).toContain('Scurovisione');
    expect(source).toContain('Dadi vita');
    expect(source).not.toContain('character-hp-actions character-hp-actions--inline');
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


  it('renders distinct visual hierarchies for skills, attacks, and spells', () => {
    const source = readFileSync('src/features/character/home/sections.js', 'utf8');
    const homeSource = readFileSync('src/features/character/home.js', 'utf8');
    const styles = readFileSync('src/styles/base.css', 'utf8');

    expect(homeSource).toContain('home-feature-panel--skills');
    expect(homeSource).toContain('home-feature-panel--attacks');
    expect(homeSource).not.toContain('home-feature-panel--cantrips');
    expect(homeSource).toContain('home-feature-panel--spells');
    expect(homeSource).toContain('home-feature-panel--saves');
    expect(homeSource).toContain('home-feature-panel--special-skills');
    expect(homeSource).toContain('home-feature-panel--resources');
    expect(source).toContain('class="modifier-card modifier-card--interactive skill-card');
    expect(source).toContain("mastery ? 'Maestria' : proficient ? 'Competenza' : 'Prova base'");
    expect(source).toContain('class="spell-card__sigil attack-card__sigil"');
    expect(source).toContain('class="attack-card__damage"><small>Danni</small>');
    expect(source).toContain('class="spell-stats"');
    expect(source).toContain('class="spell-card__sigil"');
    expect(source).toContain('normalizeSpellSchool(spell.school)');
    expect(source).toContain('class="modifier-card modifier-card--interactive saving-throw-card');
    expect(source).toContain('class="modifier-card modifier-card--interactive skill-card special-skill-card');
    expect(source).toContain('class="resource-card__marker"');
    expect(source).toContain('class="resource-card__kind"');
    expect(source).toContain('<span class="resource-charge-label">Utilizzi</span>');
    expect(source).not.toContain('<span class="resource-charge-label">Cariche</span>');
    expect(source).not.toContain("res.resource_type === 'passive' ? 'Passiva'");
    expect(styles).toContain('.skill-card__status');
    expect(source).not.toContain('attack-card__icon');
    expect(styles).not.toContain('.attack-card__icon');
    expect(source).not.toContain('spell-card__level');
    expect(source).toContain('aria-label="Incantesimo di ${level}° livello"');
    expect(source).not.toContain("`${level}°` : '0'");
    expect(styles).toContain('.spell-card-actions');
    expect(styles).toContain('gap: 9px');
    expect(styles).toContain('.saving-throw-card__status');
    expect(styles).toContain('.special-skill-card.modifier-card');
    expect(styles).toContain('.home-feature-panel--resources .resource-card');
    expect(styles).not.toContain('#6542a6');
    expect(source).toContain('class="detail-section proficiency-overview"');
    expect(source).toContain('class="tab-bar proficiency-tab-bar"');
    expect(source).toContain('class="card home-card home-section home-scroll-panel equipment-management"');
    expect(source).toContain('class="modifier-card attack-card resource-card inventory-item-card equipped-item-card"');
    expect(source).toContain('class="equipment-empty-state"');
    expect(source).toContain('data-open-equipment-mannequin');
    expect(source).toContain('Visualizza manichino 3D');
    expect(source).not.toContain('data-add-equip');
    expect(styles).toContain('.proficiency-tab-bar .tab-bar__button.is-active');
    expect(styles).toContain('.equipped-item-card.resource-card');
    expect(styles).toContain('.modal-card--equipment-mannequin');
    expect(styles).toContain('.equipment-mannequin__part-button.is-selected');
    expect(styles).toContain('.equipment-mannequin__wardrobe-item.is-selected');
    expect(styles).toContain('.equipment-mannequin__part-button.is-drop-target');
    expect(styles).toContain('.equipment-mannequin__part-button.is-compatible');
    expect(styles).toContain('.equipment-mannequin__legend-swatch--equipped');
    expect(styles).toContain('@keyframes equipment-compatible-pulse');
    expect(styles).toContain('@keyframes equipment-selected-pulse');
    expect(styles).toContain('.equipment-mannequin__load');
    expect(styles).toContain('.equipment-mannequin__item-image');
    expect(styles).toContain('.modal-card .field input:focus');
    expect(styles).toContain('--section-teal: #2f5f63');
    expect(styles).toContain('.home-feature-panel {');
    expect(styles).toContain('inset 0 4px 0 var(--feature-color)');
    expect(styles).toContain('.journal-section-card--entries');
    expect(styles).toContain('.settings-panel--inventory');
    expect(source).toContain('attack-action-button--damage');
    expect(source).not.toContain('attack-action-button--mode');
    expect(source).not.toContain('const WEAPON_MODE_ICON');
    expect(readFileSync('src/features/character/home/itemDetail.js', 'utf8')).toContain('weapon-grip-picker');
    expect(source).toContain('attack-action-button__svg');
    expect(styles).toContain('.modifier-card--mastery .skill-card__status::before');
    expect(styles).toContain('.modifier-card--proficiency .saving-throw-card__status::before');
    expect(styles).toContain('.spell-prepared-list__card.resource-card');
    expect(styles).toContain('inset 3px 0 0 rgba(59, 93, 96, 0.68)');
    expect(styles).toContain('.home-feature-panel--resources .resource-card');
    expect(styles).toContain('inset 3px 0 0 rgba(97, 116, 59, 0.68)');
    expect(styles).toContain('.equipment-management .equipped-item-card.resource-card');
    expect(styles).toContain('background: #f6ead8');
    expect(source).not.toContain('data-add-equip');
    expect(styles).toContain('.attack-card.modifier-card:not(.resource-card) .attack-card__title');
    expect(styles).toContain('grid-template-areas:');
    expect(styles).toContain('\"sigil title\"');
    expect(styles).toContain('.home-feature-panel--spells .charge-indicator--used');
    expect(styles).toContain('background: #d9655b');
  });

  it('renders unarmed attacks alongside equipped weapons', () => {
    const source = readFileSync('src/features/character/home/sections.js', 'utf8');
    expect(source).toContain('const unarmedAttacks = Array.isArray(data.unarmed_attacks)');
    expect(source).toContain('data-roll-attack="unarmed:${index}"');
    expect(source).toContain('data-roll-damage="unarmed:${index}"');
    expect(source).toContain('Colpo senz’arma');
    expect(source).toContain('calculateUnarmedAttackBonuses(data, attack)');
    expect(source).toContain('caratteristica ${escapeHtml(abilityLabel)}');
  });

  it('shows editable general modifiers in the related play shortcuts', () => {
    const source = readFileSync('src/features/character/home/sections.js', 'utf8');
    const styles = readFileSync('src/features/character/home/fantasyTheme.css', 'utf8');
    expect(source).toContain('const generalBonus = Number(data.skill_check_bonus) || 0');
    expect(source).toContain('const generalBonus = Number(data.saving_throw_bonus) || 0');
    expect(source).toContain('data-edit-general-modifier="skills"');
    expect(source).toContain('data-edit-general-modifier="savingThrows"');
    expect(source).toContain('data-edit-general-modifier="damage"');
    expect(source).toContain('const hasConfiguredAttacks = Boolean(');
    expect(styles).toContain('.roll-general-modifier');
    expect(styles).toContain('.attack-turn-summary__edit');
  });
});
