import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

function extractNamedExports(source) {
  const names = new Set();
  const functionRegex = /export\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g;
  const constRegex = /export\s+const\s+([A-Za-z_$][\w$]*)\s*=/g;
  let match;
  while ((match = functionRegex.exec(source)) !== null) names.add(match[1]);
  while ((match = constRegex.exec(source)) !== null) names.add(match[1]);
  return [...names];
}

describe('src/features/dice-roller/overlay/dice.js', () => {
  it('defines module-level API surface', () => {
    const source = readFileSync('src/features/dice-roller/overlay/dice.js', 'utf8');
    const exports = extractNamedExports(source);
    expect(source.trim().length).toBeGreaterThan(40);
    expect(exports.length).toBeGreaterThan(0);
    exports.forEach((name) => {
      expect(source).toContain(`export`);
      expect(source).toContain(name);
    });
  });
  it('uses a shortcut-sized workspace for every roll mode', () => {
    const source = readFileSync('src/features/dice-roller/overlay/dice.js', 'utf8');
    const styles = readFileSync('src/features/dice-roller/styles.css', 'utf8');
    expect(source).toContain("classList.toggle('diceov-stage--generic-roll', mode === 'generic')");
    expect(styles).toMatch(/\.diceov-stage--generic-roll,\s*\.diceov-stage--damage-roll\s*\{\s*width:\s*min\(1180px,/s);
    expect(source).toContain('diceov-tabletop');
    expect(source).not.toContain('class="diceov-close"');
  });

  it('does not invalidate an active overlay session during audio warmup', () => {
    const source = readFileSync('src/features/dice-roller/overlay/dice.js', 'utf8');
    const warmup = source.slice(
      source.indexOf('export function warmupDiceEffectAudio'),
      source.indexOf('function stopCriticalAudioPlayback')
    );
    expect(warmup).toContain('preloadCriticalAudio()');
    expect(warmup).not.toContain('overlaySessionToken += 1');
  });

  it('uses the application visual language for the roller surface', () => {
    const source = readFileSync('src/features/dice-roller/overlay/dice.js', 'utf8');
    const styles = readFileSync('src/features/dice-roller/styles.css', 'utf8');
    expect(source).toContain('diceov-header__identity');
    expect(source).toContain('Configura il tiro, poi trascina sul tavolo.');
    expect(styles).toContain('Dice roller application theme');
    expect(styles).toContain('--diceov-plum: #71364c');
    expect(styles).toContain('grid-template-columns: repeat(3, minmax(0, 1fr))');
    expect(source).toContain('setQuickDiceOpen(quickDiceInitiallyOpen)');
  });

  it('uses contextual exit actions, mode cards and a dark roll history', () => {
    const source = readFileSync('src/features/dice-roller/overlay/dice.js', 'utf8');
    const styles = readFileSync('src/features/dice-roller/styles.css', 'utf8');
    expect(source).toContain("returnsToRollShortcut ? 'Indietro' : 'Chiudi'");
    expect(source).toContain('data-roll-mode-option="advantage"');
    expect(source).toContain('data-roll-mode-option="disadvantage"');
    expect(styles).toContain('.diceov-mode-card.is-active');
    expect(styles).toMatch(/\.diceov-history-accordion\.is-open\s*\{[\s\S]*background:\s*linear-gradient\(155deg,\s*#34212c,\s*#20161d/);
  });

  it('starts a generic roll empty and replaces buff controls with quick dice', () => {
    const source = readFileSync('src/features/dice-roller/overlay/dice.js', 'utf8');
    expect(source).not.toContain('Buff/Debuff');
    expect(source).toContain('Scegli almeno un dado');
    expect(source).toContain("const showQuickDice = mode === 'generic' || ['TC', 'TA', 'TS'].includes(rollType)");
    expect(source).toContain("notationInput.value = ''");
    expect(source).toContain("toggleAttribute('hidden', overlayMode === 'generic')");
  });

  it('keeps notation in quick dice and overlays roll feedback on the tabletop', () => {
    const source = readFileSync('src/features/dice-roller/overlay/dice.js', 'utf8');
    const styles = readFileSync('src/features/dice-roller/styles.css', 'utf8');
    expect(source).toContain('class="diceov-quick-notation"');
    expect(source).not.toContain('Puoi combinare dadi diversi');
    expect(source).toContain('class="diceov-tabletop-feedback"');
    expect(styles).toContain('.diceov-tabletop-feedback .diceov-result--final');
    expect(styles).toContain('.diceov-stage--compact-roll .diceov-roll-mode-control > .diceov-label');
    expect(styles).toContain('.diceov-inspiration-row > .diceov-warning');
  });

  it('uses deselectable advantage states and keeps contextual modifiers with notation', () => {
    const source = readFileSync('src/features/dice-roller/overlay/dice.js', 'utf8');
    const styles = readFileSync('src/features/dice-roller/styles.css', 'utf8');
    expect(source).not.toContain('data-roll-mode-option="normal"');
    expect(source).toContain("rollModeInput.value === requestedMode ? 'normal' : requestedMode");
    expect(source).toContain('diceov-quick-config');
    expect(source).toContain('data-quick-modifier="d20"');
    expect(styles).toContain('.diceov-stage--compact-roll .diceov-selection-control');
    expect(styles).toContain('background: rgba(255, 250, 241, .34)');
  });

  it('aligns quick-dice controls and keeps tabletop feedback on one line', () => {
    const styles = readFileSync('src/features/dice-roller/styles.css', 'utf8');
    expect(styles).toContain('grid-template-columns: minmax(0, 1fr) 144px');
    expect(styles).toContain("appearance: textfield");
    expect(styles).toContain('place-items: center');
    expect(styles).toMatch(/\.diceov-tabletop-feedback \.diceov-result--final\s*\{[\s\S]*?flex-wrap:\s*nowrap/);
    expect(styles).toMatch(/\.diceov-generic-row > \.diceov-control\s*\{[\s\S]*?display:\s*inline-flex/);
  });

  it('keeps roll notation above the quick dice and collapses contextual add-dice controls', () => {
    const source = readFileSync('src/features/dice-roller/overlay/dice.js', 'utf8');
    const styles = readFileSync('src/features/dice-roller/styles.css', 'utf8');
    expect(source.indexOf('diceov-roll-config')).toBeLessThan(source.indexOf('class="diceov-results"'));
    expect(source).toContain('if (notationInput) notationInput.value = fullNotation');
    expect(source).toContain("const quickDiceInitiallyOpen = mode === 'generic' && rollType !== 'DMG'");
    expect(source).not.toContain("pieces.join(' · ')} =");
    expect(styles).toMatch(/\.diceov-quick-notation\s*\{[\s\S]*?text-transform:\s*none/);
  });

  it('uses a unified rounded modifier control with readable spacing', () => {
    const source = readFileSync('src/features/dice-roller/overlay/dice.js', 'utf8');
    const styles = readFileSync('src/features/dice-roller/styles.css', 'utf8');
    expect(source).toContain('for="dice-modifier">Modificatore</label>');
    expect(styles).toMatch(/\.diceov-quick-notation\s*\{[\s\S]*?gap:\s*8px/);
    expect(styles).toMatch(/\.diceov-quick-config \.diceov-field--modifier \.number-stepper\s*\{[\s\S]*?border-radius:\s*12px/);
    expect(styles).toContain('.number-stepper:focus-within');
  });

});
