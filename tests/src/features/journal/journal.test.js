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

describe('src/features/journal/journal.js', () => {
  it('defines module-level API surface', () => {
    const source = readFileSync('src/features/journal/journal.js', 'utf8');
    const exports = extractNamedExports(source);
    expect(source.trim().length).toBeGreaterThan(40);
    expect(exports.length).toBeGreaterThan(0);
    exports.forEach((name) => {
      expect(source).toContain(`export`);
      expect(source).toContain(name);
    });
  });

  it('renders the refined journal hierarchy without replacing its backgrounds', () => {
    const source = readFileSync('src/features/journal/journal.js', 'utf8');
    const styles = readFileSync('src/styles/base.css', 'utf8');
    const refinementStart = styles.indexOf('/* FAB, journal and secondary screens refinement');
    const refinementEnd = styles.indexOf('/* Stronger section hierarchy and contextual menu */');
    const refinement = styles.slice(refinementStart, refinementEnd);

    expect(source).toContain('journal-hero-card--refined');
    expect(source).toContain('journal-section-card--refined');
    expect(source).toContain('journal-entry-card__marker');
    expect(styles).toContain('.journal-entry-card--entry:hover');
    expect(refinement).not.toMatch(/background(?:-image|-color)?\s*:/);
  });
});
