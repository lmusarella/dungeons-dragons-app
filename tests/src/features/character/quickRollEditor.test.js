import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('../../../../src/ui/components.js', () => ({
  buildInput: vi.fn(() => ({})), buildSelect: vi.fn(() => ({})), openFormModal: vi.fn()
}));
vi.mock('../../../../src/features/character/home/data.js', () => ({ saveCharacterData: vi.fn() }));
import { openFormModal } from '../../../../src/ui/components.js';
import { saveCharacterData } from '../../../../src/features/character/home/data.js';
import { openQuickRollEditor } from '../../../../src/features/character/home/quickRollEditor.js';
describe('shortcut roll creation', () => {
  const character = { id: 'hero', data: { abilities: { str: 16, dex: 14 }, proficiency_bonus: 4, hp: { current: 20 }, special_skill_rolls: [{ id: 'old', name: 'Existing' }], unarmed_attacks: [{ name: 'Pugno' }] } };
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('document', { createElement: () => ({ append() {} }), createTextNode: text => text });
    vi.stubGlobal('crypto', { randomUUID: () => 'new-roll' });
  });
  afterEach(() => vi.unstubAllGlobals());
  function answer(values) {
    const data = new FormData(); Object.entries(values).forEach(([key,value]) => data.set(key,value));
    openFormModal.mockResolvedValue(data);
  }
  it('adds a special roll without losing existing character data and applies mastery proficiency', async () => {
    answer({ name: ' Scassinare ', ability: 'dex', bonus: '2', mastery: 'on' });
    await openQuickRollEditor(character, 'skill');
    const saved = saveCharacterData.mock.calls[0][1];
    expect(saved.hp).toEqual({ current: 20 });
    expect(saved.special_skill_rolls).toEqual([{ id: 'old', name: 'Existing' }, { id: 'new-roll', name: 'Scassinare', ability: 'dex', bonus: 2, proficient: true, mastery: true }]);
    expect(character.data.special_skill_rolls).toHaveLength(1);
  });
  it('uses the shared attack calculation and preserves existing attacks', async () => {
    answer({ name: 'Calcio', ability: 'dex', bonus: '1', damage: '1d4', damage_bonus: '2' });
    const refresh = vi.fn();
    await openQuickRollEditor(character, 'attack', refresh);
    const saved = saveCharacterData.mock.calls[0][1];
    expect(saved.unarmed_attacks[0]).toEqual({ name: 'Pugno' });
    expect(saved.unarmed_attacks[1]).toMatchObject({ name: 'Calcio', to_hit: 7, damage: '1d4', damage_modifier: 4 });
    expect(saveCharacterData.mock.calls[0][3]).toBe(refresh);
  });
  it('does not save a cancelled or unnamed roll', async () => {
    openFormModal.mockResolvedValue(null); await openQuickRollEditor(character, 'attack');
    answer({ name: '   ' }); await openQuickRollEditor(character, 'skill');
    expect(saveCharacterData).not.toHaveBeenCalled();
  });
});
