import { useEffect, useState } from 'react';

interface CelebrationProps {
  active: boolean;
  onComplete?: () => void;
}

const COLORS = ['#FF4DA6', '#FFD700', '#7C3AED', '#22C55E', '#3B82F6', '#F97316'];

interface ConfettiPiece {
  id: number;
  left: number;
  delay: number;
  color: string;
  rotation: number;
  size: number;
}

export function Celebration({ active, onComplete }: CelebrationProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (active) {
      const newPieces: ConfettiPiece[] = [];
      for (let i = 0; i < 30; i++) {
        newPieces.push({
          id: i,
          left: Math.random() * 100,
          delay: Math.random() * 0.5,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          rotation: Math.random() * 360,
          size: 8 + Math.random() * 8
        });
      }
      setPieces(newPieces);
      setVisible(true);

      const timer = setTimeout(() => {
        setVisible(false);
        setPieces([]);
        onComplete?.();
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [active, onComplete]);

  if (!visible || pieces.length === 0) return null;

  return (
    <div style={styles.container}>
      {pieces.map(piece => (
        <div
          key={piece.id}
          style={{
            ...styles.piece,
            left: `${piece.left}%`,
            animationDelay: `${piece.delay}s`,
            backgroundColor: piece.color,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            transform: `rotate(${piece.rotation}deg)`
          }}
        />
      ))}
      <div style={styles.starBurst}>🌟</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 1000,
    overflow: 'hidden'
  },
  piece: {
    position: 'absolute',
    top: '-20px',
    borderRadius: '2px',
    animation: 'confettiFall 2s ease-out forwards'
  },
  starBurst: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '80px',
    animation: 'starPop 0.5s ease forwards'
  }
};
