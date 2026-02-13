import {
  fetchEntries,
  fetchTags,
  fetchEntryTags,
  fetchSessionFiles,
  uploadSessionFile,
  createSessionFile,
  deleteSessionFile,
  getSessionFileSignedUrl,
  createEntry,
  updateEntry,
  deleteEntry,
  createTag,
  attachTag,
  detachTag
} from './journalApi.js';
import { getState, normalizeCharacterId, updateCache } from '../../app/state.js';
import { cacheSnapshot } from '../../lib/offline/cache.js';
import {
  buildInput,
  buildTextarea,
  createToast,
  openConfirmModal,
  openFormModal,
  setGlobalLoading
} from '../../ui/components.js';

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
  let sessionFiles = [];
  if (!state.offline) {
    try {
      const [entriesResult, tagsResult, sessionFilesResult] = await Promise.allSettled([
        fetchEntries(activeCharacter.id),
        fetchTags(activeCharacter.user_id),
        fetchSessionFiles(activeCharacter.id)
      ]);

      if (entriesResult.status === 'fulfilled') {
        entries = entriesResult.value;
        updateCache('journal', entries);
      } else {
        createToast('Errore caricamento voci diario', 'error');
      }

      if (tagsResult.status === 'fulfilled') {
        tags = tagsResult.value;
        updateCache('tags', tags);
      } else {
        createToast('Errore caricamento tag', 'error');
      }

      if (sessionFilesResult.status === 'fulfilled') {
        sessionFiles = sessionFilesResult.value;
      } else {
        createToast('Errore caricamento file sessione', 'error');
      }

      if (entries.length) {
        try {
          entryTags = await fetchEntryTags(entries.map((entry) => entry.id));
          await cacheSnapshot({ journal: entries, tags, entryTags });
        } catch (error) {
          createToast('Errore caricamento associazioni tag', 'error');
          await cacheSnapshot({ journal: entries, tags });
        }
      } else {
        await cacheSnapshot({ journal: entries, tags });
      }
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
      <section class="card journal-section-card journal-section-card--entries">
        <header class="card-header">
          <div>
            <p class="eyebrow">Diario</p>         
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
        <div data-journal-list></div>
      </section>

      <section class="card journal-section-card journal-section-card--files">
        <header class="card-header">
          <p class="eyebrow">File sessioni</p>
          <button class="icon-button" type="button" data-upload-session-file aria-label="Carica file sessione" title="Carica file sessione (PDF)">
            <span aria-hidden="true">📎</span>
          </button>
        </header>
        <input type="file" accept="application/pdf,.pdf" hidden data-session-file-input />
        <p class="muted" data-upload-feedback>${state.offline ? 'Modalità offline: upload non disponibile.' : 'Carica un PDF di sessione per salvarlo nel diario.'}</p>
        <div data-session-files-list></div>
      </section>
    </div>
  `;

  const listEl = container.querySelector('[data-journal-list]');
  const filesListEl = container.querySelector('[data-session-files-list]');
  const searchInput = container.querySelector('[data-search]');
  const uploadButton = container.querySelector('[data-upload-session-file]');
  const uploadInput = container.querySelector('[data-session-file-input]');
  const uploadFeedback = container.querySelector('[data-upload-feedback]');

  function renderEntriesList() {
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

        setGlobalLoading(true);
        try {
          await deleteEntry(entry.id);
          createToast('Voce eliminata');
          await refresh();
        } catch (error) {
          createToast('Errore eliminazione', 'error');
        } finally {
          setGlobalLoading(false);
        }
      }));
  }

  function renderSessionFiles() {
    filesListEl.innerHTML = sessionFiles.length
      ? buildFileList(sessionFiles)
      : '<p class="muted">Nessun file caricato.</p>';

    filesListEl.querySelectorAll('[data-delete-file]')
      .forEach((button) => button.addEventListener('click', async () => {
        const fileRecord = sessionFiles.find((entry) => entry.id === button.dataset.deleteFile);
        if (!fileRecord) return;
        const shouldDelete = await openConfirmModal({
          title: 'Conferma eliminazione file',
          message: `Stai per eliminare il file "${fileRecord.file_name}". Questa azione non può essere annullata.`,
          confirmLabel: 'Elimina'
        });
        if (!shouldDelete) return;

        setGlobalLoading(true);
        try {
          await deleteSessionFile(fileRecord);
          createToast('File eliminato');
          refresh();
        } catch (error) {
          createToast('Errore eliminazione file', 'error');
        } finally {
          setGlobalLoading(false);
        }
      }));


    filesListEl.querySelectorAll('[data-preview-file]')
      .forEach((button) => button.addEventListener('click', async () => {
        const fileRecord = sessionFiles.find((entry) => entry.id === button.dataset.previewFile);
        if (!fileRecord) return;

        setGlobalLoading(true);
        let signedUrl = null;
        try {
          signedUrl = await getSessionFileSignedUrl(fileRecord.file_path, 600);
          if (!signedUrl) {
            createToast('Impossibile aprire l’anteprima', 'error');
            return;
          }
        } catch (error) {
          createToast('Errore apertura anteprima', 'error');
        } finally {
          setGlobalLoading(false);
        }

        if (signedUrl) {
          openFileInNewTab(signedUrl);
        }
      }));

    filesListEl.querySelectorAll('[data-download-file]')
      .forEach((button) => button.addEventListener('click', async () => {
        const fileRecord = sessionFiles.find((entry) => entry.id === button.dataset.downloadFile);
        if (!fileRecord) return;
        setGlobalLoading(true);
        try {
          const signedUrl = await getSessionFileSignedUrl(fileRecord.file_path, 120);
          if (!signedUrl) {
            createToast('Impossibile scaricare il file', 'error');
            return;
          }
          await triggerFileDownload(signedUrl, fileRecord.file_name);
        } catch (error) {
          createToast('Errore download file', 'error');
        } finally {
          setGlobalLoading(false);
        }
      }));
  }

  async function refresh() {
    await renderJournal(container);
  }

  renderEntriesList();
  renderSessionFiles();

  searchInput.addEventListener('input', renderEntriesList);
  container.querySelector('[data-add-entry]').addEventListener('click', async () => {
    await openEntryModal(activeCharacter, null, tags, [], refresh);
  });
  container.querySelector('[data-add-tag]').addEventListener('click', async () => {
    await openTagModal(activeCharacter, refresh);
  });

  if (state.offline) {
    uploadButton.disabled = true;
  }

  uploadButton?.addEventListener('click', () => uploadInput?.click());
  uploadInput?.addEventListener('change', async () => {
    const file = uploadInput.files?.[0];
    if (!file) return;

    const maxMb = 10;
    if (file.type !== 'application/pdf') {
      if (uploadFeedback) uploadFeedback.textContent = 'Formato non valido: carica un PDF.';
      createToast('Carica solo file PDF', 'error');
      uploadInput.value = '';
      return;
    }
    if (file.size > maxMb * 1024 * 1024) {
      if (uploadFeedback) uploadFeedback.textContent = 'File troppo grande (max 10MB).';
      createToast('File troppo grande', 'error');
      uploadInput.value = '';
      return;
    }

    const uploadDetails = await openSessionFileUploadModal(file);
    if (!uploadDetails) {
      uploadInput.value = '';
      if (uploadFeedback) {
        uploadFeedback.textContent = 'Caricamento annullato.';
      }
      return;
    }

    const resolvedFileName = uploadDetails.displayName || file.name;
    if (uploadFeedback) {
      uploadFeedback.textContent = `Upload in corso: ${resolvedFileName}...`;
    }

    setGlobalLoading(true);
    try {
      const filePath = await uploadSessionFile({
        userId: activeCharacter.user_id,
        characterId: activeCharacter.id,
        file
      });

      await createSessionFile({
        user_id: activeCharacter.user_id,
        character_id: activeCharacter.id,
        file_name: resolvedFileName,
        file_path: filePath,
        mime_type: file.type || 'application/pdf',
        size_bytes: file.size,
        session_no: uploadDetails.sessionNo,
        notes: uploadDetails.notes,
        metadata: {
          original_name: file.name,
          display_name: resolvedFileName
        }
      });

      createToast('File caricato con successo', 'success');
      if (uploadFeedback) {
        uploadFeedback.textContent = `Caricato: ${resolvedFileName}`;
      }
      uploadInput.value = '';
      await refresh();
    } catch (error) {
      if (uploadFeedback) {
        uploadFeedback.textContent = 'Errore durante il caricamento del file.';
      }
      createToast('Errore upload file', 'error');
    } finally {
      setGlobalLoading(false);
    }
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

function buildFileList(files) {
  return `
    <ul class="journal-entry-list">
      ${files.map((file) => `
        <li class="journal-entry-card journal-entry-card--file">
          <div>
            <strong>${file.file_name}</strong>
            <p class="muted">${formatFileSize(file.size_bytes)} · ${file.mime_type || 'application/pdf'}</p>
            ${file.session_no !== null && file.session_no !== undefined ? `<p class="muted">Sessione ${file.session_no}</p>` : ''}
            ${file.notes ? `<p class="muted">${file.notes}</p>` : ''}
            <p class="muted">${formatDate(file.created_at)}</p>
          </div>
          <div class="actions">
            <button class="icon-button" data-preview-file="${file.id}" aria-label="Visualizza file" title="Visualizza">
              <span aria-hidden="true">👁️</span>
            </button>
            <button class="icon-button" data-download-file="${file.id}" aria-label="Scarica file" title="Scarica">
              <span aria-hidden="true">⬇️</span>
            </button>
            <button class="icon-button icon-button--danger" data-delete-file="${file.id}" aria-label="Elimina file" title="Elimina file">
              <span aria-hidden="true">🗑️</span>
            </button>
          </div>
        </li>
      `).join('')}
    </ul>
  `;
}

function formatFileSize(sizeBytes = 0) {
  const bytes = Number(sizeBytes) || 0;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

async function triggerFileDownload(url, fileName) {
  const resolvedFileName = fileName || 'session-file.pdf';

  try {
    const response = await fetch(url, { credentials: 'omit' });
    if (!response.ok) {
      throw new Error(`Download HTTP error: ${response.status}`);
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = resolvedFileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
    return;
  } catch (error) {
    const fallbackLink = document.createElement('a');
    fallbackLink.href = url;
    fallbackLink.download = resolvedFileName;
    fallbackLink.rel = 'noopener';
    document.body.appendChild(fallbackLink);
    fallbackLink.click();
    fallbackLink.remove();
  }
}


function openFileInNewTab(url) {
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
  if (newWindow) return;

  const fallbackLink = document.createElement('a');
  fallbackLink.href = url;
  fallbackLink.target = '_blank';
  fallbackLink.rel = 'noopener noreferrer';
  document.body.appendChild(fallbackLink);
  fallbackLink.click();
  fallbackLink.remove();
}

async function openSessionFileUploadModal(file) {
  const content = document.createElement('div');
  content.className = 'drawer-form modal-form-grid';
  content.appendChild(buildInput({ label: 'Nome file visibile', name: 'display_name', value: file.name }));
  content.appendChild(buildInput({ label: 'Sessione (opzionale)', name: 'session_no', type: 'number' }));
  content.appendChild(buildTextarea({ label: 'Note (opzionale)', name: 'notes', placeholder: 'Aggiungi contesto o descrizione del file' }));

  const formData = await openFormModal({
    title: 'Dettagli file sessione',
    submitLabel: 'Carica file',
    content
  });

  if (!formData) return null;

  const sessionNoRaw = formData.get('session_no');
  const sessionNo = Number(sessionNoRaw);
  const parsedSessionNo = Number.isFinite(sessionNo) && sessionNo >= 0 ? sessionNo : null;
  const displayName = String(formData.get('display_name') || '').trim();
  const notes = String(formData.get('notes') || '').trim();

  return {
    displayName,
    sessionNo: parsedSessionNo,
    notes: notes || null
  };
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

  setGlobalLoading(true);
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
    await onSave();
  } catch (error) {
    createToast('Errore salvataggio voce', 'error');
  } finally {
    setGlobalLoading(false);
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
