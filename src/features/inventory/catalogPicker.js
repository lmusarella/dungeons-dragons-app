import { searchSharedItems } from '../library/itemLibraryApi.js';
import { createToast, openFormModal, setGlobalLoading } from '../../ui/components.js';
import { escapeHtml, sanitizeImageUrl } from '../../lib/html.js';
import { getCategoryLabel } from './utils.js';
import { createItem, createItems } from './inventoryApi.js';

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

export async function openSharedItemPicker({ title = 'Scegli dall’archivio', multiple = true } = {}) {
  setGlobalLoading(true);
  let items = [];
  try {
    items = await loadAllSharedItems();
  } catch (error) {
    createToast('Impossibile caricare l’archivio degli oggetti', 'error');
    return [];
  } finally {
    setGlobalLoading(false);
  }
  if (!items.length) {
    createToast('L’archivio centralizzato non contiene ancora oggetti');
    return [];
  }
  const inputType = multiple ? 'checkbox' : 'radio';
  const content = document.createElement('div');
  content.className = 'shared-item-picker';
  content.innerHTML = `
    <div class="shared-item-picker__toolbar">
      <label><span aria-hidden="true">⌕</span><input type="search" placeholder="Cerca nell’archivio" data-shared-item-search /></label>
      <output data-shared-item-count>${items.length} oggetti</output>
    </div>
    <div class="shared-item-picker__grid">
      ${items.map((item) => {
    const image = sanitizeImageUrl(item.image_url);
    return `<label class="shared-item-picker__card" data-shared-item-option data-search-value="${escapeHtml(`${item.name} ${getCategoryLabel(item.category)}`.toLowerCase())}">
          <input type="${inputType}" name="shared_item_ids" value="${escapeHtml(item.id)}" />
          <span class="shared-item-picker__visual">${image ? `<img src="${image}" alt="" />` : '<i aria-hidden="true">◇</i>'}</span>
          <span><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(getCategoryLabel(item.category))}${item.is_magic ? ' · Magico' : ''}</small></span>
          <b aria-hidden="true">✓</b>
        </label>`;
  }).join('')}
    </div>`;
  const search = content.querySelector('[data-shared-item-search]');
  const cards = [...content.querySelectorAll('[data-shared-item-option]')];
  const count = content.querySelector('[data-shared-item-count]');
  const applySearch = () => {
    const query = search.value.trim().toLowerCase();
    let visible = 0;
    cards.forEach((card) => {
      card.hidden = Boolean(query) && !card.dataset.searchValue.includes(query);
      if (!card.hidden) visible += 1;
    });
    count.textContent = `${visible} ${visible === 1 ? 'oggetto' : 'oggetti'}`;
  };
  search.addEventListener('input', applySearch);
  cards.forEach((card) => card.querySelector('input').addEventListener('change', () => card.classList.toggle('is-selected', card.querySelector('input').checked)));
  const formData = await openFormModal({
    title, submitLabel: multiple ? 'Aggiungi selezionati' : 'Aggiungi oggetto', cancelLabel: 'Annulla', content,
    cardClass: ['modal-card--wide', 'modal-card--scrollable', 'modal-card--shared-item-picker']
  });
  if (!formData) return [];
  const selected = new Set(formData.getAll('shared_item_ids').map(String));
  return items.filter((item) => selected.has(String(item.id)));
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
  const loosePayloads = sharedItems
    .filter((item) => !resolvedBundles.has(String(item.id)))
    .map((item) => sharedItemToInventoryPayload(item, character));
  if (loosePayloads.length) created.push(...await createItems(loosePayloads));

  for (const bundle of bundledItems) {
    const container = await createItem(sharedItemToInventoryPayload(bundle, character, { category: 'container' }));
    created.push(container);
    const childPayloads = resolvedBundles.get(String(bundle.id)).map(({ entry, item }) => sharedItemToInventoryPayload(item, character, {
      qty: Math.max(1, Number(entry.quantity) || 1),
      container_item_id: container.id
    }));
    if (childPayloads.length) created.push(...await createItems(childPayloads));
  }
  return created;
}
