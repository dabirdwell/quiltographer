'use client';

import React, { useState } from 'react';
import { quiltographerTheme } from '../japanese/theme';
import { VisualDiagram } from './VisualDiagram';
import {
  Text, Stack, Surface, Button, Badge, Callout, FontSizeControl,
  type FontSizeOption,
} from '@/components/ui';
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

const fontSizeClasses: Record<FontSizeOption, string> = {
  normal: 'text-lg',
  large: 'text-2xl',
  xlarge: 'text-3xl',
};

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
  const [fontSize, setFontSize] = useState<FontSizeOption>('normal');
  const [aiHelp, setAiHelp] = useState<{ type: AIHelpType; content: string } | null>(null);
  const [loadingHelp, setLoadingHelp] = useState<AIHelpType | null>(null);
  const [selectedTechnique, setSelectedTechnique] = useState<string | null>(null);

  const getEncouragement = () => {
    const progress = stepNumber / totalSteps;
    if (stepNumber === 1) return "Let's get started! You've got this! 🌟";
    if (progress < 0.25) return "Great start! Keep that momentum going! 💪";
    if (progress < 0.5) return "You're making wonderful progress! 🎉";
    if (progress < 0.75) return "Over halfway there! Your quilt is taking shape! ✨";
    if (progress < 1) return "Almost done! The finish line is in sight! 🏁";
    return "Final step! You did it! 🎊";
  };

  const requestAIHelp = async (type: AIHelpType, context?: string) => {
    setLoadingHelp(type);
    const prompts: Record<AIHelpType, string> = {
      clarify: step.instruction,
      simplify: `SIMPLIFY THIS: "${step.instruction}" - Rewrite in simplest terms for a beginner.`,
      tools: `TOOLS NEEDED: "${step.instruction}" - List only the specific tools needed for THIS step.`,
      technique: `TECHNIQUE: "${context}" in: "${step.instruction}" - Explain in 2-3 sentences for a beginner.`,
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
        if (type === 'technique') setSelectedTechnique(context || null);
        setAiHelp({ type, content: data.clarification });
      }
    } catch (error) {
      console.error('AI help error:', error);
    } finally {
      setLoadingHelp(null);
    }
  };

  const handleClarify = () => onRequestClarification?.(step);

  const formatAIContent = (content: string) => content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^# (.*$)/gm, '<h3 style="margin: 0.5rem 0; color: #2c3e50;">$1</h3>')
    .replace(/^- (.*$)/gm, '<li style="margin-left: 1rem;">$1</li>');

  const helpLabels: Record<AIHelpType, { icon: string; label: string; variant: 'info' | 'ai' | 'tip' | 'warning' }> = {
    clarify: { icon: '🤖', label: 'AI Clarification', variant: 'ai' },
    simplify: { icon: '✨', label: 'Simplified Version', variant: 'tip' },
    tools: { icon: '🧰', label: 'Tools Needed', variant: 'info' },
    technique: { icon: '📚', label: `About "${selectedTechnique}"`, variant: 'warning' },
  };

  return (
    <Surface elevated className="step-content">
      <div className="p-rest max-w-[800px] mx-auto">
        {/* Progress encouragement */}
        <Callout variant="encouragement" className="mb-4 text-center">
          {getEncouragement()}
        </Callout>

        {/* Step header */}
        <header className="flex justify-between items-start mb-breathe">
          <div>
            <Text size="sm" color="muted" className="uppercase tracking-wider">
              Step {stepNumber} of {totalSteps}
            </Text>
            {step.title && (
              <Text variant="heading" size="2xl" color="indigo" className="mt-1">
                {step.title}
              </Text>
            )}
          </div>
          <FontSizeControl value={fontSize} onChange={setFontSize} />
        </header>

        {/* Warnings - prominent before instruction */}
        {step.warnings && step.warnings.length > 0 && (
          <Stack gap="xs" className="mb-breathe">
            {step.warnings.map((warning, idx) => (
              <Callout
                key={idx}
                variant={warning.type === 'critical' ? 'critical' : 'warning'}
                icon={warning.type === 'critical' ? '⚠️' : '💡'}
                title={warning.type === 'critical' ? 'Important' : 'Note'}
              >
                {warning.message}
              </Callout>
            ))}
          </Stack>
        )}

        {/* Main instruction */}
        <div className={`${fontSizeClasses[fontSize]} leading-relaxed font-body text-ink-black mb-rest`}>
          {step.clarifiedInstruction || step.instruction}
        </div>

        {/* Auto-generated Visual Diagram */}
        <VisualDiagram
          techniques={step.techniques || []}
          instruction={step.instruction}
          step={stepNumber}
        />

        {/* Techniques - clickable badges */}
        {step.techniques && step.techniques.length > 0 && (
          <Stack direction="horizontal" gap="xs" className="mb-breathe flex-wrap items-center">
            <Text size="sm" color="muted">Techniques used:</Text>
            {step.techniques.map((technique, idx) => (
              <Badge
                key={idx}
                color="indigo"
                variant={selectedTechnique === technique ? 'active' : 'default'}
                onClick={() => requestAIHelp('technique', technique)}
              >
                {loadingHelp === 'technique' && selectedTechnique === technique ? '...' : technique}
              </Badge>
            ))}
          </Stack>
        )}

        {/* AI Help Buttons — 48px min touch targets on mobile */}
        <Stack direction="horizontal" gap="xs" className="mb-breathe pt-2 border-t border-ink-faint/20 flex-wrap [&_button]:min-h-[48px]">
          <Button
            variant="primary"
            color={clarification ? 'sage' : 'indigo'}
            icon={isLoadingClarification ? '⟳' : clarification ? '✓' : '🤖'}
            onClick={handleClarify}
            disabled={isLoadingClarification || !!clarification}
          >
            {isLoadingClarification ? 'Asking...' : clarification ? 'Explained' : 'Explain this'}
          </Button>

          <Button
            variant={aiHelp?.type === 'simplify' ? 'primary' : 'outline'}
            color="persimmon"
            icon={loadingHelp === 'simplify' ? '⟳' : '✨'}
            onClick={() => requestAIHelp('simplify')}
            disabled={loadingHelp === 'simplify'}
          >
            Simplify
          </Button>

          <Button
            variant={aiHelp?.type === 'tools' ? 'primary' : 'outline'}
            color="clay"
            icon={loadingHelp === 'tools' ? '⟳' : '🧰'}
            onClick={() => requestAIHelp('tools')}
            disabled={loadingHelp === 'tools'}
          >
            What tools?
          </Button>
        </Stack>

        {/* AI Clarification display (from parent) */}
        {clarification && (
          <Callout variant="ai" icon="🤖" title="AI Clarification" className="mb-4">
            <div
              className={`${fontSizeClasses[fontSize]} leading-relaxed font-body text-ink-black whitespace-pre-wrap`}
              dangerouslySetInnerHTML={{ __html: formatAIContent(clarification) }}
            />
          </Callout>
        )}

        {/* Additional AI help display */}
        {aiHelp && (
          <Callout
            variant={helpLabels[aiHelp.type].variant}
            icon={helpLabels[aiHelp.type].icon}
            title={helpLabels[aiHelp.type].label}
            onDismiss={() => { setAiHelp(null); setSelectedTechnique(null); }}
            className="mb-4"
          >
            <div
              className={`${fontSizeClasses[fontSize]} leading-relaxed font-body text-ink-black whitespace-pre-wrap`}
              dangerouslySetInnerHTML={{ __html: formatAIContent(aiHelp.content) }}
            />
          </Callout>
        )}

        {/* Tips */}
        {step.tips && step.tips.length > 0 && (
          <Callout variant="tip" icon="💡" title="Pro Tips" className="mt-breathe">
            <ul className="m-0 pl-5">
              {step.tips.map((tip, idx) => (
                <li key={idx} className="text-base text-ink-black mb-1">
                  {tip.text}
                </li>
              ))}
            </ul>
          </Callout>
        )}
      </div>
    </Surface>
  );
}

export default StepContent;
