import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../../../src/features/character/characterApi.js', () => ({
  updateCharacter: vi.fn()
}));
vi.mock('../../../../../src/app/state.js', () => ({
  getState: vi.fn(),
  setState: vi.fn()
}));
vi.mock('../../../../../src/lib/offline/cache.js', () => ({
  cacheSnapshot: vi.fn()
}));
vi.mock('../../../../../src/ui/components.js', () => ({
  createToast: vi.fn()
}));

import { updateCharacter } from '../../../../../src/features/character/characterApi.js';
import { getState, setState } from '../../../../../src/app/state.js';
import { cacheSnapshot } from '../../../../../src/lib/offline/cache.js';
import { createToast } from '../../../../../src/ui/components.js';
import { saveCharacterData } from '../../../../../src/features/character/home/data.js';

describe('character save refresh isolation', () => {
  const character = { id: 'character-1', name: 'Seraphiel', system: 'dnd5e', data: {} };
  const updated = { ...character, data: { hp: { current: 12 } } };

  beforeEach(() => {
    vi.clearAllMocks();
    getState.mockReturnValue({ characters: [character] });
    updateCharacter.mockResolvedValue(updated);
    cacheSnapshot.mockResolvedValue(undefined);
  });

  it('does not report a successful save as failed when only the screen refresh fails', async () => {
    const result = await saveCharacterData(character, updated.data, 'Personaggio aggiornato', async () => {
      throw new Error('render failed');
    });

    expect(result).toEqual(updated);
    expect(setState).toHaveBeenCalledWith({ characters: [updated] });
    expect(createToast).toHaveBeenCalledWith('Personaggio aggiornato');
    expect(createToast).toHaveBeenCalledWith('Dati salvati. Aggiornamento della schermata non riuscito.', 'warning');
    expect(createToast).not.toHaveBeenCalledWith('Errore aggiornamento personaggio', 'error');
  });

  it('reports an actual server save failure and skips the refresh', async () => {
    const refresh = vi.fn();
    updateCharacter.mockRejectedValue(new Error('network'));

    const result = await saveCharacterData(character, updated.data, null, refresh);

    expect(result).toBeNull();
    expect(refresh).not.toHaveBeenCalled();
    expect(createToast).toHaveBeenCalledWith('Errore aggiornamento personaggio', 'error');
  });
});
