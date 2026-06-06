import { attachNumberStepper, buildInput, buildSelect } from '../../../ui/components.js';
import { damageTypeList } from './constants.js';
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
      const damageTypeField = document.createElement('label');
      damageTypeField.className = 'field hp-shortcut-fields__damage-type';
      const damageTypeLabel = document.createElement('span');
      damageTypeLabel.textContent = 'Tipo di danno';
      const damageTypeSelect = buildSelect([
        { value: '', label: 'Nessun tipo (danno normale)' },
        ...damageTypeList.map((type) => ({ value: type.key, label: type.label }))
      ], '');
      damageTypeSelect.name = 'damage_type';
      damageTypeField.append(damageTypeLabel, damageTypeSelect);
      primaryRow.appendChild(damageTypeField);

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
