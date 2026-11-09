import { isCoinExchange } from '../wallet/coinMovements.js';
import { buildCompactItemList } from './compactTables.js';
import { formatWeight } from '../../lib/format.js';
import { calcItemWeight } from '../../lib/calc.js';
import {
  getCategoryLabel,
  getEquipSlots,
  getInventoryItemValueDisplay,
  getItemStatusLabels,
  normalizeTransactionAmount
} from './utils.js';
import { ammunitionTypeLabels, damageTypeLabels, itemCategories } from './constants.js';
import { escapeHtml, sanitizeImageUrl } from '../../lib/html.js';

function buildTransactionAmount(amount) {
  const baseUrl = import.meta.env.BASE_URL;
  const coinIcons = {
    pp: `${baseUrl}icons/moneta_platino.png`,
    gp: `${baseUrl}icons/moneta_oro.png`,
    sp: `${baseUrl}icons/moneta_argento.png`,
    cp: `${baseUrl}icons/moneta_rame.png`
  };
  const normalized = normalizeTransactionAmount(amount);
  const entries = ['pp', 'gp', 'sp', 'cp']
    .map((coin) => ({ coin, value: Number(normalized?.[coin] ?? 0) }))
    .filter((entry) => entry.value !== 0);
  const safeEntries = entries.length ? entries : [{ coin: 'gp', value: 0 }];
  return safeEntries.map((entry, index) => `
      ${index ? '<span class="transaction-coin__divider" aria-hidden="true">·</span>' : ''}
      <span class="transaction-coin" data-coin="${entry.coin}">
        <span class="coin-avatar coin-avatar--${entry.coin}" aria-hidden="true">
          <img src="${coinIcons[entry.coin]}" alt="" loading="lazy" />
        </span>
        <span class="transaction-coin__value">${entry.value}</span>
      </span>
    `).join('');
}

function buildTransactionAmountLabel(amount) {
  const normalized = normalizeTransactionAmount(amount);
  const entries = ['pp', 'gp', 'sp', 'cp']
    .map((coin) => ({ coin, value: Number(normalized?.[coin] ?? 0) }))
    .filter((entry) => entry.value !== 0);
  if (!entries.length) return '0 gp';
  return entries.map((entry) => `${entry.value} ${entry.coin}`).join(' · ');
}

function buildInventoryItemValue(item) {
  const value = getInventoryItemValueDisplay(item);
  return `<span class="inventory-item-value" title="${value.amount} ${value.unitLabel}"><span class="inventory-item-value__coin coin-avatar coin-avatar--${value.key}" aria-hidden="true"><img src="${import.meta.env.BASE_URL}icons/${value.icon}" alt="" loading="lazy"></span><span class="inventory-item-value__text"><strong>${value.amount}</strong><small>${value.unitLabel}</small></span></span>`;
}

const TRANSACTION_SCROLL_THRESHOLD = 8;


function buildCoinField(label, name, value, iconSrc, coinClass) {
  return `
      <label class="field wallet-edit-field">
        <span class="wallet-edit-field__label">
          <span class="coin-avatar ${coinClass}" aria-hidden="true">
            <img src="${iconSrc}" alt="" loading="lazy" />
          </span>
          <span>${label}</span>
        </span>
        <input name="${name}" type="number" value="${value}" min="0" step="1" />
      </label>
  `;
}


function buildTransactionItem(transaction) {
  const item = document.createElement('li');
  const exchange = isCoinExchange(normalizeTransactionAmount(transaction.amount));
  const directionLabel = exchange ? 'Scambio' : transaction.direction === 'pay' ? 'Pagamento' : 'Entrata';
  const amountLabel = buildTransactionAmount(transaction.amount);
  const amountLabelText = buildTransactionAmountLabel(transaction.amount);
  const directionClass = transaction.direction === 'pay' ? 'transaction-item--outgoing' : 'transaction-item--incoming';
  item.className = `transaction-item ${directionClass}`;
  item.innerHTML = `
      <div class="transaction-info">
        <p class="muted">${escapeHtml(transaction.reason || 'Nessuna nota')}</p>
      </div>
      <span class="transaction-amount" aria-label="${escapeHtml(amountLabelText)}">${amountLabel}</span>
      <div class="transaction-meta">
        <span class="resource-chip transaction-direction-chip ${transaction.direction === 'pay' ? 'transaction-direction-chip--outgoing' : 'transaction-direction-chip--incoming'}">${directionLabel}</span>
        <div class="transaction-actions">
          ${exchange ? '' : `<button class="icon-button transaction-action-button" type="button" data-edit-transaction="${escapeHtml(transaction.id)}" aria-label="Modifica transazione" title="Modifica">
            <span aria-hidden="true">✏️</span>
          </button>`}

          <button class="icon-button icon-button--danger transaction-action-button transaction-action-button--danger" type="button" data-delete-transaction="${escapeHtml(transaction.id)}" aria-label="Elimina transazione" title="Elimina">
            <span aria-hidden="true">🗑️</span>
          </button>
        </div>
      </div>
    `;
  return item;
}

function buildTransactionGroup({ title, transactions, open = false }) {
  const details = document.createElement('details');
  details.className = 'transaction-accordion';
  details.open = open;
  const totalCount = transactions.length;
  const summary = document.createElement('summary');
  summary.className = 'transaction-accordion__summary';
  summary.innerHTML = `
    <span class="inventory-container-accordion__icon" aria-hidden="true">▾</span>
    <span class="transaction-accordion__title">${title}</span>
    <span class="transaction-accordion__count">${totalCount} ${totalCount === 1 ? 'movimento' : 'movimenti'}</span>
  `;
  const body = document.createElement('div');
  body.className = 'transaction-accordion__body';
  if (!transactions.length) {
    body.innerHTML = `<p class="muted">Nessuna ${title.toLowerCase()} registrata.</p>`;
  } else {
    const list = document.createElement('ul');
    list.className = 'transaction-items';
    transactions.forEach((transaction) => list.appendChild(buildTransactionItem(transaction)));
    body.appendChild(list);
  }
  details.classList.toggle('transaction-list--scrollable', transactions.length > TRANSACTION_SCROLL_THRESHOLD);
  details.append(summary, body);
  return details;
}

export function buildTransactionList(transactions) {
  const wrapper = document.createElement('div');
  wrapper.className = 'transaction-list transaction-list--grouped';
  if (!transactions.length) {
    wrapper.innerHTML = '<p class="muted">Nessuna transazione registrata.</p>';
    return wrapper;
  }
  const incoming = transactions.filter((transaction) => transaction.direction !== 'pay');
  const outgoing = transactions.filter((transaction) => transaction.direction === 'pay');
  wrapper.appendChild(buildTransactionGroup({ title: 'Entrate', transactions: incoming, open: incoming.length > 0 }));
  wrapper.appendChild(buildTransactionGroup({ title: 'Uscite', transactions: outgoing, open: incoming.length === 0 && outgoing.length > 0 }));
  return wrapper;
}

export function buildInventoryTree(items, weightUnit = 'kg', { compact = false } = {}) {
  const renderItems = compact ? buildCompactItemList : buildItemList;
  const containers = items.filter((item) => item.category === 'container');
  const topLevel = items.filter((item) => !item.container_item_id && item.category !== 'container');

  const containerSections = containers.map((container) => {
    const children = items.filter((item) => item.container_item_id === container.id);
    const usedVolume = children.reduce((total, entry) => {
      const volume = Number(entry.volume) || 0;
      const qty = Number(entry.qty) || 1;
      return total + volume * qty;
    }, 0);
    const maxVolume = Number(container.max_volume) || null;
    const volumeLabel = maxVolume
      ? `Volume ${usedVolume}/${maxVolume}`
      : usedVolume
        ? `Volume ${usedVolume}`
        : '';
    return `
      <details class="inventory-group inventory-group--container inventory-container-accordion" open>
        <summary class="inventory-table__row inventory-table__row--container inventory-container-accordion__summary">
          <div class="inventory-table__cell inventory-table__cell--item">
            <span class="inventory-container-accordion__icon" aria-hidden="true">▾</span>
            <div class="item-info-body">
              <button class="item-name-button" type="button" data-item-preview="${escapeHtml(container.id)}" aria-label="Apri dettaglio ${escapeHtml(container.name)}">${escapeHtml(container.name)}</button>
              ${volumeLabel ? `<span class="muted">${escapeHtml(volumeLabel)}</span>` : ''}
            </div>
          </div>
          <div class="inventory-table__cell" data-label="Categoria"><span class="inventory-data-pill">${escapeHtml(getCategoryLabel(container.category))}</span></div>
          <div class="inventory-table__cell" data-label="Quantità">${escapeHtml(container.qty)}</div>
          <div class="inventory-table__cell" data-label="Peso">${escapeHtml(formatWeight(calcItemWeight(container, items), weightUnit))}</div>
          <div class="inventory-table__cell" data-label="Volume">${escapeHtml(container.max_volume ?? '-')}</div>
          <div class="inventory-table__cell" data-label="Valore">${buildInventoryItemValue(container)}</div>
          <div class="inventory-table__cell inventory-table__cell--actions">
            <button class="resource-action-button inventory-container-insert-button" type="button" data-insert-container="${escapeHtml(container.id)}" aria-label="Inserisci oggetti sfusi in ${escapeHtml(container.name)}">
              <span aria-hidden="true">＋</span>
              <span>Inserisci</span>
            </button>
            <button class="resource-action-button icon-button" type="button" data-delete="${escapeHtml(container.id)}" aria-label="Elimina" title="Elimina">
              <span aria-hidden="true">🗑️</span>
            </button>
          </div>
        </summary>
        <div class="inventory-group__children">
          <p class="inventory-group__label">Contenuto del contenitore</p>
          ${renderItems(children, weightUnit, { nested: true, emptyLabel: 'Nessun oggetto nel contenitore.', allItems: items })}
        </div>
      </details>
    `;
  }).join('');

  return `
    ${containerSections}
    <details class="inventory-group inventory-group--loose inventory-loose-accordion" open>
      <summary class="inventory-loose-accordion__summary">
        <span class="inventory-container-accordion__icon" aria-hidden="true">▾</span>
        <span class="inventory-loose-accordion__title">Oggetti Sfusi</span>
        <span class="inventory-loose-accordion__count">${topLevel.length} ${topLevel.length === 1 ? 'oggetto' : 'oggetti'}</span>
      </summary>
      <div class="inventory-group__children inventory-group__children--loose">
        ${renderItems(topLevel, weightUnit, { allowEquip: true, allItems: items })}
      </div>
    </details>
  `;
}

export function buildItemList(items, weightUnit = 'kg', { nested = false, emptyLabel = 'Nessun oggetto.', allowEquip = false, allItems = items } = {}) {
  if (!items.length) {
    return `<div class="inventory-empty-state"><span aria-hidden="true">◇</span><div><strong>${escapeHtml(emptyLabel)}</strong><small>Aggiungi o sposta qui un oggetto per visualizzarlo.</small></div></div>`;
  }
  return `
    <div class="inventory-table ${nested ? 'inventory-table--nested' : ''}">
      <div class="inventory-table__header">
        <span>Oggetto</span>
        <span>Cat.</span>
        <span>Qtà</span>
        <span>Peso</span>
        <span>Vol.</span>
        <span>Valore</span>
        <span>Azioni</span>
      </div>
      <div class="inventory-table__body">
        ${items.map((item) => {
    const volumeValue = item.volume !== null && item.volume !== undefined ? item.volume : '-';
    const statusLabels = getItemStatusLabels(item);
    const safeId = escapeHtml(item.id);
    const safeName = escapeHtml(item.name);
    const safeImageUrl = sanitizeImageUrl(item.image_url);
    return `
          <div class="inventory-table__row inventory-item-row">
            <div class="inventory-table__badges inventory-item-row__badges">
              ${item.is_magic ? `<span class="resource-chip resource-chip--floating resource-chip--magic">${escapeHtml(statusLabels.magic)}</span>` : ''}
              ${item.equipable ? `<span class="resource-chip resource-chip--floating resource-chip--equipable">${escapeHtml(statusLabels.equipable)}</span>` : ''}
              ${item.attunement_active ? `<span class="resource-chip resource-chip--floating resource-chip--attunement">${escapeHtml(statusLabels.attunement)}</span>` : ''}
            </div>
            <div class="inventory-table__cell inventory-table__cell--item">
              ${safeImageUrl ? `<img class="item-avatar inventory-item-row__image" src="${safeImageUrl}" alt="Foto di ${safeName}" data-item-image="${safeId}" />` : '<span class="inventory-item-row__placeholder" aria-hidden="true">◇</span>'}
              <div class="item-info-body inventory-item-row__info">
                <button class="item-name-button" type="button" data-item-preview="${safeId}" aria-label="Apri anteprima ${safeName}">${safeName}</button>
                ${item.ammunition_type ? `<span class="muted">Munizioni: ${escapeHtml(ammunitionTypeLabels.get(item.ammunition_type) || item.ammunition_type)}</span>` : ''}
                ${item.consumes_ammunition ? `<span class="muted">Consuma: ${escapeHtml(ammunitionTypeLabels.get(item.required_ammunition_type) || item.required_ammunition_type || 'munizioni')}</span>` : ''}
                ${item.damage_type ? `<span class="muted">Danno: ${escapeHtml(damageTypeLabels.get(item.damage_type) || item.damage_type)}</span>` : ''}
              </div>
            </div>
            <div class="inventory-table__cell" data-label="Categoria"><span class="inventory-data-pill">${escapeHtml(getCategoryLabel(item.category))}</span></div>
            <div class="inventory-table__cell inventory-table__metric" data-label="Quantità"><small>Qtà</small><strong>${escapeHtml(item.qty)}</strong></div>
            <div class="inventory-table__cell inventory-table__metric" data-label="Peso"><small>Peso</small><strong>${escapeHtml(formatWeight(calcItemWeight(item, allItems), weightUnit))}</strong></div>
            <div class="inventory-table__cell inventory-table__metric" data-label="Volume"><small>Vol.</small><strong>${escapeHtml(volumeValue)}</strong></div>
            <div class="inventory-table__cell" data-label="Valore">${buildInventoryItemValue(item)}</div>
            <div class="inventory-table__cell inventory-table__cell--actions">
              ${item.category === 'consumable' ? `<button class="resource-action-button" data-use="${safeId}">Consuma</button>` : ''}
              ${allowEquip && item.equipable && !getEquipSlots(item).length ? `<button class="resource-action-button" data-equip-item="${safeId}">Equipaggia</button>` : ''}
              <button class="resource-action-button icon-button" data-delete="${safeId}" aria-label="Elimina" title="Elimina">
                <span aria-hidden="true">🗑️</span>
              </button>
            </div>
          </div>
        `;
  }).join('')}
      </div>
    </div>
  `;
}

export function moneyFields({ amount = 0, coin = 'gp', reason = '', occurredOn, direction = 'receive', includeDirection = false } = {}) {
  const resolvedDate = occurredOn || new Date().toISOString().split('T')[0];
  const safeReason = escapeHtml(reason);
  return `
    <div class="money-grid compact-grid-fields">
      <label class="field">
        <span>Quantità</span>
        <input name="amount" type="number" value="${amount}" min="0" />
      </label>
      <label class="field">
        <span>Tipo moneta</span>
        <select name="coin">
          <option value="pp" ${coin === 'pp' ? 'selected' : ''}>Platino</option>
          <option value="gp" ${coin === 'gp' ? 'selected' : ''}>Oro</option>
          <option value="sp" ${coin === 'sp' ? 'selected' : ''}>Argento</option>
          <option value="cp" ${coin === 'cp' ? 'selected' : ''}>Rame</option>
        </select>
      </label>
       <label class="field">
      <span>Data</span>
      <input name="occurred_on" type="date" value="${escapeHtml(resolvedDate)}" />
    </label>
    </div>
    ${includeDirection ? `
      <div class="money-grid compact-grid-fields">
        <label class="field">
          <span>Direzione</span>
          <select name="direction">
            <option value="receive" ${direction === 'receive' ? 'selected' : ''}>Entrata</option>
            <option value="pay" ${direction === 'pay' ? 'selected' : ''}>Pagamento</option>
          </select>
        </label>
        <label class="field">
          <span>Motivo</span>
          <input name="reason" placeholder="Motivo" value="${safeReason}" />
        </label>
      </div>
    ` : `
      <label class="field">
        <span>Motivo</span>
        <input name="reason" placeholder="Motivo" value="${safeReason}" />
      </label>
    `}
   
  `;
}

export function moneyBundleFields({ direction = 'receive', amounts = {}, wallet = {}, reason = '', occurredOn, showDate = true } = {}) {
  const now = new Date();
  const resolvedDate = occurredOn || new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  const baseUrl = import.meta.env.BASE_URL;
  const entries = [
    ['pp', 'Platino', `${baseUrl}icons/moneta_platino.png`],
    ['gp', 'Oro', `${baseUrl}icons/moneta_oro.png`],
    ['sp', 'Argento', `${baseUrl}icons/moneta_argento.png`],
    ['cp', 'Rame', `${baseUrl}icons/moneta_rame.png`]
  ];
  const reasonOptions = direction === 'pay'
    ? [
        ['Acquisto', 'Pagamento effettuato per un acquisto'],
        ['Locanda', 'Pagamento per vitto e alloggio presso una locanda'],
        ['Servizi', 'Pagamento effettuato per servizi ricevuti'],
        ['Viaggio', 'Spesa sostenuta durante il viaggio'],
        ['Donazione', 'Somma donata']
      ]
    : [
        ['Ricompensa', 'Somma ricevuta come ricompensa'],
        ['Bottino', 'Somma ottenuta dal bottino'],
        ['Vendita', 'Somma ricevuta dalla vendita'],
        ['Compenso', 'Somma ricevuta tramite compenso'],
        ['Rimborso', 'Somma ricevuta come rimborso']
      ];
  const selectedOption = reasonOptions.find(([label, template]) => reason === label || reason === template)
    || (!reason ? reasonOptions[0] : null);
  const selectedReason = selectedOption?.[0] || '';
  const reasonDescription = selectedOption?.[1] || reason || '';
  return `
    <div class="money-bundle money-bundle--${direction}">
      <p class="money-bundle__intro">${direction === 'pay' ? 'Indica tutte le monete da consegnare.' : 'Indica tutte le monete ricevute.'} I valori a zero verranno ignorati.</p>
      <div class="money-bundle__grid">
        ${entries.map(([key, label, icon]) => {
    const available = Math.max(0, Number(wallet?.[key] || 0));
    const value = Math.max(0, Number(amounts?.[key] || 0));
    return `<label class="money-bundle__coin money-bundle__coin--${key}">
            <span class="money-bundle__coin-heading"><span class="coin-avatar coin-avatar--${key}"><img src="${icon}" alt="" /></span><span><strong>${label}</strong><small>${direction === 'pay' ? `${available} disponibili` : 'Aggiungi quantità'}</small></span></span>
            <input name="amount_${key}" type="number" value="${value}" min="0" step="1" ${direction === 'pay' ? `max="${available}"` : ''} inputmode="numeric" />
          </label>`;
  }).join('')}
      </div>
      <div class="money-bundle__details">
        <fieldset class="money-reason-picker">
          <legend>Motivo</legend>
          <input type="hidden" name="reason" value="${escapeHtml(reasonDescription)}" data-money-reason-value />
          <div class="money-reason-picker__options" role="radiogroup" aria-label="Motivi frequenti">
            ${reasonOptions.map(([label, template]) => `<label class="money-reason-option"><input type="radio" name="reason_preset" value="${escapeHtml(label)}" data-reason-template="${escapeHtml(template)}" ${selectedReason === label ? 'checked' : ''} /><span>${escapeHtml(label)}</span></label>`).join('')}
          </div>
          <label class="money-reason-picker__custom"><span>Descrizione del movimento</span><input type="text" data-money-reason-custom placeholder="Aggiungi dettagli al motivo" value="${escapeHtml(reasonDescription)}" /></label>
        </fieldset>
        ${showDate
    ? `<label class="field"><span>Data</span><input name="occurred_on" type="date" value="${escapeHtml(resolvedDate)}" /></label>`
    : `<input name="occurred_on" type="hidden" value="${escapeHtml(resolvedDate)}" />`}
      </div>
    </div>
  `;
}

export function bindMoneyReasonPicker(root) {
  const picker = root?.querySelector('.money-reason-picker');
  if (!picker) return;
  const valueInput = picker.querySelector('[data-money-reason-value]');
  const customInput = picker.querySelector('[data-money-reason-custom]');
  const presetInputs = [...picker.querySelectorAll('input[name="reason_preset"]')];
  presetInputs.forEach((input) => input.addEventListener('change', () => {
    if (!input.checked) return;
    const template = input.dataset.reasonTemplate || input.value;
    valueInput.value = template;
    if (customInput) customInput.value = template;
  }));
  customInput?.addEventListener('input', () => {
    valueInput.value = customInput.value.trim();
  });
}

export function exchangeFields({
  amount = 0,
  source = 'gp',
  target = 'pp',
  targetAmount = 0,
  available = {}
} = {}) {
  const entries = [
    { key: 'pp', label: 'Platino', value: Number(available.pp ?? 0) },
    { key: 'gp', label: 'Oro', value: Number(available.gp ?? 0) },
    { key: 'sp', label: 'Argento', value: Number(available.sp ?? 0) },
    { key: 'cp', label: 'Rame', value: Number(available.cp ?? 0) }
  ];
  const hasAvailable = entries.some((entry) => entry.value > 0);
  const sourceOptions = entries
    .filter((entry) => entry.value > 0)
    .map((entry) => `
          <option value="${entry.key}" ${source === entry.key ? 'selected' : ''}>${entry.label}</option>
        `).join('');
  const targetOptions = entries
    .map((entry) => `
          <option value="${entry.key}" ${target === entry.key ? 'selected' : ''}>${entry.label}</option>
        `).join('');
  const baseUrl = import.meta.env.BASE_URL;
  const coinIcons = {
    pp: `${baseUrl}icons/moneta_platino.png`,
    gp: `${baseUrl}icons/moneta_oro.png`,
    sp: `${baseUrl}icons/moneta_argento.png`,
    cp: `${baseUrl}icons/moneta_rame.png`
  };
  const sourceEntry = entries.find((entry) => entry.key === source) || entries[1];
  const targetEntry = entries.find((entry) => entry.key === target) || entries[0];
  return `
    <div class="coin-exchange-editor">
      <header class="coin-exchange-editor__hero">
        <span aria-hidden="true">⇄</span>
        <div><strong>Converti le tue monete</strong><small>Scegli cosa consegnare: il controvalore viene calcolato automaticamente.</small></div>
      </header>
      <div class="coin-exchange-editor__flow">
        <section class="coin-exchange-side coin-exchange-side--source">
          <span class="coin-exchange-side__eyebrow">Da convertire</span>
          <div class="coin-exchange-side__coin" data-exchange-source-visual>
            <span class="coin-avatar coin-avatar--${sourceEntry.key}"><img src="${coinIcons[sourceEntry.key]}" alt="" /></span>
            <span><strong>${sourceEntry.label}</strong><small data-exchange-available>${sourceEntry.value} disponibili</small></span>
          </div>
          <label class="field"><span>Moneta di partenza</span><select name="source" ${hasAvailable ? '' : 'disabled'}>${hasAvailable ? sourceOptions : '<option value=\"\" selected>Nessuna moneta disponibile</option>'}</select></label>
          <label class="field coin-exchange-side__amount"><span>Quantità</span><div class="field__input-row"><input name="amount" type="number" value="${amount}" min="0" step="1" ${hasAvailable ? '' : 'disabled'} /><button class="ghost-button" type="button" data-exchange-max ${hasAvailable ? '' : 'disabled'}>Tutto</button></div></label>
        </section>
        <span class="coin-exchange-editor__arrow" aria-hidden="true">→</span>
        <section class="coin-exchange-side coin-exchange-side--target">
          <span class="coin-exchange-side__eyebrow">Riceverai</span>
          <div class="coin-exchange-side__coin" data-exchange-target-visual>
            <span class="coin-avatar coin-avatar--${targetEntry.key}"><img src="${coinIcons[targetEntry.key]}" alt="" /></span>
            <span><strong>${targetEntry.label}</strong><small>Controvalore stimato</small></span>
          </div>
          <label class="field"><span>Moneta di destinazione</span><select name="target">${targetOptions}</select></label>
          <label class="field coin-exchange-side__result"><span>Controvalore</span><input name="target_amount" type="number" value="${targetAmount}" min="0" step="1" readonly /></label>
        </section>
      </div>
    </div>
  `;
}

export function walletEditFields(wallet = {}) {
  const baseUrl = import.meta.env.BASE_URL;
  const coinIcons = {
    pp: `${baseUrl}icons/moneta_platino.png`,
    gp: `${baseUrl}icons/moneta_oro.png`,
    sp: `${baseUrl}icons/moneta_argento.png`,
    cp: `${baseUrl}icons/moneta_rame.png`
  };
  const values = {
    pp: Number(wallet.pp ?? 0),
    gp: Number(wallet.gp ?? 0),
    sp: Number(wallet.sp ?? 0),
    cp: Number(wallet.cp ?? 0)
  };
  return `
    <div class="wallet-edit-grid compact-grid-fields">
      <div class="compact-field-grid">
        ${buildCoinField('Platino', 'pp', values.pp, coinIcons.pp, 'coin-avatar--pp')}
        ${buildCoinField('Oro', 'gp', values.gp, coinIcons.gp, 'coin-avatar--gp')}
      </div>
      <div class="compact-field-grid">
        ${buildCoinField('Argento', 'sp', values.sp, coinIcons.sp, 'coin-avatar--sp')}
        ${buildCoinField('Rame', 'cp', values.cp, coinIcons.cp, 'coin-avatar--cp')}
      </div>
    </div>
  `;
}

export function buildLootFields() {
  const categoryIcons = {
    gear: '♙', loot: '◇', consumable: '✚', weapon: '⚔', armor: '⛨', jewelry: '✦', tool: '⚒', container: '▱'
  };
  return `
   <div class="quick-loot-form">
    <div class="compact-field-grid quick-loot-form__basics">
      <label class="field">
        <span>Nome</span>
        <input name="name" placeholder="Es. Pozione di guarigione" required />
      </label>
      <label class="field">
        <span>Quantità</span>
        <input name="qty" type="number" value="1" min="0" step="1" />
      </label>
      <label class="field">
        <span>Luogo</span>
        <input name="inventory_location" placeholder="Es. Casa o deposito" />
      </label>
    </div>
    <fieldset class="quick-loot-categories">
      <legend>Tipologia oggetto</legend>
      <div class="quick-loot-categories__grid">
        ${itemCategories.map((category) => `
          <label class="quick-loot-category">
            <input type="radio" name="category" value="${escapeHtml(category.value)}" ${category.value === 'loot' ? 'checked' : ''} />
            <span class="quick-loot-category__card"><span aria-hidden="true">${categoryIcons[category.value] || '◇'}</span><strong>${escapeHtml(category.label)}</strong></span>
          </label>
        `).join('')}
      </div>
    </fieldset>
   </div>
  `;
}
