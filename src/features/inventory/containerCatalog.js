import { escapeHtml, sanitizeImageUrl } from '../../lib/html.js';
import { buildCompactItemList } from './compactTables.js';
import { calcItemWeight, calcSelectionCarriedWeight } from '../../lib/calc.js';
import { formatWeight } from '../../lib/format.js';
import { getEquipSlots } from './utils.js';

export const EQUIPPED_CONTAINER_ID = '__equipped__';
export const LOCATION_CONTAINER_PREFIX = '__location__:';

function normalizeLocation(value) {
  return String(value || '').trim();
}

export function getLocationContainerId(location) {
  return `${LOCATION_CONTAINER_PREFIX}${encodeURIComponent(normalizeLocation(location))}`;
}

export function getLocationFromContainerId(containerId) {
  const value = String(containerId || '');
  if (!value.startsWith(LOCATION_CONTAINER_PREFIX)) return '';
  try { return decodeURIComponent(value.slice(LOCATION_CONTAINER_PREFIX.length)); }
  catch { return ''; }
}

function isEquippedItem(item) {
  return Boolean(item?.equipped) || getEquipSlots(item).length > 0;
}

export function matchesInventoryFilter(item, { term = '', category = '', categories = [], equipableOnly = false, magicOnly = false, attunementOnly = false } = {}) {
  const selectedCategories = categories.length ? categories : (category ? [category] : []);
  return String(item.name || '').toLocaleLowerCase('it').includes(term.trim().toLocaleLowerCase('it'))
    && (!selectedCategories.length || selectedCategories.includes(item.category))
    && (!equipableOnly || item.equipable)
    && (!magicOnly || item.is_magic)
    && (!attunementOnly || item.attunement_active);
}

export function getContainerView(items, filters = {}, containerId = '') {
  const byId = new Map(items.map(item => [String(item.id), item]));
  const container = byId.get(String(containerId));
  const virtualEquipped = String(containerId) === EQUIPPED_CONTAINER_ID
    ? { id: EQUIPPED_CONTAINER_ID, name: 'Equipaggiati', category: 'virtual', isVirtual: true }
    : null;
  const locationName = getLocationFromContainerId(containerId);
  const virtualLocation = locationName
    ? { id: getLocationContainerId(locationName), name: locationName, category: 'virtual', isVirtual: true, isLocation: true }
    : null;
  const current = virtualEquipped || virtualLocation || (container?.category === 'container' ? container : null);
  const parentId = current ? String(current.id) : '';
  const children = id => items.filter(item => String(item.container_item_id || '') === String(id));
  const descendants = (containerItem) => {
    const result = [];
    const visited = new Set([String(containerItem.id)]);
    const stack = [...children(containerItem.id)];
    while (stack.length) {
      const item = stack.pop();
      const id = String(item.id);
      if (visited.has(id)) continue;
      visited.add(id);
      result.push(item);
      if (item.category === 'container') stack.push(...children(item.id));
    }
    return result;
  };
  const matchesBelow = (item, seen = new Set()) => {
    const id = String(item.id);
    if (seen.has(id)) return false;
    seen.add(id);
    return matchesInventoryFilter(item, filters) || (item.category === 'container' && children(id).some(child => matchesBelow(child, seen)));
  };
  const trail = current?.isVirtual ? [current] : [];
  const seen = new Set();
  let cursor = current?.isVirtual ? null : current;
  while (cursor && !seen.has(String(cursor.id))) {
    seen.add(String(cursor.id)); trail.unshift(cursor);
    cursor = byId.get(String(cursor.container_item_id));
  }
  if (!virtualEquipped && trail.some(isEquippedItem)) {
    trail.unshift({ id: EQUIPPED_CONTAINER_ID, name: 'Equipaggiati', category: 'virtual', isVirtual: true });
  } else if (!current?.isVirtual) {
    const rootWithLocation = trail.find((item) => normalizeLocation(item.inventory_location));
    if (rootWithLocation) {
      const name = normalizeLocation(rootWithLocation.inventory_location);
      trail.unshift({ id: getLocationContainerId(name), name, category: 'virtual', isVirtual: true, isLocation: true });
    }
  }
  const entries = virtualEquipped
    ? items.filter(isEquippedItem)
    : virtualLocation
      ? items.filter((item) => !item.container_item_id && !isEquippedItem(item) && normalizeLocation(item.inventory_location) === locationName)
      : children(parentId).filter((item) => !isEquippedItem(item) && (current || !normalizeLocation(item.inventory_location)));
  const equippedItems = items.filter((item) => isEquippedItem(item) && (matchesInventoryFilter(item, filters) || (item.category === 'container' && matchesBelow(item))));
  const virtualContainer = {
    id: EQUIPPED_CONTAINER_ID,
    name: 'Equipaggiati',
    category: 'virtual',
    isVirtual: true,
    totalWeight: calcSelectionCarriedWeight(equippedItems, items),
    childCount: items.filter(isEquippedItem).length,
    matchingCount: equippedItems.length
  };
  const locationContainers = [...new Set(items
    .filter((item) => !item.container_item_id && !isEquippedItem(item))
    .map((item) => normalizeLocation(item.inventory_location))
    .filter(Boolean))]
    .map((name) => {
      const locationItems = items.filter((item) => !item.container_item_id && !isEquippedItem(item) && normalizeLocation(item.inventory_location) === name);
      const groupedItems = [];
      const groupedIds = new Set();
      const stack = [...locationItems];
      while (stack.length) {
        const item = stack.pop();
        const id = String(item.id);
        if (groupedIds.has(id)) continue;
        groupedIds.add(id);
        groupedItems.push(item);
        if (item.category === 'container') stack.push(...children(item.id));
      }
      const matchingItems = groupedItems.filter((item) => matchesInventoryFilter(item, filters));
      return {
        id: getLocationContainerId(name), name, category: 'virtual', isVirtual: true, isLocation: true,
        totalWeight: locationItems.reduce((total, item) => total + calcItemWeight(item, items), 0),
        childCount: groupedItems.length,
        matchingCount: matchingItems.length
      };
    })
    .filter((location) => location.matchingCount > 0);
  const visibleContainers = entries
    .filter(item => item.category === 'container' && matchesBelow(item))
    .map(item => ({ ...item, totalWeight: calcItemWeight(item, items), childCount: children(item.id).filter((child) => !isEquippedItem(child)).length, matchingCount: children(item.id).filter((child) => !isEquippedItem(child) && matchesBelow(child)).length }));
  const hasActiveFilters = Boolean(filters.term?.trim() || filters.category || filters.categories?.length || filters.equipableOnly || filters.magicOnly || filters.attunementOnly);
  if (!current) {
    visibleContainers.unshift(...locationContainers);
    if (!hasActiveFilters || equippedItems.length) visibleContainers.unshift(virtualContainer);
  }
  return {
    container: current, trail, allItems: items,
    containers: visibleContainers,
    items: entries
      .filter(item => matchesInventoryFilter(item, filters) || (item.category === 'container' && matchesBelow(item)))
      .map((item) => {
        if (item.category !== 'container') return item;
        const contained = descendants(item);
        return {
          ...item,
          containedItemCount: contained.length,
          visibleContainedItemCount: hasActiveFilters
            ? contained.filter((entry) => matchesInventoryFilter(entry, filters)).length
            : contained.length
        };
      })
  };
}

export function buildContainerCatalog(view, weightUnit = 'kg') {
  const current = view.container;
  const breadcrumb = current ? '<nav class="container-breadcrumb container-breadcrumb--prominent" aria-label="Percorso inventario"><button type="button" data-open-container="">Tutti gli oggetti</button>' + view.trail.map(item => '<span aria-hidden="true">›</span><button type="button" data-open-container="'+escapeHtml(item.id)+'" '+(String(item.id) === String(current.id) ? 'aria-current="page"' : '')+'>'+escapeHtml(item.name)+'</button>').join('') + '</nav>' : '';
  const virtualTools = current?.isLocation ? '' : `<div class="inventory-equipped-tools"><button type="button" class="ghost-button inventory-equipment-action inventory-equipment-action--equip" data-equip-container ${view.allItems.some((item) => item.equipable && !isEquippedItem(item)) ? '' : 'disabled'}>+ Equipaggia oggetto</button></div>`;
  const heading = current?.isVirtual
    ? `<div class="container-content-heading__title"><h3>${escapeHtml(current.name)}</h3><small>${view.items.length}${view.items.length === 1 ? ' oggetto visibile' : ' oggetti visibili'}</small></div>`
    : `<div class="container-content-heading__title"><button type="button" class="container-heading-detail" data-item-preview="${escapeHtml(current?.id || '')}" aria-label="Apri dettaglio ${escapeHtml(current?.name || '')}"><h3>${escapeHtml(current?.name || '')}</h3></button><small>${view.items.length}${view.items.length === 1 ? ' oggetto visibile' : ' oggetti visibili'}</small></div>`;
  const tools = current ? '<div class="container-content-heading">'+heading+(current.isVirtual ? virtualTools : '<div class="compact-row-actions"><button type="button" class="ghost-button" data-insert-container="'+escapeHtml(current.id)+'">+ Inserisci oggetti</button><button type="button" class="icon-button" data-delete="'+escapeHtml(current.id)+'" aria-label="Elimina contenitore">×</button></div>')+'</div>' : '';
  const cards = view.containers.length ? '<div class="inventory-container-grid">' + view.containers.map(item => {
    const image = sanitizeImageUrl(item.image_url);
    const symbol = item.isLocation ? '⌂' : item.isVirtual ? '♙' : '▱';
    const modifier = item.isLocation ? 'inventory-container-card--location' : item.isVirtual ? 'inventory-container-card--equipped' : '';
    return '<button type="button" class="inventory-container-card '+modifier+'" data-open-container="'+escapeHtml(item.id)+'">'+(image ? '<img src="'+image+'" alt="">' : '<span class="container-card-symbol" aria-hidden="true">'+symbol+'</span>')+'<span><strong>'+escapeHtml(item.name)+'</strong><small>'+item.childCount+' oggetti'+(item.matchingCount < item.childCount ? ' · '+item.matchingCount+' corrispondenti' : '')+' · '+escapeHtml(formatWeight(item.totalWeight, weightUnit))+'</small></span><span aria-hidden="true">›</span></button>';
  }).join('')+'</div>' : '';
  const table = view.items.length ? buildCompactItemList(view.items, weightUnit, { allowExtract: Boolean(current && !current.isVirtual), allowEquip: !current, allowUnequip: Boolean(current?.isVirtual && !current.isLocation), allowContainerNavigation: Boolean(current), allItems: view.allItems }) : !view.containers.length ? '<p class="compact-table-empty muted">Nessun oggetto corrisponde ai filtri in questa posizione.</p>' : '';
  const locationLabel = current?.isLocation ? `Oggetti in ${escapeHtml(current.name)}` : current?.isVirtual ? 'Oggetti equipaggiati' : current ? 'Contenuto' : 'Oggetti sfusi';
  return (current ? breadcrumb : '') + tools + cards + (view.items.length ? '<p class="inventory-location-label">'+locationLabel+'</p>' : '') + table;
}
