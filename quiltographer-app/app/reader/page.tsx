'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { VisualDiagram } from './VisualDiagram';
import { quiltographerTheme, WashiSurface, KumihimoProgress } from '@/components/japanese';
import { HighlightedText } from '@/components/reader/Tooltip';
import { TooltipProvider, TooltipSettings } from '@/components/reader/TooltipProvider';
import { CuttingChecklist, extractCuttingItems } from '@/components/reader/CuttingChecklist';
import { ViewFilters, ViewFilter, PressDirectionTracker, MeasurementsCard, extractPressSteps, countStepsByType } from '@/components/reader/ViewFilters';
import { MiniCalculators, CalculatorButton } from '@/components/reader/MiniCalculators';
import { SessionWelcome, GoodStoppingPoint, ToolPrepAlert, isGoodStoppingPoint, lookAheadForTools } from '@/components/reader/SessionWelcome';
import { QUILTING_GLOSSARY } from '@/lib/reader/glossary';
import { usePreferences } from '@/hooks/usePreferences';
import { useSession } from '@/hooks/useSession';
import { extractMeasurements, convertMeasurement } from '@/lib/reader/calculators';

// Type for parsed pattern from PDF or sample
interface PatternStep {
  number: number;
  title: string;
  instruction: string;
  techniques?: string[];
  note?: string;
  warning?: string;
}

interface Pattern {
  id: string;
  name: string;
  steps: PatternStep[];
  finishedSize?: { width: number; height: number };
}

// Mock pattern data for demonstration (fallback when no PDF loaded)
const SAMPLE_PATTERN: Pattern = {
  id: 'sample-pattern',
  name: "Sample Quilt Pattern SKINNY",
  steps: [
    {
      number: 1,
      title: "Cutting Your Fabric",
      instruction: "Cut all fabric pieces according to the cutting list. Cut (4) 5\" squares from light fabric and (8) 2½\" x 4½\" rectangles. Use a rotary cutter and cutting mat for accuracy.",
      techniques: ["cutting"],
      note: "Always press toward the darker fabric to prevent show-through.",
      warning: "Ensure grain lines are straight before cutting"
    },
    {
      number: 2,
      title: "First Light Strip",
      instruction: "Place your center square RST with a light strip. Sew with ¼\" seam allowance. Press toward the strip. Trim even.",
      techniques: ["RST", "chain piecing"],
      note: "Always press toward the darker fabric to prevent show-through."
    },
    {
      number: 3,
      title: "Adding Second Strip",
      instruction: "Add another light strip to the opposite side. Press seam toward the strip. You'll be nesting seams in the next step.",
      techniques: ["sewing", "pressing"],
      note: "Keep consistent ¼\" seam allowance"
    },
    {
      number: 4,
      title: "Creating HST Units",
      instruction: "Draw a diagonal line on wrong side of light squares. Place RST with dark squares. Sew ¼\" on both sides of line. Cut on drawn line to create 2 HST units. Square up to 4½\".",
      techniques: ["HST", "cutting"],
      note: "Square up HST units to ensure accuracy"
    },
    {
      number: 5,
      title: "Final Assembly",
      instruction: "Arrange all blocks according to pattern layout. Sew blocks into rows with nesting seams, then join rows. Press all seams. Use a walking foot for the final assembly if available.",
      techniques: ["sewing", "pressing"],
      note: "Pin at intersections for perfect points"
    }
  ],
  finishedSize: { width: 38, height: 50 }
};

const theme = quiltographerTheme;

function PatternReaderContent() {
  const [pattern, setPattern] = useState<Pattern>(SAMPLE_PATTERN);
  const [currentStep, setCurrentStep] = useState(1);
  const [showTechnique, setShowTechnique] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiClarification, setAiClarification] = useState<string | null>(null);
  const [aiHelpType, setAiHelpType] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showCalculators, setShowCalculators] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all');

  // Hooks
  const { preferences, toggleUnits, setPreferences } = usePreferences();
  const {
    session,
    isReturningUser,
    setCurrentStep: setSessionStep,
    completeStep,
    recordPressDirection,
    dismissReturnMessage,
    getProgressSummary,
    formatTimeSince,
    clearSession,
  } = useSession(pattern.id, pattern.name, pattern.steps.length);

  const step = pattern.steps[currentStep - 1];

  const fontSizes = {
    normal: theme.typography.fontSize.base,
    large: theme.typography.fontSize.lg,
    xlarge: theme.typography.fontSize['2xl']
  };

  // Sync step with session
  useEffect(() => {
    if (session && session.currentStep !== currentStep) {
      setSessionStep(currentStep);
    }
  }, [currentStep, session, setSessionStep]);

  // Extract data for features
  const cuttingItems = useMemo(() => extractCuttingItems(pattern.steps), [pattern.steps]);
  const pressSteps = useMemo(() => extractPressSteps(pattern.steps), [pattern.steps]);
  const stepCounts = useMemo(() => {
    const counts = countStepsByType(pattern.steps);
    return { all: pattern.steps.length, ...counts };
  }, [pattern.steps]);

  // Extract measurements for reference card
  const measurements = useMemo(() => {
    const allMeasurements: Array<{ label: string; value: string; valueCm?: string; context?: string }> = [];

    pattern.steps.forEach(s => {
      const extracted = extractMeasurements(s.instruction);
      extracted.forEach(m => {
        if (m.unit === 'inches' && !allMeasurements.some(existing => existing.value === m.original)) {
          const converted = convertMeasurement(m.value, 'inches');
          allMeasurements.push({
            label: m.original.includes('x') ? 'Dimension' : 'Size',
            value: m.original,
            valueCm: `${converted.converted}cm`,
          });
        }
      });
    });

    return allMeasurements.slice(0, 8); // Limit to 8 most common
  }, [pattern.steps]);

  // Filter steps based on view filter
  const filteredStepNumbers = useMemo(() => {
    if (viewFilter === 'all') {
      return pattern.steps.map(s => s.number);
    }

    return pattern.steps
      .filter(s => {
        const text = s.instruction.toLowerCase();
        const techniques = (s.techniques || []).join(' ').toLowerCase();

        switch (viewFilter) {
          case 'cutting':
            return text.includes('cut') || techniques.includes('cutting');
          case 'pressing':
            return text.includes('press') || text.includes('iron') || techniques.includes('pressing');
          case 'measurements':
            return !!text.match(/\d+(?:½|¼|¾|\.?\d*)?["″]/);
          default:
            return true;
        }
      })
      .map(s => s.number);
  }, [pattern.steps, viewFilter]);

  // Check for good stopping point
  const stoppingPointInfo = useMemo(() => isGoodStoppingPoint(step.instruction, step.title), [step]);

  // Look ahead for tools
  const toolAlerts = useMemo(
    () => lookAheadForTools(currentStep - 1, pattern.steps, 3).filter(a => a.stepNumber > currentStep),
    [currentStep, pattern.steps]
  );

  // Detect press direction from instruction
  useEffect(() => {
    const text = step.instruction.toLowerCase();
    if (text.includes('press')) {
      if (text.includes('open')) {
        recordPressDirection(currentStep, 'open');
      } else if (text.includes('toward') && text.includes('dark')) {
        recordPressDirection(currentStep, 'toward-dark');
      } else if (text.includes('left')) {
        recordPressDirection(currentStep, 'left');
      } else if (text.includes('right') || text.includes('toward')) {
        recordPressDirection(currentStep, 'right');
      }
    }
  }, [currentStep, step.instruction, recordPressDirection]);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to parse PDF');
      }

      const parsedPattern = await response.json();

      // Transform parsed pattern to our format
      const transformedPattern: Pattern = {
        id: parsedPattern.id || `pattern-${Date.now()}`,
        name: parsedPattern.name || parsedPattern.metadata?.name || file.name.replace('.pdf', ''),
        steps: (parsedPattern.steps || parsedPattern.construction?.steps || []).map((s: any, idx: number) => ({
          number: s.number || idx + 1,
          title: s.title || `Step ${idx + 1}`,
          instruction: s.clarifiedInstruction || s.instruction,
          techniques: s.techniques || [],
          note: s.tips?.[0]?.text,
          warning: s.warnings?.[0]?.message
        })),
        finishedSize: parsedPattern.finishedSize,
      };

      if (transformedPattern.steps.length === 0) {
        throw new Error('No steps found in pattern');
      }

      setPattern(transformedPattern);
      setCurrentStep(1);
      setAiClarification(null);
      setViewFilter('all');
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      handleFileUpload(file);
    } else {
      setUploadError('Please drop a PDF file');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleTechniqueClick = async (technique: string) => {
    if (showTechnique === technique) {
      setShowTechnique(null);
      return;
    }
    setShowTechnique(technique);
    setAiHelpType('technique');
    setIsLoadingAI(true);

    try {
      const response = await fetch('/api/clarify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instruction: `TECHNIQUE: "${technique}" in the context of: "${step.instruction}" - Explain this quilting technique in 2-3 sentences for a beginner.`,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setAiClarification(data.clarification);
      }
    } catch (error) {
      console.error('AI error:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleAIHelp = async (type: 'explain' | 'simplify' | 'tools') => {
    setAiHelpType(type);
    setIsLoadingAI(true);
    setShowTechnique(null);

    const prompts = {
      explain: step.instruction,
      simplify: `SIMPLIFY: "${step.instruction}" - Rewrite in the simplest terms for a complete beginner. Short sentences. No jargon.`,
      tools: `TOOLS NEEDED: "${step.instruction}" - List only the specific tools and supplies needed. Brief bullet points.`,
    };

    try {
      const response = await fetch('/api/clarify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction: prompts[type] }),
      });
      if (response.ok) {
        const data = await response.json();
        setAiClarification(data.clarification);
      }
    } catch (error) {
      console.error('AI error:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const getEncouragement = () => {
    const progress = currentStep / pattern.steps.length;
    if (currentStep === 1) return "Let's begin this beautiful project together";
    if (progress < 0.5) return "Beautiful progress — keep going";
    if (progress < 1) return "Your quilt is taking shape";
    return "The final touch — well done";
  };

  const resetToUpload = () => {
    setPattern(SAMPLE_PATTERN);
    setCurrentStep(1);
    setAiClarification(null);
    setUploadError(null);
    setViewFilter('all');
    clearSession();
  };

  const navigateToStep = (stepNum: number) => {
    setCurrentStep(stepNum);
    setAiClarification(null);
    setAiHelpType(null);
  };

  // Navigate filtered steps
  const navigateFilteredStep = (direction: 'prev' | 'next') => {
    const currentIndex = filteredStepNumbers.indexOf(currentStep);
    if (direction === 'prev' && currentIndex > 0) {
      navigateToStep(filteredStepNumbers[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex < filteredStepNumbers.length - 1) {
      navigateToStep(filteredStepNumbers[currentIndex + 1]);
    }
  };

  return (
    <WashiSurface variant="light" style={{ minHeight: '100vh' }}>
      {/* Session Welcome Modal */}
      {isReturningUser && (
        <SessionWelcome
          patternName={pattern.name}
          currentStep={session?.currentStep || 1}
          totalSteps={pattern.steps.length}
          timeSinceLastVisit={formatTimeSince()}
          progressSummary={getProgressSummary()}
          onContinue={() => {
            if (session?.currentStep) {
              setCurrentStep(session.currentStep);
            }
            dismissReturnMessage();
          }}
          onStartOver={() => {
            setCurrentStep(1);
            clearSession();
            dismissReturnMessage();
          }}
          onDismiss={dismissReturnMessage}
        />
      )}

      {/* Header */}
      <header style={{
        padding: theme.spacing.breathe,
        borderBottom: theme.borders.hairline,
        backgroundColor: theme.colors.rice,
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          <h1 style={{
            margin: 0,
            fontSize: theme.typography.fontSize.xl,
            color: theme.colors.indigo,
            fontWeight: 500,
            letterSpacing: '0.02em',
            fontFamily: theme.typography.fontFamily.display,
          }}>
            Pattern Reader — {pattern.name}
          </h1>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setShowSettings(!showSettings)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: showSettings ? theme.colors.indigo : 'transparent',
                color: showSettings ? theme.colors.rice : theme.colors.bamboo,
                border: theme.borders.subtle,
                borderRadius: theme.radius.sm,
                cursor: 'pointer',
                fontSize: theme.typography.fontSize.sm,
                transition: `all ${theme.timing.quick} ${theme.timing.easeOut}`,
              }}
            >
              ⚙️ Settings
            </button>
            <button
              onClick={resetToUpload}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'transparent',
                border: theme.borders.subtle,
                borderRadius: theme.radius.sm,
                cursor: 'pointer',
                color: theme.colors.bamboo,
                fontSize: theme.typography.fontSize.sm,
                transition: `all ${theme.timing.quick} ${theme.timing.easeOut}`,
              }}
            >
              ← New Pattern
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: theme.spacing.rest, maxWidth: '900px', margin: '0 auto' }}>
        {/* Settings Panel */}
        {showSettings && (
          <div style={{ marginBottom: theme.spacing.rest }}>
            <TooltipSettings />
            <div style={{
              marginTop: '1rem',
              padding: theme.spacing.breathe,
              backgroundColor: theme.colors.washi,
              borderRadius: theme.radius.lg,
            }}>
              <h3 style={{
                margin: '0 0 1rem 0',
                color: theme.colors.indigo,
                fontSize: theme.typography.fontSize.base,
                fontWeight: 600,
              }}>
                Display Settings
              </h3>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  checked={preferences.units === 'metric'}
                  onChange={toggleUnits}
                  style={{ width: '18px', height: '18px' }}
                />
                <span style={{ color: theme.colors.inkBlack }}>
                  Show metric measurements
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Upload Error */}
        {uploadError && (
          <div style={{
            marginBottom: theme.spacing.breathe,
            padding: theme.spacing.breathe,
            backgroundColor: 'rgba(231, 111, 81, 0.1)',
            borderRadius: theme.radius.md,
            border: `1px solid ${theme.colors.persimmon}`,
            textAlign: 'center',
          }}>
            <p style={{ color: theme.colors.persimmon, margin: 0 }}>{uploadError}</p>
          </div>
        )}

        {/* Drop zone for PDF upload */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          style={{
            marginBottom: theme.spacing.rest,
            padding: theme.spacing.breathe,
            backgroundColor: theme.colors.washiDark,
            borderRadius: theme.radius.lg,
            border: `2px dashed ${theme.colors.inactive}`,
            textAlign: 'center',
            cursor: 'pointer',
            transition: `all ${theme.timing.breathe} ${theme.timing.easeOut}`,
          }}
        >
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            id="pdf-upload"
          />
          <label htmlFor="pdf-upload" style={{ cursor: 'pointer', display: 'block' }}>
            {isUploading ? (
              <p style={{ color: theme.colors.sage, margin: 0 }}>Parsing pattern...</p>
            ) : (
              <>
                <p style={{ color: theme.colors.inkGray, margin: 0, fontSize: theme.typography.fontSize.sm }}>
                  Drop a PDF pattern here, or click to browse
                </p>
                <p style={{ color: theme.colors.inkGray, margin: '0.5rem 0 0', fontSize: theme.typography.fontSize.xs, opacity: 0.7 }}>
                  Currently showing: {pattern === SAMPLE_PATTERN ? 'Sample Pattern' : pattern.name}
                </p>
              </>
            )}
          </label>
        </div>

        {/* View Filters */}
        <div style={{ marginBottom: theme.spacing.breathe }}>
          <ViewFilters
            currentFilter={viewFilter}
            onFilterChange={setViewFilter}
            stepCounts={stepCounts}
          />
        </div>

        {/* Cutting Checklist (shown in cutting view or if items exist) */}
        {(viewFilter === 'cutting' || cuttingItems.length > 0) && viewFilter !== 'pressing' && viewFilter !== 'measurements' && (
          <div style={{ marginBottom: theme.spacing.rest }}>
            <CuttingChecklist items={cuttingItems} patternId={pattern.id} />
          </div>
        )}

        {/* Press Direction Tracker (shown in pressing view) */}
        {viewFilter === 'pressing' && pressSteps.length > 0 && (
          <div style={{ marginBottom: theme.spacing.rest }}>
            <PressDirectionTracker
              pressSteps={pressSteps}
              currentStep={currentStep}
              onStepClick={navigateToStep}
            />
          </div>
        )}

        {/* Measurements Card (shown in measurements view) */}
        {viewFilter === 'measurements' && measurements.length > 0 && (
          <div style={{ marginBottom: theme.spacing.rest }}>
            <MeasurementsCard
              measurements={measurements}
              showMetric={preferences.units === 'metric'}
              onToggleMetric={toggleUnits}
            />
          </div>
        )}

        {/* Progress Section with Kumihimo */}
        <div style={{
          marginBottom: theme.spacing.rest,
          backgroundColor: theme.colors.rice,
          padding: theme.spacing.breathe,
          borderRadius: theme.radius.lg,
          boxShadow: theme.shadows.soft,
        }}>
          {/* Encouragement */}
          <div style={{
            textAlign: 'center',
            marginBottom: theme.spacing.breathe,
            color: theme.colors.sage,
            fontSize: theme.typography.fontSize.sm,
            fontStyle: 'italic',
            fontFamily: theme.typography.fontFamily.display,
          }}>
            {getEncouragement()}
          </div>

          {/* Kumihimo Progress Bar */}
          <div style={{ marginBottom: '1rem', padding: '0 1rem' }}>
            <KumihimoProgress current={currentStep} total={pattern.steps.length} />
          </div>

          {/* Step indicators */}
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {pattern.steps.map((s, index) => {
              const isFiltered = filteredStepNumbers.includes(s.number);
              return (
                <button
                  key={index}
                  onClick={() => navigateToStep(index + 1)}
                  style={{
                    width: '36px',
                    height: '36px',
                    backgroundColor: currentStep === index + 1 ? theme.colors.indigo : theme.colors.washiDark,
                    color: currentStep === index + 1 ? theme.colors.rice : theme.colors.inkGray,
                    border: 'none',
                    borderRadius: theme.radius.full,
                    cursor: 'pointer',
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: currentStep === index + 1 ? 600 : 400,
                    transition: `all ${theme.timing.quick} ${theme.timing.easeOut}`,
                    boxShadow: currentStep === index + 1 ? theme.shadows.soft : 'none',
                    opacity: isFiltered ? 1 : 0.4,
                  }}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tool Prep Alerts */}
        {toolAlerts.map(alert => (
          <ToolPrepAlert
            key={alert.tool}
            tool={alert.tool}
            stepsAhead={alert.stepNumber}
            prepTime={alert.prepTime}
          />
        ))}

        {/* Step Content Card */}
        <WashiSurface variant="rice" elevated style={{ borderRadius: theme.radius.lg, padding: theme.spacing.rest }}>
          {/* Step Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: theme.spacing.breathe,
          }}>
            <div>
              <div style={{
                color: theme.colors.inkGray,
                fontSize: theme.typography.fontSize.xs,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '0.25rem'
              }}>
                Step {currentStep} of {pattern.steps.length}
                {viewFilter !== 'all' && (
                  <span style={{ color: theme.colors.sage, marginLeft: '0.5rem' }}>
                    ({filteredStepNumbers.indexOf(currentStep) + 1} of {filteredStepNumbers.length} {viewFilter})
                  </span>
                )}
              </div>
              <h2 style={{
                margin: 0,
                color: theme.colors.indigo,
                fontSize: theme.typography.fontSize['2xl'],
                fontWeight: 500,
                fontFamily: theme.typography.fontFamily.display,
              }}>
                {step.title}
              </h2>
            </div>

            {/* Font Size Controls */}
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {(['normal', 'large', 'xlarge'] as const).map(size => (
                <button
                  key={size}
                  onClick={() => setPreferences(prev => ({ ...prev, fontSize: size }))}
                  style={{
                    width: '32px',
                    height: '32px',
                    border: preferences.fontSize === size ? `2px solid ${theme.colors.persimmon}` : theme.borders.subtle,
                    backgroundColor: preferences.fontSize === size ? theme.colors.washi : theme.colors.rice,
                    borderRadius: theme.radius.sm,
                    cursor: 'pointer',
                    fontSize: size === 'normal' ? '11px' : size === 'large' ? '14px' : '17px',
                    color: theme.colors.inkBlack,
                    transition: `all ${theme.timing.quick} ${theme.timing.easeOut}`,
                  }}
                >
                  A
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          {step.note && (
            <div style={{
              padding: '0.75rem 1rem',
              backgroundColor: `${theme.colors.clay}22`,
              borderLeft: `3px solid ${theme.colors.clay}`,
              borderRadius: `0 ${theme.radius.sm} ${theme.radius.sm} 0`,
              marginBottom: theme.spacing.breathe,
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.inkBlack,
            }}>
              <span style={{ opacity: 0.7 }}>Note:</span> {step.note}
            </div>
          )}

          {/* Main Instruction with Highlighted Terms */}
          <div style={{
            fontSize: fontSizes[preferences.fontSize],
            lineHeight: theme.typography.lineHeight.relaxed,
            color: theme.colors.inkBlack,
            marginBottom: theme.spacing.breathe,
            fontFamily: theme.typography.fontFamily.body,
          }}>
            <HighlightedText
              text={step.instruction}
              glossary={QUILTING_GLOSSARY}
              disabled={!preferences.tooltips.enabled || !preferences.tooltips.showTermDefinitions}
            />
          </div>

          {/* Visual Diagram */}
          {step.techniques && (
            <VisualDiagram
              techniques={step.techniques}
              instruction={step.instruction}
              step={currentStep}
            />
          )}

          {/* Techniques */}
          {step.techniques && step.techniques.length > 0 && (
            <div style={{ marginBottom: theme.spacing.breathe }}>
              <div style={{
                fontSize: theme.typography.fontSize.xs,
                color: theme.colors.inkGray,
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Techniques used
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {step.techniques.map((tech, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleTechniqueClick(tech)}
                    style={{
                      padding: '0.35rem 0.85rem',
                      backgroundColor: showTechnique === tech ? theme.colors.indigo : theme.colors.washiDark,
                      color: showTechnique === tech ? theme.colors.rice : theme.colors.inkBlack,
                      border: 'none',
                      borderRadius: theme.radius.full,
                      fontSize: theme.typography.fontSize.sm,
                      cursor: 'pointer',
                      transition: `all ${theme.timing.quick} ${theme.timing.easeOut}`,
                    }}
                  >
                    {tech}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* AI Help Buttons */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            paddingTop: theme.spacing.breathe,
            borderTop: theme.borders.hairline,
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => handleAIHelp('explain')}
              disabled={isLoadingAI}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: aiHelpType === 'explain' ? theme.colors.sage : theme.colors.indigo,
                color: theme.colors.rice,
                border: 'none',
                borderRadius: theme.radius.md,
                cursor: isLoadingAI ? 'wait' : 'pointer',
                fontSize: theme.typography.fontSize.sm,
                opacity: isLoadingAI && aiHelpType === 'explain' ? 0.7 : 1,
                transition: `all ${theme.timing.quick} ${theme.timing.easeOut}`,
              }}
            >
              {isLoadingAI && aiHelpType === 'explain' ? '...' : 'Explain this'}
            </button>
            <button
              onClick={() => handleAIHelp('simplify')}
              disabled={isLoadingAI}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: aiHelpType === 'simplify' ? theme.colors.persimmon : 'transparent',
                color: aiHelpType === 'simplify' ? theme.colors.rice : theme.colors.persimmon,
                border: `1px solid ${theme.colors.persimmon}`,
                borderRadius: theme.radius.md,
                cursor: isLoadingAI ? 'wait' : 'pointer',
                fontSize: theme.typography.fontSize.sm,
                transition: `all ${theme.timing.quick} ${theme.timing.easeOut}`,
              }}
            >
              {isLoadingAI && aiHelpType === 'simplify' ? '...' : 'Simplify'}
            </button>
            <button
              onClick={() => handleAIHelp('tools')}
              disabled={isLoadingAI}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: aiHelpType === 'tools' ? theme.colors.clay : 'transparent',
                color: aiHelpType === 'tools' ? theme.colors.rice : theme.colors.clay,
                border: `1px solid ${theme.colors.clay}`,
                borderRadius: theme.radius.md,
                cursor: isLoadingAI ? 'wait' : 'pointer',
                fontSize: theme.typography.fontSize.sm,
                transition: `all ${theme.timing.quick} ${theme.timing.easeOut}`,
              }}
            >
              {isLoadingAI && aiHelpType === 'tools' ? '...' : 'What tools?'}
            </button>
          </div>

          {/* AI Response */}
          {aiClarification && (
            <div style={{
              marginTop: theme.spacing.breathe,
              padding: theme.spacing.breathe,
              backgroundColor: theme.colors.washi,
              borderRadius: theme.radius.md,
              borderLeft: `3px solid ${theme.colors.sage}`,
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <span style={{
                  fontSize: theme.typography.fontSize.xs,
                  color: theme.colors.sage,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {aiHelpType === 'technique' ? `About "${showTechnique}"` :
                    aiHelpType === 'explain' ? 'Explanation' :
                      aiHelpType === 'simplify' ? 'Simplified' : 'Tools Needed'}
                </span>
                <button
                  onClick={() => { setAiClarification(null); setAiHelpType(null); setShowTechnique(null); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: theme.colors.inkGray,
                    fontSize: '1.2rem',
                    padding: '0 0.25rem'
                  }}
                >
                  ×
                </button>
              </div>
              <div style={{
                fontSize: fontSizes[preferences.fontSize],
                lineHeight: theme.typography.lineHeight.normal,
                color: theme.colors.inkBlack,
                whiteSpace: 'pre-wrap'
              }}
                dangerouslySetInnerHTML={{
                  __html: aiClarification
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/^# (.*$)/gm, `<h4 style="margin: 0.5rem 0; color: ${theme.colors.indigo};">$1</h4>`)
                    .replace(/^- (.*$)/gm, '• $1<br/>')
                }}
              />
            </div>
          )}

          {/* Good Stopping Point */}
          {stoppingPointInfo.isStop && (
            <GoodStoppingPoint reason={stoppingPointInfo.reason} />
          )}
        </WashiSurface>

        {/* Pro Tips */}
        {step.warning && (
          <div style={{
            marginTop: theme.spacing.breathe,
            padding: theme.spacing.breathe,
            backgroundColor: `${theme.colors.sage}18`,
            borderRadius: theme.radius.md,
          }}>
            <div style={{
              fontWeight: 500,
              color: theme.colors.sage,
              marginBottom: '0.5rem',
              fontSize: theme.typography.fontSize.sm,
            }}>
              Pro Tip
            </div>
            <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.inkBlack }}>
              {step.warning}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: theme.spacing.rest,
        }}>
          <button
            onClick={() => viewFilter === 'all' ? navigateToStep(Math.max(1, currentStep - 1)) : navigateFilteredStep('prev')}
            disabled={viewFilter === 'all' ? currentStep === 1 : filteredStepNumbers.indexOf(currentStep) === 0}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: (viewFilter === 'all' ? currentStep === 1 : filteredStepNumbers.indexOf(currentStep) === 0) ? theme.colors.washiDark : theme.colors.indigo,
              color: (viewFilter === 'all' ? currentStep === 1 : filteredStepNumbers.indexOf(currentStep) === 0) ? theme.colors.inkGray : theme.colors.rice,
              border: 'none',
              borderRadius: theme.radius.md,
              cursor: (viewFilter === 'all' ? currentStep === 1 : filteredStepNumbers.indexOf(currentStep) === 0) ? 'default' : 'pointer',
              fontSize: theme.typography.fontSize.sm,
              transition: `all ${theme.timing.quick} ${theme.timing.easeOut}`,
            }}
          >
            ← Previous
          </button>
          <button
            onClick={() => {
              completeStep(currentStep);
              if (viewFilter === 'all') {
                navigateToStep(Math.min(pattern.steps.length, currentStep + 1));
              } else {
                navigateFilteredStep('next');
              }
            }}
            disabled={viewFilter === 'all' ? currentStep === pattern.steps.length : filteredStepNumbers.indexOf(currentStep) === filteredStepNumbers.length - 1}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: (viewFilter === 'all' ? currentStep === pattern.steps.length : filteredStepNumbers.indexOf(currentStep) === filteredStepNumbers.length - 1) ? theme.colors.washiDark : theme.colors.indigo,
              color: (viewFilter === 'all' ? currentStep === pattern.steps.length : filteredStepNumbers.indexOf(currentStep) === filteredStepNumbers.length - 1) ? theme.colors.inkGray : theme.colors.rice,
              border: 'none',
              borderRadius: theme.radius.md,
              cursor: (viewFilter === 'all' ? currentStep === pattern.steps.length : filteredStepNumbers.indexOf(currentStep) === filteredStepNumbers.length - 1) ? 'default' : 'pointer',
              fontSize: theme.typography.fontSize.sm,
              transition: `all ${theme.timing.quick} ${theme.timing.easeOut}`,
            }}
          >
            Next →
          </button>
        </div>
      </main>

      {/* Calculator Button & Modal */}
      <CalculatorButton onClick={() => setShowCalculators(true)} />
      <MiniCalculators
        isOpen={showCalculators}
        onClose={() => setShowCalculators(false)}
        defaultWidth={pattern.finishedSize?.width}
        defaultHeight={pattern.finishedSize?.height}
      />
    </WashiSurface>
  );
}

export default function PatternReaderPage() {
  return (
    <TooltipProvider>
      <PatternReaderContent />
    </TooltipProvider>
  );
}
