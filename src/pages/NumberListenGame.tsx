import { useCallback, useEffect, useRef, useState } from 'react';
import type { MouseEvent, TouchEvent } from 'react';
import { TopBar } from '../components/TopBar';
import { CelebrationBurst } from '../components/CelebrationBurst';
import { useGameGuard } from '../hooks/useGameGuard';
import { STR } from '../data/strings';
import { speakInstruction, speakNumber } from '../utils/speech';
import { soundManager } from '../utils/sounds';
import { addStars, loadGameStats, updateGameStats, type GameId } from '../utils/storage';

type Props = {
  soundOn: boolean;
  onSoundToggle: (on: boolean) => void;
  onBack: () => void;
  onStarsChange: (n: number) => void;
};

const GAME_ID: GameId = 'numbers';
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function NumberListenGame({ soundOn, onSoundToggle, onBack, onStarsChange }: Props) {
  const { busyRef, lock, unlock, safeSetTimeout } = useGameGuard(6000);
  const [target, setTarget] = useState(() => Math.floor(Math.random() * 11));
  const [mistakes, setMistakes] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const [hint, setHint] = useState('');
  const debounceRef = useRef(0);

  const speakTarget = useCallback(() => {
    safeSetTimeout(() => speakNumber(target), 200);
  }, [target, safeSetTimeout]);

  useEffect(() => {
    const id = safeSetTimeout(() => {
      speakInstruction(STR.numPrompt);
      speakTarget();
    }, 450);
    return () => window.clearTimeout(id);
  }, [target, safeSetTimeout, speakTarget]);

  const debounce = useCallback(() => {
    const now = Date.now();
    if (now - debounceRef.current < 380) return false;
    debounceRef.current = now;
    return true;
  }, []);

  const handleListenAgain = (e: MouseEvent<HTMLButtonElement> | TouchEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!debounce()) return;
    if (busyRef.current) return;
    if (celebrate) return;
    soundManager.click();
    speakNumber(target);
  };

  const handlePick =
    (n: number) =>
    (ev: MouseEvent<HTMLButtonElement> | TouchEvent<HTMLButtonElement>) => {
      ev.stopPropagation();
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
        speakInstruction(STR.numWin);
        setHint('');
        safeSetTimeout(() => {
          unlock();
          setCelebrate(false);
          const next = Math.floor(Math.random() * 11);
          setTarget(next);
          setMistakes(0);
        }, 1500);
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
      <TopBar title={STR.menuNumbers} onBack={onBack} soundOn={soundOn} onSoundToggle={onSoundToggle} />

      <div className="game-body">
        <p className="game-hint">{hint || ' '}</p>

        <button
          type="button"
          className="btn-listen"
          onTouchStart={(e) => e.stopPropagation()}
          onMouseDown={handleListenAgain}
          onTouchEnd={handleListenAgain}
        >
          {STR.numListenAgain}
        </button>

        <div className="num-pad num-pad--dense" dir="ltr">
          {DIGITS.map((n) => (
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
