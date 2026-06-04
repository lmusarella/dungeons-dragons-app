import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('main bootstrap flow', () => {
  it('wires core app bootstrap behavior', () => {
    const source = readFileSync('src/main.js', 'utf8');
    expect(source).toContain("registerRoute('login'");
    expect(source).toContain("registerRoute('home'");
    expect(source).toContain('initRouter()');
    expect(source).toContain('const registerServiceWorker = () =>');
    expect(source).toContain('navigator.serviceWorker');
    expect(source).toContain('.register(`${import.meta.env.BASE_URL}sw.js`)');
    expect(source).toContain('bootstrapApp()');
  });
});
