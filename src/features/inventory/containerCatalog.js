import { escapeHtml, sanitizeImageUrl } from '../../lib/html.js';
import { buildCompactItemList } from './compactTables.js';
import { calcItemWeight } from '../../lib/calc.js';
import { formatWeight } from '../../lib/format.js';
import { getEquipSlots } from './utils.js';

export const EQUIPPED_CONTAINER_ID = '__equipped__';

function isEquippedItem(item) {
  return Boolean(item?.equipped) || getEquipSlots(item).length > 0;
}

export function matchesInventoryFilter(item, { term = '', category = '', equipableOnly = false, magicOnly = false } = {}) {
  return String(item.name || '').toLocaleLowerCase('it').includes(term.trim().toLocaleLowerCase('it'))
    && (!category || item.category === category)
    && (!equipableOnly || item.equipable)
    && (!magicOnly || item.is_magic);
}

export function getContainerView(items, filters = {}, containerId = '') {
  const byId = new Map(items.map(item => [String(item.id), item]));
  const container = byId.get(String(containerId));
  const virtualEquipped = String(containerId) === EQUIPPED_CONTAINER_ID
    ? { id: EQUIPPED_CONTAINER_ID, name: 'Equipaggiati', category: 'virtual', isVirtual: true }
    : null;
  const current = virtualEquipped || (container?.category === 'container' ? container : null);
  const parentId = current ? String(current.id) : '';
  const children = id => items.filter(item => String(item.container_item_id || '') === String(id));
  const matchesBelow = (item, seen = new Set()) => {
    const id = String(item.id);
    if (seen.has(id)) return false;
    seen.add(id);
    return matchesInventoryFilter(item, filters) || (item.category === 'container' && children(id).some(child => matchesBelow(child, seen)));
  };
  const trail = [];
  const seen = new Set();
  let cursor = current?.isVirtual ? null : current;
  while (cursor && !seen.has(String(cursor.id))) {
    seen.add(String(cursor.id)); trail.unshift(cursor);
    cursor = byId.get(String(cursor.container_item_id));
  }
  const entries = current?.isVirtual ? items.filter(isEquippedItem) : children(parentId).filter((item) => !isEquippedItem(item));
  const equippedItems = items.filter((item) => isEquippedItem(item) && matchesInventoryFilter(item, filters));
  const virtualContainer = {
    id: EQUIPPED_CONTAINER_ID,
    name: 'Equipaggiati',
    category: 'virtual',
    isVirtual: true,
    totalWeight: equippedItems.reduce((total, item) => total + calcItemWeight(item, items), 0),
    childCount: items.filter(isEquippedItem).length,
    matchingCount: equippedItems.length
  };
  const visibleContainers = entries
    .filter(item => item.category === 'container' && matchesBelow(item))
    .map(item => ({ ...item, totalWeight: calcItemWeight(item, items), childCount: children(item.id).filter((child) => !isEquippedItem(child)).length, matchingCount: children(item.id).filter((child) => !isEquippedItem(child) && matchesBelow(child)).length }));
  if (!current && equippedItems.length) visibleContainers.unshift(virtualContainer);
  return {
    container: current, trail, allItems: items,
    containers: visibleContainers,
    items: entries.filter(item => (current?.isVirtual || item.category !== 'container') && matchesInventoryFilter(item, filters))
  };
}

export function buildContainerCatalog(view, weightUnit = 'kg') {
  const current = view.container;
  const breadcrumb = '<nav class="container-breadcrumb" aria-label="Percorso inventario"><button type="button" data-open-container="">Tutti gli oggetti</button>' + view.trail.map(item => '<span aria-hidden="true">›</span><button type="button" data-open-container="'+escapeHtml(item.id)+'" '+(item === current ? 'aria-current="page"' : '')+'>'+escapeHtml(item.name)+'</button>').join('') + '</nav>';
  const tools = current ? '<div class="container-content-heading"><div><h3>'+escapeHtml(current.name)+'</h3><small>'+view.items.length+(view.items.length === 1 ? ' oggetto visibile' : ' oggetti visibili')+'</small></div>'+(current.isVirtual ? '' : '<div class="compact-row-actions"><button type="button" class="ghost-button" data-insert-container="'+escapeHtml(current.id)+'">+ Inserisci oggetti</button><button type="button" class="icon-button" data-edit="'+escapeHtml(current.id)+'" aria-label="Modifica contenitore">✎</button><button type="button" class="icon-button" data-delete="'+escapeHtml(current.id)+'" aria-label="Elimina contenitore">×</button></div>')+'</div>' : '';
  const cards = view.containers.length ? '<div class="inventory-container-grid">' + view.containers.map(item => {
    const image = sanitizeImageUrl(item.image_url);
    const symbol = item.isVirtual ? '♙' : '▱';
    return '<button type="button" class="inventory-container-card '+(item.isVirtual ? 'inventory-container-card--equipped' : '')+'" data-open-container="'+escapeHtml(item.id)+'">'+(image ? '<img src="'+image+'" alt="">' : '<span class="container-card-symbol" aria-hidden="true">'+symbol+'</span>')+'<span><strong>'+escapeHtml(item.name)+'</strong><small>'+item.childCount+' oggetti'+(item.matchingCount < item.childCount ? ' · '+item.matchingCount+' corrispondenti' : '')+' · '+escapeHtml(formatWeight(item.totalWeight, weightUnit))+'</small></span><span aria-hidden="true">›</span></button>';
  }).join('')+'</div>' : '';
  const table = view.items.length ? buildCompactItemList(view.items, weightUnit, { allowExtract: Boolean(current && !current.isVirtual), allItems: view.allItems }) : !view.containers.length ? '<p class="compact-table-empty muted">Nessun oggetto corrisponde ai filtri in questa posizione.</p>' : '';
  const locationLabel = current?.isVirtual ? 'Oggetti equipaggiati' : current ? 'Contenuto' : 'Oggetti sfusi';
  return (current ? breadcrumb : '') + tools + cards + (view.items.length ? '<p class="inventory-location-label">'+locationLabel+'</p>' : '') + table;
}
