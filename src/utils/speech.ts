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

export function speak(text: string, lang: string = 'he-IL'): void {
  soundManager.click();
  
  if (!soundManager.enabled) return;

  try {
    if (typeof speechSynthesis === 'undefined') return;
    
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.85;
    utterance.pitch = 1.1;
    utterance.volume = 1;
    
    const voices = speechSynthesis.getVoices();
    const hebrewVoice = voices.find(v => v.lang.startsWith('he'));
    if (hebrewVoice) {
      utterance.voice = hebrewVoice;
    }
    
    speechSynthesis.speak(utterance);
  } catch {
    // silent fail - click sound already played as fallback
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
