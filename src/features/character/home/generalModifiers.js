import { attachNumberSteppers, buildInput, openFormModal } from '../../../ui/components.js';
import { saveCharacterData } from './data.js';

const modifierConfigurations = {
  skills: {
    title: 'Modificatore tiri abilità',
    description: 'Questo valore viene sommato a tutte le prove di abilità, comprese quelle speciali.',
    successMessage: 'Modificatore tiri abilità aggiornato',
    fields: [{ key: 'skill_check_bonus', label: 'Bonus generale tiri abilità' }]
  },
  savingThrows: {
    title: 'Modificatore tiri salvezza',
    description: 'Questo valore viene sommato a tutti i tiri salvezza del personaggio.',
    successMessage: 'Modificatore tiri salvezza aggiornato',
    fields: [{ key: 'saving_throw_bonus', label: 'Bonus generale tiri salvezza' }]
  },
  damage: {
    title: 'Bonus generali ai danni',
    description: 'I due valori vengono applicati automaticamente ai danni degli attacchi in mischia o a distanza.',
    successMessage: 'Bonus generali ai danni aggiornati',
    fields: [
      { key: 'damage_bonus_melee', label: 'Bonus danni in mischia', legacyKey: 'damage_bonus' },
      { key: 'damage_bonus_ranged', label: 'Bonus danni a distanza', legacyKey: 'damage_bonus' }
    ]
  }
};

export async function openGeneralModifierEditor(character, kind, onRender, { present = openFormModal } = {}) {
  const configuration = modifierConfigurations[kind];
  if (!character || !configuration) return;
  const data = character.data || {};
  const content = document.createElement('div');
  content.className = `general-modifier-editor general-modifier-editor--${kind}`;
  const intro = document.createElement('div');
  intro.className = 'general-modifier-editor__intro';
  intro.innerHTML = `<span aria-hidden="true">✦</span><p>${configuration.description}</p>`;
  const fields = document.createElement('div');
  fields.className = 'general-modifier-editor__fields';
  configuration.fields.forEach((field) => {
    const currentValue = data[field.key] ?? (field.legacyKey ? data[field.legacyKey] : null) ?? 0;
    fields.appendChild(buildInput({ label: field.label, name: field.key, type: 'number', value: currentValue }));
  });
  content.append(intro, fields);

  const formData = await present({
    title: configuration.title,
    submitLabel: 'Salva',
    cancelLabel: 'Annulla',
    content,
    cardClass: ['modal-card--form', 'modal-card--general-modifier'],
    onOpen: ({ fieldsEl }) => attachNumberSteppers(fieldsEl || content)
  });
  if (!formData) return;

  const nextData = { ...data };
  configuration.fields.forEach((field) => {
    const value = Number(formData.get(field.key));
    nextData[field.key] = Number.isFinite(value) ? value : 0;
  });
  await saveCharacterData(character, nextData, configuration.successMessage, onRender);
}
