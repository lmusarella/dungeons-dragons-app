import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('inventory accordion styles', () => {
  it('keeps scrolling inside each accordion instead of the full inventory list', () => {
    const source = readFileSync('src/styles/theme.css', 'utf8');

    expect(source).toMatch(/\.inventory-list-scroll\s*{[^}]*max-height:\s*none;[^}]*overflow:\s*visible;/s);
    expect(source).toMatch(/\.inventory-group--container\s*>\s*\.inventory-group__children,[\s\S]*?\.inventory-loose-accordion\s*>\s*\.inventory-group__children\s*{[^}]*max-height:[^;]+;[^}]*overflow:\s*auto;/s);
  });

  it('uses the emphasized container treatment for the loose items accordion', () => {
    const source = readFileSync('src/styles/theme.css', 'utf8');

    expect(source).toMatch(/\.inventory-group--container\.inventory-container-accordion,\s*\.inventory-loose-accordion\s*{[^}]*border:\s*2px solid rgba\(148, 123, 90, 0\.68\);/s);
    expect(source).toMatch(/\.inventory-container-accordion__summary,\s*\.inventory-loose-accordion__summary\s*{[^}]*background:\s*linear-gradient\(135deg, #efd9aa, #fff3d9\);/s);
  });
  it('lays out additional weapon grips across two readable rows', () => {
    const source = readFileSync('src/styles/theme.css', 'utf8');
    expect(source).toContain('"name die type remove"');
    expect(source).toContain('"damage attack type remove"');
    expect(source).toContain('.weapon-damage-mode-field--attack-modifier { grid-area: attack; }');
  });

});
