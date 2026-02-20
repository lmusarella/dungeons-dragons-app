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
  deleteTag,
  unlinkTagFromAllEntries,
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
          <button data-add-tag class="icon-button" aria-label="Gestisci tag" title="Gestisci tag">
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
      .forEach((btn) => btn.addEventListener('click', async (event) => {
        event.stopPropagation();
        const entry = entries.find((item) => item.id === btn.dataset.edit);
        if (entry) {
          await openEntryModal(activeCharacter, entry, tags, entryTagMap[entry.id] ?? [], refresh);
        }
      }));

    listEl.querySelectorAll('[data-delete]')
      .forEach((btn) => btn.addEventListener('click', async (event) => {
        event.stopPropagation();
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

    listEl.querySelectorAll('[data-entry-card]')
      .forEach((card) => card.addEventListener('click', () => {
        const content = card.querySelector('[data-entry-content]');
        if (!content) return;
        const isOpen = card.classList.toggle('is-open');
        content.hidden = !isOpen;
      }));

    listEl.querySelectorAll('[data-quick-append]')
      .forEach((button) => button.addEventListener('click', async (event) => {
        event.stopPropagation();
        const entry = entries.find((item) => item.id === button.dataset.quickAppend);
        if (!entry) return;
        await openQuickAppendModal(entry, refresh);
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
    await openTagModal(activeCharacter, tags, refresh);
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
    const formattedContent = renderPrettyContent(entry.content || '');
    return `
          <li class="journal-entry-card journal-entry-card--entry" data-entry-card>
            <div class="journal-entry-card__header">
              <div class="journal-entry-card__summary">
                <strong>${entry.title || 'Senza titolo'}</strong>
                <p class="muted">${entry.entry_date || ''} · Sessione ${entry.session_no ?? '-'}</p>
              </div>
              <div class="actions journal-entry-card__actions">
                <button class="icon-button" data-quick-append="${entry.id}" aria-label="Aggiunta rapida" title="Aggiunta rapida testo">
                  <span aria-hidden="true">➕</span>
                </button>
                <button class="icon-button" data-edit="${entry.id}" aria-label="Modifica voce" title="Modifica">
                  <span aria-hidden="true">✏️</span>
                </button>
                <button class="icon-button icon-button--danger" data-delete="${entry.id}" aria-label="Elimina voce" title="Elimina">
                  <span aria-hidden="true">🗑️</span>
                </button>
              </div>
            </div>
            <div class="tag-row">
              ${tagIds.map((id) => `<span class="chip">${tagMap.get(id)?.name ?? ''}</span>`).join('')}
            </div>
            <div class="journal-entry-card__content" data-entry-content hidden>
              ${formattedContent || '<p class="muted">Nessun contenuto.</p>'}
            </div>
          </li>
        `;
  }).join('')}
    </ul>
  `;
}

function renderPrettyContent(rawText) {
  const escaped = escapeHtml(rawText || '');
  const lines = escaped.split('\n');
  const rendered = lines.map((line) => {
    let html = line;
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/_([^_]+)_/g, '<em>$1</em>');
    if (html.startsWith('# ')) return `<h4>${html.slice(2)}</h4>`;
    if (html.startsWith('- ')) return `<li>${html.slice(2)}</li>`;
    if (html.startsWith('&gt; ')) return `<blockquote>${html.slice(5)}</blockquote>`;
    return `<p>${html || '<br />'}</p>`;
  });

  let inList = false;
  return rendered.map((chunk) => {
    if (chunk.startsWith('<li>')) {
      if (!inList) {
        inList = true;
        return `<ul>${chunk}`;
      }
      return chunk;
    }
    if (inList) {
      inList = false;
      return `</ul>${chunk}`;
    }
    return chunk;
  }).join('') + (inList ? '</ul>' : '');
}

function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
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
  content.className = 'drawer-form modal-form-grid journal-entry-modal';
  const titleField = buildInput({ label: 'Titolo', name: 'title', value: entry?.title ?? '' });
  titleField.classList.add('journal-entry-modal__title-field');

  const metaRow = document.createElement('div');
  metaRow.className = 'modal-form-row journal-entry-modal__meta';
  metaRow.appendChild(titleField);
  metaRow.appendChild(buildInput({
    label: 'Data',
    name: 'entry_date',
    type: 'date',
    value: entry?.entry_date ?? new Date().toISOString().split('T')[0]
  }));
  metaRow.appendChild(buildInput({ label: 'Sessione', name: 'session_no', type: 'number', value: entry?.session_no ?? '' }));
  content.appendChild(metaRow);
  content.appendChild(buildToggleField({ label: 'In evidenza', name: 'is_pinned', checked: Boolean(entry?.is_pinned) }));

  const editorField = buildTextarea({ label: 'Contenuto', name: 'content', value: entry?.content ?? '' });
  editorField.classList.add('journal-entry-modal__content-field');
  const textarea = editorField.querySelector('textarea');
  textarea?.classList.add('journal-entry-modal__textarea');
  content.appendChild(buildEditorToolbar(textarea));
  content.appendChild(editorField);

  const tagWrap = document.createElement('div');
  tagWrap.className = 'tag-selector journal-entry-modal__tag-selector';
  tagWrap.innerHTML = '<span>Tag</span>';
  tags.forEach((tag) => {
    const label = document.createElement('label');
    const isChecked = selectedTags.includes(tag.id);
    label.className = `condition-modal__item journal-entry-modal__tag-item ${isChecked ? 'is-selected' : ''}`;
    label.innerHTML = `
      <span class="condition-modal__item-label"><strong>${tag.name}</strong></span>
      <span class="diceov-toggle condition-modal__toggle">
        <input type="checkbox" name="entry_tag" value="${tag.id}" ${isChecked ? 'checked' : ''} />
        <span class="diceov-toggle-track" aria-hidden="true"></span>
      </span>
    `;
    const checkbox = label.querySelector('input[type="checkbox"]');
    checkbox?.addEventListener('change', () => {
      label.classList.toggle('is-selected', checkbox.checked);
    });
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

function buildToggleField({ label, name, checked = false }) {
  const field = document.createElement('label');
  field.className = 'modal-toggle-field journal-entry-modal__pin-toggle';
  field.innerHTML = `
    <span class="modal-toggle-field__label">${label}</span>
    <span class="diceov-toggle condition-modal__toggle">
      <input type="checkbox" name="${name}" ${checked ? 'checked' : ''} />
      <span class="diceov-toggle-track" aria-hidden="true"></span>
    </span>
  `;
  return field;
}

function buildEditorToolbar(textarea) {
  const tools = [
    { label: 'B', title: 'Grassetto', action: () => wrapSelection(textarea, '**', '**') },
    { label: 'I', title: 'Corsivo', action: () => wrapSelection(textarea, '_', '_') },
    { label: 'H1', title: 'Titolo', action: () => prefixLine(textarea, '# ') },
    { label: '•', title: 'Elenco', action: () => prefixLine(textarea, '- ') },
    { label: '❝', title: 'Citazione', action: () => prefixLine(textarea, '> ') },
    { label: '</>', title: 'Codice inline', action: () => wrapSelection(textarea, '`', '`') },
    { label: '⇥', title: 'Aumenta rientro', action: () => prefixLine(textarea, '  ') },
    { label: '⇤', title: 'Riduci rientro', action: () => unprefixLine(textarea, '  ') }
  ];
  const toolbar = document.createElement('div');
  toolbar.className = 'journal-entry-modal__toolbar';
  tools.forEach((tool) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'icon-button';
    button.title = tool.title;
    button.textContent = tool.label;
    button.addEventListener('click', tool.action);
    toolbar.appendChild(button);
  });
  return toolbar;
}

function wrapSelection(textarea, prefix, suffix) {
  if (!textarea) return;
  textarea.focus();
  const { selectionStart, selectionEnd, value } = textarea;
  const selected = value.slice(selectionStart, selectionEnd);
  textarea.setRangeText(`${prefix}${selected}${suffix}`, selectionStart, selectionEnd, 'end');
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
}

function prefixLine(textarea, prefix) {
  if (!textarea) return;
  textarea.focus();
  const { selectionStart, selectionEnd, value } = textarea;
  const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
  const nextLineBreak = value.indexOf('\n', selectionEnd);
  const lineEnd = nextLineBreak === -1 ? value.length : nextLineBreak;
  const segment = value.slice(lineStart, lineEnd);
  const updated = segment
    .split('\n')
    .map((line) => `${prefix}${line}`)
    .join('\n');
  textarea.setRangeText(updated, lineStart, lineEnd, 'end');
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
}

function unprefixLine(textarea, prefix) {
  if (!textarea) return;
  textarea.focus();
  const { selectionStart, selectionEnd, value } = textarea;
  const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
  const nextLineBreak = value.indexOf('\n', selectionEnd);
  const lineEnd = nextLineBreak === -1 ? value.length : nextLineBreak;
  const segment = value.slice(lineStart, lineEnd);
  const updated = segment
    .split('\n')
    .map((line) => (line.startsWith(prefix) ? line.slice(prefix.length) : line))
    .join('\n');
  textarea.setRangeText(updated, lineStart, lineEnd, 'end');
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
}


async function openQuickAppendModal(entry, onSave) {
  const content = document.createElement('div');
  content.className = 'drawer-form modal-form-grid';
  content.appendChild(buildTextarea({
    label: `Aggiungi testo a "${entry.title || 'Senza titolo'}"`,
    name: 'append_content',
    placeholder: 'Scrivi qui appunti veloci da aggiungere alla voce...'
  }));

  const formData = await openFormModal({
    title: 'Aggiunta rapida al diario',
    submitLabel: 'Aggiungi',
    content
  });

  if (!formData) return;

  const appendContent = String(formData.get('append_content') || '').trim();
  if (!appendContent) {
    createToast('Nessun testo da aggiungere', 'info');
    return;
  }

  const mergedContent = entry.content?.trim()
    ? `${entry.content.trim()}

${appendContent}`
    : appendContent;

  setGlobalLoading(true);
  try {
    await updateEntry(entry.id, {
      user_id: entry.user_id,
      character_id: entry.character_id,
      title: entry.title,
      entry_date: entry.entry_date,
      session_no: entry.session_no,
      is_pinned: entry.is_pinned,
      content: mergedContent
    });
    createToast('Testo aggiunto alla voce');
    await onSave();
  } catch (error) {
    createToast('Errore aggiunta rapida', 'error');
  } finally {
    setGlobalLoading(false);
  }
}

async function openTagModal(character, tags, onSave) {
  const content = document.createElement('div');
  content.className = 'drawer-form modal-form-grid journal-tag-manager';
  content.appendChild(buildInput({ label: 'Nome nuovo tag', name: 'name' }));

  const existing = document.createElement('div');
  existing.className = 'journal-tag-manager__list';
  existing.innerHTML = tags.length
    ? tags.map((tag) => `
      <div class="journal-tag-manager__item">
        <span class="chip">${tag.name}</span>
        <button type="button" class="icon-button icon-button--danger" data-remove-tag="${tag.id}" aria-label="Elimina tag ${tag.name}" title="Elimina tag">
          <span aria-hidden="true">🗑️</span>
        </button>
      </div>
    `).join('')
    : '<p class="muted">Nessun tag disponibile.</p>';
  content.appendChild(existing);

  const formData = await openFormModal({
    title: 'Gestione tag diario',
    submitLabel: 'Crea tag',
    content,
    onOpen: ({ fieldsEl }) => {
      fieldsEl.querySelectorAll('[data-remove-tag]').forEach((button) => {
        button.addEventListener('click', async () => {
          const tagId = button.dataset.removeTag;
          const tag = tags.find((item) => item.id === tagId);
          if (!tag) return;

          setGlobalLoading(true);
          try {
            await unlinkTagFromAllEntries(tagId);
            await deleteTag(tagId);
            createToast('Tag eliminato');
            await onSave();
            document.querySelector('[data-form-cancel]')?.click();
          } catch (error) {
            createToast('Errore eliminazione tag', 'error');
          } finally {
            setGlobalLoading(false);
          }
        });
      });
    }
  });

  if (!formData) return;

  const name = String(formData.get('name') || '').trim();
  if (!name) return;

  try {
    await createTag({ user_id: character.user_id, name });
    createToast('Tag creato');
    onSave();
  } catch (error) {
    createToast('Errore tag', 'error');
  }
}
