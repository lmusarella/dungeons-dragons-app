import { navigate } from '../../app/router.js';
import { getState, setActiveCharacter, setState } from '../../app/state.js';
import { cacheSnapshot } from '../../lib/offline/cache.js';
import { escapeHtml, sanitizeImageUrl } from '../../lib/html.js';
import { createToast, setGlobalLoading } from '../../ui/components.js';
import { createCharacter } from '../character/characterApi.js';
import { ABILITY_KEYS, ABILITY_LABELS_IT } from '../character/speciesAsiConfig.js';
import { abilityModifier } from '../character/resourceFormula.js';
import { skillList } from '../character/home/constants.js';
import {
  buildSpeciesAsiRecord, emptyAsi, evaluateAsiChoice, reconcileAsiChoice, resolveBackgroundAsi, resolveSpeciesAsi
} from '../character/speciesAsiResolver.js';
import { getClassDetails, getClassFeatureLevels, getSpeciesAsiSources } from '../dndCatalog/catalogRelations.js';
import { catalogDescription, catalogName, catalogSourceLabel } from '../dndCatalog/catalogLocale.js';
import { loadBackgroundRecord, loadBuilderOptions } from './builderData.js';
import {
  STANDARD_ARRAY, POINT_BUY_BUDGET, POINT_BUY_COST, POINT_BUY_MAX, POINT_BUY_MIN,
  asiLevelsFromFeatures, asiPointsForLevel, asiRemaining, buildCharacterPayload, canAddAsi, canIncreasePointBuy,
  computeAbilityTotals, defaultBaseScores, extractBackgroundSkills, extractClassSaves, extractClassSkills, parseHitDie,
  pointBuySpent, resolveBaseScores, resolveSkillSelection, validateBaseScores
} from './builderRules.js';
import { getSharedItemsByIds, listSharedItemsByCategories } from '../library/itemLibraryApi.js';
import { openEquipmentItemDetail } from '../character/home/itemDetail.js';
import { applyStartingEquipmentOnce, buildStartingEquipmentRecord, fetchStartingEquipment } from '../startingEquipment/startingEquipmentApi.js';
import { averageGoldFromFormula, categoryFilter, categoryOptions, entryEquipmentType, formatCoins, resolveEquipment } from '../startingEquipment/startingEquipmentModel.js';
import { bindBundleItems, renderBundleSection } from '../startingEquipment/bundleView.js';
import { entryLabel } from '../startingEquipment/startingEquipmentView.js';
import './characterBuilder.css';

const STEPS = [
  { key: 'version', label: 'Regole' },
  { key: 'class', label: 'Nome e classe' },
  { key: 'subclass', label: 'Sottoclasse' },
  { key: 'species', label: 'Specie' },
  { key: 'background', label: 'Background' },
  { key: 'abilities', label: 'Caratteristiche' },
  { key: 'skills', label: 'Competenze' },
  { key: 'equipment', label: 'Equipaggiamento' },
  { key: 'summary', label: 'Riepilogo' }
];

const skillLabel = (key) => skillList.find((skill) => skill.key === key)?.label || key;
const cleanText = (value) => String(value || '').replace(/\{@\w+\s+([^|}]*)[^}]*\}/g, '$1').replace(/\s+/g, ' ').trim();
const signed = (value) => `${value >= 0 ? '+' : ''}${value}`;

function createState() {
  return {
    step: 0, maxStep: 0, loading: false, version: null, name: '', level: 1,
    options: null, classId: null, classDetails: null, asiLevels: { levels: [], fromCatalog: false }, subclass: null,
    speciesId: null, variantId: null, speciesSources: null, speciesChoice: { optionId: null, picks: [] },
    background: null, backgroundId: null, backgroundChoice: { optionId: null, picks: [] },
    abilities: { mode: 'pointbuy', pointBuy: defaultBaseScores(), standard: {}, manual: Object.fromEntries(ABILITY_KEYS.map((key) => [key, 10])) },
    asi: {}, classPicks: [], backgroundPicks: [], filter: '', sources: null, availableSources: [],
    equipment: { key: null, sources: [], items: [], error: false, selection: { alternatives: {}, categoryPicks: {}, goldAlt: {}, acknowledged: {} } }
  };
}

export async function renderCharacterBuilder(container) {
  const state = createState();
  const { user } = getState();
  container.innerHTML = '<section class="cb"><header class="cb__header"><div><small>Creazione guidata</small><h1>Nuovo personaggio</h1></div><button type="button" class="cb__ghost" data-cb-cancel>Annulla</button></header><nav class="cb__steps" data-cb-steps></nav><div class="cb__body" data-cb-body></div><footer class="cb__footer"><button type="button" class="cb__ghost" data-cb-back>← Indietro</button><span class="cb__hint" data-cb-hint></span><button type="button" class="cb__primary" data-cb-next>Avanti →</button></footer></section>';
  const body = container.querySelector('[data-cb-body]');
  const stepsNav = container.querySelector('[data-cb-steps]');
  const hint = container.querySelector('[data-cb-hint]');
  const nextButton = container.querySelector('[data-cb-next]');
  const backButton = container.querySelector('[data-cb-back]');

  const derived = () => {
    const speciesResolution = state.speciesSources
      ? resolveSpeciesAsi({ species: state.speciesSources.species, variant: state.speciesSources.variant, variants: state.speciesSources.variants, copyChain: state.speciesSources.copyChain, rulesVersion: state.version })
      : null;
    const backgroundResolution = resolveBackgroundAsi({ background: state.background, rulesVersion: state.version });
    const speciesEval = speciesResolution ? evaluateAsiChoice(speciesResolution, state.speciesChoice) : null;
    const backgroundEval = evaluateAsiChoice(backgroundResolution, state.backgroundChoice);
    const base = resolveBaseScores(state.abilities);
    const totals = computeAbilityTotals({ base, species: speciesEval?.applied || emptyAsi(), background: backgroundEval.applied, asi: state.asi });
    const classSkills = state.classDetails ? extractClassSkills(state.classDetails) : { fixed: [], choices: [] };
    const backgroundSkills = state.background ? extractBackgroundSkills(state.background) : { fixed: [], choices: [] };
    const skillSelection = resolveSkillSelection({ classSkills, backgroundSkills, classPicks: state.classPicks, backgroundPicks: state.backgroundPicks });
    const asiPoints = asiPointsForLevel(state.asiLevels.levels, state.level);
    return { speciesResolution, backgroundResolution, speciesEval, backgroundEval, base, totals, classSkills, backgroundSkills, skillSelection, asiPoints };
  };

  const subclassAvailable = () => Boolean(state.classDetails?.subclasses?.length) && state.level >= (state.classDetails.subclass_selection_level || 1);

  const validate = (key) => {
    const data = derived();
    switch (key) {
      case 'version': return state.version ? null : 'Scegli la versione delle regole.';
      case 'class':
        if (!state.name.trim()) return 'Inserisci il nome del personaggio.';
        if (!(state.level >= 1 && state.level <= 20)) return 'Il livello deve essere tra 1 e 20.';
        return state.classId ? null : 'Scegli una classe.';
      case 'subclass': return !subclassAvailable() || state.subclass ? null : 'Scegli una sottoclasse.';
      case 'species': return state.speciesId ? null : 'Scegli una specie.';
      case 'abilities': {
        const base = validateBaseScores(state.abilities);
        if (!base.valid) return base.errors[0] || 'Completa la distribuzione dei punteggi.';
        if (data.speciesResolution?.options.length && !data.speciesEval.complete) return 'Completa gli incrementi di caratteristica della specie.';
        return null;
      }
      case 'background':
        if (!state.backgroundId) return 'Scegli un background.';
        if (data.backgroundResolution.options.length && !data.backgroundEval.complete) return 'Completa gli incrementi di caratteristica del background.';
        return null;
      case 'skills': return data.skillSelection.complete ? null : 'Completa le scelte di competenza.';
      case 'equipment': return resolveEquipment(state.equipment.sources, state.equipment.selection).complete ? null : 'Completa le scelte dell’equipaggiamento iniziale.';
      default: return null;
    }
  };

  const sourceAllowed = (row) => !state.sources || !row.source || state.sources.has(String(row.source));
  const optionList = (key) => (state.options?.[key] || []).filter(sourceAllowed);
  const manualOf = (row) => (row.source ? catalogSourceLabel(row.source) : '');

  const card = ({ id, title, sub, desc, image, selected, attr, source = '', size = '' }) => {
    const src = sanitizeImageUrl(image);
    return `<button type="button" class="cb-card ${selected ? 'is-selected' : ''}" ${attr}="${escapeHtml(id)}" data-cb-filter-text="${escapeHtml(String(title).toLowerCase())}" data-cb-source="${escapeHtml(String(source))}" data-cb-size="${escapeHtml(String(size))}">
      <span class="cb-card__media">${src ? `<img src="${src}" alt="">` : `<b aria-hidden="true">${escapeHtml(String(title).slice(0, 1))}</b>`}</span>
      <span class="cb-card__body"><strong>${escapeHtml(title)}</strong>${sub ? `<small>${escapeHtml(sub)}</small>` : ''}${desc ? `<em>${escapeHtml(desc)}</em>` : ''}</span>
    </button>`;
  };
  const descriptionOf = (row) => cleanText(catalogDescription(row)).slice(0, 140);
  const filterBox = () => '<label class="cb-filter"><span>Cerca</span><input type="search" data-cb-filter placeholder="Filtra per nome…"></label>';

  const asiEditor = (scope, resolution, choice, evaluation, title) => {
    if (!resolution || resolution.status === 'empty') return '';
    if (resolution.status === 'background') return '';
    if (resolution.status === 'not-applicable') return '';
    const option = evaluation.option;
    const radios = resolution.options.length > 1
      ? `<div class="cb-options">${resolution.options.map((entry) => `<label class="cb-pill"><input type="radio" name="cb-asi-${scope}" data-cb-asi-option="${scope}" value="${escapeHtml(entry.id)}" ${option?.id === entry.id ? 'checked' : ''}><span>${escapeHtml(entry.label)}</span></label>`).join('')}</div>` : '';
    const fixed = option && Object.keys(option.fixed).length ? `<p class="cb-note">${Object.entries(option.fixed).map(([key, value]) => `${ABILITY_LABELS_IT[key]} ${signed(value)}`).join(' · ')}</p>` : '';
    const picks = option ? option.picks.map((pick, pickIndex) => {
      const slots = pick.type === 'weighted' ? pick.weights.length : pick.count;
      const selected = choice.picks?.[pickIndex] || [];
      return `<div class="cb-picks">${Array.from({ length: slots }, (_, slot) => `<label><span>${signed(pick.type === 'weighted' ? pick.weights[slot] : pick.amount)}</span><select data-cb-asi-pick="${scope}" data-pick="${pickIndex}" data-slot="${slot}"><option value="">Scegli…</option>${pick.from.map((key) => `<option value="${key}" ${selected[slot] === key ? 'selected' : ''}>${ABILITY_LABELS_IT[key]}</option>`).join('')}</select></label>`).join('')}</div>`;
    }).join('') : '';
    const messages = [...resolution.warnings, ...evaluation.errors];
    return `<section class="cb-panel"><header><h3>${escapeHtml(title)}</h3></header>${messages.length ? `<ul class="cb-warnings">${messages.map((text) => `<li>${escapeHtml(text)}</li>`).join('')}</ul>` : ''}${radios}${fixed}${picks}</section>`;
  };

  const renderers = {
    version: () => `<div class="cb-intro"><h2>Quale versione delle regole?</h2><p>Classi, specie e background vengono caricati dal catalogo della versione scelta. Cambiarla in seguito azzera le scelte.</p></div>
      <div class="cb-grid cb-grid--two">${['2014', '2024'].map((version) => card({ id: version, title: `D&D ${version}`, sub: version === '2014' ? 'Manuale del Giocatore 2014' : 'Manuale del Giocatore 2024', desc: version === '2014' ? 'Incrementi di caratteristica dalla specie.' : 'Incrementi di caratteristica dal background.', selected: state.version === version, attr: 'data-cb-version' })).join('')}</div>`,

    class: () => `<div class="cb-intro"><h2>Nome e classe</h2></div>
      <div class="cb-row"><label class="cb-field"><span>Nome del personaggio</span><input data-cb-name value="${escapeHtml(state.name)}" placeholder="Es. Aria Lunargento" autocomplete="off"></label>
      <div class="cb-field cb-field--small"><span>Livello di classe</span><span class="cb-stepper cb-stepper--level"><button type="button" data-cb-level-step="-1" ${state.level <= 1 ? 'disabled' : ''} aria-label="Diminuisci livello">−</button><input type="number" data-cb-level min="1" max="20" value="${state.level}"><button type="button" data-cb-level-step="1" ${state.level >= 20 ? 'disabled' : ''} aria-label="Aumenta livello">+</button></span></div></div>
      <div class="cb-grid">${optionList('classes').map((row) => card({ id: row.id, title: catalogName(row), sub: manualOf(row), source: row.source, desc: descriptionOf(row), image: row.image_url, selected: state.classId === row.id, attr: 'data-cb-class' })).join('') || '<p class="cb-empty">Nessuna classe disponibile per questa versione.</p>'}</div>`,

    subclass: () => {
      if (!state.classDetails) return '<p class="cb-empty">Scegli prima una classe.</p>';
      const level = state.classDetails.subclass_selection_level || 1;
      if (!state.classDetails.subclasses?.length) return '<div class="cb-intro"><h2>Sottoclasse</h2><p>Questa classe non ha sottoclassi nel catalogo.</p></div>';
      if (state.level < level) return `<div class="cb-intro"><h2>Sottoclasse</h2><p>La sottoclasse si sceglie dal livello ${level}. Il tuo personaggio è di livello ${state.level}: potrai sceglierla in seguito.</p></div>`;
      return `<div class="cb-intro"><h2>Sottoclasse di ${escapeHtml(catalogName(state.classDetails))}</h2></div><div class="cb-grid">${state.classDetails.subclasses.filter(sourceAllowed).map((row) => card({ id: row.id, title: catalogName(row), sub: manualOf(row), desc: descriptionOf(row), image: row.image_url, selected: state.subclass?.id === row.id, attr: 'data-cb-subclass' })).join('')}</div>`;
    },

    species: () => {
      const variants = state.speciesSources?.variants || [];
      const species = optionList('species');
      const sizes = [...new Set(species.map((row) => row.size).filter(Boolean))].sort();
      const manuals = [...new Set(species.map((row) => row.source).filter(Boolean))].sort();
      const variantPanel = variants.length ? `<section class="cb-panel cb-panel--variant" data-cb-variant-panel><header><h3>Sottorazza di ${escapeHtml(catalogName(state.speciesSources.species))}</h3><small>Facoltativa</small></header><div class="cb-grid">${card({ id: '', title: 'Nessuna sottorazza', selected: !state.variantId, attr: 'data-cb-variant' })}${variants.map((row) => card({ id: row.id, title: catalogName(row), sub: manualOf(row), desc: descriptionOf(row), selected: state.variantId === row.id, attr: 'data-cb-variant' })).join('')}</div></section>` : '';
      return `<div class="cb-intro"><h2>Scegli la specie</h2></div>${variantPanel}
      <div class="cb-filters">${filterBox()}
        <label class="cb-filter"><span>Manuale</span><select data-cb-filter-source><option value="">Tutti</option>${manuals.map((code) => `<option value="${escapeHtml(code)}">${escapeHtml(catalogSourceLabel(code))}</option>`).join('')}</select></label>
        <label class="cb-filter"><span>Taglia</span><select data-cb-filter-size><option value="">Tutte</option>${sizes.map((size) => `<option value="${escapeHtml(size)}">${escapeHtml(size)}</option>`).join('')}</select></label></div>
      <div class="cb-grid" data-cb-cards>${species.map((row) => card({ id: row.id, title: catalogName(row), sub: [manualOf(row), row.size, Number(row.speed) ? `${Math.round(Number(row.speed) * 0.3 * 10) / 10} m` : ''].filter(Boolean).join(' · '), source: row.source, size: row.size, desc: descriptionOf(row), image: row.image_url, selected: state.speciesId === row.id, attr: 'data-cb-species' })).join('') || '<p class="cb-empty">Nessuna specie disponibile per questa versione.</p>'}</div>`;
    },

    abilities: () => {
      const data = derived();
      const abilityState = state.abilities;
      const baseCheck = validateBaseScores(abilityState);
      const remainingPoints = POINT_BUY_BUDGET - pointBuySpent(abilityState.pointBuy);
      const remainingAsi = asiRemaining(data.asiPoints, state.asi);
      const used = new Set(ABILITY_KEYS.map((key) => Number(abilityState.standard[key])).filter(Boolean));
      const control = (key) => {
        if (abilityState.mode === 'pointbuy') {
          const value = abilityState.pointBuy[key];
          return `<span class="cb-stepper"><button type="button" data-cb-pb="${key}" data-dir="-1" ${value <= POINT_BUY_MIN ? 'disabled' : ''}>−</button><b>${value}</b><button type="button" data-cb-pb="${key}" data-dir="1" ${canIncreasePointBuy(abilityState.pointBuy, key) ? '' : 'disabled'}>+</button><small>costo ${POINT_BUY_COST[value]}</small></span>`;
        }
        if (abilityState.mode === 'standard') {
          return `<select data-cb-std="${key}"><option value="">—</option>${STANDARD_ARRAY.map((value) => `<option value="${value}" ${Number(abilityState.standard[key]) === value ? 'selected' : ''} ${used.has(value) && Number(abilityState.standard[key]) !== value ? 'disabled' : ''}>${value}</option>`).join('')}</select>`;
        }
        return `<input type="number" min="3" max="18" data-cb-manual="${key}" value="${abilityState.manual[key]}">`;
      };
      const rows = ABILITY_KEYS.map((key) => {
        const final = data.totals.final[key];
        const asi = state.asi[key] || 0;
        return `<tr><th>${ABILITY_LABELS_IT[key]}</th><td>${control(key)}</td><td>${data.speciesEval?.applied[key] ? signed(data.speciesEval.applied[key]) : '—'}</td><td>${data.backgroundEval.applied[key] ? signed(data.backgroundEval.applied[key]) : '—'}</td>
          <td>${data.asiPoints ? `<span class="cb-stepper cb-stepper--small"><button type="button" data-cb-asi="${key}" data-dir="-1" ${asi <= 0 ? 'disabled' : ''}>−</button><b>${asi}</b><button type="button" data-cb-asi="${key}" data-dir="1" ${canAddAsi(data.asiPoints, state.asi, data.totals.preAsi, key) ? '' : 'disabled'}>+</button></span>` : '—'}</td>
          <td><strong class="cb-total">${final || '—'}</strong> <small>${final ? signed(abilityModifier(final)) : ''}</small></td></tr>`;
      }).join('');
      return `<div class="cb-intro"><h2>Punteggi di caratteristica</h2></div>
        <div class="cb-tabs">${[['pointbuy', 'Point buy'], ['standard', 'Standard array'], ['manual', 'Manuale']].map(([mode, label]) => `<button type="button" class="${abilityState.mode === mode ? 'is-active' : ''}" data-cb-mode="${mode}">${label}</button>`).join('')}</div>
        <div class="cb-chips">${abilityState.mode === 'pointbuy' ? `<span class="cb-chip">Punti: <b>${remainingPoints}</b> / ${POINT_BUY_BUDGET}</span>` : ''}${abilityState.mode === 'standard' ? `<span class="cb-chip">Valori: ${STANDARD_ARRAY.join(', ')}</span>` : ''}${data.asiPoints ? `<span class="cb-chip cb-chip--accent">Aumenti di classe: <b>${remainingAsi}</b> / ${data.asiPoints}</span>` : ''}${state.asiLevels.fromCatalog ? '' : '<span class="cb-chip cb-chip--muted">Livelli di aumento standard</span>'}</div>
        ${baseCheck.errors?.length && abilityState.mode !== 'standard' ? `<ul class="cb-warnings">${baseCheck.errors.map((text) => `<li>${escapeHtml(text)}</li>`).join('')}</ul>` : ''}
        <div class="cb-table-wrap"><table class="cb-table"><thead><tr><th>Caratteristica</th><th>Base</th><th>Specie</th><th>Background</th><th>Classe</th><th>Totale</th></tr></thead><tbody>${rows}</tbody></table></div>
        ${data.asiPoints && remainingAsi > 0 ? `<p class="cb-note">Hai ancora ${remainingAsi} punti di aumento di classe da assegnare (massimo ${20} per caratteristica).</p>` : ''}
        ${asiEditor('species', data.speciesResolution, state.speciesChoice, data.speciesEval || { errors: [], option: null }, 'Incrementi della specie')}
        ${state.version === '2024' && data.backgroundResolution.options.length ? '<p class="cb-note">Nelle regole 2024 gli incrementi di caratteristica del background si modificano tornando al passo Background.</p>' : ''}`;
    },

    background: () => {
      const data = derived();
      return `<div class="cb-intro"><h2>Scegli il background</h2></div><div class="cb-filters">${filterBox()}<label class="cb-filter"><span>Manuale</span><select data-cb-filter-source><option value="">Tutti</option>${[...new Set(optionList('backgrounds').map((row) => row.source).filter(Boolean))].sort().map((code) => `<option value="${escapeHtml(code)}">${escapeHtml(catalogSourceLabel(code))}</option>`).join('')}</select></label></div>
      <div class="cb-grid" data-cb-cards>${optionList('backgrounds').map((row) => card({ id: row.id, title: catalogName(row), sub: manualOf(row), source: row.source, desc: descriptionOf(row), image: row.image_url, selected: state.backgroundId === row.id, attr: 'data-cb-background' })).join('') || '<p class="cb-empty">Nessun background disponibile per questa versione.</p>'}</div>
      ${asiEditor('background', data.backgroundResolution, state.backgroundChoice, data.backgroundEval, 'Incrementi del background')}`;
    },

    skills: () => {
      const data = derived();
      const saves = state.classDetails ? extractClassSaves(state.classDetails) : [];
      const taken = new Set(data.skillSelection.selected);
      const group = (title, choices, picksKey, source) => choices.map((choice, index) => {
        const picks = state[picksKey][index] || [];
        return `<section class="cb-panel"><header><h3>${escapeHtml(title)}</h3><small>${picks.length}/${choice.count} scelte</small></header><div class="cb-chips cb-chips--select">${choice.from.map((key) => {
          const checked = picks.includes(key);
          const locked = !checked && (taken.has(key) || picks.length >= choice.count);
          return `<label class="cb-pill ${locked ? 'is-locked' : ''}"><input type="checkbox" data-cb-skill="${source}" data-index="${index}" value="${key}" ${checked ? 'checked' : ''} ${locked ? 'disabled' : ''}><span>${escapeHtml(skillLabel(key))}</span></label>`;
        }).join('')}</div></section>`;
      }).join('');
      return `<div class="cb-intro"><h2>Competenze</h2><p>Le competenze imposte da classe e background sono già assegnate; scegli le restanti dai gruppi indicati.</p></div>
        <section class="cb-panel"><header><h3>Già assegnate</h3></header><div class="cb-chips">${saves.map((key) => `<span class="cb-chip cb-chip--save">TS ${ABILITY_LABELS_IT[key]}</span>`).join('')}${data.skillSelection.fixed.map((key) => `<span class="cb-chip cb-chip--skill">${escapeHtml(skillLabel(key))}</span>`).join('') || (saves.length ? '' : '<span class="cb-empty">Nessuna</span>')}</div></section>
        ${group('Dalla classe', data.classSkills.choices, 'classPicks', 'class')}${group('Dal background', data.backgroundSkills.choices, 'backgroundPicks', 'background')}
        ${!data.classSkills.choices.length && !data.backgroundSkills.choices.length ? '<p class="cb-note">Nessuna scelta di competenza richiesta dai dati del catalogo.</p>' : ''}
        ${data.skillSelection.errors.length ? `<ul class="cb-warnings">${[...new Set(data.skillSelection.errors)].map((text) => `<li>${escapeHtml(text)}</li>`).join('')}</ul>` : ''}`;
    },

    equipment: () => {
      const eq = state.equipment;
      const resolution = resolveEquipment(eq.sources, eq.selection);
      const itemName = (item) => item.name_it || item.name || 'Oggetto';
      const itemById = (id) => eq.items.find((item) => String(item.id) === String(id));
      const ackBox = (entry) => `<label class="cb-pill"><input type="checkbox" data-cb-eq-ack="${escapeHtml(entry.entryId)}" ${eq.selection.acknowledged[entry.entryId] ? 'checked' : ''}><span>Aggiungerò manualmente</span></label>`;
      const entryControl = (entry) => {
        if (entry.kind === 'item') {
          const button = `<button type="button" class="cb-chip cb-chip--skill cb-eq-item" data-cb-eq-item="${escapeHtml(entry.itemId)}">${escapeHtml(entryLabel(entry))}</button>`;
          return entry.bundle?.length ? `<div class="seq-pack">${button}${renderBundleSection(entry.bundle)}</div>` : button;
        }
        if (entry.kind === 'currency') return `<span class="cb-chip">${escapeHtml(entryLabel(entry))}</span>`;
        if (entry.kind === 'category') {
          const options = categoryOptions(entryEquipmentType(entry), eq.items);
          const picked = eq.selection.categoryPicks[entry.entryId] || '';
          if (!options.supported || !options.items.length) {
            return `<span class="cb-chip cb-chip--warn">${escapeHtml(entryLabel(entry))}: nessun oggetto selezionabile nel catalogo</span>${ackBox(entry)}`;
          }
          return `<label class="cb-eq-pick"><span>${escapeHtml(entryLabel(entry))}${options.approximate ? ' (filtro approssimato)' : ''}</span><select data-cb-eq-pick="${escapeHtml(entry.entryId)}"><option value="">Scegli…</option>${options.items.map((item) => `<option value="${escapeHtml(item.id)}" ${String(item.id) === picked ? 'selected' : ''}>${escapeHtml(itemName(item))}</option>`).join('')}</select></label>`;
        }
        const label = { missing: 'non ancora presente nel catalogo', ambiguous: 'corrispondenza non confermata', structured: 'voce speciale da gestire', unresolved: 'non risolta' }[entry.kind] || 'non risolta';
        return `<span class="cb-chip cb-chip--warn">${escapeHtml(entryLabel(entry))}: ${label}</span>${ackBox(entry)}`;
      };
      const groupHtml = (group) => {
        if (group.isChoice && group.options.length > 1) {
          return `<div class="cb-eq-group"><small>Scegli una opzione</small>${group.options.map((option) => `<label class="cb-eq-option ${eq.selection.alternatives[group.groupId] === option.optionId ? 'is-selected' : ''}"><input type="radio" name="cb-eq-${escapeHtml(group.groupId)}" data-cb-eq-alt="${escapeHtml(group.groupId)}" value="${escapeHtml(option.optionId)}" ${eq.selection.alternatives[group.groupId] === option.optionId ? 'checked' : ''}><b>${escapeHtml(option.code.toUpperCase() || '•')}</b><span class="cb-eq-entries">${option.entries.map(entryControl).join('')}</span></label>`).join('')}</div>`;
        }
        const entries = group.options.flatMap((option) => option.entries);
        return entries.length ? `<div class="cb-eq-group"><small>Sempre inclusi</small><div class="cb-eq-entries">${entries.map(entryControl).join('')}</div></div>` : '';
      };
      const sourceHtml = (source) => {
        const gold = eq.selection.goldAlt[source.sourceId];
        const goldOn = gold !== undefined && gold !== null;
        const average = averageGoldFromFormula(source.goldAlternative);
        const goldBlock = source.goldAlternative ? `<div class="cb-eq-gold"><label class="cb-pill"><input type="checkbox" data-cb-eq-gold="${escapeHtml(source.sourceId)}" ${goldOn ? 'checked' : ''}><span>Usa l’alternativa in denaro (${escapeHtml(source.goldAlternative)} mo)</span></label>${goldOn ? `<label class="cb-eq-pick"><span>Monete d’oro</span><input type="number" min="0" data-cb-eq-gold-amount="${escapeHtml(source.sourceId)}" value="${gold}"></label>${average ? `<button type="button" class="cb__ghost" data-cb-eq-gold-avg="${escapeHtml(source.sourceId)}" data-avg="${average}">Usa la media (${average})</button>` : ''}` : ''}</div>` : '';
        return `<section class="cb-panel"><header><h3>${source.type === 'class' ? 'Classe' : 'Background'}: ${escapeHtml(source.ownerName)}</h3></header>${goldBlock}${goldOn ? '<p class="cb-note">Scegliendo il denaro rinunci all’equipaggiamento di questa sorgente.</p>' : source.groups.map(groupHtml).join('') || '<p class="cb-empty">Nessun oggetto previsto.</p>'}</section>`;
      };
      const finalItems = resolution.items.map((entry) => `<span class="cb-chip cb-chip--skill">${escapeHtml(itemById(entry.sharedItemId) ? itemName(itemById(entry.sharedItemId)) : 'Oggetto')}${entry.quantity > 1 ? ` ×${entry.quantity}` : ''}</span>`).join('');
      return `<div class="cb-intro"><h2>Equipaggiamento iniziale</h2><p>Scegli le alternative previste da classe e background. Gli oggetti verranno aggiunti all’inventario senza essere equipaggiati.</p></div>
        ${eq.error ? `<p class="cb-warnings">Dotazione iniziale non disponibile dal catalogo${typeof eq.error === 'string' ? ` (${escapeHtml(eq.error)})` : ''}: potrai aggiungere gli oggetti dall’inventario.</p>` : ''}
        ${eq.sources.map(sourceHtml).join('') || (eq.error ? '' : '<p class="cb-empty">Nessuna dotazione iniziale nel catalogo per questa classe o background.</p>')}
        <section class="cb-panel"><header><h3>Dotazione finale</h3><small>${resolution.coinsCp ? escapeHtml(formatCoins(resolution.coinsCp)) : ''}</small></header><div class="cb-chips">${finalItems || '<span class="cb-empty">Nessun oggetto ancora selezionato</span>'}</div>${resolution.skipped.length ? `<p class="cb-note">Da gestire manualmente: ${resolution.skipped.map((entry) => escapeHtml(entry.label)).join(', ')}</p>` : ''}</section>`;
    },

    summary: () => {
      const data = derived();
      const rows = ABILITY_KEYS.map((key) => `<div><small>${ABILITY_LABELS_IT[key]}</small><strong>${data.totals.final[key]}</strong><em>${signed(abilityModifier(data.totals.final[key]))}</em></div>`).join('');
      const hitDie = parseHitDie(state.classDetails);
      return `<div class="cb-intro"><h2>Riepilogo</h2><p>Controlla le scelte: potrai modificare ogni dettaglio dalla scheda del personaggio.</p></div>
        <section class="cb-panel"><dl class="cb-summary"><div><dt>Nome</dt><dd>${escapeHtml(state.name)}</dd></div><div><dt>Regole</dt><dd>D&amp;D ${state.version}</dd></div><div><dt>Classe</dt><dd>${escapeHtml(catalogName(state.classDetails))} ${state.level}${state.subclass ? ` · ${escapeHtml(catalogName(state.subclass))}` : ''}</dd></div><div><dt>Specie</dt><dd>${escapeHtml(catalogName(state.speciesSources?.species))}${state.speciesSources?.variant ? ` (${escapeHtml(catalogName(state.speciesSources.variant))})` : ''}</dd></div><div><dt>Background</dt><dd>${escapeHtml(catalogName(state.background))}</dd></div>${hitDie ? `<div><dt>Dado vita</dt><dd>d${hitDie}</dd></div>` : ''}</dl></section>
        <section class="cb-panel"><header><h3>Caratteristiche</h3></header><div class="cb-scores">${rows}</div></section>
        <section class="cb-panel"><header><h3>Competenze</h3></header><div class="cb-chips">${data.skillSelection.selected.map((key) => `<span class="cb-chip cb-chip--skill">${escapeHtml(skillLabel(key))}</span>`).join('') || '<span class="cb-empty">Nessuna</span>'}</div></section>
        ${(() => {
    const resolution = resolveEquipment(state.equipment.sources, state.equipment.selection);
    const nameOf = (id) => { const item = state.equipment.items.find((entry) => String(entry.id) === String(id)); return item ? (item.name_it || item.name) : 'Oggetto'; };
    return `<section class="cb-panel"><header><h3>Equipaggiamento</h3><small>${resolution.coinsCp ? escapeHtml(formatCoins(resolution.coinsCp)) : ''}</small></header><div class="cb-chips">${resolution.items.map((entry) => `<span class="cb-chip cb-chip--skill">${escapeHtml(nameOf(entry.sharedItemId))}${entry.quantity > 1 ? ` ×${entry.quantity}` : ''}</span>`).join('') || '<span class="cb-empty">Nessuno</span>'}</div></section>`;
  })()}
        ${data.asiPoints && asiRemaining(data.asiPoints, state.asi) > 0 ? `<p class="cb-warnings">Hai ancora ${asiRemaining(data.asiPoints, state.asi)} punti di aumento di classe non assegnati.</p>` : ''}`;
    }
  };

  const render = () => {
    const key = STEPS[state.step].key;
    const error = validate(key);
    stepsNav.innerHTML = STEPS.map((step, index) => `<button type="button" class="${index === state.step ? 'is-active' : ''} ${index < state.step || index <= state.maxStep ? 'is-done' : ''}" data-cb-go="${index}" ${index > state.maxStep ? 'disabled' : ''}><b>${index + 1}</b><span>${step.label}</span></button>`).join('');
    body.innerHTML = renderers[key]();
    const last = state.step === STEPS.length - 1;
    backButton.disabled = state.step === 0;
    nextButton.textContent = last ? 'Crea personaggio' : 'Avanti →';
    nextButton.disabled = state.loading || Boolean(error);
    hint.textContent = state.loading ? '' : error || '';
    bindBody(key);
  };

  const busy = async (task) => {
    state.loading = true;
    nextButton.disabled = true;
    backButton.disabled = true;
    setGlobalLoading(true);
    try { await task(); } catch (error) { createToast(error?.message || 'Operazione non riuscita', 'error'); } finally { setGlobalLoading(false); state.loading = false; render(); }
  };

  const resetFromVersion = () => {
    Object.assign(state, { options: null, classId: null, classDetails: null, asiLevels: { levels: [], fromCatalog: false }, subclass: null, speciesId: null, variantId: null, speciesSources: null, speciesChoice: { optionId: null, picks: [] }, background: null, backgroundId: null, backgroundChoice: { optionId: null, picks: [] }, asi: {}, classPicks: [], backgroundPicks: [] });
  };

  const loadEquipment = async () => {
    const key = `${state.classId}|${state.backgroundId}`;
    if (state.equipment.key === key) return;
    await busy(async () => {
      let sources = [];
      let error = false;
      try { sources = await fetchStartingEquipment({ classId: state.classId, backgroundId: state.backgroundId }); } catch (cause) { console.error('Dotazione iniziale non caricata', cause); error = cause?.message || true; }
      const entries = sources.flatMap((source) => source.groups.flatMap((group) => group.options.flatMap((option) => option.entries)));
      const categories = [...new Set(entries.filter((entry) => entry.kind === 'category').flatMap((entry) => categoryFilter(entryEquipmentType(entry))?.categories || []))];
      const items = categories.length ? await listSharedItemsByCategories(categories).catch(() => []) : [];
      const missingIds = [...new Set(entries.filter((entry) => entry.kind === 'item').map((entry) => entry.itemId))].filter((id) => !items.some((item) => String(item.id) === id));
      const extra = missingIds.length ? await getSharedItemsByIds(missingIds).catch(() => []) : [];
      state.equipment = { key, sources, items: [...items, ...extra], error, selection: { alternatives: {}, categoryPicks: {}, goldAlt: {}, acknowledged: {} } };
    });
  };

  const refreshSpeciesChoice = () => {
    const resolution = derived().speciesResolution;
    state.speciesChoice = resolution ? reconcileAsiChoice(resolution, {}) : { optionId: null, picks: [] };
  };

  const goTo = (index) => {
    state.step = Math.max(0, Math.min(STEPS.length - 1, index));
    state.maxStep = Math.max(state.maxStep, state.step);
    render();
    if (['equipment', 'summary'].includes(STEPS[state.step].key)) void loadEquipment();
    container.querySelector('.cb__body')?.scrollTo?.({ top: 0 });
  };

  function bindBody(key) {
    const on = (selector, event, handler) => body.querySelectorAll(selector).forEach((element) => element.addEventListener(event, () => handler(element)));
    const bindFilter = () => {
      const input = body.querySelector('[data-cb-filter]');
      const sourceSelect = body.querySelector('[data-cb-filter-source]');
      const sizeSelect = body.querySelector('[data-cb-filter-size]');
      const apply = () => {
        const text = (input?.value || '').trim().toLowerCase();
        body.querySelectorAll('[data-cb-cards] [data-cb-filter-text]').forEach((cardElement) => {
          cardElement.hidden = (Boolean(text) && !cardElement.dataset.cbFilterText.includes(text))
            || (Boolean(sourceSelect?.value) && cardElement.dataset.cbSource !== sourceSelect.value)
            || (Boolean(sizeSelect?.value) && cardElement.dataset.cbSize !== sizeSelect.value);
        });
      };
      [input, sourceSelect, sizeSelect].forEach((control) => control?.addEventListener(control.tagName === 'INPUT' ? 'input' : 'change', apply));
    };
    if (key === 'version') {
      on('[data-cb-version]', 'click', async (element) => {
        const version = element.dataset.cbVersion;
        if (version === state.version) return;
        state.version = version;
        resetFromVersion();
        await busy(async () => {
          state.options = await loadBuilderOptions(version);
        });
      });
    }
    if (key === 'class') {
      body.querySelector('[data-cb-name]')?.addEventListener('input', (event) => { state.name = event.target.value; const error = validate('class'); nextButton.disabled = Boolean(error); hint.textContent = error || ''; });
      const setLevel = (value) => {
        state.level = Math.min(20, Math.max(1, Number(value) || 1));
        if (state.classDetails && !subclassAvailable()) state.subclass = null;
        state.asi = {};
        render();
      };
      body.querySelector('[data-cb-level]')?.addEventListener('change', (event) => setLevel(event.target.value));
      on('[data-cb-level-step]', 'click', (element) => setLevel(state.level + Number(element.dataset.cbLevelStep)));
      on('[data-cb-class]', 'click', async (element) => {
        const id = element.dataset.cbClass;
        if (id === state.classId) return;
        await busy(async () => {
          state.classId = id;
          state.subclass = null;
          state.classPicks = [];
          state.asi = {};
          state.classDetails = await getClassDetails(id, state.version);
          const levelRows = await getClassFeatureLevels(id, state.version).catch(() => []);
          state.asiLevels = asiLevelsFromFeatures(levelRows);
        });
      });
    }
    if (key === 'subclass') {
      on('[data-cb-subclass]', 'click', (element) => { state.subclass = state.classDetails.subclasses.find((row) => String(row.id) === element.dataset.cbSubclass) || null; render(); });
    }
    if (key === 'species') {
      bindFilter();
      on('[data-cb-species]', 'click', async (element) => {
        if (element.dataset.cbSpecies === state.speciesId) return;
        await busy(async () => {
          state.speciesId = element.dataset.cbSpecies;
          state.variantId = null;
          state.speciesSources = await getSpeciesAsiSources(state.speciesId, null, state.version);
          refreshSpeciesChoice();
        });
      });
      on('[data-cb-variant]', 'click', async (element) => {
        await busy(async () => {
          state.variantId = element.dataset.cbVariant || null;
          state.speciesSources = await getSpeciesAsiSources(state.speciesId, state.variantId, state.version);
          refreshSpeciesChoice();
        });
      });
    }
    if (key === 'abilities') {
      on('[data-cb-mode]', 'click', (element) => { state.abilities.mode = element.dataset.cbMode; render(); });
      on('[data-cb-pb]', 'click', (element) => {
        const ability = element.dataset.cbPb;
        const next = state.abilities.pointBuy[ability] + Number(element.dataset.dir);
        if (next < POINT_BUY_MIN || next > POINT_BUY_MAX) return;
        const candidate = { ...state.abilities.pointBuy, [ability]: next };
        if (pointBuySpent(candidate) > POINT_BUY_BUDGET) return;
        state.abilities.pointBuy = candidate;
        render();
      });
      on('[data-cb-std]', 'change', (element) => { state.abilities.standard = { ...state.abilities.standard, [element.dataset.cbStd]: Number(element.value) || undefined }; render(); });
      on('[data-cb-manual]', 'change', (element) => { state.abilities.manual = { ...state.abilities.manual, [element.dataset.cbManual]: Math.min(18, Math.max(3, Number(element.value) || 10)) }; render(); });
      on('[data-cb-asi]', 'click', (element) => {
        const ability = element.dataset.cbAsi;
        const data = derived();
        const direction = Number(element.dataset.dir);
        if (direction > 0 && !canAddAsi(data.asiPoints, state.asi, data.totals.preAsi, ability)) return;
        state.asi = { ...state.asi, [ability]: Math.max(0, (state.asi[ability] || 0) + direction) };
        render();
      });
    }
    if (key === 'abilities' || key === 'background') {
      const scope = key === 'abilities' ? 'species' : 'background';
      const choiceKey = scope === 'species' ? 'speciesChoice' : 'backgroundChoice';
      const resolution = () => (scope === 'species' ? derived().speciesResolution : derived().backgroundResolution);
      on(`[data-cb-asi-option="${scope}"]`, 'change', (element) => { state[choiceKey] = reconcileAsiChoice(resolution(), { optionId: element.value, picks: [] }); render(); });
      on(`[data-cb-asi-pick="${scope}"]`, 'change', (element) => {
        const option = (scope === 'species' ? derived().speciesEval : derived().backgroundEval)?.option;
        if (!option) return;
        const picks = option.picks.map((pick, index) => [...body.querySelectorAll(`[data-cb-asi-pick="${scope}"][data-pick="${index}"]`)].map((select) => select.value));
        state[choiceKey] = { optionId: option.id, picks };
        render();
      });
    }
    if (key === 'background') {
      bindFilter();
      on('[data-cb-background]', 'click', async (element) => {
        if (element.dataset.cbBackground === state.backgroundId) return;
        await busy(async () => {
          state.backgroundId = element.dataset.cbBackground;
          state.background = await loadBackgroundRecord(state.backgroundId, state.version);
          state.backgroundPicks = [];
          const resolution = resolveBackgroundAsi({ background: state.background, rulesVersion: state.version });
          state.backgroundChoice = reconcileAsiChoice(resolution, {});
        });
      });
    }
    if (key === 'equipment' || key === 'summary') {
      bindBundleItems(body, async (id) => {
        const [child] = await getSharedItemsByIds([id]).catch(() => []);
        if (child) void openEquipmentItemDetail(child, { catalogMode: true });
      });
      on('[data-cb-eq-item]', 'click', async (element) => {
        const item = state.equipment.items.find((entry) => String(entry.id) === element.dataset.cbEqItem) || (await getSharedItemsByIds([element.dataset.cbEqItem]).catch(() => []))[0];
        if (item) void openEquipmentItemDetail(item, { catalogMode: true });
      });
    }
    if (key === 'equipment') {
      const selection = state.equipment.selection;
      on('[data-cb-eq-alt]', 'change', (element) => { selection.alternatives = { ...selection.alternatives, [element.dataset.cbEqAlt]: element.value }; render(); });
      on('[data-cb-eq-pick]', 'change', (element) => { selection.categoryPicks = { ...selection.categoryPicks, [element.dataset.cbEqPick]: element.value || undefined }; render(); });
      on('[data-cb-eq-ack]', 'change', (element) => { selection.acknowledged = { ...selection.acknowledged, [element.dataset.cbEqAck]: element.checked }; render(); });
      on('[data-cb-eq-gold]', 'change', (element) => { selection.goldAlt = { ...selection.goldAlt, [element.dataset.cbEqGold]: element.checked ? 0 : null }; render(); });
      on('[data-cb-eq-gold-amount]', 'change', (element) => { selection.goldAlt = { ...selection.goldAlt, [element.dataset.cbEqGoldAmount]: Math.max(0, Math.floor(Number(element.value) || 0)) }; render(); });
      on('[data-cb-eq-gold-avg]', 'click', (element) => { selection.goldAlt = { ...selection.goldAlt, [element.dataset.cbEqGoldAvg]: Number(element.dataset.avg) }; render(); });
    }
    if (key === 'skills') {
      on('[data-cb-skill]', 'change', (element) => {
        const picksKey = element.dataset.cbSkill === 'class' ? 'classPicks' : 'backgroundPicks';
        const index = Number(element.dataset.index);
        const list = [...(state[picksKey][index] || [])];
        const next = element.checked ? [...list, element.value] : list.filter((value) => value !== element.value);
        const copy = [...state[picksKey]];
        copy[index] = next;
        state[picksKey] = copy;
        render();
      });
    }
  }

  const create = async () => {
    const data = derived();
    const speciesRecord = state.speciesSources?.species || null;
    const evaluation = data.speciesEval;
    const speciesAsiRecord = data.speciesResolution && evaluation
      ? buildSpeciesAsiRecord({ resolution: data.speciesResolution, choice: state.speciesChoice, evaluation, speciesId: state.speciesId, variantId: state.variantId })
      : null;
    const payload = buildCharacterPayload({
      userId: user.id, state, classRecord: state.classDetails, speciesRecord, backgroundRecord: state.background,
      finalScores: data.totals.final, skillSelection: data.skillSelection, speciesAsiRecord
    });
    const equipmentResolution = resolveEquipment(state.equipment.sources, state.equipment.selection);
    const equipmentRecord = buildStartingEquipmentRecord({ sources: state.equipment.sources, resolution: equipmentResolution, selection: state.equipment.selection });
    payload.data.starting_equipment = equipmentRecord;
    await busy(async () => {
      let created = await createCharacter(payload);
      try {
        const applied = await applyStartingEquipmentOnce(created, equipmentRecord);
        created = { ...created, data: { ...created.data, starting_equipment: applied } };
        if (applied.warnings?.length) createToast(`Equipaggiamento aggiunto. Alcuni contenuti non sono nel catalogo e vanno aggiunti a mano: ${applied.warnings.join('; ')}`);
      } catch (error) {
        console.error('Equipaggiamento iniziale non applicato', error);
        createToast(`Personaggio creato, ma l’equipaggiamento iniziale non è stato applicato completamente: ${error?.message || 'errore'}`, 'error');
        if (error?.record) created = { ...created, data: { ...created.data, starting_equipment: error.record } };
      }
      const characters = [...getState().characters, created];
      setState({ characters });
      setActiveCharacter(created.id);
      await cacheSnapshot({ characters });
      createToast('Personaggio creato');
      navigate('home');
    });
  };

  container.querySelector('[data-cb-cancel]').addEventListener('click', () => navigate('characters'));
  backButton.addEventListener('click', () => goTo(state.step - 1));
  nextButton.addEventListener('click', () => {
    if (validate(STEPS[state.step].key)) return;
    if (state.step === STEPS.length - 1) { void create(); return; }
    goTo(state.step + 1);
  });
  stepsNav.addEventListener('click', (event) => {
    const button = event.target.closest('[data-cb-go]');
    if (button && !button.disabled) goTo(Number(button.dataset.cbGo));
  });

  render();
}
