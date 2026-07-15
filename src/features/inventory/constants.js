export const bodyParts = [
  { value: 'head', label: 'Testa' },
  { value: 'eyes-left', label: 'Occhio sinistro' },
  { value: 'eyes-right', label: 'Occhio destro' },
  { value: 'nose', label: 'Naso' },
  { value: 'mouth', label: 'Bocca' },
  { value: 'ears-left', label: 'Orecchio sinistro' },
  { value: 'ears-right', label: 'Orecchio destro' },
  { value: 'neck', label: 'Collo' },
  { value: 'shoulder-left', label: 'Spalla sinistra' },
  { value: 'shoulder-right', label: 'Spalla destra' },
  { value: 'back', label: 'Schiena' },
  { value: 'chest', label: 'Torso' },
  { value: 'arm-left', label: 'Braccio sinistro' },
  { value: 'arm-right', label: 'Braccio destro' },
  { value: 'elbow-left', label: 'Gomito sinistro' },
  { value: 'elbow-right', label: 'Gomito destro' },
  { value: 'forearm-left', label: 'Avambraccio sinistro' },
  { value: 'forearm-right', label: 'Avambraccio destro' },
  { value: 'hand-left', label: 'Mano sinistra' },
  { value: 'hand-right', label: 'Mano destra' },
  { value: 'wrist-left', label: 'Polso sinistro' },
  { value: 'wrist-right', label: 'Polso destro' },
  { value: 'waist', label: 'Vita' },
  { value: 'leg-left', label: 'Gamba sinistra' },
  { value: 'leg-right', label: 'Gamba destra' },
  { value: 'knee-left', label: 'Ginocchio sinistro' },
  { value: 'knee-right', label: 'Ginocchio destro' },
  { value: 'shin-left', label: 'Tibia sinistra' },
  { value: 'shin-right', label: 'Tibia destra' },
  { value: 'foot-left', label: 'Piede sinistro' },
  { value: 'foot-right', label: 'Piede destro' },
  { value: 'ring-left', label: 'Dita/Anello sinistro' },
  { value: 'ring-right', label: 'Dita/Anello destro' },
  { value: 'main-hand', label: 'Mano principale' },
  { value: 'off-hand', label: 'Mano secondaria' },
  { value: 'eyes', label: 'Occhi (generico)' },
  { value: 'ears', label: 'Orecchie (generico)' },
  { value: 'shoulders', label: 'Spalle (generico)' },
  { value: 'arms', label: 'Braccia (generico)' },
  { value: 'elbows', label: 'Gomiti (generico)' },
  { value: 'forearms', label: 'Avambracci (generico)' },
  { value: 'hands', label: 'Mani (generico)' },
  { value: 'wrists', label: 'Polsi (generico)' },
  { value: 'legs', label: 'Gambe (generico)' },
  { value: 'knees', label: 'Ginocchia (generico)' },
  { value: 'shins', label: 'Tibie (generico)' },
  { value: 'feet', label: 'Piedi (generico)' },
  { value: 'ring', label: 'Dita/Anelli (generico)' }
];

export const itemCategories = [
  { value: 'gear', label: 'Vestiario', equipable: true },
  { value: 'loot', label: 'Loot' },
  { value: 'consumable', label: 'Consumabili' },
  { value: 'weapon', label: 'Armi', equipable: true },
  { value: 'armor', label: 'Armature', equipable: true },
  { value: 'jewelry', label: 'Gioielli e ornamenti', equipable: true },
  { value: 'tool', label: 'Strumenti' },
  { value: 'container', label: 'Contenitore', equipable: true }
];

export const categories = [
  { value: '', label: 'Tutte' },
  ...itemCategories
];

export const categoryLabels = new Map([
  ...itemCategories.map((category) => [category.value, category.label]),
  ['magic', 'Magici']
]);
export const bodyPartLabels = new Map(bodyParts.map((part) => [part.value, part.label]));

export const weaponTypes = [
  { value: '', label: 'Seleziona' },
  { value: 'simple', label: 'Semplice' },
  { value: 'martial', label: 'Da guerra' }
];

export const weaponRanges = [
  { value: '', label: 'Seleziona' },
  { value: 'melee', label: 'Mischia' },
  { value: 'ranged', label: 'Distanza' }
];

export const weaponAbilities = [
  { value: '', label: 'Seleziona' },
  { value: 'str', label: 'FOR' },
  { value: 'dex', label: 'DES' }
];

export const armorTypes = [
  { value: '', label: 'Seleziona' },
  { value: 'light', label: 'Leggera' },
  { value: 'medium', label: 'Media' },
  { value: 'heavy', label: 'Pesante' }
];


export const ammunitionTypes = [
  { value: '', label: 'Nessuna' },
  { value: 'arrow', label: 'Frecce' },
  { value: 'bolt', label: 'Dardi' },
  { value: 'bullet', label: 'Proiettili' }
];

export const damageTypeOptions = [
  { value: '', label: 'Seleziona' },
  { value: 'acid', label: 'Acido' },
  { value: 'bludgeoning', label: 'Contundente' },
  { value: 'piercing', label: 'Perforante' },
  { value: 'slashing', label: 'Tagliente' },
  { value: 'cold', label: 'Freddo' },
  { value: 'fire', label: 'Fuoco' },
  { value: 'force', label: 'Forza' },
  { value: 'lightning', label: 'Fulmine' },
  { value: 'thunder', label: 'Tuono' },
  { value: 'necrotic', label: 'Necrotico' },
  { value: 'poison', label: 'Veleno' },
  { value: 'psychic', label: 'Psichico' },
  { value: 'radiant', label: 'Radioso' }
];

export const ammunitionTypeLabels = new Map(ammunitionTypes.map((type) => [type.value, type.label]));
export const damageTypeLabels = new Map(damageTypeOptions.map((type) => [type.value, type.label]));
