'use client';

import React, { useState } from 'react';
import { quiltographerTheme } from '@/components/japanese';

const theme = quiltographerTheme;

/**
 * Simple MakeMode test - minimal version to debug
 */
export default function MakeModeTest() {
  const [step, setStep] = useState(1);
  
  const steps = [
    { number: 1, title: "Cut Your Fabric", instruction: "Cut (4) 5\" squares from your light fabric." },
    { number: 2, title: "Mark the Squares", instruction: "Draw a diagonal line from corner to corner." },
    { number: 3, title: "Press the Seam", instruction: "Press the seam toward the darker fabric." },
  ];

  const currentStep = steps[step - 1];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: theme.colors.washi,
      fontFamily: theme.typography.fontFamily.body,
    }}>
      {/* Header */}
      <header style={{
        padding: '1rem',
        borderBottom: theme.borders.hairline,
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        <span style={{ color: theme.colors.inkGray }}>Flying Geese</span>
        <span style={{ color: theme.colors.indigo, fontWeight: 500 }}>{step} / {steps.length}</span>
      </header>

      {/* Main - centered content */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
        textAlign: 'center',
      }}>
        <h2 style={{
          color: theme.colors.inkGray,
          fontSize: theme.typography.fontSize.sm,
          fontWeight: 400,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: '1rem',
        }}>
          {currentStep.title}
        </h2>

        <p style={{
          color: theme.colors.inkBlack,
          fontSize: theme.typography.fontSize.lg,
          lineHeight: 1.7,
          maxWidth: '500px',
        }}>
          {currentStep.instruction}
        </p>

        {/* Press indicator for step 3 */}
        {currentStep.instruction.toLowerCase().includes('press') && (
          <div style={{
            marginTop: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem 1.5rem',
            backgroundColor: `${theme.colors.sage}15`,
            borderRadius: theme.radius.lg,
          }}>
            <span style={{ fontSize: '1.5rem', color: theme.colors.sage }}>←</span>
            <span style={{ color: theme.colors.inkGray, fontStyle: 'italic' }}>PRESS</span>
            <span style={{ fontSize: '1.5rem', color: theme.colors.sage }}>→</span>
          </div>
        )}
      </main>

      {/* Footer navigation */}
      <footer style={{
        padding: '1.5rem',
        display: 'flex',
        justifyContent: 'center',
        gap: '2rem',
      }}>
        <button
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step <= 1}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: 'transparent',
            border: 'none',
            color: step <= 1 ? theme.colors.inactive : theme.colors.indigo,
            fontSize: '1.5rem',
            cursor: step <= 1 ? 'default' : 'pointer',
          }}
        >
          ←
        </button>
        
        <button
          onClick={() => setStep(Math.min(steps.length, step + 1))}
          disabled={step >= steps.length}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: 'transparent',
            border: 'none',
            color: step >= steps.length ? theme.colors.inactive : theme.colors.indigo,
            fontSize: '1.5rem',
            cursor: step >= steps.length ? 'default' : 'pointer',
          }}
        >
          →
        </button>
      </footer>
    </div>
  );
}
