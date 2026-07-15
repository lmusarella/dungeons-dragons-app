import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  getAvailableCompatibleMannequinPartIds,
  getCompatibleMannequinPartIds,
  getItemsForMannequinPart,
  getMannequinEquipSlot
} from '../../../../../src/features/character/home/equipmentMannequin.js';

describe('equipment mannequin slot mapping', () => {
  it('maps generic and side-specific slots to the same visible body part', () => {
    const items = [
      { id: 'one', equip_slots: ['hands'] },
      { id: 'two', equip_slots: ['main-hand'] },
      { id: 'three', equip_slots: ['off-hand'] },
      { id: 'four', equip_slots: ['head'] }
    ];

    expect(getItemsForMannequinPart(items, {
      slots: ['hand-right', 'hands', 'main-hand', 'ring-right', 'ring']
    }).map((item) => item.id)).toEqual(['one', 'two']);
    expect(getItemsForMannequinPart(items, {
      slots: ['hand-left', 'hands', 'off-hand', 'ring-left', 'ring']
    }).map((item) => item.id)).toEqual(['one', 'three']);
  });

  it('supports the legacy single equip_slot field', () => {
    expect(getItemsForMannequinPart([
      { id: 'amulet', equip_slot: 'neck' },
      { id: 'boots', equip_slot: 'feet' }
    ], { slots: ['neck'] })).toHaveLength(1);
  });

  it('maps weapons and jewelry to the natural hand slots', () => {
    expect(getMannequinEquipSlot({ category: 'weapon' }, 'hand-right')).toBe('main-hand');
    expect(getMannequinEquipSlot({ category: 'weapon' }, 'hand-left')).toBe('off-hand');
    expect(getMannequinEquipSlot({ category: 'jewelry' }, 'hand-right')).toBe('ring-right');
    expect(getMannequinEquipSlot({ category: 'gear' }, 'chest')).toBe('chest');
  });

  it('limits the blinking destinations to compatible body parts', () => {
    expect(getCompatibleMannequinPartIds({ category: 'weapon' })).toEqual(['hand-left', 'hand-right']);
    expect(getCompatibleMannequinPartIds({ category: 'armor', is_shield: true })).toEqual(['hand-left', 'hand-right']);
    expect(getCompatibleMannequinPartIds({
      category: 'gear',
      compatible_equip_slots: ['neck']
    })).toEqual(['neck']);
    expect(getCompatibleMannequinPartIds({ category: 'container' })).toContain('back');
  });

  it('shows only free destinations for non-overlayable items', () => {
    const equippedItems = [{ id: 'equipped', category: 'weapon', equip_slots: ['main-hand'] }];
    const weapon = { id: 'new', category: 'weapon', sovrapponibile: false };
    expect(getAvailableCompatibleMannequinPartIds(weapon, equippedItems)).toEqual(['hand-left']);
    expect(getAvailableCompatibleMannequinPartIds({ ...weapon, sovrapponibile: true }, equippedItems))
      .toEqual(['hand-left', 'hand-right']);
  });

  it('keeps destination selection on the 3D mannequin and supports item images and load info', () => {
    const source = readFileSync('src/features/character/home/equipmentMannequin.js', 'utf8');
    expect(source).not.toContain("slotTitle.textContent = 'Parti del corpo'");
    expect(source).toContain("image.className = 'equipment-mannequin__item-image'");
    expect(source).toContain("loadLabel.textContent = 'Carico trasportato'");
    expect(source).toContain('let selectedId = null');
    expect(source).toContain("id: 'nose'");
    expect(source).toContain("id: 'mouth'");
    expect(source).toContain("id: 'elbow-left'");
    expect(source).toContain("id: 'knee-left'");
    expect(source).toContain("id: 'forearm-left'");
    expect(source).toContain("id: 'shin-left'");
    expect(source).toContain("headFocusButton.dataset.mannequinFocus = 'head'");
    expect(source).toContain("camera.position.set(0, viewMode === 'head' ? 1.9 : 0.24, cameraDistance)");
    expect(source).toContain("id: 'hand-right', label: 'Mano destra', slots: ['hand-right', 'hands', 'main-hand'");
    expect(source).toContain('const pendingPartIds = new Set()');
    expect(source).toContain('const equipSlots = [...new Set(partIds.map');
    expect(source).toContain("equipButtonLabel.textContent = pendingPartIds.size");
    expect(source).toContain("equipAction.className = 'equipment-mannequin__equip-action'");
    expect(source).toContain("equipButton?.addEventListener('click', () => void equipPendingItem())");
    expect(source).toContain('export function buildEquipmentCompatibilityPicker3D(selectedSlots = [])');
    expect(source).toContain("['front', 'Fronte']");
    expect(source).toContain("['back', 'Schiena']");
    expect(source).toContain("['head', 'Volto']");
    expect(source).toContain("input.value = part.id");
    expect(source).toContain("guidance.textContent = 'Tocca direttamente una parte del corpo per selezionarla'");
    expect(source).not.toContain('item-equip-3d__marker');
  });
});
