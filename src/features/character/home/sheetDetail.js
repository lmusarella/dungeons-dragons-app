import { openFormModal } from '../../../ui/components.js';

// The existing resource view supplies its content and actions; this presenter
// puts them in the catalog dialog instead of opening a second modal.
export function presentSheetDetail(dialog, options) {
  if (!dialog?.open) return openFormModal(options);
  return new Promise((resolve) => {
    const detailClasses = (Array.isArray(options.cardClass) ? options.cardClass : [options.cardClass])
      .flatMap((value) => String(value || '').split(/\s+/))
      .filter(Boolean);
    const body = dialog.querySelector('.modal-body');
    const header = dialog.querySelector('.modal-header');
    const heading = header.querySelector('.modal-title');
    const catalog = body.querySelector(':scope > .sheet-inline-detail:not([hidden])')
      || body.querySelector(':scope > .sheet-modal-content')
      || body.firstElementChild;
    const catalogAccessories = catalog.classList.contains('sheet-inline-detail')
      ? []
      : [...body.children]
        .filter((node) => node !== catalog && !node.classList.contains('sheet-inline-detail'))
        .map((node) => [node, node.hidden]);
    const rootPreparation = catalog.classList.contains('sheet-preparation');
    const isPreparationView = rootPreparation || detailClasses.includes('modal-card--prepared-spells');
    const wasPreparing = dialog.classList.contains('sheet-detail--preparing');
    const previousFooter = dialog.querySelector(':scope > .sheet-view-footer:not([hidden])');
    if (previousFooter) previousFooter.hidden = true;
    const previousResourceId = dialog.dataset.resourceId;
    const previousTitle = heading.textContent;
    const previousView = dialog._sheetDetailView;
    const previousControls = [...dialog.querySelectorAll('[data-form-submit], [data-form-header-actions]')]
      .map(node => [node, node.hasAttribute('data-form-submit') ? 'data-form-submit' : 'data-form-header-actions', node.hidden]);
    previousControls.forEach(([node, attribute]) => {
      node.removeAttribute(attribute);
      if (attribute === 'data-form-header-actions') node.hidden = true;
    });
    const previousScroll = body.scrollTop;
    const origin = document.activeElement;
    const view = document.createElement('form');
    view.dataset.sheetInlineDetail = '';
    dialog._sheetDetailView = view;
    view.className = 'sheet-inline-detail';
    view.dataset.formBody = '';
    view.id = 'sheet-view-' + crypto.randomUUID();
    dialog.classList.add('sheet-detail--inline');
    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'ghost-button sheet-detail-back';
    back.textContent = catalog.classList.contains('sheet-inline-detail') ? '‹ Indietro' : '‹ ' + heading.textContent;
    back.dataset.sheetInlineDetail = '';
    const management = document.createElement('div');
    management.dataset.formHeaderActions = '';
    management.dataset.sheetInlineDetail = '';
    management.className = 'modal-header__actions';
    const fields = document.createElement('div');
    fields.className = 'sheet-inline-detail__content';
    fields.dataset.formFields = '';
    if (typeof options.content === 'string') fields.innerHTML = options.content;
    else if (options.content) fields.append(options.content);
    const footer = document.createElement('footer');
    footer.className = 'modal-footer sheet-view-footer';
    const hasPrimaryAction = options.showFooter !== false && options.submitLabel !== 'Chiudi';
    back.textContent = rootPreparation ? 'Chiudi' : '‹ Indietro';
    const leftActions = document.createElement('div');
    leftActions.className = 'modal-actions__left';
    leftActions.append(back);
    const actions = document.createElement('div');
    actions.className = 'modal-actions';
    const submit = document.createElement('button');
    submit.type = 'submit';
    submit.className = 'primary';
    submit.dataset.formSubmit = '';
    submit.setAttribute('form', view.id);
    submit.hidden = !hasPrimaryAction;
    submit.textContent = options.submitLabel || 'Conferma';
    const rightActions = document.createElement('div');
    rightActions.className = 'modal-actions__right';
    rightActions.append(submit);
    actions.append(leftActions, rightActions);
    footer.append(actions);
    view.append(fields);
    catalogAccessories.forEach(([node]) => { node.hidden = true; });
    catalog.hidden = true;
    heading.textContent = options.title || 'Risorsa';
    const previousNavigation = [...header.querySelector('.sheet-modal-navigation').children].map(item => [item, item.hidden]);
    previousNavigation.forEach(([item]) => item.hidden = true);

    const headerActions = header.querySelector('.sheet-modal-actions');
    const managementMenu = document.createElement('details');
    managementMenu.className = 'sheet-management-menu';
    managementMenu.dataset.sheetInlineDetail = '';
    const menuToggle = document.createElement('summary');
    menuToggle.textContent = '⋯';
    menuToggle.setAttribute('aria-label', 'Gestisci');
    managementMenu.append(menuToggle, management);
    header.querySelector('.sheet-modal-navigation').append(managementMenu);
    body.append(view);
    dialog.insertBefore(footer, previousFooter || null);
    dialog.classList.toggle('sheet-detail--preparing', isPreparationView);
    body.scrollTop = 0;
    let cleanupHook;
    let settled = false;
    const finish = (result, exit = false) => {
      if (settled) return;
      settled = true;
      cleanupHook?.();
      view.remove();
      footer.remove();
      if (previousFooter) previousFooter.hidden = false;
      dialog._sheetDetailView = previousView;
      dialog.classList.toggle('sheet-detail--preparing', wasPreparing);
      previousControls.forEach(([node, attribute, hidden]) => { node.setAttribute(attribute, ''); node.hidden = hidden; });
      if (!previousView) dialog.classList.remove('sheet-detail--inline');
      managementMenu.remove();
      back.remove();
      previousNavigation.forEach(([item, hidden]) => item.hidden = hidden);
      catalogAccessories.forEach(([node, hidden]) => { node.hidden = hidden; });
      catalog.hidden = false;
      heading.textContent = previousTitle;
      body.scrollTop = previousScroll;
      dialog.removeEventListener('cancel', cancel);
      dialog.removeEventListener('close', close);
      if (!exit) {
        if (previousView && previousResourceId) dialog.dataset.resourceId = previousResourceId;
        else delete dialog.dataset.resourceId;
      }
      if (!exit && catalog.classList.contains('sheet-preparation')) dialog.close();
      if (dialog.open && origin?.isConnected) origin.focus();
      resolve(result);
    };
    const cancel = (event) => { if (dialog._sheetDetailView !== view) return; event.preventDefault(); finish(null); };
    const close = () => finish(null);
    back.addEventListener('click', () => finish(null));
    dialog.addEventListener('cancel', cancel);
    dialog.addEventListener('close', close);
    view.addEventListener('submit', (event) => {
      event.preventDefault();
      const result = new FormData(view);
      if (event.submitter?.name) result.set(event.submitter.name, event.submitter.value);
      finish(result, true);
    });
    if (detailClasses.length) view.classList.add(...detailClasses);
    cleanupHook = options.onOpen?.({ modal: dialog, formEl: view, fieldsEl: fields });
    if (footer.querySelector('.character-edit-stepper-actions')) back.textContent = 'Annulla';
    footer.querySelectorAll('button[type="submit"]').forEach(control => control.setAttribute('form', view.id));
    managementMenu.hidden = !management.children.length;
    if (rootPreparation) fields.querySelector('input, button, select')?.focus();
    else back.focus();
  });
}
