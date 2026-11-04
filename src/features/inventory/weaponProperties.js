export const weaponPropertyOptions = [
  {
    value: 'due_mani',
    label: 'Due Mani',
    description: 'Richiede due mani per attaccare, ma non semplicemente per reggerla.'
  },
  {
    value: 'lancio',
    label: 'Lancio',
    description: 'Può essere lanciata per effettuare un attacco a distanza usando la caratteristica prevista dall’arma.'
  },
  {
    value: 'gittata',
    label: 'Gittata',
    description: 'Indica gittata normale e lunga. Oltre la gittata normale l’attacco ha svantaggio; oltre quella lunga non è possibile attaccare.'
  },
  {
    value: 'leggera',
    label: 'Leggera',
    description: 'È piccola e maneggevole, adatta al combattimento con due armi.'
  },
  {
    value: 'munizioni',
    label: 'Munizioni',
    description: 'Richiede una munizione per ogni attacco; estrarla fa parte dell’attacco e ricaricare un’arma a una mano richiede una mano libera.'
  },
  {
    value: 'pesante',
    label: 'Pesante',
    description: 'La taglia e l’ingombro rendono l’arma difficile da usare efficacemente per le creature Piccole.'
  },
  {
    value: 'portata',
    label: 'Portata',
    description: 'Aumenta la portata dell’attacco e quella degli attacchi di opportunità effettuati con l’arma.'
  },
  {
    value: 'accurata',
    label: 'Accurata',
    description: 'Permette di scegliere Forza o Destrezza per i tiri per colpire e per i danni, usando la stessa caratteristica per entrambi.'
  },
  {
    value: 'ricarica',
    label: 'Ricarica',
    description: 'Consente di sparare una sola munizione per azione, azione bonus o reazione, indipendentemente dal numero di attacchi disponibili.'
  },
  {
    value: 'speciale',
    label: 'Speciale',
    description: 'Segue regole particolari descritte nelle note o nella descrizione dell’arma.'
  },
  {
    value: 'versatile',
    label: 'Versatile',
    description: 'Può essere usata con una o due mani; la modalità a due mani può usare un dado di danno differente.'
  },
  {
    value: 'monaco',
    label: 'Monaco',
    description: 'È compatibile con le regole che richiedono un’arma da monaco.'
  }
];

export const weaponPropertyMap = new Map(weaponPropertyOptions.map((property) => [property.value, property]));

export function normalizeWeaponProperties(item = {}) {
  const source = item?.item_data && typeof item.item_data === 'object'
    ? { ...item.item_data, ...item }
    : (item || {});
  const rawValue = source.weapon_properties;
  let raw = [];
  if (Array.isArray(rawValue)) {
    raw = rawValue;
  } else if (typeof rawValue === 'string' && rawValue.trim()) {
    try {
      const parsed = JSON.parse(rawValue);
      raw = Array.isArray(parsed) ? parsed : rawValue.split(',');
    } catch {
      raw = rawValue.split(',');
    }
  }
  const properties = new Set(raw.map((value) => String(value).trim().toLowerCase()).filter(Boolean));
  if (source.is_thrown) properties.add('lancio');
  if (source.consumes_ammunition) properties.add('munizioni');
  if (source.grip_type === 'two_handed') properties.add('due_mani');
  if (source.grip_type === 'versatile') properties.add('versatile');
  return [...properties];
}
