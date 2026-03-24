export interface NumberData {
  value: number;
  hebrew: string;
  hebrewFeminine: string;
}

export const NUMBERS: NumberData[] = [
  { value: 0, hebrew: 'אפס', hebrewFeminine: 'אפס' },
  { value: 1, hebrew: 'אחד', hebrewFeminine: 'אחת' },
  { value: 2, hebrew: 'שניים', hebrewFeminine: 'שתיים' },
  { value: 3, hebrew: 'שלושה', hebrewFeminine: 'שלוש' },
  { value: 4, hebrew: 'ארבעה', hebrewFeminine: 'ארבע' },
  { value: 5, hebrew: 'חמישה', hebrewFeminine: 'חמש' },
  { value: 6, hebrew: 'שישה', hebrewFeminine: 'שש' },
  { value: 7, hebrew: 'שבעה', hebrewFeminine: 'שבע' },
  { value: 8, hebrew: 'שמונה', hebrewFeminine: 'שמונה' },
  { value: 9, hebrew: 'תשעה', hebrewFeminine: 'תשע' },
  { value: 10, hebrew: 'עשרה', hebrewFeminine: 'עשר' }
];

export const COUNTING_EMOJIS = [
  { emoji: '⭐', name: 'כוכבים' },
  { emoji: '🍎', name: 'תפוחים' },
  { emoji: '🌸', name: 'פרחים' },
  { emoji: '🦋', name: 'פרפרים' },
  { emoji: '🐟', name: 'דגים' },
  { emoji: '🎈', name: 'בלונים' },
  { emoji: '🍦', name: 'גלידות' },
  { emoji: '🐱', name: 'חתולים' },
  { emoji: '🌈', name: 'קשתות' },
  { emoji: '🎀', name: 'סרטים' }
];

export function getRandomEmoji(): { emoji: string; name: string } {
  return COUNTING_EMOJIS[Math.floor(Math.random() * COUNTING_EMOJIS.length)];
}

export function getHebrewNumber(value: number, feminine: boolean = true): string {
  const num = NUMBERS.find(n => n.value === value);
  if (!num) return String(value);
  return feminine ? num.hebrewFeminine : num.hebrew;
}

export function generateDistractors(correct: number, count: number = 3): number[] {
  const distractors: number[] = [];
  const available = NUMBERS
    .map(n => n.value)
    .filter(v => v !== correct && v !== 0);
  
  while (distractors.length < count && available.length > 0) {
    const idx = Math.floor(Math.random() * available.length);
    distractors.push(available.splice(idx, 1)[0]);
  }
  
  return distractors;
}

export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
