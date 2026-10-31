export function normalizeSpellSource(value) {
  return String(value || '')
    .trim()
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ');
}

export function spellSourceKey(value) {
  return normalizeSpellSource(value).toLocaleLowerCase('it');
}

export function groupSpellSources(values = []) {
  const groups = new Map();
  values.forEach((value) => {
    const rawValue = String(value || '').trim();
    const key = spellSourceKey(rawValue);
    if (!key) return;
    const current = groups.get(key) || { key, label: normalizeSpellSource(rawValue), values: [] };
    if (!current.values.includes(rawValue)) current.values.push(rawValue);
    groups.set(key, current);
  });
  return [...groups.values()].sort((left, right) => left.label.localeCompare(right.label, 'it'));
}

export function expandSpellSourceSelection(groups = [], selectedKeys = new Set()) {
  return groups
    .filter((group) => selectedKeys.has(group.key))
    .flatMap((group) => group.values);
}
