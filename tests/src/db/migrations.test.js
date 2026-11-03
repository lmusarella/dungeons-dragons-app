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
  it('persists and restores weapon properties for inventory and attack details', () => {
    const migration = readFileSync('db/add_weapon_properties.sql', 'utf8');
    const fullMigration = readFileSync('db/items_ammunition_weapon_modes.sql', 'utf8');
    expect(migration).toContain("add column if not exists weapon_properties jsonb not null default '[]'::jsonb");
    expect(migration).toContain('add column if not exists grip_type text');
    expect(migration).toContain("shared_item.item_data -> 'weapon_properties'");
    expect(migration).toContain("notify pgrst, 'reload schema'");
    expect(fullMigration).toContain('weapon_properties jsonb');
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

  it('adds saving throw abilities to shared spells and resources', () => {
    const migration = readFileSync('db/add_saving_throw_ability.sql', 'utf8');
    expect(migration).toContain('alter table public.shared_spells');
    expect(migration).toContain('alter table public.resources');
    expect(migration).toContain("saving_throw_ability in ('str', 'dex', 'con', 'int', 'wis', 'cha')");
    expect(migration).toContain("notify pgrst, 'reload schema'");
  });

  it('adds an optional damage type to abilities and powers', () => {
    const migration = readFileSync('db/add_resource_damage_type.sql', 'utf8');
    expect(migration).toContain('alter table public.resources');
    expect(migration).toContain('add column if not exists damage_type text');
    expect(migration).toContain('resources_damage_type_check');
    expect(migration).toContain("notify pgrst, 'reload schema'");
  });

  it('keeps compatible equipment destinations separate from occupied slots', () => {
    const migration = readFileSync('db/add_compatible_equip_slots.sql', 'utf8');
    expect(migration).toContain("add column if not exists compatible_equip_slots jsonb not null default '[]'::jsonb");
    expect(migration).toContain("notify pgrst, 'reload schema'");
  });

  it('adds optional inventory places for top-level grouping', () => {
    const migration = readFileSync('db/add_item_inventory_location.sql', 'utf8');
    expect(migration).toContain('add column if not exists inventory_location text');
    expect(migration).toContain('items_character_inventory_location_idx');
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

  it('adds the centralized reusable item catalog', () => {
    const migration = readFileSync('db/shared_items_catalog.sql', 'utf8');
    expect(migration).toContain('create table if not exists public.shared_items');
    expect(migration).toContain('item_data jsonb');
    expect(migration).toContain('add column if not exists shared_item_id uuid');
    expect(migration).toContain('public.is_catalog_admin()');
    expect(migration).toContain("notify pgrst, 'reload schema'");
  });

  it('limits shared catalog edits and deletions to profiled administrators', () => {
    const migration = readFileSync('db/admin_shared_catalog_rls.sql', 'utf8');
    expect(migration).toContain('create table if not exists public.catalog_admins');
    expect(migration).toContain('alter table public.catalog_admins enable row level security');
    expect(migration).toContain('from public.catalog_admins');
    expect(migration).toContain('function public.is_catalog_admin()');
    expect(migration).toContain('create policy shared_spells_update_admin');
    expect(migration).toContain('create policy shared_spells_insert_admin');
    expect(migration).toContain('create policy shared_spells_delete_admin');
    expect(migration).toContain('create policy shared_items_update_admin');
    expect(migration).toContain('create policy shared_items_insert_admin');
    expect(migration).toContain('create policy shared_items_delete_admin');
    expect(migration.match(/using \(public\.is_catalog_admin\(\)\)/g)?.length).toBeGreaterThanOrEqual(4);
    expect(migration.match(/with check \(created_by = auth\.uid\(\) and public\.is_catalog_admin\(\)\)/g)).toHaveLength(2);
  });

  it('supports and seeds the versioned spellbook catalog without collapsing homonyms', () => {
    const migration = readFileSync('db/extend_shared_spells_spellbook_import.sql', 'utf8');
    const import2014 = readFileSync('db/import_shared_spells_2014.sql', 'utf8');
    const import2024 = readFileSync('db/import_shared_spells_2024.sql', 'utf8');
    const upcastBackfill = readFileSync('db/backfill_shared_spell_upcast_dice.sql', 'utf8');
    const baseDiceBackfill = readFileSync('db/backfill_shared_spell_base_dice.sql', 'utf8');
    expect(migration).toContain('add column if not exists source_key text');
    expect(migration).toContain('add column if not exists material text');
    expect(migration).toContain('add column if not exists source_url text');
    expect(migration).toContain('add column if not exists upcast_description text');
    expect(migration).toContain('unique (source_key, rules_version)');
    expect(migration).toContain('drop constraint if exists shared_spells_name_rules_version_key');
    expect(import2014.match(/^    \('/gm)).toHaveLength(525);
    expect(import2024.match(/^    \('/gm)).toHaveLength(444);
    expect(import2014).toContain("'befuddlement', '2014', 'Confusione', 8");
    expect(import2014).toContain("'confusion', '2014', 'Confusione', 4");
    expect(import2024).toContain("'raise-dead', '2024', 'Resurrezione', 5");
    expect(import2024).toContain("'resurrection', '2024', 'Resurrezione', 7");
    expect(import2014).toContain('on conflict (source_key, rules_version) do update');
    expect(import2024).toContain('on conflict (source_key, rules_version) do update');
    expect(import2014).toContain("'fireball', '2014', 'Palla di Fuoco', 3, 'invocazione'");
    expect(import2014).toContain("'fuoco', '1d6', null, 4");
    expect(import2024).toContain("'healing-word', '2024', 'Parola Guaritrice', 1, 'abiurazione'");
    expect(import2024).toContain("null, null, '2d4', null, null, '2d4', null, 2");
    expect(upcastBackfill).toContain('Record aggiornabili: 166');
    expect(upcastBackfill).toContain("('fireball', '2014', '1d6', 4)");
    expect(upcastBackfill).toContain("('healing-word', '2024', '2d4', 2)");
    expect(upcastBackfill).toContain("('bigby''s-hand', '2014', '2d8', 6)");
    expect(upcastBackfill).toContain("('elemental-weapon', '2014', '2d4', 5)");
    expect(upcastBackfill).toContain('spell.source_key = inferred.source_key');
    expect(upcastBackfill).toContain('spell.rules_version = inferred.rules_version');
    expect(baseDiceBackfill).toContain('Record aggiornabili: 18');
    expect(baseDiceBackfill).toContain("('cure-wounds', '2014', '1d8')");
    expect(baseDiceBackfill).toContain("('cure-wounds', '2024', '2d8')");
    expect(baseDiceBackfill).toContain('set damage_die = inferred.damage_die');
  });

  it('detaches shared spells as personal snapshots before clearing the catalog', () => {
    const cleanup = readFileSync('db/clear_shared_spells.sql', 'utf8');
    const preserveAssignments = cleanup.indexOf('update public.character_spells as character_spell');
    const deleteSharedSpells = cleanup.indexOf('delete from public.shared_spells');
    expect(preserveAssignments).toBeGreaterThan(-1);
    expect(deleteSharedSpells).toBeGreaterThan(preserveAssignments);
    expect(cleanup).toContain("to_jsonb(shared_spell) - 'id' - 'created_by' - 'created_at' - 'updated_at'");
    expect(cleanup).toContain("'legacy_shared_spell_id', shared_spell.id");
    expect(cleanup).toContain('shared_spell_id = null');
    expect(cleanup).not.toContain('delete from public.character_spells');
    expect(cleanup).toContain('incantesimi_personalizzati_preservati');
    expect(cleanup).not.toContain('delete from public.characters');
    expect(cleanup).not.toContain('delete from public.shared_items');
    expect(cleanup).not.toContain('truncate');
  });

});
