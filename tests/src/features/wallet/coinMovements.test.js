import { describe, expect, it, vi } from 'vitest';
import { buildCoinMovement, buildCoinBundleMovement, buildCoinExchange, isCoinExchange } from '../../../../src/features/wallet/coinMovements.js';
vi.mock('../../../../src/lib/supabase.js', () => ({ supabase: { rpc: vi.fn() } }));
import { supabase } from '../../../../src/lib/supabase.js';
import { createTransaction } from '../../../../src/features/wallet/walletApi.js';
describe('coin movements and ledger', () => {
  it('creates signed additions and withdrawals without changing the original balance', () => {
    const wallet = { gp: 5 };
    expect(buildCoinMovement(wallet, 'gp', 3, 'pay')).toEqual({ pp: 0, gp: -3, sp: 0, cp: 0 });
    expect(buildCoinMovement(wallet, 'cp', 10, 'receive').cp).toBe(10);
    expect(wallet.gp).toBe(5);
  });
  it('rejects overspending, fractional quantities, and unsupported currencies', () => {
    expect(() => buildCoinMovement({ gp: 2 }, 'gp', 3, 'pay')).toThrow('insufficienti');
    for (const value of [0, -1, 1.5, Infinity, NaN]) expect(() => buildCoinMovement({}, 'gp', value, 'receive')).toThrow();
    expect(() => buildCoinMovement({}, 'invalid', 1, 'receive')).toThrow();
  });
  it('moves several coin denominations with one validated operation', () => {
    const wallet = { pp: 2, gp: 8, sp: 4, cp: 20 };
    expect(buildCoinBundleMovement(wallet, { pp: 1, gp: 3, cp: 7 }, 'pay')).toEqual({ pp: -1, gp: -3, sp: 0, cp: -7 });
    expect(buildCoinBundleMovement(wallet, { gp: 5, sp: 2 }, 'receive')).toEqual({ pp: 0, gp: 5, sp: 2, cp: 0 });
    expect(() => buildCoinBundleMovement(wallet, {}, 'receive')).toThrow('almeno una');
    expect(() => buildCoinBundleMovement(wallet, { gp: 9 }, 'pay')).toThrow('insufficienti');
    expect(() => buildCoinBundleMovement(wallet, { gp: 1.5 }, 'receive')).toThrow('intere');
  });
  it('preserves value across denomination exchanges and leaves unusable remainder in the source', () => {
    expect(buildCoinExchange({ cp: 155 }, 'cp', 'gp', 155)).toEqual({ amount: 100, targetAmount: 1, delta: { pp: 0, gp: 1, sp: 0, cp: -100 } });
    expect(buildCoinExchange({ pp: 2 }, 'pp', 'sp', 2).delta).toEqual({ pp: -2, gp: 0, sp: 200, cp: 0 });
    expect(() => buildCoinExchange({ cp: 5 }, 'cp', 'gp', 5)).toThrow();
    expect(() => buildCoinExchange({ gp: 1 }, 'gp', 'gp', 1)).toThrow();
    expect(() => buildCoinExchange({ gp: 1 }, 'gp', 'sp', 2)).toThrow('insufficienti');
  });
  it('recognizes mixed exchange entries without treating ordinary payments as exchanges', () => {
    expect(isCoinExchange({ gp: -1, sp: 10 })).toBe(true);
    expect(isCoinExchange({ gp: -1, cp: -3 })).toBe(false);
  });
  it('records both sides of an exchange with one atomic ledger operation', async () => {
    const saved = { gp: 2, sp: 10 };
    supabase.rpc.mockReturnValue({ single: vi.fn().mockResolvedValue({ data: saved, error: null }) });
    const delta = buildCoinExchange({ gp: 3 }, 'gp', 'sp', 1).delta;
    expect(await createTransaction({ character_id: 'hero', direction: 'receive', amount: delta, reason: 'Scambio' })).toEqual(saved);
    expect(supabase.rpc).toHaveBeenLastCalledWith('apply_money_transaction', expect.objectContaining({ p_character_id: 'hero', p_direction: 'receive', p_amount: { pp: 0, gp: -1, sp: 10, cp: 0 }, p_reason: 'Scambio' }));
  });
  it('propagates a failed ledger write without falling back to an untracked balance update', async () => {
    const failure = new Error('Ledger unavailable');
    supabase.rpc.mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: failure }) });
    await expect(createTransaction({ character_id: 'hero', direction: 'receive', amount: { gp: 1 } })).rejects.toThrow(failure);
  });
});
