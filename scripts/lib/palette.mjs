import postcss from 'postcss';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { COLOR_RE, parseColor, rgbKey, toLab } from './color.mjs';

export const walkCss = (dir) => readdirSync(dir).flatMap((entry) => {
  const path = join(dir, entry);
  return statSync(path).isDirectory() ? walkCss(path) : path.endsWith('.css') ? [path] : [];
});

export const categoryOf = (prop) => {
  if (/^(color|caret-color|-webkit-text-fill-color|text-decoration-color|fill|stroke|accent-color)$/.test(prop)) return 'text';
  if (/^background/.test(prop)) return 'background';
  if (/^(border|outline|column-rule)/.test(prop)) return 'border';
  if (/shadow|filter/.test(prop)) return 'shadow';
  return 'other';
};

const MASK = /url\([^)]*\)|'[^']*'|"[^"]*"/g;

export const colorMatches = (value) => {
  const masked = value.replace(MASK, (match) => ' '.repeat(match.length));
  return [...masked.matchAll(COLOR_RE)].map((match) => ({ text: match[0], index: match.index, parsed: parseColor(match[0]) }));
};

export const collectUses = (sources) => {
  const uses = new Map();
  let total = 0;
  for (const file of sources) {
    if (/(^|[\\/])(tokens|palette)\.css$/.test(file)) continue;
    postcss.parse(readFileSync(file, 'utf8')).walkDecls((decl) => {
      for (const { parsed } of colorMatches(decl.value)) {
        if (!parsed) continue;
        const key = rgbKey(parsed.rgb);
        const entry = uses.get(key) || { key, rgb: parsed.rgb, lab: toLab(parsed.rgb), n: 0, alphaUses: 0, categories: {}, files: new Set() };
        entry.n += 1; total += 1;
        if (parsed.alpha < 1) entry.alphaUses += 1;
        const category = decl.prop.startsWith('--') ? 'variable' : categoryOf(decl.prop);
        entry.categories[category] = (entry.categories[category] || 0) + 1;
        entry.files.add(file.split('\\').pop());
        uses.set(key, entry);
      }
    });
  }
  return { uses, total };
};
