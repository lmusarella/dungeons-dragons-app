import { escapeHtml } from '../../lib/html.js';
import { findFeatureRollTables, mechanicsText, resolveAdditionalSpells } from '../character/featureMechanicsResolver.js';
import { catalogDescription, catalogName, catalogSourceLabel, catalogStatBlock } from './catalogLocale.js';

export const CATALOG_LABELS_IT = {
  str: 'Forza', dex: 'Destrezza', con: 'Costituzione', int: 'Intelligenza', wis: 'Saggezza', cha: 'Carisma',
  tiny: 'Minuscola', small: 'Piccola', medium: 'Media', large: 'Grande', huge: 'Enorme', gargantuan: 'Mastodontica',
  aberration: 'Aberrazione', beast: 'Bestia', celestial: 'Celestiale', construct: 'Costrutto', dragon: 'Drago',
  elemental: 'Elementale', fey: 'Folletto', fiend: 'Immondo', giant: 'Gigante', humanoid: 'Umanoide',
  monstrosity: 'Mostruosità', ooze: 'Melma', plant: 'Vegetale', undead: 'Non morto',
  walk: 'Camminare', fly: 'Volare', swim: 'Nuotare', climb: 'Arrampicarsi', burrow: 'Scavare',
  action: 'Azione', bonus: 'Azione bonus', reaction: 'Reazione', legendary: 'Azione leggendaria', trait: 'Tratto speciale',
  short_rest: 'Riposo breve', long_rest: 'Riposo lungo', proficiency_bonus: 'Bonus di competenza',
  general: 'Generale', origin: 'Origine', fighting_style: 'Stile di combattimento', epic_boon: 'Dono epico',
  acid: 'Acido', cold: 'Freddo', fire: 'Fuoco', force: 'Forza', lightning: 'Fulmine', necrotic: 'Necrotico',
  poison: 'Veleno', psychic: 'Psichico', radiant: 'Radiante', thunder: 'Tuono', bludgeoning: 'Contundente',
  piercing: 'Perforante', slashing: 'Tagliente', blinded: 'Accecato', charmed: 'Affascinato', deafened: 'Assordato',
  frightened: 'Spaventato', grappled: 'Afferrato', incapacitated: 'Incapacitato', invisible: 'Invisibile',
  paralyzed: 'Paralizzato', petrified: 'Pietrificato', poisoned: 'Avvelenato', prone: 'Prono', restrained: 'Trattenuto',
  stunned: 'Stordito', unconscious: 'Privo di sensi', passive: 'Passiva', at_will: 'A volontà'
  , casterprogression: 'Progressione incantatore', cantripprogression: 'Trucchetti per livello',
  preparedspellsprogression: 'Incantesimi preparati per livello', spellcastingability: 'Caratteristica da incantatore'
};

const EMPTY_VALUES = new Set(['', 'null', 'undefined', '—']);

export function labelIt(code = '') {
  const key = String(code).trim().toLowerCase();
  if (['', 'null', 'undefined'].includes(key)) return '';
  return CATALOG_LABELS_IT[key] || key.replaceAll('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function present(value) {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value === 'boolean') return value ? 'Sì' : 'No';
  if (Array.isArray(value)) return value.map(present).filter(Boolean).join(' · ');
  if (typeof value === 'object') return Object.entries(value).map(([key, entry]) => `${labelIt(key)}: ${present(entry)}`).filter((entry) => !entry.endsWith(': ')).join(' · ');
  return String(value);
}

function property(label, value, modifier = '') {
  const formatted = present(value);
  if (!formatted || EMPTY_VALUES.has(formatted)) return '';
  return `<div class="catalog-property ${modifier}"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(formatted)}</dd></div>`;
}

function stat(label, value, detail = '') {
  const formatted = present(value);
  if (!formatted || EMPTY_VALUES.has(formatted)) return '';
  return `<article class="catalog-stat-card"><small>${escapeHtml(label)}</small><strong>${escapeHtml(formatted)}</strong>${detail ? `<span>${escapeHtml(detail)}</span>` : ''}</article>`;
}

function section(title, content, eyebrow = '') {
  if (!content?.trim()) return '';
  return `<section class="catalog-detail-section"><header>${eyebrow ? `<small>${escapeHtml(eyebrow)}</small>` : ''}<h3>${escapeHtml(title)}</h3></header>${content}</section>`;
}

function properties(values) {
  const content = values.filter(Boolean).join('');
  return content ? `<dl class="catalog-properties-grid">${content}</dl>` : '';
}

function dataSource(item, ...keys) {
  for (const key of keys) {
    const value = item?.[key];
    if (value && typeof value === 'object') return value;
  }
  return {};
}

function selectedStructuredProperties(data, keys) {
  return properties(keys.map(([key, label]) => property(label, data?.[key])));
}

function normalizeHitDie(value) {
  if (!value) return '';
  const text = String(value).toLowerCase().trim();
  return text.startsWith('d') ? text : `d${text.replace(/\D/g, '')}`;
}

function formatChallengeRating(value) {
  const number = Number(value);
  if (number === 0.125) return '1/8';
  if (number === 0.25) return '1/4';
  if (number === 0.5) return '1/2';
  return present(value);
}

function abilityModifier(score) {
  const value = Number(score);
  if (!Number.isFinite(value)) return '';
  const modifier = Math.floor((value - 10) / 2);
  return `${modifier >= 0 ? '+' : ''}${modifier}`;
}

function numericDistance(value) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const match = value.match(/-?\d+(?:[.,]\d+)?/);
    return match ? Number(match[0].replace(',', '.')) : null;
  }
  if (value && typeof value === 'object') return numericDistance(value.number ?? value.value ?? value.distance ?? value.amount);
  return null;
}

function speedCards(original, localized) {
  const localizedInMeters = String(localized?.speed_unit || '').toLowerCase() === 'm';
  const speeds = localizedInMeters ? localized?.speed : original?.speed;
  if (!speeds) return '';
  const entries = typeof speeds === 'object' && !Array.isArray(speeds) ? Object.entries(speeds) : [['walk', speeds]];
  return entries.map(([type, raw]) => {
    const distance = numericDistance(raw);
    if (distance === null) return property(labelIt(type), present(raw));
    const meters = localizedInMeters ? distance : Math.round(distance * 0.3 * 10) / 10;
    const condition = raw && typeof raw === 'object' ? raw.condition || raw.note : '';
    return stat(labelIt(type), `${meters} m`, condition || '');
  }).join('');
}

function listFrom(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'object') return Object.entries(value).map(([name, entry]) => ({ name, value: entry }));
  return [value];
}

function actionText(entry) {
  if (!entry) return '';
  const values = entry.entries_it || entry.entries || entry.description_it || entry.description || entry.text || entry.value;
  return present(values);
}

function actionMechanics(entry) {
  const mechanics = [
    ['Bonus al tiro', entry?.attack_bonus ?? entry?.to_hit ?? entry?.hit_bonus],
    ['Portata / gittata', entry?.range_m ?? entry?.reach_m ?? entry?.range ?? entry?.reach],
    ['Danno', entry?.damage_dice ?? entry?.damage],
    ['Tipo di danno', entry?.damage_type ? labelIt(entry.damage_type) : ''],
    ['CD', entry?.dc ?? entry?.save_dc],
    ['Tiro salvezza', entry?.save_ability ? labelIt(entry.save_ability) : ''],
    ['Ricarica', entry?.recharge ?? entry?.uses]
  ].map(([label, value]) => property(label, value)).filter(Boolean).join('');
  return mechanics ? `<dl class="catalog-action-mechanics">${mechanics}</dl>` : '';
}

function actionSections(original, localized) {
  return [
    ['trait', 'Tratti speciali'], ['action', 'Azioni'], ['bonus', 'Azioni bonus'],
    ['reaction', 'Reazioni'], ['legendary', 'Azioni leggendarie']
  ].map(([key, title]) => {
    const originalEntries = listFrom(original?.[key]);
    const localizedEntries = listFrom(localized?.[key]);
    const count = Math.max(originalEntries.length, localizedEntries.length);
    if (!count) return '';
    const cards = Array.from({ length: count }, (_, index) => {
      const source = originalEntries[index] || {};
      const translated = localizedEntries[index] || {};
      const name = catalogName(translated, catalogName(source, source.name || title));
      const text = actionText(translated) || actionText(source);
      return `<article class="catalog-action-card"><header><strong>${escapeHtml(name)}</strong>${source.recharge ? `<span>${escapeHtml(present(source.recharge))}</span>` : ''}</header>${actionMechanics(source)}${text ? `<p>${escapeHtml(text)}</p>` : ''}</article>`;
    }).join('');
    return section(title, `<div class="catalog-action-list">${cards}</div>`);
  }).join('');
}

function renderCreature(item) {
  const original = item.stat_block && typeof item.stat_block === 'object' ? item.stat_block : {};
  const localized = item.stat_block_it && typeof item.stat_block_it === 'object' ? item.stat_block_it : {};
  const rules = original['5etools'] || original.five_etools || {};
  const abilities = original.abilities || localized.abilities || rules.abilities || {};
  const stats = [
    stat('Grado di Sfida', formatChallengeRating(item.challenge_rating ?? original.cr ?? rules.cr)),
    stat('Classe Armatura', item.armor_class ?? original.armor_class ?? original.ac ?? rules.ac),
    stat('Punti Ferita', item.hit_points ?? original.hit_points ?? original.hp ?? rules.hp?.average, rules.hp?.formula || ''),
    stat('Tipo', labelIt(item.creature_type || original.creature_type || original.type || '')),
    stat('Taglia', labelIt(item.size || original.size || '')),
    stat('Regole', item.rules_version)
  ].filter(Boolean).join('');
  const abilityCards = ['str', 'dex', 'con', 'int', 'wis', 'cha'].map((ability) => {
    const score = abilities?.[ability];
    return score === undefined ? '' : stat(labelIt(ability), score, abilityModifier(score));
  }).join('');
  const movement = speedCards(original, localized);
  const defenses = properties([
    property('Dadi Vita', rules.hp?.formula || original.hit_dice),
    property('Tiri salvezza', rules.save || original.saves),
    property('Abilità', rules.skill || original.skills),
    property('Vulnerabilità', rules.vulnerable || original.damage_vulnerabilities),
    property('Resistenze', rules.resist || original.damage_resistances),
    property('Immunità ai danni', rules.immune || original.damage_immunities),
    property('Immunità alle condizioni', rules.conditionImmune || original.condition_immunities),
    property('Sensi', rules.senses || original.senses),
    property('Percezione passiva', rules.passive || original.passive_perception),
    property('Lingue', rules.languages || original.languages)
  ]);
  return [
    stats ? `<div class="catalog-stats-grid catalog-stats-grid--primary">${stats}</div>` : '',
    section('Caratteristiche', `<div class="catalog-stats-grid catalog-stats-grid--abilities">${abilityCards}</div>`),
    section('Movimento', `<div class="catalog-stats-grid">${movement}</div>`),
    section('Difese, sensi e competenze', defenses),
    actionSections(original, localized)
  ].join('');
}

function rollLabel(entry) {
  return entry.minRoll === entry.maxRoll ? String(entry.minRoll) : `${entry.minRoll}–${entry.maxRoll}`;
}

function renderFeatureRollTables(item) {
  const tables = findFeatureRollTables(item.mechanics, item);
  if (!tables.length) return '';
  return tables.map((table) => section(
    table.title || 'Tabella degli effetti',
    `<div class="catalog-feature-table__meta"><span>Dado</span><strong>${escapeHtml(table.diceFormula || '—')}</strong><small>${table.entries.length} risultati possibili</small></div>
     <div class="catalog-feature-table"><table><thead><tr><th>Risultato</th><th>Effetto</th></tr></thead><tbody>${table.entries.map((entry) => `<tr><th>${escapeHtml(rollLabel(entry))}</th><td>${escapeHtml(entry.description)}</td></tr>`).join('')}</tbody></table></div>`,
    'Meccanica casuale'
  )).join('');
}

const SPELL_BENEFIT_LABELS = {
  known: 'Incantesimi conosciuti',
  prepared: 'Sempre preparati',
  expanded: 'Espansione della lista',
  innate: 'Incantesimi innati'
};

function spellNodeRows(value, context = '') {
  if (value === null || value === undefined) return [];
  if (typeof value === 'string' || typeof value === 'number') {
    return [{ context, text: mechanicsText(value) || String(value) }];
  }
  if (Array.isArray(value)) return value.flatMap((entry) => spellNodeRows(entry, context));
  if (typeof value !== 'object') return [];
  if (value.choose !== undefined) {
    const choice = mechanicsText(value.choose) || present(value.choose);
    const amount = value.count ?? value.amount;
    return [{ context, text: `Scelta${amount ? ` (${amount})` : ''}: ${choice}` }];
  }
  if (value.all !== undefined) return spellNodeRows(value.all, context ? `${context} · Tutti` : 'Tutti');
  return Object.entries(value).flatMap(([key, entry]) => {
    const label = /^\d+$/.test(key) ? `Livello ${key}` : labelIt(key);
    return spellNodeRows(entry, context ? `${context} · ${label}` : label);
  });
}

function renderAdditionalSpellBenefits(item) {
  const benefits = resolveAdditionalSpells(item.subclass_data || item.data);
  if (!benefits.length) return '';
  const content = benefits.map((benefit) => {
    const rows = spellNodeRows(benefit.value);
    return `<article class="catalog-spell-benefit catalog-spell-benefit--${escapeHtml(benefit.kind)}">
      <header><span>${escapeHtml(SPELL_BENEFIT_LABELS[benefit.kind] || labelIt(benefit.kind))}</span><small>${rows.length} ${rows.length === 1 ? 'voce' : 'voci'}</small></header>
      <div>${rows.length ? rows.map((row) => `<p>${row.context ? `<strong>${escapeHtml(row.context)}</strong>` : ''}<span>${escapeHtml(row.text)}</span></p>`).join('') : '<p><span>Dati presenti ma non interpretabili automaticamente.</span></p>'}</div>
    </article>`;
  }).join('');
  return section('Incantesimi e benefici aggiuntivi', `<div class="catalog-spell-benefits">${content}</div>`, 'Dati della sottoclasse');
}

function renderStandard(catalog, item) {
  const key = catalog.key;
  const data = key === 'classes' ? dataSource(item, 'class_data', 'data')
    : key === 'subclasses' ? dataSource(item, 'subclass_data', 'data')
      : key === 'species' ? dataSource(item, 'species_data', 'data')
        : key === 'species-variants' ? dataSource(item, 'variant_data', 'data')
          : key === 'feats' ? dataSource(item, 'feat_data', 'data')
            : key === 'backgrounds' ? dataSource(item, 'background_data', 'benefits', 'data')
              : key === 'features' ? dataSource(item, 'mechanics')
                : key === 'fighting-styles' ? dataSource(item, 'style_data', 'data') : {};
  const configurations = {
    classes: {
      stats: [],
      fields: [],
      extra: null
    },
    subclasses: { stats: [stat('Livello disponibile', item.subclass_selection_level ?? data.subclass_selection_level)], fields: [['proficiencies', 'Competenze'], ['benefits', 'Benefici']] },
    species: { stats: [stat('Taglia', labelIt(item.size)), stat('Velocità', item.speed_m !== undefined ? `${item.speed_m} m` : '')], fields: [['proficiencies', 'Competenze'], ['languages', 'Lingue'], ['senses', 'Sensi'], ['special_traits', 'Tratti speciali']] },
    'species-variants': { stats: [stat('Tipo di variante', labelIt(item.variant_kind))], fields: [['bonuses', 'Bonus'], ['proficiencies', 'Competenze'], ['traits', 'Tratti']] },
    feats: { stats: [stat('Categoria', labelIt(item.feat_category || item.category)), stat('Ripetibile', item.repeatable)], fields: [['prerequisites', 'Prerequisiti'], ['ability_increases', 'Incrementi caratteristiche'], ['benefits', 'Benefici']] },
    backgrounds: { stats: [], fields: [['skill_proficiencies', 'Competenze nelle abilità'], ['tool_proficiencies', 'Competenze negli strumenti'], ['languages', 'Lingue'], ['ability_increases', 'Incrementi caratteristiche'], ['starting_equipment', 'Equipaggiamento iniziale'], ['origin_feat', 'Talento di Origine'], ['benefits', 'Benefici']] },
    features: { stats: [stat('Categoria', labelIt(item.feature_category || item.category)), stat('Attivazione', labelIt(item.activation_type)), stat('Utilizzi', item.max_uses_formula || item.uses), stat('Recupero', labelIt(item.recovery_type || item.recovery))], fields: [['effects', 'Effetti'], ['formula', 'Formula'], ['requirements', 'Requisiti']] },
    'fighting-styles': { stats: [], fields: [['bonuses', 'Bonus'], ['benefits', 'Benefici'], ['requirements', 'Requisiti']] }
  };
  const config = configurations[key];
  if (!config) return '';
  const stats = (config.stats || []).filter(Boolean).join('');
  const props = selectedStructuredProperties(data, config.fields || []);
  const extra = config.extra ? properties(Object.entries(config.extra).map(([field, value]) => property(labelIt(field), value))) : '';
  const specialMechanics = key === 'features' ? renderFeatureRollTables(item)
    : key === 'subclasses' ? renderAdditionalSpellBenefits(item) : '';
  return [
    stats ? `<div class="catalog-stats-grid catalog-stats-grid--primary">${stats}</div>` : '',
    specialMechanics,
    section('Proprietà e meccaniche', props),
    section('Incantesimi', extra)
  ].join('');
}

export function renderCatalogAdvancedDetails(catalog, item) {
  if (catalog.key === 'creatures') return renderCreature(item);
  return renderStandard(catalog, item);
}

export function renderCatalogDescription(item) {
  const description = catalogDescription(item);
  return description ? section('Descrizione', `<p class="catalog-description">${escapeHtml(description)}</p>`) : '';
}

export function renderCatalogSource(item) {
  return item.source ? section('Fonte', `<p class="catalog-source">${escapeHtml(catalogSourceLabel(item.source))}</p>`) : '';
}
