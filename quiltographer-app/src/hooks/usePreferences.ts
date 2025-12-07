'use client';

import { useState, useEffect, useCallback } from 'react';

export interface TooltipPreferences {
  enabled: boolean;
  showTermDefinitions: boolean;
  showTechniqueTips: boolean;
  showWarnings: boolean;
  showCheckpoints: boolean;
  experienceLevel: 'beginner' | 'intermediate' | 'experienced';
}

export interface ReaderPreferences {
  tooltips: TooltipPreferences;
  units: 'imperial' | 'metric';
  fontSize: 'normal' | 'large' | 'xlarge';
  theme: 'light' | 'auto';
  showEncouragement: boolean;
  showSeasonalMessages: boolean;
}

const DEFAULT_PREFERENCES: ReaderPreferences = {
  tooltips: {
    enabled: true,
    showTermDefinitions: true,
    showTechniqueTips: true,
    showWarnings: true,
    showCheckpoints: true,
    experienceLevel: 'beginner',
  },
  units: 'imperial',
  fontSize: 'normal',
  theme: 'light',
  showEncouragement: true,
  showSeasonalMessages: true,
};

const STORAGE_KEY = 'quiltographer-preferences';

export function usePreferences() {
  const [preferences, setPreferencesState] = useState<ReaderPreferences>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to handle new fields
        setPreferencesState({
          ...DEFAULT_PREFERENCES,
          ...parsed,
          tooltips: {
            ...DEFAULT_PREFERENCES.tooltips,
            ...parsed.tooltips,
          },
        });
      }
    } catch (e) {
      console.warn('Failed to load preferences:', e);
    }
    setIsLoaded(true);
  }, []);

  // Save preferences to localStorage
  const setPreferences = useCallback((
    updater: ReaderPreferences | ((prev: ReaderPreferences) => ReaderPreferences)
  ) => {
    setPreferencesState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to save preferences:', e);
      }
      return next;
    });
  }, []);

  // Update tooltip preferences
  const setTooltipPreferences = useCallback((
    updater: Partial<TooltipPreferences> | ((prev: TooltipPreferences) => TooltipPreferences)
  ) => {
    setPreferences(prev => ({
      ...prev,
      tooltips: typeof updater === 'function'
        ? updater(prev.tooltips)
        : { ...prev.tooltips, ...updater },
    }));
  }, [setPreferences]);

  // Toggle a specific tooltip type
  const toggleTooltipType = useCallback((
    type: keyof Omit<TooltipPreferences, 'experienceLevel' | 'enabled'>
  ) => {
    setTooltipPreferences(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  }, [setTooltipPreferences]);

  // Set experience level (affects which tooltips show by default)
  const setExperienceLevel = useCallback((level: TooltipPreferences['experienceLevel']) => {
    setTooltipPreferences(prev => ({
      ...prev,
      experienceLevel: level,
      // Auto-adjust tooltip visibility based on level
      showTermDefinitions: level !== 'experienced',
      showTechniqueTips: level !== 'experienced',
      showCheckpoints: level === 'beginner',
    }));
  }, [setTooltipPreferences]);

  // Toggle units between imperial and metric
  const toggleUnits = useCallback(() => {
    setPreferences(prev => ({
      ...prev,
      units: prev.units === 'imperial' ? 'metric' : 'imperial',
    }));
  }, [setPreferences]);

  // Reset to defaults
  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
  }, [setPreferences]);

  // Check if a tooltip should show based on preferences and type
  const shouldShowTooltip = useCallback((type: 'term' | 'warning' | 'tip' | 'checkpoint' | 'tool'): boolean => {
    if (!preferences.tooltips.enabled) return false;

    switch (type) {
      case 'term':
        return preferences.tooltips.showTermDefinitions;
      case 'warning':
        return preferences.tooltips.showWarnings;
      case 'tip':
        return preferences.tooltips.showTechniqueTips;
      case 'checkpoint':
        return preferences.tooltips.showCheckpoints;
      case 'tool':
        return preferences.tooltips.showTermDefinitions;
      default:
        return true;
    }
  }, [preferences.tooltips]);

  return {
    preferences,
    isLoaded,
    setPreferences,
    setTooltipPreferences,
    toggleTooltipType,
    setExperienceLevel,
    toggleUnits,
    resetPreferences,
    shouldShowTooltip,
  };
}

export default usePreferences;
