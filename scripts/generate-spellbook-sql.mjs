import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';

const [sourceArgument, outputArgument = 'db'] = process.argv.slice(2);

if (!sourceArgument) {
  throw new Error('Uso: node scripts/generate-spellbook-sql.mjs <spellbook.json> [cartella-output]');
}

const sourcePath = resolve(sourceArgument);
const outputDirectory = resolve(outputArgument);
const document = JSON.parse(readFileSync(sourcePath, 'utf8'));

if (document?.type !== 'spells' || !Array.isArray(document.items)) {
  throw new Error('Il JSON deve avere type "spells" e un array items.');
}

const versions = ['2014', '2024'];
const saveAbilities = new Map([
  ['forza', 'str'],
  ['destrezza', 'dex'],
  ['costituzione', 'con'],
  ['intelligenza', 'int'],
  ['saggezza', 'wis'],
  ['carisma', 'cha']
]);
const attackRanges = new Map([
  ['mischia', 'melee'],
  ['distanza', 'ranged']
]);

function text(value) {
  if (value === null || value === undefined || value === '') return 'null';
  return `'${String(value).replaceAll("'", "''")}'`;
}

function integer(value) {
  if (value === null || value === undefined || value === '') return 'null';
  const parsed = Number(value);
  return Number.isInteger(parsed) ? String(parsed) : 'null';
}

function boolean(value) {
  return value ? 'true' : 'false';
}

function textArray(values) {
  const normalized = Array.isArray(values)
    ? values.map((value) => String(value).trim().toLocaleLowerCase('it')).filter(Boolean)
    : [];
  return normalized.length ? `array[${normalized.map(text).join(', ')}]::text[]` : 'array[]::text[]';
}

function sourceKey(url) {
  try {
    const parts = new URL(url).pathname.split('/').filter(Boolean);
    return decodeURIComponent(parts.at(-1) || '').toLocaleLowerCase('en');
  } catch {
    return '';
  }
}

function normalizeDieNotation(value) {
  const notation = String(value || '').trim().toLowerCase();
  return /^\d+d\d+$/.test(notation) ? notation : null;
}

function upcastDieFromDescription(edition) {
  if (edition?.hasUpcastRule !== true) return null;
  const description = String(edition.upcastDescription || '').trim();
  const match = description.match(/\b\d+d\d+\b/i);
  return normalizeDieNotation(match?.[0]);
}

function healingDieFromDescription(edition) {
  if (normalizeDieNotation(edition?.damageDice)) return null;
  const description = String(edition?.description || '');
  const baseDescription = edition?.upcastDescription
    ? description.replace(String(edition.upcastDescription), '')
    : description;
  const match = baseDescription.match(/(?:recuper\w*|ripristin\w*|guarisc\w*)[^.\n]{0,180}?\b(\d+d\d+)\b/i);
  return normalizeDieNotation(match?.[1]);
}

function upcastStartLevel(edition, damageDie) {
  if (!damageDie || Number(edition?.level) < 1) return null;
  const description = String(edition.upcastDescription || '');
  const explicitStart = description.match(/slot(?: incantesimo)?(?: di)?(?: livello)?\s+(\d+)°?(?:\s+livello)?(?:\s+o\s+\d+°?(?:\s+livello)?|\s+o superiore|\s*-)/i);
  if (explicitStart) return Number(explicitStart[1]);
  const aboveLevel = description.match(/superiore\s+(?:al|a)\s+(\d+)°?/i);
  if (aboveLevel) return Number(aboveLevel[1]) + 1;
  return Number(edition.level) + 1;
}

function upcastFields(edition) {
  const rule = edition?.upcast;
  const perLevel = rule?.perSlotLevel;
  const isDamageRule = ['damage', 'extraDamage'].includes(rule?.kind);
  const structuredDie = isDamageRule ? normalizeDieNotation(perLevel) : null;
  const damageDie = structuredDie || upcastDieFromDescription(edition);
  return {
    damageDie,
    damageModifier: null,
    startLevel: upcastStartLevel(edition, damageDie)
  };
}

function normalizeSpell(item, edition, rulesVersion) {
  const key = sourceKey(item.detailUrl);
  if (!key) throw new Error(`detailUrl non valido per ${item.name} (${rulesVersion}).`);
  const upcast = upcastFields(edition);
  const savingThrow = saveAbilities.get(String(edition.savingThrow || '').trim().toLocaleLowerCase('it')) || null;
  const attackRange = attackRanges.get(String(edition.attackType || '').trim().toLocaleLowerCase('it')) || null;
  const structuredDamageDie = normalizeDieNotation(edition.damageDice);
  const inferredHealingDie = healingDieFromDescription(edition);
  return {
    source_key: key,
    rules_version: rulesVersion,
    name: String(item.name || '').trim(),
    level: Number(edition.level ?? item.level),
    school: String(edition.school || item.school || '').trim().toLocaleLowerCase('it') || null,
    caster_classes: edition.classes,
    cast_time: edition.castingTime,
    range: edition.range,
    duration: edition.duration,
    components: Array.isArray(edition.components) ? edition.components.join(', ') : edition.components,
    material: edition.material,
    concentration: Boolean(edition.concentration),
    ritual: Boolean(edition.ritual),
    attack_roll: Boolean(edition.hasSpellAttack || attackRange),
    saving_throw_ability: savingThrow,
    attack_range_type: attackRange,
    damage_die: structuredDamageDie || inferredHealingDie,
    inferred_base_die: Boolean(inferredHealingDie),
    damage_modifier: null,
    damage_type: edition.damageType,
    upcast_damage_die: upcast.damageDie,
    upcast_damage_modifier: upcast.damageModifier,
    upcast_start_level: upcast.startLevel,
    upcast_description: edition.upcastDescription,
    description: edition.description,
    source: edition.source,
    source_url: item.detailUrl
  };
}

const columns = [
  'created_by', 'source_key', 'rules_version', 'name', 'level', 'school', 'caster_classes',
  'cast_time', 'range', 'duration', 'components', 'material', 'concentration', 'ritual',
  'attack_roll', 'saving_throw_ability', 'attack_range_type', 'damage_die', 'damage_modifier',
  'damage_type', 'upcast_damage_die', 'upcast_damage_modifier', 'upcast_start_level',
  'upcast_description', 'description', 'source', 'source_url'
];

function sqlRow(spell) {
  return `    (${[
    text(spell.source_key), text(spell.rules_version), text(spell.name), integer(spell.level), text(spell.school),
    textArray(spell.caster_classes), text(spell.cast_time), text(spell.range), text(spell.duration),
    text(spell.components), text(spell.material), boolean(spell.concentration), boolean(spell.ritual),
    boolean(spell.attack_roll), text(spell.saving_throw_ability), text(spell.attack_range_type),
    text(spell.damage_die), integer(spell.damage_modifier), text(spell.damage_type),
    text(spell.upcast_damage_die), integer(spell.upcast_damage_modifier), integer(spell.upcast_start_level),
    text(spell.upcast_description), text(spell.description), text(spell.source), text(spell.source_url)
  ].join(', ')})`;
}

function buildSql(rulesVersion, spells) {
  const importColumns = columns.filter((column) => column !== 'created_by');
  const updateColumns = columns.filter((column) => !['created_by', 'source_key', 'rules_version'].includes(column));
  return `-- Importazione catalogo incantesimi ${rulesVersion}\n` +
    `-- Generato da ${basename(sourcePath)}. Record: ${spells.length}.\n` +
    '-- Prerequisiti: admin_shared_catalog_rls.sql e extend_shared_spells_spellbook_import.sql.\n' +
    '-- scrapeStatus e verifiedEditions/verifiedVersion sono intenzionalmente ignorati.\n\n' +
    'begin;\n\n' +
    'do $spellbook_import$\n' +
    'declare\n' +
    '  v_created_by uuid;\n' +
    'begin\n' +
    '  select user_id into v_created_by\n' +
    '  from public.catalog_admins\n' +
    '  order by created_at, user_id\n' +
    '  limit 1;\n\n' +
    '  if v_created_by is null then\n' +
    "    raise exception 'Nessun amministratore presente in public.catalog_admins.';\n" +
    '  end if;\n\n' +
    '  create temporary table spellbook_import_rows on commit drop as\n' +
    `    select ${importColumns.join(', ')}\n` +
    '    from public.shared_spells\n' +
    '    with no data;\n\n' +
    `  insert into spellbook_import_rows (\n    ${importColumns.join(',\n    ')}\n  )\n  values\n` +
    spells.map(sqlRow).join(',\n') + '\n' +
    '  ;\n\n' +
    '  -- Collega al nuovo source_key eventuali record creati manualmente in precedenza.\n' +
    '  update public.shared_spells as existing\n' +
    '  set source_key = imported.source_key,\n' +
    '      source_url = coalesce(existing.source_url, imported.source_url),\n' +
    '      updated_at = now()\n' +
    '  from spellbook_import_rows as imported\n' +
    '  where existing.source_key is null\n' +
    '    and existing.rules_version = imported.rules_version\n' +
    '    and existing.level = imported.level\n' +
    '    and lower(existing.name) = lower(imported.name);\n\n' +
    `  insert into public.shared_spells (\n    ${columns.join(',\n    ')}\n  )\n` +
    `  select v_created_by, ${importColumns.map((column) => `imported.${column}`).join(', ')}\n` +
    '  from spellbook_import_rows as imported\n' +
    '  where true\n' +
    '  on conflict (source_key, rules_version) do update set\n    ' +
    updateColumns.map((column) => `${column} = excluded.${column}`).join(',\n    ') + ',\n    updated_at = now();\n' +
    'end\n' +
    '$spellbook_import$;\n\n' +
    'commit;\n';
}

function buildUpcastBackfillSql(spells) {
  const rows = spells.filter((spell) => spell.upcast_damage_die);
  return '-- Backfill della notazione unica di upcast ricavata da upcastDescription.\n' +
    `-- Record aggiornabili: ${rows.length}. Se una descrizione contiene più dadi viene usata la prima notazione.\n\n` +
    'begin;\n\n' +
    'with inferred_upcast (source_key, rules_version, upcast_damage_die, upcast_start_level) as (\n' +
    '  values\n' +
    rows.map((spell) => `    (${text(spell.source_key)}, ${text(spell.rules_version)}, ${text(spell.upcast_damage_die)}, ${integer(spell.upcast_start_level)})`).join(',\n') + '\n' +
    ')\n' +
    'update public.shared_spells as spell\n' +
    'set upcast_damage_die = inferred.upcast_damage_die,\n' +
    '    upcast_start_level = inferred.upcast_start_level,\n' +
    '    updated_at = now()\n' +
    'from inferred_upcast as inferred\n' +
    'where spell.source_key = inferred.source_key\n' +
    '  and spell.rules_version = inferred.rules_version\n' +
    '  and (spell.upcast_damage_die is distinct from inferred.upcast_damage_die\n' +
    '    or spell.upcast_start_level is distinct from inferred.upcast_start_level);\n\n' +
    'commit;\n';
}

function buildBaseDiceBackfillSql(spells) {
  const rows = spells.filter((spell) => spell.inferred_base_die && spell.damage_die);
  return '-- Backfill della notazione base per gli incantesimi curativi.\n' +
    '-- Il JSON sorgente non valorizza damageDice per le cure: il dado viene ricavato dalla descrizione base.\n' +
    `-- Record aggiornabili: ${rows.length}.\n\n` +
    'begin;\n\n' +
    'with inferred_base_dice (source_key, rules_version, damage_die) as (\n' +
    '  values\n' +
    rows.map((spell) => `    (${text(spell.source_key)}, ${text(spell.rules_version)}, ${text(spell.damage_die)})`).join(',\n') + '\n' +
    ')\n' +
    'update public.shared_spells as spell\n' +
    'set damage_die = inferred.damage_die,\n' +
    '    updated_at = now()\n' +
    'from inferred_base_dice as inferred\n' +
    'where spell.source_key = inferred.source_key\n' +
    '  and spell.rules_version = inferred.rules_version\n' +
    '  and spell.damage_die is distinct from inferred.damage_die;\n\n' +
    'commit;\n';
}

mkdirSync(outputDirectory, { recursive: true });

const normalizedSpells = [];
for (const rulesVersion of versions) {
  const spells = document.items
    .filter((item) => item?.editions?.[rulesVersion])
    .map((item) => normalizeSpell(item, item.editions[rulesVersion], rulesVersion));
  normalizedSpells.push(...spells);
  const keys = new Set();
  for (const spell of spells) {
    const uniqueKey = `${spell.source_key}:${spell.rules_version}`;
    if (keys.has(uniqueKey)) throw new Error(`Chiave sorgente duplicata: ${uniqueKey}`);
    keys.add(uniqueKey);
  }
  const outputPath = join(outputDirectory, `import_shared_spells_${rulesVersion}.sql`);
  writeFileSync(outputPath, buildSql(rulesVersion, spells), 'utf8');
  console.log(`${rulesVersion}: ${spells.length} record -> ${outputPath}`);
}

const upcastBackfillPath = join(outputDirectory, 'backfill_shared_spell_upcast_dice.sql');
writeFileSync(upcastBackfillPath, buildUpcastBackfillSql(normalizedSpells), 'utf8');
console.log(`Upcast: ${normalizedSpells.filter((spell) => spell.upcast_damage_die).length} record -> ${upcastBackfillPath}`);

const baseDiceBackfillPath = join(outputDirectory, 'backfill_shared_spell_base_dice.sql');
writeFileSync(baseDiceBackfillPath, buildBaseDiceBackfillSql(normalizedSpells), 'utf8');
console.log(`Dadi base inferiti: ${normalizedSpells.filter((spell) => spell.inferred_base_die).length} record -> ${baseDiceBackfillPath}`);
