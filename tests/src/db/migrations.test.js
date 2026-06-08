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
});
