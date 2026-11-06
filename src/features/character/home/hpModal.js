import { attachNumberStepper, buildInput } from '../../../ui/components.js';
import { getHitDiceSides } from './utils.js';

export function attachModalValueStepper(input, {
  min = null,
  max = null
} = {}) {
  if (!(input instanceof HTMLInputElement) || input.type !== 'number') return;
  if (input.closest('.modal-value-stepper')) return;
  const wrapper = document.createElement('div');
  wrapper.className = 'number-stepper modal-value-stepper';
  const dec = document.createElement('button');
  dec.type = 'button';
  dec.className = 'number-stepper__button modal-value-stepper__button';
  dec.textContent = '−';
  dec.setAttribute('aria-label', 'Diminuisci valore');
  const inc = document.createElement('button');
  inc.type = 'button';
  inc.className = 'number-stepper__button modal-value-stepper__button';
  inc.textContent = '+';
  inc.setAttribute('aria-label', 'Aumenta valore');
  const parent = input.parentNode;
  if (!parent) return;
  parent.insertBefore(wrapper, input);
  wrapper.append(dec, input, inc);
  const resolve = (value) => Number.isFinite(value) ? value : 0;
  const step = (direction) => {
    const current = resolve(input.valueAsNumber);
    const stepValue = Number(input.step);
    const amount = Number.isFinite(stepValue) && stepValue > 0 ? stepValue : 1;
    let next = current + (amount * direction);
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

export function buildHpShortcutFields(
  character,
  {
    allowHitDice = true,
    allowTempHp = false,
    allowMaxOverride = false
  } = {}
) {
  const enhanceNumericField = (field, labels = {}) => {
    const input = field?.querySelector('input[type="number"]');
    if (!input) return;
    attachNumberStepper(input, labels);
  };
  const wrapper = document.createElement('div');
  wrapper.className = 'modal-form-grid hp-shortcut-fields';
  const amountField = buildInput({ label: 'Valore', name: 'amount', type: 'number', value: '1' });
  amountField.classList.add('hp-shortcut-fields__amount');
  const amountInput = amountField.querySelector('input');
  if (amountInput) {
    attachModalValueStepper(amountInput, { min: 1 });
    amountInput.min = '1';
    amountInput.required = true;
  }

  const primaryRow = document.createElement('div');
  primaryRow.className = 'modal-form-row modal-form-row--balanced hp-shortcut-fields__row';
  primaryRow.appendChild(amountField);

  if (allowTempHp) {
    const tempHpField = document.createElement('div');
    tempHpField.className = 'modal-toggle-field';
    tempHpField.innerHTML = `
      <span class="modal-toggle-field__label">HP temporanei</span>
      <label class="diceov-toggle condition-modal__toggle">
        <input type="checkbox" name="temp_hp" />
        <span class="diceov-toggle-track" aria-hidden="true"></span>
      </label>
    `;
    primaryRow.appendChild(tempHpField);
  }

  wrapper.appendChild(primaryRow);

  if (!allowHitDice) {
    if (allowMaxOverride) {
      const maxHpField = buildInput({
        label: 'Nuovo massimo PF',
        name: 'hp_max_override',
        type: 'number',
        value: character?.data?.hp?.max ?? ''
      });
      maxHpField.classList.add('hp-shortcut-fields__max');
      const maxInput = maxHpField.querySelector('input');
      if (maxInput) {
        attachModalValueStepper(maxInput, { min: 1 });
        maxInput.min = '1';
      }
      primaryRow.appendChild(maxHpField);
    }
    return wrapper;
  }

  const hitDice = character?.data?.hit_dice || {};
  const hitDiceUsed = Number(hitDice.used) || 0;
  const hitDiceMax = Number(hitDice.max) || 0;
  const remaining = Math.max(hitDiceMax - hitDiceUsed, 0);
  const hitDiceSides = getHitDiceSides(hitDice.die);
  const canUse = remaining > 0 && hitDiceSides;

  const hitDiceField = document.createElement('div');
  hitDiceField.className = 'modal-toggle-field';
  const hitDiceLabel = hitDice.die ? `${hitDice.die}` : 'dado vita';
  hitDiceField.innerHTML = `
    <span class="modal-toggle-field__label">Usa dado vita (${hitDiceLabel}) · rimasti ${remaining}/${hitDiceMax || '-'}</span>
    <label class="diceov-toggle condition-modal__toggle">
      <input type="checkbox" name="use_hit_dice" ${canUse ? '' : 'disabled'} />
      <span class="diceov-toggle-track" aria-hidden="true"></span>
    </label>
  `;

  const hitDiceCountField = document.createElement('label');
  hitDiceCountField.className = 'field hit-dice-count hp-shortcut-fields__count';
  hitDiceCountField.innerHTML = `
    <span>Numero dadi vita</span>
    <input type="number" name="hit_dice_count" min="1" max="${remaining}" value="1" />
  `;
  enhanceNumericField(hitDiceCountField, { decrementLabel: 'Riduci dadi vita', incrementLabel: 'Aumenta dadi vita' });

  const hitDiceRow = document.createElement('div');
  hitDiceRow.className = 'modal-form-row modal-form-row--balanced hp-shortcut-fields__row';
  hitDiceRow.append(hitDiceField, hitDiceCountField);
  wrapper.appendChild(hitDiceRow);

  if (!canUse) {
    const hint = document.createElement('p');
    hint.className = 'muted';
    hint.textContent = 'Nessun dado vita disponibile o configurato.';
    wrapper.appendChild(hint);
  }

  const checkbox = hitDiceField.querySelector('input');
  const countInput = hitDiceCountField.querySelector('input');
  if (countInput) countInput.required = false;

  const syncState = () => {
    const useDice = checkbox?.checked;
    if (!amountInput) return;
    amountInput.disabled = Boolean(useDice);
    amountInput.required = !useDice;
    if (useDice) amountInput.value = '';
    else if (!amountInput.value) amountInput.value = '1';
    if (countInput) {
      countInput.disabled = !useDice;
      countInput.required = Boolean(useDice);
      if (!useDice) countInput.value = '1';
    }
  };
  checkbox?.addEventListener('change', syncState);
  syncState();

  return wrapper;
}

export function buildHpActionFields(character, action = 'damage') {
  const healing = action === 'heal';
  const hp = character?.data?.hp || {};
  const current = Math.max(0, Number(hp.current) || 0);
  const maximum = Math.max(0, Number(hp.max) || 0);
  const temporary = Math.max(0, Number(hp.temp) || 0);
  const wrapper = document.createElement('div');
  wrapper.className = `hp-action-editor hp-action-editor--${healing ? 'heal' : 'damage'}`;
  wrapper.innerHTML = `
    <section class="hp-action-editor__hero">
      <span class="hp-action-editor__hero-icon" aria-hidden="true">${healing ? '+' : '−'}</span>
      <div><strong>${healing ? 'Recupera punti ferita' : 'Applica danno'}</strong><small>${healing ? 'Scegli la quantità e dove applicare la cura.' : 'Scegli la quantità di punti ferita da sottrarre.'}</small></div>
      <div class="hp-action-editor__summary" aria-label="Punti ferita attuali">
        <span><small>Attuali</small><strong>${current}</strong></span>
        <span><small>Massimi</small><strong>${maximum || '—'}</strong></span>
        <span><small>Temporanei</small><strong>${temporary}</strong></span>
      </div>
    </section>
    <section class="hp-action-editor__amount-section">
      <span class="hp-action-editor__section-label">Quantità</span>
      <div class="hp-action-editor__amount-control">
        <button type="button" data-hp-amount-step="-5" aria-label="Riduci di 5">−5</button>
        <button type="button" data-hp-amount-step="-1" aria-label="Riduci di 1">−</button>
        <input type="number" name="amount" min="1" step="1" value="1" inputmode="numeric" aria-label="Quantità ${healing ? 'di cura' : 'di danno'}" required />
        <button type="button" data-hp-amount-step="1" aria-label="Aumenta di 1">+</button>
        <button type="button" data-hp-amount-step="5" aria-label="Aumenta di 5">+5</button>
      </div>
      <div class="hp-action-editor__presets" aria-label="Valori rapidi">
        ${[1, 5, 10, 25, 50].map((value) => `<button type="button" data-hp-amount-preset="${value}">${value}</button>`).join('')}
      </div>
    </section>
    ${healing ? `
      <section class="hp-action-editor__selection-section">
        <span class="hp-action-editor__section-label">Dove applicare la cura</span>
        <div class="hp-action-editor__choices" aria-label="Destinazione della cura">
          <label class="hp-action-editor__choice">
            <input type="radio" name="healing_target" value="hp" checked />
            <span aria-hidden="true">♥</span><strong>Punti ferita</strong><small>Recupera PF fino al massimo.</small><i aria-hidden="true">✓</i>
          </label>
          <label class="hp-action-editor__choice">
            <input type="radio" name="healing_target" value="temp" />
            <span aria-hidden="true">◇</span><strong>PF temporanei</strong><small>Aggiunge protezione temporanea.</small><i aria-hidden="true">✓</i>
          </label>
        </div>
      </section>` : `
      <section class="hp-action-editor__selection-section">
        <span class="hp-action-editor__section-label">Opzioni aggiuntive</span>
        <div class="hp-action-editor__damage-options">
          <label class="hp-action-editor__max-choice">
            <input type="checkbox" name="change_hp_max" />
            <span aria-hidden="true">◇</span>
            <span><strong>Modifica PF massimi</strong><small>Imposta anche un nuovo valore massimo.</small></span>
            <i aria-hidden="true">✓</i>
          </label>
          <label class="field hp-action-editor__max-field"><span>Nuovo massimo PF</span><input type="number" name="hp_max_override" min="1" inputmode="numeric" placeholder="Attuale: ${maximum || '—'}" disabled /></label>
        </div>
      </section>`}
  `;
  const amountInput = wrapper.querySelector('input[name="amount"]');
  wrapper.querySelectorAll('[data-hp-amount-step]').forEach((button) => button.addEventListener('click', () => {
    amountInput.value = String(Math.max(1, (Number(amountInput.value) || 1) + Number(button.dataset.hpAmountStep)));
    amountInput.dispatchEvent(new Event('input', { bubbles: true }));
  }));
  wrapper.querySelectorAll('[data-hp-amount-preset]').forEach((button) => button.addEventListener('click', () => {
    amountInput.value = button.dataset.hpAmountPreset;
    amountInput.dispatchEvent(new Event('input', { bubbles: true }));
  }));
  const maxChoice = wrapper.querySelector('input[name="change_hp_max"]');
  const maxInput = wrapper.querySelector('input[name="hp_max_override"]');
  maxChoice?.addEventListener('change', () => {
    maxInput.disabled = !maxChoice.checked;
    if (maxChoice.checked) {
      maxInput.value = maxInput.value || String(maximum || '');
      maxInput.focus();
      maxInput.select();
    } else {
      maxInput.value = '';
    }
  });
  return wrapper;
}
