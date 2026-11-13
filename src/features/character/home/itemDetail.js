import { openFormModal } from '../../../ui/components.js';
import { escapeHtml, sanitizeImageUrl } from '../../../lib/html.js';
import { getEquipSlots, getBodyPartLabels, getCategoryLabel } from '../../inventory/utils.js';
import { mountEquipmentMannequin } from './equipmentMannequin.js';
import { getWeaponDamageModes } from './utils.js';
import { attachUnifiedDetailActions } from './detailManagement.js';
import { ammunitionTypeLabels, armorTypes, damageTypeLabels } from '../../inventory/constants.js';
import { normalizeWeaponProperties, weaponPropertyOptions } from '../../inventory/weaponProperties.js';
import { getWeaponMasteryLabel, getWeaponMasterySummary } from '../../rules/weaponMasteries.js';
import { calcItemWeight } from '../../../lib/calc.js';
import { formatWeight } from '../../../lib/format.js';
import { fetchBundleContents } from '../../startingEquipment/bundleApi.js';
import { bindBundleItems, renderBundleSection } from '../../startingEquipment/bundleView.js';
import { getSharedItemsByIds } from '../../library/itemLibraryApi.js';

const COIN_DENOMINATIONS = [
  { key: 'gp', factor: 100, name: 'oro', icon: 'moneta_oro.png' },
  { key: 'sp', factor: 10, name: 'argento', icon: 'moneta_argento.png' },
  { key: 'cp', factor: 1, name: 'rame', icon: 'moneta_rame.png' }
];

export function getItemCostDisplay(valueCp) {
  const copper = Math.max(0, Math.round(Number(valueCp) || 0));
  const denomination = COIN_DENOMINATIONS.find((coin) => copper > 0 && copper % coin.factor === 0)
    || COIN_DENOMINATIONS[COIN_DENOMINATIONS.length - 1];
  const amount = copper / denomination.factor;
  const noun = amount === 1 ? 'moneta' : 'monete';
  const preposition = denomination.name === 'oro' || denomination.name === 'argento' ? "d'" : 'di ';
  return {
    ...denomination,
    amount,
    copper,
    label: `${amount} ${noun} ${preposition}${denomination.name}`
  };
}

function getItemValueCp(item) {
  const directValue = Number(item?.value_cp);
  if (Number.isFinite(directValue)) return Math.max(0, directValue);
  const legacyFactors = { mr: 1, cp: 1, ma: 10, sp: 10, mo: 100, gp: 100, mp: 1000, pp: 1000 };
  const quantity = Number(item?.cost?.quantita ?? item?.cost?.quantity);
  const factor = legacyFactors[String(item?.cost?.moneta ?? item?.cost?.coin ?? '').toLowerCase()];
  return Number.isFinite(quantity) && factor ? quantity * factor : 0;
}

export function getArmorDetailDisplay(item) {
  if (item?.category !== 'armor') return null;

  if (item.is_shield) {
    const shieldBonus = Number(item.shield_bonus);
    const bonus = Number.isFinite(shieldBonus) && shieldBonus !== 0 ? shieldBonus : 2;
    return {
      typeLabel: 'Scudo',
      armorClassLabel: `${bonus > 0 ? '+' : ''}${bonus} alla CA`,
      description: 'Il bonus dello scudo si somma alla Classe Armatura.',
      stealthDisadvantage: Boolean(item.stealth_disadvantage),
      minimumStrength: Math.max(0, Number(item.minimum_strength) || 0)
    };
  }

  const typeLabel = armorTypes.find((type) => type.value === item.armor_type)?.label || 'Armatura';
  const baseArmorClass = Number(item.armor_class ?? item.ac);
  const baseLabel = Number.isFinite(baseArmorClass) ? String(baseArmorClass) : '—';
  const armorClassByType = {
    light: `CA ${baseLabel} + Destrezza`,
    medium: `CA ${baseLabel} + Destrezza (massimo +2)`,
    heavy: `CA ${baseLabel}`
  };
  const descriptionByType = {
    light: 'Aggiunge alla CA l’intero modificatore di Destrezza.',
    medium: 'Aggiunge alla CA il modificatore di Destrezza fino a un massimo di +2.',
    heavy: 'Il modificatore di Destrezza non modifica la CA fornita.'
  };

  return {
    typeLabel,
    armorClassLabel: armorClassByType[item.armor_type] || `CA ${baseLabel}`,
    description: descriptionByType[item.armor_type] || 'Classe Armatura fornita dall’oggetto.',
    stealthDisadvantage: item.stealth_disadvantage ?? item.armor_type === 'heavy',
    minimumStrength: Math.max(0, Number(item.minimum_strength) || 0)
  };
}

export function openEquipmentItemDetail(item, { items = [], weightUnit = 'kg', onEdit = null, onRemove = null, removeLabel = 'Rimuovi', onModeChange = null, catalogMode = false, present = openFormModal, shortcutSize = false } = {}) {
  if (!item) return;
  const slots = getEquipSlots(item);
  const content = document.createElement('div');
  content.className = 'equipment-item-detail';
  const image = sanitizeImageUrl(item.image_url);
  const damageModes = item.category === 'weapon' ? getWeaponDamageModes(item).filter(mode => mode.damageDie) : [];
  const selectedModeId = item.selected_damage_mode || damageModes[0]?.id;
  const cost = getItemCostDisplay(getItemValueCp(item));
  const costIcon = `${import.meta.env.BASE_URL}icons/${cost.icon}`;
  const propertyDefinitions = new Map(weaponPropertyOptions.map((property) => [property.value, property]));
  const weaponProperties = item.category === 'weapon'
    ? normalizeWeaponProperties(item).map((value) => propertyDefinitions.get(value)).filter(Boolean)
    : [];
  const description = String(item.description || item.notes || '').trim();
  const masteryLabel = item.category === 'weapon' && item.weapon_mastery
    ? getWeaponMasteryLabel(item.weapon_mastery)
    : '';
  const masterySummary = masteryLabel ? getWeaponMasterySummary(item.weapon_mastery) : '';
  const armorDetail = getArmorDetailDisplay(item);
  const hasThrownOrRange = item.category === 'weapon' && (
    weaponProperties.some((property) => ['lancio', 'gittata'].includes(property.value))
    || item.range_normal != null
    || item.range_disadvantage != null
  );
  const rangeValue = hasThrownOrRange
    ? [item.range_normal, item.range_disadvantage]
      .map((value) => value != null && value !== '' ? `${value} m` : '—')
      .join(' / ')
    : null;
  const displayedWeight = item.category === 'container' ? calcItemWeight(item, items) : item.weight;
  const facts = [
    ['Categoria',getCategoryLabel(item.category)],
    ['Luogo',item.inventory_location],
    ['Quantità',item.qty ?? 1],
    [item.category === 'container' ? 'Peso totale' : 'Peso',displayedWeight != null ? formatWeight(displayedWeight, weightUnit) : null],
    ['Carico',item.category === 'container' && item.ignore_contents_weight ? 'Il contenuto non viene conteggiato' : null],
    ['Equipaggiato',catalogMode ? null : (slots.length ? getBodyPartLabels(slots) : 'Non equipaggiato')],
    ['Sintonia',item.attunement_active ? 'Attiva' : null],
    ['Classe armatura',armorDetail ? null : (item.armor_class ?? item.ac)],
    ['Danni',item.damage_die ? `${item.damage_die}${item.damage_type ? ` · ${damageTypeLabels.get(item.damage_type) || item.damage_type}` : ''}` : item.damage],
    ['Gittata',rangeValue],
  ].filter(([,value]) => value != null && value !== '');
  const costMarkup = `
    <div class="equipment-item-cost" aria-label="Costo dell’oggetto">
      <dt>Costo</dt>
      <dd class="equipment-item-cost__value">
        <span class="coin-avatar coin-avatar--${cost.key}" aria-hidden="true"><img src="${costIcon}" alt="" /></span>
        <span><strong>${escapeHtml(cost.amount)}</strong><span>${escapeHtml(cost.amount === 1 ? `Moneta ${cost.name === 'oro' || cost.name === 'argento' ? "d'" : 'di '}${cost.name}` : `Monete ${cost.name === 'oro' || cost.name === 'argento' ? "d'" : 'di '}${cost.name}`)}</span></span>
      </dd>
    </div>`;
  const masteryMarkup = masteryLabel ? `
    <section class="equipment-weapon-mastery equipment-rule-card">
      <span>Maestria dell’arma · 2024</span>
      <strong>${escapeHtml(masteryLabel)}</strong>
      ${masterySummary ? `<p>${escapeHtml(masterySummary)}</p>` : ''}
    </section>` : '';
  const armorMarkup = armorDetail ? `
    <section class="equipment-armor-summary" aria-label="Dettagli armatura">
      <article class="equipment-rule-card equipment-armor-card equipment-armor-card--type">
        <span>Tipologia</span>
        <strong>${escapeHtml(armorDetail.typeLabel)}</strong>
        <p>${item.is_shield ? 'Protezione impugnata.' : `Armatura ${escapeHtml(armorDetail.typeLabel.toLocaleLowerCase('it'))}.`}</p>
      </article>
      <article class="equipment-rule-card equipment-armor-card equipment-armor-card--defense">
        <span>Classe armatura</span>
        <strong>${escapeHtml(armorDetail.armorClassLabel)}</strong>
        <p>${escapeHtml(armorDetail.description)}</p>
      </article>
      <article class="equipment-rule-card equipment-armor-card equipment-armor-card--stealth ${armorDetail.stealthDisadvantage ? 'has-disadvantage' : ''}">
        <span>Prove di Furtività</span>
        <strong>${armorDetail.stealthDisadvantage ? 'Svantaggio' : 'Nessuno svantaggio'}</strong>
        <p>${armorDetail.stealthDisadvantage ? 'Indossare questa armatura impone svantaggio alle prove di Furtività.' : 'Questa armatura non penalizza le prove di Furtività.'}</p>
      </article>
      <article class="equipment-rule-card equipment-armor-card equipment-armor-card--strength ${armorDetail.minimumStrength ? 'has-requirement' : ''}">
        <span>Requisito di Forza</span>
        <strong>${armorDetail.minimumStrength ? `Forza ${escapeHtml(armorDetail.minimumStrength)}` : 'Nessun requisito'}</strong>
        <p>${armorDetail.minimumStrength ? `Richiede un punteggio di Forza pari o superiore a ${escapeHtml(armorDetail.minimumStrength)}.` : 'Non richiede un punteggio minimo di Forza.'}</p>
      </article>
    </section>` : '';
  const propertiesMarkup = weaponProperties.length ? `
    <section class="equipment-weapon-properties">
      <div class="equipment-weapon-properties__list">
        ${weaponProperties.map((property) => `
          <article class="equipment-weapon-property equipment-rule-card">
            <span>Proprietà dell’arma</span>
            <strong>${escapeHtml(property.label)}</strong>
            <p>${escapeHtml(property.description)}</p>
            ${property.value === 'gittata' && (item.range_normal || item.range_disadvantage)
              ? `<small>${escapeHtml(item.range_normal || '—')} / ${escapeHtml(item.range_disadvantage || '—')} m (normale / lunga)</small>`
              : ''}
            ${property.value === 'munizioni' && item.required_ammunition_type
              ? `<small>Munizione: ${escapeHtml(ammunitionTypeLabels.get(item.required_ammunition_type) || item.required_ammunition_type)}</small>`
              : ''}
          </article>`).join('')}
      </div>
    </section>` : '';
  content.innerHTML = '<section class="equipment-item-detail__info">' +
    (image ? '<img class="equipment-item-detail__image" src="'+image+'" alt="'+escapeHtml(item.name)+'" />' : '') +
    '<dl class="power-detail-facts">' + facts.map(([label,value])=>'<div><dt>'+escapeHtml(label)+'</dt><dd>'+escapeHtml(value)+'</dd></div>').join('') + costMarkup + '</dl>' +
    (damageModes.length > 1 && onModeChange ? '<section class="weapon-grip-picker"><span class="eyebrow">Impugnatura</span><div class="weapon-grip-picker__options">' + damageModes.map(mode => '<button type="button" data-weapon-mode="'+escapeHtml(mode.id)+'" aria-pressed="'+String(mode.id === selectedModeId)+'"><strong>'+escapeHtml(mode.label)+'</strong><small>'+escapeHtml(mode.damageDie)+'</small></button>').join('') + '</div><p>Seleziona la modalità usata per calcolare tiro per colpire e danni.</p></section>' : '') +
    armorMarkup +
    masteryMarkup +
    propertiesMarkup +
    (description ? '<section class="equipment-item-lore"><h3>Descrizione</h3><p class="equipment-item-detail__description">'+escapeHtml(description)+'</p></section>' : '') +
    (catalogMode && item.id ? '<section class="equipment-item-bundle" data-item-bundle hidden></section>' : '') + '</section>' +
    (slots.length && !catalogMode ? '<aside class="equipment-item-detail__body"><header class="equipment-position-header"><div><span class="eyebrow">Equipaggiamento</span><h3>'+escapeHtml(getBodyPartLabels(slots))+'</h3></div></header><div data-item-body-view></div><p class="equipment-position-hint">La parte lampeggiante indica la posizione dell’oggetto.</p></aside>' : '');
  return present({
    title: item.name || 'Oggetto',
    content, submitLabel: 'Chiudi', cancelLabel: null, showFooter: false,
    cardClass: ['modal-card--equipment-item-detail', shortcutSize ? 'modal-card--shortcut-size' : ''],
    onOpen: ({ modal, formEl }) => {
      const bundleHost = content.querySelector('[data-item-bundle]');
      if (bundleHost) {
        void fetchBundleContents([item.id]).then((contents) => {
          const html = renderBundleSection(contents.get(String(item.id)) || []);
          if (!html) return;
          bundleHost.innerHTML = html;
          bundleHost.hidden = false;
          bindBundleItems(bundleHost, async (childId) => {
            const [child] = await getSharedItemsByIds([childId]).catch(() => []);
            if (child) void openEquipmentItemDetail(child, { catalogMode: true, present, shortcutSize });
          });
        }).catch((error) => console.warn('Contenuti della dotazione non disponibili', error));
      }
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
