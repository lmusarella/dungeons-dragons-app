import { createSharedSpell, searchSharedSpells } from '../character/spellbookApi.js';
import { buildInput, buildTextarea, createToast, openFormModal } from '../../ui/components.js';
import { getState } from '../../app/state.js';

export async function renderLibrary(container) {
  container.innerHTML = `
    <section class="auth-screen character-select-view">
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

  filters.appendChild(buildInput({ label: 'Nome', name: 'q', placeholder: 'Cerca incantesimo' }));
  filters.appendChild(buildInput({ label: 'Livello', name: 'level', type: 'number' }));
  filters.appendChild(buildInput({ label: 'Scuola', name: 'school', placeholder: 'Es. abiurazione' }));
  filters.appendChild(buildInput({ label: 'Classe', name: 'caster', placeholder: 'Es. mago' }));

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
      ? spells.map((spell) => `<article class="character-card"><div class="character-card-info"><h3>${spell.name}</h3><p class="muted">Lv ${spell.level} · ${spell.school || '-'} · ${(spell.caster_classes || []).join(', ') || '-'}</p></div></article>`).join('')
      : '<p>Nessun incantesimo trovato.</p>';
  };

  searchButton.addEventListener('click', () => { void renderSpells(); });
  container.querySelector('[data-library-add-spell]')?.addEventListener('click', async () => {
    const content = document.createElement('div');
    content.className = 'modal-form-grid';
    content.appendChild(buildInput({ label: 'Nome', name: 'name', placeholder: 'Es. Dardo Incantato' }));
    content.appendChild(buildInput({ label: 'Versione regole', name: 'rules_version', value: '2024' }));
    content.appendChild(buildInput({ label: 'Livello', name: 'level', type: 'number', value: '1' }));
    content.appendChild(buildInput({ label: 'Scuola', name: 'school' }));
    content.appendChild(buildInput({ label: 'Classi (csv)', name: 'caster_classes', placeholder: 'mago, warlock' }));
    content.appendChild(buildTextarea({ label: 'Descrizione', name: 'description' }));
    const formData = await openFormModal({ title: 'Nuovo incantesimo condiviso', submitLabel: 'Salva', content, cardClass: 'modal-card--form' });
    if (!formData) return;
    const { user } = getState();
    await createSharedSpell({
      created_by: user?.id,
      name: formData.get('name')?.toString().trim(),
      rules_version: formData.get('rules_version')?.toString().trim() || '2024',
      level: Number(formData.get('level') || 0),
      school: formData.get('school')?.toString().trim() || null,
      caster_classes: String(formData.get('caster_classes') || '').split(',').map((v) => v.trim().toLowerCase()).filter(Boolean),
      description: formData.get('description')?.toString().trim() || null
    });
    createToast('Incantesimo condiviso creato', 'success');
    void renderSpells();
  });

  await renderSpells();
}
