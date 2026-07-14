const DEFAULT_MESSAGES = Object.freeze({
  idle: 'Tocca il microfono per dettare. Il testo resta modificabile.',
  idleIOS: 'Su iPhone e iPad la dettatura pu\u00f2 interrompersi prima del previsto. Puoi sempre continuare a scrivere manualmente.',
  starting: 'Avvio del microfono\u2026',
  listening: 'Sto ascoltando\u2026',
  stopping: 'Interruzione dell\u2019ascolto\u2026',
  ended: 'Ascolto terminato. Puoi modificare il testo o dettare ancora.',
  hidden: 'Ascolto interrotto perch\u00e9 la pagina non \u00e8 pi\u00f9 visibile.',
  unsupported: 'Inserimento vocale non supportato da questo browser. Puoi sempre scrivere la nota manualmente.',
  insecure: 'Il microfono richiede HTTPS o localhost. Puoi sempre scrivere la nota manualmente.',
  permission: 'Permesso del microfono negato. Abilitalo nelle impostazioni del browser oppure inserisci il testo manualmente.',
  noAudio: 'Nessun microfono o segnale audio disponibile. Controlla il dispositivo oppure inserisci il testo manualmente.',
  noSpeech: 'Non ho rilevato alcuna voce. Riprova o inserisci il testo manualmente.',
  network: 'Errore di rete del riconoscimento vocale. Controlla la connessione oppure inserisci il testo manualmente.',
  aborted: 'Ascolto interrotto. Puoi riprovare o inserire il testo manualmente.',
  language: 'La lingua italiana non \u00e8 disponibile per il riconoscimento vocale su questo browser.',
  generic: 'Impossibile usare il riconoscimento vocale. Puoi continuare con l\u2019inserimento manuale.'
});

function isLocalHostname(hostname = '') {
  return hostname === 'localhost'
    || hostname === '127.0.0.1'
    || hostname === '[::1]'
    || hostname.endsWith('.localhost');
}

function isSecureExecutionContext(windowRef) {
  if (typeof windowRef?.isSecureContext === 'boolean') {
    return windowRef.isSecureContext;
  }

  const { protocol = '', hostname = '' } = windowRef?.location ?? {};
  return protocol === 'https:' || (protocol === 'http:' && isLocalHostname(hostname));
}

function isIOSDevice(windowRef) {
  const navigatorRef = windowRef?.navigator;
  const userAgent = navigatorRef?.userAgent ?? '';
  return /iPad|iPhone|iPod/i.test(userAgent)
    || (navigatorRef?.platform === 'MacIntel' && navigatorRef?.maxTouchPoints > 1);
}

export function getSpeechRecognitionSupport(windowRef = globalThis.window) {
  const Recognition = windowRef?.SpeechRecognition || windowRef?.webkitSpeechRecognition;
  const secure = isSecureExecutionContext(windowRef);

  return {
    supported: Boolean(Recognition && secure),
    reason: secure ? (Recognition ? null : 'unsupported') : 'insecure',
    isIOS: isIOSDevice(windowRef),
    Recognition
  };
}

function getErrorMessage(errorCode, messages) {
  switch (errorCode) {
    case 'not-allowed':
    case 'service-not-allowed':
      return messages.permission;
    case 'audio-capture':
      return messages.noAudio;
    case 'no-speech':
      return messages.noSpeech;
    case 'network':
      return messages.network;
    case 'aborted':
      return messages.aborted;
    case 'language-not-supported':
      return messages.language;
    default:
      return messages.generic;
  }
}

export function appendSpeechTranscript(input, transcript) {
  if (!input) return '';

  const spokenText = String(transcript ?? '').trim();
  if (!spokenText) return input.value ?? '';

  const currentValue = String(input.value ?? '');
  const separator = currentValue && !/\s$/.test(currentValue) ? ' ' : '';
  const nextValue = `${currentValue}${separator}${spokenText}`;
  input.value = nextValue;

  if (typeof input.setSelectionRange === 'function') {
    input.setSelectionRange(nextValue.length, nextValue.length);
  }

  if (typeof input.dispatchEvent === 'function') {
    const EventConstructor = input.ownerDocument?.defaultView?.Event ?? globalThis.Event;
    if (typeof EventConstructor === 'function') {
      input.dispatchEvent(new EventConstructor('input', { bubbles: true }));
    }
  }

  return nextValue;
}

export function createSpeechRecognitionController({
  lang = 'it-IT',
  messages: customMessages = {},
  onTranscript = () => {},
  onStatusChange = () => {},
  windowRef = globalThis.window,
  documentRef = windowRef?.document
} = {}) {
  const messages = { ...DEFAULT_MESSAGES, ...customMessages };
  const support = getSpeechRecognitionSupport(windowRef);
  let available = support.supported;
  let recognition = null;
  let state = support.supported ? 'idle' : 'unavailable';
  let destroyed = false;
  let sessionActive = false;
  let stopRequested = false;
  let expectedAbort = false;
  let expectedAbortMessage = messages.ended;
  let lastErrorCode = null;

  const emitStatus = (nextState, message, errorCode = null) => {
    state = nextState;
    onStatusChange({
      state,
      message,
      errorCode,
      supported: available,
      isIOS: support.isIOS
    });
  };

  const initialMessage = support.reason === 'insecure'
    ? messages.insecure
    : support.reason === 'unsupported'
      ? messages.unsupported
      : support.isIOS
        ? messages.idleIOS
        : messages.idle;

  const start = () => {
    if (destroyed || !available || !recognition) return false;
    if (sessionActive || state === 'starting' || state === 'listening' || state === 'stopping') return false;

    stopRequested = false;
    expectedAbort = false;
    expectedAbortMessage = messages.ended;
    lastErrorCode = null;
    sessionActive = true;
    emitStatus('starting', messages.starting);

    try {
      recognition.start();
      return true;
    } catch (error) {
      sessionActive = false;
      emitStatus('error', messages.generic, error?.name ?? 'start-failed');
      return false;
    }
  };

  const stop = () => {
    if (destroyed || !recognition || (state !== 'starting' && state !== 'listening')) return false;

    stopRequested = true;
    emitStatus('stopping', messages.stopping);
    try {
      recognition.stop();
    } catch (error) {
      expectedAbort = true;
      expectedAbortMessage = messages.ended;
      try {
        recognition.abort();
      } catch (abortError) {
        emitStatus('idle', messages.ended);
      }
    }
    return true;
  };

  const abortForVisibilityChange = () => {
    if (!recognition || (state !== 'starting' && state !== 'listening' && state !== 'stopping')) return;
    expectedAbort = true;
    expectedAbortMessage = messages.hidden;
    stopRequested = true;
    try {
      recognition.abort();
    } catch (error) {
      // Il motore pu\u00f2 essere gi\u00e0 terminato mentre la pagina passa in background.
    }
    if (!destroyed) emitStatus('idle', messages.hidden);
  };

  function onVisibilityChange() {
    if (documentRef?.visibilityState === 'hidden') abortForVisibilityChange();
  }

  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    windowRef?.removeEventListener?.('hashchange', destroy);
    windowRef?.removeEventListener?.('pagehide', destroy);
    documentRef?.removeEventListener?.('visibilitychange', onVisibilityChange);

    if (recognition) {
      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      if (state === 'starting' || state === 'listening' || state === 'stopping') {
        try {
          recognition.abort();
        } catch (error) {
          // Nessuna azione: il riconoscimento era gi\u00e0 terminato.
        }
      }
    }
    recognition = null;
    sessionActive = false;
    state = 'destroyed';
  };

  const controller = {
    supported: available,
    isIOS: support.isIOS,
    start,
    stop,
    toggle() {
      return state === 'starting' || state === 'listening' ? stop() : start();
    },
    destroy,
    getState() {
      return state;
    }
  };

  if (!support.supported) {
    emitStatus('unavailable', initialMessage, support.reason);
    return controller;
  }

  try {
    recognition = new support.Recognition();
  } catch (error) {
    available = false;
    controller.supported = false;
    emitStatus('unavailable', messages.generic, error?.name ?? 'initialization-failed');
    return controller;
  }
  recognition.lang = lang;
  recognition.continuous = !support.isIOS;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    if (destroyed) return;
    if (stopRequested) {
      emitStatus('stopping', messages.stopping);
      try {
        recognition.stop();
      } catch (error) {
        expectedAbort = true;
        expectedAbortMessage = messages.ended;
        recognition.abort();
      }
      return;
    }
    emitStatus('listening', messages.listening);
  };

  recognition.onresult = (event) => {
    if (destroyed) return;
    let finalTranscript = '';
    const results = event.results ?? [];
    for (let index = event.resultIndex ?? 0; index < results.length; index += 1) {
      const result = results[index];
      if (result?.isFinal && result[0]?.transcript) {
        finalTranscript += result[0].transcript;
      }
    }
    if (finalTranscript.trim()) onTranscript(finalTranscript.trim());
  };

  recognition.onerror = (event) => {
    if (destroyed) return;
    const errorCode = event?.error ?? 'unknown';
    lastErrorCode = errorCode;
    if (errorCode === 'aborted' && expectedAbort) return;
    emitStatus('error', getErrorMessage(errorCode, messages), errorCode);
  };

  recognition.onend = () => {
    if (destroyed) return;
    const wasExpectedAbort = expectedAbort;
    const abortMessage = expectedAbortMessage;
    const errorCode = lastErrorCode;
    sessionActive = false;
    stopRequested = false;
    expectedAbort = false;
    expectedAbortMessage = messages.ended;
    lastErrorCode = null;

    if (errorCode && !(errorCode === 'aborted' && wasExpectedAbort)) return;
    emitStatus('idle', wasExpectedAbort ? abortMessage : messages.ended);
  };

  windowRef?.addEventListener?.('hashchange', destroy);
  windowRef?.addEventListener?.('pagehide', destroy);
  documentRef?.addEventListener?.('visibilitychange', onVisibilityChange);
  emitStatus('idle', initialMessage);

  return controller;
}
