import { describe, it, expect } from 'vitest';
import { buildEquipSection } from '../../../../src/features/character/home/sections.js';
import { readFileSync } from 'node:fs';

describe('equipment shortcut summary', () => {
  it('shows equipped weight, location and attunement without a duplicate load metric', () => {
    const html = buildEquipSection({ data: { settings: { weight_unit: 'kg' } } }, [
      { id: 'sword', name: 'Spada', category: 'weapon', weight: 2, qty: 1, equipable: true, equip_slots: ['right_hand'], attunement_active: true },
      { id: 'rope', name: 'Corda', category: 'gear', weight: 5, qty: 1 }
    ], true);
    expect(html).toContain('Peso equipaggiato');
    expect(html).not.toContain('Carico totale');
    expect(html).toContain('data-equipped-location=');
    expect(html).toContain('data-equipped-attunement="Attiva"');
    expect(html).toContain('data-filter-equipped-attunement');
    expect(html).toContain('data-equipped-attuned="true"');
  });

  it('includes container contents in the single equipped-weight summary', () => {
    const html = buildEquipSection({ data: { settings: { weight_unit: 'kg' } } }, [
      { id: 'bag', name: 'Zaino', category: 'container', weight: 1, qty: 1, equipable: true, equip_slots: ['back'] },
      { id: 'book', name: 'Libro', category: 'gear', weight: 2, qty: 2, container_item_id: 'bag' },
      { id: 'rope', name: 'Corda', category: 'gear', weight: 8, qty: 1 }
    ], true);
    expect(html.match(/<dd>5 kg<\/dd>/g)).toHaveLength(1);
    expect(html).toContain('data-equipped-weight="5 kg"');
  });

  it('uses the shared, non-nested management menu in item details', () => {
    const detail = readFileSync('src/features/character/home/itemDetail.js', 'utf8');
    const management = readFileSync('src/features/character/home/detailManagement.js', 'utf8');
    expect(detail).toContain('attachUnifiedDetailActions(modal, formEl');
    expect(detail).toContain("actionName: 'item_detail_action'");
    expect(management).toContain("actions.closest('.sheet-management-menu')");
    expect(management).toContain('if (!shellOwnsOverflow)');
  });
});
