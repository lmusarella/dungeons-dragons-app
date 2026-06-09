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

  it('renders the refined branded header and icon navigation footer', () => {
    const source = readFileSync('src/ui/layout.js', 'utf8');
    const styles = readFileSync('src/styles/base.css', 'utf8');

    expect(source).toContain('class="app-brand"');
    expect(source).toContain('Scheda digitale');
    expect(source).toContain('aria-label="Navigazione principale"');
    expect(source).toContain('class="bottom-nav__icon"');
    expect(styles).toContain('.app-shell .app-header');
    expect(styles).toContain('.app-shell .bottom-nav');
    expect(styles).toContain('.bottom-nav a.active .bottom-nav__pill');
    expect(source).toContain('class="actions-fab-item__icon"');
    expect(source).toContain('class="actions-fab-toggle__icon"');
    expect(styles).toContain('.actions-fab-item__icon');
  });

});
