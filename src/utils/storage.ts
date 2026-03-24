const PROGRESS_KEY = 'miki_progress';
const SETTINGS_KEY = 'miki_settings';

export interface Progress {
  stars: number;
  gamesCompleted: number[];
  highScores: Record<string, number>;
}

export interface Settings {
  soundEnabled: boolean;
}

const DEFAULT_PROGRESS: Progress = {
  stars: 0,
  gamesCompleted: [],
  highScores: {}
};

const DEFAULT_SETTINGS: Settings = {
  soundEnabled: true
};

export function loadProgress(): Progress {
  try {
    const stored = localStorage.getItem(PROGRESS_KEY);
    if (stored) {
      return { ...DEFAULT_PROGRESS, ...JSON.parse(stored) };
    }
  } catch {
    // ignore parse errors
  }
  return { ...DEFAULT_PROGRESS };
}

export function saveProgress(progress: Progress): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // ignore storage errors
  }
}

export function addStars(amount: number): Progress {
  const progress = loadProgress();
  progress.stars = Math.max(0, progress.stars + amount);
  saveProgress(progress);
  return progress;
}

export function markGameCompleted(gameId: number): Progress {
  const progress = loadProgress();
  if (!progress.gamesCompleted.includes(gameId)) {
    progress.gamesCompleted.push(gameId);
  }
  saveProgress(progress);
  return progress;
}

export function setHighScore(gameId: string, score: number): Progress {
  const progress = loadProgress();
  const currentHigh = progress.highScores[gameId] ?? 0;
  if (score > currentHigh) {
    progress.highScores[gameId] = score;
    saveProgress(progress);
  }
  return progress;
}

export function loadSettings(): Settings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch {
    // ignore
  }
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}
