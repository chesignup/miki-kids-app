import { useCallback, useRef } from 'react';
import { CHARACTER_ASSETS } from '../data/characterAssets';
import { soundManager } from '../utils/sounds';
import { STR } from '../data/strings';

export type ScreenId =
  | 'menu'
  | 'quantities'
  | 'numbers'
  | 'letters'
  | 'wordDor';

type Props = {
  totalStars: number;
  onNavigate: (s: Exclude<ScreenId, 'menu'>) => void;
};

type Card = {
  id: Exclude<ScreenId, 'menu'>;
  title: string;
  desc: string;
  thumb: string;
  thumbAlt: string;
};

const CARDS: Card[] = [
  {
    id: 'quantities',
    title: STR.menuQuantities,
    desc: STR.menuQuantitiesDesc,
    thumb: CHARACTER_ASSETS.mickey,
    thumbAlt: '',
  },
  {
    id: 'numbers',
    title: STR.menuNumbers,
    desc: STR.menuNumbersDesc,
    thumb: CHARACTER_ASSETS.donald,
    thumbAlt: '',
  },
  {
    id: 'letters',
    title: STR.menuLetters,
    desc: STR.menuLettersDesc,
    thumb: CHARACTER_ASSETS.minnie,
    thumbAlt: '',
  },
  {
    id: 'wordDor',
    title: STR.menuWordDor,
    desc: STR.menuWordDorDesc,
    thumb: CHARACTER_ASSETS.minnieStar,
    thumbAlt: '',
  },
];

export function MainMenu({ totalStars, onNavigate }: Props) {
  const lastNav = useRef(0);

  const safeNavigate = useCallback(
    (id: Exclude<ScreenId, 'menu'>) => {
      const t = Date.now();
      if (t - lastNav.current < 420) return;
      lastNav.current = t;
      soundManager.click();
      onNavigate(id);
    },
    [onNavigate],
  );

  return (
    <div className="main-menu">
      <div className="main-menu__hero">
        <div className="main-menu__mascot" aria-hidden>
          <div className="main-menu__mascot-pair">
            <img
              className="main-menu__mascot-img main-menu__mascot-img--mickey"
              src={CHARACTER_ASSETS.mickey}
              alt=""
              loading="lazy"
              decoding="async"
            />
            <img
              className="main-menu__mascot-img main-menu__mascot-img--minnie"
              src={CHARACTER_ASSETS.minnie}
              alt=""
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="main-menu__mascot-friends">
            <img
              className="main-menu__friend-pill"
              src={CHARACTER_ASSETS.donald}
              alt=""
              loading="lazy"
              decoding="async"
            />
            <img
              className="main-menu__friend-pill"
              src={CHARACTER_ASSETS.minnieStar}
              alt=""
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
        <h1 className="main-menu__title">{STR.appTitle}</h1>
        {STR.tagline ? <p className="main-menu__tagline">{STR.tagline}</p> : null}
        <div className="main-menu__stars" aria-live="polite">
          <span className="main-menu__star-icon">⭐</span>
          <span>
            {STR.stars}: {totalStars}
          </span>
        </div>
      </div>

      <nav className="main-menu__grid" aria-label="משחקים">
        {CARDS.map((c) => (
          <button
            key={c.id}
            type="button"
            className="menu-card"
            onTouchStart={(e) => e.stopPropagation()}
            onMouseDown={(e) => {
              e.stopPropagation();
              safeNavigate(c.id);
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
              safeNavigate(c.id);
            }}
          >
            <span className="menu-card__thumb" aria-hidden>
              <img src={c.thumb} alt={c.thumbAlt} loading="lazy" decoding="async" />
            </span>
            <span className="menu-card__title">{c.title}</span>
            <span className="menu-card__desc">{c.desc}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
