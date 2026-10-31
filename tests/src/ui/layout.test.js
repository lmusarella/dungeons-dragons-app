import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

function extractNamedExports(source) {
  const names = new Set();
  const functionRegex = /export\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g;
  const constRegex = /export\s+const\s+([A-Za-z_$][\w$]*)\s*=/g;
  let match;
  while ((match = functionRegex.exec(source)) !== null) names.add(match[1]);
  while ((match = constRegex.exec(source)) !== null) names.add(match[1]);
  return [...names];
}

describe('src/ui/layout.js', () => {
  it('defines module-level API surface', () => {
    const source = readFileSync('src/ui/layout.js', 'utf8');
    const exports = extractNamedExports(source);
    expect(source.trim().length).toBeGreaterThan(40);
    expect(exports.length).toBeGreaterThan(0);
    exports.forEach((name) => {
      expect(source).toContain(`export`);
      expect(source).toContain(name);
    });
  });

  it('keeps the branded header and menu without redundant navigation launchers', () => {
    const source = readFileSync('src/ui/layout.js', 'utf8');
    const styles = readFileSync('src/styles/shellExperience.css', 'utf8');
    const baseStyles = readFileSync('src/styles/base.css', 'utf8');

    expect(source).toContain('class="app-brand"');
    expect(source).toContain('app-brand__eyebrow');
    expect(source).toContain('Gestionale schede personaggi');
    expect(source).toContain('href="#/home" data-character-row');
    expect(source).not.toContain('<nav class="bottom-nav"');
    expect(source).not.toContain('data-actions-toggle');
    expect(source).not.toContain('data-actions-fab');

    expect(styles).toContain('.app-shell .app-header');
    expect(styles).toContain("url('/img/sfondo_header_1.webp')");
    expect(source).toContain("wrapper.className = 'menu-list menu-navigation'");
    expect(source).toContain('menu-navigation__profile');
    expect(source).toContain('aria-current="page"');
    expect(source).not.toContain("route: 'settings'");
    expect(source).toContain("menuButton.setAttribute('aria-expanded', 'true')");
    expect(baseStyles).toContain('.menu-navigation .menu-item.is-active');
  });

  it('uses the shared centered header structure for rest confirmations', () => {
    const source = readFileSync('src/ui/layout.js', 'utf8');
    const styles = readFileSync('src/styles/shellExperience.css', 'utf8');
    expect(source).toContain('modal-header__top modal-header__top--confirm');
    expect(styles).toContain('.modal[data-confirm-modal] .modal-header__top--confirm');
  });

});
