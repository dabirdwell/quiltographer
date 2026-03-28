'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FabricCalculator } from '@/components/reader/FabricCalculator';
import type { ReaderPattern } from '@/lib/reader/schema';

const DEMO_PATTERNS = [
  { id: 'demo-log-cabin', file: 'log-cabin-classic', name: 'Log Cabin Classic', emoji: '🏠' },
  { id: 'demo-flying-geese', file: 'flying-geese-runner', name: 'Flying Geese Table Runner', emoji: '🪿' },
  { id: 'demo-nine-patch', file: 'nine-patch-baby', name: 'Nine-Patch Baby Quilt', emoji: '👶' },
  { id: 'demo-lone-star', file: 'lone-star-wall-hanging', name: 'Lone Star Wall Hanging', emoji: '⭐' },
  { id: 'demo-irish-chain', file: 'irish-chain-throw', name: 'Double Irish Chain Throw', emoji: '🍀' },
];

export default function CalculatorPage() {
  const [pattern, setPattern] = useState<ReaderPattern | null>(null);
  const [selectedId, setSelectedId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const patternId = params.get('pattern');
    if (patternId) {
      loadPattern(patternId);
    }
  }, []);

  function loadPattern(demoId: string) {
    const entry = DEMO_PATTERNS.find((p) => p.id === demoId);
    if (!entry) return;
    setSelectedId(demoId);
    setLoading(true);
    fetch(`/sample-patterns/${entry.file}.json`)
      .then((res) => res.json())
      .then((data: ReaderPattern) => {
        setPattern(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }

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
          <Link href="/gallery" className="hidden sm:inline text-ink-gray hover:text-indigo transition-colors text-sm font-medium">
            Gallery
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
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1
          className="text-3xl sm:text-4xl font-bold text-indigo mb-3"
          style={{ fontFamily: '"Noto Serif JP", Georgia, serif' }}
        >
          Fabric Calculator
        </h1>
        <p className="text-ink-gray text-lg mb-8 max-w-2xl">
          See exactly how much fabric you need. Select a pattern below to calculate yardage from its cutting instructions.
        </p>

        {/* Pattern selector */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-indigo mb-3">Choose a pattern</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {DEMO_PATTERNS.map((p) => (
              <button
                key={p.id}
                onClick={() => loadPattern(p.id)}
                className={`text-left p-4 rounded-xl border-2 transition-colors ${
                  selectedId === p.id
                    ? 'border-persimmon bg-white shadow-md'
                    : 'border-ink-gray/10 bg-white hover:border-persimmon/40'
                }`}
              >
                <span className="text-2xl">{p.emoji}</span>
                <p className="font-medium text-indigo text-sm mt-1">{p.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Calculator */}
        {loading && (
          <div className="text-center py-12 text-ink-gray">Loading pattern...</div>
        )}

        {pattern && !loading && (
          <div className="bg-white rounded-2xl shadow-lg border border-ink-gray/10 overflow-hidden">
            <div className="bg-indigo/5 px-6 py-4 border-b border-ink-gray/10">
              <h2 className="font-semibold text-indigo">{pattern.name}</h2>
              {pattern.finishedSize && (
                <p className="text-ink-gray text-sm">
                  Finished size: {pattern.finishedSize.width}&quot; &times; {pattern.finishedSize.height}&quot;
                </p>
              )}
            </div>
            <div className="p-6">
              <FabricCalculator pattern={pattern} />
            </div>
          </div>
        )}

        {!pattern && !loading && (
          <div className="text-center py-16 text-ink-gray bg-white rounded-2xl border-2 border-dashed border-ink-gray/20">
            <span className="text-4xl block mb-3">🧮</span>
            <p className="font-medium text-indigo mb-1">Select a pattern above</p>
            <p className="text-sm">Or open the <Link href="/reader" className="text-persimmon hover:underline">Pattern Reader</Link> to upload your own</p>
          </div>
        )}
      </div>
    </div>
  );
}
