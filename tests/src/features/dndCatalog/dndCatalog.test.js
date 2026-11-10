import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('catalogo D&D condiviso', () => {
  it('integra navigazione, cataloghi e modalità amministrativa', () => {
    const source = readFileSync('src/features/dndCatalog/dndCatalog.js', 'utf8');
    const config = readFileSync('src/features/dndCatalog/catalogConfig.js', 'utf8');
    const main = readFileSync('src/main.js', 'utf8');
    expect(main).toContain("registerRoute('dnd-catalog'");
    expect(source).toContain('await canManageSharedCatalog()');
    expect(source).toContain('Catalogo in consultazione');
    expect(source).toContain('searchCatalog(catalog');
    expect(source).toContain('normalizeCatalogError');
    expect(source).toContain('getClassFeatureGrants');
    expect(source).toContain('getFeatureOrigins');
    expect(source).toContain('Privilegi e abilità collegate');
    expect(source).toContain('Livello ${escapeHtml(grant.unlock_level');
    expect(config).toContain("table: 'shared_classes'");
    expect(config).toContain("table: 'shared_creatures'");
    expect(config).toContain("existingRoute: 'library'");
  });

  it('pagina i dati sul server e protegge i payload amministrativi', () => {
    const api = readFileSync('src/features/dndCatalog/catalogApi.js', 'utf8');
    expect(api).toContain(".select('*', { count: 'exact' })");
    expect(api).toContain('.range(from, from + safePageSize - 1)');
    expect(api).toContain("error?.code === '23505'");
    expect(api).toContain("error?.code === '23503'");
    expect(api).toContain('delete row.created_by');
    expect(api).toContain(".from('shared_grants')");
    expect(api).toContain(".eq('source_class_id', classId)");
    expect(api).toContain(".from('shared_features').select('*').in('id', featureIds)");
  });

  it('riutilizza il linguaggio visivo dell archivio centralizzato e mostra i dati strutturati', () => {
    const source = readFileSync('src/features/dndCatalog/dndCatalog.js', 'utf8');
    const styles = readFileSync('src/features/dndCatalog/dndCatalog.css', 'utf8');
    expect(source).toContain("import '../library/library.css'");
    expect(source).toContain('library-shell--refined');
    expect(source).toContain('library-hero--refined');
    expect(source).toContain('dataRows(item, catalog)');
    expect(styles).toContain("Allineamento visivo con l'Archivio centralizzato");
    expect(styles).toContain('.dnd-catalog-level-list');
  });

  it('definisce relazioni polimorfe con una sola origine e destinazione', () => {
    const sql = readFileSync('db/dnd_shared_catalogs.sql', 'utf8');
    expect(sql).toContain('shared_grants_one_source');
    expect(sql).toContain('shared_grants_one_target');
    expect(sql).toContain('num_nonnulls');
    expect(sql).toContain('shared_choice_progression');
    expect(sql).toContain('public.is_catalog_admin()');
  });
});
