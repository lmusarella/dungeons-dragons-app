import { getContainerView, buildContainerCatalog } from './containerCatalog.js';
import { buildCompactTransactionList } from './compactTables.js';
import { buildCoinBundleMovement, buildCoinExchange, isCoinExchange } from '../wallet/coinMovements.js';
import { openEquipmentItemDetail } from '../character/home/itemDetail.js';
import { openEquipmentPicker } from '../character/home/equipmentPicker.js';
import { openEquipmentMannequin } from '../character/home/equipmentMannequin.js';
import { fetchItems, updateItem, deleteItem } from './inventoryApi.js';
import { getState, normalizeCharacterId, updateCache } from '../../app/state.js';
import { cacheSnapshot } from '../../lib/offline/cache.js';
import { createToast, openConfirmModal, openFormModal, setGlobalLoading } from '../../ui/components.js';
import {
  fetchWallet,
  createTransaction,
  fetchTransactions,
  updateTransaction,
  deleteTransaction
} from '../wallet/walletApi.js';
import { renderWalletSummary } from '../wallet/wallet.js';
import { categories } from './constants.js';
import { openItemModal } from './modals.js';
import { addSharedItemsToInventory, openItemSourceModal, openQuickLootItemModal, openSharedItemPicker } from './catalogPicker.js';
import { buildInventoryTree, buildTransactionList, exchangeFields, moneyBundleFields, moneyFields } from './render.js';
import { getCategoryLabel, getEquipSlots, getWeightUnit, normalizeTransactionAmount } from './utils.js';
import { escapeHtml, sanitizeImageUrl } from '../../lib/html.js';
import { showShortcutLoader } from '../character/home/shortcutViews.js';


const COIN_VALUES = { cp: 1, sp: 10, gp: 100, pp: 1000 };
const COIN_LABELS = { cp: 'Rame', sp: 'Argento', gp: 'Oro', pp: 'Platino' };

export function getContainerDescendants(items = [], containerId) {
  const descendants = [];
  const visited = new Set([String(containerId)]);
  const visit = (parentId) => {
    items
      .filter((item) => String(item.container_item_id ?? '') === String(parentId))
      .forEach((item) => {
        const itemId = String(item.id);
        if (visited.has(itemId)) return;
        visited.add(itemId);
        visit(item.id);
        descendants.push(item);
      });
  };
  visit(containerId);
  return descendants;
}

async function chooseContainerDeleteMode(containerItem, containedItems) {
  const content = document.createElement('div');
  content.className = 'condition-modal__section container-delete-choice';
  content.innerHTML = `
    <p class="muted">Il contenitore “${escapeHtml(containerItem.name)}” contiene ${containedItems.length} ${containedItems.length === 1 ? 'oggetto' : 'oggetti'}, inclusi quelli negli eventuali sotto-contenitori.</p>
    <div class="container-delete-choice__options">
      <label class="condition-modal__item container-delete-choice__card is-selected">
        <input type="radio" name="container_delete_mode" value="keep" checked />
        <span class="container-delete-choice__icon" aria-hidden="true">↗</span>
        <span class="condition-modal__item-label"><strong>Conserva il contenuto</strong><small>Gli oggetti resteranno nell’inventario; quelli al primo livello diventeranno sfusi.</small></span>
      </label>
      <label class="condition-modal__item container-delete-choice__card container-delete-choice__card--danger">
        <input type="radio" name="container_delete_mode" value="delete" />
        <span class="container-delete-choice__icon" aria-hidden="true">×</span>
        <span class="condition-modal__item-label"><strong>Elimina anche il contenuto</strong><small>Elimina definitivamente tutti gli oggetti e i sotto-contenitori presenti.</small></span>
      </label>
    </div>`;
  const formData = await openFormModal({
    title: 'Elimina contenitore',
    content,
    submitLabel: 'Elimina contenitore',
    cancelLabel: 'Annulla',
    cardClass: 'modal-card--quick-action',
    onOpen: ({ fieldsEl }) => {
      const syncSelection = () => fieldsEl?.querySelectorAll('.condition-modal__item').forEach((label) => {
        label.classList.toggle('is-selected', Boolean(label.querySelector('input')?.checked));
      });
      fieldsEl?.querySelectorAll('input[name="container_delete_mode"]').forEach((input) => input.addEventListener('change', syncSelection));
      syncSelection();
    }
  });
  return formData?.get('container_delete_mode')?.toString() || null;
}

async function openLooseItemsPicker(containerItem, items) {
  const looseItems = items.filter((item) => !item.container_item_id && item.category !== 'container');
  if (!looseItems.length) {
    createToast('Non ci sono oggetti sfusi da inserire');
    return [];
  }

  const content = document.createElement('div');
  content.className = 'inventory-insert-picker';
  content.innerHTML = `
    <p class="muted inventory-insert-picker__intro">Seleziona uno o più oggetti da spostare in <strong>${escapeHtml(containerItem.name)}</strong>.</p>
    <div class="inventory-insert-picker__list"></div>
  `;
  const list = content.querySelector('.inventory-insert-picker__list');
  looseItems.forEach((item) => {
    const option = document.createElement('label');
    option.className = 'inventory-insert-picker__item';
    const image = sanitizeImageUrl(item.image_url);
    option.innerHTML = `
      <span class="inventory-insert-picker__visual">
        ${image ? `<img src="${image}" alt="" loading="lazy" />` : '<span aria-hidden="true">◇</span>'}
      </span>
      <span class="inventory-insert-picker__details">
        <strong>${escapeHtml(item.name)}</strong>
        <span class="muted">${escapeHtml(getCategoryLabel(item.category))} · Quantità ${escapeHtml(item.qty)}</span>
      </span>
      <input type="checkbox" name="item_ids" value="${escapeHtml(item.id)}" />
    `;
    const input = option.querySelector('input');
    input.addEventListener('change', () => option.classList.toggle('is-selected', input.checked));
    list.appendChild(option);
  });

  const formData = await openFormModal({
    title: `Inserisci in ${containerItem.name}`,
    submitLabel: 'Inserisci selezionati',
    content,
    cardClass: 'modal-card--inventory-insert'
  });
  return formData ? formData.getAll('item_ids') : [];
}

async function equipInventoryItem(character, item, equipSlots, currentItems) {
  const proficiencies = character.data?.proficiencies || {};
  if (item.category === 'weapon') {
    if (!item.weapon_type) {
      createToast('Definisci il tipo di arma prima di equipaggiarla', 'error');
      return false;
    }
    const proficient = item.weapon_type === 'simple'
      ? Boolean(proficiencies.weapon_simple)
      : Boolean(proficiencies.weapon_martial);
    if (!proficient) {
      createToast('Non hai la competenza per equipaggiare questo oggetto', 'error');
      return false;
    }
  }
  if (item.category === 'armor') {
    if (item.is_shield && !proficiencies.shield) {
      createToast('Non hai la competenza per equipaggiare questo oggetto', 'error');
      return false;
    }
    if (!item.is_shield && !item.armor_type) {
      createToast('Definisci il tipo di armatura prima di equipaggiarla', 'error');
      return false;
    }
    if (!item.is_shield) {
      const proficient = item.armor_type === 'light'
        ? Boolean(proficiencies.armor_light)
        : item.armor_type === 'medium'
          ? Boolean(proficiencies.armor_medium)
          : Boolean(proficiencies.armor_heavy);
      if (!proficient) {
        createToast('Non hai la competenza per equipaggiare questo oggetto', 'error');
        return false;
      }
    }
  }
  if (!item.sovrapponibile) {
    const conflicting = currentItems
      .filter((entry) => String(entry.id) !== String(item.id))
      .filter((entry) => getEquipSlots(entry).some((slot) => equipSlots.includes(slot)));
    if (conflicting.length) {
      createToast('Lo slot selezionato è già occupato', 'error');
      return false;
    }
  }
  try {
    const updated = await updateItem(item.id, { equip_slot: equipSlots[0] || null, equip_slots: equipSlots });
    createToast('Oggetto equipaggiato');
    return updated;
  } catch (error) {
    createToast('Errore aggiornamento equipaggiamento', 'error');
    return false;
  }
}

function ensureWallet(wallet, character) {
  if (wallet) return wallet;
  return {
    user_id: character.user_id,
    character_id: character.id,
    cp: 0,
    sp: 0,
    gp: 0,
    pp: 0
  };
}


function attachInventoryAmountStepper(input, { min = 0, max = null } = {}) {
  if (!(input instanceof HTMLInputElement) || input.type !== 'number') return;
  if (input.closest('.inventory-amount-stepper')) return;
  const wrapper = document.createElement('div');
  wrapper.className = 'number-stepper inventory-amount-stepper';
  const dec = document.createElement('button');
  dec.type = 'button';
  dec.className = 'number-stepper__button';
  dec.textContent = '−';
  dec.setAttribute('aria-label', 'Riduci quantità');
  const inc = document.createElement('button');
  inc.type = 'button';
  inc.className = 'number-stepper__button';
  inc.textContent = '+';
  inc.setAttribute('aria-label', 'Aumenta quantità');
  const parent = input.parentNode;
  if (!parent) return;
  parent.insertBefore(wrapper, input);
  wrapper.append(dec, input, inc);
  const step = (direction) => {
    const curr = Number.isFinite(input.valueAsNumber) ? input.valueAsNumber : Number(input.value || 0);
    const stepValue = Number(input.step);
    const delta = Number.isFinite(stepValue) && stepValue > 0 ? stepValue : 1;
    let next = curr + (delta * direction);
    const minValue = min ?? (input.min !== '' ? Number(input.min) : null);
    const maxValue = max ?? (input.max !== '' ? Number(input.max) : null);
    if (Number.isFinite(minValue)) next = Math.max(minValue, next);
    if (Number.isFinite(maxValue)) next = Math.min(maxValue, next);
    input.value = String(next);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  };
  dec.addEventListener('click', () => step(-1));
  inc.addEventListener('click', () => step(1));
}

export async function renderInventory(container) {
  const state = getState();
  const normalizedActiveId = normalizeCharacterId(state.activeCharacterId);
  const activeCharacter = state.characters.find((char) => normalizeCharacterId(char.id) === normalizedActiveId);
  if (!activeCharacter) {
    container.innerHTML = '<section class="card"><p>Nessun personaggio selezionato.</p></section>';
    return;
  }

  const runWithGlobalLoader = async (action) => {
    setGlobalLoading(true);
    try {
      return await action();
    } finally {
      setGlobalLoading(false);
    }
  };
  const refreshAfterMutation = async () => {
    container.dataset.shortcutChanged = 'true';
    await renderInventory(container);
  };

  let items = state.cache.items;
  let wallet = state.cache.wallet;
  let transactions = [];
  if (!state.offline) {
    try {
      items = await fetchItems(activeCharacter.id);
      updateCache('items', items);
      await cacheSnapshot({ items });
    } catch (error) {
      createToast('Errore caricamento inventario', 'error');
    }
    try {
      wallet = await fetchWallet(activeCharacter.id);
      updateCache('wallet', wallet);
      if (wallet) await cacheSnapshot({ wallet });
    } catch (error) {
      createToast('Errore caricamento wallet', 'error');
    }
    try {
      transactions = await fetchTransactions(activeCharacter.id);
    } catch (error) {
      createToast('Errore caricamento transazioni', 'error');
    }
  }

  const weightUnit = getWeightUnit(activeCharacter);
  const weightStep = weightUnit === 'kg' ? '0.1' : '1';
  container.innerHTML = `
    <div class="inventory-layout">
      <section class="card inventory-main inventory-panel">
        <header class="card-header inventory-panel__header">
          <div>
            <p class="eyebrow">Inventario</p>
            <span class="inventory-panel__subtitle">${items.length} ${items.length === 1 ? 'oggetto registrato' : 'oggetti registrati'}</span>
          </div>
          <div class="button-row">
            <button class="ghost-button inventory-add-items-action" type="button" data-add-item aria-label="Aggiungi oggetti">+ Aggiungi oggetti</button>
          </div>
        </header>
        <div class="filters inventory-toolbar ${container.hasAttribute('data-inventory-shortcut') ? 'inventory-toolbar--shortcut' : ''}">
          ${container.hasAttribute('data-inventory-shortcut') ? `
            <div class="inventory-category-pills" role="group" aria-label="Filtra per categoria">
              ${categories.filter((category) => category.value).map((category) => `<button type="button" data-category-option="${escapeHtml(category.value)}" aria-pressed="false">${escapeHtml(category.label)}</button>`).join('')}
            </div>
          ` : '<label class="inventory-category-filter"><span>Categoria</span><select data-category></select></label>'}
          <label class="inventory-filter-card">
            <input type="checkbox" data-equipable-filter />
            <span><i aria-hidden="true">♙</i><strong>Equipaggiabili</strong></span>
          </label>
          <label class="inventory-filter-card">
            <input type="checkbox" data-magic-filter />
            <span><i aria-hidden="true">✦</i><strong>Magici</strong></span>
          </label>
          <button type="button" class="ghost-button inventory-filter-reset" data-reset-filters disabled>Reimposta</button>
        </div>
        <div class="inventory-list-scroll" data-inventory-list></div>
      </section>
      <div class="inventory-side">
        <section class="card inventory-wallet inventory-side-card inventory-side-card--wallet">
          <header class="card-header inventory-side-card__header">
            <p class="eyebrow">Monete</p>
          </header>
          ${renderWalletSummary(wallet)}
        </section>
        <section class="card inventory-side-card inventory-side-card--transactions">
          <header class="card-header inventory-side-card__header">
            <p class="eyebrow">Transazioni</p>
            <div class="button-row">
              <button class="icon-button icon-button--swap" type="button" data-exchange-coins aria-label="Scambia monete" title="Scambia monete">
                <span aria-hidden="true">⇄</span>
              </button>
            </div>
          </header>
          <div class="inventory-transactions">
            ${state.offline ? '<p class="muted">Transazioni disponibili solo online.</p>' : container.hasAttribute('data-inventory-shortcut') ? buildCompactTransactionList(transactions) : buildTransactionList(transactions).outerHTML}
          </div>
        </section>
      </div>
    </div>
  `;

  container.polishShortcut?.({ offline: state.offline, wallet });
  const listEl = container.querySelector('[data-inventory-list]');
  const categorySelect = container.querySelector('[data-category]');
  const categoryButtons = [...container.querySelectorAll('[data-category-option]')];
  const equipableFilter = container.querySelector('[data-equipable-filter]');
  const magicFilter = container.querySelector('[data-magic-filter]');
  const resetFiltersButton = container.querySelector('[data-reset-filters]');
  const openInventoryEquipmentPicker = async () => {
    const result = await openEquipmentPicker({
      items,
      weightUnit,
      canEdit: true,
      onEquip: (item, equipSlots, currentItems) => equipInventoryItem(activeCharacter, item, equipSlots, currentItems),
      onUnequip: async (item) => {
        try {
          const updated = await updateItem(item.id, { equip_slot: null, equip_slots: [] });
          createToast('Oggetto disequipaggiato');
          return updated;
        } catch (error) {
          createToast('Errore durante il disequipaggiamento', 'error');
          return false;
        }
      }
    });
    if (result?.changed) await refreshAfterMutation();
  };
  categories.forEach((cat) => {
    if (!categorySelect) return;
    const option = document.createElement('option');
    option.value = cat.value;
    option.textContent = cat.equipable ? `${cat.label}` : cat.label;
    categorySelect.appendChild(option);
  });

  const previousFilters = container.inventoryFilters || {};
  const activeCategories = new Set(Array.isArray(previousFilters.categories)
    ? previousFilters.categories
    : (previousFilters.category ? [previousFilters.category] : []));
  if (categorySelect) categorySelect.value = previousFilters.category || '';
  const syncCategoryButtons = () => categoryButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(activeCategories.has(button.dataset.categoryOption)));
  });
  syncCategoryButtons();
  if (equipableFilter) equipableFilter.checked = Boolean(previousFilters.equipableOnly);
  if (magicFilter) magicFilter.checked = Boolean(previousFilters.magicOnly);
  function renderList() {
    const term = '';
    const category = categorySelect?.value || '';
    const selectedCategories = categorySelect
      ? (category ? [category] : [])
      : [...activeCategories];
    const equipableOnly = equipableFilter?.checked ?? false;
    const magicOnly = magicFilter?.checked ?? false;
    container.inventoryFilters = { term, category, categories: selectedCategories, equipableOnly, magicOnly };
    if (resetFiltersButton) {
      resetFiltersButton.disabled = !(term || selectedCategories.length || equipableOnly || magicOnly);
    }
    const directlyMatched = items.filter((item) => {
      const matchesTerm = item.name.toLowerCase().includes(term);
      const matchesCategory = !selectedCategories.length || selectedCategories.includes(item.category);
      const matchesEquipable = !equipableOnly || item.equipable;
      const matchesMagic = !magicOnly || item.is_magic;
      return matchesTerm && matchesCategory && matchesEquipable && matchesMagic;
    });

    const itemById = new Map(items.map((item) => [String(item.id), item]));
    const childrenByContainer = new Map();
    items.forEach((item) => {
      const containerId = item.container_item_id;
      if (!containerId) return;
      const key = String(containerId);
      if (!childrenByContainer.has(key)) {
        childrenByContainer.set(key, []);
      }
      childrenByContainer.get(key).push(item);
    });

    const visibleIds = new Set(directlyMatched.map((item) => String(item.id)));
    const includeAncestors = (item) => {
      let cursor = item;
      while (cursor?.container_item_id) {
        const parent = itemById.get(String(cursor.container_item_id));
        if (!parent) break;
        const parentId = String(parent.id);
        if (visibleIds.has(parentId)) break;
        visibleIds.add(parentId);
        cursor = parent;
      }
    };
    const includeDescendants = (item) => {
      const stack = [...(childrenByContainer.get(String(item.id)) || [])];
      while (stack.length) {
        const child = stack.pop();
        const childId = String(child.id);
        if (visibleIds.has(childId)) continue;
        visibleIds.add(childId);
        const nested = childrenByContainer.get(childId);
        if (nested?.length) {
          stack.push(...nested);
        }
      }
    };

    directlyMatched.forEach((item) => {
      includeAncestors(item);
      if (item.category === 'container') {
        includeDescendants(item);
      }
    });

    const filtered = items.filter((item) => visibleIds.has(String(item.id)));

    if (container.hasAttribute('data-inventory-shortcut')) {
      const view = getContainerView(items, container.inventoryFilters, container.dataset.inventoryContainer);
      if (!view.container) delete container.dataset.inventoryContainer;
      listEl.innerHTML = buildContainerCatalog(view, weightUnit);
      listEl.querySelectorAll('[data-open-container]').forEach(button => button.addEventListener('click', () => {
        container.dataset.inventoryContainer = button.dataset.openContainer; renderList();
      }));
      listEl.querySelectorAll('[data-extract-item]').forEach(button => button.addEventListener('click', async () => {
        await runWithGlobalLoader(async () => {
          try { await updateItem(button.dataset.extractItem, { container_item_id: null }); createToast('Oggetto estratto'); await refreshAfterMutation(); }
          catch { createToast('Errore durante l’estrazione', 'error'); }
        });
      }));
      listEl.querySelector('[data-equip-container]')?.addEventListener('click', openInventoryEquipmentPicker);
    } else listEl.innerHTML = buildInventoryTree(filtered, weightUnit);
    listEl.querySelectorAll('[data-equip-item]').forEach((button) => button.addEventListener('click', async () => {
        const item = items.find((entry) => String(entry.id) === String(button.dataset.equipItem));
        if (!item) return;
        const result = await openEquipmentMannequin({
          items,
          weightUnit,
          canEdit: true,
          initialItemId: item.id,
          singleItem: true,
          title: `Equipaggia · ${item.name}`,
          onEquip: (selectedItem, equipSlots, currentItems) => equipInventoryItem(activeCharacter, selectedItem, equipSlots, currentItems),
          onUnequip: async (selectedItem) => {
            try {
              const updated = await updateItem(selectedItem.id, { equip_slot: null, equip_slots: [] });
              createToast('Oggetto disequipaggiato');
              return updated;
            } catch (error) {
              createToast('Errore durante il disequipaggiamento', 'error');
              return false;
            }
          }
        });
        if (result?.changed) await refreshAfterMutation();
    }));
    if (container.hasAttribute('data-inventory-shortcut')) {
      listEl.querySelectorAll('[data-unequip-item]').forEach((button) => button.addEventListener('click', async () => {
        await runWithGlobalLoader(async () => {
          try {
            await updateItem(button.dataset.unequipItem, { equip_slot: null, equip_slots: [] });
            createToast('Oggetto disequipaggiato');
            await refreshAfterMutation();
          } catch (error) {
            createToast('Errore durante il disequipaggiamento', 'error');
          }
        });
      }));
    }
    listEl.querySelectorAll('[data-insert-container]')
      .forEach((button) => button.addEventListener('click', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const containerItem = items.find((item) => String(item.id) === button.dataset.insertContainer);
        if (!containerItem) return;
        const selectedIds = await openLooseItemsPicker(containerItem, items);
        if (!selectedIds.length) return;
        await runWithGlobalLoader(async () => {
          try {
            await Promise.all(selectedIds.map((id) => updateItem(id, { container_item_id: containerItem.id, inventory_location: null })));
            createToast(`${selectedIds.length} ${selectedIds.length === 1 ? 'oggetto inserito' : 'oggetti inseriti'} in ${containerItem.name}`);
            refreshAfterMutation();
          } catch (error) {
            createToast('Errore durante l’inserimento degli oggetti', 'error');
          }
        });
      }));
    listEl.querySelectorAll('[data-edit]')
      .forEach((btn) => btn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const item = items.find((entry) => entry.id === btn.dataset.edit);
        if (item) openItemModal(activeCharacter, item, items, refreshAfterMutation);
      }));
    listEl.querySelectorAll('[data-item-image]')
      .forEach((image) => image.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const item = items.find((entry) => String(entry.id) === image.dataset.itemImage);
        if (item) openEquipmentItemDetail(item, {
          items,
          weightUnit: getWeightUnit(activeCharacter),
          onEdit: () => openItemModal(activeCharacter, item, items, refreshAfterMutation)
        });
      }));
    listEl.querySelectorAll('[data-item-preview]')
      .forEach((button) => button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const item = items.find((entry) => String(entry.id) === button.dataset.itemPreview);
        if (item) openEquipmentItemDetail(item, {
          items,
          weightUnit: getWeightUnit(activeCharacter),
          onEdit: () => openItemModal(activeCharacter, item, items, refreshAfterMutation)
        });
      }));
    listEl.querySelectorAll('[data-delete]')
      .forEach((btn) => btn.addEventListener('click', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const item = items.find((entry) => entry.id === btn.dataset.delete);
        if (!item) return;
        const isContainer = item.category === 'container';
        const containedItems = isContainer ? getContainerDescendants(items, item.id) : [];
        let containerDeleteMode = 'keep';
        if (isContainer && containedItems.length) {
          containerDeleteMode = await chooseContainerDeleteMode(item, containedItems);
          if (!containerDeleteMode) return;
        } else {
          const shouldDelete = await openConfirmModal({
            title: 'Conferma eliminazione oggetto',
            message: isContainer
              ? `Stai per eliminare il contenitore vuoto "${item.name}". Questa azione non può essere annullata.`
              : `Stai per eliminare l'oggetto "${item.name}" dall'inventario. Questa azione non può essere annullata.`,
            confirmLabel: 'Elimina'
          });
          if (!shouldDelete) return;
        }
        await runWithGlobalLoader(async () => {
          try {
            if (containedItems.length && containerDeleteMode === 'delete') {
              for (const entry of containedItems) await deleteItem(entry.id);
            } else if (containedItems.length) {
              const directItems = containedItems.filter((entry) => String(entry.container_item_id) === String(item.id));
              await Promise.all(directItems.map((entry) => updateItem(entry.id, {
                container_item_id: null,
                inventory_location: item.inventory_location || null
              })));
            }
            await deleteItem(item.id);
            createToast(isContainer && containerDeleteMode === 'delete'
              ? 'Contenitore e contenuto eliminati'
              : (isContainer ? 'Contenitore eliminato; contenuto conservato' : 'Oggetto eliminato'));
            refreshAfterMutation();
          } catch (error) {
            createToast('Errore eliminazione', 'error');
          }
        });
      }));
    listEl.querySelectorAll('[data-use]')
      .forEach((btn) => btn.addEventListener('click', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const item = items.find((entry) => entry.id === btn.dataset.use);
        if (!item) return;
        if (item.qty <= 0) {
          createToast('Quantità esaurita', 'error');
          return;
        }
        await runWithGlobalLoader(async () => {
          try {
            const nextQty = Math.max(item.qty - 1, 0);
            await updateItem(item.id, { qty: nextQty });
            createToast('Consumabile usato');
            refreshAfterMutation();
          } catch (error) {
            createToast('Errore utilizzo consumabile', 'error');
          }
        });
      }));
  }

  renderList();
  categorySelect?.addEventListener('change', renderList);
  categoryButtons.forEach((button) => button.addEventListener('click', () => {
    const nextCategory = button.dataset.categoryOption || '';
    if (activeCategories.has(nextCategory)) activeCategories.delete(nextCategory);
    else activeCategories.add(nextCategory);
    syncCategoryButtons();
    renderList();
  }));
  equipableFilter?.addEventListener('change', renderList);
  magicFilter?.addEventListener('change', renderList);
  resetFiltersButton?.addEventListener('click', () => {
    if (categorySelect) categorySelect.value = '';
    activeCategories.clear();
    if (equipableFilter) equipableFilter.checked = false;
    if (magicFilter) magicFilter.checked = false;
    syncCategoryButtons();
    renderList();
  });

  document.querySelectorAll('[data-money-action]')
    .forEach((button) => {
      if (button.dataset.bound) return;
      button.dataset.bound = 'true';
      button.addEventListener('click', async () => {
        const route = window.location.hash.replace('#/', '') || 'home';
        if (route !== 'inventory' && !button.closest('[data-inventory-shortcut]')) return;
        const latestState = getState();
        const latestCharacterId = normalizeCharacterId(latestState.activeCharacterId);
        const latestCharacter = latestState.characters
          .find((char) => normalizeCharacterId(char.id) === latestCharacterId);
        if (!latestCharacter) return;

        wallet = latestState.cache.wallet;
        const activeUserId = latestCharacter.user_id;
        const activeCharacterId = latestCharacter.id;

        const direction = button.dataset.moneyAction;
        const title = direction === 'pay' ? 'Paga monete' : 'Ricevi monete';
        const submitLabel = direction === 'pay' ? 'Paga' : 'Ricevi';
        wallet = ensureWallet(wallet, latestCharacter);
        const initialAmounts = button.dataset.coin ? { [button.dataset.coin]: 1 } : {};
        const formData = await openFormModal({
          title,
          submitLabel,
          cardClass: 'modal-card--quick-action',
          content: moneyBundleFields({ direction, amounts: initialAmounts, wallet }),
          onOpen: ({ fieldsEl }) => {
            fieldsEl?.querySelectorAll('.money-bundle__coin input[type="number"]').forEach((input) => {
              attachInventoryAmountStepper(input, { min: 0, max: input.max === '' ? null : Number(input.max) });
            });
          }
        });
        if (!formData) return;
        let signedDelta;
        try {
          signedDelta = buildCoinBundleMovement(wallet, {
            pp: formData.get('amount_pp'), gp: formData.get('amount_gp'),
            sp: formData.get('amount_sp'), cp: formData.get('amount_cp')
          }, direction);
        }
        catch (error) { createToast(error.message, 'error'); return; }
        await runWithGlobalLoader(async () => {
          try {
            const saved = await createTransaction({
              user_id: activeUserId,
              character_id: activeCharacterId,
              direction,
              amount: signedDelta,
              reason: formData.get('reason'),
              occurred_on: formData.get('occurred_on')
            });
            wallet = saved;
            updateCache('wallet', saved);
            await cacheSnapshot({ wallet: saved });
            createToast('Wallet aggiornato');
            refreshAfterMutation();
          } catch (error) {
            createToast('Errore aggiornamento denaro', 'error');
          }
        });
      });
    });

  const exchangeButton = container.querySelector('[data-exchange-coins]');
  if (exchangeButton && !exchangeButton.dataset.bound) {
    exchangeButton.dataset.bound = 'true';
    exchangeButton.addEventListener('click', async () => {
      const available = {
        cp: Number(wallet?.cp ?? 0),
        sp: Number(wallet?.sp ?? 0),
        gp: Number(wallet?.gp ?? 0),
        pp: Number(wallet?.pp ?? 0)
      };
      const availableCoins = Object.keys(available).filter((coin) => available[coin] > 0);
      const defaultSource = availableCoins[0] ?? 'gp';
      const defaultTarget = availableCoins.find((coin) => coin !== defaultSource)
        ?? (defaultSource === 'pp' ? 'gp' : 'pp');
      const formData = await openFormModal({
        title: 'Scambia monete',
        submitLabel: 'Scambia',
        content: exchangeFields({
          available,
          source: defaultSource,
          target: defaultTarget
        }),
        onOpen: ({ fieldsEl }) => {
          if (!fieldsEl) return null;
          const amountInput = fieldsEl.querySelector('input[name="amount"]');
          if (amountInput) attachInventoryAmountStepper(amountInput, { min: 0 });
          const sourceSelect = fieldsEl.querySelector('select[name="source"]');
          const targetSelect = fieldsEl.querySelector('select[name="target"]');
          const targetInput = fieldsEl.querySelector('input[name="target_amount"]');
          const maxButton = fieldsEl.querySelector('[data-exchange-max]');
          const availableHint = fieldsEl.querySelector('[data-exchange-available]');

          const clampExchange = (source, target, amount) => {
            const sourceValue = COIN_VALUES[source];
            const targetValue = COIN_VALUES[target];
            if (!sourceValue || !targetValue) {
              return { amount: 0, targetAmount: 0 };
            }
            const availableAmount = Number(available[source] ?? 0);
            const normalizedAmount = Math.min(Number(amount) || 0, availableAmount);
            const totalCp = normalizedAmount * sourceValue;
            const targetAmount = Math.floor(totalCp / targetValue);
            const adjustedAmount = Math.floor((targetAmount * targetValue) / sourceValue);
            return { amount: adjustedAmount, targetAmount };
          };

          const updateAvailableHint = (source) => {
            if (!availableHint) return;
            if (!source) {
              availableHint.textContent = 'Nessuna moneta disponibile';
              return;
            }
            const label = COIN_LABELS[source] ?? source;
            availableHint.textContent = `Disponibili: ${available[source] ?? 0} ${label}`;
          };

          const syncValues = (nextAmount, { useAdjustedAmount = true } = {}) => {
            const source = sourceSelect?.value;
            const target = targetSelect?.value;
            if (!source || !target || !amountInput || !targetInput) return;
            const result = clampExchange(source, target, nextAmount);
            if (useAdjustedAmount) {
              amountInput.value = result.amount;
            }
            targetInput.value = result.targetAmount;
          };

          if (sourceSelect) {
            updateAvailableHint(sourceSelect.value);
          }
          if (amountInput && targetInput) {
            syncValues(amountInput.value, { useAdjustedAmount: true });
          }

          const onSourceChange = () => {
            updateAvailableHint(sourceSelect?.value);
            syncValues(amountInput?.value ?? 0, { useAdjustedAmount: true });
          };
          const onTargetChange = () => {
            syncValues(amountInput?.value ?? 0, { useAdjustedAmount: true });
          };
          const onAmountInput = () => {
            syncValues(amountInput?.value ?? 0, { useAdjustedAmount: true });
          };
          const onMaxClick = () => {
            if (!sourceSelect || !targetSelect || !amountInput) return;
            const source = sourceSelect.value;
            const target = targetSelect.value;
            const maxAmount = clampExchange(source, target, available[source] ?? 0).amount;
            amountInput.value = maxAmount;
            syncValues(maxAmount, { useAdjustedAmount: false });
          };

          sourceSelect?.addEventListener('change', onSourceChange);
          targetSelect?.addEventListener('change', onTargetChange);
          amountInput?.addEventListener('input', onAmountInput);
          maxButton?.addEventListener('click', onMaxClick);

          return () => {
            sourceSelect?.removeEventListener('change', onSourceChange);
            targetSelect?.removeEventListener('change', onTargetChange);
            amountInput?.removeEventListener('input', onAmountInput);
            maxButton?.removeEventListener('click', onMaxClick);
          };
        }
      });
      if (!formData) return;
      wallet = ensureWallet(wallet, activeCharacter);
      const amount = Number(formData.get('amount') || 0);
      const source = formData.get('source');
      const target = formData.get('target');
      let exchange;
      try { exchange = buildCoinExchange(wallet, source, target, amount); }
      catch (error) { createToast(error.message, 'error'); return; }
      const { amount: adjustedAmount, targetAmount, delta } = exchange;
      if (adjustedAmount !== amount) createToast('Quantità adeguata a ' + adjustedAmount + ' per un cambio preciso', 'info');
      await runWithGlobalLoader(async () => {
        try {
          const saved = await createTransaction({
            character_id: activeCharacter.id, direction: 'receive', amount: delta,
            reason: 'Scambio: ' + adjustedAmount + ' ' + source.toUpperCase() + ' → ' + targetAmount + ' ' + target.toUpperCase()
          });
          wallet = saved;
          updateCache('wallet', saved);
          await cacheSnapshot({ wallet: saved });
          createToast('Scambio completato');
          refreshAfterMutation();
        } catch (error) {
          createToast('Errore scambio monete', 'error');
        }
      });
    });
  }

  const transactionAmount = (transaction) => {
    const normalized = normalizeTransactionAmount(transaction.amount);
    return {
      cp: Number(normalized.cp ?? 0),
      sp: Number(normalized.sp ?? 0),
      gp: Number(normalized.gp ?? 0),
      pp: Number(normalized.pp ?? 0)
    };
  };

  const formatDateValue = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  const findPrimaryCoin = (amounts) => {
    const entries = ['pp', 'gp', 'sp', 'cp']
      .map((coin) => ({ coin, value: Number(amounts[coin] ?? 0) }))
      .find((entry) => entry.value !== 0);
    return entries ?? { coin: 'gp', value: 0 };
  };

  container.querySelectorAll('[data-edit-transaction]')
    .forEach((button) => button.addEventListener('click', async () => {
      const transaction = transactions.find((entry) => entry.id === button.dataset.editTransaction);
      if (!transaction) return;
      const currentAmounts = transactionAmount(transaction);
      if (isCoinExchange(currentAmounts)) return;
      const { coin, value } = findPrimaryCoin(currentAmounts);
      const formData = await openFormModal({
        title: 'Modifica transazione',
        submitLabel: 'Salva',
        content: moneyFields({
          amount: Math.abs(value),
          coin,
          reason: transaction.reason ?? '',
          occurredOn: formatDateValue(transaction.occurred_on || transaction.created_at),
          direction: transaction.direction,
          includeDirection: true
        }),
        onOpen: ({ fieldsEl }) => {
          const amountInput = fieldsEl?.querySelector('input[name="amount"]');
          if (amountInput) attachInventoryAmountStepper(amountInput, { min: 0 });
        }
      });
      if (!formData) return;
      const nextDirection = formData.get('direction') || transaction.direction;
      const nextCoin = formData.get('coin');
      const amountValue = Number(formData.get('amount') || 0);
      const sign = nextDirection === 'pay' ? -1 : 1;
      const nextSigned = { cp: 0, sp: 0, gp: 0, pp: 0, [nextCoin]: amountValue * sign };
      await runWithGlobalLoader(async () => {
        try {
          const saved = await updateTransaction(transaction.id, {
            direction: nextDirection,
            amount: nextSigned,
            reason: formData.get('reason'),
            occurred_on: formData.get('occurred_on')
          });
          wallet = saved;
          updateCache('wallet', saved);
          await cacheSnapshot({ wallet: saved });
          createToast('Transazione aggiornata');
          refreshAfterMutation();
        } catch (error) {
          createToast('Errore aggiornamento transazione', 'error');
        }
      });
    }));

  container.querySelectorAll('[data-delete-transaction]')
    .forEach((button) => button.addEventListener('click', async () => {
      const transaction = transactions.find((entry) => entry.id === button.dataset.deleteTransaction);
      if (!transaction) return;
      const shouldDelete = await openConfirmModal({
        title: 'Conferma eliminazione transazione',
        message: "Stai per eliminare una transazione dal registro del denaro. I saldi verranno aggiornati di conseguenza e l'azione non può essere annullata.",
        confirmLabel: 'Elimina'
      });
      if (!shouldDelete) return;
      await runWithGlobalLoader(async () => {
        try {
          const saved = await deleteTransaction(transaction.id);
          wallet = saved;
          updateCache('wallet', saved);
          await cacheSnapshot({ wallet: saved });
          createToast('Transazione eliminata');
          refreshAfterMutation();
        } catch (error) {
          createToast('Errore eliminazione transazione', 'error');
        }
      });
    }));


  container.querySelector('[data-add-item]').addEventListener('click', async () => {
    const isShortcut = container.hasAttribute('data-inventory-shortcut');
    let stopCatalogLoader = null;
    if (isShortcut) {
      let manualRequested = false;
      const selected = await openSharedItemPicker({
        title: 'Loot rapido',
        allowQuantities: true,
        headerActionLabel: 'Aggiungi oggetto',
        onHeaderAction: () => { manualRequested = true; },
        shortcutSize: true,
        onLoadingChange: (isLoading) => {
          if (isLoading) stopCatalogLoader = showShortcutLoader(container, 'Caricamento archivio oggetti');
          else {
            stopCatalogLoader?.();
            stopCatalogLoader = null;
          }
        }
      });
      if (manualRequested) {
        try {
          const created = await openQuickLootItemModal(activeCharacter, { shortcutSize: true });
          if (created) {
            createToast('Oggetto aggiunto', 'success');
            await refreshAfterMutation();
          }
        } catch (error) {
          createToast('Errore durante l’aggiunta dell’oggetto', 'error');
        }
        return;
      }
      if (!selected.length) return;
      const stopAddingLoader = showShortcutLoader(container, 'Aggiunta oggetti');
      try {
        await addSharedItemsToInventory(selected, activeCharacter);
        const totalQuantity = selected.reduce((total, item) => total + Math.max(1, Number(item.selected_quantity) || 1), 0);
        createToast(`${totalQuantity} ${totalQuantity === 1 ? 'unità aggiunta' : 'unità aggiunte'} all’inventario`, 'success');
        await refreshAfterMutation();
      } catch (error) {
        createToast('Errore durante l’aggiunta dall’archivio', 'error');
      } finally {
        stopAddingLoader();
      }
      return;
    }
    const source = await openItemSourceModal();
    if (source === 'manual') {
      openItemModal(activeCharacter, null, items, refreshAfterMutation);
      return;
    }
    if (source !== 'catalog') return;
    const selected = await openSharedItemPicker({
      title: 'Aggiungi oggetti dall’archivio',
      onLoadingChange: (isLoading) => {
        if (!isShortcut) {
          setGlobalLoading(isLoading);
          return;
        }
        if (isLoading) stopCatalogLoader = showShortcutLoader(container, 'Caricamento archivio oggetti');
        else {
          stopCatalogLoader?.();
          stopCatalogLoader = null;
        }
      }
    });
    if (!selected.length) return;
    const stopAddingLoader = isShortcut ? showShortcutLoader(container, 'Aggiunta oggetti') : null;
    if (!isShortcut) setGlobalLoading(true);
    try {
      try {
        await addSharedItemsToInventory(selected, activeCharacter);
        createToast(`${selected.length} ${selected.length === 1 ? 'oggetto aggiunto' : 'oggetti aggiunti'} all’inventario`, 'success');
        await refreshAfterMutation();
      } catch (error) {
        createToast('Errore durante l’aggiunta dall’archivio', 'error');
      }
    } finally {
      stopAddingLoader?.();
      if (!isShortcut) setGlobalLoading(false);
    }
  });
}
