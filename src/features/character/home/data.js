import { updateCharacter } from '../characterApi.js';
import { getState, setState } from '../../../app/state.js';
import { cacheSnapshot } from '../../../lib/offline/cache.js';
import { createToast } from '../../../ui/components.js';

export async function saveCharacterData(character, data, message, onRender) {
  if (!character) return null;
  const payload = {
    name: character.name,
    system: character.system ?? null,
    data
  };
  let updated;
  try {
    updated = await updateCharacter(character.id, payload);
  } catch (error) {
    console.error('Aggiornamento personaggio non riuscito', error);
    createToast('Errore aggiornamento personaggio', 'error');
    return null;
  }

  const nextCharacters = getState().characters.map((char) => (char.id === updated.id ? updated : char));
  setState({ characters: nextCharacters });
  try {
    await cacheSnapshot({ characters: nextCharacters });
  } catch (error) {
    console.warn('Salvataggio locale del personaggio non riuscito', error);
  }
  if (message) createToast(message);
  if (onRender) {
    try {
      await onRender();
    } catch (error) {
      console.error('Aggiornamento schermata dopo il salvataggio non riuscito', error);
      createToast('Dati salvati. Aggiornamento della schermata non riuscito.', 'warning');
    }
  }
  return updated;
}

export async function consumeSpellSlot(character, level, onRender) {
  if (!character) return false;
  const data = character.data || {};
  const spellcasting = data.spellcasting || {};
  const slots = { ...(spellcasting.slots || {}) };
  const slotsMax = { ...(spellcasting.slots_max || {}) };
  const current = Math.max(0, Number(slots[level]) || 0);
  if (!current) {
    createToast('Slot incantesimo esauriti', 'error');
    return false;
  }
  const currentMax = Number(slotsMax[level]);
  if (!Number.isFinite(currentMax) || currentMax < current) {
    slotsMax[level] = current;
  }
  slots[level] = Math.max(0, current - 1);
  const saved = await saveCharacterData(character, {
    ...data,
    spellcasting: {
      ...spellcasting,
      slots,
      slots_max: slotsMax
    }
  }, 'Slot incantesimo consumato', onRender);
  return Boolean(saved);
}


export async function restoreSpellSlot(character, level, onRender) {
  if (!character) return false;
  const data = character.data || {};
  const spellcasting = data.spellcasting || {};
  const slots = { ...(spellcasting.slots || {}) };
  const slotsMax = { ...(spellcasting.slots_max || {}) };
  const current = Math.max(0, Number(slots[level]) || 0);
  const currentMax = Math.max(0, Number(slotsMax[level]) || 0);
  if (!currentMax) {
    createToast('Nessuno slot massimo configurato per questo livello', 'error');
    return false;
  }
  if (current >= currentMax) {
    createToast('Slot già al massimo');
    return false;
  }
  slots[level] = Math.min(current + 1, currentMax);
  const saved = await saveCharacterData(character, {
    ...data,
    spellcasting: {
      ...spellcasting,
      slots,
      slots_max: slotsMax
    }
  }, 'Slot incantesimo ripristinato', onRender);
  return Boolean(saved);
}
