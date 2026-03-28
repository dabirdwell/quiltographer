'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { quiltographerTheme } from '@/components/japanese/theme';

const theme = quiltographerTheme;

const DIFFICULTY_TIERS: Record<string, { color: string; bg: string }> = {
  Beginner: { color: '#84a98c', bg: 'rgba(132,169,140,0.15)' },
  Intermediate: { color: '#c89b3c', bg: 'rgba(200,155,60,0.13)' },
  Advanced: { color: '#e76f51', bg: 'rgba(231,111,81,0.13)' },
  Expert: { color: '#c1121f', bg: 'rgba(193,18,31,0.12)' },
};

const SAMPLE_PATTERNS = [
  {
    id: 'demo-log-cabin',
    name: 'Log Cabin Classic',
    difficulty: 3,
    tier: 'Beginner',
    steps: 10,
    emoji: '🏠',
    swatch: `repeating-conic-gradient(#c94c4c25 0% 25%, #e8a87c20 0% 50%) 50% / 24px 24px`,
    hasDemo: true,
  },
  {
    id: 'demo-flying-geese',
    name: 'Flying Geese Runner',
    difficulty: 5,
    tier: 'Intermediate',
    steps: 10,
    emoji: '🪿',
    swatch: `repeating-linear-gradient(135deg, #457b9d28 0 12px, #a8dadc20 12px 24px)`,
    hasDemo: true,
  },
  {
    id: 'demo-nine-patch',
    name: 'Nine-Patch Baby Quilt',
    difficulty: 2,
    tier: 'Beginner',
    steps: 6,
    emoji: '👶',
    swatch: `repeating-conic-gradient(#f4a26128 0% 25%, #fce8d520 0% 50%) 50% / 32px 32px`,
    hasDemo: true,
  },
  {
    id: 'demo-lone-star',
    name: 'Lone Star Wall Hanging',
    difficulty: 8,
    tier: 'Advanced',
    steps: 12,
    emoji: '⭐',
    swatch: `conic-gradient(from 0deg, #e76f5128, #f4a26120, #e76f5128, #f4a26120, #e76f5128, #f4a26120, #e76f5128, #f4a26120)`,
    hasDemo: true,
  },
  {
    id: 'demo-irish-chain',
    name: 'Double Irish Chain',
    difficulty: 5,
    tier: 'Intermediate',
    steps: 9,
    emoji: '🍀',
    swatch: `repeating-conic-gradient(#2a9d8f22 0% 25%, #a7c95718 0% 50%) 50% / 20px 20px`,
    hasDemo: true,
  },
  {
    id: 'pinwheel',
    name: 'Pinwheel Lap Quilt',
    difficulty: 3,
    tier: 'Beginner',
    steps: 8,
    emoji: '🌀',
    swatch: `conic-gradient(#7209b720 0deg, #c77dff18 90deg, #7209b720 180deg, #c77dff18 270deg)`,
    hasDemo: false,
  },
  {
    id: 'bears-paw',
    name: "Bear\u2019s Paw Throw",
    difficulty: 6,
    tier: 'Intermediate',
    steps: 14,
    emoji: '🐻',
    swatch: `repeating-conic-gradient(#8b451320 0% 25%, #d4a57418 0% 50%) 50% / 28px 28px`,
    hasDemo: false,
  },
  {
    id: 'storm-at-sea',
    name: 'Storm at Sea',
    difficulty: 7,
    tier: 'Advanced',
    steps: 16,
    emoji: '🌊',
    swatch: `repeating-linear-gradient(45deg, transparent 0 10px, #26465318 10px 11px), repeating-linear-gradient(-45deg, transparent 0 10px, #457b9d18 10px 11px)`,
    hasDemo: false,
  },
  {
    id: 'cathedral-windows',
    name: 'Cathedral Windows',
    difficulty: 9,
    tier: 'Expert',
    steps: 20,
    emoji: '🏛️',
    swatch: `radial-gradient(circle, #6a057218 30%, transparent 30%), radial-gradient(circle at 0 0, #ab83a115 25%, transparent 25%), radial-gradient(circle at 100% 0, #ab83a115 25%, transparent 25%), radial-gradient(circle at 0 100%, #ab83a115 25%, transparent 25%), radial-gradient(circle at 100% 100%, #ab83a115 25%, transparent 25%)`,
    hasDemo: false,
  },
  {
    id: 'rail-fence',
    name: 'Rail Fence Baby Blanket',
    difficulty: 2,
    tier: 'Beginner',
    steps: 6,
    emoji: '🚂',
    swatch: `repeating-linear-gradient(45deg, #84a98c22 0 8px, #cad2c518 8px 16px)`,
    hasDemo: false,
  },
];

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isBeta, setIsBeta] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('beta') === 'quilt2026') {
      setIsBeta(true);
      localStorage.setItem('quiltographer-beta', 'true');
    }
    if (localStorage.getItem('quiltographer-beta') === 'true') {
      setIsBeta(true);
    }
  }, []);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      const emails = JSON.parse(localStorage.getItem('quiltographer-waitlist') || '[]');
      emails.push({ email, date: new Date().toISOString() });
      localStorage.setItem('quiltographer-waitlist', JSON.stringify(emails));
      setSubmitted(true);
    }
  };

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Stripe is not configured yet. Coming soon!');
      }
    } catch {
      alert('Unable to start checkout. Please try again.');
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: theme.colors.washi,
        backgroundImage: theme.textures.washiFiber,
      }}
    >
      {/* Preview banner */}
      <div
        className="text-center py-2 text-sm font-medium tracking-wide"
        style={{ backgroundColor: theme.colors.indigo, color: theme.colors.rice }}
      >
        Beta — Free during preview. Pro features coming soon.
      </div>

      {/* Beta pass banner */}
      {isBeta && (
        <div
          className="text-center py-2 text-sm font-medium"
          style={{ backgroundColor: theme.colors.sage, color: theme.colors.rice }}
        >
          Beta Pass Active — Full access unlocked
        </div>
      )}

      {/* Navigation */}
      <nav className="max-w-6xl mx-auto px-6 py-5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🧵</span>
          <span
            className="text-2xl font-semibold tracking-tight"
            style={{ fontFamily: theme.typography.fontFamily.display, color: theme.colors.indigo }}
          >
            Quiltographer
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/gallery" className="hidden sm:inline text-ink-gray hover:text-indigo transition-colors text-sm font-medium">
            Gallery
          </Link>
          <Link href="/calculator" className="hidden sm:inline text-ink-gray hover:text-indigo transition-colors text-sm font-medium">
            Calculator
          </Link>
          <a href="#pricing" className="hidden sm:inline text-ink-gray hover:text-indigo transition-colors text-sm font-medium">
            Pricing
          </a>
          <Link
            href="/reader"
            className="px-5 py-2.5 text-white rounded-lg font-medium hover:opacity-90 transition-opacity text-sm min-h-[44px] flex items-center"
            style={{ backgroundColor: theme.colors.persimmon }}
          >
            Try It Free
          </Link>
        </div>
      </nav>

      {/* ═══════════════ Hero ═══════════════ */}
      <section className="max-w-4xl mx-auto px-6 pt-20 sm:pt-28 pb-16 sm:pb-20 text-center">
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6"
          style={{ fontFamily: theme.typography.fontFamily.display, color: theme.colors.indigo }}
        >
          Read Any Quilt Pattern
        </h1>
        <p
          className="text-lg sm:text-xl md:text-2xl max-w-2xl mx-auto mb-12 leading-relaxed"
          style={{ color: theme.colors.inkGray, fontFamily: theme.typography.fontFamily.body }}
        >
          Upload a pattern. Get clear steps. Know exactly how much fabric you need.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/reader"
            className="w-full sm:w-auto px-10 py-4 text-white rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity min-w-[220px] min-h-[56px] text-center flex items-center justify-center"
            style={{ backgroundColor: theme.colors.persimmon, boxShadow: theme.shadows.lifted }}
          >
            Try It Now
          </Link>
          <Link
            href="/reader?demo=demo-log-cabin"
            className="w-full sm:w-auto px-10 py-4 rounded-xl font-semibold text-lg transition-colors min-w-[220px] min-h-[56px] text-center flex items-center justify-center border-2"
            style={{ borderColor: theme.colors.indigo, color: theme.colors.indigo }}
          >
            See a Demo
          </Link>
        </div>
      </section>

      {/* Thin decorative divider */}
      <div className="max-w-xs mx-auto flex items-center gap-4 mb-16">
        <div className="flex-1 h-px" style={{ backgroundColor: `${theme.colors.indigo}15` }} />
        <span className="text-xs tracking-[0.3em] uppercase" style={{ color: theme.colors.inkLight }}>tools</span>
        <div className="flex-1 h-px" style={{ backgroundColor: `${theme.colors.indigo}15` }} />
      </div>

      {/* ═══════════════ Feature Cards — 3 Core Tools ═══════════════ */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: '📖',
              title: 'Pattern Reader',
              desc: 'Upload any pattern PDF. Get clear, step-by-step instructions you can read from your sewing machine.',
              color: theme.colors.persimmon,
              bg: `${theme.colors.persimmon}12`,
              link: '/reader',
            },
            {
              icon: '🧮',
              title: 'Fabric Calculator',
              desc: 'Know exactly how much fabric you need, with waste margin built in. No more emergency quilt shop runs.',
              color: theme.colors.sage,
              bg: `${theme.colors.sage}18`,
              link: '/calculator',
            },
            {
              icon: '🎯',
              title: 'Difficulty Rating',
              desc: 'See at a glance if a pattern matches your skill level. Scored 1\u201310 with clear technique breakdowns.',
              color: theme.colors.indigo,
              bg: `${theme.colors.indigo}12`,
              link: '/gallery',
            },
          ].map((feature, i) => (
            <Link
              key={i}
              href={feature.link}
              className="group block rounded-2xl p-8 transition-all hover:-translate-y-1"
              style={{
                backgroundColor: theme.colors.rice,
                boxShadow: theme.shadows.soft,
                border: theme.borders.hairline,
              }}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 text-2xl"
                style={{ backgroundColor: feature.bg }}
              >
                {feature.icon}
              </div>
              <h3
                className="text-xl font-semibold mb-3 group-hover:opacity-80 transition-opacity"
                style={{ color: feature.color, fontFamily: theme.typography.fontFamily.display }}
              >
                {feature.title}
              </h3>
              <p className="leading-relaxed text-sm" style={{ color: theme.colors.inkGray }}>
                {feature.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════════ Pattern Gallery — 10 Patterns ═══════════════ */}
      <section className="py-20" style={{ backgroundColor: theme.colors.rice }}>
        <div className="max-w-6xl mx-auto px-6">
          <h2
            className="text-3xl sm:text-4xl font-bold text-center mb-3"
            style={{ fontFamily: theme.typography.fontFamily.display, color: theme.colors.indigo }}
          >
            Explore Sample Patterns
          </h2>
          <p className="text-center mb-14 text-lg max-w-xl mx-auto" style={{ color: theme.colors.inkGray }}>
            Try the reader instantly — no upload needed. Pick a pattern and start reading.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
            {SAMPLE_PATTERNS.map((pattern) => {
              const tierStyle = DIFFICULTY_TIERS[pattern.tier];
              return (
                <Link
                  key={pattern.id}
                  href={pattern.hasDemo ? `/reader?demo=${pattern.id}` : '/gallery'}
                  className="group block rounded-xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg"
                  style={{
                    backgroundColor: theme.colors.washi,
                    boxShadow: theme.shadows.subtle,
                    border: theme.borders.hairline,
                  }}
                >
                  {/* Quilt swatch thumbnail */}
                  <div
                    className="relative flex items-center justify-center"
                    style={{
                      aspectRatio: '1',
                      background: pattern.swatch,
                      backgroundColor: `${theme.colors.washiDark}`,
                      backgroundImage: `${pattern.swatch}, ${theme.textures.washiFiber}`,
                    }}
                  >
                    <span className="text-4xl sm:text-5xl drop-shadow-sm relative z-10">
                      {pattern.emoji}
                    </span>
                    {/* Difficulty badge */}
                    <span
                      className="absolute top-2 right-2 text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full z-10"
                      style={{ color: tierStyle.color, backgroundColor: tierStyle.bg, backdropFilter: 'blur(4px)' }}
                    >
                      {pattern.difficulty}/10
                    </span>
                  </div>
                  {/* Pattern info */}
                  <div className="p-3 sm:p-4">
                    <h3
                      className="font-semibold text-sm sm:text-base leading-tight mb-1.5 group-hover:opacity-80 transition-opacity"
                      style={{ color: theme.colors.indigo, fontFamily: theme.typography.fontFamily.display }}
                    >
                      {pattern.name}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ color: tierStyle.color, backgroundColor: tierStyle.bg }}
                      >
                        {pattern.tier}
                      </span>
                      <span className="text-[10px] sm:text-xs" style={{ color: theme.colors.inkLight }}>
                        {pattern.steps} steps
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: theme.colors.indigo }}
            >
              View full gallery
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════ Try It Now CTA ═══════════════ */}
      <section className="py-20 px-6">
        <div
          className="max-w-3xl mx-auto text-center rounded-2xl p-10 sm:p-14"
          style={{
            backgroundColor: theme.colors.rice,
            boxShadow: theme.shadows.lifted,
            border: theme.borders.hairline,
            backgroundImage: theme.textures.washiFiber,
          }}
        >
          <p
            className="text-xs uppercase tracking-[0.2em] font-semibold mb-4"
            style={{ color: theme.colors.persimmon }}
          >
            Ready to sew?
          </p>
          <h2
            className="text-2xl sm:text-3xl font-bold mb-4"
            style={{ fontFamily: theme.typography.fontFamily.display, color: theme.colors.indigo }}
          >
            Upload your pattern and start reading
          </h2>
          <p className="text-base sm:text-lg mb-8 max-w-lg mx-auto leading-relaxed" style={{ color: theme.colors.inkGray }}>
            Drop any PDF quilt pattern. Quiltographer extracts the steps, materials, and measurements — so you can focus on fabric, not frustration.
          </p>
          <Link
            href="/reader"
            className="inline-flex items-center justify-center px-10 py-4 text-white rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity min-w-[220px] min-h-[56px]"
            style={{ backgroundColor: theme.colors.persimmon, boxShadow: theme.shadows.lifted }}
          >
            Try It Now
          </Link>
        </div>
      </section>

      {/* ═══════════════ How It Works ═══════════════ */}
      <section
        className="py-20"
        style={{ backgroundColor: theme.colors.rice }}
      >
        <div className="max-w-5xl mx-auto px-6">
          <h2
            className="text-3xl font-bold text-center mb-4"
            style={{ fontFamily: theme.typography.fontFamily.display, color: theme.colors.indigo }}
          >
            How It Works
          </h2>
          <p className="text-center mb-14 text-lg max-w-2xl mx-auto" style={{ color: theme.colors.inkGray }}>
            Three steps between you and finally understanding that pattern.
          </p>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                icon: '📄',
                bg: `${theme.colors.persimmon}15`,
                title: '1. Upload Your Pattern',
                desc: 'Drop any PDF quilt pattern. We extract steps, materials, and measurements automatically.',
              },
              {
                icon: '📖',
                bg: `${theme.colors.sage}15`,
                title: '2. Follow Step by Step',
                desc: 'One clear instruction at a time. Large text, progress tracking. Pick up where you left off.',
              },
              {
                icon: '🤖',
                bg: `${theme.colors.indigo}15`,
                title: '3. Ask When Confused',
                desc: 'Hit "Explain this step" and get a plain-English rewrite from AI that knows quilting.',
              },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                  style={{ backgroundColor: step.bg }}
                >
                  <span className="text-3xl">{step.icon}</span>
                </div>
                <h3
                  className="text-xl font-semibold mb-3"
                  style={{ color: theme.colors.indigo }}
                >
                  {step.title}
                </h3>
                <p className="leading-relaxed" style={{ color: theme.colors.inkGray }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ Demo Preview ═══════════════ */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <div
          className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: theme.colors.rice, boxShadow: theme.shadows.lifted, border: theme.borders.hairline }}
        >
          <div
            className="px-6 py-4 flex items-center gap-3"
            style={{ backgroundColor: `${theme.colors.indigo}08`, borderBottom: theme.borders.hairline }}
          >
            <span className="text-xl">🧵</span>
            <span className="font-semibold text-sm" style={{ color: theme.colors.indigo }}>Pattern Reader</span>
            <span className="text-sm ml-auto" style={{ color: theme.colors.inkGray }}>Step 3 of 12</span>
          </div>
          <div className="p-6 sm:p-8">
            <p className="text-sm uppercase tracking-wider mb-1" style={{ color: theme.colors.inkGray }}>Step 3 of 12</p>
            <h3 className="text-xl font-bold mb-4" style={{ color: theme.colors.indigo }}>Sew Strip Sets</h3>
            <p className="leading-relaxed mb-4" style={{ color: theme.colors.inkGray }}>
              Sew (2) 2&frac12;&quot; x Width of Fabric (WOF) Fabric A strips and (1) 2&frac12;&quot; x WOF Fabric B strip together along the long edges, with Right Sides Together (RST). Press seams toward the darker fabric.
            </p>
            <div className="flex gap-2 flex-wrap">
              <span
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: `${theme.colors.indigo}15`, color: theme.colors.indigo }}
              >
                strip piecing
              </span>
              <span
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: `${theme.colors.indigo}15`, color: theme.colors.indigo }}
              >
                pressing
              </span>
            </div>
            <div
              className="mt-4 p-3 rounded-lg text-sm flex gap-2"
              style={{ backgroundColor: `${theme.colors.sage}15`, color: theme.colors.sage }}
            >
              <span>🤖</span>
              <span className="italic">&quot;Place your strips with the pretty sides kissing, sew along the long edge with a &frac14;&quot; seam, then press flat...&quot;</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ Built for Quilters ═══════════════ */}
      <section className="py-20 px-6" style={{ backgroundColor: theme.colors.rice }}>
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-3xl font-bold text-center mb-4"
            style={{ fontFamily: theme.typography.fontFamily.display, color: theme.colors.indigo }}
          >
            Built for Quilters
          </h2>
          <p className="text-center mb-14 text-lg" style={{ color: theme.colors.inkGray }}>
            Not a general-purpose PDF reader. Every feature exists because a quilter needed it.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: '🔤',
                title: 'Big, Clear Text',
                desc: 'Font sizes from 100% to 300%. Readable at arm\'s length from your sewing machine.',
              },
              {
                icon: '📋',
                title: 'Materials Checklist',
                desc: 'Check off materials as you gather them. Your progress saves automatically.',
              },
              {
                icon: '💡',
                title: 'Abbreviation Decoder',
                desc: 'RST, HST, WOF, FPP — automatically expanded so you never have to guess.',
              },
              {
                icon: '📱',
                title: 'Tablet Friendly',
                desc: 'Designed for the tablet propped up next to your machine. Big touch targets, clear layout.',
              },
              {
                icon: '💾',
                title: 'Resume Anytime',
                desc: 'Close the browser, come back tomorrow. Your pattern, step, and checklist are saved.',
              },
              {
                icon: '🤖',
                title: 'AI That Speaks Quilter',
                desc: 'Confused by a step? Ask the AI and get a plain-English explanation with quilting context.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="flex gap-4 p-5 rounded-xl"
                style={{
                  backgroundColor: theme.colors.rice,
                  boxShadow: theme.shadows.subtle,
                  border: theme.borders.hairline,
                }}
              >
                <span className="text-2xl flex-shrink-0 mt-1">{feature.icon}</span>
                <div>
                  <h3 className="font-semibold text-lg mb-1" style={{ color: theme.colors.indigo }}>{feature.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: theme.colors.inkGray }}>{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ Social Proof ═══════════════ */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-3xl font-bold text-center mb-4"
            style={{ fontFamily: theme.typography.fontFamily.display, color: theme.colors.indigo }}
          >
            What Quilters Are Saying
          </h2>
          <p className="text-center mb-12 text-sm" style={{ color: theme.colors.inkLight }}>
            Beta feedback from early testers
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "I finally finished a pattern I'd been avoiding for months. The step-by-step view changed everything.",
                name: 'Sarah M.',
                detail: 'Quilting for 3 years',
              },
              {
                quote: "The AI explanations are like having a patient friend sitting next to my machine. No more Googling abbreviations.",
                name: 'Linda K.',
                detail: 'Longarm quilter',
              },
              {
                quote: "I prop my iPad up by my machine and just follow along. Big text, one step at a time. Exactly what I needed.",
                name: 'Diane R.',
                detail: 'Beginner quilter',
              },
            ].map((t, i) => (
              <div
                key={i}
                className="p-6 rounded-xl"
                style={{
                  backgroundColor: theme.colors.washi,
                  border: theme.borders.hairline,
                  backgroundImage: theme.textures.washiFiber,
                }}
              >
                <p className="leading-relaxed mb-4 italic" style={{ color: theme.colors.inkGray }}>&quot;{t.quote}&quot;</p>
                <div>
                  <p className="font-semibold text-sm" style={{ color: theme.colors.indigo }}>{t.name}</p>
                  <p className="text-xs" style={{ color: theme.colors.inkGray }}>{t.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA Band ═══════════════ */}
      <section
        className="py-16 px-6"
        style={{ backgroundColor: theme.colors.indigo }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <h2
            className="text-3xl font-bold mb-4"
            style={{ fontFamily: theme.typography.fontFamily.display, color: theme.colors.rice }}
          >
            Ready to read your next pattern?
          </h2>
          <p className="mb-8 text-lg" style={{ color: `${theme.colors.rice}bb` }}>
            Upload any PDF quilt pattern and start sewing with confidence.
          </p>
          <Link
            href="/reader"
            className="inline-flex items-center justify-center px-10 py-4 rounded-xl font-semibold text-lg transition-opacity hover:opacity-90 min-h-[56px]"
            style={{ backgroundColor: theme.colors.persimmon, color: theme.colors.rice, boxShadow: theme.shadows.lifted }}
          >
            Try It Now
          </Link>
        </div>
      </section>

      {/* ═══════════════ Pricing ═══════════════ */}
      <section id="pricing" className="py-20 px-6" style={{ backgroundColor: theme.colors.rice }}>
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-3xl font-bold text-center mb-4"
            style={{ fontFamily: theme.typography.fontFamily.display, color: theme.colors.indigo }}
          >
            Simple Pricing
          </h2>
          <p className="text-center mb-12 text-lg" style={{ color: theme.colors.inkGray }}>
            Start free. Upgrade when you need more.
          </p>

          {/* Comparison table — desktop */}
          <div className="hidden md:block max-w-3xl mx-auto mb-12">
            <div className="rounded-2xl overflow-hidden" style={{ border: `2px solid ${theme.colors.inkGray}20` }}>
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: theme.colors.indigo }}>
                    <th className="text-left px-6 py-4 font-semibold" style={{ color: theme.colors.rice }}>Feature</th>
                    <th className="text-center px-6 py-4 font-semibold" style={{ color: theme.colors.rice }}>Free</th>
                    <th className="text-center px-6 py-4 font-semibold" style={{ backgroundColor: theme.colors.persimmon, color: theme.colors.rice }}>Pro — $4.99/mo</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Pattern uploads', '3 per month', 'Unlimited'],
                    ['Step-by-step reader', '✓', '✓'],
                    ['Materials checklist', '✓', '✓'],
                    ['Progress saving', '✓', '✓'],
                    ['Font scaling (up to 3x)', '✓', '✓'],
                    ['AI clarifications', '10 per session', 'Unlimited'],
                    ['Priority parsing', '—', '✓'],
                    ['Advanced diagrams', '—', '✓'],
                  ].map(([feature, free, pro], i) => (
                    <tr
                      key={i}
                      style={{
                        backgroundColor: i % 2 === 0 ? theme.colors.rice : `${theme.colors.washi}80`,
                        borderTop: theme.borders.hairline,
                      }}
                    >
                      <td className="px-6 py-3 font-medium" style={{ color: theme.colors.inkBlack }}>{feature}</td>
                      <td className="px-6 py-3 text-center" style={{ color: theme.colors.inkGray }}>{free}</td>
                      <td className="px-6 py-3 text-center font-medium" style={{ color: theme.colors.indigo }}>{pro}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free tier */}
            <div
              className="rounded-2xl p-8"
              style={{ backgroundColor: theme.colors.rice, border: `2px solid ${theme.colors.inkGray}30`, boxShadow: theme.shadows.subtle }}
            >
              <h3 className="text-2xl font-bold mb-2" style={{ color: theme.colors.indigo }}>Free</h3>
              <p className="mb-6" style={{ color: theme.colors.inkGray }}>Perfect for trying it out</p>
              <div className="text-4xl font-bold mb-6" style={{ color: theme.colors.indigo }}>
                $0<span className="text-lg font-normal" style={{ color: theme.colors.inkGray }}>/mo</span>
              </div>
              <ul className="space-y-3 mb-8" style={{ color: theme.colors.inkGray }}>
                <li className="flex gap-2"><span style={{ color: theme.colors.sage }}>✓</span> 3 patterns per month</li>
                <li className="flex gap-2"><span style={{ color: theme.colors.sage }}>✓</span> Step-by-step reader</li>
                <li className="flex gap-2"><span style={{ color: theme.colors.sage }}>✓</span> Materials checklist</li>
                <li className="flex gap-2"><span style={{ color: theme.colors.sage }}>✓</span> Progress saving</li>
                <li className="flex gap-2"><span style={{ color: theme.colors.sage }}>✓</span> 10 AI clarifications per session</li>
                <li className="flex gap-2"><span style={{ color: theme.colors.inkLight }}>—</span> <span style={{ color: theme.colors.inkLight }}>No priority parsing</span></li>
              </ul>
              <Link
                href="/reader"
                className="block w-full py-3 min-h-[48px] text-center rounded-xl font-semibold transition-colors border-2 flex items-center justify-center"
                style={{ borderColor: theme.colors.indigo, color: theme.colors.indigo }}
              >
                Get Started Free
              </Link>
            </div>

            {/* Pro tier */}
            <div
              className="rounded-2xl p-8 relative overflow-hidden"
              style={{ backgroundColor: theme.colors.rice, border: `2px solid ${theme.colors.persimmon}`, boxShadow: theme.shadows.lifted }}
            >
              <div
                className="absolute top-0 right-0 text-xs font-bold px-3 py-1 rounded-bl-lg"
                style={{ backgroundColor: theme.colors.persimmon, color: theme.colors.rice }}
              >
                BEST VALUE
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: theme.colors.indigo }}>Pro</h3>
              <p className="mb-6" style={{ color: theme.colors.inkGray }}>Unlimited everything</p>
              <div className="text-4xl font-bold mb-1" style={{ color: theme.colors.indigo }}>
                $4.99<span className="text-lg font-normal" style={{ color: theme.colors.inkGray }}>/mo</span>
              </div>
              <p className="text-sm mb-6" style={{ color: theme.colors.inkLight }}>Cancel anytime</p>
              <ul className="space-y-3 mb-8" style={{ color: theme.colors.inkGray }}>
                <li className="flex gap-2"><span style={{ color: theme.colors.persimmon }}>✓</span> <strong>Unlimited patterns</strong></li>
                <li className="flex gap-2"><span style={{ color: theme.colors.persimmon }}>✓</span> <strong>Unlimited AI clarifications</strong></li>
                <li className="flex gap-2"><span style={{ color: theme.colors.persimmon }}>✓</span> <strong>Priority parsing</strong></li>
                <li className="flex gap-2"><span style={{ color: theme.colors.sage }}>✓</span> Step-by-step reader</li>
                <li className="flex gap-2"><span style={{ color: theme.colors.sage }}>✓</span> Materials checklist</li>
                <li className="flex gap-2"><span style={{ color: theme.colors.sage }}>✓</span> Advanced diagrams</li>
              </ul>
              <button
                onClick={handleUpgrade}
                disabled={isUpgrading}
                className="block w-full py-3 min-h-[48px] text-center rounded-xl font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: theme.colors.persimmon, color: theme.colors.rice }}
              >
                {isUpgrading ? 'Loading...' : 'Upgrade to Pro'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ Email Capture ═══════════════ */}
      <section className="py-20 px-6">
        <div className="max-w-xl mx-auto text-center">
          <h2
            className="text-2xl font-bold mb-4"
            style={{ fontFamily: theme.typography.fontFamily.display, color: theme.colors.indigo }}
          >
            Stay in the Loop
          </h2>
          <p className="mb-8" style={{ color: theme.colors.inkGray }}>
            New features, pattern tips, and quilting resources. No spam — we promise.
          </p>
          {submitted ? (
            <div
              className="p-4 rounded-xl font-medium"
              style={{ backgroundColor: `${theme.colors.sage}15`, color: theme.colors.sage }}
            >
              You&apos;re on the list. We&apos;ll be in touch.
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 px-4 py-3 min-h-[48px] rounded-xl focus:outline-none"
                style={{ border: `2px solid ${theme.colors.inkGray}30`, color: theme.colors.inkBlack }}
              />
              <button
                type="submit"
                className="px-6 py-3 min-h-[48px] rounded-xl font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: theme.colors.indigo, color: theme.colors.rice }}
              >
                Notify Me
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ═══════════════ Footer ═══════════════ */}
      <footer
        className="py-10 px-6"
        style={{ backgroundColor: theme.colors.indigo, borderTop: `1px solid ${theme.colors.inkGray}30` }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧵</span>
            <span className="font-medium" style={{ color: theme.colors.rice }}>Quiltographer</span>
          </div>
          <p className="text-sm text-center" style={{ color: `${theme.colors.rice}b3` }}>
            &copy; {new Date().getFullYear()} Humanity &amp; AI LLC —{' '}
            <a
              href="https://humanityandai.com"
              className="underline transition-opacity hover:opacity-80"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: `${theme.colors.rice}cc` }}
            >
              humanityandai.com
            </a>
          </p>
          <div className="flex gap-6 text-sm" style={{ color: `${theme.colors.rice}b3` }}>
            <Link href="/reader" className="hover:opacity-80 transition-opacity">Pattern Reader</Link>
            <Link href="/gallery" className="hover:opacity-80 transition-opacity">Gallery</Link>
            <Link href="/calculator" className="hover:opacity-80 transition-opacity">Calculator</Link>
            <a href="#pricing" className="hover:opacity-80 transition-opacity">Pricing</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
