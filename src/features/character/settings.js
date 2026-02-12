import { getState, normalizeCharacterId, setState } from '../../app/state.js';
import { supabase } from '../../lib/supabase.js';
import { createToast } from '../../ui/components.js';

export async function renderSettings(container) {
  const { characters, activeCharacterId } = getState();
  const normalizedActiveId = normalizeCharacterId(activeCharacterId);
  const active = characters.find((char) => normalizeCharacterId(char.id) === normalizedActiveId);
  if (!active) {
    container.innerHTML = '<section class="card"><p>Nessun personaggio selezionato.</p></section>';
    return;
  }

  const settings = {
    encumbrance: active.data?.settings?.encumbrance ?? 'standard',
    weight_unit: active.data?.settings?.weight_unit ?? 'lb',
    auto_usage_dice: active.data?.settings?.auto_usage_dice ?? true
  };

  container.innerHTML = `
    <section class="card">
      <h2>Impostazioni</h2>
      <form data-settings-form>
        <label class="field">
          <span>Modalità ingombro</span>
          <select name="encumbrance">
            <option value="standard">Standard</option>
            <option value="variant">Variant</option>
          </select>
        </label>
        <label class="field">
          <span>Mostra peso in</span>
          <select name="weight_unit">
            <option value="lb">Lb</option>
            <option value="kg">Kg</option>
          </select>
        </label>
        <label class="field">
          <span>Tira dadi automatico su Usa (abilità/risorse/incantesimi)</span>
          <span class="diceov-toggle">
            <input type="checkbox" name="auto_usage_dice" />
            <span class="diceov-toggle-track" aria-hidden="true"></span>
          </span>
        </label>
        <button class="primary" type="submit">Salva</button>
      </form>
    </section>
  `;

  const form = container.querySelector('[data-settings-form]');
  form.encumbrance.value = settings.encumbrance;
  form.weight_unit.value = settings.weight_unit;
  form.auto_usage_dice.checked = settings.auto_usage_dice;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const nextSettings = {
      encumbrance: formData.get('encumbrance'),
      weight_unit: formData.get('weight_unit'),
      auto_usage_dice: formData.has('auto_usage_dice')
    };

    try {
      const updatedData = { ...active.data, settings: nextSettings };
      const { data, error } = await supabase
        .from('characters')
        .update({ data: updatedData })
        .eq('id', active.id)
        .select('*')
        .single();
      if (error) throw error;
      const updated = characters.map((char) => (char.id === active.id ? data : char));
      setState({ characters: updated });
      createToast('Impostazioni salvate');
    } catch (error) {
      createToast('Errore salvataggio impostazioni', 'error');
    }
  });
}
