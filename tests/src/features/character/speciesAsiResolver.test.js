import { describe, expect, it } from 'vitest';
import {
  applyAsiDelta,
  emptyAsi,
  evaluateAsiChoice,
  reconcileAsiChoice,
  resolveSpeciesAsi
} from '../../../../src/features/character/speciesAsiResolver.js';

const species = (slug, source, data, extra = {}) => ({ id: slug, slug, name: slug, source, rules_version: '2014', species_data: { '5etools': { source, ...data } }, ...extra });
const ALL = { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 };

describe('speciesAsiResolver', () => {
  it('Aarakocra EEPC: +2 DES, +1 SAG fissi', () => {
    const resolution = resolveSpeciesAsi({ species: species('aarakocra-eepc', 'EEPC', { ability: [{ dex: 2, wis: 1 }] }) });
    expect(resolution.kind).toBe('fixed');
    expect(resolution.status).toBe('resolved');
    expect(evaluateAsiChoice(resolution).applied).toEqual({ ...emptyAsi(), dex: 2, wis: 1 });
  });

  it('Aarakocra MPMM: bonus flessibili +2/+1 oppure +1/+1/+1', () => {
    const resolution = resolveSpeciesAsi({ species: species('aarakocra-mpmm', 'MPMM', {}) });
    expect(resolution.kind).toBe('flexible');
    expect(resolution.options.map((option) => option.id)).toEqual(['flex-2-1', 'flex-1-1-1']);
    expect(evaluateAsiChoice(resolution, { optionId: 'flex-2-1', picks: [['dex', 'wis']] }).applied).toEqual({ ...emptyAsi(), dex: 2, wis: 1 });
    const triple = evaluateAsiChoice(resolution, { optionId: 'flex-1-1-1', picks: [['dex', 'wis', 'con']] });
    expect(triple.complete).toBe(true);
    expect(triple.applied).toEqual({ ...emptyAsi(), dex: 1, wis: 1, con: 1 });
  });

  it('impedisce caratteristiche ripetute, fuori elenco o in eccesso', () => {
    const resolution = resolveSpeciesAsi({ species: species('x-mpmm', 'MPMM', {}) });
    expect(evaluateAsiChoice(resolution, { optionId: 'flex-2-1', picks: [['dex', 'dex']] }).valid).toBe(false);
    expect(evaluateAsiChoice(resolution, { optionId: 'flex-2-1', picks: [['dex', 'luck']] }).valid).toBe(false);
    expect(evaluateAsiChoice(resolution, { optionId: 'flex-2-1', picks: [['dex', 'wis', 'con']] }).valid).toBe(false);
    expect(evaluateAsiChoice(resolution, { optionId: 'flex-2-1', picks: [['dex']] })).toMatchObject({ valid: true, complete: false });
    expect(evaluateAsiChoice(resolution, { optionId: 'nope' }).valid).toBe(false);
  });

  it('Umano standard: +1 a tutte le caratteristiche', () => {
    const resolution = resolveSpeciesAsi({ species: species('human-phb', 'PHB', { ability: [ALL] }) });
    expect(evaluateAsiChoice(resolution).applied).toEqual(ALL);
  });

  it('Umano variante: +1 a due caratteristiche diverse', () => {
    const resolution = resolveSpeciesAsi({ species: species('human-variant-phb', 'PHB', { ability: [{ choose: { from: Object.keys(ALL), count: 2 } }] }) });
    expect(resolution.kind).toBe('special');
    expect(evaluateAsiChoice(resolution, { picks: [['str', 'int']] }).applied).toEqual({ ...emptyAsi(), str: 1, int: 1 });
    expect(evaluateAsiChoice(resolution, { picks: [['str', 'str']] }).valid).toBe(false);
    expect(evaluateAsiChoice(resolution, { picks: [['str']] }).complete).toBe(false);
  });

  it('Shifter: incrementi dalla variante, con avviso se non selezionata', () => {
    const shifter = species('shifter-erlw', 'ERLW', {});
    const beasthide = { id: 'v1', variant_data: { '5etools': { ability: [{ con: 1, str: 1 }] } } };
    const missing = resolveSpeciesAsi({ species: shifter, variants: [beasthide] });
    expect(missing.kind).toBe('unresolved');
    expect(missing.warnings.join(' ')).toMatch(/variante/i);
    const resolved = resolveSpeciesAsi({ species: shifter, variant: beasthide, variants: [beasthide] });
    expect(resolved.kind).toBe('variant');
    expect(evaluateAsiChoice(resolved).applied).toEqual({ ...emptyAsi(), con: 1, str: 1 });
  });

  it('_copy: eredita dall’originale, non rende flessibile e non inventa se non risolto', () => {
    const original = species('orig-vgm', 'VGM', { ability: [{ str: 2, cha: 1 }] });
    const copy = species('copy-mpmm', 'MPMM', { _copy: { name: 'Orig', source: 'VGM' } });
    const inherited = resolveSpeciesAsi({ species: copy, copyChain: [original] });
    expect(inherited.kind).toBe('inherited');
    expect(evaluateAsiChoice(inherited).applied).toEqual({ ...emptyAsi(), str: 2, cha: 1 });
    const unresolved = resolveSpeciesAsi({ species: copy, copyChain: [] });
    expect(unresolved.kind).toBe('unresolved');
    expect(unresolved.options).toEqual([]);
    expect(evaluateAsiChoice(unresolved).applied).toEqual(emptyAsi());
    expect(unresolved.warnings.length).toBeGreaterThan(0);
  });

  it('specie senza dati e fonte non flessibile: avviso, nessun incremento inventato', () => {
    const resolution = resolveSpeciesAsi({ species: species('nodata-phb', 'PHB', {}) });
    expect(resolution.kind).toBe('unresolved');
    expect(resolution.warnings.length).toBe(1);
  });

  it('2024: gli incrementi vengono dal background', () => {
    const resolution = resolveSpeciesAsi({ species: species('human-xphb', 'XPHB', { ability: [ALL] }, { rules_version: '2024' }), rulesVersion: '2024' });
    expect(resolution.source).toBe('background');
    expect(resolution.options).toEqual([]);
    expect(evaluateAsiChoice(resolution).applied).toEqual(emptyAsi());
  });

  it('Tasha: opzioni aggiunte solo se la campagna le abilita', () => {
    const phb = species('dwarf-phb', 'PHB', { ability: [{ con: 2 }] });
    expect(resolveSpeciesAsi({ species: phb }).options).toHaveLength(1);
    const withTasha = resolveSpeciesAsi({ species: phb, rules: { tashaCustomOrigin: true } });
    expect(withTasha.options.map((option) => option.id)).toEqual(['opt-0', 'tasha-flex-2-1', 'tasha-flex-1-1-1']);
    expect(resolveSpeciesAsi({ species: species('x-mpmm', 'MPMM', {}), rules: { tashaCustomOrigin: true } }).options).toHaveLength(2);
  });

  it('applica una sola volta e si aggiorna al cambio di specie/scelta', () => {
    const fixed = evaluateAsiChoice(resolveSpeciesAsi({ species: species('a', 'EEPC', { ability: [{ dex: 2, wis: 1 }] }) })).applied;
    let abilities = { str: 10, dex: 12, con: 10, int: 10, wis: 10, cha: 10 };
    abilities = applyAsiDelta(abilities, emptyAsi(), fixed);
    abilities = applyAsiDelta(abilities, fixed, fixed);
    expect(abilities).toMatchObject({ dex: 14, wis: 11 });
    abilities = applyAsiDelta(abilities, fixed, { ...emptyAsi(), con: 2 });
    expect(abilities).toEqual({ str: 10, dex: 12, con: 12, int: 10, wis: 10, cha: 10 });
  });

  it('reconcileAsiChoice scarta scelte non più valide', () => {
    const resolution = resolveSpeciesAsi({ species: species('x-mpmm', 'MPMM', {}) });
    expect(reconcileAsiChoice(resolution, { optionId: 'old', picks: [['dex']] })).toEqual({ optionId: null, picks: [] });
    expect(reconcileAsiChoice(resolution, { optionId: 'flex-2-1', picks: [['dex', 'dex', 'luck']] })).toEqual({ optionId: 'flex-2-1', picks: [['dex']] });
  });

  it('variante: somma al bonus base se aggiunge caratteristiche, sostituisce se ridefinisce le stesse o ha scelte', () => {
    const dwarf = species('dwarf', 'PHB', { ability: [{ con: 2 }] });
    const mountain = { variant_data: { '5etools': { ability: [{ str: 2 }] } } };
    expect(evaluateAsiChoice(resolveSpeciesAsi({ species: dwarf, variant: mountain })).applied).toEqual({ ...emptyAsi(), con: 2, str: 2 });
    const human = species('human', 'PHB', { ability: [ALL] });
    const variantHuman = { variant_data: { '5etools': { ability: [{ choose: { from: Object.keys(ALL), count: 2 } }] } } };
    const resolution = resolveSpeciesAsi({ species: human, variant: variantHuman });
    expect(resolution.options).toHaveLength(1);
    expect(evaluateAsiChoice(resolution, { picks: [['str', 'dex']] }).applied).toEqual({ ...emptyAsi(), str: 1, dex: 1 });
    const tiefling = species('tiefling', 'PHB', { ability: [{ cha: 2, int: 1 }] });
    const dispater = { variant_data: { '5etools': { ability: [{ cha: 2, dex: 1 }] } } };
    expect(evaluateAsiChoice(resolveSpeciesAsi({ species: tiefling, variant: dispater })).applied).toEqual({ ...emptyAsi(), cha: 2, dex: 1 });
  });
});
