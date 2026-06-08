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
    const layout = readFileSync('src/ui/layout.js', 'utf8');
    expect(source).toContain("modal.querySelector('[data-form-header-actions]')");
    expect(layout).toContain('class="modal-header__top"');
    expect(layout).toContain('data-form-header-actions');
  });

  it('supports linked ability options that consume the parent resource', () => {
    const source = readFileSync('src/features/character/home/modals.js', 'utf8');
    expect(source).toContain('export async function openResourceOptionModal');
    expect(source).toContain('name="resource_option_id"');
    expect(source).toContain("parentSelect.name = 'parent_resource_id'");
    expect(source).toContain("entry.can_have_children || String(entry.id) === String(selectedParentId)");
    expect(source).toContain('Hai <strong>${remaining}</strong> risorse disponibili');
  });

  it('wires child edit and delete icon buttons explicitly', () => {
    const source = readFileSync('src/features/character/home/modals.js', 'utf8');
    const detailModal = source.slice(
      source.indexOf('export function openResourceDetail'),
      source.indexOf('export function openSpellDrawer')
    );
    expect(detailModal).toContain('type="button" data-resource-child-edit=');
    expect(detailModal).toContain('type="button" data-resource-child-delete=');
    expect(detailModal).toContain('aria-hidden="true">✏️</span>');
    expect(detailModal).toContain('aria-hidden="true">🗑️</span>');
    expect(detailModal).toContain("childActionInput.name = 'resource_child_action'");
    expect(detailModal).toContain("submitChildAction(`edit:${button.dataset.resourceChildEdit}`)");
    expect(detailModal).toContain("submitChildAction(`delete:${button.dataset.resourceChildDelete}`)");
  });

  it('renders a structured parent overview and linked ability cards', () => {
    const source = readFileSync('src/features/character/home/modals.js', 'utf8');
    const styles = readFileSync('src/styles/base.css', 'utf8');
    expect(source).toContain('resource-parent-overview');
    expect(source).toContain('resource-detail-option__branch');
    expect(source).toContain('resource-detail-option__badges');
    expect(source).toContain("cardClass: 'modal-card--resource-detail'");
    expect(styles).toContain('.resource-parent-overview');
    expect(styles).toContain('.resource-detail-option__actions .resource-icon-button');
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

  it('renders the parent capability control as a compact toggle', () => {
    const source = readFileSync('src/features/character/home/modals.js', 'utf8');
    expect(source).toContain('class="diceov-toggle condition-modal__toggle ability-parent-toggle__control"');
    expect(source).toContain('class="diceov-toggle-track"');
  });

  it('keeps child actions separate from parent detail actions', () => {
    const source = readFileSync('src/features/character/home/modals.js', 'utf8');
    const detailActions = source.slice(
      source.indexOf('function attachDetailManagementActions'),
      source.indexOf('export async function openResourcePoolConsumeModal')
    );
    const detailModal = source.slice(
      source.indexOf('export function openResourceDetail'),
      source.indexOf('export function openSpellDrawer')
    );
    expect(detailActions).toContain("staleActionInputs.forEach((input) => input.remove())");
    expect(detailActions).toContain('actionInput.remove()');
    expect(detailModal).toContain("if (detailActionInput) detailActionInput.value = ''");
    expect(detailModal.indexOf("const childAction = formData.get('resource_child_action')"))
      .toBeLessThan(detailModal.indexOf("const detailAction = formData.get('detail_action')"));
  });

  it('uses the same toggle structure as the conditions modal without forced dimensions', () => {
    const source = readFileSync('src/features/character/home/modals.js', 'utf8');
    const styles = readFileSync('src/styles/base.css', 'utf8');
    expect(source).toContain('ability-parent-toggle condition-modal__item');
    expect(source).toContain('condition-modal__item-label');
    expect(source).toContain('diceov-toggle condition-modal__toggle ability-parent-toggle__control');
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

});
