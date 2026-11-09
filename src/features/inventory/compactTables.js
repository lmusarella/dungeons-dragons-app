import { escapeHtml, sanitizeImageUrl } from '../../lib/html.js';
import { getCategoryLabel, getInventoryItemValueDisplay, normalizeTransactionAmount } from './utils.js';
import { formatWeight } from '../../lib/format.js';
import { calcItemWeight } from '../../lib/calc.js';
import { COIN_KEYS, isCoinExchange } from '../wallet/coinMovements.js';

const coinIcons = {
  pp: `${import.meta.env.BASE_URL}icons/moneta_platino.png`,
  gp: `${import.meta.env.BASE_URL}icons/moneta_oro.png`,
  sp: `${import.meta.env.BASE_URL}icons/moneta_argento.png`,
  cp: `${import.meta.env.BASE_URL}icons/moneta_rame.png`
};

export function buildCompactItemList(items, weightUnit = 'kg', { allowExtract = false, allowEquip = false, allowUnequip = false, allowContainerNavigation = false, allItems = items } = {}) {
  if (!items.length) return '<p class="muted compact-table-empty">Nessun oggetto.</p>';
  return `<div class="compact-table-wrap"><table class="shortcut-table shortcut-table--items"><colgroup><col class="item-col-name"><col><col><col><col class="item-col-value"><col class="item-col-actions"></colgroup><thead><tr><th>Oggetto</th><th>Categoria</th><th>Qtà</th><th>Peso</th><th>Valore</th><th><span class="sr-only">Azioni</span></th></tr></thead><tbody>${items.map(item => {
    const id = escapeHtml(item.id), name = escapeHtml(item.name), image = sanitizeImageUrl(item.image_url);
    const value = getInventoryItemValueDisplay(item);
    const containedCount = item.category === 'container' ? Number(item.visibleContainedItemCount ?? item.containedItemCount) : null;
    const containedLabel = Number.isFinite(containedCount) ? `<small class="compact-item-contained-count">${containedCount} ${containedCount === 1 ? 'oggetto' : 'oggetti'}</small>` : '';
    return `<tr><td><div class="compact-item-name">${image ? `<img src="${image}" alt="" data-item-image="${id}" loading="lazy">` : '<span class="compact-item-symbol" aria-hidden="true">◇</span>'}<span class="compact-item-name__copy"><button type="button" class="item-name-button" data-item-preview="${id}" aria-label="Dettaglio ${name}">${name}</button>${containedLabel}</span>${item.is_magic ? '<span class="compact-item-magic" title="Oggetto magico" aria-label="Magico">✦</span>' : ''}</div></td><td>${escapeHtml(getCategoryLabel(item.category))}</td><td class="table-number">${escapeHtml(item.qty ?? 1)}</td><td class="table-number">${escapeHtml(formatWeight(calcItemWeight(item, allItems), weightUnit))}</td><td>${buildItemValueMarkup(value)}</td><td><div class="compact-row-actions">${item.category === 'consumable' ? `<button type="button" class="ghost-button" data-use="${id}">Consuma</button>` : ''}${allowContainerNavigation && item.category === 'container' ? `<button type="button" class="ghost-button" data-open-container="${id}">Apri</button>` : ''}${allowEquip && item.equipable ? `<button type="button" class="ghost-button" data-equip-item="${id}">Equipaggia</button>` : ''}${allowUnequip ? `<button type="button" class="ghost-button" data-unequip-item="${id}">Disequipaggia</button>` : ''}${allowExtract ? `<button type="button" class="ghost-button" data-extract-item="${id}">Estrai</button>` : ''}<button type="button" class="icon-button" data-delete="${id}" aria-label="Elimina ${name}">×</button></div></td></tr>`;
  }).join('')}</tbody></table></div>`;
}

function buildItemValueMarkup(value) {
  return `<span class="inventory-item-value" title="${value.amount} ${value.unitLabel}"><span class="inventory-item-value__coin coin-avatar coin-avatar--${value.key}" aria-hidden="true"><img src="${import.meta.env.BASE_URL}icons/${value.icon}" alt="" loading="lazy"></span><span class="inventory-item-value__text"><strong>${value.amount}</strong><small>${value.unitLabel}</small></span></span>`;
}

export function buildCompactTransactionList(transactions) {
  if (!transactions.length) return '<p class="muted compact-table-empty">Nessuna transazione registrata.</p>';
  return `<div class="compact-table-wrap"><table class="shortcut-table shortcut-table--transactions"><thead><tr><th>Data</th><th>Movimento</th><th>Causale</th><th>Importo</th><th><span class="sr-only">Azioni</span></th></tr></thead><tbody>${transactions.map(transaction => {
    const amount = normalizeTransactionAmount(transaction.amount);
    const exchange = isCoinExchange(amount);
    const direction = exchange ? 'exchange' : transaction.direction === 'pay' ? 'pay' : 'receive';
    const label = exchange ? 'Scambio' : direction === 'pay' ? 'Uscita' : 'Entrata';
    const date = new Date(transaction.occurred_on || transaction.created_at);
    const dateLabel = Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit' });
    const id = escapeHtml(transaction.id);
    const values = COIN_KEYS.filter(key => Number(amount[key])).map(key => `
      <span class="table-coin-value ${Number(amount[key]) < 0 ? 'is-negative' : 'is-positive'}">
        <span class="table-coin-icon coin-avatar coin-avatar--${key}" aria-hidden="true"><img src="${coinIcons[key]}" alt="" loading="lazy"></span>
        <strong>${Number(amount[key]) > 0 ? '+' : ''}${Number(amount[key])}</strong>
        <small>${key.toUpperCase()}</small>
      </span>
    `).join('') || '0';
    return `<tr><td class="transaction-date">${dateLabel}</td><td><span class="movement-type movement-type--${direction}">${label}</span></td><td class="transaction-reason">${escapeHtml(transaction.reason || 'Nessuna nota')}</td><td><div class="table-coin-values">${values}</div></td><td><div class="compact-row-actions">${exchange ? '' : `<button type="button" class="icon-button" data-edit-transaction="${id}" aria-label="Modifica transazione">✎</button>`}<button type="button" class="icon-button" data-delete-transaction="${id}" aria-label="Elimina transazione">×</button></div></td></tr>`;
  }).join('')}</tbody></table></div>`;
}
