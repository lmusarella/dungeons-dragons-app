import { describe, it, expect, vi } from 'vitest';
import { captureSheetPanel, relocateSheetNode, restoreSheetPanel } from '../../../../src/features/character/home/tabletLayout.js';
import { readFileSync } from 'node:fs';

function fixture({ open = true, pending = false, resource = true } = {}) {
  const body = { scrollTop: 87 };
  const details = [{ open: true }, { open: false }];
  const card = { dataset: { resourceCard: 'r1' }, click: vi.fn() };
  const dialog = {
    open, dataset: { sheetPanel: 'Risorse', resourceId: 'r1', ...(pending ? { resumePanel: 'true' } : {}) },
    showModal: vi.fn(),
    querySelector: () => body,
    querySelectorAll: selector => selector === 'details' ? details : resource ? [card] : []
  };
  return { container: { querySelectorAll: () => [dialog] }, dialog, body, details, card };
}

describe('sheet context after operations', () => {
  it('moves a retained open dialog across parents without using atomic moveBefore', () => {
    const oldParent = {};
    const dialog = {
      open: true,
      parentElement: oldParent,
      dataset: {},
      contains: () => false,
      matches: () => true,
      removeAttribute: vi.fn(function removeOpen() { this.open = false; })
    };
    const layout = {
      moveBefore: vi.fn(() => { throw new DOMException('invalid hierarchy', 'HierarchyRequestError'); }),
      append: vi.fn((node) => { node.parentElement = layout; })
    };

    expect(relocateSheetNode(layout, dialog)).toBe(true);
    expect(layout.moveBefore).not.toHaveBeenCalled();
    expect(dialog.removeAttribute).toHaveBeenCalledWith('open');
    expect(layout.append).toHaveBeenCalledWith(dialog);
  });

  it('rejects a move that would create a DOM cycle', () => {
    const parent = {};
    const node = { contains: candidate => candidate === parent };
    expect(relocateSheetNode(parent, node)).toBe(false);
  });

  it('captures an open catalog and its selected resource', () => {
    const f = fixture();
    expect(captureSheetPanel(f.container)).toEqual({ panel: 'Risorse', resourceId: 'r1', scroll: 87, expanded: [true, false] });
  });
  it('keeps context when an action temporarily closes the catalog', () => {
    const f = fixture({ open: false, pending: true });
    expect(captureSheetPanel(f.container).resourceId).toBe('r1');
  });
  it('does not reopen a catalog explicitly closed by the user', () => {
    expect(captureSheetPanel(fixture({ open: false }).container)).toBeNull();
  });
  it('restores the updated resource detail, scroll and expanded groups', () => {
    const f = fixture({ open: false });
    restoreSheetPanel(f.container, { panel: 'Risorse', resourceId: 'r1', scroll: 42, expanded: [false, true] });
    expect(f.dialog.showModal).toHaveBeenCalledOnce();
    expect(f.card.click).toHaveBeenCalledOnce();
    expect(f.body.scrollTop).toBe(42);
    expect(f.details.map(d => d.open)).toEqual([false, true]);
  });
  it('returns to the list when the selected resource was deleted', () => {
    const f = fixture({ open: false, resource: false });
    expect(() => restoreSheetPanel(f.container, { panel: 'Risorse', resourceId: 'r1', scroll: 0, expanded: [] })).not.toThrow();
    expect(f.dialog.showModal).toHaveBeenCalledOnce();
    expect(f.card.click).not.toHaveBeenCalled();
  });
  it('treats the modal content as the catalog when sticky controls precede it', () => {
    const source = readFileSync('src/features/character/home/sheetDetail.js', 'utf8');
    expect(source).toContain("body.querySelector(':scope > .sheet-modal-content')");
    expect(source).toContain('catalogAccessories.forEach(([node]) => { node.hidden = true; })');
    expect(source).toContain('catalogAccessories.forEach(([node, hidden]) => { node.hidden = hidden; })');
  });
});
