const PREFIX = 'miki_';

const KEYS = {
  sound: `${PREFIX}sound_enabled`,
  stars: `${PREFIX}total_stars`,
  games: `${PREFIX}game_stats`,
} as const;

export interface GameStats {
  plays: number;
  wins: number;
  bestStreak: number;
}

export type GameId = 'quantities' | 'numbers' | 'letters' | 'wordDor';

export type AllGameStats = Partial<Record<GameId, GameStats>>;

function safeParse<T>(raw: string | null, fallback: T): T {
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadSoundEnabled(): boolean {
  const raw = localStorage.getItem(KEYS.sound);
  if (raw === null) return true;
  return raw === '1';
}

export function saveSoundEnabled(on: boolean): void {
  localStorage.setItem(KEYS.sound, on ? '1' : '0');
}

export function loadTotalStars(): number {
  const n = Number(localStorage.getItem(KEYS.stars));
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

export function addStars(amount: number): number {
  const next = loadTotalStars() + Math.max(0, amount);
  localStorage.setItem(KEYS.stars, String(next));
  return next;
}

export function loadGameStats(): AllGameStats {
  return safeParse<AllGameStats>(localStorage.getItem(KEYS.games), {});
}

export function updateGameStats(gameId: GameId, patch: Partial<GameStats>): AllGameStats {
  const all = loadGameStats();
  const prev = all[gameId] ?? { plays: 0, wins: 0, bestStreak: 0 };
  const merged: GameStats = { ...prev, ...patch };
  all[gameId] = merged;
  localStorage.setItem(KEYS.games, JSON.stringify(all));
  return all;
}
