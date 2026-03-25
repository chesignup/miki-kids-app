import { useCallback, useEffect, useState } from 'react';
import { TopBar } from '../components/TopBar';
import { CelebrationBurst } from '../components/CelebrationBurst';
import { TracingCanvas } from '../components/TracingCanvas';
import { useGameGuard } from '../hooks/useGameGuard';
import { TRACING_LETTERS } from '../data/hebrewLetters';
import { STR } from '../data/strings';
import { speakInstruction } from '../utils/speech';
import { soundManager } from '../utils/sounds';
import { addStars, loadGameStats, updateGameStats, type GameId } from '../utils/storage';

type Props = {
  soundOn: boolean;
  onSoundToggle: (on: boolean) => void;
  onBack: () => void;
  onStarsChange: (n: number) => void;
};

const GAME_ID: GameId = 'letters';

function pickLetterIndex(prev: number): number {
  let next = Math.floor(Math.random() * TRACING_LETTERS.length);
  if (TRACING_LETTERS.length > 1) {
    while (next === prev) {
      next = Math.floor(Math.random() * TRACING_LETTERS.length);
    }
  }
  return next;
}

export function HebrewLetterTraceGame({ soundOn, onSoundToggle, onBack, onStarsChange }: Props) {
  const { busyRef, lock, unlock, safeSetTimeout } = useGameGuard(6000);
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * TRACING_LETTERS.length));
  const [celebrate, setCelebrate] = useState(false);
  const letter = TRACING_LETTERS[idx]!;

  const announce = useCallback(() => {
    speakInstruction(STR.tracePrompt(letter.name));
    safeSetTimeout(() => speakInstruction(STR.traceHint), 1200);
  }, [letter.name, safeSetTimeout]);

  useEffect(() => {
    const id = safeSetTimeout(announce, 400);
    return () => window.clearTimeout(id);
  }, [idx, announce, safeSetTimeout]);

  const onComplete = () => {
    if (busyRef.current) return;
    lock();
    soundManager.levelUp();
    speakInstruction(STR.traceWin);
    setCelebrate(true);
    const total = addStars(3);
    onStarsChange(total);
    const prev = loadGameStats()[GAME_ID] ?? { plays: 0, wins: 0, bestStreak: 0 };
    updateGameStats(GAME_ID, {
      plays: prev.plays + 1,
      wins: prev.wins + 1,
      bestStreak: prev.bestStreak,
    });
    safeSetTimeout(() => {
      setCelebrate(false);
      setIdx((i) => pickLetterIndex(i));
      unlock();
    }, 1600);
  };

  return (
    <div className="game-screen">
      <TopBar title={STR.menuLetters} onBack={onBack} soundOn={soundOn} onSoundToggle={onSoundToggle} />

      <div className="game-body game-body--trace">
        <p className="trace-caption">
          {letter.name} ({letter.letter})
        </p>
        <TracingCanvas
          key={letter.letter}
          letter={letter}
          busyRef={busyRef}
          onComplete={onComplete}
          disabled={celebrate}
        />
      </div>

      <CelebrationBurst active={celebrate} />
    </div>
  );
}
