import { describe, it, expect } from 'vitest';
import { getItemCostDisplay } from '../../../../src/features/character/home/itemDetail.js';
import { readFileSync } from 'node:fs';

describe('inventory equipment management', () => {
  it('removes the redundant equipment shortcut from the character home', () => {
    const home = readFileSync('src/features/character/home.js', 'utf8');
    const sections = readFileSync('src/features/character/home/sections.js', 'utf8');
    expect(home).not.toContain('buildEquipSection');
    expect(home).not.toContain('data-open-equipment-mannequin');
    expect(sections).not.toContain('export function buildEquipSection');
  });

  it('moves equip and unequip controls into inventory without a duplicate carried-load card', () => {
    const inventory = readFileSync('src/features/inventory/inventory.js', 'utf8');
    const containers = readFileSync('src/features/inventory/containerCatalog.js', 'utf8');
    const tables = readFileSync('src/features/inventory/compactTables.js', 'utf8');
    expect(containers).not.toContain('Carico trasportato');
    expect(containers).toContain('data-equip-container');
    expect(tables).toContain('data-unequip-item');
    expect(inventory).toContain('openEquipmentPicker({');
  });

  it('uses the shared, non-nested management menu in item details', () => {
    const detail = readFileSync('src/features/character/home/itemDetail.js', 'utf8');
    const management = readFileSync('src/features/character/home/detailManagement.js', 'utf8');
    expect(detail).toContain('attachUnifiedDetailActions(modal, formEl');
    expect(detail).toContain("actionName: 'item_detail_action'");
    expect(management).toContain("actions.closest('.sheet-management-menu')");
    expect(management).toContain('if (!shellOwnsOverflow)');
  });

  it('converts an item cost to the largest exact coin denomination', () => {
    expect(getItemCostDisplay(20)).toMatchObject({ amount: 2, key: 'sp', copper: 20 });
    expect(getItemCostDisplay(300)).toMatchObject({ amount: 3, key: 'gp', copper: 300 });
    expect(getItemCostDisplay(3000)).toMatchObject({ amount: 30, key: 'gp', copper: 3000 });
    expect(getItemCostDisplay(25)).toMatchObject({ amount: 25, key: 'cp', copper: 25 });
  });

  it('keeps catalog-only facts and 2024 weapon mastery in the shared detail', () => {
    const detail = readFileSync('src/features/character/home/itemDetail.js', 'utf8');
    const styles = readFileSync('src/features/character/home/fantasyTheme.css', 'utf8');
    expect(detail).toContain('catalogMode ? null');
    expect(detail).toContain('slots.length && !catalogMode');
    expect(detail).toContain('getWeaponMasterySummary(item.weapon_mastery)');
    expect(detail).toContain("description ? '<section");
    expect(detail).not.toContain('Conversione da');
    expect(detail).toContain("['Gittata',rangeValue]");
    expect(detail).toContain('equipment-weapon-property equipment-rule-card');
    expect(detail).not.toContain('<h3>Proprietà dell’arma</h3>');
    expect(styles).toContain('.equipment-rule-card');
    expect(styles).toContain('flex: 0 0 30px; margin: 0;');
  });
});
