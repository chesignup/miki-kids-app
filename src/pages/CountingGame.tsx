import { useState, useEffect, useCallback, useRef } from 'react';
import { TopBar } from '../components/TopBar';
import { Celebration } from '../components/Celebration';
import { useGameGuard } from '../hooks/useGameGuard';
import { getRandomEmoji, generateDistractors, shuffleArray } from '../data/numbers';
import { soundManager } from '../utils/sounds';
import { speakSequence } from '../utils/speech';
import {
  ttsCountingInstructionParts,
  ttsCountingCorrectParts,
  TTS_COUNTING_COMPLETE,
  TTS_WRONG_TRY_AGAIN
} from '../utils/hebrewTtsText';
import { addStars } from '../utils/storage';

interface CountingGameProps {
  stars: number;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  onBack: () => void;
  onStarsUpdate: (stars: number) => void;
}

const TOTAL_ROUNDS = 10;
const STARS_PER_CORRECT = 2;
const TTS_OPTS = { rate: 0.78, pitch: 1.05 } as const;

export function CountingGame({
  stars,
  soundEnabled,
  onSoundToggle,
  onBack,
  onStarsUpdate
}: CountingGameProps) {
  const { busyRef, lock, unlock, safeSetTimeout } = useGameGuard();
  const currentInstructionPartsRef = useRef<string[]>([]);

  const [round, setRound] = useState(1);
  const [count, setCount] = useState(0);
  const [emoji, setEmoji] = useState({ emoji: '⭐', name: 'כוכבים' });
  const [options, setOptions] = useState<number[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [optionState, setOptionState] = useState<'correct' | 'wrong' | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [totalStarsEarned, setTotalStarsEarned] = useState(0);

  const speakInstruction = useCallback((emojiName: string) => {
    const parts = ttsCountingInstructionParts(emojiName);
    currentInstructionPartsRef.current = parts;
    speakSequence(parts, TTS_OPTS);
  }, []);

  const generateRound = useCallback(() => {
    const newCount = Math.floor(Math.random() * 10) + 1;
    const newEmoji = getRandomEmoji();
    const distractors = generateDistractors(newCount, 3);
    const allOptions = shuffleArray([newCount, ...distractors]);

    setCount(newCount);
    setEmoji(newEmoji);
    setOptions(allOptions);
    setMistakes(0);
    setSelectedOption(null);
    setOptionState(null);

    safeSetTimeout(() => {
      speakInstruction(newEmoji.name);
    }, 300);
  }, [safeSetTimeout, speakInstruction]);

  useEffect(() => {
    generateRound();
  }, [generateRound]);

  const handleBackgroundClick = useCallback(() => {
    if (busyRef.current || gameComplete) return;
    soundManager.tap();
    const parts = currentInstructionPartsRef.current;
    if (parts.length > 0) {
      speakSequence(parts, { ...TTS_OPTS, clickOnce: false });
    }
  }, [busyRef, gameComplete]);

  const handleOptionClick = useCallback((option: number, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (busyRef.current) return;
    lock();

    soundManager.tap();
    setSelectedOption(option);

    if (option === count) {
      setOptionState('correct');
      soundManager.correct();
      setShowCelebration(true);

      const newProgress = addStars(STARS_PER_CORRECT);
      onStarsUpdate(newProgress.stars);
      setTotalStarsEarned(prev => prev + STARS_PER_CORRECT);

      safeSetTimeout(() => {
        speakSequence(ttsCountingCorrectParts(count), TTS_OPTS);
      }, 200);

      safeSetTimeout(() => {
        setShowCelebration(false);
        if (round >= TOTAL_ROUNDS) {
          setGameComplete(true);
          soundManager.levelUp();
          speakSequence(TTS_COUNTING_COMPLETE, TTS_OPTS);
        } else {
          setRound(r => r + 1);
          generateRound();
        }
        unlock();
      }, 1800);
    } else {
      setOptionState('wrong');
      soundManager.wrong();

      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);

      if (newMistakes >= 2) {
        const newProgress = addStars(-1);
        onStarsUpdate(Math.max(0, newProgress.stars));
      }

      speakSequence(TTS_WRONG_TRY_AGAIN, TTS_OPTS);

      safeSetTimeout(() => {
        setSelectedOption(null);
        setOptionState(null);
        unlock();
      }, 800);
    }
  }, [busyRef, lock, unlock, count, round, mistakes, generateRound, onStarsUpdate, safeSetTimeout]);

  if (gameComplete) {
    return (
      <div style={styles.screen}>
        <TopBar
          title="ספירה"
          stars={stars}
          soundEnabled={soundEnabled}
          onSoundToggle={onSoundToggle}
          onBack={onBack}
        />
        <div style={styles.completeContainer}>
          <div style={styles.completeEmoji}>🎉</div>
          <h2 style={styles.completeTitle}>כל הכבוד!</h2>
          <p style={styles.completeText}>סיימת את המשחק!</p>
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
    <div style={styles.screen} onClick={handleBackgroundClick}>
      <TopBar
        title="ספירה"
        stars={stars}
        soundEnabled={soundEnabled}
        onSoundToggle={onSoundToggle}
        onBack={onBack}
      />

      <div style={styles.content}>
        <div style={styles.progressContainer} onClick={(e) => e.stopPropagation()}>
          <span style={styles.roundText}>שאלה {round} מתוך {TOTAL_ROUNDS}</span>
          <div style={styles.progressBar}>
            <div
              style={{
                ...styles.progressFill,
                width: `${(round / TOTAL_ROUNDS) * 100}%`
              }}
            />
          </div>
        </div>

        <div style={styles.instruction}>
          <span>כמה {emoji.name} יש?</span>
        </div>

        <div style={styles.itemsContainer}>
          <div style={styles.itemsGrid}>
            {Array.from({ length: count }).map((_, i) => (
              <span
                key={i}
                style={{
                  ...styles.item,
                  animationDelay: `${i * 0.05}s`
                }}
              >
                {emoji.emoji}
              </span>
            ))}
          </div>
        </div>

        <div style={styles.optionsGrid} dir="ltr">
          {options.map((option) => (
            <button
              key={option}
              style={{
                ...styles.optionButton,
                ...(selectedOption === option && optionState === 'correct'
                  ? styles.optionCorrect
                  : {}),
                ...(selectedOption === option && optionState === 'wrong'
                  ? styles.optionWrong
                  : {})
              }}
              onClick={(e) => handleOptionClick(option, e)}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleOptionClick(option, e);
              }}
              disabled={busyRef.current}
            >
              {option}
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
    gap: '16px',
    overflow: 'hidden'
  },
  progressContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  roundText: {
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
    background: 'linear-gradient(90deg, var(--primary), var(--accent))',
    borderRadius: '4px',
    transition: 'width 0.3s ease'
  },
  instruction: {
    textAlign: 'center',
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--text)'
  },
  itemsContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    background: 'white',
    borderRadius: '24px',
    boxShadow: '0 4px 16px var(--shadow)',
    minHeight: '150px',
    overflow: 'hidden'
  },
  itemsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '12px',
    maxWidth: '300px'
  },
  item: {
    fontSize: '2.5rem',
    animation: 'popIn 0.3s ease backwards'
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
    padding: '8px 0'
  },
  optionButton: {
    aspectRatio: '1',
    fontSize: '2rem',
    fontWeight: 900,
    borderRadius: '16px',
    background: 'white',
    border: 'none',
    boxShadow: '0 4px 12px var(--shadow)',
    cursor: 'pointer',
    transition: 'transform 0.1s ease, box-shadow 0.15s ease',
    minHeight: '64px'
  },
  optionCorrect: {
    background: 'var(--success-light)',
    boxShadow: '0 0 0 4px var(--success)',
    animation: 'pulse 0.6s ease'
  },
  optionWrong: {
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
    color: 'var(--primary)',
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
    background: 'var(--primary)',
    color: 'white',
    border: 'none',
    borderRadius: '24px',
    cursor: 'pointer',
    boxShadow: '0 4px 0 var(--primary-dark), 0 6px 12px var(--shadow)'
  }
};
