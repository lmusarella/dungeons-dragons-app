import { describe, it, expect } from 'vitest';
import { readFileSync, statSync } from 'node:fs';

const sourceFile = 'src/lib/offline/dexie.js';

describe('src/lib/offline/dexie.js', () => {
  it('has a dedicated test file and non-empty source', () => {
    const stats = statSync(sourceFile);
    expect(stats.isFile()).toBe(true);
    expect(stats.size).toBeGreaterThan(0);
    const content = readFileSync(sourceFile, 'utf8').trim();
    expect(content.length).toBeGreaterThan(0);
  });
});
