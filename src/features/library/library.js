import { assignSharedSpellToCharacter, createSharedSpell, removeSharedSpellAndAssignments, searchSharedSpells } from '../character/spellbookApi.js';
import { attachNumberSteppers, buildInput, buildTextarea, createToast, openConfirmModal, openFormModal } from '../../ui/components.js';
import { getState } from '../../app/state.js';
import { saveCharacterData } from '../character/home/data.js';

const SPELL_SCHOOL_OPTIONS = ['', 'Abiurazione', 'Ammaliamento', 'Divinazione', 'Evocazione', 'Illusione', 'Invocazione', 'Necromanzia', 'Trasmutazione'];
const SPELL_CASTER_CLASS_OPTIONS = ['mago', 'warlock', 'stregone', 'chierico', 'druido', 'ranger', 'artefice', 'paladino', 'bardo'];

export async function renderLibrary(container) {
  container.innerHTML = `
    <section class="auth-screen character-select-view library-view">
      <div class="card character-select-card">
        <header class="character-select-header">
          <div>
            <p class="title-car-select">Archivio centralizzato</p>
            <p class="muted">Gestisci contenuti condivisi (incantesimi ora, oggetti in futuro).</p>
          </div>
          <button class="icon-button icon-button--add character-select-add" type="button" data-library-add-spell aria-label="Nuovo incantesimo">+</button>
        </header>
        <div class="modal-form-grid" data-library-filters></div>
        <div class="character-card-grid" data-library-spells></div>
      </div>
    </section>
  `;

  const filters = container.querySelector('[data-library-filters]');
  const list = container.querySelector('[data-library-spells]');
  if (!filters || !list) return;

  const filtersRow = document.createElement('div');
  filtersRow.className = 'modal-form-row modal-form-row--compact';
  filtersRow.appendChild(buildInput({ label: 'Nome', name: 'q', placeholder: 'Cerca incantesimo' }));
  filtersRow.appendChild(buildInput({ label: 'Livello', name: 'level', type: 'number' }));
  const schoolFilterField = document.createElement('label');
  schoolFilterField.className = 'field';
  schoolFilterField.innerHTML = '<span>Scuola</span>';
  const schoolFilterSelect = document.createElement('select');
  schoolFilterSelect.name = 'school';
  SPELL_SCHOOL_OPTIONS.forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value || 'Tutte';
    schoolFilterSelect.appendChild(option);
  });
  schoolFilterField.appendChild(schoolFilterSelect);
  filtersRow.appendChild(schoolFilterField);
  const classFilterField = document.createElement('label');
  classFilterField.className = 'field';
  classFilterField.innerHTML = '<span>Classe</span>';
  const classFilterSelect = document.createElement('select');
  classFilterSelect.name = 'caster';
  [{ value: '', label: 'Tutte' }, ...SPELL_CASTER_CLASS_OPTIONS.map((entry) => ({ value: entry, label: entry }))].forEach((entry) => {
    const option = document.createElement('option');
    option.value = entry.value;
    option.textContent = entry.label;
    classFilterSelect.appendChild(option);
  });
  classFilterField.appendChild(classFilterSelect);
  filtersRow.appendChild(classFilterField);
  filters.appendChild(filtersRow);

  const searchButton = document.createElement('button');
  searchButton.className = 'primary';
  searchButton.type = 'button';
  searchButton.textContent = 'Cerca';
  filters.appendChild(searchButton);

  const renderSpells = async () => {
    const query = filters.querySelector('input[name="q"]')?.value || '';
    const level = filters.querySelector('input[name="level"]')?.value || '';
    const school = filters.querySelector('input[name="school"]')?.value || '';
    const casterClass = filters.querySelector('input[name="caster"]')?.value || '';
    const result = await searchSharedSpells({ query, level, school, casterClasses: casterClass ? [casterClass] : [] });
    const spells = result.items || [];
    list.innerHTML = spells.length
      ? spells.map((spell) => `<article class="character-card"><div class="character-card-info"><h3>${spell.name}</h3><p class="muted">Lv ${spell.level} · ${spell.school || '-'} · ${(spell.caster_classes || []).join(', ') || '-'}</p><div class="button-row"><button class="icon-button" type="button" data-library-delete-spell="${spell.id}" aria-label="Elimina incantesimo">🗑️</button></div></div></article>`).join('')
      : '<p>Nessun incantesimo trovato.</p>';
    list.querySelectorAll('[data-library-delete-spell]').forEach((button) => button.addEventListener('click', async () => {
      const spellId = button.dataset.libraryDeleteSpell;
      if (!spellId) return;
      const spell = spells.find((entry) => entry.id === spellId);
      if (!spell) return;
      const ok = await openConfirmModal({
        title: 'Conferma eliminazione incantesimo',
        message: `Eliminare "${spell.name}" dal catalogo centralizzato e da tutte le associazioni personaggio?`,
        confirmLabel: 'Elimina'
      });
      if (!ok) return;
      await removeSharedSpellAndAssignments(spellId);
      const activeCharacterId = getState().activeCharacterId;
      const activeCharacter = getState().characters.find((char) => char.id === activeCharacterId);
      if (activeCharacter) {
        const currentSpells = Array.isArray(activeCharacter.data?.spells) ? activeCharacter.data.spells : [];
        const nextData = {
          ...(activeCharacter.data || {}),
          spells: currentSpells.filter((entry) => entry.shared_spell_id !== spellId)
        };
        await saveCharacterData(activeCharacter, nextData, 'Incantesimo rimosso dal personaggio');
      }
      createToast('Incantesimo centralizzato eliminato', 'success');
      await renderSpells();
    }));
  };

  searchButton.addEventListener('click', () => { void renderSpells(); });
  container.querySelector('[data-library-add-spell]')?.addEventListener('click', async () => {
    const content = document.createElement('div');
    content.className = 'modal-form-grid spell-form';
    const buildRow = (elements) => {
      const row = document.createElement('div');
      row.className = 'modal-form-row modal-form-row--compact';
      elements.filter(Boolean).forEach((entry) => row.appendChild(entry));
      return row;
    };
    const rulesField = document.createElement('label');
    rulesField.className = 'field';
    rulesField.innerHTML = '<span>Versione regole</span>';
    const rulesSelect = document.createElement('select');
    rulesSelect.name = 'rules_version';
    ['2024', '2014'].forEach((entry) => {
      const option = document.createElement('option');
      option.value = entry;
      option.textContent = entry;
      rulesSelect.appendChild(option);
    });
    rulesField.appendChild(rulesSelect);
    const levelField = buildInput({ label: 'Livello', name: 'level', type: 'number', value: '1' });
    const nameField = buildInput({ label: 'Nome incantesimo', name: 'name', placeholder: 'Es. Dardo Incantato' });
    content.appendChild(buildRow([nameField, rulesField, levelField]));
    const schoolField = document.createElement('label');
    schoolField.className = 'field';
    schoolField.innerHTML = '<span>Scuola</span>';
    const schoolSelect = document.createElement('select');
    schoolSelect.name = 'school';
    SPELL_SCHOOL_OPTIONS.forEach((value) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value || 'N/D';
      schoolSelect.appendChild(option);
    });
    schoolField.appendChild(schoolSelect);
    const castTimeField = buildInput({ label: 'Tipo di lancio', name: 'cast_time', placeholder: 'Es. Azione' });
    const durationField = buildInput({ label: 'Durata', name: 'duration', placeholder: 'Es. 1 minuto' });
    const rangeField = buildInput({ label: 'Range', name: 'range', placeholder: 'Es. 18 m' });
    const componentsField = buildInput({ label: 'Componenti', name: 'components', placeholder: 'Es. V,S,M' });
    content.appendChild(buildRow([schoolField, castTimeField, durationField]));
    content.appendChild(buildRow([rangeField, componentsField]));
    const classesField = document.createElement('div');
    classesField.className = 'field';
    classesField.innerHTML = `<span>Classi incantatrici</span><div class="tag-row">${SPELL_CASTER_CLASS_OPTIONS.map((entry) => `<label class="chip"><input type="checkbox" name="caster_classes" value="${entry}" /> ${entry}</label>`).join('')}</div>`;
    content.appendChild(classesField);
    content.appendChild(buildRow([
      buildInput({ label: 'Notazione danno', name: 'damage_die', placeholder: 'Es. 1d8' }),
      buildInput({ label: 'Mod. danno', name: 'damage_modifier', type: 'number' }),
      buildInput({ label: 'Danno upcast', name: 'upcast_damage_die', placeholder: 'Es. 1d8' }),
      buildInput({ label: 'Mod extra/slot', name: 'upcast_damage_modifier', type: 'number' }),
      buildInput({ label: 'Slot minimo upcast', name: 'upcast_start_level', type: 'number' }),
    ]));
    const toggles = document.createElement('div');
    toggles.className = 'modal-form-row modal-form-row--compact';
    toggles.innerHTML = `
      <div class="modal-toggle-field"><span class="modal-toggle-field__label">Concentrazione</span><label class="diceov-toggle condition-modal__toggle"><input type="checkbox" name="concentration" /><span class="diceov-toggle-track" aria-hidden="true"></span></label></div>
      <div class="modal-toggle-field"><span class="modal-toggle-field__label">Tiro per colpire</span><label class="diceov-toggle condition-modal__toggle"><input type="checkbox" name="attack_roll" /><span class="diceov-toggle-track" aria-hidden="true"></span></label></div>
      <div class="modal-toggle-field"><span class="modal-toggle-field__label">Rituale</span><label class="diceov-toggle condition-modal__toggle"><input type="checkbox" name="ritual" /><span class="diceov-toggle-track" aria-hidden="true"></span></label></div>
    `;
    content.appendChild(toggles);
    content.appendChild(buildInput({ label: 'Immagine URL', name: 'image_url', placeholder: 'https://.../spell.png' }));
    content.appendChild(buildTextarea({ label: 'Descrizione', name: 'description' }));
    attachNumberSteppers(content);
    const formData = await openFormModal({ title: 'Nuovo incantesimo condiviso', submitLabel: 'Salva', content, cardClass: 'modal-card--form' });
    if (!formData) return;
    const { user } = getState();
    const createdSpell = await createSharedSpell({
      created_by: user?.id,
      name: formData.get('name')?.toString().trim(),
      rules_version: formData.get('rules_version')?.toString().trim() || '2024',
      level: Number(formData.get('level') || 0),
      school: formData.get('school')?.toString().trim() || null,
      cast_time: formData.get('cast_time')?.toString().trim() || null,
      duration: formData.get('duration')?.toString().trim() || null,
      range: formData.get('range')?.toString().trim() || null,
      components: formData.get('components')?.toString().trim() || null,
      caster_classes: formData.getAll('caster_classes').map((v) => String(v).trim().toLowerCase()).filter(Boolean),
      damage_die: formData.get('damage_die')?.toString().trim() || null,
      damage_modifier: formData.get('damage_modifier') === '' ? null : Number(formData.get('damage_modifier')),
      upcast_damage_die: formData.get('upcast_damage_die')?.toString().trim() || null,
      upcast_damage_modifier: formData.get('upcast_damage_modifier') === '' ? null : Number(formData.get('upcast_damage_modifier')),
      upcast_start_level: formData.get('upcast_start_level') === '' ? null : Number(formData.get('upcast_start_level')),
      concentration: formData.has('concentration'),
      attack_roll: formData.has('attack_roll'),
      ritual: formData.has('ritual'),
      image_url: formData.get('image_url')?.toString().trim() || null,
      description: formData.get('description')?.toString().trim() || null
    });
    const activeCharacterId = getState().activeCharacterId;
    const activeCharacter = getState().characters.find((char) => char.id === activeCharacterId);
    if (activeCharacter?.data?.is_spellcaster) {
      const nextSpell = {
        id: `spell-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        shared_spell_id: createdSpell.id,
        name: createdSpell.name,
        level: createdSpell.level,
        kind: Number(createdSpell.level) === 0 ? 'cantrip' : 'spell',
        cast_time: createdSpell.cast_time || null,
        duration: createdSpell.duration || null,
        range: createdSpell.range || null,
        components: createdSpell.components || null,
        concentration: Boolean(createdSpell.concentration),
        attack_roll: Boolean(createdSpell.attack_roll),
        is_ritual: Boolean(createdSpell.ritual),
        damage_die: createdSpell.damage_die || null,
        damage_modifier: createdSpell.damage_modifier ?? null,
        upcast_damage_die: createdSpell.upcast_damage_die || null,
        upcast_damage_modifier: createdSpell.upcast_damage_modifier ?? null,
        upcast_start_level: createdSpell.upcast_start_level ?? null,
        description: createdSpell.description || null,
        school: createdSpell.school || null,
        caster_classes: createdSpell.caster_classes || [],
        rules_version: createdSpell.rules_version || '2024',
        prep_state: 'known'
      };
      const currentSpells = Array.isArray(activeCharacter.data?.spells) ? activeCharacter.data.spells : [];
      await saveCharacterData(activeCharacter, {
        ...(activeCharacter.data || {}),
        spells: [...currentSpells, nextSpell]
      }, 'Incantesimo aggiunto alla scheda personaggio');
      await assignSharedSpellToCharacter({
        user_id: activeCharacter.user_id,
        character_id: activeCharacter.id,
        shared_spell_id: createdSpell.id,
        prep_state: 'known'
      });
    }
    createToast('Incantesimo condiviso creato', 'success');
    void renderSpells();
  });

  await renderSpells();
}
