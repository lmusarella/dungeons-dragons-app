export const RULES_VERSIONS = ['2014', '2024'];

export const CATALOG_GROUPS = [
  {
    label: 'Personaggi',
    entries: [
      { key: 'classes', table: 'shared_classes', label: 'Classi', singular: 'Classe', icon: '⚔', description: 'Progressioni, competenze e sottoclassi.', fields: ['description', 'hit_die', 'primary_abilities', 'saving_throws', 'image_url', 'source'] },
      { key: 'subclasses', hidden: true, table: 'shared_subclasses', label: 'Sottoclassi', singular: 'Sottoclasse', icon: '♜', description: 'Archetipi collegati alle classi.', fields: ['shared_class_id', 'description', 'image_url', 'source'] },
      { key: 'species', table: 'shared_species', label: 'Specie', singular: 'Specie', icon: '♞', description: 'Specie, tratti e varianti.', fields: ['description', 'size', 'speed', 'image_url', 'source'] },
      { key: 'species-variants', hidden: true, table: 'shared_species_variants', label: 'Varianti di specie', singular: 'Variante di specie', icon: '♘', description: 'Varianti collegate alla specie tramite UUID.', fields: ['shared_species_id', 'description', 'image_url', 'source'] },
      { key: 'backgrounds', table: 'shared_backgrounds', label: 'Background', singular: 'Background', icon: '⌂', description: 'Origini e competenze iniziali.', fields: ['description', 'image_url', 'source'] }
    ]
  },
  {
    label: 'Capacità',
    entries: [
      { key: 'features', table: 'shared_features', label: 'Privilegi e abilità', singular: 'Privilegio', icon: '✦', description: 'Capacità riutilizzabili con origine e livello.', fields: ['description', 'category', 'activation_type', 'uses', 'recovery', 'mechanics', 'image_url', 'source'] },
      { key: 'feats', table: 'shared_feats', label: 'Talenti', singular: 'Talento', icon: '◆', description: 'Talenti, categorie e prerequisiti.', fields: ['description', 'category', 'prerequisites', 'repeatable', 'image_url', 'source'] },
      { key: 'fighting-styles', table: 'shared_fighting_styles', label: 'Stili di combattimento', singular: 'Stile di combattimento', icon: '⚔', description: 'Stili e talenti 2024 collegati.', fields: ['description', 'shared_feat_id', 'image_url', 'source'] }
    ]
  },
  {
    label: 'Contenuti',
    entries: [
      { key: 'spells', table: 'shared_spells', label: 'Incantesimi', singular: 'Incantesimo', icon: '✧', description: 'Grimorio condiviso 2014 e 2024.', existingRoute: 'library' },
      { key: 'items', table: 'shared_items', label: 'Oggetti', singular: 'Oggetto', icon: '♙', description: 'Equipaggiamento e tesori condivisi.', existingRoute: 'library' },
      { key: 'creatures', table: 'shared_creatures', label: 'Bestiario', singular: 'Creatura', icon: '♛', description: 'Bestie e mostri con blocco statistiche.', fields: ['description', 'creature_type', 'size', 'challenge_rating', 'stat_block_it', 'image_url', 'source'] }
    ]
  }
];

export const CATALOGS = CATALOG_GROUPS.flatMap((group) => group.entries);

export function getCatalog(key) {
  return CATALOGS.find((catalog) => catalog.key === key) || CATALOGS[0];
}

export const FIELD_META = {
  description: { label: 'Descrizione', type: 'textarea' },
  hit_die: { label: 'Dado vita', placeholder: 'd10' },
  primary_abilities: { label: 'Caratteristiche principali', placeholder: 'Forza, Destrezza' },
  saving_throws: { label: 'Tiri salvezza', placeholder: 'Forza, Costituzione' },
  shared_class_id: { label: 'ID classe di appartenenza', placeholder: 'UUID della classe' },
  shared_species_id: { label: 'ID specie di appartenenza', placeholder: 'UUID della specie' },
  size: { label: 'Taglia', placeholder: 'Media' },
  speed: { label: 'Velocità', type: 'number', placeholder: '9' },
  category: { label: 'Categoria' },
  activation_type: { label: 'Attivazione', placeholder: 'azione, bonus, reazione…' },
  uses: { label: 'Utilizzi', type: 'number' },
  recovery: { label: 'Recupero', placeholder: 'riposo breve, riposo lungo…' },
  mechanics: { label: 'Meccaniche', type: 'json', placeholder: '{ "tipo": "valore" }' },
  prerequisites: { label: 'Prerequisiti', type: 'textarea' },
  repeatable: { label: 'Ripetibile', type: 'checkbox' },
  shared_feat_id: { label: 'ID talento collegato', placeholder: 'UUID del talento (facoltativo)' },
  creature_type: { label: 'Tipo di creatura', placeholder: 'Bestia, Umanoide…' },
  challenge_rating: { label: 'Grado di sfida', placeholder: '1/2, 5, 20…' },
  stat_block_it: { label: 'Blocco statistiche italiano', type: 'json', placeholder: '{ "ac": 15, "hp": 30 }' },
  image_url: { label: 'URL immagine', type: 'url' },
  source: { label: 'Manuale / fonte', placeholder: 'Manuale del Giocatore' }
};
