function toFiniteNumber(value, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

export function calcTotalWeight(items = []) {
  if (!Array.isArray(items)) return 0;
  return items.reduce((total, item) => {
    if (!item) return total;
    const qty = toFiniteNumber(item.qty);
    const weight = toFiniteNumber(item.weight);
    return total + qty * weight;
  }, 0);
}

export function applyMoneyDelta(wallet = {}, delta = {}) {
  const next = { ...wallet };
  Object.keys(delta).forEach((coin) => {
    next[coin] = toFiniteNumber(next[coin]) + toFiniteNumber(delta[coin]);
  });
  return next;
}
