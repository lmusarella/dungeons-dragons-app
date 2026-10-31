import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parse } from 'acorn';
import { full } from 'acorn-walk';

const root = new URL('../', import.meta.url).pathname.replace(/^\/(.:)/, '$1');
const sourceRoot = join(root, 'src');

function collectFiles(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? collectFiles(path) : path.endsWith('.js') ? [path] : [];
  });
}

let findings = 0;
for (const path of collectFiles(sourceRoot)) {
  const source = readFileSync(path, 'utf8');
  const ast = parse(source, { ecmaVersion: 'latest', sourceType: 'module' });
  const counts = new Map();
  full(ast, (node) => {
    if (node.type === 'Identifier') counts.set(node.name, (counts.get(node.name) || 0) + 1);
  });
  for (const statement of ast.body) {
    if (statement.type !== 'ImportDeclaration') continue;
    for (const specifier of statement.specifiers) {
      if ((counts.get(specifier.local.name) || 0) > 0) continue;
      findings += 1;
      console.log(`${relative(root, path)}:${source.slice(0, specifier.start).split('\n').length} unused import ${specifier.local.name}`);
    }
  }
  const exportedDeclarations = new Set(ast.body
    .filter((statement) => statement.type === 'ExportNamedDeclaration' && statement.declaration)
    .map((statement) => statement.declaration));
  for (const statement of ast.body) {
    const declaration = statement.type === 'ExportNamedDeclaration' ? statement.declaration : statement;
    if (!declaration || exportedDeclarations.has(declaration)) continue;
    const names = declaration.type === 'FunctionDeclaration' && declaration.id
      ? [declaration.id]
      : declaration.type === 'VariableDeclaration'
        ? declaration.declarations.map((entry) => entry.id).filter((entry) => entry.type === 'Identifier')
        : [];
    for (const identifier of names) {
      if ((counts.get(identifier.name) || 0) > 1) continue;
      findings += 1;
      console.log(`${relative(root, path)}:${source.slice(0, identifier.start).split('\n').length} unused top-level ${identifier.name}`);
    }
  }
}

if (findings) process.exitCode = 1;
