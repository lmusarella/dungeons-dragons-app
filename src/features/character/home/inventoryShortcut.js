import { polishInventoryShortcut, showShortcutLoader } from './shortcutViews.js';
export function createInventoryShortcut(addPanel, configuration = {}) {
  const host = document.createElement('section');
  host.className = 'sheet-inventory-host';
  host.dataset.inventoryShortcut = '';
  const shortcut = addPanel(host, '◇', 'Inventario', 'Zaino, oggetti e monete');
  const dialog = host.closest('dialog');
  dialog.classList.add('sheet-detail--inventory','sheet-detail--catalog');
  const add = document.createElement('button');
  add.type = 'button'; add.className = 'icon-button';
  add.disabled = true;
  add.textContent = '+'; add.setAttribute('aria-label','Nuovo oggetto');
  host.polishShortcut = options => polishInventoryShortcut(host, options);
  host.updateShortcutAction = key => { add.hidden = key !== 'items'; };
  add.addEventListener('click',()=>host.querySelector('[data-add-item]')?.click());
  dialog.querySelector('.sheet-modal-actions').append(add);
  let loaded = false;
  let loading = false;
  dialog.loadInventory = async ()=>{
    if (loading) return;
    loading = true;
    const hideLoader = showShortcutLoader(host, 'Caricamento inventario');
    try {
      const { renderInventory } = await import('../../inventory/inventory.js');
      await renderInventory(host);
      loaded = true;
      add.disabled = false;
    } catch {
      host.textContent = 'Impossibile caricare l’inventario. Chiudi e riapri per riprovare.';
    } finally { hideLoader(); loading = false; }
  };
  shortcut.addEventListener('click',dialog.loadInventory);
  dialog.addEventListener('close',()=>{
    if (host.dataset.shortcutChanged !== 'true') return;
    delete host.dataset.shortcutChanged;
    configuration.onRefresh?.();
  }, { signal: dialog._sheetEvents.signal });
}
