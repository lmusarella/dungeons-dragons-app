import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  dedupeCharacterSpells,
  getCharacterMaxSpellLevel,
  getCharacterRulesVersion,
  inferCharacterCasterClasses
} from '../../../../src/features/character/spellPreparation.js';

describe('spell preparation helpers', () => {
  it('keeps always-ready spells out of the preparation catalog and relies on level filters only', () => {
    const source = readFileSync('src/features/character/home/modals.js', 'utf8');
    expect(source).toContain("Number(entry.level) > 0 && entry.prep_state !== 'always'");
    expect(source).not.toContain('data-prepared-status-filter');
  });

  it('asks how selected catalog spells are assigned and reuses preparation card styling', () => {
    const source = readFileSync('src/features/character/home.js', 'utf8');
    expect(source).not.toContain('data-spell-assignment-state');
    expect(source).toContain("preparedButton.name = 'assignment_prep_state'");
    expect(source).toContain("preparedButton.value = 'prepared'");
    expect(source).toContain("alwaysButton.value = 'always'");
    expect(source).toContain("formData.get('assignment_prep_state') === 'prepared' ? 'prepared' : 'always'");
    expect(source).toContain('submitButtons.forEach((button) => { button.disabled = count === 0; })');
    expect(source).toContain("prepared-spells-modal__spell play-card play-card--spell");
    expect(source).toContain("selected ? 'Selezionato' : 'Seleziona'");
    expect(source).toContain('openSpellQuickDetailModal(null, spell, null, { present })');
    expect(source).not.toContain('data-spell-preview');
    expect(source).not.toContain('shared-spell-picker__active-filters');
    expect(source).not.toContain('shared-spell-picker__search-icon');
    expect(source).not.toContain('shared-spell-picker__spell-badges');
    expect(source).toContain("submitLabel: 'Aggiungi come sempre preparati'");
    expect(source).toContain("const preparedButton = canPrepare ? document.createElement('button') : null");
  });

  it('keeps the acquisition picker compact and makes selected cards legible', () => {
    const source = readFileSync('src/features/character/home.js', 'utf8');
    const styles = readFileSync('src/features/character/home/fantasyTheme.css', 'utf8');

    expect(source).toContain('class="shared-spell-picker__property-filter" role="group" aria-label="Proprietà incantesimo"');
    expect(source).not.toContain('<span class="shared-spell-picker__filter-label">Proprietà</span>');
    expect(styles).toContain("'levels levels levels levels levels levels levels levels levels levels levels levels'");
    expect(styles).toContain("'classes classes classes classes classes classes classes classes classes classes classes reset'");
    expect(styles).toContain('.shared-spell-picker__spell-main .play-card__title {\n  grid-row: 2;');
    expect(styles).toContain('padding: 12px 12px 9px !important');
    expect(styles).toContain('.shared-spell-picker__select.is-active {\n  border-color: #76364b !important; background: #76364b !important; color: #fff8e9 !important;');
    expect(styles).toContain('background: #fff8e9 !important; color: #76364b !important; opacity: 1;');
    expect(styles).toContain('.shared-spell-picker__state {\n  grid-column: 1 / -1; width: 100%; min-height: 260px;');
    expect(styles).toContain('.shared-spell-picker__state--loading {\n  position: absolute; inset: 0; z-index: 2; min-height: 0; place-content: center;');
  });

  it('integrates preparation into the spell launch shortcut only for prepared casters', () => {
    const home = readFileSync('src/features/character/home.js', 'utf8');
    const layout = readFileSync('src/features/character/home/tabletLayout.js', 'utf8');
    const baseStyles = readFileSync('src/styles/base.css', 'utf8');

    expect(home).toContain("activeCharacter?.data?.spellcasting?.can_prepare ? `");
    expect(layout).toContain("prepareControl.classList.add('sheet-spell-action', 'sheet-spell-action--prepare')");
    expect(layout).toContain("addSpellControl.classList.add('sheet-spell-action', 'sheet-spell-action--add')");
    expect(layout).toContain('<span aria-hidden="true">+</span><span>Aggiungi incantesimi</span>');
    expect(layout).toContain('<span aria-hidden="true">+</span><span>Aggiungi Abilità</span>');
    expect(layout).not.toContain('const prepareShortcut = addPanel');
    expect(layout).not.toContain("preparation.className = 'sheet-preparation'");
    expect(baseStyles).not.toContain('.shared-spell-picker__spell-badges');
  });

  it('hydrates a missing base die from the updated shared spell snapshot', () => {
    const spells = dedupeCharacterSpells([
      { id: 'local', shared_spell_id: 'cure-wounds-2024', name: 'Cura Ferite', level: 1, damage_die: null, prep_state: 'prepared' },
      { id: 'link', shared_spell_id: 'cure-wounds-2024', name: 'Cura Ferite', level: 1, damage_die: '2d8', prep_state: 'prepared' }
    ]);
    expect(spells).toHaveLength(1);
    expect(spells[0].damage_die).toBe('2d8');
  });

  it('deduplicates shared copies while preserving custom spells as distinct entries', () => {
    const spells = dedupeCharacterSpells([
      { id: 'legacy', name: 'Desiderio', level: 9, rules_version: '2014', prep_state: 'known' },
      { id: 'link-1', shared_spell_id: 'wish-2014', name: 'Desiderio', level: 9, rules_version: '2014', prep_state: 'prepared' },
      { id: 'link-2', shared_spell_id: 'wish-2014', name: 'Desiderio', level: 9, rules_version: '2014', prep_state: 'known' }
    ]);

    expect(spells).toHaveLength(2);
    expect(spells.find((entry) => entry.shared_spell_id)).toMatchObject({ shared_spell_id: 'wish-2014', prep_state: 'prepared' });
    expect(spells.find((entry) => !entry.shared_spell_id)).toMatchObject({ id: 'legacy', prep_state: 'prepared' });
  });

  it('rejoins an edited catalog snapshot that temporarily lost its shared id', () => {
    const spells = dedupeCharacterSpells([
      { id: 'edited-copy', source_key: 'bless', name: 'Benedizione', level: 1, rules_version: '2024', prep_state: 'always' },
      { id: 'assignment', shared_spell_id: 'bless-2024', source_key: 'bless', name: 'Benedizione', level: 1, rules_version: '2024', prep_state: 'known' }
    ]);
    expect(spells).toHaveLength(1);
    expect(spells[0]).toMatchObject({ shared_spell_id: 'bless-2024', prep_state: 'always' });
  });

  it('keeps editions separate when they are distinct catalog entries', () => {
    const spells = dedupeCharacterSpells([
      { id: 'a', shared_spell_id: 'spell-2014', name: 'Scudo', level: 1, rules_version: '2014' },
      { id: 'b', shared_spell_id: 'spell-2024', name: 'Scudo', level: 1, rules_version: '2024' }
    ]);
    expect(spells).toHaveLength(2);
  });

  it('uses configured class lists and otherwise infers them from the character class', () => {
    expect(inferCharacterCasterClasses({ class_name: 'Guerriero / Mago' })).toEqual(['mago']);
    expect(inferCharacterCasterClasses({
      class_name: 'Mago',
      spellcasting: { caster_classes: ['chierico', 'druido'] }
    })).toEqual(['chierico', 'druido']);
  });

  it('derives the maximum preparable level from total or remaining slots', () => {
    expect(getCharacterMaxSpellLevel({ spellcasting: {
      slots: { 1: 0, 2: 1 },
      slots_max: { 1: 4, 2: 2, 3: 0 }
    } })).toBe(2);
  });

  it('uses the character rules edition before the spellcasting fallback', () => {
    expect(getCharacterRulesVersion({ system: '2024', data: { rules_version: '2014' } })).toBe('2024');
    expect(getCharacterRulesVersion({ system: 'dnd-2024', data: { spellcasting: { rules_version: '2014' } } })).toBe('2024');
    expect(getCharacterRulesVersion({ rules_version: '2024', spellcasting: { rules_version: '2014' } })).toBe('2024');
    expect(getCharacterRulesVersion({ spellcasting: { rules_version: '2024' } })).toBe('2024');
    expect(getCharacterRulesVersion({})).toBe('2014');
  });
});
