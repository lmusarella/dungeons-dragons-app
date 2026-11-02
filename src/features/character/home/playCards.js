function textElement(tag, className, value) {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = value;
  return element;
}
function action(button, label, primary = false) {
  if (!button) return null;
  button.className = 'play-card__button' + (primary ? ' play-card__button--primary' : '');
  button.replaceChildren(document.createTextNode(label));
  return button;
}

function actionWithValue(button, label, value, primary = false) {
  if (!button) return null;
  button.className = 'play-card__button play-card__button--with-value' + (primary ? ' play-card__button--primary' : '');
  button.replaceChildren(textElement('span', 'play-card__button-label', label));
  if (value) button.append(textElement('strong', 'play-card__button-value', value));
  return button;
}

function appendDamageTypeLabel(button, damageType) {
  if (!button || !damageType) return button;
  button.append(textElement('small', 'play-card__button-damage-type', damageType));
  button.setAttribute('aria-label', `${button.getAttribute('aria-label') || button.textContent.trim()} · danno ${damageType}`);
  return button;
}

const savingThrowShortLabels = { str: 'FOR', dex: 'DES', con: 'COS', int: 'INT', wis: 'SAG', cha: 'CAR' };

function savingThrowInfo(ability) {
  const value = savingThrowShortLabels[ability];
  if (!value) return null;
  const info = document.createElement('span');
  info.className = 'play-card__saving-throw';
  info.setAttribute('aria-label', `Tiro salvezza ${value}`);
  info.append(textElement('small', 'play-card__saving-throw-label', 'TS'), textElement('strong', 'play-card__saving-throw-value', value));
  return info;
}

function weaponFact(label, value) {
  if (!value) return null;
  const fact = document.createElement('span');
  fact.className = 'play-card__weapon-fact';
  fact.append(textElement('small', 'play-card__weapon-fact-label', label), textElement('strong', 'play-card__weapon-fact-value', value));
  return fact;
}

function detailSurface(header, content, { spellId, itemId, customAttackIndex, label } = {}) {
  if (!spellId && !itemId && customAttackIndex === undefined) return null;
  const surface = document.createElement('button');
  surface.type = 'button';
  surface.className = 'play-card__surface';
  if (spellId) surface.dataset.spellQuickOpen = spellId;
  if (itemId) surface.dataset.itemPreview = itemId;
  if (customAttackIndex !== undefined) surface.dataset.customAttackPreview = customAttackIndex;
  surface.setAttribute('aria-label', label);
  surface.append(header, content);
  return surface;
}

export function buildPlayCards(dialog) {
  dialog.querySelectorAll('.catalog-pages .catalog-game-card').forEach(card => {
    const isResource = card.hasAttribute('data-resource-card');
    const isSpell = card.classList.contains('spell-prepared-list__card');
    const name = card.querySelector('.attack-card__name, .spell-prepared-list__name')?.textContent.trim() || 'Attacco';
    const itemImage = card.querySelector('[data-attack-item-image]');
    const badges = [...card.querySelectorAll('.resource-chip--floating')].map(entry => entry.textContent.trim());
    const footer = document.createElement('div');
    footer.className = 'play-card__footer';
    const header = document.createElement('div');
    header.className = 'play-card__header';
    const eyebrow = badges.join(' · ') || (isResource ? 'Capacità' : isSpell ? 'Incantesimo' : card.dataset.attackRange === 'ranged' ? 'Distanza' : 'Mischia');
    header.append(textElement('span', 'play-card__eyebrow', eyebrow), textElement('h3', 'play-card__title', name));
    const content = document.createElement('div');
    content.className = 'play-card__content';
    if (isResource) {
      const count = card.querySelector('.resource-charge-count')?.textContent.trim()
        || card.querySelector('.resource-pool__value')?.textContent.trim();
      const pool = card.querySelector('.resource-pool');
      const dots = card.querySelector('.resource-charges');
      const options = card.querySelector('.resource-child-count')?.textContent.trim();
      const use = card.querySelector('[data-use-resource]');
      const dice = card.querySelector('[data-roll-resource]');
      const isAlwaysActive = !use;
      const description = card.querySelector('.resource-card__description')?.textContent.trim();
      const recovery = card.querySelector('[data-resource-recovery]');
      const savingThrow = savingThrowInfo(card.dataset.resourceSavingThrow);
      const damageType = card.dataset.resourceDamageType;
      const castTime = badges.find(label => ['Azione', 'Azione Bonus', 'Reazione', 'Azione Gratuita', 'Durata'].includes(label));
      const exhausted = Boolean(use?.disabled && count);
      const status = document.createElement('div');
      status.className = 'play-card__availability';
      let poolLine = null;
      if (count && !pool) {
        status.append(textElement('strong', 'play-card__count', count));
        status.setAttribute('aria-label', count + (pool ? ' punti disponibili' : ' utilizzi disponibili'));
        status.prepend(textElement('span', 'play-card__caption', pool ? 'Pool' : 'Utilizzi'));
        content.append(status);
      }
      if (dots) {
        const indicators = document.createElement('span');
        indicators.className = 'play-card__charges';
        [...dots.children].forEach(dot => {
          const indicator = document.createElement('i');
          indicator.className = dot.classList.contains('charge-indicator--used') ? '' : 'is-available';
          indicators.append(indicator);
        });
        content.append(indicators);
      }
      if (pool) {
        const progress = pool.querySelector('.resource-pool__track')?.cloneNode(true);
        const percent = pool.querySelector('.resource-pool__label small')?.textContent.trim();
        if (progress) {
          const poolProgress = document.createElement('div');
          poolProgress.className = 'play-card__pool-progress';
          poolProgress.append(progress);
          if (percent) poolProgress.append(textElement('strong', 'play-card__pool-percent', percent));
          poolLine = document.createElement('div');
          poolLine.className = 'play-card__pool-line';
          poolLine.append(poolProgress);
          content.append(poolLine);
        }
      }

      if (options) content.append(textElement('span', 'play-card__options', options));
      if (castTime) {
        header.append(textElement('span', 'play-card__timing', castTime));
      }
      if (recovery && !isAlwaysActive) {
        const recoveryLabel = textElement('span', `play-card__recovery play-card__recovery--${recovery.dataset.resourceRecovery || 'other'}`, recovery.textContent.trim());
        recoveryLabel.prepend(textElement('span', 'play-card__recovery-icon', '↻'));
        if (poolLine) poolLine.append(recoveryLabel);
        else content.append(recoveryLabel);
      }
      card.dataset.resourceAction = castTime || '';
      card.dataset.resourceKind = isAlwaysActive ? 'always' : 'consumable';
      if (!isAlwaysActive) {
        const title = header.querySelector('.play-card__title');
        const titleButton = textElement('button', 'play-card__title play-card__title--link', name);
        titleButton.type = 'button';
        titleButton.setAttribute('aria-label', 'Dettagli di ' + name);
        titleButton.addEventListener('click', event => { event.stopPropagation(); card.click(); });
        title.replaceWith(titleButton);
      }
      if (dice && !options) {
        const diceAction = action(dice, dice.dataset.diceNotation || dice.textContent.trim());
        diceAction.classList.add('play-card__button--damage');
        appendDamageTypeLabel(diceAction, damageType);
        footer.append(diceAction);
      }
      if (savingThrow) footer.append(savingThrow);
      if (use) {
        const useAction = action(use, exhausted ? 'Esaurita' : options ? 'Scegli opzione' : use.textContent.trim(), true);
        useAction.classList.add('play-card__button--use');
        footer.append(useAction);
      }
      card.className = 'play-card play-card--resource' + (exhausted ? ' is-exhausted' : '');
      header.querySelector('.play-card__eyebrow')?.remove();
      if (isAlwaysActive) {
        card.classList.add('play-card--always');
        header.querySelector('.play-card__eyebrow')?.remove();
        content.replaceChildren(textElement('p', 'play-card__description', description || 'Nessuna descrizione disponibile.'));
      }
    } else if (isSpell) {
      card.dataset.resourceAction = badges.find(label => ['Azione','Azione Bonus','Reazione','Azione Gratuita'].includes(label)) || '';
      const spellLevel = card.querySelector('.spell-card__sigil')?.textContent.trim();
      header.querySelector('.play-card__eyebrow').textContent = (spellLevel && spellLevel !== '✦' ? spellLevel + ' livello' : 'Trucchetto') + (badges.includes('C') ? ' · Concentrazione' : '') + (badges.includes('R') ? ' · Rituale' : '');
      const preparationState = card.dataset.spellPreparationState || 'always';
      const preparationLabel = card.dataset.spellPreparationLabel || 'Sempre conosciuto';
      header.append(textElement('span', `play-card__spell-state play-card__spell-state--${preparationState}`, preparationLabel));
      const facts = card.querySelector('.catalog-spell-facts');
      if (facts) {
        facts.className = 'play-card__facts';

        content.append(facts);
      }
      const detail = card.querySelector('[data-spell-quick-open]');
      const use = card.querySelector('[data-use-spell]');
      const damage = card.querySelector('[data-roll-damage]');
      const hit = card.querySelector('[data-roll-attack]');
      const savingThrow = savingThrowInfo(card.dataset.spellSavingThrow);
      const spellDamageType = card.dataset.spellDamageType;
      if (hit) footer.append(actionWithValue(hit, 'Tiro per colpire', hit.dataset.attackModifier, true));
      if (damage) {
        const damageAction = action(damage, damage.dataset.damageNotation || 'Danni');
        damageAction.classList.add('play-card__button--damage');
        appendDamageTypeLabel(damageAction, spellDamageType);
        footer.append(damageAction);
      }
      if (savingThrow) footer.append(savingThrow);
      if (use) {
        const launch = action(use, 'Lancia');
        launch.classList.add('play-card__button--launch');
        footer.append(launch);
      }
      card.className = 'play-card play-card--spell';
      card._detailSurface = detailSurface(header, content, {
        spellId: detail?.dataset.spellQuickOpen,
        label: `Apri la scheda di ${name}`
      });
    } else {
      const rollAttack = card.dataset.rollAttack;
      const attackRange = card.dataset.attackRange;
      const origin = card.dataset.attackOrigin || 'Attacco';
      const magicLabel = card.dataset.attackMagic === 'true' ? 'Magico' : 'Non magico';
      const damageType = card.dataset.attackDamageType;
      const rangeLabel = card.dataset.attackRangeLabel;
      const ammoLabel = card.dataset.attackAmmoLabel;
      const ammoValue = card.dataset.attackAmmoValue;
      const gripLabel = card.dataset.attackGripLabel;
      const bonus = card.querySelector('.attack-card__sigil strong')?.textContent || '—';
      const damageText = card.querySelector('.attack-card__damage')?.textContent.replace(/^\s*Danni\s*/i, '').trim() || '—';
      const damage = card.querySelector('[data-roll-damage]');
      const isHybrid = attackRange === 'hybrid';
      const appendHitAction = (range, value, label = 'Tiro per colpire') => {
        const hit = textElement('button', 'play-card__button', '');
        hit.type = 'button';
        hit.dataset.rollAttack = rollAttack;
        if (range) hit.dataset.attackRange = range;
        hit.setAttribute('aria-label', `${label} con ${name}`);
        footer.append(actionWithValue(hit, label, value, true));
      };
      if (rollAttack && isHybrid) {
        appendHitAction('melee', card.dataset.attackMeleeBonus || bonus);
      } else if (rollAttack) {
        appendHitAction(attackRange, bonus);
      }
      if (damage) {
        const damageActions = document.createElement('span');
        damageActions.className = 'play-card__damage-actions';
        const appendDamageAction = (source, range, value, label = '') => {
          if (range) source.dataset.attackRange = range;
          source.className = 'play-card__button play-card__button--damage';
          source.replaceChildren(document.createTextNode(value || 'Danni'));
          if (label) source.setAttribute('aria-label', `${label}: ${value}`);
          damageActions.append(source);
        };
        if (isHybrid) {
          const meleeDamage = card.dataset.attackMeleeDamage || damageText;
          appendDamageAction(damage, 'melee', meleeDamage, `Danni in mischia con ${name}`);
        } else {
          appendDamageAction(damage, attackRange, damageText, `Danni con ${name}`);
        }
        footer.append(damageActions);
      }
      card.className = 'play-card play-card--attack';
      const eyebrow = header.querySelector('.play-card__eyebrow');
      eyebrow.textContent = `${isHybrid ? 'Ibrida' : attackRange === 'ranged' ? 'Distanza' : 'Mischia'} · ${origin}`;
      const metadata = document.createElement('div');
      metadata.className = 'play-card__metadata play-card__metadata--heading';
      eyebrow.replaceWith(metadata);
      metadata.append(eyebrow);
      if (damageType) metadata.append(textElement('span', 'play-card__damage-type', damageType));
      header.append(textElement('span', 'play-card__trait play-card__trait--corner ' + (magicLabel === 'Magico' ? 'is-magic' : ''), magicLabel));
      const weaponFacts = [
        weaponFact('Gittata', rangeLabel),
        weaponFact(ammoLabel, ammoValue),
        weaponFact('Impugnatura', gripLabel)
      ].filter(Boolean);
      if (weaponFacts.length) {
        const facts = document.createElement('div');
        facts.className = 'play-card__weapon-facts';
        facts.append(...weaponFacts);
        content.append(facts);
      }
      card._detailSurface = detailSurface(header, content, {
        itemId: card.dataset.attackItemId,
        customAttackIndex: card.dataset.customAttackIndex,
        label: `Apri la scheda di ${name}`
      });
      delete card.dataset.rollAttack;
    }
    if (itemImage) { header.classList.add('play-card__header--image'); header.prepend(itemImage); }
    card.replaceChildren(card._detailSurface || header, ...(card._detailSurface ? [] : [content]));
    delete card._detailSurface;
    if (footer.children.length) {
      footer.addEventListener('click', (event) => event.stopPropagation());
      card.append(footer);
    }
  });
}
