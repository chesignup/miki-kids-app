import { CHARACTER_ASSETS } from '../data/characterAssets';

type Props = {
  active: boolean;
  onDone?: () => void;
};

/** One-shot burst; pauses when document is hidden via `.app-paused` on html. */
export function CelebrationBurst({ active, onDone }: Props) {
  if (!active) return null;

  return (
    <div
      className="celebration"
      role="presentation"
      onAnimationEnd={onDone}
    >
      <span className="celebration__spark celebration__spark--1" />
      <span className="celebration__spark celebration__spark--2" />
      <span className="celebration__spark celebration__spark--3" />
      <span className="celebration__spark celebration__spark--4" />
      <span className="celebration__mascot" aria-hidden>
        <img
          className="celebration__mascot-img"
          src={CHARACTER_ASSETS.minnieStar}
          alt=""
          loading="lazy"
          decoding="async"
        />
      </span>
    </div>
  );
}
