import { searchSharedItems } from '../library/itemLibraryApi.js';
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
  catalogHint = 'Riusa uno o più oggetti già completi del compendio.'
} = {}) {
  const content = document.createElement('div');
  content.className = 'item-source-picker';
  content.innerHTML = `
    <p class="item-source-picker__intro">Scegli il flusso più rapido per questa operazione.</p>
    <div class="item-source-picker__options">
      <label><input type="radio" name="item_source" value="catalog" checked /><span><i aria-hidden="true">☷</i><strong>${escapeHtml(catalogLabel)}</strong><small>${escapeHtml(catalogHint)}</small></span></label>
      <label><input type="radio" name="item_source" value="manual" /><span><i aria-hidden="true">＋</i><strong>${escapeHtml(manualLabel)}</strong><small>${escapeHtml(manualHint)}</small></span></label>
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
    if (detailClasses.length) form.classList.add(...detailClasses);
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
    <div class="shared-item-picker__results" data-shared-item-results>
      <div class="shared-item-picker__loader" role="status" aria-live="polite">
        <span class="shared-item-picker__spinner" aria-hidden="true"></span>
        <strong>Caricamento archivio…</strong>
        <small>Sto recuperando gli oggetti disponibili.</small>
      </div>
    </div>`;
  const search = content.querySelector('[data-shared-item-search]');
  const clearSelectionButton = content.querySelector('[data-clear-shared-item-selection]');
  const count = content.querySelector('[data-shared-item-count]');
  const results = content.querySelector('[data-shared-item-results]');
  const categoryButtons = [...content.querySelectorAll('[data-shared-item-category]')];
  const selectedCategories = new Set();
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

  const applyFilters = () => {
    const query = search.value.trim().toLowerCase();
    let visible = 0;
    cards.forEach((card) => {
      const matchesSearch = !query || card.dataset.searchValue.includes(query);
      const matchesCategory = selectedCategories.size === 0 || selectedCategories.has(card.dataset.itemCategory);
      card.hidden = !(matchesSearch && matchesCategory);
      if (!card.hidden) visible += 1;
    });
    count.textContent = `${visible} ${visible === 1 ? 'oggetto' : 'oggetti'}`;
  };

  const syncSubmitState = () => {
    if (!submitButton) return;
    submitButton.disabled = selectedCount === 0;
    submitButton.textContent = multiple
      ? (selectedCount ? `Aggiungi ${selectedCount} ${selectedCount === 1 ? 'oggetto' : 'oggetti'}` : 'Aggiungi selezionati')
      : 'Aggiungi oggetto';
  };

  const renderItems = () => {
    results.innerHTML = `<div class="shared-item-picker__grid">
      ${items.map((item) => {
    const image = sanitizeImageUrl(item.image_url);
    return `<article class="shared-item-picker__card" data-shared-item-option data-shared-item-id="${escapeHtml(item.id)}" data-item-category="${escapeHtml(item.category || 'gear')}" data-search-value="${escapeHtml(`${item.name} ${getCategoryLabel(item.category)}`.toLowerCase())}">
        <input class="shared-item-picker__input" type="${inputType}" name="shared_item_ids" value="${escapeHtml(item.id)}" />
        <button class="shared-item-picker__detail" type="button" data-shared-item-detail aria-label="Apri il dettaglio di ${escapeHtml(item.name)}">
          <span class="shared-item-picker__visual">${image ? `<img src="${image}" alt="" />` : '<i aria-hidden="true">◇</i>'}</span>
          <span class="shared-item-picker__copy"><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(getCategoryLabel(item.category))}${item.is_magic ? ' · Magico' : ''}</small></span>
          <span class="shared-item-picker__open-hint" aria-hidden="true">›</span>
        </button>
        <footer class="shared-item-picker__footer">
          <button class="shared-item-picker__select" type="button" data-shared-item-select aria-pressed="false"><span aria-hidden="true">✓</span><strong>Seleziona</strong></button>
          ${allowQuantities ? `<div class="shared-item-picker__quantity" data-shared-item-quantity>
            <span class="shared-item-picker__stepper">
              <button type="button" data-quantity-step="-1" aria-label="Riduci quantità di ${escapeHtml(item.name)}">−</button>
              <input type="number" name="shared_item_qty_${escapeHtml(item.id)}" value="1" min="1" max="999" step="1" aria-label="Quantità di ${escapeHtml(item.name)}" disabled />
              <button type="button" data-quantity-step="1" aria-label="Aumenta quantità di ${escapeHtml(item.name)}">+</button>
            </span>
          </div>` : ''}
        </footer>
      </article>`;
  }).join('')}
    </div>`;
    cards = [...content.querySelectorAll('[data-shared-item-option]')];
    const syncCardSelection = (card) => {
      const selection = card.querySelector('input[name="shared_item_ids"]');
      if (!selection) return;
        const quantityInput = card.querySelector('[data-shared-item-quantity] input');
        const selectButton = card.querySelector('[data-shared-item-select]');
        card.classList.toggle('is-selected', selection.checked);
        selectButton?.setAttribute('aria-pressed', String(selection.checked));
        const label = selectButton?.querySelector('strong');
        if (label) label.textContent = selection.checked ? 'Selezionato' : 'Seleziona';
        if (quantityInput) quantityInput.disabled = !selection.checked;
    };
    syncSelections = () => {
      selectedCount = 0;
      cards.forEach((card) => {
        const selection = card.querySelector('input[name="shared_item_ids"]');
        syncCardSelection(card);
        if (selection?.checked) selectedCount += 1;
      });
      clearSelectionButton.hidden = selectedCount === 0;
      syncSubmitState();
    };
    cards.forEach((card) => {
      const selection = card.querySelector('input[name="shared_item_ids"]');
      const quantityInput = card.querySelector('[data-shared-item-quantity] input');
      selection.addEventListener('change', () => {
        const wasSelected = card.classList.contains('is-selected');
        if (!multiple && selection.checked) {
          cards.filter((entry) => entry !== card).forEach((entry) => {
            const otherSelection = entry.querySelector('input[name="shared_item_ids"]');
            if (!otherSelection?.checked) return;
            otherSelection.checked = false;
            syncCardSelection(entry);
          });
          selectedCount = 1;
        } else if (selection.checked !== wasSelected) {
          selectedCount += selection.checked ? 1 : -1;
        }
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
        });
      });
      quantityInput?.addEventListener('input', () => {
        quantityInput.value = String(Math.min(999, Math.max(1, Number(quantityInput.value) || 1)));
      });
    });
    syncSelections();
    applyFilters();
    syncSubmitState();
  };

  search.addEventListener('input', applyFilters);
  clearSelectionButton.addEventListener('click', () => {
    cards.forEach((card) => {
      const selection = card.querySelector('input[name="shared_item_ids"]');
      if (selection) selection.checked = false;
    });
    syncSelections();
  });
  categoryButtons.forEach((button) => button.addEventListener('click', () => {
    const category = button.dataset.sharedItemCategory;
    if (selectedCategories.has(category)) selectedCategories.delete(category);
    else selectedCategories.add(category);
    syncCategoryButtons();
    applyFilters();
    button.blur();
  }));

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
      void loadAllSharedItems()
        .then((loadedItems) => {
          if (!mounted) return;
          items = loadedItems;
          if (!items.length) {
            results.innerHTML = '<div class="shared-item-picker__empty"><strong>Archivio vuoto</strong><span>Non ci sono ancora oggetti disponibili.</span></div>';
            count.textContent = '0 oggetti';
            return;
          }
          renderItems();
        })
        .catch(() => {
          if (!mounted) return;
          results.innerHTML = '<div class="shared-item-picker__empty shared-item-picker__empty--error"><strong>Archivio non disponibile</strong><span>Riprova tra qualche istante.</span></div>';
          count.textContent = 'Errore';
          createToast('Impossibile caricare l’archivio degli oggetti', 'error');
        })
        .finally(() => onLoadingChange?.(false, loadingContext));
      return () => {
        mounted = false;
        headerActionButton?.remove();
        headerActionHost?.remove();
        onLoadingChange?.(false, loadingContext);
      };
    }
  });
  if (!formData) return [];
  const selected = new Set(formData.getAll('shared_item_ids').map(String));
  return items
    .filter((item) => selected.has(String(item.id)))
    .map((item) => ({
      ...item,
      ...(allowQuantities ? {
        selected_quantity: Math.max(1, Number(formData.get(`shared_item_qty_${item.id}`)) || 1)
      } : {})
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

export async function addSharedItemsToInventory(sharedItems = [], character) {
  if (!character || !Array.isArray(sharedItems) || !sharedItems.length) return [];
  const bundledItems = sharedItems.filter((item) => {
    const template = item?.item_data && typeof item.item_data === 'object' ? item.item_data : item;
    return Array.isArray(template?.bundle_contents) && template.bundle_contents.length > 0;
  });
  let catalogBySourceId = new Map();
  let resolvedBundles = new Map();

  if (bundledItems.length) {
    const catalog = await loadAllSharedItems();
    catalogBySourceId = new Map(catalog
      .map((item) => {
        const template = item?.item_data && typeof item.item_data === 'object' ? item.item_data : item;
        return [String(template?.source_id || ''), item];
      })
      .filter(([sourceId]) => sourceId));
    resolvedBundles = new Map(bundledItems.map((item) => {
      const template = item?.item_data && typeof item.item_data === 'object' ? item.item_data : item;
      const resolved = template.bundle_contents.map((entry) => ({
        entry,
        item: catalogBySourceId.get(String(entry.source_id || ''))
      }));
      const missing = resolved.filter(({ item: child }) => !child).map(({ entry }) => entry.name || entry.source_id);
      if (missing.length) throw new Error(`Oggetti mancanti nella dotazione ${item.name}: ${missing.join(', ')}`);
      return [String(item.id), resolved];
    }));
  }

  const created = [];
  const getSelectedQuantity = (item) => Math.min(999, Math.max(1, Number(item?.selected_quantity) || 1));
  const loosePayloads = sharedItems
    .filter((item) => !resolvedBundles.has(String(item.id)))
    .map((item) => sharedItemToInventoryPayload(item, character, { qty: getSelectedQuantity(item) }));
  if (loosePayloads.length) created.push(...await createItems(loosePayloads));

  for (const bundle of bundledItems) {
    const bundleQuantity = getSelectedQuantity(bundle);
    for (let copy = 0; copy < bundleQuantity; copy += 1) {
      const container = await createItem(sharedItemToInventoryPayload(bundle, character, { category: 'container', qty: 1 }));
      created.push(container);
      const childPayloads = resolvedBundles.get(String(bundle.id)).map(({ entry, item }) => sharedItemToInventoryPayload(item, character, {
        qty: Math.max(1, Number(entry.quantity) || 1),
        container_item_id: container.id
      }));
      if (childPayloads.length) created.push(...await createItems(childPayloads));
    }
  }
  return created;
}
