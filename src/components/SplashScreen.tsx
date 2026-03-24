import { useEffect, useState } from 'react';
import { speak } from '../utils/speech';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const speakTimer = setTimeout(() => {
      speak('מיקי מלמדת!');
    }, 500);

    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2500);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearTimeout(speakTimer);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div style={{
      ...styles.container,
      opacity: fadeOut ? 0 : 1,
      transition: 'opacity 0.5s ease'
    }}>
      <div style={styles.imageContainer}>
        <img
          src="/miki/miki-logo.png"
          alt="מיקי"
          style={styles.mikiImage}
        />
      </div>
      <h1 style={styles.title}>מיקי מלמדת!</h1>
      <div style={styles.stars}>✨ 🌟 ✨</div>
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
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(180deg, #FFF5F9 0%, #FFE4F0 50%, #E0F7FA 100%)',
    zIndex: 9999,
    gap: '20px'
  },
  imageContainer: {
    width: '250px',
    height: '250px',
    borderRadius: '50%',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(255, 77, 166, 0.3)',
    border: '4px solid white',
    background: 'white'
  },
  mikiImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'top center'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 900,
    color: '#FF4DA6',
    textShadow: '0 4px 8px rgba(255, 77, 166, 0.3)',
    margin: 0,
    textAlign: 'center'
  },
  stars: {
    fontSize: '2rem',
    animation: 'pulse 1s ease infinite'
  }
};
