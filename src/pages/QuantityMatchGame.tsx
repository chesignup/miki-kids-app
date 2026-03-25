import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent, TouchEvent } from 'react';
import { TopBar } from '../components/TopBar';
import { CelebrationBurst } from '../components/CelebrationBurst';
import { useGameGuard } from '../hooks/useGameGuard';
import { STR } from '../data/strings';
import { speakInstruction } from '../utils/speech';
import { soundManager } from '../utils/sounds';
import { addStars, loadGameStats, updateGameStats, type GameId } from '../utils/storage';
import { CHARACTER_ASSETS } from '../data/characterAssets';

type Props = {
  soundOn: boolean;
  onSoundToggle: (on: boolean) => void;
  onBack: () => void;
  onStarsChange: (n: number) => void;
};

const GAME_ID: GameId = 'quantities';

function pickChoices(target: number): number[] {
  const pool = new Set<number>([target]);
  while (pool.size < 4) {
    const n = 1 + Math.floor(Math.random() * 8);
    pool.add(n);
  }
  return shuffle([...pool]);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randomQuantityRound(): { target: number; choices: number[] } {
  const target = 1 + Math.floor(Math.random() * 8);
  return { target, choices: pickChoices(target) };
}

export function QuantityMatchGame({ soundOn, onSoundToggle, onBack, onStarsChange }: Props) {
  const { busyRef, lock, unlock, safeSetTimeout } = useGameGuard(6000);
  const [{ target, choices }, setRound] = useState(randomQuantityRound);
  const [mistakes, setMistakes] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const [hint, setHint] = useState('');
  const debounceRef = useRef(0);

  const mice = useMemo(() => Array.from({ length: target }, (_, i) => i), [target]);

  const nextRound = useCallback(() => {
    setRound(randomQuantityRound());
    setMistakes(0);
    setHint('');
    setCelebrate(false);
  }, []);

  useEffect(() => {
    const id = safeSetTimeout(() => speakInstruction(STR.qtyPrompt), 500);
    return () => window.clearTimeout(id);
  }, [target, safeSetTimeout]);

  const debounce = useCallback(() => {
    const now = Date.now();
    if (now - debounceRef.current < 380) return false;
    debounceRef.current = now;
    return true;
  }, []);

  const handlePick =
    (n: number) =>
    (_e: MouseEvent<HTMLButtonElement> | TouchEvent<HTMLButtonElement>) => {
      _e.stopPropagation();
      if (!debounce()) return;
      if (busyRef.current) return;
      if (celebrate) return;

      lock();
      if (n === target) {
        soundManager.correct();
        const starsEarned = mistakes === 0 ? 3 : mistakes === 1 ? 2 : 1;
        const total = addStars(starsEarned);
        onStarsChange(total);
        const prev = loadGameStats()[GAME_ID] ?? { plays: 0, wins: 0, bestStreak: 0 };
        updateGameStats(GAME_ID, {
          plays: prev.plays + 1,
          wins: prev.wins + 1,
          bestStreak: prev.bestStreak,
        });
        setCelebrate(true);
        speakInstruction(STR.qtyWin);
        setHint('');
        safeSetTimeout(() => {
          unlock();
          nextRound();
        }, 1400);
      } else {
        const isFirst = mistakes === 0;
        setMistakes((m) => m + 1);
        if (isFirst) {
          soundManager.tap();
          speakInstruction(STR.qtyWrongFirst);
          setHint(STR.qtyWrongFirst);
        } else {
          soundManager.wrong();
          speakInstruction(STR.qtyWrongMore);
          setHint(STR.qtyWrongMore);
        }
        unlock();
      }
    };

  return (
    <div className="game-screen">
      <TopBar title={STR.menuQuantities} onBack={onBack} soundOn={soundOn} onSoundToggle={onSoundToggle} />

      <div className="game-body">
        <p className="game-hint">{hint || ' '}</p>

        <div className="qty-mice" aria-label="דמויות לספירה">
          {mice.map((i) => (
            <img
              key={i}
              className="qty-mice__img"
              src={CHARACTER_ASSETS.mickey}
              alt=""
              loading="lazy"
              decoding="async"
            />
          ))}
        </div>

        <div className="num-pad" dir="ltr">
          {choices.map((n) => (
            <button
              key={n}
              type="button"
              className="num-pad__btn"
              onTouchStart={(e) => e.stopPropagation()}
              onMouseDown={(e) => handlePick(n)(e)}
              onTouchEnd={(e) => handlePick(n)(e)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <CelebrationBurst active={celebrate} />
    </div>
  );
}
