import { canManageSharedCatalog } from '../library/catalogPermissions.js';
import { createToast, openConfirmModal } from '../../ui/components.js';
import { escapeHtml, sanitizeImageUrl } from '../../lib/html.js';
import { CATALOG_GROUPS, FIELD_META, RULES_VERSIONS, getCatalog } from './catalogConfig.js';
import { catalogDescription, catalogName, catalogStatBlock } from './catalogLocale.js';
import {
  createCatalogRecord,
  deleteCatalogRecord,
  getClassFeatureGrants,
  getFeatureOrigins,
  normalizeCatalogError,
  searchCatalog,
  updateCatalogRecord
} from './catalogApi.js';
import {
  getCharacterProgression,
  getClassDetails,
  getResolvedFeatureOrigins,
  getSubclassProgressions,
  getSpeciesDetails
} from './catalogRelations.js';
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
  if (Array.isArray(value)) return value.map((entry) => displayValue(entry)).join('\n') || '—';
  if (typeof value === 'object') return Object.entries(value)
    .map(([key, entry]) => `${fieldLabel(key)}: ${displayValue(entry)}`).join('\n') || '—';
  return String(value);
}

function fieldLabel(key) {
  return FIELD_META[key]?.label || key.replaceAll('_', ' ');
}

const TECHNICAL_FIELDS = new Set(['id', 'created_by', 'created_at', 'updated_at', 'slug', 'name', 'name_it', 'rules_version', 'description', 'description_it', 'image_url']);

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
  const remaining = Object.keys(item).filter((key) => !TECHNICAL_FIELDS.has(key) && !preferred.includes(key)
    && !(catalog.key === 'classes' && key === 'data')
    && !(key === 'stat_block' && item.stat_block_it));
  return [...preferred, ...remaining].flatMap((key) => {
    const value = key === 'stat_block_it' ? catalogStatBlock(item) : item[key];
    if (value === null || value === undefined || value === '') return [];
    if (value && typeof value === 'object' && !Array.isArray(value)) return flattenStructuredData(value, fieldLabel(key));
    return [[fieldLabel(key), displayValue(value)]];
  });
}

function progressionCell(value) {
  if (value === null || value === undefined || value === '') return '—';
  if (Array.isArray(value)) return value.map(progressionCell).join(' · ');
  if (typeof value === 'object') {
    if (value.type === 'bonus' && value.value !== undefined) return `${Number(value.value) >= 0 ? '+' : ''}${value.value}`;
    if (value.type === 'dice') return value.toRoll || value.dice || `${value.number || 1}d${value.faces || '?'}`;
    if (value.type === 'cell') return progressionCell(value.entry ?? value.value ?? value.roll ?? '—');
    if (value.value !== undefined && Object.keys(value).every((key) => ['type', 'value'].includes(key))) return progressionCell(value.value);
    return Object.entries(value).filter(([key]) => key !== 'type')
      .map(([key, entry]) => `${fieldLabel(key)}: ${progressionCell(entry)}`).join(' · ');
  }
  return String(value);
}

function classProgressionTables(item) {
  const data = item?.data && typeof item.data === 'object' ? item.data : {};
  const tables = [];
  const seen = new Set();
  const addTable = (title, labels, rows) => {
    if (!Array.isArray(rows) || !rows.length) return;
    const signature = JSON.stringify(rows);
    if (seen.has(signature)) return;
    seen.add(signature);
    const normalizedRows = rows.map((row, index) => {
      if (Array.isArray(row)) return [index + 1, ...row];
      if (row && typeof row === 'object') {
        const level = row.level ?? row.livello ?? index + 1;
        return [level, ...labels.map((label) => row[label] ?? row[label.replaceAll(' ', '_')] ?? '—')];
      }
      return [index + 1, row];
    });
    const width = Math.max(...normalizedRows.map((row) => row.length));
    const columns = ['Livello', ...labels];
    while (columns.length < width) columns.push(`Valore ${columns.length}`);
    tables.push({ title, columns: columns.slice(0, width), rows: normalizedRows });
  };
  const groups = data.classTableGroups || data.class_table_groups || data.tableGroups || [];
  if (Array.isArray(groups)) groups.forEach((group, index) => addTable(
    group.title_it || group.name_it || group.title || group.name || group.caption || `Progressione ${index + 1}`,
    group.colLabels || group.columns || group.labels || [],
    group.rows || group.data || []
  ));
  const candidates = [
    ['Progressione di classe', data.progression || data.level_progression || data.class_progression],
    ['Slot incantesimo', data.spell_slots || data.spellSlots || data.spell_slot_progression || data.spellSlotProgression],
    ['Incantesimi conosciuti', data.spells_known_progression || data.spellsKnownProgression],
    ['Trucchetti conosciuti', data.cantrip_progression || data.cantripProgression]
  ];
  candidates.forEach(([title, value]) => {
    if (Array.isArray(value)) {
      const first = value.find((entry) => entry && typeof entry === 'object' && !Array.isArray(entry));
      addTable(title, first ? Object.keys(first).filter((key) => !['level', 'livello'].includes(key)) : [], value);
    } else if (value && typeof value === 'object') {
      const entries = Object.entries(value).sort(([a], [b]) => Number(a) - Number(b));
      if (entries.length) {
        const sample = entries.find(([, entry]) => entry && typeof entry === 'object' && !Array.isArray(entry))?.[1];
        const labels = Array.isArray(entries[0][1])
          ? entries[0][1].map((_, index) => `Slot ${index + 1}`)
          : sample ? Object.keys(sample) : ['Valore'];
        const rows = entries.map(([level, entry]) => Array.isArray(entry)
          ? [level, ...entry]
          : [level, ...(sample ? labels.map((label) => entry?.[label]) : [entry])]);
        const previousCount = tables.length;
        addTable(title, labels, rows.map((row) => row.slice(1)));
        if (tables.length > previousCount) tables.at(-1).rows = rows;
      }
    }
  });
  return tables;
}

function renderClassTables(item) {
  const tables = classProgressionTables(item);
  if (!tables.length) return '<p class="dnd-catalog-no-relations">Nessuna tabella di slot o risorse presente nei dati della classe.</p>';
  return tables.map((table) => `<section class="dnd-class-progression-table"><header><h4>${escapeHtml(table.title)}</h4><small>${table.rows.length} livelli</small></header><div><table><thead><tr>${table.columns.map((column) => `<th>${escapeHtml(column)}</th>`).join('')}</tr></thead><tbody>${table.rows.map((row) => `<tr>${row.map((cell, index) => `<${index ? 'td' : 'th'}>${escapeHtml(progressionCell(cell))}</${index ? 'td' : 'th'}>`).join('')}</tr>`).join('')}</tbody></table></div></section>`).join('');
}

function renderFeatureTimeline(grants) {
  const byLevel = new Map();
  grants.forEach((grant) => {
    const level = Number(grant.unlock_level) || 1;
    if (!byLevel.has(level)) byLevel.set(level, []);
    byLevel.get(level).push(grant);
  });
  if (!byLevel.size) return '<p class="dnd-catalog-no-relations">Nessuna abilità di classe collegata.</p>';
  return `<div class="dnd-class-level-timeline">${[...byLevel.entries()].sort(([a], [b]) => a - b).map(([level, entries]) => `<article><span class="dnd-class-level-timeline__level"><small>Livello</small><strong>${level}</strong></span><div>${entries.map((grant) => `<button type="button" data-linked-feature="${escapeHtml(grant.entity?.id || '')}"><strong>${escapeHtml(catalogName(grant.entity, 'Contenuto non disponibile'))}</strong><small>${escapeHtml(catalogDescription(grant.entity, grant.notes || 'Beneficio automatico'))}</small></button>`).join('')}</div></article>`).join('')}</div>`;
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
      <h3>${escapeHtml(catalogName(item, 'Senza nome'))}</h3>
      <p>${escapeHtml(catalogDescription(item, catalog.description))}</p>
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
  const localizedDescription = catalogDescription(item);
  const { backdrop, close } = modalShell(`
    <header class="dnd-catalog-detail__header">
      <div>${image ? `<img src="${image}" alt="">` : `<span class="dnd-catalog-detail__icon">${catalog.icon}</span>`}</div>
      <section><small>${escapeHtml(catalog.singular)} · Regole ${escapeHtml(item.rules_version || '—')}</small><h2>${escapeHtml(catalogName(item, 'Senza nome'))}</h2><p>${escapeHtml(item.source || 'Fonte non indicata')}</p></section>
      <button type="button" class="dnd-catalog-modal__close" data-modal-close aria-label="Chiudi">×</button>
    </header>
    <div class="dnd-catalog-detail__content">
      ${localizedDescription ? `<section><h3>Descrizione</h3><p class="dnd-catalog-detail__description">${escapeHtml(localizedDescription)}</p></section>` : ''}
      <section><h3>Dati completi</h3><dl>${rows.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('') || '<p class="muted">Nessun dato aggiuntivo.</p>'}</dl></section>
      <section class="dnd-catalog-detail__relations"><h3>${catalog.key === 'features' ? 'Concesso da' : catalog.key === 'classes' ? 'Progressione della classe' : 'Privilegi e abilità collegate'}</h3><div data-record-relations><div class="dnd-catalog-inline-loader"><span></span>Caricamento collegamenti…</div></div></section>
    </div>
    ${canManage ? `<footer class="dnd-catalog-modal__actions"><button type="button" data-record-delete class="danger">Elimina</button><button type="button" data-record-edit class="primary">Modifica</button></footer>` : ''}
  `, 'dnd-catalog-detail');
  backdrop.querySelector('[data-record-edit]')?.addEventListener('click', () => { close(); callbacks.edit(item, catalog); });
  backdrop.querySelector('[data-record-delete]')?.addEventListener('click', async () => { close(); await callbacks.remove(item, catalog); });
  const relations = backdrop.querySelector('[data-record-relations]');
  try {
    if (catalog.key === 'classes') {
      const details = await getClassDetails(item.id, item.rules_version);
      const [progression, subclassProgressions] = await Promise.all([
        getCharacterProgression({ classId: item.id, level: 20, classLevel: 20, rulesVersion: item.rules_version }),
        getSubclassProgressions((details?.subclasses || []).map((subclass) => subclass.id), item.rules_version)
      ]);
      const grants = progression.automaticGrants;
      const subclassGrantMap = new Map(subclassProgressions.map((entry) => [String(entry.subclassId), entry.grants]));
      const subclassGrants = subclassProgressions.flatMap((entry) => entry.grants);
      const allFeatureGrants = [...grants, ...subclassGrants];
      relations.innerHTML = `
        <section class="dnd-class-overview-strip">
          <div><small>Dado vita</small><strong>${escapeHtml(item.hit_die || '—')}</strong></div>
          <div><small>Caratteristiche</small><strong>${escapeHtml(item.primary_abilities || '—')}</strong></div>
          <div><small>Tiri salvezza</small><strong>${escapeHtml(item.saving_throws || '—')}</strong></div>
          <div><small>Sottoclassi</small><strong>${details?.subclasses?.length || 0}</strong></div>
        </section>
        <section class="dnd-catalog-relation-block dnd-class-features"><header><div><small>Progressione 1–20</small><h4>Abilità della classe</h4></div><span>${grants.length} collegate</span></header>${renderFeatureTimeline(grants)}</section>
        <section class="dnd-catalog-relation-block dnd-class-tables"><header><div><small>Incantesimi e risorse</small><h4>Tabelle di progressione</h4></div></header>${renderClassTables(item)}</section>
        ${progression.choiceGroups.length ? `<section class="dnd-catalog-relation-block dnd-class-choices"><header><div><small>Decisioni del giocatore</small><h4>Scelte per livello</h4></div></header>${progression.choiceGroups.map((group) => `<article class="dnd-catalog-choice-summary"><strong>${escapeHtml(catalogName(group))}</strong><small>${group.required ? 'Obbligatoria' : 'Facoltativa'} · ${group.allow_duplicates ? 'duplicati ammessi' : 'senza duplicati'}</small><div>${group.progression.map((step) => `<span>Livello ${escapeHtml(step.level)}: +${escapeHtml(step.choices_granted ?? step.new_choices)}</span>`).join('')}</div><p>${group.options.map((option) => escapeHtml(option.label_override || catalogName(option.entity) || option.static_code || 'Opzione')).join(' · ')}</p></article>`).join('')}</section>` : ''}
        ${details?.subclasses?.length ? `<section class="dnd-catalog-relation-block dnd-class-subclasses"><header><div><small>Disponibili dal livello ${escapeHtml(details.subclass_selection_level)}</small><h4>Sottoclassi e relative abilità</h4></div><span>${details.subclasses.length}</span></header><div>${details.subclasses.map((subclass, index) => { const linked = subclassGrantMap.get(String(subclass.id)) || []; return `<details ${index === 0 ? 'open' : ''}><summary><span><strong>${escapeHtml(catalogName(subclass))}</strong><small>${linked.length} abilità collegate</small></span><b>＋</b></summary><div>${renderFeatureTimeline(linked)}</div></details>`; }).join('')}</div></section>` : ''}`;
      relations.querySelectorAll('[data-linked-feature]').forEach((button) => button.addEventListener('click', () => {
        const grant = allFeatureGrants.find((entry) => String(entry.entity?.id) === button.dataset.linkedFeature);
        if (!grant?.entity || grant.target_type !== 'feature') return;
        close();
        void openRecordDetail(getCatalog('features'), grant.entity, canManage, callbacks);
      }));
    } else if (catalog.key === 'features') {
      const origins = await getResolvedFeatureOrigins(item.id, item.rules_version);
      relations.innerHTML = origins.length ? `<div class="dnd-catalog-origin-list">${origins.map((grant) => `<div><span>${escapeHtml(grant.origin?.type || 'Origine')}</span><strong>${escapeHtml(catalogName(grant.origin, 'Record non disponibile'))}</strong><small>${grant.unlock_level ? `Livello ${escapeHtml(grant.unlock_level)} · ` : ''}${escapeHtml(grant.level_scope === 'class' ? 'livello di classe' : 'livello personaggio')}</small></div>`).join('')}</div>` : '<p class="dnd-catalog-no-relations">Questa abilità non è ancora collegata a classi o altre origini.</p>';
    } else {
      const contextKey = {
        subclasses: 'subclassId', species: 'speciesId', 'species-variants': 'speciesVariantId', backgrounds: 'backgroundId',
        feats: 'featIds', 'fighting-styles': 'fightingStyleIds'
      }[catalog.key];
      const context = contextKey ? { [contextKey]: contextKey.endsWith('Ids') ? [item.id] : item.id, level: 20, classLevel: 20, rulesVersion: item.rules_version } : null;
      const [progression, speciesDetails] = await Promise.all([
        context ? getCharacterProgression(context) : Promise.resolve({ automaticGrants: [], choiceGroups: [] }),
        catalog.key === 'species' ? getSpeciesDetails(item.id, null, item.rules_version) : Promise.resolve(null)
      ]);
      const variants = speciesDetails?.variants || [];
      relations.innerHTML = `${variants.length ? `<section class="dnd-catalog-relation-block"><h4>Varianti della specie</h4><div class="dnd-catalog-relation-chips">${variants.map((variant) => `<span>${escapeHtml(catalogName(variant))} <small>${escapeHtml(variant.rules_version)}</small></span>`).join('')}</div></section>` : ''}${progression.automaticGrants.length ? `<div class="dnd-catalog-level-list">${progression.automaticGrants.map((grant) => `<div><span class="dnd-catalog-level-badge">Livello ${escapeHtml(grant.unlock_level || 1)}</span><span><strong>${escapeHtml(catalogName(grant.entity, 'Contenuto non disponibile'))}</strong><small>${escapeHtml(grant.target_type)}</small></span></div>`).join('')}</div>` : ''}${progression.choiceGroups.length ? `<section class="dnd-catalog-relation-block"><h4>Scelte collegate</h4>${progression.choiceGroups.map((group) => `<article class="dnd-catalog-choice-summary"><strong>${escapeHtml(catalogName(group))}</strong><small>${group.required ? 'Obbligatoria' : 'Facoltativa'}</small><p>${group.options.map((option) => escapeHtml(option.label_override || catalogName(option.entity) || option.static_code || 'Opzione')).join(' · ')}</p></article>`).join('')}</section>` : ''}${!variants.length && !progression.automaticGrants.length && !progression.choiceGroups.length ? '<p class="dnd-catalog-no-relations">Nessun collegamento disponibile nei dati.</p>' : ''}`;
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
        <label><span>Nome italiano</span><input name="name_it" value="${escapeHtml(item?.name_it || '')}" autocomplete="off"></label>
        <label><span>Versione *</span><select name="rules_version" required>${RULES_VERSIONS.map((version) => `<option value="${version}" ${String(item?.rules_version || '2024') === version ? 'selected' : ''}>${version}</option>`).join('')}</select></label>
        <label class="dnd-catalog-form__wide"><span>Descrizione italiana</span><textarea name="description_it" rows="5">${escapeHtml(item?.description_it || '')}</textarea></label>
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
    const payload = {
      name: String(data.get('name') || '').trim(),
      name_it: String(data.get('name_it') || '').trim() || null,
      description_it: String(data.get('description_it') || '').trim() || null,
      rules_version: data.get('rules_version')
    };
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
        <div class="dnd-catalog-filters"><label><span>Cerca</span><input type="search" data-catalog-search placeholder="Cerca per nome…"></label><label><span>Versione</span><select data-catalog-version><option value="">2014 e 2024</option><option>2014</option><option>2024</option></select></label><label data-creature-filter hidden><span>Tipo</span><input data-catalog-creature-type placeholder="Es. Bestia"></label><label data-creature-filter hidden><span>Grado di sfida</span><input data-catalog-challenge-rating placeholder="Es. 1/2"></label></div>
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
  const creatureTypeInput = container.querySelector('[data-catalog-creature-type]');
  const challengeRatingInput = container.querySelector('[data-catalog-challenge-rating]');

  const activeCatalog = () => getCatalog(state.key);
  const renderHeader = () => {
    const catalog = activeCatalog();
    container.querySelector('[data-catalog-kicker]').textContent = CATALOG_GROUPS.find((group) => group.entries.includes(catalog))?.label || '';
    container.querySelector('[data-catalog-title]').textContent = catalog.label;
    container.querySelector('[data-catalog-description]').textContent = catalog.description;
    container.querySelector('[data-catalog-create]').hidden = !canManage || Boolean(catalog.existingRoute);
    container.querySelectorAll('[data-creature-filter]').forEach((field) => { field.hidden = catalog.key !== 'creatures'; });
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
      const result = await searchCatalog(catalog, { query: searchInput.value, rulesVersion: versionInput.value, creatureType: creatureTypeInput.value, challengeRating: challengeRatingInput.value, page: state.page, pageSize: PAGE_SIZE });
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
    const confirmed = await openConfirmModal({ title: `Elimina ${catalog.singular.toLowerCase()}`, message: `Eliminare “${catalogName(item)}”? Le relazioni esistenti impediranno la cancellazione.`, confirmLabel: 'Elimina' });
    if (!confirmed) return;
    try { await deleteCatalogRecord(catalog, item.id); createToast('Elemento eliminato', 'success'); await load(); }
    catch (error) { createToast(normalizeCatalogError(error), 'error'); }
  };

  container.querySelectorAll('[data-catalog-key]').forEach((button) => button.addEventListener('click', () => {
    state.key = button.dataset.catalogKey; state.page = 1; searchInput.value = ''; versionInput.value = ''; creatureTypeInput.value = ''; challengeRatingInput.value = '';
    container.querySelectorAll('[data-catalog-key]').forEach((entry) => entry.classList.toggle('is-active', entry === button));
    void load();
  }));
  let searchTimer;
  searchInput.addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { state.page = 1; void load(); }, 250); });
  versionInput.addEventListener('change', () => { state.page = 1; void load(); });
  creatureTypeInput.addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { state.page = 1; void load(); }, 250); });
  challengeRatingInput.addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { state.page = 1; void load(); }, 250); });
  pagination.addEventListener('click', (event) => {
    const button = event.target.closest('[data-page]'); if (!button) return;
    state.page += button.dataset.page === 'next' ? 1 : -1; void load();
  });
  container.querySelector('[data-catalog-create]').addEventListener('click', () => openRecordForm(activeCatalog(), null, (payload) => saveRecord(null, payload)));
  await load();
}
