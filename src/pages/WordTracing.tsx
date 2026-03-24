import { useState, useEffect, useCallback, useRef } from 'react';
import { TopBar } from '../components/TopBar';
import { Celebration } from '../components/Celebration';
import { useGameGuard } from '../hooks/useGameGuard';
import { WORD_DOR, isNearWaypoint } from '../data/hebrewLetters';
import type { Point } from '../data/hebrewLetters';
import { soundManager } from '../utils/sounds';
import { speakSequence } from '../utils/speech';
import {
  TTS_WORD_DOR_INTRO,
  ttsTraceLetterParts,
  ttsLetterDoneParts,
  TTS_WORD_DOR_DONE
} from '../utils/hebrewTtsText';
import { addStars } from '../utils/storage';

interface WordTracingProps {
  stars: number;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  onBack: () => void;
  onStarsUpdate: (stars: number) => void;
}

const STARS_ON_COMPLETE = 5;
const COMPLETION_THRESHOLD = 0.8;
const TTS_OPTS = { rate: 0.78, pitch: 1.05 } as const;

export function WordTracing({
  stars,
  soundEnabled,
  onSoundToggle,
  onBack,
  onStarsUpdate
}: WordTracingProps) {
  const { busyRef, lock, unlock, safeSetTimeout } = useGameGuard();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentInstructionPartsRef = useRef<string[]>([]);

  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [hitWaypoints, setHitWaypoints] = useState<Set<number>>(new Set());
  const [completedLetters, setCompletedLetters] = useState<Set<number>>(new Set());
  const [isDrawing, setIsDrawing] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 300, height: 300 });

  const currentLetter = WORD_DOR[currentLetterIndex];
  const progress = currentLetter ? hitWaypoints.size / currentLetter.path.length : 0;

  const handleBackgroundClick = useCallback(() => {
    if (busyRef.current || gameComplete || isDrawing) return;
    soundManager.tap();
    const parts = currentInstructionPartsRef.current;
    if (parts.length > 0) {
      speakSequence(parts, { ...TTS_OPTS, clickOnce: false });
    }
  }, [busyRef, gameComplete, isDrawing]);

  const scalePoint = useCallback((point: Point): Point => {
    const scale = Math.min(canvasSize.width, canvasSize.height) / 200;
    const offsetX = (canvasSize.width - 200 * scale) / 2;
    const offsetY = (canvasSize.height - 200 * scale) / 2;
    return {
      x: point.x * scale + offsetX,
      y: point.y * scale + offsetY
    };
  }, [canvasSize]);

  const getCanvasPoint = useCallback((clientX: number, clientY: number): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const scale = Math.min(canvasSize.width, canvasSize.height) / 200;
    const offsetX = (canvasSize.width - 200 * scale) / 2;
    const offsetY = (canvasSize.height - 200 * scale) / 2;

    return {
      x: (x - offsetX) / scale,
      y: (y - offsetY) / scale
    };
  }, [canvasSize]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentLetter) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    currentLetter.path.forEach((point, index) => {
      const scaled = scalePoint(point);
      const isHit = hitWaypoints.has(index);

      ctx.beginPath();
      ctx.arc(scaled.x, scaled.y, isHit ? 12 : 16, 0, Math.PI * 2);
      ctx.fillStyle = isHit ? '#F97316' : '#E5E7EB';
      ctx.fill();

      if (!isHit) {
        ctx.strokeStyle = '#D1D5DB';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      if (index < currentLetter.path.length - 1) {
        const nextPoint = scalePoint(currentLetter.path[index + 1]);
        ctx.beginPath();
        ctx.moveTo(scaled.x, scaled.y);
        ctx.lineTo(nextPoint.x, nextPoint.y);
        ctx.strokeStyle = '#E5E7EB';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });
  }, [currentLetter, hitWaypoints, scalePoint]);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const size = Math.min(rect.width - 32, rect.height - 32, 300);
        setCanvasSize({ width: size, height: size });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  useEffect(() => {
    if (gameComplete || !currentLetter) return;
    const parts =
      currentLetterIndex === 0
        ? [...TTS_WORD_DOR_INTRO]
        : ttsTraceLetterParts(currentLetter.name);
    currentInstructionPartsRef.current = parts;
    const t = window.setTimeout(() => {
      speakSequence(parts, TTS_OPTS);
    }, 300);
    return () => window.clearTimeout(t);
  }, [currentLetterIndex, currentLetter, gameComplete]);

  const handleLetterComplete = useCallback(() => {
    if (busyRef.current) return;
    lock();

    soundManager.correct();

    const newCompleted = new Set(completedLetters);
    newCompleted.add(currentLetterIndex);
    setCompletedLetters(newCompleted);

    if (currentLetter) {
      speakSequence(ttsLetterDoneParts(currentLetter.name), TTS_OPTS);
    }

    safeSetTimeout(() => {
      if (currentLetterIndex >= WORD_DOR.length - 1) {
        setShowCelebration(true);
        setGameComplete(true);
        soundManager.levelUp();

        const newProgress = addStars(STARS_ON_COMPLETE);
        onStarsUpdate(newProgress.stars);

        safeSetTimeout(() => {
          speakSequence(TTS_WORD_DOR_DONE, TTS_OPTS);
        }, 500);
      } else {
        setCurrentLetterIndex(prev => prev + 1);
        setHitWaypoints(new Set());
      }
      unlock();
    }, 1200);
  }, [busyRef, lock, unlock, currentLetter, currentLetterIndex, completedLetters, onStarsUpdate, safeSetTimeout]);

  const checkWaypoint = useCallback((point: Point) => {
    if (!currentLetter || busyRef.current) return;

    const threshold = 30;

    for (let i = 0; i < currentLetter.path.length; i++) {
      if (!hitWaypoints.has(i) && isNearWaypoint(point, currentLetter.path[i], threshold)) {
        const newHits = new Set(hitWaypoints);
        newHits.add(i);
        setHitWaypoints(newHits);
        soundManager.checkpoint();

        const newProgress = newHits.size / currentLetter.path.length;
        if (newProgress >= COMPLETION_THRESHOLD) {
          handleLetterComplete();
        }
        break;
      }
    }
  }, [currentLetter, hitWaypoints, busyRef, handleLetterComplete]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (busyRef.current) return;
    e.preventDefault();
    soundManager.dragStart();
    setIsDrawing(true);

    const touch = e.touches[0];
    const point = getCanvasPoint(touch.clientX, touch.clientY);
    if (point) checkWaypoint(point);
  }, [busyRef, getCanvasPoint, checkWaypoint]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDrawing || busyRef.current) return;
    e.preventDefault();

    const touch = e.touches[0];
    const point = getCanvasPoint(touch.clientX, touch.clientY);
    if (point) checkWaypoint(point);
  }, [isDrawing, busyRef, getCanvasPoint, checkWaypoint]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(false);
    soundManager.dragEnd();
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (busyRef.current) return;
    soundManager.dragStart();
    setIsDrawing(true);

    const point = getCanvasPoint(e.clientX, e.clientY);
    if (point) checkWaypoint(point);
  }, [busyRef, getCanvasPoint, checkWaypoint]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDrawing || busyRef.current) return;

    const point = getCanvasPoint(e.clientX, e.clientY);
    if (point) checkWaypoint(point);
  }, [isDrawing, busyRef, getCanvasPoint, checkWaypoint]);

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
    soundManager.dragEnd();
  }, []);

  const resetCurrentLetter = useCallback(() => {
    if (busyRef.current) return;
    soundManager.tap();
    setHitWaypoints(new Set());
  }, [busyRef]);

  if (gameComplete) {
    return (
      <div style={styles.screen}>
        <TopBar
          title="כתיבת דור"
          stars={stars}
          soundEnabled={soundEnabled}
          onSoundToggle={onSoundToggle}
          onBack={onBack}
        />
        <div style={styles.completeContainer}>
          <div style={styles.completeEmoji}>🎉</div>
          <h2 style={styles.completeTitle}>כל הכבוד!</h2>
          <div style={styles.completedWord}>דור</div>
          <p style={styles.completeText}>כתבת את המילה!</p>
          <div style={styles.starsEarned}>
            <span>⭐</span>
            <span>+{STARS_ON_COMPLETE}</span>
          </div>
          <button style={styles.playAgainButton} onClick={onBack}>
            חזרה לתפריט
          </button>
        </div>
        <Celebration active={showCelebration} />
      </div>
    );
  }

  return (
    <div style={styles.screen} onClick={handleBackgroundClick}>
      <TopBar
        title="כתיבת דור"
        stars={stars}
        soundEnabled={soundEnabled}
        onSoundToggle={onSoundToggle}
        onBack={onBack}
      />

      <div style={styles.content}>
        <div style={styles.wordDisplay} onClick={(e) => e.stopPropagation()}>
          {WORD_DOR.map((letter, index) => (
            <span
              key={index}
              style={{
                ...styles.wordLetter,
                color: completedLetters.has(index)
                  ? '#F97316'
                  : index === currentLetterIndex
                  ? 'var(--primary)'
                  : '#D1D5DB',
                transform: index === currentLetterIndex ? 'scale(1.1)' : 'scale(1)'
              }}
            >
              {letter.letter}
            </span>
          ))}
        </div>

        <div style={styles.instruction}>
          <span>עכשיו כתבי: </span>
          <span style={styles.currentLetterName}>{currentLetter?.name}</span>
        </div>

        <div style={styles.tracingContainer} ref={containerRef}>
          <div style={styles.letterGuide}>{currentLetter?.letter}</div>
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            style={{
              ...styles.canvas,
              width: canvasSize.width,
              height: canvasSize.height
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>

        <div style={styles.tracingProgress}>
          <div style={styles.tracingProgressBar}>
            <div
              style={{
                ...styles.tracingProgressFill,
                width: `${progress * 100}%`
              }}
            />
          </div>
          <span style={styles.tracingProgressText}>
            {Math.round(progress * 100)}%
          </span>
        </div>

        <button style={styles.resetButton} onClick={(e) => { e.stopPropagation(); resetCurrentLetter(); }}>
          🔄 התחל מחדש
        </button>
      </div>
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
    gap: '12px',
    overflow: 'hidden'
  },
  wordDisplay: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 2px 8px var(--shadow)'
  },
  wordLetter: {
    fontSize: '3rem',
    fontWeight: 900,
    transition: 'color 0.3s ease, transform 0.3s ease'
  },
  instruction: {
    textAlign: 'center',
    fontSize: '1.1rem',
    color: 'var(--text)'
  },
  currentLetterName: {
    fontWeight: 700,
    color: 'var(--primary)'
  },
  tracingContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'white',
    borderRadius: '24px',
    boxShadow: '0 4px 16px var(--shadow)',
    position: 'relative',
    overflow: 'hidden',
    minHeight: '200px'
  },
  letterGuide: {
    position: 'absolute',
    fontSize: '150px',
    fontWeight: 900,
    color: '#F3F4F6',
    pointerEvents: 'none',
    zIndex: 0
  },
  canvas: {
    position: 'relative',
    zIndex: 1,
    touchAction: 'none',
    cursor: 'crosshair'
  },
  tracingProgress: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  tracingProgressBar: {
    flex: 1,
    height: '12px',
    background: '#E5E7EB',
    borderRadius: '6px',
    overflow: 'hidden'
  },
  tracingProgressFill: {
    height: '100%',
    background: '#F97316',
    borderRadius: '6px',
    transition: 'width 0.2s ease'
  },
  tracingProgressText: {
    fontSize: '1rem',
    fontWeight: 700,
    color: '#F97316',
    minWidth: '48px',
    textAlign: 'left'
  },
  resetButton: {
    padding: '12px 24px',
    fontSize: '1rem',
    fontWeight: 600,
    background: 'white',
    color: 'var(--text)',
    border: '2px solid #E5E7EB',
    borderRadius: '16px',
    cursor: 'pointer'
  },
  completeContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px',
    gap: '12px'
  },
  completeEmoji: {
    fontSize: '80px',
    animation: 'bounce 1s ease infinite'
  },
  completeTitle: {
    fontSize: '2rem',
    fontWeight: 900,
    color: '#F97316',
    margin: 0
  },
  completedWord: {
    fontSize: '4rem',
    fontWeight: 900,
    color: '#F97316',
    textShadow: '0 4px 8px rgba(249, 115, 22, 0.3)'
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
    background: '#F97316',
    color: 'white',
    border: 'none',
    borderRadius: '24px',
    cursor: 'pointer',
    boxShadow: '0 4px 0 #EA580C, 0 6px 12px var(--shadow)'
  }
};
