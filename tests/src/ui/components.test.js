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

describe('src/ui/components.js', () => {
  it('defines module-level API surface', () => {
    const source = readFileSync('src/ui/components.js', 'utf8');
    const exports = extractNamedExports(source);
    expect(source.trim().length).toBeGreaterThan(40);
    expect(exports.length).toBeGreaterThan(0);
    exports.forEach((name) => {
      expect(source).toContain(`export`);
      expect(source).toContain(name);
    });
  });

  it('does not clamp number steppers to zero when optional bounds are missing', () => {
    const source = readFileSync('src/ui/components.js', 'utf8');
    const attachNumberStepperStart = source.indexOf('export function attachNumberStepper');
    const attachNumberSteppersStart = source.indexOf('export function attachNumberSteppers');
    const attachNumberStepperSource = source.slice(attachNumberStepperStart, attachNumberSteppersStart);

    expect(attachNumberStepperSource).toContain("if (value === '') return null");
    expect(attachNumberStepperSource).not.toContain('const maxValue = Number(input.max)');
    expect(attachNumberStepperSource).not.toContain('const minValue = Number(input.min)');
  });

  it('does not force number steppers to focus the input on pointer use', () => {
    const source = readFileSync('src/ui/components.js', 'utf8');
    const attachNumberStepperStart = source.indexOf('export function attachNumberStepper');
    const attachNumberSteppersStart = source.indexOf('export function attachNumberSteppers');
    const attachNumberStepperSource = source.slice(attachNumberStepperStart, attachNumberSteppersStart);

    expect(attachNumberStepperSource).not.toContain('input.focus');
    expect(attachNumberStepperSource).not.toContain('touchstart');
    expect(attachNumberStepperSource).toContain('keydown');
  });

  it('normalizes multiple modal card classes before adding them to classList', () => {
    const source = readFileSync('src/ui/components.js', 'utf8');
    const openFormModalStart = source.indexOf('export function openFormModal');
    const openFormModalSource = source.slice(openFormModalStart);

    expect(openFormModalSource).toContain(".flatMap((value) => String(value || '').split(/\\s+/))");
    expect(openFormModalSource).toContain('.filter(Boolean)');
  });

});
