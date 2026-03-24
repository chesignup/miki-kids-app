import { soundManager } from '../utils/sounds';

interface TopBarProps {
  title?: string;
  stars: number;
  soundEnabled: boolean;
  onBack?: () => void;
  onSoundToggle: () => void;
  showBack?: boolean;
}

export function TopBar({
  title,
  stars,
  soundEnabled,
  onBack,
  onSoundToggle,
  showBack = true
}: TopBarProps) {
  const handleBack = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    soundManager.tap();
    onBack?.();
  };

  const handleSoundToggle = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    soundManager.tap();
    onSoundToggle();
  };

  return (
    <header style={styles.header}>
      <div style={styles.leftSection}>
        {showBack && onBack && (
          <button
            style={styles.backButton}
            onClick={handleBack}
            onTouchEnd={handleBack}
            aria-label="חזרה"
          >
            →
          </button>
        )}
      </div>

      {title && <h1 style={styles.title}>{title}</h1>}

      <div style={styles.rightSection}>
        <div style={styles.starBadge}>
          <span style={styles.starIcon}>⭐</span>
          <span style={styles.starCount}>{stars}</span>
        </div>

        <button
          style={styles.soundButton}
          onClick={handleSoundToggle}
          onTouchEnd={handleSoundToggle}
          aria-label={soundEnabled ? 'השתק צלילים' : 'הפעל צלילים'}
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>
      </div>
    </header>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
    boxShadow: '0 4px 12px var(--shadow)',
    minHeight: '64px',
    gap: '12px'
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    minWidth: '48px'
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  backButton: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    fontSize: '1.5rem',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background 0.15s ease'
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: 'white',
    fontSize: '1.25rem',
    fontWeight: 700,
    margin: 0,
    textShadow: '0 2px 4px rgba(0,0,0,0.2)'
  },
  starBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'var(--secondary)',
    padding: '8px 14px',
    borderRadius: '24px',
    boxShadow: '0 2px 8px var(--shadow)'
  },
  starIcon: {
    fontSize: '1.2rem'
  },
  starCount: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: 'var(--text)'
  },
  soundButton: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    fontSize: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background 0.15s ease'
  }
};
