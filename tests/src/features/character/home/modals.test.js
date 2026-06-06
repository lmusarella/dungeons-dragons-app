import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

function extractNamedExports(source) {
  const names = new Set();
  const functionRegex = /export\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g;
  const constRegex = /export\s+const\s+([A-Za-z_$][\w$]*)\s*=/g;
  let match;
  while ((match = functionRegex.exec(source)) !== null) names.add(match[1]);
  while ((match = constRegex.exec(source)) !== null) names.add(match[1]);
  return [...names];
}

describe('src/features/character/home/modals.js', () => {
  it('defines module-level API surface', () => {
    const source = readFileSync('src/features/character/home/modals.js', 'utf8');
    const exports = extractNamedExports(source);
    expect(source.trim().length).toBeGreaterThan(40);
    expect(exports.length).toBeGreaterThan(0);
    exports.forEach((name) => {
      expect(source).toContain(`export`);
      expect(source).toContain(name);
    });
  });

  it('keeps recharge type and rest recovery fields in one row', () => {
    const source = readFileSync('src/features/character/home/modals.js', 'utf8');

    expect(source).toContain("buildRow([resetField, inputRiposoCorto, inputRiposoLungo], 'compact')");
    expect(source).toContain("recoveryRow.classList.add('ability-modal-row--recovery')");
  });

  it('supports character and companion images in the avatar preview', () => {
    const source = readFileSync('src/features/character/home/modals.js', 'utf8');
    expect(source).toContain('subject?.data?.avatar_url || subject?.stat_block?.image_url');
    expect(source).toContain('alt="Foto di ${subjectName}"');
  });
});
