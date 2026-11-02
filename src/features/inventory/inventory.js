import { getContainerView, buildContainerCatalog } from './containerCatalog.js';
import { buildCompactTransactionList } from './compactTables.js';
import { buildCoinBundleMovement, buildCoinExchange, isCoinExchange } from '../wallet/coinMovements.js';
import { openEquipmentItemDetail } from '../character/home/itemDetail.js';
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
import { addSharedItemsToInventory, openItemSourceModal, openSharedItemPicker } from './catalogPicker.js';
import { buildInventoryTree, buildTransactionList, exchangeFields, moneyBundleFields, moneyFields } from './render.js';
import { getCategoryLabel, getWeightUnit, normalizeTransactionAmount } from './utils.js';
import { escapeHtml, sanitizeImageUrl } from '../../lib/html.js';
import { showShortcutLoader } from '../character/home/shortcutViews.js';


const COIN_VALUES = { cp: 1, sp: 10, gp: 100, pp: 1000 };
const COIN_LABELS = { cp: 'Rame', sp: 'Argento', gp: 'Oro', pp: 'Platino' };

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
            <button class="icon-button icon-button--add" type="button" data-add-item aria-label="Nuovo oggetto">
              <span aria-hidden="true">+</span>
            </button>
          </div>
        </header>
        <div class="filters inventory-toolbar ${container.hasAttribute('data-inventory-shortcut') ? 'inventory-toolbar--shortcut' : ''}">
          <label class="inventory-search">
            <span aria-hidden="true">⌕</span>
            <input type="search" placeholder="Cerca" aria-label="Cerca oggetto" data-search />
          </label>
          ${container.hasAttribute('data-inventory-shortcut') ? `
            <div class="inventory-category-pills" role="group" aria-label="Filtra per categoria">
              ${categories.filter((category) => category.value).map((category) => `<button type="button" data-category-option="${escapeHtml(category.value)}" aria-pressed="false">${escapeHtml(category.label)}</button>`).join('')}
            </div>
          ` : '<label class="inventory-category-filter"><span>Categoria</span><select data-category></select></label>'}
          <label class="toggle-pill filter-toggle">
            <input type="checkbox" data-equipable-filter />
            <span>Equipaggiabili</span>
          </label>
          <label class="toggle-pill filter-toggle">
            <input type="checkbox" data-magic-filter />
            <span>Magici</span>
          </label>
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
  const searchInput = container.querySelector('[data-search]');
  const categorySelect = container.querySelector('[data-category]');
  const categoryButtons = [...container.querySelectorAll('[data-category-option]')];
  const equipableFilter = container.querySelector('[data-equipable-filter]');
  const magicFilter = container.querySelector('[data-magic-filter]');
  categories.forEach((cat) => {
    if (!categorySelect) return;
    const option = document.createElement('option');
    option.value = cat.value;
    option.textContent = cat.equipable ? `${cat.label}` : cat.label;
    categorySelect.appendChild(option);
  });

  const previousFilters = container.inventoryFilters || {};
  let activeCategory = previousFilters.category || '';
  searchInput.value = previousFilters.term || '';
  if (categorySelect) categorySelect.value = previousFilters.category || '';
  const syncCategoryButtons = () => categoryButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.categoryOption === activeCategory));
  });
  syncCategoryButtons();
  if (equipableFilter) equipableFilter.checked = Boolean(previousFilters.equipableOnly);
  if (magicFilter) magicFilter.checked = Boolean(previousFilters.magicOnly);
  function renderList() {
    const term = searchInput.value.toLowerCase();
    const category = categorySelect?.value ?? activeCategory;
    const equipableOnly = equipableFilter?.checked ?? false;
    const magicOnly = magicFilter?.checked ?? false;
    container.inventoryFilters = { term, category, equipableOnly, magicOnly };
    const directlyMatched = items.filter((item) => {
      const matchesTerm = item.name.toLowerCase().includes(term);
      const matchesCategory = !category || item.category === category;
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
          try { await updateItem(button.dataset.extractItem, { container_item_id: null }); createToast('Oggetto estratto'); await renderInventory(container); }
          catch { createToast('Errore durante l’estrazione', 'error'); }
        });
      }));
    } else listEl.innerHTML = buildInventoryTree(filtered, weightUnit);
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
            await Promise.all(selectedIds.map((id) => updateItem(id, { container_item_id: containerItem.id })));
            createToast(`${selectedIds.length} ${selectedIds.length === 1 ? 'oggetto inserito' : 'oggetti inseriti'} in ${containerItem.name}`);
            renderInventory(container);
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
        if (item) openItemModal(activeCharacter, item, items, renderInventory.bind(null, container));
      }));
    listEl.querySelectorAll('[data-item-image]')
      .forEach((image) => image.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const item = items.find((entry) => String(entry.id) === image.dataset.itemImage);
        if (item) openEquipmentItemDetail(item, {
          items,
          weightUnit: getWeightUnit(activeCharacter),
          onEdit: () => openItemModal(activeCharacter, item, items, renderInventory.bind(null, container))
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
          onEdit: () => openItemModal(activeCharacter, item, items, renderInventory.bind(null, container))
        });
      }));
    listEl.querySelectorAll('[data-delete]')
      .forEach((btn) => btn.addEventListener('click', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const item = items.find((entry) => entry.id === btn.dataset.delete);
        if (!item) return;
        const isContainer = item.category === 'container';
        const containedItems = isContainer
          ? items.filter((entry) => entry.container_item_id === item.id)
          : [];
        const shouldDelete = await openConfirmModal({
          title: 'Conferma eliminazione oggetto',
          message: isContainer
            ? `Stai per eliminare il contenitore "${item.name}". Gli oggetti al suo interno resteranno nell'inventario senza contenitore. Questa azione non può essere annullata.`
            : `Stai per eliminare l'oggetto "${item.name}" dall'inventario. Questa azione non può essere annullata.`,
          confirmLabel: 'Elimina'
        });
        if (!shouldDelete) return;
        await runWithGlobalLoader(async () => {
          try {
            if (containedItems.length) {
              await Promise.all(containedItems.map((entry) => updateItem(entry.id, { container_item_id: null })));
            }
            await deleteItem(item.id);
            createToast(isContainer ? 'Contenitore eliminato' : 'Oggetto eliminato');
            renderInventory(container);
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
            renderInventory(container);
          } catch (error) {
            createToast('Errore utilizzo consumabile', 'error');
          }
        });
      }));
  }

  renderList();
  searchInput.addEventListener('input', renderList);
  categorySelect?.addEventListener('change', renderList);
  categoryButtons.forEach((button) => button.addEventListener('click', () => {
    const nextCategory = button.dataset.categoryOption || '';
    activeCategory = nextCategory === activeCategory && nextCategory !== '' ? '' : nextCategory;
    syncCategoryButtons();
    renderList();
  }));
  equipableFilter?.addEventListener('change', renderList);
  magicFilter?.addEventListener('change', renderList);

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
            renderInventory(container);
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
          renderInventory(container);
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
          renderInventory(container);
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
          renderInventory(container);
        } catch (error) {
          createToast('Errore eliminazione transazione', 'error');
        }
      });
    }));


  container.querySelector('[data-add-item]').addEventListener('click', async () => {
    const source = await openItemSourceModal();
    if (source === 'manual') {
      openItemModal(activeCharacter, null, items, renderInventory.bind(null, container));
      return;
    }
    if (source !== 'catalog') return;
    const isShortcut = container.hasAttribute('data-inventory-shortcut');
    let stopCatalogLoader = null;
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
        await renderInventory(container);
      } catch (error) {
        createToast('Errore durante l’aggiunta dall’archivio', 'error');
      }
    } finally {
      stopAddingLoader?.();
      if (!isShortcut) setGlobalLoading(false);
    }
  });
}
