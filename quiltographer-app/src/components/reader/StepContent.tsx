'use client';

import React, { useState } from 'react';
import { quiltographerTheme } from '../japanese/theme';
import { WashiSurface } from '../japanese/WashiSurface';
import { VisualDiagram } from './VisualDiagram';
import type { ConstructionStep } from '@/lib/reader/schema';

interface StepContentProps {
  step: ConstructionStep;
  stepNumber: number;
  totalSteps: number;
  onRequestClarification?: (step: ConstructionStep) => void;
  isLoadingClarification?: boolean;
  clarification?: string;
}

type AIHelpType = 'clarify' | 'simplify' | 'tools' | 'technique';

/**
 * StepContent - Displays a single pattern step
 *
 * The core of the Pattern Reader experience. Shows the instruction
 * with visual hierarchy, warnings, tips, and AI clarification option.
 *
 * Design principles:
 * - Ma: Generous whitespace, single focus
 * - Accessibility: Large text option, high contrast
 * - AI-first: Clarification is prominent, not hidden
 */
export function StepContent({
  step,
  stepNumber,
  totalSteps,
  onRequestClarification,
  isLoadingClarification = false,
  clarification,
}: StepContentProps) {
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [aiHelp, setAiHelp] = useState<{ type: AIHelpType; content: string } | null>(null);
  const [loadingHelp, setLoadingHelp] = useState<AIHelpType | null>(null);
  const [selectedTechnique, setSelectedTechnique] = useState<string | null>(null);

  const fontSizeMap = {
    normal: quiltographerTheme.typography.fontSize.lg,
    large: quiltographerTheme.typography.fontSize['2xl'],
    xlarge: quiltographerTheme.typography.fontSize['3xl'],
  };

  // Encouraging messages based on progress
  const getEncouragement = () => {
    const progress = stepNumber / totalSteps;
    if (stepNumber === 1) return "Let's get started! You've got this! 🌟";
    if (progress < 0.25) return "Great start! Keep that momentum going! 💪";
    if (progress < 0.5) return "You're making wonderful progress! 🎉";
    if (progress < 0.75) return "Over halfway there! Your quilt is taking shape! ✨";
    if (progress < 1) return "Almost done! The finish line is in sight! 🏁";
    return "Final step! You did it! 🎊";
  };

  // Call AI for different help types
  const requestAIHelp = async (type: AIHelpType, context?: string) => {
    setLoadingHelp(type);

    const prompts: Record<AIHelpType, string> = {
      clarify: step.instruction,
      simplify: `SIMPLIFY THIS: "${step.instruction}" - Rewrite this in the simplest possible terms, as if explaining to a complete beginner. Use short sentences. Avoid any jargon.`,
      tools: `TOOLS NEEDED: "${step.instruction}" - List only the specific tools and supplies needed for THIS step. Be brief, use bullet points.`,
      technique: `TECHNIQUE: "${context}" in the context of: "${step.instruction}" - Explain this specific quilting technique in 2-3 sentences for a beginner.`,
    };

    try {
      const response = await fetch('/api/clarify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instruction: prompts[type],
          context: `Pattern step ${stepNumber} of ${totalSteps}`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (type === 'technique') {
          setSelectedTechnique(context || null);
        }
        setAiHelp({ type, content: data.clarification });
      }
    } catch (error) {
      console.error('AI help error:', error);
    } finally {
      setLoadingHelp(null);
    }
  };

  // Handle main clarification (updates parent state)
  const handleClarify = () => {
    onRequestClarification?.(step);
  };

  const helpLabels: Record<AIHelpType, { icon: string; label: string; color: string }> = {
    clarify: { icon: '🤖', label: 'AI Clarification', color: quiltographerTheme.colors.sage },
    simplify: { icon: '✨', label: 'Simplified Version', color: quiltographerTheme.colors.persimmon },
    tools: { icon: '🧰', label: 'Tools Needed', color: quiltographerTheme.colors.indigo },
    technique: { icon: '📚', label: `About "${selectedTechnique}"`, color: quiltographerTheme.colors.clay },
  };

  return (
    <WashiSurface elevated className="step-content">
      <div
        style={{
          padding: quiltographerTheme.spacing.rest,
          maxWidth: '800px',
          margin: '0 auto',
        }}
      >
        {/* Progress encouragement */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '1rem',
            padding: '0.5rem',
            backgroundColor: 'rgba(132, 169, 140, 0.1)',
            borderRadius: quiltographerTheme.radius.md,
            fontSize: quiltographerTheme.typography.fontSize.sm,
            color: quiltographerTheme.colors.sage,
            fontFamily: quiltographerTheme.typography.fontFamily.body,
          }}
        >
          {getEncouragement()}
        </div>

        {/* Step header */}
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: quiltographerTheme.spacing.breathe,
          }}
        >
          <div>
            <span
              style={{
                fontSize: quiltographerTheme.typography.fontSize.sm,
                color: quiltographerTheme.colors.inkGray,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontFamily: quiltographerTheme.typography.fontFamily.body,
              }}
            >
              Step {stepNumber} of {totalSteps}
            </span>
            {step.title && (
              <h2
                style={{
                  fontSize: quiltographerTheme.typography.fontSize['2xl'],
                  color: quiltographerTheme.colors.indigo,
                  fontFamily: quiltographerTheme.typography.fontFamily.display,
                  fontWeight: 500,
                  marginTop: '0.25rem',
                  marginBottom: 0,
                }}
              >
                {step.title}
              </h2>
            )}
          </div>

          {/* Accessibility: font size control */}
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {(['normal', 'large', 'xlarge'] as const).map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                style={{
                  width: '32px',
                  height: '32px',
                  border: fontSize === size
                    ? `2px solid ${quiltographerTheme.colors.persimmon}`
                    : quiltographerTheme.borders.subtle,
                  borderRadius: quiltographerTheme.radius.sm,
                  backgroundColor: fontSize === size
                    ? quiltographerTheme.colors.hover
                    : quiltographerTheme.colors.rice,
                  cursor: 'pointer',
                  fontSize: size === 'normal' ? '12px' : size === 'large' ? '16px' : '20px',
                  fontWeight: 600,
                }}
                aria-label={`${size} text size`}
                aria-pressed={fontSize === size}
              >
                A
              </button>
            ))}
          </div>
        </header>

        {/* Warnings - show prominently before instruction */}
        {step.warnings && step.warnings.length > 0 && (
          <div style={{ marginBottom: quiltographerTheme.spacing.breathe }}>
            {step.warnings.map((warning, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.75rem 1rem',
                  marginBottom: '0.5rem',
                  borderRadius: quiltographerTheme.radius.md,
                  backgroundColor: warning.type === 'critical'
                    ? '#fef2f2'
                    : '#fefce8',
                  borderLeft: `4px solid ${
                    warning.type === 'critical'
                      ? quiltographerTheme.colors.silk
                      : quiltographerTheme.colors.clay
                  }`,
                  fontSize: quiltographerTheme.typography.fontSize.base,
                  color: quiltographerTheme.colors.inkBlack,
                  fontFamily: quiltographerTheme.typography.fontFamily.body,
                }}
              >
                <strong>{warning.type === 'critical' ? '⚠️ Important: ' : '💡 Note: '}</strong>
                {warning.message}
              </div>
            ))}
          </div>
        )}

        {/* Main instruction */}
        <div
          style={{
            fontSize: fontSizeMap[fontSize],
            lineHeight: quiltographerTheme.typography.lineHeight.relaxed,
            color: quiltographerTheme.colors.inkBlack,
            fontFamily: quiltographerTheme.typography.fontFamily.body,
            marginBottom: quiltographerTheme.spacing.rest,
          }}
        >
          {step.clarifiedInstruction || step.instruction}
        </div>

        {/* Auto-generated Visual Diagram */}
        <VisualDiagram
          techniques={step.techniques || []}
          instruction={step.instruction}
          step={stepNumber}
        />

        {/* Techniques - clickable for AI explanation */}
        {step.techniques && step.techniques.length > 0 && (
          <div
            style={{
              marginBottom: quiltographerTheme.spacing.breathe,
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              alignItems: 'center',
            }}
          >
            <span style={{
              fontSize: quiltographerTheme.typography.fontSize.sm,
              color: quiltographerTheme.colors.inkGray,
            }}>
              Techniques used:
            </span>
            {step.techniques.map((technique, idx) => (
              <button
                key={idx}
                onClick={() => requestAIHelp('technique', technique)}
                disabled={loadingHelp === 'technique'}
                style={{
                  padding: '0.25rem 0.75rem',
                  backgroundColor: selectedTechnique === technique
                    ? quiltographerTheme.colors.indigo
                    : quiltographerTheme.colors.washiDark,
                  borderRadius: quiltographerTheme.radius.full,
                  fontSize: quiltographerTheme.typography.fontSize.sm,
                  color: selectedTechnique === technique
                    ? quiltographerTheme.colors.rice
                    : quiltographerTheme.colors.indigo,
                  fontFamily: quiltographerTheme.typography.fontFamily.body,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                title="Click to learn about this technique"
              >
                {loadingHelp === 'technique' && selectedTechnique === technique ? '...' : technique}
              </button>
            ))}
          </div>
        )}

        {/* AI Help Buttons Row */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginBottom: quiltographerTheme.spacing.breathe,
            paddingTop: '0.5rem',
            borderTop: quiltographerTheme.borders.hairline,
          }}
        >
          {/* Main clarify button */}
          <button
            onClick={handleClarify}
            disabled={isLoadingClarification || !!clarification}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: clarification ? quiltographerTheme.colors.sage : quiltographerTheme.colors.indigo,
              color: quiltographerTheme.colors.rice,
              border: 'none',
              borderRadius: quiltographerTheme.radius.md,
              fontSize: quiltographerTheme.typography.fontSize.sm,
              fontFamily: quiltographerTheme.typography.fontFamily.body,
              fontWeight: 500,
              cursor: isLoadingClarification || clarification ? 'default' : 'pointer',
              opacity: isLoadingClarification ? 0.7 : 1,
            }}
          >
            {isLoadingClarification ? '⟳ Asking...' : clarification ? '✓ Explained' : '🤖 Explain this'}
          </button>

          {/* Simplify button */}
          <button
            onClick={() => requestAIHelp('simplify')}
            disabled={loadingHelp === 'simplify'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: aiHelp?.type === 'simplify' ? quiltographerTheme.colors.persimmon : 'transparent',
              color: aiHelp?.type === 'simplify' ? quiltographerTheme.colors.rice : quiltographerTheme.colors.persimmon,
              border: `1px solid ${quiltographerTheme.colors.persimmon}`,
              borderRadius: quiltographerTheme.radius.md,
              fontSize: quiltographerTheme.typography.fontSize.sm,
              fontFamily: quiltographerTheme.typography.fontFamily.body,
              fontWeight: 500,
              cursor: loadingHelp === 'simplify' ? 'wait' : 'pointer',
            }}
          >
            {loadingHelp === 'simplify' ? '⟳' : '✨'} Simplify
          </button>

          {/* Tools button */}
          <button
            onClick={() => requestAIHelp('tools')}
            disabled={loadingHelp === 'tools'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: aiHelp?.type === 'tools' ? quiltographerTheme.colors.clay : 'transparent',
              color: aiHelp?.type === 'tools' ? quiltographerTheme.colors.rice : quiltographerTheme.colors.clay,
              border: `1px solid ${quiltographerTheme.colors.clay}`,
              borderRadius: quiltographerTheme.radius.md,
              fontSize: quiltographerTheme.typography.fontSize.sm,
              fontFamily: quiltographerTheme.typography.fontFamily.body,
              fontWeight: 500,
              cursor: loadingHelp === 'tools' ? 'wait' : 'pointer',
            }}
          >
            {loadingHelp === 'tools' ? '⟳' : '🧰'} What tools?
          </button>
        </div>

        {/* AI Clarification display (from parent) */}
        {clarification && (
          <div
            style={{
              padding: '1rem',
              marginBottom: '1rem',
              backgroundColor: quiltographerTheme.colors.rice,
              borderRadius: quiltographerTheme.radius.md,
              borderLeft: `4px solid ${quiltographerTheme.colors.sage}`,
            }}
          >
            <p
              style={{
                fontSize: quiltographerTheme.typography.fontSize.sm,
                color: quiltographerTheme.colors.sage,
                fontWeight: 600,
                marginBottom: '0.5rem',
                fontFamily: quiltographerTheme.typography.fontFamily.body,
              }}
            >
              🤖 AI Clarification
            </p>
            <div
              style={{
                fontSize: fontSizeMap[fontSize],
                lineHeight: quiltographerTheme.typography.lineHeight.relaxed,
                color: quiltographerTheme.colors.inkBlack,
                fontFamily: quiltographerTheme.typography.fontFamily.body,
                margin: 0,
                whiteSpace: 'pre-wrap',
              }}
              dangerouslySetInnerHTML={{
                __html: clarification
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                  .replace(/^# (.*$)/gm, '<h3 style="margin: 0.5rem 0; color: #2c3e50;">$1</h3>')
                  .replace(/^- (.*$)/gm, '<li style="margin-left: 1rem;">$1</li>')
              }}
            />
          </div>
        )}

        {/* Additional AI help display */}
        {aiHelp && (
          <div
            style={{
              padding: '1rem',
              marginBottom: '1rem',
              backgroundColor: quiltographerTheme.colors.rice,
              borderRadius: quiltographerTheme.radius.md,
              borderLeft: `4px solid ${helpLabels[aiHelp.type].color}`,
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem',
            }}>
              <p
                style={{
                  fontSize: quiltographerTheme.typography.fontSize.sm,
                  color: helpLabels[aiHelp.type].color,
                  fontWeight: 600,
                  fontFamily: quiltographerTheme.typography.fontFamily.body,
                  margin: 0,
                }}
              >
                {helpLabels[aiHelp.type].icon} {helpLabels[aiHelp.type].label}
              </p>
              <button
                onClick={() => { setAiHelp(null); setSelectedTechnique(null); }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: quiltographerTheme.colors.inkGray,
                  fontSize: '1.2rem',
                }}
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
            <div
              style={{
                fontSize: fontSizeMap[fontSize],
                lineHeight: quiltographerTheme.typography.lineHeight.relaxed,
                color: quiltographerTheme.colors.inkBlack,
                fontFamily: quiltographerTheme.typography.fontFamily.body,
                margin: 0,
                whiteSpace: 'pre-wrap',
              }}
              dangerouslySetInnerHTML={{
                __html: aiHelp.content
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                  .replace(/^# (.*$)/gm, '<h3 style="margin: 0.5rem 0; color: #2c3e50;">$1</h3>')
                  .replace(/^- (.*$)/gm, '<li style="margin-left: 1rem;">$1</li>')
              }}
            />
          </div>
        )}

        {/* Tips - show after main content */}
        {step.tips && step.tips.length > 0 && (
          <div
            style={{
              marginTop: quiltographerTheme.spacing.breathe,
              padding: '1rem',
              backgroundColor: 'rgba(132, 169, 140, 0.1)',
              borderRadius: quiltographerTheme.radius.md,
            }}
          >
            <p
              style={{
                fontSize: quiltographerTheme.typography.fontSize.sm,
                color: quiltographerTheme.colors.sage,
                fontWeight: 600,
                marginBottom: '0.5rem',
              }}
            >
              💡 Pro Tips
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              {step.tips.map((tip, idx) => (
                <li
                  key={idx}
                  style={{
                    fontSize: quiltographerTheme.typography.fontSize.base,
                    color: quiltographerTheme.colors.inkBlack,
                    marginBottom: '0.25rem',
                  }}
                >
                  {tip.text}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </WashiSurface>
  );
}

export default StepContent;
