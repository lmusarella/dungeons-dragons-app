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

export function installSkillRankFilters(root) {
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
  const abilityOptions = [
    ['str', 'FOR'],
    ['dex', 'DES'],
    ['con', 'COS'],
    ['int', 'INT'],
    ['wis', 'SAG'],
    ['cha', 'CAR']
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
      const count = cards.filter((card) => card.dataset[kind === 'rank' ? 'skillRank' : 'skillAbility'] === value).length;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `skill-filter skill-filter--${kind} skill-filter--${value}`;
      button.dataset.skillFilter = value;
      button.dataset.skillFilterKind = kind;
      button.setAttribute('aria-pressed', 'false');
      button.innerHTML = `<span>${optionLabel}</span><small>${count}</small>`;
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

  filters.append(
    buildFilterGroup('Grado', 'rank', rankOptions),
    buildFilterGroup('Caratteristica', 'ability', abilityOptions)
  );
  root.prepend(filters);
  applyFilter();
}
