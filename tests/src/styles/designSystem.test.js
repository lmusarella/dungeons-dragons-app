import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const styles = readFileSync('src/styles/design-system.css', 'utf8');
const baseStyles = readFileSync('src/styles/base.css', 'utf8');

describe('D&D Companion design refinements', () => {
  it('uses the cleaner Inter family for body and headings', () => {
    expect(baseStyles).not.toContain('family=Fraunces');
    expect(styles).toMatch(/--font-display:\s*'Inter'/);
  });

  it('keeps the character sheet atmospheric and integrates existing art', () => {
    expect(styles).toContain(".app-shell[data-route='home'] .app-main");
    expect(styles).toContain("url('/img/sfondo_login.jpg')");
    expect(styles).toContain("url('/img/sfondo_menu.jpg')");
    expect(styles).toContain("url('/img/sfondo_selezione.webp')");
  });

  it('restores semantic colors for quick actions and cast-time chips', () => {
    expect(styles).toContain(".actions-fab-item[data-hp-action='heal']");
    expect(styles).toContain(".actions-fab-item[data-open-dice]");
    expect(styles).toContain('.resource-chip--floating.resource-chip--bonus');
    expect(styles).toMatch(/\.resource-chip--floating\.resource-chip--bonus\s*\{[^}]*background:\s*#6940bb;/s);
  });

  it('maps ability cards and skill badges to the same color language', () => {
    ['str', 'dex', 'con', 'int', 'wis', 'cha'].forEach((ability) => {
      expect(styles).toContain(`.stat-card--${ability}`);
      expect(styles).toContain(`.skill-card__ability--${ability}`);
    });
  });

  it('keeps inventory headers sticky inside accordion scroll areas', () => {
    expect(styles).toMatch(/\.inventory-group__children \.inventory-table__header,[\s\S]*?\.inventory-table--nested \.inventory-table__header\s*\{[^}]*position:\s*sticky\s*!important;[^}]*top:\s*0;/s);
  });

  it('gives the mannequin modal explicit viewport-aware dimensions', () => {
    expect(styles).toMatch(/\.modal-card\.modal-card--equipment-mannequin\s*\{[^}]*width:\s*min\(1180px, calc\(100vw - 16px\)\);[^}]*height:\s*calc\(100dvh - 16px\);/s);
    expect(styles).toMatch(/\.modal-card--equipment-mannequin \.modal-form\s*\{[^}]*min-height:\s*0;[^}]*overflow:\s*hidden;/s);
  });

  it('lets the original dice overlay control its translucency', () => {
    const refinementStart = styles.indexOf('/* Requested visual refinements');
    const refinements = styles.slice(refinementStart);
    expect(refinements).not.toContain('.diceov-backdrop');
    expect(refinements).not.toContain('.diceov-panel');
  });
});
