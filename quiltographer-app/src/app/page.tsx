'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const SAMPLE_PATTERNS = [
  {
    name: 'Log Cabin Classic',
    difficulty: 'Beginner',
    steps: 8,
    thumbnail: '🏠',
    desc: 'The timeless log cabin — strips around a center square. A perfect first quilt.',
  },
  {
    name: 'Flying Geese Table Runner',
    difficulty: 'Intermediate',
    steps: 12,
    thumbnail: '🪿',
    desc: 'A flock of flying geese marching across your table. Strip piecing makes it fast.',
  },
  {
    name: 'Nine-Patch Baby Quilt',
    difficulty: 'Beginner',
    steps: 6,
    thumbnail: '👶',
    desc: 'Nine squares, endless charm. Quick enough to finish before the baby arrives.',
  },
  {
    name: 'Lone Star Wall Hanging',
    difficulty: 'Advanced',
    steps: 18,
    thumbnail: '⭐',
    desc: 'Eight diamond points radiate from the center. Precision cutting pays off here.',
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
    <div className="min-h-screen" style={{ backgroundColor: '#fdf4e3' }}>
      {/* Beta banner */}
      {isBeta && (
        <div className="bg-sage text-white text-center py-2 text-sm font-medium">
          Beta Pass Active — Full access unlocked
        </div>
      )}

      {/* Navigation */}
      <nav className="max-w-6xl mx-auto px-6 py-5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🧵</span>
          <span className="text-2xl font-semibold text-indigo tracking-tight" style={{ fontFamily: '"Noto Serif JP", Georgia, serif' }}>
            Quiltographer
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#pricing" className="hidden sm:inline text-ink-gray hover:text-indigo transition-colors text-sm font-medium">
            Pricing
          </a>
          <Link
            href="/reader"
            className="px-5 py-2.5 bg-persimmon text-white rounded-lg font-medium hover:opacity-90 transition-opacity text-sm min-h-[44px] flex items-center"
          >
            Open Reader
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-12 sm:pt-20 pb-16 sm:pb-24 text-center">
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-bold text-indigo leading-tight mb-6"
          style={{ fontFamily: '"Noto Serif JP", Georgia, serif' }}
        >
          Upload a pattern.<br />Understand every step.
        </h1>
        <p className="text-lg sm:text-xl text-ink-gray max-w-2xl mx-auto mb-10 leading-relaxed">
          Drop any PDF quilt pattern. Get one clear instruction at a time,
          readable from your sewing machine. When the jargon gets thick,
          ask AI — it speaks quilter.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/reader"
            className="w-full sm:w-auto px-8 py-4 bg-persimmon text-white rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg min-w-[220px] min-h-[56px] text-center flex items-center justify-center"
          >
            Upload a Pattern — Free
          </Link>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto px-8 py-4 border-2 border-indigo text-indigo rounded-xl font-semibold text-lg hover:bg-indigo hover:text-white transition-colors min-w-[220px] min-h-[56px] text-center flex items-center justify-center"
          >
            See How It Works
          </a>
        </div>
      </section>

      {/* Demo preview */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <div className="rounded-2xl overflow-hidden shadow-lifted bg-white border border-ink-gray/10">
          <div className="bg-indigo/5 px-6 py-4 border-b border-ink-gray/10 flex items-center gap-3">
            <span className="text-xl">🧵</span>
            <span className="font-semibold text-indigo text-sm">Pattern Reader</span>
            <span className="text-ink-gray text-sm ml-auto">Step 3 of 12</span>
          </div>
          <div className="p-6 sm:p-8">
            <p className="text-sm text-ink-gray uppercase tracking-wider mb-1">Step 3 of 12</p>
            <h3 className="text-xl font-bold text-indigo mb-4">Sew Strip Sets</h3>
            <p className="text-ink-gray leading-relaxed mb-4">
              Sew (2) 2&frac12;&quot; x Width of Fabric (WOF) Fabric A strips and (1) 2&frac12;&quot; x WOF Fabric B strip together along the long edges, with Right Sides Together (RST). Press seams toward the darker fabric.
            </p>
            <div className="flex gap-2 flex-wrap">
              <span className="px-3 py-1 bg-indigo/10 text-indigo rounded-full text-xs font-medium">strip piecing</span>
              <span className="px-3 py-1 bg-indigo/10 text-indigo rounded-full text-xs font-medium">pressing</span>
            </div>
            <div className="mt-4 p-3 bg-sage/10 rounded-lg text-sm text-sage flex gap-2">
              <span>🤖</span>
              <span className="italic">&quot;Place your strips with the pretty sides kissing, sew along the long edge with a &frac14;&quot; seam, then press flat...&quot;</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-indigo text-center mb-4" style={{ fontFamily: '"Noto Serif JP", Georgia, serif' }}>
            How It Works
          </h2>
          <p className="text-ink-gray text-center mb-14 text-lg max-w-2xl mx-auto">
            Three steps between you and finally understanding that pattern.
          </p>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="w-16 h-16 bg-persimmon/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <span className="text-3xl">📄</span>
              </div>
              <h3 className="text-xl font-semibold text-indigo mb-3">1. Upload Your Pattern</h3>
              <p className="text-ink-gray leading-relaxed">
                Drop any PDF quilt pattern. We extract steps, materials, and measurements automatically.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-sage/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <span className="text-3xl">📖</span>
              </div>
              <h3 className="text-xl font-semibold text-indigo mb-3">2. Follow Step by Step</h3>
              <p className="text-ink-gray leading-relaxed">
                One clear instruction at a time. Large text, progress tracking. Pick up where you left off.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <span className="text-3xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold text-indigo mb-3">3. Ask When Confused</h3>
              <p className="text-ink-gray leading-relaxed">
                Hit &quot;Explain this step&quot; and get a plain-English rewrite from AI that knows quilting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-indigo text-center mb-4" style={{ fontFamily: '"Noto Serif JP", Georgia, serif' }}>
            Built for Quilters
          </h2>
          <p className="text-ink-gray text-center mb-14 text-lg">
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
                icon: '🎯',
                title: 'One Step at a Time',
                desc: 'No more scrolling through 12 pages. One instruction, front and center.',
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
            ].map((feature, i) => (
              <div
                key={i}
                className="flex gap-4 p-5 rounded-xl bg-white shadow-subtle"
              >
                <span className="text-2xl flex-shrink-0 mt-1">{feature.icon}</span>
                <div>
                  <h3 className="font-semibold text-indigo text-lg mb-1">{feature.title}</h3>
                  <p className="text-ink-gray text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample patterns */}
      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-indigo text-center mb-4" style={{ fontFamily: '"Noto Serif JP", Georgia, serif' }}>
            Try These Examples
          </h2>
          <p className="text-ink-gray text-center mb-12 text-lg">
            See how Quiltographer handles real patterns. Upload your own or start with one of these.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SAMPLE_PATTERNS.map((pattern, i) => (
              <Link
                key={i}
                href="/reader"
                className="group block p-5 rounded-xl border-2 border-ink-gray/10 hover:border-persimmon/50 transition-colors bg-washi"
              >
                <div className="text-4xl mb-3">{pattern.thumbnail}</div>
                <h3 className="font-semibold text-indigo group-hover:text-persimmon transition-colors mb-1">
                  {pattern.name}
                </h3>
                <div className="flex gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo/10 text-indigo">{pattern.difficulty}</span>
                  <span className="text-xs text-ink-gray">{pattern.steps} steps</span>
                </div>
                <p className="text-ink-gray text-sm leading-relaxed">{pattern.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-indigo text-center mb-4" style={{ fontFamily: '"Noto Serif JP", Georgia, serif' }}>
            Simple Pricing
          </h2>
          <p className="text-ink-gray text-center mb-12 text-lg">
            Start free. Upgrade when you need more.
          </p>

          {/* Comparison table — desktop */}
          <div className="hidden md:block max-w-3xl mx-auto mb-12">
            <div className="rounded-2xl overflow-hidden border-2 border-ink-gray/10">
              <table className="w-full">
                <thead>
                  <tr className="bg-indigo text-white">
                    <th className="text-left px-6 py-4 font-semibold">Feature</th>
                    <th className="text-center px-6 py-4 font-semibold">Free</th>
                    <th className="text-center px-6 py-4 font-semibold bg-persimmon">Pro — $4.99/mo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-gray/10">
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
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-washi/50'}>
                      <td className="px-6 py-3 text-ink-black font-medium">{feature}</td>
                      <td className="px-6 py-3 text-center text-ink-gray">{free}</td>
                      <td className="px-6 py-3 text-center text-indigo font-medium">{pro}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing cards — all screens */}
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free tier */}
            <div className="border-2 border-ink-gray/20 rounded-2xl p-8 bg-white">
              <h3 className="text-2xl font-bold text-indigo mb-2">Free</h3>
              <p className="text-ink-gray mb-6">Perfect for trying it out</p>
              <div className="text-4xl font-bold text-indigo mb-6">
                $0<span className="text-lg font-normal text-ink-gray">/mo</span>
              </div>
              <ul className="space-y-3 mb-8 text-ink-gray">
                <li className="flex gap-2"><span className="text-sage">✓</span> 3 patterns per month</li>
                <li className="flex gap-2"><span className="text-sage">✓</span> Step-by-step reader</li>
                <li className="flex gap-2"><span className="text-sage">✓</span> Materials checklist</li>
                <li className="flex gap-2"><span className="text-sage">✓</span> Progress saving</li>
                <li className="flex gap-2"><span className="text-ink-light">—</span> <span className="text-ink-light">Limited AI clarifications</span></li>
              </ul>
              <Link
                href="/reader"
                className="block w-full py-3 min-h-[48px] text-center border-2 border-indigo text-indigo rounded-xl font-semibold hover:bg-indigo hover:text-white transition-colors flex items-center justify-center"
              >
                Get Started Free
              </Link>
            </div>

            {/* Pro tier */}
            <div className="border-2 border-persimmon rounded-2xl p-8 bg-white relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-persimmon text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                RECOMMENDED
              </div>
              <h3 className="text-2xl font-bold text-indigo mb-2">Pro</h3>
              <p className="text-ink-gray mb-6">Unlimited everything</p>
              <div className="text-4xl font-bold text-indigo mb-6">
                $4.99<span className="text-lg font-normal text-ink-gray">/mo</span>
              </div>
              <ul className="space-y-3 mb-8 text-ink-gray">
                <li className="flex gap-2"><span className="text-persimmon">✓</span> <strong>Unlimited patterns</strong></li>
                <li className="flex gap-2"><span className="text-persimmon">✓</span> <strong>Unlimited AI clarifications</strong></li>
                <li className="flex gap-2"><span className="text-sage">✓</span> Step-by-step reader</li>
                <li className="flex gap-2"><span className="text-sage">✓</span> Materials checklist</li>
                <li className="flex gap-2"><span className="text-sage">✓</span> Priority parsing</li>
              </ul>
              <button
                onClick={handleUpgrade}
                disabled={isUpgrading}
                className="block w-full py-3 min-h-[48px] text-center bg-persimmon text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isUpgrading ? 'Loading...' : 'Upgrade to Pro'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials placeholder */}
      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-indigo text-center mb-12" style={{ fontFamily: '"Noto Serif JP", Georgia, serif' }}>
            What Quilters Are Saying
          </h2>
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
              <div key={i} className="p-6 rounded-xl bg-washi border border-ink-gray/10">
                <p className="text-ink-gray leading-relaxed mb-4 italic">&quot;{t.quote}&quot;</p>
                <div>
                  <p className="font-semibold text-indigo text-sm">{t.name}</p>
                  <p className="text-ink-gray text-xs">{t.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-ink-light text-sm mt-8">
            Beta feedback from early testers. Join them — it&apos;s free to start.
          </p>
        </div>
      </section>

      {/* Email capture */}
      <section className="py-20 px-6">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-indigo mb-4" style={{ fontFamily: '"Noto Serif JP", Georgia, serif' }}>
            Stay in the Loop
          </h2>
          <p className="text-ink-gray mb-8">
            New features, pattern tips, and quilting resources. No spam — we promise.
          </p>
          {submitted ? (
            <div className="p-4 bg-sage/10 rounded-xl text-sage font-medium">
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
                className="flex-1 px-4 py-3 min-h-[48px] rounded-xl border-2 border-ink-gray/20 focus:border-persimmon focus:outline-none text-ink-black"
              />
              <button
                type="submit"
                className="px-6 py-3 min-h-[48px] bg-indigo text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
              >
                Notify Me
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-gray/20 py-10 px-6" style={{ backgroundColor: '#264653' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧵</span>
            <span className="text-white font-medium">Quiltographer</span>
          </div>
          <p className="text-white/70 text-sm text-center">
            &copy; {new Date().getFullYear()} Humanity &amp; AI LLC —{' '}
            <a href="https://humanityandai.com" className="underline hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
              humanityandai.com
            </a>
          </p>
          <div className="flex gap-6 text-sm text-white/70">
            <Link href="/reader" className="hover:text-white transition-colors">Pattern Reader</Link>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
