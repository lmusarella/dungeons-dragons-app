export const spellSchoolLabels = Object.freeze([
  'Abiurazione',
  'Ammaliamento',
  'Divinazione',
  'Evocazione',
  'Illusione',
  'Invocazione',
  'Necromanzia',
  'Trasmutazione'
]);

function schoolKey(value) {
  return String(value || '').trim().toLocaleLowerCase('it');
}

export function normalizeSpellSchool(value) {
  const rawValue = String(value || '').trim();
  if (!rawValue) return '';
  return spellSchoolLabels.find((school) => schoolKey(school) === schoolKey(rawValue)) || rawValue;
}

export function isKnownSpellSchool(value) {
  const normalized = normalizeSpellSchool(value);
  return spellSchoolLabels.includes(normalized);
}

export function spellSchoolsEqual(left, right) {
  return schoolKey(left) === schoolKey(right);
}
