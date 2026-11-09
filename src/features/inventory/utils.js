import { bodyPartLabels, categoryLabels } from './constants.js';
import { formatCoin } from '../../lib/format.js';

const ITEM_VALUE_DENOMINATIONS = [
  { key: 'gp', factor: 100, name: 'oro', singular: "moneta d'oro", plural: "monete d'oro", icon: 'moneta_oro.png' },
  { key: 'sp', factor: 10, name: 'argento', singular: "moneta d'argento", plural: "monete d'argento", icon: 'moneta_argento.png' },
  { key: 'cp', factor: 1, name: 'rame', singular: 'moneta di rame', plural: 'monete di rame', icon: 'moneta_rame.png' }
];

export function splitCopperValue(valueCp = 0) {
  const total = Math.max(0, Math.round(Number(valueCp) || 0));
  const gp = Math.floor(total / 100);
  const afterGold = total % 100;
  return {
    gp,
    sp: Math.floor(afterGold / 10),
    cp: afterGold % 10
  };
}

export function combineCoinValue({ gp = 0, sp = 0, cp = 0 } = {}) {
  const normalize = (value) => Math.max(0, Math.trunc(Number(value) || 0));
  return (normalize(gp) * 100) + (normalize(sp) * 10) + normalize(cp);
}

export function getInventoryItemValueDisplay(item) {
  const directValue = Number(item?.value_cp);
  const legacyFactors = { mr: 1, cp: 1, ma: 10, sp: 10, mo: 100, gp: 100, mp: 1000, pp: 1000 };
  const legacyQuantity = Number(item?.cost?.quantita ?? item?.cost?.quantity);
  const legacyFactor = legacyFactors[String(item?.cost?.moneta ?? item?.cost?.coin ?? '').toLowerCase()];
  const copper = Math.max(0, Math.round(Number.isFinite(directValue)
    ? directValue
    : Number.isFinite(legacyQuantity) && legacyFactor ? legacyQuantity * legacyFactor : 0));
  const denomination = ITEM_VALUE_DENOMINATIONS.find((coin) => copper > 0 && copper % coin.factor === 0)
    || ITEM_VALUE_DENOMINATIONS[ITEM_VALUE_DENOMINATIONS.length - 1];
  const amount = copper / denomination.factor;
  return {
    ...denomination,
    amount,
    unitLabel: amount === 1 ? denomination.singular : denomination.plural,
    copper
  };
}

export function formatTransactionAmount(amount) {
  const normalized = normalizeTransactionAmount(amount);
  const entries = ['pp', 'gp', 'sp', 'cp']
    .map((coin) => ({ coin, value: Number(normalized?.[coin] ?? 0) }))
    .filter((entry) => entry.value !== 0);
  if (!entries.length) return '0 gp';
  return entries.map((entry) => formatCoin(entry.value, entry.coin)).join(' · ');
}

export function normalizeTransactionAmount(amount) {
  if (!amount) return {};
  if (typeof amount === 'string') {
    try {
      return JSON.parse(amount);
    } catch (error) {
      return {};
    }
  }
  return amount;
}

export function formatTransactionDate(value) {
  if (!value) return 'Data non disponibile';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Data non disponibile';
  return date.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function getCategoryLabel(category) {
  return categoryLabels.get(category) ?? (category ? category : 'Altro');
}

export function getBodyPartLabel(part) {
  return bodyPartLabels.get(part) ?? part;
}

export function getBodyPartLabels(parts = []) {
  return (Array.isArray(parts) ? parts : [])
    .map((part) => getBodyPartLabel(part))
    .join(', ');
}

export function getEquipSlots(item) {
  if (!item) return [];
  if (Array.isArray(item.equip_slots)) {
    return item.equip_slots.filter(Boolean);
  }
  if (typeof item.equip_slots === 'string' && item.equip_slots.trim()) {
    try {
      const parsed = JSON.parse(item.equip_slots);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch (error) {
      return [item.equip_slots];
    }
  }
  if (item.equip_slot) return [item.equip_slot];
  return [];
}

function normalizeSlotList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value !== 'string' || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch (error) {
    return [value];
  }
}

export function getCompatibleEquipSlots(item) {
  if (!item) return [];
  const compatibleSlots = normalizeSlotList(item.compatible_equip_slots);
  if (compatibleSlots.length) return compatibleSlots;
  return normalizeSlotList(item.allowed_equip_slots);
}

export function getWeightUnit(character) {
  return 'kg';
}

export function getItemStatusLabels(item = {}) {
  return {
    magic: item.is_magic ? 'Magico' : 'Non magico',
    equipable: item.equipable ? 'Equipaggiabile' : 'Non equipaggiabile',
    attunement: item.attunement_active ? 'In sintonia' : 'Non in sintonia'
  };
}

export function hasProficiencyForItem(character, formData) {
  const proficiencies = character.data?.proficiencies || {};
  const category = formData.get('category');
  if (category === 'weapon') {
    const weaponType = formData.get('weapon_type');
    if (!weaponType) return false;
    return weaponType === 'simple'
      ? Boolean(proficiencies.weapon_simple)
      : Boolean(proficiencies.weapon_martial);
  }
  if (category === 'armor') {
    const isShield = formData.get('is_shield') === 'on';
    if (isShield) {
      return Boolean(proficiencies.shield);
    }
    const armorType = formData.get('armor_type');
    if (!armorType) return false;
    if (armorType === 'light') return Boolean(proficiencies.armor_light);
    if (armorType === 'medium') return Boolean(proficiencies.armor_medium);
    return Boolean(proficiencies.armor_heavy);
  }
  return true;
}
