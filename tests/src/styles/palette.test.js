import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { collectUses, walkCss } from '../../../scripts/lib/palette.mjs';

const palette = readFileSync('src/styles/palette.css', 'utf8');
const tokens = readFileSync('src/styles/tokens.css', 'utf8');
const walk = (dir) => readdirSync(dir).flatMap((entry) => {
  const path = join(dir, entry);
  return statSync(path).isDirectory() ? walk(path) : [path];
});
const sheets = walkCss('src').map((path) => path.replaceAll('\\', '/'));

/* Ratchet: lower it whenever raw colours are replaced by palette tokens, never raise it. */
const MAX_RAW_COLOUR_USES = 371;

describe('colour palette', () => {
  it('defines each primitive once, as a #rrggbb value, with a matching -rgb twin when present', () => {
    const colours = [...palette.matchAll(/^\s*(--[a-z]+(?:-\d+)?):\s*(#[0-9a-f]{6});/gm)];
    expect(colours.length).toBeGreaterThan(40);
    expect(new Set(colours.map((match) => match[1])).size).toBe(colours.length);
    expect(new Set(colours.map((match) => match[2])).size).toBe(colours.length);
    const values = new Map(colours.map((match) => [match[1], match[2]]));
    const twins = [...palette.matchAll(/^\s*(--[a-z]+(?:-\d+)?)-rgb:\s*(\d+) (\d+) (\d+);/gm)];
    twins.forEach(([, name, r, g, b]) => {
      const hex = [r, g, b].map((channel) => Number(channel).toString(16).padStart(2, '0')).join('');
      expect(values.get(name), name).toBe(`#${hex}`);
    });
  });

  it('keeps tokens.css free of raw colours: every colour role points at a palette primitive', () => {
    expect(tokens.replace(/\/\*[\s\S]*?\*\//g, '')).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/);
    const names = new Set([...palette.matchAll(/^\s*(--[\w-]+):/gm)].map((match) => match[1]));
    [...tokens.matchAll(/:\s*var\((--[\w-]+)\)/g)].forEach(([, name]) => {
      expect(names.has(name) || tokens.includes(`${name}:`), name).toBe(true);
    });
  });

  it('resolves every var() without fallback to a declared custom property', () => {
    const declared = new Set();
    const used = new Map();
    const sources = sheets.map((path) => readFileSync(path, 'utf8'));
    sources.forEach((source) => {
      [...source.matchAll(/(--[\w-]+)\s*:/g)].forEach((match) => declared.add(match[1]));
      [...source.matchAll(/var\(\s*(--[\w-]+)\s*\)/g)].forEach((match) => used.set(match[1], (used.get(match[1]) || 0) + 1));
    });
    const jsSources = walk('src').filter((path) => path.endsWith('.js')).map((path) => readFileSync(path, 'utf8')).join('\n');
    const knownUndefined = new Set(['--header-height', '--ink', '--muted']);
    const missing = [...used.keys()].filter((name) => !declared.has(name) && !jsSources.includes(name) && !knownUndefined.has(name));
    expect(missing).toEqual([]);
  });

  it('does not grow the amount of raw colour values outside palette.css', () => {
    expect(collectUses(sheets).total).toBeLessThanOrEqual(MAX_RAW_COLOUR_USES);
  });
});
