import { describe, expect, it } from 'vitest';
import { additionalSpellsOf, diffReferences, extractFromRecord, extractSpellReferences, parseSpellString } from '../../../../src/features/spellReferences/spellReferenceExtractor.js';

const owner = { ownerType: 'subclass', ownerId: 'sc-1' };

describe('estrazione dei riferimenti agli incantesimi', () => {
  it('parsifica nome, fonte e modificatore senza perdere il riferimento completo', () => {
    expect(parseSpellString('Hellish Rebuke|phb#2')).toEqual({ spellRef: 'Hellish Rebuke|phb', spellName: 'hellish rebuke', spellSource: 'phb', modifier: '2' });
    expect(parseSpellString('light#c')).toMatchObject({ spellName: 'light', spellSource: null, modifier: 'c' });
  });

  it('sottoclasse: gli incantesimi sempre preparati restano "prepared" con livello di sblocco', () => {
    const refs = extractSpellReferences(owner, [{ prepared: { 1: ['bless', 'cure wounds'], 3: ['lesser restoration'] } }]);
    expect(refs.map((ref) => [ref.spellName, ref.kind, ref.mode, ref.unlockLevel])).toEqual([
      ['bless', 'prepared', 'always_prepared', 1], ['cure wounds', 'prepared', 'always_prepared', 1], ['lesser restoration', 'prepared', 'always_prepared', 3]
    ]);
    expect(refs.every((ref) => ref.uses === null && ref.recovery === null)).toBe(true);
    expect(refs[0].jsonPath).toBe('additionalSpells[0].prepared.1[0]');
  });

  it('specie: distingue a volontà, usi giornalieri, usi per riposo e conosciuti', () => {
    const refs = extractSpellReferences({ ownerType: 'species', ownerId: 'tiefling' }, [{
      ability: 'cha',
      known: { 1: ['thaumaturgy#c'] },
      innate: { 3: { daily: { 1: ['hellish rebuke#2'] } }, 5: { daily: { '1e': ['darkness'] } }, 1: { will: ['minor illusion'] }, _: { rest: { 1: ['misty step'] } } }
    }]);
    const by = (name) => refs.find((ref) => ref.spellName === name);
    expect(by('thaumaturgy')).toMatchObject({ kind: 'known', modifier: 'c', ability: 'cha' });
    expect(by('minor illusion')).toMatchObject({ kind: 'innate', mode: 'at_will', uses: null });
    expect(by('hellish rebuke')).toMatchObject({ mode: 'daily', uses: 1, recovery: 'long_rest', unlockLevel: 3, modifier: '2' });
    expect(by('darkness')).toMatchObject({ mode: 'daily', usesEach: true, unlockLevel: 5 });
    expect(by('misty step')).toMatchObject({ mode: 'rest', recovery: 'short_or_long_rest', unlockLevel: null });
    expect(refs.filter((ref) => ref.kind === 'prepared')).toHaveLength(0);
  });

  it('expanded.all e choose restano selettori dinamici, non incantesimi concessi', () => {
    const refs = extractSpellReferences(owner, [{
      expanded: { s1: [{ all: 'level=1|class=Warlock' }, 'sleep'] },
      known: { _: [{ choose: 'level=0|class=Wizard', count: 2 }] }
    }]);
    const all = refs.find((ref) => ref.selector?.type === 'all');
    expect(all).toMatchObject({ kind: 'expanded', spellName: null, spellLevel: 1 });
    expect(all.selector.expression).toBe('level=1|class=Warlock');
    const choose = refs.find((ref) => ref.selector?.type === 'choose');
    expect(choose).toMatchObject({ kind: 'known', spellName: null });
    expect(choose.selector.count).toBe(2);
    expect(refs.find((ref) => ref.spellName === 'sleep')).toMatchObject({ kind: 'expanded', mode: 'list' });
  });

  it('legge additionalSpells da 5etools in class/subclass/species/variant e da mechanics', () => {
    const data = { '5etools': { additionalSpells: [{ innate: { _: ['light#c'] } }] } };
    expect(additionalSpellsOf({ species_data: data })).toHaveLength(1);
    expect(additionalSpellsOf({ variant_data: data })).toHaveLength(1);
    expect(additionalSpellsOf({ mechanics: data })).toHaveLength(1);
    expect(additionalSpellsOf({ subclass_data: JSON.stringify(data) })).toHaveLength(1);
    expect(additionalSpellsOf({})).toEqual([]);
    expect(extractFromRecord('variant', { id: 'v1', variant_data: data })[0]).toMatchObject({ ownerType: 'variant', ownerId: 'v1', kind: 'innate' });
  });
});

describe('importazione idempotente', () => {
  const extracted = extractSpellReferences(owner, [{ prepared: { 1: ['bless'], 3: ['spiritual weapon'] } }]);
  const row = (reference, extra = {}) => ({ key: reference.key, spell_ref: reference.spellRef, shared_spell_id: null, ...extra });
  const options = { keyOf: (entry) => entry.key, isManual: (entry) => Boolean(entry.shared_spell_id), same: (entry, reference) => entry.spell_ref === reference.spellRef };

  it('seconda esecuzione: nessuna modifica', () => {
    const diff = diffReferences(extracted, extracted.map((ref) => row(ref)), options);
    expect(diff).toMatchObject({ toInsert: [], toUpdate: [], unchanged: 2, orphaned: [] });
  });

  it('inserisce solo le nuove, aggiorna le cambiate e conserva le associazioni manuali', () => {
    const existing = [row(extracted[0], { spell_ref: 'old' }), row({ key: 'subclass:sc-1:additionalSpells[0].prepared.9[0]' }, { shared_spell_id: 'uuid-manuale' }), row({ key: 'subclass:sc-1:vecchio' })];
    const diff = diffReferences(extracted, existing, options);
    expect(diff.toInsert).toHaveLength(1);
    expect(diff.toUpdate).toHaveLength(1);
    expect(diff.keptManual).toHaveLength(1);
    expect(diff.orphaned.map((entry) => entry.key)).toEqual(['subclass:sc-1:vecchio']);
  });
});

describe('estrazione sui record reali (slug verificati)', () => {
  const alchemistTce = {
    id: 'a1', slug: 'artificer-alchemist-tce',
    subclass_data: { '5etools': { additionalSpells: [{ prepared: { 3: ['healing word', 'ray of sickness'], 5: ['flaming sphere', "melf's acid arrow"], 9: ['gaseous form', 'mass healing word'], 13: ['blight', 'death ward'], 17: ['cloudkill', 'raise dead'] } }] } }
  };
  const alchemistEfa = {
    id: 'a2', slug: 'artificer-alchemist-efa',
    subclass_data: { '5etools': { additionalSpells: [{ prepared: { 3: ['healing word|xphb', 'ray of sickness|xphb'] }, innate: { 3: { daily: { 1: ['healing word|xphb'] } } } }] } }
  };
  const divineSoul = {
    id: 'a3', slug: 'sorcerer-divine-soul-xge',
    subclass_data: { '5etools': { additionalSpells: ['Good', 'Evil', 'Law', 'Chaos', 'Neutrality'].map((name) => ({ name, known: { 1: [`${name.toLowerCase()} spell`] }, expanded: { s1: ['cure wounds', { all: 'level=1|class=Cleric' }] } })) } }
  };

  it('Alchimista (TCE): 10 incantesimi sempre preparati', () => {
    const refs = extractFromRecord('subclass', alchemistTce);
    expect(refs.filter((ref) => ref.spellName)).toHaveLength(10);
    expect(refs.every((ref) => ref.kind === 'prepared')).toBe(true);
  });

  it('Alchimista (EFA): preparati e uso giornaliero con riferimento completo', () => {
    const refs = extractFromRecord('subclass', alchemistEfa);
    expect(refs).toHaveLength(3);
    expect(refs.find((ref) => ref.mode === 'daily')).toMatchObject({ spellRef: 'healing word|xphb', uses: 1, recovery: 'long_rest', unlockLevel: 3 });
  });

  it('Anima Divina (XGE): cinque affinità con known ed expanded; expanded.all resta selettore', () => {
    const refs = extractFromRecord('subclass', divineSoul);
    expect(new Set(refs.map((ref) => ref.blockName)).size).toBe(5);
    expect(refs.filter((ref) => ref.kind === 'known')).toHaveLength(5);
    expect(refs.filter((ref) => ref.kind === 'expanded' && ref.spellName)).toHaveLength(5);
    expect(refs.filter((ref) => ref.selector?.type === 'all')).toHaveLength(5);
    console.log('Incantesimi trovati:', { tce: 10, efa: 3, xge: refs.length });
  });

  it('trova additionalSpells anche in una colonna JSON inattesa e con innate.atWill', () => {
    const row = { id: 'x', extra_json: JSON.stringify({ nested: { additionalSpells: [{ innate: { 1: { atWill: ['light#c'] } } }] } }) };
    const refs = extractFromRecord('species', row);
    expect(refs).toHaveLength(1);
    expect(refs[0]).toMatchObject({ mode: 'at_will', spellName: 'light' });
  });
});
