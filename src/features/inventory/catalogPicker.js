import { getSharedItemsByIds, searchSharedItems } from '../library/itemLibraryApi.js';
import { fetchBundleContents } from '../startingEquipment/bundleApi.js';
import { bundleEntryLabel } from '../startingEquipment/bundleView.js';
import { createToast, openFormModal } from '../../ui/components.js';
import { escapeHtml, sanitizeImageUrl } from '../../lib/html.js';
import { getCategoryLabel } from './utils.js';
import { createItem, createItems } from './inventoryApi.js';
import { itemCategories } from './constants.js';
import { openEquipmentItemDetail } from '../character/home/itemDetail.js';

export async function openItemSourceModal({
  title = 'Aggiungi oggetto',
  manualLabel = 'Crea nuovo oggetto',
  manualHint = 'Inserisci tutte le proprietà manualmente.',
  catalogLabel = 'Scegli dall’archivio',
  catalogHint = 'Riusa uno o più oggetti già completi del compendio.',
  defaultSource = 'catalog'
} = {}) {
  const content = document.createElement('div');
  content.className = 'item-source-picker';
  content.innerHTML = `
    <p class="item-source-picker__intro">Scegli il flusso più rapido per questa operazione.</p>
    <div class="item-source-picker__options">
      <label><input type="radio" name="item_source" value="catalog" ${defaultSource === 'catalog' ? 'checked' : ''} /><span><i aria-hidden="true">☷</i><strong>${escapeHtml(catalogLabel)}</strong><small>${escapeHtml(catalogHint)}</small></span></label>
      <label><input type="radio" name="item_source" value="manual" ${defaultSource === 'manual' ? 'checked' : ''} /><span><i aria-hidden="true">＋</i><strong>${escapeHtml(manualLabel)}</strong><small>${escapeHtml(manualHint)}</small></span></label>
    </div>`;
  const formData = await openFormModal({ title, submitLabel: 'Continua', cancelLabel: 'Annulla', content, cardClass: 'modal-card--item-source' });
  return formData?.get('item_source') || null;
}

async function loadAllSharedItems() {
  const first = await searchSharedItems({ page: 1, pageSize: 100 });
  const items = [...(first.items || [])];
  const total = Number(first.total) || items.length;
  let page = 2;
  while (items.length < total) {
    const next = await searchSharedItems({ page, pageSize: 100 });
    if (!next.items?.length) break;
    items.push(...next.items);
    page += 1;
  }
  return items;
}

function presentPickerDetail(modal, options = {}) {
  const card = modal?.querySelector('.modal-card');
  const parentForm = modal?.querySelector('[data-form-body]');
  const heading = modal?.querySelector('[data-form-title]');
  const overlay = modal?.querySelector('[data-form-overlay]');
  if (!card || !parentForm || !heading) return openFormModal(options);
  return new Promise((resolve) => {
    const previousTitle = heading.textContent;
    const previousClasses = (modal.dataset.formCardClasses || '').split(/\s+/).filter(Boolean);
    const detailClasses = (Array.isArray(options.cardClass) ? options.cardClass : [options.cardClass])
      .flatMap((value) => String(value || '').split(/\s+/))
      .filter(Boolean);
    const previousHeaderControls = [...modal.querySelectorAll('[data-form-header-actions]')]
      .map((node) => [node, node.hidden]);
    previousHeaderControls.forEach(([node]) => {
      node.removeAttribute('data-form-header-actions');
      node.hidden = true;
    });
    previousClasses.forEach((className) => card.classList.remove(className));
    detailClasses.forEach((className) => card.classList.add(className));
    parentForm.hidden = true;
    heading.textContent = options.title || 'Dettaglio oggetto';

    const headerActions = document.createElement('div');
    headerActions.className = 'modal-header__actions';
    headerActions.dataset.formHeaderActions = '';
    modal.querySelector('.modal-header__top')?.append(headerActions);
    const form = document.createElement('form');
    form.className = 'modal-form picker-nested-detail';
    const fields = document.createElement('div');
    fields.className = 'modal-body';
    fields.dataset.formFields = '';
    if (typeof options.content === 'string') fields.innerHTML = options.content;
    else if (options.content) fields.append(options.content);
    const footer = document.createElement('footer');
    footer.className = 'modal-footer sheet-view-footer';
    footer.innerHTML = '<div class="modal-actions"><div class="modal-actions__left"><button class="ghost-button" type="button" data-picker-detail-back>‹ Indietro</button></div><div class="modal-actions__right"></div></div>';
    const primaryActions = footer.querySelector('.modal-actions__right');
    const hasPrimaryAction = options.showFooter !== false && options.submitLabel !== 'Chiudi';
    if (hasPrimaryAction) {
      const submit = document.createElement('button');
      submit.type = 'submit';
      submit.className = 'primary';
      submit.dataset.formSubmit = '';
      submit.textContent = options.submitLabel || 'Conferma';
      primaryActions.append(submit);
    }
    form.append(fields, footer);
    card.insertBefore(form, parentForm);
    let cleanupHook = options.onOpen?.({ modal, formEl: form, fieldsEl: fields });
    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      cleanupHook?.();
      cleanupHook = null;
      form.remove();
      headerActions.remove();
      detailClasses.forEach((className) => card.classList.remove(className));
      previousClasses.forEach((className) => card.classList.add(className));
      previousHeaderControls.forEach(([node, hidden]) => {
        node.dataset.formHeaderActions = '';
        node.hidden = hidden;
      });
      parentForm.hidden = false;
      heading.textContent = previousTitle;
      overlay?.removeEventListener('click', onOverlay, true);
      document.removeEventListener('keydown', onKeydown, true);
      resolve(result);
    };
    const onOverlay = (event) => {
      event.stopPropagation();
      finish(null);
    };
    const onKeydown = (event) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      finish(null);
    };
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      finish(new FormData(form, event.submitter));
    });
    footer.querySelector('[data-picker-detail-back]')?.addEventListener('click', () => finish(null));
    overlay?.addEventListener('click', onOverlay, true);
    document.addEventListener('keydown', onKeydown, true);
    footer.querySelector('[data-picker-detail-back]')?.focus();
  });
}

export async function openSharedItemPicker({
  title = 'Scegli dall’archivio',
  multiple = true,
  allowQuantities = false,
  headerActionLabel = '',
  onHeaderAction = null,
  shortcutSize = false,
  onLoadingChange = null
} = {}) {
  const PAGE_SIZE = 24;
  let items = [];
  const inputType = multiple ? 'checkbox' : 'radio';
  const content = document.createElement('div');
  content.className = 'shared-item-picker';
  content.innerHTML = `
    <div class="shared-item-picker__category-filter" role="group" aria-label="Filtra per categoria">
      ${itemCategories.map((category) => `<button class="shared-item-picker__category" type="button" data-shared-item-category="${category.value}" aria-pressed="false"><span>${escapeHtml(category.label)}</span></button>`).join('')}
    </div>
    <div class="shared-item-picker__toolbar">
      <label><span aria-hidden="true">⌕</span><input type="search" placeholder="Cerca nell’archivio" data-shared-item-search /></label>
      <button class="shared-item-picker__clear-selection" type="button" data-clear-shared-item-selection hidden>Deseleziona tutti</button>
      <output data-shared-item-count aria-live="polite">Caricamento…</output>
    </div>
    <fieldset class="shared-item-picker__collection">
      <legend>Raccolta oggetti</legend>
      <div class="shared-item-picker__results" data-shared-item-results>
        <div class="shared-item-picker__loader" role="status" aria-live="polite">
          <span class="shared-item-picker__spinner" aria-hidden="true"></span>
          <strong>Caricamento archivio…</strong>
          <small>Sto recuperando gli oggetti disponibili.</small>
        </div>
      </div>
      <nav class="catalog-pagination shared-item-picker__pagination" data-shared-item-pagination aria-label="Pagine oggetti">
        <button type="button" data-shared-item-page="previous" disabled>‹ Precedente</button>
        <span><strong data-shared-item-page-label>Pagina 1 di 1</strong><small data-shared-item-page-range>Caricamento…</small></span>
        <button type="button" data-shared-item-page="next" disabled>Successiva ›</button>
      </nav>
    </fieldset>`;
  const search = content.querySelector('[data-shared-item-search]');
  const clearSelectionButton = content.querySelector('[data-clear-shared-item-selection]');
  const count = content.querySelector('[data-shared-item-count]');
  const results = content.querySelector('[data-shared-item-results]');
  const pagination = content.querySelector('[data-shared-item-pagination]');
  const pageLabel = content.querySelector('[data-shared-item-page-label]');
  const pageRange = content.querySelector('[data-shared-item-page-range]');
  const previousPageButton = content.querySelector('[data-shared-item-page="previous"]');
  const nextPageButton = content.querySelector('[data-shared-item-page="next"]');
  const categoryButtons = [...content.querySelectorAll('[data-shared-item-category]')];
  const selectedCategories = new Set();
  const selectedItems = new Map();
  let currentPage = 1;
  let totalItems = 0;
  let totalPages = 1;
  let loadSequence = 0;
  let searchTimer = null;
  let cards = [];
  let submitButton = null;
  let syncSelections = () => {};
  let detailPresenter = openFormModal;
  let selectedCount = 0;

  const syncCategoryButtons = () => {
    categoryButtons.forEach((button) => {
      const isActive = selectedCategories.has(button.dataset.sharedItemCategory);
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  };

  const syncPagination = () => {
    totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
    pagination.hidden = false;
    pageLabel.textContent = `Pagina ${currentPage} di ${totalPages}`;
    const first = totalItems ? ((currentPage - 1) * PAGE_SIZE) + 1 : 0;
    const last = Math.min(currentPage * PAGE_SIZE, totalItems);
    pageRange.textContent = totalItems ? `${first}–${last} di ${totalItems}` : 'Nessun risultato';
    previousPageButton.disabled = currentPage <= 1;
    nextPageButton.disabled = currentPage >= totalPages;
  };

  const syncSubmitState = () => {
    if (!submitButton) return;
    selectedCount = selectedItems.size;
    submitButton.disabled = selectedCount === 0;
    submitButton.textContent = multiple
      ? (selectedCount ? `Aggiungi ${selectedCount} ${selectedCount === 1 ? 'oggetto' : 'oggetti'}` : 'Aggiungi selezionati')
      : 'Aggiungi oggetto';
  };

  const renderItems = () => {
    const categories = [...new Set(items.map((item) => item.category || 'gear'))];
    const renderCard = (item) => {
    const image = sanitizeImageUrl(item.image_url);
    return `<article class="shared-item-picker__card" data-shared-item-option data-shared-item-id="${escapeHtml(item.id)}" data-item-category="${escapeHtml(item.category || 'gear')}" data-search-value="${escapeHtml(`${item.name} ${getCategoryLabel(item.category)}`.toLowerCase())}">
        <input class="shared-item-picker__input" type="${inputType}" name="shared_item_ids" value="${escapeHtml(item.id)}" />
        <button class="shared-item-picker__detail" type="button" data-shared-item-detail aria-label="Apri il dettaglio di ${escapeHtml(item.name)}">
          <span class="shared-item-picker__visual">${image ? `<img src="${image}" alt="" width="48" height="54" loading="lazy" decoding="async" />` : '<i aria-hidden="true">◇</i>'}</span>
          <span class="shared-item-picker__copy"><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(getCategoryLabel(item.category))}${item.is_magic ? ' · Magico' : ''}</small></span>
          <span class="shared-item-picker__open-hint" aria-hidden="true">›</span>
        </button>
        <footer class="shared-item-picker__footer">
          <button class="shared-item-picker__select" type="button" data-shared-item-select aria-pressed="false"><span aria-hidden="true">✓</span><strong>Seleziona</strong></button>
          ${allowQuantities ? `<div class="shared-item-picker__quantity" data-shared-item-quantity>
            <span class="shared-item-picker__stepper">
              <button type="button" data-quantity-step="-1" aria-label="Riduci quantità di ${escapeHtml(item.name)}">−</button>
              <input type="number" name="shared_item_qty_${escapeHtml(item.id)}" value="${selectedItems.get(String(item.id))?.selected_quantity || 1}" min="1" max="999" step="1" aria-label="Quantità di ${escapeHtml(item.name)}" disabled />
              <button type="button" data-quantity-step="1" aria-label="Aumenta quantità di ${escapeHtml(item.name)}">+</button>
            </span>
          </div>` : ''}
        </footer>
      </article>`;
    };
    results.innerHTML = `<div class="shared-item-picker__grid">
      ${categories.map((category) => `
        <div class="shared-item-picker__category-group" data-shared-item-category-group data-item-category="${escapeHtml(category)}">
          ${items.filter((item) => (item.category || 'gear') === category).map(renderCard).join('')}
        </div>`).join('')}
    </div>`;
    cards = [...content.querySelectorAll('[data-shared-item-option]')];
    const syncCardSelection = (card) => {
      const selection = card.querySelector('input[name="shared_item_ids"]');
      if (!selection) return;
        selection.checked = selectedItems.has(String(selection.value));
        const quantityInput = card.querySelector('[data-shared-item-quantity] input');
        const selectButton = card.querySelector('[data-shared-item-select]');
        card.classList.toggle('is-selected', selection.checked);
        selectButton?.setAttribute('aria-pressed', String(selection.checked));
        const label = selectButton?.querySelector('strong');
        if (label) label.textContent = selection.checked ? 'Selezionato' : 'Seleziona';
        if (quantityInput) quantityInput.disabled = !selection.checked;
    };
    syncSelections = () => {
      cards.forEach((card) => {
        const selection = card.querySelector('input[name="shared_item_ids"]');
        syncCardSelection(card);
      });
      selectedCount = selectedItems.size;
      clearSelectionButton.hidden = selectedCount === 0;
      syncSubmitState();
    };
    cards.forEach((card) => {
      const selection = card.querySelector('input[name="shared_item_ids"]');
      const quantityInput = card.querySelector('[data-shared-item-quantity] input');
      selection.addEventListener('change', () => {
        if (!multiple && selection.checked) {
          selectedItems.clear();
        }
        const item = items.find((entry) => String(entry.id) === String(selection.value));
        if (selection.checked && item) selectedItems.set(String(item.id), {
          ...item,
          selected_quantity: Math.max(1, Number(quantityInput?.value) || 1)
        });
        else selectedItems.delete(String(selection.value));
        selectedCount = selectedItems.size;
        if (!multiple) cards.forEach(syncCardSelection);
        syncCardSelection(card);
        clearSelectionButton.hidden = selectedCount === 0;
        syncSubmitState();
      });
      card.querySelector('[data-shared-item-select]')?.addEventListener('click', () => {
        selection.checked = multiple ? !selection.checked : true;
        selection.dispatchEvent(new Event('change', { bubbles: true }));
      });
      card.querySelector('[data-shared-item-detail]')?.addEventListener('click', () => {
        const item = items.find((entry) => String(entry.id) === String(card.dataset.sharedItemId));
        if (!item) return;
        const template = item.item_data && typeof item.item_data === 'object' ? item.item_data : {};
        void openEquipmentItemDetail({ ...template, ...item, description: item.description || template.description }, {
          catalogMode: true,
          present: detailPresenter,
          shortcutSize
        });
      });
      card.querySelectorAll('[data-quantity-step]').forEach((button) => {
        button.addEventListener('click', () => {
          if (!selection.checked) {
            selection.checked = true;
            selection.dispatchEvent(new Event('change', { bubbles: true }));
          }
          const direction = Number(button.dataset.quantityStep) || 0;
          const current = Math.max(1, Number(quantityInput.value) || 1);
          quantityInput.value = String(Math.min(999, Math.max(1, current + direction)));
          const selectedItem = selectedItems.get(String(selection.value));
          if (selectedItem) selectedItems.set(String(selection.value), { ...selectedItem, selected_quantity: Number(quantityInput.value) });
        });
      });
      quantityInput?.addEventListener('input', () => {
        quantityInput.value = String(Math.min(999, Math.max(1, Number(quantityInput.value) || 1)));
        const selectedItem = selectedItems.get(String(selection.value));
        if (selectedItem) selectedItems.set(String(selection.value), { ...selectedItem, selected_quantity: Number(quantityInput.value) });
      });
    });
    syncSelections();
    count.textContent = `${totalItems} ${totalItems === 1 ? 'oggetto' : 'oggetti'}`;
    syncPagination();
    syncSubmitState();
  };

  const loadPage = async (page = 1) => {
    const sequence = ++loadSequence;
    currentPage = Math.max(1, Number(page) || 1);
    results.innerHTML = '<div class="shared-item-picker__loader" role="status"><span class="shared-item-picker__spinner" aria-hidden="true"></span><strong>Caricamento pagina…</strong></div>';
    pagination.setAttribute('aria-busy', 'true');
    previousPageButton.disabled = true;
    nextPageButton.disabled = true;
    try {
      const result = await searchSharedItems({
        query: search.value.trim(),
        categories: [...selectedCategories],
        page: currentPage,
        pageSize: PAGE_SIZE
      });
      if (sequence !== loadSequence) return;
      items = result.items || [];
      totalItems = Number(result.total) || 0;
      totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
      if (currentPage > totalPages) return loadPage(totalPages);
      if (!items.length) {
        results.innerHTML = '<div class="shared-item-picker__empty"><strong>Nessun oggetto trovato</strong><span>Prova a modificare ricerca o categorie.</span></div>';
        count.textContent = '0 oggetti';
        syncPagination();
        return;
      }
      renderItems();
      results.scrollTop = 0;
    } catch (error) {
      if (sequence !== loadSequence) return;
      results.innerHTML = '<div class="shared-item-picker__empty shared-item-picker__empty--error"><strong>Archivio non disponibile</strong><span>Riprova tra qualche istante.</span></div>';
      count.textContent = 'Errore';
      pageRange.textContent = 'Caricamento non riuscito';
      createToast('Impossibile caricare l’archivio degli oggetti', 'error');
    } finally {
      if (sequence === loadSequence) pagination.removeAttribute('aria-busy');
    }
  };
  const refreshFromFirstPage = () => { void loadPage(1); };
  search.addEventListener('input', () => {
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(refreshFromFirstPage, 250);
  });
  clearSelectionButton.addEventListener('click', () => {
    selectedItems.clear();
    syncSelections();
  });
  categoryButtons.forEach((button) => button.addEventListener('click', () => {
    const category = button.dataset.sharedItemCategory;
    if (selectedCategories.has(category)) selectedCategories.delete(category);
    else selectedCategories.add(category);
    syncCategoryButtons();
    refreshFromFirstPage();
    button.blur();
  }));
  previousPageButton.addEventListener('click', () => void loadPage(currentPage - 1));
  nextPageButton.addEventListener('click', () => void loadPage(currentPage + 1));

  const formData = await openFormModal({
    title, submitLabel: multiple ? 'Aggiungi selezionati' : 'Aggiungi oggetto', cancelLabel: 'Annulla', content,
    cardClass: ['modal-card--wide', 'modal-card--scrollable', 'modal-card--shared-item-picker', shortcutSize ? 'modal-card--shortcut-size' : ''],
    onOpen: ({ modal, fieldsEl }) => {
      let mounted = true;
      let headerActionButton = null;
      let headerActionHost = null;
      submitButton = modal?.querySelector('[data-form-submit], .sheet-view-footer button[type="submit"]');
      detailPresenter = modal?.matches?.('[data-form-modal]')
        ? (options) => presentPickerDetail(modal, options)
        : (options) => modal.presentForm(options);
      if (submitButton) submitButton.disabled = true;
      if (headerActionLabel && typeof onHeaderAction === 'function') {
        const sheetActions = modal?.querySelector(':scope > .modal-header .sheet-modal-actions');
        let headerActions = modal?.querySelector('[data-form-header-actions]');
        if (sheetActions && modal?.classList.contains('sheet-detail--inline')) {
          headerActionHost = document.createElement('div');
          headerActionHost.className = 'modal-header__actions shared-item-picker__header-actions';
          headerActionHost.dataset.formHeaderActions = '';
          sheetActions.prepend(headerActionHost);
          headerActions = headerActionHost;
        }
        if (headerActions) {
          headerActionButton = document.createElement('button');
          headerActionButton.type = 'button';
          headerActionButton.className = 'resource-action-button shared-item-picker__header-action';
          headerActionButton.innerHTML = `<span aria-hidden="true">＋</span><strong>${escapeHtml(headerActionLabel)}</strong>`;
          headerActionButton.addEventListener('click', async () => {
            headerActionButton.disabled = true;
            try {
              await onHeaderAction({ present: detailPresenter });
            } finally {
              if (mounted) headerActionButton.disabled = false;
            }
          });
          headerActions.prepend(headerActionButton);
        }
      }
      const loadingContext = { modal, fieldsEl, content };
      onLoadingChange?.(true, loadingContext);
      void loadPage(1).finally(() => onLoadingChange?.(false, loadingContext));
      return () => {
        mounted = false;
        loadSequence += 1;
        window.clearTimeout(searchTimer);
        headerActionButton?.remove();
        headerActionHost?.remove();
        onLoadingChange?.(false, loadingContext);
      };
    }
  });
  if (!formData) return [];
  return [...selectedItems.values()].map((item) => ({
    ...item,
    ...(allowQuantities ? { selected_quantity: Math.max(1, Number(item.selected_quantity) || 1) } : {})
  }));
}

export function sharedItemToInventoryPayload(item, character, overrides = {}) {
  const template = item?.item_data && typeof item.item_data === 'object' ? item.item_data : item || {};
  const payload = {
    ...template,
    user_id: character.user_id,
    character_id: character.id,
    shared_item_id: item.id,
    name: item.name,
    image_url: item.image_url || template.image_url || null,
    category: item.category || template.category || 'gear',
    qty: Math.max(1, Number(template.qty) || 1),
    container_item_id: null,
    inventory_location: null,
    equip_slot: null,
    equip_slots: [],
    ...overrides
  };
  [
    'id', 'created_at', 'updated_at', 'created_by', 'rules_version', 'item_data', 'description',
    'original_name', 'source_id', 'source_label', 'source_edition', 'source_url', 'source_kind',
    'original_category', 'cost', 'armor_uses_dexterity',
    'armor_dexterity_cap', 'tool_subcategory',
    'gear_category', 'bundle_contents'
  ].forEach((key) => delete payload[key]);
  return payload;
}

const normalizeKey = (value) => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/** Indici per ritrovare i contenuti di un pacchetto: source_id esatto, source_id senza edizione, poi nome originale identico. */
function buildCatalogIndex(catalog) {
  const byId = new Map();
  const byBaseId = new Map();
  const byName = new Map();
  const put = (map, key, item) => { if (key && !map.has(key)) map.set(key, item); };
  catalog.forEach((item) => {
    const template = item?.item_data && typeof item.item_data === 'object' ? item.item_data : item;
    [template?.source_id, item?.source_id].filter(Boolean).forEach((id) => {
      put(byId, normalizeKey(id), item);
      put(byBaseId, normalizeKey(String(id).split('|')[0]), item);
    });
    [item?.original_name, template?.original_name, item?.name].forEach((name) => put(byName, normalizeKey(name), item));
  });
  return (entry) => byId.get(normalizeKey(entry.source_id))
    || byBaseId.get(normalizeKey(String(entry.source_id || '').split('|')[0]))
    || byName.get(normalizeKey(entry.name))
    || null;
}

export async function addSharedItemsToInventory(sharedItems = [], character, overrides = {}, { onMissingContents = null } = {}) {
  if (!character || !Array.isArray(sharedItems) || !sharedItems.length) return [];
  // Fonte principale: vista shared_item_bundle_catalog (UUID, nessun filtro di versione). Ripiego: bundle_contents legacy.
  const viewContents = await fetchBundleContents(sharedItems.map((item) => item.id)).catch((error) => {
    console.warn('Vista dei contenuti delle dotazioni non disponibile, uso bundle_contents', error);
    return new Map();
  });
  const hasLegacyContents = (item) => {
    const template = item?.item_data && typeof item.item_data === 'object' ? item.item_data : item;
    return Array.isArray(template?.bundle_contents) && template.bundle_contents.length > 0;
  };
  const bundledItems = sharedItems.filter((item) => (viewContents.get(String(item.id)) || []).length > 0 || hasLegacyContents(item));
  let resolvedBundles = new Map();

  if (bundledItems.length) {
    const viewChildIds = [...new Set(bundledItems.flatMap((item) => (viewContents.get(String(item.id)) || []).filter((entry) => entry.linked).map((entry) => entry.itemId)))];
    const viewChildren = new Map((await getSharedItemsByIds(viewChildIds)).map((child) => [String(child.id), child]));
    const legacyItems = bundledItems.filter((item) => !(viewContents.get(String(item.id)) || []).length);
    const findCatalogItem = legacyItems.length ? buildCatalogIndex(await loadAllSharedItems()) : () => null;
    resolvedBundles = new Map(bundledItems.map((item) => {
      const fromView = viewContents.get(String(item.id)) || [];
      if (fromView.length) {
        const resolvedView = fromView.map((entry) => ({ entry, item: entry.linked ? viewChildren.get(entry.itemId) || null : null }));
        const unlinked = resolvedView.filter(({ item: child }) => !child).map(({ entry }) => bundleEntryLabel(entry));
        if (unlinked.length) {
          console.warn(`Contenuti della dotazione ${item.name} non collegati a shared_items`, unlinked);
          onMissingContents?.(item, unlinked);
        }
        return [String(item.id), resolvedView.filter(({ item: child }) => child)];
      }
      const template = item?.item_data && typeof item.item_data === 'object' ? item.item_data : item;
      const resolved = template.bundle_contents.map((entry) => ({
        entry,
        item: findCatalogItem(entry)
      }));
      const missing = resolved.filter(({ item: child }) => !child).map(({ entry }) => entry.name || entry.source_id);
      if (missing.length) console.warn(`Contenuti della dotazione ${item.name} non trovati in shared_items`, resolved.filter(({ item: child }) => !child).map(({ entry }) => entry));
      if (missing.length && !onMissingContents) throw new Error(`Oggetti mancanti nella dotazione ${item.name}: ${missing.join(', ')}`);
      if (missing.length) onMissingContents(item, missing);
      return [String(item.id), resolved.filter(({ item: child }) => child)];
    }));
  }

  const created = [];
  const getSelectedQuantity = (item) => Math.min(999, Math.max(1, Number(item?.selected_quantity) || 1));
  const loosePayloads = sharedItems
    .filter((item) => !resolvedBundles.has(String(item.id)))
    .map((item) => sharedItemToInventoryPayload(item, character, { ...overrides, qty: getSelectedQuantity(item) }));
  if (loosePayloads.length) created.push(...await createItems(loosePayloads));

  for (const bundle of bundledItems) {
    const bundleQuantity = getSelectedQuantity(bundle);
    for (let copy = 0; copy < bundleQuantity; copy += 1) {
      const container = await createItem(sharedItemToInventoryPayload(bundle, character, { ...overrides, category: 'container', qty: 1 }));
      created.push(container);
      const childPayloads = resolvedBundles.get(String(bundle.id)).map(({ entry, item }) => sharedItemToInventoryPayload(item, character, {
        ...overrides,
        qty: Math.max(1, Number(entry.quantity) || 1),
        container_item_id: container.id
      }));
      if (childPayloads.length) created.push(...await createItems(childPayloads));
    }
  }
  return created;
}
