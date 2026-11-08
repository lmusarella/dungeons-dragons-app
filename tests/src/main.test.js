import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('main bootstrap flow', () => {
  it('wires core app bootstrap behavior', () => {
    const source = readFileSync('src/main.js', 'utf8');
    expect(source).toContain("registerRoute('login'");
    expect(source).toContain("registerRoute('home'");
    expect(source).toContain('initRouter()');
    expect(source).toContain('const hadServiceWorkerController = Boolean(navigator.serviceWorker?.controller)');
    expect(source).toContain("navigator.serviceWorker.addEventListener('controllerchange'");
    expect(source).toContain('window.location.reload()');
    expect(source).toContain('onNeedRefresh()');
    expect(source).toContain('bootstrapApp()');
  });
});
