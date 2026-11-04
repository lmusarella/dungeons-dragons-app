export function attachUnifiedDetailActions(modal, formEl, {
  onEdit = null,
  onDelete = null,
  actionName = 'detail_action',
  editLabel = 'Modifica',
  deleteLabel = 'Elimina'
} = {}) {
  if ((!onEdit && !onDelete) || !modal || !formEl) return null;
  const actions = modal.querySelector('[data-form-header-actions]');
  if (!actions) return null;

  const staleInputs = [...formEl.querySelectorAll(`input[name="${actionName}"]`)];
  staleInputs.forEach((input) => input.remove());
  const actionInput = document.createElement('input');
  actionInput.type = 'hidden';
  actionInput.name = actionName;
  formEl.appendChild(actionInput);

  const submitAction = (action) => {
    actionInput.value = action;
    const childActionInput = formEl.querySelector('input[name="resource_child_action"]');
    if (childActionInput) childActionInput.value = '';
    formEl.requestSubmit();
  };

  actions.classList.add('detail-modal-actions', 'detail-modal-actions--overflow');
  modal.classList.add('detail-actions-in-header-left');
  const shellOwnsOverflow = Boolean(actions.closest('.sheet-management-menu'));
  let root = actions;
  let panel = actions;

  if (!shellOwnsOverflow) {
    root = document.createElement('div');
    root.className = 'detail-overflow-menu';
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'resource-action-button detail-overflow-menu__trigger';
    trigger.setAttribute('aria-label', 'Azioni dettaglio');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.textContent = '⋯';
    panel = document.createElement('div');
    panel.className = 'detail-overflow-menu__panel';
    panel.hidden = true;
    trigger.addEventListener('click', () => {
      panel.hidden = !panel.hidden;
      trigger.setAttribute('aria-expanded', String(!panel.hidden));
    });
    root.append(trigger, panel);
    actions.appendChild(root);
  }

  const actionButtons = [];
  const appendAction = ({ action, label, icon, danger = false }) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `detail-overflow-menu__action${danger ? ' is-danger' : ''}`;
    button.setAttribute('aria-label', label);
    button.innerHTML = `<span aria-hidden="true">${icon}</span><strong>${label}</strong>`;
    button.addEventListener('click', () => submitAction(action));
    panel.appendChild(button);
    actionButtons.push(button);
  };

  if (onEdit) appendAction({ action: 'edit', label: editLabel, icon: '✎' });
  if (onDelete) appendAction({ action: 'delete', label: deleteLabel, icon: '⌫', danger: true });

  return () => {
    actionInput.remove();
    if (shellOwnsOverflow) actionButtons.forEach((button) => button.remove());
    else root.remove();
    actions.classList.remove('detail-modal-actions', 'detail-modal-actions--overflow');
    modal.classList.remove('detail-actions-in-header-left');
  };
}
