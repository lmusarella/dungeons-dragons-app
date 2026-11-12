import { describe, expect, it, vi } from 'vitest';
import { evaluateFormula, resolveProgression, resolveRecovery, buildFormulaContext } from '../../../../src/features/character/resourceFormula.js';
import { planCatalogResources } from '../../../../src/features/character/characterResourceResolver.js';

const feature = (id, name, extra = {}) => ({ id, name, rules_version: '2014', activation_type: 'action', resource_model: null, ...extra });
const pool = (id, key, extra = {}) => ({ id, resource_key: key, name: key, rules_version: '2014', ...extra });
const character = (level, extra = {}) => ({ id: 'c1', user_id: 'u1', data: { level, rules_version: '2014', abilities: { cha: 16, wis: 14 }, ...extra } });
const owned = (...features) => features.map((entry) => ({ feature: entry, optionId: null }));
const defs = ({ pools = [], providers = [], actions = [], options = [] }) => ({
  pools: new Map(pools.map((entry) => [entry.id, entry])), providers, actions, options: new Map(options.map((entry) => [String(entry.id), entry]))
});
const created = (plan) => plan.operations.filter((op) => op.op === 'create');
const byName = (plan, name) => plan.operations.find((op) => op.payload.name === name);

describe('formule risorse (senza eval)', () => {
  const vars = buildFormulaContext({ level: 5, abilities: { cha: 16, wis: 14 } });
  it('valuta numeri, variabili e funzioni', () => {
    expect(evaluateFormula('1', vars)).toBe(1);
    expect(evaluateFormula('max(1, cha_mod)', vars)).toBe(3);
    expect(evaluateFormula('proficiency_bonus + wis_mod', vars)).toBe(5);
    expect(evaluateFormula('class_level * 2', vars)).toBe(10);
    expect(evaluateFormula('wisdom_modifier', vars)).toBe(2);
  });
  it('rifiuta formule non supportate invece di inventare valori', () => {
    expect(evaluateFormula('wis', vars)).toBeNull();
    expect(evaluateFormula('process.exit()', vars)).toBeNull();
    expect(evaluateFormula('constructor', vars)).toBeNull();
    expect(evaluateFormula('1 / 0', vars)).toBeNull();
    expect(evaluateFormula(null, vars)).toBeNull();
  });
  it('risolve progressioni per livello di classe', () => {
    expect(resolveProgression({ 2: 2, 3: 3, 5: 5 }, 4, vars)).toBe(3);
    expect(resolveProgression({ 2: 2 }, 1, vars)).toBeNull();
    expect(resolveProgression([0, 2, 3, 4, 5], 5, vars)).toBe(5);
    expect(resolveProgression([{ level: 1, value: 1 }, { level: 6, value: 2 }], 5, vars)).toBe(1);
  });
  it('risolve i recuperi 0 / 1 / all / formula e non supera il massimo', () => {
    expect(resolveRecovery('0', 5, vars)).toBe(0);
    expect(resolveRecovery('1', 5, vars)).toBe(1);
    expect(resolveRecovery('all', 5, vars)).toBe(5);
    expect(resolveRecovery('99', 5, vars)).toBe(5);
    expect(resolveRecovery(null, 5, vars)).toBeUndefined();
    expect(resolveRecovery('boh', 5, vars)).toBeUndefined();
  });
});

describe('planCatalogResources', () => {
  it('Monaco 2014 livello 5: 5 Ki, tre consumi da 1, recupero breve completo', () => {
    const ki = feature('f-ki', 'Ki', { resource_model: 'pool_provider' });
    const flurry = feature('f-flurry', 'Flurry of Blows', { resource_model: 'pool_consumer', activation_type: 'bonus' });
    const patient = feature('f-patient', 'Patient Defense', { resource_model: 'pool_consumer', activation_type: 'bonus' });
    const step = feature('f-step', 'Step of the Wind', { resource_model: 'pool_consumer', activation_type: 'bonus' });
    const plan = planCatalogResources({
      character: character(5), owned: owned(ki, flurry, patient, step), rulesVersion: '2014',
      definitions: defs({
        pools: [pool('p-ki', 'ki_points', { name: 'Ki Points', name_it: 'Punti Ki', max_progression: { 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 }, recovery_short_formula: 'all', recovery_long_formula: 'all' })],
        providers: [{ pool_id: 'p-ki', shared_feature_id: 'f-ki', provider_role: 'grants' }],
        actions: [flurry, patient, step].map((entry) => ({ pool_id: 'p-ki', shared_feature_id: entry.id, operation: 'consume', amount_formula: '1', requires_review: false }))
      })
    });
    const kiRow = byName(plan, 'Punti Ki');
    expect(kiRow.payload).toMatchObject({ resource_type: 'pool', max_uses: 5, reset_on: 'short_rest', recovery_short: 5, recovery_long: 5, catalog_key: 'pool:p-ki' });
    expect(created(plan)).toHaveLength(4);
    ['Flurry of Blows', 'Patient Defense', 'Step of the Wind'].forEach((name) => {
      const child = byName(plan, name);
      expect(child.parentKey).toBe('pool:p-ki');
      expect(child.payload).toMatchObject({ resource_cost: 1, resource_cost_variable: false, max_uses: 0, cast_time: 'Azione Bonus' });
    });
  });

  it('Stregone: un solo pool, Metamagia dal medesimo pool, costo da revisionare non automatizzato', () => {
    const font = feature('f-font', 'Font of Magic', { resource_model: 'pool_provider' });
    const metamagic = feature('f-meta', 'Metamagic', { resource_model: 'mixed' });
    const options = [{ id: 'o-quick', label_override: 'Quickened Spell' }, { id: 'o-twin', label_override: 'Twinned Spell' }];
    const plan = planCatalogResources({
      character: character(5),
      owned: [...owned(font, metamagic), ...options.map((option) => ({ feature: null, optionId: option.id, option }))],
      rulesVersion: '2014',
      definitions: defs({
        pools: [pool('p-sp', 'sorcery_points', { max_formula: 'class_level', recovery_short_formula: '0', recovery_long_formula: 'all' })],
        providers: [{ pool_id: 'p-sp', shared_feature_id: 'f-font' }],
        actions: [
          { pool_id: 'p-sp', shared_choice_option_id: 'o-quick', operation: 'consume', amount_formula: '2', requires_review: false },
          { pool_id: 'p-sp', shared_choice_option_id: 'o-twin', operation: 'consume', amount_formula: null, requires_review: true }
        ],
        options
      })
    });
    expect(created(plan).filter((op) => op.payload.resource_type === 'pool')).toHaveLength(1);
    expect(byName(plan, 'sorcery_points').payload).toMatchObject({ max_uses: 5, reset_on: 'long_rest', recovery_short: 0, recovery_long: 5 });
    expect(byName(plan, 'Quickened Spell').payload).toMatchObject({ resource_cost: 2, resource_cost_variable: false });
    expect(byName(plan, 'Twinned Spell').payload).toMatchObject({ resource_cost_variable: true });
    expect(plan.summary.review).toHaveLength(1);
    expect(created(plan).every((op) => op.payload.max_uses === 0 || op.payload.resource_type === 'pool')).toBe(true);
  });

  it('Maestro di Battaglia liv. 3: 4 dadi, solo le manovre selezionate, nessun contatore per manovra', () => {
    const superiority = feature('f-sup', 'Combat Superiority', { resource_model: 'pool_provider' });
    const options = [{ id: 'o-riposte', label_override: 'Riposte' }, { id: 'o-trip', label_override: 'Trip Attack' }, { id: 'o-parry', label_override: 'Parry' }];
    const plan = planCatalogResources({
      character: character(3),
      owned: [...owned(superiority), ...options.slice(0, 2).map((option) => ({ feature: null, optionId: option.id, option }))],
      rulesVersion: '2014',
      definitions: defs({
        pools: [pool('p-sd', 'superiority_dice', { max_progression: { 3: 4, 7: 5, 15: 6 }, recovery_short_formula: 'all', recovery_long_formula: 'all' })],
        providers: [{ pool_id: 'p-sd', shared_feature_id: 'f-sup' }],
        actions: options.map((option) => ({ pool_id: 'p-sd', shared_choice_option_id: option.id, operation: 'consume', amount_formula: '1', requires_review: false })),
        options
      })
    });
    expect(byName(plan, 'superiority_dice').payload).toMatchObject({ max_uses: 4, resource_type: 'pool' });
    expect(created(plan).map((op) => op.payload.name).sort()).toEqual(['Riposte', 'Trip Attack', 'superiority_dice']);
    expect(created(plan).filter((op) => op.payload.max_uses > 0)).toHaveLength(1);
  });

  it('Chierico 2024: un solo pool Incanalare Divinità, recupero 1 al breve e tutti al lungo', () => {
    const channel = feature('f-cd', 'Channel Divinity', { rules_version: '2024', resource_model: 'pool_provider' });
    const spark = feature('f-spark', 'Divine Spark', { rules_version: '2024', resource_model: 'pool_consumer' });
    const turn = feature('f-turn', 'Turn Undead', { rules_version: '2024', resource_model: 'pool_consumer' });
    const plan = planCatalogResources({
      character: character(5, { rules_version: '2024' }), owned: owned(channel, spark, turn), rulesVersion: '2024',
      definitions: defs({
        pools: [pool('p-cd', 'channel_divinity', { rules_version: '2024', max_progression: { 2: 2, 6: 3, 18: 4 }, recovery_short_formula: '1', recovery_long_formula: 'all' })],
        providers: [{ pool_id: 'p-cd', shared_feature_id: 'f-cd' }],
        actions: [spark, turn].map((entry) => ({ pool_id: 'p-cd', shared_feature_id: entry.id, operation: 'consume', amount_formula: '1', requires_review: false }))
      })
    });
    expect(created(plan).filter((op) => op.payload.resource_type === 'pool')).toHaveLength(1);
    expect(byName(plan, 'channel_divinity').payload).toMatchObject({ max_uses: 2, reset_on: 'short_rest', recovery_short: 1, recovery_long: 2 });
  });

  it('i pool di un’altra versione delle regole non vengono usati', () => {
    const channel = feature('f-cd', 'Channel Divinity', { resource_model: 'pool_provider' });
    const plan = planCatalogResources({
      character: character(5), owned: owned(channel), rulesVersion: '2014',
      definitions: defs({ pools: [pool('p-cd', 'channel_divinity', { rules_version: '2024', max_formula: '2' })], providers: [{ pool_id: 'p-cd', shared_feature_id: 'f-cd' }] })
    });
    expect(plan.operations).toHaveLength(0);
  });

  it('capacità giornaliera: 1 utilizzo, 0 al breve, ripristino completo al lungo', () => {
    const daily = feature('f-daily', 'Daily Power', { resource_model: 'own_charges', max_uses_formula: '1', recovery_short_formula: '0', recovery_long_formula: 'all' });
    const plan = planCatalogResources({ character: character(3), owned: owned(daily), definitions: defs({}), rulesVersion: '2014' });
    expect(created(plan)[0].payload).toMatchObject({ resource_type: 'charges', max_uses: 1, reset_on: 'long_rest', recovery_short: 0, recovery_long: 1, catalog_key: 'feature:f-daily' });
  });

  it('formule mancanti: non assume zero e non crea contatori', () => {
    const noMax = feature('f-x', 'Mystery', { resource_model: 'own_charges', max_uses_formula: null });
    const provider = feature('f-p', 'Provider', { resource_model: 'pool_provider' });
    const plan = planCatalogResources({
      character: character(3), owned: owned(noMax, provider), rulesVersion: '2014',
      definitions: defs({ pools: [pool('p-1', 'strange', { max_formula: null, max_progression: null })], providers: [{ pool_id: 'p-1', shared_feature_id: 'f-p' }] })
    });
    expect(plan.operations).toHaveLength(0);
    expect(plan.summary.unresolved).toHaveLength(2);
  });

  it('resource_model NULL o unlimited: nessun contatore', () => {
    const plan = planCatalogResources({
      character: character(3), owned: owned(feature('f-a', 'Legacy'), feature('f-b', 'Unlimited', { resource_model: 'unlimited' })),
      definitions: defs({}), rulesVersion: '2014'
    });
    expect(plan.operations).toHaveLength(0);
  });

  it('è idempotente, conserva used e aggiorna solo i valori gestiti', () => {
    const ki = feature('f-ki', 'Ki', { resource_model: 'pool_provider' });
    const definitions = defs({
      pools: [pool('p-ki', 'ki_points', { name_it: 'Punti Ki', max_progression: { 2: 2, 5: 5, 6: 6 }, recovery_short_formula: 'all', recovery_long_formula: 'all' })],
      providers: [{ pool_id: 'p-ki', shared_feature_id: 'f-ki' }]
    });
    const row = { id: 'r1', catalog_key: 'pool:p-ki', name: 'Punti Ki', resource_type: 'pool', max_uses: 5, used: 3, reset_on: 'short_rest', recovery_short: 5, recovery_long: 5, can_have_children: true, cast_time: null };
    expect(planCatalogResources({ character: character(5), owned: owned(ki), definitions, existing: [row], rulesVersion: '2014' }).operations).toHaveLength(0);
    const levelUp = planCatalogResources({ character: character(6), owned: owned(ki), definitions, existing: [row], rulesVersion: '2014' });
    expect(levelUp.operations).toEqual([expect.objectContaining({ op: 'update', id: 'r1', payload: { max_uses: 6, recovery_short: 6, recovery_long: 6 } })]);
    expect(levelUp.operations[0].payload).not.toHaveProperty('used');
  });

  it('non duplica una risorsa manuale con lo stesso nome', () => {
    const daily = feature('f-daily', 'Daily Power', { resource_model: 'own_charges', max_uses_formula: '1', recovery_long_formula: 'all', recovery_short_formula: '0' });
    const plan = planCatalogResources({
      character: character(3), owned: owned(daily), definitions: defs({}), rulesVersion: '2014',
      existing: [{ id: 'm1', catalog_key: null, name: 'daily power', max_uses: 2, used: 1 }]
    });
    expect(plan.operations).toHaveLength(0);
    expect(plan.summary.skipped).toHaveLength(1);
  });
});

describe('riposi per risorse del catalogo', () => {
  it('applica recovery_short / recovery_long senza superare il massimo e senza toccare le risorse manuali', async () => {
    vi.resetModules();
    const updates = [];
    let rows = [];
    vi.doMock('../../../../src/lib/supabase.js', () => ({
      supabase: {
        from: () => ({
          select: () => ({ eq: async () => ({ data: rows, error: null }) }),
          update: (payload) => ({ eq: async (_column, id) => { updates.push({ id, ...payload }); return { error: null }; } })
        })
      }
    }));
    const { updateResourcesReset } = await import('../../../../src/features/character/characterApi.js');
    rows = [
      { id: 'cd', catalog_key: 'pool:cd', max_uses: 2, used: 2, reset_on: 'short_rest', recovery_short: 1, recovery_long: 2 },
      { id: 'daily', catalog_key: 'feature:d', max_uses: 1, used: 1, reset_on: 'long_rest', recovery_short: 0, recovery_long: 1 },
      { id: 'ki', catalog_key: 'pool:ki', max_uses: 5, used: 4, reset_on: 'short_rest', recovery_short: 5, recovery_long: 5 },
      { id: 'manual', catalog_key: null, max_uses: 3, used: 3, reset_on: 'long_rest', recovery_short: null, recovery_long: null }
    ];
    await updateResourcesReset('c1', 'short_rest');
    expect(updates).toEqual([{ id: 'cd', used: 1 }, { id: 'ki', used: 0 }]);
    updates.length = 0;
    await updateResourcesReset('c1', 'long_rest');
    expect(updates).toEqual([{ id: 'cd', used: 0 }, { id: 'daily', used: 0 }, { id: 'ki', used: 0 }, { id: 'manual', used: 0 }]);
  });
});
