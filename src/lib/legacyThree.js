let threeLoadPromise = null;

function findExistingScript(src) {
  return Array.from(document.scripts)
    .find((script) => script.dataset.threeRuntime === src || script.dataset.legacyDice === src);
}

export function ensureLegacyThree() {
  if (window.THREE) return Promise.resolve(window.THREE);
  if (threeLoadPromise) return threeLoadPromise;

  const src = `${import.meta.env.BASE_URL}libs/three.min.js`;
  threeLoadPromise = new Promise((resolve, reject) => {
    const existing = findExistingScript(src);
    const onLoad = () => {
      if (window.THREE) {
        resolve(window.THREE);
      } else {
        reject(new Error('Three.js non disponibile dopo il caricamento'));
      }
    };
    const onError = () => reject(new Error('Impossibile caricare Three.js'));

    if (existing) {
      if (existing.dataset.loaded === 'true' || window.THREE) {
        onLoad();
        return;
      }
      existing.addEventListener('load', onLoad, { once: true });
      existing.addEventListener('error', onError, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.dataset.threeRuntime = src;
    // The dice roller recognizes this attribute and reuses the same runtime.
    script.dataset.legacyDice = src;
    script.addEventListener('load', () => {
      script.dataset.loaded = 'true';
      onLoad();
    }, { once: true });
    script.addEventListener('error', onError, { once: true });
    document.body.appendChild(script);
  });

  return threeLoadPromise;
}
