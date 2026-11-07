import { buildResourceFacts } from './resourceFacts.js';
import { createResource, updateResource } from '../characterApi.js';
import { getState } from '../../../app/state.js';
import {
  buildInput,
  buildSelect,
  buildTextarea,
  createToast,
  openConfirmModal,
  openFormModal,
  attachNumberStepper
} from '../../../ui/components.js';
import { consumeSpellSlot, saveCharacterData } from './data.js';
import { openDiceOverlay } from '../../dice-roller/overlay/dice.js';
import { buildSpellDamageOverlayConfig, getCastableSpellSlotLevels, sortSpellsByLevel } from './utils.js';
import { conditionList, damageTypeList, savingThrowList, weaknessLevelList } from './constants.js';
import { attachModalValueStepper } from './hpModal.js';
import { assignSharedSpellToCharacter, fetchCharacterSpells, removeCharacterSpell, searchSharedSpells, updateCharacterSpellAssignment } from '../spellbookApi.js';
import {
  dedupeCharacterSpells,
  getCharacterMaxSpellLevel,
  getCharacterRulesVersion,
  inferCharacterCasterClasses,
  mapSharedSpellForPreparation,
  normalizeSpellPreparationState
} from '../spellPreparation.js';
import { attachUnifiedDetailActions } from './detailManagement.js';
import { sanitizeExternalUrl, sanitizeImageUrl } from '../../../lib/html.js';
import { normalizeSpellSchool, spellSchoolLabels } from '../spellSchools.js';
import { normalizeSpellSource } from '../spellSources.js';
import { showShortcutLoader } from './shortcutViews.js';

const SPELL_CAST_TIME_OPTIONS = ['Azione', 'Azione Bonus', 'Reazione', 'Azione Gratuita', 'Durata'];
const SPELL_SCHOOL_OPTIONS = ['', ...spellSchoolLabels];
const SPELL_CASTER_CLASS_OPTIONS = ['mago', 'warlock', 'stregone', 'chierico', 'druido', 'ranger', 'artefice', 'paladino', 'bardo'];
const SPELL_RULES_VERSION_OPTIONS = ['2014', '2024', 'Custom'];

function normalizeSpellCastTime(castTime) {
  const rawValue = castTime?.toString().trim();
  if (!rawValue) return '';
  const normalized = rawValue.toLowerCase();
  if (normalized.includes('bonus')) return 'Azione Bonus';
  if (normalized.includes('reaz')) return 'Reazione';
  if (normalized.includes('gratuit')) return 'Azione Gratuita';
  if (normalized.includes('durata') || normalized.includes('più') || normalized.includes('piu') || normalized.includes('superiore')) return 'Durata';
  if (normalized.includes('azion')) return 'Azione';
  const matchingOption = SPELL_CAST_TIME_OPTIONS.find((option) => option.toLowerCase() === normalized);
  return matchingOption || '';
}


function openSpellDamageOverlay(character, spell, castLevel = null) {
  const overlayConfig = buildSpellDamageOverlayConfig(spell, castLevel);
  if (!overlayConfig) return;
  openDiceOverlay({
    keepOpen: true,
    title: overlayConfig.title,
    mode: 'generic',
    notation: overlayConfig.notation,
    modifier: overlayConfig.modifier,
    rollType: 'DMG',
    characterId: character?.id,
    historyLabel: spell?.name || null
  });
}

function getCastSlotOptions(character, spell) {
  return getCastableSpellSlotLevels(character?.data?.spellcasting?.slots, spell?.level)
    .map((entry) => ({
      value: String(entry.level),
      label: `${entry.level}° livello (${entry.available} slot)`
    }));
}

async function chooseCastSlotLevel(character, spell) {
  const level = Math.max(1, Number(spell?.level) || 1);
  const castSlotOptions = getCastSlotOptions(character, spell);
  if (!castSlotOptions.length) {
    createToast('Slot incantesimo esauriti', 'error');
    return null;
  }
  const hasHigherLevelOption = castSlotOptions.some((option) => Number(option.value) > level);
  if (castSlotOptions.length === 1 && !hasHigherLevelOption) {
    return Math.max(level, Number(castSlotOptions[0].value) || level);
  }
  const field = document.createElement('label');
  field.className = 'field';
  field.innerHTML = '<span>Slot da consumare</span>';
  const castSlotSelect = buildSelect(castSlotOptions, castSlotOptions[0]?.value || String(level));
  castSlotSelect.name = 'cast_slot_level';
  field.appendChild(castSlotSelect);
  const content = document.createElement('div');
  content.className = 'modal-form-grid';
  content.appendChild(field);
  const formData = await openFormModal({
    title: spell?.name ? `Lancia ${spell.name}` : 'Scegli slot incantesimo',
    submitLabel: 'Conferma',
    cancelLabel: 'Annulla',
    content,
    cardClass: 'modal-card--form'
  });
  if (!formData) return null;
  return Math.max(level, Number(formData.get('cast_slot_level')) || level);
}

export function openBackgroundModal(character) {
  if (!character) return;
  const data = character.data || {};
  const description = data.description || 'Aggiungi una descrizione del background.';
  const backgroundName = data.background || 'Background non specificato';
  const content = document.createElement('div');
  content.className = 'background-modal';

  const hero = document.createElement('div');
  hero.className = 'background-modal-hero';
  hero.innerHTML = `
    <span class="background-modal-hero__eyebrow">Storia del personaggio</span>
    <strong>${escapeHtml(character.name || 'Background')}</strong>
    <span class="background-modal-hero__background">${escapeHtml(backgroundName)}</span>
  `;

  const descriptionCard = document.createElement('div');
  descriptionCard.className = 'detail-card detail-card--text background-modal-card';
  const descriptionBlock = document.createElement('div');
  descriptionBlock.className = 'background-modal-block';
  const quoteMark = document.createElement('span');
  quoteMark.className = 'background-modal-quote-mark';
  quoteMark.setAttribute('aria-hidden', 'true');
  quoteMark.textContent = '“';
  const descriptionText = document.createElement('p');
  descriptionText.className = 'background-modal-description';
  descriptionText.textContent = description;
  descriptionBlock.appendChild(quoteMark);
  descriptionBlock.appendChild(descriptionText);
  descriptionCard.appendChild(descriptionBlock);

  content.appendChild(hero);
  content.appendChild(descriptionCard);

  openFormModal({
    title: `Storia di ${character.name || 'personaggio'}`,
    cancelLabel: null,
    content,
    cardClass: ['modal-card--wide', 'modal-card--scrollable', 'modal-card--background'],
    showFooter: false
  });
}

export async function openConditionsModal(character) {
  if (!character) return null;
  const data = character.data || {};
  const current = Array.isArray(data.conditions)
    ? data.conditions
    : (data.condition ? [data.condition] : []);
  const content = document.createElement('div');
  content.className = 'condition-modal';

  const list = document.createElement('div');
  list.className = 'condition-modal__list';
  conditionList.forEach((condition) => {
    const label = document.createElement('label');
    const isChecked = current.includes(condition.key);
    label.className = `condition-modal__item${isChecked ? ' is-selected' : ''}`;
    label.innerHTML = `
      <input class="condition-modal__input" type="checkbox" name="conditions" value="${condition.key}" ${isChecked ? 'checked' : ''} />
      <span class="condition-modal__icon" aria-hidden="true">◆</span>
      <span class="condition-modal__item-label"><strong>${condition.label}</strong><small>${condition.effect}</small></span>
      <span class="condition-modal__check" aria-hidden="true">✓</span>
    `;
    const checkbox = label.querySelector('input[type="checkbox"]');
    checkbox?.addEventListener('change', () => {
      label.classList.toggle('is-selected', checkbox.checked);
    });
    list.appendChild(label);
  });
  content.appendChild(list);

  return openFormModal({
    title: 'Condizioni',
    submitLabel: 'Applica',
    cancelLabel: 'Annulla',
    content,
    cardClass: ['modal-card--wide', 'modal-card--status-editor']
  });
}

export async function openWeaknessModal(character) {
  if (!character) return null;
  const current = Math.max(0, Math.min(6, Number(character.data?.hp?.weak_points) || 0));
  const content = document.createElement('div');
  content.className = 'weakness-modal';
  content.innerHTML = `
    <div class="weakness-modal__intro">
      <span aria-hidden="true">◒</span>
      <div><strong>Livello di indebolimento</strong><small>Seleziona il livello attuale. Gli effetti sono cumulativi.</small></div>
    </div>
    <div class="weakness-modal__list" role="radiogroup" aria-label="Livello di indebolimento">
      ${weaknessLevelList.map((level) => `
        <label class="weakness-modal__item ${current === level.value ? 'is-selected' : ''}">
          <input type="radio" name="weakness_level" value="${level.value}" ${current === level.value ? 'checked' : ''} />
          <span class="weakness-modal__level">${level.value || '—'}</span>
          <span class="weakness-modal__copy"><strong>${level.label}</strong><small>${level.effect}</small></span>
          <span class="weakness-modal__check" aria-hidden="true">✓</span>
        </label>
      `).join('')}
    </div>`;
  content.querySelectorAll('input[name="weakness_level"]').forEach((input) => {
    input.addEventListener('change', () => {
      content.querySelectorAll('.weakness-modal__item').forEach((item) => item.classList.toggle('is-selected', item.contains(input)));
    });
  });
  return openFormModal({
    title: `Indebolimento di ${character.name || 'personaggio'}`,
    submitLabel: 'Applica',
    cancelLabel: 'Annulla',
    content,
    cardClass: ['modal-card--wide', 'modal-card--status-editor']
  });
}
function attachDetailManagementActions(modal, formEl, { onEdit, onDelete } = {}) {
  return attachUnifiedDetailActions(modal, formEl, { onEdit, onDelete });
}

export async function openResourcePoolConsumeModal(resource) {
  const maxUses = Math.max(0, Number(resource?.max_uses) || 0);
  const used = Math.max(0, Math.min(Number(resource?.used) || 0, maxUses));
  const remaining = Math.max(maxUses - used, 0);
  if (!remaining) return null;

  const content = document.createElement('div');
  content.className = 'modal-form-grid hp-shortcut-fields resource-pool-consume';

  const availability = document.createElement('p');
  availability.className = 'resource-pool-consume__availability';
  availability.innerHTML = `<span>Pool disponibile</span><strong>${remaining}/${maxUses}</strong>`;

  const amountField = buildInput({
    label: 'Quantità da consumare',
    name: 'pool_amount',
    type: 'number',
    value: '1'
  });
  amountField.classList.add('hp-shortcut-fields__amount');
  const amountInput = amountField.querySelector('input');
  if (amountInput) {
    amountInput.min = '1';
    amountInput.max = String(remaining);
    amountInput.required = true;
    attachModalValueStepper(amountInput, { min: 1, max: remaining });
  }

  const row = document.createElement('div');
  row.className = 'modal-form-row modal-form-row--balanced hp-shortcut-fields__row';
  row.appendChild(amountField);
  content.append(availability, row);

  const formData = await openFormModal({
    title: resource?.name ? `Consuma ${resource.name}` : 'Consuma pool',
    submitLabel: 'Consuma',
    cancelLabel: 'Annulla',
    content
  });
  if (!formData) return null;
  return Math.max(1, Math.min(Number(formData.get('pool_amount')) || 1, remaining));
}


export async function openVariableResourceCostModal(resource, parentResource) {
  const maxUses = Math.max(0, Number(parentResource?.max_uses) || 0);
  const used = Math.max(0, Math.min(Number(parentResource?.used) || 0, maxUses));
  const remaining = Math.max(maxUses - used, 0);
  if (!remaining) return null;

  const content = document.createElement('div');
  content.className = 'modal-form-grid hp-shortcut-fields resource-pool-consume';
  const availability = document.createElement('p');
  availability.className = 'resource-pool-consume__availability';
  availability.innerHTML = `<span>Risorsa disponibile</span><strong>${remaining}/${maxUses}</strong>`;
  const amountField = buildInput({
    label: 'Costo da consumare',
    name: 'variable_resource_cost',
    type: 'number',
    value: '1'
  });
  amountField.classList.add('hp-shortcut-fields__amount');
  const amountInput = amountField.querySelector('input');
  if (amountInput) {
    amountInput.min = '1';
    amountInput.max = String(remaining);
    amountInput.required = true;
    attachModalValueStepper(amountInput, { min: 1, max: remaining });
  }
  const row = document.createElement('div');
  row.className = 'modal-form-row modal-form-row--balanced hp-shortcut-fields__row';
  row.appendChild(amountField);
  content.append(availability, row);

  const formData = await openFormModal({
    title: resource?.name ? `Costo di ${resource.name}` : 'Costo sotto-abilità',
    submitLabel: 'Usa',
    cancelLabel: 'Annulla',
    content
  });
  if (!formData) return null;
  return Math.max(1, Math.min(Number(formData.get('variable_resource_cost')) || 1, remaining));
}

export async function openResourceOptionModal(resource, childResources = [], {
  onRollOption,
  present = openFormModal
} = {}) {
  if (!childResources.length) return null;
  const maxUses = Math.max(0, Number(resource?.max_uses) || 0);
  const used = Math.max(0, Number(resource?.used) || 0);
  const remaining = Math.max(maxUses - used, 0);
  const options = childResources.map((child) => {
    const variableCost = Boolean(child.resource_cost_variable);
    const cost = variableCost ? 1 : Math.max(1, Number(child.resource_cost) || 1);
    return { child, cost, variableCost, available: remaining >= cost };
  });
  const firstAvailableId = options.find((option) => option.available)?.child.id;
  const content = document.createElement('div');
  content.className = 'resource-option-picker';
  content.innerHTML = `
    <p class="muted">Scegli come usare <strong>${escapeHtml(resource?.name || 'questa abilità')}</strong>. Hai <strong>${remaining}</strong> risorse disponibili.</p>
    <div class="resource-option-picker__list">
      ${options.map(({ child, cost, variableCost, available }) => {
    const diceLabel = child.damage_dice_notation
      ? `${child.damage_dice_notation}${Number(child.damage_modifier) ? ` ${Number(child.damage_modifier) > 0 ? '+' : ''}${Number(child.damage_modifier)}` : ''}`
      : '';
    return `
        <div class="resource-option-picker__item ${available ? '' : 'is-disabled'}">
          <label class="resource-option-picker__choice">
            <input type="radio" name="resource_option_id" value="${escapeHtml(child.id)}" ${String(child.id) === String(firstAvailableId) ? 'checked' : ''} ${available ? '' : 'disabled'} />
            <span class="resource-option-picker__content">
              <span class="resource-option-picker__heading">
                <strong>${escapeHtml(child.name || 'Opzione')}</strong>
                <span class="resource-option-picker__cost ${available ? '' : 'is-unavailable'}">${variableCost ? 'Costo variabile' : `Costo ${cost}`}</span>
              </span>
              <small>${[child.cast_time, diceLabel || 'Nessun tiro'].filter(Boolean).map(escapeHtml).join(' · ')}</small>
              ${child.description ? `<span>${escapeHtml(child.description)}</span>` : ''}
              ${available ? '' : `<small class="resource-option-picker__warning">${variableCost ? 'Non ci sono risorse disponibili.' : `Servono ${cost} risorse; disponibili ${remaining}.`}</small>`}
            </span>
          </label>
          ${diceLabel && onRollOption ? `<button class="resource-option-picker__roll" type="button" data-resource-option-roll="${escapeHtml(child.id)}" aria-label="Tira ${escapeHtml(diceLabel)} per ${escapeHtml(child.name || 'opzione')}" ${available ? '' : 'disabled'}>${escapeHtml(diceLabel)}</button>` : ''}
        </div>
      `;
  }).join('')}
    </div>
  `;
  const formData = await present({
    title: `Usa ${resource?.name || 'abilità'}`,
    submitLabel: 'Usa opzione',
    cancelLabel: 'Annulla',
    content,
    onOpen: ({ modal }) => {
      const submitButton = modal.querySelector('[data-form-submit]');
      const rollButtons = [...modal.querySelectorAll('[data-resource-option-roll]')];
      const rollHandlers = rollButtons.map((button) => {
        const handler = () => {
          const child = childResources.find((entry) => String(entry.id) === String(button.dataset.resourceOptionRoll));
          if (child) onRollOption?.(child);
        };
        button.addEventListener('click', handler);
        return [button, handler];
      });
      if (submitButton) submitButton.disabled = !firstAvailableId;
      return () => {
        rollHandlers.forEach(([button, handler]) => button.removeEventListener('click', handler));
        if (submitButton) submitButton.disabled = false;
      };
    }
  });
  return formData?.get('resource_option_id') || null;
}

export function openResourceDetail(resource, {
  present = openFormModal,
  childResources = [],
  canHaveChildren = Boolean(resource?.can_have_children),
  onUse,
  onReset,
  onRecover,
  onEdit,
  onDelete,
  onCreateChild,
  onOpenChild
} = {}) {
  const detail = document.createElement('div');
  detail.className = 'resource-detail';
  const maxUses = Number(resource.max_uses) || 0;
  const used = Math.max(0, Number(resource.used) || 0);
  const remaining = Math.max(maxUses - used, 0);
  const isExhausted = Boolean(maxUses && used >= maxUses);
  const isActive = resource.reset_on !== null && resource.reset_on !== 'none';
  const hasAction = Boolean(maxUses && (isExhausted ? onReset : onUse));
  const canRecoverCharge = Boolean(maxUses > 1 && used > 0 && onRecover);
  const description = resource.description?.trim() || 'Nessuna descrizione disponibile per questa risorsa.';
  const isPool = resource.resource_type === 'pool';
  const poolPercent = maxUses ? Math.min(Math.max((remaining / maxUses) * 100, 0), 100) : 0;
  const hasDisplayImage = hasUsableDetailImage(resource.image_url);
  const imageUrl = resource.image_url?.trim() || '';
  const usageLabel = isPool ? 'Pool disponibile' : 'Cariche disponibili';
  const showChildSection = Boolean(canHaveChildren);
  const resourceFacts = buildResourceFacts(resource).replace(
    'class="power-detail-facts"',
    'class="spell-manual__facts power-detail-facts"'
  );
  const resourceKind = resource.resource_type === 'passive'
    ? 'Sempre attiva'
    : resource.resource_type === 'pool' ? 'Riserva' : 'Abilità consumabile';

  detail.innerHTML = `
    <article class="spell-manual power-manual ${hasDisplayImage ? 'spell-manual--illustrated' : ''}">
      <header class="spell-manual__hero power-manual__hero">
        ${hasDisplayImage ? `<img class="spell-manual__image" src="${escapeHtml(imageUrl)}" alt="Immagine di ${escapeHtml(resource.name || 'abilità')}" />` : '<span class="spell-manual__crest" aria-hidden="true">◆</span>'}
        <div class="spell-manual__heading">
          <span class="spell-manual__kicker">${escapeHtml(resourceKind)}</span>
          <h3>${escapeHtml(resource.name || 'Abilità')}</h3>
        </div>
      </header>
      ${resourceFacts}
    <section class="spell-manual__body resource-parent-overview resource-parent-overview--text-only">
      <div class="resource-parent-overview__content">
        ${isPool && maxUses ? `
          <div class="resource-pool resource-pool--detail" aria-label="${usageLabel} ${remaining} su ${maxUses}">
            <div class="resource-pool__label"><span>${usageLabel}</span><strong><span class="resource-pool__value">${remaining}/${maxUses}</span><small>${Math.round(poolPercent)}%</small></strong></div>
            <div class="resource-pool__track" role="meter" aria-valuemin="0" aria-valuemax="${maxUses}" aria-valuenow="${remaining}">
              <div class="resource-pool__fill" style="width: ${poolPercent}%;"></div>
            </div>
          </div>
        ` : ''}
        <div class="detail-rich-text">${renderDetailText(description)}</div>
      </div>
    </section>
    ${showChildSection ? `
      <section class="resource-detail-options">
        <div class="resource-detail-options__header">
          <div>
            <span class="resource-detail-options__eyebrow">Sotto-abilità</span>
            <strong>Opzioni collegate</strong>
            <small>Ogni opzione usa le cariche di ${escapeHtml(resource.name || 'questa abilità')}, ma mantiene i propri dadi e dettagli.</small>
          </div>
          ${onCreateChild ? '<button type="button" data-resource-child-create class="ghost-button resource-detail-options__add"><span aria-hidden="true">＋</span> Aggiungi</button>' : ''}
        </div>
        ${childResources.length ? `<div class="resource-detail-options__list">
          ${childResources.map((child, index) => {
    const childDescription = child.description?.trim();
    const diceLabel = child.damage_dice_notation
      ? `${child.damage_dice_notation}${Number(child.damage_modifier) ? ` ${Number(child.damage_modifier) > 0 ? '+' : ''}${Number(child.damage_modifier)}` : ''}`
      : 'Nessun tiro';
    return `
            <button type="button" class="resource-detail-option" data-resource-child-open="${escapeHtml(child.id)}">
              <span class="resource-detail-option__branch" aria-hidden="true">${index + 1}</span>
              <div class="resource-detail-option__content">
                <div class="resource-detail-option__heading">
                  <strong>${escapeHtml(child.name || 'Opzione')}</strong>
                  <div class="resource-detail-option__badges">
                    ${child.cast_time ? `<span>${escapeHtml(child.cast_time)}</span>` : ''}
                    <span>${escapeHtml(diceLabel)}</span>
                    <span>${child.resource_cost_variable ? 'Costo variabile' : `Costo ${Math.max(1, Number(child.resource_cost) || 1)}`}</span>
                  </div>
                </div>
                ${childDescription ? `<p>${escapeHtml(childDescription)}</p>` : '<p class="muted">Nessuna descrizione.</p>'}
              </div>
            </button>
          `;
  }).join('')}
        </div>` : '<div class="resource-detail-options__empty"><span aria-hidden="true">◇</span><p>Nessuna sotto-abilità configurata.</p></div>'}
      </section>
    ` : ''}
    </article>
  `;

  return present({
    title: 'Scheda abilità',
    submitLabel: hasAction
      ? (isExhausted ? 'Ripristina' : (isPool ? 'Consuma' : 'Usa'))
      : 'Chiudi',
    cancelLabel: isActive ? (hasAction ? 'Chiudi' : null) : null,
    content: detail,
    showFooter: isActive,
    cardClass: 'modal-card--resource-detail',
    onOpen: ({ modal, formEl }) => {
      const cleanupManagementActions = attachDetailManagementActions(modal, formEl, { onEdit, onDelete });
      const createButton = detail.querySelector('[data-resource-child-create]');
      const childButtons = [...detail.querySelectorAll('[data-resource-child-open]')];
      const createHandler = () => onCreateChild?.();
      const childHandlers = childButtons.map((button) => {
        const handler = () => onOpenChild?.(button.dataset.resourceChildOpen);
        button.addEventListener('click', handler);
        return [button, handler];
      });
      createButton?.addEventListener('click', createHandler);

      let recoverButton = null;
      if (canRecoverCharge && !isPool) {
        const submitButton = modal.querySelector('[data-form-submit]');
        const actionsRight = submitButton?.parentElement;
        if (actionsRight) {
          recoverButton = document.createElement('button');
          recoverButton.type = 'submit';
          recoverButton.name = 'resource_action';
          recoverButton.value = 'recover';
          recoverButton.className = 'ghost-button';
          recoverButton.textContent = 'Recupera Carica';
          actionsRight.insertBefore(recoverButton, submitButton);
        }
      }

      return () => {
        createButton?.removeEventListener('click', createHandler);
        childHandlers.forEach(([button, handler]) => button.removeEventListener('click', handler));
        recoverButton?.remove();
        cleanupManagementActions?.();
      };
    }
  }).then(async (formData) => {
    if (!formData) return;
    const detailAction = formData.get('detail_action');
    if (detailAction === 'edit' && onEdit) {
      onEdit();
      return;
    }
    if (detailAction === 'delete' && onDelete) {
      await onDelete();
      return;
    }
    if (!maxUses) return;
    if (formData.get('resource_action') === 'recover' && onRecover) {
      await onRecover();
      return;
    }
    if (isExhausted && onReset) {
      await onReset();
      return;
    }
    if (!isExhausted && onUse) {
      await onUse();
    }
  });
}

export function openSpellDrawer(character, onSave, spell = null, options = {}) {
  const { catalogMode = false, present = openFormModal, defaultRulesVersion = '2024' } = options;
  if (!character && !catalogMode) return;
  const enhanceSpellNumericField = (field) => {
    const input = field?.querySelector('input[type="number"]');
    if (!input) return;
    const fieldLabel = field.querySelector('span')?.textContent?.trim();
    attachNumberStepper(input, {
      decrementLabel: fieldLabel ? `Riduci ${fieldLabel}` : 'Diminuisci valore',
      incrementLabel: fieldLabel ? `Aumenta ${fieldLabel}` : 'Aumenta valore'
    });
  };
  const canPrepare = !catalogMode && Boolean(character?.data?.is_spellcaster);
  const form = document.createElement('div');
  form.className = 'drawer-form modal-form-grid spell-form spell-editor-form';
  const buildSection = (title, description = '') => {
    const section = document.createElement('section');
    section.className = 'spell-form-section';
    section.innerHTML = `
      <div class="spell-form-section__header">
        <h4>${title}</h4>
        ${description ? `<p class="muted">${description}</p>` : ''}
      </div>
    `;
    return section;
  };
  const buildRow = (elements, variant = 'balanced') => {
    const row = document.createElement('div');
    row.className = `modal-form-row modal-form-row--${variant}`;
    elements.filter(Boolean).forEach((element) => row.appendChild(element));
    return row;
  };
  const spellKindField = document.createElement('label');
  spellKindField.className = 'field';
  spellKindField.innerHTML = '<span>Tipo incantesimo</span>';
  const initialKind = spell?.kind ?? (Number(spell?.level) === 0 ? 'cantrip' : 'spell');
  const spellKindSelect = buildSelect([
    { value: 'cantrip', label: 'Trucchetto' },
    { value: 'spell', label: 'Incantesimo' }
  ], initialKind);
  spellKindSelect.name = 'spell_kind';
  spellKindField.appendChild(spellKindSelect);
  const nameField = buildInput({
    label: 'Nome incantesimo',
    name: 'spell_name',
    placeholder: 'Es. Palla di fuoco',
    value: spell?.name ?? ''
  });
  const nameInput = nameField.querySelector('input');
  if (nameInput) {
    nameInput.required = true;
    nameInput.title = 'Inserisci il nome dell’incantesimo.';
    const clearNameValidation = () => nameInput.setCustomValidity('');
    nameInput.addEventListener('input', clearNameValidation);
    nameInput.addEventListener('invalid', () => {
      if (nameInput.validity.valueMissing) nameInput.setCustomValidity('Inserisci il nome dell’incantesimo.');
    });
  }
  const levelField = buildInput({
    label: 'Livello incantesimo',
    name: 'spell_level',
    type: 'number',
    value: spell?.level ?? 1
  });
  const levelInput = levelField.querySelector('input');
  if (levelInput) {
    levelInput.min = '1';
    levelInput.max = '9';
  }
  const prepStateField = canPrepare ? document.createElement('div') : null;
  if (prepStateField) {
    const selectedPrepState = ['always', 'always_prepared'].includes(spell?.prep_state) ? 'always' : 'prepared';
    prepStateField.className = 'spell-choice-group';
    prepStateField.innerHTML = `
      <span class="spell-choice-group__label">Preparazione</span>
      <div class="spell-choice-card-grid spell-choice-card-grid--preparation">
        ${[
    { value: 'prepared', label: 'Preparato' },
    { value: 'always', label: 'Sempre preparato' }
  ].map((entry) => `
          <label class="spell-choice-card">
            <input type="radio" name="spell_prep_state" value="${entry.value}" ${selectedPrepState === entry.value ? 'checked' : ''} />
            <span><strong>${entry.label}</strong><b aria-hidden="true">✓</b></span>
          </label>
        `).join('')}
      </div>
    `;
  }
  const identitySection = buildSection('Identità', 'Nome, livello e regole base dell\'incantesimo.');
  identitySection.appendChild(buildRow([nameField, spellKindField, levelField], 'compact'));

  const castTimeField = document.createElement('label');
  castTimeField.className = 'field';
  castTimeField.innerHTML = '<span>Tipo di lancio</span>';
  const castTimeSelect = buildSelect(
    [
      { value: '', label: 'Seleziona tipo' },
      ...SPELL_CAST_TIME_OPTIONS.map((value) => ({ value, label: value }))
    ],
    normalizeSpellCastTime(spell?.cast_time)
  );
  castTimeSelect.name = 'spell_cast_time';
  castTimeField.appendChild(castTimeSelect);
  const schoolField = document.createElement('label');
  schoolField.className = 'field';
  schoolField.innerHTML = '<span>Scuola di magia</span>';
  const schoolSelect = buildSelect(
    SPELL_SCHOOL_OPTIONS.map((value) => ({ value, label: value || 'N/D' })),
    normalizeSpellSchool(spell?.school)
  );
  schoolSelect.name = 'spell_school';
  schoolField.appendChild(schoolSelect);
  const rulesVersionField = document.createElement('label');
  rulesVersionField.className = 'field';
  rulesVersionField.innerHTML = '<span>Versione regole</span>';
  const rulesVersionSelect = buildSelect(
    SPELL_RULES_VERSION_OPTIONS.map((value) => ({ value, label: value })),
    spell?.rules_version ?? defaultRulesVersion
  );
  rulesVersionSelect.name = 'spell_rules_version';
  rulesVersionField.appendChild(rulesVersionSelect);
  const sourceField = buildInput({
    label: 'Manuale / fonte',
    name: 'spell_source',
    placeholder: 'Es. Xanathar\'s Guide to Everything',
    value: normalizeSpellSource(spell?.source)
  });
  identitySection.appendChild(buildRow([schoolField, rulesVersionField, sourceField], 'compact'));
  form.appendChild(identitySection);
  const selectedCasterClasses = new Set(
    Array.isArray(spell?.caster_classes)
      ? spell.caster_classes.map((entry) => String(entry).trim().toLowerCase()).filter(Boolean)
      : []
  );
  const casterClassesField = document.createElement('div');
  casterClassesField.className = 'field';
  casterClassesField.innerHTML = `
    <span>Classi incantatrici</span>
    <div class="spell-caster-class-grid">
      ${SPELL_CASTER_CLASS_OPTIONS.map((entry) => `
        <label class="spell-caster-class-option spell-choice-card">
          <input type="checkbox" name="spell_caster_classes" value="${entry}" ${selectedCasterClasses.has(entry) ? 'checked' : ''} />
          <span><strong>${entry}</strong><b aria-hidden="true">✓</b></span>
        </label>
      `).join('')}
    </div>
  `;
  const classesSection = buildSection('Classi', 'Seleziona le classi che possono impararlo o prepararlo.');
  classesSection.appendChild(casterClassesField);
  form.appendChild(classesSection);

  const castingSection = buildSection('Lancio', 'Tempi, gittata, durata e componenti in un colpo d\'occhio.');
  castingSection.appendChild(buildRow([
    castTimeField,
    buildInput({
      label: 'Durata',
      name: 'spell_duration',
      placeholder: 'Es. 1 minuto',
      value: spell?.duration ?? ''
    }),
    buildInput({
      label: 'Range',
      name: 'spell_range',
      placeholder: 'Es. 18 m',
      value: spell?.range ?? ''
    }),
    buildInput({
      label: 'Componenti',
      name: 'spell_components',
      placeholder: 'Es. V, S, M',
      value: spell?.components ?? ''
    }),
    buildInput({
      label: 'Componenti materiali',
      name: 'spell_material',
      placeholder: 'Es. una perla del valore di 100 mo',
      value: spell?.material ?? ''
    })
  ], 'compact'));
  form.appendChild(castingSection);

  const traitsSection = buildSection('Proprietà rapide', 'Seleziona solo le regole applicate dall’incantesimo.');
  const buildSpellTraitCard = (name, label, icon) => {
    const field = document.createElement('label');
    field.className = 'spell-trait-card';
    field.innerHTML = `
      <input type="checkbox" name="${name}" />
      <span><i aria-hidden="true">${icon}</i><strong>${label}</strong><b aria-hidden="true">✓</b></span>
    `;
    const input = field.querySelector('input');
    input.addEventListener('change', () => field.classList.toggle('is-selected', input.checked));
    return field;
  };
  const concentrationField = buildSpellTraitCard('spell_concentration', 'Concentrazione', '◉');
  const attackRollField = buildSpellTraitCard('spell_attack_roll', 'Tiro per colpire', '⚔');
  const savingThrowField = document.createElement('label');
  savingThrowField.className = 'spell-trait-card spell-trait-card--described';
  savingThrowField.innerHTML = `
    <input type="checkbox" name="spell_has_saving_throw" ${spell?.saving_throw_ability ? 'checked' : ''} />
    <span>
      <i aria-hidden="true">◈</i>
      <span class="spell-trait-card__copy"><strong>Tiro salvezza</strong><small>L’incantesimo fa effettuare un tiro salvezza.</small></span>
      <b aria-hidden="true">✓</b>
    </span>
  `;
  const savingThrowToggle = savingThrowField.querySelector('input[name="spell_has_saving_throw"]');
  const savingThrowAbilityField = document.createElement('label');
  savingThrowAbilityField.className = 'field spell-saving-throw-ability';
  savingThrowAbilityField.innerHTML = '<span>Caratteristica</span>';
  const savingThrowAbilitySelect = buildSelect(
    savingThrowList.map((entry) => ({ value: entry.key, label: entry.label })),
    spell?.saving_throw_ability ?? savingThrowList[0]?.key ?? 'str'
  );
  savingThrowAbilitySelect.name = 'spell_saving_throw_ability';
  savingThrowAbilityField.appendChild(savingThrowAbilitySelect);
  const ritualField = buildSpellTraitCard('spell_is_ritual', 'Rituale', '✦');
  traitsSection.appendChild(buildRow([concentrationField, attackRollField, ritualField], 'compact'));
  form.appendChild(traitsSection);
  const launchOptionsRow = buildRow([savingThrowField, savingThrowAbilityField, prepStateField], 'compact');
  launchOptionsRow.classList.add('spell-launch-options-row');
  traitsSection.appendChild(launchOptionsRow);
  const damageDieField = buildInput({
    label: 'Notazione dado',
    name: 'spell_damage_die',
    placeholder: 'Es. 1d10',
    value: spell?.damage_die ?? ''
  });
  const damageModifierField = buildInput({
    label: 'Modificatore',
    name: 'spell_damage_modifier',
    type: 'number',
    value: spell?.damage_modifier ?? ''
  });
  const damageTypeField = document.createElement('label');
  damageTypeField.className = 'field';
  damageTypeField.innerHTML = '<span>Tipo di danno</span>';
  const damageTypeSelect = buildSelect([
    { value: '', label: 'Nessun tipo' },
    ...damageTypeList.filter((type) => type.key !== 'all').map((type) => ({ value: type.key, label: type.label }))
  ], spell?.damage_type ?? '');
  damageTypeSelect.name = 'spell_damage_type';
  damageTypeField.appendChild(damageTypeSelect);
  const upcastDamageDieField = buildInput({
    label: 'Dado extra per slot superiore',
    name: 'spell_upcast_damage_die',
    placeholder: 'Es. 1d8',
    value: spell?.upcast_damage_die ?? ''
  });
  const upcastDamageModifierField = buildInput({
    label: 'Modificatore extra/slot',
    name: 'spell_upcast_damage_modifier',
    type: 'number',
    value: spell?.upcast_damage_modifier ?? ''
  });
  const upcastStartLevelField = buildInput({
    label: 'Slot minimo upcast',
    name: 'spell_upcast_start_level',
    type: 'number',
    value: spell?.upcast_start_level ?? ''
  });
  const upcastStartLevelInput = upcastStartLevelField.querySelector('input');
  if (upcastStartLevelInput) {
    upcastStartLevelInput.min = '1';
    upcastStartLevelInput.max = '9';
  }
  const damageSection = buildSection('Danni e upcast', 'Compila solo i campi utili: puoi lasciare vuoto ciò che non serve.');
  damageSection.appendChild(buildRow([damageDieField, damageModifierField, damageTypeField], 'compact'));
  const upcastDetails = document.createElement('details');
  upcastDetails.className = 'spell-form-advanced';
  upcastDetails.innerHTML = '<summary>Progressione con slot superiori</summary>';
  upcastDetails.appendChild(buildRow([upcastDamageDieField, upcastDamageModifierField, upcastStartLevelField], 'compact'));
  damageSection.appendChild(upcastDetails);
  form.appendChild(damageSection);

  const descriptionSection = buildSection('Descrizione');
  descriptionSection.appendChild(buildTextarea({
    label: 'Descrizione',
    name: 'spell_description',
    placeholder: 'Descrizione dell\'incantesimo...',
    value: spell?.description ?? ''
  }));
  form.appendChild(descriptionSection);

  const concentrationInput = form.querySelector('input[name="spell_concentration"]');
  if (concentrationInput) {
    concentrationInput.checked = Boolean(spell?.concentration);
    concentrationField.classList.toggle('is-selected', concentrationInput.checked);
  }
  const attackRollInput = form.querySelector('input[name="spell_attack_roll"]');
  if (attackRollInput) {
    attackRollInput.checked = Boolean(spell?.attack_roll);
    attackRollField.classList.toggle('is-selected', attackRollInput.checked);
  }
  const ritualInput = form.querySelector('input[name="spell_is_ritual"]');
  if (ritualInput) {
    ritualInput.checked = Boolean(spell?.is_ritual);
    ritualField.classList.toggle('is-selected', ritualInput.checked);
  }
  const syncSavingThrow = () => {
    const enabled = Boolean(savingThrowToggle?.checked);
    savingThrowField.classList.toggle('is-selected', enabled);
    savingThrowAbilityField.hidden = !enabled;
    savingThrowAbilitySelect.disabled = !enabled;
  };
  savingThrowToggle?.addEventListener('change', syncSavingThrow);
  syncSavingThrow();

  const syncSpellKind = () => {
    if (!levelInput) return;
    if (spellKindSelect.value === 'cantrip') {
      levelInput.value = '0';
      levelInput.min = '0';
      levelInput.max = '0';
      levelInput.readOnly = true;
      levelInput.disabled = true;
    } else {
      if (Number(levelInput.value) === 0) {
        levelInput.value = '1';
      }
      levelInput.min = '1';
      levelInput.max = '9';
      levelInput.readOnly = false;
      levelInput.disabled = false;
    }
  };
  spellKindSelect.addEventListener('change', syncSpellKind);
  syncSpellKind();

  form.querySelectorAll('input[type="number"]').forEach((input) => {
    const field = input.closest('.field');
    enhanceSpellNumericField(field);
  });

  const wizard = document.createElement('div');
  wizard.className = 'item-editor-wizard spell-editor-wizard';
  const wizardNav = document.createElement('nav');
  wizardNav.className = 'item-editor-wizard__nav spell-editor-wizard__nav';
  wizardNav.setAttribute('aria-label', 'Passaggi modifica incantesimo');
  const wizardBody = document.createElement('div');
  wizardBody.className = 'item-editor-wizard__body';
  const wizardSteps = [
    { label: 'Identità', hint: 'Nome, livello e classi', sections: [identitySection, classesSection] },
    { label: 'Lancio', hint: 'Tempi e proprietà', sections: [castingSection, traitsSection] },
    { label: 'Effetti', hint: 'Danni e progressione', sections: [damageSection] },
    { label: 'Descrizione', hint: 'Dettagli dell’incantesimo', sections: [descriptionSection] }
  ].map((step, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'item-editor-wizard__step-button';
    button.dataset.spellEditorStep = String(index);
    button.innerHTML = `<span>${index + 1}</span><strong>${step.label}</strong><small>${step.hint}</small>`;
    const panel = document.createElement('div');
    panel.className = 'item-editor-wizard__panel spell-editor-wizard__panel';
    panel.dataset.spellEditorPanel = String(index);
    panel.setAttribute('role', 'group');
    panel.setAttribute('aria-label', `Passaggio ${index + 1}: ${step.label}`);
    step.sections.forEach((section) => panel.appendChild(section));
    wizardNav.appendChild(button);
    wizardBody.appendChild(panel);
    return { ...step, button, panel };
  });
  const wizardActions = document.createElement('div');
  wizardActions.className = 'item-editor-wizard__actions item-editor-wizard__actions--footer character-edit-stepper-actions character-edit-stepper-actions--footer';
  wizardActions.innerHTML = `
    <button type="button" class="ghost-button" data-spell-editor-back>Indietro</button>
    <span data-spell-editor-progress aria-live="polite"></span>
    <button type="button" class="primary" data-spell-editor-next>Continua</button>
  `;
  wizard.append(wizardNav, wizardBody, wizardActions);
  form.replaceChildren(wizard);
  const wizardBack = wizardActions.querySelector('[data-spell-editor-back]');
  const wizardNext = wizardActions.querySelector('[data-spell-editor-next]');
  const wizardProgress = wizardActions.querySelector('[data-spell-editor-progress]');
  let activeWizardStep = 0;
  let wizardSubmitButton = null;

  const validateWizardStep = (index) => {
    const invalid = wizardSteps[index]?.panel.querySelector('input:invalid, select:invalid, textarea:invalid');
    if (!invalid) return true;
    invalid.reportValidity?.();
    invalid.focus?.();
    return false;
  };
  const showWizardStep = (nextIndex, { validateForward = false } = {}) => {
    const boundedIndex = Math.max(0, Math.min(wizardSteps.length - 1, nextIndex));
    if (validateForward && boundedIndex > activeWizardStep && !validateWizardStep(activeWizardStep)) return;
    activeWizardStep = boundedIndex;
    wizardSteps.forEach((step, index) => {
      const active = index === activeWizardStep;
      step.panel.hidden = !active;
      step.button.classList.toggle('is-active', active);
      step.button.classList.toggle('is-complete', index < activeWizardStep);
      step.button.setAttribute('aria-current', active ? 'step' : 'false');
    });
    wizardBack.disabled = activeWizardStep === 0;
    wizardNext.disabled = activeWizardStep === wizardSteps.length - 1;
    if (wizardSubmitButton) {
      wizardSubmitButton.hidden = false;
      wizardSubmitButton.disabled = !spell && activeWizardStep !== wizardSteps.length - 1;
    }
    wizardProgress.textContent = `Passaggio ${activeWizardStep + 1} di ${wizardSteps.length}`;
    wizardSteps[activeWizardStep].panel.scrollIntoView?.({ block: 'start', behavior: 'smooth' });
  };
  wizardBack.addEventListener('click', () => showWizardStep(activeWizardStep - 1));
  wizardNext.addEventListener('click', () => showWizardStep(activeWizardStep + 1, { validateForward: true }));
  wizardSteps.forEach((step, index) => step.button.addEventListener('click', () => {
    showWizardStep(index, { validateForward: index > activeWizardStep });
  }));
  return present({
    title: spell ? `Modifica incantesimo: ${spell.name || 'Senza nome'}` : 'Nuovo incantesimo',
    submitLabel: 'Salva',
    content: form,
    cardClass: ['modal-card--form', 'modal-card--spell-editor'],
    onOpen: ({ modal, formEl }) => {
      modal?.classList.add('spell-editor-modal-active');
      wizardSubmitButton = modal?.querySelector('[data-form-submit]') || formEl?.querySelector('button[type="submit"]');
      const modalActions = modal?.querySelector('.modal-footer .modal-actions');
      const centeredActions = document.createElement('div');
      centeredActions.className = 'modal-actions__center spell-editor-wizard__footer-center';
      if (modalActions) {
        centeredActions.appendChild(wizardActions);
        modalActions.classList.add('modal-actions--with-center');
        modalActions.insertBefore(centeredActions, modalActions.querySelector('.modal-actions__right'));
      }
      const guardIntermediateSubmit = (event) => {
        if (spell || activeWizardStep === wizardSteps.length - 1) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        showWizardStep(activeWizardStep + 1, { validateForward: true });
      };
      formEl?.addEventListener('submit', guardIntermediateSubmit, true);
      showWizardStep(0);
      nameInput?.focus();
      return () => {
        formEl?.removeEventListener('submit', guardIntermediateSubmit, true);
        if (wizardSubmitButton) {
          wizardSubmitButton.hidden = false;
          wizardSubmitButton.disabled = false;
        }
        modal?.classList.remove('spell-editor-modal-active');
        centeredActions.remove();
        modalActions?.classList.remove('modal-actions--with-center');
        wizard.appendChild(wizardActions);
      };
    }
  }).then(async (formData) => {
    if (!formData) return;
    const name = formData.get('spell_name')?.trim();
    if (!name) {
      createToast('Inserisci un nome per l\'incantesimo', 'error');
      return;
    }
    const toNumberOrNull = (value) => (value === '' || value === null ? null : Number(value));
    const selectedKind = formData.get('spell_kind') || null;
    const rawLevel = toNumberOrNull(formData.get('spell_level')) ?? 0;
    const level = selectedKind === 'cantrip'
      ? 0
      : Math.min(9, Math.max(1, rawLevel || 1));
    const damageModifier = toNumberOrNull(formData.get('spell_damage_modifier'));
    const prepState = canPrepare
      ? normalizeSpellPreparationState(formData.get('spell_prep_state'))
      : normalizeSpellPreparationState(spell?.prep_state, 'always');
    const nextSpell = {
      id: spell?.id ?? `spell-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      shared_spell_id: spell?.shared_spell_id || null,
      name,
      level,
      kind: selectedKind || (level === 0 ? 'cantrip' : 'spell'),
      cast_time: formData.get('spell_cast_time') || null,
      duration: formData.get('spell_duration')?.trim() || null,
      range: formData.get('spell_range')?.trim() || null,
      components: formData.get('spell_components')?.trim() || null,
      material: formData.get('spell_material')?.trim() || null,
      concentration: formData.has('spell_concentration'),
      attack_roll: formData.has('spell_attack_roll'),
      saving_throw_ability: formData.get('spell_saving_throw_ability')?.toString() || null,
      attack_range_type: spell?.attack_range_type || null,
      is_ritual: formData.has('spell_is_ritual'),
      image_url: null,
      damage_die: formData.get('spell_damage_die')?.trim() || null,
      damage_modifier: damageModifier,
      damage_type: formData.get('spell_damage_type')?.toString() || null,
      upcast_damage_die: formData.get('spell_upcast_damage_die')?.trim() || null,
      upcast_damage_modifier: toNumberOrNull(formData.get('spell_upcast_damage_modifier')),
      upcast_start_level: toNumberOrNull(formData.get('spell_upcast_start_level')),
      upcast_description: spell?.upcast_description || null,
      description: formData.get('spell_description')?.trim() || null,
      source: normalizeSpellSource(formData.get('spell_source')) || null,
      source_url: spell?.source_url || null,
      source_key: spell?.source_key || null,
      school: formData.get('spell_school')?.trim() || null,
      caster_classes: formData.getAll('spell_caster_classes')
        .map((entry) => String(entry).trim().toLowerCase())
        .filter(Boolean),
      rules_version: (formData.get('spell_rules_version') || defaultRulesVersion).toString().trim(),
      prep_state: prepState
    };
    if (catalogMode) {
      await onSave?.(nextSpell, { isNew: !spell });
      return;
    }
    const currentSpells = Array.isArray(character?.data?.spells) ? character.data.spells : [];
    const nextSpells = spell
      ? currentSpells.map((entry) => (entry.id === spell.id ? nextSpell : entry))
      : [...currentSpells, nextSpell];
    const nextData = {
      ...character.data,
      spells: nextSpells
    };
    if (spell?.shared_spell_id && prepState !== spell.prep_state) {
      try {
        const updatedLinks = await updateCharacterSpellAssignment(character.id, spell.shared_spell_id, {
          prep_state: prepState === 'always' ? 'always_prepared' : prepState
        });
        if (!updatedLinks.length) {
          await assignSharedSpellToCharacter({
            user_id: character.user_id || getState().user?.id,
            character_id: character.id,
            shared_spell_id: spell.shared_spell_id,
            prep_state: prepState === 'always' ? 'always_prepared' : prepState
          });
        }
      } catch (error) {
        console.error('Stato preparazione non sincronizzato', error);
        createToast('Non riesco ad aggiornare lo stato dell’incantesimo', 'error');
        return;
      }
    }
    const message = spell ? 'Incantesimo aggiornato' : 'Incantesimo aggiunto';
    await saveCharacterData(character, nextData, message, () => onSave?.(nextSpell, { isNew: !spell }));
  });
}

export async function openSpellSourceModal({ present = openFormModal } = {}) {
  const content = document.createElement('div');
  content.className = 'spell-source-picker';
  content.innerHTML = `
    <div class="spell-source-picker__intro">
      <span class="spell-source-picker__intro-icon" aria-hidden="true">✦</span>
      <div>
        <strong>Come vuoi aggiungere l'incantesimo?</strong>
        <p>Scegli dalla raccolta condivisa per fare prima, oppure crea una scheda personalizzata.</p>
      </div>
    </div>
    <div class="spell-source-picker__options" role="radiogroup" aria-label="Modalità di aggiunta incantesimo">
      <label class="spell-source-picker__option">
        <input type="radio" name="spell_source_mode" value="shared" checked />
        <span class="spell-source-picker__option-card">
          <span class="spell-source-picker__option-icon" aria-hidden="true">⌕</span>
          <span class="spell-source-picker__option-copy">
            <strong>Cerca nella raccolta</strong>
            <small>Trova un incantesimo già completo di livello, scuola, componenti, descrizione e regole.</small>
            <span class="spell-source-picker__recommendation">Consigliato</span>
          </span>
          <span class="spell-source-picker__radio" aria-hidden="true"></span>
        </span>
      </label>
      <label class="spell-source-picker__option">
        <input type="radio" name="spell_source_mode" value="manual" />
        <span class="spell-source-picker__option-card">
          <span class="spell-source-picker__option-icon" aria-hidden="true">＋</span>
          <span class="spell-source-picker__option-copy">
            <strong>Crea un incantesimo</strong>
            <small>Inserisci manualmente tutti i dettagli per un incantesimo homebrew o non presente nella raccolta.</small>
          </span>
          <span class="spell-source-picker__radio" aria-hidden="true"></span>
        </span>
      </label>
    </div>
  `;
  const formData = await present({
    title: 'Aggiungi incantesimo',
    submitLabel: 'Continua',
    cancelLabel: 'Annulla',
    content,
    cardClass: ['modal-card--form', 'modal-card--spell-source']
  });
  if (!formData) return null;
  return formData.get('spell_source_mode') || 'shared';
}



export function openSpellQuickDetailModal(character, spell, onRender, { present = openFormModal, onEdit, onDelete } = {}) {
  if (!spell) return;
  const level = Math.max(0, Number(spell.level) || 0);
  const upcastDescription = spell.upcast_description?.trim() || '';
  const rawDescription = spell.description?.trim() || '';
  const description = upcastDescription && rawDescription.endsWith(upcastDescription)
    ? rawDescription.slice(0, -upcastDescription.length).trim()
    : rawDescription;
  const effectDescription = description || 'Nessuna descrizione disponibile.';
  const isCastable = Boolean(character) && level > 0;
  const hasDisplayImage = hasUsableDetailImage(spell.image_url);
  const imageUrl = spell.image_url?.trim() || '';
  const levelLabel = level === 0 ? 'Trucchetto' : `${level}° livello`;
  const schoolLabel = normalizeSpellSchool(spell.school) || 'Scuola non indicata';
  const material = spell.material?.trim() || '';
  const isRitual = Boolean(spell.is_ritual ?? spell.ritual);
  const sourceLabel = spell.source?.trim() || '';
  const sourceUrl = sanitizeExternalUrl(spell.source_url || spell.linkSource || spell.detailUrl);
  const damageNotation = spell.damage_die
    ? `${spell.damage_die}${Number(spell.damage_modifier) ? ` ${Number(spell.damage_modifier) > 0 ? '+' : ''}${Number(spell.damage_modifier)}` : ''}`
    : '';
  const casterClasses = Array.isArray(spell.caster_classes) ? spell.caster_classes.filter(Boolean) : [];

  const content = document.createElement('div');
  content.className = 'spell-quick-detail';
  content.innerHTML = `
    <article class="spell-manual ${hasDisplayImage ? 'spell-manual--illustrated' : ''}">
      <header class="spell-manual__hero">
        ${hasDisplayImage ? `<img class="spell-manual__image" src="${escapeHtml(imageUrl)}" alt="Immagine di ${escapeHtml(spell.name || 'incantesimo')}" />` : '<span class="spell-manual__crest" aria-hidden="true">✦</span>'}
        <div class="spell-manual__heading">
          <span class="spell-manual__kicker">${escapeHtml(levelLabel)} · ${escapeHtml(schoolLabel)}</span>
          <h3>${escapeHtml(spell.name || 'Incantesimo')}</h3>
          ${(spell.concentration || isRitual) ? `<div class="spell-manual__traits">
            ${spell.concentration ? '<span>Concentrazione</span>' : ''}
            ${isRitual ? '<span>Rituale</span>' : ''}
          </div>` : ''}
        </div>
      </header>
      <dl class="spell-manual__facts" aria-label="Regole di lancio">
        <div><dt>Tempo di lancio</dt><dd>${escapeHtml(spell.cast_time?.trim() || '—')}</dd></div>
        <div><dt>Gittata</dt><dd>${escapeHtml(spell.range?.trim() || '—')}</dd></div>
        <div><dt>Componenti</dt><dd>${escapeHtml(spell.components?.trim() || '—')}</dd></div>
        <div><dt>Durata</dt><dd>${escapeHtml(spell.duration?.trim() || '—')}</dd></div>
      </dl>
      ${material ? `
        <aside class="spell-manual__material" aria-label="Componente materiale">
          <span class="spell-manual__material-mark" aria-hidden="true">M</span>
          <div><small>Componente materiale</small><p>${escapeHtml(material)}</p></div>
        </aside>
      ` : ''}
      ${damageNotation ? `
        <section class="spell-manual__damage" aria-label="Danni dell'incantesimo">
          <span class="spell-manual__damage-icon" aria-hidden="true">◆</span>
          <div><small>Danni</small><strong>${escapeHtml(damageNotation)}</strong></div>
          ${spell.upcast_damage_die && !upcastDescription ? `<p><strong>Slot superiori:</strong> +${escapeHtml(spell.upcast_damage_die)}${spell.upcast_start_level ? ` dal ${escapeHtml(spell.upcast_start_level)}° livello` : ''}.</p>` : ''}
        </section>
      ` : ''}
      <section class="spell-manual__body">
        <h4>Effetto</h4>
        <div class="detail-rich-text spell-manual__description">${renderDetailText(effectDescription)}</div>
      </section>
      ${upcastDescription ? `
        <section class="spell-manual__upcast">
          <span class="spell-manual__upcast-mark" aria-hidden="true">↑</span>
          <div>
            <h4>${level === 0 ? 'Potenziamento del trucchetto' : 'Ai livelli superiori'}</h4>
            <div class="detail-rich-text">${renderDetailText(upcastDescription)}</div>
          </div>
        </section>
      ` : ''}
      <footer class="spell-manual__reference">
        <span class="spell-manual__classes">${casterClasses.length ? `Classi: ${escapeHtml(casterClasses.join(', '))}` : 'Classi non specificate'}</span>
        <span class="spell-manual__reference-meta">
          ${spell.rules_version ? `<span>Regole ${escapeHtml(spell.rules_version)}</span>` : ''}
          ${sourceLabel ? `<span>${escapeHtml(sourceLabel)}</span>` : ''}
          ${sourceUrl ? `<a href="${sourceUrl}" target="_blank" rel="noopener noreferrer">Apri fonte ↗</a>` : ''}
        </span>
      </footer>
    </article>
  `;

  present({
    title: 'Scheda incantesimo',
    submitLabel: isCastable ? 'Lancia' : 'Chiudi',
    cancelLabel: isCastable ? 'Chiudi' : null,
    content,
    cardClass: ['spell-quick-detail-modal'],
    showFooter: isCastable,
    onOpen: ({ modal, formEl }) => attachDetailManagementActions(modal, formEl, { onEdit, onDelete })
  }).then(async (formData) => {
    if (!formData) return;
    const detailAction = formData.get('detail_action');
    if (detailAction === 'edit' && onEdit) {
      onEdit();
      return;
    }
    if (detailAction === 'delete' && onDelete) {
      await onDelete();
      return;
    }
    if (!isCastable) return;
    const selectedLevel = await chooseCastSlotLevel(character, spell);
    if (!selectedLevel) return;
    const consumed = await consumeSpellSlot(character, selectedLevel, onRender);
    if (!consumed) return;
    openSpellDamageOverlay(character, spell, selectedLevel);
  });
}

function hasUsableDetailImage(imageUrl) {
  const value = String(imageUrl || '').trim();
  if (!value) return false;
  const normalized = value.toLowerCase();
  return !normalized.endsWith('/icons/icon.svg') && !normalized.endsWith('icons/icon.svg');
}

function renderDetailText(text) {
  const escaped = escapeHtml(String(text || ''));
  const lines = escaped.split('\n');
  const rendered = lines.map((line) => {
    let html = line;
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/_([^_]+)_/g, '<em>$1</em>');
    if (html.startsWith('# ')) return `<h4>${html.slice(2)}</h4>`;
    if (html.startsWith('- ')) return `<li>${html.slice(2)}</li>`;
    if (html.startsWith('&gt; ')) return `<blockquote>${html.slice(5)}</blockquote>`;
    return `<p>${html || '<br />'}</p>`;
  });

  let inList = false;
  return rendered.map((chunk) => {
    if (chunk.startsWith('<li>')) {
      if (!inList) {
        inList = true;
        return `<ul>${chunk}`;
      }
      return chunk;
    }
    if (inList) {
      inList = false;
      return `</ul>${chunk}`;
    }
    return chunk;
  }).join('') + (inList ? '</ul>' : '');
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function openPreparedSpellsModal(character, onSave) {
  return openPreparedSpellsModalAsync(character, onSave);
}

async function openPreparedSpellsModalAsync(character, onSave) {
  if (!character) return;
  const data = character.data || {};
  const spellcasting = data.spellcasting || {};
  if (!data.is_spellcaster && !spellcasting.can_prepare) return;
  if (!spellcasting.can_prepare) {
    createToast('Questo personaggio non usa la preparazione degli incantesimi', 'info');
    return;
  }
  const characterSpells = dedupeCharacterSpells(Array.isArray(data.spells) ? data.spells : []);
  const casterClasses = inferCharacterCasterClasses(character);
  const maximumSpellLevel = getCharacterMaxSpellLevel(character);
  const rulesVersion = getCharacterRulesVersion(character);
  if (!casterClasses.length) {
    createToast('Configura almeno una lista di classe nella scheda del personaggio', 'info');
    return;
  }
  if (maximumSpellLevel < 1) {
    createToast('Configura gli slot incantesimo prima di preparare il grimorio', 'info');
    return;
  }
  const content = document.createElement('div');
  content.className = 'prepared-spells-modal';
  let modalActive = true;
  let loadingHost = null;
  let submitButton = null;
  let stopPreparationLoading = null;
  const preparationView = openFormModal({
    title: character.name ? `Prepara gli incantesimi di ${character.name}` : 'Prepara gli incantesimi',
    submitLabel: 'Salva preparazione',
    cancelLabel: 'Annulla',
    content,
    cardClass: ['modal-card--form', 'modal-card--prepared-spells'],
    onOpen: ({ modal, fieldsEl }) => {
      loadingHost = fieldsEl;
      submitButton = modal?.querySelector('[data-form-submit], .sheet-view-footer button[type="submit"]');
      if (submitButton) submitButton.disabled = true;
      return () => {
        modalActive = false;
        stopPreparationLoading?.();
        stopPreparationLoading = null;
      };
    }
  });
  const nextPaint = window.requestAnimationFrame
    ? (callback) => window.requestAnimationFrame(callback)
    : (callback) => window.setTimeout(callback, 0);
  await new Promise((resolve) => nextPaint(() => nextPaint(resolve)));
  if (!modalActive) return;
  stopPreparationLoading = showShortcutLoader(loadingHost || content, 'Caricamento grimorio');
  let catalogSpells = [];

  try {
    const catalogRows = [];
    for (let level = 1; level <= maximumSpellLevel; level += 1) {
      let page = 1;
      let result;
      do {
        result = await searchSharedSpells({
          casterClasses,
          rulesVersion,
          level,
          page,
          pageSize: 50
        });
        catalogRows.push(...result.items);
        page += 1;
      } while (result.page * result.pageSize < result.total);
    }
    catalogSpells = catalogRows
      .filter((entry) => String(entry.rules_version || '2014') === rulesVersion)
      .map(mapSharedSpellForPreparation)
      .filter(Boolean);
  } catch (error) {
    stopPreparationLoading?.();
    stopPreparationLoading = null;
    content.innerHTML = '<div class="prepared-spells-modal__empty"><strong>Archivio non disponibile</strong><small>Chiudi la finestra e riprova tra qualche istante.</small></div>';
    createToast('Non riesco a caricare l’archivio centrale degli incantesimi', 'error');
    return;
  }
  if (!modalActive) return;

  const catalogSharedIds = new Set(catalogSpells.map((entry) => String(entry.shared_spell_id)));
  const associatedSharedSpells = characterSpells
    .filter((entry) => entry.shared_spell_id && (
      catalogSharedIds.has(String(entry.shared_spell_id)) || ['prepared', 'always'].includes(entry.prep_state)
    ))
    .map((entry) => ({ ...entry, preparation_origin: 'archive' }));
  const archiveSpells = dedupeCharacterSpells([
    ...associatedSharedSpells,
    ...catalogSpells.map((entry) => ({ ...entry, preparation_origin: 'archive' }))
  ]);
  const customPreparedSpells = dedupeCharacterSpells(characterSpells
    .filter((entry) => !entry.shared_spell_id && Number(entry.level) > 0 && ['prepared', 'always'].includes(entry.prep_state))
    .map((entry) => ({ ...entry, preparation_origin: 'custom' })));
  const spells = sortSpellsByLevel(dedupeCharacterSpells([...archiveSpells, ...customPreparedSpells]));
  const selectable = spells.filter((entry) => Number(entry.level) > 0 && entry.prep_state !== 'always');
  const prepareableIds = new Set(selectable.filter(() => spellcasting.can_prepare).map(entry => entry.id));

  const deletedIds = new Set();
  const preparedIds = new Set(
    selectable
      .filter((entry) => prepareableIds.has(entry.id) && entry.prep_state === 'prepared')
      .map((entry) => entry.id)
  );
  const levelOrder = Array.from(new Set(selectable.map((entry) => Math.max(0, Number(entry.level) || 0))))
    .sort((a, b) => a - b);
  let activeLevel = '';

  const getLevelLabel = (level) => `${level}° livello`;

  content.innerHTML = `
    <div class="prepared-spells-modal__workspace">
      <div class="prepared-spells-modal__sticky-filters">
      <div class="prepared-spells-modal__list-context">
        <span>Liste disponibili</span>
        <strong>${casterClasses.length ? casterClasses.map((entry) => entry.charAt(0).toUpperCase() + entry.slice(1)).join(' + ') : 'Solo incantesimi associati'}</strong>
        ${maximumSpellLevel ? `<small>Fino al ${maximumSpellLevel}° livello · Regole ${rulesVersion}</small>` : ''}
      </div>
      <aside class="prepared-spells-modal__level-rail" aria-label="Filtra per livello">
        <div class="prepared-spells-modal__rail-heading">
          <strong>Livelli</strong>
          <small>Scegli una sezione</small>
        </div>
        <div class="prepared-spells-modal__levels" role="tablist" aria-label="Livelli incantesimo">
          ${levelOrder.map((level) => {
    return `
              <button class="prepared-spells-modal__level" type="button" data-prepared-level="${level}" aria-pressed="false">
                <span><strong>${getLevelLabel(level)}</strong></span>
              </button>
            `;
  }).join('')}
        </div>
      </aside>
      <output class="prepared-spells-modal__visible-count" data-prepared-visible-count aria-live="polite">
        <span><strong data-prepared-visible-total>0</strong><small data-prepared-visible-label>visibili</small></span>
        <span class="is-prepared"><strong data-prepared-current-total>0</strong><small data-prepared-current-label>preparati</small></span>
        <span><strong data-prepared-pending-total>0</strong><small>da preparare</small></span>
      </output>
      </div>
      <section class="prepared-spells-modal__catalog" aria-label="Incantesimi preparabili">
        <div class="prepared-spells-modal__list" data-prepared-list>
          ${selectable.map((entry) => {
    const level = Math.max(0, Number(entry.level) || 0);
    const isPrepared = preparedIds.has(entry.id);
    const isLocked = !prepareableIds.has(entry.id);
    return `
              <article
                class="prepared-spells-modal__spell play-card play-card--spell ${isPrepared ? 'is-prepared' : ''}"
                data-prepared-item="${entry.id}"
                data-prepared-item-level="${level}"
                ${isLocked ? 'data-preparation-locked' : ''}
              >
                <button class="play-card__surface prepared-spells-modal__detail-surface" type="button" data-prepared-quick-detail="${entry.id}" aria-label="Apri la scheda di ${escapeHtml(entry.name)}">
                  <header class="play-card__header prepared-spells-modal__spell-heading">
                    <span class="play-card__eyebrow">${getLevelLabel(level)}${entry.concentration ? ' · Concentrazione' : ''}${entry.is_ritual ? ' · Rituale' : ''}</span>
                    <h3 class="play-card__title prepared-spells-modal__toggle-name">${escapeHtml(entry.name)}</h3>
                    <span class="prepared-spells-modal__origin prepared-spells-modal__origin--${entry.preparation_origin === 'custom' ? 'custom' : 'archive'}">${entry.preparation_origin === 'custom' ? 'Personalizzato' : 'Archivio'}</span>
                  </header>
                  <span class="prepared-spells-modal__open-arrow" aria-hidden="true">›</span>
                </button>
                <footer class="play-card__footer prepared-spells-modal__card-actions">
                  <button class="play-card__button play-card__button--primary prepared-spells-modal__toggle ${isPrepared ? 'is-active' : ''}" type="button" data-prepared-toggle="${entry.id}" ${isLocked ? 'disabled' : ''} aria-pressed="${isPrepared}">
                    <span class="prepared-spells-modal__check" aria-hidden="true">✓</span>
                    <span>${isPrepared ? 'Preparato' : 'Da preparare'}</span>
                  </button>
                  ${entry.catalog_only ? '' : `<button class="play-card__button resource-icon-button prepared-spells-modal__delete" type="button" data-prepared-delete="${entry.id}" aria-label="Elimina ${escapeHtml(entry.name)} dalla scheda" title="Elimina dalla scheda">
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v5m4-5v5"></path></svg>
                  </button>`}
                </footer>
              </article>
            `;
  }).join('')}
          <div class="prepared-spells-modal__empty" data-prepared-empty hidden>
            <span aria-hidden="true">✦</span>
            <strong>Nessun incantesimo per questo livello</strong>
            <small>Scegli un altro livello del grimorio.</small>
          </div>
        </div>
      </section>
    </div>
  `;

  const syncPreparedState = () => {
    content.querySelectorAll('[data-prepared-toggle]').forEach((button) => {
      const spellId = button.dataset.preparedToggle;
      if (!spellId) return;
      const isPrepared = preparedIds.has(spellId);
      button.classList.toggle('is-active', isPrepared);
      button.setAttribute('aria-pressed', String(isPrepared));
      const item = button.closest('[data-prepared-item]');
      item?.classList.toggle('is-prepared', isPrepared);
      const spellName = item?.querySelector('.prepared-spells-modal__toggle-name')?.textContent || 'incantesimo';
      if (!button.disabled) {
        button.setAttribute('aria-label', `${isPrepared ? 'Rimuovi dalla preparazione' : 'Prepara'} ${spellName}`);
        const label = button.querySelector('span:last-child');
        if (label) label.textContent = isPrepared ? 'Preparato' : 'Da preparare';
      }
    });
  };

  const applyFilters = () => {
    let visibleCount = 0;
    content.querySelectorAll('[data-prepared-item]').forEach((item) => {
      const spellId = item.dataset.preparedItem;
      const matchesLevel = !activeLevel || item.dataset.preparedItemLevel === activeLevel;
      const isVisible = !deletedIds.has(spellId) && matchesLevel;
      item.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });
    const emptyState = content.querySelector('[data-prepared-empty]');
    if (emptyState) emptyState.hidden = visibleCount > 0;
    const currentSpellIds = selectable
      .map((entry) => entry.id)
      .filter((spellId) => !deletedIds.has(spellId));
    const preparedCount = currentSpellIds.filter((spellId) => preparedIds.has(spellId)).length;
    const pendingCount = Math.max(0, currentSpellIds.length - preparedCount);
    const visibleTotal = content.querySelector('[data-prepared-visible-total]');
    const preparedTotal = content.querySelector('[data-prepared-current-total]');
    const pendingTotal = content.querySelector('[data-prepared-pending-total]');
    const visibleCounter = content.querySelector('[data-prepared-visible-count]');
    if (visibleTotal) visibleTotal.textContent = String(visibleCount);
    if (preparedTotal) preparedTotal.textContent = String(preparedCount);
    if (pendingTotal) pendingTotal.textContent = String(pendingCount);
    const visibleLabel = content.querySelector('[data-prepared-visible-label]');
    const preparedLabel = content.querySelector('[data-prepared-current-label]');
    if (visibleLabel) visibleLabel.textContent = visibleCount === 1 ? 'visibile' : 'visibili';
    if (preparedLabel) preparedLabel.textContent = preparedCount === 1 ? 'preparato' : 'preparati';
    visibleCounter?.setAttribute(
      'aria-label',
      `${visibleCount} ${visibleCount === 1 ? 'incantesimo visibile' : 'incantesimi visibili'}, ${preparedCount} ${preparedCount === 1 ? 'preparato' : 'preparati'}, ${pendingCount} da preparare`
    );
  };

  const markSpellForDeletion = async (spell) => {
    if (!spell) return;
    const spellId = spell.id;
    const shouldDelete = await openConfirmModal({
      title: 'Elimina incantesimo',
      message: `Vuoi rimuovere "${spell.name}" dalla scheda? L'eliminazione sarà applicata quando salverai la preparazione.`,
      confirmLabel: 'Elimina dalla scheda'
    });
    if (!shouldDelete) return;
    deletedIds.add(spellId);
    preparedIds.delete(spellId);
    syncPreparedState();
    applyFilters();
  };

  content.querySelectorAll('[data-prepared-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const spellId = button.dataset.preparedToggle;
      if (!spellId) return;
      if (preparedIds.has(spellId)) preparedIds.delete(spellId);
      else preparedIds.add(spellId);
      syncPreparedState();
      applyFilters();
    });
  });

  content.querySelectorAll('[data-prepared-delete]').forEach((button) => {
    button.addEventListener('click', async () => {
      const spellId = button.dataset.preparedDelete;
      const spell = selectable.find((entry) => entry.id === spellId);
      await markSpellForDeletion(spell);
    });
  });

  content.querySelectorAll('[data-prepared-quick-detail]').forEach((button) => {
    button.addEventListener('click', () => {
      const spellId = button.dataset.preparedQuickDetail;
      if (!spellId) return;
      const spell = selectable.find((entry) => entry.id === spellId);
      if (spell) openSpellQuickDetailModal(null, spell, null, spell.catalog_only ? {} : {
        onEdit: () => openSpellDrawer(character, (updatedSpell) => {
          if (!updatedSpell) return;
          Object.assign(spell, updatedSpell);
          const item = content.querySelector(`[data-prepared-item="${spell.id}"]`);
          const name = item?.querySelector('.prepared-spells-modal__toggle-name');
          if (name) name.textContent = spell.name;
        }, spell),
        onDelete: () => markSpellForDeletion(spell)
      });
    });
  });

  content.querySelectorAll('[data-prepared-level]').forEach((button) => {
    button.addEventListener('click', () => {
      const selectedLevel = button.dataset.preparedLevel || '';
      activeLevel = activeLevel === selectedLevel ? '' : selectedLevel;
      content.querySelectorAll('[data-prepared-level]').forEach((entry) => {
        const isActive = entry.dataset.preparedLevel === activeLevel;
        entry.classList.toggle('is-active', isActive);
        entry.setAttribute('aria-pressed', String(isActive));
      });
      applyFilters();
    });
  });

  syncPreparedState();
  applyFilters();
  stopPreparationLoading?.();
  stopPreparationLoading = null;
  if (submitButton) submitButton.disabled = false;
  void preparationView.then(async (formData) => {
    if (!formData) return;
    let linkedRows = [];
    let associationReadError = null;
    try {
      linkedRows = await fetchCharacterSpells(character.id);
    } catch (error) {
      associationReadError = error;
      console.error('Associazioni incantesimo legacy non leggibili', error);
    }
    const retainedSpells = spells
      .filter((entry) => !deletedIds.has(entry.id))
      .filter((entry) => entry.shared_spell_id && (
        entry.prep_state === 'always' || preparedIds.has(entry.id)
      ));
    const retainedSharedIds = new Set(retainedSpells.map((entry) => String(entry.shared_spell_id)));
    const seenLinkedIds = new Set();
    const linksToRemove = linkedRows.filter((row) => {
      if (!row.shared_spell_id) return false;
      const sharedId = String(row.shared_spell_id);
      const duplicate = seenLinkedIds.has(sharedId);
      seenLinkedIds.add(sharedId);
      return duplicate || !retainedSharedIds.has(sharedId);
    });
    const existingSharedIds = new Set(linkedRows
      .filter((row) => row.shared_spell_id)
      .map((row) => String(row.shared_spell_id)));
    const associationUserId = character.user_id || getState().user?.id;
    const associationOperations = [
      ...linksToRemove.map((row) => removeCharacterSpell(row.id)),
      ...retainedSpells
        .filter((entry) => existingSharedIds.has(String(entry.shared_spell_id)))
        .map((entry) => updateCharacterSpellAssignment(character.id, entry.shared_spell_id, {
          prep_state: entry.prep_state === 'always' ? 'always_prepared' : 'prepared'
        })),
      ...retainedSpells
        .filter((entry) => associationUserId && !existingSharedIds.has(String(entry.shared_spell_id)))
        .map((entry) => assignSharedSpellToCharacter({
          user_id: associationUserId,
          character_id: character.id,
          shared_spell_id: entry.shared_spell_id,
          prep_state: entry.prep_state === 'always' ? 'always_prepared' : 'prepared'
        }))
    ];
    const associationResults = await Promise.allSettled(associationOperations);
    const associationFailures = associationResults.filter((result) => result.status === 'rejected');
    associationFailures.forEach((result) => console.error('Associazione incantesimo legacy non sincronizzata', result.reason));
    const hasAssociationWarnings = Boolean(associationReadError) || associationFailures.length > 0;

    const visibleCustomIds = new Set(customPreparedSpells.map((entry) => String(entry.id)));
    const nextCustomSpells = characterSpells
      .filter((entry) => !entry.shared_spell_id)
      .filter((entry) => !deletedIds.has(entry.id))
      .filter((entry) => !visibleCustomIds.has(String(entry.id)) || entry.prep_state === 'always' || preparedIds.has(entry.id))
      .map((entry) => ({ ...entry, prep_state: normalizeSpellPreparationState(entry.prep_state) }));
    const preservedCantrips = characterSpells.filter((entry) => entry.shared_spell_id && Number(entry.level) === 0);
    const nextSpells = dedupeCharacterSpells([...preservedCantrips, ...nextCustomSpells, ...retainedSpells
      .map((entry) => {
        const cleanEntry = { ...entry };
        delete cleanEntry.catalog_only;
        delete cleanEntry.preparation_origin;
        if (entry.prep_state === 'always') return cleanEntry;
        return {
          ...cleanEntry,
          prep_state: 'prepared'
        };
      })]);
    const nextData = {
      ...character.data,
      spells: nextSpells,
      spell_preparation_synced: true
    };
    const message = hasAssociationWarnings
      ? 'Preparazione salvata; alcune associazioni legacy saranno ignorate'
      : 'Preparazione sincronizzata con il personaggio';
    await saveCharacterData(character, nextData, message, onSave);
  });
}

function readAvatarFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(String(reader.result || '')));
    reader.addEventListener('error', () => reject(new Error('Impossibile leggere il file selezionato.')));
    reader.readAsDataURL(file);
  });
}

function loadAvatarImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', () => reject(new Error('Il file selezionato non è un’immagine valida.')));
    image.src = source;
  });
}

async function prepareAvatarImage(file) {
  if (!/^image\/(?:png|jpe?g|gif|webp)$/i.test(file?.type || '')) {
    throw new Error('Scegli un’immagine PNG, JPG, GIF o WebP.');
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('L’immagine non può superare 10 MB.');
  }
  const source = await readAvatarFile(file);
  const image = await loadAvatarImage(source);
  const longestSide = Math.max(image.naturalWidth, image.naturalHeight, 1);
  const scale = Math.min(1, 900 / longestSide);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Impossibile elaborare l’immagine su questo dispositivo.');
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/webp', 0.82);
}

async function openAvatarUploadModal(subject, onSave) {
  const currentAvatarValue = String(subject?.data?.avatar_url || '').trim();
  const currentAvatar = sanitizeImageUrl(currentAvatarValue) ? currentAvatarValue : '';
  let selectedAvatar = currentAvatar || null;
  const content = document.createElement('div');
  content.className = 'avatar-upload';
  const preview = document.createElement('div');
  preview.className = 'avatar-upload__preview';
  const renderPreview = () => {
    preview.innerHTML = '';
    if (selectedAvatar) {
      const image = document.createElement('img');
      image.src = selectedAvatar;
      image.alt = `Anteprima ritratto di ${subject?.name || 'personaggio'}`;
      preview.appendChild(image);
      return;
    }
    const empty = document.createElement('span');
    empty.className = 'avatar-upload__empty';
    empty.innerHTML = '<strong>+</strong><small>Nessun ritratto</small>';
    preview.appendChild(empty);
  };
  renderPreview();
  const controls = document.createElement('div');
  controls.className = 'avatar-upload__controls';
  controls.innerHTML = `
    <label class="avatar-upload__picker">
      <span>Scegli un’immagine dal dispositivo</span>
      <input type="file" name="avatar_image" accept="image/png,image/jpeg,image/gif,image/webp" />
      <small>PNG, JPG, GIF o WebP · massimo 10 MB. L’immagine viene ottimizzata prima del salvataggio.</small>
    </label>
    <button class="secondary avatar-upload__remove" type="button" data-remove-avatar ${currentAvatar ? '' : 'hidden'}>Rimuovi immagine</button>
  `;
  content.append(preview, controls);
  let processing = false;
  const formData = await openFormModal({
    title: 'Immagine del personaggio',
    content,
    submitLabel: 'Salva immagine',
    cardClass: 'modal-card--avatar-upload',
    onOpen: ({ modal }) => {
      const input = content.querySelector('input[type="file"]');
      const removeButton = content.querySelector('[data-remove-avatar]');
      const submitButton = modal.querySelector('[data-form-submit]');
      const handleSelection = async () => {
        const file = input.files?.[0];
        if (!file) return;
        processing = true;
        if (submitButton) submitButton.disabled = true;
        try {
          selectedAvatar = await prepareAvatarImage(file);
          removeButton.hidden = false;
          renderPreview();
        } catch (error) {
          input.value = '';
          createToast(error.message || 'Impossibile elaborare l’immagine', 'error');
        } finally {
          processing = false;
          if (submitButton) submitButton.disabled = false;
        }
      };
      const handleRemove = () => {
        selectedAvatar = null;
        input.value = '';
        removeButton.hidden = true;
        renderPreview();
      };
      input.addEventListener('change', handleSelection);
      removeButton.addEventListener('click', handleRemove);
      return () => {
        input.removeEventListener('change', handleSelection);
        removeButton.removeEventListener('click', handleRemove);
      };
    }
  });
  if (!formData || processing) return;
  await saveCharacterData(subject, {
    ...(subject.data || {}),
    avatar_url: selectedAvatar
  }, selectedAvatar ? 'Immagine del personaggio aggiornata' : 'Immagine del personaggio rimossa', onSave);
}

export function openAvatarModal(subject, onSave = null) {
  if (typeof onSave === 'function' && subject?.data) {
    return openAvatarUploadModal(subject, onSave);
  }
  const avatarUrl = subject?.data?.avatar_url || subject?.stat_block?.image_url;
  if (!avatarUrl) return;
  const subjectName = subject?.name || 'soggetto';
  const existing = document.querySelector('.avatar-preview');
  if (existing) existing.remove();
  const overlay = document.createElement('div');
  overlay.className = 'avatar-preview';
  overlay.tabIndex = 0;
  overlay.innerHTML = `
    <img class="avatar-preview__image" src="${avatarUrl}" alt="Foto di ${subjectName}" />
  `;
  const close = () => {
    overlay.remove();
  };
  overlay.addEventListener('click', close);
  overlay.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });
  document.body.appendChild(overlay);
  overlay.focus();
}

export function openResourceDrawer(character, onSave, resource = null, { parentResourceId = null, present = openFormModal } = {}) {
  if (!character) return;
  const enhanceNumericField = (field, labels = {}) => {
    const input = field?.querySelector('input[type="number"]');
    if (!input) return;
    attachNumberStepper(input, labels);
  };
  const form = document.createElement('div');
  form.className = 'drawer-form modal-form-grid';
  const buildRow = (elements, variant = 'balanced') => {
    const row = document.createElement('div');
    row.className = `modal-form-row modal-form-row--${variant}`;
    elements.filter(Boolean).forEach((element) => row.appendChild(element));
    return row;
  };
  const buildSection = ({ title, description, content, variant = '' }) => {
    const section = document.createElement('section');
    section.className = ['ability-modal-section', variant].filter(Boolean).join(' ');
    const header = document.createElement('div');
    header.className = 'ability-modal-section__header';
    header.innerHTML = `
      <h4>${title}</h4>
      ${description ? `<p class="muted">${description}</p>` : ''}
    `;
    section.appendChild(header);
    content.filter(Boolean).forEach((element) => section.appendChild(element));
    return section;
  };
  const nameField = buildInput({ label: 'Nome abilità', name: 'name', placeholder: 'Es. Azione Impetuosa', value: resource?.name ?? '' });
  const nameInput = nameField.querySelector('input');
  if (nameInput) {
    nameInput.required = true;
    nameInput.title = 'Inserisci il nome dell’abilità.';
    nameInput.addEventListener('input', () => nameInput.setCustomValidity(''));
    nameInput.addEventListener('invalid', () => {
      if (nameInput.validity.valueMissing) nameInput.setCustomValidity('Inserisci il nome dell’abilità.');
    });
  }
  const imageField = buildInput({
    label: 'Foto (URL)',
    name: 'image_url',
    placeholder: 'https://.../risorsa.png',
    value: resource?.image_url ?? ''
  });
  const castTimeField = document.createElement('label');
  castTimeField.className = 'field';
  castTimeField.innerHTML = '<span>Tipo di lancio</span>';
  const castTimeSelect = buildSelect([
    { value: 'Sempre attiva', label: 'Sempre attiva' },
    { value: 'Azione', label: 'Azione' },
    { value: 'Reazione', label: 'Reazione' },
    { value: 'Azione Bonus', label: 'Azione Bonus' },
    { value: 'Azione Gratuita', label: 'Azione Gratuita' },
    { value: 'Durata', label: 'Durata' }
  ], resource?.cast_time ?? 'Azione');
  castTimeSelect.name = 'cast_time';
  castTimeField.appendChild(castTimeSelect);

  const selectedParentId = resource?.parent_resource_id ?? parentResourceId ?? '';
  const availableParents = (getState().cache?.resources || [])
    .filter((entry) => !entry.parent_resource_id
      && (entry.can_have_children || String(entry.id) === String(selectedParentId))
      && entry.resource_type !== 'passive'
      && entry.reset_on !== null
      && entry.reset_on !== 'none'
      && String(entry.id) !== String(resource?.id));
  const parentField = document.createElement('label');
  parentField.className = 'field ability-parent-field';
  parentField.innerHTML = '<span>Abilità padre (opzionale)</span>';
  const parentSelect = buildSelect([
    { value: '', label: 'Nessuna — abilità principale' },
    ...availableParents.map((entry) => ({ value: entry.id, label: entry.name }))
  ], selectedParentId);
  parentSelect.name = 'parent_resource_id';
  parentField.appendChild(parentSelect);

  const canHaveChildrenField = document.createElement('label');
  canHaveChildrenField.className = 'ability-parent-choice';
  canHaveChildrenField.innerHTML = `
    <input type="checkbox" name="can_have_children" value="1" ${resource?.can_have_children && !resource?.parent_resource_id ? 'checked' : ''} aria-label="Può avere sotto-abilità" />
    <span class="ability-parent-choice__card">
      <i aria-hidden="true">◇</i>
      <span class="ability-parent-choice__copy">
        <strong>Abilità con opzioni</strong>
        <small>Abilita questa risorsa come padre di opzioni selezionabili.</small>
      </span>
      <b aria-hidden="true">✓</b>
    </span>
  `;
  const canHaveChildrenInput = canHaveChildrenField.querySelector('input[name="can_have_children"]');

  const identitySectionRows = [
    buildRow([nameField, castTimeField, imageField], 'balanced'),
    buildRow([canHaveChildrenField, parentField], 'balanced')
  ];

  const resourceTypeField = document.createElement('label');
  resourceTypeField.className = 'field';
  resourceTypeField.innerHTML = '<span>Gestione utilizzi</span>';
  const inferredResourceType = resource?.resource_type
    || ((Number(resource?.max_uses) === 0 || resource?.reset_on === null || resource?.reset_on === 'none') ? 'passive' : 'charges');
  const resourceTypeSelect = buildSelect([
    { value: 'charges', label: 'Cariche' },
    { value: 'pool', label: 'Pool consumabile' },
    { value: 'passive', label: 'Passiva' }
  ], inferredResourceType);
  resourceTypeSelect.name = 'resource_type';
  resourceTypeField.appendChild(resourceTypeSelect);

  const maxUsesField = buildInput({ label: 'Valore massimo', name: 'max_uses', type: 'number', value: resource?.max_uses ?? 1 });
  enhanceNumericField(maxUsesField, { decrementLabel: 'Riduci cariche massime', incrementLabel: 'Aumenta cariche massime' });
  const usedField = buildInput({ label: 'Valore consumato', name: 'used', type: 'number', value: resource?.used ?? 0 });
  enhanceNumericField(usedField, { decrementLabel: 'Riduci cariche consumate', incrementLabel: 'Aumenta cariche consumate' });

  const chargeSectionRows = [buildRow([resourceTypeField, maxUsesField, usedField], 'compact')];

  const inputRiposoCorto = buildInput({
    label: 'Recupero riposo breve',
    name: 'recovery_short',
    type: 'number',
    value: resource?.recovery_short ?? 0
  })
  enhanceNumericField(inputRiposoCorto, { decrementLabel: 'Riduci recupero riposo breve', incrementLabel: 'Aumenta recupero riposo breve' });

  const inputRiposoLungo = buildInput({
    label: 'Recupero riposo lungo',
    name: 'recovery_long',
    type: 'number',
    value: resource?.recovery_long ?? 0
  })
  enhanceNumericField(inputRiposoLungo, { decrementLabel: 'Riduci recupero riposo lungo', incrementLabel: 'Aumenta recupero riposo lungo' });

  const resetField = document.createElement('label');
  resetField.className = 'field';
  resetField.innerHTML = '<span>Tipo ricarica</span>';
  const resetSelect = buildSelect([
    { value: 'short_rest', label: 'Riposo breve' },
    { value: 'long_rest', label: 'Riposo lungo' }
  ], resource?.reset_on ?? 'long_rest');
  resetSelect.name = 'reset_on';
  resetField.appendChild(resetSelect);
  const recoveryRow = buildRow([resetField, inputRiposoCorto, inputRiposoLungo], 'compact');
  recoveryRow.classList.add('ability-modal-row--recovery');
  chargeSectionRows.push(recoveryRow);

  const damageDiceNotationField = buildInput({
    label: 'Notazione dado',
    name: 'damage_dice_notation',
    placeholder: 'Es. 2d8+1d4',
    value: resource?.damage_dice_notation ?? ''
  });
  const damageModifierField = buildInput({
    label: 'Modificatore dado',
    name: 'damage_modifier',
    type: 'number',
    value: resource?.damage_modifier ?? 0
  });
  enhanceNumericField(damageModifierField, { decrementLabel: 'Riduci modificatore dado', incrementLabel: 'Aumenta modificatore dado' });
  const resourceSavingThrowField = document.createElement('label');
  resourceSavingThrowField.className = 'field modal-quick-property';
  resourceSavingThrowField.innerHTML = '<span>Tiro salvezza</span>';
  const resourceSavingThrowSelect = buildSelect([
    { value: '', label: 'Nessun tiro salvezza' },
    ...savingThrowList.map((entry) => ({ value: entry.key, label: entry.label }))
  ], resource?.saving_throw_ability ?? '');
  resourceSavingThrowSelect.name = 'saving_throw_ability';
  resourceSavingThrowField.appendChild(resourceSavingThrowSelect);
  const resourceDamageTypeField = document.createElement('label');
  resourceDamageTypeField.className = 'field modal-quick-property';
  resourceDamageTypeField.innerHTML = '<span>Tipo di danno</span>';
  const resourceDamageTypeSelect = buildSelect([
    { value: '', label: 'Nessun tipo di danno' },
    ...damageTypeList.filter((entry) => entry.key !== 'all').map((entry) => ({ value: entry.key, label: entry.label }))
  ], resource?.damage_type ?? '');
  resourceDamageTypeSelect.name = 'damage_type';
  resourceDamageTypeField.appendChild(resourceDamageTypeSelect);

  const resourceCostField = buildInput({
    label: 'Costo risorsa padre',
    name: 'resource_cost',
    type: 'number',
    value: Math.max(1, Number(resource?.resource_cost) || 1)
  });
  const resourceCostInput = resourceCostField.querySelector('input');
  if (resourceCostInput) {
    resourceCostInput.min = '1';
    resourceCostInput.step = '1';
  }
  enhanceNumericField(resourceCostField, { decrementLabel: 'Riduci costo risorsa', incrementLabel: 'Aumenta costo risorsa' });

  const variableResourceCostField = document.createElement('div');
  variableResourceCostField.className = 'field ability-parent-toggle condition-modal__item';
  variableResourceCostField.innerHTML = `
    <span class="condition-modal__item-label">
      <strong>Costo variabile</strong>
      <small>Scegli la quantità da consumare ogni volta che usi la sotto-abilità.</small>
    </span>
    <label class="diceov-toggle condition-modal__toggle ability-parent-toggle__control">
      <input type="checkbox" name="resource_cost_variable" value="1" ${resource?.resource_cost_variable ? 'checked' : ''} aria-label="Costo variabile" />
      <span class="diceov-toggle-track" aria-hidden="true"></span>
    </label>
  `;
  const variableResourceCostInput = variableResourceCostField.querySelector('input[name="resource_cost_variable"]');

  const descriptionField = buildTextarea({
    label: 'Descrizione',
    name: 'description',
    placeholder: 'Inserisci una descrizione, effetti e note di utilizzo...',
    value: resource?.description ?? ''
  });
  descriptionField.querySelector(':scope > span')?.remove();
  const descriptionInput = descriptionField.querySelector('textarea');
  descriptionInput?.setAttribute('aria-label', 'Descrizione');
  const identitySection = buildSection({
    title: 'Dettagli abilità',
    description: 'Nome, categoria d’azione e immagine opzionale mostrata nelle liste.',
    content: identitySectionRows
  });
  const usageSection = buildSection({
    title: 'Utilizzi, pool e recupero',
    description: 'Scegli Cariche per utilizzi singoli, Pool per consumare quantità variabili oppure Passiva per abilità sempre attive.',
    content: chargeSectionRows
  });
  const childUsageSection = buildSection({
    title: 'Consumo risorsa padre',
    description: 'Configura quante cariche o punti del padre vengono consumati usando questa sotto-abilità.',
    content: [buildRow([resourceCostField, variableResourceCostField], 'balanced')]
  });
  const rollsSection = buildSection({
    title: 'Tiri e CD',
    description: 'Configura il dado opzionale dell’abilità e l’eventuale caratteristica del tiro salvezza richiesto.',
    content: [buildRow([damageDiceNotationField, damageModifierField, resourceDamageTypeField, resourceSavingThrowField], 'compact')]
  });
  const descriptionSection = document.createElement('section');
  descriptionSection.className = 'ability-modal-section ability-modal-section--description ability-modal-section--description-plain';
  descriptionSection.appendChild(descriptionField);

  const wizard = document.createElement('div');
  wizard.className = 'item-editor-wizard ability-editor-wizard';
  const wizardNav = document.createElement('nav');
  wizardNav.className = 'item-editor-wizard__nav ability-editor-wizard__nav';
  wizardNav.setAttribute('aria-label', 'Passaggi modifica abilità');
  const wizardBody = document.createElement('div');
  wizardBody.className = 'item-editor-wizard__body';
  const wizardSteps = [
    { label: 'Identità', hint: 'Nome, organizzazione e descrizione', sections: [identitySection, descriptionSection] },
    { label: 'Utilizzi e tiri', hint: 'Cariche, dadi e CD', sections: [usageSection, childUsageSection, rollsSection] }
  ].map((step, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'item-editor-wizard__step-button';
    button.dataset.abilityEditorStep = String(index);
    button.innerHTML = `<span>${index + 1}</span><strong>${step.label}</strong><small>${step.hint}</small>`;
    const panel = document.createElement('div');
    panel.className = 'item-editor-wizard__panel ability-editor-wizard__panel';
    panel.dataset.abilityEditorPanel = String(index);
    panel.setAttribute('role', 'group');
    panel.setAttribute('aria-label', `Passaggio ${index + 1}: ${step.label}`);
    step.sections.forEach((section) => panel.appendChild(section));
    wizardNav.appendChild(button);
    wizardBody.appendChild(panel);
    return { ...step, button, panel };
  });
  const wizardActions = document.createElement('div');
  wizardActions.className = 'item-editor-wizard__actions item-editor-wizard__actions--footer character-edit-stepper-actions character-edit-stepper-actions--footer';
  wizardActions.innerHTML = `
    <button type="button" class="ghost-button" data-ability-editor-back>Indietro</button>
    <span data-ability-editor-progress aria-live="polite"></span>
    <button type="button" class="primary" data-ability-editor-next>Continua</button>
  `;
  wizard.append(wizardNav, wizardBody, wizardActions);
  form.appendChild(wizard);
  const wizardBack = wizardActions.querySelector('[data-ability-editor-back]');
  const wizardNext = wizardActions.querySelector('[data-ability-editor-next]');
  const wizardProgress = wizardActions.querySelector('[data-ability-editor-progress]');
  let activeWizardStep = 0;
  let wizardSubmitButton = null;

  const validateWizardStep = (index) => {
    const invalid = wizardSteps[index]?.panel.querySelector('input:invalid, select:invalid, textarea:invalid');
    if (!invalid) return true;
    invalid.reportValidity?.();
    invalid.focus?.();
    return false;
  };
  const showWizardStep = (nextIndex, { validateForward = false } = {}) => {
    const boundedIndex = Math.max(0, Math.min(wizardSteps.length - 1, nextIndex));
    if (validateForward && boundedIndex > activeWizardStep && !validateWizardStep(activeWizardStep)) return;
    activeWizardStep = boundedIndex;
    wizardSteps.forEach((step, index) => {
      const active = index === activeWizardStep;
      step.panel.hidden = !active;
      step.button.classList.toggle('is-active', active);
      step.button.classList.toggle('is-complete', index < activeWizardStep);
      step.button.setAttribute('aria-current', active ? 'step' : 'false');
    });
    const finalStep = activeWizardStep === wizardSteps.length - 1;
    wizardBack.disabled = activeWizardStep === 0;
    wizardNext.disabled = finalStep;
    if (wizardSubmitButton) {
      wizardSubmitButton.hidden = false;
      wizardSubmitButton.disabled = !resource && !finalStep;
    }
    wizardProgress.textContent = `Passaggio ${activeWizardStep + 1} di ${wizardSteps.length}`;
    wizardSteps[activeWizardStep].panel.scrollIntoView?.({ block: 'start', behavior: 'smooth' });
  };
  wizardBack.addEventListener('click', () => showWizardStep(activeWizardStep - 1));
  wizardNext.addEventListener('click', () => showWizardStep(activeWizardStep + 1, { validateForward: true }));
  wizardSteps.forEach((step, index) => step.button.addEventListener('click', () => {
    showWizardStep(index, { validateForward: index > activeWizardStep });
  }));

  const maxUsesInput = form.querySelector('input[name="max_uses"]');
  const usedInput = form.querySelector('input[name="used"]');
  const recoveryShortInput = form.querySelector('input[name="recovery_short"]');
  const recoveryLongInput = form.querySelector('input[name="recovery_long"]');
  const syncResourceTypeState = () => {
    const isChild = Boolean(parentSelect.value);
    const isPassive = resourceTypeSelect.value === 'passive' || isChild;
    const canBeParent = !isChild && resourceTypeSelect.value !== 'passive';
    usageSection.hidden = isChild;
    childUsageSection.hidden = !isChild;
    canHaveChildrenField.hidden = isChild;
    if (resourceCostInput) resourceCostInput.disabled = !isChild || Boolean(variableResourceCostInput?.checked);
    variableResourceCostField.classList.toggle('is-selected', Boolean(variableResourceCostInput?.checked));
    if (canHaveChildrenInput) {
      canHaveChildrenInput.disabled = !canBeParent;
      if (!canBeParent) canHaveChildrenInput.checked = false;
    }
    if (isPassive) {
      if (maxUsesInput) maxUsesInput.value = '0';
      if (usedInput) usedInput.value = '0';
      if (recoveryShortInput) recoveryShortInput.value = '0';
      if (recoveryLongInput) recoveryLongInput.value = '0';
    }
    if (maxUsesInput) maxUsesInput.disabled = isPassive;
    if (usedInput) usedInput.disabled = isPassive;
    if (recoveryShortInput) recoveryShortInput.disabled = isPassive;
    if (recoveryLongInput) recoveryLongInput.disabled = isPassive;
    resetSelect.disabled = isPassive;
  };
  resourceTypeSelect.addEventListener('change', syncResourceTypeState);
  parentSelect.addEventListener('change', syncResourceTypeState);
  variableResourceCostInput?.addEventListener('change', syncResourceTypeState);
  syncResourceTypeState();

  return present({
    title: resource ? `Modifica abilità: ${resource.name || 'Senza nome'}` : (parentSelect.value ? 'Nuova opzione abilità' : 'Nuova abilità'),
    submitLabel: 'Salva',
    content: form,
    cardClass: ['modal-card--form', 'modal-card--ability-editor'],
    onOpen: ({ modal, formEl }) => {
      modal?.classList.add('ability-editor-modal-active');
      wizardSubmitButton = modal?.querySelector('[data-form-submit]') || formEl?.querySelector('button[type="submit"]');
      const modalActions = modal?.querySelector('.modal-footer .modal-actions');
      const centeredActions = document.createElement('div');
      centeredActions.className = 'modal-actions__center item-editor-wizard__footer-center ability-editor-wizard__footer-center';
      if (modalActions) {
        centeredActions.appendChild(wizardActions);
        modalActions.classList.add('modal-actions--with-center');
        modalActions.insertBefore(centeredActions, modalActions.querySelector('.modal-actions__right'));
      }
      const guardIntermediateSubmit = (event) => {
        if (resource || activeWizardStep === wizardSteps.length - 1) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        showWizardStep(activeWizardStep + 1, { validateForward: true });
      };
      formEl?.addEventListener('submit', guardIntermediateSubmit, true);
      showWizardStep(0);
      nameInput?.focus();
      return () => {
        formEl?.removeEventListener('submit', guardIntermediateSubmit, true);
        if (wizardSubmitButton) {
          wizardSubmitButton.hidden = false;
          wizardSubmitButton.disabled = false;
        }
        modal?.classList.remove('ability-editor-modal-active');
        centeredActions.remove();
        modalActions?.classList.remove('modal-actions--with-center');
        wizard.appendChild(wizardActions);
      };
    }
  }).then(async (formData) => {
    if (!formData) return;
    const name = formData.get('name')?.trim();
    if (!name) {
      createToast('Inserisci un nome per la risorsa', 'error');
      return;
    }
    const currentUser = getState().user;
    const toNumberOrNull = (value) => (value === '' || value === null ? null : Number(value));
    const maxUses = Number(formData.get('max_uses')) || 0;
    const used = Math.min(Number(formData.get('used')) || 0, maxUses || 0);
    const parentId = formData.get('parent_resource_id') || null;
    const resourceType = parentId ? 'passive' : (formData.get('resource_type') || 'charges');
    const isPassive = resourceType === 'passive';
    const canHaveChildren = !parentId && !isPassive && formData.get('can_have_children') === '1';
    const payload = {
      user_id: currentUser?.id ?? character.user_id,
      character_id: character.id,
      parent_resource_id: parentId,
      can_have_children: canHaveChildren,
      resource_cost: parentId ? Math.max(1, Number(formData.get('resource_cost')) || 1) : 1,
      resource_cost_variable: Boolean(parentId && formData.get('resource_cost_variable') === '1'),
      name,
      image_url: formData.get('image_url')?.trim() || null,
      description: formData.get('description')?.trim() || null,
      cast_time: formData.get('cast_time') || null,
      damage_dice_notation: formData.get('damage_dice_notation')?.trim() || null,
      damage_modifier: toNumberOrNull(formData.get('damage_modifier')),
      damage_type: formData.get('damage_type')?.toString() || null,
      saving_throw_ability: formData.get('saving_throw_ability')?.toString() || null,
      resource_type: resourceType,
      max_uses: isPassive ? 0 : maxUses,
      used: isPassive ? 0 : used,
      reset_on: isPassive ? null : formData.get('reset_on'),
      recovery_short: toNumberOrNull(formData.get('recovery_short')),
      recovery_long: toNumberOrNull(formData.get('recovery_long'))
    };

    try {
      let savedResource;
      if (resource) {
        savedResource = await updateResource(resource.id, payload);
        createToast('Risorsa aggiornata');
      } else {
        savedResource = await createResource(payload);
        createToast('Risorsa creata');
      }
      await onSave?.(savedResource);
      return savedResource;
    } catch (error) {
      createToast('Errore salvataggio risorsa', 'error');
    }
  });
}
