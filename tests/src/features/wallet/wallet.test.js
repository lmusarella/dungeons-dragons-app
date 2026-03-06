import { describe, it, expect } from 'vitest';
import { renderWalletSummary } from '../../../../src/features/wallet/wallet.js';

describe('src/features/wallet/wallet.js', () => {
  it('renders all coin cards with values', () => {
    const html = renderWalletSummary({ pp: 1, gp: 2, sp: 3, cp: 4 });
    expect(html).toContain('Platino');
    expect(html).toContain('Oro');
    expect(html).toContain('Argento');
    expect(html).toContain('Rame');
    expect(html).toContain('>4<');
  });
});
