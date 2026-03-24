interface MikiMascotProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  animated?: boolean;
}

export function MikiMascot({ size = 'medium', message, animated = false }: MikiMascotProps) {
  const sizeMap = {
    small: 60,
    medium: 100,
    large: 150
  };

  const fontSize = sizeMap[size];

  return (
    <div style={styles.container}>
      <div
        style={{
          ...styles.mascot,
          fontSize: `${fontSize}px`,
          animation: animated ? 'bounce 1s ease infinite' : 'none'
        }}
      >
        🌟
      </div>
      {message && (
        <div style={styles.speechBubble}>
          <p style={styles.message}>{message}</p>
          <div style={styles.bubbleTail} />
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px'
  },
  mascot: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textShadow: '0 4px 12px rgba(255, 215, 0, 0.5)'
  },
  speechBubble: {
    position: 'relative',
    background: 'white',
    borderRadius: '20px',
    padding: '16px 24px',
    boxShadow: '0 4px 16px var(--shadow)',
    maxWidth: '280px'
  },
  message: {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: 500,
    textAlign: 'center',
    color: 'var(--text)'
  },
  bubbleTail: {
    position: 'absolute',
    top: '-10px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 0,
    height: 0,
    borderLeft: '10px solid transparent',
    borderRight: '10px solid transparent',
    borderBottom: '10px solid white'
  }
};
