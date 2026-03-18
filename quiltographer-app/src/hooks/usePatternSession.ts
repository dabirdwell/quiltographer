'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { ReaderPattern } from '@/lib/reader/schema';

export interface PatternSession {
  pattern: ReaderPattern;
  currentStepIndex: number;
  completedSteps: number[];
  checkedMaterials: string[];
  lastAccessed: string; // ISO date
}

const STORAGE_PREFIX = 'quiltographer-pattern-session:';

function storageKey(fileName: string): string {
  return `${STORAGE_PREFIX}${fileName}`;
}

/**
 * Provides localStorage persistence for pattern reading sessions.
 * Each pattern is stored under its source.fileName so different
 * patterns don't overwrite each other.
 */
export function usePatternSession() {
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const saveSession = useCallback((data: PatternSession) => {
    const fileName = data.pattern.source.fileName;
    if (!fileName) return;

    // Debounce writes — 500ms
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      try {
        const toStore: PatternSession = {
          ...data,
          lastAccessed: new Date().toISOString(),
        };
        localStorage.setItem(storageKey(fileName), JSON.stringify(toStore));
      } catch (e) {
        console.warn('Failed to save pattern session:', e);
      }
    }, 500);
  }, []);

  const loadSession = useCallback((fileName: string): PatternSession | null => {
    try {
      const raw = localStorage.getItem(storageKey(fileName));
      if (!raw) return null;
      return JSON.parse(raw) as PatternSession;
    } catch (e) {
      console.warn('Failed to load pattern session:', e);
      return null;
    }
  }, []);

  const clearSession = useCallback((fileName: string) => {
    try {
      localStorage.removeItem(storageKey(fileName));
    } catch (e) {
      console.warn('Failed to clear pattern session:', e);
    }
  }, []);

  /**
   * Look for any saved session to offer a resume prompt on page load.
   * Returns the most recently accessed session, or null.
   */
  const findLatestSession = useCallback((): PatternSession | null => {
    try {
      let latest: PatternSession | null = null;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith(STORAGE_PREFIX)) continue;

        const raw = localStorage.getItem(key);
        if (!raw) continue;

        const session = JSON.parse(raw) as PatternSession;
        if (!latest || session.lastAccessed > latest.lastAccessed) {
          latest = session;
        }
      }

      return latest;
    } catch (e) {
      console.warn('Failed to find latest session:', e);
      return null;
    }
  }, []);

  return { saveSession, loadSession, clearSession, findLatestSession };
}

export default usePatternSession;
