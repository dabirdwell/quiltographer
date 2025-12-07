'use client';

import React, { useState } from 'react';
import { MakeMode } from '@/components/reader/MakeMode';
import { FanDrawer } from '@/components/reader/FanDrawer';
import { CuttingChecklist, extractCuttingItems } from '@/components/reader/CuttingChecklist';
import { MiniCalculators } from '@/components/reader/MiniCalculators';
import { quiltographerTheme, WashiSurface } from '@/components/japanese';

const theme = quiltographerTheme;

type ReaderMode = 'make' | 'cut' | 'overview' | 'ref';

// Sample pattern for testing
const SAMPLE_PATTERN = {
  id: 'sample-pattern',
  name: "Flying Geese Table Runner",
  steps: [
    {
      number: 1,
      title: "Cut Your Fabric",
      instruction: "Cut (4) 5\" squares from your light fabric and (8) 2½\" x 4½\" rectangles from dark fabric. Use a rotary cutter and cutting mat for accuracy.",
      techniques: ["cutting"],
      warning: "Ensure grain lines are straight before cutting"
    },
    {
      number: 2,
      title: "Mark the Squares",
      instruction: "Draw a diagonal line from corner to corner on the wrong side of each light 2½\" square. This will be your sewing guide.",
      techniques: ["marking"],
      note: "Use a fine pencil or fabric marker that will wash out"
    },
    {
      number: 3,
      title: "Position for Sewing",
      instruction: "Place a marked square RST on one end of a dark rectangle, with the diagonal line running from the top left corner to the center of the rectangle.",
      techniques: ["RST", "positioning"],
    },
    {
      number: 4,
      title: "Sew the First Triangle",
      instruction: "Sew directly on the marked diagonal line. Use a ¼\" seam allowance stitch length of 2.0-2.5mm.",
      techniques: ["sewing", "piecing"],
      warning: "Test your ¼\" seam on scrap fabric first"
    },
    {
      number: 5,
      title: "Trim the Excess",
      instruction: "Trim ¼\" away from the sewn line, removing the excess corner fabric. Save the trimmed triangles for another project.",
      techniques: ["trimming"],
      note: "These bonus triangles make great mini HSTs"
    },
    {
      number: 6,
      title: "Press the Seam",
      instruction: "Press the seam toward the darker fabric. The light triangle should now cover the corner of the rectangle.",
      techniques: ["pressing"],
    },
    {
      number: 7,
      title: "Add the Second Triangle",
      instruction: "Repeat with another marked square on the opposite corner. The diagonal should run from bottom left to center.",
      techniques: ["RST", "sewing"],
    },
    {
      number: 8,
      title: "Final Press",
      instruction: "Press the second seam toward the dark fabric. Your Flying Geese unit should now measure 2½\" x 4½\" exactly.",
      techniques: ["pressing", "squaring"],
      note: "If it's not quite right, you can trim carefully to size"
    },
  ],
  finishedSize: { width: 12, height: 36 }
};

/**
 * Pattern Reader MVP - Mode-based interface
 * 
 * This is the new, focused pattern reader experience.
 * 60% empty space. One instruction at a time. Everything else tucked away.
 */
export default function PatternReaderMVP() {
  const [mode, setMode] = useState<ReaderMode>('make');
  const [currentStep, setCurrentStep] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showCalculators, setShowCalculators] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const pattern = SAMPLE_PATTERN;
  const step = pattern.steps[currentStep - 1];
  const cuttingItems = extractCuttingItems(pattern.steps);

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < pattern.steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleAIHelp = (type: 'explain' | 'simplify' | 'tools') => {
    // For now, just log - would connect to AI API
    console.log('AI Help requested:', type, 'for step:', currentStep);
    // In full implementation, this would open a modal with AI response
  };

  // Render based on mode
  const renderMode = () => {
    switch (mode) {
      case 'make':
        return (
          <MakeMode
            step={step}
            totalSteps={pattern.steps.length}
            patternName={pattern.name}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onOpenDrawer={() => setDrawerOpen(true)}
            onStepChange={setCurrentStep}
          />
        );

      case 'cut':
        return (
          <WashiSurface variant="light" style={{ minHeight: '100vh', padding: '1.5rem' }}>
            <header style={{
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h1 style={{
                margin: 0,
                fontSize: theme.typography.fontSize.xl,
                color: theme.colors.indigo,
                fontFamily: theme.typography.fontFamily.display,
              }}>
                ✂️ Cutting Checklist
              </h1>
              <button
                onClick={() => setDrawerOpen(true)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: theme.colors.rice,
                  border: theme.borders.hairline,
                  borderRadius: theme.radius.md,
                  color: theme.colors.bamboo,
                  cursor: 'pointer',
                }}
              >
                ☰
              </button>
            </header>
            <CuttingChecklist 
              items={cuttingItems} 
              patternId={pattern.id}
            />
          </WashiSurface>
        );

      case 'overview':
        return (
          <WashiSurface variant="light" style={{ minHeight: '100vh', padding: '1.5rem' }}>
            <header style={{
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <h1 style={{
                  margin: 0,
                  fontSize: theme.typography.fontSize.xl,
                  color: theme.colors.indigo,
                  fontFamily: theme.typography.fontFamily.display,
                }}>
                  {pattern.name}
                </h1>
                <p style={{
                  margin: '0.5rem 0 0',
                  color: theme.colors.inkGray,
                  fontSize: theme.typography.fontSize.sm,
                }}>
                  {pattern.steps.length} steps • {pattern.finishedSize?.width}" × {pattern.finishedSize?.height}"
                </p>
              </div>
              <button
                onClick={() => setDrawerOpen(true)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: theme.colors.rice,
                  border: theme.borders.hairline,
                  borderRadius: theme.radius.md,
                  color: theme.colors.bamboo,
                  cursor: 'pointer',
                }}
              >
                ☰
              </button>
            </header>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pattern.steps.map((s, idx) => (
                <button
                  key={s.number}
                  onClick={() => {
                    setCurrentStep(s.number);
                    setMode('make');
                  }}
                  style={{
                    padding: '1rem',
                    backgroundColor: theme.colors.rice,
                    border: idx + 1 === currentStep ? `2px solid ${theme.colors.persimmon}` : theme.borders.hairline,
                    borderRadius: theme.radius.md,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: `all ${theme.timing.quick} ${theme.timing.easeOut}`,
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                  }}>
                    <span style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: idx + 1 <= currentStep ? theme.colors.sage : theme.colors.inactive,
                      color: theme.colors.rice,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: theme.typography.fontSize.sm,
                      fontWeight: 600,
                    }}>
                      {idx + 1 < currentStep ? '✓' : s.number}
                    </span>
                    <div>
                      <div style={{
                        fontWeight: 500,
                        color: theme.colors.inkBlack,
                        marginBottom: '0.25rem',
                      }}>
                        {s.title}
                      </div>
                      <div style={{
                        fontSize: theme.typography.fontSize.sm,
                        color: theme.colors.inkGray,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '300px',
                      }}>
                        {s.instruction.slice(0, 60)}...
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </WashiSurface>
        );

      case 'ref':
        return (
          <WashiSurface variant="light" style={{ minHeight: '100vh', padding: '1.5rem' }}>
            <header style={{
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h1 style={{
                margin: 0,
                fontSize: theme.typography.fontSize.xl,
                color: theme.colors.indigo,
                fontFamily: theme.typography.fontFamily.display,
              }}>
                📐 Reference
              </h1>
              <button
                onClick={() => setDrawerOpen(true)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: theme.colors.rice,
                  border: theme.borders.hairline,
                  borderRadius: theme.radius.md,
                  color: theme.colors.bamboo,
                  cursor: 'pointer',
                }}
              >
                ☰
              </button>
            </header>
            <MiniCalculators 
              defaultQuiltWidth={pattern.finishedSize?.width}
              defaultQuiltHeight={pattern.finishedSize?.height}
            />
          </WashiSurface>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {renderMode()}
      
      <FanDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        currentMode={mode}
        onModeChange={setMode}
        onOpenGlossary={() => setShowGlossary(true)}
        onOpenCalculators={() => {
          setMode('ref');
        }}
        onOpenSettings={() => setShowSettings(true)}
        onAIHelp={handleAIHelp}
      />
    </>
  );
}
