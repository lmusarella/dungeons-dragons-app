export const weaponMasteries2024 = [
  {
    key: 'cleave',
    label: 'Fendente (Cleave)',
    summary: 'Una volta per turno, dopo un colpo in mischia, attacca una seconda creatura entro 1,5 m dal bersaglio e nella tua portata; il secondo danno non aggiunge il modificatore, salvo se negativo.'
  },
  {
    key: 'graze',
    label: 'Di striscio (Graze)',
    summary: 'Se manchi, infliggi comunque danni del tipo dell’arma pari al modificatore usato per il tiro; il danno aumenta solo aumentando quel modificatore.'
  },
  {
    key: 'nick',
    label: 'Colpo rapido (Nick)',
    summary: 'Una volta per turno, l’attacco extra della proprietà Leggera può essere incluso nell’azione Attacco invece di richiedere un’azione bonus.'
  },
  {
    key: 'push',
    label: 'Spingere (Push)',
    summary: 'Quando colpisci una creatura Grande o più piccola, puoi spingerla fino a 3 m lontano da te.'
  },
  {
    key: 'sap',
    label: 'Fiaccare (Sap)',
    summary: 'Quando colpisci una creatura, il suo prossimo tiro per colpire prima dell’inizio del tuo prossimo turno ha svantaggio.'
  },
  {
    key: 'slow',
    label: 'Rallentare (Slow)',
    summary: 'Quando colpisci e infliggi danni, puoi ridurre la velocità del bersaglio di 3 m fino all’inizio del tuo prossimo turno; più colpi non sommano la riduzione.'
  },
  {
    key: 'topple',
    label: 'Abbattere (Topple)',
    summary: 'Quando colpisci, puoi imporre un TS Costituzione (CD 8 + modificatore usato per l’attacco + competenza); se fallisce, il bersaglio cade prono.'
  },
  {
    key: 'vex',
    label: 'Incalzare (Vex)',
    summary: 'Quando colpisci e infliggi danni, hai vantaggio al prossimo tiro per colpire contro quel bersaglio prima della fine del tuo prossimo turno.'
  }
];

export const weaponMasteryOptions = [
  { value: '', label: 'Nessuna' },
  ...weaponMasteries2024.map((mastery) => ({ value: mastery.key, label: mastery.label }))
];

export const weaponMasteryByKey = new Map(weaponMasteries2024.map((mastery) => [mastery.key, mastery]));

export function getWeaponMasteryLabel(key) {
  return weaponMasteryByKey.get(key)?.label || key || '';
}

export function getWeaponMasterySummary(key) {
  return weaponMasteryByKey.get(key)?.summary || '';
}
