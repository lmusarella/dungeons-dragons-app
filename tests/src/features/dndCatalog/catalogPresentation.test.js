import { describe, expect, it } from 'vitest';
import { labelIt, renderCatalogAdvancedDetails } from '../../../../src/features/dndCatalog/catalogPresentation.js';

describe('presentazione avanzata catalogo D&D', () => {
  it('presenta il bestiario con statistiche, modificatori, metri e azioni localizzate', () => {
    const html = renderCatalogAdvancedDetails({ key: 'creatures' }, {
      rules_version: '2014', challenge_rating: 0.25, armor_class: 15, hit_points: 22,
      creature_type: 'beast', size: 'medium',
      stat_block: {
        abilities: { str: 14, dex: 9, con: 12, int: 3, wis: 11, cha: 6 },
        speed: { walk: 30, fly: 60 },
        action: [{ name: 'Bite', attack_bonus: 4, damage_dice: '1d8+2', damage_type: 'piercing', entries: ['Attack.'] }]
      },
      stat_block_it: { action: [{ name: 'Morso', entries: ['Attacco in mischia.'] }] }
    });
    expect(html).toContain('1/4');
    expect(html).toContain('Forza');
    expect(html).toContain('+2');
    expect(html).toContain('9 m');
    expect(html).toContain('18 m');
    expect(html).toContain('Morso');
    expect(html).toContain('1d8+2');
    expect(html).not.toContain('[object Object]');
  });

  it('non converte nuovamente le velocità già espresse in metri', () => {
    const html = renderCatalogAdvancedDetails({ key: 'creatures' }, {
      stat_block: { speed: { walk: 30 } },
      stat_block_it: { speed_unit: 'm', speed: { walk: 9 } }
    });
    expect(html).toContain('9 m');
    expect(html).not.toContain('2.7 m');
  });

  it('interpreta proprietà strutturate senza mostrare JSON grezzo', () => {
    const html = renderCatalogAdvancedDetails({ key: 'feats' }, {
      feat_category: 'origin', repeatable: false,
      feat_data: { prerequisites: ['Livello 4'], ability_increases: { str: 1 } }
    });
    expect(html).toContain('Origine');
    expect(html).toContain('Prerequisiti');
    expect(html).toContain('Forza: 1');
    expect(labelIt('long_rest')).toBe('Riposo lungo');
  });
});
