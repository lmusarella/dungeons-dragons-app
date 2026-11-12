import { escapeHtml } from '../../../lib/html.js';
import { getSpeciesAsiSources } from '../../dndCatalog/catalogRelations.js';
import { ABILITY_KEYS, ABILITY_LABELS_IT } from '../speciesAsiConfig.js';
import {
  applyAsiDelta,
  buildSpeciesAsiRecord,
  emptyAsi,
  evaluateAsiChoice,
  reconcileAsiChoice,
  resolveSpeciesAsi
} from '../speciesAsiResolver.js';

const KIND_LABELS = {
  fixed: 'Fissi', flexible: 'Flessibili', variant: 'Da variante', inherited: 'Ereditati', special: 'Speciali', unresolved: 'Non risolti'
};

const signed = (value) => `${value >= 0 ? '+' : ''}${value}`;
const summarize = (totals) => ABILITY_KEYS.filter((key) => totals[key]).map((key) => `${ABILITY_LABELS_IT[key]} ${signed(totals[key])}`).join(' · ') || 'nessuno';

/**
 * Pannello degli incrementi di specie. I punteggi nel form restano "finali": il pannello
 * tiene traccia dei bonus già inclusi (`applied`) e applica solo la differenza.
 * I personaggi esistenti senza `species_asi` non vengono modificati finché l'utente non conferma.
 */
export function createSpeciesAsiPanel({ root, form, hiddenInput, initialRecord = null, isExisting = false, tashaCustomOrigin = false }) {
  const state = {
    ready: false,
    sequence: 0,
    managed: Boolean(initialRecord) || !isExisting,
    applied: { ...emptyAsi(), ...(initialRecord?.applied || {}) },
    choice: { optionId: initialRecord?.option_id || null, picks: initialRecord?.picks || [] },
    key: initialRecord ? `${initialRecord.species_id || ''}|${initialRecord.variant_id || ''}|${initialRecord.rules_version || ''}` : null,
    context: null,
    resolution: null,
    evaluation: null
  };

  const abilityInput = (key) => form.querySelector(`[name="ability_${key}"]`);
  const writeAbilities = (next) => {
    ABILITY_KEYS.forEach((key) => {
      const input = abilityInput(key);
      if (!input || String(input.value) === String(next[key] ?? '')) return;
      input.value = next[key] ?? '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  };
  const readAbilities = () => Object.fromEntries(ABILITY_KEYS.map((key) => [key, abilityInput(key)?.value === '' ? null : Number(abilityInput(key)?.value)]));

  const persist = () => {
    if (!state.managed) { hiddenInput.value = ''; return; }
    const { speciesId, variantId } = state.context || {};
    const record = buildSpeciesAsiRecord({ resolution: state.resolution, choice: state.choice, evaluation: state.evaluation, speciesId, variantId, tashaCustomOrigin });
    record.applied = { ...state.applied };
    hiddenInput.value = JSON.stringify(record);
  };

  const sync = () => {
    state.evaluation = evaluateAsiChoice(state.resolution, state.choice);
    if (state.managed) {
      const next = state.evaluation.applied;
      writeAbilities(applyAsiDelta(readAbilities(), state.applied, next));
      state.applied = { ...next };
    }
    persist();
    render();
  };

  const pickSelects = (option) => option.picks.map((pick, pickIndex) => {
    const slots = pick.type === 'weighted' ? pick.weights.length : pick.count;
    const selected = state.choice.picks?.[pickIndex] || [];
    return `<div class="species-asi__pick">${Array.from({ length: slots }, (_, slot) => {
      const bonus = pick.type === 'weighted' ? pick.weights[slot] : pick.amount;
      return `<label><span>${escapeHtml(signed(bonus))}</span><select data-asi-pick="${pickIndex}" data-asi-slot="${slot}"><option value="">Scegli…</option>${pick.from.map((key) => `<option value="${key}" ${selected[slot] === key ? 'selected' : ''}>${escapeHtml(ABILITY_LABELS_IT[key])}</option>`).join('')}</select></label>`;
    }).join('')}</div>`;
  }).join('');

  const render = () => {
    const { resolution, evaluation } = state;
    if (!resolution || resolution.status === 'empty') { root.hidden = true; root.innerHTML = ''; return; }
    root.hidden = false;
    if (resolution.status === 'background') {
      root.innerHTML = `<header><h5>Incrementi di caratteristica</h5></header><p class="species-asi__note">${escapeHtml(resolution.warnings[0])}</p>`;
      return;
    }
    const option = evaluation.option;
    const optionsMarkup = resolution.options.length > 1
      ? `<div class="species-asi__options">${resolution.options.map((entry) => `<label class="toggle-pill"><input type="radio" name="species_asi_option_ui" value="${escapeHtml(entry.id)}" ${option?.id === entry.id ? 'checked' : ''}><span>${escapeHtml(entry.id.startsWith('tasha-') ? `Tasha: ${entry.label}` : entry.label)}</span></label>`).join('')}</div>`
      : '';
    const fixedMarkup = option && Object.keys(option.fixed).length ? `<p class="species-asi__fixed">${escapeHtml(summarize({ ...emptyAsi(), ...option.fixed }))}</p>` : '';
    const errors = [...resolution.warnings, ...evaluation.errors];
    const status = !state.managed ? 'Non applicati' : evaluation.complete ? 'Applicati' : 'Scelta da completare';
    root.innerHTML = `
      <header><h5>Incrementi di caratteristica della specie</h5><span class="species-asi__badge species-asi__badge--${escapeHtml(resolution.kind || 'unresolved')}">${escapeHtml(KIND_LABELS[resolution.kind] || '—')}</span></header>
      ${errors.length ? `<ul class="species-asi__warnings">${errors.map((message) => `<li>${escapeHtml(message)}</li>`).join('')}</ul>` : ''}
      ${optionsMarkup}${fixedMarkup}${option ? pickSelects(option) : ''}
      <footer><span>${escapeHtml(status)}: <strong>${escapeHtml(summarize(state.managed ? state.applied : evaluation.applied))}</strong></span>${!state.managed && resolution.options.length ? `<button type="button" class="ghost" data-asi-apply ${evaluation.complete ? '' : 'disabled'}>Applica ai punteggi attuali</button>` : ''}</footer>`;
  };

  root.addEventListener('change', (event) => {
    const target = event.target;
    if (!state.resolution) return;
    if (target.matches('input[name="species_asi_option_ui"]')) {
      state.choice = reconcileAsiChoice(state.resolution, { optionId: target.value, picks: [] });
      sync();
    } else if (target.matches('[data-asi-pick]')) {
      const option = state.evaluation?.option;
      if (!option) return;
      const picks = option.picks.map((pick, index) => [...root.querySelectorAll(`[data-asi-pick="${index}"]`)].map((select) => select.value));
      state.choice = { optionId: option.id, picks };
      sync();
    }
  });
  root.addEventListener('click', (event) => {
    if (!event.target.closest('[data-asi-apply]')) return;
    state.managed = true;
    sync();
  });

  return {
    setReady() { state.ready = true; },
    async update(context) {
      if (!state.ready) return;
      const sequence = ++state.sequence;
      const { speciesId, variantId, rulesVersion } = context;
      state.context = context;
      if (!speciesId) {
        state.resolution = null;
        state.choice = { optionId: null, picks: [] };
      } else {
        let sources = null;
        try { sources = await getSpeciesAsiSources(speciesId, variantId, rulesVersion); } catch { sources = null; }
        if (sequence !== state.sequence) return;
        if (!sources) {
          root.hidden = false;
          root.innerHTML = '<header><h5>Incrementi di caratteristica della specie</h5></header><p class="species-asi__note">Dati della specie non disponibili: nessun incremento applicato o modificato.</p>';
          return;
        }
        state.resolution = resolveSpeciesAsi({ species: sources.species, variant: sources.variant, variants: sources.variants, copyChain: sources.copyChain, rulesVersion, rules: { tashaCustomOrigin } });
        const key = `${speciesId}|${variantId || ''}|${rulesVersion}`;
        state.choice = reconcileAsiChoice(state.resolution, key === state.key ? state.choice : {});
        state.key = key;
      }
      state.evaluation = evaluateAsiChoice(state.resolution, state.choice);
      if (!speciesId) {
        if (state.managed) { writeAbilities(applyAsiDelta(readAbilities(), state.applied, emptyAsi())); state.applied = emptyAsi(); }
        persist();
        render();
        return;
      }
      sync();
    }
  };
}
