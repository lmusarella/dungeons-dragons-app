import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('src/features/familiars/familiars.js', () => {
  it('stores and edits armor class for wild shape forms', () => {
    const source = readFileSync('src/features/familiars/familiars.js', 'utf8');
    expect(source).toContain('armor_class: source.armor_class ?? base.armor_class');
    expect(source).toContain("label: 'Classe armatura', name: 'armor_class'");
    expect(source).toContain("armor_class: toNumberOrNull(formData.get('armor_class'))");
    expect(source).toContain('<span>CA</span><strong>${armorClass}</strong>');
  });
});
