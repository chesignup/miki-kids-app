export interface Point {
  x: number;
  y: number;
}

export interface LetterData {
  letter: string;
  name: string;
  path: Point[];
}

// Waypoints are normalized to a 200x200 grid
// These represent key checkpoints for tracing validation
export const HEBREW_LETTERS: LetterData[] = [
  {
    letter: 'א',
    name: 'אלף',
    path: [
      { x: 150, y: 30 },
      { x: 130, y: 60 },
      { x: 100, y: 100 },
      { x: 70, y: 140 },
      { x: 50, y: 170 },
      { x: 100, y: 80 },
      { x: 140, y: 120 },
      { x: 160, y: 160 },
      { x: 60, y: 60 },
      { x: 40, y: 40 }
    ]
  },
  {
    letter: 'ב',
    name: 'בית',
    path: [
      { x: 150, y: 40 },
      { x: 150, y: 80 },
      { x: 150, y: 120 },
      { x: 150, y: 160 },
      { x: 120, y: 160 },
      { x: 80, y: 160 },
      { x: 50, y: 160 },
      { x: 50, y: 130 },
      { x: 80, y: 130 }
    ]
  },
  {
    letter: 'ג',
    name: 'גימל',
    path: [
      { x: 140, y: 40 },
      { x: 140, y: 80 },
      { x: 140, y: 120 },
      { x: 120, y: 150 },
      { x: 90, y: 170 },
      { x: 60, y: 170 },
      { x: 60, y: 140 },
      { x: 60, y: 110 }
    ]
  },
  {
    letter: 'ד',
    name: 'דלת',
    path: [
      { x: 160, y: 50 },
      { x: 120, y: 50 },
      { x: 80, y: 50 },
      { x: 50, y: 50 },
      { x: 50, y: 90 },
      { x: 50, y: 130 },
      { x: 50, y: 170 }
    ]
  },
  {
    letter: 'ה',
    name: 'הא',
    path: [
      { x: 160, y: 50 },
      { x: 120, y: 50 },
      { x: 80, y: 50 },
      { x: 50, y: 50 },
      { x: 50, y: 90 },
      { x: 50, y: 130 },
      { x: 50, y: 170 },
      { x: 140, y: 80 },
      { x: 140, y: 120 },
      { x: 140, y: 160 }
    ]
  },
  {
    letter: 'ו',
    name: 'וו',
    path: [
      { x: 100, y: 40 },
      { x: 100, y: 80 },
      { x: 100, y: 120 },
      { x: 100, y: 160 }
    ]
  },
  {
    letter: 'מ',
    name: 'מם',
    path: [
      { x: 160, y: 50 },
      { x: 160, y: 90 },
      { x: 160, y: 130 },
      { x: 160, y: 170 },
      { x: 120, y: 170 },
      { x: 80, y: 170 },
      { x: 50, y: 170 },
      { x: 50, y: 130 },
      { x: 50, y: 90 },
      { x: 50, y: 50 },
      { x: 90, y: 50 },
      { x: 120, y: 70 }
    ]
  },
  {
    letter: 'י',
    name: 'יוד',
    path: [
      { x: 100, y: 50 },
      { x: 100, y: 80 },
      { x: 100, y: 110 }
    ]
  },
  {
    letter: 'כ',
    name: 'כף',
    path: [
      { x: 160, y: 50 },
      { x: 120, y: 50 },
      { x: 80, y: 50 },
      { x: 60, y: 70 },
      { x: 50, y: 100 },
      { x: 50, y: 140 },
      { x: 70, y: 170 },
      { x: 110, y: 170 },
      { x: 150, y: 170 }
    ]
  },
  {
    letter: 'ר',
    name: 'ריש',
    path: [
      { x: 160, y: 50 },
      { x: 120, y: 50 },
      { x: 80, y: 50 },
      { x: 50, y: 50 },
      { x: 50, y: 90 },
      { x: 50, y: 130 },
      { x: 50, y: 170 }
    ]
  }
];

// Word דור - dalet, vav, resh
export const WORD_DOR: LetterData[] = [
  HEBREW_LETTERS.find(l => l.letter === 'ד')!,
  HEBREW_LETTERS.find(l => l.letter === 'ו')!,
  HEBREW_LETTERS.find(l => l.letter === 'ר')!
];

// Subset for the letter tracing game (letters from מיקי + דור)
export const TRACING_LETTERS: LetterData[] = HEBREW_LETTERS.filter(l =>
  ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'מ', 'י', 'כ'].includes(l.letter)
);

export function getLetterByChar(char: string): LetterData | undefined {
  return HEBREW_LETTERS.find(l => l.letter === char);
}

export function calculateDistance(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

export function isNearWaypoint(touch: Point, waypoint: Point, threshold: number = 30): boolean {
  return calculateDistance(touch, waypoint) <= threshold;
}
