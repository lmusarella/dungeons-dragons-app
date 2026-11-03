import { normalizeCharacterId } from '../../../app/state.js';
import { attachNumberStepper } from '../../../ui/components.js';
import { ensureLegacyDiceAssets } from '../legacyLoader.js';

let overlayEl = null;
let activeOverlaySessionCleanup = null;
let overlaySessionToken = 0;
let legacyDiceInitialized = false;

function buildDiceMarkup() {
  return `
    <section class="diceov-tabletop" aria-label="Tavolo di lancio tridimensionale">
      <header class="diceov-tabletop__header">
        <span aria-hidden="true">🎲</span>
        <span><strong>Tavolo di lancio</strong><small>Trascina sul tavolo per lanciare i dadi</small></span>
      </header>
      <div id="diceRoller"></div>
      <div class="diceov-tabletop-empty" data-tabletop-empty hidden>
        <span aria-hidden="true">🎲</span>
        <strong>Scegli almeno un dado</strong>
        <small>Usa “Aggiungi dadi” prima di fare swipe sul tavolo.</small>
      </div>
      <div class="diceov-tabletop-feedback" aria-live="polite">
        <div class="diceov-result diceov-result--final">
          <p class="diceov-critical-banner" data-dice-critical-banner hidden></p>
          <p class="diceov-result-label">Totale</p>
          <p class="diceov-result-detail" data-dice-detail>Lancia per vedere i dettagli.</p>
          <p class="diceov-result-value" data-dice-result>—</p>
        </div>
      </div>
    </section>
    <main id="diceRollerUI">
      <div class="top_field" hidden>
        <input type="text" id="textInput" spellcheck="false" inputmode="none" virtualkeyboardpolicy="manual"
               value="1d20"/>
      </div>
      <div id="diceLimit" style="display:none">Wow that's a lot of dice! <br>[Limit: 20]</div>    
      <div id="numPad" class="center_field" style="display:none">
        <table class="numPad">
          <tr><td onclick="main.input('del')" colspan="2">del</td><td onclick="main.input('bksp')" colspan="2">bksp</td></tr>
          <tr><td onclick="main.input('7')">7</td><td onclick="main.input('8')">8</td><td onclick="main.input('9')">9</td><td onclick="main.input('+')" rowspan="2">+</td></tr>
          <tr><td onclick="main.input('4')">4</td><td onclick="main.input('5')">5</td><td onclick="main.input('6')">6</td></tr>
          <tr><td onclick="main.input('1')">1</td><td onclick="main.input('2')">2</td><td onclick="main.input('3')">3</td><td onclick="main.input('-')" rowspan="2">-</td></tr>
          <tr><td onclick="main.input('0')" colspan="2">0</td><td onclick="main.input('d')">d</td></tr>
        </table>
        <button onclick="main.clearInput()">CLEAR</button>
        <button onclick="main.setInput()">OK</button>
      </div>
      <div class="bottom_field" hidden><span id="result"></span></div>
    </main>
  `;
}

function buildOverlayMarkup() {
  return `
  <div class="diceov-backdrop" data-close></div>
  <div class="diceov-stage" role="dialog" aria-modal="true" aria-label="Lancio dadi">
    <section class="diceov-panel">
      <header class="diceov-header">
        <div class="diceov-header__identity">
          <span class="diceov-header__icon" aria-hidden="true">◆</span>
          <div>
            <p class="diceov-eyebrow" data-dice-title>Lancia dadi</p>
            <small>Configura il tiro, poi trascina sul tavolo.</small>
          </div>
        </div>
        <button class="diceov-history-icon-button" type="button" data-history-toggle aria-expanded="false" aria-label="Apri storico tiri" title="Storico tiri">
          <span aria-hidden="true">🕘</span>
        </button>
      </header>
      <div class="diceov-controls">   
        <div class="diceov-control diceov-control--row" data-modifier-home>
         <div class="diceov-control diceov-roll-mode-control" data-dice-control="d20">
          <span class="diceov-label" id="dice-roll-mode-label">Modalità</span>
          <select id="dice-roll-mode" class="diceov-native-roll-mode" name="dice-roll-mode" aria-labelledby="dice-roll-mode-label" tabindex="-1">
            <option value="normal" selected>Normale</option>
            <option value="advantage">Vantaggio</option>
            <option value="disadvantage">Svantaggio</option>
          </select>
          <div class="diceov-mode-cards" role="group" aria-labelledby="dice-roll-mode-label">
            <button class="diceov-mode-card" type="button" data-roll-mode-option="advantage" aria-pressed="false">
              <strong>Vantaggio</strong><small>Tieni il migliore</small>
            </button>
            <button class="diceov-mode-card" type="button" data-roll-mode-option="disadvantage" aria-pressed="false">
              <strong>Svantaggio</strong><small>Tieni il peggiore</small>
            </button>
          </div>
        </div>
          <div class="diceov-control diceov-selection-control" data-dice-select hidden>
            <label class="diceov-label" for="dice-roll-select" data-dice-select-label>Seleziona</label>
            <select id="dice-roll-select" name="dice-roll-select"></select>
          </div>
          <div class="diceov-control diceov-inspiration-row" data-dice-control="d20">
            <div class="diceov-inspiration" data-dice-inspiration>
              <span class="diceov-label">Ispirazione</span>
              <label class="diceov-toggle">
                <input id="dice-inspiration" type="checkbox" name="dice-inspiration" />
                <span class="diceov-toggle-track" aria-hidden="true"></span>
              </label>
            </div>
            <p class="diceov-warning" data-inspiration-warning hidden>
              Attenzione: userai il punto ispirazione su questo tiro.
            </p>
          </div>
         <p class="diceov-warning diceov-warning--custom" data-custom-warning hidden></p>
         <p class="diceov-warning" data-weakness-warning hidden></p>
         <p class="diceov-warning" data-rollmode-warning hidden></p>
         <p class="diceov-warning" data-autofail-warning hidden></p>
        </div>
       
        <div class="diceov-control" data-dice-control="generic">       
          <div class="diceov-generic-row">
            <div class="diceov-control" data-critical-damage-field hidden>
              <span class="diceov-label">Critico</span>
              <label class="diceov-toggle">
                <input type="checkbox" name="dice-critical-damage" />
                <span class="diceov-toggle-track" aria-hidden="true"></span>
              </label>
            </div>
            <div class="diceov-control" data-sneak-attack-field hidden>
              <span class="diceov-label">Attacco furtivo</span>
              <label class="diceov-toggle">
                <input type="checkbox" name="dice-sneak-attack" />
                <span class="diceov-toggle-track" aria-hidden="true"></span>
              </label>
            </div>
          </div>
          <p class="diceov-warning" data-dice-limit-warning hidden>Puoi lanciare al massimo 20 dadi alla volta.</p>
        </div>
        <div class="diceov-quick-config diceov-roll-config">
          <label class="diceov-quick-notation" for="dice-notation">
            <span>Notazione</span>
            <input id="dice-notation" class="diceov-generic-notation" type="text" name="dice-notation" value="" placeholder="Nessun dado selezionato" spellcheck="false" />
          </label>
          <div class="diceov-field diceov-field--modifier diceov-primary-modifier" data-quick-modifier="d20">
            <label class="diceov-label" for="dice-modifier">Modificatore</label>
            <input id="dice-modifier" type="number" name="dice-modifier" value="0" step="1" />
          </div>
          <div class="diceov-field diceov-field--modifier" data-quick-modifier="generic">
            <label class="diceov-label" for="dice-modifier-generic">Modificatore</label>
            <input id="dice-modifier-generic" type="number" name="dice-modifier-generic" value="0" step="1" />
          </div>
        </div>
      </div>
      <div class="diceov-results">
        <div class="diceov-accordion-row" data-dice-accordion-row>
          <div class="diceov-quick-dice" data-quick-dice>
            <div class="diceov-section-heading">
              <button class="diceov-section-title diceov-section-title--button" type="button" data-quick-dice-toggle aria-expanded="false">
                <span aria-hidden="true">🎲</span>
                <span>Aggiungi dadi</span>
              </button>
              <button class="diceov-quick-reset" type="button" data-dice-reset aria-label="Ripristina i valori iniziali" title="Ripristina i valori iniziali">↺</button>
            </div>
            <div class="diceov-quick-dice-content" data-quick-dice-content hidden>
              <div class="diceov-quick-dice-controls" data-quick-dice-controls aria-label="Modifica rapida notazione dadi">
                ${[4, 6, 8, 10, 12, 20, 100].map((die) => `
                  <div class="diceov-quick-die">
                    <button class="diceov-quick-die-btn" type="button" data-quick-die="${die}" data-quick-die-action="decrement" aria-label="Rimuovi un d${die} dalla notazione">−</button>
                    <span class="diceov-quick-die-label">D${die}</span>
                    <button class="diceov-quick-die-btn" type="button" data-quick-die="${die}" data-quick-die-action="increment" aria-label="Aggiungi un d${die} alla notazione">+</button>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
          <div class="diceov-reroll-card" data-reroll-card>
            <button class="diceov-section-title diceov-section-title--button" type="button" data-reroll-toggle aria-expanded="false">
              <span aria-hidden="true">🔁</span>
              <span>Ritira dadi</span>
            </button>
            <div class="diceov-reroll-content" data-reroll-content hidden>
              <p class="diceov-reroll-status" data-reroll-status hidden></p>
              <div class="diceov-reroll-tray" data-reroll-tray aria-label="Dadi da ritirare"></div>
            </div>
          </div>
        </div>
      </div>
      <section class="diceov-history-accordion" data-history-accordion hidden>
        <div class="diceov-history-panel" data-dice-history-panel hidden>
          <div class="diceov-history-popover-header">
            <strong>Storico tiri</strong>
            <button class="diceov-history-popover-close" type="button" data-history-close aria-label="Chiudi storico">×</button>
          </div>
          <div class="diceov-history-list" data-dice-history></div>
        </div>
      </section>
      <footer class="diceov-exit-bar">
        <button class="diceov-exit-button" type="button" data-dice-exit data-close>
          <span aria-hidden="true" data-dice-exit-icon>×</span>
          <span data-dice-exit-label>Chiudi</span>
        </button>
      </footer>
    </section>
    ${buildDiceMarkup()}
  </div>`;
}

function hasInvalidRolls(notation) {
  return notation?.invalidRoll === true;
}

function normalizeHistoryLabel(value) {
  return (value || '')
    .toString()
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

const HISTORY_KEY = 'diceRollHistory';
const HISTORY_LIMIT = 12;

function getHistoryStorageKey(characterId) {
  const normalizedId = normalizeCharacterId(characterId);
  return `${HISTORY_KEY}:${normalizedId || 'global'}`;
}

function loadHistory(characterId) {
  if (typeof window === 'undefined') return [];
  try {
    const scopedRaw = window.localStorage.getItem(getHistoryStorageKey(characterId));
    if (scopedRaw) {
      const parsedScoped = JSON.parse(scopedRaw);
      return Array.isArray(parsedScoped) ? parsedScoped : [];
    }
    const legacyRaw = window.localStorage.getItem(HISTORY_KEY);
    const legacyParsed = legacyRaw ? JSON.parse(legacyRaw) : [];
    return Array.isArray(legacyParsed) ? legacyParsed : [];
  } catch {
    return [];
  }
}

function saveHistory(entries, characterId) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(getHistoryStorageKey(characterId), JSON.stringify(entries));
  } catch { }
}

function formatHistoryDate(timestamp) {
  try {
    return new Date(timestamp).toLocaleString('it-IT', {
      dateStyle: 'short',
      timeStyle: 'short'
    });
  } catch {
    return timestamp;
  }
}

function formatModifier(value) {
  if (!value) return '+0';
  return value > 0 ? `+${value}` : `${value}`;
}

const CRITICAL_AUDIO_FILES = {
  TS: {
    criticalFailure: 'audio/fallimento_critico.mp3',
    poor: 'audio/tiro_pessimo.mp3',
    veryPoor: 'audio/tiro_poco_pessimo.mp3',
    mediocre: 'audio/tiro_medriocre.mp3',
    good: 'audio/tiro_ottimo.mp3',
    excellent: 'audio/tiro_molto_ottimo.mp3',
    criticalSuccess: 'audio/successo_critico.mp3'
  },
  TA: {
    criticalFailure: 'audio/fallimento_critico.mp3',
    poor: 'audio/tiro_pessimo.mp3',
    veryPoor: 'audio/tiro_poco_pessimo.mp3',
    mediocre: 'audio/tiro_medriocre.mp3',
    good: 'audio/tiro_ottimo.mp3',
    excellent: 'audio/tiro_molto_ottimo.mp3',
    criticalSuccess: 'audio/successo_critico.mp3'
  },
  TC: {
    criticalFailure: 'audio/fallimento_critico.mp3',
    poor: 'audio/tiro_pessimo.mp3',
    veryPoor: 'audio/tiro_poco_pessimo.mp3',
    mediocre: 'audio/tiro_medriocre.mp3',
    good: 'audio/tiro_ottimo.mp3',
    excellent: 'audio/tiro_molto_ottimo.mp3',
    criticalSuccess: 'audio/successo_critico.mp3'
  }
};
const AUDIO_POOL_SIZE = 3;
const criticalAudioPool = new Map();
const criticalAudioCursor = new Map();
let criticalAudioPreloaded = false;
let criticalAudioContext = null;
const criticalAudioBuffers = new Map();
let criticalAudioUnlockBound = false;
const criticalAudioActiveSources = new Map();

function toPublicAssetUrl(relativePath) {
  const baseUrl = import.meta.env.BASE_URL || '/';
  return new URL(relativePath, window.location.origin + baseUrl).toString();
}

function preloadCriticalAudio() {
  if (typeof window === 'undefined' || criticalAudioPreloaded) return;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (AudioCtx && !criticalAudioContext) {
    criticalAudioContext = new AudioCtx();
  }
  if (criticalAudioContext && !criticalAudioUnlockBound) {
    const unlock = () => {
      if (criticalAudioContext?.state === 'suspended') {
        criticalAudioContext.resume().catch(() => { });
      }
    };
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
    criticalAudioUnlockBound = true;
  }
  const uniqueFiles = new Set(
    Object.values(CRITICAL_AUDIO_FILES).flatMap((config) => Object.values(config))
  );
  uniqueFiles.forEach((filePath) => {
    const src = toPublicAssetUrl(filePath);
    if (criticalAudioPool.has(src)) return;
    const pool = Array.from({ length: AUDIO_POOL_SIZE }, () => {
      const audio = new window.Audio(src);
      audio.preload = 'auto';
      audio.load();
      return audio;
    });
    criticalAudioPool.set(src, pool);
    criticalAudioCursor.set(src, 0);
    if (criticalAudioContext) {
      fetch(src)
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => criticalAudioContext.decodeAudioData(arrayBuffer))
        .then((decoded) => {
          criticalAudioBuffers.set(src, decoded);
        })
        .catch(() => { });
    }
  });
  criticalAudioPreloaded = true;
}

export function warmupDiceEffectAudio() {
  preloadCriticalAudio();
}

function stopCriticalAudioPlayback() {
  criticalAudioPool.forEach((pool) => {
    pool.forEach((audio) => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch { }
    });
  });

  criticalAudioActiveSources.forEach(({ source, gainNode }) => {
    try {
      source.stop(0);
    } catch { }
    try {
      source.disconnect();
      gainNode.disconnect();
    } catch { }
  });
  criticalAudioActiveSources.clear();
}

function playCriticalAudio(type, currentRollType) {
  if (typeof window === 'undefined') return;
  const filePath = CRITICAL_AUDIO_FILES[currentRollType]?.[type] || null;
  stopCriticalAudioPlayback();
  if (filePath) {
    const src = toPublicAssetUrl(filePath);
    if (criticalAudioContext && criticalAudioBuffers.has(src)) {
      if (criticalAudioContext.state === 'suspended') {
        criticalAudioContext.resume().catch(() => { });
      }
      try {
        const source = criticalAudioContext.createBufferSource();
        const gainNode = criticalAudioContext.createGain();
        gainNode.gain.value = 1;
        source.buffer = criticalAudioBuffers.get(src);
        source.connect(gainNode);
        gainNode.connect(criticalAudioContext.destination);
        const sourceId = `${Date.now()}-${Math.random()}`;
        criticalAudioActiveSources.set(sourceId, { source, gainNode });
        source.onended = () => {
          criticalAudioActiveSources.delete(sourceId);
        };
        source.start(0);
        return;
      } catch { }
    }
    const pool = criticalAudioPool.get(src);
    if (pool?.length) {
      const nextIndex = criticalAudioCursor.get(src) ?? 0;
      const audio = pool[nextIndex];
      criticalAudioCursor.set(src, (nextIndex + 1) % pool.length);
      audio.pause();
      audio.currentTime = 0;
      void audio.play().catch(() => { });
      return;
    }
    const audio = new window.Audio(src);
    audio.preload = 'auto';
    audio.load();
    void audio.play().catch(() => { });
    return;
  }
  if (!window.AudioContext) return;

  const context = new window.AudioContext();
  const now = context.currentTime;
  const rollTypePresets = {
    TS: {
      criticalSuccess: { notes: [523.25, 659.25, 783.99], wave: 'triangle' },
      excellent: { notes: [493.88, 622.25, 739.99], wave: 'sine' },
      good: { notes: [440, 554.37, 659.25], wave: 'sine' },
      mediocre: { notes: [293.66, 329.63, 293.66], wave: 'triangle' },
      veryPoor: { notes: [261.63, 233.08, 220], wave: 'triangle' },
      poor: { notes: [246.94, 220, 196], wave: 'sawtooth' },
      criticalFailure: { notes: [220, 164.81, 130.81], wave: 'sawtooth' }
    },
    TA: {
      criticalSuccess: { notes: [659.25, 830.61, 987.77], wave: 'square' },
      excellent: { notes: [587.33, 739.99, 880], wave: 'triangle' },
      good: { notes: [523.25, 659.25, 783.99], wave: 'triangle' },
      mediocre: { notes: [329.63, 293.66, 261.63], wave: 'triangle' },
      veryPoor: { notes: [261.63, 233.08, 207.65], wave: 'sine' },
      poor: { notes: [220, 196, 174.61], wave: 'sine' },
      criticalFailure: { notes: [196, 146.83, 110], wave: 'triangle' }
    },
    TC: {
      criticalSuccess: { notes: [587.33, 739.99, 880], wave: 'sine' },
      excellent: { notes: [554.37, 698.46, 830.61], wave: 'triangle' },
      good: { notes: [493.88, 622.25, 739.99], wave: 'triangle' },
      mediocre: { notes: [311.13, 293.66, 261.63], wave: 'square' },
      veryPoor: { notes: [277.18, 246.94, 220], wave: 'sawtooth' },
      poor: { notes: [261.63, 233.08, 207.65], wave: 'sawtooth' },
      criticalFailure: { notes: [246.94, 185, 138.59], wave: 'square' }
    }
  };

  const preset = rollTypePresets[currentRollType]?.[type]
    || rollTypePresets.TC[type]
    || { notes: [220, 164.81, 130.81], wave: 'triangle' };

  preset.notes.forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = now + (index * 0.09);
    const duration = 0.16;
    oscillator.type = preset.wave;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.2, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration);
  });

  window.setTimeout(() => context.close(), 700);
}

function getRollMode(overlay) {
  const selected = overlay.querySelector('select[name="dice-roll-mode"]');
  return selected?.value ?? 'normal';
}

function updateDiceInput(overlay, value) {
  const input = overlay.querySelector('#textInput');
  if (input) {
    input.value = value;
    if (window.main && typeof window.main.setInput === 'function') {
      window.main.setInput();
    }
  }
}

function buildGenericNotation(overlay) {
  const countInput = overlay.querySelector('[name="dice-count"]');
  const max = countInput?.max ? Number(countInput.max) : null;
  const rawCount = Math.max(Number(countInput?.value) || 1, 1);
  const count = max && Number.isFinite(max) ? Math.min(rawCount, max) : rawCount;
  const type = overlay.querySelector('[name="dice-type"]')?.value || 'd20';
  return `${count}${type}`;
}

function syncGenericInputsFromNotation(overlay, value) {
  const match = String(value || '').trim().match(/^(\d+)\s*d\s*(\d+)$/i);
  if (!match) return;
  const countInput = overlay.querySelector('[name="dice-count"]');
  const typeInput = overlay.querySelector('[name="dice-type"]');
  if (countInput) countInput.value = match[1];
  if (typeInput) typeInput.value = `d${match[2]}`;
}

function scaleDiceNotation(value, multiplier = 2) {
  return String(value || '').replace(/(\d+)\s*d\s*(\d+)/gi, (_, count, sides) => `${Number(count) * multiplier}d${sides}`);
}


const QUICK_DICE_SIDES = [4, 6, 8, 10, 12, 20, 100];

function parseEditableDiceNotation(value) {
  const counts = new Map();
  let constant = 0;
  const expression = String(value || '').replace(/\s+/g, '');
  const tokenPattern = /([+-]?)(?:(\d*)d(\d+)|(\d+))/gi;
  let match;
  while ((match = tokenPattern.exec(expression))) {
    const sign = match[1] === '-' ? -1 : 1;
    if (match[3]) {
      const sides = Number(match[3]);
      const count = Number(match[2] || 1);
      if (Number.isFinite(sides) && sides > 0) {
        const current = counts.get(sides) || { positive: 0, negative: 0 };
        counts.set(sides, {
          positive: current.positive + (sign > 0 ? count : 0),
          negative: current.negative + (sign < 0 ? count : 0)
        });
      }
      continue;
    }
    if (match[4]) constant += sign * Number(match[4]);
  }
  return { counts, constant };
}

function stringifyEditableDiceNotation({ counts, constant }) {
  const orderedSides = [4, 6, 8, 10, 12, 20, 100];
  const extraSides = [...counts.keys()]
    .filter((sides) => !orderedSides.includes(sides))
    .sort((a, b) => a - b);
  const diceCounts = [...orderedSides, ...extraSides]
    .map((sides) => ({ sides, ...(counts.get(sides) || { positive: 0, negative: 0 }) }))
    .filter(({ positive, negative }) => positive > 0 || negative > 0);
  const positiveParts = diceCounts
    .filter(({ positive }) => positive > 0)
    .map(({ sides, positive }) => `${positive}d${sides}`);
  const negativeParts = diceCounts
    .filter(({ negative }) => negative > 0)
    .map(({ sides, negative }) => `-${negative}d${sides}`);

  const parts = [...positiveParts, ...negativeParts];
  if (constant) {
    parts.push(String(constant));
  }
  return parts.join('+').replace(/\+\-/g, '-');
}

function hasPositiveDice(counts) {
  return [...counts.values()].some(({ positive }) => positive > 0);
}

function canAddNegativeDie(counts, { guaranteedPositiveDice = false } = {}) {
  return guaranteedPositiveDice || hasPositiveDice(counts);
}

function cloneDiceCounts(counts) {
  return new Map([...counts].map(([sides, value]) => [sides, { ...value }]));
}


function refreshNotationSummary(notation) {
  const result = Array.isArray(notation?.result) ? notation.result : [];
  const constant = Number(notation?.constant) || 0;
  const resultTotal = result.reduce((sum, value) => sum + value, 0) + constant;
  let resultString = result.join(' ');
  if (constant) resultString += `${constant > 0 ? ' +' : ' -'}${Math.abs(constant)}`;
  if (result.length > 1 || constant) resultString += ` = ${resultTotal}`;
  notation.resultTotal = resultTotal;
  notation.resultString = resultString;
  return notation;
}

function formatDiceValues(values, { compactAfter = 8 } = {}) {
  const rolls = Array.isArray(values) ? values : [];
  if (!rolls.length) return 'nessun dado';
  const total = rolls.reduce((sum, value) => sum + value, 0);
  if (rolls.length > compactAfter) {
    return `${rolls.length} dadi, somma ${total}`;
  }
  return rolls
    .map((value, index) => {
      if (index === 0) return String(value);
      return value < 0 ? `- ${Math.abs(value)}` : `+ ${value}`;
    })
    .join(' ');
}

function resetLegacyDiceScene() {
  if (window.main && typeof window.main.clearDice === 'function') {
    window.main.clearDice();
  }
}

function setOverlayMode(overlay, mode) {
  overlay.dataset.diceMode = mode;
  overlay.querySelectorAll('[data-dice-control]').forEach((section) => {
    const shouldShow = section.dataset.diceControl === mode || section.dataset.diceControl === 'd20' && mode === 'd20';
    section.toggleAttribute('hidden', !shouldShow);
  });
}

export function openDiceOverlay({
  sides = 20,
  keepOpen = false,
  title = 'Lancia dadi',
  mode = 'generic',
  notation = null,
  modifier = null,
  selection = null,
  allowInspiration = false,
  onConsumeInspiration = null,
  rollType = null,
  weakPoints = 0,
  characterId = null,
  historyLabel = null,
  sneakAttackDice = null,
  genericDiceMax = null,
  warning = null,
  onRollComplete = null
} = {}) {
  if (typeof activeOverlaySessionCleanup === 'function') {
    activeOverlaySessionCleanup();
    activeOverlaySessionCleanup = null;
  }
  preloadCriticalAudio();
  overlaySessionToken += 1;
  const sessionToken = overlaySessionToken;
  if (!overlayEl) {
    overlayEl = document.createElement('div');
    overlayEl.id = 'dice-overlay';
    overlayEl.innerHTML = buildOverlayMarkup();
    document.body.appendChild(overlayEl);
    overlayEl.addEventListener('click', (e) => {
      if (e.target.closest('[data-close]')) closeDiceOverlay();
    });
    document.addEventListener('keydown', escClose, true);
  }

  const shortcutHost = document.querySelector('dialog.sheet-detail[open]');
  const overlayParent = shortcutHost || document.body;
  if (overlayEl.parentElement !== overlayParent) overlayParent.appendChild(overlayEl);
  const shortcutPanel = shortcutHost?.dataset?.sheetPanel || '';
  const returnsToRollShortcut = ['Attacchi', 'Tiri Abilità', 'Tiri salvezza'].includes(shortcutPanel);
  const exitLabel = overlayEl.querySelector('[data-dice-exit-label]');
  const exitIcon = overlayEl.querySelector('[data-dice-exit-icon]');
  const exitButton = overlayEl.querySelector('[data-dice-exit]');
  if (exitLabel) exitLabel.textContent = returnsToRollShortcut ? 'Indietro' : 'Chiudi';
  if (exitIcon) exitIcon.textContent = returnsToRollShortcut ? '←' : '×';
  if (exitButton) exitButton.setAttribute('aria-label', returnsToRollShortcut ? 'Torna alla shortcut' : 'Chiudi il lancia dadi');
  resetLegacyDiceScene();


  try {
    const res = overlayEl.querySelector('#result');
    if (res) res.textContent = '—';
    const lim = overlayEl.querySelector('#diceLimit');
    if (lim) lim.style.display = 'none';
  } catch { }

  overlayEl.querySelector('[data-dice-title]')?.replaceChildren(document.createTextNode(title));
  const overlayMode = mode === 'generic' ? 'generic' : 'd20';
  setOverlayMode(overlayEl, overlayMode);
  overlayEl.querySelector('[data-modifier-home]')?.toggleAttribute('hidden', overlayMode === 'generic');

  const inspirationInput = overlayEl.querySelector('input[name="dice-inspiration"]');
  const inspirationField = overlayEl.querySelector('[data-dice-inspiration]');
  const inspirationRow = inspirationField?.closest('.diceov-inspiration-row');
  const inspirationWarning = overlayEl.querySelector('[data-inspiration-warning]');
  const weaknessWarning = overlayEl.querySelector('[data-weakness-warning]');
  const rollModeWarning = overlayEl.querySelector('[data-rollmode-warning]');
  const autoFailWarning = overlayEl.querySelector('[data-autofail-warning]');
  const rollModeInput = overlayEl.querySelector('select[name="dice-roll-mode"]');
  const rollModeButtons = [...overlayEl.querySelectorAll('[data-roll-mode-option]')];
  const modifierInput = overlayEl.querySelector('input[name="dice-modifier"]');
  const modifierField = modifierInput?.closest('.diceov-field--modifier');
  const genericModifierInput = overlayEl.querySelector('input[name="dice-modifier-generic"]');
  const genericModifierField = genericModifierInput?.closest('.diceov-field--modifier');
  const genericOptions = overlayEl.querySelector('[data-dice-control="generic"]');
  const notationInput = overlayEl.querySelector('input[name="dice-notation"]');
  const selectWrapper = overlayEl.querySelector('[data-dice-select]');
  const selectLabel = overlayEl.querySelector('[data-dice-select-label]');
  const selectInput = overlayEl.querySelector('select[name="dice-roll-select"]');
  const resultValue = overlayEl.querySelector('[data-dice-result]');
  const resultDetail = overlayEl.querySelector('[data-dice-detail]');
  const criticalBanner = overlayEl.querySelector('[data-dice-critical-banner]');
  const buffWrapperD20 = overlayEl.querySelector('[data-dice-buff="d20"]');
  const buffSelectD20 = overlayEl.querySelector('select[name="dice-buff-d20"]');
  const buffWrapperDamage = overlayEl.querySelector('[data-dice-buff="damage"]');
  const buffSelectDamage = overlayEl.querySelector('select[name="dice-buff-damage"]');
  const tabletopEmpty = overlayEl.querySelector('[data-tabletop-empty]');
  const stage = overlayEl.querySelector('.diceov-stage');
  const historyAccordion = overlayEl.querySelector('[data-history-accordion]');
  const historyToggle = overlayEl.querySelector('[data-history-toggle]');
  const historyPanel = overlayEl.querySelector('[data-dice-history-panel]');
  const historyList = overlayEl.querySelector('[data-dice-history]');
  const criticalDamageField = overlayEl.querySelector('[data-critical-damage-field]');
  const criticalDamageInput = overlayEl.querySelector('input[name="dice-critical-damage"]');
  const sneakAttackField = overlayEl.querySelector('[data-sneak-attack-field]');
  const sneakAttackInput = overlayEl.querySelector('input[name="dice-sneak-attack"]');
  const customWarning = overlayEl.querySelector('[data-custom-warning]');
  const diceLimitWarning = overlayEl.querySelector('[data-dice-limit-warning]');
  const quickDiceControls = overlayEl.querySelector('[data-quick-dice]');
  const quickDiceContent = overlayEl.querySelector('[data-quick-dice-content]');
  const quickDiceToggle = overlayEl.querySelector('[data-quick-dice-toggle]');
  const diceResetButton = overlayEl.querySelector('[data-dice-reset]');
  const accordionRow = overlayEl.querySelector('[data-dice-accordion-row]');
  const rerollCard = overlayEl.querySelector('[data-reroll-card]');
  const rerollContent = overlayEl.querySelector('[data-reroll-content]');
  const rerollTray = overlayEl.querySelector('[data-reroll-tray]');
  const rerollStatus = overlayEl.querySelector('[data-reroll-status]');
  const rerollToggle = overlayEl.querySelector('[data-reroll-toggle]');

  const isDamageGenericRoll = rollType === 'DMG' && mode === 'generic';
  stage?.classList.toggle('diceov-stage--compact-roll', ['TC', 'TA', 'TS'].includes(rollType));
  stage?.classList.toggle('diceov-stage--generic-roll', mode === 'generic');
  stage?.classList.toggle('diceov-stage--damage-roll', isDamageGenericRoll);

  if (criticalBanner) {
    criticalBanner.setAttribute('hidden', '');
    criticalBanner.classList.remove('diceov-critical-banner--critical-failure', 'diceov-critical-banner--poor', 'diceov-critical-banner--very-poor', 'diceov-critical-banner--mediocre', 'diceov-critical-banner--good', 'diceov-critical-banner--excellent', 'diceov-critical-banner--critical-success');
    criticalBanner.textContent = '';
  }

  if (modifierInput) {
    attachNumberStepper(modifierInput, {
      decrementLabel: 'Riduci modificatore',
      incrementLabel: 'Aumenta modificatore'
    });
  }
  if (genericModifierInput) {
    attachNumberStepper(genericModifierInput, {
      decrementLabel: 'Riduci modificatore',
      incrementLabel: 'Aumenta modificatore'
    });
  }

  const state = {
    lastRoll: null,
    lastBuff: null,
    inspirationAvailable: Boolean(allowInspiration),
    inspirationConsumed: false,
    selectionOptions: Array.isArray(selection?.options) ? selection.options : [],
    history: loadHistory(characterId),
    selectionRollMode: null,
    selectionRollModeReason: null,
    extraDiceCounts: new Map(),
    quickDiceOpen: false,
    rerollOpen: false,
    lastCriticalSignature: null,
    rerollHint: null,
    pendingReroll: null,
    openingDefaults: null
  };

  function syncRollModeCards() {
    const activeMode = rollModeInput?.value || 'normal';
    const disabled = Boolean(rollModeInput?.disabled);
    rollModeButtons.forEach((button) => {
      const active = button.dataset.rollModeOption === activeMode;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
      button.disabled = disabled;
    });
  }

  rollModeButtons.forEach((button) => {
    button.onclick = () => {
      if (!rollModeInput || rollModeInput.disabled) return;
      const requestedMode = button.dataset.rollModeOption || 'normal';
      rollModeInput.value = rollModeInput.value === requestedMode ? 'normal' : requestedMode;
      rollModeInput.dispatchEvent(new Event('change', { bubbles: true }));
      syncRollModeCards();
    };
  });

  resetResult();
  state.lastCriticalSignature = null;

  const normalizedWeakPoints = Math.max(0, Number(weakPoints) || 0);
  const weaknessReason = (() => {
    if (rollType === 'TA' && normalizedWeakPoints >= 1) {
      return 'Svantaggio: punti indebolimento (prove di caratteristica).';
    }
    if ((rollType === 'TS' || rollType === 'TC') && normalizedWeakPoints >= 3) {
      return 'Svantaggio: punti indebolimento (tiri salvezza/colpire).';
    }
    return null;
  })();

  function getDefaultRollModeState() {
    const hasWeaknessDisadvantage = Boolean(weaknessReason);
    const selectionMode = state.selectionRollMode;
    const hasAdvantage = selectionMode === 'advantage';
    const hasDisadvantage = hasWeaknessDisadvantage || selectionMode === 'disadvantage';

    if (hasAdvantage && hasDisadvantage) {
      return {
        mode: 'normal',
        weaknessWarning: null,
        rollModeWarning: 'Vantaggio e svantaggio si annullano: tiro normale.'
      };
    }

    return {
      mode: hasDisadvantage ? 'disadvantage' : (hasAdvantage ? 'advantage' : 'normal'),
      weaknessWarning: hasDisadvantage ? weaknessReason : null,
      rollModeWarning: state.selectionRollModeReason
    };
  }

  function getActiveModifierInput() {
    return mode === 'generic' ? (genericModifierInput || modifierInput) : modifierInput;
  }

  function setModifierVisibility() {
    const hidePrimaryModifier = mode === 'generic';
    modifierField?.toggleAttribute('hidden', hidePrimaryModifier);
    genericModifierField?.toggleAttribute('hidden', !hidePrimaryModifier);
  }

  function clearCriticalBanner() {
    if (!criticalBanner) return;
    criticalBanner.setAttribute('hidden', '');
    criticalBanner.classList.remove('diceov-critical-banner--critical-failure', 'diceov-critical-banner--poor', 'diceov-critical-banner--very-poor', 'diceov-critical-banner--mediocre', 'diceov-critical-banner--good', 'diceov-critical-banner--excellent', 'diceov-critical-banner--critical-success');
    criticalBanner.textContent = '';
  }

  function isRerollSupported() {
    return rollType === 'DMG' && mode === 'generic';
  }

  function syncDiceLimitWarning() {
    const legacyLimit = overlayEl.querySelector('#diceLimit');
    const limitVisible = Boolean(legacyLimit && legacyLimit.style.display !== 'none');
    if (legacyLimit) legacyLimit.style.display = 'none';
    if (diceLimitWarning) diceLimitWarning.toggleAttribute('hidden', !limitVisible);
  }

  function resetResult(label = '—', detail = 'Lancia per vedere i dettagli.') {
    if (resultValue) resultValue.textContent = label;
    if (resultDetail) resultDetail.textContent = detail;
    state.lastRoll = null;
    state.lastBuff = null;
    state.rerollHint = null;
    state.pendingReroll = null;
    renderRerollTray(null);
  }

  function showCriticalBanner(tier, { playAudio = false, signature = null } = {}) {
    if (!criticalBanner) return;
    if (!tier) {
      clearCriticalBanner();
      state.lastCriticalSignature = null;
      return;
    }
    const tierPresentation = {
      criticalFailure: {
        message: '☠️ Fallimento critico',
        className: 'diceov-critical-banner--critical-failure'
      },
      poor: {
        message: '💀 Pessimo',
        className: 'diceov-critical-banner--poor'
      },
      veryPoor: {
        message: '😬 Molto male',
        className: 'diceov-critical-banner--very-poor'
      },
      mediocre: {
        message: '😐 Mediocre',
        className: 'diceov-critical-banner--mediocre'
      },
      good: {
        message: '✨ Ottimo',
        className: 'diceov-critical-banner--good'
      },
      excellent: {
        message: '🏆 Eccellente',
        className: 'diceov-critical-banner--excellent'
      },
      criticalSuccess: {
        message: '🌟 Successo critico',
        className: 'diceov-critical-banner--critical-success'
      }
    };
    const presentation = tierPresentation[tier];
    if (!presentation) {
      clearCriticalBanner();
      return;
    }
    criticalBanner.classList.remove('diceov-critical-banner--critical-failure', 'diceov-critical-banner--poor', 'diceov-critical-banner--very-poor', 'diceov-critical-banner--mediocre', 'diceov-critical-banner--good', 'diceov-critical-banner--excellent', 'diceov-critical-banner--critical-success');
    criticalBanner.textContent = presentation.message;
    criticalBanner.classList.add(presentation.className);
    criticalBanner.removeAttribute('hidden');
    if (playAudio && signature && signature !== state.lastCriticalSignature) {
      playCriticalAudio(tier, rollType);
    }
    state.lastCriticalSignature = signature;
  }

  function getCriticalTier(info) {
    if (!['TS', 'TA', 'TC'].includes(rollType)) return null;
    if (typeof info?.picked !== 'number') return null;
    if (info.picked === 1) return 'criticalFailure';
    if (info.picked >= 2 && info.picked <= 4) return 'poor';
    if (info.picked >= 5 && info.picked <= 7) return 'veryPoor';
    if (info.picked >= 8 && info.picked <= 13) return 'mediocre';
    if (info.picked >= 14 && info.picked <= 17) return 'good';
    if (info.picked >= 18 && info.picked <= 19) return 'excellent';
    if (info.picked === 20) return 'criticalSuccess';
    return null;
  }

  function renderHistory() {
    if (!historyList) return;
    if (!state.history.length) {
      historyList.innerHTML = '<p class="diceov-history-empty">Nessun tiro ancora.</p>';
      return;
    }
    historyList.innerHTML = state.history
      .map((entry) => `
        <div class="diceov-history-row">
          <div class="diceov-history-type diceov-history-type--${String(entry.type || 'gen').toLowerCase()}">
            <span class="diceov-history-type-code">${entry.type || '—'}</span>
            ${entry.subtype ? `<span class="diceov-history-subtype">${entry.subtype}</span>` : ''}
            ${entry.context ? `<span class="diceov-history-subtype">${entry.context}</span>` : ''}
            ${entry.inspired ? '<span class="diceov-history-flag">Isp.</span>' : ''}
          </div>
          <span class="diceov-history-rollmode">${entry.rollModeLabel || '—'}</span>
          <span class="diceov-history-total">${entry.total ?? '—'}</span>
          <span class="diceov-history-date">${formatHistoryDate(entry.timestamp)}</span>
        </div>
      `)
      .join('');
  }

  function addHistoryEntry(entry) {
    state.history = [entry, ...state.history].slice(0, HISTORY_LIMIT);
    saveHistory(state.history, characterId);
    renderHistory();
  }

  function updateInspiration() {
    if (!rollModeInput) return;
    const inspired = Boolean(inspirationInput?.checked);
    if (inspired) {
      const currentMode = getRollMode(overlayEl);
      rollModeInput.value = currentMode === 'disadvantage' ? 'normal' : 'advantage';
    } else {
      applyDefaultRollMode();
    }
    rollModeInput.disabled = inspired;
    syncRollModeCards();
    if (inspirationWarning) inspirationWarning.toggleAttribute('hidden', !inspired);
    updateWeaknessWarning();
    updateRollModeWarning();
  }

  function setInspirationAvailability(available) {
    state.inspirationAvailable = Boolean(available);
    if (inspirationRow) inspirationRow.toggleAttribute('hidden', !state.inspirationAvailable);
    if (inspirationField) inspirationField.toggleAttribute('hidden', !state.inspirationAvailable);
    if (inspirationInput) {
      inspirationInput.checked = false;
      inspirationInput.disabled = !state.inspirationAvailable;
    }
    if (!state.inspirationAvailable && rollModeInput) {
      rollModeInput.disabled = false;
    }
    syncRollModeCards();
    if (!state.inspirationAvailable && inspirationWarning) {
      inspirationWarning.setAttribute('hidden', '');
    }
  }

  function setSelectionOptions() {
    if (!selectWrapper || !selectInput) return;
    if (!state.selectionOptions.length) {
      selectWrapper.setAttribute('hidden', '');
      selectInput.innerHTML = '';
      state.selectionRollMode = null;
      state.selectionRollModeReason = null;
      if (autoFailWarning) autoFailWarning.setAttribute('hidden', '');
      return;
    }
    selectWrapper.removeAttribute('hidden');
    if (selectLabel) selectLabel.textContent = selection?.label || 'Seleziona';
    selectInput.innerHTML = state.selectionOptions
      .map((option) => `
        <option value="${option.value}" ${option.disabled ? 'disabled' : ''}>${option.label}</option>
      `)
      .join('');
    const availableOptions = state.selectionOptions.filter((option) => !option.disabled);
    const desiredValue = selection?.value ?? availableOptions[0]?.value ?? state.selectionOptions[0]?.value;
    if (desiredValue !== undefined) selectInput.value = desiredValue;
    const selected = state.selectionOptions.find((option) => option.value === selectInput.value);
    if (selected && !selected.disabled && modifierInput) {
      modifierInput.value = Number(selected.modifier) || 0;
    }
    state.selectionRollMode = selected?.disabled ? null : (selected?.rollMode || null);
    state.selectionRollModeReason = selected?.disabled ? null : (selected?.rollModeReason || null);
    if (selectInput) selectInput.disabled = availableOptions.length === 0;
    if (['TC', 'TA', 'TS'].includes(rollType)) selectWrapper.setAttribute('hidden', '');
    updateAutoFailWarning();
  }

  function updateAutoFailWarning() {
    if (!autoFailWarning) return;
    const disabledOptions = state.selectionOptions.filter((option) => option.disabled && option.disabledReason);
    if (!disabledOptions.length) {
      autoFailWarning.setAttribute('hidden', '');
      autoFailWarning.textContent = '';
      return;
    }
    const labels = disabledOptions
      .map((option) => option.shortLabel || option.label || option.value)
      .filter(Boolean)
      .join(', ');
    const reasons = [...new Set(disabledOptions.map((option) => option.disabledReason).filter(Boolean))];
    const reasonText = reasons.length ? ` (${reasons.join('; ')})` : '';
    autoFailWarning.textContent = `TS ${labels}: fallimento diretto${reasonText}.`;
    autoFailWarning.removeAttribute('hidden');
  }

  function updateWeaknessWarning() {
    if (!weaknessWarning) return;
    const defaults = getDefaultRollModeState();
    const shouldShow = Boolean(defaults.weaknessWarning) && getRollMode(overlayEl) === 'disadvantage';
    weaknessWarning.textContent = defaults.weaknessWarning ?? '';
    weaknessWarning.toggleAttribute('hidden', !shouldShow);
  }

  function updateRollModeWarning() {
    if (!rollModeWarning) return;
    const defaults = getDefaultRollModeState();
    const mode = getRollMode(overlayEl);
    const shouldShow = Boolean(defaults.rollModeWarning)
      && defaults.mode === mode;
    rollModeWarning.textContent = defaults.rollModeWarning ?? '';
    rollModeWarning.toggleAttribute('hidden', !shouldShow);
  }

  function applyDefaultRollMode() {
    if (!rollModeInput) return;
    const defaults = getDefaultRollModeState();
    rollModeInput.value = defaults.mode;
    syncRollModeCards();
    updateWeaknessWarning();
    updateRollModeWarning();
    updateNotationFromMode();
  }

  function getActiveBuffElements() {
    const isDamage = rollType === 'DMG' && mode === 'generic';
    if (isDamage) {
      return { wrapper: buffWrapperDamage, select: buffSelectDamage };
    }
    return { wrapper: buffWrapperD20, select: buffSelectD20 };
  }

  function setBuffVisibility() {
    const isSupported = ['TS', 'TA', 'TC', 'DMG'].includes(rollType);
    const isDamage = rollType === 'DMG' && mode === 'generic';
    if (buffWrapperD20) buffWrapperD20.toggleAttribute('hidden', !(isSupported && !isDamage));
    if (buffWrapperDamage) buffWrapperDamage.toggleAttribute('hidden', !(isSupported && isDamage));
    if (buffSelectD20) buffSelectD20.value = 'none';
    if (buffSelectDamage) buffSelectDamage.value = 'none';
    if (!isSupported) {
      state.lastBuff = null;
    }
  }

  function getBuffConfig() {
    const { wrapper, select } = getActiveBuffElements();
    if (!select || wrapper?.hasAttribute('hidden')) return null;
    const choice = select.value;
    if (choice === 'none') return null;
    const sides = choice.endsWith('d6') ? 6 : 4;
    const isPositive = choice.startsWith('plus');
    const label = `${isPositive ? '+' : '-'}d${sides}`;
    return { choice, sides, label, sign: isPositive ? 1 : -1 };
  }

  function getD20RollInfo(notation) {
    const rolls = notation.result || [];
    const rollMode = getRollMode(overlayEl);
    const baseCount = rollMode === 'normal' ? 1 : 2;
    const baseRolls = rolls.slice(0, baseCount);
    const extraRolls = rolls.slice(baseCount);
    const extraDiceTotal = extraRolls.reduce((sum, value) => sum + (Number(value) || 0), 0);
    const picked = baseRolls.length
      ? rollMode === 'advantage'
        ? Math.max(...baseRolls)
        : rollMode === 'disadvantage'
          ? Math.min(...baseRolls)
          : baseRolls[0]
      : null;
    return { rollMode, baseRolls, picked, extraRolls, extraDiceTotal, buff: null };
  }

  function getGenericRollInfo(notation) {
    const rolls = notation.result || [];
    const buffConfig = getBuffConfig();
    if (buffConfig && rolls.length) {
      const buffRoll = rolls[rolls.length - 1];
      if (typeof buffRoll === 'number') {
        return {
          baseRolls: rolls.slice(0, -1),
          buff: { ...buffConfig, roll: buffRoll, delta: buffConfig.sign * buffRoll }
        };
      }
    }
    return { baseRolls: rolls, buff: null };
  }

  function setHistoryOpen(open) {
    if (!historyAccordion || !historyToggle || !historyPanel) return;
    historyAccordion.classList.toggle('is-open', open);
    historyAccordion.toggleAttribute('hidden', !open);
    historyToggle.setAttribute('aria-expanded', String(open));
    historyToggle.setAttribute('aria-label', open ? 'Chiudi storico tiri' : 'Apri storico tiri');
    historyPanel.toggleAttribute('hidden', !open);
    stage?.classList.toggle('diceov-stage--history-open', open);
    if (open) {
      const header = overlayEl.querySelector('.diceov-header');
      const historyHost = historyAccordion.closest('.diceov-panel');
      if (header && historyHost) {
        const offset = Math.max(
          header.getBoundingClientRect().bottom - historyHost.getBoundingClientRect().top,
          0
        );
        historyAccordion.style.setProperty('--diceov-history-offset', `${offset}px`);
      }
    }
  }

  function setRerollOpen(open) {
    state.rerollOpen = Boolean(open);
    rerollCard?.classList.toggle('is-open', state.rerollOpen);
    rerollToggle?.setAttribute('aria-expanded', String(state.rerollOpen));
    rerollContent?.toggleAttribute('hidden', !state.rerollOpen);
  }

  function setQuickDiceOpen(open) {
    state.quickDiceOpen = Boolean(open);
    quickDiceControls?.classList.toggle('is-open', state.quickDiceOpen);
    quickDiceToggle?.setAttribute('aria-expanded', String(state.quickDiceOpen));
    quickDiceContent?.toggleAttribute('hidden', !state.quickDiceOpen);
  }

  function syncTabletopEmptyState(value = '') {
    const isEmpty = mode === 'generic' && !String(value).trim();
    tabletopEmpty?.toggleAttribute('hidden', !isEmpty);
    overlayEl.querySelector('.diceov-tabletop')?.classList.toggle('is-empty', isEmpty);
  }

  function getSelectionLabel() {
    if (!selectInput) return null;
    const selected = state.selectionOptions.find((option) => option.value === selectInput.value);
    if (!selected) return null;
    const rawLabel = selected.shortLabel || selected.label || '';
    return rawLabel.replace(/\s*\([^)]*\)\s*$/, '').trim() || null;
  }

  function updateNotationFromMode() {
    if (mode !== 'generic') {
      const rollMode = getRollMode(overlayEl);
      const diceCount = rollMode === 'normal' ? 1 : 2;
      const extraNotation = stringifyEditableDiceNotation({ counts: state.extraDiceCounts, constant: 0 });
      const extraSeparator = extraNotation && !extraNotation.startsWith('-') ? '+' : '';
      const fullNotation = `${diceCount}d${sides}${extraNotation ? `${extraSeparator}${extraNotation}` : ''}`;
      if (notationInput) notationInput.value = fullNotation;
      updateDiceInput(overlayEl, fullNotation);
      syncTabletopEmptyState('d20');
      syncDiceLimitWarning();
      resetResult();
    }
  }

  function updateNotationFromGeneric() {
    const notation = notationInput?.value?.trim();
    const sneakDice = String(sneakAttackDice || '').trim();
    const isDamageRoll = rollType === 'DMG' && mode === 'generic';
    const addSneak = isDamageRoll && sneakAttackInput?.checked && sneakDice;
    const baseRaw = notation;
    const combinedBase = addSneak ? `${baseRaw}${sneakDice.startsWith('-') ? '' : '+'}${sneakDice}` : baseRaw;
    const baseValue = isDamageRoll && criticalDamageInput?.checked ? scaleDiceNotation(combinedBase, 2) : combinedBase;
    const value = baseValue;
    updateDiceInput(overlayEl, value);
    syncTabletopEmptyState(value);
    syncDiceLimitWarning();
    resetResult();
  }

  function updateModifier() {
    if (state.lastRoll) renderRollResult(state.lastRoll, { playCriticalSound: false });
  }

  function resetToOpeningDefaults() {
    const defaults = state.openingDefaults;
    if (!defaults) return;

    if (selectInput && defaults.selectionValue !== null) {
      selectInput.value = defaults.selectionValue;
      const selected = state.selectionOptions.find((option) => option.value === selectInput.value);
      state.selectionRollMode = selected?.disabled ? null : (selected?.rollMode || null);
      state.selectionRollModeReason = selected?.disabled ? null : (selected?.rollModeReason || null);
    }
    if (modifierInput) modifierInput.value = defaults.modifier;
    if (genericModifierInput) genericModifierInput.value = defaults.genericModifier;
    if (criticalDamageInput) criticalDamageInput.checked = defaults.criticalDamage;
    if (sneakAttackInput) sneakAttackInput.checked = defaults.sneakAttack;
    state.extraDiceCounts = cloneDiceCounts(defaults.extraDiceCounts);

    if (inspirationInput) inspirationInput.checked = state.inspirationAvailable && defaults.inspiration;
    if (rollModeInput) rollModeInput.value = defaults.rollMode;
    syncRollModeCards();
    updateWeaknessWarning();
    updateRollModeWarning();
    if (inspirationWarning) inspirationWarning.toggleAttribute('hidden', !inspirationInput?.checked);

    if (mode === 'generic') {
      if (notationInput) notationInput.value = defaults.notation;
      syncGenericInputsFromNotation(overlayEl, defaults.notation);
      updateNotationFromGeneric();
    } else {
      updateNotationFromMode();
    }
  }

  async function consumeInspiration() {
    if (!state.inspirationAvailable || state.inspirationConsumed) return;
    if (!inspirationInput?.checked) return;
    state.inspirationConsumed = true;
    setInspirationAvailability(false);
    if (typeof onConsumeInspiration === 'function') {
      await onConsumeInspiration();
    }
  }

  function getRerollableDice(notation) {
    const rolls = Array.isArray(notation?.result) ? notation.result : [];
    const diceSet = Array.isArray(notation?.set) ? notation.set : [];
    if (!rolls.length || !diceSet.length) return [];
    if (mode !== 'generic') {
      const info = getD20RollInfo(notation);
      const baseCount = info.rollMode === 'normal' ? 1 : 2;
      return rolls.slice(0, baseCount).map((value, index) => ({
        index,
        value,
        type: diceSet[index] || `d${sides}`,
        label: info.rollMode === 'normal' ? `d${sides}` : `${index + 1}° d${sides}`
      }));
    }
    const info = getGenericRollInfo(notation);
    return info.baseRolls.map((value, index) => ({
      index,
      value,
      type: diceSet[index] || 'd20',
      label: diceSet[index] || 'd20'
    }));
  }


  function renderRerollTray(notation) {
    if (!rerollTray) return;
    if (!isRerollSupported()) {
      rerollTray.innerHTML = '';
      rerollCard?.setAttribute('hidden', '');
      return;
    }
    rerollCard?.removeAttribute('hidden');
    const dice = notation ? getRerollableDice(notation) : [];
    if (!dice.length) {
      rerollTray.innerHTML = '';
      if (rerollStatus) {
        rerollStatus.textContent = 'Lancia i dadi per scegliere cosa ritirare.';
        rerollStatus.removeAttribute('hidden');
      }
      return;
    }
    rerollTray.innerHTML = `
      ${dice.map((die) => `
        <button class="diceov-reroll-die${state.pendingReroll?.index === die.index ? ' is-pending' : ''}" type="button" data-reroll-index="${die.index}" aria-label="Prepara ritiro ${die.label} con risultato ${die.value}">
          <span class="diceov-reroll-die-type">${die.label.toUpperCase()}</span>
          <span class="diceov-reroll-die-value">${die.value}</span>
        </button>
      `).join('')}
    `;
    if (rerollStatus) {
      rerollStatus.textContent = state.rerollHint || 'Tocca un dado, poi swipe per ritirarlo.';
      rerollStatus.removeAttribute('hidden');
    }
    rerollCard?.removeAttribute('hidden');
    setRerollOpen(state.rerollOpen);
  }

  function prepareSwipeReroll(index) {
    if (!state.lastRoll || !Array.isArray(state.lastRoll.result)) return;
    const dice = getRerollableDice(state.lastRoll);
    const die = dice.find((entry) => entry.index === index);
    if (!die) return;
    const currentInput = state.pendingReroll?.returnInput || overlayEl.querySelector('#textInput')?.value || null;
    state.pendingReroll = {
      ...die,
      sign: Number(state.lastRoll.signs?.[index]) || 1,
      previousValue: state.lastRoll.result[index],
      returnInput: currentInput
    };
    state.rerollHint = `Swipe sul tavolo per ritirare ${die.label.toUpperCase()} (${die.value}).`;
    setRerollOpen(true);
    const shortcutHost = document.querySelector('dialog.sheet-detail[open]');
  const overlayParent = shortcutHost || document.body;
  if (overlayEl.parentElement !== overlayParent) overlayParent.appendChild(overlayEl);
  resetLegacyDiceScene();
    updateDiceInput(overlayEl, `1${die.type}`);
    renderRollResult(state.lastRoll, { playCriticalSound: false });
  }

  function completePendingReroll(rolledNotation) {
    const pending = state.pendingReroll;
    if (!pending || !state.lastRoll || !Array.isArray(state.lastRoll.result)) return false;
    if (!rolledNotation || hasInvalidRolls(rolledNotation)) {
      state.rerollHint = 'Ritiro non valido: riprova con uno swipe sul tavolo.';
      renderRollResult(state.lastRoll, { playCriticalSound: false });
      return true;
    }
    const rolledValue = Array.isArray(rolledNotation.result) ? rolledNotation.result[0] : null;
    if (typeof rolledValue !== 'number') {
      state.rerollHint = 'Ritiro non valido: riprova con uno swipe sul tavolo.';
      renderRollResult(state.lastRoll, { playCriticalSound: false });
      return true;
    }
    const nextValue = rolledValue * pending.sign;
    state.lastRoll.result[pending.index] = nextValue;
    refreshNotationSummary(state.lastRoll);
    state.pendingReroll = null;
    state.rerollHint = `${pending.label.toUpperCase()} ritirato: ${pending.previousValue} → ${nextValue}`;
    if (pending.returnInput) updateDiceInput(overlayEl, pending.returnInput);
    renderRollResult(state.lastRoll, { playCriticalSound: true });
    return true;
  }

  function renderRollResult(notation, { playCriticalSound = false } = {}) {
    if (hasInvalidRolls(notation)) {
      resetResult('—', 'Lancio non valido, rilancia i dadi.');
      return;
    }
    const modifier = Number(getActiveModifierInput()?.value) || 0;
    if (mode !== 'generic') {
      const info = getD20RollInfo(notation);
      state.lastBuff = info.buff;
      if (!info.baseRolls.length) {
        resetResult();
        return;
      }
      const criticalTier = getCriticalTier(info);
      const criticalSignature = criticalTier
        ? `${rollType || 'GEN'}:${criticalTier}:${info.rollMode}:${info.baseRolls.join(',')}:${info.picked}`
        : null;
      showCriticalBanner(criticalTier, { playAudio: playCriticalSound, signature: criticalSignature });
      const total = (info.picked ?? 0) + modifier + info.extraDiceTotal;
      const rollLabel = info.rollMode === 'advantage'
        ? 'Vantaggio'
        : info.rollMode === 'disadvantage'
          ? 'Svantaggio'
          : 'Normale';
      const rollsLabel = formatDiceValues(info.baseRolls, { compactAfter: 4 });
      if (resultValue) resultValue.textContent = `${total}`;
      if (resultDetail) {
        const selection = info.baseRolls.length > 1 ? ` (selezionato ${info.picked})` : '';
        const pieces = [`${rollLabel}: ${rollsLabel}${selection}`, `Modificatore ${formatModifier(modifier)}`];
        if (info.extraRolls.length) pieces.push(`Dadi aggiunti: ${formatDiceValues(info.extraRolls)}`);
        resultDetail.textContent = pieces.join(' · ');
      }
      renderRerollTray(notation);
      return;
    }

    showCriticalBanner(null, { signature: null });

    const info = getGenericRollInfo(notation);
    state.lastBuff = info.buff;
    const diceTotal = info.baseRolls.reduce((sum, value) => sum + value, 0);
    const constant = Number(notation.constant) || 0;
    const buffDelta = info.buff?.delta || 0;
    const total = diceTotal + constant + modifier + buffDelta;
    const rollDetail = info.baseRolls.length
      ? `Tiro dadi: ${formatDiceValues(info.baseRolls)}`
      : 'Tiro dadi: —';
    if (resultValue) resultValue.textContent = `${total}`;
    if (resultDetail) {
      const pieces = [rollDetail];
      if (constant) pieces.push(`Bonus fisso ${formatModifier(constant)}`);
      if (modifier) pieces.push(`Modificatore ${formatModifier(modifier)}`);
      if (info.buff) {
        pieces.push(
          `${info.buff.label} ${formatModifier(info.buff.delta)} (d${info.buff.sides}: ${info.buff.roll})`
        );
      }
      resultDetail.textContent = pieces.join(' · ');
    }
    renderRerollTray(notation);
  }

  function summarizeRoll(notation) {
    if (hasInvalidRolls(notation)) return null;
    const modifier = Number(getActiveModifierInput()?.value) || 0;
    if (mode !== 'generic') {
      const info = getD20RollInfo(notation);
      state.lastBuff = info.buff;
      if (!info.baseRolls.length) return null;
      return { value: info.picked, total: (info.picked ?? 0) + modifier + info.extraDiceTotal };
    }
    const info = getGenericRollInfo(notation);
    state.lastBuff = info.buff;
    const diceTotal = info.baseRolls.reduce((sum, value) => sum + value, 0);
    const constant = Number(notation.constant) || 0;
    const buffDelta = info.buff?.delta || 0;
    const value = diceTotal + constant;
    return { value, total: value + modifier + buffDelta };
  }

  function getHistoryRollModeLabel() {
    const currentRollMode = getRollMode(overlayEl);
    if (['TS', 'TA', 'TC'].includes(rollType)) {
      if (currentRollMode === 'advantage') return 'Vantaggio';
      if (currentRollMode === 'disadvantage') return 'Svantaggio';
      return 'Normale';
    }
    if ((rollType === 'GEN' || rollType === null) && ['advantage', 'disadvantage'].includes(currentRollMode)) {
      return currentRollMode === 'advantage' ? 'Vantaggio' : 'Svantaggio';
    }
    return null;
  }

  if (inspirationInput) {
    inspirationInput.onchange = () => {
      updateInspiration();
      updateNotationFromMode();
    };
  }
  if (rollModeInput) {
    rollModeInput.onchange = () => {
      syncRollModeCards();
      updateWeaknessWarning();
      updateRollModeWarning();
      updateNotationFromMode();
    };
  }
  if (modifierInput) modifierInput.oninput = updateModifier;
  if (genericModifierInput) genericModifierInput.oninput = updateModifier;
  if (notationInput) notationInput.oninput = () => {
    if (mode === 'generic') {
      updateNotationFromGeneric();
      return;
    }
    const parsed = parseEditableDiceNotation(notationInput.value);
    const baseDiceCount = getRollMode(overlayEl) === 'normal' ? 1 : 2;
    const baseSides = Number(sides);
    const enteredBase = parsed.counts.get(baseSides) || { positive: 0, negative: 0 };
    parsed.counts.set(baseSides, {
      ...enteredBase,
      positive: Math.max(enteredBase.positive - baseDiceCount, 0)
    });
    state.extraDiceCounts = parsed.counts;
    updateNotationFromMode();
  };
  if (criticalDamageInput) criticalDamageInput.onchange = updateNotationFromGeneric;
  if (sneakAttackInput) sneakAttackInput.onchange = updateNotationFromGeneric;
  if (selectInput) {
    selectInput.onchange = () => {
      const selected = state.selectionOptions.find((option) => option.value === selectInput.value);
      if (selected && !selected.disabled && modifierInput) modifierInput.value = Number(selected.modifier) || 0;
      state.selectionRollMode = selected?.disabled ? null : (selected?.rollMode || null);
      state.selectionRollModeReason = selected?.disabled ? null : (selected?.rollModeReason || null);
      if (!inspirationInput?.checked) {
        applyDefaultRollMode();
      }
      updateModifier();
    };
  }
  const diceCountInput = overlayEl.querySelector('[name="dice-count"]');
  if (diceCountInput) diceCountInput.oninput = () => {
    const notation = buildGenericNotation(overlayEl);
    if (notationInput) notationInput.value = notation;
    updateNotationFromGeneric();
  };
  const diceTypeInput = overlayEl.querySelector('[name="dice-type"]');
  if (diceTypeInput) diceTypeInput.onchange = () => {
    const notation = buildGenericNotation(overlayEl);
    if (notationInput) notationInput.value = notation;
    updateNotationFromGeneric();
  };
  const handleBuffChange = () => {
    state.lastBuff = null;
    if (mode === 'generic') {
      updateNotationFromGeneric();
    } else {
      updateNotationFromMode();
    }
  };
  if (buffSelectD20) buffSelectD20.onchange = handleBuffChange;
  if (buffSelectDamage) buffSelectDamage.onchange = handleBuffChange;

  if (quickDiceControls) {
    quickDiceControls.onclick = (event) => {
      const button = event.target.closest('[data-quick-die]');
      if (!button) return;
      const die = Number(button.dataset.quickDie);
      if (!QUICK_DICE_SIDES.includes(die)) return;
      const action = button.dataset.quickDieAction;
      if (mode !== 'generic') {
        const current = state.extraDiceCounts.get(die) || { positive: 0, negative: 0 };
        if (action === 'decrement' && !canAddNegativeDie(state.extraDiceCounts, { guaranteedPositiveDice: true })) return;
        state.extraDiceCounts.set(die, {
          positive: current.positive + (action === 'increment' ? 1 : 0),
          negative: current.negative + (action === 'decrement' ? 1 : 0)
        });
        updateNotationFromMode();
        return;
      }
      if (!notationInput) return;
      const parsed = parseEditableDiceNotation(notationInput.value);
      const current = parsed.counts.get(die) || { positive: 0, negative: 0 };
      if (action === 'decrement' && !canAddNegativeDie(parsed.counts)) return;
      parsed.counts.set(die, {
        positive: current.positive + (action === 'increment' ? 1 : 0),
        negative: current.negative + (action === 'decrement' ? 1 : 0)
      });
      notationInput.value = stringifyEditableDiceNotation(parsed);
      syncGenericInputsFromNotation(overlayEl, notationInput.value);
      updateNotationFromGeneric();
    };
  }

  if (rerollTray) {
    rerollTray.onclick = (event) => {
      const button = event.target.closest('[data-reroll-index]');
      if (!button) return;
      prepareSwipeReroll(Number(button.dataset.rerollIndex));
    };
  }

  if (quickDiceToggle) {
    quickDiceToggle.onclick = () => setQuickDiceOpen(!state.quickDiceOpen);
  }

  if (diceResetButton) {
    diceResetButton.onclick = resetToOpeningDefaults;
  }

  if (rerollToggle) {
    rerollToggle.onclick = () => setRerollOpen(!state.rerollOpen);
  }

  if (historyToggle) {
    historyToggle.onclick = () => {
      const shouldOpen = !historyAccordion?.classList.contains('is-open');
      setHistoryOpen(shouldOpen);
    };
  }
  const historyCloseButton = overlayEl.querySelector('[data-history-close]');
  if (historyCloseButton) historyCloseButton.onclick = () => setHistoryOpen(false);

  setSelectionOptions();
  setBuffVisibility();
  const showQuickDice = mode === 'generic' || ['TC', 'TA', 'TS'].includes(rollType);
  const showReroll = isRerollSupported();
  if (quickDiceControls) quickDiceControls.toggleAttribute('hidden', !showQuickDice);
  if (rerollCard) rerollCard.toggleAttribute('hidden', !showReroll);
  const quickDiceInitiallyOpen = mode === 'generic' && rollType !== 'DMG';
  setQuickDiceOpen(quickDiceInitiallyOpen);
  setRerollOpen(false);
  accordionRow?.toggleAttribute('hidden', !(showQuickDice || showReroll));
  accordionRow?.classList.toggle('diceov-accordion-row--single', !(showQuickDice && showReroll));
  if (criticalDamageField) criticalDamageField.toggleAttribute('hidden', !isDamageGenericRoll);
  if (criticalDamageInput) criticalDamageInput.checked = false;
  const hasSneakAttack = Boolean(String(sneakAttackDice || '').trim());
  if (sneakAttackField) sneakAttackField.toggleAttribute('hidden', !(isDamageGenericRoll && hasSneakAttack));
  if (sneakAttackInput) sneakAttackInput.checked = false;
  if (genericOptions) genericOptions.toggleAttribute('hidden', !(isDamageGenericRoll));
  setInspirationAvailability(state.inspirationAvailable);
  applyDefaultRollMode();
  updateInspiration();
  setModifierVisibility();
  renderHistory();
  setHistoryOpen(false);
  if (customWarning) {
    customWarning.textContent = warning ? String(warning) : '';
    customWarning.toggleAttribute('hidden', !warning);
  }
  if (diceLimitWarning) diceLimitWarning.setAttribute('hidden', '');

  overlayEl.removeAttribute('hidden');

  const hasExplicitModifier = modifier !== null && modifier !== undefined && modifier !== '';
  const activeModifierInput = getActiveModifierInput();
  const hasSelectionDefaults = mode !== 'generic' && state.selectionOptions.some((option) => !option.disabled);
  if (modifierInput && !hasExplicitModifier && !hasSelectionDefaults) modifierInput.value = '0';
  if (genericModifierInput && !hasExplicitModifier) genericModifierInput.value = '0';
  if (activeModifierInput && hasExplicitModifier && Number.isFinite(Number(modifier))) {
    activeModifierInput.value = Number(modifier);
  }
  if (notationInput) {
    notationInput.value = '';
    notationInput.placeholder = mode === 'generic' ? 'Nessun dado selezionato' : '1d20';
  }

  if (mode === 'generic') {
    const diceCountInput = overlayEl.querySelector('[name="dice-count"]');
    const diceTypeInput = overlayEl.querySelector('[name="dice-type"]');
    if (diceCountInput) {
      diceCountInput.value = '1';
      if (genericDiceMax && Number.isFinite(Number(genericDiceMax))) {
        diceCountInput.max = String(Math.max(Number(genericDiceMax), 1));
      } else {
        diceCountInput.removeAttribute('max');
      }
    }
    if (diceTypeInput) diceTypeInput.value = 'd20';
    if (genericModifierInput && !hasExplicitModifier) {
      genericModifierInput.value = '0';
    }
    if (notationInput && notation) {
      notationInput.value = String(notation).trim();
      syncGenericInputsFromNotation(overlayEl, notationInput.value);
    }
    updateNotationFromGeneric();
  } else {
    updateNotationFromMode();
  }

  state.openingDefaults = {
    notation: notationInput?.value || '',
    modifier: modifierInput?.value || '0',
    genericModifier: genericModifierInput?.value || '0',
    rollMode: rollModeInput?.value || 'normal',
    selectionValue: selectInput?.value ?? null,
    inspiration: Boolean(inspirationInput?.checked),
    criticalDamage: Boolean(criticalDamageInput?.checked),
    sneakAttack: Boolean(sneakAttackInput?.checked),
    extraDiceCounts: cloneDiceCounts(state.extraDiceCounts)
  };

  ensureLegacyDiceAssets()
    .then(() => {
      if (sessionToken !== overlaySessionToken) return;
      if (!legacyDiceInitialized && window.main && typeof window.main.init === 'function') {
        window.main.init();
        legacyDiceInitialized = true;
      }
      const shortcutHost = document.querySelector('dialog.sheet-detail[open]');
  const overlayParent = shortcutHost || document.body;
  if (overlayEl.parentElement !== overlayParent) overlayParent.appendChild(overlayEl);
  resetLegacyDiceScene();
      if (window.main && typeof window.main.setInput === 'function') {
        window.main.setInput();
      }
    })
    .catch((error) => {
      console.error(error);
    });

  let last = null;

  let resolveFn;
  const waitForRoll = new Promise((resolve) => {
    resolveFn = resolve;
  });

  function cleanup() {
  }

  const onRoll = (event) => {
    if (!overlayEl || overlayEl.hasAttribute('hidden')) return;
    const rolledNotation = event.detail ? refreshNotationSummary(event.detail) : null;
    if (state.pendingReroll) {
      completePendingReroll(rolledNotation);
      return;
    }
    state.lastRoll = rolledNotation;
    state.lastBuff = null;
    state.rerollHint = null;
    if (state.lastRoll) {
      if (hasInvalidRolls(state.lastRoll)) {
        resetResult('—', 'Lancio non valido, rilancia i dadi.');
        return;
      }
      void consumeInspiration();
      renderRollResult(state.lastRoll, { playCriticalSound: true });
    }
    if (state.lastRoll) {
      const summary = summarizeRoll(state.lastRoll);
      if (summary) {
        last = summary.total;
        if (typeof onRollComplete === 'function') {
          onRollComplete({
            total: summary.total,
            value: summary.value,
            notation: state.lastRoll,
            diceCount: Array.isArray(state.lastRoll?.result) ? state.lastRoll.result.length : 0
          });
        }
        if (!keepOpen) closeDiceOverlay();
        resolveFn?.(summary.total);
        resolveFn = null;

        const subtype = getSelectionLabel();
        const hasDuplicatedContext = normalizeHistoryLabel(subtype) && normalizeHistoryLabel(subtype) === normalizeHistoryLabel(historyLabel);
        addHistoryEntry({
          type: rollType || 'GEN',
          subtype,
          context: hasDuplicatedContext ? null : historyLabel,
          inspired: state.inspirationConsumed,
          rollModeLabel: getHistoryRollModeLabel(),
          value: summary.value,
          total: summary.total,
          timestamp: new Date().toISOString()
        });
      }
    }
  };
  window.addEventListener('diceRoll', onRoll);

  const closeRef = closeDiceOverlay;
  const closeSession = () => {
    cleanup();
    window.removeEventListener('diceRoll', onRoll);
    activeOverlaySessionCleanup = null;
  };
  activeOverlaySessionCleanup = closeSession;
  closeDiceOverlay = function () {
    overlaySessionToken += 1;
    closeSession();
    if (overlayEl) overlayEl.setAttribute('hidden', '');
    const shortcutHost = document.querySelector('dialog.sheet-detail[open]');
  const overlayParent = shortcutHost || document.body;
  if (overlayEl.parentElement !== overlayParent) overlayParent.appendChild(overlayEl);
  resetLegacyDiceScene();

    if (last == null) resolveFn?.(null);

    closeDiceOverlay = closeRef;
  };

  return {
    waitForRoll,
    close: () => { cleanup(); closeDiceOverlay(); }
  };
}

function escClose(e) {
  if (e.key === 'Escape' && overlayEl && !overlayEl.hasAttribute('hidden')) {
    e.preventDefault();
    e.stopImmediatePropagation();
    closeDiceOverlay();
  }
}


export function updateDiceOverlayWarning(message = null) {
  if (!overlayEl || overlayEl.hasAttribute('hidden')) return;
  const customWarning = overlayEl.querySelector('[data-custom-warning]');
  if (!customWarning) return;
  customWarning.textContent = message ? String(message) : '';
  customWarning.toggleAttribute('hidden', !message);
}

export function closeDiceOverlay() {
  overlaySessionToken += 1;
  if (typeof activeOverlaySessionCleanup === 'function') {
    activeOverlaySessionCleanup();
    activeOverlaySessionCleanup = null;
  }
  if (!overlayEl) return;
  overlayEl.setAttribute('hidden', '');
  const shortcutHost = document.querySelector('dialog.sheet-detail[open]');
  const overlayParent = shortcutHost || document.body;
  if (overlayEl.parentElement !== overlayParent) overlayParent.appendChild(overlayEl);
  resetLegacyDiceScene();
}
