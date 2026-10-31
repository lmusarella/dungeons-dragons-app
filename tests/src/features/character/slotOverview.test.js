import { describe, it, expect } from 'vitest';
import { buildCompactSpellSlots } from '../../../../src/features/character/home/slotOverview.js';
describe('compact slot overview', () => {
  it('is absent for non-casters but keeps the compact magic summary visible without slots', () => {
    expect(buildCompactSpellSlots({data:{}})).toBe('');
    const html = buildCompactSpellSlots({data:{is_spellcaster:true}});
    expect(html).toContain('Slot incantesimo');
    expect(html).toContain('Nessuno slot configurato');
  });
  it('shows remaining slots and exhausted levels with the correct total', () => {
    const html=buildCompactSpellSlots({data:{is_spellcaster:true,spellcasting:{slots:{1:2,2:0},slots_max:{1:4,2:3}}}});
    expect(html).toContain('Livello 1: 2 slot rimanenti su 4');
    expect(html).toContain('Livello 2: 0 slot rimanenti su 3');
    expect(html).toContain('is-exhausted');
    expect(html).not.toContain('Livello 3:');
    expect(html).not.toContain('Apri magie');
  });
  it('supports slot data without a separately configured maximum', () => {
    expect(buildCompactSpellSlots({data:{is_spellcaster:true,spellcasting:{slots:{3:2}}}})).toContain('Livello 3: 2 slot rimanenti su 2');
  });
  it('shows only the essential save DC and spell attack summary on the character sheet', () => {
    const html = buildCompactSpellSlots({data:{is_spellcaster:true,proficiency_bonus:3,abilities:{wis:16},spellcasting:{ability:'wis'}}});
    expect(html).not.toContain('Caratteristica');
    expect(html).toContain('<small>CD</small><strong>14</strong>');
    expect(html).toContain('<small>Attacco</small><strong>+6</strong>');
  });
});
