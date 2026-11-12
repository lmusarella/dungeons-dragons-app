import { escapeHtml } from '../../../lib/html.js';
import { getRollTableEntry } from '../featureMechanicsResolver.js';

const rangeLabel = (entry) => entry.minRoll === entry.maxRoll ? String(entry.minRoll) : `${entry.minRoll}–${entry.maxRoll}`;

export function buildFeatureRollTables(features = []) {
  const interactive = features.filter((feature) => feature.tables.length || feature.diceFormulas.length);
  if (!interactive.length) return '';
  return `<section class="feature-mechanics" aria-label="Meccaniche speciali">
    <header><span class="eyebrow">Capacità speciali</span><strong>Effetti e tabelle</strong></header>
    ${interactive.map((feature) => `<article class="feature-mechanics__card" data-feature-mechanic="${escapeHtml(feature.id)}">
      <div class="feature-mechanics__heading"><div><small>Livello ${feature.unlockLevel}${feature.activationType ? ` · ${escapeHtml(feature.activationType)}` : ''}</small><h4>${escapeHtml(feature.name)}</h4></div></div>
      ${feature.description ? `<p>${escapeHtml(feature.description)}</p>` : ''}
      ${feature.tables.map((table) => `<div class="feature-roll-table" data-feature-table="${escapeHtml(table.id)}">
        <div class="feature-roll-table__actions">
          <button class="primary feature-roll-table__roll" type="button" data-roll-feature-table="${escapeHtml(table.id)}">🎲 Tira ${escapeHtml(table.diceFormula)}</button>
          ${feature.capabilities.reactionRoll ? `<button class="ghost-button" type="button" data-roll-feature-reaction="${escapeHtml(table.id)}">Reazione</button>` : ''}
          <button class="ghost-button" type="button" data-toggle-feature-table="${escapeHtml(table.id)}">Consulta tabella</button>
        </div>
        <div class="feature-roll-table__result" data-feature-result="${escapeHtml(table.id)}" aria-live="polite" hidden></div>
        <div class="feature-roll-table__complete" data-feature-table-content="${escapeHtml(table.id)}" hidden>
          ${table.entries.map((entry) => `<div data-feature-table-entry="${rangeLabel(entry)}"><strong>${rangeLabel(entry)}</strong><span>${escapeHtml(entry.description)}</span></div>`).join('')}
        </div>
      </div>`).join('')}
      ${feature.tables.length ? '' : feature.diceFormulas.map((formula) => `<button class="ghost-button feature-mechanics__formula" type="button" data-roll-feature-formula="${escapeHtml(formula)}" data-feature-name="${escapeHtml(feature.name)}">🎲 Tira ${escapeHtml(formula)}</button>`).join('')}
    </article>`).join('')}
  </section>`;
}

function showResults(root, table, rolls, { duplicateChoice = false } = {}) {
  const output = root.querySelector(`[data-feature-result="${CSS.escape(table.id)}"]`);
  if (!output) return;
  output.hidden = false;
  if (duplicateChoice) {
    output.innerHTML = `<strong>Risultati uguali: scegli liberamente un effetto</strong><div class="feature-roll-table__choices">${table.entries.map((entry) => `<button type="button" data-choose-feature-result="${entry.minRoll}"><b>${rangeLabel(entry)}</b><span>${escapeHtml(entry.description)}</span></button>`).join('')}</div>`;
  } else {
    output.innerHTML = rolls.map((roll, index) => {
      const entry = getRollTableEntry(table, roll);
      return `<div class="feature-roll-table__outcome"><span>${roll}</span><div><small>${rolls.length > 1 ? `Risultato ${index + 1}` : 'Risultato'}</small><strong>${entry ? escapeHtml(entry.description) : 'Nessun effetto associato'}</strong>${entry ? `<button type="button" data-choose-feature-result="${entry.minRoll}">Usa questo effetto</button>` : ''}</div></div>`;
    }).join('');
  }
  output.querySelectorAll('[data-choose-feature-result]').forEach((button) => button.addEventListener('click', () => {
    output.querySelectorAll('[data-choose-feature-result]').forEach((entry) => entry.classList.toggle('is-selected', entry === button));
    output.dataset.selectedResult = button.dataset.chooseFeatureResult;
  }));
}

export function installFeatureRollTables(root, features, openRoll) {
  const tables = new Map(features.flatMap((feature) => feature.tables.map((table) => [table.id, { table, feature }])));
  root.querySelectorAll('[data-toggle-feature-table]').forEach((button) => button.addEventListener('click', () => {
    const content = root.querySelector(`[data-feature-table-content="${CSS.escape(button.dataset.toggleFeatureTable)}"]`);
    if (!content) return;
    content.hidden = !content.hidden;
    button.textContent = content.hidden ? 'Consulta tabella' : 'Nascondi tabella';
  }));
  const rollTable = async (id, reaction = false) => {
    const resolved = tables.get(id);
    if (!resolved) return;
    const { table, feature } = resolved;
    const rollOnce = () => openRoll({ title: reaction ? `${feature.name} · Reazione` : table.title, notation: table.diceFormula, feature });
    const first = await rollOnce();
    if (first == null) return;
    if (!feature.capabilities.controlledSelection || reaction) return showResults(root, table, [first]);
    const second = await rollOnce();
    if (second == null) return showResults(root, table, [first]);
    showResults(root, table, [first, second], { duplicateChoice: first === second });
  };
  root.querySelectorAll('[data-roll-feature-table]').forEach((button) => button.addEventListener('click', () => void rollTable(button.dataset.rollFeatureTable)));
  root.querySelectorAll('[data-roll-feature-reaction]').forEach((button) => button.addEventListener('click', () => void rollTable(button.dataset.rollFeatureReaction, true)));
  root.querySelectorAll('[data-roll-feature-formula]').forEach((button) => button.addEventListener('click', () => void openRoll({ title: button.dataset.featureName, notation: button.dataset.rollFeatureFormula })));
}
