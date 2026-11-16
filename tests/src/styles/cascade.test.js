import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const walk = (dir, extension) => readdirSync(dir).flatMap((entry) => {
  const path = join(dir, entry);
  return statSync(path).isDirectory() ? walk(path, extension) : path.endsWith(extension) ? [path] : [];
});
const rel = (path) => relative(process.cwd(), path).replaceAll('\\', '/');

const entry = readFileSync('src/styles/index.css', 'utf8');
const globalSheets = [...entry.matchAll(/@import\s+['"](\.[^'"]+\.css)['"]/g)].map((match) => rel(resolve('src/styles', match[1])));
const jsSources = walk('src', '.js').map((path) => [rel(path), readFileSync(path, 'utf8')]);
const jsCssImports = jsSources.flatMap(([file, source]) => [...source.matchAll(/import\s+['"]([^'"]+\.css[^'"]*)['"]/g)].map((match) => ({ file, specifier: match[1] })));

describe('stylesheet cascade', () => {
  it('declares the global cascade order in a single entry imported once by main.js', () => {
    expect(globalSheets).toEqual([
      'src/styles/palette.css',
      'src/styles/tokens.css',
      'src/styles/base.css',
      'src/styles/theme.css',
      'src/features/dice-roller/styles.css',
      'src/styles/shellExperience.css',
      'src/features/character/home/tabletLayout.css',
      'src/features/character/home/fantasyTheme.css',
      'src/features/character/home/characterSheetPolish.css',
    ]);
    expect(jsCssImports.filter(({ specifier }) => specifier.includes('index.css'))).toEqual([{ file: 'src/main.js', specifier: './styles/index.css' }]);
  });

  it('never imports a global stylesheet from a feature module or duplicates it with a cache-busting query', () => {
    jsCssImports.forEach(({ file, specifier }) => {
      expect(specifier, `${file} -> ${specifier}`).not.toContain('?');
      expect(globalSheets, `${file} -> ${specifier}`).not.toContain(rel(resolve(file, '..', specifier)));
    });
  });

  it('has no orphan stylesheet: every css file is part of the entry or imported by a feature module', () => {
    const importedByFeatures = new Set(jsCssImports.map(({ file, specifier }) => rel(resolve(file, '..', specifier))));
    walk('src', '.css').map(rel).filter((sheet) => sheet !== 'src/styles/index.css').forEach((sheet) => {
      expect(globalSheets.includes(sheet) || importedByFeatures.has(sheet), sheet).toBe(true);
    });
  });

  it('declares custom properties on :root only in palette.css and tokens.css, each once', () => {
    const central = ['src/styles/palette.css', 'src/styles/tokens.css'];
    walk('src', '.css').map(rel).filter((sheet) => !central.includes(sheet)).forEach((sheet) => {
      expect(readFileSync(sheet, 'utf8'), sheet).not.toMatch(/(^|[}\s,])(:root|html)\s*\{[^}]*(^|[;{\s])--[\w-]+\s*:/m);
    });
    const names = central.flatMap((sheet) => [...readFileSync(sheet, 'utf8').matchAll(/^\s*(--[\w-]+)\s*:/gm)].map((match) => match[1]));
    expect(new Set(names).size).toBe(names.length);
  });

  it('loads Inter for UI copy and Fraunces as the fantasy display accent from the entry', () => {
    expect(entry).toContain('family=Fraunces');
    expect(entry).toContain('family=Inter');
    expect(readFileSync('src/styles/base.css', 'utf8')).not.toContain('@import');
  });

  it('keeps the tablet game header and footer in explicit shell rows', () => {
    const fantasyStyles = readFileSync('src/features/character/home/fantasyTheme.css', 'utf8');
    expect(fantasyStyles).toContain('--game-footer-height: 64px');
    expect(fantasyStyles).toContain('grid-template-rows: var(--header-height) minmax(0,1fr)');
    expect(fantasyStyles).toContain('grid-template-rows: minmax(0,1fr) var(--game-footer-height)');
    expect(fantasyStyles).toContain('height: var(--game-footer-height); min-height: var(--game-footer-height)');
  });
});
