import { describe, expect, it } from 'vitest';
import {
  findFeatureRollTables,
  findStructuredDiceFormulas,
  getFeatureDiceAdapter,
  getRollTableEntry,
  resolveAdditionalSpells,
  resolveCharacterFeatureMechanics
} from '../../../../src/features/character/featureMechanicsResolver.js';

const wildSurge = {
  id: 'wild-surge',
  slug: 'wild-surge',
  name: 'Wild Surge',
  name_it: 'Impeto Selvaggio',
  mechanics: {
    '5etools': {
      entries: [{ type: 'entries', entries: [{
        type: 'table',
        caption: 'Wild Magic',
        colLabels: ['d8', 'Effect'],
        rows: Array.from({ length: 8 }, (_, index) => [index + 1, `Effetto ${index + 1} con {@dice 1d6}`])
      }] }]
    }
  }
};

const progression = (...features) => ({
  automaticGrants: features.map((feature, index) => ({ entity: feature, unlock_level: index ? 10 : 3 })),
  choiceGroups: []
});

describe('featureMechanicsResolver', () => {
  it('does not expose Wild Surge before it is granted', () => {
    expect(resolveCharacterFeatureMechanics({ automaticGrants: [], choiceGroups: [] }, { data: { level: 2 } })).toEqual([]);
  });

  it('recursively recovers the nested Wild Magic d8 table at level 3', () => {
    const [resolved] = resolveCharacterFeatureMechanics(progression(wildSurge), { data: { level: 3 } });
    expect(resolved.name).toBe('Impeto Selvaggio');
    expect(resolved.tables[0]).toMatchObject({ title: 'Wild Magic', diceFormula: '1d8' });
    expect(resolved.tables[0].entries).toHaveLength(8);
  });

  it.each(Array.from({ length: 8 }, (_, index) => index + 1))('maps roll %i to its explicit table row', (roll) => {
    const [table] = findFeatureRollTables(wildSurge.mechanics, wildSurge);
    expect(getRollTableEntry(table, roll)?.description).toContain(`Effetto ${roll}`);
  });

  it('enables the reaction only when Unstable Backlash is actually granted', () => {
    const backlash = { id: 'backlash', slug: 'unstable-backlash', name: 'Unstable Backlash' };
    const [resolved] = resolveCharacterFeatureMechanics(progression(wildSurge, backlash), { data: { level: 10 } });
    expect(resolved.capabilities.reactionRoll).toBe(true);
  });

  it('enables two-result selection only when Controlled Surge is actually granted', () => {
    const controlled = { id: 'controlled', slug: 'controlled-surge', name: 'Controlled Surge' };
    const [resolved] = resolveCharacterFeatureMechanics(progression(wildSurge, controlled), { data: { level: 14 } });
    expect(resolved.capabilities.controlledSelection).toBe(true);
  });

  it('recognizes non-standard structured dice such as 1d3', () => {
    expect(findStructuredDiceFormulas({ '5etools': { entries: ['Tira {@dice 1d3} e applica il beneficio.'] } })).toContain('1d3');
    const adapter = getFeatureDiceAdapter('1d3');
    expect(adapter.engineFormula).toBe('1d6');
    expect([1, 2, 3, 4, 5, 6].map(adapter.mapResult)).toEqual([1, 1, 2, 2, 3, 3]);
  });

  it('keeps permanent choice options separate and includes only saved selections', () => {
    const maneuver = { id: 'trip', name: 'Trip Attack' };
    const result = resolveCharacterFeatureMechanics({
      automaticGrants: [],
      choiceGroups: [{ options: [{ id: 'selected', entity: maneuver }, { id: 'other', entity: { id: 'other-feature' } }] }]
    }, { data: { catalog_choice_option_ids: ['selected'] } });
    expect(result.map((feature) => feature.id)).toEqual(['trip']);
  });

  it('distinguishes known, prepared, expanded and innate additional spells', () => {
    const resolved = resolveAdditionalSpells({ '5etools': { additionalSpells: [{ known: { 1: ['bless'] }, prepared: { 3: ['aid'] }, expanded: { 1: ['cure wounds'] }, innate: { 5: ['fly'] } }] } });
    expect(resolved.map((entry) => entry.kind).sort()).toEqual(['expanded', 'innate', 'known', 'prepared']);
  });

  it('does not mutate Supabase mechanics JSON while resolving it', () => {
    const source = structuredClone(wildSurge.mechanics);
    const before = JSON.stringify(source);
    findFeatureRollTables(source, wildSurge);
    expect(JSON.stringify(source)).toBe(before);
  });
});
