'use client';

import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import { usePreferences, TooltipPreferences } from '@/hooks/usePreferences';
import { QUILTING_GLOSSARY, GlossaryTerm } from '@/lib/reader/glossary';

interface TooltipContextValue {
  glossary: Record<string, GlossaryTerm>;
  preferences: TooltipPreferences;
  shouldShowTooltip: (type: 'term' | 'warning' | 'tip' | 'checkpoint' | 'tool') => boolean;
  toggleTooltipType: (type: keyof Omit<TooltipPreferences, 'experienceLevel' | 'enabled'>) => void;
  setExperienceLevel: (level: TooltipPreferences['experienceLevel']) => void;
  setTooltipsEnabled: (enabled: boolean) => void;
}

const TooltipContext = createContext<TooltipContextValue | null>(null);

export function TooltipProvider({ children }: { children: ReactNode }) {
  const {
    preferences,
    setTooltipPreferences,
    toggleTooltipType,
    setExperienceLevel,
    shouldShowTooltip,
  } = usePreferences();

  const setTooltipsEnabled = useCallback((enabled: boolean) => {
    setTooltipPreferences({ enabled });
  }, [setTooltipPreferences]);

  const value: TooltipContextValue = {
    glossary: QUILTING_GLOSSARY,
    preferences: preferences.tooltips,
    shouldShowTooltip,
    toggleTooltipType,
    setExperienceLevel,
    setTooltipsEnabled,
  };

  return (
    <TooltipContext.Provider value={value}>
      {children}
    </TooltipContext.Provider>
  );
}

export function useTooltipContext() {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error('useTooltipContext must be used within a TooltipProvider');
  }
  return context;
}

// Settings panel component for tooltip preferences
export function TooltipSettings() {
  const {
    preferences,
    toggleTooltipType,
    setExperienceLevel,
    setTooltipsEnabled,
  } = useTooltipContext();

  const theme = {
    colors: {
      washi: '#fdf4e3',
      washiDark: '#f9f0dc',
      rice: '#fefdfb',
      inkBlack: '#2d2d2d',
      inkGray: '#6b7280',
      sage: '#84a98c',
      indigo: '#264653',
      persimmon: '#e76f51',
    },
    typography: {
      fontSize: { xs: '0.75rem', sm: '0.875rem', base: '1rem' },
      fontFamily: { body: '"Noto Sans JP", sans-serif' },
    },
    spacing: { breathe: '1.5rem' },
    radius: { md: '0.5rem', lg: '0.75rem' },
    borders: { hairline: '1px solid rgba(0, 0, 0, 0.06)' },
    timing: { quick: '200ms', easeOut: 'cubic-bezier(0.4, 0, 0.2, 1)' },
  };

  return (
    <div style={{
      backgroundColor: theme.colors.washi,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.breathe,
    }}>
      <h3 style={{
        margin: '0 0 1rem 0',
        color: theme.colors.indigo,
        fontSize: theme.typography.fontSize.base,
        fontWeight: 600,
      }}>
        Tooltip Settings
      </h3>

      {/* Master toggle */}
      <label style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1rem',
        cursor: 'pointer',
      }}>
        <input
          type="checkbox"
          checked={preferences.enabled}
          onChange={(e) => setTooltipsEnabled(e.target.checked)}
          style={{ width: '18px', height: '18px' }}
        />
        <span style={{ fontWeight: 500, color: theme.colors.inkBlack }}>
          Show tooltips
        </span>
      </label>

      {/* Experience level */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontSize: theme.typography.fontSize.sm,
          color: theme.colors.inkGray,
        }}>
          Experience level
        </label>
        <select
          value={preferences.experienceLevel}
          onChange={(e) => setExperienceLevel(e.target.value as TooltipPreferences['experienceLevel'])}
          disabled={!preferences.enabled}
          style={{
            width: '100%',
            padding: '0.5rem',
            borderRadius: theme.radius.md,
            border: theme.borders.hairline,
            backgroundColor: theme.colors.rice,
            fontSize: theme.typography.fontSize.sm,
            cursor: preferences.enabled ? 'pointer' : 'not-allowed',
            opacity: preferences.enabled ? 1 : 0.5,
          }}
        >
          <option value="beginner">Beginner - Show me everything</option>
          <option value="intermediate">Intermediate - Just the essentials</option>
          <option value="experienced">Experienced - Minimal hints</option>
        </select>
      </div>

      {/* Individual toggles */}
      <div style={{
        borderTop: theme.borders.hairline,
        paddingTop: '1rem',
        opacity: preferences.enabled ? 1 : 0.5,
        pointerEvents: preferences.enabled ? 'auto' : 'none',
      }}>
        <p style={{
          margin: '0 0 0.75rem 0',
          fontSize: theme.typography.fontSize.xs,
          color: theme.colors.inkGray,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          Show tooltips for:
        </p>

        {[
          { key: 'showTermDefinitions', label: 'Quilting terms', icon: '📖' },
          { key: 'showTechniqueTips', label: 'Technique tips', icon: '💡' },
          { key: 'showWarnings', label: 'Warnings', icon: '⚠️' },
          { key: 'showCheckpoints', label: 'Checkpoints', icon: '✓' },
        ].map(({ key, label, icon }) => (
          <label
            key={key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem',
              cursor: 'pointer',
              fontSize: theme.typography.fontSize.sm,
            }}
          >
            <input
              type="checkbox"
              checked={preferences[key as keyof TooltipPreferences] as boolean}
              onChange={() => toggleTooltipType(key as keyof Omit<TooltipPreferences, 'experienceLevel' | 'enabled'>)}
              style={{ width: '16px', height: '16px' }}
            />
            <span>{icon}</span>
            <span style={{ color: theme.colors.inkBlack }}>{label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default TooltipProvider;
