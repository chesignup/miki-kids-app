import { useState, useEffect, useCallback } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { MainMenu } from './pages/MainMenu';
import { CountingGame } from './pages/CountingGame';
import { NumberGame } from './pages/NumberGame';
import { LetterTracing } from './pages/LetterTracing';
import { WordTracing } from './pages/WordTracing';
import { loadProgress, loadSettings, saveSettings } from './utils/storage';
import { soundManager } from './utils/sounds';
import { cancelSpeech } from './utils/speech';

type Screen = 'splash' | 'menu' | 'counting' | 'number' | 'letter' | 'word';

export default function App() {
  const [screen, setScreen] = useState<Screen>('splash');
  const [stars, setStars] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const progress = loadProgress();
    setStars(progress.stars);

    const settings = loadSettings();
    setSoundEnabled(settings.soundEnabled);
    soundManager.enabled = settings.soundEnabled;
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelSpeech();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleSoundToggle = useCallback(() => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    soundManager.enabled = newValue;
    saveSettings({ soundEnabled: newValue });
    
    if (!newValue) {
      cancelSpeech();
    }
  }, [soundEnabled]);

  const handleStarsUpdate = useCallback((newStars: number) => {
    setStars(newStars);
  }, []);

  const goToMenu = useCallback(() => {
    cancelSpeech();
    setScreen('menu');
    const progress = loadProgress();
    setStars(progress.stars);
  }, []);

  const handleSplashComplete = useCallback(() => {
    setScreen('menu');
  }, []);

  const renderScreen = () => {
    switch (screen) {
      case 'splash':
        return <SplashScreen onComplete={handleSplashComplete} />;
      case 'menu':
        return (
          <MainMenu
            stars={stars}
            soundEnabled={soundEnabled}
            onSoundToggle={handleSoundToggle}
            onSelectGame={(game) => setScreen(game as Screen)}
          />
        );
      case 'counting':
        return (
          <CountingGame
            stars={stars}
            soundEnabled={soundEnabled}
            onSoundToggle={handleSoundToggle}
            onBack={goToMenu}
            onStarsUpdate={handleStarsUpdate}
          />
        );
      case 'number':
        return (
          <NumberGame
            stars={stars}
            soundEnabled={soundEnabled}
            onSoundToggle={handleSoundToggle}
            onBack={goToMenu}
            onStarsUpdate={handleStarsUpdate}
          />
        );
      case 'letter':
        return (
          <LetterTracing
            stars={stars}
            soundEnabled={soundEnabled}
            onSoundToggle={handleSoundToggle}
            onBack={goToMenu}
            onStarsUpdate={handleStarsUpdate}
          />
        );
      case 'word':
        return (
          <WordTracing
            stars={stars}
            soundEnabled={soundEnabled}
            onSoundToggle={handleSoundToggle}
            onBack={goToMenu}
            onStarsUpdate={handleStarsUpdate}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div style={styles.app}>
      {renderScreen()}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  app: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  }
};
