export const COIN_KEYS = ['pp', 'gp', 'sp', 'cp'];
const VALUES = { cp: 1, sp: 10, gp: 100, pp: 1000 };
export function buildCoinMovement(wallet, coin, quantity, direction) {
  const amount = Number(quantity);
  if (!COIN_KEYS.includes(coin) || !['pay', 'receive'].includes(direction) || !Number.isSafeInteger(amount) || amount <= 0) throw new Error('Inserisci una quantità intera maggiore di zero.');
  if (direction === 'pay' && amount > Number(wallet?.[coin] || 0)) throw new Error('Monete insufficienti.');
  return Object.fromEntries(COIN_KEYS.map(key => [key, key === coin ? amount * (direction === 'pay' ? -1 : 1) : 0]));
}
export function buildCoinBundleMovement(wallet, amounts = {}, direction) {
  if (!['pay', 'receive'].includes(direction)) throw new Error('Operazione monete non valida.');
  const normalized = Object.fromEntries(COIN_KEYS.map((key) => {
    const amount = Number(amounts?.[key] || 0);
    if (!Number.isSafeInteger(amount) || amount < 0) throw new Error('Inserisci quantità intere e non negative.');
    if (direction === 'pay' && amount > Number(wallet?.[key] || 0)) throw new Error(`Monete ${key.toUpperCase()} insufficienti.`);
    return [key, amount];
  }));
  if (!COIN_KEYS.some((key) => normalized[key] > 0)) throw new Error('Inserisci almeno una quantità di monete.');
  const sign = direction === 'pay' ? -1 : 1;
  return Object.fromEntries(COIN_KEYS.map((key) => [key, normalized[key] ? normalized[key] * sign : 0]));
}
export function isCoinExchange(amount) {
  return COIN_KEYS.some(key => Number(amount?.[key]) < 0) && COIN_KEYS.some(key => Number(amount?.[key]) > 0);
}
export function buildCoinExchange(wallet, source, target, quantity) {
  const requested = Number(quantity);
  if (!COIN_KEYS.includes(source) || !COIN_KEYS.includes(target) || source === target) throw new Error('Scegli due monete diverse.');
  if (!Number.isSafeInteger(requested) || requested <= 0 || !Number.isSafeInteger(requested * VALUES[source])) throw new Error('Inserisci una quantità intera valida.');
  if (requested > Number(wallet?.[source] || 0)) throw new Error('Monete insufficienti.');
  const targetAmount = Math.floor(requested * VALUES[source] / VALUES[target]);
  const amount = targetAmount * VALUES[target] / VALUES[source];
  if (!amount) throw new Error('Importo troppo basso per il cambio.');
  return { amount, targetAmount, delta: Object.fromEntries(COIN_KEYS.map(key => [key, key === source ? -amount : key === target ? targetAmount : 0])) };
}
