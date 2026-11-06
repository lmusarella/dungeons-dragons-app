import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('src/features/character/home/hpModal.js', () => {
  it('provides the shared healing fields for characters and companions', () => {
    const source = readFileSync('src/features/character/home/hpModal.js', 'utf8');
    const shortcutFields = source.slice(source.indexOf('export function buildHpShortcutFields('), source.indexOf('export function buildHpActionFields('));
    expect(shortcutFields).toContain('if (allowTempHp)');
    expect(shortcutFields).toContain('name="temp_hp"');
    expect(shortcutFields).toContain('if (!allowHitDice)');
    expect(shortcutFields).not.toContain('Tipo di danno');
  });

  it('provides touch-friendly damage and healing actions', () => {
    const source = readFileSync('src/features/character/home/hpModal.js', 'utf8');
    expect(source).toContain('export function buildHpActionFields(');
    expect(source).toContain('data-hp-amount-preset');
    const presetHandler = source.slice(source.indexOf("wrapper.querySelectorAll('[data-hp-amount-preset]')"), source.indexOf("const maxChoice = wrapper.querySelector"));
    expect(presetHandler).not.toContain('amountInput.focus()');
    expect(presetHandler).not.toContain('amountInput.select()');
    expect(source).toContain('name="healing_target"');
    expect(source).toContain('name="change_hp_max"');
    expect(source).not.toContain('Tipo di danno');
  });
});
