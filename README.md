# Dungeon Dragon

PWA tablet-first per gestire un personaggio di D&D con Supabase.

## Setup

1. Installa dipendenze:

```bash
npm install
```

2. Crea `.env` con le variabili:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

3. Avvia l'app:

```bash
npm run dev
```

## Script utili

```bash
npm run dev
npm run build
npm run preview
npm run test
npm run audit:css
```

## Organizzazione degli stili

- `src/styles/index.css` è l'unico entry CSS globale (importato solo da `src/main.js`) e
  dichiara l'ordine della cascata: `tokens` → `base` → `theme` → dice-roller → `shellExperience`
  → `tabletLayout` → `fantasyTheme` → `characterSheetPolish`. A parità di specificità vince
  il file importato dopo: non importare questi file da moduli JS e non usare query `?v=`.
- `src/styles/palette.css` è l'unico posto dove si dichiarano valori di colore grezzi: primitivi
  `--famiglia-step` (da 50 chiaro a 950 scuro, es. `--wine-700`, `--paper-50`, `--sand-200`).
  Per le trasparenze usare il gemello `-rgb`: `rgb(var(--wine-700-rgb) / 0.3)`.
- `src/styles/tokens.css` contiene i ruoli (`--accent`, `--color-ink`, `--color-surface`,
  `--color-border`, `--color-danger`...) che puntano ai primitivi, più monete, palette shell e colori
  delle sezioni. Nei componenti preferire i ruoli; per cambiare tema basta ripuntarli.
  Le variabili di componente (`--toast-*`, `--filter-*`...) restano accanto al componente.
- Niente nuovi `#hex`/`rgba()` fuori da `palette.css`: `tests/src/styles/palette.test.js` blocca
  l'aumento dei colori grezzi residui (tetto da abbassare man mano che si migrano).
- I CSS di feature lazy (`library`, `gameRooms`, `dndCatalog`, `characterBuilder`,
  `itemAliases`, `startingEquipment`) restano accanto alla feature e sono importati dal suo modulo;
  vengono sempre dopo i CSS globali.
- `npm run audit:css` segnala classi/id/data-attribute senza riscontro nel JS, `@keyframes` e
  variabili non usati, dichiarazioni sovrascritte dallo stesso selettore e selettori definiti in più
  file. Con `-- --fix` rimuove il CSS morto (ripetere fino a convergenza, poi lanciare i test).
  Aggiungere `-- --colors` per vedere i colori grezzi residui con il token più vicino, e
  `-- --merge` per unire i selettori ripetuti quando è dimostrabile che l'ordine non cambia.

## Troubleshooting

### Errore `MODULE_NOT_FOUND` all'avvio

Se `npm run dev` termina con `MODULE_NOT_FOUND` (spesso su Windows) significa che le
dipendenze non sono state installate correttamente o non ti trovi nella root del
progetto. Prova questi passaggi:

1. Verifica di essere nella cartella del progetto (dove c'è `package.json`).
2. Reinstalla le dipendenze:

```bash
rm -rf node_modules package-lock.json
npm install
```

3. Rilancia il dev server:

```bash
npm run dev
```

## Aggiornamento risorse collegate

Per un database che ha già applicato la prima versione della migrazione delle sotto-abilità, esegui lo script `db/update_resource_linked_options.sql` nel SQL Editor di Supabase.

Lo script aggiunge il flag padre `can_have_children`, il costo `resource_cost` e aggiorna la cache dello schema Supabase.

## Transazioni atomiche del portafoglio

Esegui `db/wallet_transactions_atomic.sql` nel SQL Editor di Supabase prima di distribuire questa versione. Lo script installa le RPC che aggiornano saldo e registro del denaro nella stessa transazione PostgreSQL.

## Tabelle Supabase (assunte)

- `profiles(id, display_name, created_at)`
- `characters(id, user_id, name, system, data, created_at, updated_at)`
- `items(id, user_id, character_id, name, qty, weight, value_cp, category, container_item_id, equipped_state, attunement_required, attunement_active, notes, created_at, updated_at)`
- `resources(id, user_id, character_id, parent_resource_id, can_have_children, resource_cost, name, max_uses, used, reset_on, notes, created_at, updated_at)`
- `wallets(character_id, user_id, cp, sp, ep, gp, pp, updated_at)`
- `money_transactions(id, user_id, character_id, direction, amount, reason, occurred_on, created_at)`
- `journal_entries(id, user_id, character_id, entry_date, session_no, title, content, mood, is_pinned, created_at, updated_at)`
- `journal_tags(id, user_id, name, created_at)`
- `journal_entry_tags(entry_id, tag_id)`
- `shared_spells(id, created_by, rules_version, name, level, school, caster_classes, cast_time, range, duration, components, concentration, ritual, attack_roll, damage_die, damage_modifier, upcast_damage_die, upcast_damage_modifier, upcast_start_level, description, source, created_at, updated_at)`
- `character_spells(id, user_id, character_id, shared_spell_id, custom_spell, prep_state, notes, created_at, updated_at)`
- `character_companions(id, user_id, character_id, kind, name, rules_version, stat_block, notes, is_active, created_at, updated_at)`

RLS: assumere che tutte le tabelle siano protette con `auth.uid()` come owner.

## Come usare l'app

1. Login con email + password.
2. Home: seleziona il personaggio, verifica HP/AC, esegui riposo breve/lungo.
3. Inventario: aggiungi, modifica e organizza oggetti (anche in contenitori).
4. Equip: controlla stato di equipaggiamento e attunement.
5. Azioni: gestisci wallet, registra pagamenti o incassi, loot rapido.
6. Diario: crea voci, aggiungi tag e ricerca veloce.
7. Impostazioni: imposta modalità ingombro e unità peso.

## Offline

- Quando offline, l'app usa la cache IndexedDB (solo lettura).
- Un banner rosso indica lo stato offline.

## Health check rapido (30/04/2026)

- ✅ Test automatici: `49/49` passati (`npm test -- --run`).
- ✅ Build produzione completata (`npm run build`).
- ⚠️ Nota performance: in build Vite segnala script non modulari in `index.html` (dice roller + librerie esterne), quindi non entrano nel bundling ottimizzato.
- ⚠️ Nota bundle: chunk JS iniziale principale relativamente pesante (~293 KB non compresso); consigliato aumentare lazy-loading su feature secondarie.

Per il piano operativo dettagliato (priorità, KPI e backlog), vedi: `docs/global-app-check-2026-04-30.md`.


Schema SQL iniziale per queste entità: `docs/supabase-spells-companions-schema.sql`.
RLS policies: `docs/supabase-spells-companions-rls.sql`.
