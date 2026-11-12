const ABILITIES = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
const ABILITY_NAMES = { strength: 'str', dexterity: 'dex', constitution: 'con', intelligence: 'int', wisdom: 'wis', charisma: 'cha' };
const FUNCTIONS = {
  min: (...args) => Math.min(...args),
  max: (...args) => Math.max(...args),
  floor: (value) => Math.floor(value),
  ceil: (value) => Math.ceil(value),
  round: (value) => Math.round(value),
  abs: (value) => Math.abs(value)
};

export const abilityModifier = (score) => Math.floor(((Number(score) || 10) - 10) / 2);
export const proficiencyBonusForLevel = (level) => 2 + Math.floor((Math.max(1, Number(level) || 1) - 1) / 4);

/**
 * Variabili disponibili alle formule del catalogo. Le caratteristiche sono ammesse solo nelle forme
 * esplicite `<abilita>_mod` / `<abilita>_modifier`: un nome nudo come `wis` e' ambiguo e non viene interpretato.
 * @param {{ level?: number, classLevel?: number, proficiencyBonus?: number, abilities?: Record<string, number> }} input
 */
export function buildFormulaContext({ level = 1, classLevel, proficiencyBonus, abilities = {} } = {}) {
  const variables = {
    level: Number(level) || 1,
    class_level: Number(classLevel ?? level) || 1,
    character_level: Number(level) || 1,
    proficiency_bonus: Number(proficiencyBonus) || proficiencyBonusForLevel(level)
  };
  variables.prof = variables.proficiency_bonus;
  variables.pb = variables.proficiency_bonus;
  ABILITIES.forEach((key) => {
    const hasScore = abilities[key] !== null && abilities[key] !== undefined && abilities[key] !== '';
    if (!hasScore) return;
    const modifier = abilityModifier(abilities[key]);
    variables[`${key}_mod`] = modifier;
    variables[`${key}_modifier`] = modifier;
    variables[`${key}_score`] = Number(abilities[key]);
  });
  Object.entries(ABILITY_NAMES).forEach(([name, key]) => {
    ['mod', 'modifier', 'score'].forEach((suffix) => {
      if (`${key}_${suffix}` in variables) variables[`${name}_${suffix}`] = variables[`${key}_${suffix}`];
    });
  });
  return variables;
}

const normalizeIdentifier = (name) => String(name).replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase().replace(/[\s-]+/g, '_');

function tokenize(text) {
  const tokens = [];
  const pattern = /\s*(?:(\d+(?:\.\d+)?)|([A-Za-z_][A-Za-z0-9_]*)|([-+*/%(),×÷]))/y;
  let index = 0;
  const source = String(text);
  while (index < source.length) {
    pattern.lastIndex = index;
    const match = pattern.exec(source);
    if (!match) {
      if (!source.slice(index).trim()) break;
      return null;
    }
    index = pattern.lastIndex;
    if (match[1] !== undefined) tokens.push({ type: 'number', value: Number(match[1]) });
    else if (match[2] !== undefined) tokens.push({ type: 'name', value: match[2] });
    else tokens.push({ type: 'op', value: match[3] === '×' ? '*' : match[3] === '÷' ? '/' : match[3] });
  }
  return tokens;
}

/**
 * Valuta una formula aritmetica senza eval. Restituisce `null` se la formula non e' supportata
 * o usa variabili sconosciute: in tal caso il valore NON deve essere inventato.
 * @param {unknown} formula
 * @param {Record<string, number>} variables
 * @returns {number|null}
 */
export function evaluateFormula(formula, variables = {}) {
  if (typeof formula === 'number') return Number.isFinite(formula) ? formula : null;
  if (typeof formula !== 'string' || !formula.trim()) return null;
  const tokens = tokenize(formula);
  if (!tokens?.length) return null;
  let position = 0;
  let failed = false;
  const peek = () => tokens[position];
  const take = () => tokens[position++];
  const fail = () => { failed = true; return 0; };

  const parseExpression = () => {
    let value = parseTerm();
    while (!failed && peek()?.type === 'op' && ['+', '-'].includes(peek().value)) {
      const operator = take().value;
      const right = parseTerm();
      value = operator === '+' ? value + right : value - right;
    }
    return value;
  };
  const parseTerm = () => {
    let value = parseUnary();
    while (!failed && peek()?.type === 'op' && ['*', '/', '%'].includes(peek().value)) {
      const operator = take().value;
      const right = parseUnary();
      if (operator !== '*' && right === 0) return fail();
      value = operator === '*' ? value * right : operator === '/' ? value / right : value % right;
    }
    return value;
  };
  const parseUnary = () => {
    if (peek()?.type === 'op' && peek().value === '-') { take(); return -parseUnary(); }
    if (peek()?.type === 'op' && peek().value === '+') { take(); return parseUnary(); }
    return parsePrimary();
  };
  const parsePrimary = () => {
    const token = take();
    if (!token) return fail();
    if (token.type === 'number') return token.value;
    if (token.type === 'op' && token.value === '(') {
      const value = parseExpression();
      if (take()?.value !== ')') return fail();
      return value;
    }
    if (token.type === 'name') {
      const name = normalizeIdentifier(token.value);
      if (peek()?.value === '(') {
        const fn = FUNCTIONS[name];
        if (!fn) return fail();
        take();
        const args = [];
        if (peek()?.value !== ')') {
          do { args.push(parseExpression()); } while (!failed && peek()?.value === ',' && take());
        }
        if (take()?.value !== ')' || !args.length) return fail();
        return fn(...args);
      }
      return name in variables && Number.isFinite(variables[name]) ? variables[name] : fail();
    }
    return fail();
  };
  const result = parseExpression();
  return failed || position !== tokens.length || !Number.isFinite(result) ? null : result;
}

const VALUE_KEYS = ['value', 'max', 'uses', 'amount', 'points', 'total', 'count'];
const WRAPPER_KEYS = ['levels', 'by_level', 'byLevel', 'values', 'progression', 'table', 'class_level', 'by_class_level'];

function entryValue(entry, variables) {
  if (typeof entry === 'number' || typeof entry === 'string') return evaluateFormula(entry, variables);
  if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
    const key = VALUE_KEYS.find((candidate) => entry[candidate] !== undefined);
    return key ? entryValue(entry[key], variables) : null;
  }
  return null;
}

/**
 * Risolve una progressione per livello (`max_progression`): oggetto { livello: valore }, array indicizzato
 * dal livello 1 oppure array di { level, value }. Usa il livello di classe pertinente.
 * @returns {number|null}
 */
export function resolveProgression(progression, level, variables = {}) {
  if (progression === null || progression === undefined || progression === '') return null;
  if (typeof progression === 'string') {
    try { return resolveProgression(JSON.parse(progression), level, variables); } catch { return evaluateFormula(progression, variables); }
  }
  if (typeof progression === 'number') return progression;
  const target = Math.max(1, Number(level) || 1);
  if (Array.isArray(progression)) {
    if (progression.every((entry) => entry && typeof entry === 'object' && !Array.isArray(entry) && ('level' in entry || 'livello' in entry))) {
      const candidates = progression.map((entry) => ({ level: Number(entry.level ?? entry.livello), entry })).filter((row) => row.level <= target).sort((a, b) => b.level - a.level);
      return candidates.length ? entryValue(candidates[0].entry, variables) : null;
    }
    if (!progression.length) return null;
    return entryValue(progression[Math.min(target, progression.length) - 1], variables);
  }
  if (typeof progression !== 'object') return null;
  const wrapper = WRAPPER_KEYS.find((key) => progression[key] !== undefined && Object.keys(progression).length === 1);
  if (wrapper) return resolveProgression(progression[wrapper], level, variables);
  const levels = Object.keys(progression).filter((key) => /^\d+$/.test(key)).map(Number).filter((key) => key <= target).sort((a, b) => b - a);
  if (!levels.length) return null;
  return entryValue(progression[String(levels[0])], variables);
}

/**
 * Valore di recupero ad un riposo: `0` nessuno, `1` un utilizzo, `all` il massimo, altrimenti formula.
 * Restituisce `undefined` se il dato manca o non e' interpretabile (mai un valore inventato).
 * @returns {number|undefined}
 */
export function resolveRecovery(formula, max, variables = {}) {
  if (formula === null || formula === undefined || String(formula).trim() === '') return undefined;
  const text = String(formula).trim().toLowerCase();
  if (text === 'all' || text === 'max' || text === 'tutti') return Math.max(0, Number(max) || 0);
  const value = evaluateFormula(text, variables);
  if (value === null) return undefined;
  return Math.max(0, Math.min(Math.floor(value), Math.max(0, Number(max) || 0)));
}
