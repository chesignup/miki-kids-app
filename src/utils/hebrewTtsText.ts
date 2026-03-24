/**
 * Hebrew strings tuned for Web Speech API: niqqud, punctuation, short clauses.
 * UI copy stays unpointed elsewhere; TTS uses these forms only.
 */

/** Feminine number words 0–10 (counting / “המספר X”) with niqqud */
export const TTS_NUM_FEMININE: Record<number, string> = {
  0: 'אֶפֶס',
  1: 'אַחַת',
  2: 'שְׁתַּיִם',
  3: 'שָׁלוֹשׁ',
  4: 'אַרְבַּע',
  5: 'חָמֵשׁ',
  6: 'שֵׁשׁ',
  7: 'שֶׁבַע',
  8: 'שְׁמוֹנֶה',
  9: 'תֵּשַׁע',
  10: 'עֶשֶׂר'
};

export function ttsNumberFeminine(n: number): string {
  return TTS_NUM_FEMININE[n] ?? String(n);
}

/** Letter names for speech (niqqud) — keys match hebrewLetters `name` */
export const TTS_LETTER_NAME: Record<string, string> = {
  אלף: 'אָלֶף',
  בית: 'בֵּית',
  גימל: 'גִימֵל',
  דלת: 'דָּלֶת',
  הא: 'הֵא',
  וו: 'וָו',
  מם: 'מֵם',
  יוד: 'יוֹד',
  כף: 'כָּף',
  ריש: 'רֵישׁ'
};

export function ttsLetterName(plainName: string): string {
  return TTS_LETTER_NAME[plainName] ?? plainName;
}

/**
 * Definite plural after "את ה" for counting game (ספרי את ה…)
 * Keys = COUNTING_EMOJIS `name`
 */
export const TTS_COUNT_ITEM_DEFINITE: Record<string, string> = {
  כוכבים: 'כּוֹכָבִים',
  תפוחים: 'תַּפּוּחִים',
  פרחים: 'פְּרָחִים',
  פרפרים: 'פַּרְפָּרִים',
  דגים: 'דָּגִים',
  בלונים: 'בַּלּוֹנִים',
  גלידות: 'גְּלִידוֹת',
  חתולים: 'חֲתוּלִים',
  קשתות: 'קְשָׁתוֹת',
  סרטים: 'סְרָטִים'
};

export function ttsCountingInstructionParts(itemPlainName: string): string[] {
  const stem = TTS_COUNT_ITEM_DEFINITE[itemPlainName] ?? itemPlainName;
  const definite = stem.startsWith('ה') ? stem : `הַ${stem}`;
  return [`סְפָרִי, אֶת ${definite}.`, 'כַּמָּה, יֵשׁ?'];
}

export function ttsCountingCorrectParts(n: number): string[] {
  return ['כָּל הַכָּבוֹד!', `הַתְּשׁוּבָה, הִיא ${ttsNumberFeminine(n)}.`];
}

export const TTS_COUNTING_COMPLETE: string[] = [
  'כָּל הַכָּבוֹד!',
  'סִיַּמְתְּ, אֶת כָּל הַמִּשְׂחָק!'
];

export const TTS_WRONG_TRY_AGAIN: string[] = ['זֶה לֹא הַמִּסְפָּר.', 'נַסִּי, שׁוּב!'];

/** Number recognition: find digit N (spoken as word) */
export function ttsNumberFindParts(targetNum: number): string[] {
  const w = ttsNumberFeminine(targetNum);
  return [`מְצָאִי, אֶת הַמִּסְפָּר.`, `הוּא ${w}.`, 'בּוֹאִי, נַחְפֹּשׂ אוֹתוֹ.'];
}

export function ttsNumberCorrectParts(n: number): string[] {
  return ['כָּל הַכָּבוֹד!', `זֶה הַמִּסְפָּר ${ttsNumberFeminine(n)}.`];
}

export const TTS_NUMBERS_ALL_DONE: string[] = [
  'כָּל הַכָּבוֹד!',
  'מָצָאת, אֶת כָּל הַמִּסְפָּרִים!'
];

/** Letter tracing */
export function ttsTraceLetterParts(plainLetterName: string): string[] {
  const nm = ttsLetterName(plainLetterName);
  return [`עִקְבִי, עִם הָאֶצְבַּע.`, `עַל הָאוֹת, ${nm}.`];
}

export function ttsLetterDoneParts(plainLetterName: string): string[] {
  const nm = ttsLetterName(plainLetterName);
  return ['כָּל הַכָּבוֹד!', `כָּתַבְתְּ, אֶת הָאוֹת ${nm}.`];
}

export const TTS_ALL_LETTERS_DONE: string[] = [
  'מְעוּלֶה!',
  'סִיַּמְתְּ, לִכְתּוֹב אֶת כָּל הָאוֹתִיּוֹת!'
];

/** Word דור */
export const TTS_WORD_DOR_INTRO: string[] = [
  'בּוֹאִי, נִכְתּוֹב בְּיַחַד.',
  'אֶת הַמִּילָה, דּוֹר.',
  'עִקְבִי עִם הָאֶצְבַּע, עַל כָּל אוֹת.'
];

export const TTS_WORD_DOR_DONE: string[] = ['כָּל הַכָּבוֹד!', 'כָּתַבְתְּ, אֶת הַמִּילָה דּוֹר!'];

/** Main menu & splash */
export const TTS_MENU_GREETING: string[] = [
  'שָׁלוֹם.',
  'בּוֹאִי, נִשְׂחַק.',
  'נִלְמַד, בְּיַחַד.'
];

export const TTS_SPLASH: string[] = ['מִיקִי, מְלַמֶּדֶת!'];

/**
 * Optional: spoken duration for future timed modes (seconds → short phrase).
 */
export function ttsSecondsParts(totalSeconds: number): string[] {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  const parts: string[] = [];
  if (m > 0) {
    parts.push(m === 1 ? 'דַּקָּה אַחַת.' : `${ttsNumberFeminine(m)} דַּקּוֹת.`);
  }
  if (s > 0) {
    parts.push(s === 1 ? 'שְׁנִיָּה אַחַת.' : `${ttsNumberFeminine(s)} שְׁנִיּוֹת.`);
  }
  return parts.length ? parts : ['אֶפֶס שְׁנִיּוֹת.'];
}
