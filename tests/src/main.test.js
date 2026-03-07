import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('main bootstrap flow', () => {
  it('wires core app bootstrap behavior', () => {
    const source = readFileSync('src/main.js', 'utf8');
    expect(source).toContain("registerRoute('login'");
    expect(source).toContain("registerRoute('home'");
    expect(source).toContain('initRouter()');
    expect(source).toContain('registerSW({ immediate: true })');
    expect(source).toContain('bootstrapApp()');
  });
});
