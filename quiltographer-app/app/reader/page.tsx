'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { VisualDiagram } from './VisualDiagram';
import { quiltographerTheme, WashiSurface, KumihimoProgress } from '@/components/japanese';
import { HighlightedText } from '@/components/reader/Tooltip';
import { TooltipProvider, TooltipSettings } from '@/components/reader/TooltipProvider';
import { CuttingChecklist, extractCuttingItems } from '@/components/reader/CuttingChecklist';
import { ViewFilters, ViewFilter, PressDirectionTracker, MeasurementsCard, extractPressSteps, countStepsByType } from '@/components/reader/ViewFilters';
import { MiniCalculators } from '@/components/reader/MiniCalculators';
import { SessionWelcome, GoodStoppingPoint, ToolPrepAlert, isGoodStoppingPoint, lookAheadForTools } from '@/components/reader/SessionWelcome';
import { QUILTING_GLOSSARY } from '@/lib/reader/glossary';
import { usePreferences } from '@/hooks/usePreferences';
import { useSession } from '@/hooks/useSession';
import { extractMeasurements, convertMeasurement } from '@/lib/reader/calculators';

// Types
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

// Sample pattern
const SAMPLE_PATTERN: Pattern = {
  id: 'sample-pattern',
  name: "Flying Geese Table Runner",
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

/**
 * Overlay Sheet Component - slides up from bottom
 */
function OverlaySheet({ 
  isOpen, 
  onClose, 
  title, 
  children 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  title: string;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 100,
          animation: 'fadeIn 0.2s ease-out',
        }}
      />
      {/* Sheet */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight: '85vh',
          backgroundColor: theme.colors.rice,
          borderTopLeftRadius: theme.radius.xl,
          borderTopRightRadius: theme.radius.xl,
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
          zIndex: 101,
          animation: 'slideUp 0.3s ease-out',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Handle */}
        <div style={{ padding: '0.75rem', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: '40px',
            height: '4px',
            backgroundColor: theme.colors.inactive,
            borderRadius: theme.radius.full,
          }} />
        </div>
        {/* Header */}
        <div style={{
          padding: '0 1.5rem 1rem',
          borderBottom: theme.borders.hairline,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h2 style={{
            margin: 0,
            fontSize: theme.typography.fontSize.lg,
            color: theme.colors.indigo,
            fontFamily: theme.typography.fontFamily.display,
          }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              color: theme.colors.inkGray,
              cursor: 'pointer',
              padding: '0.25rem',
            }}
          >
            ×
          </button>
        </div>
        {/* Content */}
        <div style={{ 
          padding: '1.5rem', 
          overflowY: 'auto',
          flex: 1,
        }}>
          {children}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

/**
 * Upload Modal
 */
function UploadModal({
  isOpen,
  onClose,
  onUpload,
  isUploading,
  error,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
  isUploading: boolean;
  error: string | null;
}) {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      onUpload(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };

  if (!isOpen) return null;

  return (
    <OverlaySheet isOpen={isOpen} onClose={onClose} title="Load Pattern">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{
          padding: '3rem 2rem',
          backgroundColor: theme.colors.washi,
          borderRadius: theme.radius.lg,
          border: `2px dashed ${theme.colors.inactive}`,
          textAlign: 'center',
          cursor: 'pointer',
        }}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          id="pdf-upload-modal"
        />
        <label htmlFor="pdf-upload-modal" style={{ cursor: 'pointer', display: 'block' }}>
          {isUploading ? (
            <p style={{ color: theme.colors.sage, margin: 0, fontSize: theme.typography.fontSize.lg }}>
              Parsing pattern...
            </p>
          ) : (
            <>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
              <p style={{ color: theme.colors.inkBlack, margin: 0, fontSize: theme.typography.fontSize.lg }}>
                Drop a PDF pattern here
              </p>
              <p style={{ color: theme.colors.inkGray, margin: '0.5rem 0 0', fontSize: theme.typography.fontSize.sm }}>
                or click to browse
              </p>
            </>
          )}
        </label>
      </div>
      {error && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: `${theme.colors.persimmon}15`,
          borderRadius: theme.radius.md,
          color: theme.colors.persimmon,
          textAlign: 'center',
        }}>
          {error}
        </div>
      )}
    </OverlaySheet>
  );
}

function PatternReaderContent() {
  const [pattern, setPattern] = useState<Pattern>(SAMPLE_PATTERN);
  const [currentStep, setCurrentStep] = useState(1);
  const [showTechnique, setShowTechnique] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiClarification, setAiClarification] = useState<string | null>(null);
  const [aiHelpType, setAiHelpType] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Overlay states
  const [showUpload, setShowUpload] = useState(false);
  const [showCutList, setShowCutList] = useState(false);
  const [showCalculators, setShowCalculators] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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

  // Check for good stopping point
  const stoppingPointInfo = useMemo(() => isGoodStoppingPoint(step.instruction, step.title), [step]);

  // Look ahead for tools
  const toolAlerts = useMemo(
    () => lookAheadForTools(currentStep - 1, pattern.steps, 3).filter(a => a.stepNumber > currentStep),
    [currentStep, pattern.steps]
  );

  // Detect press direction
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
      setShowUpload(false);
      clearSession();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
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

  const navigateToStep = (stepNum: number) => {
    if (stepNum >= 1 && stepNum <= pattern.steps.length) {
      setCurrentStep(stepNum);
      setAiClarification(null);
      setAiHelpType(null);
      setShowTechnique(null);
    }
  };

  const handlePrevious = () => {
    navigateToStep(currentStep - 1);
  };

  const handleNext = () => {
    completeStep(currentStep);
    navigateToStep(currentStep + 1);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: theme.colors.washi,
      backgroundImage: theme.textures.washiFiber,
    }}>
      {/* ===== STICKY HEADER ===== */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: theme.colors.rice,
        borderBottom: theme.borders.hairline,
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: theme.shadows.subtle,
      }}>
        {/* Left: Pattern name */}
        <button
          onClick={() => setShowUpload(true)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: theme.colors.indigo,
            fontFamily: theme.typography.fontFamily.display,
            fontSize: theme.typography.fontSize.sm,
          }}
        >
          <span style={{ fontSize: '1rem' }}>📄</span>
          <span style={{ 
            maxWidth: '150px', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {pattern.name}
          </span>
        </button>

        {/* Center: Step navigation */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <button
            onClick={handlePrevious}
            disabled={currentStep <= 1}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: theme.radius.full,
              border: 'none',
              backgroundColor: currentStep <= 1 ? theme.colors.washiDark : theme.colors.indigo,
              color: currentStep <= 1 ? theme.colors.inactive : theme.colors.rice,
              cursor: currentStep <= 1 ? 'default' : 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ←
          </button>
          <span style={{
            color: theme.colors.indigo,
            fontWeight: 600,
            fontSize: theme.typography.fontSize.base,
            minWidth: '60px',
            textAlign: 'center',
          }}>
            {currentStep} / {pattern.steps.length}
          </span>
          <button
            onClick={handleNext}
            disabled={currentStep >= pattern.steps.length}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: theme.radius.full,
              border: 'none',
              backgroundColor: currentStep >= pattern.steps.length ? theme.colors.washiDark : theme.colors.indigo,
              color: currentStep >= pattern.steps.length ? theme.colors.inactive : theme.colors.rice,
              cursor: currentStep >= pattern.steps.length ? 'default' : 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            →
          </button>
        </div>

        {/* Right: Settings */}
        <button
          onClick={() => setShowSettings(true)}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: theme.radius.full,
            border: theme.borders.hairline,
            backgroundColor: 'transparent',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          ⚙️
        </button>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main style={{
        flex: 1,
        padding: '1.5rem 1rem',
        maxWidth: '700px',
        margin: '0 auto',
        width: '100%',
      }}>
        {/* Returning User Welcome */}
        {isReturningUser && session && (
          <SessionWelcome
            patternName={pattern.name}
            lastStep={session.currentStep}
            timeAway={formatTimeSince(session.lastActive)}
            onContinue={() => { navigateToStep(session.currentStep); dismissReturnMessage(); }}
            onStartOver={() => { navigateToStep(1); clearSession(); }}
            onDismiss={dismissReturnMessage}
          />
        )}

        {/* Tool Prep Alerts */}
        {toolAlerts.map(alert => (
          <ToolPrepAlert
            key={alert.tool}
            tool={alert.tool}
            stepsAhead={alert.stepNumber - currentStep}
            prepTime={alert.prepTime}
          />
        ))}

        {/* Step Card */}
        <WashiSurface variant="rice" elevated style={{ 
          borderRadius: theme.radius.lg, 
          padding: '1.5rem',
          marginBottom: '1rem',
        }}>
          {/* Step Title */}
          <h2 style={{
            margin: '0 0 1rem 0',
            color: theme.colors.indigo,
            fontSize: theme.typography.fontSize.xl,
            fontWeight: 500,
            fontFamily: theme.typography.fontFamily.display,
            textAlign: 'center',
          }}>
            {step.title}
          </h2>

          {/* Note */}
          {step.note && (
            <div style={{
              padding: '0.75rem 1rem',
              backgroundColor: `${theme.colors.clay}15`,
              borderRadius: theme.radius.md,
              marginBottom: '1rem',
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.inkBlack,
            }}>
              💡 {step.note}
            </div>
          )}

          {/* Main Instruction */}
          <div style={{
            fontSize: fontSizes[preferences.fontSize],
            lineHeight: theme.typography.lineHeight.relaxed,
            color: theme.colors.inkBlack,
            marginBottom: '1.5rem',
            fontFamily: theme.typography.fontFamily.body,
          }}>
            <HighlightedText
              text={step.instruction}
              glossary={QUILTING_GLOSSARY}
              disabled={!preferences.tooltips.enabled || !preferences.tooltips.showTermDefinitions}
            />
          </div>

          {/* Visual Diagram */}
          {step.techniques && step.techniques.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <VisualDiagram
                techniques={step.techniques}
                instruction={step.instruction}
                step={currentStep}
              />
            </div>
          )}

          {/* Techniques Tags */}
          {step.techniques && step.techniques.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
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

          {/* AI Help Buttons - Always visible */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            paddingTop: '1rem',
            borderTop: theme.borders.hairline,
            flexWrap: 'wrap',
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
              }}
            >
              {isLoadingAI && aiHelpType === 'explain' ? '...' : '💬 Explain'}
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
              }}
            >
              {isLoadingAI && aiHelpType === 'simplify' ? '...' : '🌱 Simplify'}
            </button>
            <button
              onClick={() => handleAIHelp('tools')}
              disabled={isLoadingAI}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: aiHelpType === 'tools' ? theme.colors.clay : 'transparent',
                color: aiHelpType === 'tools' ? theme.colors.sumi : theme.colors.bamboo,
                border: `1px solid ${theme.colors.clay}`,
                borderRadius: theme.radius.md,
                cursor: isLoadingAI ? 'wait' : 'pointer',
                fontSize: theme.typography.fontSize.sm,
              }}
            >
              {isLoadingAI && aiHelpType === 'tools' ? '...' : '🔧 Tools'}
            </button>
          </div>

          {/* AI Response - Inline */}
          {aiClarification && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
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
                    .replace(/^- (.*$)/gm, '• $1<br/>')
                }}
              />
            </div>
          )}
        </WashiSurface>

        {/* Good Stopping Point */}
        {stoppingPointInfo.isStop && (
          <div style={{ marginBottom: '1rem' }}>
            <GoodStoppingPoint reason={stoppingPointInfo.reason} />
          </div>
        )}

        {/* Pro Tip / Warning */}
        {step.warning && (
          <div style={{
            padding: '1rem',
            backgroundColor: `${theme.colors.sage}12`,
            borderRadius: theme.radius.md,
            marginBottom: '1rem',
          }}>
            <div style={{
              fontWeight: 500,
              color: theme.colors.sage,
              marginBottom: '0.25rem',
              fontSize: theme.typography.fontSize.sm,
            }}>
              ✨ Pro Tip
            </div>
            <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.inkBlack }}>
              {step.warning}
            </div>
          </div>
        )}
      </main>

      {/* ===== STICKY FOOTER ===== */}
      <footer style={{
        position: 'sticky',
        bottom: 0,
        backgroundColor: theme.colors.rice,
        borderTop: theme.borders.hairline,
        padding: '0.75rem 1rem 1rem',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
      }}>
        {/* Progress */}
        <div style={{ marginBottom: '0.75rem', padding: '0 0.5rem' }}>
          <KumihimoProgress current={currentStep} total={pattern.steps.length} />
        </div>

        {/* Encouragement */}
        <div style={{
          textAlign: 'center',
          marginBottom: '0.75rem',
          color: theme.colors.sage,
          fontSize: theme.typography.fontSize.sm,
          fontStyle: 'italic',
          fontFamily: theme.typography.fontFamily.display,
        }}>
          {getEncouragement()}
        </div>

        {/* Quick Access Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
        }}>
          {cuttingItems.length > 0 && (
            <button
              onClick={() => setShowCutList(true)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: theme.colors.washi,
                border: theme.borders.hairline,
                borderRadius: theme.radius.md,
                cursor: 'pointer',
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.inkBlack,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              ✂️ Cut List
            </button>
          )}
          <button
            onClick={() => setShowCalculators(true)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: theme.colors.washi,
              border: theme.borders.hairline,
              borderRadius: theme.radius.md,
              cursor: 'pointer',
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.inkBlack,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            🧮 Calculators
          </button>
        </div>
      </footer>

      {/* ===== OVERLAYS ===== */}
      
      {/* Upload Modal */}
      <UploadModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onUpload={handleFileUpload}
        isUploading={isUploading}
        error={uploadError}
      />

      {/* Cut List Overlay */}
      <OverlaySheet
        isOpen={showCutList}
        onClose={() => setShowCutList(false)}
        title="Cutting Checklist"
      >
        <CuttingChecklist items={cuttingItems} patternId={pattern.id} />
      </OverlaySheet>

      {/* Calculators - has its own modal */}
      <MiniCalculators
        isOpen={showCalculators}
        onClose={() => setShowCalculators(false)}
        defaultWidth={pattern.finishedSize?.width}
        defaultHeight={pattern.finishedSize?.height}
      />

      {/* Settings Overlay */}
      <OverlaySheet
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Settings"
      >
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{
            margin: '0 0 1rem 0',
            color: theme.colors.indigo,
            fontSize: theme.typography.fontSize.base,
            fontWeight: 600,
          }}>
            Text Size
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(['normal', 'large', 'xlarge'] as const).map(size => (
              <button
                key={size}
                onClick={() => setPreferences(prev => ({ ...prev, fontSize: size }))}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: preferences.fontSize === size ? `2px solid ${theme.colors.persimmon}` : theme.borders.subtle,
                  backgroundColor: preferences.fontSize === size ? theme.colors.washi : theme.colors.rice,
                  borderRadius: theme.radius.md,
                  cursor: 'pointer',
                  fontSize: size === 'normal' ? '14px' : size === 'large' ? '18px' : '22px',
                  color: theme.colors.inkBlack,
                }}
              >
                Aa
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{
            margin: '0 0 1rem 0',
            color: theme.colors.indigo,
            fontSize: theme.typography.fontSize.base,
            fontWeight: 600,
          }}>
            Measurements
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
              style={{ width: '20px', height: '20px' }}
            />
            <span style={{ color: theme.colors.inkBlack }}>
              Show metric (cm) alongside inches
            </span>
          </label>
        </div>

        <TooltipSettings />

        <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: theme.borders.hairline }}>
          <button
            onClick={() => { setShowUpload(true); setShowSettings(false); }}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: 'transparent',
              border: theme.borders.subtle,
              borderRadius: theme.radius.md,
              cursor: 'pointer',
              color: theme.colors.indigo,
              fontSize: theme.typography.fontSize.sm,
            }}
          >
            📄 Load Different Pattern
          </button>
        </div>
      </OverlaySheet>
    </div>
  );
}

export default function PatternReaderPage() {
  return (
    <TooltipProvider>
      <PatternReaderContent />
    </TooltipProvider>
  );
}
