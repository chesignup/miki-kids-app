import { useRef, useCallback, useEffect } from 'react';
import type { MutableRefObject, MouseEvent, TouchEvent } from 'react';
import type { LetterData, Point } from '../data/hebrewLetters';
import { isNearWaypoint } from '../data/hebrewLetters';
import { soundManager } from '../utils/sounds';

const N = 200;
const WAYPOINT_THRESHOLD = 34;

type Props = {
  letter: LetterData;
  busyRef: MutableRefObject<boolean>;
  onComplete: () => void;
  disabled?: boolean;
};

export function TracingCanvas({ letter, busyRef, onComplete, disabled }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const waypointIndexRef = useRef(0);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<Point | null>(null);
  const completedRef = useRef(false);
  const dprRef = useRef(1);

  const path = letter.path;

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const scale = w / N;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.scale(scale, scale);
    ctx.font = 'bold 118px "Heebo", system-ui, sans-serif';
    ctx.fillStyle = 'rgba(200, 160, 220, 0.28)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letter.letter, N / 2, N / 2 + 6);
    ctx.restore();

    const wi = waypointIndexRef.current;
    path.forEach((p, i) => {
      const px = p.x * scale;
      const py = p.y * scale;
      ctx.beginPath();
      ctx.arc(px, py, i < wi ? 9 : 6, 0, Math.PI * 2);
      ctx.fillStyle = i < wi ? 'var(--trace-done)' : 'var(--trace-dot)';
      ctx.fill();
    });
  }, [letter.letter, path]);

  useEffect(() => {
    waypointIndexRef.current = 0;
    completedRef.current = false;
    drawingRef.current = false;
    lastPointRef.current = null;
    drawFrame();
  }, [letter.letter, drawFrame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      dprRef.current = dpr;
      const cssW = Math.max(rect.width, 1);
      const cssH = Math.max(rect.height, 1);
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      drawFrame();
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [drawFrame]);

  const toNorm = (clientX: number, clientY: number): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * N;
    const y = ((clientY - rect.top) / rect.height) * N;
    return { x, y };
  };

  const strokeTo = (p: Point) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const scale = canvas.width / N;

    const last = lastPointRef.current;
    ctx.save();
    ctx.scale(scale, scale);
    ctx.strokeStyle = 'var(--trace-ink)';
    ctx.lineWidth = 3.2 / scale;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    if (last) {
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(p.x, p.y);
    } else {
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + 0.1, p.y);
    }
    ctx.stroke();
    ctx.restore();

    lastPointRef.current = p;

    const idx = waypointIndexRef.current;
    if (idx < path.length && isNearWaypoint(p, path[idx], WAYPOINT_THRESHOLD)) {
      waypointIndexRef.current = idx + 1;
      soundManager.checkpoint();
      drawFrame();
      if (waypointIndexRef.current >= path.length && !completedRef.current) {
        completedRef.current = true;
        onComplete();
      }
    }
  };

  const handleStart = (clientX: number, clientY: number) => {
    if (disabled || busyRef.current || completedRef.current) return;
    const p = toNorm(clientX, clientY);
    if (!p) return;
    drawingRef.current = true;
    lastPointRef.current = null;
    soundManager.dragStart();
    strokeTo(p);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!drawingRef.current || disabled || busyRef.current || completedRef.current) return;
    const p = toNorm(clientX, clientY);
    if (!p) return;
    strokeTo(p);
  };

  const handleEnd = () => {
    drawingRef.current = false;
    lastPointRef.current = null;
    soundManager.dragEnd();
  };

  const onMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    e.stopPropagation();
    handleStart(e.clientX, e.clientY);
  };
  const onMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    e.stopPropagation();
    if (e.buttons !== 1) return;
    handleMove(e.clientX, e.clientY);
  };
  const onMouseUp = (e: MouseEvent<HTMLCanvasElement>) => {
    e.stopPropagation();
    handleEnd();
  };
  const onMouseLeave = (e: MouseEvent<HTMLCanvasElement>) => {
    e.stopPropagation();
    handleEnd();
  };

  const onTouchStart = (e: TouchEvent<HTMLCanvasElement>) => {
    e.stopPropagation();
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    handleStart(t.clientX, t.clientY);
  };
  const onTouchMove = (e: TouchEvent<HTMLCanvasElement>) => {
    e.stopPropagation();
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    handleMove(t.clientX, t.clientY);
  };
  const onTouchEnd = (e: TouchEvent<HTMLCanvasElement>) => {
    e.stopPropagation();
    handleEnd();
  };

  return (
    <canvas
      ref={canvasRef}
      className="tracing-canvas"
      aria-label={`מסלול האות ${letter.name}`}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    />
  );
}
