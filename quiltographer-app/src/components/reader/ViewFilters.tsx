'use client';

import React from 'react';
import { quiltographerTheme } from '../japanese/theme';

const theme = quiltographerTheme;

export type ViewFilter = 'all' | 'cutting' | 'pressing' | 'measurements';

interface ViewFiltersProps {
  currentFilter: ViewFilter;
  onFilterChange: (filter: ViewFilter) => void;
  stepCounts: {
    all: number;
    cutting: number;
    pressing: number;
    measurements: number;
  };
}

export function ViewFilters({ currentFilter, onFilterChange, stepCounts }: ViewFiltersProps) {
  const filters: Array<{
    id: ViewFilter;
    label: string;
    icon: string;
    color: string;
  }> = [
    { id: 'all', label: 'All Steps', icon: '📋', color: theme.colors.indigo },
    { id: 'cutting', label: 'Just Cutting', icon: '✂️', color: theme.colors.persimmon },
    { id: 'pressing', label: 'Just Pressing', icon: '🔥', color: theme.colors.clay },
    { id: 'measurements', label: 'Measurements', icon: '📐', color: theme.colors.sage },
  ];

  return (
    <div style={{
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap',
      padding: '0.5rem',
      backgroundColor: theme.colors.washiDark,
      borderRadius: theme.radius.lg,
    }}>
      {filters.map(filter => {
        const isActive = currentFilter === filter.id;
        const count = stepCounts[filter.id];

        return (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            disabled={count === 0 && filter.id !== 'all'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: isActive ? filter.color : theme.colors.rice,
              color: isActive ? theme.colors.rice : theme.colors.inkBlack,
              border: 'none',
              borderRadius: theme.radius.md,
              cursor: count === 0 && filter.id !== 'all' ? 'not-allowed' : 'pointer',
              fontSize: theme.typography.fontSize.sm,
              fontWeight: isActive ? 600 : 400,
              opacity: count === 0 && filter.id !== 'all' ? 0.5 : 1,
              transition: `all ${theme.timing.quick} ${theme.timing.easeOut}`,
              fontFamily: theme.typography.fontFamily.body,
            }}
          >
            <span>{filter.icon}</span>
            <span>{filter.label}</span>
            {count > 0 && filter.id !== 'all' && (
              <span style={{
                backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : `${filter.color}20`,
                color: isActive ? theme.colors.rice : filter.color,
                padding: '2px 6px',
                borderRadius: theme.radius.full,
                fontSize: theme.typography.fontSize.xs,
                fontWeight: 600,
              }}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// Press direction tracker component
export interface PressStep {
  stepNumber: number;
  direction: 'left' | 'right' | 'open' | 'toward-dark' | 'toward-light';
  description: string;
}

interface PressDirectionTrackerProps {
  pressSteps: PressStep[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function PressDirectionTracker({ pressSteps, currentStep, onStepClick }: PressDirectionTrackerProps) {
  if (pressSteps.length === 0) return null;

  const getDirectionArrow = (direction: PressStep['direction']): string => {
    switch (direction) {
      case 'left': return '←';
      case 'right': return '→';
      case 'open': return '↔';
      case 'toward-dark': return '→●';
      case 'toward-light': return '●←';
      default: return '→';
    }
  };

  const getDirectionLabel = (direction: PressStep['direction']): string => {
    switch (direction) {
      case 'left': return 'Press LEFT';
      case 'right': return 'Press RIGHT';
      case 'open': return 'Press OPEN';
      case 'toward-dark': return 'Toward dark';
      case 'toward-light': return 'Toward light';
      default: return 'Press';
    }
  };

  return (
    <div style={{
      backgroundColor: theme.colors.rice,
      borderRadius: theme.radius.lg,
      border: `1px solid ${theme.colors.clay}40`,
      padding: theme.spacing.breathe,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1rem',
      }}>
        <span style={{ fontSize: '1.25rem' }}>🔥</span>
        <span style={{
          fontWeight: 600,
          color: theme.colors.indigo,
          fontFamily: theme.typography.fontFamily.display,
        }}>
          Pressing Guide
        </span>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}>
        {pressSteps.map((step, index) => {
          const isCurrentStep = step.stepNumber === currentStep;
          const isPastStep = step.stepNumber < currentStep;

          // Check for nesting opportunity
          const prevStep = pressSteps[index - 1];
          const shouldNest = prevStep && (
            (prevStep.direction === 'left' && step.direction === 'right') ||
            (prevStep.direction === 'right' && step.direction === 'left')
          );

          return (
            <div key={step.stepNumber}>
              <button
                onClick={() => onStepClick?.(step.stepNumber)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: isCurrentStep ? `${theme.colors.clay}20` : 'transparent',
                  border: isCurrentStep ? `2px solid ${theme.colors.clay}` : '2px solid transparent',
                  borderRadius: theme.radius.md,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: `all ${theme.timing.quick} ${theme.timing.easeOut}`,
                }}
              >
                {/* Step number */}
                <span style={{
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isPastStep ? theme.colors.sage : isCurrentStep ? theme.colors.clay : theme.colors.washiDark,
                  color: isPastStep || isCurrentStep ? theme.colors.rice : theme.colors.inkBlack,
                  borderRadius: theme.radius.full,
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: 600,
                }}>
                  {isPastStep ? '✓' : step.stepNumber}
                </span>

                {/* Direction arrow */}
                <span style={{
                  fontSize: '1.5rem',
                  color: isCurrentStep ? theme.colors.clay : theme.colors.inkGray,
                  minWidth: '40px',
                }}>
                  {getDirectionArrow(step.direction)}
                </span>

                {/* Description */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: isCurrentStep ? 600 : 400,
                    color: isCurrentStep ? theme.colors.inkBlack : theme.colors.inkGray,
                    textDecoration: isPastStep ? 'line-through' : 'none',
                  }}>
                    {getDirectionLabel(step.direction)}
                  </div>
                  <div style={{
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.colors.inkGray,
                    marginTop: '2px',
                  }}>
                    {step.description}
                  </div>
                </div>
              </button>

              {/* Nesting hint */}
              {shouldNest && isCurrentStep && (
                <div style={{
                  marginLeft: '44px',
                  marginTop: '4px',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: `${theme.colors.sage}15`,
                  borderRadius: theme.radius.sm,
                  fontSize: theme.typography.fontSize.xs,
                  color: theme.colors.sage,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}>
                  <span>🧩</span>
                  <span>Seams will nest with previous row!</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Measurements reference card
interface MeasurementItem {
  label: string;
  value: string;
  valueCm?: string;
  context?: string;
}

interface MeasurementsCardProps {
  measurements: MeasurementItem[];
  showMetric: boolean;
  onToggleMetric: () => void;
}

export function MeasurementsCard({ measurements, showMetric, onToggleMetric }: MeasurementsCardProps) {
  if (measurements.length === 0) return null;

  return (
    <div style={{
      backgroundColor: theme.colors.rice,
      borderRadius: theme.radius.lg,
      border: `1px solid ${theme.colors.sage}40`,
      padding: theme.spacing.breathe,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.25rem' }}>📐</span>
          <span style={{
            fontWeight: 600,
            color: theme.colors.indigo,
            fontFamily: theme.typography.fontFamily.display,
          }}>
            Quick Reference
          </span>
        </div>

        <button
          onClick={onToggleMetric}
          style={{
            padding: '0.25rem 0.75rem',
            backgroundColor: theme.colors.washiDark,
            border: 'none',
            borderRadius: theme.radius.full,
            cursor: 'pointer',
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.inkBlack,
            transition: `all ${theme.timing.quick} ${theme.timing.easeOut}`,
          }}
        >
          {showMetric ? 'Show Imperial' : 'Show Metric'}
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '0.75rem',
      }}>
        {measurements.map((item, index) => (
          <div
            key={index}
            style={{
              padding: '0.75rem',
              backgroundColor: theme.colors.washi,
              borderRadius: theme.radius.md,
              textAlign: 'center',
            }}
          >
            <div style={{
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.inkGray,
              marginBottom: '0.25rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              {item.label}
            </div>
            <div style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: 600,
              color: theme.colors.indigo,
              fontFamily: theme.typography.fontFamily.display,
            }}>
              {showMetric && item.valueCm ? item.valueCm : item.value}
            </div>
            {item.context && (
              <div style={{
                fontSize: theme.typography.fontSize.xs,
                color: theme.colors.inkGray,
                marginTop: '0.25rem',
              }}>
                {item.context}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper to extract press steps from pattern
export function extractPressSteps(steps: Array<{
  number: number;
  instruction: string;
  title?: string;
}>): PressStep[] {
  const pressSteps: PressStep[] = [];

  steps.forEach(step => {
    const text = step.instruction.toLowerCase();

    // Check if step mentions pressing
    if (text.includes('press') || text.includes('iron')) {
      let direction: PressStep['direction'] = 'right';
      let description = 'Press seam';

      // Detect direction
      if (text.includes('open')) {
        direction = 'open';
        description = 'Press seam open';
      } else if (text.includes('toward') && text.includes('dark')) {
        direction = 'toward-dark';
        description = 'Press toward darker fabric';
      } else if (text.includes('toward') && text.includes('light')) {
        direction = 'toward-light';
        description = 'Press toward lighter fabric';
      } else if (text.includes('left') || text.includes('away')) {
        direction = 'left';
        description = 'Press seam to the left';
      } else if (text.includes('right') || text.includes('toward')) {
        direction = 'right';
        description = 'Press seam to the right';
      }

      // Extract more context if available
      const match = step.instruction.match(/press\s+(?:the\s+)?(?:seam\s+)?(.{0,40})/i);
      if (match) {
        description = `Press ${match[1].trim()}`;
      }

      pressSteps.push({
        stepNumber: step.number,
        direction,
        description,
      });
    }
  });

  return pressSteps;
}

// Helper to count steps by type
export function countStepsByType(steps: Array<{
  instruction: string;
  techniques?: string[];
}>): { cutting: number; pressing: number; measurements: number } {
  let cutting = 0;
  let pressing = 0;
  let measurements = 0;

  steps.forEach(step => {
    const text = step.instruction.toLowerCase();
    const techniques = (step.techniques || []).join(' ').toLowerCase();

    if (text.includes('cut') || techniques.includes('cutting')) {
      cutting++;
    }
    if (text.includes('press') || text.includes('iron') || techniques.includes('pressing')) {
      pressing++;
    }
    if (text.match(/\d+(?:½|¼|¾|\.?\d*)?["″]/)) {
      measurements++;
    }
  });

  return { cutting, pressing, measurements };
}

export default ViewFilters;
