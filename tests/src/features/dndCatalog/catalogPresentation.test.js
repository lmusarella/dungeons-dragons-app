import { describe, expect, it } from 'vitest';
import { labelIt, renderCatalogAdvancedDetails, renderCatalogSource } from '../../../../src/features/dndCatalog/catalogPresentation.js';

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

  it('espande le sigle delle fonti mantenendo il codice originale', () => {
    expect(renderCatalogSource({ source: 'EFA' })).toContain('Eberron: Forgia dell’Artefice (EFA)');
    expect(renderCatalogSource({ source: 'XPHB' })).toContain('Manuale del Giocatore (2024) (XPHB)');
    expect(renderCatalogSource({ source: 'Fonte personalizzata' })).toContain('Fonte personalizzata');
  });

  it('mostra tutti i possibili effetti di una tabella annidata nel dettaglio del privilegio', () => {
    const html = renderCatalogAdvancedDetails({ key: 'features' }, {
      id: 'wild-surge', name_it: 'Onda selvaggia', activation_type: 'null',
      mechanics: { '5etools': { entries: [{ entries: [{
        type: 'table', caption: 'Wild Magic', colLabels: ['d8', 'Effect'],
        rows: Array.from({ length: 8 }, (_, index) => [index + 1, `Effetto ${index + 1}`])
      }] }] } }
    });
    expect(html).toContain('Wild Magic');
    expect(html).toContain('1d8');
    expect(html).toContain('8 risultati possibili');
    expect(html).toContain('Effetto 1');
    expect(html).toContain('Effetto 8');
    expect(html).not.toContain('Null');
  });

  it('distingue i benefici di incantesimo di una sottoclasse come Anima Divina', () => {
    const html = renderCatalogAdvancedDetails({ key: 'subclasses' }, {
      subclass_data: { '5etools': { additionalSpells: [{
        known: { 1: ['{@spell bless|phb}'] },
        prepared: { 3: ['{@spell aid|phb}'] },
        expanded: { 1: [{ choose: 'level=1|class=cleric', count: 1 }] }
      }] } }
    });
    expect(html).toContain('Incantesimi conosciuti');
    expect(html).toContain('Sempre preparati');
    expect(html).toContain('Espansione della lista');
    expect(html).toContain('bless');
    expect(html).toContain('aid');
    expect(html).toContain('Scelta (1)');
    expect(html).not.toContain('[object Object]');
  });
});
