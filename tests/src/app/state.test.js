import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  normalizeCharacterId,
  setStoredActiveCharacterId,
  getStoredActiveCharacterId,
  clearStoredActiveCharacterIds,
  getState,
  setState,
  subscribe,
  setActiveCharacter,
  resetSessionState,
  updateCache,
  setCache
} from '../../../src/app/state.js';

const storage = new Map();

beforeEach(() => {
  storage.clear();
  vi.stubGlobal('localStorage', {
    getItem: (k) => storage.get(k) ?? null,
    setItem: (k, v) => storage.set(k, String(v)),
    removeItem: (k) => storage.delete(k),
    key: (i) => [...storage.keys()][i] ?? null,
    get length() { return storage.size; }
  });
  resetSessionState();
});

describe('src/app/state.js', () => {
  it('normalizes character id values', () => {
    expect(normalizeCharacterId(12)).toBe('12');
    expect(normalizeCharacterId('')).toBeNull();
  });

  it('stores and clears active character id per user', () => {
    setStoredActiveCharacterId('u1', 99);
    expect(getStoredActiveCharacterId('u1')).toBe('99');
    clearStoredActiveCharacterIds('u1');
    expect(getStoredActiveCharacterId('u1')).toBeNull();
  });

  it('notifies listeners and updates cache helpers', () => {
    const spy = vi.fn();
    const unsub = subscribe(spy);
    setState({ user: { id: 'abc' } });
    setActiveCharacter(7);
    updateCache('items', [{ id: 1 }]);
    setCache({ wallet: { gp: 4 } });
    expect(getState().activeCharacterId).toBe('7');
    expect(getState().cache.items).toEqual([{ id: 1 }]);
    expect(getState().cache.wallet).toEqual({ gp: 4 });
    expect(spy).toHaveBeenCalled();
    unsub();
  });
});
