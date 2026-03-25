'use client';

import React, { useState, useCallback, useRef } from 'react';
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
  const [fileName, setFileName] = useState<string | null>(null);
  const dragCountRef = useRef(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCountRef.current += 1;
    setIsDragging(true);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCountRef.current -= 1;
    if (dragCountRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    dragCountRef.current = 0;
    setError(null);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        setFileName(file.name);
        onPatternLoaded(file);
      } else {
        setError('Please upload a PDF file. Other file types are not supported.');
      }
    }
  }, [onPatternLoaded]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        setFileName(file.name);
        onPatternLoaded(file);
      } else {
        setError('Please upload a PDF file. Other file types are not supported.');
      }
    }
  }, [onPatternLoaded]);

  return (
    <WashiSurface elevated>
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          padding: quiltographerTheme.spacing.meditate,
          textAlign: 'center',
          border: `3px dashed ${isDragging ? quiltographerTheme.colors.persimmon : quiltographerTheme.colors.inactive}`,
          borderRadius: quiltographerTheme.radius.lg,
          margin: quiltographerTheme.spacing.breathe,
          backgroundColor: isDragging ? 'rgba(231, 111, 81, 0.08)' : 'transparent',
          transition: `all 0.2s ease-out`,
          cursor: isProcessing ? 'wait' : 'pointer',
          opacity: isProcessing ? 0.7 : 1,
          transform: isDragging ? 'scale(1.02)' : 'scale(1)',
        }}
      >
        {isProcessing ? (
          <>
            <div className="flex justify-center mb-4">
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  border: `4px solid ${quiltographerTheme.colors.inactive}`,
                  borderTopColor: quiltographerTheme.colors.persimmon,
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
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
            {fileName && (
              <p
                style={{
                  fontSize: quiltographerTheme.typography.fontSize.sm,
                  color: quiltographerTheme.colors.inkGray,
                  fontFamily: quiltographerTheme.typography.fontFamily.body,
                  marginBottom: '0.25rem',
                }}
              >
                {fileName}
              </p>
            )}
            <p
              style={{
                fontSize: quiltographerTheme.typography.fontSize.base,
                color: quiltographerTheme.colors.inkGray,
                fontFamily: quiltographerTheme.typography.fontFamily.body,
              }}
            >
              Extracting steps, materials, and cutting instructions
            </p>
          </>
        ) : (
          <>
            <div
              style={{
                fontSize: '3.5rem',
                marginBottom: quiltographerTheme.spacing.breathe,
                transition: 'transform 0.2s ease-out',
                transform: isDragging ? 'scale(1.2) translateY(-4px)' : 'scale(1)',
              }}
            >
              {isDragging ? '📥' : '📄'}
            </div>
            {/* Desktop: drag-and-drop message; Mobile: prominent file picker */}
            <p
              className="hidden sm:block"
              style={{
                fontSize: quiltographerTheme.typography.fontSize.xl,
                color: isDragging ? quiltographerTheme.colors.persimmon : quiltographerTheme.colors.indigo,
                fontFamily: quiltographerTheme.typography.fontFamily.display,
                marginBottom: '0.5rem',
                fontWeight: isDragging ? 600 : 400,
                transition: 'all 0.2s ease-out',
              }}
            >
              {isDragging ? 'Drop it here!' : 'Drop your pattern PDF here'}
            </p>
            <p
              className="sm:hidden"
              style={{
                fontSize: quiltographerTheme.typography.fontSize.xl,
                color: quiltographerTheme.colors.indigo,
                fontFamily: quiltographerTheme.typography.fontFamily.display,
                marginBottom: '0.5rem',
              }}
            >
              Upload your pattern PDF
            </p>
            {!isDragging && (
              <p
                className="hidden sm:block"
                style={{
                  fontSize: quiltographerTheme.typography.fontSize.base,
                  color: quiltographerTheme.colors.inkGray,
                  fontFamily: quiltographerTheme.typography.fontFamily.body,
                  marginBottom: quiltographerTheme.spacing.breathe,
                }}
              >
                or click to browse your files
              </p>
            )}
            <label
              style={{
                display: isDragging ? 'none' : 'inline-block',
                padding: '0.75rem 1.5rem',
                minHeight: '48px',
                minWidth: '160px',
                backgroundColor: quiltographerTheme.colors.persimmon,
                color: quiltographerTheme.colors.rice,
                borderRadius: quiltographerTheme.radius.md,
                fontSize: quiltographerTheme.typography.fontSize.base,
                fontFamily: quiltographerTheme.typography.fontFamily.body,
                fontWeight: 500,
                cursor: 'pointer',
                transition: `all ${quiltographerTheme.timing.quick} ${quiltographerTheme.timing.easeOut}`,
                boxShadow: quiltographerTheme.shadows.soft,
                lineHeight: '48px',
                textAlign: 'center',
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
            <p
              style={{
                marginTop: '1rem',
                fontSize: quiltographerTheme.typography.fontSize.xs,
                color: quiltographerTheme.colors.inkLight,
                fontFamily: quiltographerTheme.typography.fontFamily.body,
              }}
            >
              PDF files only. Works best with text-based patterns.
            </p>
          </>
        )}

        {error && (
          <div
            style={{
              marginTop: quiltographerTheme.spacing.breathe,
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(220, 38, 38, 0.08)',
              borderRadius: quiltographerTheme.radius.md,
              border: '1px solid rgba(220, 38, 38, 0.2)',
            }}
          >
            <p
              style={{
                color: quiltographerTheme.colors.silk,
                fontSize: quiltographerTheme.typography.fontSize.base,
                fontFamily: quiltographerTheme.typography.fontFamily.body,
                margin: 0,
              }}
            >
              {error}
            </p>
          </div>
        )}
      </div>
      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </WashiSurface>
  );
}

export default PatternUpload;
