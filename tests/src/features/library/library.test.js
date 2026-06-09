import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('src/features/library/library.js', () => {
  it('renders the refined centralized archive shell and filters', () => {
    const source = readFileSync('src/features/library/library.js', 'utf8');
    const styles = readFileSync('src/styles/base.css', 'utf8');

    expect(source).toContain('library-shell--refined');
    expect(source).toContain('library-hero--refined');
    expect(source).toContain('library-hero__icon');
    expect(source).toContain('library-filter-panel--refined');
    expect(styles).toContain('.library-shell--refined');
    expect(styles).toContain('.library-spell-card:focus-visible');
  });
});
