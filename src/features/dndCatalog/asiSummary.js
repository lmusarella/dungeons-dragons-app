import { escapeHtml } from '../../lib/html.js';
import { catalogName } from './catalogLocale.js';
import { getCopyReference, resolveSpeciesAsi } from '../character/speciesAsiResolver.js';

const KIND_LABELS = {
  fixed: 'Definiti', flexible: 'Liberi', variant: 'Definiti dalla variante', inherited: 'Ereditati', special: 'Con scelta', unresolved: 'Non risolti'
};

const FLEX_HINT = 'Distribuzione libera: +2/+1 su due caratteristiche diverse oppure +1/+1/+1 su tre caratteristiche diverse.';

function optionMarkup(option) {
  if (option.kind === 'flexible' && !Object.keys(option.fixed).length) return `<span class="catalog-asi__chip catalog-asi__chip--free">${escapeHtml(option.label.replace('a scelta ', 'liberi '))}</span>`;
  return `<span class="catalog-asi__chip">${escapeHtml(option.label)}</span>`;
}

function resolutionMarkup(resolution) {
  if (resolution.status === 'background') return `<p class="catalog-asi__note">${escapeHtml(resolution.warnings[0])}</p>`;
  const options = resolution.options.filter((option) => !option.id.startsWith('tasha-'));
  const body = options.length
    ? `<div class="catalog-asi__chips">${options.map(optionMarkup).join('<em>oppure</em>')}</div>${options.some((option) => option.kind === 'flexible') ? `<p class="catalog-asi__note">${FLEX_HINT}</p>` : ''}`
    : '';
  const warnings = resolution.warnings.length ? `<ul class="catalog-asi__warnings">${resolution.warnings.map((message) => `<li>${escapeHtml(message)}</li>`).join('')}</ul>` : '';
  return body + warnings;
}

/**
 * @param {{ species: object, variant?: object|null, variants?: object[], copyChain?: object[], rulesVersion: string }} sources
 */
export function renderAsiSummary({ species, variant = null, variants = [], copyChain = [], rulesVersion }) {
  const main = resolveSpeciesAsi({ species, variant, variants, copyChain, rulesVersion });
  const copy = getCopyReference(species);
  const variantDefined = main.kind === 'unresolved' && !copy;
  let variantRows = '';
  if (!variant && variants.length && main.status !== 'background') {
    const rows = variants.map((entry) => ({ entry, resolution: resolveSpeciesAsi({ species, variant: entry, variants, copyChain, rulesVersion }) }))
      .filter(({ entry, resolution }) => resolution.options.length && resolution.options.some((option) => option.kind === 'variant') && entry);
    if (rows.length) {
      variantRows = `<div class="catalog-asi__variants"><small>Per variante</small>${rows.map(({ entry, resolution }) => `<p><strong>${escapeHtml(catalogName(entry))}</strong> ${resolution.options.map(optionMarkup).join('<em>oppure</em>')}</p>`).join('')}</div>`;
    }
  }
  const kindLabel = main.status === 'background' ? 'Dal background' : main.kind === 'inherited' && copy ? `Ereditati da ${copy.name}` : (variantRows && variantDefined ? 'Definiti dalle varianti' : KIND_LABELS[main.kind] || '—');
  const showMain = !(variantRows && variantDefined);
  return `<section class="catalog-detail-section catalog-asi">
    <header><h3>Incrementi di caratteristica</h3><span class="catalog-asi__badge catalog-asi__badge--${escapeHtml(main.kind || 'none')}">${escapeHtml(kindLabel)}</span></header>
    ${showMain ? resolutionMarkup(main) : ''}${variantRows}
  </section>`;
}
