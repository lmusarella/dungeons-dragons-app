export function catalogName(entity, fallback = '') {
  return String(entity?.name_it || entity?.name || fallback || '').trim();
}

export function catalogDescription(entity, fallback = '') {
  return String(entity?.description_it || entity?.description || fallback || '').trim();
}

export function catalogStatBlock(entity) {
  return entity?.stat_block_it ?? entity?.stat_block ?? null;
}
