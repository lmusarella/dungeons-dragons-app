import './bundle.css';
import { escapeHtml } from '../../lib/html.js';

export function bundleEntryLabel(entry) {
  const name = entry.name || String(entry.sourceRef || '').split('|')[0] || 'Oggetto';
  return `${name}${entry.quantity > 1 ? ` ×${entry.quantity}` : ''}`;
}

/** Chip dei contenuti: gli oggetti collegati aprono il dettaglio, gli altri restano visibili come "non collegati". */
export function renderBundleChips(contents = []) {
  return contents.map((entry) => (entry.linked
    ? `<button type="button" class="seq-chip seq-chip--item" data-bundle-item="${escapeHtml(entry.itemId)}">${escapeHtml(bundleEntryLabel(entry))}</button>`
    : `<span class="seq-chip seq-chip--warn" title="${escapeHtml(entry.sourceRef)}">${escapeHtml(bundleEntryLabel(entry))} <small>non collegato al catalogo</small></span>`)).join('');
}

export function renderBundleSection(contents = [], title = 'Contenuto della dotazione') {
  if (!contents.length) return '';
  return `<div class="seq-bundle"><small>${escapeHtml(title)}</small><div class="seq-chips">${renderBundleChips(contents)}</div></div>`;
}

export function bindBundleItems(root, openDetail) {
  root.querySelectorAll('[data-bundle-item]').forEach((button) => button.addEventListener('click', () => openDetail(button.dataset.bundleItem)));
}
