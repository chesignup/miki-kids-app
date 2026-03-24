import { soundManager } from './sounds';

let hebrewVoiceAvailable = false;
let selectedHebrewVoice: SpeechSynthesisVoice | null = null;

function findHebrewVoice(): SpeechSynthesisVoice | null {
  if (typeof speechSynthesis === 'undefined') return null;
  
  try {
    const voices = speechSynthesis.getVoices();
    
    // Try to find a Hebrew voice with various language codes
    const hebrewCodes = ['he-IL', 'he', 'iw-IL', 'iw', 'heb'];
    
    for (const code of hebrewCodes) {
      const voice = voices.find(v => 
        v.lang.toLowerCase().startsWith(code.toLowerCase()) ||
        v.lang.toLowerCase() === code.toLowerCase()
      );
      if (voice) {
        console.log('Found Hebrew voice:', voice.name, voice.lang);
        return voice;
      }
    }
    
    // Also check voice names for Hebrew
    const hebrewByName = voices.find(v => 
      v.name.toLowerCase().includes('hebrew') ||
      v.name.toLowerCase().includes('ivrit') ||
      v.name.includes('עברית')
    );
    if (hebrewByName) {
      console.log('Found Hebrew voice by name:', hebrewByName.name);
      return hebrewByName;
    }
    
    console.log('No Hebrew voice found. Available voices:', voices.map(v => `${v.name} (${v.lang})`).join(', '));
    return null;
  } catch {
    return null;
  }
}

function loadVoices(): void {
  if (typeof speechSynthesis === 'undefined') return;
  
  try {
    // Initial check
    selectedHebrewVoice = findHebrewVoice();
    hebrewVoiceAvailable = selectedHebrewVoice !== null;
    
    // Listen for voices to load (they load asynchronously on some platforms)
    speechSynthesis.addEventListener('voiceschanged', () => {
      selectedHebrewVoice = findHebrewVoice();
      hebrewVoiceAvailable = selectedHebrewVoice !== null;
    });
    
    // Force voice loading
    speechSynthesis.getVoices();
  } catch {
    // ignore
  }
}

loadVoices();

export function speak(text: string, lang: string = 'he-IL'): void {
  // Always play a sound for feedback
  soundManager.click();
  
  if (!soundManager.enabled) return;

  try {
    if (typeof speechSynthesis === 'undefined') {
      console.log('speechSynthesis not available');
      return;
    }
    
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    // Re-check for Hebrew voice if not found yet
    if (!selectedHebrewVoice) {
      selectedHebrewVoice = findHebrewVoice();
      hebrewVoiceAvailable = selectedHebrewVoice !== null;
    }
    
    // If no Hebrew voice is available, don't attempt to speak Hebrew
    // (it will just read gibberish)
    if (!hebrewVoiceAvailable) {
      console.log('No Hebrew voice available, skipping TTS for:', text);
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Use the found Hebrew voice
    if (selectedHebrewVoice) {
      utterance.voice = selectedHebrewVoice;
      utterance.lang = selectedHebrewVoice.lang;
    } else {
      utterance.lang = lang;
    }
    
    utterance.rate = 0.85;
    utterance.pitch = 1.1;
    utterance.volume = 1;
    
    speechSynthesis.speak(utterance);
  } catch (e) {
    console.log('Speech error:', e);
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

export function isHebrewVoiceAvailable(): boolean {
  return hebrewVoiceAvailable;
}
