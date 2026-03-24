interface MikiMascotProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  animated?: boolean;
  variant?: 'pointing' | 'logo' | 'dog';
}

export function MikiMascot({ 
  size = 'medium', 
  message, 
  animated = false,
  variant = 'pointing'
}: MikiMascotProps) {
  const sizeMap = {
    small: 80,
    medium: 120,
    large: 180
  };

  const imageSize = sizeMap[size];
  
  const imageMap = {
    pointing: '/miki/miki-pointing.png',
    logo: '/miki/miki-logo.png',
    dog: '/miki/miki-dog.png'
  };

  return (
    <div style={styles.container}>
      <div
        style={{
          ...styles.imageWrapper,
          width: `${imageSize}px`,
          height: `${imageSize}px`,
          animation: animated ? 'bounce 2s ease infinite' : 'none'
        }}
      >
        <img
          src={imageMap[variant]}
          alt="מיקי"
          style={styles.image}
          loading="lazy"
        />
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
  imageWrapper: {
    borderRadius: '50%',
    overflow: 'hidden',
    boxShadow: '0 6px 20px rgba(255, 77, 166, 0.25)',
    border: '3px solid white',
    background: 'white'
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'top center'
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
    fontWeight: 600,
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
