import { formatWeight } from '../../lib/format.js';
import {
  getCategoryLabel,
  getItemStatusLabels,
  normalizeTransactionAmount
} from './utils.js';
import { ammunitionTypeLabels, damageTypeLabels } from './constants.js';
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
  const directionLabel = transaction.direction === 'pay' ? 'Pagamento' : 'Entrata';
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
          <button class="icon-button transaction-action-button" type="button" data-edit-transaction="${escapeHtml(transaction.id)}" aria-label="Modifica transazione" title="Modifica">
            <span aria-hidden="true">✏️</span>
          </button>
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

export function buildInventoryTree(items, weightUnit = 'lb') {
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
              <strong>${escapeHtml(container.name)}</strong>
              ${volumeLabel ? `<span class="muted">${escapeHtml(volumeLabel)}</span>` : ''}
            </div>
          </div>
          <div class="inventory-table__cell" data-label="Categoria"><span class="inventory-data-pill">${escapeHtml(getCategoryLabel(container.category))}</span></div>
          <div class="inventory-table__cell" data-label="Quantità">${escapeHtml(container.qty)}</div>
          <div class="inventory-table__cell" data-label="Peso">${escapeHtml(formatWeight(container.weight ?? 0, weightUnit))}</div>
          <div class="inventory-table__cell" data-label="Volume">${escapeHtml(container.max_volume ?? '-')}</div>
          <div class="inventory-table__cell inventory-table__cell--actions">
            <button class="resource-action-button inventory-container-insert-button" type="button" data-insert-container="${escapeHtml(container.id)}" aria-label="Inserisci oggetti sfusi in ${escapeHtml(container.name)}">
              <span aria-hidden="true">＋</span>
              <span>Inserisci</span>
            </button>
            <button class="resource-action-button icon-button" type="button" data-edit="${escapeHtml(container.id)}" aria-label="Modifica" title="Modifica">
              <span aria-hidden="true">✏️</span>
            </button>
            <button class="resource-action-button icon-button" type="button" data-delete="${escapeHtml(container.id)}" aria-label="Elimina" title="Elimina">
              <span aria-hidden="true">🗑️</span>
            </button>
          </div>
        </summary>
        <div class="inventory-group__children">
          <p class="inventory-group__label">Contenuto del contenitore</p>
          ${buildItemList(children, weightUnit, { nested: true, emptyLabel: 'Nessun oggetto nel contenitore.' })}
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
        ${buildItemList(topLevel, weightUnit)}
      </div>
    </details>
  `;
}

export function buildItemList(items, weightUnit = 'lb', { nested = false, emptyLabel = 'Nessun oggetto.' } = {}) {
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
            <div class="inventory-table__cell inventory-table__metric" data-label="Peso"><small>Peso</small><strong>${escapeHtml(formatWeight(item.weight ?? 0, weightUnit))}</strong></div>
            <div class="inventory-table__cell inventory-table__metric" data-label="Volume"><small>Vol.</small><strong>${escapeHtml(volumeValue)}</strong></div>
            <div class="inventory-table__cell inventory-table__cell--actions">
              ${item.category === 'consumable' ? `<button class="resource-action-button" data-use="${safeId}">Consuma</button>` : ''}
              <button class="resource-action-button icon-button" data-edit="${safeId}" aria-label="Modifica" title="Modifica">
                <span aria-hidden="true">✏️</span>
              </button>
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
  return `
    <div class="modal-section">
      <h4 class="modal-section__title">Seleziona le monete da scambiare</h4>
      <div class="money-grid compact-grid-fields">
        <label class="field">
          <span>Tipo moneta</span>
          <select name="source" ${hasAvailable ? '' : 'disabled'}>
            ${hasAvailable ? sourceOptions : '<option value=\"\" selected>Nessuna moneta disponibile</option>'}
          </select>
        </label>
        <label class="field">
          <span>Quantità</span>
          <div class="field__input-row">
            <input name="amount" type="number" value="${amount}" min="0" step="1" ${hasAvailable ? '' : 'disabled'} />
            <button class="chip chip--small" type="button" data-exchange-max ${hasAvailable ? '' : 'disabled'}>Max</button>
          </div>
          <span class="field__hint muted" data-exchange-available></span>
        </label>
      </div>
    </div>
    <div class="modal-section">
      <h4 class="modal-section__title">Scegli la moneta di destinazione</h4>
      <div class="money-grid compact-grid-fields">
        <label class="field">
          <span>Moneta di destinazione</span>
          <select name="target">
            ${targetOptions}
          </select>
        </label>
        <label class="field">
          <span>Controvalore</span>
          <input name="target_amount" type="number" value="${targetAmount}" min="0" step="1" readonly />
        </label>
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

export function buildLootFields(weightStep) {
  return `
   <div class="compact-field-grid">
      <label class="field">
        <span>Nome</span>
        <input name="name" required />
      </label>
       <label class="field">
        <span>Valore</span>
        <input name="value_cp" type="number" value="0" min="0" step="1" />
      </label>
   </div>
    <div class="compact-field-grid">  
      <label class="field">
        <span>Quantità</span>
        <input name="qty" type="number" value="1" min="0" step="1" />
      </label>
      <label class="field">
        <span>Peso</span>
        <input name="weight" type="number" value="0" min="0" step="${weightStep || '0.1'}" />
      </label>
      <label class="field">
        <span>Volume</span>
        <input name="volume" type="number" value="0" min="0" step="0.1" />
      </label>
     
    </div>
  `;
}
