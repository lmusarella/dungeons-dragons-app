import { createResource, updateResource } from '../characterApi.js';
import { getState } from '../../../app/state.js';
import {
  buildInput,
  buildSelect,
  buildTextarea,
  createToast,
  openFormModal,
  attachNumberStepper
} from '../../../ui/components.js';
import { consumeSpellSlot, saveCharacterData } from './data.js';
import { openDiceOverlay } from '../../dice-roller/overlay/dice.js';
import { buildSpellDamageOverlayConfig, sortSpellsByLevel } from './utils.js';
import { conditionList } from './constants.js';

const SPELL_CAST_TIME_OPTIONS = ['Azione', 'Azione Bonus', 'Reazione', 'Azione Gratuita', 'Durata'];

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


function openSpellDamageOverlay(character, spell) {
  const overlayConfig = buildSpellDamageOverlayConfig(spell);
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

export function openBackgroundModal(character) {
  if (!character) return;
  const data = character.data || {};
  const description = data.description || 'Aggiungi una descrizione del background.';
  const content = document.createElement('div');
  content.className = 'background-modal';

  const descriptionCard = document.createElement('div');
  descriptionCard.className = 'detail-card detail-card--text';
  const descriptionBlock = document.createElement('div');
  descriptionBlock.className = 'background-modal-block';
  const descriptionText = document.createElement('p');
  descriptionText.className = 'background-modal-description';
  descriptionText.textContent = description;
  descriptionBlock.appendChild(descriptionText);
  descriptionCard.appendChild(descriptionBlock);

  content.appendChild(descriptionCard);

  openFormModal({
    title: 'Descrizione background',
    cancelLabel: null,
    content,
    cardClass: ['modal-card--scrollable', 'modal-card--background'],
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
      <span class="condition-modal__item-label"><strong>${condition.label}</strong></span>
      <span class="diceov-toggle condition-modal__toggle">
        <input type="checkbox" name="conditions" value="${condition.key}" ${isChecked ? 'checked' : ''} />
        <span class="diceov-toggle-track" aria-hidden="true"></span>
      </span>
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
    cardClass: 'modal-card--wide'
  });
}

export function openResourceDetail(resource, { onUse, onReset } = {}) {
  const detail = document.createElement('div');
  detail.className = 'resource-detail';
  const maxUses = Number(resource.max_uses) || 0;
  const isExhausted = maxUses && resource.used >= maxUses;
  const isActive = resource.reset_on !== null && resource.reset_on !== 'none';
  const hasAction = Boolean(maxUses && (isExhausted ? onReset : onUse));
  const description = resource.description?.trim() || 'Nessuna descrizione disponibile per questa risorsa.';
  const hasDisplayImage = hasUsableDetailImage(resource.image_url);
  const imageUrl = resource.image_url?.trim() || '';

  detail.innerHTML = `
    <div class="detail-card detail-card--text resource-detail-card ${hasDisplayImage ? "" : "resource-detail-card--text-only"}">
      ${hasDisplayImage ? `<img class="resource-detail-image" src="${escapeHtml(imageUrl)}" alt="Immagine di ${escapeHtml(resource.name || 'risorsa')}" />` : ''}
      <div class="detail-rich-text">${renderDetailText(description)}</div>
    </div>
  `;

  openFormModal({
    title: resource.name || 'Risorsa',
    submitLabel: hasAction
      ? (isExhausted ? 'Ripristina' : 'Usa')
      : 'Chiudi',
    cancelLabel: isActive ? (hasAction ? 'Chiudi' : null) : null,
    content: detail,
    showFooter: isActive
  }).then(async (formData) => {
    if (!formData || !maxUses) return;
    if (isExhausted && onReset) {
      await onReset();
      return;
    }
    if (!isExhausted && onUse) {
      await onUse();
    }
  });
}

export function openSpellDrawer(character, onSave, spell = null) {
  if (!character) return;
  const enhanceSpellNumericField = (field) => {
    const input = field?.querySelector('input[type="number"]');
    if (!input) return;
    const fieldLabel = field.querySelector('span')?.textContent?.trim();
    attachNumberStepper(input, {
      decrementLabel: fieldLabel ? `Riduci ${fieldLabel}` : 'Diminuisci valore',
      incrementLabel: fieldLabel ? `Aumenta ${fieldLabel}` : 'Aumenta valore'
    });
  };
  const canPrepare = Boolean(character.data?.is_spellcaster);
  const form = document.createElement('div');
  form.className = 'drawer-form modal-form-grid spell-form';
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
  const prepStateField = canPrepare ? document.createElement('label') : null;
  let prepStateSelect = null;
  if (prepStateField) {
    prepStateField.className = 'field';
    prepStateField.innerHTML = '<span>Preparazione</span>';
    prepStateSelect = buildSelect([
      { value: 'known', label: 'Conosciuto' },
      { value: 'prepared', label: 'Preparato' },
      { value: 'always', label: 'Sempre preparato' }
    ], spell?.prep_state ?? 'known');
    prepStateSelect.name = 'spell_prep_state';
    prepStateField.appendChild(prepStateSelect);
  }
  form.appendChild(buildRow([nameField, spellKindField, levelField], 'compact'));
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
  form.appendChild(buildRow([
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
    })
  ], 'compact'));
  const concentrationField = document.createElement('div');
  concentrationField.className = 'modal-toggle-field';
  concentrationField.innerHTML = `
    <span class="modal-toggle-field__label">Concentrazione</span>
    <label class="diceov-toggle condition-modal__toggle">
      <input type="checkbox" name="spell_concentration" />
      <span class="diceov-toggle-track" aria-hidden="true"></span>
    </label>
  `;
  const attackRollField = document.createElement('div');
  attackRollField.className = 'modal-toggle-field';
  attackRollField.innerHTML = `
    <span class="modal-toggle-field__label">Tiro per colpire</span>
    <label class="diceov-toggle condition-modal__toggle">
      <input type="checkbox" name="spell_attack_roll" />
      <span class="diceov-toggle-track" aria-hidden="true"></span>
    </label>
  `;
  const ritualField = document.createElement('div');
  ritualField.className = 'modal-toggle-field';
  ritualField.innerHTML = `
    <span class="modal-toggle-field__label">Rituale</span>
    <label class="diceov-toggle condition-modal__toggle">
      <input type="checkbox" name="spell_is_ritual" />
      <span class="diceov-toggle-track" aria-hidden="true"></span>
    </label>
  `;
  form.appendChild(buildRow([concentrationField, attackRollField, ritualField, prepStateField], 'compact'));
  const damageDieField = buildInput({
    label: 'Notazione dado',
    name: 'spell_damage_die',
    placeholder: 'Es. 1d10',
    value: spell?.damage_die ?? ''
  });
  const imageField = buildInput({
    label: 'Foto (URL)',
    name: 'spell_image_url',
    placeholder: 'https://.../incantesimo.png',
    value: spell?.image_url ?? ''
  });
  const damageModifierField = buildInput({
    label: 'Modificatore',
    name: 'spell_damage_modifier',
    type: 'number',
    value: spell?.damage_modifier ?? ''
  });
  form.appendChild(buildRow([damageDieField, damageModifierField, imageField], 'compact'));
  form.appendChild(buildTextarea({
    label: 'Descrizione',
    name: 'spell_description',
    placeholder: 'Descrizione dell\'incantesimo...',
    value: spell?.description ?? ''
  }));

  const concentrationInput = form.querySelector('input[name="spell_concentration"]');
  if (concentrationInput) {
    concentrationInput.checked = Boolean(spell?.concentration);
  }
  const attackRollInput = form.querySelector('input[name="spell_attack_roll"]');
  if (attackRollInput) {
    attackRollInput.checked = Boolean(spell?.attack_roll);
  }
  const ritualInput = form.querySelector('input[name="spell_is_ritual"]');
  if (ritualInput) {
    ritualInput.checked = Boolean(spell?.is_ritual);
  }

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

  openFormModal({
    title: spell ? 'Modifica incantesimo' : 'Nuovo incantesimo',
    submitLabel: spell ? 'Salva' : 'Aggiungi',
    content: form,
    cardClass: 'modal-card--form'
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
    const prepState = canPrepare ? formData.get('spell_prep_state') || 'known' : spell?.prep_state || 'known';
    const nextSpell = {
      id: spell?.id ?? `spell-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name,
      level,
      kind: selectedKind || (level === 0 ? 'cantrip' : 'spell'),
      cast_time: formData.get('spell_cast_time') || null,
      duration: formData.get('spell_duration')?.trim() || null,
      range: formData.get('spell_range')?.trim() || null,
      components: formData.get('spell_components')?.trim() || null,
      concentration: formData.has('spell_concentration'),
      attack_roll: formData.has('spell_attack_roll'),
      is_ritual: formData.has('spell_is_ritual'),
      image_url: formData.get('spell_image_url')?.trim() || null,
      damage_die: formData.get('spell_damage_die')?.trim() || null,
      damage_modifier: damageModifier,
      description: formData.get('spell_description')?.trim() || null,
      prep_state: prepState
    };
    const currentSpells = Array.isArray(character.data?.spells) ? character.data.spells : [];
    const nextSpells = spell
      ? currentSpells.map((entry) => (entry.id === spell.id ? nextSpell : entry))
      : [...currentSpells, nextSpell];
    const nextData = {
      ...character.data,
      spells: nextSpells
    };
    const message = spell ? 'Incantesimo aggiornato' : 'Incantesimo aggiunto';
    await saveCharacterData(character, nextData, message, onSave);
  });
}



export function openSpellQuickDetailModal(character, spell, onRender) {
  if (!character || !spell) return;
  const level = Math.max(0, Number(spell.level) || 0);
  const detailChips = [
    `Range: ${spell.range?.trim() || '-'}`,
    `Durata: ${spell.duration?.trim() || '-'}`,
    `Componenti: ${spell.components?.trim() || '-'}`,
    ...(spell.concentration ? ['Concentrazione: Sì'] : []),
    ...(spell.is_ritual ? ['Rituale: Sì'] : [])
  ];
  const description = spell.description?.trim() || 'Nessuna descrizione disponibile.';
  const isCastable = level > 0;
  const hasDisplayImage = hasUsableDetailImage(spell.image_url);
  const imageUrl = spell.image_url?.trim() || '';

  const content = document.createElement('div');
  content.className = 'spell-quick-detail';
  content.innerHTML = `
    <div class="detail-card detail-card--text spell-quick-detail__card ${hasDisplayImage ? "" : "resource-detail-card--text-only"}">
      ${hasDisplayImage ? `<img class="resource-detail-image" src="${escapeHtml(imageUrl)}" alt="Immagine di ${escapeHtml(spell.name || 'incantesimo')}" />` : ''}
      <div class="spell-quick-detail__content">
        <div class="tag-row spell-quick-detail__chips">${detailChips.map((label) => `<span class="chip">${escapeHtml(label)}</span>`).join('')}</div>
        <div class="detail-rich-text spell-quick-detail__description">${renderDetailText(description)}</div>
      </div>
    </div>
  `;

  openFormModal({
    title: spell.name || 'Incantesimo',
    submitLabel: isCastable ? 'Lancia' : 'Chiudi',
    cancelLabel: isCastable ? 'Chiudi' : null,
    content,
    cardClass: ['spell-quick-detail-modal'],
    showFooter: isCastable
  }).then(async (formData) => {
    if (!formData || !isCastable) return;
    const consumed = await consumeSpellSlot(character, level, onRender);
    if (!consumed) return;
    openSpellDamageOverlay(character, spell);
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
  if (!character) return;
  const data = character.data || {};
  const spellcasting = data.spellcasting || {};
  if (!spellcasting.can_prepare) return;
  const spells = Array.isArray(data.spells) ? sortSpellsByLevel(data.spells) : [];
  const selectable = spells.filter((entry) => {
    const prepState = entry.prep_state || 'known';
    const level = Number(entry.level) || 0;
    return prepState !== 'always' && level > 0;
  });
  if (!selectable.length) {
    createToast('Nessun incantesimo preparabile.', 'info');
    return;
  }
  const preparedIds = new Set(
    selectable
      .filter((entry) => (entry.prep_state || 'known') === 'prepared')
      .map((entry) => entry.id)
  );
  const groupedByLevel = selectable.reduce((acc, entry) => {
    const level = Math.max(1, Number(entry.level) || 1);
    if (!acc.has(level)) acc.set(level, []);
    acc.get(level).push(entry);
    return acc;
  }, new Map());
  const levelOrder = Array.from(groupedByLevel.keys()).sort((a, b) => a - b);

  const getLevelLabel = (level) => {
    if (level === 1) return '1° livello';
    return `${level}° livello`;
  };

  const getSpellDescription = (entry) => {
    const description = String(entry.description || '').trim();
    return description || 'Nessuna descrizione disponibile.';
  };

  const initialLevel = levelOrder[0] || 1;

  const content = document.createElement('div');
  content.className = 'prepared-spells-modal';
  content.innerHTML = `
    <p class="muted">Seleziona gli incantesimi da preparare per oggi.</p>
    <div class="tab-bar prepared-spells-modal__tabs" role="tablist" aria-label="Livelli incantesimo">
      ${levelOrder.map((level) => {
    const isActive = level === initialLevel;
    return `
          <button
            class="tab-bar__button prepared-spells-modal__tab ${isActive ? 'is-active' : ''}"
            type="button"
            role="tab"
            data-prepared-level-tab="${level}"
            aria-selected="${isActive}"
            aria-controls="prepared-spells-level-${level}"
            id="prepared-spells-tab-${level}"
            tabindex="${isActive ? '0' : '-1'}"
          >
            ${getLevelLabel(level)}
          </button>
        `;
  }).join('')}
    </div>
    <div class="prepared-spells-modal__group-stack">
      ${levelOrder.map((level) => {
    const entries = groupedByLevel.get(level) || [];
    const isActive = level === initialLevel;
    return `
          <section
            class="prepared-spells-modal__group tab-panel ${isActive ? 'is-active' : ''}"
            data-level-group="${level}"
            data-prepared-level-panel="${level}"
            role="tabpanel"
            id="prepared-spells-level-${level}"
            aria-labelledby="prepared-spells-tab-${level}"
          >
            <div class="prepared-spells-modal__list">
              ${entries.map((entry) => {
      const isPrepared = preparedIds.has(entry.id);
      return `
                  <article class="prepared-spells-modal__spell" data-prepared-item="${entry.id}">
                    <div class="prepared-spells-modal__spell-actions">
                      <button
                        class="prepared-spells-modal__toggle ${isPrepared ? 'is-active' : ''}"
                        type="button"
                        data-prepared-toggle="${entry.id}"
                        aria-pressed="${isPrepared}"
                      >
                        <span class="prepared-spells-modal__toggle-name">${entry.name}</span>
                      </button>
                      <button
                        class="resource-action-button resource-icon-button prepared-spells-modal__description-toggle"
                        type="button"
                        data-prepared-description-toggle="${entry.id}"
                        aria-expanded="false"
                        aria-label="Mostra descrizione ${entry.name}"
                      >
                        🔍
                      </button>
                    </div>
                    <div class="prepared-spells-modal__description" data-prepared-description="${entry.id}" hidden>
                      <div class="detail-rich-text">${renderDetailText(getSpellDescription(entry))}</div>
                    </div>
                  </article>
                `;
    }).join('')}
            </div>
          </section>
        `;
  }).join('')}
    </div>
  `;

  const syncPreparedState = () => {
    content.querySelectorAll('[data-prepared-toggle]').forEach((button) => {
      const spellId = button.dataset.preparedToggle;
      if (!spellId) return;
      const isPrepared = preparedIds.has(spellId);
      button.classList.toggle('is-active', isPrepared);
      button.setAttribute('aria-pressed', String(isPrepared));
    });
  };

  content.querySelectorAll('[data-prepared-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const spellId = button.dataset.preparedToggle;
      if (!spellId) return;
      if (preparedIds.has(spellId)) {
        preparedIds.delete(spellId);
      } else {
        preparedIds.add(spellId);
      }
      syncPreparedState();
    });
  });

  content.querySelectorAll('[data-prepared-description-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const spellId = button.dataset.preparedDescriptionToggle;
      if (!spellId) return;
      const detail = content.querySelector(`[data-prepared-description="${spellId}"]`);
      if (!detail) return;
      const isExpanded = !detail.hidden;
      detail.hidden = isExpanded;
      button.setAttribute('aria-expanded', String(!isExpanded));
    });
  });

  const setActiveLevel = (nextLevel) => {
    content.querySelectorAll('[data-prepared-level-tab]').forEach((tabButton) => {
      const isActive = tabButton.dataset.preparedLevelTab === String(nextLevel);
      tabButton.classList.toggle('is-active', isActive);
      tabButton.setAttribute('aria-selected', String(isActive));
      tabButton.setAttribute('tabindex', isActive ? '0' : '-1');
    });
    content.querySelectorAll('[data-prepared-level-panel]').forEach((panel) => {
      const isActive = panel.dataset.preparedLevelPanel === String(nextLevel);
      panel.classList.toggle('is-active', isActive);
    });
  };

  content.querySelectorAll('[data-prepared-level-tab]').forEach((tabButton) => {
    tabButton.addEventListener('click', () => {
      const level = tabButton.dataset.preparedLevelTab;
      if (!level) return;
      setActiveLevel(level);
    });
  });

  syncPreparedState();

  openFormModal({
    title: 'Incantesimi preparati',
    submitLabel: 'Salva',
    cancelLabel: 'Annulla',
    content,
    cardClass: 'modal-card--form'
  }).then(async (formData) => {
    if (!formData) return;
    const nextSpells = spells.map((entry) => {
      const prepState = entry.prep_state || 'known';
      if (prepState === 'always') return entry;
      if (Number(entry.level) === 0) return entry;
      const isPrepared = preparedIds.has(entry.id);
      return {
        ...entry,
        prep_state: isPrepared ? 'prepared' : 'known'
      };
    });
    const nextData = {
      ...character.data,
      spells: nextSpells
    };
    await saveCharacterData(character, nextData, 'Incantesimi preparati aggiornati', onSave);
  });
}

export function openAvatarModal(character) {
  const avatarUrl = character?.data?.avatar_url;
  if (!avatarUrl) return;
  const existing = document.querySelector('.avatar-preview');
  if (existing) existing.remove();
  const overlay = document.createElement('div');
  overlay.className = 'avatar-preview';
  overlay.tabIndex = 0;
  overlay.innerHTML = `
    <img class="avatar-preview__image" src="${avatarUrl}" alt="Ritratto di ${character.name}" />
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

export function openResourceDrawer(character, onSave, resource = null) {
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
  const nameField = buildInput({ label: 'Nome abilità', name: 'name', placeholder: 'Es. Azione Impetuosa', value: resource?.name ?? '' });
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

  form.appendChild(buildRow([nameField, castTimeField, imageField], 'balanced'));


  const passiveField = document.createElement('div');
  passiveField.className = 'modal-toggle-field';
  passiveField.innerHTML = `
    <span class="modal-toggle-field__label">Passiva (senza cariche)</span>
    <label class="diceov-toggle">
      <input type="checkbox" name="is_passive" />
      <span class="diceov-toggle-track" aria-hidden="true"></span>
    </label>
  `;

  const maxUsesField = buildInput({ label: 'Cariche massime', name: 'max_uses', type: 'number', value: resource?.max_uses ?? 1 });
  enhanceNumericField(maxUsesField, { decrementLabel: 'Riduci cariche massime', incrementLabel: 'Aumenta cariche massime' });
  const usedField = buildInput({ label: 'Cariche consumate', name: 'used', type: 'number', value: resource?.used ?? 0 });
  enhanceNumericField(usedField, { decrementLabel: 'Riduci cariche consumate', incrementLabel: 'Aumenta cariche consumate' });

  form.appendChild(buildRow([passiveField, maxUsesField, usedField], 'compact'));

  const inputRiposoCorto = buildInput({
    label: 'Recupero riposo breve',
    name: 'recovery_short',
    type: 'number',
    value: resource?.recovery_short ?? ''
  })
  enhanceNumericField(inputRiposoCorto, { decrementLabel: 'Riduci recupero riposo breve', incrementLabel: 'Aumenta recupero riposo breve' });

  const inputRiposoLungo = buildInput({
    label: 'Recupero riposo lungo',
    name: 'recovery_long',
    type: 'number',
    value: resource?.recovery_long ?? ''
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
  form.appendChild(buildRow([resetField, inputRiposoCorto, inputRiposoLungo], 'balanced'));

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
    value: resource?.damage_modifier ?? ''
  });
  enhanceNumericField(damageModifierField, { decrementLabel: 'Riduci modificatore dado', incrementLabel: 'Aumenta modificatore dado' });
  form.appendChild(buildRow([damageDiceNotationField, damageModifierField], 'compact'));

  form.appendChild(buildTextarea({
    label: 'Descrizione',
    name: 'description',
    placeholder: 'Inserisci una descrizione...',
    value: resource?.description ?? ''
  }));

  const maxUsesInput = form.querySelector('input[name="max_uses"]');
  const usedInput = form.querySelector('input[name="used"]');
  const recoveryShortInput = form.querySelector('input[name="recovery_short"]');
  const recoveryLongInput = form.querySelector('input[name="recovery_long"]');
  const passiveInput = form.querySelector('input[name="is_passive"]');
  if (passiveInput) {
    passiveInput.checked = Number(resource?.max_uses) === 0 || resource?.reset_on === null || resource?.reset_on === 'none';
  }
  const syncPassiveState = () => {
    const isPassive = passiveInput?.checked;
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
  passiveInput?.addEventListener('change', syncPassiveState);
  syncPassiveState();

  openFormModal({
    title: resource ? 'Modifica abilità' : 'Nuova abilità',
    submitLabel: resource ? 'Salva' : 'Crea',
    content: form,
    cardClass: 'modal-card--form'
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
    const isPassive = formData.get('is_passive') === 'on';
    const payload = {
      user_id: currentUser?.id ?? character.user_id,
      character_id: character.id,
      name,
      image_url: formData.get('image_url')?.trim() || null,
      description: formData.get('description')?.trim() || null,
      cast_time: formData.get('cast_time') || null,
      damage_dice_notation: formData.get('damage_dice_notation')?.trim() || null,
      damage_modifier: toNumberOrNull(formData.get('damage_modifier')),
      max_uses: maxUses,
      used,
      reset_on: isPassive ? null : formData.get('reset_on'),
      recovery_short: toNumberOrNull(formData.get('recovery_short')),
      recovery_long: toNumberOrNull(formData.get('recovery_long'))
    };

    try {
      if (resource) {
        await updateResource(resource.id, payload);
        createToast('Risorsa aggiornata');
      } else {
        await createResource(payload);
        createToast('Risorsa creata');
      }
      onSave();
    } catch (error) {
      createToast('Errore salvataggio risorsa', 'error');
    }
  });
}
