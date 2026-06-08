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
    expect(source).toContain('La carica verrà consumata dall’abilità principale');
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

});
