import { createCompanion, deleteCompanion, fetchCompanions, updateCompanion } from '../character/companionsApi.js';
import { getState, normalizeCharacterId } from '../../app/state.js';
import { buildInput, buildTextarea, createToast, openConfirmModal, openFormModal, setGlobalLoading, attachNumberSteppers } from '../../ui/components.js';
import { openDiceOverlay } from '../dice-roller/overlay/dice.js';
import { getAbilityModifier } from '../character/home/utils.js';

const ABILITY_KEYS = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
const ABILITY_LABELS = { str: 'FOR', dex: 'DES', con: 'COS', int: 'INT', wis: 'WIS', cha: 'CAR' };
const KIND_OPTIONS = [
  { value: 'familiar', label: 'Famiglio' },
  { value: 'summon', label: 'Evocazione' },
  { value: 'transformation', label: 'Trasformazione' }
];

function formatSigned(value) {
  const n = Number(value) || 0;
  return n >= 0 ? `+${n}` : `${n}`;
}

function getDefaultStatBlock() {
  return {
    abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    hp: { current: 1, max: 1 },
    speeds: { walk: 9, fly: null, climb: null, burrow: null },
    attacks: []
  };
}

function normalizeStatBlock(raw) {
  const base = getDefaultStatBlock();
  const source = raw && typeof raw === 'object' ? raw : {};
  return {
    abilities: { ...base.abilities, ...(source.abilities || {}) },
    hp: { ...base.hp, ...(source.hp || {}) },
    speeds: { ...base.speeds, ...(source.speeds || {}) },
    attacks: Array.isArray(source.attacks) ? source.attacks : []
  };
}

function buildCompanionCard(companion) {
  const statBlock = normalizeStatBlock(companion.stat_block);
  const abilities = ABILITY_KEYS.map((key) => {
    const score = Number(statBlock.abilities?.[key]) || 10;
    const mod = getAbilityModifier(score) ?? 0;
    return `<button class="character-tag" type="button" data-roll-ability="${companion.id}:${key}">${ABILITY_LABELS[key]} ${score} (${formatSigned(mod)})</button>`;
  }).join('');
  const attacks = statBlock.attacks.length
    ? statBlock.attacks.map((attack, index) => `
      <div class="weapon-card">
        <div class="weapon-card__main">
          <strong>${attack.name || `Attacco ${index + 1}`}</strong>
          <p class="muted">Hit ${formatSigned(attack.to_hit || 0)} · Danni ${attack.damage || '-'}</p>
        </div>
        <button class="icon-button icon-button--dice" type="button" data-roll-attack="${companion.id}:${index}">🎲</button>
      </div>
    `).join('')
    : '<p class="muted">Nessun attacco configurato.</p>';

  return `
    <article class="card">
      <header class="card-header">
        <div>
          <p class="eyebrow">${companion.kind}</p>
          <h3>${companion.name}</h3>
        </div>
        <div class="button-row">
          <button class="icon-button" data-edit-companion="${companion.id}" type="button" aria-label="Modifica">✏️</button>
          <button class="icon-button" data-delete-companion="${companion.id}" type="button" aria-label="Elimina">🗑️</button>
        </div>
      </header>
      <div class="tag-row">${abilities}</div>
      <p class="muted">HP ${statBlock.hp.current}/${statBlock.hp.max} · Terra ${statBlock.speeds.walk ?? '-'}m · Volo ${statBlock.speeds.fly ?? '-'}m · Scalata ${statBlock.speeds.climb ?? '-'}m · Scavare ${statBlock.speeds.burrow ?? '-'}m</p>
      <div class="inventory-transactions">${attacks}</div>
    </article>
  `;
}

function openRollWithModifier(label, modifier) {
  openDiceOverlay({
    keepOpen: true,
    title: label,
    mode: 'generic',
    notation: '1d20',
    modifier: Number(modifier) || 0,
    rollType: 'CHECK',
    historyLabel: label
  });
}

export async function renderFamiliars(container) {
  const state = getState();
  const normalizedActiveId = normalizeCharacterId(state.activeCharacterId);
  const activeCharacter = state.characters.find((char) => normalizeCharacterId(char.id) === normalizedActiveId);
  if (!activeCharacter) {
    container.innerHTML = '<section class="card"><p>Nessun personaggio selezionato.</p></section>';
    return;
  }

  setGlobalLoading(true);
  let companions = [];
  try {
    companions = state.offline ? [] : await fetchCompanions(activeCharacter.id);
  } catch {
    createToast('Errore caricamento famigli', 'error');
  } finally {
    setGlobalLoading(false);
  }

  container.innerHTML = `
    <section class="inventory-layout">
      <section class="inventory-main">
        <header class="card-header">
          <p class="eyebrow">Famigli & Mostri</p>
          <div class="button-row">
            <button class="icon-button icon-button--add" type="button" data-add-companion aria-label="Nuova scheda"><span aria-hidden="true">+</span></button>
          </div>
        </header>
        <div class="home-grid">${companions.length ? companions.map(buildCompanionCard).join('') : '<section class="card"><p>Nessuna scheda creata.</p></section>'}</div>
      </section>
    </section>
  `;

  const openCompanionForm = async (companion = null) => {
    const current = normalizeStatBlock(companion?.stat_block);
    const content = document.createElement('div');
    content.className = 'modal-form-grid';
    content.appendChild(buildInput({ label: 'Nome', name: 'name', value: companion?.name || '' }));
    const kindField = document.createElement('label');
    kindField.className = 'field';
    kindField.innerHTML = '<span>Tipologia</span>';
    const kindSelect = document.createElement('select');
    kindSelect.name = 'kind';
    KIND_OPTIONS.forEach((opt) => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.label;
      if ((companion?.kind || 'familiar') === opt.value) option.selected = true;
      kindSelect.appendChild(option);
    });
    kindField.appendChild(kindSelect);
    content.appendChild(kindField);

    const abilityRow = document.createElement('div');
    abilityRow.className = 'modal-form-row modal-form-row--compact';
    ABILITY_KEYS.forEach((key) => {
      const field = buildInput({ label: ABILITY_LABELS[key], name: `ab_${key}`, type: 'number', value: current.abilities[key] ?? 10 });
      abilityRow.appendChild(field);
    });
    content.appendChild(abilityRow);

    content.appendChild(buildInput({ label: 'HP attuali', name: 'hp_current', type: 'number', value: current.hp.current ?? 1 }));
    content.appendChild(buildInput({ label: 'HP massimi', name: 'hp_max', type: 'number', value: current.hp.max ?? 1 }));
    content.appendChild(buildInput({ label: 'Velocità terra (m)', name: 'speed_walk', type: 'number', value: current.speeds.walk ?? 9 }));
    content.appendChild(buildInput({ label: 'Velocità volo (m)', name: 'speed_fly', type: 'number', value: current.speeds.fly ?? '' }));
    content.appendChild(buildInput({ label: 'Velocità scalata (m)', name: 'speed_climb', type: 'number', value: current.speeds.climb ?? '' }));
    content.appendChild(buildInput({ label: 'Velocità scavare (m)', name: 'speed_burrow', type: 'number', value: current.speeds.burrow ?? '' }));
    content.appendChild(buildTextarea({ label: 'Attacchi (JSON)', name: 'attacks_json', value: JSON.stringify(current.attacks || [], null, 2), placeholder: '[{"name":"Morso","to_hit":4,"damage":"1d6+2"}]' }));
    content.appendChild(buildTextarea({ label: 'Note', name: 'notes', value: companion?.notes || '' }));

    attachNumberSteppers(content);

    const formData = await openFormModal({ title: companion ? 'Modifica scheda famiglio' : 'Nuova scheda famiglio', submitLabel: 'Salva', content, cardClass: 'modal-card--form' });
    if (!formData) return;

    const toNumberOrNull = (value) => (value === null || value === '' ? null : Number(value));
    const abilities = ABILITY_KEYS.reduce((acc, key) => {
      acc[key] = Number(formData.get(`ab_${key}`) || 10);
      return acc;
    }, {});

    const payload = {
      user_id: activeCharacter.user_id,
      character_id: activeCharacter.id,
      name: String(formData.get('name') || '').trim(),
      kind: formData.get('kind') || 'familiar',
      rules_version: '2024',
      stat_block: {
        abilities,
        hp: { current: Number(formData.get('hp_current') || 1), max: Number(formData.get('hp_max') || 1) },
        speeds: {
          walk: Number(formData.get('speed_walk') || 0),
          fly: toNumberOrNull(formData.get('speed_fly')),
          climb: toNumberOrNull(formData.get('speed_climb')),
          burrow: toNumberOrNull(formData.get('speed_burrow'))
        },
        attacks: JSON.parse(String(formData.get('attacks_json') || '[]'))
      },
      notes: String(formData.get('notes') || '').trim() || null
    };

    if (!payload.name) {
      createToast('Inserisci un nome', 'error');
      return;
    }

    if (companion) await updateCompanion(companion.id, payload);
    else await createCompanion(payload);
    await renderFamiliars(container);
  };

  container.querySelector('[data-add-companion]')?.addEventListener('click', () => { void openCompanionForm(); });
  container.querySelectorAll('[data-edit-companion]').forEach((btn) => btn.addEventListener('click', () => {
    const companion = companions.find((entry) => entry.id === btn.dataset.editCompanion);
    if (companion) void openCompanionForm(companion);
  }));
  container.querySelectorAll('[data-delete-companion]').forEach((btn) => btn.addEventListener('click', async () => {
    const companion = companions.find((entry) => entry.id === btn.dataset.deleteCompanion);
    if (!companion) return;
    const shouldDelete = await openConfirmModal({ title: 'Conferma eliminazione', message: `Eliminare ${companion.name}?`, confirmLabel: 'Elimina' });
    if (!shouldDelete) return;
    await deleteCompanion(companion.id);
    await renderFamiliars(container);
  }));

  container.querySelectorAll('[data-roll-ability]').forEach((btn) => btn.addEventListener('click', () => {
    const [companionId, abilityKey] = String(btn.dataset.rollAbility || '').split(':');
    const companion = companions.find((entry) => String(entry.id) === companionId);
    if (!companion || !ABILITY_KEYS.includes(abilityKey)) return;
    const score = Number(normalizeStatBlock(companion.stat_block).abilities[abilityKey]) || 10;
    const modifier = getAbilityModifier(score) ?? 0;
    openRollWithModifier(`${companion.name} · ${ABILITY_LABELS[abilityKey]}`, modifier);
  }));
  container.querySelectorAll('[data-roll-attack]').forEach((btn) => btn.addEventListener('click', () => {
    const [companionId, attackIndex] = String(btn.dataset.rollAttack || '').split(':');
    const companion = companions.find((entry) => String(entry.id) === companionId);
    if (!companion) return;
    const attack = normalizeStatBlock(companion.stat_block).attacks[Number(attackIndex) || 0];
    if (!attack) return;
    openRollWithModifier(`${companion.name} · ${attack.name || 'Attacco'}`, Number(attack.to_hit) || 0);
  }));
}
