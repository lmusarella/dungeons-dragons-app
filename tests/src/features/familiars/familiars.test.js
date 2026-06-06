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
  });
});
