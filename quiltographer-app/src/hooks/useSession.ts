'use client';

import { useState, useEffect, useCallback } from 'react';

export interface SessionProgress {
  patternId: string;
  patternName: string;
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  lastPressDirection?: 'left' | 'right' | 'open' | 'toward-dark';
  pressDirections: Record<number, 'left' | 'right' | 'open' | 'toward-dark'>;
  cuttingChecklist: Record<string, boolean>;
  lastVisit: string; // ISO date string
  timeSpent: number; // minutes
}

export interface SessionState {
  currentSession: SessionProgress | null;
  previousSessions: SessionProgress[];
  isReturningUser: boolean;
  timeSinceLastVisit: number | null; // minutes
}

const STORAGE_KEY = 'quiltographer-session';
const SESSIONS_KEY = 'quiltographer-sessions';

export function useSession(patternId?: string, patternName?: string, totalSteps?: number) {
  const [session, setSessionState] = useState<SessionProgress | null>(null);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [timeSinceLastVisit, setTimeSinceLastVisit] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load or create session
  useEffect(() => {
    if (!patternId || !patternName || !totalSteps) {
      setIsLoaded(true);
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const allSessions = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]') as SessionProgress[];

      if (stored) {
        const parsed: SessionProgress = JSON.parse(stored);

        // Check if this is the same pattern
        if (parsed.patternId === patternId) {
          const lastVisitTime = new Date(parsed.lastVisit).getTime();
          const now = Date.now();
          const minutesSince = Math.floor((now - lastVisitTime) / (1000 * 60));

          // If more than 60 minutes, consider it a return visit
          if (minutesSince > 60) {
            setIsReturningUser(true);
            setTimeSinceLastVisit(minutesSince);
          }

          setSessionState(parsed);
        } else {
          // Different pattern - save old session and start new
          if (parsed.patternId) {
            const updatedSessions = [
              parsed,
              ...allSessions.filter(s => s.patternId !== parsed.patternId).slice(0, 9),
            ];
            localStorage.setItem(SESSIONS_KEY, JSON.stringify(updatedSessions));
          }

          // Create new session
          const newSession: SessionProgress = {
            patternId,
            patternName,
            currentStep: 1,
            totalSteps,
            completedSteps: [],
            pressDirections: {},
            cuttingChecklist: {},
            lastVisit: new Date().toISOString(),
            timeSpent: 0,
          };
          setSessionState(newSession);
        }
      } else {
        // No previous session - create new
        const newSession: SessionProgress = {
          patternId,
          patternName,
          currentStep: 1,
          totalSteps,
          completedSteps: [],
          pressDirections: {},
          cuttingChecklist: {},
          lastVisit: new Date().toISOString(),
          timeSpent: 0,
        };
        setSessionState(newSession);
      }
    } catch (e) {
      console.warn('Failed to load session:', e);
    }
    setIsLoaded(true);
  }, [patternId, patternName, totalSteps]);

  // Auto-save session on changes
  useEffect(() => {
    if (session && isLoaded) {
      try {
        const updated = {
          ...session,
          lastVisit: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save session:', e);
      }
    }
  }, [session, isLoaded]);

  // Update current step
  const setCurrentStep = useCallback((step: number) => {
    setSessionState(prev => prev ? { ...prev, currentStep: step } : null);
  }, []);

  // Mark step as completed
  const completeStep = useCallback((step: number) => {
    setSessionState(prev => {
      if (!prev) return null;
      const completed = prev.completedSteps.includes(step)
        ? prev.completedSteps
        : [...prev.completedSteps, step].sort((a, b) => a - b);
      return { ...prev, completedSteps: completed };
    });
  }, []);

  // Record press direction for a step
  const recordPressDirection = useCallback((
    step: number,
    direction: 'left' | 'right' | 'open' | 'toward-dark'
  ) => {
    setSessionState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        lastPressDirection: direction,
        pressDirections: { ...prev.pressDirections, [step]: direction },
      };
    });
  }, []);

  // Toggle cutting checklist item
  const toggleCuttingItem = useCallback((itemId: string) => {
    setSessionState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        cuttingChecklist: {
          ...prev.cuttingChecklist,
          [itemId]: !prev.cuttingChecklist[itemId],
        },
      };
    });
  }, []);

  // Reset cutting checklist
  const resetCuttingChecklist = useCallback(() => {
    setSessionState(prev => prev ? { ...prev, cuttingChecklist: {} } : null);
  }, []);

  // Dismiss returning user message
  const dismissReturnMessage = useCallback(() => {
    setIsReturningUser(false);
    setTimeSinceLastVisit(null);
  }, []);

  // Get suggested next press direction (for nesting)
  const getSuggestedPressDirection = useCallback((step: number): 'left' | 'right' | null => {
    if (!session) return null;

    // Look at previous press direction
    const prevStep = step - 1;
    const prevDirection = session.pressDirections[prevStep];

    if (prevDirection === 'left') return 'right';
    if (prevDirection === 'right') return 'left';

    return null;
  }, [session]);

  // Get progress summary for welcome back message
  const getProgressSummary = useCallback((): {
    stepsCompleted: number;
    percentComplete: number;
    lastPressInfo: string | null;
    nextPressHint: string | null;
  } | null => {
    if (!session) return null;

    const stepsCompleted = session.completedSteps.length;
    const percentComplete = Math.round((stepsCompleted / session.totalSteps) * 100);

    let lastPressInfo: string | null = null;
    let nextPressHint: string | null = null;

    if (session.lastPressDirection) {
      const directionText = {
        'left': 'LEFT',
        'right': 'RIGHT',
        'open': 'OPEN',
        'toward-dark': 'TOWARD DARK FABRIC',
      };
      lastPressInfo = `Last press direction: ${directionText[session.lastPressDirection]}`;

      // Suggest opposite for nesting
      if (session.lastPressDirection === 'left') {
        nextPressHint = 'Press this row RIGHT to nest seams';
      } else if (session.lastPressDirection === 'right') {
        nextPressHint = 'Press this row LEFT to nest seams';
      }
    }

    return { stepsCompleted, percentComplete, lastPressInfo, nextPressHint };
  }, [session]);

  // Format time since last visit
  const formatTimeSince = useCallback((): string | null => {
    if (!timeSinceLastVisit) return null;

    if (timeSinceLastVisit < 60) {
      return `${timeSinceLastVisit} minutes ago`;
    } else if (timeSinceLastVisit < 60 * 24) {
      const hours = Math.floor(timeSinceLastVisit / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(timeSinceLastVisit / (60 * 24));
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  }, [timeSinceLastVisit]);

  // Clear session
  const clearSession = useCallback(() => {
    setSessionState(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear session:', e);
    }
  }, []);

  return {
    session,
    isLoaded,
    isReturningUser,
    timeSinceLastVisit,
    setCurrentStep,
    completeStep,
    recordPressDirection,
    toggleCuttingItem,
    resetCuttingChecklist,
    dismissReturnMessage,
    getSuggestedPressDirection,
    getProgressSummary,
    formatTimeSince,
    clearSession,
  };
}

export default useSession;
