import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import postcss from 'postcss';
import { parse } from 'acorn';
import { full } from 'acorn-walk';

/*
 * CSS audit. Read-only by default (exit code 1 when dead CSS is found).
 *
 *   node scripts/audit-css.mjs            report
 *   node scripts/audit-css.mjs --verbose  report without truncating the lists
 *   node scripts/audit-css.mjs --names    also list the unique dead class/id names
 *   node scripts/audit-css.mjs --colors   also list the most repeated colour literals
 *   node scripts/audit-css.mjs --fix      remove what the report marks as dead
 *                                         (rerun until it converges, then run the tests)
 *
 * A class, id or data-attribute is "dead" when no string, template literal,
 * identifier or property name in src, public/dice-roller or index.html contains
 * it, not even as a substring or as the prefix/suffix of a dynamically built
 * name. Names that only match dynamically are reported and never removed.
 */
const root = new URL('../', import.meta.url).pathname.replace(/^\/(.:)/, '$1');
const args = new Set(process.argv.slice(2));
const FIX = args.has('--fix');
const VERBOSE = args.has('--verbose');
const ENTRY = 'src/styles/index.css';
const walk = (dir, test) => readdirSync(dir).flatMap((entry) => {
  const path = join(dir, entry);
  return statSync(path).isDirectory() ? walk(path, test) : test(path) ? [path] : [];
});
const rel = (path) => relative(root, path).replaceAll('\\', '/');

const cssFiles = walk(join(root, 'src'), (path) => path.endsWith('.css'));
const sourceFiles = [
  ...walk(join(root, 'src'), (path) => path.endsWith('.js')),
  ...walk(join(root, 'public/dice-roller'), (path) => path.endsWith('.js')),
  join(root, 'index.html'),
];

/*
 * Order in which the always-loaded stylesheets reach the browser (src/styles/index.css).
 * A later file wins over an earlier one at equal specificity, so this is the only
 * cross-file ordering the audit relies on. Lazy feature stylesheets depend on
 * navigation order and are never used to prove that a declaration is shadowed.
 */
const globalOrder = [...readFileSync(join(root, ENTRY), 'utf8').matchAll(/@import\s+['"](\.[^'"]+\.css)['"]/g)]
  .map((match) => rel(resolve(root, 'src/styles', match[1])));

/* ------------------------------------------------------------------ usage */
const usedTokens = new Set();
const prefixes = new Set();
const suffixes = new Set();
const identifiers = new Set();

const addTokens = (text, { afterPlaceholder = false, beforePlaceholder = false } = {}) => {
  const parts = text.split(/[^\w-]+/).filter(Boolean);
  parts.forEach((token) => usedTokens.add(token));
  if (beforePlaceholder && /[\w-]$/.test(text)) prefixes.add(parts.at(-1));
  if (afterPlaceholder && /^[\w-]/.test(text)) suffixes.add(parts[0]);
};

for (const path of sourceFiles) {
  const source = readFileSync(path, 'utf8');
  if (path.endsWith('.html')) { addTokens(source); continue; }
  let ast;
  try { ast = parse(source, { ecmaVersion: 'latest', sourceType: 'module', allowHashBang: true }); }
  catch { try { ast = parse(source, { ecmaVersion: 'latest', sourceType: 'script', allowHashBang: true }); } catch { addTokens(source); continue; } }
  full(ast, (node) => {
    if (node.type === 'Identifier') identifiers.add(node.name);
    else if (node.type === 'MemberExpression' && !node.computed) identifiers.add(node.property.name);
    else if (node.type === 'Property' && !node.computed && node.key.type === 'Identifier') identifiers.add(node.key.name);
    else if (node.type === 'Literal' && typeof node.value === 'string') {
      addTokens(node.value);
      if (/[-_]$/.test(node.value)) prefixes.add(node.value.split(/\s+/).pop());
    } else if (node.type === 'TemplateLiteral') {
      node.quasis.forEach((quasi, index) => {
        const text = quasi.value.cooked ?? quasi.value.raw;
        addTokens(text, { afterPlaceholder: index > 0, beforePlaceholder: index < node.quasis.length - 1 });
      });
    }
  });
}
const tokenSet = usedTokens;
const rawSource = sourceFiles.map((path) => readFileSync(path, 'utf8')).join('\n');
const classStatus = (name) => {
  if (tokenSet.has(name)) return 'used';
  for (const prefix of prefixes) if (prefix.length >= 3 && name.startsWith(prefix)) return 'dynamic';
  for (const suffix of suffixes) if (suffix.length >= 4 && name.endsWith(suffix)) return 'dynamic';
  return rawSource.includes(name) ? 'dynamic' : 'dead';
};
const dataAttrUsed = (name) => {
  if (classStatus(name) !== 'dead') return true;
  const camel = name.replace(/^data-/, '').replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  return identifiers.has(camel) || tokenSet.has(camel) || rawSource.includes(camel);
};

/* -------------------------------------------------------------- selectors */
const FUNCTIONAL = new Set(['not', 'is', 'where', 'has', 'matches', 'any', '-webkit-any', '-moz-any', 'host', 'slotted']);
const unescape = (value) => value.replace(/\\([0-9a-fA-F]{1,6}\s?|.)/g, (_, code) => (/^[0-9a-fA-F]/.test(code) ? String.fromCodePoint(parseInt(code, 16)) : code));

function splitSelectorList(selector) {
  const out = []; let depth = 0; let quote = ''; let start = 0;
  for (let i = 0; i < selector.length; i += 1) {
    const char = selector[i];
    if (char === '\\') { i += 1; continue; }
    if (quote) { if (char === quote) quote = ''; continue; }
    if (char === '"' || char === "'") quote = char;
    else if (char === '(' || char === '[') depth += 1;
    else if (char === ')' || char === ']') depth -= 1;
    else if (char === ',' && depth === 0) { out.push(selector.slice(start, i).trim()); start = i + 1; }
  }
  out.push(selector.slice(start).trim());
  return out.filter(Boolean);
}

function requiredParts(selector) {
  const classes = []; const ids = []; const attrs = [];
  let i = 0;
  while (i < selector.length) {
    const char = selector[i];
    if (char === '\\') { i += 2; continue; }
    if (char === '[') {
      let j = i + 1; let quote = '';
      while (j < selector.length && (quote || selector[j] !== ']')) {
        if (selector[j] === '\\') j += 1;
        else if (quote) { if (selector[j] === quote) quote = ''; } else if (selector[j] === '"' || selector[j] === "'") quote = selector[j];
        j += 1;
      }
      const name = selector.slice(i + 1, j).match(/^\s*([\w-]+)/)?.[1];
      if (name) attrs.push(name);
      i = j + 1; continue;
    }
    if (char === ':') {
      let j = i + 1; if (selector[j] === ':') j += 1;
      const name = selector.slice(j).match(/^[\w-]+/)?.[0] || '';
      j += name.length;
      if (selector[j] === '(') {
        let depth = 0; let quote = '';
        for (; j < selector.length; j += 1) {
          if (selector[j] === '\\') { j += 1; continue; }
          if (quote) { if (selector[j] === quote) quote = ''; continue; }
          if (selector[j] === '"' || selector[j] === "'") quote = selector[j];
          else if (selector[j] === '(') depth += 1;
          else if (selector[j] === ')') { depth -= 1; if (!depth) { j += 1; break; } }
        }
      }
      i = j; continue;
    }
    if (char === '.' || char === '#') {
      let j = i + 1;
      while (j < selector.length && /[\w\-\\]|[^\x00-\x7f]/.test(selector[j])) { if (selector[j] === '\\') j += 1; j += 1; }
      const name = unescape(selector.slice(i + 1, j));
      if (name) (char === '.' ? classes : ids).push(name);
      i = j; continue;
    }
    i += 1;
  }
  return { classes, ids, attrs };
}

const selectorProblems = (selector) => {
  const { classes, ids, attrs } = requiredParts(selector);
  const dead = []; const dynamic = [];
  for (const name of classes) { const status = classStatus(name); if (status === 'dead') dead.push(`.${name}`); else if (status === 'dynamic') dynamic.push(`.${name}`); }
  for (const name of ids) if (classStatus(name) === 'dead') dead.push(`#${name}`);
  for (const name of attrs) if (name.startsWith('data-') && !dataAttrUsed(name)) dead.push(`[${name}]`);
  return { dead, dynamic };
};

/* -------------------------------------------------------------------- css */
const contextOf = (node) => {
  const chain = [];
  for (let parent = node.parent; parent && parent.type !== 'root'; parent = parent.parent) {
    if (parent.type === 'atrule') chain.unshift(`@${parent.name} ${parent.params.replace(/\s+/g, ' ')}`);
  }
  return chain.join(' | ');
};
const normalize = (value) => value.replace(/\s+/g, ' ').replace(/\s*([,>+~])\s*/g, '$1').trim();
const normalizeValue = (value) => value.replace(/\s+/g, ' ').replace(/\s*!\s*important/i, ' !important').trim().toLowerCase();

const sheets = cssFiles.map((path) => {
  const text = readFileSync(path, 'utf8');
  return { path, name: rel(path), text, ast: postcss.parse(text, { from: path }) };
});
const orderIndex = (name) => globalOrder.indexOf(name);

const report = { deadRules: [], deadSelectors: [], dynamic: [], shadowed: [], keyframes: [], vars: [] };
const mutations = [];

const isKeyframes = (atRule) => /keyframes$/i.test(atRule.name);
const keyframeDefs = new Map(); const animationUse = new Set(); const varDefs = new Map(); const varUse = new Map();

for (const sheet of sheets) {
  sheet.ast.walk((node) => {
    if (node.type === 'atrule' && isKeyframes(node)) keyframeDefs.set(node.params, [...(keyframeDefs.get(node.params) || []), { sheet, node }]);
    if (node.type === 'decl') {
      if (node.prop.startsWith('--')) varDefs.set(node.prop, [...(varDefs.get(node.prop) || []), { sheet, node }]);
      if (/^(-webkit-)?animation(-name)?$/.test(node.prop)) node.value.split(/[\s,]+/).forEach((word) => animationUse.add(word));
      for (const match of node.value.matchAll(/var\(\s*(--[\w-]+)\s*(,)?/g)) varUse.set(match[1], [...(varUse.get(match[1]) || []), { sheet, node, fallback: Boolean(match[2]) }]);
    }
  });
}

const inKeyframes = (rule) => { for (let p = rule.parent; p; p = p.parent) if (p.type === 'atrule' && isKeyframes(p)) return true; return false; };

for (const sheet of sheets) {
  sheet.ast.walkRules((rule) => {
    if (inKeyframes(rule)) return;
    const list = splitSelectorList(rule.selector);
    const analyses = list.map((selector) => ({ selector, ...selectorProblems(selector) }));
    analyses.filter((entry) => entry.dynamic.length).forEach((entry) => report.dynamic.push({ sheet, rule, ...entry }));
    const dead = analyses.filter((entry) => entry.dead.length);
    if (!dead.length) return;
    const location = `${sheet.name}:${rule.source.start.line}`;
    if (dead.length === analyses.length) { report.deadRules.push({ location, selector: normalize(rule.selector), dead: dead.flatMap((entry) => entry.dead), sheet, rule }); mutations.push({ type: 'remove', node: rule }); }
    else {
      report.deadSelectors.push({ location, removed: dead.map((entry) => entry.selector), sheet, rule });
      mutations.push({ type: 'selector', node: rule, selector: analyses.filter((entry) => !entry.dead.length).map((entry) => entry.selector).join(', ') });
    }
  });
}

for (const [name, defs] of keyframeDefs) {
  if (animationUse.has(name) || tokenSet.has(name)) continue;
  report.keyframes.push({ name, location: `${defs[0].sheet.name}:${defs[0].node.source.start.line}` });
  defs.forEach(({ node }) => mutations.push({ type: 'remove', node }));
}

for (const [name, defs] of varDefs) {
  if (varUse.has(name) || tokenSet.has(name)) continue;
  report.vars.push({ kind: 'unused', name, location: `${defs[0].sheet.name}:${defs[0].node.source.start.line}`, count: defs.length });
  defs.forEach(({ node }) => mutations.push({ type: 'remove', node }));
}
for (const [name, uses] of varUse) {
  if (varDefs.has(name) || tokenSet.has(name)) continue;
  const bare = uses.filter((use) => !use.fallback);
  if (bare.length) report.vars.push({ kind: 'undefined', name, location: `${bare[0].sheet.name}:${bare[0].node.source.start.line}`, count: bare.length });
}

/* shadowed declarations & duplicate rules (same selector, same context) */
const rulesByKey = new Map();
for (const sheet of sheets) {
  sheet.ast.walkRules((rule) => {
    if (inKeyframes(rule)) return;
    const key = `${contextOf(rule)}\u0000${normalize(rule.selector)}`;
    rulesByKey.set(key, [...(rulesByKey.get(key) || []), { sheet, rule }]);
  });
}
const comparable = (a, b) => {
  if (a.sheet === b.sheet) return a.rule.source.start.offset < b.rule.source.start.offset ? -1 : 1;
  const ia = orderIndex(a.sheet.name); const ib = orderIndex(b.sheet.name);
  return ia >= 0 && ib >= 0 ? Math.sign(ia - ib) : 0;
};
const UNSAFE_FALLBACK = /(-webkit-|-moz-|-ms-|env\(|dvh|svh|lvh|clamp\(|min\(|max\(|\bfit-content|\bstick)/;
for (const entries of rulesByKey.values()) {
  if (entries.length < 2) continue;
  const sorted = entries.slice();
  for (let i = 0; i < sorted.length; i += 1) {
    for (let j = 0; j < sorted.length; j += 1) {
      if (i === j) continue;
      const earlier = sorted[i]; const later = sorted[j];
      if (comparable(earlier, later) !== -1) continue;
      const laterDecls = new Map();
      later.rule.each((decl) => { if (decl.type === 'decl') laterDecls.set(decl.prop, decl); });
      const earlierDecls = [];
      earlier.rule.each((decl) => { if (decl.type === 'decl') earlierDecls.push(decl); });
      for (const decl of earlierDecls) {
        const winner = laterDecls.get(decl.prop);
        if (!winner || decl.important && !winner.important) continue;
        if (UNSAFE_FALLBACK.test(winner.value) && normalizeValue(winner.value) !== normalizeValue(decl.value)) continue;
        report.shadowed.push({ prop: decl.prop, from: `${earlier.sheet.name}:${decl.source.start.line}`, by: `${later.sheet.name}:${winner.source.start.line}`, selector: normalize(earlier.rule.selector), same: normalizeValue(decl.value) === normalizeValue(winner.value) });
        if (!mutations.some((m) => m.node === decl)) mutations.push({ type: 'remove', node: decl });
      }
    }
  }
}

/* selectors defined in several files */
const selectorFiles = new Map();
for (const sheet of sheets) {
  sheet.ast.walkRules((rule) => {
    if (inKeyframes(rule)) return;
    for (const selector of splitSelectorList(rule.selector)) {
      const key = normalize(selector);
      const files = selectorFiles.get(key) || new Set();
      files.add(sheet.name); selectorFiles.set(key, files);
    }
  });
}
const multiFile = [...selectorFiles].filter(([, files]) => files.size > 1);

/* ----------------------------------------------------------------- output */
const importantByFile = sheets.map((sheet) => { let count = 0; sheet.ast.walkDecls((decl) => { if (decl.important) count += 1; }); return [sheet.name, count]; });
const section = (title) => console.log(`\n=== ${title} ===`);
const cap = (items, limit = VERBOSE ? Infinity : 15) => items.slice(0, limit);

section('Stylesheets');
for (const sheet of sheets) console.log(`${sheet.name.padEnd(58)} ${String(sheet.text.split('\n').length).padStart(6)} lines  ${(sheet.text.length / 1024).toFixed(0).padStart(5)} KB  !important: ${importantByFile.find(([name]) => name === sheet.name)[1]}`);
section('Stylesheets not imported by any module');
const importedText = sourceFiles.filter((path) => path.endsWith('.js')).map((path) => readFileSync(path, 'utf8')).join('\n') + (existsSync(join(root, ENTRY)) ? readFileSync(join(root, ENTRY), 'utf8') : '');
for (const sheet of sheets) {
  const base = sheet.name.split('/').pop();
  if (!importedText.includes(base)) console.log(sheet.name);
}
section(`Rules whose selectors can never match (${report.deadRules.length})`);
cap(report.deadRules).forEach((entry) => console.log(`${entry.location}  ${entry.selector.slice(0, 110)}  -> ${entry.dead.join(' ')}`));
if (args.has('--names')) {
  const names = new Map();
  [...report.deadRules.flatMap((entry) => entry.dead), ...report.deadSelectors.flatMap((entry) => entry.removed)].forEach((name) => names.set(name, (names.get(name) || 0) + 1));
  section(`Unique dead names in whole-rule removals (${names.size})`);
  console.log([...names].sort().map(([name, count]) => `${name}(${count})`).join(' '));
}
section(`Dead selectors inside live selector lists (${report.deadSelectors.length})`);
cap(report.deadSelectors).forEach((entry) => console.log(`${entry.location}  ${entry.removed.join(' | ').slice(0, 130)}`));
section(`Selectors matching only dynamic class names, kept (${report.dynamic.length})`);
cap(report.dynamic, VERBOSE ? Infinity : 8).forEach((entry) => console.log(`${entry.sheet.name}:${entry.rule.source.start.line}  ${entry.dynamic.join(' ')}`));
section(`Unused @keyframes (${report.keyframes.length})`);
report.keyframes.forEach((entry) => console.log(`${entry.location}  ${entry.name}`));
section(`Custom properties (${report.vars.length})`);
cap(report.vars, VERBOSE ? Infinity : 40).forEach((entry) => console.log(`${entry.kind.padEnd(9)} ${entry.name}  ${entry.location} x${entry.count}`));
section(`Shadowed declarations: same selector re-declared later (${report.shadowed.length}, identical values: ${report.shadowed.filter((entry) => entry.same).length})`);
cap(report.shadowed).forEach((entry) => console.log(`${entry.from} ${entry.prop}  <- ${entry.by}  ${entry.selector.slice(0, 80)}`));
section(`Selectors defined in more than one stylesheet (${multiFile.length})`);
cap(multiFile.sort((a, b) => b[1].size - a[1].size)).forEach(([selector, files]) => console.log(`${[...files].map((file) => file.split('/').pop()).join(', ').padEnd(60)} ${selector.slice(0, 90)}`));

if (args.has('--colors')) {
  const colors = new Map();
  sheets.forEach((sheet) => sheet.ast.walkDecls((decl) => {
    if (decl.prop.startsWith('--')) return;
    for (const match of decl.value.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) colors.set(match[0].toLowerCase(), (colors.get(match[0].toLowerCase()) || 0) + 1);
  }));
  section(`Colour literals: ${[...colors.values()].reduce((sum, count) => sum + count, 0)} uses, ${colors.size} distinct`);
  [...colors].sort((a, b) => b[1] - a[1]).slice(0, 25).forEach(([color, count]) => console.log(`${color.padEnd(10)} ${count}`));
}

if (FIX) {
  const removed = new Set();
  for (const mutation of mutations) {
    if (mutation.type === 'selector') { if (!removed.has(mutation.node)) mutation.node.selector = mutation.selector; continue; }
    if (mutation.node.parent) { removed.add(mutation.node); mutation.node.remove(); }
  }
  const prune = (container) => {
    container.each?.((node) => {
      if (node.type === 'atrule' || node.type === 'rule') prune(node);
      if ((node.type === 'rule' || (node.type === 'atrule' && node.nodes && !isKeyframes(node))) && node.nodes && !node.nodes.some((child) => child.type !== 'comment')) node.remove();
    });
  };
  for (const sheet of sheets) { prune(sheet.ast); writeFileSync(sheet.path, sheet.ast.toString()); }
  console.log(`\nApplied ${mutations.length} mutations.`);
}
const issues = report.deadRules.length + report.deadSelectors.length + report.keyframes.length;
if (issues && !FIX) process.exitCode = 1;
