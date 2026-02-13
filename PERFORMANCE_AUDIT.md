# Audit tecnico completo – performance, ottimizzazioni e refactor

Data: 2026-02-13

## Metodologia

Controlli eseguiti:

- Build produzione (`npm run build`) per verificare dimensione bundle e warning.
- Test automatici (`npm test -- --run`) per verificare regressioni e affidabilità baseline.
- Revisione statica delle aree core: bootstrap/router, gestione stato, viste Home/Inventory/Journal, cache offline, configurazione build.

---

## Executive summary (priorità)

1. **Critico – Bundle iniziale troppo grande + niente code-splitting per route.** Tutte le feature principali vengono importate eager in `main.js`.
2. **Critico – Script legacy non modulari in `index.html` fuori pipeline Vite.** Non vengono bundlati/minificati/tree-shaken.
3. **Alto – Pattern di rendering “full rerender + rebind listener”** in Home/Inventory/Journal con costo CPU crescente.
4. **Alto – Store globale notifica listener a ogni patch singola**, inclusi caricamenti cache a raffica (5 update consecutivi).
5. **Medio – Flussi dati Journal non parallelizzati completamente** (latenza evitabile in caricamento iniziale).
6. **Medio – Suite test non verde**: un test fallisce già a baseline (riduce confidenza sui refactor futuri).

---

## Findings dettagliati

## 1) Bootstrap eager: tutte le view sono nel chunk iniziale

### Evidenza

In `src/main.js` le route importano direttamente i renderer di tutte le feature (`home`, `inventory`, `journal`, `settings`, ecc.) invece di lazy loading per route.

### Impatto

- Aumenta JS iniziale scaricato/parsato.
- Peggiora Time to Interactive su device medi/lenti.
- Impatta anche utenti che aprono solo login/una singola route.

### Ottimizzazione proposta

- Introdurre `registerRoute('home', async (outlet) => { const { renderHome } = await import(...); ... })`.
- Abilitare chunking per dominio funzionale (character, inventory, journal, dice).
- (Opzionale) aggiungere `build.rollupOptions.output.manualChunks` in `vite.config.js`.

---

## 2) Script non modulari in `index.html`: fuori bundle

### Evidenza

`index.html` include script esterni senza `type="module"`:

- `libs/three.min.js`
- `libs/cannon.min.js`
- `libs/teal.js`
- `dice-roller/dice.js`
- `dice-roller/main.js`

Durante build Vite compare warning esplicito: “can't be bundled without type=module attribute”.

### Impatto

- Questi asset non beneficiano pienamente della pipeline build (chunking/ottimizzazione).
- Possibili costi di parse/exec in main thread al bootstrap.
- Difficoltà di controllo dipendenze e caching granulare.

### Ottimizzazione proposta

- Migrare gli script dice/engine a moduli ES importati on-demand.
- Caricare il dice-roller solo quando serve (lazy import all’apertura overlay).

---

## 3) Rendering costoso nelle schermate principali

### Evidenza

In Home/Inventory/Journal si usa spesso:

- `container.innerHTML = ...` per ricostruire intere sezioni.
- `querySelectorAll(...).forEach(addEventListener...)` a ogni render.
- Callback di azioni che invocano nuovamente `renderX(container)`.

### Impatto

- Molta attività DOM, garbage collection e rebind listener.
- Rischio jank su dispositivi tablet datati (target tipico dell’app).
- Complessità cognitiva alta, manutenzione più fragile.

### Refactor/ottimizzazione proposta

- Introdurre **event delegation** su container root (1 listener per evento/feature).
- Separare “render statico shell” da “patch di porzioni dinamiche”.
- Estrarre store/view-model locale per evitare full rerender su micro-modifiche.

---

## 4) Store globale: notifiche sincrone troppo frequenti

### Evidenza

`setState`, `setActiveCharacter` e `updateCache` notificano immediatamente tutti i listener. In `loadCachedData` ci sono update multipli consecutivi (`items`, `resources`, `journal`, `wallet`, `tags`) che generano N notifiche.

### Impatto

- Re-render ridondanti di header/banner/sottoscrittori.
- Costi inutili su bootstrap e su operazioni di cache.

### Ottimizzazione proposta

- Introdurre `batchStateUpdates(() => { ... })` o `setState` unico composito.
- Debounce/microtask batching notifiche listener.
- Distinguere subscriber per slice (es. `subscribe('cache.wallet', cb)`).

---

## 5) Journal: caricamento dati migliorabile

### Evidenza

Nel flusso online di `renderJournal`, alcune fetch sono seriali (es. `fetchEntries` -> `fetchTags` -> `fetchEntryTags` -> `fetchSessionFiles`). Solo una parte è realmente dipendente da `entries`.

### Impatto

- Aumenta TTFMP (tempo al primo contenuto utile) della vista diario.

### Ottimizzazione proposta

- Eseguire in parallelo `fetchTags` e `fetchSessionFiles` insieme a `fetchEntries`.
- Chiamare `fetchEntryTags` solo dopo entries, ma senza bloccare il rendering base lista.
- UI progressiva: render iniziale entry + caricamento async metadati.

---

## 6) Qualità baseline: test non verdi

### Evidenza

`tests/calc.test.js` fallisce: atteso `6.5`, ottenuto `7` da `calcTotalWeight`.

### Impatto

- Refactor performance meno sicuri senza baseline affidabile.

### Ottimizzazione proposta

- Allineare test/business rule (il calcolo attuale `qty * weight` restituisce 7 con i dati test).
- Richiedere CI “green mandatory” prima di interventi strutturali.

---

## Roadmap consigliata (ordine implementazione)

1. **Route-based code splitting + lazy import dice engine** (massimo ROI su startup).
2. **Event delegation + riduzione full rerender** (Home e Inventory prima, poi Journal).
3. **Batching store updates** in bootstrap/cache.
4. **Parallelizzazione fetch Journal + rendering progressivo**.
5. **Pulizia test baseline e guardrail CI**.

---

## Stima impatto atteso (qualitativa)

- Startup percepito: **miglioramento alto**.
- Fluidità UI durante interazioni intense: **miglioramento medio/alto**.
- Manutenibilità e velocità di evoluzione feature: **miglioramento alto**.
