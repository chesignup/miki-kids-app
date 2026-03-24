import { useState, useEffect, useCallback } from 'react';
import { TopBar } from '../components/TopBar';
import { Celebration } from '../components/Celebration';
import { useGameGuard } from '../hooks/useGameGuard';
import { shuffleArray, getHebrewNumber } from '../data/numbers';
import { soundManager } from '../utils/sounds';
import { speak } from '../utils/speech';
import { addStars } from '../utils/storage';

interface NumberGameProps {
  stars: number;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  onBack: () => void;
  onStarsUpdate: (stars: number) => void;
}

const ALL_NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const STARS_PER_CORRECT = 2;

export function NumberGame({
  stars,
  soundEnabled,
  onSoundToggle,
  onBack,
  onStarsUpdate
}: NumberGameProps) {
  const { busyRef, lock, unlock, safeSetTimeout } = useGameGuard();

  const [targetNumber, setTargetNumber] = useState(0);
  const [numbersQueue, setNumbersQueue] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [numberState, setNumberState] = useState<'correct' | 'wrong' | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [totalStarsEarned, setTotalStarsEarned] = useState(0);
  const [mistakes, setMistakes] = useState(0);

  const initializeGame = useCallback(() => {
    const shuffled = shuffleArray([...ALL_NUMBERS]);
    setNumbersQueue(shuffled);
    setTargetNumber(shuffled[0]);
    setCurrentIndex(0);
    setMistakes(0);
    setTotalStarsEarned(0);
    setGameComplete(false);
  }, []);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    if (targetNumber !== null && !gameComplete) {
      safeSetTimeout(() => {
        speak(`מצאי את המספר ${getHebrewNumber(targetNumber)}!`);
      }, 300);
    }
  }, [targetNumber, gameComplete, safeSetTimeout]);

  const handleNumberClick = useCallback((num: number) => {
    if (busyRef.current) return;
    lock();

    soundManager.tap();
    setSelectedNumber(num);

    if (num === targetNumber) {
      setNumberState('correct');
      soundManager.correct();
      setShowCelebration(true);

      const newProgress = addStars(STARS_PER_CORRECT);
      onStarsUpdate(newProgress.stars);
      setTotalStarsEarned(prev => prev + STARS_PER_CORRECT);

      safeSetTimeout(() => {
        speak(`נכון! ${getHebrewNumber(num)}`);
      }, 200);

      safeSetTimeout(() => {
        setShowCelebration(false);
        setSelectedNumber(null);
        setNumberState(null);
        setMistakes(0);

        const nextIndex = currentIndex + 1;
        if (nextIndex >= numbersQueue.length) {
          setGameComplete(true);
          soundManager.levelUp();
          speak('כל הכבוד! סיימת את כל המספרים!');
        } else {
          setCurrentIndex(nextIndex);
          setTargetNumber(numbersQueue[nextIndex]);
        }
        unlock();
      }, 1800);
    } else {
      setNumberState('wrong');
      soundManager.wrong();

      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);

      if (newMistakes >= 2) {
        const newProgress = addStars(-1);
        onStarsUpdate(Math.max(0, newProgress.stars));
      }

      speak('נסי שוב!');

      safeSetTimeout(() => {
        setSelectedNumber(null);
        setNumberState(null);
        safeSetTimeout(() => {
          speak(`מצאי את המספר ${getHebrewNumber(targetNumber)}!`);
        }, 300);
        unlock();
      }, 800);
    }
  }, [busyRef, lock, unlock, targetNumber, currentIndex, numbersQueue, mistakes, onStarsUpdate, safeSetTimeout]);

  const repeatInstruction = useCallback(() => {
    if (busyRef.current) return;
    soundManager.tap();
    speak(`מצאי את המספר ${getHebrewNumber(targetNumber)}!`);
  }, [busyRef, targetNumber]);

  if (gameComplete) {
    return (
      <div style={styles.screen}>
        <TopBar
          title="מספרים"
          stars={stars}
          soundEnabled={soundEnabled}
          onSoundToggle={onSoundToggle}
          onBack={onBack}
        />
        <div style={styles.completeContainer}>
          <div style={styles.completeEmoji}>🎉</div>
          <h2 style={styles.completeTitle}>כל הכבוד!</h2>
          <p style={styles.completeText}>מצאת את כל המספרים!</p>
          <div style={styles.starsEarned}>
            <span>⭐</span>
            <span>+{totalStarsEarned}</span>
          </div>
          <button style={styles.playAgainButton} onClick={onBack}>
            חזרה לתפריט
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.screen}>
      <TopBar
        title="מספרים"
        stars={stars}
        soundEnabled={soundEnabled}
        onSoundToggle={onSoundToggle}
        onBack={onBack}
      />

      <div style={styles.content}>
        <div style={styles.progressContainer}>
          <span style={styles.progressText}>
            {currentIndex + 1} מתוך {ALL_NUMBERS.length}
          </span>
          <div style={styles.progressBar}>
            <div
              style={{
                ...styles.progressFill,
                width: `${((currentIndex + 1) / ALL_NUMBERS.length) * 100}%`
              }}
            />
          </div>
        </div>

        <button style={styles.instructionBox} onClick={repeatInstruction}>
          <span style={styles.instructionText}>מצאי את המספר</span>
          <span style={styles.targetNumber}>{targetNumber}</span>
          <span style={styles.repeatHint}>🔊 לחצי לשמוע שוב</span>
        </button>

        <div style={styles.numbersGrid} dir="ltr">
          {ALL_NUMBERS.map((num) => (
            <button
              key={num}
              style={{
                ...styles.numberButton,
                ...(selectedNumber === num && numberState === 'correct'
                  ? styles.numberCorrect
                  : {}),
                ...(selectedNumber === num && numberState === 'wrong'
                  ? styles.numberWrong
                  : {})
              }}
              onClick={() => handleNumberClick(num)}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleNumberClick(num);
              }}
              disabled={busyRef.current}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      <Celebration active={showCelebration} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  screen: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    background: 'var(--bg)'
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '16px',
    gap: '20px',
    overflow: 'hidden'
  },
  progressContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  progressText: {
    fontSize: '0.875rem',
    color: 'var(--text-light)',
    textAlign: 'center'
  },
  progressBar: {
    width: '100%',
    height: '8px',
    background: '#E5E7EB',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, var(--accent), var(--primary))',
    borderRadius: '4px',
    transition: 'width 0.3s ease'
  },
  instructionBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    background: 'white',
    borderRadius: '24px',
    boxShadow: '0 4px 16px var(--shadow)',
    border: 'none',
    cursor: 'pointer',
    gap: '8px'
  },
  instructionText: {
    fontSize: '1.25rem',
    color: 'var(--text-light)'
  },
  targetNumber: {
    fontSize: '4rem',
    fontWeight: 900,
    color: 'var(--primary)',
    lineHeight: 1
  },
  repeatHint: {
    fontSize: '0.875rem',
    color: 'var(--text-light)'
  },
  numbersGrid: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
    alignContent: 'center',
    padding: '8px 0'
  },
  numberButton: {
    aspectRatio: '1',
    fontSize: '2rem',
    fontWeight: 900,
    borderRadius: '20px',
    background: 'white',
    border: 'none',
    boxShadow: '0 4px 12px var(--shadow)',
    cursor: 'pointer',
    transition: 'transform 0.1s ease, box-shadow 0.15s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text)'
  },
  numberCorrect: {
    background: 'var(--success-light)',
    boxShadow: '0 0 0 4px var(--success)',
    animation: 'pulse 0.6s ease'
  },
  numberWrong: {
    background: '#FEE2E2',
    boxShadow: '0 0 0 4px var(--error)',
    animation: 'shake 0.4s ease'
  },
  completeContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px',
    gap: '16px'
  },
  completeEmoji: {
    fontSize: '80px',
    animation: 'bounce 1s ease infinite'
  },
  completeTitle: {
    fontSize: '2rem',
    fontWeight: 900,
    color: 'var(--accent)',
    margin: 0
  },
  completeText: {
    fontSize: '1.25rem',
    color: 'var(--text-light)',
    margin: 0
  },
  starsEarned: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--secondary-dark)',
    background: 'var(--secondary)',
    padding: '12px 24px',
    borderRadius: '24px'
  },
  playAgainButton: {
    marginTop: '16px',
    padding: '16px 48px',
    fontSize: '1.25rem',
    fontWeight: 700,
    background: 'var(--accent)',
    color: 'white',
    border: 'none',
    borderRadius: '24px',
    cursor: 'pointer',
    boxShadow: '0 4px 0 #5B21B6, 0 6px 12px var(--shadow)'
  }
};
