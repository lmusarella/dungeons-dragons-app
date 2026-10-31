import { openFormModal } from '../../../ui/components.js';
import { escapeHtml, sanitizeImageUrl } from '../../../lib/html.js';
import { getEquipSlots, getBodyPartLabels, getCategoryLabel } from '../../inventory/utils.js';
import { mountEquipmentMannequin } from './equipmentMannequin.js';
import { getWeaponDamageModes } from './utils.js';
import { attachUnifiedDetailActions } from './detailManagement.js';
import { damageTypeLabels } from '../../inventory/constants.js';
export function openEquipmentItemDetail(item, { items = [], weightUnit = 'kg', onEdit = null, onRemove = null, removeLabel = 'Rimuovi', onModeChange = null } = {}) {
  if (!item) return;
  const slots = getEquipSlots(item);
  const content = document.createElement('div');
  content.className = 'equipment-item-detail';
  const image = sanitizeImageUrl(item.image_url);
  const damageModes = item.category === 'weapon' ? getWeaponDamageModes(item).filter(mode => mode.damageDie) : [];
  const selectedModeId = item.selected_damage_mode || damageModes[0]?.id;
  const facts = [
    ['Categoria',getCategoryLabel(item.category)],
    ['Quantità',item.qty ?? 1],
    ['Peso',item.weight != null ? item.weight + ' ' + weightUnit : null],
    ['Equipaggiato',slots.length ? getBodyPartLabels(slots) : 'Non equipaggiato'],
    ['Sintonia',item.attunement_active ? 'Attiva' : null],
    ['Classe armatura',item.armor_class ?? item.ac],
    ['Danni',item.damage_die ? `${item.damage_die}${item.damage_type ? ` · ${damageTypeLabels.get(item.damage_type) || item.damage_type}` : ''}` : item.damage],
  ].filter(([,value]) => value != null && value !== '');
  content.innerHTML = '<section class="equipment-item-detail__info">' +
    (image ? '<img class="equipment-item-detail__image" src="'+image+'" alt="'+escapeHtml(item.name)+'" />' : '') +
    '<dl class="power-detail-facts">' + facts.map(([label,value])=>'<div><dt>'+escapeHtml(label)+'</dt><dd>'+escapeHtml(value)+'</dd></div>').join('') + '</dl>' +
    (damageModes.length > 1 && onModeChange ? '<section class="weapon-grip-picker"><span class="eyebrow">Impugnatura</span><div class="weapon-grip-picker__options">' + damageModes.map(mode => '<button type="button" data-weapon-mode="'+escapeHtml(mode.id)+'" aria-pressed="'+String(mode.id === selectedModeId)+'"><strong>'+escapeHtml(mode.label)+'</strong><small>'+escapeHtml(mode.damageDie)+'</small></button>').join('') + '</div><p>Seleziona la modalità usata per calcolare tiro per colpire e danni.</p></section>' : '') +
    '<section class="equipment-item-lore"><h3>Descrizione</h3><p class="equipment-item-detail__description">'+escapeHtml(item.description || item.notes || 'Nessuna descrizione disponibile.')+'</p></section></section>' +
    (slots.length ? '<aside class="equipment-item-detail__body"><header class="equipment-position-header"><div><span class="eyebrow">Equipaggiamento</span><h3>'+escapeHtml(getBodyPartLabels(slots))+'</h3></div></header><div data-item-body-view></div><p class="equipment-position-hint">La parte lampeggiante indica la posizione dell’oggetto.</p></aside>' : '');
  return openFormModal({
    title: item.name || 'Oggetto',
    content, submitLabel: 'Chiudi', cancelLabel: null, showFooter: false,
    cardClass: 'modal-card--equipment-item-detail',
    onOpen: ({ modal, formEl }) => {
      const host = content.querySelector('[data-item-body-view]');
      const mannequinCleanup = host
        ? mountEquipmentMannequin(host, { items: [item], focusItemId: item.id, weightUnit })
        : null;
      if (!formEl) return mannequinCleanup;
      const managementCleanup = attachUnifiedDetailActions(modal, formEl, {
        onEdit,
        onDelete: onRemove,
        actionName: 'item_detail_action',
        deleteLabel: removeLabel
      });
      const modeButtons = [...content.querySelectorAll('[data-weapon-mode]')];
      modeButtons.forEach(button => button.addEventListener('click', async () => {
        if (!onModeChange || button.getAttribute('aria-pressed') === 'true') return;
        modeButtons.forEach(entry => entry.disabled = true);
        const updated = await onModeChange(button.dataset.weaponMode);
        modeButtons.forEach(entry => entry.disabled = false);
        if (!updated) return;
        modeButtons.forEach(entry => entry.setAttribute('aria-pressed', String(entry === button)));
      }));
      return () => {
        if (typeof mannequinCleanup === 'function') mannequinCleanup();
        managementCleanup?.();
      };
    }
  }).then((formData) => {
    if (formData?.get('item_detail_action') === 'edit') onEdit?.();
    if (formData?.get('item_detail_action') === 'delete') onRemove?.();
    return formData;
  });
}
export function polishEquipmentCards(node) {
  node.querySelectorAll('.equipped-item-card').forEach(card => {
    const preview = card.querySelector('[data-item-preview]');
    if (!preview) return;
    const image = card.querySelector('[data-item-image]');
    const remove = card.querySelector('[data-unequip]');
    const category = card.querySelector('.equipped-item-card__meta span')?.textContent.trim() || 'Equipaggiamento';
    const badges = [...card.querySelectorAll('.equipped-item-card__badges .resource-chip')].map(entry => entry.textContent.trim());
    card.className = 'play-card play-card--equipment equipment-shortcut-card';
    card.tabIndex = 0;
    const header = document.createElement('div'); header.className = 'play-card__header equipment-card-heading';
    const identity = document.createElement('div'); identity.className = 'equipment-card-identity';
    const eyebrow = document.createElement('span'); eyebrow.className = 'play-card__eyebrow'; eyebrow.textContent = category;
    preview.className = 'play-card__title play-card__title--link';
    if (image) header.append(image);
    identity.append(eyebrow, preview);
    if (badges.length) {
      const flags = document.createElement('span'); flags.className = 'equipment-card-flags';
      badges.forEach(label => {
        const flag = document.createElement('span'); flag.textContent = label;
        if (label.toLocaleLowerCase('it').includes('sintonia')) flag.classList.add('is-attuned');
        flags.append(flag);
      });
      identity.append(flags);
    }
    header.append(identity);
    const facts = document.createElement('dl'); facts.className = 'equipment-card-facts';
    [
      ['Equipaggiato', card.dataset.equippedLocation || '—'],
      ['Peso', card.dataset.equippedWeight || '—'],
      ['Sintonia', card.dataset.equippedAttunement || 'No']
    ].forEach(([label, value]) => {
      const fact = document.createElement('div');
      const term = document.createElement('dt'); term.textContent = label;
      const detail = document.createElement('dd'); detail.textContent = value;
      if (label === 'Sintonia' && value === 'Attiva') fact.classList.add('is-attuned');
      fact.append(term, detail); facts.append(fact);
    });
    const footer = document.createElement('div'); footer.className = 'play-card__footer';
    if (remove) { remove.className = 'play-card__button'; remove.textContent = 'Rimuovi'; footer.append(remove); }
    card.replaceChildren(header, facts, footer);
    card.setAttribute('aria-label','Dettaglio '+preview.textContent.trim());
    card.addEventListener('click',event=>{
      if (event.target.closest('button, a, input, [data-item-image]')) return;
      preview.click();
    });
    card.addEventListener('keydown',event=>{
      if (event.target === card && ['Enter',' '].includes(event.key)) { event.preventDefault(); preview.click(); }
    });
  });
  const attunementFilter = node.querySelector('[data-filter-equipped-attunement]');
  if (attunementFilter && attunementFilter.getAttribute('aria-disabled') !== 'true') {
    const cards = [...node.querySelectorAll('.equipment-shortcut-card')];
    const list = node.querySelector('.inventory-list');
    const empty = document.createElement('p');
    empty.className = 'equipment-filter-empty muted';
    empty.textContent = 'Nessun oggetto in sintonia.';
    empty.hidden = true;
    list?.after(empty);
    const toggleFilter = () => {
      const active = attunementFilter.getAttribute('aria-pressed') !== 'true';
      attunementFilter.setAttribute('aria-pressed', String(active));
      cards.forEach(card => { card.hidden = active && card.dataset.equippedAttuned !== 'true'; });
      empty.hidden = !active || cards.some(card => !card.hidden);
    };
    attunementFilter.addEventListener('click', toggleFilter);
    attunementFilter.addEventListener('keydown', event => {
      if (!['Enter', ' '].includes(event.key)) return;
      event.preventDefault();
      toggleFilter();
    });
  }
}
