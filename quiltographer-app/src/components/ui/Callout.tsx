import React from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * Callout — Contextual message boxes.
 *
 * Replaces the warning, tip, and AI clarification display patterns:
 *   style={{ padding: '0.75rem 1rem', borderLeft: '4px solid...', backgroundColor: '#fef2f2' }}
 *
 * With:
 *   <Callout variant="critical" icon="⚠️">Important: Check your seam allowance</Callout>
 *   <Callout variant="tip" icon="💡" title="Pro Tips">Use pins every 2 inches</Callout>
 *   <Callout variant="ai" icon="🤖" title="AI Clarification" onDismiss={...}>...</Callout>
 */

type CalloutVariant = 'info' | 'warning' | 'critical' | 'tip' | 'ai' | 'encouragement';

interface CalloutProps {
  children: React.ReactNode;
  variant?: CalloutVariant;
  icon?: string;
  title?: string;
  onDismiss?: () => void;
  className?: string;
}

const variantStyles: Record<CalloutVariant, { bg: string; border: string; titleColor: string }> = {
  info:          { bg: 'bg-rice',              border: 'border-l-indigo',    titleColor: 'text-indigo' },
  warning:       { bg: 'bg-yellow-50',         border: 'border-l-clay',      titleColor: 'text-clay' },
  critical:      { bg: 'bg-red-50',            border: 'border-l-silk',      titleColor: 'text-silk' },
  tip:           { bg: 'bg-sage/10',           border: 'border-l-sage',      titleColor: 'text-sage' },
  ai:            { bg: 'bg-rice',              border: 'border-l-sage',      titleColor: 'text-sage' },
  encouragement: { bg: 'bg-sage/10',           border: 'border-l-transparent', titleColor: 'text-sage' },
};

export function Callout({
  children,
  variant = 'info',
  icon,
  title,
  onDismiss,
  className,
}: CalloutProps) {
  const s = variantStyles[variant];

  return (
    <div
      className={twMerge(
        'p-3 sm:p-4 rounded-md border-l-4 font-body',
        s.bg, s.border,
        className,
      )}
    >
      {(title || onDismiss) && (
        <div className="flex justify-between items-center mb-1.5">
          {title && (
            <span className={twMerge('text-sm font-semibold', s.titleColor)}>
              {icon && `${icon} `}{title}
            </span>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="bg-transparent border-none cursor-pointer text-ink-gray text-lg leading-none p-0"
              aria-label="Dismiss"
            >
              ×
            </button>
          )}
        </div>
      )}
      {!title && icon && (
        <strong>{icon} </strong>
      )}
      <div className="text-base text-ink-black leading-relaxed">
        {children}
      </div>
    </div>
  );
}

export default Callout;
