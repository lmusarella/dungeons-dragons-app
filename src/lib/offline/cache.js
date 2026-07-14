import { db } from './dexie.js';
import {
  getState,
  getStoredActiveCharacterId,
  normalizeCharacterId,
  setActiveCharacter,
  setState,
  setCache
} from '../../app/state.js';

export async function loadCachedData() {
  const { user } = getState();
  if (!user) return;
  const characters = await db.characters.where('user_id').equals(user.id).toArray();
  if (characters.length) {
    setState({ characters });
  }
  const storedActiveId = getStoredActiveCharacterId(user.id);
  const normalizedStoredId = normalizeCharacterId(storedActiveId);
  const activeCharacterId = (normalizedStoredId
    && characters.some((char) => normalizeCharacterId(char.id) === normalizedStoredId))
    ? normalizedStoredId
    : normalizeCharacterId(characters[0]?.id);
  if (activeCharacterId) {
    setActiveCharacter(activeCharacterId);
    const [items, resources, journal, wallet, tags] = await Promise.all([
      db.items.where('character_id').equals(activeCharacterId).toArray(),
      db.resources.where('character_id').equals(activeCharacterId).toArray(),
      db.journal.where('character_id').equals(activeCharacterId).toArray(),
      db.wallet.where('character_id').equals(activeCharacterId).first(),
      db.tags.where('user_id').equals(user.id).toArray()
    ]);
    setCache({
      items,
      resources,
      journal,
      wallet: wallet ?? null,
      tags
    });
  }
}

export async function cacheSnapshot(snapshot = {}) {
  const { user, activeCharacterId } = getState();
  const {
    characters,
    items,
    resources,
    wallet,
    journal,
    tags,
    entryTags
  } = snapshot;
  const hasWallet = Object.prototype.hasOwnProperty.call(snapshot, 'wallet');

  await db.transaction(
    'rw',
    db.characters,
    db.items,
    db.resources,
    db.wallet,
    db.journal,
    db.tags,
    db.entryTags,
    async () => {
      if (Array.isArray(characters)) {
        const userId = characters[0]?.user_id ?? user?.id;
        if (userId) {
          const previousCharacters = await db.characters.where('user_id').equals(userId).toArray();
          const nextIds = new Set(characters.map((character) => normalizeCharacterId(character.id)));
          const removedIds = previousCharacters
            .map((character) => normalizeCharacterId(character.id))
            .filter((id) => id && !nextIds.has(id));

          for (const characterId of removedIds) {
            const removedJournalIds = await db.journal.where('character_id').equals(characterId).primaryKeys();
            await Promise.all([
              db.items.where('character_id').equals(characterId).delete(),
              db.resources.where('character_id').equals(characterId).delete(),
              db.wallet.where('character_id').equals(characterId).delete(),
              db.journal.where('character_id').equals(characterId).delete()
            ]);
            if (removedJournalIds.length) {
              await db.entryTags.where('entry_id').anyOf(removedJournalIds).delete();
            }
          }

          await db.characters.where('user_id').equals(userId).delete();
        }
        if (characters.length) await db.characters.bulkPut(characters);
      }

      const replaceCharacterRows = async (table, rows) => {
        if (!Array.isArray(rows)) return;
        const characterId = normalizeCharacterId(rows[0]?.character_id ?? activeCharacterId);
        if (characterId) await table.where('character_id').equals(characterId).delete();
        if (rows.length) await table.bulkPut(rows);
      };

      await replaceCharacterRows(db.items, items);
      await replaceCharacterRows(db.resources, resources);

      let previousJournalIds = [];
      if (Array.isArray(journal)) {
        const characterId = normalizeCharacterId(journal[0]?.character_id ?? activeCharacterId);
        if (characterId) {
          previousJournalIds = await db.journal.where('character_id').equals(characterId).primaryKeys();
          await db.journal.where('character_id').equals(characterId).delete();
        }
        if (journal.length) await db.journal.bulkPut(journal);
        const nextJournalIds = new Set(journal.map((entry) => entry.id));
        const removedJournalIds = previousJournalIds.filter((id) => !nextJournalIds.has(id));
        if (removedJournalIds.length) {
          await db.entryTags.where('entry_id').anyOf(removedJournalIds).delete();
        }
      }

      if (hasWallet) {
        const characterId = normalizeCharacterId(wallet?.character_id ?? activeCharacterId);
        if (characterId) await db.wallet.where('character_id').equals(characterId).delete();
        if (wallet) await db.wallet.put(wallet);
      }

      if (Array.isArray(tags)) {
        const userId = tags[0]?.user_id ?? user?.id;
        if (userId) await db.tags.where('user_id').equals(userId).delete();
        if (tags.length) await db.tags.bulkPut(tags);
      }

      if (Array.isArray(entryTags)) {
        const affectedEntryIds = new Set([
          ...previousJournalIds,
          ...(journal || []).map((entry) => entry.id),
          ...entryTags.map((entryTag) => entryTag.entry_id)
        ].filter(Boolean));
        if (affectedEntryIds.size) {
          await db.entryTags.where('entry_id').anyOf([...affectedEntryIds]).delete();
        }
        if (entryTags.length) await db.entryTags.bulkPut(entryTags);
      }
    }
  );
}


export async function clearLocalCache() {
  await Promise.all([
    db.characters.clear(),
    db.items.clear(),
    db.resources.clear(),
    db.wallet.clear(),
    db.journal.clear(),
    db.tags.clear(),
    db.entryTags.clear()
  ]);
}
