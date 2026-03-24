import { useEffect } from 'react';
import { MikiMascot } from '../components/MikiMascot';
import { soundManager } from '../utils/sounds';
import { speak } from '../utils/speech';

interface MainMenuProps {
  stars: number;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  onSelectGame: (game: string) => void;
}

const GAMES = [
  {
    id: 'counting',
    title: 'ספירה',
    subtitle: 'כמה יש?',
    emoji: '🔢',
    color: '#FF4DA6'
  },
  {
    id: 'number',
    title: 'מספרים',
    subtitle: 'מצאי את המספר',
    emoji: '🎯',
    color: '#7C3AED'
  },
  {
    id: 'letter',
    title: 'אותיות',
    subtitle: 'עקבי אחרי האות',
    emoji: '✏️',
    color: '#22C55E'
  },
  {
    id: 'word',
    title: 'כתיבה',
    subtitle: 'כתבי דור',
    emoji: '📝',
    color: '#F97316'
  }
];

export function MainMenu({ stars, soundEnabled, onSoundToggle, onSelectGame }: MainMenuProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      speak('שלום! בואי נשחק ונלמד ביחד!');
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleGameSelect = (gameId: string) => {
    soundManager.click();
    onSelectGame(gameId);
  };

  const handleSoundToggle = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    soundManager.tap();
    onSoundToggle();
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>מיקי מלמדת</h1>
          <div style={styles.headerRight}>
            <div style={styles.starBadge}>
              <span>⭐</span>
              <span style={styles.starCount}>{stars}</span>
            </div>
            <button
              style={styles.soundButton}
              onClick={handleSoundToggle}
              onTouchEnd={handleSoundToggle}
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <MikiMascot 
          size="large" 
          message="בואי נשחק!" 
          animated={false}
          variant="pointing"
        />

        <div style={styles.gamesGrid}>
          {GAMES.map((game, index) => (
            <button
              key={game.id}
              style={{
                ...styles.gameCard,
                animationDelay: `${index * 0.1}s`,
                borderTop: `4px solid ${game.color}`
              }}
              onClick={() => handleGameSelect(game.id)}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleGameSelect(game.id);
              }}
            >
              <span style={styles.gameEmoji}>{game.emoji}</span>
              <span style={styles.gameTitle}>{game.title}</span>
              <span style={styles.gameSubtitle}>{game.subtitle}</span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    background: 'linear-gradient(180deg, var(--bg) 0%, #FFE4F0 100%)'
  },
  header: {
    padding: '16px',
    background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
    boxShadow: '0 4px 12px var(--shadow)'
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 900,
    color: 'white',
    textShadow: '0 2px 4px rgba(0,0,0,0.2)'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  starBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'var(--secondary)',
    padding: '8px 14px',
    borderRadius: '24px',
    fontSize: '1.1rem',
    fontWeight: 700,
    boxShadow: '0 2px 8px var(--shadow)'
  },
  starCount: {
    color: 'var(--text)'
  },
  soundButton: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '24px 16px',
    gap: '24px',
    overflowY: 'auto'
  },
  gamesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    width: '100%',
    maxWidth: '400px'
  },
  gameCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px 12px',
    background: 'white',
    borderRadius: '24px',
    boxShadow: '0 6px 20px var(--shadow)',
    border: 'none',
    cursor: 'pointer',
    minHeight: '140px',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    animation: 'slideUp 0.4s ease backwards'
  },
  gameEmoji: {
    fontSize: '2.5rem',
    marginBottom: '8px'
  },
  gameTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--text)',
    marginBottom: '4px'
  },
  gameSubtitle: {
    fontSize: '0.875rem',
    color: 'var(--text-light)',
    textAlign: 'center'
  }
};
