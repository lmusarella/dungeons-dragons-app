import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

function extractNamedExports(source) {
  const names = new Set();
  const functionRegex = /export\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g;
  const constRegex = /export\s+const\s+([A-Za-z_$][\w$]*)\s*=/g;
  let match;
  while ((match = functionRegex.exec(source)) !== null) names.add(match[1]);
  while ((match = constRegex.exec(source)) !== null) names.add(match[1]);
  return [...names];
}

describe('src/features/character/home/modals.js', () => {
  it('defines module-level API surface', () => {
    const source = readFileSync('src/features/character/home/modals.js', 'utf8');
    const exports = extractNamedExports(source);
    expect(source.trim().length).toBeGreaterThan(40);
    expect(exports.length).toBeGreaterThan(0);
    exports.forEach((name) => {
      expect(source).toContain(`export`);
      expect(source).toContain(name);
    });
  });

  it('keeps recharge type and rest recovery fields in one row', () => {
    const source = readFileSync('src/features/character/home/modals.js', 'utf8');

    expect(source).toContain("buildRow([resetField, inputRiposoCorto, inputRiposoLungo], 'compact')");
    expect(source).toContain("recoveryRow.classList.add('ability-modal-row--recovery')");
  });

  it('supports character and companion images in the avatar preview', () => {
    const source = readFileSync('src/features/character/home/modals.js', 'utf8');
    expect(source).toContain('subject?.data?.avatar_url || subject?.stat_block?.image_url');
    expect(source).toContain('alt="Foto di ${subjectName}"');
  });
  it('uploads and optimizes a custom character image instead of asking for a URL', () => {
    const source = readFileSync('src/features/character/home/modals.js', 'utf8');
    const drawer = readFileSync('src/features/character/home/characterDrawer.js', 'utf8');
    expect(source).toContain('async function prepareAvatarImage(file)');
    expect(source).toContain("canvas.toDataURL('image/webp', 0.82)");
    expect(source).toContain('name="avatar_image"');
    expect(source).toContain('avatar_url: selectedAvatar');
    expect(drawer).not.toContain("label: 'Foto (URL)'");
    expect(drawer).toContain('avatar_url: characterData.avatar_url ?? null');
  });
  it('uses a compact pool consumption modal without repeating the resource detail', () => {
    const source = readFileSync('src/features/character/home/modals.js', 'utf8');
    const compactModal = source.slice(
      source.indexOf('export async function openResourcePoolConsumeModal'),
      source.indexOf('export function openResourceDetail')
    );
    const detailModal = source.slice(
      source.indexOf('export function openResourceDetail'),
      source.indexOf('export function openSpellDrawer')
    );
    expect(compactModal).toContain('modal-form-grid hp-shortcut-fields resource-pool-consume');
    expect(compactModal).toContain('Quantità da consumare');
    expect(compactModal).toContain('attachModalValueStepper');
    expect(compactModal).not.toContain('detail-rich-text');
    expect(detailModal).not.toContain('name="pool_amount"');
  });

  it('aligns detail actions in the modal header row', () => {
    const source = readFileSync('src/features/character/home/modals.js', 'utf8');
    const management = readFileSync('src/features/character/home/detailManagement.js', 'utf8');
    const layout = readFileSync('src/ui/layout.js', 'utf8');
    const shellStyles = readFileSync('src/styles/shellExperience.css', 'utf8');
    expect(source).toContain('attachUnifiedDetailActions(modal, formEl, { onEdit, onDelete })');
    expect(management).toContain("modal.querySelector('[data-form-header-actions]')");
    expect(management).toContain("actions.closest('.sheet-management-menu')");
    expect(management).toContain("modal.classList.add('detail-actions-in-header-left')");
    expect(management).toContain("modal.classList.remove('detail-actions-in-header-left')");
    expect(layout).toContain('class="modal-header__top"');
    expect(layout).toContain('data-form-header-actions');
    expect(shellStyles).toContain('grid-column: 1 !important;');
    expect(shellStyles).toContain('justify-self: start !important;');
  });

  it('supports linked ability options that consume the parent resource', () => {
    const source = readFileSync('src/features/character/home/modals.js', 'utf8');
    expect(source).toContain('export async function openResourceOptionModal');
    expect(source).toContain('name="resource_option_id"');
    expect(source).toContain("parentSelect.name = 'parent_resource_id'");
    expect(source).toContain("entry.can_have_children || String(entry.id) === String(selectedParentId)");
    expect(source).toContain('Hai <strong>${remaining}</strong> risorse disponibili');
  });

  it('opens linked child abilities through their full-width detail cards', () => {
    const source = readFileSync('src/features/character/home/modals.js', 'utf8');
    const detailModal = source.slice(
      source.indexOf('export function openResourceDetail'),
      source.indexOf('export function openSpellDrawer')
    );
    expect(detailModal).toContain('data-resource-child-open=');
    expect(detailModal).toContain('onOpenChild?.(button.dataset.resourceChildOpen)');
    expect(detailModal).not.toContain('data-resource-child-edit=');
    expect(detailModal).not.toContain('data-resource-child-delete=');
  });

  it('keeps option dice in the selection flow and reports the filtered spell total', () => {
    const source = readFileSync('src/features/character/home/modals.js', 'utf8');
    const styles = readFileSync('src/features/character/home/fantasyTheme.css', 'utf8');
    const optionModal = source.slice(
      source.indexOf('export async function openResourceOptionModal'),
      source.indexOf('export function openResourceDetail')
    );
    const preparedModal = source.slice(
      source.indexOf('export function openPreparedSpellsModal'),
      source.indexOf('export function openResourceDrawer')
    );
    expect(optionModal).toContain('data-resource-option-roll');
    expect(optionModal).toContain('onRollOption?.(child)');
    expect(optionModal).toContain('present = openFormModal');
    expect(optionModal).toContain('const formData = await present({');
    expect(optionModal).not.toContain('data-resource-child-roll');
    expect(preparedModal).toContain('data-prepared-visible-count');
    expect(preparedModal).toContain("visibleCount === 1 ? 'incantesimo visibile' : 'incantesimi visibili'");
    expect(styles).toMatch(/\.modal-card--prepared-spells \.prepared-spells-modal__sticky-filters\s*\{[^}]*position:\s*sticky;/s);
    expect(styles).toMatch(/\.modal-card--prepared-spells \.prepared-spells-modal__catalog\s*\{[^}]*overflow:\s*hidden;/s);
    expect(styles).toMatch(/:is\(\.sheet-detail,\.modal-card--prepared-spells\) \.prepared-spells-modal__list\s*\{[^}]*overflow-y:\s*auto;/s);
    expect(styles).toMatch(/:is\(\.sheet-detail,\.modal-card--prepared-spells\) \.prepared-spells-modal\s*\{[^}]*height:\s*100%;/s);
    expect(styles).toContain('.sheet-detail--preparing > .modal-body > .sheet-inline-detail.modal-card--prepared-spells');
    expect(preparedModal).toContain('const preparationView = openFormModal({');
    expect(preparedModal).toContain('void preparationView.then(async (formData) => {');
    expect(preparedModal).toContain('await new Promise((resolve) => nextPaint(() => nextPaint(resolve)))');
  });

  it('renders a structured parent overview and linked ability cards', () => {
    const source = readFileSync('src/features/character/home/modals.js', 'utf8');
    const styles = readFileSync('src/styles/base.css', 'utf8')
      + readFileSync('src/features/character/home/fantasyTheme.css', 'utf8');
    expect(source).toContain('resource-parent-overview');
    expect(source).toContain('spell-manual power-manual');
    expect(source).toContain("title: 'Scheda abilità'");
    expect(source).toContain('resource-detail-option__branch');
    expect(source).toContain('resource-detail-option__badges');
    expect(source).toContain("cardClass: 'modal-card--resource-detail'");
    expect(styles).toContain('.resource-parent-overview');
    expect(styles).toContain('.resource-detail-option__actions .resource-icon-button');
    expect(styles).toContain('.power-manual .resource-parent-overview');
    expect(styles).toContain('.modal-card--resource-detail) .power-manual .resource-parent-overview .detail-rich-text { width: 100%; max-width: none;');
  });

  it('adds an explicit parent ability flag and hides child management for non-parents', () => {
    const source = readFileSync('src/features/character/home/modals.js', 'utf8');
    const home = readFileSync('src/features/character/home.js', 'utf8');
    const migration = readFileSync('db/add_resource_parent.sql', 'utf8');
    expect(source).toContain('name="can_have_children"');
    expect(source).toContain('Può avere sotto-abilità');
    expect(source).toContain('canHaveChildren = Boolean(resource?.can_have_children)');
    expect(source).toContain('const showChildSection = Boolean(canHaveChildren)');
    expect(source).toContain("can_have_children: canHaveChildren");
    expect(home).toContain('const canHaveChildren = Boolean(resource.can_have_children);');
    expect(migration).toContain('add column if not exists can_have_children boolean not null default false');
  });

  it('only renders the detail progress bar for pool abilities', () => {
    const source = readFileSync('src/features/character/home/modals.js', 'utf8');
    const detailModal = source.slice(
      source.indexOf('export function openResourceDetail'),
      source.indexOf('export function openSpellDrawer')
    );
    expect(detailModal).toContain('${isPool && maxUses ? `');
    expect(detailModal).toContain('resource-pool resource-pool--detail');
  });

  it('configures child resource costs and disables unaffordable options', () => {
    const source = readFileSync('src/features/character/home/modals.js', 'utf8');
    const styles = readFileSync('src/styles/base.css', 'utf8');
    const picker = source.slice(
      source.indexOf('export async function openResourceOptionModal'),
      source.indexOf('export function openResourceDetail')
    );
    expect(source).toContain("name: 'resource_cost'");
    expect(source).toContain("resource_cost: parentId ? Math.max(1, Number(formData.get('resource_cost')) || 1) : 1");
    expect(source).toContain("title: 'Consumo risorsa padre'");
    expect(picker).toContain('remaining >= cost');
    expect(picker).toContain("available ? '' : 'disabled'");
    expect(picker).toContain('submitButton.disabled = !firstAvailableId');
    expect(styles).toContain('.resource-option-picker__item.is-disabled');
  });

  it('renders the parent capability control as a selectable card', () => {
    const source = readFileSync('src/features/character/home/modals.js', 'utf8');
    const editor = source.slice(source.indexOf('export function openResourceDrawer'));
    expect(editor).toContain("canHaveChildrenField.className = 'ability-parent-choice'");
    expect(editor).toContain('class="ability-parent-choice__card"');
    expect(editor).toContain('<strong>Abilità con opzioni</strong>');
  });

  it('uses a guided create and edit flow for abilities', () => {
    const source = readFileSync('src/features/character/home/modals.js', 'utf8');
    const styles = readFileSync('src/styles/theme.css', 'utf8');
    const editor = source.slice(source.indexOf('export function openResourceDrawer'));

    expect(editor).toContain("{ label: 'Identità', hint: 'Nome, organizzazione e descrizione', sections: [identitySection, descriptionSection] }");
    expect(editor).toContain("{ label: 'Utilizzi e tiri', hint: 'Cariche, dadi e CD'");
    expect(editor).toContain('sections: [usageSection, childUsageSection, rollsSection]');
    expect(editor).not.toContain("{ label: 'Descrizione', hint: 'Regole e dettagli'");
    expect(editor).toContain('data-ability-editor-back');
    expect(editor).toContain('data-ability-editor-next');
    expect(editor).toContain("wizardSubmitButton.disabled = !resource && !finalStep");
    expect(editor).toContain("nameInput.title = 'Inserisci il nome dell’abilità.'");
    expect(editor).toContain("title: resource ? `Modifica abilità: ${resource.name || 'Senza nome'}`");
    expect(editor).toContain("cardClass: ['modal-card--form', 'modal-card--ability-editor']");
    expect(styles).toContain('.modal-card--ability-editor');
    expect(styles).toContain('.ability-editor-wizard__panel[data-ability-editor-panel="0"] textarea');
    expect(styles).toContain('.ability-parent-field');
    expect(styles).toContain('.ability-parent-choice > input:checked + .ability-parent-choice__card');
    expect(editor).toContain("value: resource?.recovery_short ?? 0");
    expect(editor).toContain("value: resource?.recovery_long ?? 0");
    expect(editor).toContain("value: resource?.damage_modifier ?? 0");
    expect(editor).toContain('buildRow([canHaveChildrenField, parentField]');
    expect(editor).toContain("descriptionField.querySelector(':scope > span')?.remove()");
    expect(editor).not.toContain("description: 'Aggiungi regole, durata, trigger o note utili durante la sessione.'");
  });

  it('keeps child navigation separate from parent detail management', () => {
    const source = readFileSync('src/features/character/home/modals.js', 'utf8');
    const detailActions = readFileSync('src/features/character/home/detailManagement.js', 'utf8');
    const detailModal = source.slice(
      source.indexOf('export function openResourceDetail'),
      source.indexOf('export function openSpellDrawer')
    );
    expect(detailActions).toContain('staleInputs.forEach((input) => input.remove())');
    expect(detailActions).toContain('actionInput.remove()');
    expect(detailModal).toContain('attachDetailManagementActions(modal, formEl, { onEdit, onDelete })');
    expect(detailModal).toContain("const detailAction = formData.get('detail_action')");
    expect(detailModal).not.toContain("formData.get('resource_child_action')");
  });

  it('keeps the variable child cost as a compact toggle', () => {
    const source = readFileSync('src/features/character/home/modals.js', 'utf8');
    const styles = readFileSync('src/styles/base.css', 'utf8');
    const editor = source.slice(source.indexOf('export function openResourceDrawer'));
    expect(editor).toContain("variableResourceCostField.className = 'field ability-parent-toggle condition-modal__item'");
    expect(editor).toContain('diceov-toggle condition-modal__toggle ability-parent-toggle__control');
    expect(styles).toMatch(/\.ability-parent-toggle\s*\{[^}]*flex-direction:\s*row;/s);
    expect(styles).not.toContain('.ability-parent-toggle__control .diceov-toggle-track');
    expect(styles).not.toMatch(/\.ability-parent-toggle__control\s*\{[^}]*width:/s);
  });


  it('configures and requests a variable child-resource cost', () => {
    const source = readFileSync('src/features/character/home/modals.js', 'utf8');
    expect(source).toContain('export async function openVariableResourceCostModal');
    expect(source).toContain('name="resource_cost_variable"');
    expect(source).toContain("resource_cost_variable: Boolean(parentId && formData.get('resource_cost_variable') === '1')");
    expect(source).toContain("child.resource_cost_variable ? 'Costo variabile'");
  });

  it('uses descriptive radio cards to choose how to add a spell', () => {
    const source = readFileSync('src/features/character/home/modals.js', 'utf8');
    const styles = readFileSync('src/styles/base.css', 'utf8');
    const sourceModal = source.slice(
      source.indexOf('export async function openSpellSourceModal'),
      source.indexOf('export function openSpellQuickDetailModal')
    );

    expect(sourceModal).toContain('role="radiogroup"');
    expect(sourceModal).toContain('type="radio" name="spell_source_mode" value="shared" checked');
    expect(sourceModal).toContain('type="radio" name="spell_source_mode" value="manual"');
    expect(sourceModal).toContain('Cerca nella raccolta');
    expect(sourceModal).toContain('Crea un incantesimo');
    expect(sourceModal).toContain('Consigliato');
    expect(sourceModal).not.toContain('buildSelect([');
    expect(sourceModal).toContain("cardClass: ['modal-card--form', 'modal-card--spell-source']");
    expect(styles).toContain('.spell-source-picker__option > input:checked + .spell-source-picker__option-card');
    expect(styles).toContain('.spell-source-picker__recommendation');
  });

  it('allows catalog editors to update and normalize the spell manual', () => {
    const source = readFileSync('src/features/character/home/modals.js', 'utf8');
    expect(source).toContain("label: 'Manuale / fonte'");
    expect(source).toContain("name: 'spell_source'");
    expect(source).toContain("source: normalizeSpellSource(formData.get('spell_source')) || null");
  });

  it('opens the character story as a wide background document', () => {
    const source = readFileSync('src/features/character/home/modals.js', 'utf8');
    const backgroundModal = source.slice(
      source.indexOf('export function openBackgroundModal'),
      source.indexOf('export async function openConditionsModal')
    );
    expect(backgroundModal).toContain('background-modal-hero__background');
    expect(backgroundModal).toContain("'modal-card--wide'");
    expect(backgroundModal).toContain("title: `Storia di ${character.name || 'personaggio'}`");
  });

  it('renders an accessible preparation workflow with live selection feedback', () => {
    const source = readFileSync('src/features/character/home/modals.js', 'utf8');
    const styles = readFileSync('src/styles/base.css', 'utf8')
      + readFileSync('src/features/character/home/fantasyTheme.css', 'utf8');
    const preparedModal = source.slice(
      source.indexOf('export function openPreparedSpellsModal'),
      source.indexOf('export function openAvatarModal')
    );

    expect(preparedModal).not.toContain('prepared-spells-modal__intro');
    expect(preparedModal).toContain('prepared-spells-modal__workspace');
    expect(preparedModal).toContain("const selectable = spells.filter((entry) => Number(entry.level) > 0 && entry.prep_state !== 'always')");
    expect(preparedModal).toContain('dedupeCharacterSpells([...archiveSpells, ...customPreparedSpells])');
    expect(preparedModal).not.toContain('data-prepared-search');
    expect(preparedModal).not.toContain('data-prepared-level="all"');
    expect(preparedModal).not.toContain('data-prepare-visible');
    expect(preparedModal).not.toContain('data-unprepare-visible');
    expect(preparedModal).toContain('const applyFilters = () =>');
    expect(preparedModal).toContain("activeLevel === selectedLevel ? '' : selectedLevel");
    expect(preparedModal).not.toContain('data-prepared-count');
    expect(preparedModal).not.toContain('data-always-count');
    expect(preparedModal).not.toContain('data-removed-count');
    expect(preparedModal).not.toContain('data-prepared-cast-time');
    expect(preparedModal).not.toContain('data-prepared-status-filter');
    expect(preparedModal).not.toContain('activeStatus');
    expect(preparedModal).not.toContain('prepared-spells-modal__inline-info');
    expect(preparedModal).not.toContain('prepared-spells-modal__quick-facts');
    expect(preparedModal).not.toContain('prepared-spells-modal__facts');
    expect(preparedModal).not.toContain('<small>Scuola</small>');
    expect(preparedModal).not.toContain('<small>Tempo</small>');
    expect(preparedModal).toContain('play-card play-card--spell');
    expect(preparedModal).toContain('data-prepared-quick-detail');
    expect(preparedModal).toContain('prepared-spells-modal__detail-surface');
    expect(preparedModal).toContain('prepared-spells-modal__open-arrow');
    expect(preparedModal).not.toContain('data-prepared-description-toggle');
    expect(preparedModal).toContain('data-prepared-delete');
    expect(preparedModal).toContain("title: 'Elimina incantesimo'");
    expect(preparedModal).toContain('deletedIds.add(spellId)');
    expect(preparedModal).toContain('.filter((entry) => !deletedIds.has(entry.id))');
    expect(preparedModal).toContain('await Promise.allSettled(associationOperations)');
    expect(preparedModal).toContain("prep_state: entry.prep_state === 'always' ? 'always_prepared' : 'prepared'");
    expect(preparedModal).toContain('const hasAssociationWarnings = Boolean(associationReadError) || associationFailures.length > 0');
    expect(preparedModal).toContain('updateCharacterSpellAssignment(character.id, entry.shared_spell_id');
    expect(preparedModal).not.toContain("createToast('Errore sincronizzazione associazioni incantesimi', 'error')");
    expect(preparedModal).toContain("item?.classList.toggle('is-prepared', isPrepared)");
    expect(preparedModal).toContain("isPrepared ? 'Preparato' : 'Da preparare'");
    expect(preparedModal).toContain("cardClass: ['modal-card--form', 'modal-card--prepared-spells']");
    expect(preparedModal).toContain("submitLabel: 'Salva preparazione'");
    expect(preparedModal).toContain('`Prepara gli incantesimi di ${character.name}`');
    expect(styles).toContain('.modal-card--prepared-spells');
    expect(styles).toContain('width: min(1180px, calc(100vw - 32px))');
    expect(styles).toContain('.prepared-spells-modal__workspace');
    expect(styles).toContain('.prepared-spells-modal__level-rail');
    expect(styles).toContain('.prepared-spells-modal__spell.is-prepared');
    expect(styles).toContain('.prepared-spells-modal__check');
    expect(styles).toContain('.prepared-spells-modal__delete');
    expect(styles).toContain('.prepared-spells-modal__detail-surface');
    expect(styles).toContain('.prepared-spells-modal__open-arrow');
    expect(styles).toContain('grid-template-columns: minmax(150px,.8fr) minmax(360px,2fr) auto;');
    expect(styles).toContain('.prepared-spells-modal__empty');
  });

  it('keeps spell range classification out of the manual detail', () => {
    const source = readFileSync('src/features/character/home/modals.js', 'utf8');
    const detail = source.slice(
      source.indexOf('export function openSpellQuickDetailModal'),
      source.indexOf('export function openPreparedSpellsModal')
    );
    expect(detail).not.toContain('<dt>Proprietà</dt>');
    expect(detail).not.toContain("'In mischia'");
    expect(detail).not.toContain("'A distanza'");
  });

  it('renders imported material, upcast and source metadata in spell details', () => {
    const source = readFileSync('src/features/character/home/modals.js', 'utf8');
    const styles = readFileSync('src/features/character/home/fantasyTheme.css', 'utf8');
    const detail = source.slice(
      source.indexOf('export function openSpellQuickDetailModal'),
      source.indexOf('export function openPreparedSpellsModal')
    );
    expect(detail).toContain('spell.upcast_description');
    expect(detail).toContain('normalizeSpellSchool(spell.school)');
    expect(detail).toContain('rawDescription.endsWith(upcastDescription)');
    expect(detail).toContain('spell-manual__material');
    expect(detail).toContain('Componente materiale');
    expect(detail).toContain('spell-manual__upcast');
    expect(detail).toContain("level === 0 ? 'Potenziamento del trucchetto' : 'Ai livelli superiori'");
    expect(detail).toContain('spell.source_url || spell.linkSource || spell.detailUrl');
    expect(detail).toContain('rel="noopener noreferrer"');
    expect(detail).toContain('Apri fonte ↗');
    expect(styles).toContain('.spell-manual__material');
    expect(styles).toContain('.spell-manual__upcast');
    expect(styles).toContain('.spell-manual__reference-meta a');
  });

  it('captures spell damage type without the redundant cantrip attack category control', () => {
    const source = readFileSync('src/features/character/home/modals.js', 'utf8');
    const editor = source.slice(
      source.indexOf('export function openSpellDrawer'),
      source.indexOf('export async function openSpellSourceModal')
    );
    const migration = readFileSync('db/shared_spells_attack_range_type.sql', 'utf8');

    expect(editor).toContain("damageTypeSelect.name = 'spell_damage_type'");
    expect(editor).not.toContain('name="spell_attack_range_type"');
    expect(editor).not.toContain('cantripRangeField');
    expect(editor).toContain('attack_range_type: spell?.attack_range_type || null');
    expect(migration).toContain('add column if not exists attack_range_type text');
    expect(migration).toContain("attack_range_type in ('melee', 'ranged')");
  });

  it('uses a guided create and edit flow for spells', () => {
    const source = readFileSync('src/features/character/home/modals.js', 'utf8');
    const styles = readFileSync('src/styles/theme.css', 'utf8');
    const editor = source.slice(
      source.indexOf('export function openSpellDrawer'),
      source.indexOf('export async function openSpellSourceModal')
    );

    expect(editor).toContain("{ label: 'Identità', hint: 'Nome, livello e classi'");
    expect(editor).toContain("{ label: 'Lancio', hint: 'Tempi e proprietà'");
    expect(editor).toContain("{ label: 'Effetti', hint: 'Danni e progressione'");
    expect(editor).toContain("{ label: 'Descrizione', hint: 'Dettagli dell’incantesimo'");
    expect(editor).toContain('data-spell-editor-back');
    expect(editor).toContain('data-spell-editor-next');
    expect(editor).not.toContain('spell-editor-review');
    expect(editor).not.toContain('spell-editor-overview');
    expect(editor).toContain('buildSpellTraitCard');
    expect(editor).toContain('spell-choice-card');
    expect(editor).toContain('spell_has_saving_throw');
    expect(editor).toContain('const launchOptionsRow = buildRow([savingThrowField, savingThrowAbilityField, prepStateField]');
    expect(editor).toContain("launchOptionsRow.classList.add('spell-launch-options-row')");
    expect(editor).toContain('traitsSection.appendChild(launchOptionsRow)');
    expect(editor).toContain("savingThrowAbilitySelect.name = 'spell_saving_throw_ability'");
    expect(editor).toContain("{ value: 'prepared', label: 'Preparato' }");
    expect(editor).toContain("{ value: 'always', label: 'Sempre preparato' }");
    expect(editor).not.toContain("{ value: 'known', label: 'Conosciuto' }");
    expect(editor).toContain("nameInput.title = 'Inserisci il nome dell’incantesimo.'");
    expect(editor).toContain("nameInput.setCustomValidity('Inserisci il nome dell’incantesimo.')");
    expect(editor).toContain("name: 'spell_material'");
    expect(editor).toContain("material: formData.get('spell_material')?.trim() || null");
    expect(editor).toContain('wizardSubmitButton.disabled = !spell && activeWizardStep !== wizardSteps.length - 1');
    expect(editor).toContain('if (spell || activeWizardStep === wizardSteps.length - 1) return');
    expect(editor).toContain("title: spell ? `Modifica incantesimo: ${spell.name || 'Senza nome'}`");
    expect(styles).toContain('.spell-trait-card');
    expect(styles).toContain('.spell-choice-card');
    expect(styles).toContain('.spell-editor-wizard__panel[data-spell-editor-panel="3"] textarea');
  });

  it('captures saving throw abilities for spells and powers', () => {
    const source = readFileSync('src/features/character/home/modals.js', 'utf8');
    const migration = readFileSync('db/add_saving_throw_ability.sql', 'utf8');
    expect(source).toContain("savingThrowAbilitySelect.name = 'spell_saving_throw_ability'");
    expect(source).toContain("saving_throw_ability: formData.get('spell_saving_throw_ability')?.toString() || null");
    expect(source).toContain("resourceSavingThrowSelect.name = 'saving_throw_ability'");
    expect(source).toContain("saving_throw_ability: formData.get('saving_throw_ability')?.toString() || null");
    expect(source).not.toContain('Mostra la CTA “Colpire”');
    expect(migration).toContain('alter table public.shared_spells');
    expect(migration).toContain('alter table public.resources');
    expect(migration).toContain("saving_throw_ability in ('str', 'dex', 'con', 'int', 'wis', 'cha')");
  });


});
