import { canManageSharedCatalog } from '../library/catalogPermissions.js';
import { createToast, openConfirmModal } from '../../ui/components.js';
import { escapeHtml, sanitizeImageUrl } from '../../lib/html.js';
import { CATALOG_GROUPS, FIELD_META, RULES_VERSIONS, getCatalog } from './catalogConfig.js';
import {
  createCatalogRecord,
  deleteCatalogRecord,
  getClassFeatureGrants,
  getFeatureOrigins,
  normalizeCatalogError,
  searchCatalog,
  updateCatalogRecord
} from './catalogApi.js';
import '../library/library.css';
import './dndCatalog.css';

const PAGE_SIZE = 18;

function slugify(value = '') {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function displayValue(value) {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Sì' : 'No';
  if (Array.isArray(value)) return value.join(', ') || '—';
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
}

function fieldLabel(key) {
  return FIELD_META[key]?.label || key.replaceAll('_', ' ');
}

const TECHNICAL_FIELDS = new Set(['id', 'created_by', 'created_at', 'updated_at', 'slug', 'name', 'rules_version', 'description', 'image_url']);

function flattenStructuredData(value, prefix = '') {
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([key, entry]) => {
    const label = prefix ? `${prefix} · ${fieldLabel(key)}` : fieldLabel(key);
    if (entry && typeof entry === 'object' && !Array.isArray(entry)) return flattenStructuredData(entry, label);
    return [[label, displayValue(entry)]];
  });
}

function dataRows(item, catalog) {
  const preferred = (catalog.fields || []).filter((key) => !['description', 'image_url'].includes(key));
  const remaining = Object.keys(item).filter((key) => !TECHNICAL_FIELDS.has(key) && !preferred.includes(key));
  return [...preferred, ...remaining].flatMap((key) => {
    const value = item[key];
    if (value === null || value === undefined || value === '') return [];
    if (value && typeof value === 'object' && !Array.isArray(value)) return flattenStructuredData(value, fieldLabel(key));
    return [[fieldLabel(key), displayValue(value)]];
  });
}

function fieldInput(key, value = '') {
  const meta = FIELD_META[key] || {};
  const safeValue = escapeHtml(value ?? '');
  if (meta.type === 'textarea') {
    return `<label class="dnd-catalog-form__wide"><span>${escapeHtml(meta.label)}</span><textarea name="${key}" rows="5" placeholder="${escapeHtml(meta.placeholder || '')}">${safeValue}</textarea></label>`;
  }
  if (meta.type === 'json') {
    const jsonValue = value && typeof value === 'object' ? JSON.stringify(value, null, 2) : value || '';
    return `<label class="dnd-catalog-form__wide"><span>${escapeHtml(meta.label)}</span><textarea name="${key}" rows="7" spellcheck="false" placeholder="${escapeHtml(meta.placeholder || '')}">${escapeHtml(jsonValue)}</textarea><small>JSON avanzato opzionale; lascia vuoto per nessuna meccanica aggiuntiva.</small></label>`;
  }
  if (meta.type === 'checkbox') {
    return `<label class="dnd-catalog-check"><input type="checkbox" name="${key}" ${value ? 'checked' : ''}><span>${escapeHtml(meta.label)}</span></label>`;
  }
  return `<label><span>${escapeHtml(meta.label || key)}</span><input name="${key}" type="${meta.type || 'text'}" value="${safeValue}" placeholder="${escapeHtml(meta.placeholder || '')}"></label>`;
}

function card(catalog, item) {
  const image = sanitizeImageUrl(item.image_url);
  const subtitle = item.category || item.creature_type || item.source || catalog.singular;
  return `<article class="dnd-catalog-card" data-catalog-record="${escapeHtml(item.id)}" tabindex="0" role="button">
    <div class="dnd-catalog-card__media">${image ? `<img src="${image}" alt="">` : `<span aria-hidden="true">${catalog.icon}</span>`}</div>
    <div class="dnd-catalog-card__body">
      <div class="dnd-catalog-card__meta"><span>${escapeHtml(subtitle)}</span><b>${escapeHtml(item.rules_version || '—')}</b></div>
      <h3>${escapeHtml(item.name || 'Senza nome')}</h3>
      <p>${escapeHtml(item.description || catalog.description)}</p>
    </div>
  </article>`;
}

function modalShell(content, className = '') {
  const backdrop = document.createElement('div');
  backdrop.className = `dnd-catalog-modal ${className}`;
  backdrop.innerHTML = `<div class="dnd-catalog-modal__backdrop" data-modal-close></div><section class="dnd-catalog-modal__panel" role="dialog" aria-modal="true">${content}</section>`;
  document.body.appendChild(backdrop);
  const close = () => backdrop.remove();
  backdrop.querySelectorAll('[data-modal-close]').forEach((button) => button.addEventListener('click', close));
  const onKey = (event) => {
    if (event.key !== 'Escape') return;
    document.removeEventListener('keydown', onKey);
    close();
  };
  document.addEventListener('keydown', onKey);
  return { backdrop, close };
}

async function openRecordDetail(catalog, item, canManage, callbacks) {
  const rows = dataRows(item, catalog);
  const image = sanitizeImageUrl(item.image_url);
  const { backdrop, close } = modalShell(`
    <header class="dnd-catalog-detail__header">
      <div>${image ? `<img src="${image}" alt="">` : `<span class="dnd-catalog-detail__icon">${catalog.icon}</span>`}</div>
      <section><small>${escapeHtml(catalog.singular)} · Regole ${escapeHtml(item.rules_version || '—')}</small><h2>${escapeHtml(item.name || 'Senza nome')}</h2><p>${escapeHtml(item.source || 'Fonte non indicata')}</p></section>
      <button type="button" class="dnd-catalog-modal__close" data-modal-close aria-label="Chiudi">×</button>
    </header>
    <div class="dnd-catalog-detail__content">
      ${item.description ? `<section><h3>Descrizione</h3><p class="dnd-catalog-detail__description">${escapeHtml(item.description)}</p></section>` : ''}
      <section><h3>Dati completi</h3><dl>${rows.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('') || '<p class="muted">Nessun dato aggiuntivo.</p>'}</dl></section>
      <section class="dnd-catalog-detail__relations"><h3>${catalog.key === 'features' ? 'Concesso da' : 'Privilegi e abilità collegate'}</h3><div data-record-relations><div class="dnd-catalog-inline-loader"><span></span>Caricamento collegamenti…</div></div></section>
    </div>
    ${canManage ? `<footer class="dnd-catalog-modal__actions"><button type="button" data-record-delete class="danger">Elimina</button><button type="button" data-record-edit class="primary">Modifica</button></footer>` : ''}
  `, 'dnd-catalog-detail');
  backdrop.querySelector('[data-record-edit]')?.addEventListener('click', () => { close(); callbacks.edit(item, catalog); });
  backdrop.querySelector('[data-record-delete]')?.addEventListener('click', async () => { close(); await callbacks.remove(item, catalog); });
  const relations = backdrop.querySelector('[data-record-relations]');
  try {
    if (catalog.key === 'classes') {
      const grants = await getClassFeatureGrants(item.id);
      relations.innerHTML = grants.length ? `<div class="dnd-catalog-level-list">${grants.map((grant) => `
        <button type="button" data-linked-feature="${escapeHtml(grant.feature?.id || '')}">
          <span class="dnd-catalog-level-badge">Livello ${escapeHtml(grant.unlock_level || '—')}</span>
          <span><strong>${escapeHtml(grant.feature?.name || 'Privilegio non disponibile')}</strong><small>${escapeHtml(grant.feature?.category || grant.notes || 'Privilegio automatico')}</small></span>
          <b>›</b>
        </button>`).join('')}</div>` : '<p class="dnd-catalog-no-relations">Nessun privilegio collegato a questa classe.</p>';
      relations.querySelectorAll('[data-linked-feature]').forEach((button) => button.addEventListener('click', () => {
        const grant = grants.find((entry) => String(entry.feature?.id) === button.dataset.linkedFeature);
        if (!grant?.feature) return;
        close();
        void openRecordDetail(getCatalog('features'), grant.feature, canManage, callbacks);
      }));
    } else if (catalog.key === 'features') {
      const origins = await getFeatureOrigins(item.id);
      relations.innerHTML = origins.length ? `<div class="dnd-catalog-origin-list">${origins.map((grant) => `<div><span>${escapeHtml(grant.origin?.type || 'Origine')}</span><strong>${escapeHtml(grant.origin?.name || 'Record non disponibile')}</strong><small>${grant.unlock_level ? `Livello ${escapeHtml(grant.unlock_level)} · ` : ''}${escapeHtml(grant.level_scope === 'class' ? 'livello di classe' : 'livello personaggio')}</small></div>`).join('')}</div>` : '<p class="dnd-catalog-no-relations">Questa abilità non è ancora collegata a classi o altre origini.</p>';
    } else {
      relations.innerHTML = '<p class="dnd-catalog-no-relations">Nessun collegamento visualizzabile per questo elemento.</p>';
    }
  } catch (error) {
    relations.innerHTML = `<p class="dnd-catalog-relations-error">${escapeHtml(normalizeCatalogError(error))}</p>`;
  }
}

function openRecordForm(catalog, item, onSave) {
  const editing = Boolean(item?.id);
  const fields = catalog.fields || [];
  const { backdrop, close } = modalShell(`
    <form class="dnd-catalog-form">
      <header><div><small>${editing ? 'Modifica' : 'Nuovo contenuto'}</small><h2>${escapeHtml(catalog.singular)}</h2></div><button type="button" class="dnd-catalog-modal__close" data-modal-close aria-label="Chiudi">×</button></header>
      <div class="dnd-catalog-form__grid">
        <label><span>Nome *</span><input name="name" value="${escapeHtml(item?.name || '')}" required autocomplete="off"></label>
        <label><span>Versione *</span><select name="rules_version" required>${RULES_VERSIONS.map((version) => `<option value="${version}" ${String(item?.rules_version || '2024') === version ? 'selected' : ''}>${version}</option>`).join('')}</select></label>
        ${fields.map((key) => fieldInput(key, item?.[key])).join('')}
      </div>
      <p class="dnd-catalog-form__error" data-form-error hidden></p>
      <footer><button type="button" data-modal-close>Annulla</button><button class="primary" type="submit">${editing ? 'Salva modifiche' : 'Crea elemento'}</button></footer>
    </form>`);
  const form = backdrop.querySelector('form');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submit = form.querySelector('[type="submit"]');
    const errorBox = form.querySelector('[data-form-error]');
    submit.disabled = true;
    errorBox.hidden = true;
    const data = new FormData(form);
    const payload = { name: String(data.get('name') || '').trim(), rules_version: data.get('rules_version') };
    payload.slug = slugify(payload.name);
    let invalidJson = false;
    fields.forEach((key) => {
      const meta = FIELD_META[key] || {};
      if (meta.type === 'checkbox') payload[key] = form.elements[key].checked;
      else if (meta.type === 'number') payload[key] = data.get(key) === '' ? null : Number(data.get(key));
      else if (meta.type === 'json') {
        const raw = String(data.get(key) || '').trim();
        if (!raw) payload[key] = {};
        else {
          try { payload[key] = JSON.parse(raw); }
          catch { invalidJson = true; }
        }
      }
      else payload[key] = String(data.get(key) || '').trim() || null;
    });
    if (invalidJson) {
      errorBox.textContent = 'Il campo Meccaniche non contiene un JSON valido.';
      errorBox.hidden = false;
      submit.disabled = false;
      return;
    }
    try {
      await onSave(payload);
      close();
    } catch (error) {
      errorBox.textContent = normalizeCatalogError(error);
      errorBox.hidden = false;
      submit.disabled = false;
    }
  });
  form.elements.name?.focus();
}

export async function renderDndCatalog(container) {
  const canManage = await canManageSharedCatalog();
  container.innerHTML = `<section class="auth-screen character-select-view library-view dnd-catalog-view">
    <div class="card character-select-card library-shell library-shell--refined dnd-catalog-shell">
    <header class="character-select-header library-hero library-hero--refined dnd-catalog-hero">
      <div class="library-hero__copy"><span class="library-hero__icon" aria-hidden="true">♜</span><div><span class="library-hero__eyebrow">Compendio condiviso</span><h1 class="title-car-select">Catalogo D&amp;D</h1><p>Contenuti 2014 e 2024 centralizzati, collegabili e senza duplicazioni.</p></div></div>
      <div class="library-hero__actions"><span class="${canManage ? 'dnd-catalog-admin' : 'library-readonly-badge'}">${canManage ? 'Modalità amministrazione' : '<span aria-hidden="true">◈</span> Catalogo in consultazione'}</span></div>
    </header>
    <div class="dnd-catalog-layout">
      <aside class="dnd-catalog-nav" aria-label="Cataloghi D&D">
        ${CATALOG_GROUPS.map((group) => `<section><h2>${group.label}</h2>${group.entries.map((entry, index) => `<button type="button" data-catalog-key="${entry.key}" ${group === CATALOG_GROUPS[0] && index === 0 ? 'class="is-active"' : ''}><span>${entry.icon}</span><strong>${entry.label}</strong></button>`).join('')}</section>`).join('')}
      </aside>
      <main class="dnd-catalog-main">
        <header class="dnd-catalog-section-header"><div><small data-catalog-kicker></small><h2 data-catalog-title></h2><p data-catalog-description></p></div><button type="button" class="primary" data-catalog-create ${canManage ? '' : 'hidden'}>＋ Nuovo</button></header>
        <div class="dnd-catalog-filters"><label><span>Cerca</span><input type="search" data-catalog-search placeholder="Cerca per nome…"></label><label><span>Versione</span><select data-catalog-version><option value="">2014 e 2024</option><option>2014</option><option>2024</option></select></label></div>
        <div class="dnd-catalog-status" data-catalog-status></div>
        <div class="dnd-catalog-grid" data-catalog-grid></div>
        <nav class="dnd-catalog-pagination" data-catalog-pagination aria-label="Paginazione"></nav>
      </main>
    </div></div>
  </section>`;

  const state = { key: 'classes', page: 1, total: 0, items: [], request: 0 };
  const grid = container.querySelector('[data-catalog-grid]');
  const status = container.querySelector('[data-catalog-status]');
  const pagination = container.querySelector('[data-catalog-pagination]');
  const searchInput = container.querySelector('[data-catalog-search]');
  const versionInput = container.querySelector('[data-catalog-version]');

  const activeCatalog = () => getCatalog(state.key);
  const renderHeader = () => {
    const catalog = activeCatalog();
    container.querySelector('[data-catalog-kicker]').textContent = CATALOG_GROUPS.find((group) => group.entries.includes(catalog))?.label || '';
    container.querySelector('[data-catalog-title]').textContent = catalog.label;
    container.querySelector('[data-catalog-description]').textContent = catalog.description;
    container.querySelector('[data-catalog-create]').hidden = !canManage || Boolean(catalog.existingRoute);
  };
  const renderPagination = () => {
    const pages = Math.max(1, Math.ceil(state.total / PAGE_SIZE));
    pagination.innerHTML = pages <= 1 ? '' : `<button type="button" data-page="prev" ${state.page <= 1 ? 'disabled' : ''}>← Precedente</button><span>Pagina ${state.page} di ${pages}</span><button type="button" data-page="next" ${state.page >= pages ? 'disabled' : ''}>Successiva →</button>`;
  };
  const bindCards = () => {
    grid.querySelectorAll('[data-catalog-record]').forEach((element) => {
      const open = () => {
        const item = state.items.find((entry) => String(entry.id) === element.dataset.catalogRecord);
        if (item) void openRecordDetail(activeCatalog(), item, canManage, { edit: editRecord, remove: removeRecord });
      };
      element.addEventListener('click', open);
      element.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); } });
    });
  };
  const load = async () => {
    const catalog = activeCatalog();
    const requestId = ++state.request;
    renderHeader();
    grid.innerHTML = '<div class="dnd-catalog-loading"><span></span>Caricamento catalogo…</div>';
    status.textContent = '';
    pagination.innerHTML = '';
    if (catalog.existingRoute) {
      grid.innerHTML = `<a class="dnd-catalog-existing" href="#/${catalog.existingRoute}"><span>${catalog.icon}</span><div><strong>Apri ${catalog.label}</strong><p>Questo catalogo usa l’editor condiviso già presente, mantenendo tutte le funzioni esistenti.</p></div><b>Apri →</b></a>`;
      return;
    }
    try {
      const result = await searchCatalog(catalog, { query: searchInput.value, rulesVersion: versionInput.value, page: state.page, pageSize: PAGE_SIZE });
      if (requestId !== state.request) return;
      state.items = result.items;
      state.total = result.total;
      status.textContent = `${result.total} ${result.total === 1 ? 'elemento' : 'elementi'}`;
      grid.innerHTML = state.items.length ? state.items.map((item) => card(catalog, item)).join('') : `<div class="dnd-catalog-empty"><span>${catalog.icon}</span><h3>Nessun contenuto trovato</h3><p>Modifica i filtri${canManage ? ' oppure crea il primo elemento' : ''}.</p></div>`;
      bindCards();
      renderPagination();
    } catch (error) {
      if (requestId !== state.request) return;
      grid.innerHTML = `<div class="dnd-catalog-empty dnd-catalog-empty--error"><span>!</span><h3>Catalogo non disponibile</h3><p>${escapeHtml(normalizeCatalogError(error))}</p><small>Applica la migrazione db/dnd_shared_catalogs.sql se la tabella non è ancora installata.</small></div>`;
    }
  };
  const saveRecord = async (item, payload, catalog = activeCatalog()) => {
    if (item?.id) await updateCatalogRecord(catalog, item.id, payload);
    else await createCatalogRecord(catalog, payload);
    createToast(item?.id ? 'Elemento aggiornato' : 'Elemento creato', 'success');
    await load();
  };
  const editRecord = (item, catalog = activeCatalog()) => openRecordForm(catalog, item, (payload) => saveRecord(item, payload, catalog));
  const removeRecord = async (item, catalog = activeCatalog()) => {
    const confirmed = await openConfirmModal({ title: `Elimina ${catalog.singular.toLowerCase()}`, message: `Eliminare “${item.name}”? Le relazioni esistenti impediranno la cancellazione.`, confirmLabel: 'Elimina' });
    if (!confirmed) return;
    try { await deleteCatalogRecord(catalog, item.id); createToast('Elemento eliminato', 'success'); await load(); }
    catch (error) { createToast(normalizeCatalogError(error), 'error'); }
  };

  container.querySelectorAll('[data-catalog-key]').forEach((button) => button.addEventListener('click', () => {
    state.key = button.dataset.catalogKey; state.page = 1; searchInput.value = ''; versionInput.value = '';
    container.querySelectorAll('[data-catalog-key]').forEach((entry) => entry.classList.toggle('is-active', entry === button));
    void load();
  }));
  let searchTimer;
  searchInput.addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { state.page = 1; void load(); }, 250); });
  versionInput.addEventListener('change', () => { state.page = 1; void load(); });
  pagination.addEventListener('click', (event) => {
    const button = event.target.closest('[data-page]'); if (!button) return;
    state.page += button.dataset.page === 'next' ? 1 : -1; void load();
  });
  container.querySelector('[data-catalog-create]').addEventListener('click', () => openRecordForm(activeCatalog(), null, (payload) => saveRecord(null, payload)));
  await load();
}
