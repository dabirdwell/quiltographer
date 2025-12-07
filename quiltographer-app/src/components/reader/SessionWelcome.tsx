'use client';

import React from 'react';
import { quiltographerTheme } from '../japanese/theme';

const theme = quiltographerTheme;

// Seasonal encouragement messages
function getSeasonalEncouragement(progress: number): string {
  const month = new Date().getMonth();
  const season = month < 3 || month === 11 ? 'winter'
    : month < 6 ? 'spring'
    : month < 9 ? 'summer'
    : 'autumn';

  const messages = {
    winter: [
      "Creating warmth, one seam at a time",
      "Like snow falling, each piece finds its place",
      "Cozy work for a winter day",
      "Stitching comfort for cold nights ahead",
    ],
    spring: [
      "Like cherry blossoms, each piece adds to the whole",
      "New growth in every stitch",
      "Your project blooms",
      "Fresh beginnings in fabric and thread",
    ],
    summer: [
      "Steady hands, cool focus",
      "Bright work under long light",
      "Making something that will last beyond the season",
      "Creating shade for sunny days",
    ],
    autumn: [
      "Gathering your work like autumn harvest",
      "Rich colors coming together",
      "Piecing warmth before the cold",
      "Like falling leaves, each piece has its place",
    ],
  };

  const index = Math.floor(progress * (messages[season].length - 1));
  return messages[season][index] || messages[season][0];
}

interface SessionWelcomeProps {
  patternName: string;
  currentStep: number;
  totalSteps: number;
  timeSinceLastVisit: string | null;
  progressSummary: {
    stepsCompleted: number;
    percentComplete: number;
    lastPressInfo: string | null;
    nextPressHint: string | null;
  } | null;
  onContinue: () => void;
  onStartOver: () => void;
  onDismiss: () => void;
}

export function SessionWelcome({
  patternName,
  currentStep,
  totalSteps,
  timeSinceLastVisit,
  progressSummary,
  onContinue,
  onStartOver,
  onDismiss,
}: SessionWelcomeProps) {
  const progress = (progressSummary?.stepsCompleted || 0) / totalSteps;
  const encouragement = getSeasonalEncouragement(progress);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem',
    }}>
      {/* Backdrop */}
      <div
        onClick={onDismiss}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
          animation: `fadeIn ${theme.timing.breathe} ${theme.timing.easeOut}`,
        }}
      />

      {/* Card */}
      <div style={{
        position: 'relative',
        maxWidth: '440px',
        width: '100%',
        backgroundColor: theme.colors.washi,
        backgroundImage: theme.textures.washiFiber,
        borderRadius: theme.radius.xl,
        boxShadow: theme.shadows.floating,
        overflow: 'hidden',
        animation: `slideUp ${theme.timing.unfold} ${theme.timing.spring}`,
      }}>
        {/* Header with pattern name */}
        <div style={{
          padding: '1.5rem 1.5rem 1rem',
          backgroundColor: theme.colors.indigo,
          color: theme.colors.rice,
        }}>
          <div style={{
            fontSize: theme.typography.fontSize.sm,
            opacity: 0.8,
            marginBottom: '0.5rem',
          }}>
            Welcome back to
          </div>
          <h2 style={{
            margin: 0,
            fontSize: theme.typography.fontSize['2xl'],
            fontWeight: 600,
            fontFamily: theme.typography.fontFamily.display,
            lineHeight: 1.3,
          }}>
            {patternName}
          </h2>
          {timeSinceLastVisit && (
            <div style={{
              marginTop: '0.5rem',
              fontSize: theme.typography.fontSize.xs,
              opacity: 0.7,
            }}>
              Last visited {timeSinceLastVisit}
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          {/* Progress indicator */}
          {progressSummary && (
            <div style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              backgroundColor: theme.colors.rice,
              borderRadius: theme.radius.md,
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem',
              }}>
                <span style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.inkGray,
                }}>
                  Your progress
                </span>
                <span style={{
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: 600,
                  color: theme.colors.sage,
                }}>
                  {progressSummary.percentComplete}%
                </span>
              </div>

              {/* Progress bar */}
              <div style={{
                height: '8px',
                backgroundColor: theme.colors.washiDark,
                borderRadius: theme.radius.full,
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${progressSummary.percentComplete}%`,
                  backgroundColor: theme.colors.sage,
                  borderRadius: theme.radius.full,
                  transition: `width ${theme.timing.meditate} ${theme.timing.easeOut}`,
                }} />
              </div>

              <div style={{
                marginTop: '0.5rem',
                fontSize: theme.typography.fontSize.xs,
                color: theme.colors.inkGray,
              }}>
                {progressSummary.stepsCompleted} of {totalSteps} steps complete
              </div>
            </div>
          )}

          {/* Where you left off */}
          <div style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            backgroundColor: `${theme.colors.clay}15`,
            borderRadius: theme.radius.md,
            borderLeft: `3px solid ${theme.colors.clay}`,
          }}>
            <div style={{
              fontSize: theme.typography.fontSize.sm,
              fontWeight: 500,
              color: theme.colors.clay,
              marginBottom: '0.5rem',
            }}>
              📍 Where you left off
            </div>
            <div style={{
              fontSize: theme.typography.fontSize.base,
              color: theme.colors.inkBlack,
            }}>
              Step {currentStep} of {totalSteps}
            </div>
          </div>

          {/* Press direction reminder */}
          {progressSummary?.lastPressInfo && (
            <div style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              backgroundColor: `${theme.colors.sage}15`,
              borderRadius: theme.radius.md,
              borderLeft: `3px solid ${theme.colors.sage}`,
            }}>
              <div style={{
                fontSize: theme.typography.fontSize.sm,
                fontWeight: 500,
                color: theme.colors.sage,
                marginBottom: '0.5rem',
              }}>
                🔥 Quick recap
              </div>
              <div style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.inkBlack,
                marginBottom: progressSummary.nextPressHint ? '0.5rem' : 0,
              }}>
                {progressSummary.lastPressInfo}
              </div>
              {progressSummary.nextPressHint && (
                <div style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.sage,
                  fontWeight: 500,
                }}>
                  👉 {progressSummary.nextPressHint}
                </div>
              )}
            </div>
          )}

          {/* Seasonal encouragement */}
          <div style={{
            textAlign: 'center',
            fontStyle: 'italic',
            color: theme.colors.inkGray,
            fontSize: theme.typography.fontSize.sm,
            marginBottom: '1.5rem',
            fontFamily: theme.typography.fontFamily.display,
          }}>
            "{encouragement}"
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
          }}>
            <button
              onClick={onContinue}
              style={{
                flex: 2,
                padding: '1rem',
                backgroundColor: theme.colors.indigo,
                color: theme.colors.rice,
                border: 'none',
                borderRadius: theme.radius.md,
                cursor: 'pointer',
                fontSize: theme.typography.fontSize.base,
                fontWeight: 600,
                transition: `all ${theme.timing.quick} ${theme.timing.easeOut}`,
              }}
            >
              Continue Step {currentStep}
            </button>
            <button
              onClick={onStartOver}
              style={{
                flex: 1,
                padding: '1rem',
                backgroundColor: 'transparent',
                color: theme.colors.inkGray,
                border: theme.borders.subtle,
                borderRadius: theme.radius.md,
                cursor: 'pointer',
                fontSize: theme.typography.fontSize.sm,
                transition: `all ${theme.timing.quick} ${theme.timing.easeOut}`,
              }}
            >
              Start Over
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// Good stopping point indicator
interface GoodStoppingPointProps {
  reason?: string;
}

export function GoodStoppingPoint({ reason }: GoodStoppingPointProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem 1rem',
      backgroundColor: `${theme.colors.sage}15`,
      borderRadius: theme.radius.md,
      marginTop: '1rem',
    }}>
      <span style={{ fontSize: '1.25rem' }}>🔖</span>
      <div>
        <div style={{
          fontSize: theme.typography.fontSize.sm,
          fontWeight: 500,
          color: theme.colors.sage,
        }}>
          Good place to pause
        </div>
        {reason && (
          <div style={{
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.inkGray,
            marginTop: '2px',
          }}>
            {reason}
          </div>
        )}
      </div>
    </div>
  );
}

// Tool prep alert
interface ToolPrepAlertProps {
  tool: string;
  stepsAhead: number;
  prepTime?: string;
}

export function ToolPrepAlert({ tool, stepsAhead, prepTime }: ToolPrepAlertProps) {
  const getToolIcon = (toolName: string): string => {
    const toolLower = toolName.toLowerCase();
    if (toolLower.includes('walking foot')) return '🦶';
    if (toolLower.includes('ruler')) return '📐';
    if (toolLower.includes('rotary') || toolLower.includes('cutter')) return '🔪';
    if (toolLower.includes('starch') || toolLower.includes('spray')) return '✨';
    if (toolLower.includes('design wall')) return '🧱';
    if (toolLower.includes('iron')) return '🔥';
    if (toolLower.includes('needle')) return '🪡';
    return '🔧';
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem 1rem',
      backgroundColor: `${theme.colors.clay}15`,
      borderRadius: theme.radius.md,
      marginBottom: '1rem',
    }}>
      <span style={{ fontSize: '1.25rem' }}>{getToolIcon(tool)}</span>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: theme.typography.fontSize.sm,
          color: theme.colors.clay,
        }}>
          <strong>Heads up:</strong> Step {stepsAhead} needs your {tool}
        </div>
        {prepTime && (
          <div style={{
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.inkGray,
            marginTop: '2px',
          }}>
            {prepTime}
          </div>
        )}
      </div>
    </div>
  );
}

// Check for good stopping points in instruction text
export function isGoodStoppingPoint(instruction: string, title?: string): { isStop: boolean; reason?: string } {
  const text = (instruction + ' ' + (title || '')).toLowerCase();

  if (text.includes('set aside')) {
    return { isStop: true, reason: "These pieces are ready - they'll wait for you" };
  }
  if (text.includes('repeat') && text.includes('make')) {
    return { isStop: true, reason: 'All units of this type complete' };
  }
  if (text.match(/complete|finished|done/i) && !text.includes('not complete')) {
    return { isStop: true, reason: 'This section is complete' };
  }
  if (text.includes('before') && text.includes('assemble')) {
    return { isStop: true, reason: 'Good to break before assembly' };
  }

  return { isStop: false };
}

// Look ahead for tool requirements
export function lookAheadForTools(
  currentStep: number,
  steps: Array<{ instruction: string }>,
  lookAheadCount: number = 3
): Array<{ tool: string; stepNumber: number; prepTime?: string }> {
  const TOOL_KEYWORDS: Record<string, { prepTime?: string }> = {
    'walking foot': { prepTime: 'Takes a minute to switch' },
    'rotary cutter': {},
    '60° ruler': { prepTime: 'Specialty ruler required' },
    '45° ruler': { prepTime: 'Specialty ruler required' },
    'triangle ruler': { prepTime: 'Specialty ruler required' },
    'spray starch': { prepTime: 'Best applied before pressing' },
    'design wall': { prepTime: 'Lay out pieces before sewing' },
    'seam ripper': {},
    'bias tape maker': { prepTime: 'Takes setup time' },
  };

  const alerts: Array<{ tool: string; stepNumber: number; prepTime?: string }> = [];
  const endIndex = Math.min(currentStep + lookAheadCount, steps.length);

  for (let i = currentStep; i < endIndex; i++) {
    const instruction = steps[i].instruction.toLowerCase();

    for (const [tool, info] of Object.entries(TOOL_KEYWORDS)) {
      if (instruction.includes(tool) && !alerts.some(a => a.tool === tool)) {
        alerts.push({
          tool,
          stepNumber: i + 1,
          prepTime: info.prepTime,
        });
      }
    }
  }

  return alerts;
}

export default SessionWelcome;
