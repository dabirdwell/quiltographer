'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isBeta, setIsBeta] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Check for beta pass
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
      // Store email locally for now; connect to email service in production
      const emails = JSON.parse(localStorage.getItem('quiltographer-waitlist') || '[]');
      emails.push({ email, date: new Date().toISOString() });
      localStorage.setItem('quiltographer-waitlist', JSON.stringify(emails));
      setSubmitted(true);
    }
  };

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      const response = await fetch('/api/stripe/checkout', { method: 'POST' });
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
          <Link
            href="/reader"
            className="px-5 py-2.5 bg-persimmon text-white rounded-lg font-medium hover:opacity-90 transition-opacity text-sm"
          >
            Open Pattern Reader
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-20 text-center">
        <h1
          className="text-5xl md:text-6xl font-bold text-indigo leading-tight mb-6"
          style={{ fontFamily: '"Noto Serif JP", Georgia, serif' }}
        >
          Finally understand<br />your quilt patterns.
        </h1>
        <p className="text-xl text-ink-gray max-w-2xl mx-auto mb-10 leading-relaxed">
          Upload any PDF pattern. Get clear, step-by-step instructions.
          Ask AI when you&apos;re confused.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/reader"
            className="px-8 py-4 bg-persimmon text-white rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg min-w-[200px] text-center"
          >
            Try It Free
          </Link>
          <a
            href="#pricing"
            className="px-8 py-4 border-2 border-indigo text-indigo rounded-xl font-semibold text-lg hover:bg-indigo hover:text-white transition-colors min-w-[200px] text-center"
          >
            See Pricing
          </a>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-indigo text-center mb-14" style={{ fontFamily: '"Noto Serif JP", Georgia, serif' }}>
            How It Works
          </h2>
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
                One clear step at a time. Large text, visual diagrams, progress tracking. Pick up where you left off.
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
          <h2 className="text-3xl font-bold text-indigo text-center mb-14" style={{ fontFamily: '"Noto Serif JP", Georgia, serif' }}>
            Built for Quilters
          </h2>
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

      {/* Pricing */}
      <section id="pricing" className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-indigo text-center mb-4" style={{ fontFamily: '"Noto Serif JP", Georgia, serif' }}>
            Simple Pricing
          </h2>
          <p className="text-ink-gray text-center mb-12 text-lg">
            Start free. Upgrade when you need more.
          </p>
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
                className="block w-full py-3 text-center border-2 border-indigo text-indigo rounded-xl font-semibold hover:bg-indigo hover:text-white transition-colors"
              >
                Get Started
              </Link>
            </div>

            {/* Pro tier */}
            <div className="border-2 border-persimmon rounded-2xl p-8 bg-white relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-persimmon text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                POPULAR
              </div>
              <h3 className="text-2xl font-bold text-indigo mb-2">Pro</h3>
              <p className="text-ink-gray mb-6">For serious quilters</p>
              <div className="text-4xl font-bold text-indigo mb-6">
                $4.99<span className="text-lg font-normal text-ink-gray">/mo</span>
              </div>
              <ul className="space-y-3 mb-8 text-ink-gray">
                <li className="flex gap-2"><span className="text-sage">✓</span> Unlimited patterns</li>
                <li className="flex gap-2"><span className="text-sage">✓</span> Step-by-step reader</li>
                <li className="flex gap-2"><span className="text-sage">✓</span> Materials checklist</li>
                <li className="flex gap-2"><span className="text-sage">✓</span> Progress saving</li>
                <li className="flex gap-2"><span className="text-persimmon">✓</span> <strong>Unlimited AI clarifications</strong></li>
              </ul>
              <button
                onClick={handleUpgrade}
                disabled={isUpgrading}
                className="block w-full py-3 text-center bg-persimmon text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isUpgrading ? 'Loading...' : 'Upgrade to Pro'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Email capture */}
      <section className="py-20 px-6">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-indigo mb-4" style={{ fontFamily: '"Noto Serif JP", Georgia, serif' }}>
            Get Notified
          </h2>
          <p className="text-ink-gray mb-8">
            Join the waitlist for new features and pattern tips.
          </p>
          {submitted ? (
            <div className="p-4 bg-sage/10 rounded-xl text-sage font-medium">
              Thank you! We&apos;ll be in touch.
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit} className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 px-4 py-3 rounded-xl border-2 border-ink-gray/20 focus:border-persimmon focus:outline-none text-ink-black"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-indigo text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
              >
                Notify Me
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-gray/20 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧵</span>
            <span className="text-indigo font-medium">Quiltographer</span>
          </div>
          <p className="text-ink-gray text-sm">
            Built by Humanity & AI LLC — humanityandai.com
          </p>
          <div className="flex gap-6 text-sm text-ink-gray">
            <Link href="/reader" className="hover:text-indigo transition-colors">Pattern Reader</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
