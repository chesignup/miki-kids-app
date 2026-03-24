import { soundManager } from './sounds';

let hebrewVoiceAvailable: boolean | null = null;
let selectedHebrewVoice: SpeechSynthesisVoice | null = null;
let voicesChecked = false;

function isAndroidWebView(): boolean {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('android') && (ua.includes('wv') || ua.includes('webview'));
}

function findHebrewVoice(): SpeechSynthesisVoice | null {
  if (typeof speechSynthesis === 'undefined') return null;
  
  try {
    const voices = speechSynthesis.getVoices();
    if (voices.length === 0) return null;
    
    // Try to find a Hebrew voice with various language codes
    const hebrewCodes = ['he-il', 'he', 'iw-il', 'iw'];
    
    for (const code of hebrewCodes) {
      const voice = voices.find(v => v.lang.toLowerCase().startsWith(code));
      if (voice) {
        console.log('[TTS] Found Hebrew voice:', voice.name, voice.lang);
        return voice;
      }
    }
    
    // Check voice names for Hebrew keywords
    const hebrewByName = voices.find(v => 
      v.name.toLowerCase().includes('hebrew') ||
      v.name.toLowerCase().includes('ivrit')
    );
    if (hebrewByName) {
      console.log('[TTS] Found Hebrew voice by name:', hebrewByName.name);
      return hebrewByName;
    }
    
    console.log('[TTS] No Hebrew voice found. Available:', voices.map(v => `${v.name}(${v.lang})`).join(', '));
    return null;
  } catch (e) {
    console.log('[TTS] Error finding voice:', e);
    return null;
  }
}

function checkVoices(): void {
  if (voicesChecked) return;
  
  // On Android WebView, disable TTS entirely
  if (isAndroidWebView()) {
    console.log('[TTS] Android WebView detected - disabling TTS');
    hebrewVoiceAvailable = false;
    voicesChecked = true;
    return;
  }
  
  selectedHebrewVoice = findHebrewVoice();
  hebrewVoiceAvailable = selectedHebrewVoice !== null;
  
  if (hebrewVoiceAvailable) {
    voicesChecked = true;
  }
}

function initVoices(): void {
  if (typeof speechSynthesis === 'undefined') return;
  
  try {
    // Check immediately
    checkVoices();
    
    // Also listen for voices to load asynchronously
    speechSynthesis.addEventListener('voiceschanged', () => {
      checkVoices();
    });
    
    // Force voice loading
    speechSynthesis.getVoices();
  } catch {
    // ignore
  }
}

initVoices();

export function speak(text: string, lang: string = 'he-IL'): void {
  // Always play a sound for feedback
  soundManager.click();
  
  if (!soundManager.enabled) return;

  try {
    if (typeof speechSynthesis === 'undefined') return;
    
    // Re-check voices if not checked yet
    if (!voicesChecked) {
      checkVoices();
    }
    
    // Skip TTS if no Hebrew voice available
    if (hebrewVoiceAvailable === false) {
      console.log('[TTS] Skipping (no Hebrew voice):', text);
      return;
    }
    
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (selectedHebrewVoice) {
      utterance.voice = selectedHebrewVoice;
      utterance.lang = selectedHebrewVoice.lang;
    } else {
      utterance.lang = lang;
    }
    
    utterance.rate = 0.85;
    utterance.pitch = 1.1;
    utterance.volume = 1;
    
    console.log('[TTS] Speaking:', text);
    speechSynthesis.speak(utterance);
  } catch (e) {
    console.log('[TTS] Error:', e);
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
  return hebrewVoiceAvailable === true;
}
