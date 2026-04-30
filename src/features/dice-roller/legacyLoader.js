let loadPromise = null;

const legacyScripts = [
  `${import.meta.env.BASE_URL}libs/three.min.js`,
  `${import.meta.env.BASE_URL}libs/cannon.min.js`,
  `${import.meta.env.BASE_URL}libs/teal.js`,
  `${import.meta.env.BASE_URL}dice-roller/dice.js`,
  `${import.meta.env.BASE_URL}dice-roller/main.js`
];

function appendScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-legacy-dice=\"${src}\"]`);
    if (existing?.dataset.loaded === 'true') return resolve();
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error(`Impossibile caricare ${src}`)), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.dataset.legacyDice = src;
    script.addEventListener('load', () => {
      script.dataset.loaded = 'true';
      resolve();
    }, { once: true });
    script.addEventListener('error', () => reject(new Error(`Impossibile caricare ${src}`)), { once: true });
    document.body.appendChild(script);
  });
}

export function ensureLegacyDiceAssets() {
  if (window.main && typeof window.main.init === 'function') return Promise.resolve();
  if (!loadPromise) {
    loadPromise = legacyScripts.reduce((chain, src) => chain.then(() => appendScript(src)), Promise.resolve());
  }
  return loadPromise;
}
