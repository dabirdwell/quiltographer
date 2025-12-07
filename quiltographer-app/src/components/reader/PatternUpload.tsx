'use client';

import React, { useState, useCallback } from 'react';
import { quiltographerTheme } from '../japanese/theme';
import { WashiSurface } from '../japanese/WashiSurface';

interface PatternUploadProps {
  onPatternLoaded: (file: File) => void;
  isProcessing?: boolean;
}

/**
 * PatternUpload - PDF upload with drag-and-drop
 * 
 * The entry point for the Pattern Reader experience.
 * Accepts PDF patterns via click or drag-drop.
 */
export function PatternUpload({
  onPatternLoaded,
  isProcessing = false,
}: PatternUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        onPatternLoaded(file);
      } else {
        setError('Please upload a PDF file');
      }
    }
  }, [onPatternLoaded]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        onPatternLoaded(file);
      } else {
        setError('Please upload a PDF file');
      }
    }
  }, [onPatternLoaded]);

  return (
    <WashiSurface elevated>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          padding: quiltographerTheme.spacing.meditate,
          textAlign: 'center',
          border: `2px dashed ${isDragging ? quiltographerTheme.colors.persimmon : quiltographerTheme.colors.inactive}`,
          borderRadius: quiltographerTheme.radius.lg,
          margin: quiltographerTheme.spacing.breathe,
          backgroundColor: isDragging ? quiltographerTheme.colors.hover : 'transparent',
          transition: `all ${quiltographerTheme.timing.quick} ${quiltographerTheme.timing.easeOut}`,
          cursor: isProcessing ? 'wait' : 'pointer',
          opacity: isProcessing ? 0.7 : 1,
        }}
      >
        {isProcessing ? (
          <>
            <div
              style={{
                fontSize: '3rem',
                marginBottom: quiltographerTheme.spacing.breathe,
                animation: 'spin 1s linear infinite',
              }}
            >
              ⟳
            </div>
            <p
              style={{
                fontSize: quiltographerTheme.typography.fontSize.xl,
                color: quiltographerTheme.colors.indigo,
                fontFamily: quiltographerTheme.typography.fontFamily.display,
                marginBottom: '0.5rem',
              }}
            >
              Reading your pattern...
            </p>
            <p
              style={{
                fontSize: quiltographerTheme.typography.fontSize.base,
                color: quiltographerTheme.colors.inkGray,
                fontFamily: quiltographerTheme.typography.fontFamily.body,
              }}
            >
              This may take a few seconds
            </p>
          </>
        ) : (
          <>
            <div
              style={{
                fontSize: '3rem',
                marginBottom: quiltographerTheme.spacing.breathe,
              }}
            >
              📄
            </div>
            <p
              style={{
                fontSize: quiltographerTheme.typography.fontSize.xl,
                color: quiltographerTheme.colors.indigo,
                fontFamily: quiltographerTheme.typography.fontFamily.display,
                marginBottom: '0.5rem',
              }}
            >
              Drop your pattern PDF here
            </p>
            <p
              style={{
                fontSize: quiltographerTheme.typography.fontSize.base,
                color: quiltographerTheme.colors.inkGray,
                fontFamily: quiltographerTheme.typography.fontFamily.body,
                marginBottom: quiltographerTheme.spacing.breathe,
              }}
            >
              or click to browse
            </p>
            <label
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                backgroundColor: quiltographerTheme.colors.persimmon,
                color: quiltographerTheme.colors.rice,
                borderRadius: quiltographerTheme.radius.md,
                fontSize: quiltographerTheme.typography.fontSize.base,
                fontFamily: quiltographerTheme.typography.fontFamily.body,
                fontWeight: 500,
                cursor: 'pointer',
                transition: `all ${quiltographerTheme.timing.quick} ${quiltographerTheme.timing.easeOut}`,
                boxShadow: quiltographerTheme.shadows.soft,
              }}
            >
              Choose PDF
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </label>
          </>
        )}

        {error && (
          <p
            style={{
              marginTop: quiltographerTheme.spacing.breathe,
              color: quiltographerTheme.colors.silk,
              fontSize: quiltographerTheme.typography.fontSize.base,
              fontFamily: quiltographerTheme.typography.fontFamily.body,
            }}
          >
            {error}
          </p>
        )}
      </div>
    </WashiSurface>
  );
}

export default PatternUpload;
