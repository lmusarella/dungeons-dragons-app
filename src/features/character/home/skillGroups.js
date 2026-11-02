const ABILITY_FILTER_OPTIONS = [
  ['str', 'FOR'], ['dex', 'DES'], ['con', 'COS'], ['int', 'INT'], ['wis', 'SAG'], ['cha', 'CAR']
];

function createProficiencyCard(proficiencyBonus) {
  const card = document.createElement('div');
  card.className = 'skill-filter-proficiency';
  card.innerHTML = `<small>Bonus competenza</small><strong>${proficiencyBonus}</strong>`;
  return card;
}

export function mergeSkillRolls(layout) {
  const skills = layout.querySelector('.home-feature-panel--skills');
  const special = layout.querySelector('.home-feature-panel--special-skills');
  if (!skills || !special) return;
  const standardContent = skills.querySelector('.home-scroll-body');
  const specialContent = special.querySelector('.home-scroll-body');
  if (!standardContent || !specialContent) return;
  const buildDivisionHeader = (title, description) => {
    const header = document.createElement('header');
    header.className = 'skill-roll-division__header';
    header.innerHTML = `<div><h3>${title}</h3><p>${description}</p></div>`;
    return header;
  };
  standardContent.id = 'skill-roll-group-standard';
  standardContent.classList.add('skill-roll-division', 'skill-roll-division--standard');
  standardContent.prepend(buildDivisionHeader('Abilità', 'Prove previste dalla scheda'));
  specialContent.id = 'skill-roll-group-special';
  specialContent.classList.add('skill-roll-division', 'skill-roll-division--special');
  specialContent.prepend(buildDivisionHeader('Tiri speciali', 'Prove personalizzate del personaggio'));
  skills.append(specialContent);
  special.remove();
}

export function installSkillRankFilters(root, proficiencyBonus = '', abilityModifiers = {}) {
  const cards = [...(root?.querySelectorAll('[data-skill-rank][data-skill-ability]') || [])];
  if (!root || !cards.length || root.querySelector('[data-skill-rank-filters]')) return;

  const filters = document.createElement('div');
  filters.className = 'skill-filter-toolbar';
  filters.dataset.skillRankFilters = '';
  filters.setAttribute('aria-label', 'Filtra i tiri abilità');
  const rankOptions = [
    ['proficiency', 'Competenza'],
    ['mastery', 'Maestria']
  ];
  let activeRank = '';
  let activeAbility = '';

  const applyFilter = () => {
    cards.forEach((card) => {
      const rankMatches = !activeRank || card.dataset.skillRank === activeRank;
      const abilityMatches = !activeAbility || card.dataset.skillAbility === activeAbility;
      card.classList.toggle('is-filtered-out', !rankMatches || !abilityMatches);
    });
    root.querySelectorAll('.skill-roll-division').forEach((division) => {
      const hasVisibleCards = [...division.querySelectorAll('[data-skill-rank]')]
        .some((card) => !card.classList.contains('is-filtered-out'));
      division.classList.toggle('is-filter-empty', !hasVisibleCards);
    });
    filters.querySelectorAll('[data-skill-filter]').forEach((button) => {
      const activeValue = button.dataset.skillFilterKind === 'rank' ? activeRank : activeAbility;
      const active = button.dataset.skillFilter === activeValue;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  };

  const buildFilterGroup = (label, kind, options) => {
    const group = document.createElement('div');
    group.className = `skill-filter-group skill-filter-group--${kind}`;
    const heading = document.createElement('span');
    heading.className = 'skill-filter-group__label';
    heading.textContent = label;
    group.appendChild(heading);
    const controls = document.createElement('div');
    controls.className = 'skill-filter-group__controls';
    options.forEach(([value, optionLabel]) => {
      const summary = kind === 'ability' ? (abilityModifiers[value] ?? '—') : '';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `skill-filter skill-filter--${kind} skill-filter--${value}`;
      button.dataset.skillFilter = value;
      button.dataset.skillFilterKind = kind;
      button.setAttribute('aria-pressed', 'false');
      button.innerHTML = kind === 'ability'
        ? `<span>${optionLabel}</span><small>${summary}</small>`
        : `<span>${optionLabel}</span>`;
      button.addEventListener('click', () => {
        if (kind === 'rank') activeRank = activeRank === value ? '' : value;
        else activeAbility = activeAbility === value ? '' : value;
        applyFilter();
      });
      controls.appendChild(button);
    });
    group.appendChild(controls);
    return group;
  };

  if (proficiencyBonus) filters.append(createProficiencyCard(proficiencyBonus));
  filters.append(buildFilterGroup('Caratteristica', 'ability', ABILITY_FILTER_OPTIONS));
  const generalModifier = root.querySelector('.roll-general-modifier');
  if (generalModifier) {
    generalModifier.classList.add('skill-filter-general');
    filters.append(generalModifier);
  }
  filters.append(buildFilterGroup('Grado', 'rank', rankOptions));
  root.prepend(filters);
  applyFilter();
}

export function installSavingThrowFilters(root, proficiencyBonus = '', abilityModifiers = {}) {
  const cards = [...(root?.querySelectorAll('[data-saving-throw-card]') || [])];
  if (!root || !cards.length || root.querySelector('[data-saving-throw-filters]')) return;
  let activeAbility = '';
  const filters = document.createElement('div');
  filters.className = 'skill-filter-toolbar saving-filter-toolbar';
  filters.dataset.savingThrowFilters = '';
  filters.setAttribute('aria-label', 'Filtra i tiri salvezza');
  if (proficiencyBonus) filters.append(createProficiencyCard(proficiencyBonus));
  const group = document.createElement('div');
  group.className = 'skill-filter-group skill-filter-group--ability';
  const heading = document.createElement('span');
  heading.className = 'skill-filter-group__label';
  heading.textContent = 'Caratteristica';
  const controls = document.createElement('div');
  controls.className = 'skill-filter-group__controls';
  ABILITY_FILTER_OPTIONS.forEach(([value, label]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `skill-filter skill-filter--ability skill-filter--${value}`;
    button.dataset.savingAbilityFilter = value;
    button.setAttribute('aria-pressed', 'false');
    button.innerHTML = `<span>${label}</span><small>${abilityModifiers[value] ?? '—'}</small>`;
    button.addEventListener('click', () => {
      activeAbility = activeAbility === value ? '' : value;
      cards.forEach((card) => card.classList.toggle('is-filtered-out', Boolean(activeAbility && card.dataset.savingThrowCard !== activeAbility)));
      controls.querySelectorAll('[data-saving-ability-filter]').forEach((control) => {
        const active = control.dataset.savingAbilityFilter === activeAbility;
        control.classList.toggle('is-active', active);
        control.setAttribute('aria-pressed', String(active));
      });
    });
    controls.append(button);
  });
  group.append(heading, controls);
  filters.append(group);
  const generalModifier = root.querySelector('.roll-general-modifier');
  if (generalModifier) {
    generalModifier.classList.add('skill-filter-general');
    filters.append(generalModifier);
  }
  root.prepend(filters);
}
