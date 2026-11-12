import { describe, expect, it } from 'vitest';
import {
  asiLevelsFromFeatures, asiPointsForLevel, asiRemaining, buildCharacterPayload, canAddAsi, canIncreasePointBuy, computeAbilityTotals,
  defaultBaseScores, extractBackgroundSkills, extractClassSaves, extractClassSkills, hitPointsAtLevel, pointBuySpent,
  resolveSkillSelection, validatePointBuy, validateStandardArray
} from '../../../../src/features/characterBuilder/builderRules.js';
import { emptyAsi, resolveBackgroundAsi, evaluateAsiChoice } from '../../../../src/features/character/speciesAsiResolver.js';

describe('punteggi di caratteristica', () => {
  it('punto d’acquisto: costi, budget 27 e limiti 8-15', () => {
    expect(pointBuySpent(defaultBaseScores())).toBe(0);
    expect(pointBuySpent({ str: 15, dex: 15, con: 15, int: 8, wis: 8, cha: 8 })).toBe(27);
    expect(validatePointBuy({ str: 15, dex: 15, con: 15, int: 8, wis: 8, cha: 8 })).toMatchObject({ valid: true, remaining: 0 });
    expect(validatePointBuy({ str: 15, dex: 15, con: 15, int: 10, wis: 8, cha: 8 }).valid).toBe(false);
    expect(validatePointBuy({ ...defaultBaseScores(), str: 16 }).valid).toBe(false);
    const full = { str: 15, dex: 15, con: 15, int: 8, wis: 8, cha: 8 };
    expect(canIncreasePointBuy(full, 'int')).toBe(false);
    expect(canIncreasePointBuy(defaultBaseScores(), 'str')).toBe(true);
  });

  it('standard array: ogni valore una sola volta', () => {
    expect(validateStandardArray({ str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 }).valid).toBe(true);
    expect(validateStandardArray({ str: 15, dex: 15, con: 13, int: 12, wis: 10, cha: 8 }).valid).toBe(false);
    expect(validateStandardArray({ str: 15, dex: 14 })).toMatchObject({ valid: false, complete: false });
  });

  it('aumenti di classe: livelli dal catalogo, altrimenti livelli standard', () => {
    const rows = [4, 8, 6, 14].map((level) => ({ unlock_level: level, entity: { name: 'Ability Score Improvement' } }));
    expect(asiLevelsFromFeatures(rows)).toEqual({ levels: [4, 6, 8, 14], fromCatalog: true });
    expect(asiLevelsFromFeatures([]).fromCatalog).toBe(false);
    expect(asiPointsForLevel([4, 8, 12], 8)).toBe(4);
    expect(asiPointsForLevel([4, 8, 12], 3)).toBe(0);
  });

  it('somma specie/background, poi distribuisce i punti di classe con tetto 20', () => {
    const base = { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 };
    const { preAsi, final } = computeAbilityTotals({ base, species: { ...emptyAsi(), dex: 2, wis: 1 }, background: { ...emptyAsi(), con: 1 }, asi: { str: 2 } });
    expect(preAsi).toMatchObject({ dex: 16, wis: 11, con: 14 });
    expect(final.str).toBe(17);
    expect(asiRemaining(4, { str: 2 })).toBe(2);
    expect(canAddAsi(4, { str: 2 }, { str: 19 }, 'str')).toBe(false);
    expect(canAddAsi(2, { str: 2 }, { str: 15 }, 'dex')).toBe(false);
  });

  it('background 2024: incrementi 2/1 oppure 1/1/1 dal background, nessuno nel 2014', () => {
    const background = { rules_version: '2024', data: { '5etools': { ability: [{ choose: { weighted: { from: ['str', 'dex', 'con'], weights: [2, 1] } } }, { choose: { weighted: { from: ['str', 'dex', 'con'], weights: [1, 1, 1] } } }] } } };
    const resolution = resolveBackgroundAsi({ background, rulesVersion: '2024' });
    expect(resolution.options).toHaveLength(2);
    expect(evaluateAsiChoice(resolution, { optionId: 'opt-0', picks: [['str', 'dex']] }).applied).toMatchObject({ str: 2, dex: 1 });
    expect(evaluateAsiChoice(resolution, { optionId: 'opt-0', picks: [['str', 'wis']] }).valid).toBe(false);
    expect(resolveBackgroundAsi({ background, rulesVersion: '2014' }).status).toBe('not-applicable');
  });
});

describe('competenze', () => {
  const rogue = { class_data: { '5etools': { startingProficiencies: { skills: [{ choose: { from: ['acrobatics', 'athletics', 'sleight of hand', 'stealth', 'perception'], count: 2 } }] }, proficiency: ['dex', 'int'] } } };
  const acolyte = { data: { '5etools': { skillProficiencies: [{ insight: true, religion: true }] } } };

  it('estrae salvezze e scelte di abilità della classe', () => {
    expect(extractClassSaves(rogue)).toEqual(['dex', 'int']);
    expect(extractClassSkills(rogue).choices[0]).toMatchObject({ count: 2 });
    expect(extractClassSkills(rogue).choices[0].from).toContain('sleight_of_hand');
  });

  it('le competenze fisse del background sono di default e non si possono riscegliere', () => {
    const background = extractBackgroundSkills(acolyte);
    expect(background.fixed.sort()).toEqual(['insight', 'religion']);
    const classSkills = extractClassSkills(rogue);
    const incomplete = resolveSkillSelection({ classSkills, backgroundSkills: background, classPicks: [['stealth']] });
    expect(incomplete.complete).toBe(false);
    const ok = resolveSkillSelection({ classSkills, backgroundSkills: background, classPicks: [['stealth', 'perception']] });
    expect(ok.complete).toBe(true);
    expect(ok.selected.sort()).toEqual(['insight', 'perception', 'religion', 'stealth']);
    const duplicate = resolveSkillSelection({ classSkills: { fixed: [], choices: [{ count: 1, from: ['insight'] }] }, backgroundSkills: background, classPicks: [['insight']] });
    expect(duplicate.complete).toBe(false);
  });

  it('background con scelta libera tra abilità', () => {
    const background = extractBackgroundSkills({ data: { skillProficiencies: [{ any: 2 }] } });
    expect(background.choices[0].count).toBe(2);
    expect(background.choices[0].from).toHaveLength(18);
  });
});

describe('payload personaggio', () => {
  it('calcola PF, competenze e salvataggi coerenti con il drawer', () => {
    expect(hitPointsAtLevel(8, 1, 2)).toBe(10);
    expect(hitPointsAtLevel(8, 3, 2)).toBe(10 + 2 * 7);
    const payload = buildCharacterPayload({
      userId: 'u1',
      state: { name: ' Aria ', level: 5, version: '2014', subclass: null, variantId: null },
      classRecord: { id: 'c1', name: 'Rogue', hit_die: 8, class_data: { '5etools': { proficiency: ['dex', 'int'] } } },
      speciesRecord: { id: 's1', name: 'Elf', speed: 30 },
      backgroundRecord: { id: 'b1', name: 'Acolyte' },
      finalScores: { str: 10, dex: 16, con: 12, int: 14, wis: 10, cha: 8 },
      skillSelection: { selected: ['stealth'] },
      speciesAsiRecord: { version: 1, applied: emptyAsi() }
    });
    expect(payload).toMatchObject({ name: 'Aria', system: '2014', user_id: 'u1' });
    expect(payload.data).toMatchObject({ level: 5, class_name: 'Rogue', race: 'Elf', proficiency_bonus: 3, ac: 13, initiative: 3, shared_class_id: 'c1', shared_species_id: 's1' });
    expect(payload.data.saving_throws).toMatchObject({ dex: true, int: true, str: false });
    expect(payload.data.skills).toMatchObject({ stealth: true, arcana: false });
    expect(payload.data.hp.max).toBe(8 + 1 + 4 * (4 + 1 + 1));
    expect(payload.data.hit_dice).toEqual({ die: 'd8', max: 5, used: 0 });
  });
});
