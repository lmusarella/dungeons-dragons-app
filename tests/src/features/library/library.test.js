import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('src/features/library/library.js', () => {
  it('renders the refined centralized archive shell and filters', () => {
    const source = readFileSync('src/features/library/library.js', 'utf8');
    const styles = readFileSync('src/features/library/library.css', 'utf8');

    expect(source).toContain('library-shell--refined');
    expect(source).toContain('library-hero--refined');
    expect(source).toContain('library-hero__icon');
    expect(source).toContain('library-filter-panel--refined');
    expect(source).toContain('data-library-tab="items"');
    expect(source).toContain('data-library-add-item');
    expect(source).toContain('searchSharedItems');
    expect(source).toContain("spellRulesVersion: '2014'");
    expect(source).toContain('spellLevels: new Set()');
    expect(source).toContain('spellCasterClasses: new Set()');
    expect(source).toContain('data-spell-version="2024"');
    expect(source).toContain('data-spell-class=');
    expect(source).toContain('data-spell-source');
    expect(source).toContain('spellSources: new Set()');
    expect(source).toContain(".filter((spell) => !state.spellSources.size || state.spellSources.has(spellSourceKey(spell.source)))");
    expect(source).toContain('syncSpellSourceOptions()');
    expect(source).toContain('data-spell-source-options');
    expect(source).toContain('groupSpellSources(sources)');
    expect(source).not.toContain('data-library-import');
    expect(source).not.toContain('Importazione massiva JSON');
    expect(source).toContain('await canManageSharedCatalog()');
    expect(source).toContain('Catalogo in consultazione');
    expect(source).not.toContain("container.querySelector('[data-library-import]')?.addEventListener");
    expect(source).toContain('canManageCatalog ? { onEdit: () => editSpell(spell), onDelete: () => deleteSpell(spell) } : {}');
    expect(source).toContain('visible.map(itemCard)');
    expect(source).not.toContain('data-library-copy-item');
    expect(source).not.toContain('data-library-edit-item');
    expect(source).not.toContain('data-library-delete-item');
    expect(source).not.toContain('data-library-edit-spell=');
    expect(source).toContain('catalogMode: true');
    expect(styles).toContain('.library-shell--refined');
    expect(styles).toContain('.library-spell-card:focus-visible');
    expect(styles).toContain('.library-item-card { min-height: 0; }');
    expect(source).toContain('data-spell-class="${value}" aria-pressed="false"');
    expect(source).toContain('data-item-trait="magic" aria-pressed="false"');
    expect(source).toContain('itemCategories: new Set()');
    expect(source).toContain('!state.itemCategories.size || state.itemCategories.has(item.category)');
    expect(source).toContain('state.itemCategories.has(category) ? state.itemCategories.delete(category) : state.itemCategories.add(category)');
    expect(source).toContain("button.setAttribute('aria-pressed', String(state.spellLevels.has(level)))");
    expect(styles).toContain('.library-category-pills button::after');
    expect(styles).toContain('grid-template-columns: minmax(180px, 360px) minmax(0, 1fr) auto');
    expect(styles).toContain('min-height: 32px; align-self: end;');
  });

  it('preserves imported spell metadata when editing or assigning catalog entries', () => {
    const source = readFileSync('src/features/library/library.js', 'utf8');
    expect(source).toContain('material: spell.material || null');
    expect(source).toContain('upcast_description: spell.upcast_description || null');
    expect(source).toContain('source_url: spell.source_url || null');
    expect(source).toContain('source_key: spell.source_key || null');
    expect(source).toContain('spellPayload({ ...spell, ...updated })');
  });
});
