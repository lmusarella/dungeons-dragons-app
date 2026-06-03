export const weaponMasteries2024 = [
  {
    key: 'cleave',
    label: 'Cleave',
    summary: 'Dopo aver colpito, puoi fare un attacco extra contro una seconda creatura entro 1,5 m dal bersaglio originale e dalla tua portata.'
  },
  {
    key: 'graze',
    label: 'Graze',
    summary: 'Se manchi con un attacco, infliggi comunque danni pari al modificatore di caratteristica usato per il tiro.'
  },
  {
    key: 'nick',
    label: 'Nick',
    summary: 'Quando fai l’attacco extra della proprietà Leggera, puoi includerlo nell’azione Attacco invece di usare l’azione bonus.'
  },
  {
    key: 'push',
    label: 'Push',
    summary: 'Quando colpisci una creatura Grande o più piccola, puoi spingerla fino a 3 m lontano da te.'
  },
  {
    key: 'sap',
    label: 'Sap',
    summary: 'Quando colpisci una creatura, il suo prossimo tiro per colpire prima dell’inizio del tuo prossimo turno ha svantaggio.'
  },
  {
    key: 'slow',
    label: 'Slow',
    summary: 'Quando colpisci e infliggi danni, puoi ridurre la velocità del bersaglio di 3 m fino all’inizio del tuo prossimo turno.'
  },
  {
    key: 'topple',
    label: 'Topple',
    summary: 'Quando colpisci, il bersaglio deve superare un TS Costituzione o cadere prono.'
  },
  {
    key: 'vex',
    label: 'Vex',
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
