'use client';

import React from 'react';
import { Canvas } from '@/components/canvas/Canvas';
import { useCanvasStore } from '@/store/canvas-store';
import { quiltographerTheme as theme } from '@/components/japanese/theme';
import { WashiSurface } from '@/components/japanese/WashiSurface';
import { Text, Button, Surface, Stack } from '@/components/ui';
import Link from 'next/link';

const PATTERN_TYPES = [
  { type: 'log-cabin' as const, label: 'Log Cabin', icon: '🏠' },
  { type: 'flying-geese' as const, label: 'Flying Geese', icon: '🪿' },
  { type: 'nine-patch' as const, label: 'Nine Patch', icon: '🔲' },
  { type: 'sashiko-cross' as const, label: 'Sashiko Cross', icon: '✦' },
] as const;

export default function DesignPage() {
  const { addPattern, patterns, selectedPatternId, clearCanvas } = useCanvasStore();

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: theme.colors.washi }}>
      {/* Left sidebar — Block Library */}
      <aside 
        className="w-64 border-r flex flex-col p-4 gap-3"
        style={{ backgroundColor: theme.colors.indigo, borderColor: `${theme.colors.sumi}20` }}
      >
        <Link href="/" className="flex items-center gap-2 mb-2">
          <span className="text-xl">🧵</span>
          <Text variant="heading" className="text-lg" style={{ color: theme.colors.rice }}>
            Quiltographer
          </Text>
        </Link>

        <Text variant="label" style={{ color: theme.colors.persimmon }}>
          Block Library
        </Text>

        <div className="flex flex-col gap-2">
          {PATTERN_TYPES.map(({ type, label, icon }) => (
            <button
              key={type}
              onClick={() => addPattern(type)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: `${theme.colors.washi}15`,
                color: theme.colors.rice,
                border: `1px solid ${theme.colors.washi}20`,
              }}
            >
              <span className="text-xl">{icon}</span>
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-2">
          <Text variant="caption" style={{ color: `${theme.colors.rice}80` }}>
            {patterns.length} block{patterns.length !== 1 ? 's' : ''} on canvas
          </Text>
          {patterns.length > 0 && (
            <button
              onClick={clearCanvas}
              className="text-xs px-3 py-1.5 rounded transition-colors"
              style={{ color: theme.colors.persimmon, border: `1px solid ${theme.colors.persimmon}40` }}
            >
              Clear Canvas
            </button>
          )}
        </div>

        <div className="border-t pt-3 mt-2" style={{ borderColor: `${theme.colors.rice}20` }}>
          <Text variant="caption" style={{ color: `${theme.colors.rice}60` }}>
            R — Rotate selected · Del — Remove
          </Text>
          <Link href="/reader" className="block mt-2 text-xs underline" style={{ color: theme.colors.sage }}>
            ← Back to Pattern Reader
          </Link>
        </div>
      </aside>

      {/* Main canvas area */}
      <main className="flex-1 p-6">
        <div className="h-full rounded-xl overflow-hidden shadow-lg" style={{ border: `2px solid ${theme.colors.indigo}30` }}>
          <Canvas width={1200} height={800} />
        </div>
      </main>
    </div>
  );
}
