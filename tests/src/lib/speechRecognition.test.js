import { describe, expect, it, vi } from 'vitest';
import {
  appendSpeechTranscript,
  createSpeechRecognitionController,
  getSpeechRecognitionSupport
} from '../../../src/lib/speechRecognition.js';

function createEventTarget(properties = {}) {
  const listeners = new Map();
  return {
    ...properties,
    addEventListener(type, listener) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(listener);
    },
    removeEventListener(type, listener) {
      listeners.get(type)?.delete(listener);
    },
    emit(type) {
      listeners.get(type)?.forEach((listener) => listener());
    }
  };
}

function createRecognitionEnvironment({ ios = false } = {}) {
  class MockRecognition {
    static latest = null;

    constructor() {
      MockRecognition.latest = this;
      this.start = vi.fn();
      this.stop = vi.fn();
      this.abort = vi.fn();
    }
  }

  const documentRef = createEventTarget({ visibilityState: 'visible' });
  const windowRef = createEventTarget({
    isSecureContext: true,
    location: { protocol: 'https:', hostname: 'example.test' },
    navigator: ios
      ? { userAgent: 'Mozilla/5.0 (iPad)', platform: 'MacIntel', maxTouchPoints: 5 }
      : { userAgent: 'Mozilla/5.0 (Linux; Android 14)', platform: 'Linux', maxTouchPoints: 5 },
    webkitSpeechRecognition: MockRecognition,
    document: documentRef
  });

  return { MockRecognition, documentRef, windowRef };
}

describe('speechRecognition', () => {
  it('appends final text without replacing existing content', () => {
    const input = {
      value: 'Testo esistente.',
      setSelectionRange: vi.fn(),
      dispatchEvent: vi.fn()
    };

    const nextValue = appendSpeechTranscript(input, '  nuova nota  ');

    expect(nextValue).toBe('Testo esistente. nuova nota');
    expect(input.value).toBe(nextValue);
    expect(input.setSelectionRange).toHaveBeenCalledWith(nextValue.length, nextValue.length);
    expect(input.dispatchEvent).toHaveBeenCalledOnce();
  });

  it('uses the webkit fallback, it-IT and starts only after an explicit call', () => {
    const { MockRecognition, windowRef, documentRef } = createRecognitionEnvironment();
    const onTranscript = vi.fn();
    const statuses = [];
    const controller = createSpeechRecognitionController({
      windowRef,
      documentRef,
      onTranscript,
      onStatusChange: (status) => statuses.push(status)
    });
    const recognition = MockRecognition.latest;

    expect(recognition.start).not.toHaveBeenCalled();
    expect(recognition.lang).toBe('it-IT');
    expect(recognition.continuous).toBe(true);
    expect(controller.start()).toBe(true);
    expect(controller.start()).toBe(false);
    expect(recognition.start).toHaveBeenCalledOnce();

    recognition.onstart();
    expect(statuses.at(-1).message).toBe('Sto ascoltando…');

    const finalResult = [{ transcript: 'un indizio importante' }];
    finalResult.isFinal = true;
    recognition.onresult({ resultIndex: 0, results: [finalResult] });
    expect(onTranscript).toHaveBeenCalledWith('un indizio importante');

    expect(controller.toggle()).toBe(true);
    expect(recognition.stop).toHaveBeenCalledOnce();
    recognition.onend();
    expect(controller.getState()).toBe('idle');
  });

  it('does not append final results already emitted during the same session', () => {
    const { MockRecognition, windowRef, documentRef } = createRecognitionEnvironment();
    const onTranscript = vi.fn();
    const controller = createSpeechRecognitionController({
      windowRef,
      documentRef,
      onTranscript
    });
    const recognition = MockRecognition.latest;
    const firstFinalResult = [{ transcript: 'apri la porta' }];
    const repeatedFirstResult = [{ transcript: 'apri la porta' }];
    const secondFinalResult = [{ transcript: 'trovi una trappola' }];
    firstFinalResult.isFinal = true;
    repeatedFirstResult.isFinal = true;
    secondFinalResult.isFinal = true;

    controller.start();
    recognition.onstart();
    recognition.onresult({ resultIndex: 0, results: [firstFinalResult] });
    recognition.onresult({
      resultIndex: 0,
      results: [repeatedFirstResult, secondFinalResult]
    });

    expect(onTranscript).toHaveBeenCalledTimes(2);
    expect(onTranscript).toHaveBeenNthCalledWith(1, 'apri la porta');
    expect(onTranscript).toHaveBeenNthCalledWith(2, 'trovi una trappola');

    recognition.onend();
    controller.start();
    recognition.onresult({ resultIndex: 0, results: [repeatedFirstResult] });
    expect(onTranscript).toHaveBeenCalledTimes(3);
  });

  it('does not duplicate a final result that a tablet emits again at a new index', () => {
    const { MockRecognition, windowRef, documentRef } = createRecognitionEnvironment();
    const onTranscript = vi.fn();
    const controller = createSpeechRecognitionController({
      windowRef,
      documentRef,
      onTranscript
    });
    const recognition = MockRecognition.latest;
    const firstResult = [{ transcript: 'La porta si apre' }];
    const duplicatedResult = [{ transcript: 'la porta si apre.' }];
    firstResult.isFinal = true;
    duplicatedResult.isFinal = true;

    controller.start();
    recognition.onstart();
    recognition.onresult({ resultIndex: 0, results: [firstResult] });
    recognition.onresult({
      resultIndex: 1,
      results: [firstResult, duplicatedResult]
    });

    expect(onTranscript).toHaveBeenCalledOnce();
    expect(onTranscript).toHaveBeenCalledWith('La porta si apre');
  });

  it('appends only new words when a tablet emits cumulative final transcripts', () => {
    const { MockRecognition, windowRef, documentRef } = createRecognitionEnvironment();
    const onTranscript = vi.fn();
    const controller = createSpeechRecognitionController({
      windowRef,
      documentRef,
      onTranscript
    });
    const recognition = MockRecognition.latest;
    const firstResult = [{ transcript: 'Trovi una trappola' }];
    const cumulativeResult = [{ transcript: 'trovi una trappola sotto il tappeto' }];
    const overlappingResult = [{ transcript: 'sotto il tappeto rosso' }];
    firstResult.isFinal = true;
    cumulativeResult.isFinal = true;
    overlappingResult.isFinal = true;

    controller.start();
    recognition.onstart();
    recognition.onresult({ resultIndex: 0, results: [firstResult] });
    recognition.onresult({
      resultIndex: 1,
      results: [firstResult, cumulativeResult]
    });
    recognition.onresult({
      resultIndex: 2,
      results: [firstResult, cumulativeResult, overlappingResult]
    });

    expect(onTranscript).toHaveBeenCalledTimes(3);
    expect(onTranscript).toHaveBeenNthCalledWith(1, 'Trovi una trappola');
    expect(onTranscript).toHaveBeenNthCalledWith(2, 'sotto il tappeto');
    expect(onTranscript).toHaveBeenNthCalledWith(3, 'rosso');
  });

  it('uses a non-continuous session and a clear warning on iOS', () => {
    const { MockRecognition, windowRef, documentRef } = createRecognitionEnvironment({ ios: true });
    const statuses = [];

    createSpeechRecognitionController({
      windowRef,
      documentRef,
      onStatusChange: (status) => statuses.push(status)
    });

    expect(MockRecognition.latest.continuous).toBe(false);
    expect(statuses.at(-1).message).toContain('iPhone e iPad');
  });

  it.each([
    ['not-allowed', 'Permesso del microfono negato'],
    ['audio-capture', 'Nessun microfono o segnale audio disponibile'],
    ['no-speech', 'Non ho rilevato alcuna voce'],
    ['network', 'Errore di rete del riconoscimento vocale'],
    ['aborted', 'Ascolto interrotto']
  ])('reports the %s error without submitting anything', (error, expectedMessage) => {
    const { MockRecognition, windowRef, documentRef } = createRecognitionEnvironment();
    const statuses = [];
    const controller = createSpeechRecognitionController({
      windowRef,
      documentRef,
      onStatusChange: (status) => statuses.push(status)
    });

    controller.start();
    MockRecognition.latest.onerror({ error });

    expect(statuses.at(-1).message).toContain(expectedMessage);
  });

  it('reports unsupported and insecure environments with a manual fallback', () => {
    const unsupportedWindow = {
      isSecureContext: true,
      location: { protocol: 'https:', hostname: 'example.test' },
      navigator: {}
    };
    const insecureWindow = {
      isSecureContext: false,
      location: { protocol: 'http:', hostname: 'example.test' },
      navigator: {},
      SpeechRecognition: class {}
    };

    expect(getSpeechRecognitionSupport(unsupportedWindow)).toMatchObject({
      supported: false,
      reason: 'unsupported'
    });
    expect(getSpeechRecognitionSupport(insecureWindow)).toMatchObject({
      supported: false,
      reason: 'insecure'
    });
  });

  it('keeps manual input available if the native constructor fails', () => {
    const statuses = [];
    const windowRef = {
      isSecureContext: true,
      location: { protocol: 'https:', hostname: 'example.test' },
      navigator: {},
      SpeechRecognition: class {
        constructor() {
          throw new Error('Native engine unavailable');
        }
      }
    };

    const controller = createSpeechRecognitionController({
      windowRef,
      onStatusChange: (status) => statuses.push(status)
    });

    expect(controller.supported).toBe(false);
    expect(controller.start()).toBe(false);
    expect(statuses.at(-1)).toMatchObject({
      state: 'unavailable',
      supported: false
    });
    expect(statuses.at(-1).message).toContain('inserimento manuale');
  });

  it('aborts and releases recognition when the hash route changes', () => {
    const { MockRecognition, windowRef, documentRef } = createRecognitionEnvironment();
    const controller = createSpeechRecognitionController({ windowRef, documentRef });

    controller.start();
    MockRecognition.latest.onstart();
    windowRef.emit('hashchange');

    expect(MockRecognition.latest.abort).toHaveBeenCalledOnce();
    expect(controller.getState()).toBe('destroyed');
    expect(controller.start()).toBe(false);
  });
});
