'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import type { ReaderPattern } from '@/lib/reader/schema';

const PATTERN_FILES = [
  { id: 'demo-log-cabin', file: 'log-cabin-classic', emoji: '🏠' },
  { id: 'demo-flying-geese', file: 'flying-geese-runner', emoji: '🪿' },
  { id: 'demo-nine-patch', file: 'nine-patch-baby', emoji: '👶' },
  { id: 'demo-lone-star', file: 'lone-star-wall-hanging', emoji: '⭐' },
  { id: 'demo-irish-chain', file: 'irish-chain-throw', emoji: '🍀' },
];

const DIFFICULTY_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  beginner: { label: 'Beginner', color: '#84a98c', bg: 'rgba(132,169,140,0.12)' },
  intermediate: { label: 'Intermediate', color: '#e9c46a', bg: 'rgba(233,196,106,0.15)' },
  advanced: { label: 'Advanced', color: '#e76f51', bg: 'rgba(231,111,81,0.12)' },
  expert: { label: 'Expert', color: '#c1121f', bg: 'rgba(193,18,31,0.12)' },
};

function getDifficultyTier(score: number) {
  if (score <= 3) return DIFFICULTY_LABELS.beginner;
  if (score <= 6) return DIFFICULTY_LABELS.intermediate;
  if (score <= 8) return DIFFICULTY_LABELS.advanced;
  return DIFFICULTY_LABELS.expert;
}

export default function GalleryPage() {
  const [patterns, setPatterns] = useState<(ReaderPattern & { emoji: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all(
      PATTERN_FILES.map((entry) =>
        fetch(`/sample-patterns/${entry.file}.json`)
          .then((res) => res.json())
          .then((data: ReaderPattern) => ({ ...data, emoji: entry.emoji }))
      )
    )
      .then((results) => {
        setPatterns(results);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fdf4e3' }}>
      {/* Header */}
      <nav className="max-w-6xl mx-auto px-6 py-5 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-3xl">🧵</span>
          <span
            className="text-2xl font-semibold text-indigo tracking-tight"
            style={{ fontFamily: '"Noto Serif JP", Georgia, serif' }}
          >
            Quiltographer
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/calculator" className="hidden sm:inline text-ink-gray hover:text-indigo transition-colors text-sm font-medium">
            Calculator
          </Link>
          <Link
            href="/reader"
            className="px-5 py-2.5 bg-persimmon text-white rounded-lg font-medium hover:opacity-90 transition-opacity text-sm min-h-[44px] flex items-center"
          >
            Open Reader
          </Link>
        </div>
      </nav>

      {/* Page content */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1
          className="text-3xl sm:text-4xl font-bold text-indigo mb-3"
          style={{ fontFamily: '"Noto Serif JP", Georgia, serif' }}
        >
          Pattern Gallery
        </h1>
        <p className="text-ink-gray text-lg mb-10 max-w-2xl">
          Browse sample patterns and jump straight into the reader. No upload needed.
        </p>

        {loading ? (
          <div className="text-center py-20 text-ink-gray">Loading patterns...</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {patterns.map((pattern) => {
              const tier = getDifficultyTier(pattern.difficulty);
              return (
                <Link
                  key={pattern.id}
                  href={`/reader?demo=${pattern.id}`}
                  className="group block rounded-2xl border-2 border-ink-gray/10 hover:border-persimmon/50 transition-all bg-white overflow-hidden shadow-sm hover:shadow-lg"
                >
                  {/* Card header */}
                  <div className="bg-indigo/5 px-5 pt-5 pb-4 flex items-start gap-3">
                    <span className="text-4xl flex-shrink-0">{pattern.emoji}</span>
                    <div className="min-w-0">
                      <h2 className="font-semibold text-indigo text-lg group-hover:text-persimmon transition-colors leading-tight">
                        {pattern.name}
                      </h2>
                      {pattern.finishedSize && (
                        <p className="text-ink-light text-xs mt-1">
                          {pattern.finishedSize.width}&quot; &times; {pattern.finishedSize.height}&quot;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="px-5 py-4">
                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span
                        className="text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{ color: tier.color, backgroundColor: tier.bg }}
                      >
                        {tier.label} ({pattern.difficulty}/10)
                      </span>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-indigo/8 text-indigo">
                        {pattern.steps.length} steps
                      </span>
                      {pattern.estimatedTime && (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-indigo/8 text-indigo">
                          ~{pattern.estimatedTime}h
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-ink-gray text-sm leading-relaxed line-clamp-3">
                      {pattern.description}
                    </p>

                    {/* Materials preview */}
                    <div className="mt-3 pt-3 border-t border-ink-gray/10">
                      <p className="text-xs text-ink-light">
                        {pattern.materials.filter((m) => m.type === 'fabric').length} fabrics
                        {' · '}
                        {pattern.cuttingInstructions.reduce((sum, ci) => sum + ci.pieces.reduce((s, p) => s + p.quantity, 0), 0)} pieces to cut
                      </p>
                    </div>
                  </div>

                  {/* Card footer */}
                  <div className="px-5 pb-4">
                    <span className="inline-flex items-center gap-1.5 text-persimmon text-sm font-medium group-hover:gap-2.5 transition-all">
                      Open in Reader
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="mt-px">
                        <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-ink-gray mb-4">Have your own pattern PDF?</p>
          <Link
            href="/reader"
            className="inline-flex items-center px-6 py-3 bg-persimmon text-white rounded-xl font-semibold hover:opacity-90 transition-opacity min-h-[48px]"
          >
            Upload a Pattern
          </Link>
        </div>
      </div>
    </div>
  );
}
