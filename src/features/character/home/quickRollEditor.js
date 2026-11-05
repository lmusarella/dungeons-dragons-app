import { buildInput, buildSelect, openConfirmModal, openFormModal } from '../../../ui/components.js';
import { escapeHtml, sanitizeImageUrl } from '../../../lib/html.js';
import { saveCharacterData } from './data.js';
import { calculateUnarmedAttackBonuses, getEquipSlots } from './utils.js';

export async function openAttackConfigurator(character, items = [], onRender, { onEquipWeapon } = {}) {
  if (!character) return;
  const availableWeapons = items.filter((item) => item.category === 'weapon' && item.equipable && !getEquipSlots(item).length);
  const content = document.createElement('div');
  content.className = 'attack-configurator';
  content.innerHTML = `
    <section class="attack-configurator__section">
      <div class="attack-configurator__heading"><span aria-hidden="true">✦</span><div><strong>Attacco senz’armi</strong><small>Crea pugni, calci, morsi o altri attacchi personalizzati.</small></div></div>
      <label class="attack-configurator__option attack-configurator__option--unarmed">
        <input type="radio" name="attack_configuration" value="unarmed" />
        <span class="attack-configurator__visual" aria-hidden="true">⚔</span>
        <span><strong>Aggiungi attacco senz’armi</strong><small>Configura caratteristica, tiro per colpire e danni.</small></span>
        <b aria-hidden="true">✓</b>
      </label>
    </section>
    <section class="attack-configurator__section">
      <div class="attack-configurator__heading"><span aria-hidden="true">◇</span><div><strong>Armi equipaggiabili</strong><small>Seleziona un’arma dell’inventario e assegnala al manichino.</small></div></div>
      ${availableWeapons.length ? `<div class="attack-configurator__weapon-grid">
        ${availableWeapons.map((item) => {
    const image = sanitizeImageUrl(item.image_url);
    return `
          <label class="attack-configurator__option">
            <input type="radio" name="attack_configuration" value="weapon:${escapeHtml(item.id)}" />
            ${image ? `<img class="attack-configurator__weapon-image" src="${image}" alt="" />` : '<span class="attack-configurator__visual" aria-hidden="true">◇</span>'}
            <span><strong>${escapeHtml(item.name || 'Arma')}</strong><small>${escapeHtml(item.weapon_type || 'Arma equipaggiabile')}</small></span>
            <b aria-hidden="true">✓</b>
          </label>`;
  }).join('')}
      </div>` : '<p class="attack-configurator__empty">Non ci sono armi equipaggiabili libere nell’inventario.</p>'}
    </section>
  `;
  const result = await openFormModal({
    title: 'Configura attacco',
    content,
    submitLabel: 'Continua',
    cancelLabel: 'Annulla',
    cardClass: 'modal-card--attack-configurator',
    onOpen: ({ modal }) => {
      const submit = modal.querySelector('[data-form-submit]');
      const sync = () => { if (submit) submit.disabled = !content.querySelector('input[name="attack_configuration"]:checked'); };
      content.addEventListener('change', sync);
      sync();
      return () => content.removeEventListener('change', sync);
    }
  });
  const selection = result?.get('attack_configuration')?.toString() || '';
  if (!selection) return;
  if (selection === 'unarmed') {
    await openQuickRollEditor(character, 'attack', onRender);
    return;
  }
  const weaponId = selection.startsWith('weapon:') ? selection.slice('weapon:'.length) : '';
  const weapon = availableWeapons.find((item) => String(item.id) === weaponId);
  if (weapon) await onEquipWeapon?.(weapon, availableWeapons);
}

export async function openQuickRollEditor(character, kind, onRender, { index = null } = {}) {
  if (!character) return;
  const attack = kind === 'attack';
  const existing = attack && Number.isInteger(index) ? character.data?.unarmed_attacks?.[index] : null;
  const abilities = [['str','Forza'],['dex','Destrezza'],['con','Costituzione'],['int','Intelligenza'],['wis','Saggezza'],['cha','Carisma']];
  const form = document.createElement('div');
  if (attack) {
    form.className = 'quick-roll-editor';
    const intro = document.createElement('p'); intro.className = 'muted';
    intro.textContent = 'Crea un colpo senza armi. Caratteristica e competenza vengono incluse nel tiro.';
    form.append(intro, buildInput({ label: 'Nome', name: 'name', required: true, value: existing?.name || '', placeholder: 'Es. Colpo di coda' }));
    const label = document.createElement('label'); label.className = 'field';
    const caption = document.createElement('span'); caption.textContent = 'Caratteristica';
    const select = buildSelect(abilities.filter(([key]) => ['str','dex'].includes(key)).map(([value,abilityLabel]) => ({ value, label: abilityLabel })), existing?.ability || 'str'); select.name = 'ability';
    label.append(caption, select); form.append(label);
    form.append(buildInput({ label: 'Bonus aggiuntivo al tiro per colpire', name: 'bonus', type: 'number', value: existing?.attack_bonus ?? 0 }));
    form.append(buildInput({ label: 'Danni base o dado', name: 'damage', value: existing?.damage || '1', placeholder: 'Es. 1 oppure 1d4' }), buildInput({ label: 'Bonus aggiuntivo ai danni', name: 'damage_bonus', type: 'number', value: existing?.damage_bonus ?? 0 }));
  } else {
    form.className = 'quick-skill-editor';
    form.innerHTML = `
      <section class="quick-skill-editor__hero">
        <span aria-hidden="true">◇</span>
        <div><strong>Nuova abilità speciale</strong><small>Crea una prova rapida da usare direttamente dalla scheda.</small></div>
      </section>
      <section class="quick-skill-editor__section">
        <label class="field quick-skill-editor__name"><span>Nome abilità</span><input name="name" required placeholder="Es. Scassinare serrature" autocomplete="off" /></label>
        <div class="quick-skill-editor__field-group">
          <span class="quick-skill-editor__label">Caratteristica</span>
          <div class="quick-skill-editor__ability-grid">
            ${abilities.map(([value, abilityLabel], abilityIndex) => `<label class="quick-skill-editor__ability"><input type="radio" name="ability" value="${value}" ${abilityIndex === 0 ? 'checked' : ''} /><span><b>${abilityLabel.slice(0, 3).toUpperCase()}</b><strong>${abilityLabel}</strong><i aria-hidden="true">✓</i></span></label>`).join('')}
          </div>
        </div>
      </section>
      <section class="quick-skill-editor__section quick-skill-editor__rules">
        <div class="quick-skill-editor__proficiency" role="group" aria-label="Competenza dell’abilità">
          <label><input type="checkbox" name="proficient" /><span><i aria-hidden="true">✓</i><strong>Competenza</strong><small>Aggiunge il bonus di competenza.</small></span></label>
          <label><input type="checkbox" name="mastery" /><span><i aria-hidden="true">✓</i><strong>Maestria</strong><small>Raddoppia il bonus di competenza.</small></span></label>
        </div>
        <div class="quick-skill-editor__bonus">
          <span><strong>Bonus aggiuntivo</strong><small>Modificatore extra oltre a caratteristica e competenza.</small></span>
          <div><button type="button" data-quick-skill-step="-1" aria-label="Riduci bonus">−</button><input type="number" name="bonus" value="0" step="1" inputmode="numeric" /><button type="button" data-quick-skill-step="1" aria-label="Aumenta bonus">+</button></div>
        </div>
      </section>`;
    const bonusInput = form.querySelector?.('input[name="bonus"]');
    form.querySelectorAll?.('[data-quick-skill-step]').forEach((button) => button.addEventListener('click', () => {
      bonusInput.value = String((Number(bonusInput.value) || 0) + Number(button.dataset.quickSkillStep));
    }));
    const masteryInput = form.querySelector?.('input[name="mastery"]');
    const proficiencyInput = form.querySelector?.('input[name="proficient"]');
    masteryInput?.addEventListener('change', () => {
      if (masteryInput.checked && proficiencyInput) proficiencyInput.checked = true;
    });
  }
  const nameInput = form.querySelector?.('[name="name"]');
  if (nameInput) nameInput.required = true;
  const result = await openFormModal({
    title: attack ? (existing ? 'Modifica colpo' : 'Nuovo colpo senza armi') : 'Aggiungi abilità speciale',
    content: form,
    submitLabel: existing ? 'Salva' : 'Aggiungi',
    cancelLabel: 'Annulla',
    cardClass: attack ? '' : 'modal-card--quick-skill-editor',
    onOpen: attack ? undefined : () => nameInput?.focus()
  });
  if (!result) return;
  const data = character.data || {};
  const name = String(result.get('name') || '').trim(); if (!name) return;
  const ability = result.get('ability'); const bonus = Number(result.get('bonus')) || 0;
  if (attack) {
    const entry = { name, ability, attack_bonus: bonus, damage: String(result.get('damage') || '1').trim(), damage_bonus: Number(result.get('damage_bonus')) || 0 };
    const totals = calculateUnarmedAttackBonuses(data, entry);
    const attacks = [...(data.unarmed_attacks || [])];
    const savedEntry = { ...entry, to_hit: totals.attackTotal, damage_modifier: totals.damageModifier };
    if (existing) attacks[index] = savedEntry;
    else attacks.push(savedEntry);
    await saveCharacterData(character, { ...data, unarmed_attacks: attacks }, existing ? 'Colpo aggiornato' : 'Colpo aggiunto', onRender);
  } else {
    const mastery = result.has('mastery');
    const entry = { id: crypto.randomUUID(), name, ability, bonus, proficient: result.has('proficient') || mastery, mastery };
    await saveCharacterData(character, { ...data, special_skill_rolls: [...(data.special_skill_rolls || []), entry] }, 'Tiro speciale aggiunto', onRender);
  }
}

export async function openQuickAttackDetail(character, index, onRender) {
  const attack = character?.data?.unarmed_attacks?.[index];
  if (!attack) return;
  const totals = calculateUnarmedAttackBonuses(character.data || {}, attack);
  const content = document.createElement('section');
  content.className = 'power-detail-layout quick-attack-detail';
  content.innerHTML = `
    <div class="power-detail-hero">
      <span class="power-detail-hero__icon" aria-hidden="true">⚔</span>
      <div><span class="eyebrow">Attacco personalizzato</span><h3>${escapeHtml(attack.name || 'Colpo senz’arma')}</h3></div>
    </div>
    <dl class="power-detail-facts">
      <div><dt>Caratteristica</dt><dd>${String(attack.ability || 'str').toUpperCase()}</dd></div>
      <div><dt>Tiro per colpire</dt><dd>${totals.attackTotal >= 0 ? '+' : ''}${totals.attackTotal}</dd></div>
      <div><dt>Danni</dt><dd>${escapeHtml(attack.damage || '1')}${totals.damageModifier ? ` ${totals.damageModifier >= 0 ? '+' : ''}${totals.damageModifier}` : ''}</dd></div>
    </dl>`;
  const result = await openFormModal({
    title: attack.name || 'Attacco', content, submitLabel: 'Chiudi', cancelLabel: null, showFooter: false,
    cardClass: 'modal-card--power-detail',
    onOpen: ({ modal, formEl }) => {
      const actionInput = document.createElement('input');
      actionInput.type = 'hidden'; actionInput.name = 'quick_attack_action'; formEl.append(actionInput);
      const actions = modal.querySelector('[data-form-header-actions]');
      const edit = document.createElement('button');
      edit.type = 'button'; edit.className = 'resource-action-button resource-icon-button'; edit.title = 'Modifica'; edit.setAttribute('aria-label', 'Modifica attacco'); edit.textContent = '✏️';
      const remove = document.createElement('button');
      remove.type = 'button'; remove.className = 'resource-action-button resource-icon-button icon-button--danger'; remove.title = 'Elimina'; remove.setAttribute('aria-label', 'Elimina attacco'); remove.textContent = '🗑️';
      edit.addEventListener('click', () => { actionInput.value = 'edit'; formEl.requestSubmit(); });
      remove.addEventListener('click', () => { actionInput.value = 'delete'; formEl.requestSubmit(); });
      actions?.append(edit, remove);
      return () => { edit.remove(); remove.remove(); actionInput.remove(); };
    }
  });
  const action = result?.get('quick_attack_action');
  if (action === 'edit') {
    await openQuickRollEditor(character, 'attack', onRender, { index });
  } else if (action === 'delete') {
    const confirmed = await openConfirmModal({ title: 'Elimina attacco', message: `Eliminare “${attack.name || 'Colpo senz’arma'}”?`, confirmLabel: 'Elimina', cancelLabel: 'Annulla' });
    if (!confirmed) return;
    const data = character.data || {};
    const attacks = (data.unarmed_attacks || []).filter((_, attackIndex) => attackIndex !== index);
    await saveCharacterData(character, { ...data, unarmed_attacks: attacks }, 'Attacco eliminato', onRender);
  }
}
