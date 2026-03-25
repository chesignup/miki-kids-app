import type { MouseEvent, TouchEvent } from 'react';
import { cancelSpeech } from '../utils/speech';
import { soundManager } from '../utils/sounds';
import { saveSoundEnabled } from '../utils/storage';

type Props = {
  title: string;
  onBack: () => void;
  soundOn: boolean;
  onSoundToggle: (on: boolean) => void;
};

export function TopBar({ title, onBack, soundOn, onSoundToggle }: Props) {
  const handleBackMouseDown = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    soundManager.click();
    cancelSpeech();
    onBack();
  };

  const handleBackTouchEnd = (e: TouchEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    soundManager.click();
    cancelSpeech();
    onBack();
  };

  const toggleMouseDown = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    soundManager.click();
    const next = !soundOn;
    soundManager.enabled = next;
    saveSoundEnabled(next);
    onSoundToggle(next);
  };

  const toggleTouchEnd = (e: TouchEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    soundManager.click();
    const next = !soundOn;
    soundManager.enabled = next;
    saveSoundEnabled(next);
    onSoundToggle(next);
  };

  return (
    <header className="top-bar">
      <button
        type="button"
        className="top-bar__back"
        aria-label="חזרה"
        onMouseDown={handleBackMouseDown}
        onTouchEnd={handleBackTouchEnd}
      >
        ←
      </button>
      <h1 className="top-bar__title">{title}</h1>
      <button
        type="button"
        className={`top-bar__sound ${soundOn ? 'is-on' : ''}`}
        aria-pressed={soundOn}
        aria-label={soundOn ? 'כבה צלילים' : 'הפעל צלילים'}
        onMouseDown={toggleMouseDown}
        onTouchEnd={toggleTouchEnd}
      >
        {soundOn ? '♪' : '✕'}
      </button>
    </header>
  );
}
