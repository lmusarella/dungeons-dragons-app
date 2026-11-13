import { navigate } from '../../app/router.js';
import { createToast, openConfirmModal, openFormModal } from '../../ui/components.js';
import { escapeHtml } from '../../lib/html.js';
import { canManageSharedCatalog } from '../library/catalogPermissions.js';
import { getSharedItemsByIds } from '../library/itemLibraryApi.js';
import { openEquipmentItemDetail } from '../character/home/itemDetail.js';
import { clearEntryItem, deleteAlias, loadReferenceGroups, saveAlias, searchItemsForAlias, setEntryItem } from './itemAliasesApi.js';
import { SOURCE_LABELS, STATUS_LABELS, aliasScope, filterGroups, summarizeOrigins } from './itemAliasesModel.js';
import './itemAliases.css';

const SCOPE_LABELS = { global: 'Alias globale', specific: 'Voce specifica', import: 'Da importazione', none: '' };
const SYSTEM_LABELS = { '5etools': '5etools · classi e background', dnd5eapi: 'dnd5eapi · contenuti dei kit' };

/** Finestra con ricerca/autocomplete e anteprima: restituisce l'oggetto scelto (UUID) o null. */
async function pickItem({ title, reference, system, occurrences, current = null }) {
  const content = document.createElement('div');
  content.className = 'ia-picker';
  content.innerHTML = `<p class="ia-picker__ref"><code>${escapeHtml(reference)}</code> <small>${escapeHtml(SYSTEM_LABELS[system] || system)}</small></p>
    <label class="ia-field"><span>Cerca oggetto italiano</span><input type="search" data-ia-query placeholder="Es. Torcia" autocomplete="off"></label>
    <div class="ia-results" data-ia-results role="listbox"><p class="ia-empty">Digita almeno due lettere.</p></div>
    <label class="ia-field"><span>Oggetto selezionato</span><input type="text" name="shared_item_id_label" readonly required value="${escapeHtml(current?.name || '')}" placeholder="Nessuno"></label>
    <input type="hidden" name="shared_item_id" value="${escapeHtml(current?.id || '')}">
    <p class="ia-preview" data-ia-preview></p>`;
  const query = content.querySelector('[data-ia-query]');
  const results = content.querySelector('[data-ia-results]');
  const label = content.querySelector('[name="shared_item_id_label"]');
  const hidden = content.querySelector('[name="shared_item_id"]');
  const preview = content.querySelector('[data-ia-preview]');
  const showPreview = (item) => {
    preview.innerHTML = item ? `<code>${escapeHtml(reference)}</code> → <strong>${escapeHtml(item.name)}</strong> <small>${escapeHtml(item.category || '')}</small><br><small>${occurrences} ${occurrences === 1 ? 'riferimento' : 'riferimenti'} interessati · UUID ${escapeHtml(String(item.id).slice(0, 8))}…</small>` : '';
  };
  showPreview(current);
  let timer;
  let sequence = 0;
  query.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      const text = query.value.trim();
      const current = ++sequence;
      if (text.length < 2) { results.innerHTML = '<p class="ia-empty">Digita almeno due lettere.</p>'; return; }
      try {
        const items = await searchItemsForAlias(text);
        if (current !== sequence) return;
        results.innerHTML = items.length
          ? items.map((item) => `<button type="button" role="option" data-ia-item="${escapeHtml(item.id)}"><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.category || '')}</small></button>`).join('')
          : '<p class="ia-empty">Nessun oggetto trovato.</p>';
        results.querySelectorAll('[data-ia-item]').forEach((button) => button.addEventListener('click', () => {
          const item = items.find((entry) => String(entry.id) === button.dataset.iaItem);
          if (!item) return;
          hidden.value = item.id;
          label.value = item.name;
          showPreview(item);
        }));
      } catch (error) {
        results.innerHTML = `<p class="ia-empty">${escapeHtml(error?.message || 'Ricerca non riuscita')}</p>`;
      }
    }, 250);
  });
  const formData = await openFormModal({ title, content, submitLabel: 'Salva collegamento', cancelLabel: 'Annulla' });
  return formData?.get('shared_item_id') || null;
}

export async function renderItemAliases(container) {
  const allowed = await canManageSharedCatalog();
  if (!allowed) {
    container.innerHTML = '<section class="ia"><header class="ia__header"><div><small>Amministrazione</small><h1>Associazioni oggetti</h1></div></header><p class="ia-empty">Questa sezione è riservata agli amministratori del catalogo.</p><button type="button" class="ia-button" data-ia-back>← Torna al catalogo</button></section>';
    container.querySelector('[data-ia-back]').addEventListener('click', () => navigate('dnd-catalog'));
    return;
  }
  container.innerHTML = `<section class="ia">
    <header class="ia__header"><div><small>Amministrazione</small><h1>Associazioni oggetti</h1><p>Collega i riferimenti originali inglesi agli oggetti italiani di <code>shared_items</code>. Le modifiche valgono subito per compendio, creazione guidata ed equipaggiamento iniziale.</p></div><button type="button" class="ia-button" data-ia-back>← Catalogo</button></header>
    <div class="ia__filters">
      <label><span>Cerca</span><input type="search" data-ia-filter="text" placeholder="Riferimento, oggetto o provenienza"></label>
      <label><span>Fonte</span><select data-ia-filter="source"><option value="">Tutte</option>${Object.entries(SOURCE_LABELS).map(([value, text]) => `<option value="${value}">${text}</option>`).join('')}</select></label>
      <label><span>Stato</span><select data-ia-filter="status"><option value="">Tutti</option>${Object.entries(STATUS_LABELS).map(([value, text]) => `<option value="${value}">${text}</option>`).join('')}</select></label>
      <label><span>Categoria</span><select data-ia-filter="category"><option value="">Tutte</option></select></label>
    </div>
    <p class="ia__count" data-ia-count></p>
    <div class="ia__table" data-ia-table><div class="ia-empty">Caricamento…</div></div>
  </section>`;
  container.querySelector('[data-ia-back]').addEventListener('click', () => navigate('dnd-catalog'));
  const table = container.querySelector('[data-ia-table]');
  const count = container.querySelector('[data-ia-count]');
  const state = { groups: [], expanded: new Set(), filters: { text: '', source: '', status: '', category: '' } };

  const load = async () => {
    try {
      const { groups } = await loadReferenceGroups();
      state.groups = groups;
      const categorySelect = container.querySelector('[data-ia-filter="category"]');
      const categories = [...new Set(groups.map((group) => group.category).filter(Boolean))].sort();
      categorySelect.replaceChildren(new Option('Tutte', ''), ...categories.map((value) => new Option(value, value)));
      categorySelect.value = categories.includes(state.filters.category) ? state.filters.category : '';
      render();
    } catch (error) {
      console.error('Riferimenti non caricati', error);
      table.innerHTML = `<div class="ia-empty">Impossibile caricare i riferimenti: ${escapeHtml(error?.message || 'errore')}</div>`;
    }
  };

  const run = async (task, success) => {
    try {
      const result = await task();
      createToast(typeof success === 'function' ? success(result) : success);
      await load();
    } catch (error) {
      console.error('Operazione sulle associazioni non riuscita', error);
      const message = error?.code === '42501' ? 'Non hai i permessi per modificare le associazioni.'
        : error?.code === 'PGRST202' ? 'Funzione non trovata: esegui db/admin_item_aliases.sql su Supabase (poi ricarica lo schema).'
          : `Operazione non riuscita: ${error?.message || 'errore'}`;
      createToast(message, 'error');
    }
  };

  const originsHtml = (group) => group.origins.map((origin, index) => {
    const scope = aliasScope(group, origin);
    const editable = group.system === '5etools' && origin.entryId;
    return `<li><span><b>${escapeHtml(SOURCE_LABELS[origin.kind])}</b> ${escapeHtml(origin.ownerName)}</span>
      <em class="ia-badge ia-badge--${origin.status}">${STATUS_LABELS[origin.status]}</em>${SCOPE_LABELS[scope] ? `<em class="ia-badge ia-badge--scope">${SCOPE_LABELS[scope]}</em>` : ''}
      ${editable ? `<button type="button" class="ia-link" data-ia-entry-set="${index}">Solo questa voce…</button>${scope === 'specific' || origin.status === 'linked' ? `<button type="button" class="ia-link" data-ia-entry-clear="${index}">Scollega voce</button>` : ''}` : ''}</li>`;
  }).join('');

  const render = () => {
    const visible = filterGroups(state.groups, state.filters);
    count.textContent = `${visible.length} riferimenti · ${visible.filter((group) => group.status !== 'linked').length} da collegare`;
    if (!visible.length) { table.innerHTML = '<div class="ia-empty">Nessun riferimento corrisponde ai filtri.</div>'; return; }
    table.innerHTML = `<table><thead><tr><th>Riferimento originale</th><th>Provenienza</th><th>Occ.</th><th>Stato</th><th>Oggetto italiano</th><th></th></tr></thead><tbody>${visible.map((group) => {
      const summary = summarizeOrigins(group);
      const open = state.expanded.has(group.id);
      return `<tr data-ia-group="${escapeHtml(group.id)}"><td><code>${escapeHtml(group.ref)}</code><small>${escapeHtml(SYSTEM_LABELS[group.system] || group.system)}</small></td>
        <td>${summary.shown.map((text) => `<span>${escapeHtml(text)}</span>`).join('')}${summary.more ? `<small>+${summary.more} altri</small>` : ''}</td>
        <td>${group.occurrences}</td>
        <td><em class="ia-badge ia-badge--${group.status}">${STATUS_LABELS[group.status]}</em>${group.alias ? '<em class="ia-badge ia-badge--scope">Alias globale</em>' : ''}${group.mixed ? '<em class="ia-badge ia-badge--warn">Eccezioni</em>' : ''}</td>
        <td>${group.itemId ? `<button type="button" class="ia-link" data-ia-detail="${escapeHtml(group.itemId)}">${escapeHtml(group.itemName || 'Apri oggetto')}</button>` : '—'}</td>
        <td class="ia-actions"><button type="button" class="ia-button ia-button--primary" data-ia-assign>${group.itemId ? 'Modifica' : 'Associa'}</button>${group.alias ? '<button type="button" class="ia-button ia-button--danger" data-ia-remove>Rimuovi</button>' : ''}${group.origins.length ? `<button type="button" class="ia-button" data-ia-toggle>${open ? 'Nascondi' : 'Voci'}</button>` : ''}</td></tr>
        ${open ? `<tr class="ia-origins" data-ia-group="${escapeHtml(group.id)}"><td colspan="6"><ul>${originsHtml(group)}</ul></td></tr>` : ''}`;
    }).join('')}</tbody></table>`;
    bind(visible);
  };

  const bind = (visible) => {
    const groupFor = (element) => visible.find((group) => group.id === element.closest('tr[data-ia-group]')?.dataset.iaGroup);
    table.querySelectorAll('[data-ia-toggle]').forEach((button) => button.addEventListener('click', () => {
      const group = groupFor(button);
      if (!group) return;
      if (state.expanded.has(group.id)) state.expanded.delete(group.id); else state.expanded.add(group.id);
      render();
    }));
    table.querySelectorAll('[data-ia-detail]').forEach((button) => button.addEventListener('click', async () => {
      const [item] = await getSharedItemsByIds([button.dataset.iaDetail]).catch(() => []);
      if (item) void openEquipmentItemDetail(item, { catalogMode: true });
    }));
    table.querySelectorAll('[data-ia-assign]').forEach((button) => button.addEventListener('click', async () => {
      const group = groupFor(button);
      if (!group) return;
      const editing = Boolean(group.itemId);
      const [current] = editing ? await getSharedItemsByIds([group.itemId]).catch(() => []) : [];
      const itemId = await pickItem({ title: editing ? 'Modifica associazione' : 'Associa oggetto', reference: group.ref, system: group.system, occurrences: group.occurrences, current });
      if (!itemId || itemId === group.itemId) return;
      if (editing) {
        const confirmed = await openConfirmModal({
          title: 'Modificare l’associazione?',
          message: `Il riferimento “${group.ref}” compare in ${group.occurrences} ${group.occurrences === 1 ? 'voce' : 'voci'}: tutte quelle non confermate a mano useranno il nuovo oggetto.`,
          confirmLabel: 'Modifica'
        });
        if (!confirmed) return;
      }
      await run(() => saveAlias(group.system, group.ref, itemId), (result) => (group.system === '5etools'
        ? `Associazione salvata · ${result?.entries_updated ?? 0} voci di equipaggiamento aggiornate`
        : 'Associazione salvata · i contenuti dei kit si aggiornano automaticamente'));
    }));
    table.querySelectorAll('[data-ia-remove]').forEach((button) => button.addEventListener('click', async () => {
      const group = groupFor(button);
      if (!group?.alias) return;
      const confirmed = await openConfirmModal({
        title: 'Rimuovere il collegamento?',
        message: `Verrà rimosso l’alias “${group.ref}”. ${group.occurrences} ${group.occurrences === 1 ? 'riferimento tornerà' : 'riferimenti torneranno'} non collegat${group.occurrences === 1 ? 'o' : 'i'}, salvo le voci confermate a mano.`,
        confirmLabel: 'Rimuovi'
      });
      if (!confirmed) return;
      await run(() => deleteAlias(group.system, group.ref), 'Collegamento rimosso');
    }));
    table.querySelectorAll('[data-ia-entry-set]').forEach((button) => button.addEventListener('click', async () => {
      const group = groupFor(button);
      const origin = group?.origins[Number(button.dataset.iaEntrySet)];
      if (!origin?.entryId) return;
      const itemId = await pickItem({ title: `Solo ${origin.ownerName}`, reference: group.ref, system: group.system, occurrences: 1 });
      if (itemId) await run(() => setEntryItem(origin.entryId, itemId), 'Voce collegata: le altre occorrenze non sono cambiate');
    }));
    table.querySelectorAll('[data-ia-entry-clear]').forEach((button) => button.addEventListener('click', async () => {
      const group = groupFor(button);
      const origin = group?.origins[Number(button.dataset.iaEntryClear)];
      if (!origin?.entryId) return;
      const confirmed = await openConfirmModal({ title: 'Scollegare la voce?', message: `La voce di ${origin.ownerName} tornerà non collegata.`, confirmLabel: 'Scollega' });
      if (confirmed) await run(() => clearEntryItem(origin.entryId), 'Voce scollegata');
    }));
  };

  container.querySelectorAll('[data-ia-filter]').forEach((control) => control.addEventListener(control.tagName === 'INPUT' ? 'input' : 'change', () => {
    state.filters[control.dataset.iaFilter] = control.value;
    render();
  }));
  await load();
}
