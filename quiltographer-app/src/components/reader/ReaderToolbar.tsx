'use client';

import React from 'react';
import { quiltographerTheme } from '@/components/japanese/theme';
import { WashiSurface } from '@/components/japanese/WashiSurface';

const theme = quiltographerTheme;

export type ToolPanelId = 'make' | 'calc' | 'cut' | 'guide';

interface ReaderToolbarProps {
  activeTool: ToolPanelId | null;
  onToolChange: (tool: ToolPanelId | null) => void;
  highContrast?: boolean;
}

const tools: Array<{ id: ToolPanelId; label: string; icon: string; shortLabel: string }> = [
  { id: 'make', label: 'Make Mode', icon: '🧵', shortLabel: 'Make' },
  { id: 'calc', label: 'Calculators', icon: '🧮', shortLabel: 'Calc' },
  { id: 'cut', label: 'Cutting List', icon: '✂️', shortLabel: 'Cut' },
  { id: 'guide', label: 'Visual Guide', icon: '📐', shortLabel: 'Guide' },
];

/**
 * ReaderToolbar — the top of the artisan's workbench.
 *
 * A row of tools within reach. Each button feels like
 * a wooden tool handle — warm, tactile, with the persimmon
 * accent on active state.
 */
export function ReaderToolbar({ activeTool, onToolChange, highContrast = false }: ReaderToolbarProps) {
  const handleClick = (id: ToolPanelId) => {
    onToolChange(activeTool === id ? null : id);
  };

  if (highContrast) {
    return (
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          padding: '0.75rem 1rem',
          backgroundColor: '#222',
          borderRadius: theme.radius.lg,
          border: '1px solid #444',
        }}
      >
        {tools.map((tool) => {
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => handleClick(tool.id)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.625rem 0.75rem',
                minHeight: '48px',
                backgroundColor: isActive ? '#e76f51' : '#333',
                color: isActive ? '#fff' : '#ccc',
                border: isActive ? '2px solid #e76f51' : '1px solid #555',
                borderRadius: theme.radius.md,
                cursor: 'pointer',
                fontSize: theme.typography.fontSize.sm,
                fontWeight: isActive ? 600 : 400,
                fontFamily: theme.typography.fontFamily.body,
                transition: `all ${theme.timing.quick} ${theme.timing.easeOut}`,
              }}
              aria-pressed={isActive}
              aria-label={tool.label}
            >
              <span>{tool.icon}</span>
              <span className="hidden sm:inline">{tool.shortLabel}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <WashiSurface
      variant="dark"
      elevated
      style={{
        borderRadius: theme.radius.lg,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          padding: '0.75rem 1rem',
        }}
      >
        {tools.map((tool) => {
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => handleClick(tool.id)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.625rem 0.75rem',
                minHeight: '48px',
                backgroundColor: isActive ? theme.colors.persimmon : theme.colors.rice,
                color: isActive ? theme.colors.rice : theme.colors.bamboo,
                border: 'none',
                borderRadius: theme.radius.md,
                cursor: 'pointer',
                fontSize: theme.typography.fontSize.sm,
                fontWeight: isActive ? 600 : 500,
                fontFamily: theme.typography.fontFamily.body,
                boxShadow: isActive
                  ? theme.shadows.lifted
                  : `inset 0 -2px 0 ${theme.colors.bamboo}20, ${theme.shadows.subtle}`,
                transition: `all ${theme.timing.quick} ${theme.timing.easeOut}`,
                transform: isActive ? 'translateY(-1px)' : 'none',
              }}
              aria-pressed={isActive}
              aria-label={tool.label}
            >
              <span>{tool.icon}</span>
              <span className="hidden sm:inline">{tool.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </WashiSurface>
  );
}

/**
 * ToolPanel — slide-in panel for inline tool components.
 * Used for CuttingChecklist and VisualGuide which render inline.
 */
export function ToolPanel({
  isOpen,
  onClose,
  title,
  children,
  highContrast = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  highContrast?: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        backgroundColor: highContrast ? '#1a1a1a' : theme.colors.rice,
        borderRadius: theme.radius.lg,
        border: highContrast ? '1px solid #444' : theme.borders.subtle,
        overflow: 'hidden',
        animation: `toolPanelSlide ${theme.timing.breathe} ${theme.timing.easeOut}`,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          borderBottom: highContrast ? '1px solid #333' : theme.borders.hairline,
          backgroundColor: highContrast ? '#222' : theme.colors.washi,
        }}
      >
        <span
          style={{
            fontWeight: 600,
            fontSize: theme.typography.fontSize.base,
            color: highContrast ? '#fff' : theme.colors.indigo,
            fontFamily: theme.typography.fontFamily.display,
          }}
        >
          {title}
        </span>
        <button
          onClick={onClose}
          style={{
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: highContrast ? '#333' : theme.colors.washiDark,
            color: highContrast ? '#ccc' : theme.colors.inkGray,
            border: 'none',
            borderRadius: theme.radius.full,
            cursor: 'pointer',
            fontSize: '1.1rem',
            transition: `all ${theme.timing.quick} ${theme.timing.easeOut}`,
          }}
          aria-label="Close panel"
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '1rem' }}>
        {children}
      </div>

      <style jsx global>{`
        @keyframes toolPanelSlide {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default ReaderToolbar;
