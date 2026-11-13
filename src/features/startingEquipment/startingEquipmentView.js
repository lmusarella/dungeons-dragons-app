import { escapeHtml } from '../../lib/html.js';
import { openEquipmentItemDetail } from '../character/home/itemDetail.js';
import { getSharedItemsByIds } from '../library/itemLibraryApi.js';
import { bindBundleItems, renderBundleSection } from './bundleView.js';
import { categoryFilter, entryEquipmentType, formatCoins } from './startingEquipmentModel.js';

const ANOMALY_LABELS = {
  missing: 'non ancora nel catalogo', ambiguous: 'corrispondenza non confermata', structured: 'voce speciale', unresolved: 'da gestire manualmente'
};

const cleanRef = (value) => String(value || '').replace(/\{@\w+\s+([^|}]*)[^}]*\}/g, '$1').split('|')[0].trim();

export function entryLabel(entry) {
  if (entry.kind === 'currency') return formatCoins((entry.currencyCp || entry.containedCp) * entry.quantity);
  if (entry.kind === 'category') return `${categoryFilter(entryEquipmentType(entry))?.label || cleanRef(entryEquipmentType(entry)) || 'Categoria'} a scelta${entry.quantity > 1 ? ` ×${entry.quantity}` : ''}`;
  const name = entry.itemName || cleanRef(entry.sourceRef) || 'Oggetto';
  return `${name}${entry.quantity > 1 ? ` ×${entry.quantity}` : ''}`;
}

function entryChip(entry) {
  const label = escapeHtml(entryLabel(entry));
  const coins = entry.kind === 'item' && entry.containedCp ? ` <small>(contiene ${escapeHtml(formatCoins(entry.containedCp))})</small>` : '';
  if (entry.kind === 'item') {
    const button = `<button type="button" class="seq-chip seq-chip--item" data-eq-item="${escapeHtml(entry.itemId)}">${label}${coins}</button>`;
    return entry.bundle?.length ? `<div class="seq-pack">${button}${renderBundleSection(entry.bundle)}</div>` : button;
  }
  if (entry.kind === 'currency') return `<span class="seq-chip seq-chip--coin">${label}</span>`;
  if (entry.kind === 'category') return `<span class="seq-chip seq-chip--category">${label}</span>`;
  return `<span class="seq-chip seq-chip--warn" title="${escapeHtml(entry.sourceRef)}">${label} <small>${ANOMALY_LABELS[entry.kind] || ANOMALY_LABELS.unresolved}</small></span>`;
}

function groupHtml(group, index) {
  const entriesHtml = (entries) => entries.map(entryChip).join('');
  if (group.isChoice && group.options.length > 1) {
    return `<article class="seq-group seq-group--choice"><small>Scelta ${index + 1}</small><div>${group.options.map((option) => `<div class="seq-option">${option.code ? `<b>${escapeHtml(option.code.toUpperCase())}</b>` : ''}<div class="seq-chips">${entriesHtml(option.entries)}</div></div>`).join('')}</div></article>`;
  }
  const entries = group.options.flatMap((option) => option.entries);
  return entries.length ? `<article class="seq-group"><small>Sempre inclusi</small><div class="seq-chips">${entriesHtml(entries)}</div></article>` : '';
}

/** Sezione di sola lettura per i dettagli di classe e background. */
export function renderStartingEquipment(sources) {
  const withContent = sources.filter((source) => source.groups.some((group) => group.options.some((option) => option.entries.length)) || source.goldAlternative);
  if (!withContent.length) return '';
  return withContent.map((source) => `<section class="dnd-class-summary dnd-class-equipment seq"><header><small>Punto di partenza</small><h3>Equipaggiamento iniziale</h3></header>
    ${source.groups.map(groupHtml).join('')}
    ${source.goldAlternative ? `<p class="dnd-class-equipment__note">In alternativa: ${escapeHtml(cleanRef(source.goldAlternative))} mo di ricchezza iniziale.</p>` : ''}</section>`).join('');
}

/** Rende cliccabili gli oggetti collegati: il dettaglio viene caricato da shared_items tramite UUID. */
export function bindStartingEquipmentDetails(root) {
  const openById = async (id) => {
    const [item] = await getSharedItemsByIds([id]).catch(() => []);
    if (item) void openEquipmentItemDetail(item, { catalogMode: true });
  };
  root.querySelectorAll('[data-eq-item]').forEach((button) => button.addEventListener('click', () => openById(button.dataset.eqItem)));
  bindBundleItems(root, openById);
}
