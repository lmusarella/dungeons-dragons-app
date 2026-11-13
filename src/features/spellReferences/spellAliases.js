import { navigate } from '../../app/router.js';
import { createToast, openConfirmModal, openFormModal } from '../../ui/components.js';
import { escapeHtml } from '../../lib/html.js';
import { canManageSharedCatalog } from '../library/catalogPermissions.js';
import { openSpellQuickDetailModal } from '../character/home/modals.js';
import { fetchSharedSpellsByIds } from './spellDetailApi.js';
import { clearSpellReference, deleteSpellAlias, importSpellReferences, loadSpellGroups, previewSpellReferences, saveSpellAlias, searchSpellsForAlias, setSpellReference } from './spellAliasesApi.js';
import { KIND_LABELS, OWNER_LABELS, STATUS_LABELS, aliasScope, filterSpellGroups } from './spellAliasesModel.js';
import '../itemAliases/itemAliases.css';

const SCOPE_LABELS = { global: 'Alias globale', specific: 'Voce specifica', import: 'Da importazione', none: '' };
const levelLabel = (level) => (Number(level) === 0 ? 'Trucchetto' : `${level}° livello`);

async function pickSpell({ title, reference, occurrences, current = null, rulesVersion = null }) {
  const content = document.createElement('div');
  content.className = 'ia-picker';
  content.innerHTML = `<p class="ia-picker__ref"><code>${escapeHtml(reference)}</code>${rulesVersion ? ` <em class="ia-badge ia-badge--scope">Edizione ${escapeHtml(rulesVersion)}</em>` : ''}</p>
    <label class="ia-field"><span>Cerca incantesimo${rulesVersion ? ` (prima l’edizione ${escapeHtml(rulesVersion)})` : ''}</span><input type="search" data-ia-query placeholder="Es. Dardo incantato" autocomplete="off"></label>
    ${rulesVersion ? '<label class="ia-field"><span><input type="checkbox" data-ia-other> Mostra anche l’altra edizione (collegamento esplicito)</span></label>' : ''}
    <input type="hidden" name="cross_version" value="">
    <div class="ia-results" data-ia-results role="listbox"><p class="ia-empty">Digita almeno due lettere.</p></div>
    <label class="ia-field"><span>Incantesimo selezionato</span><input type="text" name="spell_label" readonly required value="${escapeHtml(current?.name || '')}" placeholder="Nessuno"></label>
    <input type="hidden" name="shared_spell_id" value="${escapeHtml(current?.id || '')}">
    <p class="ia-preview" data-ia-preview></p>`;
  const query = content.querySelector('[data-ia-query]');
  const results = content.querySelector('[data-ia-results]');
  const label = content.querySelector('[name="spell_label"]');
  const hidden = content.querySelector('[name="shared_spell_id"]');
  const preview = content.querySelector('[data-ia-preview]');
  const showPreview = (spell) => {
    preview.innerHTML = spell ? `<code>${escapeHtml(reference)}</code> → <strong>${escapeHtml(spell.name)}</strong> <small>${escapeHtml(levelLabel(spell.level ?? 0))}${spell.school ? ` · ${escapeHtml(spell.school)}` : ''}</small><br><small>${occurrences} ${occurrences === 1 ? 'riferimento' : 'riferimenti'} interessati · UUID ${escapeHtml(String(spell.id).slice(0, 8))}…</small>` : '';
  };
  showPreview(current);
  let timer;
  let sequence = 0;
  content.querySelector('[data-ia-other]')?.addEventListener('change', () => query.dispatchEvent(new Event('input')));
  query.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      const text = query.value.trim();
      const mine = ++sequence;
      if (text.length < 2) { results.innerHTML = '<p class="ia-empty">Digita almeno due lettere.</p>'; return; }
      try {
        const spells = await searchSpellsForAlias(text, { rulesVersion, includeOther: Boolean(content.querySelector('[data-ia-other]')?.checked) });
        if (mine !== sequence) return;
        results.innerHTML = spells.length
          ? spells.map((spell) => `<button type="button" role="option" data-ia-spell="${escapeHtml(spell.id)}" data-ia-cross="${spell._compatible === false ? '1' : ''}"><strong>${escapeHtml(spell.name)}</strong><small>${escapeHtml(levelLabel(spell.level ?? 0))}${spell.rules_version ? ` · ${escapeHtml(spell.rules_version)}` : ''}${spell._compatible === false ? ' · altra edizione' : ''}</small></button>`).join('')
          : '<p class="ia-empty">Nessun incantesimo trovato.</p>';
        results.querySelectorAll('[data-ia-spell]').forEach((button) => button.addEventListener('click', () => {
          const spell = spells.find((entry) => String(entry.id) === button.dataset.iaSpell);
          if (!spell) return;
          hidden.value = spell.id;
          content.querySelector('[name="cross_version"]').value = spell._compatible === false ? '1' : '';
          label.value = spell.name;
          showPreview(spell);
        }));
      } catch (error) {
        results.innerHTML = `<p class="ia-empty">${escapeHtml(error?.message || 'Ricerca non riuscita')}</p>`;
      }
    }, 250);
  });
  const formData = await openFormModal({ title, content, submitLabel: 'Salva collegamento', cancelLabel: 'Annulla' });
  const id = formData?.get('shared_spell_id') || null;
  return id ? { id, cross: formData.get('cross_version') === '1' } : null;
}

export async function renderSpellAliases(container) {
  const allowed = await canManageSharedCatalog();
  if (!allowed) {
    container.innerHTML = '<section class="ia"><header class="ia__header"><div><small>Amministrazione</small><h1>Associa incantesimi</h1></div></header><p class="ia-empty">Questa sezione è riservata agli amministratori del catalogo.</p><button type="button" class="ia-button" data-ia-back>← Torna al catalogo</button></section>';
    container.querySelector('[data-ia-back]').addEventListener('click', () => navigate('dnd-catalog'));
    return;
  }
  container.innerHTML = `<section class="ia">
    <header class="ia__header"><div><small>Amministrazione</small><h1>Associa incantesimi</h1><p>Collega i riferimenti inglesi presenti nei JSON di classi, sottoclassi, specie e varianti agli incantesimi di <code>shared_spells</code>. I selettori dinamici (<code>choose</code>/<code>all</code>) non compaiono: restano regole, non incantesimi concessi.</p></div>
      <div class="ia-actions"><button type="button" class="ia-button" data-ia-preview>Anteprima estrazione</button><button type="button" class="ia-button" data-ia-import>Importa riferimenti dai JSON</button><button type="button" class="ia-button" data-ia-back>← Catalogo</button></div></header>
    <div class="ia__filters">
      <label><span>Cerca</span><input type="search" data-ia-filter="text" placeholder="Riferimento, incantesimo o provenienza"></label>
      <label><span>Provenienza</span><select data-ia-filter="owner"><option value="">Tutte</option>${Object.entries(OWNER_LABELS).map(([value, text]) => `<option value="${value}">${text}</option>`).join('')}</select></label>
      <label><span>Tipo</span><select data-ia-filter="kind"><option value="">Tutti</option>${Object.entries(KIND_LABELS).map(([value, text]) => `<option value="${value}">${text}</option>`).join('')}</select></label>
      <label><span>Edizione</span><select data-ia-filter="version"><option value="">Tutte</option><option value="2014">2014</option><option value="2024">2024</option></select></label>
      <label><span>Stato</span><select data-ia-filter="status"><option value="">Tutti</option>${Object.entries(STATUS_LABELS).map(([value, text]) => `<option value="${value}">${text}</option>`).join('')}</select></label>
    </div>
    <p class="ia__count" data-ia-count></p>
    <div class="ia__table" data-ia-table><div class="ia-empty">Caricamento…</div></div>
  </section>`;
  container.querySelector('[data-ia-back]').addEventListener('click', () => navigate('dnd-catalog'));
  const table = container.querySelector('[data-ia-table]');
  const count = container.querySelector('[data-ia-count]');
  const state = { groups: [], expanded: new Set(), filters: { text: '', owner: '', kind: '', status: '', version: '' }, diagnostic: '' };

  const load = async () => {
    try {
      const loaded = await loadSpellGroups();
      state.groups = loaded.groups;
      state.diagnostic = loaded.viewRows && !loaded.usableRows
        ? `La vista contiene ${loaded.viewRows} righe ma nessuna è utilizzabile: colonne trovate (${loaded.columns.join(', ')}). Servono i nomi delle colonne per allinearle in spellSchema.js.`
        : (loaded.viewRows === 0 ? 'La vista shared_spell_reference_catalog è vuota: esegui prima “Importa riferimenti dai JSON” (dopo aver applicato db/admin_spell_aliases.sql).' : '');
      render();
    } catch (error) {
      console.error('Riferimenti agli incantesimi non caricati', error);
      table.innerHTML = `<div class="ia-empty">Impossibile caricare i riferimenti: ${escapeHtml(error?.message || 'errore')}. Verifica che la vista shared_spell_reference_catalog esista e che i riferimenti siano stati importati.</div>`;
    }
  };

  const run = async (task, success) => {
    try {
      const result = await task();
      createToast(typeof success === 'function' ? success(result) : success);
      await load();
    } catch (error) {
      console.error('Operazione sulle associazioni incantesimi non riuscita', error);
      const message = error?.code === '42501' ? 'Non hai i permessi per modificare le associazioni.'
        : error?.code === 'PGRST202' ? 'Funzione non trovata: esegui db/admin_spell_aliases.sql su Supabase (dopo aver verificato i nomi delle colonne).'
          : `Operazione non riuscita: ${error?.message || 'errore'}`;
      createToast(message, 'error');
    }
  };

  const originsHtml = (group) => group.origins.map((origin, index) => {
    const scope = aliasScope(group, origin);
    return `<li><span><b>${escapeHtml(OWNER_LABELS[origin.ownerType] || origin.ownerType)}</b> ${escapeHtml(origin.ownerName)}</span>
      <em class="ia-badge">${escapeHtml(KIND_LABELS[origin.kind] || origin.kind)}${origin.mode === 'free' ? ' · senza slot' : ''}${origin.unlockLevel ? ` · liv. ${escapeHtml(origin.unlockLevel)}` : ''}</em>
      <em class="ia-badge ia-badge--${origin.status}">${STATUS_LABELS[origin.status]}</em>${SCOPE_LABELS[scope] ? `<em class="ia-badge ia-badge--scope">${SCOPE_LABELS[scope]}</em>` : ''}
      ${origin.referenceId ? `<button type="button" class="ia-link" data-ia-ref-set="${index}">Solo questa voce…</button>${origin.status === 'linked' ? `<button type="button" class="ia-link" data-ia-ref-clear="${index}">Scollega voce</button>` : ''}` : ''}</li>`;
  }).join('');

  const render = () => {
    const visible = filterSpellGroups(state.groups, state.filters);
    count.textContent = `${visible.length} riferimenti · ${visible.filter((group) => group.status !== 'linked').length} da collegare`;
    if (!visible.length) { table.innerHTML = `<div class="ia-empty">${escapeHtml(state.diagnostic || 'Nessun riferimento corrisponde ai filtri.')}</div>`; return; }
    table.innerHTML = `<table><thead><tr><th>Incantesimo originale</th><th>Provenienza</th><th>Occ.</th><th>Stato</th><th>Incantesimo italiano</th><th></th></tr></thead><tbody>${visible.map((group) => {
      const names = [...new Set(group.origins.map((origin) => `${OWNER_LABELS[origin.ownerType] || origin.ownerType}: ${origin.ownerName}`))];
      const open = state.expanded.has(group.id);
      return `<tr data-ia-group="${escapeHtml(group.id)}"><td><code>${escapeHtml(group.ref)}</code><small>Edizione ${escapeHtml(group.rulesVersion || '—')}${group.versionMismatch ? ' · incantesimo di altra edizione' : ''}</small></td>
        <td>${names.slice(0, 3).map((text) => `<span>${escapeHtml(text)}</span>`).join('')}${names.length > 3 ? `<small>+${names.length - 3} altri</small>` : ''}</td>
        <td>${group.occurrences}</td>
        <td><em class="ia-badge ia-badge--${group.status}">${STATUS_LABELS[group.status]}</em>${group.alias ? '<em class="ia-badge ia-badge--scope">Alias globale</em>' : ''}${group.mixed ? '<em class="ia-badge ia-badge--warn">Eccezioni</em>' : ''}</td>
        <td>${group.spellId ? `<button type="button" class="ia-link" data-ia-detail="${escapeHtml(group.spellId)}">${escapeHtml(group.spellName || 'Apri incantesimo')}</button>` : '—'}</td>
        <td class="ia-actions"><button type="button" class="ia-button ia-button--primary" data-ia-assign>${group.spellId ? 'Modifica' : 'Associa'}</button>${group.alias ? '<button type="button" class="ia-button ia-button--danger" data-ia-remove>Rimuovi</button>' : ''}<button type="button" class="ia-button" data-ia-toggle>${open ? 'Nascondi' : 'Voci'}</button></td></tr>
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
      const [spell] = await fetchSharedSpellsByIds([button.dataset.iaDetail]).catch(() => []);
      if (spell) openSpellQuickDetailModal(null, spell, null, {});
    }));
    table.querySelectorAll('[data-ia-assign]').forEach((button) => button.addEventListener('click', async () => {
      const group = groupFor(button);
      if (!group) return;
      const editing = Boolean(group.spellId);
      const [current] = editing ? await fetchSharedSpellsByIds([group.spellId]).catch(() => []) : [];
      const picked = await pickSpell({ title: editing ? 'Modifica associazione' : 'Associa incantesimo', reference: group.ref, occurrences: group.occurrences, current, rulesVersion: group.rulesVersion });
      if (!picked || picked.id === group.spellId) return;
      const spellId = picked.id;
      if (picked.cross) {
        const confirmedCross = await openConfirmModal({ title: 'Collegare un’altra edizione?', message: `Il riferimento è dell’edizione ${group.rulesVersion} ma l’incantesimo scelto appartiene all’altra edizione. Il collegamento verrà salvato come compatibilità esplicita.`, confirmLabel: 'Collega' });
        if (!confirmedCross) return;
      }
      if (editing) {
        const confirmed = await openConfirmModal({
          title: 'Modificare l’associazione?',
          message: `Il riferimento “${group.ref}” compare in ${group.occurrences} ${group.occurrences === 1 ? 'voce' : 'voci'}: tutte quelle non confermate a mano useranno il nuovo incantesimo.`,
          confirmLabel: 'Modifica'
        });
        if (!confirmed) return;
      }
      await run(() => saveSpellAlias(group.ref, group.rulesVersion, spellId, picked.cross), (result) => `Associazione salvata · ${result?.references_updated ?? 0} riferimenti aggiornati`);
    }));
    table.querySelectorAll('[data-ia-remove]').forEach((button) => button.addEventListener('click', async () => {
      const group = groupFor(button);
      if (!group?.alias) return;
      const confirmed = await openConfirmModal({ title: 'Rimuovere il collegamento?', message: `Verrà rimosso l’alias “${group.ref}”: ${group.occurrences} riferimenti torneranno non collegati, salvo le voci confermate a mano.`, confirmLabel: 'Rimuovi' });
      if (confirmed) await run(() => deleteSpellAlias(group.ref, group.rulesVersion), 'Collegamento rimosso');
    }));
    table.querySelectorAll('[data-ia-ref-set]').forEach((button) => button.addEventListener('click', async () => {
      const group = groupFor(button);
      const origin = group?.origins[Number(button.dataset.iaRefSet)];
      if (!origin?.referenceId) return;
      const picked = await pickSpell({ title: `Solo ${origin.ownerName}`, reference: group.ref, occurrences: 1, rulesVersion: group.rulesVersion });
      if (picked) await run(() => setSpellReference(origin.referenceId, picked.id, picked.cross), 'Voce collegata: le altre occorrenze non sono cambiate');
    }));
    table.querySelectorAll('[data-ia-ref-clear]').forEach((button) => button.addEventListener('click', async () => {
      const group = groupFor(button);
      const origin = group?.origins[Number(button.dataset.iaRefClear)];
      if (!origin?.referenceId) return;
      const confirmed = await openConfirmModal({ title: 'Scollegare la voce?', message: `La voce di ${origin.ownerName} tornerà non collegata.`, confirmLabel: 'Scollega' });
      if (confirmed) await run(() => clearSpellReference(origin.referenceId), 'Voce scollegata');
    }));
  };

  container.querySelector('[data-ia-preview]').addEventListener('click', async (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    try {
      const preview = await previewSpellReferences();
      console.table(preview.byOwner);
      console.table(preview.bySlug);
      if (preview.errors.length) console.error('Errori di lettura', preview.errors);
      const slugs = Object.entries(preview.bySlug).map(([slug, info]) => `${slug}: ${info.spells} incantesimi`).join(' · ');
      createToast(`Anteprima: ${preview.total} riferimenti totali. ${slugs}${preview.errors.length ? ` · errori: ${preview.errors.join('; ')}` : ''}`, preview.errors.length ? 'error' : 'info');
    } catch (error) {
      console.error('Anteprima non riuscita', error);
      createToast(`Anteprima non riuscita: ${error?.message || 'errore'}`, 'error');
    }
    button.disabled = false;
  });

  container.querySelector('[data-ia-import]').addEventListener('click', async (event) => {
    const button = event.currentTarget;
    const confirmed = await openConfirmModal({ title: 'Importare i riferimenti?', message: 'Legge i JSON di classi, sottoclassi, specie, varianti e privilegi ed estrae i riferimenti agli incantesimi. L’operazione è ripetibile: non duplica e non tocca i collegamenti manuali.', confirmLabel: 'Importa' });
    if (!confirmed) return;
    button.disabled = true;
    await run(() => importSpellReferences(), (result) => `Importazione completata · ${result.extracted} riferimenti letti, ${result.inserted} nuovi, ${result.updated} aggiornati`);
    button.disabled = false;
  });

  container.querySelectorAll('[data-ia-filter]').forEach((control) => control.addEventListener(control.tagName === 'INPUT' ? 'input' : 'change', () => {
    state.filters[control.dataset.iaFilter] = control.value;
    render();
  }));
  await load();
}
