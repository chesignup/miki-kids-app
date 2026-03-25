import { useEffect } from 'react';

/**
 * Pauses decorative CSS animations when the document is hidden (battery / UX).
 */
export function useVisibilityAnimation(): void {
  useEffect(() => {
    const root = document.documentElement;

    const sync = () => {
      if (document.hidden) {
        root.classList.add('app-paused');
      } else {
        root.classList.remove('app-paused');
      }
    };

    sync();
    document.addEventListener('visibilitychange', sync);
    return () => {
      document.removeEventListener('visibilitychange', sync);
      root.classList.remove('app-paused');
    };
  }, []);
}
