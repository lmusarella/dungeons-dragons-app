import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('database migrations', () => {
  it('adds the legacy alternate weapon attack modifier and reloads the Supabase schema cache', () => {
    const patchMigration = readFileSync('db/add_alternate_attack_modifier.sql', 'utf8');
    const fullMigration = readFileSync('db/items_ammunition_weapon_modes.sql', 'utf8');

    expect(patchMigration).toContain('add column if not exists alternate_attack_modifier numeric not null default 0');
    expect(patchMigration).toContain("notify pgrst, 'reload schema'");
    expect(patchMigration).toContain("select pg_notify('pgrst', 'reload schema')");
    expect(fullMigration).toContain('add column if not exists alternate_attack_modifier numeric not null default 0');
    expect(fullMigration).toContain('attack_modifier, damage_type');
  });
  it('adds linked resource configuration to new and already migrated databases', () => {
    const fullMigration = readFileSync('db/add_resource_parent.sql', 'utf8');
    const patchMigration = readFileSync('db/update_resource_linked_options.sql', 'utf8');
    [fullMigration, patchMigration].forEach((migration) => {
      expect(migration).toContain('add column if not exists can_have_children boolean not null default false');
      expect(migration).toContain('add column if not exists resource_cost integer not null default 1');
      expect(migration).toContain('check (resource_cost >= 1)');
      expect(migration).toContain("notify pgrst, 'reload schema'");
    });
  });

  it('adds the variable cost flag for linked resources', () => {
    const migration = readFileSync('db/add_variable_resource_cost.sql', 'utf8');
    expect(migration).toContain('add column if not exists resource_cost_variable boolean not null default false');
    expect(migration).toContain("notify pgrst, 'reload schema'");
  });

  it('updates wallets and their ledger atomically', () => {
    const migration = readFileSync('db/wallet_transactions_atomic.sql', 'utf8');
    expect(migration).toContain('function public.apply_money_transaction');
    expect(migration).toContain('function public.update_money_transaction_atomic');
    expect(migration).toContain('function public.delete_money_transaction_atomic');
    expect(migration).toContain('security invoker');
    expect(migration).toContain("grant execute on function public.apply_money_transaction");
  });

});
