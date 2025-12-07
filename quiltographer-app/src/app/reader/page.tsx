'use client';

import React, { useState, useCallback } from 'react';
import { WashiSurface } from '@/components/japanese/WashiSurface';
import { FanNavigation } from '@/components/fan/FanNavigation';
import { PatternUpload } from '@/components/reader/PatternUpload';
import { StepContent } from '@/components/reader/StepContent';
import { quiltographerTheme } from '@/components/japanese/theme';
import { useMockClarification as useClarification } from '@/hooks/useClarification';
import { MOCK_PATTERN } from '@/lib/reader/mock-pattern';
import type { ReaderPattern, ConstructionStep } from '@/lib/reader/schema';

type ViewState = 'upload' | 'reading';

export default function PatternReaderPage() {
  const [viewState, setViewState] = useState<ViewState>('upload');
  const [pattern, setPattern] = useState<ReaderPattern | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [clarifications, setClarifications] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const { isLoading: isClarifying, requestClarification } = useClarification();

  const handlePatternLoaded = useCallback(async (file: File) => {
    setIsProcessing(true);
    
    // For now, use mock pattern until parser is connected
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing
    
    setPattern({
      ...MOCK_PATTERN,
      name: file.name.replace('.pdf', ''),
      source: { fileName: file.name, parsedAt: new Date() }
    });
    setViewState('reading');
    setCurrentStepIndex(0);
    setCompletedSteps([]);
    setClarifications({});
    setIsProcessing(false);
  }, []);

  const handleStepSelect = useCallback((index: number) => {
    if (index > currentStepIndex && !completedSteps.includes(currentStepIndex)) {
      setCompletedSteps(prev => [...prev, currentStepIndex]);
    }
    setCurrentStepIndex(index);
  }, [currentStepIndex, completedSteps]);

  const handlePrevious = useCallback(() => {
    if (currentStepIndex > 0) setCurrentStepIndex(prev => prev - 1);
  }, [currentStepIndex]);

  const handleNext = useCallback(() => {
    if (pattern && currentStepIndex < pattern.steps.length - 1) {
      if (!completedSteps.includes(currentStepIndex)) {
        setCompletedSteps(prev => [...prev, currentStepIndex]);
      }
      setCurrentStepIndex(prev => prev + 1);
    }
  }, [currentStepIndex, pattern, completedSteps]);

  const handleRequestClarification = useCallback(async (step: ConstructionStep) => {
    const result = await requestClarification(step.instruction);
    if (result) {
      setClarifications(prev => ({ ...prev, [step.id]: result }));
    }
  }, [requestClarification]);

  const handleBackToUpload = useCallback(() => {
    setViewState('upload');
    setPattern(null);
    setCurrentStepIndex(0);
    setCompletedSteps([]);
    setClarifications({});
  }, []);

  const currentStep = pattern?.steps[currentStepIndex];
  const navItems = pattern?.steps.map(step => ({
    id: step.id,
    label: step.title || `Step ${step.number}`,
    shortLabel: `${step.number}`,
  })) || [];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: quiltographerTheme.colors.washi,
      backgroundImage: quiltographerTheme.textures.washiFiber,
    }}>
      {/* Header */}
      <header style={{
        padding: '1rem 1.5rem',
        borderBottom: quiltographerTheme.borders.hairline,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: quiltographerTheme.colors.rice,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🧵</span>
          <h1 style={{
            fontSize: quiltographerTheme.typography.fontSize.xl,
            fontFamily: quiltographerTheme.typography.fontFamily.display,
            color: quiltographerTheme.colors.indigo,
            margin: 0,
          }}>
            Pattern Reader
          </h1>
          {viewState === 'reading' && pattern && (
            <span style={{
              fontSize: quiltographerTheme.typography.fontSize.sm,
              color: quiltographerTheme.colors.inkGray,
              fontFamily: quiltographerTheme.typography.fontFamily.body,
            }}>
              — {pattern.name}
            </span>
          )}
        </div>
        {viewState === 'reading' && (
          <button
            onClick={handleBackToUpload}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'transparent',
              border: quiltographerTheme.borders.subtle,
              borderRadius: quiltographerTheme.radius.md,
              color: quiltographerTheme.colors.indigo,
              fontSize: quiltographerTheme.typography.fontSize.sm,
              fontFamily: quiltographerTheme.typography.fontFamily.body,
              cursor: 'pointer',
            }}
          >
            ← New Pattern
          </button>
        )}
      </header>

      {/* Main content */}
      <main style={{ 
        padding: quiltographerTheme.spacing.breathe, 
        maxWidth: '1200px', 
        margin: '0 auto' 
      }}>
        {viewState === 'upload' && (
          <div style={{ maxWidth: '600px', margin: '4rem auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{
                fontSize: quiltographerTheme.typography.fontSize['3xl'],
                fontFamily: quiltographerTheme.typography.fontFamily.display,
                color: quiltographerTheme.colors.indigo,
                marginBottom: '0.5rem',
              }}>
                Understand any quilt pattern
              </h2>
              <p style={{
                fontSize: quiltographerTheme.typography.fontSize.lg,
                color: quiltographerTheme.colors.inkGray,
                fontFamily: quiltographerTheme.typography.fontFamily.body,
              }}>
                Upload a PDF and get step-by-step guidance
              </p>
            </div>
            <PatternUpload onPatternLoaded={handlePatternLoaded} isProcessing={isProcessing} />
          </div>
        )}

        {viewState === 'reading' && pattern && currentStep && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: quiltographerTheme.spacing.breathe 
          }}>
            {pattern.summary && currentStepIndex === 0 && (
              <WashiSurface variant="rice" elevated>
                <div style={{ padding: '1rem 1.5rem' }}>
                  <p style={{
                    fontSize: quiltographerTheme.typography.fontSize.base,
                    color: quiltographerTheme.colors.inkBlack,
                    fontFamily: quiltographerTheme.typography.fontFamily.body,
                    lineHeight: quiltographerTheme.typography.lineHeight.relaxed,
                    margin: 0,
                  }}>
                    <strong style={{ color: quiltographerTheme.colors.indigo }}>
                      Pattern Summary:
                    </strong>{' '}
                    {pattern.summary}
                  </p>
                </div>
              </WashiSurface>
            )}

            <StepContent
              step={currentStep}
              stepNumber={currentStepIndex + 1}
              totalSteps={pattern.steps.length}
              onRequestClarification={handleRequestClarification}
              isLoadingClarification={isClarifying}
              clarification={clarifications[currentStep.id]}
            />

            <FanNavigation
              items={navItems}
              currentIndex={currentStepIndex}
              completedIndices={completedSteps}
              onSelect={handleStepSelect}
              onPrevious={handlePrevious}
              onNext={handleNext}
            />
          </div>
        )}
      </main>

      <footer style={{
        padding: '1rem',
        textAlign: 'center',
        borderTop: quiltographerTheme.borders.hairline,
        marginTop: '2rem',
      }}>
        <p style={{
          fontSize: quiltographerTheme.typography.fontSize.sm,
          color: quiltographerTheme.colors.inkGray,
          fontFamily: quiltographerTheme.typography.fontFamily.body,
          margin: 0,
        }}>
          Quiltographer Pattern Reader • MVP in Progress
        </p>
      </footer>
    </div>
  );
}