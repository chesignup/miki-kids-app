import { useRef, useEffect, useCallback } from 'react';
import type { MutableRefObject } from 'react';

interface GameGuardResult {
  busyRef: MutableRefObject<boolean>;
  mountedRef: MutableRefObject<boolean>;
  lock: () => void;
  unlock: () => void;
  isLocked: () => boolean;
  safeSetTimeout: (callback: () => void, delay: number) => number;
  clearAllTimers: () => void;
}

export function useGameGuard(watchdogMs: number = 6000): GameGuardResult {
  const busyRef = useRef(false);
  const mountedRef = useRef(true);
  const watchdogRef = useRef<number | null>(null);
  const timersRef = useRef<Set<number>>(new Set());

  const clearWatchdog = useCallback(() => {
    if (watchdogRef.current !== null) {
      window.clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
    }
  }, []);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(id => window.clearTimeout(id));
    timersRef.current.clear();
    clearWatchdog();
  }, [clearWatchdog]);

  const unlock = useCallback(() => {
    busyRef.current = false;
    clearWatchdog();
  }, [clearWatchdog]);

  const lock = useCallback(() => {
    busyRef.current = true;
    clearWatchdog();
    
    watchdogRef.current = window.setTimeout(() => {
      if (mountedRef.current) {
        busyRef.current = false;
      }
    }, watchdogMs);
  }, [watchdogMs, clearWatchdog]);

  const isLocked = useCallback(() => busyRef.current, []);

  const safeSetTimeout = useCallback((callback: () => void, delay: number): number => {
    const id = window.setTimeout(() => {
      timersRef.current.delete(id);
      if (mountedRef.current) {
        callback();
      }
    }, delay);
    timersRef.current.add(id);
    return id;
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearAllTimers();
    };
  }, [clearAllTimers]);

  return {
    busyRef,
    mountedRef,
    lock,
    unlock,
    isLocked,
    safeSetTimeout,
    clearAllTimers
  };
}
