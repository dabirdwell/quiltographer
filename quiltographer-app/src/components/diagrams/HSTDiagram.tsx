'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  useAnimationStyles,
  useReducedMotion,
  timing,
  easing,
  allKeyframes,
} from './animations';
import {
  DiagramContainer,
  PhaseIndicator,
  FabricPatterns,
  FabricFilters,
  InkStamp,
} from './shared';

/**
 * HST Diagram - Half Square Triangle Visual Guide
 * 
 * NOW WITH MORE DRAMA.
 * Fabric that moves, scissors that cut, pieces that fly apart.
 */

interface HSTDiagramProps {
  lightColor?: string;
  darkColor?: string;
  finishedSize?: string;
  seamAllowance?: string;
  className?: string;
  autoStart?: boolean;
}

const phases = [
  { name: 'layer', label: 'Layer RST', instruction: 'Place two squares right sides together' },
  { name: 'draw', label: 'Draw line', instruction: 'Draw diagonal line corner to corner' },
  { name: 'sew', label: 'Sew', instruction: 'Sew ¼" on each side of line' },
  { name: 'cut', label: 'Cut', instruction: 'Cut on the drawn line' },
  { name: 'open', label: 'Press', instruction: 'Press open - two HST units!' },
  { name: 'square', label: 'Square up', instruction: 'Trim to finished size' },
];

export function HSTDiagram({
  lightColor = '#f5f0e6',
  darkColor = '#264653',
  finishedSize = '4½"',
  seamAllowance = '¼"',
  className = '',
  autoStart = true,
}: HSTDiagramProps) {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [phaseKey, setPhaseKey] = useState(0);
  const reducedMotion = useReducedMotion();
  
  useAnimationStyles();

  const nextPhase = useCallback(() => {
    setCurrentPhase(p => (p + 1) % phases.length);
    setPhaseKey(k => k + 1);
  }, []);

  const prevPhase = useCallback(() => {
    setCurrentPhase(p => (p - 1 + phases.length) % phases.length);
    setPhaseKey(k => k + 1);
  }, []);

  const goToPhase = useCallback((phase: number) => {
    setCurrentPhase(phase);
    setPhaseKey(k => k + 1);
  }, []);

  const currentInstruction = phases[currentPhase].instruction
    .replace('¼"', seamAllowance);

  return (
    <DiagramContainer
      onAdvance={nextPhase}
      onRetreat={prevPhase}
      instruction={currentInstruction}
      title="Half Square Triangle"
      currentPhase={currentPhase}
      totalPhases={phases.length}
      className={className}
    >
      <svg 
        viewBox="0 0 360 200" 
        style={{ 
          width: '100%', 
          maxWidth: '400px', 
          margin: '0 auto', 
          display: 'block',
          overflow: 'visible',
        }}
      >
        <defs>
          <FabricPatterns lightColor={lightColor} darkColor={darkColor} />
          <FabricFilters />
          
          {/* Glow filters for drama */}
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <filter id="scissorGlow">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#dc2626" floodOpacity="0.5"/>
          </filter>
        </defs>
        
        {/* INK SPLASH - dramatic entry effect on phase change */}
        {!reducedMotion && (
          <g key={`ink-splash-${phaseKey}`}>
            {/* Main ink blob */}
            <circle 
              cx="180" 
              cy="100" 
              r="8"
              fill="#1a1a1a"
              opacity="0.9"
            >
              <animate attributeName="r" from="0" to="80" dur="0.5s" fill="freeze" calcMode="spline" keySplines="0.1 0.8 0.3 1"/>
              <animate attributeName="opacity" from="0.7" to="0" dur="0.5s" fill="freeze"/>
            </circle>
            
            {/* Inner splash ring */}
            <circle 
              cx="180" 
              cy="100" 
              r="5"
              fill="none"
              stroke="#264653"
              strokeWidth="4"
              opacity="0.8"
            >
              <animate attributeName="r" from="10" to="120" dur="0.6s" fill="freeze" begin="0.05s"/>
              <animate attributeName="opacity" from="0.6" to="0" dur="0.6s" fill="freeze" begin="0.05s"/>
              <animate attributeName="stroke-width" from="6" to="1" dur="0.6s" fill="freeze" begin="0.05s"/>
            </circle>
            
            {/* Outer ripple */}
            <circle 
              cx="180" 
              cy="100" 
              r="5"
              fill="none"
              stroke="#e76f51"
              strokeWidth="2"
              opacity="0.5"
            >
              <animate attributeName="r" from="20" to="150" dur="0.8s" fill="freeze" begin="0.1s"/>
              <animate attributeName="opacity" from="0.4" to="0" dur="0.8s" fill="freeze" begin="0.1s"/>
            </circle>
            
            {/* Ink splatter dots */}
            <g opacity="0.6">
              <circle cx="200" cy="85" r="3">
                <animate attributeName="r" from="0" to="6" dur="0.3s" fill="freeze" begin="0.1s"/>
                <animate attributeName="opacity" from="0.8" to="0" dur="0.4s" fill="freeze" begin="0.2s"/>
              </circle>
              <circle cx="155" cy="110" r="2">
                <animate attributeName="r" from="0" to="5" dur="0.25s" fill="freeze" begin="0.12s"/>
                <animate attributeName="opacity" from="0.7" to="0" dur="0.35s" fill="freeze" begin="0.22s"/>
              </circle>
              <circle cx="190" cy="120" r="2">
                <animate attributeName="r" from="0" to="4" dur="0.2s" fill="freeze" begin="0.15s"/>
                <animate attributeName="opacity" from="0.6" to="0" dur="0.3s" fill="freeze" begin="0.25s"/>
              </circle>
              <circle cx="165" cy="80" r="2">
                <animate attributeName="r" from="0" to="5" dur="0.28s" fill="freeze" begin="0.08s"/>
                <animate attributeName="opacity" from="0.7" to="0" dur="0.38s" fill="freeze" begin="0.18s"/>
              </circle>
            </g>
          </g>
        )}

        {/* Phase-specific content with ink bleed reveal */}
        <g 
          key={phaseKey}
          style={reducedMotion ? {} : {
            opacity: 0,
            animation: 'inkBleedIn 0.5s ease-out 0.1s forwards',
          }}
        >
        {currentPhase <= 2 && (
          <LayeredSquaresPhase 
            key={`layer-${phaseKey}`}
            phase={currentPhase}
            seamAllowance={seamAllowance}
            reducedMotion={reducedMotion}
          />
        )}

        {currentPhase === 3 && (
          <CuttingPhase 
            key={`cut-${phaseKey}`}
            reducedMotion={reducedMotion} 
          />
        )}

        {currentPhase >= 4 && (
          <ResultPhase 
            key={`result-${phaseKey}`}
            phase={currentPhase}
            finishedSize={finishedSize}
            reducedMotion={reducedMotion}
          />
        )}
        </g>

        <InkStamp label="HST" x={320} y={175} />
      </svg>

      <PhaseIndicator
        current={currentPhase}
        total={phases.length}
        onSelect={goToPhase}
        labels={phases.map(p => p.label)}
      />
    </DiagramContainer>
  );
}

/**
 * Layered Squares - Phases 0, 1, 2
 */
function LayeredSquaresPhase({ 
  phase, 
  seamAllowance, 
  reducedMotion 
}: { 
  phase: number; 
  seamAllowance: string; 
  reducedMotion: boolean;
}) {
  const [entered, setEntered] = useState(false);
  const [lineProgress, setLineProgress] = useState(0);
  const [stitchProgress, setStitchProgress] = useState(0);

  // Entry animation
  useEffect(() => {
    if (!reducedMotion) {
      const timer = setTimeout(() => setEntered(true), 50);
      return () => clearTimeout(timer);
    }
    setEntered(true);
  }, [reducedMotion]);

  // Line drawing animation
  useEffect(() => {
    if (phase >= 1 && !reducedMotion) {
      let start: number;
      const duration = 600;
      const animate = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        setLineProgress(progress);
        if (progress < 1) requestAnimationFrame(animate);
      };
      const timer = setTimeout(() => requestAnimationFrame(animate), 200);
      return () => clearTimeout(timer);
    } else if (phase >= 1) {
      setLineProgress(1);
    }
  }, [phase, reducedMotion]);

  // Stitch animation
  useEffect(() => {
    if (phase >= 2 && !reducedMotion) {
      let start: number;
      const duration = 800;
      const animate = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        setStitchProgress(progress);
        if (progress < 1) requestAnimationFrame(animate);
      };
      const timer = setTimeout(() => requestAnimationFrame(animate), 300);
      return () => clearTimeout(timer);
    } else if (phase >= 2) {
      setStitchProgress(1);
    }
  }, [phase, reducedMotion]);

  const lineLength = Math.sqrt(2) * 100;

  return (
    <g 
      transform="translate(130, 30)"
      style={{
        opacity: entered ? 1 : 0,
        transform: entered 
          ? 'translate(130px, 30px) scale(1) rotate(0deg)' 
          : 'translate(130px, 50px) scale(0.9) rotate(-5deg)',
        transition: reducedMotion ? 'none' : `all 500ms ${easing.gentleSpring}`,
      }}
    >
      {/* Back square (dark) - offset and tilted slightly */}
      <g style={{
        transform: entered ? 'translate(8px, 8px) rotate(0deg)' : 'translate(15px, 15px) rotate(3deg)',
        transition: reducedMotion ? 'none' : `transform 600ms ${easing.gentleSpring} 100ms`,
      }}>
        <rect 
          x="0" y="0" 
          width="100" height="100" 
          fill="url(#fabricDark)"
          filter="url(#inkShadow)"
        />
      </g>
      
      {/* Front square (light) - floats down into place */}
      <g style={{
        transform: entered ? 'translate(0, 0)' : 'translate(-10px, -20px)',
        transition: reducedMotion ? 'none' : `transform 500ms ${easing.gentleSpring}`,
      }}>
        <rect 
          x="0" y="0" 
          width="100" height="100" 
          fill="url(#fabricLight)"
          stroke="#8b4513"
          strokeWidth="0.75"
          filter="url(#inkShadow)"
          style={{
            // Subtle breathing on phase 0
            animation: phase === 0 && !reducedMotion 
              ? 'gentlePulse 2s ease-in-out infinite' 
              : 'none',
          }}
        />
      </g>
      
      {/* RST indicator */}
      <text 
        x="50" y="-12" 
        textAnchor="middle" 
        fontSize="11" 
        fill="#666" 
        fontStyle="italic"
        style={{
          opacity: phase === 0 ? 1 : 0.4,
          transition: 'opacity 300ms',
        }}
      >
        right sides together
      </text>

      {/* Diagonal line with pencil tip */}
      {phase >= 1 && (
        <g>
          {/* Ink spot at pencil origin */}
          {!reducedMotion && lineProgress < 0.3 && (
            <circle cx="0" cy="0" r="3" fill="#2d2d2d" opacity="0.4">
              <animate attributeName="r" from="2" to="8" dur="0.4s" fill="freeze"/>
              <animate attributeName="opacity" from="0.5" to="0" dur="0.4s" fill="freeze"/>
            </circle>
          )}
          
          <line 
            x1="0" y1="0" 
            x2={100 * lineProgress} y2={100 * lineProgress}
            stroke="#2d2d2d"
            strokeWidth="2"
            strokeLinecap="round"
          />
          
          {/* Animated pencil tip */}
          {lineProgress < 1 && !reducedMotion && (
            <g transform={`translate(${100 * lineProgress}, ${100 * lineProgress})`}>
              <circle r="4" fill="#2d2d2d" opacity="0.8"/>
              <circle r="6" fill="#2d2d2d" opacity="0.2"/>
            </g>
          )}
          
          {/* End dot when complete */}
          {lineProgress >= 1 && (
            <circle 
              cx="100" cy="100" r="3" 
              fill="#2d2d2d"
              style={{
                opacity: 0,
                animation: !reducedMotion ? 'fadeIn 200ms ease-out forwards' : 'none',
              }}
            />
          )}
        </g>
      )}

      {/* Sewing lines with running needle effect */}
      {phase >= 2 && (
        <g style={{ opacity: stitchProgress > 0 ? 1 : 0 }}>
          {/* Left stitch line */}
          <line 
            x1="-6" y1="6" 
            x2={-6 + 106 * stitchProgress} y2={6 + 106 * stitchProgress}
            stroke="#e76f51" 
            strokeWidth="2.5"
            strokeDasharray="6 4"
            strokeLinecap="round"
            style={{
              animation: stitchProgress >= 1 && !reducedMotion 
                ? 'sashikoThread 12s linear infinite' 
                : 'none',
            }}
          />
          
          {/* Right stitch line */}
          <line 
            x1="6" y1="-6" 
            x2={6 + 106 * stitchProgress} y2={-6 + 106 * stitchProgress}
            stroke="#e76f51" 
            strokeWidth="2.5"
            strokeDasharray="6 4"
            strokeLinecap="round"
            style={{
              animation: stitchProgress >= 1 && !reducedMotion 
                ? 'sashikoThread 12s linear infinite reverse' 
                : 'none',
            }}
          />
          
          {/* Animated needle */}
          {stitchProgress < 1 && !reducedMotion && (
            <>
              <g transform={`translate(${-6 + 106 * stitchProgress}, ${6 + 106 * stitchProgress})`}>
                <circle r="5" fill="#e76f51" opacity="0.6"/>
                <circle r="3" fill="#e76f51"/>
              </g>
              <g transform={`translate(${6 + 106 * stitchProgress}, ${-6 + 106 * stitchProgress})`}>
                <circle r="5" fill="#e76f51" opacity="0.6"/>
                <circle r="3" fill="#e76f51"/>
              </g>
            </>
          )}
          
          {/* Seam allowance callout - appears after stitching */}
          <g 
            transform="translate(115, 50)"
            style={{
              opacity: stitchProgress >= 1 ? 1 : 0,
              transform: stitchProgress >= 1 ? 'translate(115px, 50px)' : 'translate(105px, 50px)',
              transition: reducedMotion ? 'none' : 'all 400ms ease-out',
            }}
          >
            <line x1="0" y1="0" x2="20" y2="-15" stroke="#e76f51" strokeWidth="1"/>
            <text 
              x="22" y="-12" 
              fontSize="12" 
              fill="#e76f51" 
              fontWeight="600"
              style={{
                animation: !reducedMotion ? 'gentlePulse 2s ease-in-out infinite' : 'none',
              }}
            >
              {seamAllowance}
            </text>
          </g>
        </g>
      )}
    </g>
  );
}

/**
 * Cutting Phase - Phase 3
 * Dramatic scissors animation
 */
function CuttingPhase({ reducedMotion }: { reducedMotion: boolean }) {
  const [scissorPosition, setScissorPosition] = useState(0);
  const [splitProgress, setSplitProgress] = useState(0);

  // Scissors travel down the cut line
  useEffect(() => {
    if (!reducedMotion) {
      let start: number;
      const duration = 1200;
      const animate = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        setScissorPosition(progress);
        if (progress < 1) requestAnimationFrame(animate);
      };
      setTimeout(() => requestAnimationFrame(animate), 300);
    } else {
      setScissorPosition(1);
    }
  }, [reducedMotion]);

  // Pieces start to separate after cut
  useEffect(() => {
    if (scissorPosition >= 0.8 && !reducedMotion) {
      let start: number;
      const duration = 400;
      const animate = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        setSplitProgress(progress);
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    } else if (reducedMotion) {
      setSplitProgress(1);
    }
  }, [scissorPosition, reducedMotion]);

  const cutX = -5 + 110 * scissorPosition;
  const cutY = -5 + 110 * scissorPosition;

  return (
    <g transform="translate(130, 30)">
      {/* Red ink splash at cut origin */}
      {!reducedMotion && scissorPosition < 0.2 && (
        <g transform="translate(-5, -5)">
          <circle r="4" fill="#dc2626" opacity="0.6">
            <animate attributeName="r" from="3" to="20" dur="0.5s" fill="freeze"/>
            <animate attributeName="opacity" from="0.6" to="0" dur="0.5s" fill="freeze"/>
          </circle>
        </g>
      )}
      
      {/* Square being cut - splits apart */}
      <g>
        {/* Top-right triangle (light) - moves up-right */}
        <g style={{
          transform: `translate(${splitProgress * 8}px, ${splitProgress * -8}px)`,
          transition: reducedMotion ? 'none' : 'transform 100ms linear',
        }}>
          <polygon 
            points="0,0 100,0 100,100" 
            fill="url(#fabricLight)" 
            filter="url(#inkShadow)"
          />
        </g>
        
        {/* Bottom-left triangle (will be dark side shown) - moves down-left */}
        <g style={{
          transform: `translate(${splitProgress * -8}px, ${splitProgress * 8}px)`,
          transition: reducedMotion ? 'none' : 'transform 100ms linear',
        }}>
          <polygon 
            points="0,0 0,100 100,100" 
            fill="url(#fabricDark)" 
            filter="url(#inkShadow)"
          />
        </g>
      </g>
      
      {/* Cut line - dramatic red */}
      <line 
        x1="-5" y1="-5" 
        x2={cutX} y2={cutY}
        stroke="#dc2626" 
        strokeWidth="3" 
        strokeLinecap="round"
        filter="url(#scissorGlow)"
      />
      
      {/* Animated scissors */}
      {scissorPosition < 1 && (
        <g 
          transform={`translate(${cutX}, ${cutY}) rotate(45)`}
          filter="url(#scissorGlow)"
        >
          {/* Scissor glow rings */}
          <circle r="20" fill="#dc2626" opacity="0.15">
            <animate attributeName="r" values="15;25;15" dur="0.5s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.2;0.05;0.2" dur="0.5s" repeatCount="indefinite"/>
          </circle>
          <circle r="12" fill="#dc2626" opacity="0.25"/>
          
          {/* Scissors icon */}
          <text 
            fontSize="24" 
            fill="#dc2626" 
            textAnchor="middle" 
            dominantBaseline="middle"
            style={{ fontWeight: 'bold' }}
          >
            ✂
          </text>
        </g>
      )}
      
      {/* "Snip!" text appears at end */}
      {scissorPosition >= 1 && (
        <text 
          x="50" y="120" 
          textAnchor="middle" 
          fontSize="14" 
          fill="#dc2626" 
          fontWeight="700"
          style={{
            opacity: 0,
            animation: !reducedMotion ? 'fadeIn 200ms ease-out forwards' : 'none',
          }}
        >
          ✂ Snip!
        </text>
      )}
    </g>
  );
}

/**
 * Result Phase - Phases 4, 5
 * Two triangles fly apart dramatically, then settle
 */
function ResultPhase({ 
  phase, 
  finishedSize, 
  reducedMotion 
}: { 
  phase: number; 
  finishedSize: string; 
  reducedMotion: boolean;
}) {
  const [entryProgress, setEntryProgress] = useState(0);
  const [settled, setSettled] = useState(false);
  const isSquareUp = phase === 5;

  // Dramatic entry - pieces fly in from center
  useEffect(() => {
    if (!reducedMotion) {
      let start: number;
      const duration = 700;
      const animate = (timestamp: number) => {
        if (!start) start = timestamp;
        const rawProgress = (timestamp - start) / duration;
        // Overshoot easing
        const progress = rawProgress < 1 
          ? 1 - Math.pow(1 - rawProgress, 3) * Math.cos(rawProgress * Math.PI * 0.5)
          : 1;
        setEntryProgress(Math.min(progress, 1.05)); // Allow slight overshoot
        if (rawProgress < 1) requestAnimationFrame(animate);
        else setEntryProgress(1);
      };
      requestAnimationFrame(animate);
    } else {
      setEntryProgress(1);
    }
  }, [reducedMotion]);

  // Settle animation for phase 5
  useEffect(() => {
    if (isSquareUp && entryProgress >= 1) {
      const timer = setTimeout(() => setSettled(true), 300);
      return () => clearTimeout(timer);
    }
  }, [isSquareUp, entryProgress]);

  // Calculate positions - start from center, fly outward
  const centerX = 180;
  const centerY = 75;
  const finalOffset = 75; // How far apart they end up
  
  const leftX = centerX - finalOffset * entryProgress;
  const rightX = centerX + finalOffset * entryProgress - 85;
  
  // Rotation: start tilted, settle to flat
  const leftRotation = (1 - entryProgress) * -25 + (settled ? 0 : (1 - entryProgress) * 5);
  const rightRotation = (1 - entryProgress) * 25 + (settled ? 0 : (1 - entryProgress) * -5);
  
  // Scale: start smaller, grow to full size
  const scale = 0.7 + 0.3 * Math.min(entryProgress, 1);

  return (
    <g>
      {/* Ink burst at center where pieces emerge */}
      {!reducedMotion && entryProgress < 0.3 && (
        <g transform={`translate(${centerX}, ${centerY})`}>
          <circle r="5" fill="#264653" opacity="0.5">
            <animate attributeName="r" from="5" to="60" dur="0.6s" fill="freeze"/>
            <animate attributeName="opacity" from="0.4" to="0" dur="0.6s" fill="freeze"/>
          </circle>
          <circle r="3" fill="none" stroke="#84a98c" strokeWidth="2" opacity="0.6">
            <animate attributeName="r" from="8" to="80" dur="0.8s" fill="freeze" begin="0.1s"/>
            <animate attributeName="opacity" from="0.5" to="0" dur="0.8s" fill="freeze" begin="0.1s"/>
          </circle>
        </g>
      )}
      
      {/* Left HST - light on top */}
      <g 
        style={{
          transform: `translate(${leftX}px, ${centerY - 42}px) rotate(${leftRotation}deg) scale(${scale})`,
          transformOrigin: 'center center',
          transition: settled && !reducedMotion ? `transform 400ms ${easing.gentleSpring}` : 'none',
        }}
      >
        <g filter="url(#inkShadow)">
          <polygon points="0,0 85,0 85,85" fill="url(#fabricLight)"/>
          <polygon points="0,0 0,85 85,85" fill="url(#fabricDark)"/>
          <rect x="0" y="0" width="85" height="85" fill="none" stroke="#8b4513" strokeWidth="0.5"/>
        </g>
        
        {/* Pressing indicator */}
        {phase === 4 && entryProgress >= 1 && (
          <g transform="translate(42, 42)">
            <circle r="15" fill="#84a98c" opacity="0.2">
              <animate attributeName="r" values="12;18;12" dur="1.5s" repeatCount="indefinite"/>
            </circle>
            <path 
              d="M-15 0 L15 0 M10 -5 L15 0 L10 5" 
              stroke="#84a98c" 
              strokeWidth="3" 
              fill="none" 
              strokeLinecap="round"
            />
          </g>
        )}
        
        {/* Dimension lines - phase 5 */}
        {isSquareUp && settled && (
          <g style={{
            opacity: 0,
            animation: !reducedMotion ? 'fadeIn 300ms ease-out 200ms forwards' : 'none',
          }}>
            <line x1="0" y1="-8" x2="85" y2="-8" stroke="#8b4513" strokeWidth="1"/>
            <line x1="0" y1="-12" x2="0" y2="-4" stroke="#8b4513" strokeWidth="1"/>
            <line x1="85" y1="-12" x2="85" y2="-4" stroke="#8b4513" strokeWidth="1"/>
            <text x="42" y="-14" textAnchor="middle" fontSize="11" fill="#8b4513" fontWeight="600">
              {finishedSize}
            </text>
          </g>
        )}
      </g>

      {/* Right HST - dark on top (mirror) */}
      <g 
        style={{
          transform: `translate(${rightX}px, ${centerY - 42}px) rotate(${rightRotation}deg) scale(${scale})`,
          transformOrigin: 'center center',
          transition: settled && !reducedMotion ? `transform 400ms ${easing.gentleSpring} 100ms` : 'none',
        }}
      >
        <g filter="url(#inkShadow)">
          <polygon points="0,0 85,0 0,85" fill="url(#fabricDark)"/>
          <polygon points="85,0 85,85 0,85" fill="url(#fabricLight)"/>
          <rect x="0" y="0" width="85" height="85" fill="none" stroke="#8b4513" strokeWidth="0.5"/>
        </g>
      </g>

      {/* Result text */}
      <text 
        x="180" y="155" 
        textAnchor="middle" 
        fontSize="13" 
        fill="#264653" 
        fontWeight="600"
        style={{
          opacity: entryProgress >= 1 ? 1 : 0,
          transform: entryProgress >= 1 ? 'translateY(0)' : 'translateY(10px)',
          transition: reducedMotion ? 'none' : 'all 300ms ease-out',
        }}
      >
        = 2 HST units ✓
      </text>
      
      {/* Square-up reminder */}
      {isSquareUp && settled && (
        <text 
          x="180" y="175" 
          textAnchor="middle" 
          fontSize="10" 
          fill="#84a98c" 
          fontStyle="italic"
          style={{
            opacity: 0,
            animation: !reducedMotion ? 'fadeIn 300ms ease-out 400ms forwards' : 'none',
          }}
        >
          trim to {finishedSize} square
        </text>
      )}
    </g>
  );
}

export default HSTDiagram;
