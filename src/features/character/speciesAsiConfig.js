export const ABILITY_KEYS = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

export const ABILITY_LABELS_IT = {
  str: 'Forza', dex: 'Destrezza', con: 'Costituzione', int: 'Intelligenza', wis: 'Saggezza', cha: 'Carisma'
};

/**
 * Manuali 2014 in cui le specie non hanno incrementi fissi ma la distribuzione
 * personalizzata. Ogni sorgente elenca gli schemi ammessi (pesi sulle caratteristiche,
 * tutte diverse tra loro). Per correggere la regola di un manuale basta modificare questa tabella.
 */
export const FLEXIBLE_PATTERNS = [
  { id: 'flex-2-1', weights: [2, 1] },
  { id: 'flex-1-1-1', weights: [1, 1, 1] }
];

export const SOURCE_ASI_RULES = {
  MPMM: { flexible: true, patterns: FLEXIBLE_PATTERNS },
  AAG: { flexible: true, patterns: FLEXIBLE_PATTERNS },
  FTD: { flexible: true, patterns: FLEXIBLE_PATTERNS },
  VRGR: { flexible: true, patterns: FLEXIBLE_PATTERNS },
  WBTW: { flexible: true, patterns: FLEXIBLE_PATTERNS },
  DSOTDQ: { flexible: true, patterns: FLEXIBLE_PATTERNS },
  SCC: { flexible: true, patterns: FLEXIBLE_PATTERNS }
};

/** Regole opzionali: disattivate di default, da abilitare per campagna. */
export const DEFAULT_ASI_RULES = Object.freeze({ tashaCustomOrigin: false });

export const TASHA_PATTERNS = FLEXIBLE_PATTERNS;

export const KNOWN_SOURCE_CODES = Object.keys(SOURCE_ASI_RULES);
