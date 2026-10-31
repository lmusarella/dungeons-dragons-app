import { formatSigned, getAbilityModifier, normalizeNumber } from './utils.js';

export function buildCompactSpellSlots(character) {
  const data = character?.data || {};
  if (!data.is_spellcaster) return '';
  const casting = data.spellcasting || {};
  const abilityKey = casting.ability;
  const abilityModifier = abilityKey ? getAbilityModifier(data.abilities?.[abilityKey]) : null;
  const proficiencyBonus = normalizeNumber(data.proficiency_bonus);
  const saveDc = abilityModifier === null || proficiencyBonus === null ? '—' : 8 + abilityModifier + proficiencyBonus;
  const attackBonus = abilityModifier === null || proficiencyBonus === null ? '—' : formatSigned(abilityModifier + proficiencyBonus);
  const levels = Array.from({ length: 9 }, (_, i) => {
    const level = i + 1;
    const remaining = Math.max(0, Number(casting.slots?.[level]) || 0);
    const max = Math.max(remaining, Number(casting.slots_max?.[level]) || 0);
    return { level, remaining, max };
  }).filter(entry => entry.max > 0);
  return '<section class="sheet-slot-overview" aria-label="Slot incantesimo rimanenti"><div class="sheet-slot-overview__heading"><div><span>Magia pronta</span><strong>Slot incantesimo</strong></div><div class="sheet-slot-overview__summary"><span><small>CD</small><strong>' + saveDc + '</strong></span><span><small>Attacco</small><strong>' + attackBonus + '</strong></span></div></div><div class="sheet-slot-overview__levels">' +
    levels.map(({ level, remaining, max }) =>
      '<div class="sheet-slot-mini ' + (!remaining ? 'is-exhausted' : '') + '" aria-label="Livello ' + level + ': ' + remaining + ' slot rimanenti su ' + max + '"><span>' + level + '°</span><span class="sheet-slot-mini__dots" aria-hidden="true">' +
      Array.from({ length: max }, (_, i) => '<i class="' + (i < remaining ? 'is-available' : '') + '"></i>').join('') +
      '</span></div>').join('') + (levels.length ? '' : '<span class="sheet-slot-overview__empty">Nessuno slot configurato</span>') + '</div></section>';
}
