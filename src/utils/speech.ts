import { soundManager } from './sounds';

// TTS is disabled because Android WebView doesn't have proper Hebrew voice support.
// The app will use sound effects only until proper Hebrew audio files are added.
// To enable TTS in the future, set this to true and implement proper voice detection.
const TTS_ENABLED = false;

export function speak(text: string, _lang: string = 'he-IL'): void {
  // Always play a sound for feedback
  soundManager.click();
  
  if (!soundManager.enabled) return;
  
  // TTS disabled - just log what would be spoken
  if (!TTS_ENABLED) {
    console.log('[TTS disabled] Would speak:', text);
    return;
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
    10: 'עשר'
  };
  
  const text = hebrewNumbers[num] ?? String(num);
  speak(text);
}

export function speakInstruction(instruction: string): void {
  speak(instruction);
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

export function isHebrewVoiceAvailable(): boolean {
  return false;
}
