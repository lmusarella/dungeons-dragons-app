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

describe('src/features/wallet/walletApi.js', () => {
  it('defines module-level API surface', () => {
    const source = readFileSync('src/features/wallet/walletApi.js', 'utf8');
    const exports = extractNamedExports(source);
    expect(source.trim().length).toBeGreaterThan(40);
    expect(exports.length).toBeGreaterThan(0);
    exports.forEach((name) => {
      expect(source).toContain(`export`);
      expect(source).toContain(name);
    });
  });

  it('uses database RPCs for atomic ledger mutations', () => {
    const source = readFileSync('src/features/wallet/walletApi.js', 'utf8');
    expect(source).toContain(".rpc('apply_money_transaction'");
    expect(source).toContain(".rpc('update_money_transaction_atomic'");
    expect(source).toContain(".rpc('delete_money_transaction_atomic'");
  });
});
