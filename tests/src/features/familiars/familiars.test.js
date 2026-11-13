import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('src/features/familiars/familiars.js', () => {
  it('stores and edits armor class for wild shape forms', () => {
    const source = readFileSync('src/features/familiars/familiars.js', 'utf8');
    expect(source).toContain('armor_class: source.armor_class ?? base.armor_class');
    expect(source).toContain("label: 'Classe armatura', name: 'armor_class'");
    expect(source).toContain("armor_class: toNumberOrNull(formData.get('armor_class'))");
    expect(source).toContain('class="combat-stat combat-stat--armor"');
    expect(source).toContain('<span class="combat-stat__label">Classe armatura</span>');
  });

  it('uses the character-sheet combat summary for familiar vitals', () => {
    const source = readFileSync('src/features/familiars/familiars.js', 'utf8');
    expect(source).toContain('familiar-detail-panel--operations');
    expect(source).toContain('familiar-detail-panel--combat');
    expect(source).toContain('<strong>Salute e combattimento</strong>');
    expect(source).toContain('class="combat-stat combat-stat--proficiency"');
    expect(source).toContain('class="hp-vitals-card familiar-hp-card"');
    expect(source).toContain('class="hp-bar-track" role="meter"');
    expect(source).toContain('class="familiar-movement-grid"');
    expect(source).toContain('familiar-operation-card--darkvision');
    expect(source).toContain('data-companion-hp-action="heal"');
    expect(source).toContain('data-companion-hp-action="damage"');
    expect(source).toContain('<span aria-hidden="true">+</span><strong>Cura</strong>');
    expect(source).toContain('<span aria-hidden="true">−</span><strong>Danno</strong>');
    expect(source).toContain('class="hp-vitals-card__temp-label familiar-temp-hp-label is-active"');
    expect(source).toContain('class="hp-bar-track hp-bar-track--temp-secondary"');
    expect(source).toContain('buildHpActionFields({ data: { hp: current.hp } }, action)');
    expect(source).toContain("formData.get('healing_target') === 'temp'");
    expect(source).toContain('temp: hpTemp + amount');
    expect(source).toContain('hp-bar hp-bar--temp is-active');
    expect(source).toContain('const absorbed = Math.min(hpTemp, amount)');
  });

  it('supports swimming speed in creation, persistence and the familiar summary', () => {
    const source = readFileSync('src/features/familiars/familiars.js', 'utf8');
    expect(source).toContain("swim: { label: 'Nuoto'");
    expect(source).toContain("name: 'speed_swim'");
    expect(source).toContain("swim: toNumberOrNull(formData.get('speed_swim'))");
    expect(source).not.toContain('.filter(([key]) => statBlock.speeds');
  });

  it('opens the shared image preview from the familiar portrait', () => {
    const source = readFileSync('src/features/familiars/familiars.js', 'utf8');
    expect(source).toContain("import { openAvatarModal } from '../character/home/modals.js'");
    expect(source).toContain('data-preview-companion=');
    expect(source).toContain('openAvatarModal(companion)');
  });

  it('integrates attacks into the sheet and removes shortcut tabs and the notes panel', () => {
    const source = readFileSync('src/features/familiars/familiars.js', 'utf8');
    const shortcut = readFileSync('src/features/character/home/shortcutViews.js', 'utf8');
    expect(shortcut).toContain('overview.append(abilities, operations, combat, attacks)');
    expect(shortcut).not.toContain("{ key: 'notes', label: 'Note'");
    expect(source).not.toContain('familiar-detail-panel--notes');
    expect(source).toContain('familiar-detail-panel--attacks');
  });

  it('shows kind plus immediate combat status in compact selectors and supports animals', () => {
    const source = readFileSync('src/features/familiars/familiars.js', 'utf8');
    expect(source).toContain("{ value: 'animal', label: 'Animale' }");

    const schema = readFileSync('docs/supabase-spells-companions-schema.sql', 'utf8');
    const migration = readFileSync('db/add_animal_companion_kind.sql', 'utf8');
    const allowedKinds = "('familiar', 'summon', 'transformation', 'animal')";
    expect(schema).toContain(`kind in ${allowedKinds}`);
    expect(migration).toContain(`check (kind in ${allowedKinds})`);
    expect(migration).toContain('drop constraint if exists character_companions_kind_check');

    expect(source).toContain('<span>${escapeHtml(formatKind(companion.kind))}</span>');
    expect(source).toContain('<small><b>${hpCurrent}/${hpMax}</b> PF · <b>${armorClass}</b> CA</small>');
    expect(source).toContain('class="familiar-quick-card__health" role="meter"');
    expect(source).toContain('class="familiar-sheet__kicker"');
    expect(source).toContain('class="familiar-add-button"');
    expect(source).toContain('<span aria-hidden="true">+</span><strong>Nuovo</strong>');
    expect(source).toContain('familiar-quick-card__selected');
    expect(source).not.toContain('familiar-sheet__chevron');
    expect(source).not.toContain('familiar-sheet__hp-summary');
  });

  it('builds a focused roster-first shortcut with explicit attack actions', () => {
    const source = readFileSync('src/features/familiars/familiars.js', 'utf8');
    const shortcut = readFileSync('src/features/character/home/shortcutViews.js', 'utf8');
    const styles = readFileSync('src/features/character/home/fantasyTheme.css', 'utf8');
    expect(source).toContain('play-card play-card--attack familiar-attack-card');
    expect(source).toContain('data-roll-attack="${escapeHtml(companion.id)}:${index}"');
    expect(source).toContain('Tiro per colpire');
    expect(source).toContain('play-card__button play-card__button--damage familiar-damage-button');
    expect(shortcut).toContain("layout?.classList.add('companion-shortcut-layout')");
    expect(shortcut).toContain("identity.className = 'familiar-sheet__identity'");
    expect(shortcut).toContain("host.dataset.familiarDetailOpen === 'true'");
    expect(shortcut).toContain('familiarListBack');
    expect(source).toContain("container.dataset.familiarDetailOpen = 'true'");
    expect(styles).toContain("grid-template-areas: 'quick' 'detail'");
    expect(styles).toContain('.companion-sheet-hero');
    expect(source).toContain("const usesContextualLoader = container.hasAttribute('data-shortcut-kind')");
    expect(source).toContain('if (!usesContextualLoader) setGlobalLoading(true)');
  });

  it('renders softly contrasted familiar panels and full attack actions', () => {
    const source = readFileSync('src/features/familiars/familiars.js', 'utf8');
    const styles = readFileSync('src/styles/base.css', 'utf8');

    expect(source).toContain('familiars-layout--refined');
    expect(source).toContain('familiars-quick-panel--refined');
    expect(source).toContain('familiar-sheet--refined');
    expect(source).toContain('familiar-detail-panel--abilities');
    expect(source).toContain('familiar-detail-panel--operations');
    expect(source).toContain('familiar-detail-panel--combat');
    expect(source).toContain('familiar-attacks-grid');
    expect(source).toContain('familiar-damage-button');
    expect(source).toContain('play-card__footer');
    expect(source).toContain('play-card__damage-actions');
    expect(styles).toContain('.familiar-sheet--refined');
    expect(styles).toContain('.familiar-detail-panel--attacks');
    expect(styles).toContain('.familiar-attack-card:hover');
  });

});
