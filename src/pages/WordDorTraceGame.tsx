import { useCallback, useEffect, useState } from 'react';
import { TopBar } from '../components/TopBar';
import { CelebrationBurst } from '../components/CelebrationBurst';
import { TracingCanvas } from '../components/TracingCanvas';
import { useGameGuard } from '../hooks/useGameGuard';
import { WORD_DOR } from '../data/hebrewLetters';
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

const GAME_ID: GameId = 'wordDor';

export function WordDorTraceGame({ soundOn, onSoundToggle, onBack, onStarsChange }: Props) {
  const { busyRef, lock, unlock, safeSetTimeout } = useGameGuard(6000);
  const [step, setStep] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const [done, setDone] = useState(false);
  const letter = WORD_DOR[step]!;

  const announce = useCallback(() => {
    speakInstruction(STR.wordDorPrompt(step + 1));
    safeSetTimeout(() => speakInstruction(STR.tracePrompt(letter.name)), 600);
  }, [letter.name, step, safeSetTimeout]);

  useEffect(() => {
    if (done) return;
    const id = safeSetTimeout(announce, 400);
    return () => window.clearTimeout(id);
  }, [step, done, announce, safeSetTimeout]);

  const onLetterComplete = () => {
    if (busyRef.current) return;
    lock();
    soundManager.levelUp();
    speakInstruction(STR.traceWin);

    if (step >= WORD_DOR.length - 1) {
      setCelebrate(true);
      setDone(true);
      const total = addStars(5);
      onStarsChange(total);
      const prev = loadGameStats()[GAME_ID] ?? { plays: 0, wins: 0, bestStreak: 0 };
      updateGameStats(GAME_ID, {
        plays: prev.plays + 1,
        wins: prev.wins + 1,
        bestStreak: prev.bestStreak,
      });
      safeSetTimeout(() => {
        speakInstruction(STR.wordDorWin);
        unlock();
      }, 900);
    } else {
      safeSetTimeout(() => {
        setStep((s) => s + 1);
        unlock();
      }, 900);
    }
  };

  const playAgain = () => {
    if (busyRef.current) return;
    soundManager.click();
    setStep(0);
    setDone(false);
    setCelebrate(false);
  };

  return (
    <div className="game-screen">
      <TopBar title={STR.wordDorTitle} onBack={onBack} soundOn={soundOn} onSoundToggle={onSoundToggle} />

      <div className="game-body game-body--trace">
        {!done && (
          <>
            <p className="trace-caption">{STR.wordDorPrompt(step + 1)}</p>
            <TracingCanvas
              key={`${step}-${letter.letter}`}
              letter={letter}
              busyRef={busyRef}
              onComplete={onLetterComplete}
              disabled={celebrate}
            />
          </>
        )}

        {done && (
          <div className="word-dor-done">
            <p className="word-dor-done__word" dir="rtl">
              דור
            </p>
            <button
              type="button"
              className="btn-primary"
              onTouchStart={(e) => e.stopPropagation()}
              onMouseDown={(e) => {
                e.stopPropagation();
                playAgain();
              }}
              onTouchEnd={(e) => {
                e.stopPropagation();
                playAgain();
              }}
            >
              {STR.playAgain}
            </button>
          </div>
        )}
      </div>

      <CelebrationBurst active={celebrate} />
    </div>
  );
}
