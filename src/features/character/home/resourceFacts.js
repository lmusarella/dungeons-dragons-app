import { escapeHtml } from '../../../lib/html.js';
export function buildResourceFacts(resource) {
  const recovery = { short_rest: 'Riposo breve', long_rest: 'Riposo lungo', daily: 'Ogni giorno', none: 'Nessun consumo' };
  const max = Math.max(0, Number(resource.max_uses) || 0);
  const remaining = Math.max(0, max - Math.max(0, Number(resource.used) || 0));
  const isPool = resource.resource_type === 'pool';
  const formatCharges = (value) => {
    const amount = Math.max(0, Number(value) || 0);
    if (!amount) return null;
    if (isPool && max) return `${Math.min(100, Math.round((amount / max) * 100))}%`;
    return `${amount} ${amount === 1 ? 'carica' : 'cariche'}`;
  };
  const savingThrowLabels = { str: 'Forza', dex: 'Destrezza', con: 'Costituzione', int: 'Intelligenza', wis: 'Saggezza', cha: 'Carisma' };
  const facts = [
    ['Attivazione',resource.cast_time],
    ['Disponibili',max ? remaining + ' / ' + max : null],
    ['Recupero',resource.reset_on ? (recovery[resource.reset_on] || resource.reset_on) : null],
    ['Tiro',resource.damage_dice_notation ? resource.damage_dice_notation + (Number(resource.damage_modifier) ? ' ' + (Number(resource.damage_modifier)>0 ? '+' : '') + Number(resource.damage_modifier) : '') : null],
    ['Tiro salvezza',savingThrowLabels[resource.saving_throw_ability] || null],
    ['Costo',resource.resource_cost_variable ? 'Variabile' : resource.parent_resource_id ? String(Math.max(1,Number(resource.resource_cost)||1)) : null],
    ['Recupero breve',formatCharges(resource.recovery_short)],
    ['Recupero lungo',formatCharges(resource.recovery_long)],
  ].filter(([,value]) => value !== null && value !== undefined && value !== '');
  if (!facts.length) return '';
  return '<dl class="power-detail-facts">' + facts.map(([label,value]) => '<div><dt>'+escapeHtml(label)+'</dt><dd>'+escapeHtml(value)+'</dd></div>').join('') + '</dl>';
}
