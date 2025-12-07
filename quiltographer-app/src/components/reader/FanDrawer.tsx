'use client';

import React, { useEffect, useState } from 'react';
import { quiltographerTheme } from '@/components/japanese';

const theme = quiltographerTheme;

type ReaderMode = 'make' | 'cut' | 'overview' | 'ref';

interface FanDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: ReaderMode;
  onModeChange: (mode: ReaderMode) => void;
  onOpenGlossary: () => void;
  onOpenCalculators: () => void;
  onOpenSettings: () => void;
  onAIHelp: (type: 'explain' | 'simplify' | 'tools') => void;
}

const drawerAnimations = `
  @keyframes slideUp {
    0% {
      transform: translateY(100%);
      opacity: 0;
    }
    60% {
      transform: translateY(-3%);
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideDown {
    0% {
      transform: translateY(0);
      opacity: 1;
    }
    100% {
      transform: translateY(100%);
      opacity: 0;
    }
  }

  @keyframes backdropFade {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }

  @keyframes itemStagger {
    0% {
      opacity: 0;
      transform: translateY(10px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fanUnfold {
    0% {
      transform: scaleX(0.8) scaleY(0);
      transform-origin: bottom center;
      opacity: 0;
    }
    50% {
      transform: scaleX(1.02) scaleY(1.02);
    }
    100% {
      transform: scaleX(1) scaleY(1);
      opacity: 1;
    }
  }
`;

/**
 * Mode button with fan segment styling
 */
function ModeButton({
  mode,
  label,
  icon,
  isActive,
  onClick,
  delay,
}: {
  mode: ReaderMode;
  label: string;
  icon: string;
  isActive: boolean;
  onClick: () => void;
  delay: number;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '1rem 0.75rem',
        backgroundColor: isActive ? theme.colors.indigo : theme.colors.washi,
        color: isActive ? theme.colors.rice : theme.colors.inkBlack,
        border: 'none',
        borderRadius: theme.radius.md,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        transition: `all ${theme.timing.breathe} ${theme.timing.easeOut}`,
        animation: `itemStagger 0.3s ease-out ${delay}ms both`,
        boxShadow: isActive ? theme.shadows.soft : 'none',
      }}
    >
      <span style={{ fontSize: '1.25rem' }}>{icon}</span>
      <span style={{ 
        fontSize: theme.typography.fontSize.xs,
        fontFamily: theme.typography.fontFamily.body,
        fontWeight: isActive ? 600 : 400,
      }}>
        {label}
      </span>
    </button>
  );
}

/**
 * Action button for secondary actions
 */
function ActionButton({
  label,
  icon,
  onClick,
  delay,
  accent = false,
}: {
  label: string;
  icon: string;
  onClick: () => void;
  delay: number;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        padding: '0.875rem 1rem',
        backgroundColor: accent ? `${theme.colors.persimmon}10` : 'transparent',
        color: accent ? theme.colors.persimmon : theme.colors.inkBlack,
        border: theme.borders.hairline,
        borderRadius: theme.radius.md,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        transition: `all ${theme.timing.quick} ${theme.timing.easeOut}`,
        animation: `itemStagger 0.3s ease-out ${delay}ms both`,
        fontFamily: theme.typography.fontFamily.body,
        fontSize: theme.typography.fontSize.sm,
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

/**
 * FanDrawer - The navigation that unfolds like paper
 * 
 * Slides up from bottom with spring physics.
 * Contains modes, tools, and AI help options.
 */
export function FanDrawer({
  isOpen,
  onClose,
  currentMode,
  onModeChange,
  onOpenGlossary,
  onOpenCalculators,
  onOpenSettings,
  onAIHelp,
}: FanDrawerProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsAnimating(true);
    } else if (shouldRender) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsAnimating(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, shouldRender]);

  if (!shouldRender) return null;

  const handleModeChange = (mode: ReaderMode) => {
    onModeChange(mode);
    onClose();
  };

  return (
    <>
      <style>{drawerAnimations}</style>
      
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          zIndex: 100,
          animation: isOpen 
            ? 'backdropFade 0.2s ease-out forwards'
            : 'backdropFade 0.2s ease-out reverse forwards',
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: theme.colors.rice,
          borderTopLeftRadius: theme.radius.xl,
          borderTopRightRadius: theme.radius.xl,
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
          zIndex: 101,
          padding: '1.5rem',
          paddingBottom: '2.5rem',
          animation: isOpen 
            ? 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
            : 'slideDown 0.3s ease-in forwards',
          backgroundImage: theme.textures.washiFiber,
        }}
      >
        {/* Handle bar */}
        <div style={{
          width: '40px',
          height: '4px',
          backgroundColor: theme.colors.inactive,
          borderRadius: theme.radius.full,
          margin: '0 auto 1.5rem',
        }} />

        {/* Mode Selection */}
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          marginBottom: '1.5rem',
        }}>
          <ModeButton
            mode="make"
            label="Make"
            icon="🧵"
            isActive={currentMode === 'make'}
            onClick={() => handleModeChange('make')}
            delay={50}
          />
          <ModeButton
            mode="cut"
            label="Cut"
            icon="✂️"
            isActive={currentMode === 'cut'}
            onClick={() => handleModeChange('cut')}
            delay={100}
          />
          <ModeButton
            mode="overview"
            label="Overview"
            icon="📋"
            isActive={currentMode === 'overview'}
            onClick={() => handleModeChange('overview')}
            delay={150}
          />
          <ModeButton
            mode="ref"
            label="Reference"
            icon="📐"
            isActive={currentMode === 'ref'}
            onClick={() => handleModeChange('ref')}
            delay={200}
          />
        </div>

        {/* Divider */}
        <div style={{
          height: '1px',
          backgroundColor: theme.colors.washiDark,
          margin: '1rem 0',
        }} />

        {/* AI Help Section */}
        <div style={{ marginBottom: '1rem' }}>
          <span style={{
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.inkLight,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '0.75rem',
            display: 'block',
            animation: 'itemStagger 0.3s ease-out 250ms both',
          }}>
            Help with this step
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <ActionButton
              label="Explain in plain English"
              icon="💬"
              onClick={() => { onAIHelp('explain'); onClose(); }}
              delay={300}
              accent
            />
            <ActionButton
              label="Simplify for beginners"
              icon="🌱"
              onClick={() => { onAIHelp('simplify'); onClose(); }}
              delay={350}
            />
            <ActionButton
              label="What tools do I need?"
              icon="🔧"
              onClick={() => { onAIHelp('tools'); onClose(); }}
              delay={400}
            />
          </div>
        </div>

        {/* Divider */}
        <div style={{
          height: '1px',
          backgroundColor: theme.colors.washiDark,
          margin: '1rem 0',
        }} />

        {/* Tools Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <ActionButton
            label="Glossary"
            icon="📚"
            onClick={() => { onOpenGlossary(); onClose(); }}
            delay={450}
          />
          <ActionButton
            label="Calculators"
            icon="🧮"
            onClick={() => { onOpenCalculators(); onClose(); }}
            delay={500}
          />
          <ActionButton
            label="Settings"
            icon="⚙️"
            onClick={() => { onOpenSettings(); onClose(); }}
            delay={550}
          />
        </div>

        {/* Close hint */}
        <div style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          color: theme.colors.inkLight,
          fontSize: theme.typography.fontSize.xs,
          animation: 'itemStagger 0.3s ease-out 600ms both',
        }}>
          Tap outside to close
        </div>
      </div>
    </>
  );
}

export default FanDrawer;
