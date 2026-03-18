'use client';

import React from 'react';
import { HSTDiagram } from '@/components/diagrams/HSTDiagram';
import { quiltographerTheme } from '@/components/japanese/theme';

export default function DiagramTestPage() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: quiltographerTheme.colors.washi,
      backgroundImage: quiltographerTheme.textures.washiFiber,
      padding: '2rem',
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: '2rem',
          fontFamily: quiltographerTheme.typography.fontFamily.display,
          color: quiltographerTheme.colors.indigo,
          textAlign: 'center',
          marginBottom: '0.5rem',
        }}>
          Diagram System Test
        </h1>
        <p style={{
          textAlign: 'center',
          color: quiltographerTheme.colors.inkGray,
          marginBottom: '2rem',
          fontFamily: quiltographerTheme.typography.fontFamily.body,
        }}>
          Living, breathing technique visualizations
        </p>

        {/* HST Diagram with default colors */}
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontFamily: quiltographerTheme.typography.fontFamily.display,
            color: quiltographerTheme.colors.indigo,
            marginBottom: '1rem',
          }}>
            Half Square Triangle (HST)
          </h2>
          <HSTDiagram />
        </div>

        {/* HST with custom colors */}
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontFamily: quiltographerTheme.typography.fontFamily.display,
            color: quiltographerTheme.colors.indigo,
            marginBottom: '1rem',
          }}>
            HST - Warm Color Palette
          </h2>
          <HSTDiagram 
            lightColor="#fef3c7"
            darkColor="#92400e"
            finishedSize='5"'
          />
        </div>

        {/* HST with cool colors */}
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontFamily: quiltographerTheme.typography.fontFamily.display,
            color: quiltographerTheme.colors.indigo,
            marginBottom: '1rem',
          }}>
            HST - Cool Color Palette
          </h2>
          <HSTDiagram 
            lightColor="#e0f2fe"
            darkColor="#0c4a6e"
            finishedSize='3½"'
          />
        </div>

        {/* Coral and sage */}
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontFamily: quiltographerTheme.typography.fontFamily.display,
            color: quiltographerTheme.colors.indigo,
            marginBottom: '1rem',
          }}>
            HST - Coral & Sage
          </h2>
          <HSTDiagram 
            lightColor="#fce7e6"
            darkColor="#84a98c"
            finishedSize='4"'
          />
        </div>

        <div style={{
          textAlign: 'center',
          padding: '2rem',
          borderTop: quiltographerTheme.borders.hairline,
          marginTop: '2rem',
        }}>
          <p style={{
            fontSize: '0.875rem',
            color: quiltographerTheme.colors.inkGray,
            fontStyle: 'italic',
          }}>
            Hover over diagrams to see animation • Click phase buttons to explore each step
          </p>
        </div>
      </div>
    </div>
  );
}
