export function catalogName(entity, fallback = '') {
  return String(entity?.name_it || entity?.name || fallback || '').trim();
}

export function catalogDescription(entity, fallback = '') {
  return String(entity?.description_it || entity?.description || fallback || '').trim();
}

export function catalogStatBlock(entity) {
  return entity?.stat_block_it ?? entity?.stat_block ?? null;
}

const SOURCE_LABELS_IT = {
  PHB: 'Manuale del Giocatore (2014)',
  XPHB: 'Manuale del Giocatore (2024)',
  DMG: 'Guida del Dungeon Master (2014)',
  XDMG: 'Guida del Dungeon Master (2024)',
  MM: 'Manuale dei Mostri (2014)',
  XMM: 'Manuale dei Mostri (2025)',
  TCE: 'Il Calderone Omnicomprensivo di Tasha',
  XGE: 'Guida Omnicomprensiva di Xanathar',
  SCAG: 'Guida dell’Avventuriero alla Costa della Spada',
  VGM: 'Guida di Volo ai Mostri',
  MTF: 'Tomo dei Nemici di Mordenkainen',
  MPMM: 'Mordenkainen presenta: Mostri del Multiverso',
  FTD: 'Il Tesoro dei Draghi di Fizban',
  ERLW: 'Eberron: Rinascita dopo l’Ultima Guerra',
  EFA: 'Eberron: Forgia dell’Artefice',
  EFOTA: 'Eberron: Forgia dell’Artefice',
  MOT: 'Odissee Mitiche di Theros',
  VRGR: 'Guida di Van Richten a Ravenloft',
  SCC: 'Strixhaven: Un Curriculum di Caos',
  BMT: 'Il Libro delle Molte Cose',
  UA: 'Arcani Rivelati',
  SRD: 'Documento di Riferimento del Sistema',
  BASICRULES: 'Regole Base'
};

export function catalogSourceLabel(source) {
  const original = String(source || '').trim();
  if (!original) return '';
  const code = original.replace(/[\s_-]+/g, '').toUpperCase();
  const label = SOURCE_LABELS_IT[code];
  return label ? `${label} (${original.toUpperCase()})` : original;
}
