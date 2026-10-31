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

export function calcItemWeight(item, items = [], visited = new Set()) {
  if (!item) return 0;
  const key = String(item.id ?? '');
  if (key && visited.has(key)) return 0;
  if (key) visited.add(key);
  const quantity = item.qty === null || item.qty === undefined ? 1 : Math.max(0, toFiniteNumber(item.qty));
  const ownWeight = quantity * Math.max(0, toFiniteNumber(item.weight));
  if (!key || !Array.isArray(items)) return ownWeight;
  return items
    .filter((entry) => entry && String(entry.container_item_id ?? '') === key)
    .reduce((total, child) => total + calcItemWeight(child, items, visited), ownWeight);
}

export function calcSelectionWeight(selectedItems = [], allItems = selectedItems) {
  if (!Array.isArray(selectedItems)) return 0;
  const visited = new Set();
  return selectedItems.reduce((total, item) => total + calcItemWeight(item, allItems, visited), 0);
}

export function applyMoneyDelta(wallet = {}, delta = {}) {
  const next = { ...wallet };
  Object.keys(delta).forEach((coin) => {
    next[coin] = toFiniteNumber(next[coin]) + toFiniteNumber(delta[coin]);
  });
  return next;
}
