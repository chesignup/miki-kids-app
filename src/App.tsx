import { useCallback, useEffect, useMemo, useState } from 'react';
import { MainMenu, type ScreenId } from './pages/MainMenu';
import { QuantityMatchGame } from './pages/QuantityMatchGame';
import { NumberListenGame } from './pages/NumberListenGame';
import { HebrewLetterTraceGame } from './pages/HebrewLetterTraceGame';
import { WordDorTraceGame } from './pages/WordDorTraceGame';
import { useVisibilityAnimation } from './hooks/useVisibilityAnimation';
import { soundManager } from './utils/sounds';
import { loadSoundEnabled, loadTotalStars } from './utils/storage';

export default function App() {
  useVisibilityAnimation();

  const [screen, setScreen] = useState<ScreenId>('menu');
  const [soundOn, setSoundOn] = useState(() => loadSoundEnabled());
  const [stars, setStars] = useState(() => loadTotalStars());

  useEffect(() => {
    soundManager.enabled = soundOn;
  }, [soundOn]);

  const onStarsChange = useCallback((n: number) => {
    setStars(n);
  }, []);

  const goMenu = useCallback(() => {
    setScreen('menu');
  }, []);

  const navigate = useCallback((s: Exclude<ScreenId, 'menu'>) => {
    setScreen(s);
  }, []);

  const shellClass = useMemo(
    () => `app-shell ${screen === 'menu' ? 'app-shell--menu' : 'app-shell--game'}`,
    [screen],
  );

  return (
    <div className={shellClass} dir="rtl">
      {screen === 'menu' && <MainMenu totalStars={stars} onNavigate={navigate} />}

      {screen === 'quantities' && (
        <QuantityMatchGame
          soundOn={soundOn}
          onSoundToggle={setSoundOn}
          onBack={goMenu}
          onStarsChange={onStarsChange}
        />
      )}

      {screen === 'numbers' && (
        <NumberListenGame
          soundOn={soundOn}
          onSoundToggle={setSoundOn}
          onBack={goMenu}
          onStarsChange={onStarsChange}
        />
      )}

      {screen === 'letters' && (
        <HebrewLetterTraceGame
          soundOn={soundOn}
          onSoundToggle={setSoundOn}
          onBack={goMenu}
          onStarsChange={onStarsChange}
        />
      )}

      {screen === 'wordDor' && (
        <WordDorTraceGame
          soundOn={soundOn}
          onSoundToggle={setSoundOn}
          onBack={goMenu}
          onStarsChange={onStarsChange}
        />
      )}
    </div>
  );
}
