import { createCompanion, deleteCompanion, fetchCompanions, updateCompanion } from '../character/companionsApi.js';
import { getState, normalizeCharacterId } from '../../app/state.js';
import { buildInput, buildTextarea, createToast, openConfirmModal, openFormModal, setGlobalLoading } from '../../ui/components.js';

const KIND_OPTIONS = [
  { value: 'familiar', label: 'Famiglio' },
  { value: 'summon', label: 'Evocazione' },
  { value: 'transformation', label: 'Trasformazione' }
];

export async function renderFamiliars(container) {
  const state = getState();
  const normalizedActiveId = normalizeCharacterId(state.activeCharacterId);
  const activeCharacter = state.characters.find((char) => normalizeCharacterId(char.id) === normalizedActiveId);
  if (!activeCharacter) {
    container.innerHTML = '<section class="card"><p>Nessun personaggio selezionato.</p></section>';
    return;
  }

  setGlobalLoading(true);
  let companions = [];
  try {
    companions = state.offline ? [] : await fetchCompanions(activeCharacter.id);
  } catch (error) {
    createToast('Errore caricamento famigli', 'error');
  } finally {
    setGlobalLoading(false);
  }

  container.innerHTML = `
    <section class="card inventory-main">
      <header class="card-header">
        <p class="eyebrow">Famigli & Evocazioni</p>
        <div class="button-row">
          <button class="icon-button icon-button--add" type="button" data-add-companion aria-label="Nuovo famiglio"><span aria-hidden="true">+</span></button>
        </div>
      </header>
      <div class="character-card-grid" data-companion-list>
        ${companions.length ? companions.map((entry) => `
          <article class="character-card">
            <div class="character-card-info">
              <h3>${entry.name}</h3>
              <p class="muted">${entry.kind} · ${entry.rules_version || '-'} ${entry.is_active ? '· Attivo' : ''}</p>
              <div class="button-row">
                <button class="icon-button" data-edit-companion="${entry.id}" type="button" aria-label="Modifica">✏️</button>
                <button class="icon-button" data-delete-companion="${entry.id}" type="button" aria-label="Elimina">🗑️</button>
              </div>
            </div>
          </article>
        `).join('') : '<p>Nessun famiglio/evocazione presente.</p>'}
      </div>
    </section>
  `;

  const openCompanionForm = async (companion = null) => {
    const content = document.createElement('div');
    content.className = 'modal-form-grid';
    content.appendChild(buildInput({ label: 'Nome', name: 'name', value: companion?.name || '' }));
    const kindField = document.createElement('label');
    kindField.className = 'field';
    kindField.innerHTML = '<span>Tipologia</span>';
    const kindSelect = document.createElement('select');
    kindSelect.name = 'kind';
    KIND_OPTIONS.forEach((opt) => {
      const o = document.createElement('option');
      o.value = opt.value;
      o.textContent = opt.label;
      if ((companion?.kind || 'familiar') === opt.value) o.selected = true;
      kindSelect.appendChild(o);
    });
    kindField.appendChild(kindSelect);
    content.appendChild(kindField);
    content.appendChild(buildInput({ label: 'Versione regole', name: 'rules_version', value: companion?.rules_version || '2024' }));
    content.appendChild(buildTextarea({ label: 'Stat block (JSON)', name: 'stat_block', value: JSON.stringify(companion?.stat_block || {}, null, 2) }));
    content.appendChild(buildTextarea({ label: 'Note', name: 'notes', value: companion?.notes || '' }));
    const formData = await openFormModal({ title: companion ? 'Modifica scheda' : 'Nuova scheda', submitLabel: 'Salva', content, cardClass: 'modal-card--form' });
    if (!formData) return;
    const payload = {
      user_id: activeCharacter.user_id,
      character_id: activeCharacter.id,
      name: String(formData.get('name') || '').trim(),
      kind: formData.get('kind') || 'familiar',
      rules_version: String(formData.get('rules_version') || '2024').trim(),
      stat_block: JSON.parse(String(formData.get('stat_block') || '{}')),
      notes: String(formData.get('notes') || '').trim() || null
    };
    if (!payload.name) {
      createToast('Inserisci un nome', 'error');
      return;
    }
    if (companion) {
      await updateCompanion(companion.id, payload);
    } else {
      await createCompanion(payload);
    }
    await renderFamiliars(container);
  };

  container.querySelector('[data-add-companion]')?.addEventListener('click', () => { void openCompanionForm(); });
  container.querySelectorAll('[data-edit-companion]').forEach((btn) => btn.addEventListener('click', () => {
    const companion = companions.find((entry) => entry.id === btn.dataset.editCompanion);
    if (companion) void openCompanionForm(companion);
  }));
  container.querySelectorAll('[data-delete-companion]').forEach((btn) => btn.addEventListener('click', async () => {
    const companion = companions.find((entry) => entry.id === btn.dataset.deleteCompanion);
    if (!companion) return;
    const ok = await openConfirmModal({ title: 'Conferma eliminazione', message: `Eliminare ${companion.name}?`, confirmLabel: 'Elimina' });
    if (!ok) return;
    await deleteCompanion(companion.id);
    await renderFamiliars(container);
  }));
}
