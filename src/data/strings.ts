/** Hebrew UI copy */
export const STR = {
  appTitle: 'לומדים ונהנים עם מיקי ומיני',
  tagline: '',

  menuQuantities: 'כמה יש?',
  menuQuantitiesDesc: 'ספרו את חברי העכברים ומצאו את המספר',
  menuNumbers: 'שומעים מספר',
  menuNumbersDesc: 'לחצו על הספרה הנכונה',
  menuLetters: 'מסלולים אותיות',
  menuLettersDesc: 'עקבו אחרי הנתיב בעברית',
  menuWordDor: 'המילה דור',
  menuWordDorDesc: 'כותבים את המילה דור',

  back: 'חזרה',
  soundOn: 'צלילים',
  soundOff: 'שקט',
  stars: 'כוכבים',

  qtyPrompt: 'כמה חברי עכברים רואים? לחצו על המספר הנכון.',
  qtyWrongFirst: 'כמעט! נסו שוב.',
  qtyWrongMore: 'עוד ניסיון — חשבו שוב.',
  qtyWin: 'מעולה! מצאתם את המספר!',

  numPrompt: 'איזו ספרה שומעים? לחצו עליה.',
  numListenAgain: 'שמוע שוב',
  numWin: 'נכון מאוד!',

  tracePrompt: (letterName: string) => `עקבו אחרי האות ${letterName} עם האצבע.`,
  traceWin: 'כל הכבוד! סיימתם את האות!',
  traceHint: 'עברו על כל הנקודות לפי הסדר.',

  wordDorTitle: 'המילה דור',
  wordDorPrompt: (step: number) => `שלב ${step} מתוך 3: עקבו אחרי האות.`,
  wordDorWin: 'המילה דור מוכנה! אתם אלופים!',

  next: 'המשך',
  playAgain: 'שחקו שוב',
  levelUp: 'רמה עלתה!',
} as const;
