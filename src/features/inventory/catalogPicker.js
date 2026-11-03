import { searchSharedItems } from '../library/itemLibraryApi.js';
import { createToast, openFormModal } from '../../ui/components.js';
import { escapeHtml, sanitizeImageUrl } from '../../lib/html.js';
import { getCategoryLabel } from './utils.js';
import { createItem, createItems } from './inventoryApi.js';
import { itemCategories } from './constants.js';

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

export async function openSharedItemPicker({
  title = 'Scegli dall’archivio',
  multiple = true,
  allowQuantities = false,
  headerActionLabel = '',
  onHeaderAction = null
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
  const count = content.querySelector('[data-shared-item-count]');
  const results = content.querySelector('[data-shared-item-results]');
  const categoryButtons = [...content.querySelectorAll('[data-shared-item-category]')];
  const selectedCategories = new Set();
  let cards = [];
  let submitButton = null;

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
    const selectedCount = cards.filter((card) => card.querySelector('input[name="shared_item_ids"]')?.checked).length;
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
    return `<article class="shared-item-picker__card" data-shared-item-option data-item-category="${escapeHtml(item.category || 'gear')}" data-search-value="${escapeHtml(`${item.name} ${getCategoryLabel(item.category)}`.toLowerCase())}">
        <label class="shared-item-picker__selection">
          <input type="${inputType}" name="shared_item_ids" value="${escapeHtml(item.id)}" />
          <span class="shared-item-picker__visual">${image ? `<img src="${image}" alt="" />` : '<i aria-hidden="true">◇</i>'}</span>
          <span class="shared-item-picker__copy"><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(getCategoryLabel(item.category))}${item.is_magic ? ' · Magico' : ''}</small></span>
          <b aria-hidden="true">✓</b>
        </label>
        ${allowQuantities ? `
          <div class="shared-item-picker__quantity" data-shared-item-quantity>
            <span>Quantità</span>
            <span class="shared-item-picker__stepper">
              <button type="button" data-quantity-step="-1" aria-label="Riduci quantità di ${escapeHtml(item.name)}">−</button>
              <input type="number" name="shared_item_qty_${escapeHtml(item.id)}" value="1" min="1" max="999" step="1" aria-label="Quantità di ${escapeHtml(item.name)}" disabled />
              <button type="button" data-quantity-step="1" aria-label="Aumenta quantità di ${escapeHtml(item.name)}">+</button>
            </span>
          </div>` : ''}
      </article>`;
  }).join('')}
    </div>`;
    cards = [...content.querySelectorAll('[data-shared-item-option]')];
    cards.forEach((card) => {
      const selection = card.querySelector('input[name="shared_item_ids"]');
      const quantityInput = card.querySelector('[data-shared-item-quantity] input');
      const syncSelection = () => {
        if (!multiple && selection.checked) {
          cards.filter((entry) => entry !== card).forEach((entry) => entry.classList.remove('is-selected'));
        }
        card.classList.toggle('is-selected', selection.checked);
        if (quantityInput) quantityInput.disabled = !selection.checked;
        syncSubmitState();
      };
      selection.addEventListener('change', syncSelection);
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
      syncSelection();
    });
    applyFilters();
    syncSubmitState();
  };

  search.addEventListener('input', applyFilters);
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
    cardClass: ['modal-card--wide', 'modal-card--scrollable', 'modal-card--shared-item-picker'],
    onOpen: ({ modal }) => {
      let mounted = true;
      let headerActionButton = null;
      submitButton = modal?.querySelector('[data-form-submit], .sheet-view-footer button[type="submit"]');
      if (submitButton) submitButton.disabled = true;
      if (headerActionLabel && typeof onHeaderAction === 'function') {
        const sheetActions = modal?.querySelector(':scope > .modal-header .sheet-modal-actions');
        const headerActions = sheetActions || modal?.querySelector('[data-form-header-actions]');
        if (headerActions) {
          headerActionButton = document.createElement('button');
          headerActionButton.type = 'button';
          headerActionButton.className = 'resource-action-button shared-item-picker__header-action';
          headerActionButton.innerHTML = `<span aria-hidden="true">＋</span><strong>${escapeHtml(headerActionLabel)}</strong>`;
          headerActionButton.addEventListener('click', () => {
            onHeaderAction();
            const backButton = modal.querySelector('.sheet-view-footer .sheet-detail-back');
            const cancelButton = modal.querySelector('[data-form-cancel]');
            (backButton || cancelButton)?.click();
          });
          headerActions.prepend(headerActionButton);
        }
      }
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
        });
      return () => {
        mounted = false;
        headerActionButton?.remove();
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
    equip_slot: null,
    equip_slots: [],
    ...overrides
  };
  [
    'id', 'created_at', 'updated_at', 'created_by', 'rules_version', 'item_data', 'description',
    'original_name', 'source_id', 'source_label', 'source_edition', 'source_url', 'source_kind',
    'original_category', 'cost', 'weapon_properties', 'grip_type', 'armor_uses_dexterity',
    'armor_dexterity_cap', 'minimum_strength', 'stealth_disadvantage', 'tool_subcategory',
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
