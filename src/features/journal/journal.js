import {
  fetchEntries,
  fetchTags,
  fetchEntryTags,
  createEntry,
  updateEntry,
  deleteEntry,
  createTag,
  attachTag,
  detachTag
} from './journalApi.js';
import { getState, normalizeCharacterId, updateCache } from '../../app/state.js';
import { cacheSnapshot } from '../../lib/offline/cache.js';
import { buildInput, buildTextarea, createToast, openConfirmModal, openFormModal } from '../../ui/components.js';

export async function renderJournal(container) {
  const state = getState();
  const normalizedActiveId = normalizeCharacterId(state.activeCharacterId);
  const activeCharacter = state.characters.find((char) => normalizeCharacterId(char.id) === normalizedActiveId);
  if (!activeCharacter) {
    container.innerHTML = '<section class="card"><p>Nessun personaggio selezionato.</p></section>';
    return;
  }

  let entries = state.cache.journal;
  let tags = state.cache.tags;
  let entryTags = [];
  if (!state.offline) {
    try {
      entries = await fetchEntries(activeCharacter.id);
      tags = await fetchTags(activeCharacter.user_id);
      entryTags = await fetchEntryTags(entries.map((entry) => entry.id));
      updateCache('journal', entries);
      updateCache('tags', tags);
      await cacheSnapshot({ journal: entries, tags, entryTags });
    } catch (error) {
      createToast('Errore caricamento diario', 'error');
    }
  }

  const tagMap = new Map(tags.map((tag) => [tag.id, tag]));
  const entryTagMap = entryTags.reduce((acc, link) => {
    if (!acc[link.entry_id]) acc[link.entry_id] = [];
    acc[link.entry_id].push(link.tag_id);
    return acc;
  }, {});

  container.innerHTML = `
    <div class="journal-layout">
      <section class="card journal-toolbar">
        <header class="card-header">
          <div>
            <p class="eyebrow">Diario</p>
            <h2>Appunti e sessioni</h2>
          </div>
          <button class="icon-button icon-button--add" data-add-entry aria-label="Nuova voce" title="Nuova voce">
            <span aria-hidden="true">+</span>
          </button>
        </header>
        <div class="filters journal-filters-row">
          <input type="search" placeholder="Cerca per titolo o contenuto" data-search />
          <button data-add-tag class="icon-button" aria-label="Nuovo tag" title="Nuovo tag">
            <span aria-hidden="true">🏷️</span>
          </button>
        </div>
      </section>
      <section class="card journal-section-card">
        <header class="card-header">
          <p class="eyebrow">Voci</p>
        </header>
        <div data-journal-list></div>
      </section>
      <section class="card journal-section-card">
        <header class="card-header">
          <p class="eyebrow">Archivio file sessioni</p>
          <button class="icon-button" type="button" data-upload-session-file aria-label="Carica file sessione" title="Carica file sessione (PDF)">
            <span aria-hidden="true">📎</span>
          </button>
        </header>
        <p class="muted">Sezione predisposta: il caricamento locale è già disponibile, il salvataggio su Supabase verrà collegato quando sarà pronta la tabella.</p>
        <input type="file" accept="application/pdf,.pdf" hidden data-session-file-input />
        <p class="muted" data-upload-feedback>Nessun file selezionato.</p>
      </section>
    </div>
  `;

  const listEl = container.querySelector('[data-journal-list]');
  const searchInput = container.querySelector('[data-search]');
  const uploadButton = container.querySelector('[data-upload-session-file]');
  const uploadInput = container.querySelector('[data-session-file-input]');
  const uploadFeedback = container.querySelector('[data-upload-feedback]');

  function renderList() {
    const term = searchInput.value.toLowerCase().trim();
    const filteredEntries = filterEntries(entries, term);
    listEl.innerHTML = filteredEntries.length
      ? buildEntryList(filteredEntries, entryTagMap, tagMap)
      : '<p class="muted">Nessuna voce trovata.</p>';

    listEl.querySelectorAll('[data-edit]')
      .forEach((btn) => btn.addEventListener('click', async () => {
        const entry = entries.find((item) => item.id === btn.dataset.edit);
        if (entry) {
          await openEntryModal(activeCharacter, entry, tags, entryTagMap[entry.id] ?? [], refresh);
        }
      }));

    listEl.querySelectorAll('[data-delete]')
      .forEach((btn) => btn.addEventListener('click', async () => {
        const entry = entries.find((item) => item.id === btn.dataset.delete);
        if (!entry) return;
        const shouldDelete = await openConfirmModal({
          title: 'Conferma eliminazione voce',
          message: `Stai per eliminare la voce "${entry.title || 'Senza titolo'}" dal diario. Questa azione non può essere annullata.`,
          confirmLabel: 'Elimina'
        });
        if (!shouldDelete) return;
        try {
          await deleteEntry(entry.id);
          createToast('Voce eliminata');
          refresh();
        } catch (error) {
          createToast('Errore eliminazione', 'error');
        }
      }));
  }

  async function refresh() {
    await renderJournal(container);
  }

  renderList();
  searchInput.addEventListener('input', renderList);
  container.querySelector('[data-add-entry]').addEventListener('click', async () => {
    await openEntryModal(activeCharacter, null, tags, [], refresh);
  });
  container.querySelector('[data-add-tag]').addEventListener('click', async () => {
    await openTagModal(activeCharacter, refresh);
  });

  uploadButton?.addEventListener('click', () => uploadInput?.click());
  uploadInput?.addEventListener('change', () => {
    const file = uploadInput.files?.[0];
    if (!file) {
      if (uploadFeedback) uploadFeedback.textContent = 'Nessun file selezionato.';
      return;
    }
    if (uploadFeedback) {
      uploadFeedback.textContent = `File pronto: ${file.name} (${Math.max(1, Math.round(file.size / 1024))} KB).`;
    }
    createToast('File selezionato. Salvataggio remoto da collegare quando disponibile.');
  });
}

function filterEntries(entries, term) {
  if (!term) return entries;
  return entries.filter((entry) =>
    entry.title?.toLowerCase().includes(term) || entry.content?.toLowerCase().includes(term)
  );
}

function buildEntryList(entries, entryTagMap, tagMap) {
  return `
    <ul class="journal-entry-list">
      ${entries.map((entry) => {
    const tagIds = entryTagMap[entry.id] ?? [];
    return `
          <li class="journal-entry-card">
            <div>
              <strong>${entry.title || 'Senza titolo'}</strong>
              <p class="muted">${entry.entry_date || ''} · Sessione ${entry.session_no ?? '-'}</p>
              <div class="tag-row">
                ${tagIds.map((id) => `<span class="chip">${tagMap.get(id)?.name ?? ''}</span>`).join('')}
              </div>
            </div>
            <div class="actions">
              <button class="icon-button" data-edit="${entry.id}" aria-label="Modifica voce" title="Modifica">
                <span aria-hidden="true">✏️</span>
              </button>
              <button class="icon-button icon-button--danger" data-delete="${entry.id}" aria-label="Elimina voce" title="Elimina">
                <span aria-hidden="true">🗑️</span>
              </button>
            </div>
          </li>
        `;
  }).join('')}
    </ul>
  `;
}

async function openEntryModal(character, entry, tags, selectedTags, onSave) {
  const content = document.createElement('div');
  content.className = 'drawer-form modal-form-grid';
  content.appendChild(buildInput({ label: 'Titolo', name: 'title', value: entry?.title ?? '' }));
  content.appendChild(buildInput({ label: 'Data', name: 'entry_date', type: 'date', value: entry?.entry_date ?? new Date().toISOString().split('T')[0] }));
  content.appendChild(buildInput({ label: 'Sessione', name: 'session_no', type: 'number', value: entry?.session_no ?? '' }));
  content.appendChild(buildTextarea({ label: 'Contenuto', name: 'content', value: entry?.content ?? '' }));

  const pinnedField = document.createElement('label');
  pinnedField.className = 'checkbox';
  pinnedField.innerHTML = `<input type="checkbox" name="is_pinned" ${entry?.is_pinned ? 'checked' : ''} /> <span>In evidenza</span>`;
  content.appendChild(pinnedField);

  const tagWrap = document.createElement('div');
  tagWrap.className = 'tag-selector';
  tagWrap.innerHTML = '<span>Tag</span>';
  tags.forEach((tag) => {
    const label = document.createElement('label');
    label.className = 'checkbox';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.value = tag.id;
    input.name = 'entry_tag';
    if (selectedTags.includes(tag.id)) input.checked = true;
    label.appendChild(input);
    label.append(tag.name);
    tagWrap.appendChild(label);
  });
  content.appendChild(tagWrap);

  const formData = await openFormModal({
    title: entry ? 'Modifica voce' : 'Nuova voce',
    submitLabel: entry ? 'Salva' : 'Crea',
    content,
    cardClass: 'modal-card--wide'
  });

  if (!formData) return;

  const payload = {
    user_id: character.user_id,
    character_id: character.id,
    title: formData.get('title'),
    entry_date: formData.get('entry_date'),
    session_no: Number(formData.get('session_no') || 0),
    content: formData.get('content'),
    is_pinned: formData.get('is_pinned') === 'on'
  };

  try {
    const saved = entry
      ? await updateEntry(entry.id, payload)
      : await createEntry(payload);

    const selected = Array.from(tagWrap.querySelectorAll('input[type="checkbox"]'))
      .filter((input) => input.checked)
      .map((input) => input.value);

    if (entry) {
      const toAdd = selected.filter((id) => !selectedTags.includes(id));
      const toRemove = selectedTags.filter((id) => !selected.includes(id));
      await Promise.all([
        ...toAdd.map((id) => attachTag(saved.id, id)),
        ...toRemove.map((id) => detachTag(saved.id, id))
      ]);
    } else {
      await Promise.all(selected.map((id) => attachTag(saved.id, id)));
    }

    createToast('Voce salvata');
    onSave();
  } catch (error) {
    createToast('Errore salvataggio voce', 'error');
  }
}

async function openTagModal(character, onSave) {
  const content = document.createElement('div');
  content.className = 'drawer-form modal-form-grid';
  content.appendChild(buildInput({ label: 'Nome tag', name: 'name' }));

  const formData = await openFormModal({
    title: 'Nuovo tag',
    submitLabel: 'Crea',
    content
  });

  if (!formData) return;

  try {
    await createTag({ user_id: character.user_id, name: formData.get('name') });
    createToast('Tag creato');
    onSave();
  } catch (error) {
    createToast('Errore tag', 'error');
  }
}
