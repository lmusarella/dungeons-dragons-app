import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { classProgressionTables } from '../../../../src/features/dndCatalog/dndCatalog.js';

describe('catalogo D&D condiviso', () => {
  it('deriva la progressione completa degli slot per un incantatore full', () => {
    const tables = classProgressionTables({
      spellcasting_data: {
        casterProgression: 'full',
        cantripProgression: [4, 4, 4, 5],
        preparedSpellsProgression: [2, 4, 6, 7]
      }
    });
    const slots = tables.find((table) => table.title === 'Progressione incantesimi');
    expect(slots.columns).toEqual(['Livello', 'Preparati', 'Trucchetti', 'Slot 1°', 'Slot 2°', 'Slot 3°', 'Slot 4°', 'Slot 5°', 'Slot 6°', 'Slot 7°', 'Slot 8°', 'Slot 9°']);
    expect(slots.rows[0]).toEqual([1, 2, 4, 2, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(slots.rows[19]).toEqual([20, '—', '—', 4, 3, 3, 3, 3, 2, 2, 1, 1]);
    expect(tables.filter((table) => ['Progressione incantesimi', 'Trucchetti conosciuti', 'Incantesimi preparati'].includes(table.title))).toHaveLength(1);
  });

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
    expect(source).toContain('getCharacterProgression');
    expect(source).toContain('getClassDetails');
    expect(source).toContain('Scelte per livello');
    expect(source).toContain('Disponibili dal livello');
    expect(source).toContain('Progressione della classe');
    expect(source).toContain('renderFeatureTimeline');
    expect(source).toContain('renderClassTables');
    expect(source).toContain('Sottoclassi e relative abilità');
    expect(source).toContain('data-class-detail-tab="progression"');
    expect(source).toContain('data-class-detail-panel="subclasses"');
    expect(source).toContain('catalogName');
    expect(source).toContain('catalogDescription');
    expect(source).toContain('catalogStatBlock');
    expect(source).toContain('getFeatureOrigins');
    expect(source).toContain('Privilegi e abilità collegate');
    expect(source).toContain('Livello ${escapeHtml(grant.unlock_level');
    expect(config).toContain("table: 'shared_classes'");
    expect(config).toContain("table: 'shared_creatures'");
    expect(config).toContain("table: 'shared_species_variants'");
    expect(config).toContain("existingRoute: 'library'");
  });

  it('risolve grant, scelte e progressione usando UUID e foreign key reali', () => {
    const resolver = readFileSync('src/features/dndCatalog/catalogRelations.js', 'utf8');
    const drawer = readFileSync('src/features/character/home/characterDrawer.js', 'utf8');
    expect(resolver).toContain("classId: ['shared_class_id', 'source_class_id']");
    expect(resolver).toContain("subclassId: ['shared_subclass_id', 'source_subclass_id']");
    expect(resolver).toContain("speciesVariantId: ['shared_species_variant_id', 'source_species_variant_id']");
    expect(resolver).toContain("['granted_feature_id', 'target_feature_id']");
    expect(resolver).toContain('row.new_choices');
    expect(resolver).toContain('getAvailableChoiceOptions');
    expect(resolver).toContain('getCharacterProgression');
    expect(resolver).toContain('getSubclassProgressions');
    expect(resolver).toContain('row.unlock_level ?? row.required_level ?? row.level');
    expect(resolver).toContain('Promise.allSettled');
    expect(drawer).toContain('name="shared_class_id"');
    expect(drawer).toContain('name="shared_subclass_id"');
    expect(drawer).toContain('catalog_choice_option_ids');
    expect(drawer).toContain('Completa la scelta obbligatoria');
    expect(drawer).toContain('shared_species_variant_id');
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
    expect(api).toContain("catalog.key === 'creatures'");
    expect(api).toContain(".eq('challenge_rating', challengeRating.trim())");
    expect(api).toContain('name_it.ilike');
    expect(api).toContain(".order('name_it'");
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
