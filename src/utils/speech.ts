import { soundManager } from './sounds';
import { ttsNumberFeminine } from './hebrewTtsText';

export type HebrewTtsStatus = 'loading' | 'ready' | 'unavailable';

type SpeechVoiceExt = SpeechSynthesisVoice & {
  localService?: boolean;
};

let cachedVoices: SpeechSynthesisVoice[] = [];
let cachedHebrewVoice: SpeechSynthesisVoice | null = null;
let hebrewTtsStatus: HebrewTtsStatus = 'loading';
let lastVoicesSnapshot = '';
const listeners = new Set<(s: HebrewTtsStatus) => void>();

function notifyStatus(): void {
  listeners.forEach((fn) => {
    try {
      fn(hebrewTtsStatus);
    } catch {
      /* ignore */
    }
  });
}

export function getHebrewTtsStatus(): HebrewTtsStatus {
  return hebrewTtsStatus;
}

export function subscribeHebrewTtsStatus(cb: (s: HebrewTtsStatus) => void): () => void {
  listeners.add(cb);
  cb(hebrewTtsStatus);
  return () => listeners.delete(cb);
}

export interface HebrewTtsDebugInfo {
  status: HebrewTtsStatus;
  selectedVoice: { name: string; lang: string; default: boolean; localService: boolean | undefined } | null;
  hebrewVoicesDetected: { name: string; lang: string; default: boolean; localService: boolean | undefined }[];
  allVoices: { name: string; lang: string; default: boolean; localService: boolean | undefined }[];
}

export function getHebrewTtsDebugInfo(): HebrewTtsDebugInfo {
  const mapV = (v: SpeechSynthesisVoice) => ({
    name: v.name,
    lang: v.lang,
    default: v.default,
    localService: (v as SpeechVoiceExt).localService
  });
  const he = cachedVoices.filter((v) => isHebrewLanguage(v.lang));
  return {
    status: hebrewTtsStatus,
    selectedVoice: cachedHebrewVoice
      ? mapV(cachedHebrewVoice)
      : null,
    hebrewVoicesDetected: he.map(mapV),
    allVoices: cachedVoices.map(mapV)
  };
}

function normalizeLang(lang: string): string {
  return lang.toLowerCase().replace(/_/g, '-');
}

function isHebrewLanguage(lang: string): boolean {
  const n = normalizeLang(lang);
  return (
    n === 'he-il' ||
    n === 'he' ||
    n.startsWith('he-') ||
    n === 'iw-il' ||
    n === 'iw' ||
    n.startsWith('iw-')
  );
}

/**
 * Prefer exact he-IL, then iw-IL, then other he-*, then he/iw.
 * Within a tier: localService, then default, then first.
 */
function selectBestHebrewVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const he = voices.filter((v) => isHebrewLanguage(v.lang));
  if (he.length === 0) return null;

  function score(v: SpeechSynthesisVoice): number {
    let s = 0;
    const ls = (v as SpeechVoiceExt).localService;
    if (ls === true) s += 100;
    if (v.default) s += 10;
    return s;
  }

  function pickBest(candidates: SpeechSynthesisVoice[]): SpeechSynthesisVoice {
    return [...candidates].sort((a, b) => score(b) - score(a))[0];
  }

  const heIL = he.filter((v) => normalizeLang(v.lang) === 'he-il');
  if (heIL.length) return pickBest(heIL);

  const iwIL = he.filter((v) => normalizeLang(v.lang) === 'iw-il');
  if (iwIL.length) return pickBest(iwIL);

  const hePrefix = he.filter((v) => {
    const n = normalizeLang(v.lang);
    return n.startsWith('he-') && n !== 'he-il';
  });
  if (hePrefix.length) return pickBest(hePrefix);

  const iwPrefix = he.filter((v) => {
    const n = normalizeLang(v.lang);
    return n.startsWith('iw-') && n !== 'iw-il';
  });
  if (iwPrefix.length) return pickBest(iwPrefix);

  const bare = he.filter((v) => {
    const n = normalizeLang(v.lang);
    return n === 'he' || n === 'iw';
  });
  if (bare.length) return pickBest(bare);

  return pickBest(he);
}

function logAllVoices(voices: SpeechSynthesisVoice[]): void {
  console.group('[Hebrew TTS] speechSynthesis.getVoices() — all voices');
  for (const v of voices) {
    const ext = v as SpeechVoiceExt;
    console.log(
      `[Hebrew TTS] name="${v.name}" lang="${v.lang}" default=${v.default} localService=${ext.localService}`
    );
  }
  console.groupEnd();
}

function logHebrewVoices(voices: SpeechSynthesisVoice[]): void {
  const he = voices.filter((v) => isHebrewLanguage(v.lang));
  console.group(`[Hebrew TTS] Hebrew / he-IL voices (${he.length})`);
  for (const v of he) {
    const ext = v as SpeechVoiceExt;
    console.log(
      `[Hebrew TTS] name="${v.name}" lang="${v.lang}" default=${v.default} localService=${ext.localService}`
    );
  }
  console.groupEnd();
}

/** Refresh cache from getVoices(), select Hebrew voice, update status. Call after voices load. */
export function refreshHebrewVoices(): void {
  if (typeof speechSynthesis === 'undefined') {
    hebrewTtsStatus = 'unavailable';
    cachedHebrewVoice = null;
    cachedVoices = [];
    console.warn('[Hebrew TTS] speechSynthesis not available');
    notifyStatus();
    return;
  }

  const voices = speechSynthesis.getVoices();
  cachedVoices = voices;

  if (voices.length === 0) {
    hebrewTtsStatus = 'loading';
    cachedHebrewVoice = null;
    console.warn('[Hebrew TTS] Voice list empty — waiting for voiceschanged');
    notifyStatus();
    return;
  }

  const snapshot = voices.map((v) => `${v.name}\0${v.lang}`).join('|');
  if (snapshot !== lastVoicesSnapshot) {
    lastVoicesSnapshot = snapshot;
    logAllVoices(voices);
    logHebrewVoices(voices);
  }

  const selected = selectBestHebrewVoice(voices);
  cachedHebrewVoice = selected;

  if (selected) {
    hebrewTtsStatus = 'ready';
    console.log(
      `[Hebrew TTS] Selected voice: name="${selected.name}" lang="${selected.lang}" default=${selected.default} localService=${(selected as SpeechVoiceExt).localService}`
    );
  } else {
    hebrewTtsStatus = 'unavailable';
    console.warn('[Hebrew TTS] No Hebrew voice found — will not speak (no English/transliteration fallback)');
    cachedHebrewVoice = null;
  }
  notifyStatus();
}

let initDone = false;
let loadTimeoutId: ReturnType<typeof setTimeout> | null = null;

function initSpeechVoices(): void {
  if (initDone || typeof speechSynthesis === 'undefined') return;
  initDone = true;

  const onVoices = () => {
    refreshHebrewVoices();
    if (loadTimeoutId) {
      clearTimeout(loadTimeoutId);
      loadTimeoutId = null;
    }
  };

  speechSynthesis.addEventListener('voiceschanged', onVoices);
  refreshHebrewVoices();

  loadTimeoutId = setTimeout(() => {
    loadTimeoutId = null;
    if (hebrewTtsStatus === 'loading') {
      refreshHebrewVoices();
      if (hebrewTtsStatus === 'loading') {
        hebrewTtsStatus = 'unavailable';
        cachedHebrewVoice = null;
        console.warn('[Hebrew TTS] Timed out waiting for voices — Hebrew TTS voice unavailable');
        notifyStatus();
      }
    }
  }, 5000);
}

initSpeechVoices();

function attachUtteranceDebug(u: SpeechSynthesisUtterance, label: string): void {
  u.onstart = () => console.log(`[Hebrew TTS] onstart (${label}):`, u.text);
  u.onend = () => console.log(`[Hebrew TTS] onend (${label})`);
  u.onerror = (ev) => console.warn(`[Hebrew TTS] onerror (${label}):`, ev);
}

function buildUtterance(
  text: string,
  voice: SpeechSynthesisVoice,
  rate: number,
  pitch: number,
  label: string
): SpeechSynthesisUtterance {
  const u = new SpeechSynthesisUtterance(text);
  u.voice = voice;
  u.lang = voice.lang || 'he-IL';
  u.rate = rate;
  u.pitch = pitch;
  u.volume = 1;
  attachUtteranceDebug(u, label);
  return u;
}

/**
 * Single entry for Hebrew speech. Uses explicit Hebrew voice only — never utterance.lang alone.
 * Returns true if speech was queued, false if Hebrew voice unavailable.
 */
export function speakHebrew(
  text: string,
  options?: { rate?: number; pitch?: number; skipClick?: boolean; label?: string }
): boolean {
  const rate = options?.rate ?? 0.85;
  const pitch = options?.pitch ?? 1.1;
  const skipClick = options?.skipClick === true;
  const label = options?.label ?? 'speakHebrew';

  if (!skipClick) {
    soundManager.click();
  }

  if (!soundManager.enabled) {
    return false;
  }

  if (typeof speechSynthesis === 'undefined') {
    console.warn('[Hebrew TTS] speechSynthesis missing — not speaking');
    return false;
  }

  refreshHebrewVoices();

  const voice = cachedHebrewVoice;
  if (!voice || hebrewTtsStatus !== 'ready') {
    console.warn('[Hebrew TTS] Hebrew TTS voice unavailable — not speaking:', text);
    return false;
  }

  try {
    speechSynthesis.cancel();
    const u = buildUtterance(text, voice, rate, pitch, label);
    console.log(`[Hebrew TTS] Queuing utterance text=`, u.text, `voice=`, voice.name);
    speechSynthesis.speak(u);
    return true;
  } catch (e) {
    console.warn('[Hebrew TTS] speak error:', e);
    return false;
  }
}

/**
 * Queue multiple short Hebrew phrases with the same voice (after cancel).
 * Returns true if at least one chunk was queued.
 */
export function speakHebrewSequence(
  parts: string[],
  options?: { rate?: number; pitch?: number; clickOnce?: boolean; label?: string }
): boolean {
  const rate = options?.rate ?? 0.8;
  const pitch = options?.pitch ?? 1.05;
  const clickOnce = options?.clickOnce !== false;
  const label = options?.label ?? 'sequence';

  if (clickOnce) {
    soundManager.click();
  }

  if (!soundManager.enabled) {
    return false;
  }

  if (typeof speechSynthesis === 'undefined') {
    return false;
  }

  refreshHebrewVoices();

  const voice = cachedHebrewVoice;
  if (!voice || hebrewTtsStatus !== 'ready') {
    console.warn('[Hebrew TTS] Hebrew TTS voice unavailable — not speaking sequence:', parts);
    return false;
  }

  const trimmed = parts.map((p) => p.trim()).filter(Boolean);
  if (trimmed.length === 0) return false;

  try {
    speechSynthesis.cancel();
    trimmed.forEach((text, i) => {
      const u = buildUtterance(text, voice, rate, pitch, `${label}[${i}]`);
      console.log(`[Hebrew TTS] Queue part ${i}:`, text);
      speechSynthesis.speak(u);
    });
    return true;
  } catch (e) {
    console.warn('[Hebrew TTS] sequence error:', e);
    return false;
  }
}

/** @deprecated Use speakHebrew */
export function speak(text: string, _lang: string = 'he-IL'): boolean {
  return speakHebrew(text, { rate: 0.85, pitch: 1.1, skipClick: false });
}

/** Backward-compatible alias */
export const speakSequence = speakHebrewSequence;

export function speakNumber(num: number): boolean {
  const text = ttsNumberFeminine(num);
  return speakHebrew(text, { rate: 0.85, pitch: 1.1, label: 'number' });
}

export function speakInstruction(instruction: string): boolean {
  return speakHebrew(instruction, { label: 'instruction' });
}

export function cancelSpeech(): void {
  try {
    if (typeof speechSynthesis !== 'undefined') {
      speechSynthesis.cancel();
    }
  } catch {
    /* ignore */
  }
}

export function isHebrewVoiceAvailable(): boolean {
  return hebrewTtsStatus === 'ready';
}
