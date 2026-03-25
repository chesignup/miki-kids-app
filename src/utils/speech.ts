import { soundManager } from './sounds';

let voicesLoaded = false;

function loadVoices(): void {
  if (voicesLoaded) return;
  if (typeof speechSynthesis === 'undefined') return;

  try {
    speechSynthesis.getVoices();
    speechSynthesis.addEventListener('voiceschanged', () => {
      voicesLoaded = true;
    });
  } catch {
    // ignore
  }
}

loadVoices();

/** Speak arbitrary text in Hebrew; Web Audio click is fallback when TTS unavailable. */
export function speakWord(text: string, lang: string = 'he-IL'): void {
  if (!soundManager.enabled) return;
  soundManager.click();

  try {
    if (typeof speechSynthesis === 'undefined') return;

    speechSynthesis.cancel();

    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 0.88;
    u.pitch = 1.05;
    u.volume = 1;

    const voices = speechSynthesis.getVoices();
    const hebrewVoice = voices.find((v) => v.lang.startsWith('he'));
    if (hebrewVoice) {
      u.voice = hebrewVoice;
    }

    speechSynthesis.speak(u);
  } catch {
    // click already played
  }
}

export function speakNumber(num: number): void {
  const hebrewNumbers: Record<number, string> = {
    0: 'אפס',
    1: 'אחת',
    2: 'שתיים',
    3: 'שלוש',
    4: 'ארבע',
    5: 'חמש',
    6: 'שש',
    7: 'שבע',
    8: 'שמונה',
    9: 'תשע',
    10: 'עשר',
  };

  const text = hebrewNumbers[num] ?? String(num);
  speakWord(text);
}

export function speakInstruction(instruction: string): void {
  speakWord(instruction);
}

export function cancelSpeech(): void {
  try {
    if (typeof speechSynthesis !== 'undefined') {
      speechSynthesis.cancel();
    }
  } catch {
    // ignore
  }
}
