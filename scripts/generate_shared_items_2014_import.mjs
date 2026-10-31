import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const [inputPath, outputPath = 'db/import_shared_items_2014_srd.sql'] = process.argv.slice(2);

if (!inputPath) {
  throw new Error('Uso: node scripts/generate_shared_items_2014_import.mjs <catalogo.json> [output.sql]');
}

const source = JSON.parse(await readFile(resolve(inputPath), 'utf8'));
const items = Array.isArray(source.items) ? source.items : [];
const supported = items.filter((item) => item.categoria !== 'pozione');
const supportedCategories = new Set(['arma', 'armatura', 'strumento', 'equipaggiamento']);

if (supported.some((item) => !supportedCategories.has(item.categoria))) {
  throw new Error('Il catalogo contiene categorie non gestite.');
}

const damageTypes = {
  contundente: 'bludgeoning',
  perforante: 'piercing',
  tagliente: 'slashing'
};
const armorTypes = { Light: 'light', Medium: 'medium', Heavy: 'heavy' };
const coinToCopper = { mr: 1, ma: 10, me: 50, mo: 100, mp: 1000 };
const containerIds = new Set([
  'backpack', 'barrel', 'basket', 'bottle-glass', 'bucket', 'case-crossbow-bolt',
  'case-map-or-scroll', 'chest', 'flask-or-tankard', 'jug-or-pitcher', 'pouch',
  'pot-iron', 'quiver', 'sack', 'vial'
]);

const commonItemGuidance = {
  abacus: 'Un telaio di calcolo utile per contabilità, commerci e rompicapi numerici. Può aiutare a verificare registri, dividere ricompense o rendere credibile la copertura di un mercante.',
  arrow: 'Munizione per archi, normalmente conservata in una faretra. Recuperare le frecce dopo uno scontro o controllarne la scorta può diventare importante durante viaggi lunghi.',
  backpack: 'Uno zaino da viaggio per organizzare provviste e attrezzatura. Usalo come contenitore per separare ciò che il personaggio trasporta dagli oggetti lasciati altrove.',
  barrel: 'Un robusto recipiente di legno adatto a liquidi, viveri o materiali sfusi. Può offrire copertura improvvisata, essere fatto rotolare o nascondere oggetti ingombranti.',
  basket: 'Un contenitore leggero e facilmente accessibile per cibo, erbe o piccoli oggetti. È pratico quando conta raggiungere il contenuto rapidamente, ma protegge poco da acqua e urti.',
  bedroll: 'Un giaciglio trasportabile per dormire lontano da locande e accampamenti attrezzati. Può isolare dal terreno freddo o essere usato come coperta e imbottitura improvvisata.',
  bell: 'Una piccola campana dal suono riconoscibile. Legata a un filo può diventare un allarme rudimentale, oppure servire per segnali, rituali e distrazioni.',
  blanket: 'Una coperta pesante utile contro freddo e intemperie. Può avvolgere una creatura, proteggere oggetti fragili, soffocare una piccola fiamma o improvvisare una barella.',
  'blowgun-needle': 'Munizione sottile per cerbottana. Gli aghi sono facili da trasportare e nascondere, ma devono essere conservati con cura per non danneggiarsi o ferire accidentalmente chi li porta.',
  'bottle-glass': 'Un recipiente di vetro per liquidi, campioni o ingredienti. È impermeabile ma fragile: può conservare una prova, raccogliere una sostanza o produrre frammenti e rumore se rotto.',
  bucket: 'Un secchio per trasportare acqua, sabbia o materiali sfusi. Può servire per spegnere incendi, svuotare una stanza allagata o improvvisare un recipiente e una trappola rumorosa.',
  'burglars-pack': 'Una dotazione organizzata per infiltrazioni ed esplorazione urbana. Contiene strumenti utili per creare allarmi, superare ostacoli e affrontare ambienti bui senza dipendere da rifornimenti immediati.',
  'chalk-1-piece': 'Un pezzo di gesso per segnare muri, pavimenti e percorsi. È utile per non perdersi in un dungeon, lasciare messaggi discreti o evidenziare porte e oggetti già controllati.',
  chest: 'Un contenitore rigido per custodire oggetti e monete. Può essere chiuso, nascosto o trasformato in esca; il suo ingombro lo rende più adatto a una base che al trasporto quotidiano.',
  'clothes-common': 'Abiti semplici adatti alla vita quotidiana. Aiutano a confondersi tra lavoratori e viaggiatori senza attirare l’attenzione che armature o vestiti raffinati potrebbero provocare.',
  'clothes-costume': 'Un costume pensato per spettacoli e travestimenti. Insieme a una buona interpretazione può sostenere una falsa identità, creare una distrazione o rendere memorabile un’esibizione.',
  'clothes-fine': 'Abiti di qualità adatti a corti, ricevimenti e incontri formali. Non garantiscono successo sociale, ma possono evitare che il personaggio venga escluso prima ancora di poter parlare.',
  'clothes-travelers': 'Vestiti resistenti pensati per lunghi viaggi e clima variabile. Tasche, mantello e tessuti robusti li rendono adatti a esploratori, messaggeri e avventurieri.',
  'crossbow-bolt': 'Munizione per balestre, normalmente trasportata in una custodia. Tenere separati i quadrelli dagli altri oggetti evita danni e permette di controllarne rapidamente la disponibilità.',
  'diplomats-pack': 'Una dotazione per viaggi ufficiali, corrispondenza e incontri formali. Offre il necessario per presentarsi con ordine, scrivere documenti e proteggere lettere o mappe.',
  'dungeoneers-pack': 'Una dotazione per esplorare sotterranei e rovine. Riunisce illuminazione, razioni, corda e strumenti robusti per superare passaggi difficili e restare operativi lontano dalla superficie.',
  'entertainers-pack': 'Una dotazione per artisti itineranti. Include quanto serve per viaggiare, mantenere una presenza scenica e cambiare aspetto durante spettacoli, coperture o distrazioni.',
  'explorers-pack': 'Una dotazione equilibrata per viaggi e accampamenti. Contiene provviste, illuminazione e strumenti essenziali per muoversi alcuni giorni lontano da città e locande.',
  'flask-or-tankard': 'Un recipiente personale per bere o conservare una piccola quantità di liquido. Può raccogliere campioni, condividere una bevanda o celare temporaneamente un oggetto minuto.',
  'grappling-hook': 'Un gancio da usare con una corda per raggiungere sporgenze, fissare carichi o recuperare oggetti. Prima di affidargli il peso di una creatura è prudente verificare che abbia fatto presa.',
  hammer: 'Un martello da lavoro per chiodi, cunei e piccole riparazioni. Può piantare chiodi da roccia, rompere materiali fragili o produrre deliberatamente un forte rumore.',
  'hammer-sledge': 'Una mazza pesante da lavoro, efficace contro porte, murature e ostacoli robusti. Richiede spazio per essere manovrata e difficilmente passa inosservata.',
  hourglass: 'Una clessidra per misurare intervalli regolari. È utile per turni di guardia, esperimenti, rituali o enigmi nei quali il tempo deve essere seguito senza strumenti magici.',
  'ink-1-ounce-bottle': 'Inchiostro per lettere, mappe e registri. Può anche marcare un bersaglio o lasciare tracce, ma il flacone va protetto per evitare che una perdita rovini il resto dell’equipaggiamento.',
  'ink-pen': 'Una penna adatta a scrivere con l’inchiostro. Serve per copiare testi, aggiornare mappe, firmare documenti o preparare messaggi e falsificazioni credibili.',
  'jug-or-pitcher': 'Una brocca per versare e trasportare liquidi. La bocca larga facilita il riempimento e permette di usarla anche per miscelare ingredienti o raccogliere piccoli oggetti.',
  'ladder-10-foot': 'Una scala lunga circa 3 metri per superare dislivelli senza arrampicarsi. È ingombrante, ma può diventare una passerella, una leva o un sostegno improvvisato.',
  'mirror-steel': 'Uno specchio resistente, utile per osservare dietro angoli, sotto porte o dentro aperture senza esporsi direttamente. Può riflettere luce e segnali, anche se l’immagine è meno nitida del vetro.',
  'paper-one-sheet': 'Un singolo foglio adatto a lettere, schizzi e appunti. Può conservare indizi, diventare una mappa improvvisata o essere piegato per lasciare un messaggio discreto.',
  'parchment-one-sheet': 'Un foglio di pergamena più resistente della carta comune. È indicato per mappe, contratti, formule e documenti destinati a essere trasportati o conservati a lungo.',
  'perfume-vial': 'Una fragranza concentrata in una piccola fiala. Può completare un travestimento sociale, coprire altri odori o lasciare una traccia riconoscibile durante un’indagine.',
  'pick-miners': 'Una picozza da lavoro per roccia e terreno compatto. Può aprire un passaggio lentamente, cercare cavità o indebolire una struttura, producendo però molto rumore.',
  piton: 'Un chiodo metallico da fissare nella roccia o nel legno. Con una corda crea ancoraggi, assicura una discesa, blocca una porta o sostiene un semplice allarme.',
  'pole-10-foot': 'Un lungo palo per sondare terreno, soffitti e meccanismi mantenendo distanza. È utile contro trappole e passaggi instabili, ma scomodo negli spazi stretti.',
  'pot-iron': 'Una pentola resistente per cucinare e bollire acqua. Può raccogliere liquidi, proteggere piccoli oggetti dal calore o produrre rumore come segnale improvvisato.',
  'priests-pack': 'Una dotazione per sacerdoti itineranti. Combina provviste da viaggio con oggetti utili a cerimonie, offerte e cura di un piccolo luogo di culto.',
  robes: 'Vesti ampie adatte a studiosi, officianti e incantatori. Possono comunicare un ruolo sociale, nascondere piccoli oggetti o essere adattate a un travestimento.',
  sack: 'Un sacco di tela o cuoio semplice e pieghevole. È un contenitore economico per bottino e provviste, ma offre poca protezione ed è facile da tagliare o bagnare.',
  'scholars-pack': 'Una dotazione per studio e ricerca sul campo. Fornisce materiali per leggere, scrivere e conservare appunti quando una biblioteca o uno scrittoio non sono disponibili.',
  'sealing-wax': 'Cera da sciogliere per chiudere lettere e documenti. Insieme a un anello con sigillo può provare l’integrità di un messaggio o rendere più convincente una corrispondenza ufficiale.',
  shovel: 'Una pala per scavare terreno, neve o detriti. È utile per accampamenti, sepolture, ricerca di oggetti nascosti e apertura di passaggi in materiali sciolti.',
  'signal-whistle': 'Un fischietto udibile a distanza per segnali concordati. Può richiamare alleati, dare l’allarme o distrarre, ma rivela facilmente la posizione di chi lo usa.',
  'signet-ring': 'Un anello inciso con un simbolo personale o familiare. Premuto sulla cera autentica lettere e ordini; copiarlo o sottrarlo può avere conseguenze politiche importanti.',
  'sling-bullet': 'Munizione per fionda, più regolare ed efficace di una pietra raccolta a caso. I proiettili sono piccoli e facili da trasportare in una borsa.',
  soap: 'Una saponetta per pulire persone, tessuti e attrezzatura. Oltre all’igiene può rendere scivolosa una superficie, individuare piccole perdite o cancellare tracce e odori.',
  'spike-iron': 'Un robusto cuneo di ferro. Può bloccare una porta, fissare una corda, stabilizzare un oggetto o creare un ostacolo, purché sia martellato in un supporto adeguato.',
  vial: 'Una piccola fiala per campioni, reagenti e liquidi preziosi. È facile da trasportare ma fragile, quindi conviene separarla dagli oggetti pesanti.',
  waterskin: 'Un otre flessibile per trasportare acqua durante il viaggio. Può essere riempito con altri liquidi, usato come galleggiante improvvisato o spremuto per dosare lentamente il contenuto.',
  whetstone: 'Una pietra abrasiva per mantenere lame e utensili. Durante una pausa può servire alla manutenzione dell’equipaggiamento o a produrre polvere e scintille con il materiale adatto.'
};

function nullableNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function moneyInCopper(cost) {
  if (!cost) return 0;
  return Math.round((Number(cost.quantita) || 0) * (coinToCopper[cost.moneta] || 0));
}

function formatCatalogCost(cost) {
  if (!cost || cost.quantita == null || !cost.moneta) return 'non indicato';
  return `${cost.quantita} ${cost.moneta}`;
}

function itemDescription(item) {
  if (item.categoria === 'strumento' && item.sottocategoria === 'strumento_musicale') {
    const base = item.descrizione || 'La competenza con questo strumento permette di aggiungere il bonus di competenza alle prove effettuate per suonarlo; un bardo può usarlo come focus da incantatore.';
    const weight = item.peso?.kg == null ? 'non indicato' : `${item.peso.kg} kg`;
    return `${base}\n\nTabella degli strumenti musicali: costo ${formatCatalogCost(item.costo)}; peso ${weight}. Ogni strumento musicale richiede una competenza specifica.`;
  }
  return item.descrizione || commonItemGuidance[item.id] || '';
}

function ammunitionType(item) {
  const id = String(item.id || '');
  if (id === 'arrow' || /bow/.test(id) && !/crossbow/.test(id)) return 'arrow';
  if (id === 'crossbow-bolt' || /crossbow/.test(id)) return 'bolt';
  if (id === 'blowgun-needle' || id === 'blowgun') return 'needle';
  if (id === 'sling-bullet' || id === 'sling') return 'bullet';
  return null;
}

function commonData(item, category) {
  const sourceUrl = item.riferimento?.url || null;
  const notes = itemDescription(item);
  return {
    name: item.nome,
    original_name: item.nome_originale || null,
    category,
    rules_version: '2014',
    qty: Number(item.dati_originali?.quantity) || 1,
    weight: nullableNumber(item.peso?.kg) ?? 0,
    volume: 0,
    value_cp: moneyInCopper(item.costo),
    image_url: item.immagine || null,
    notes,
    is_magic: Boolean(item.magico),
    attunement_active: false,
    source_id: item.id,
    source_label: source.origine || 'SRD 5.1',
    source_edition: source.edizione || 'D&D 5e (regole 2014)',
    source_url: sourceUrl,
    source_kind: item.riferimento?.tipo || 'equipment',
    original_category: item.categoria,
    cost: item.costo || null
  };
}

function weaponData(item) {
  const weapon = item.arma || {};
  const properties = Array.isArray(weapon.proprieta) ? weapon.proprieta : [];
  const ranged = weapon.modalita === 'distanza';
  const thrown = properties.includes('lancio');
  const ammo = ammunitionType(item);
  const damageType = damageTypes[weapon.danno?.tipo] || null;
  const alternateDie = weapon.danno_due_mani || null;
  const grip = properties.includes('due_mani') ? 'two_handed' : alternateDie ? 'versatile' : 'one_handed';
  const thrownRange = item.dati_originali?.throw_range || null;
  const normalRange = thrown && thrownRange?.normal != null
    ? Number((Number(thrownRange.normal) * 0.3048).toFixed(2))
    : nullableNumber(weapon.gittata?.normale?.metri);
  const longRange = thrown && thrownRange?.long != null
    ? Number((Number(thrownRange.long) * 0.3048).toFixed(2))
    : nullableNumber(weapon.gittata?.lunga?.metri);
  return {
    ...commonData(item, 'weapon'),
    equipable: true,
    compatible_equip_slots: grip === 'two_handed' ? ['hands'] : ['main-hand', 'off-hand'],
    equip_slot: null,
    equip_slots: [],
    sovrapponibile: false,
    weapon_type: weapon.classe === 'da_guerra' ? 'martial' : 'simple',
    weapon_range: ranged ? 'ranged' : 'melee',
    attack_ability: properties.includes('accurata') || (ranged && !thrown) ? 'dex' : 'str',
    damage_die: weapon.danno?.dadi || null,
    damage_type: damageType,
    attack_modifier: 0,
    damage_modifier: 0,
    is_thrown: thrown,
    melee_range: !ranged ? (properties.includes('portata') ? 3.05 : nullableNumber(weapon.gittata?.normale?.metri) ?? 1.52) : null,
    range_normal: ranged || thrown ? normalRange : null,
    range_disadvantage: ranged || thrown ? longRange : null,
    ammunition_type: null,
    required_ammunition_type: ammo,
    consumes_ammunition: properties.includes('munizioni'),
    weapon_properties: properties,
    grip_type: grip,
    weapon_damage_modes: alternateDie ? [{
      id: 'two-hands', label: 'Due mani', damage_die: alternateDie,
      damage_modifier: 0, attack_modifier: 0, damage_type: damageType
    }] : [],
    has_alternate_damage_mode: Boolean(alternateDie),
    alternate_damage_label: alternateDie ? 'Due mani' : null,
    alternate_damage_die: alternateDie,
    alternate_damage_modifier: 0,
    alternate_attack_modifier: 0,
    alternate_damage_type: alternateDie ? damageType : null
  };
}

function armorData(item) {
  const armor = item.armatura || {};
  const sourceType = item.dati_originali?.armor_category || '';
  const shield = sourceType === 'Shield';
  return {
    ...commonData(item, 'armor'),
    equipable: true,
    compatible_equip_slots: shield ? ['off-hand'] : ['chest'],
    equip_slot: null,
    equip_slots: [],
    sovrapponibile: shield,
    armor_type: shield ? null : armorTypes[sourceType] || null,
    is_shield: shield,
    armor_class: shield ? null : nullableNumber(armor.ca_base),
    armor_bonus: 0,
    shield_bonus: shield ? nullableNumber(armor.bonus_ca) ?? 2 : 0,
    armor_uses_dexterity: Boolean(armor.usa_modificatore_destrezza),
    armor_dexterity_cap: nullableNumber(armor.limite_modificatore_destrezza),
    minimum_strength: nullableNumber(armor.forza_minima) ?? 0,
    stealth_disadvantage: Boolean(armor.svantaggio_furtivita)
  };
}

function toolData(item) {
  return {
    ...commonData(item, 'tool'),
    equipable: false,
    compatible_equip_slots: [],
    equip_slot: null,
    equip_slots: [],
    sovrapponibile: false,
    tool_subcategory: item.sottocategoria || null
  };
}

function equipmentData(item) {
  const original = item.dati_originali || {};
  const gearCategory = original.gear_category?.index || null;
  const ammo = gearCategory === 'ammunition' ? ammunitionType(item) : null;
  const isContainer = containerIds.has(item.id) || gearCategory === 'equipment-packs';
  return {
    ...commonData(item, isContainer ? 'container' : (ammo ? 'consumable' : 'gear')),
    equipable: false,
    compatible_equip_slots: [],
    equip_slot: null,
    equip_slots: [],
    sovrapponibile: false,
    max_volume: null,
    ammunition_type: ammo,
    gear_category: gearCategory,
    bundle_contents: Array.isArray(original.contents)
      ? original.contents.map((entry) => ({
        source_id: String(entry.item?.url || '').split('/').filter(Boolean).at(-1) || null,
        name: entry.item?.name || null,
        url: entry.item?.url || null,
        quantity: Number(entry.quantity) || 1
      }))
      : []
  };
}

function normalize(item) {
  if (item.categoria === 'arma') return weaponData(item);
  if (item.categoria === 'armatura') return armorData(item);
  if (item.categoria === 'strumento') return toolData(item);
  return equipmentData(item);
}

function sqlString(value) {
  if (value === null || value === undefined) return 'null';
  return `'${String(value).replaceAll("'", "''")}'`;
}

const rows = supported.map((item) => {
  const data = normalize(item);
  return {
    name: data.name,
    category: data.category,
    rulesVersion: '2014',
    imageUrl: data.image_url,
    description: data.notes || null,
    itemData: data
  };
});

const missingDescriptions = supported
  .filter((item) => ['equipaggiamento', 'strumento'].includes(item.categoria))
  .filter((item) => !itemDescription(item).trim())
  .map((item) => `${item.id} (${item.nome})`);
if (missingDescriptions.length) {
  throw new Error(`Descrizioni mancanti per: ${missingDescriptions.join(', ')}`);
}

const uniqueKeys = new Set(rows.map((row) => `${row.name.toLocaleLowerCase('it')}\u0000${row.category}\u0000${row.rulesVersion}`));
if (uniqueKeys.size !== rows.length) throw new Error('Chiavi duplicate dopo la normalizzazione del catalogo.');

const values = rows.map((row) => `  (${[
  sqlString(row.name),
  sqlString(row.category),
  sqlString(row.rulesVersion),
  sqlString(row.imageUrl),
  sqlString(row.description),
  `${sqlString(JSON.stringify(row.itemData))}::jsonb`
].join(', ')})`).join(',\n');

const categoryValues = supported.map((item) => {
  const data = normalize(item);
  return `  (${sqlString(data.source_id)}, ${sqlString(data.category)})`;
}).join(',\n');

const counts = Object.entries(rows.reduce((accumulator, row) => {
  accumulator[row.category] = (accumulator[row.category] || 0) + 1;
  return accumulator;
}, {})).sort(([left], [right]) => left.localeCompare(right));

const sql = `-- Catalogo SRD 5.1 italiano, regole 2014.
-- Generato dal catalogo JSON allegato mediante scripts/generate_shared_items_2014_import.mjs.
-- Pozioni escluse intenzionalmente. Totale oggetti importati: ${rows.length}.
-- Ripartizione: ${counts.map(([category, count]) => `${category}=${count}`).join(', ')}.
-- Lo script e idempotente: rieseguirlo aggiorna i record omonimi della stessa categoria/versione.

begin;

-- Mantiene lo stesso record se una versione precedente dell'import aveva classificato
-- diversamente munizioni, contenitori o dotazioni. Eventuali duplicati gia creati
-- vengono prima ricollegati agli oggetti dei personaggi e poi rimossi.
create temporary table _shared_item_import_categories (
  source_id text primary key,
  category text not null
) on commit drop;

insert into _shared_item_import_categories (source_id, category) values
${categoryValues};

update public.items as linked
set shared_item_id = canonical.id
from public.shared_items as stale
join _shared_item_import_categories as expected
  on expected.source_id = stale.item_data->>'source_id'
join public.shared_items as canonical
  on canonical.item_data->>'source_id' = expected.source_id
 and canonical.rules_version = '2014'
 and canonical.category = expected.category
where linked.shared_item_id = stale.id
  and stale.rules_version = '2014'
  and stale.category <> expected.category;

delete from public.shared_items as stale
using _shared_item_import_categories as expected
where stale.item_data->>'source_id' = expected.source_id
  and stale.rules_version = '2014'
  and stale.category <> expected.category
  and exists (
    select 1 from public.shared_items as canonical
    where canonical.item_data->>'source_id' = expected.source_id
      and canonical.rules_version = '2014'
      and canonical.category = expected.category
  );

update public.shared_items as target
set category = expected.category,
    item_data = jsonb_set(target.item_data, '{category}', to_jsonb(expected.category), true),
    updated_at = now()
from _shared_item_import_categories as expected
where target.item_data->>'source_id' = expected.source_id
  and target.rules_version = '2014'
  and target.category <> expected.category;

with imported (name, category, rules_version, image_url, description, item_data) as (
values
${values}
)
insert into public.shared_items (
  name, category, rules_version, image_url, description, item_data, updated_at
)
select
  name, category, rules_version, image_url, description, item_data, now()
from imported
on conflict ((lower(name)), category, rules_version)
do update set
  image_url = excluded.image_url,
  description = excluded.description,
  item_data = excluded.item_data,
  updated_at = now();

commit;

select category, count(*) as imported_records
from public.shared_items
where rules_version = '2014'
  and item_data->>'source_label' = ${sqlString(source.origine || 'SRD 5.1')}
group by category
order by category;
`;

await writeFile(resolve(outputPath), sql, 'utf8');
console.log(`Creato ${resolve(outputPath)} con ${rows.length} oggetti (${items.length - supported.length} pozioni ignorate).`);
