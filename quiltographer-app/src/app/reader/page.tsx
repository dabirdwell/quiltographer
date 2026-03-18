'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { FanNavigation } from '@/components/fan/FanNavigation';
import { PatternUpload } from '@/components/reader/PatternUpload';
import { StepContent } from '@/components/reader/StepContent';
import { MaterialsList } from '@/components/reader/MaterialsList';
import { quiltographerTheme } from '@/components/japanese/theme';
import { Text, Stack, Surface, Button, Callout, Container, ProgressBar } from '@/components/ui';
import { useClarification } from '@/hooks/useClarification';
import { usePatternSession } from '@/hooks/usePatternSession';
import type { PatternSession } from '@/hooks/usePatternSession';
import type { ReaderPattern, ConstructionStep } from '@/lib/reader/schema';

const FONT_SCALE_OPTIONS = [1, 1.5, 2, 3] as const;
type FontScale = (typeof FONT_SCALE_OPTIONS)[number];
const FREE_PATTERNS_PER_MONTH = 3;

type ViewState = 'upload' | 'processing' | 'reading';

// Track pattern usage for free tier
function getPatternUsage(): { count: number; month: string } {
  try {
    const raw = localStorage.getItem('quiltographer-usage');
    if (raw) {
      const data = JSON.parse(raw);
      const currentMonth = new Date().toISOString().slice(0, 7);
      if (data.month === currentMonth) return data;
    }
  } catch {}
  return { count: 0, month: new Date().toISOString().slice(0, 7) };
}

function recordPatternUsage() {
  const usage = getPatternUsage();
  const currentMonth = new Date().toISOString().slice(0, 7);
  const newUsage = {
    count: usage.month === currentMonth ? usage.count + 1 : 1,
    month: currentMonth,
  };
  localStorage.setItem('quiltographer-usage', JSON.stringify(newUsage));
  return newUsage;
}

function hasFullAccess(): boolean {
  try {
    return localStorage.getItem('quiltographer-beta') === 'true';
  } catch {
    return false;
  }
}

export default function PatternReaderPage() {
  const [viewState, setViewState] = useState<ViewState>('upload');
  const [pattern, setPattern] = useState<ReaderPattern | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [checkedMaterials, setCheckedMaterials] = useState<string[]>([]);
  const [clarifications, setClarifications] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showMaterials, setShowMaterials] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [fontScale, setFontScale] = useState<FontScale>(1);

  // Session persistence
  const [pendingSession, setPendingSession] = useState<PatternSession | null>(null);
  const { saveSession, loadSession, clearSession, findLatestSession } = usePatternSession();

  const { isLoading: isClarifying, requestClarification } = useClarification();

  // Check for beta pass in URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('beta') === 'quilt2026') {
      localStorage.setItem('quiltographer-beta', 'true');
    }
  }, []);

  // On mount, check for a saved session to offer resume
  useEffect(() => {
    const latest = findLatestSession();
    if (latest && latest.pattern.steps.length > 0) {
      setPendingSession(latest);
    }
  }, [findLatestSession]);

  // Auto-save session whenever relevant state changes
  useEffect(() => {
    if (pattern && viewState === 'reading') {
      saveSession({
        pattern,
        currentStepIndex,
        completedSteps,
        checkedMaterials,
        lastAccessed: new Date().toISOString(),
      });
    }
  }, [pattern, currentStepIndex, completedSteps, checkedMaterials, viewState, saveSession]);

  // Load high contrast preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('reader-high-contrast');
      if (saved === 'true') setHighContrast(true);
      const savedScale = localStorage.getItem('reader-font-scale');
      if (savedScale) {
        const parsed = parseFloat(savedScale);
        if (FONT_SCALE_OPTIONS.includes(parsed as FontScale)) {
          setFontScale(parsed as FontScale);
        }
      }
    } catch {}
  }, []);

  // Persist high contrast preference
  useEffect(() => {
    try {
      localStorage.setItem('reader-high-contrast', String(highContrast));
    } catch {}
  }, [highContrast]);

  // Persist font scale preference
  useEffect(() => {
    try {
      localStorage.setItem('reader-font-scale', String(fontScale));
    } catch {}
  }, [fontScale]);

  // Resume a saved session
  const handleResumeSession = useCallback((session: PatternSession) => {
    setPattern(session.pattern);
    setCurrentStepIndex(session.currentStepIndex);
    setCompletedSteps(session.completedSteps);
    setCheckedMaterials(session.checkedMaterials);
    setClarifications({});
    setViewState('reading');
    setPendingSession(null);
  }, []);

  // Dismiss the resume banner and start fresh
  const handleStartFresh = useCallback(() => {
    if (pendingSession?.pattern.source.fileName) {
      clearSession(pendingSession.pattern.source.fileName);
    }
    setPendingSession(null);
  }, [pendingSession, clearSession]);

  const handlePatternLoaded = useCallback(async (file: File) => {
    // Check free tier usage
    if (!hasFullAccess()) {
      const usage = getPatternUsage();
      if (usage.count >= FREE_PATTERNS_PER_MONTH) {
        setError(`You've used ${FREE_PATTERNS_PER_MONTH} free patterns this month. Upgrade to Pro for unlimited patterns, or come back next month!`);
        return;
      }
    }

    // Dismiss any pending session banner
    setPendingSession(null);

    setIsProcessing(true);
    setViewState('processing');
    setError(null);
    setProcessingMessage('Uploading pattern...');
    setProcessingProgress(5);

    try {
      const formData = new FormData();
      formData.append('file', file);

      setProcessingMessage('Parsing your pattern PDF...');
      setProcessingProgress(15);

      const response = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || data.details || 'Failed to process pattern');
      }

      setProcessingMessage('Processing complete! Loading pattern...');
      setProcessingProgress(95);

      const readerPattern: ReaderPattern = data;

      // Record usage for free tier tracking
      recordPatternUsage();

      setPattern(readerPattern);
      setViewState('reading');
      setCurrentStepIndex(0);
      setCompletedSteps([]);
      setCheckedMaterials([]);
      setClarifications({});
      setProcessingProgress(100);
    } catch (err) {
      console.error('Pattern processing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process pattern');
      setViewState('upload');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleStepSelect = useCallback(
    (index: number) => {
      if (index > currentStepIndex && !completedSteps.includes(currentStepIndex)) {
        setCompletedSteps((prev) => [...prev, currentStepIndex]);
      }
      setCurrentStepIndex(index);
    },
    [currentStepIndex, completedSteps]
  );

  const handlePrevious = useCallback(() => {
    if (currentStepIndex > 0) setCurrentStepIndex((prev) => prev - 1);
  }, [currentStepIndex]);

  const handleNext = useCallback(() => {
    if (pattern && currentStepIndex < pattern.steps.length - 1) {
      if (!completedSteps.includes(currentStepIndex)) {
        setCompletedSteps((prev) => [...prev, currentStepIndex]);
      }
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [currentStepIndex, pattern, completedSteps]);

  const handleRequestClarification = useCallback(
    async (step: ConstructionStep) => {
      const result = await requestClarification(step.instruction);
      if (result) {
        setClarifications((prev) => ({ ...prev, [step.id]: result }));
      }
    },
    [requestClarification]
  );

  const handleBackToUpload = useCallback(() => {
    // Clear saved session for the current pattern
    if (pattern?.source.fileName) {
      clearSession(pattern.source.fileName);
    }
    setViewState('upload');
    setPattern(null);
    setCurrentStepIndex(0);
    setCompletedSteps([]);
    setCheckedMaterials([]);
    setClarifications({});
    setError(null);
  }, [pattern, clearSession]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (viewState !== 'reading') {
        if (e.key === 'Escape' && viewState === 'processing') {
          handleBackToUpload();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
        case 'p':
          e.preventDefault();
          handlePrevious();
          break;
        case 'ArrowRight':
        case 'n':
          e.preventDefault();
          handleNext();
          break;
        case 'm':
          e.preventDefault();
          setShowMaterials((prev) => !prev);
          break;
        case 'Escape':
          e.preventDefault();
          handleBackToUpload();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewState, handlePrevious, handleNext, handleBackToUpload]);

  const cycleFontScale = useCallback(() => {
    setFontScale((prev) => {
      const idx = FONT_SCALE_OPTIONS.indexOf(prev);
      return FONT_SCALE_OPTIONS[(idx + 1) % FONT_SCALE_OPTIONS.length];
    });
  }, []);

  const currentStep = pattern?.steps[currentStepIndex];
  const navItems =
    pattern?.steps.map((step) => ({
      id: step.id,
      label: step.title || `Step ${step.number}`,
      shortLabel: `${step.number}`,
    })) || [];

  const highContrastStyles: React.CSSProperties = highContrast
    ? ({
        '--reader-font-scale': fontScale,
        backgroundColor: '#1a1a1a',
        color: '#ffffff',
        fontSize: `calc(1rem * ${fontScale})`,
      } as React.CSSProperties)
    : ({
        '--reader-font-scale': fontScale,
        backgroundImage: quiltographerTheme.textures.washiFiber,
        fontSize: `calc(1rem * ${fontScale})`,
      } as React.CSSProperties);

  return (
    <div className={`min-h-screen ${highContrast ? '' : 'bg-washi'}`} style={highContrastStyles}>
      {/* Header — responsive with 48px min touch targets */}
      <header
        className={`px-4 md:px-6 py-3 md:py-4 border-b flex justify-between items-center gap-2 ${
          highContrast ? 'bg-[#111] border-gray-600' : 'bg-rice border-ink-faint/20'
        }`}
      >
        <Stack direction="horizontal" gap="sm" align="center" className="min-w-0">
          <span className="text-2xl flex-shrink-0">🧵</span>
          <Text variant="heading" size="xl" color={highContrast ? 'default' : 'indigo'} className="hidden sm:block">
            Pattern Reader
          </Text>
          {viewState === 'reading' && pattern && (
            <Text size="sm" color="muted" className="truncate hidden md:block">
              — {pattern.name}
            </Text>
          )}
        </Stack>
        <Stack direction="horizontal" gap="xs" align="center" className="flex-shrink-0">
          {/* Font scale control — 48px touch target */}
          <button
            onClick={cycleFontScale}
            className={`min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg text-sm font-semibold border transition-colors ${
              highContrast
                ? 'border-gray-500 bg-gray-800 text-white hover:bg-gray-700'
                : 'border-ink-faint/30 bg-washi hover:bg-washi-dark text-ink-black'
            }`}
            aria-label={`Font scale: ${fontScale}x. Click to cycle.`}
            title={`Text size: ${fontScale}x`}
          >
            {fontScale === 1 ? 'A' : fontScale === 1.5 ? 'A+' : fontScale === 2 ? 'A++' : 'A+++'}
          </button>

          {/* High contrast toggle — 48px touch target */}
          <button
            onClick={() => setHighContrast((prev) => !prev)}
            className={`min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg text-sm font-semibold border transition-colors ${
              highContrast
                ? 'border-yellow-400 bg-yellow-400 text-black'
                : 'border-ink-faint/30 bg-washi hover:bg-washi-dark text-ink-black'
            }`}
            aria-label={highContrast ? 'Disable high contrast mode' : 'Enable high contrast mode'}
            aria-pressed={highContrast}
            title="Toggle high contrast"
          >
            {highContrast ? '◑' : '◐'}
          </button>

          {(viewState === 'reading' || viewState === 'processing') && (
            <button
              onClick={handleBackToUpload}
              className={`min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg text-sm border transition-colors ${
                highContrast
                  ? 'border-gray-500 text-white hover:bg-gray-700'
                  : 'border-ink-faint/30 text-ink-black hover:bg-washi-dark'
              }`}
              aria-label="New pattern"
            >
              <span className="hidden sm:inline">← New</span>
              <span className="sm:hidden">✕</span>
            </button>
          )}
        </Stack>
      </header>

      {/* Main content — responsive padding */}
      <main className="px-3 py-4 md:p-breathe max-w-[1200px] mx-auto">
        {/* Resume session banner */}
        {viewState === 'upload' && pendingSession && (
          <div className="max-w-[600px] mx-auto mb-6 mt-4">
            <Surface variant="rice" elevated padding="md">
              <Stack direction="horizontal" gap="md" align="center" className="justify-between">
                <Stack gap="xs">
                  <Text size="sm" color="indigo" className="font-semibold">
                    Resume reading {pendingSession.pattern.name}?
                  </Text>
                  <Text size="xs" color="muted">
                    Step {pendingSession.currentStepIndex + 1} of{' '}
                    {pendingSession.pattern.steps.length}
                    {pendingSession.completedSteps.length > 0 &&
                      ` — ${pendingSession.completedSteps.length} step${pendingSession.completedSteps.length === 1 ? '' : 's'} completed`}
                  </Text>
                </Stack>
                <Stack direction="horizontal" gap="sm">
                  <Button variant="primary" onClick={() => handleResumeSession(pendingSession)}>
                    Resume
                  </Button>
                  <Button variant="ghost" onClick={handleStartFresh}>
                    Start Fresh
                  </Button>
                </Stack>
              </Stack>
            </Surface>
          </div>
        )}

        {/* Upload view */}
        {viewState === 'upload' && (
          <div className="max-w-[600px] mx-auto mt-16">
            <Stack gap="rest" align="center" className="text-center mb-8">
              <Text variant="heading" size="3xl" color="indigo">
                Understand any quilt pattern
              </Text>
              <Text size="lg" color="muted">
                Upload a PDF and get clear, step-by-step guidance
              </Text>
            </Stack>

            {error && (
              <Callout variant="critical" icon="⚠️" className="mb-6">
                {error}
              </Callout>
            )}

            <PatternUpload onPatternLoaded={handlePatternLoaded} isProcessing={isProcessing} />
          </div>
        )}

        {/* Processing view */}
        {viewState === 'processing' && (
          <div className="max-w-[600px] mx-auto mt-16 text-center">
            <Surface variant="rice" elevated padding="xl">
              <Stack gap="breathe" align="center">
                <span className="text-5xl animate-pulse">🪡</span>
                <Text variant="heading" size="xl" color="indigo">
                  {processingMessage}
                </Text>
                <ProgressBar value={processingProgress} color="indigo" />
                <Text size="sm" color="muted">
                  This usually takes just a few seconds
                </Text>
              </Stack>
            </Surface>
          </div>
        )}

        {/* Reading view */}
        {viewState === 'reading' && pattern && currentStep && (
          <Stack gap="breathe">
            {/* Materials toggle button — 48px min touch target */}
            {pattern.materials && pattern.materials.length > 0 && (
              <div className="flex justify-end">
                <button
                  onClick={() => setShowMaterials(prev => !prev)}
                  className={`min-h-[48px] px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                    showMaterials
                      ? highContrast
                        ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300'
                        : 'border-indigo/30 bg-indigo/10 text-indigo'
                      : highContrast
                        ? 'border-gray-500 bg-gray-800 text-white hover:bg-gray-700'
                        : 'border-ink-faint/30 bg-washi hover:bg-washi-dark text-ink-black'
                  }`}
                >
                  {showMaterials ? '📋 Hide Materials' : '📋 Materials'}
                  {checkedMaterials.length > 0 && ` (${checkedMaterials.length}/${pattern.materials.length})`}
                </button>
              </div>
            )}

            {/* Materials panel */}
            {showMaterials && pattern.materials && pattern.materials.length > 0 && (
              <MaterialsList
                materials={pattern.materials}
                checkedIds={checkedMaterials}
                onToggle={(id) => {
                  setCheckedMaterials(prev =>
                    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
                  );
                }}
              />
            )}

            {pattern.summary && currentStepIndex === 0 && (
              <Surface variant="rice" elevated padding="md">
                <Text color="default" className="leading-relaxed">
                  <strong className="text-indigo">Pattern Summary:</strong> {pattern.summary}
                </Text>
              </Surface>
            )}

            <StepContent
              step={currentStep}
              stepNumber={currentStepIndex + 1}
              totalSteps={pattern.steps.length}
              onRequestClarification={handleRequestClarification}
              isLoadingClarification={isClarifying}
              clarification={clarifications[currentStep.id]}
            />

            {/* Large prev/next buttons — primary touch navigation */}
            <div className="flex gap-3 mt-2">
              <button
                onClick={handlePrevious}
                disabled={currentStepIndex === 0}
                className={`flex-1 min-h-[56px] md:min-h-[48px] rounded-xl text-lg font-semibold transition-colors disabled:opacity-30 ${
                  highContrast
                    ? 'bg-gray-700 text-white disabled:bg-gray-800'
                    : 'bg-washi-dark text-indigo hover:bg-indigo hover:text-white'
                }`}
                aria-label="Previous step"
              >
                ← Previous
              </button>
              <button
                onClick={handleNext}
                disabled={!pattern || currentStepIndex >= pattern.steps.length - 1}
                className={`flex-1 min-h-[56px] md:min-h-[48px] rounded-xl text-lg font-semibold transition-colors disabled:opacity-30 ${
                  highContrast
                    ? 'bg-gray-200 text-black disabled:bg-gray-800 disabled:text-gray-500'
                    : 'bg-persimmon text-white hover:opacity-90'
                }`}
                aria-label="Next step"
              >
                Next →
              </button>
            </div>

            {/* Step counter */}
            <div className={`text-center text-sm font-medium ${highContrast ? 'text-gray-400' : 'text-ink-gray'}`}>
              Step {currentStepIndex + 1} of {pattern.steps.length}
              {completedSteps.length > 0 && ` — ${completedSteps.length} completed`}
            </div>

            {/* Fan navigation — step dots for quick jump (hidden on very small screens) */}
            <div className="hidden sm:block">
              <FanNavigation
                items={navItems}
                currentIndex={currentStepIndex}
                completedIndices={completedSteps}
                onSelect={handleStepSelect}
                onPrevious={handlePrevious}
                onNext={handleNext}
              />
            </div>

            {/* Keyboard shortcut hint — desktop only */}
            <Text
              size="sm"
              color="muted"
              className="text-center mt-2 hidden md:block"
              style={highContrast ? { color: '#999' } : undefined}
            >
              ← → navigate • M materials • Esc back
            </Text>
          </Stack>
        )}
      </main>

      {/* Footer */}
      <footer className="p-4 text-center border-t border-ink-faint/20 mt-8">
        <Text size="sm" color="muted">
          Quiltographer Pattern Reader • Built with care for quilters
        </Text>
      </footer>
    </div>
  );
}
