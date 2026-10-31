import { sanitizeImageUrl } from '../../../lib/html.js';
import { buildCompactSpellSlots } from './slotOverview.js';
import {
  abilityShortLabel,
  conditionList,
  damageTypeList,
  equipmentProficiencyList,
  RESOURCE_CAST_TIME_ORDER,
  savingThrowList,
  skillList,
  weaknessLevelList
} from './constants.js';
import { getWeaponMasteryLabel, getWeaponMasterySummary } from '../../rules/weaponMasteries.js';
import {
  calculateArmorClass,
  calculatePassivePerception,
  calculateSkillModifier,
  calculateUnarmedAttackBonuses,
  buildSpellDamageOverlayConfig,
  formatHitDice,
  formatModifier,
  formatSigned,
  getAbilityModifier,
  getEquipSlots,
  getUnarmedAttackAbility,
  getWeaponDamageModes,
  normalizeNumber,
  parseProficiencyNotes,
  parseProficiencyNotesSections,
  sortSpellsByLevel
} from './utils.js';
import { normalizeSpellSchool } from '../spellSchools.js';
import { calcItemWeight, calcSelectionWeight } from '../../../lib/calc.js';
import { formatWeight } from '../../../lib/format.js';
import { getBodyPartLabels, getCategoryLabel, getItemStatusLabels, getWeightUnit } from '../../inventory/utils.js';
import { ammunitionTypeLabels } from '../../inventory/constants.js';

const DAMAGE_ACTION_ICON = `
  <svg class="attack-action-button__svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <rect x="4.5" y="4.5" width="15" height="15" rx="3"></rect>
    <circle cx="9" cy="9" r="1"></circle><circle cx="15" cy="9" r="1"></circle>
    <circle cx="12" cy="12" r="1"></circle><circle cx="9" cy="15" r="1"></circle><circle cx="15" cy="15" r="1"></circle>
  </svg>`;
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeCompanionStatBlock(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};
  return {
    abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10, ...(source.abilities || {}) },
    armor_class: source.armor_class ?? null,
    initiative: source.initiative ?? null,
    darkvision_range_m: source.darkvision_range_m ?? null,
    hp: { current: 1, max: 1, ...(source.hp || {}) },
    speeds: { walk: null, fly: null, climb: null, burrow: null, ...(source.speeds || {}) },
    attacks: Array.isArray(source.attacks) ? source.attacks : []
  };
}

function getActiveWildShape(character, companions = []) {
  const data = character?.data || {};
  if (!data.wild_shape_enabled) return null;
  const wildShape = data.wild_shape || {};
  if (!wildShape.active_companion_id) return null;
  const companion = (companions || []).find((entry) => String(entry.id) === String(wildShape.active_companion_id));
  if (!companion) return null;
  const statBlock = normalizeCompanionStatBlock(companion.stat_block);
  const hpMax = Math.max(Number(statBlock.hp.max) || Number(statBlock.hp.current) || 1, 1);
  const hpCurrent = Math.max(0, Math.min(Number(wildShape.hp_current ?? statBlock.hp.current ?? hpMax) || 0, hpMax));
  return { companion, statBlock, hpCurrent, hpMax };
}

function formatWildShapeSpeeds(speeds = {}) {
  const labels = [
    ['walk', 'terra'],
    ['fly', 'volo'],
    ['climb', 'scalata'],
    ['burrow', 'scavare']
  ];
  return labels
    .map(([key, label]) => Number(speeds?.[key]) ? `${label} ${Number(speeds[key])} m` : '')
    .filter(Boolean)
    .join(' · ');
}

export function buildEmptyState(canCreateCharacter, offline) {
  if (!canCreateCharacter) {
    const message = offline
      ? 'Modalità offline attiva: crea un personaggio quando torni online.'
      : 'Accedi per creare un personaggio.';
    return `<p class="muted">${message}</p>`;
  }
  return `
    <div>
      <p>Non hai ancora un personaggio.</p>
      <div class="button-row">
        <button class="primary" data-create-character>Nuovo personaggio</button>
      </div>
    </div>
  `;
}
export function buildCharacterOverview(character, canEditCharacter, items = [], companions = []) {
  const data = character.data || {};
  const hp = data.hp || {};
  const hitDice = data.hit_dice || {};
  const abilities = data.abilities || {};
  const activeWildShape = getActiveWildShape(character, companions);
  const effectiveAbilities = activeWildShape
    ? {
      ...abilities,
      str: Number(activeWildShape.statBlock.abilities.str) || 10,
      dex: Number(activeWildShape.statBlock.abilities.dex) || 10,
      con: Number(activeWildShape.statBlock.abilities.con) || 10
    }
    : abilities;
  const proficiencyBonus = normalizeNumber(data.proficiency_bonus);
  const hasInspiration = Boolean(data.inspiration);
  const hasConcentration = Boolean(data.concentration_active);
  const characterInitiative = data.initiative ?? getAbilityModifier(abilities.dex);
  const wildShapeInitiative = activeWildShape
    ? (normalizeNumber(activeWildShape.statBlock.initiative) ?? getAbilityModifier(activeWildShape.statBlock.abilities.dex))
    : null;
  const initiativeBonus = activeWildShape ? wildShapeInitiative : characterInitiative;
  const skillStates = data.skills || {};
  const skillMasteryStates = data.skill_mastery || {};
  const passivePerception = calculatePassivePerception(effectiveAbilities, proficiencyBonus, skillStates, skillMasteryStates);
  const currentHp = normalizeNumber(hp.current);
  const maxHp = normalizeNumber(hp.max);
  const tempHp = normalizeNumber(hp.temp);
  const deathSaves = data.death_saves || {};
  const deathSaveSuccesses = Math.max(0, Math.min(3, Number(deathSaves.successes) || 0));
  const deathSaveFailures = Math.max(0, Math.min(3, Number(deathSaves.failures) || 0));
  const hpPercent = maxHp ? Math.min(Math.max((Number(currentHp) / maxHp) * 100, 0), 100) : 0;
  const tempHpValue = Math.max(0, Number(tempHp) || 0);
  const hpPool = Math.max(0, Number(maxHp ?? currentHp ?? 0));
  const hasTempHp = tempHpValue > 0;
  const tempHpPercent = hasTempHp ? 100 : 0;
  const hpTrackFlex = hasTempHp ? hpPool : 1;
  const tempTrackFlex = hasTempHp ? tempHpValue : 0;
  const hpLabel = maxHp ? `${currentHp ?? '-'}/${maxHp}` : `${currentHp ?? '-'}`;
  const hpPercentLabel = maxHp ? `${Math.round(hpPercent)}%` : '-';
  const tempHpLabel = tempHp ?? '-';
  const weakPoints = Math.max(0, Math.min(6, Number(hp.weak_points) || 0));
  const conditionState = Array.isArray(data.conditions)
    ? data.conditions
    : (data.condition ? [data.condition] : []);
  const activeConditions = conditionList.filter((condition) => conditionState.includes(condition.key));
  const weaknessLevels = weaknessLevelList.filter((level) => level.value > 0);
  const currentWeakness = weakPoints > 0 ? weaknessLevels[weakPoints - 1] : null;
  const armorClass = calculateArmorClass(data, abilities, items);
  const wildShapeArmorClass = activeWildShape
    ? (normalizeNumber(activeWildShape.statBlock.armor_class) ?? (10 + (getAbilityModifier(activeWildShape.statBlock.abilities.dex) || 0)))
    : null;
  const effectiveArmorClass = activeWildShape ? wildShapeArmorClass : armorClass;
  const effectiveSpeed = activeWildShape
    ? (normalizeNumber(activeWildShape.statBlock.speeds.walk) ?? '-')
    : (data.speed ?? '-');
  const hasDarkvision = Boolean(data.darkvision_enabled);
  const darkvisionRange = normalizeNumber(data.darkvision_range_m);
  const darkvisionLabel = hasDarkvision
    ? `${darkvisionRange ?? 18} m`
    : 'No';
  const wildShapeDarkvision = activeWildShape
    ? normalizeNumber(activeWildShape.statBlock.darkvision_range_m)
    : null;
  const wildShapeDarkvisionLabel = wildShapeDarkvision === null ? 'No' : `${wildShapeDarkvision} m`;
  const wildShapeForms = (companions || []).filter((entry) => ['familiar', 'summon', 'transformation', 'animal'].includes(entry.kind || 'familiar'));
  const wildShapeHpPercent = activeWildShape ? Math.min(Math.max((activeWildShape.hpCurrent / activeWildShape.hpMax) * 100, 0), 100) : 0;
  const wildShapeSpeedLabel = activeWildShape ? formatWildShapeSpeeds(activeWildShape.statBlock.speeds) : '';
  const abilityCards = [
    { key: 'str', label: abilityShortLabel.str, value: effectiveAbilities.str, wild: Boolean(activeWildShape) },
    { key: 'dex', label: abilityShortLabel.dex, value: effectiveAbilities.dex, wild: Boolean(activeWildShape) },
    { key: 'con', label: abilityShortLabel.con, value: effectiveAbilities.con, wild: Boolean(activeWildShape) },
    { key: 'int', label: abilityShortLabel.int, value: abilities.int },
    { key: 'wis', label: abilityShortLabel.wis, value: abilities.wis },
    { key: 'cha', label: abilityShortLabel.cha, value: abilities.cha }
  ];
  return `
    <div class="character-overview character-manual">
      <div class="character-summary ${data.avatar_url ? '' : 'character-summary--no-avatar'}">
        ${data.avatar_url ? `<div class="character-avatar-frame"><img class="character-avatar" src="${data.avatar_url}" alt="Ritratto di ${character.name}" /></div>` : ''}
        <div class="character-profile-body">
          <div class="character-identity">
            <span class="character-identity__kicker">${escapeHtml([data.class_name ?? data.class_archetype, data.archetype].filter(Boolean).join(' · ') || 'Avventuriero')}</span>
            <div class="character-identity__heading">
              <h3 class="character-name">${character.name}</h3>
              <span class="character-level-seal"><small>Livello</small><strong>${data.level ?? '-'}</strong></span>
            </div>
            <p class="character-lineage">${escapeHtml([data.race, data.background].filter(Boolean).join(' · ') || 'Origini non specificate')}</p>
            <div class="character-meta">
              <span class="meta-tag meta-tag--level"><small>Bonus Competenza</small><strong>${formatSigned(proficiencyBonus)}</strong></span>
              <span class="meta-tag"><small>Allineamento</small><strong>${data.alignment ?? '-'}</strong></span>
            </div>
          </div>
        </div>
        <div class="character-summary-actions" aria-label="Stato del personaggio">
          <div class="profile-status-card profile-status-card--inspiration ${hasInspiration ? 'is-active' : ''}">
            <span class="profile-status-card__text">
              <span class="profile-status-card__label">Ispirazione</span>
              <span class="profile-status-card__state">${hasInspiration ? 'Attiva' : 'Non attiva'}</span>
            </span>
            <button
              class="inspiration-toggle"
              type="button"
              data-toggle-inspiration
              aria-pressed="${hasInspiration}"
              aria-label="${hasInspiration ? 'Rimuovi' : 'Attiva'} ispirazione"
              ${canEditCharacter ? '' : 'disabled'}
            >
              <span class="inspiration-toggle__icon" aria-hidden="true">★</span>
            </button>
          </div>
          <div class="profile-status-card profile-status-card--concentration ${hasConcentration ? 'is-active' : ''}">
            <span class="profile-status-card__text">
              <span class="profile-status-card__label">Concentrazione</span>
              <span class="profile-status-card__state">${hasConcentration ? 'Attiva' : 'Non attiva'}</span>
            </span>
            <button
              class="inspiration-toggle concentration-toggle"
              type="button"
              data-toggle-concentration
              aria-pressed="${hasConcentration}"
              aria-label="${hasConcentration ? 'Termina' : 'Attiva'} concentrazione"
              ${canEditCharacter ? '' : 'disabled'}
            >
              <span class="inspiration-toggle__icon" aria-hidden="true">◉</span>
            </button>
          </div>
          <button
            class="profile-status-card profile-status-card--background background-button"
            type="button"
            data-show-background
            title="${escapeHtml(data.background ?? 'Apri dettagli background')}"
          >
            <span class="profile-status-card__label">Storia Personaggio</span>
            <span class="profile-status-card__arrow" aria-hidden="true">›</span>
          </button>
        </div>
      </div>
      <div class="stat-panel">     
        <div class="stat-grid stat-grid--compact stat-grid--abilities">
          ${abilityCards.map((ability) => {
    const score = normalizeNumber(ability.value);
    const modifier = score === null ? '-' : formatModifier(score);
    return `
            <button class="stat-card stat-card--interactive stat-card--${ability.key} ${ability.wild ? 'stat-card--wild-shape' : ''}" type="button" data-ability-card="${ability.key}" aria-label="Tira una prova di ${ability.label} con modificatore ${modifier}">
              <span>${ability.label}${ability.wild ? ' <small>forma</small>' : ''}</span>
              <strong>${score ?? '-'}</strong>
              <span class="stat-card__modifier" aria-label="Modificatore ${ability.label}">${modifier}</span>
              <span class="stat-card__roll" aria-hidden="true">d20</span>
            </button>
          `;
  }).join('')}
        </div>
      </div>
      <section class="hp-panel" aria-label="Statistiche di combattimento">
        <div class="combat-vitals-grid">
          <div class="combat-stat combat-stat--armor" title="Classe armatura" aria-label="Classe armatura ${effectiveArmorClass ?? '-'}">
            <span class="combat-stat__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M12 3 5.5 5.5v5.2c0 4.2 2.6 8 6.5 10.3 3.9-2.3 6.5-6.1 6.5-10.3V5.5L12 3Z"/></svg>
            </span>
            <span class="combat-stat__label">Classe armatura</span>
            <strong>${effectiveArmorClass ?? '-'}</strong>
          </div>
          <button class="combat-stat combat-stat--initiative combat-stat--interactive" type="button" data-special-skill-card="default_initiative" title="Tira iniziativa" aria-label="Tira iniziativa ${formatSigned(normalizeNumber(initiativeBonus))}">
            <span class="combat-stat__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="m13.5 2-8 11h6l-1 9 8-12h-6l1-8Z"/></svg>
            </span>
            <span class="combat-stat__label">Iniziativa</span>
            <strong>${formatSigned(normalizeNumber(initiativeBonus))}</strong>
            <span class="combat-stat__roll" aria-hidden="true">d20</span>
          </button>
          <div class="combat-stat combat-stat--speed" title="Velocità in metri" aria-label="Velocità ${effectiveSpeed} metri">
            <span class="combat-stat__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24"><circle cx="14.5" cy="4.5" r="2"/><path d="m8 21 2.5-6 2 1.5L16 21M5 12l4-4 4 2 3 4 3-1M10 8l2-3"/></svg>
            </span>
            <span class="combat-stat__label">Velocità</span>
            <strong>${effectiveSpeed}<small>m</small></strong>
          </div>
          <div class="hp-vitals-card">
            <div class="hp-bar-label">
              <span class="hp-vitals-card__icon" aria-hidden="true">♥</span>
              <span class="hp-bar-label__title">Punti ferita</span>
              <strong class="hp-bar-label__value">${hpLabel}</strong>
              <span class="hp-bar-label__percent" aria-label="Percentuale vita ${hpPercentLabel}">${hpPercentLabel}</span>
              ${hasTempHp ? `
              <span class="hp-bar-label__temp-group is-active">
                <span>Punti ferita temporanei</span><strong>${tempHpLabel}</strong>
              </span>
              ` : ''}
            </div>
            <div class="hp-bar-track" role="meter" aria-label="Punti ferita attuali" aria-valuemin="0" aria-valuemax="${maxHp ?? 0}" aria-valuenow="${currentHp ?? 0}">
              <div class="hp-bar" style="flex: ${hpTrackFlex};">
                <div class="hp-bar__fill" style="width: ${hpPercent}%;"></div>
              </div>
              ${hasTempHp ? `
              <div class="hp-bar hp-bar--temp is-active" style="flex: ${tempTrackFlex};">
                <div class="hp-bar__fill hp-bar__fill--temp" style="width: ${tempHpPercent}%;"></div>
              </div>
              ` : ''}
            </div>
            <div class="hp-vitals-card__footer">
              <div class="hp-panel-hit-dice" title="Dadi vita disponibili">
                <span>Dadi vita</span>
                <strong>${formatHitDice(hitDice)}</strong>
                <button
                  class="icon-button icon-button--dice hp-panel-hit-dice__roll"
                  type="button"
                  data-roll-hit-dice
                  aria-label="Lancia dado vita per curare PF"
                  title="Lancia dado vita"
                  ${canEditCharacter ? '' : 'disabled'}
                ><span aria-hidden="true">🎲</span></button>
              </div>
              <div class="hp-panel-insights" aria-label="Sensi e percezione">
                <span class="vital-mini-chip"><span>Percezione passiva</span><strong>${passivePerception ?? '-'}</strong></span>
                <span class="vital-mini-chip"><span>Scurovisione</span><strong>${darkvisionLabel}</strong></span>
              </div>
            </div>
            ${activeWildShape ? `
            <div class="wild-shape-vitals">
              <div class="hp-bar-label hp-bar-label--wild-shape">
                <span class="hp-vitals-card__icon hp-vitals-card__icon--wild" aria-hidden="true">♥</span>
                <span class="hp-bar-label__title">Punti ferita forma</span>
                <strong class="hp-bar-label__value">${activeWildShape.hpCurrent}/${activeWildShape.hpMax}</strong>
                <span class="hp-bar-label__percent">${Math.round(wildShapeHpPercent)}%</span>
                <span class="wild-shape-vitals__name">${escapeHtml(activeWildShape.companion.name)}</span>
                <button class="ghost-button ghost-button--compact wild-shape-end-button" type="button" data-end-wild-shape ${canEditCharacter ? '' : 'disabled'}>Termina</button>
              </div>
              <div class="hp-bar-track hp-bar-track--wild-shape" role="meter" aria-label="Punti ferita della forma" aria-valuemin="0" aria-valuemax="${activeWildShape.hpMax}" aria-valuenow="${activeWildShape.hpCurrent}">
                <div class="hp-bar"><div class="hp-bar__fill hp-bar__fill--wild" style="width: ${wildShapeHpPercent}%;"></div></div>
              </div>
              <div class="wild-shape-vitals__info">
                ${wildShapeSpeedLabel ? `<span class="vital-mini-chip vital-mini-chip--speed"><span>Movimento</span><strong>${escapeHtml(wildShapeSpeedLabel)}</strong></span>` : ''}
                <span class="vital-mini-chip vital-mini-chip--darkvision"><span>Scurovisione</span><strong>${wildShapeDarkvisionLabel}</strong></span>
              </div>
            </div>
            ` : data.wild_shape_enabled ? `
            <div class="wild-shape-empty">
              <span>Forma selvatica pronta</span>
              <button class="ghost-button ghost-button--compact" type="button" data-open-wild-shape ${canEditCharacter && wildShapeForms.length ? '' : 'disabled'}>
                Trasformati (${wildShapeForms.length})
              </button>
            </div>
            ` : ''}
          </div>
        </div>
        <div class="hp-panel-status-row" aria-label="Stati rapidi del personaggio">
          <button class="combat-status-card status-launch-card status-launch-card--weakness" type="button" data-edit-weakness ${canEditCharacter ? '' : 'disabled'}>
            <span class="status-launch-card__icon" aria-hidden="true">◒</span>
            <span class="status-launch-card__copy">
              <span>Punti indebolimento</span>
              <strong>${weakPoints}<small>/6</small></strong>
              <small>${escapeHtml(currentWeakness?.effect || 'Nessun effetto attivo')}</small>
            </span>
            <span class="status-launch-card__arrow" aria-hidden="true">›</span>
          </button>
          <button class="combat-status-card status-launch-card status-launch-card--conditions" type="button" data-edit-conditions ${canEditCharacter ? '' : 'disabled'}>
            <span class="status-launch-card__icon" aria-hidden="true">✦</span>
            <span class="status-launch-card__copy">
              <span>Condizioni</span>
              <strong>${activeConditions.length || 'Nessuna'}</strong>
              <small>${activeConditions.length ? escapeHtml(activeConditions.map((condition) => condition.label).join(' · ')) : 'Nessuna condizione attiva'}</small>
            </span>
            <span class="status-launch-card__arrow" aria-hidden="true">›</span>
          </button>
          <div class="combat-status-card death-saves">
            <div class="combat-status-card__header death-saves__heading">
              <div class="track-label-row">
                <span class="combat-status-card__icon combat-status-card__icon--death" aria-hidden="true">†</span>
                <span class="death-saves__label">TS morte</span>
              </div>
              <button
                class="icon-button icon-button--dice death-saves__roll"
                type="button"
                data-roll-death-save
                aria-label="Tira il tiro salvezza su morte"
                title="Tira TS morte"
                ${canEditCharacter ? '' : 'disabled'}
              ><span aria-hidden="true">🎲</span></button>
            </div>
            <div class="death-saves__tracks">
              <div class="death-saves__group" aria-label="Successi">
                <span class="death-saves__tag death-saves__tag--success">✓</span>
                ${Array.from({ length: 3 }, (_, index) => {
    const value = index + 1;
    const isFilled = value <= deathSaveSuccesses;
    return `<button class="death-save-dot ${isFilled ? 'is-filled' : ''}" type="button" data-death-save="successes" data-death-save-index="${value}" aria-label="Successi ${value}" ${canEditCharacter ? '' : 'disabled'}><span aria-hidden="true"></span></button>`;
  }).join('')}
              </div>
              <div class="death-saves__group" aria-label="Fallimenti">
                <span class="death-saves__tag death-saves__tag--failure">✕</span>
                ${Array.from({ length: 3 }, (_, index) => {
    const value = index + 1;
    const isFilled = value <= deathSaveFailures;
    return `<button class="death-save-dot ${isFilled ? 'is-filled' : ''}" type="button" data-death-save="failures" data-death-save-index="${value}" aria-label="Fallimenti ${value}" ${canEditCharacter ? '' : 'disabled'}><span aria-hidden="true"></span></button>`;
  }).join('')}
              </div>
            </div>
          </div>
        </div>
      </section>
      ${buildCompactSpellSlots(character)}
      <section class="character-proficiency-section character-manual-section" aria-label="Competenze del personaggio">
        <header class="character-manual-section__header">
          <span class="character-manual-section__icon" aria-hidden="true">⌘</span>
          <div>
            <strong>Competenze</strong>
            <small>Equipaggiamento, maestrie, strumenti, lingue e difese</small>
          </div>
        </header>
        ${buildProficiencyOverview(character, items, canEditCharacter)}
      </section>
    </div>
  `;
}

export function buildSkillList(character, canEditCharacter = false) {
  const data = character.data || {};
  const abilities = data.abilities || {};
  const proficiencyBonus = normalizeNumber(data.proficiency_bonus);
  const skillStates = data.skills || {};
  const skillMasteryStates = data.skill_mastery || {};
  const generalBonus = Number(data.skill_check_bonus) || 0;

  return `
    <div class="detail-section">
      <div class="roll-general-modifier" aria-label="Modificatore generale tiri abilità">
        <span><small>Bonus generale</small><strong>${formatSigned(generalBonus)}</strong></span>
        ${canEditCharacter ? '<button type="button" data-edit-general-modifier="skills" aria-label="Modifica bonus generale tiri abilità" title="Modifica bonus generale">✎</button>' : ''}
      </div>
      <div class="detail-grid detail-grid--compact">
        ${skillList.map((skill) => {
    const proficient = Boolean(skillStates[skill.key]);
    const mastery = Boolean(skillMasteryStates[skill.key]);
    const baseTotal = calculateSkillModifier(abilities[skill.ability], proficiencyBonus, proficient ? (mastery ? 2 : 1) : 0);
    const total = baseTotal === null ? null : baseTotal + generalBonus;
    const statusClass = mastery ? 'modifier-card--mastery' : proficient ? 'modifier-card--proficiency' : '';
    const rank = mastery ? 'mastery' : proficient ? 'proficiency' : 'untrained';
    return `
          <button class="modifier-card modifier-card--interactive skill-card ${statusClass}" type="button" data-skill-card="${skill.key}" data-skill-rank="${rank}" data-skill-ability="${skill.ability}" aria-label="Tira abilità ${skill.label}">
            <span class="skill-card__ability skill-card__ability--${skill.ability}" aria-hidden="true">${abilityShortLabel[skill.ability]}</span>
            <span class="skill-card__content">
              <span class="skill-card__name">${skill.label}</span>
              <span class="skill-card__status">${mastery ? 'Maestria' : proficient ? 'Competenza' : 'Prova base'}</span>
            </span>
            <span class="modifier-value skill-card__modifier"><small>Bonus</small>${formatSigned(total)}</span>
          </button>
        `;
  }).join('')}
      </div>
    </div>
  `;
}

function getSpecialSkillRollsWithDefault(data) {
  const specialSkills = Array.isArray(data.special_skill_rolls) ? data.special_skill_rolls : [];
  const hasInitiative = specialSkills.some((skill) => {
    const id = String(skill?.id ?? '').toLowerCase();
    const name = String(skill?.name ?? '').trim().toLowerCase();
    return id === 'initiative' || id === 'default_initiative' || name === 'iniziativa';
  });
  const initiativeRoll = {
    id: 'default_initiative',
    name: 'Iniziativa',
    ability: 'dex',
    proficient: false,
    mastery: false,
    bonus: 0
  };
  return hasInitiative ? specialSkills : [initiativeRoll, ...specialSkills];
}

export function buildSpecialSkillList(character) {
  const data = character.data || {};
  const abilities = data.abilities || {};
  const proficiencyBonus = normalizeNumber(data.proficiency_bonus);
  const specialSkills = getSpecialSkillRollsWithDefault(data);
  const generalBonus = Number(data.skill_check_bonus) || 0;

  return `
    <div class="detail-section">
      <div class="detail-grid detail-grid--compact">
        ${specialSkills.map((skill, index) => {
    const abilityKey = abilityShortLabel[skill.ability] ? skill.ability : 'str';
    const proficient = Boolean(skill.proficient);
    const mastery = Boolean(skill.mastery) && proficient;
    const baseTotal = calculateSkillModifier(
      abilities[abilityKey],
      proficiencyBonus,
      proficient ? (mastery ? 2 : 1) : 0
    );
    const extraBonus = Number(skill.bonus) || 0;
    const total = (baseTotal ?? 0) + extraBonus + generalBonus;
    const statusClass = mastery ? 'modifier-card--mastery' : proficient ? 'modifier-card--proficiency' : '';
    const rank = mastery ? 'mastery' : proficient ? 'proficiency' : 'untrained';
    const skillLabel = skill.name?.trim() || `Tiro speciale ${index + 1}`;
    return `
          <button class="modifier-card modifier-card--interactive skill-card special-skill-card ${statusClass}" type="button" data-special-skill-card="${skill.id ?? index}" data-skill-rank="${rank}" data-skill-ability="${abilityKey}" aria-label="Tira abilità speciale ${skillLabel}">
            <span class="skill-card__ability skill-card__ability--${abilityKey}" aria-hidden="true">${abilityShortLabel[abilityKey]}</span>
            <span class="skill-card__content">
              <span class="skill-card__name">${skillLabel}</span>
              <span class="skill-card__status">${mastery ? 'Maestria' : proficient ? 'Competenza' : extraBonus ? `Bonus ${formatSigned(extraBonus)}` : 'Tiro speciale'}</span>
            </span>
            <span class="modifier-value skill-card__modifier"><small>Totale</small>${formatSigned(total)}</span>
          </button>
        `;
  }).join('')}
      </div>
    </div>
  `;
}

export function buildSavingThrowSection(character, canEditCharacter = false) {
  const data = character.data || {};
  const abilities = data.abilities || {};
  const proficiencyBonus = normalizeNumber(data.proficiency_bonus);
  const savingStates = data.saving_throws || {};
  const generalBonus = Number(data.saving_throw_bonus) || 0;

  return `
    <div class="detail-section">
      <div class="roll-general-modifier" aria-label="Modificatore generale tiri salvezza">
        <span><small>Bonus generale</small><strong>${formatSigned(generalBonus)}</strong></span>
        ${canEditCharacter ? '<button type="button" data-edit-general-modifier="savingThrows" aria-label="Modifica bonus generale tiri salvezza" title="Modifica bonus generale">✎</button>' : ''}
      </div>
      <div class="detail-grid detail-grid--compact">
        ${savingThrowList.map((save) => {
    const proficient = Boolean(savingStates[save.key]);
    const baseTotal = calculateSkillModifier(abilities[save.key], proficiencyBonus, proficient ? 1 : 0);
    const total = baseTotal === null ? null : baseTotal + generalBonus;
    const statusClass = proficient ? 'modifier-card--proficiency' : '';
    return `
          <button class="modifier-card modifier-card--interactive saving-throw-card ${statusClass}" type="button" data-saving-throw-card="${save.key}" aria-label="Tira salvezza ${save.label}">
            <span class="saving-throw-card__ability saving-throw-card__ability--${save.key}" aria-hidden="true">${abilityShortLabel[save.key]}</span>
            <span class="saving-throw-card__content">
              <span class="saving-throw-card__name">${save.label}</span>
              <span class="saving-throw-card__status">${proficient ? 'Competente' : 'Base'}</span>
            </span>
            <span class="modifier-value saving-throw-card__modifier"><small>TS</small>${formatSigned(total)}</span>
          </button>
        `;
  }).join('')}
      </div>
    </div>
  `;
}

function buildDefenseTags(damageDefenses, type) {
  const keys = Array.isArray(damageDefenses?.[type]) ? damageDefenses[type] : [];
  const labels = keys
    .map((key) => damageTypeList.find((damageType) => damageType.key === key)?.label || key)
    .filter(Boolean);
  return labels.length
    ? `<div class="tag-row proficiency-chip-list">${labels.map((label) => `<span class="chip proficiency-chip">${label}</span>`).join('')}</div>`
    : '<p class="muted">Nessuna voce configurata.</p>';
}

export function buildProficiencyOverview(character, items = [], canEditCharacter = false) {
  const data = character.data || {};
  const proficiencies = data.proficiencies || {};
  const notes = data.proficiency_notes || '';
  const { tools, languages: legacyLanguages } = parseProficiencyNotesSections(notes);
  const languageNotes = data.language_proficiencies || '';
  const explicitLanguages = parseProficiencyNotes(languageNotes);
  const talentNotes = data.talents || '';
  const talents = parseProficiencyNotes(talentNotes);
  const damageDefenses = data.damage_defenses || {};
  const combinedLanguages = [...explicitLanguages, ...legacyLanguages];
  const languages = combinedLanguages.reduce((acc, entry) => {
    const cleaned = entry.trim();
    if (!cleaned) return acc;
    const key = cleaned.toLowerCase();
    if (acc.seen.has(key)) return acc;
    acc.seen.add(key);
    acc.values.push(cleaned);
    return acc;
  }, { values: [], seen: new Set() }).values;
  const equipped = equipmentProficiencyList
    .filter((prof) => proficiencies[prof.key])
    .map((prof) => prof.label);
  const weaponMasteries = (Boolean(data.weapon_mastery_enabled) || (Array.isArray(data.weapon_masteries) && data.weapon_masteries.length > 0))
    ? (Array.isArray(data.weapon_masteries) ? data.weapon_masteries : [])
    : [];
  const weaponMasteryTab = weaponMasteries.length > 0 || Boolean(data.weapon_mastery_enabled);
  return `
    <div class="detail-section proficiency-overview">
      <div class="proficiency-tabs" data-proficiency-tabs>
        <div class="tab-bar proficiency-tab-bar" role="tablist" aria-label="Competenze extra">
          <button class="tab-bar__button is-active" type="button" role="tab" aria-selected="true" data-proficiency-tab="equipment">
            <span>Equipaggiamento</span><small>${equipped.length}</small>
          </button>
          ${weaponMasteryTab ? `<button class="tab-bar__button" type="button" role="tab" aria-selected="false" data-proficiency-tab="weapon-masteries">
            <span>Maestrie armi</span><small>${weaponMasteries.length}</small>
          </button>` : ''}
          <button class="tab-bar__button" type="button" role="tab" aria-selected="false" data-proficiency-tab="tools">
            <span>Strumenti</span><small>${tools.length}</small>
          </button>
          <button class="tab-bar__button" type="button" role="tab" aria-selected="false" data-proficiency-tab="languages">
            <span>Lingue</span><small>${languages.length}</small>
          </button>
          <button class="tab-bar__button" type="button" role="tab" aria-selected="false" data-proficiency-tab="talents">
            <span>Talenti</span><small>${talents.length}</small>
          </button>
          <button class="tab-bar__button" type="button" role="tab" aria-selected="false" data-proficiency-tab="defenses">
            <span>Difese</span><small>${(damageDefenses.resistances?.length || 0) + (damageDefenses.immunities?.length || 0)}</small>
          </button>
        </div>
        <div class="detail-card detail-card--text tab-panel proficiency-panel is-active" role="tabpanel" data-proficiency-panel="equipment">
          ${equipped.length
    ? `<div class="tag-row proficiency-chip-list">${equipped.map((label) => `<span class="chip proficiency-chip">${label}</span>`).join('')}</div>`
    : '<p class="muted">Nessuna competenza equipaggiamento.</p>'}
        </div>
        ${weaponMasteryTab ? `<div class="detail-card detail-card--text tab-panel proficiency-panel" role="tabpanel" data-proficiency-panel="weapon-masteries">
          ${weaponMasteries.length
    ? `<div class="weapon-mastery-list">${weaponMasteries.map((key) => `<div class="weapon-mastery-card__body"><strong>${getWeaponMasteryLabel(key)}</strong><small>${getWeaponMasterySummary(key)}</small></div>`).join('')}</div>`
    : '<p class="muted">Nessuna maestria arma selezionata.</p>'}
        </div>` : ''}
        <div class="detail-card detail-card--text tab-panel proficiency-panel" role="tabpanel" data-proficiency-panel="tools">
          ${tools.length
    ? `<div class="tag-row proficiency-chip-list">${tools.map((label) => `<span class="chip proficiency-chip">${label}</span>`).join('')}</div>`
    : '<p class="muted">Aggiungi strumenti nel profilo.</p>'}
        </div>
        <div class="detail-card detail-card--text tab-panel proficiency-panel" role="tabpanel" data-proficiency-panel="languages">
          ${languages.length
    ? `<div class="tag-row proficiency-chip-list">${languages.map((label) => `<span class="chip proficiency-chip">${label}</span>`).join('')}</div>`
    : '<p class="muted">Aggiungi lingue conosciute nel profilo.</p>'}
        </div>
        <div class="detail-card detail-card--text tab-panel proficiency-panel" role="tabpanel" data-proficiency-panel="talents">
          ${talents.length
    ? `<div class="tag-row proficiency-chip-list">${talents.map((label) => `<span class="chip proficiency-chip proficiency-chip--talent">${label}</span>`).join('')}</div>`
    : '<p class="muted">Aggiungi talenti nel profilo.</p>'}
        </div>
        <div class="detail-card detail-card--text tab-panel proficiency-panel" role="tabpanel" data-proficiency-panel="defenses">
          <div class="proficiency-defense-list">
            <div class="proficiency-defense-group">
              <strong>Resistenze</strong>
              ${buildDefenseTags(damageDefenses, 'resistances')}
            </div>
            <div class="proficiency-defense-group">
              <strong>Immunità</strong>
              ${buildDefenseTags(damageDefenses, 'immunities')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function buildEquipSection(character, items = [], canEditCharacter = false) {
  const equippedItems = (items || []).filter((item) => getEquipSlots(item).length);
  const attunedCount = equippedItems.filter((item) => item.attunement_active).length;
  const equippedWeight = calcSelectionWeight(equippedItems, items || []);
  const weightUnit = getWeightUnit(character);
  return `
    <section class="card home-card home-section home-scroll-panel equipment-management">
      <header class="card-header equipment-management__header">
        <div>
          <p class="eyebrow">Gestione Equipaggiamento</p>
          <dl class="equipment-summary" aria-label="Riepilogo equipaggiamento">
            <div class="equipment-summary__item equipment-summary__item--count"><dt>Equipaggiati</dt><dd>${equippedItems.length}</dd></div>
            <div class="equipment-summary__item equipment-summary__item--equipped-weight"><dt>Peso equipaggiato</dt><dd>${formatWeight(equippedWeight, weightUnit)}</dd></div>
            <div class="equipment-summary__item equipment-summary__item--attunement" data-filter-equipped-attunement role="button" tabindex="${attunedCount ? '0' : '-1'}" aria-pressed="false" ${attunedCount ? '' : 'aria-disabled="true"'}><dt>In sintonia</dt><dd>${attunedCount}</dd></div>
          </dl>
        </div>
        <div class="actions">
          <button class="icon-button equipment-mannequin-trigger" type="button" data-open-equipment-mannequin aria-label="${canEditCharacter ? 'Equipaggia oggetto' : 'Visualizza manichino 3D'}" title="${canEditCharacter ? 'Equipaggia oggetto' : 'Visualizza manichino 3D'}">
            ${canEditCharacter ? '+' : `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"></path>
              <circle cx="12" cy="12" r="2.6"></circle>
            </svg>`}
          </button>
        </div>
      </header>
      ${equippedItems.length
    ? `
          <ul class="inventory-list resource-list resource-list--compact">
            ${equippedItems.map((item) => {
    const statusLabels = getItemStatusLabels(item);
    const itemWeight = calcItemWeight(item, items || []);
    return `
              <li class="modifier-card attack-card resource-card inventory-item-card equipped-item-card"
                data-equipped-location="${escapeHtml(getBodyPartLabels(getEquipSlots(item)))}"
                data-equipped-weight="${escapeHtml(formatWeight(itemWeight, weightUnit))}"
                data-equipped-attunement="${item.attunement_active ? 'Attiva' : 'No'}"
                data-equipped-attuned="${String(Boolean(item.attunement_active))}">
                <div class="resource-card__badges equipped-item-card__badges">
                  ${item.is_magic ? `<span class="resource-chip resource-chip--floating resource-chip--magic">${statusLabels.magic}</span>` : ''}
                  ${item.attunement_active ? `<span class="resource-chip resource-chip--floating resource-chip--attunement">${statusLabels.attunement}</span>` : ''}
                </div>
                <div class="attack-card__body resource-card__body">
                  <div class="resource-card__title item-info equipped-item-card__info">
                    ${item.image_url ? `<img class="item-avatar equipped-item-card__image" src="${item.image_url}" alt="Foto di ${item.name}" data-item-image="${item.id}" />` : '<span class="equipped-item-card__placeholder" aria-hidden="true">◇</span>'}
                    <div class="item-info-body">
                      <div class="item-info-line">
                        <button class="item-name-button attack-card__name-button" type="button" data-item-preview="${item.id}" aria-label="Apri anteprima ${item.name}">${item.name}</button>
                        <span class="muted item-meta equipped-item-card__meta">
                          <span>${getCategoryLabel(item.category)}</span><span>${getBodyPartLabels(getEquipSlots(item))}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                ${canEditCharacter ? `
                  <div class="resource-card-actions">
                    <button class="resource-action-button equipped-item-card__remove" type="button" data-unequip="${item.id}">Rimuovi</button>
                  </div>
                ` : ''}
              </li>
            `;
  }).join('')}
          </ul>
        `
    : '<div class="equipment-empty-state"><span aria-hidden="true">◇</span><div><strong>Nessun oggetto equipaggiato</strong><small>Gli oggetti assegnati agli slot compariranno qui.</small></div></div>'}
    </section>
  `;
}

export function buildAttackSection(character, items = [], companions = [], canEditCharacter = false) {
  const data = character.data || {};
  const attackBonusMelee = Number(data.attack_bonus_melee ?? data.attack_bonus) || 0;
  const attackBonusRanged = Number(data.attack_bonus_ranged ?? data.attack_bonus) || 0;
  const damageBonusMelee = Number(data.damage_bonus_melee ?? data.damage_bonus) || 0;
  const damageBonusRanged = Number(data.damage_bonus_ranged ?? data.damage_bonus) || 0;
  const extraAttacks = Number(data.extra_attacks) || 0;
  const equippedWeapons = items.filter((item) => item.category === 'weapon' && item.equipable && getEquipSlots(item).length);
  const unarmedAttacks = Array.isArray(data.unarmed_attacks) ? data.unarmed_attacks : [];
  const activeWildShape = getActiveWildShape(character, companions);
  const hasConfiguredAttacks = Boolean(equippedWeapons.length || unarmedAttacks.length || activeWildShape?.statBlock.attacks.length);
  const attacksPerAction = 1 + Math.max(0, extraAttacks);
  return `
    <section class="attack-turn-summary" aria-label="Riepilogo combattimento">
      ${canEditCharacter ? '<button class="attack-turn-summary__edit" type="button" data-edit-general-modifier="damage" aria-label="Modifica bonus generali ai danni" title="Modifica bonus danni">✎</button>' : ''}
      <div class="attack-turn-summary__primary">
        <span class="attack-turn-summary__icon" aria-hidden="true">⚔</span>
        <span><small>Attacchi per azione</small><strong>${attacksPerAction}</strong></span>
        ${extraAttacks > 0 ? `<em>Attacco Extra ×${extraAttacks}</em>` : ''}
      </div>
      <div class="attack-turn-summary__bonuses">
        <span><small>Mischia</small><strong>${formatSigned(attackBonusMelee)} <i>/</i> ${formatSigned(damageBonusMelee)}</strong><em>colpire / danni</em></span>
        <span><small>Distanza</small><strong>${formatSigned(attackBonusRanged)} <i>/</i> ${formatSigned(damageBonusRanged)}</strong><em>colpire / danni</em></span>
      </div>
      ${activeWildShape ? `<div class="attack-turn-summary__form"><small>Forma selvatica</small><strong>${escapeHtml(activeWildShape.companion.name)}</strong><span>FOR, DES e COS sostituite</span></div>` : ''}
    </section>
    <div class="detail-section">
      <div class="detail-grid detail-grid--compact">
        ${hasConfiguredAttacks ? '' : '<p class="muted">Nessun attacco configurato.</p>'}
        ${activeWildShape?.statBlock.attacks.length ? activeWildShape.statBlock.attacks.map((attack, index) => {
      const attackName = attack.name || `Attacco ${index + 1}`;
      const damageModifier = Number(attack.damage_modifier) || 0;
      const damageText = `${attack.damage || '-'}${damageModifier ? ` ${formatSigned(damageModifier)}` : ''}`;
      return `
          <div class="modifier-card attack-card attack-card--wild-shape attack-card--creature" data-attack-range="melee" data-roll-attack="wildshape:${index}" data-attack-origin="Forma" data-attack-magic="false" data-attack-damage-type="${escapeHtml(attack.damage_type ? (damageTypeList.find((type) => type.key === attack.damage_type)?.label || attack.damage_type) : '')}">
            <div class="attack-card__body">
              <span class="spell-card__sigil attack-card__sigil" aria-label="Tiro per colpire ${formatSigned(attack.to_hit || 0)}, caratteristica Forma">
                <small>Forma</small>
                <strong>${formatSigned(attack.to_hit || 0)}</strong>
              </span>
              <div class="attack-card__title">
                <strong class="attack-card__name">${escapeHtml(attackName)}</strong>
              </div>
              <div class="attack-card__meta">
                <span class="attack-card__damage"><small>Danni</small>${escapeHtml(damageText)}</span>
                <span class="muted">${escapeHtml(activeWildShape.companion.name)}</span>
              </div>
            </div>
            <div class="attack-card__actions">
              <button class="attack-action-button attack-action-button--damage" data-roll-damage="wildshape:${index}" aria-label="Calcola danni ${escapeHtml(attackName)}" title="Tira i danni">
                ${DAMAGE_ACTION_ICON}
              </button>
            </div>
          </div>
        `;
    }).join('') : ''}
        ${unarmedAttacks.map((attack, index) => {
    const attackName = attack.name || `Colpo senz’arma ${index + 1}`;
    const attackStats = calculateUnarmedAttackBonuses(data, attack);
    const abilityKey = attackStats.ability || getUnarmedAttackAbility(attack);
    const abilityLabel = abilityShortLabel[abilityKey] || 'Fisico';
    const damageText = `${attack.damage || '-'}${attackStats.damageModifier ? ` ${formatSigned(attackStats.damageModifier)}` : ''}`;
    return `
          <div class="modifier-card attack-card attack-card--unarmed" data-attack-range="melee" data-roll-attack="unarmed:${index}" data-custom-attack-index="${index}" data-attack-origin="Senz’arma" data-attack-magic="false" data-attack-damage-type="${escapeHtml(attack.damage_type ? (damageTypeList.find((type) => type.key === attack.damage_type)?.label || attack.damage_type) : 'Contundente')}">
            <div class="attack-card__body">
              <span class="spell-card__sigil attack-card__sigil" aria-label="Tiro per colpire ${formatSigned(attackStats.attackTotal)}, caratteristica ${escapeHtml(abilityLabel)}">
                <small>${escapeHtml(abilityLabel)}</small>
                <strong>${formatSigned(attackStats.attackTotal)}</strong>
              </span>
              <div class="attack-card__title">
                <strong class="attack-card__name">${escapeHtml(attackName)}</strong>
              </div>
              <div class="attack-card__meta">
                <span class="attack-card__damage"><small>Danni</small>${escapeHtml(damageText)}</span>
                <span class="muted">Colpo senz’arma · ${escapeHtml(abilityLabel)}</span>
              </div>
            </div>
            <div class="attack-card__actions">
              <button class="attack-action-button attack-action-button--damage" data-roll-damage="unarmed:${index}" aria-label="Calcola danni ${escapeHtml(attackName)}" title="Tira i danni">
                ${DAMAGE_ACTION_ICON}
              </button>
            </div>
          </div>
        `;
  }).join('')}
        ${equippedWeapons.map((weapon) => {
    const baseWeaponRange = weapon.weapon_range || (weapon.range_normal ? 'ranged' : 'melee');
    const isHybrid = baseWeaponRange === 'melee' && Boolean(weapon.is_thrown);
    const weaponRange = isHybrid ? 'hybrid' : baseWeaponRange;
    const attackAbility = weapon.attack_ability
      || (baseWeaponRange === 'ranged' ? 'dex' : 'str');
    const abilityMod = getAbilityModifier(data.abilities?.[attackAbility]) ?? 0;
    const proficiencies = data.proficiencies || {};
    const proficient = weapon.weapon_type === 'simple'
      ? Boolean(proficiencies.weapon_simple)
      : weapon.weapon_type === 'martial'
        ? Boolean(proficiencies.weapon_martial)
        : false;
    const proficiencyBonus = proficient ? (normalizeNumber(data.proficiency_bonus) ?? 0) : 0;
    const damageModes = getWeaponDamageModes(weapon).filter((mode) => mode.damageDie);
    const normalRange = Number(weapon.range_normal) || null;
    const disadvantageRange = Number(weapon.range_disadvantage) || null;
    const meleeRange = Number(weapon.melee_range) || 1.5;
    const rangeParts = [];
    if (baseWeaponRange === 'melee' && meleeRange > 1.5) {
      rangeParts.push(`Portata ${meleeRange} m`);
    }
    if (isHybrid && normalRange) {
      rangeParts.push(`${normalRange}${disadvantageRange ? `/${disadvantageRange}` : ''} m`);
    }
    if (baseWeaponRange === 'ranged' && normalRange) {
      rangeParts.push(`${normalRange}${disadvantageRange ? `/${disadvantageRange}` : ''} m`);
    }
    const requiredAmmoType = weapon.required_ammunition_type || weapon.ammunition_type;
    const ammoRemaining = weapon.consumes_ammunition
      ? items
        .filter((item) => item.category !== 'container')
        .filter((item) => requiredAmmoType ? item.ammunition_type === requiredAmmoType : item.ammunition_type)
        .reduce((total, item) => total + (Number(item.qty) || 0), 0)
      : null;
    const ammoLabel = ammunitionTypeLabels.get(requiredAmmoType) || 'Munizioni';
    const ammoText = ammoRemaining !== null ? `${ammoLabel} ${ammoRemaining}` : '';
    const rangeText = rangeParts.join(' · ');
    const abilityLabel = attackAbility === 'dex' ? 'DES' : attackAbility === 'str' ? 'FOR' : attackAbility.toUpperCase();
    const weaponKey = weapon.id ?? weapon.name;
    const renderedModes = damageModes.length ? damageModes : [{ id: 'default', label: '', damageDie: null, damageModifier: Number(weapon.damage_modifier) || 0 }];
    const selectedMode = renderedModes.find((mode) => mode.id === weapon.selected_damage_mode) || renderedModes[0];
    const baseAttackTotal = abilityMod + proficiencyBonus + (Number(selectedMode.attackModifier) || 0);
    const meleeAttackTotal = baseAttackTotal + attackBonusMelee;
    const rangedAttackTotal = baseAttackTotal + attackBonusRanged;
    const attackTotal = baseAttackTotal + (baseWeaponRange === 'ranged' ? attackBonusRanged : attackBonusMelee);
    const baseDamageTotal = abilityMod + (Number(selectedMode.damageModifier) || 0);
    const meleeDamageTotal = baseDamageTotal + damageBonusMelee;
    const rangedDamageTotal = baseDamageTotal + damageBonusRanged;
    const modeDamageTotal = baseDamageTotal + (baseWeaponRange === 'ranged' ? damageBonusRanged : damageBonusMelee);
    const damageText = selectedMode.damageDie
      ? `${selectedMode.damageDie}${modeDamageTotal ? ` ${formatSigned(modeDamageTotal)}` : ''}`
      : '-';
    const meleeDamageText = selectedMode.damageDie ? `${selectedMode.damageDie}${meleeDamageTotal ? ` ${formatSigned(meleeDamageTotal)}` : ''}` : '-';
    const rangedDamageText = selectedMode.damageDie ? `${selectedMode.damageDie}${rangedDamageTotal ? ` ${formatSigned(rangedDamageTotal)}` : ''}` : '-';
    const modeLabel = selectedMode.id !== 'default' ? selectedMode.label : '';
    const masteryLabel = weapon.weapon_mastery ? getWeaponMasteryLabel(weapon.weapon_mastery) : '';
    const masteryKnown = weapon.weapon_mastery && Array.isArray(data.weapon_masteries) && data.weapon_masteries.includes(weapon.weapon_mastery);
    const masteryText = masteryLabel ? `Maestria: ${masteryLabel}${masteryKnown ? '' : ' (non selezionata)'}` : '';
    const damageType = selectedMode.damageType || weapon.damage_type || '';
    const damageTypeLabel = damageType ? (damageTypeList.find((type) => type.key === damageType)?.label || damageType) : '';
    const rollDamageKey = `weapon:${weaponKey}:${selectedMode.id}`;
    return `
          <div class="modifier-card attack-card attack-card--weapon" data-attack-range="${weaponRange}" data-attack-range-label="${escapeHtml(rangeText)}" data-attack-ammo-label="${escapeHtml(ammoLabel)}" data-attack-ammo-value="${ammoRemaining ?? ''}" data-attack-grip-label="${escapeHtml(selectedMode.label || '')}" data-roll-attack="weapon:${weapon.id ?? weapon.name}" data-attack-item-id="${escapeHtml(weapon.id ?? '')}" data-attack-origin="Arma" data-attack-magic="${Boolean(weapon.is_magic)}" data-attack-damage-type="${escapeHtml(damageTypeLabel)}" data-attack-melee-bonus="${formatSigned(meleeAttackTotal)}" data-attack-ranged-bonus="${formatSigned(rangedAttackTotal)}" data-attack-melee-damage="${escapeHtml(meleeDamageText)}" data-attack-ranged-damage="${escapeHtml(rangedDamageText)}">
            ${sanitizeImageUrl(weapon.image_url) ? `<img class="attack-item-thumbnail" data-attack-item-image src="${sanitizeImageUrl(weapon.image_url)}" alt="" loading="lazy" />` : ''}
            <div class="attack-card__body">
              <span class="spell-card__sigil attack-card__sigil" aria-label="Tiro per colpire ${formatSigned(attackTotal)}, caratteristica ${abilityLabel}">
                <small>${abilityLabel}</small>
                <strong>${formatSigned(attackTotal)}</strong>
              </span>
              <div class="attack-card__title">
                <strong class="attack-card__name">${weapon.name}</strong>
              </div>
              <div class="attack-card__meta">
                <span class="attack-card__damage"><small>Danni</small>${damageText}</span>
                ${masteryText ? `<span class="muted" title="${getWeaponMasterySummary(weapon.weapon_mastery)}">${masteryText}</span>` : ''}
                ${rangeText ? `<span class="muted">${rangeText}</span>` : ''}
              </div>
            </div>
            <div class="attack-card__actions">
              <button class="attack-action-button attack-action-button--damage" data-roll-damage="${rollDamageKey}" aria-label="Calcola danni ${weapon.name}${modeLabel ? ` ${modeLabel}` : ''}" title="Tira i danni">
                ${DAMAGE_ACTION_ICON}
              </button>
            </div>
          </div>
        `;
  }).join('')}
      </div>
    </div>
  `;
}

function getSpellcastingStats(data) {
  const spellcasting = data.spellcasting || {};
  const proficiencyBonus = normalizeNumber(data.proficiency_bonus);
  const abilityKey = spellcasting.ability;
  const abilityScore = abilityKey ? data.abilities?.[abilityKey] : null;
  const abilityMod = getAbilityModifier(abilityScore);
  const spellSaveDc = abilityMod === null || proficiencyBonus === null
    ? null
    : 8 + abilityMod + proficiencyBonus;
  const spellAttackBonus = abilityMod === null || proficiencyBonus === null
    ? null
    : abilityMod + proficiencyBonus;
  const spellAbilityLabel = abilityKey ? abilityShortLabel[abilityKey] : null;
  return {
    ability: spellAbilityLabel ?? '-',
    saveDc: spellSaveDc === null ? '-' : spellSaveDc,
    attackBonus: spellAttackBonus === null ? '-' : formatSigned(spellAttackBonus)
  };
}

function buildSpellStatsRow(data, { includeAttack = true } = {}) {
  const stats = getSpellcastingStats(data);
  const summaryChips = [
    { label: 'Caratteristica incantatore', value: stats.ability, tone: 'ability' },
    { label: 'CD salvezza', value: stats.saveDc, tone: 'save' },
    ...(includeAttack ? [{ label: 'Tiro incantesimo', value: stats.attackBonus, tone: 'attack' }] : [])
  ];
  return `<div class="spell-stats" aria-label="Statistiche da incantatore">${summaryChips.map((chip) => `
    <span class="spell-stat spell-stat--${chip.tone}">
      <small>${chip.label}</small>
      <strong>${chip.value}</strong>
    </span>
  `).join('')}</div>`;
}

function renderSpellQuickItem(spell, spellAttackBonus = '—') {
  const level = Number(spell.level) || 0;
  const castTimeLabel = normalizeCastTimeLabel(spell.cast_time);
  const castTimeClass = getResourceCastTimeClass(castTimeLabel);
  const damageOverlay = buildSpellDamageOverlayConfig(spell, level);
  const damageNotation = damageOverlay
    ? `${damageOverlay.notation}${damageOverlay.modifier ? ` ${formatSigned(damageOverlay.modifier)}` : ''}`
    : '';
  const damageTypeLabel = spell.damage_type
    ? (damageTypeList.find((type) => type.key === spell.damage_type)?.label || spell.damage_type)
    : '';
  return `
    <div class="modifier-card attack-card resource-card spell-prepared-list__card"
      data-spell-level="${level}"
      data-spell-ritual="${Boolean(spell.is_ritual)}"
      data-spell-concentration="${Boolean(spell.concentration)}"
      data-spell-attack-roll="${Boolean(spell.attack_roll)}"
      data-spell-saving-throw="${escapeHtml(spell.saving_throw_ability || '')}"
      data-spell-damage-type="${escapeHtml(damageTypeLabel)}">
      <div class="resource-card__badges spell-card__badges">
        ${spell.concentration ? '<span class="resource-chip resource-chip--floating resource-chip--concentration">C</span>' : ''}
        ${spell.is_ritual ? '<span class="resource-chip resource-chip--floating resource-chip--ritual">R</span>' : ''}
        ${castTimeLabel ? `<span class="resource-chip resource-chip--floating ${castTimeClass}">${castTimeLabel}</span>` : ''}
      </div>
      <button class="spell-prepared-list__item" type="button" data-spell-quick-open="${spell.id}">
        ${level > 0
    ? `<span class="spell-card__sigil" aria-label="Incantesimo di ${level}° livello">${level}°</span>`
    : '<span class="spell-card__sigil" aria-hidden="true">✦</span>'}
        <span class="spell-card__identity">
          <span class="spell-prepared-list__name">${spell.name}</span>
          <span class="spell-card__meta">${normalizeSpellSchool(spell.school) || (level > 0 ? 'Incantesimo' : 'Trucchetto')}</span>
        </span>
      </button>
      ${(spell.cast_time || spell.range || spell.duration || spell.components) ? '<div class="catalog-spell-facts">' +
    [['Tempo', spell.cast_time], ['Gittata', spell.range], ['Componenti', spell.components], ['Durata', spell.duration]]
      .filter(([, value]) => value).map(([label, value]) => '<span><small>' + label + '</small>' + escapeHtml(value) + '</span>').join('') +
    '</div>' : ''}
      <div class="resource-card-actions spell-card-actions">
        ${damageOverlay ? `
          <button class="attack-action-button attack-action-button--damage attack-action-button--spell spell-card-actions__damage" type="button" data-roll-damage="spell:${spell.id}" data-damage-notation="${escapeHtml(damageNotation)}" aria-label="Lancia danni ${spell.name}" title="Lancia danni">
            ${DAMAGE_ACTION_ICON}
          </button>
        ` : ''}
        ${spell.attack_roll ? `<button class="resource-cta-button resource-cta-button--label" type="button" data-roll-attack="spell:${spell.id}" data-attack-range="${getCantripAttackRange(spell)}" data-attack-modifier="${escapeHtml(spellAttackBonus)}">Colpire</button>` : ''}
        ${level > 0 ? `<button class="resource-cta-button resource-cta-button--label" type="button" data-use-spell="${spell.id}">Usa</button>` : ''}
      </div>
    </div>
  `;
}

export function buildSpellSection(character, canManageSpells = false) {
  const data = character.data || {};
  const notes = data.spell_notes || '';
  const spells = Array.isArray(data.spells) ? sortSpellsByLevel(data.spells) : [];
  const spellcasting = data.spellcasting || {};
  const slots = spellcasting.slots || {};
  const slotsMax = spellcasting.slots_max || {};
  const recharge = spellcasting.recharge || 'long_rest';
  const slotLevels = Array.from({ length: 9 }, (_, index) => index + 1);
  const slotEntries = slotLevels.map((level) => {
    const remaining = Math.max(0, Number(slots[level]) || 0);
    const max = Math.max(remaining, Number(slotsMax[level]) || 0);
    return { level, count: remaining, max };
  }).filter((entry) => entry.max > 0);
  const spellAttackBonus = getSpellcastingStats(data).attackBonus;
  const cantrips = spells.filter((spell) => (Number(spell.level) || 0) === 0);
  const preparedSpells = spells
    .filter((spell) => {
      const level = Number(spell.level) || 0;
      if (level < 1) return false;
      const prepState = spell.prep_state || 'known';
      return !data.spellcasting?.can_prepare || prepState === 'prepared' || prepState === 'always';
    });
  const launchSpells = [...cantrips, ...preparedSpells];
  return `
    ${buildSpellStatsRow(data, { includeAttack: false })}
    <div class="detail-section">
      <div class="detail-card detail-card--text spell-summary-card">
        <div class="spell-slots">
          <span class="spell-slots__title">Slot rimanenti</span>
          <div class="spell-slots__list">
            <div class="spell-slot-row spell-slot-row--cantrips" data-spell-slot-filter="0" role="button" tabindex="0" aria-pressed="false" aria-label="Mostra trucchetti">
              <span class="spell-slot-label">Trucchetti</span>
              <span class="spell-slot-cantrip-mark" aria-hidden="true">✧</span>
            </div>
            ${slotEntries.map((entry) => {
    const baseIndicatorClass = recharge === 'short_rest' ? 'charge-indicator' : 'charge-indicator charge-indicator--long';
    const charges = Array.from({ length: entry.max }, (_, index) => {
      const isUsed = index >= entry.count;
      const usedClass = isUsed ? 'charge-indicator--used' : '';
      const classes = [baseIndicatorClass, usedClass].filter(Boolean).join(' ');
      if (canManageSpells && isUsed) {
        return `<button type="button" class="${classes}" data-restore-spell-slot="${entry.level}" aria-label="Ripristina uno slot di livello ${entry.level}"></button>`;
      }
      if (canManageSpells && !isUsed) {
        return `<button type="button" class="${classes}" data-consume-spell-slot="${entry.level}" aria-label="Consuma uno slot di livello ${entry.level}"></button>`;
      }
      return `<span class="${classes}"></span>`;
    }).join('');
    return `
              <div class="spell-slot-row" data-spell-slot-filter="${entry.level}" role="button" tabindex="0" aria-pressed="false" aria-label="Mostra incantesimi di ${entry.level}° livello">
                <span class="spell-slot-label">Slot ${entry.level}°</span>
                <div class="spell-slot-charges" aria-hidden="true">${charges || '<span class="spell-slot-empty">-</span>'}</div>
              </div>
            `;
  }).join('')}
          </div>
        </div>
        ${notes ? `<p class="spell-notes">${notes}</p>` : ''}
      </div>
      <div class="spell-prepared-list spell-prepared-list--accordion">
        <details class="spell-list-accordion" open>
          <summary class="spell-list-accordion__summary">
            <span class="inventory-container-accordion__icon" aria-hidden="true">▾</span>
            <span class="spell-list-accordion__title">Trucchetti e incantesimi</span>
            <span class="spell-list-accordion__count">${launchSpells.length}</span>
          </summary>
          <div class="spell-list-accordion__body">
            ${launchSpells.length
      ? `<div class="spell-prepared-list__items">${launchSpells.map((spell) => renderSpellQuickItem(spell, spellAttackBonus)).join('')}</div>`
      : '<p class="muted spell-list-accordion__empty">Nessuna magia pronta da lanciare.</p>'}
          </div>
        </details>
      </div>
    </div>
  `;
}


function normalizeCastTimeLabel(castTime) {
  const rawValue = castTime?.toString().trim();
  if (!rawValue) return '';
  const normalized = rawValue.toLowerCase();
  if (normalized.includes('bonus')) return 'Azione Bonus';
  if (normalized.includes('reaz')) return 'Reazione';
  if (normalized.includes('gratuit')) return 'Azione Gratuita';
  if (normalized.includes('durata') || normalized.includes('più') || normalized.includes('piu') || normalized.includes('superiore')) return 'Durata';
  if (normalized.includes('azion')) return 'Azione';
  const exactMatch = RESOURCE_CAST_TIME_ORDER.find((entry) => entry.label.toLowerCase() === normalized);
  return exactMatch?.label ?? '';
}

function getCantripAttackRange(spell) {
  if (spell?.attack_range_type === 'melee' || spell?.attack_range_type === 'ranged') {
    return spell.attack_range_type;
  }
  return String(spell?.range || '').trim() ? 'ranged' : 'melee';
}

function getResourceCastTimeRank(castTime) {
  if (!castTime) return RESOURCE_CAST_TIME_ORDER.length;
  const normalizedCastTime = normalizeCastTimeLabel(castTime);
  const matchIndex = RESOURCE_CAST_TIME_ORDER.findIndex((entry) => entry.label === normalizedCastTime);
  return matchIndex === -1 ? RESOURCE_CAST_TIME_ORDER.length : matchIndex;
}

function getResourceCastTimeClass(castTime) {
  if (!castTime) return '';
  const normalizedCastTime = normalizeCastTimeLabel(castTime);
  return RESOURCE_CAST_TIME_ORDER.find((entry) => entry.label === normalizedCastTime)?.className ?? '';
}

function sortResourcesByCastTime(resources) {
  return [...resources].sort((a, b) => {
    const rankDiff = getResourceCastTimeRank(a.cast_time) - getResourceCastTimeRank(b.cast_time);
    if (rankDiff !== 0) return rankDiff;
    return (a.name ?? '').localeCompare(b.name ?? '', 'it', { sensitivity: 'base' });
  });
}

function getResourceDiceLabel(resource) {
  const notation = String(resource?.damage_dice_notation || '').trim();
  if (!notation) return '';
  const modifier = Number(resource?.damage_modifier) || 0;
  return `${notation}${modifier ? ` ${modifier > 0 ? '+' : ''}${modifier}` : ''}`;
}

function getResourceDamageTypeLabel(resource) {
  const damageType = String(resource?.damage_type || '').trim();
  if (!damageType) return '';
  return damageTypeList.find((type) => type.key === damageType)?.label || damageType;
}

export function buildResourceList(
  resources,
  canManageResources,
  {
    showCharges = true,
    showUseButton = true,
    showDescription = false,
    showCastTime = true
  } = {}
) {
  return `
    <ul class="resource-list resource-list--compact">
      ${resources.map((res) => `
        <li class="modifier-card attack-card resource-card resource-card--${res.resource_type || 'uses'}" data-resource-card="${res.id}" data-resource-saving-throw="${escapeHtml(res.saving_throw_ability || '')}" data-resource-damage-type="${escapeHtml(getResourceDamageTypeLabel(res))}">
          ${showCastTime && normalizeCastTimeLabel(res.cast_time) ? `<span class="resource-chip resource-chip--floating ${getResourceCastTimeClass(res.cast_time)}">${normalizeCastTimeLabel(res.cast_time)}</span>` : ''}
          ${res.reset_on && res.reset_on !== 'none' ? `<span data-resource-recovery="${res.reset_on}">${res.reset_on === 'short_rest' ? 'Riposo breve' : res.reset_on === 'long_rest' ? 'Riposo lungo' : res.reset_on === 'daily' ? 'Giornaliera' : res.reset_on}</span>` : ''}
          <span class="resource-card__marker" aria-hidden="true">${res.resource_type === 'passive' ? '◇' : res.resource_type === 'pool' ? '◉' : '◆'}</span>
          <div class="attack-card__body resource-card__body">
            <div class="attack-card__title resource-card__title">
              <strong class="attack-card__name">${res.name}</strong>
              ${Number(res.child_resource_count) ? `<span class="resource-child-count">${res.child_resource_count} opzioni</span>` : ''}
            </div>
            ${res.resource_type === 'pool' ? '<span class="resource-card__kind">Riserva</span>' : ''}
            ${showDescription
    ? `<p class="resource-card__description">${res.description ?? ''}</p>`
    : ''}
            ${showCharges && Number(res.max_uses)
    ? `
              <div class="resource-card__charges">
                ${res.resource_type === 'pool' ? buildResourcePool(res) : buildResourceCharges(res)}
              </div>
            `
    : ''}
          </div>
          <div class="resource-card-actions">
            ${getResourceDiceLabel(res) ? `
              <button
                class="resource-cta-button resource-cta-button--dice"
                type="button"
                data-roll-resource="${res.id}"
                data-dice-notation="${escapeHtml(getResourceDiceLabel(res))}"
                aria-label="Tira ${escapeHtml(getResourceDiceLabel(res))} per ${escapeHtml(res.name)}"
              >${escapeHtml(getResourceDiceLabel(res))}</button>
            ` : ''}
            ${showUseButton ? `
              <button
                class="resource-cta-button resource-cta-button--label"
                data-use-resource="${res.id}"
                ${!Number(res.max_uses) || res.used >= Number(res.max_uses) ? 'disabled' : ''}
              >
                ${res.resource_type === 'pool' ? 'Consuma' : 'Usa'}
              </button>
            ` : ''}
          </div>
        </li>
      `).join('')}
    </ul>
  `;
}

export function buildResourceSections(resources, canManageResources) {
  const rootResources = resources.filter((resource) => !resource.parent_resource_id);
  if (!rootResources.length) {
    return '<p>Nessuna risorsa.</p>';
  }
  const sortedResources = sortResourcesByCastTime(rootResources);
  const passiveResources = sortedResources.filter((resource) => resource.resource_type === 'passive' || resource.reset_on === null || resource.reset_on === 'none');
  const activeResources = sortedResources.filter((resource) => resource.resource_type !== 'passive' && resource.reset_on !== null && resource.reset_on !== 'none');
  const activeSection = `
    <details class="resource-accordion resource-section resource-section--active" open>
      <summary class="resource-accordion__summary">
        <span>Consumabili</span>
        <span class="resource-accordion__meta">${activeResources.length} risorse</span>
        <span class="resource-accordion__icon" aria-hidden="true">▾</span>
      </summary>
      <div class="resource-section__body resource-accordion__body">
        ${activeResources.length
    ? buildResourceList(activeResources, canManageResources, { showUseButton: true })
    : '<p class="muted">Nessuna abilità consumabile.</p>'}
      </div>
    </details>
  `;
  const passiveSection = `
    <details class="resource-accordion resource-section" ${activeResources.length ? '' : 'open'}>
      <summary class="resource-accordion__summary">
        <span>Sempre attiva</span>
        <span class="resource-accordion__meta">${passiveResources.length} risorse</span>
        <span class="resource-accordion__icon" aria-hidden="true">▾</span>
      </summary>
      <div class="resource-section__body resource-accordion__body">
        ${passiveResources.length
    ? buildResourceList(passiveResources, canManageResources, {
      showCharges: false,
      showUseButton: false,
      showDescription: true,
      showCastTime: true
    })
    : '<p class="muted">Nessuna abilità sempre attiva.</p>'}
      </div>
    </details>
  `;
  return `<div class="resource-accordion-stack">${activeSection}${passiveSection}</div>`;
}

export function buildResourcePool(resource) {
  const maxUses = Math.max(0, Number(resource.max_uses) || 0);
  const used = Math.max(0, Math.min(Number(resource.used) || 0, maxUses));
  if (!maxUses) return '';
  const remaining = Math.max(maxUses - used, 0);
  const percent = Math.min(Math.max((remaining / maxUses) * 100, 0), 100);
  return `
    <div class="resource-pool" aria-label="Pool risorsa ${remaining} su ${maxUses}">
      <div class="resource-pool__label"><span>Pool</span><strong><span class="resource-pool__value">${remaining}/${maxUses}</span><small>${Math.round(percent)}%</small></strong></div>
      <div class="resource-pool__track" role="meter" aria-valuemin="0" aria-valuemax="${maxUses}" aria-valuenow="${remaining}">
        <div class="resource-pool__fill" style="width: ${percent}%;"></div>
      </div>
    </div>
  `;
}

export function buildResourceCharges(resource) {
  const maxUses = Number(resource.max_uses) || 0;
  const used = Number(resource.used) || 0;
  if (!maxUses) return '';
  const style = resource.reset_on === 'long_rest' ? 'long' : 'short';
  const remaining = Math.max(maxUses - used, 0);
  const charges = Array.from({ length: maxUses }, (_, index) => {
    const isUsed = index < used;
    const classes = [
      'charge-indicator',
      style === 'long' ? 'charge-indicator--long' : 'charge-indicator--short',
      isUsed ? 'charge-indicator--used' : ''
    ].filter(Boolean).join(' ');
    return `<span class="${classes}" aria-hidden="true"></span>`;
  }).join('');
  return `
    <div class="resource-charge-row" aria-label="Utilizzi risorsa">
      <span class="resource-charge-label">Utilizzi</span>
      <span class="resource-charge-count">${remaining}/${maxUses}</span>
      <div class="resource-charges" aria-hidden="true">${charges}</div>
    </div>
  `;
}
