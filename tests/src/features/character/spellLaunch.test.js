import { describe, it, expect } from 'vitest';
import { buildSpellSection } from '../../../../src/features/character/home/sections.js';
describe('compact spell launch reference', () => {
  it('keeps casting facts compact and moves calculated damage into its roll action', () => {
    const html = buildSpellSection({ data: { is_spellcaster: true, proficiency_bonus: 3, abilities: { int: 16 }, spellcasting: { can_prepare: true, ability: 'int', slots: { 1: 1 }, slots_max: { 1: 1 } }, spells: [{ id: 'fire', name: 'Fuoco', level: 1, prep_state: 'prepared', cast_time: 'Azione', components: 'V, S', attack_roll: true, attack_range_type: 'melee', range: '36 m', damage_die: '2d6', damage_modifier: 3, damage_type: 'fire' }] } });
    expect(html).not.toContain('Danni base'); expect(html).toContain('data-damage-notation="2d6 +3"'); expect(html).toContain('<small>Tempo</small>Azione');
    expect(html).toContain('<small>Componenti</small>V, S');
    expect(html).toContain('data-roll-attack="spell:fire"');
    expect(html).toContain('data-attack-modifier="+6"');
    expect(html).toContain('data-attack-range="melee"');
    expect(html).toContain('data-spell-slot-filter="1"');
    expect(html).not.toContain('<small>Tipo</small>Fuoco');
  });
  it('normalizes legacy known spells as prepared spells', () => {
    const data = { is_spellcaster: true, spells: [{ id: 'known', name: 'IncantoConosciuto', level: 1, prep_state: 'known' }] };
    expect(buildSpellSection({ data: { ...data, spellcasting: { can_prepare: false } } })).toContain('IncantoConosciuto');
    expect(buildSpellSection({ data: { ...data, spellcasting: { can_prepare: true } } })).toContain('IncantoConosciuto');
  });
  it('unifies cantrips and slotted spells while preserving ritual and concentration metadata', () => {
    const character = { data: { is_spellcaster: true, spellcasting: { can_prepare: false }, spells: [
      { id: 'light', name: 'Luce', level: 0, concentration: false, is_ritual: false },
      { id: 'ritual', name: 'Individuazione', level: 1, concentration: true, is_ritual: true }
    ] } };
    const spells = buildSpellSection(character);
    expect(spells).toContain('data-spell-ritual="true"');
    expect(spells).toContain('data-spell-concentration="true"');
    expect(spells).toContain('Luce');
    expect(spells).toContain('Individuazione');
    expect(spells).toContain('data-spell-slot-filter="0"');
    expect(spells).not.toContain('spell-stat--attack');
    expect(spells).toContain('>Trucchetti e incantesimi<');
    expect(spells).not.toContain('Sempre conosciuti');
    expect(spells).not.toContain('>Preparati<');
  });
});
