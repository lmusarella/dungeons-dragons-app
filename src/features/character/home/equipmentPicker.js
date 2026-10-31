import { openFormModal } from '../../../ui/components.js';
import { escapeHtml, sanitizeImageUrl } from '../../../lib/html.js';
import { getEquipSlots, getCategoryLabel } from '../../inventory/utils.js';
import { openEquipmentMannequin } from './equipmentMannequin.js';

export async function openEquipmentPicker(configuration = {}) {
  const items = (configuration.items || []).filter(item => item.equipable && !getEquipSlots(item).length);
  let selectedId = '';
  while (true) {
    const content = document.createElement('div'); content.className = 'equipment-picker';
    content.innerHTML = '<p class="muted">Scegli un oggetto, poi assegna una o più parti del corpo sul manichino.</p>' +
      (items.length ? '<input type="search" class="equipment-picker-search" placeholder="Cerca tra gli oggetti equipaggiabili" aria-label="Cerca oggetto da equipaggiare"><div class="equipment-picker-grid">' + items.map(item => {
        const image = sanitizeImageUrl(item.image_url);
        return '<label class="equipment-picker-option" data-equipment-name="'+escapeHtml(item.name.toLowerCase())+'"><input type="radio" name="item_id" required value="'+escapeHtml(item.id)+'" '+(String(item.id) === selectedId ? 'checked' : '')+'>'+ (image ? '<img src="'+image+'" alt="">' : '<span class="equipment-picker-symbol" aria-hidden="true">◇</span>') + '<span><strong>'+escapeHtml(item.name)+'</strong><small>'+escapeHtml(getCategoryLabel(item.category))+'</small></span></label>';
      }).join('') + '</div><p class="muted" data-no-equipment-match hidden>Nessun oggetto corrisponde alla ricerca.</p>' : '<p class="equipment-picker-empty">Non ci sono oggetti equipaggiabili liberi. Aggiungili dall’Inventario.</p>');
    const selection = await openFormModal({
      title: 'Equipaggia · Scegli oggetto', content, submitLabel: 'Scegli posizione', showFooter: items.length > 0,
      onOpen: ({ modal }) => {
        const submit = modal.querySelector('[data-form-submit]');
        const sync = () => { if (submit) submit.disabled = !content.querySelector('input[name="item_id"]:checked'); };
        sync(); content.addEventListener('change', sync);
        content.querySelector('input[type="search"]')?.addEventListener('input', event => {
          let matches = 0;
          content.querySelectorAll('[data-equipment-name]').forEach(option => { option.hidden = !option.dataset.equipmentName.includes(event.target.value.trim().toLowerCase()); if (!option.hidden) matches++; });
          content.querySelector('[data-no-equipment-match]').hidden = matches > 0;
        });
      }
    });
    if (!selection) return { changed: false };
    selectedId = String(selection.get('item_id') || '');
    const item = items.find(item => String(item.id) === selectedId);
    if (!item) return { changed: false };
    const result = await openEquipmentMannequin({ ...configuration, initialItemId: item.id, singleItem: true, title: 'Equipaggia · ' + item.name });
    if (result?.changed) return result;
  }
}
