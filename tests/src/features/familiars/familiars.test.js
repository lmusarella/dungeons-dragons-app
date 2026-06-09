import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('src/features/familiars/familiars.js', () => {
  it('stores and edits armor class for wild shape forms', () => {
    const source = readFileSync('src/features/familiars/familiars.js', 'utf8');
    expect(source).toContain('armor_class: source.armor_class ?? base.armor_class');
    expect(source).toContain("label: 'Classe armatura', name: 'armor_class'");
    expect(source).toContain("armor_class: toNumberOrNull(formData.get('armor_class'))");
    expect(source).toContain('class="combat-stat combat-stat--armor"');
    expect(source).toContain('<span class="combat-stat__label">Classe armatura</span>');
  });

  it('uses the character-sheet combat summary for familiar vitals', () => {
    const source = readFileSync('src/features/familiars/familiars.js', 'utf8');
    expect(source).toContain('class="combat-vitals-grid familiar-combat-vitals-grid"');
    expect(source).toContain('class="combat-stat combat-stat--proficiency"');
    expect(source).toContain('class="hp-vitals-card familiar-hp-card"');
    expect(source).toContain('class="hp-bar-track" role="meter"');
    expect(source).toContain('class="familiar-movement-grid"');
    expect(source).toContain('vital-mini-chip--darkvision familiar-darkvision-chip');
    expect(source).toContain('data-companion-hp-action="heal"');
    expect(source).toContain('data-companion-hp-action="damage"');
    expect(source).toContain('<span aria-hidden="true">+</span><strong>Cura</strong>');
    expect(source).toContain('<span aria-hidden="true">−</span><strong>Danno</strong>');
    expect(source.indexOf('class="familiar-hp-actions"')).toBeLessThan(source.indexOf('class="hp-bar-label__temp-group familiar-temp-hp-label'));
    expect(source).toContain("allowTempHp: action === 'heal'");
    expect(source).toContain("allowMaxOverride: action === 'damage'");
    expect(source).toContain('temp: hpTemp + amount');
    expect(source).toContain('hp-bar hp-bar--temp is-active');
    expect(source).toContain('const absorbed = Math.min(hpTemp, amount)');
  });

  it('opens the shared image preview from the familiar portrait', () => {
    const source = readFileSync('src/features/familiars/familiars.js', 'utf8');
    expect(source).toContain("import { openAvatarModal } from '../character/home/modals.js'");
    expect(source).toContain('data-preview-companion=');
    expect(source).toContain('openAvatarModal(companion)');
  });

  it('uses a 40/60 split for attacks and notes', () => {
    const styles = readFileSync('src/styles/base.css', 'utf8');
    expect(styles).toContain('grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);');
    expect(styles).toContain('"attacks notes";');
  });

  it('shows only the companion kind in compact selectors and supports animals', () => {
    const source = readFileSync('src/features/familiars/familiars.js', 'utf8');
    expect(source).toContain("{ value: 'animal', label: 'Animale' }");
    expect(source).toContain('<span>${escapeHtml(formatKind(companion.kind))}</span>');
    expect(source).not.toContain('familiar-sheet__chevron');
    expect(source).not.toContain('familiar-sheet__hp-summary');
  });

  it('renders softly contrasted familiar panels and a compact damage action', () => {
    const source = readFileSync('src/features/familiars/familiars.js', 'utf8');
    const styles = readFileSync('src/styles/base.css', 'utf8');

    expect(source).toContain('familiars-layout--refined');
    expect(source).toContain('familiars-quick-panel--refined');
    expect(source).toContain('familiar-sheet--refined');
    expect(source).toContain('familiar-detail-panel--abilities');
    expect(source).toContain('familiar-detail-panel--attacks');
    expect(source).toContain('familiar-damage-button');
    expect(source).toContain('const DAMAGE_ACTION_ICON');
    expect(source).toContain('attack-action-button__svg');
    expect(styles).toContain('.familiar-sheet--refined');
    expect(styles).toContain('.familiar-detail-panel--attacks');
    expect(styles).toContain('.familiar-attack-card:hover');
  });

});
