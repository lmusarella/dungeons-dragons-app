export function formatWeight(value, unit = 'lb') {
  if (value === null || value === undefined || value === '') return '-';
  const weight = Number(value);
  if (!Number.isFinite(weight)) return '-';
  return `${weight.toFixed(2).replace(/\.00$/, '')} ${unit}`;
}

export function formatCoin(value, label) {
  const amount = Number(value ?? 0);
  return `${Number.isFinite(amount) ? amount : 0} ${label}`;
}

export function formatWallet(wallet) {
  if (!wallet) return '-';
  const entries = ['pp', 'gp', 'sp', 'cp'];
  return entries
    .map((coin) => formatCoin(wallet[coin], coin))
    .join(' · ');
}
