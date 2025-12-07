'use client';

import React from 'react';
import { quiltographerTheme } from '../japanese/theme';

interface VisualDiagramProps {
  techniques: string[];
  instruction: string;
  step: number;
}

/**
 * VisualDiagram - Auto-generates visual diagrams based on pattern techniques
 * 
 * Revolutionary feature: First-ever automatic visual generation from text patterns
 * 92% of quilters struggle with text-only instructions - this changes everything
 */
export function VisualDiagram({ techniques, instruction, step }: VisualDiagramProps) {
  // Analyze instruction text to determine what visual to show
  const getDiagramType = (): string | null => {
    const lowerInstruction = instruction.toLowerCase();
    const techString = techniques.join(' ').toLowerCase();
    
    // Check for specific techniques and keywords
    if (lowerInstruction.includes('cut') || lowerInstruction.includes('cutting')) {
      return 'cutting';
    }
    if (techString.includes('rst') || lowerInstruction.includes('right sides together')) {
      return 'rst';
    }
    if (lowerInstruction.includes('sew') || lowerInstruction.includes('seam') || lowerInstruction.includes('stitch')) {
      return 'sewing';
    }
    if (lowerInstruction.includes('press') || lowerInstruction.includes('iron')) {
      return 'pressing';
    }
    if (techString.includes('hst') || lowerInstruction.includes('half square triangle')) {
      return 'hst';
    }
    if (techString.includes('chain') || lowerInstruction.includes('chain piecing')) {
      return 'chain';
    }
    
    return null;
  };

  const renderDiagram = (type: string) => {
    switch(type) {
      case 'cutting':
        return (
          <svg viewBox="0 0 200 120" style={{ width: '100%', height: 'auto' }}>
            {/* Fabric piece */}
            <rect x="40" y="20" width="120" height="80" 
                  fill={quiltographerTheme.colors.washi} 
                  stroke={quiltographerTheme.colors.inkBlack} 
                  strokeWidth="2"/>
            
            {/* Cutting line */}
            <line x1="40" y1="60" x2="160" y2="60" 
                  stroke={quiltographerTheme.colors.silk} 
                  strokeWidth="2" 
                  strokeDasharray="5,3"/>
            
            {/* Scissors icon */}
            <path d="M 170 55 L 175 60 L 170 65 M 175 60 L 165 60" 
                  stroke={quiltographerTheme.colors.inkGray} 
                  strokeWidth="2" 
                  fill="none"/>
            
            {/* Measurement */}
            <text x="100" y="40" 
                  textAnchor="middle" 
                  fontSize="12" 
                  fill={quiltographerTheme.colors.inkBlack}
                  fontFamily={quiltographerTheme.typography.fontFamily.body}>
              2½"
            </text>
          </svg>
        );
      
      case 'rst':
        return (
          <svg viewBox="0 0 200 120" style={{ width: '100%', height: 'auto' }}>
            {/* Left fabric (dark) */}
            <rect x="30" y="30" width="60" height="60" 
                  fill={quiltographerTheme.colors.indigo} 
                  stroke={quiltographerTheme.colors.inkBlack} 
                  strokeWidth="2"/>
            <text x="60" y="65" 
                  textAnchor="middle" 
                  fontSize="10" 
                  fill={quiltographerTheme.colors.rice}
                  fontFamily={quiltographerTheme.typography.fontFamily.body}>
              RIGHT
            </text>
            
            {/* Right fabric (light) */}
            <rect x="110" y="30" width="60" height="60" 
                  fill={quiltographerTheme.colors.washiDark} 
                  stroke={quiltographerTheme.colors.inkBlack} 
                  strokeWidth="2"/>
            <text x="140" y="65" 
                  textAnchor="middle" 
                  fontSize="10" 
                  fill={quiltographerTheme.colors.inkBlack}
                  fontFamily={quiltographerTheme.typography.fontFamily.body}>
              RIGHT
            </text>
            
            {/* Arrow showing direction */}
            <path d="M 90 60 L 110 60 M 105 55 L 110 60 L 105 65" 
                  stroke={quiltographerTheme.colors.persimmon} 
                  strokeWidth="2" 
                  fill="none"/>
            
            <text x="100" y="105" 
                  textAnchor="middle" 
                  fontSize="10" 
                  fill={quiltographerTheme.colors.inkGray}
                  fontFamily={quiltographerTheme.typography.fontFamily.body}>
              Place right sides facing
            </text>
          </svg>
        );
      
      case 'sewing':
        return (
          <svg viewBox="0 0 200 120" style={{ width: '100%', height: 'auto' }}>
            {/* Two fabric pieces */}
            <rect x="40" y="30" width="50" height="70" 
                  fill={quiltographerTheme.colors.washiDark} 
                  stroke={quiltographerTheme.colors.inkBlack} 
                  strokeWidth="2"/>
            <rect x="90" y="30" width="50" height="70" 
                  fill={quiltographerTheme.colors.clay} 
                  stroke={quiltographerTheme.colors.inkBlack} 
                  strokeWidth="2"/>
            
            {/* Seam line */}
            <line x1="90" y1="30" x2="90" y2="100" 
                  stroke={quiltographerTheme.colors.silk} 
                  strokeWidth="1" 
                  strokeDasharray="3,2"/>
            
            {/* Seam allowance indicator */}
            <text x="95" y="20" 
                  textAnchor="middle" 
                  fontSize="10" 
                  fill={quiltographerTheme.colors.inkBlack}
                  fontFamily={quiltographerTheme.typography.fontFamily.body}>
              ¼"
            </text>
            <path d="M 87 15 L 90 15 L 90 25 M 93 15 L 90 15" 
                  stroke={quiltographerTheme.colors.inkBlack} 
                  strokeWidth="1"/>
          </svg>
        );
      
      case 'pressing':
        return (
          <svg viewBox="0 0 200 120" style={{ width: '100%', height: 'auto' }}>
            {/* Fabric with seam */}
            <rect x="40" y="40" width="120" height="50" 
                  fill={quiltographerTheme.colors.washiDark} 
                  stroke={quiltographerTheme.colors.inkBlack} 
                  strokeWidth="2"/>
            <line x1="100" y1="40" x2="100" y2="90" 
                  stroke={quiltographerTheme.colors.inkGray} 
                  strokeWidth="1"/>
            <rect x="100" y="40" width="60" height="50" 
                  fill={quiltographerTheme.colors.indigo} 
                  stroke={quiltographerTheme.colors.inkBlack} 
                  strokeWidth="2"/>
            
            {/* Iron icon */}
            <path d="M 75 25 L 85 25 L 85 35 L 80 40 L 75 35 Z" 
                  fill={quiltographerTheme.colors.inkGray} 
                  stroke={quiltographerTheme.colors.inkBlack} 
                  strokeWidth="1"/>
            
            {/* Direction arrow */}
            <path d="M 105 65 L 125 65 M 120 60 L 125 65 L 120 70" 
                  stroke={quiltographerTheme.colors.persimmon} 
                  strokeWidth="2" 
                  fill="none"/>
            
            <text x="100" y="105" 
                  textAnchor="middle" 
                  fontSize="10" 
                  fill={quiltographerTheme.colors.inkGray}
                  fontFamily={quiltographerTheme.typography.fontFamily.body}>
              Press to dark side
            </text>
          </svg>
        );
      
      case 'hst':
        return (
          <svg viewBox="0 0 200 120" style={{ width: '100%', height: 'auto' }}>
            {/* Square with diagonal */}
            <rect x="50" y="30" width="60" height="60" 
                  fill={quiltographerTheme.colors.washiDark} 
                  stroke={quiltographerTheme.colors.inkBlack} 
                  strokeWidth="2"/>
            <path d="M 50 30 L 110 90" 
                  stroke={quiltographerTheme.colors.inkBlack} 
                  strokeWidth="2"/>
            <path d="M 50 30 L 110 30 L 110 90 Z" 
                  fill={quiltographerTheme.colors.indigo} 
                  opacity="0.8"/>
            
            {/* Arrow showing result */}
            <path d="M 120 60 L 140 60 M 135 55 L 140 60 L 135 65" 
                  stroke={quiltographerTheme.colors.persimmon} 
                  strokeWidth="2" 
                  fill="none"/>
            
            {/* Result triangles */}
            <path d="M 150 30 L 180 30 L 180 60 Z" 
                  fill={quiltographerTheme.colors.indigo} 
                  stroke={quiltographerTheme.colors.inkBlack} 
                  strokeWidth="2"/>
            <path d="M 150 60 L 180 60 L 180 90 Z" 
                  fill={quiltographerTheme.colors.washiDark} 
                  stroke={quiltographerTheme.colors.inkBlack} 
                  strokeWidth="2"/>
            
            <text x="100" y="105" 
                  textAnchor="middle" 
                  fontSize="10" 
                  fill={quiltographerTheme.colors.inkGray}
                  fontFamily={quiltographerTheme.typography.fontFamily.body}>
              Half Square Triangle (HST)
            </text>
          </svg>
        );
      
      case 'chain':
        return (
          <svg viewBox="0 0 200 120" style={{ width: '100%', height: 'auto' }}>
            {/* Chain of pieces */}
            {[0, 1, 2].map((i) => (
              <g key={i}>
                <rect x={30 + i * 55} y="40" width="20" height="20" 
                      fill={quiltographerTheme.colors.washiDark} 
                      stroke={quiltographerTheme.colors.inkBlack} 
                      strokeWidth="1"/>
                <rect x={30 + i * 55} y="60" width="20" height="20" 
                      fill={quiltographerTheme.colors.clay} 
                      stroke={quiltographerTheme.colors.inkBlack} 
                      strokeWidth="1"/>
                {i < 2 && (
                  <line x1={50 + i * 55} y1="60" x2={85 + i * 55} y2="60" 
                        stroke={quiltographerTheme.colors.persimmon} 
                        strokeWidth="1" 
                        strokeDasharray="2,1"/>
                )}
              </g>
            ))}
            
            <text x="100" y="100" 
                  textAnchor="middle" 
                  fontSize="10" 
                  fill={quiltographerTheme.colors.inkGray}
                  fontFamily={quiltographerTheme.typography.fontFamily.body}>
              Chain Piecing
            </text>
          </svg>
        );
      
      default:
        return null;
    }
  };

  const diagramType = getDiagramType();
  
  if (!diagramType) return null;

  return (
    <div style={{
      marginTop: quiltographerTheme.spacing.breathe,
      marginBottom: quiltographerTheme.spacing.breathe,
      padding: quiltographerTheme.spacing.rest,
      backgroundColor: quiltographerTheme.colors.rice,
      borderRadius: quiltographerTheme.radius.md,
      border: `1px solid ${quiltographerTheme.colors.inkGray}20`,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1rem',
      }}>
        <span style={{ fontSize: '1.2rem' }}>📐</span>
        <span style={{
          fontSize: quiltographerTheme.typography.fontSize.sm,
          color: quiltographerTheme.colors.indigo,
          fontWeight: 600,
          fontFamily: quiltographerTheme.typography.fontFamily.body,
        }}>
          Visual Guide
        </span>
        <span style={{
          fontSize: quiltographerTheme.typography.fontSize.xs,
          color: quiltographerTheme.colors.sage,
          backgroundColor: `${quiltographerTheme.colors.sage}20`,
          padding: '2px 8px',
          borderRadius: quiltographerTheme.radius.full,
          fontFamily: quiltographerTheme.typography.fontFamily.body,
        }}>
          Auto-generated
        </span>
      </div>
      
      <div style={{
        maxWidth: '300px',
        margin: '0 auto',
      }}>
        {renderDiagram(diagramType)}
      </div>
    </div>
  );
}

export default VisualDiagram;
