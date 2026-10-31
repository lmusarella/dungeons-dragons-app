# Importazione del catalogo incantesimi

Gli script generati importano separatamente le due edizioni presenti nel file sorgente:

- `import_shared_spells_2014.sql`: 525 record;
- `import_shared_spells_2024.sql`: 444 record.

## Ordine di esecuzione

1. Eseguire `admin_shared_catalog_rls.sql`, se la profilazione del catalogo non è ancora installata.
2. Verificare che `public.catalog_admins` contenga almeno un utente amministratore.
3. Eseguire `extend_shared_spells_spellbook_import.sql`.
4. Eseguire `import_shared_spells_2014.sql`.
5. Eseguire `import_shared_spells_2024.sql`.

Se i due cataloghi sono già stati importati prima dell'estrazione dei dadi di upcast, è sufficiente eseguire `backfill_shared_spell_upcast_dice.sql`: aggiorna i record esistenti tramite `source_key` e `rules_version`, senza ricreare il catalogo o le associazioni dei personaggi.

Gli import sono ripetibili: usano `source_key` e `rules_version` per aggiornare i record già presenti. Prima dell'inserimento provano inoltre a collegare gli incantesimi creati manualmente confrontando nome, livello ed edizione.

## Mappatura

- `detailUrl` → `source_url` e `source_key`;
- `source` → `source` (colonna già esistente);
- `material` → `material`;
- `upcastDescription` → `upcast_description`;
- la prima notazione di dado presente in `upcastDescription` → `upcast_damage_die`, quando `hasUpcastRule` è attivo;
- `savingThrow` → `saving_throw_ability` (`str`, `dex`, `con`, `int`, `wis`, `cha`);
- `attackType` → `attack_range_type` (`melee`, `ranged`);
- `components` → testo compatto `V, S, M`;
- `classes` → array normalizzato in minuscolo.

I campi `scrapeStatus`, `verifiedEditions`/`verifiedVersion` e i metadati di estrazione non vengono importati. Le informazioni sperimentali presenti soltanto su pochi record (`area`, `baseRays`, `saveEffect`, `trucchettoScaling`) restano nella descrizione, evitando colonne scarsamente utilizzate o ridondanti.

Le regole prive di notazione vengono lasciate vuote. Se una descrizione contiene più dadi differenti, nel campo unico `upcast_damage_die` viene salvata la prima notazione; la regola completa rimane comunque disponibile in `upcast_description`.

I due nomi duplicati nel catalogo, “Confusione” e “Resurrezione”, vengono conservati correttamente perché rappresentano incantesimi diversi, identificati da `source_key` e livello.
