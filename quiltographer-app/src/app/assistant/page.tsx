'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { quiltographerTheme } from '@/components/japanese/theme';
import { Text, Stack, Surface, Button } from '@/components/ui';
import type { ReaderPattern } from '@/lib/reader/schema';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED_QUESTIONS = [
  'Is this pattern good for a beginner?',
  'What tools do I need?',
  'How much fabric do I need total?',
  'What does step 1 mean?',
  'What techniques are used?',
  'Any tips before I start?',
];

export default function PatternAssistantPage() {
  const [pattern, setPattern] = useState<ReaderPattern | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load pattern from localStorage on mount
  useEffect(() => {
    try {
      // Check URL params for a specific pattern session
      const params = new URLSearchParams(window.location.search);
      const fileName = params.get('pattern');

      // Try loading from session storage (set by reader page)
      const assistantPatternRaw = sessionStorage.getItem('quiltographer-assistant-pattern');
      if (assistantPatternRaw) {
        const parsed = JSON.parse(assistantPatternRaw) as ReaderPattern;
        setPattern(parsed);
        return;
      }

      // Fallback: find from pattern sessions in localStorage
      const prefix = 'quiltographer-pattern-session:';
      let latest: { pattern: ReaderPattern; lastAccessed: string } | null = null;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith(prefix)) continue;
        if (fileName && !key.endsWith(fileName)) continue;

        const raw = localStorage.getItem(key);
        if (!raw) continue;

        const session = JSON.parse(raw);
        if (!latest || session.lastAccessed > latest.lastAccessed) {
          latest = session;
        }
      }

      if (latest) {
        setPattern(latest.pattern);
      }
    } catch (e) {
      console.warn('Failed to load pattern for assistant:', e);
    }
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load sample patterns for demo
  const loadDemoPattern = useCallback(async () => {
    try {
      const res = await fetch('/sample-patterns/log-cabin-classic.json');
      if (res.ok) {
        const data = await res.json();
        setPattern(data);
        sessionStorage.setItem('quiltographer-assistant-pattern', JSON.stringify(data));
      }
    } catch {
      setError('Failed to load demo pattern');
    }
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !pattern || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const sessionId = `assistant-${pattern.id || 'unknown'}`;
      const res = await fetch('/api/pattern-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
        body: JSON.stringify({
          message: text.trim(),
          history: messages.slice(-10),
          pattern,
        }),
      });

      if (res.status === 429) {
        setError('Message limit reached. Upgrade to Pro for unlimited assistant access.');
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to get response');
      }

      const data = await res.json();
      const assistantMessage: ChatMessage = { role: 'assistant', content: data.reply };
      setMessages(prev => [...prev, assistantMessage]);
      if (data.remaining !== undefined) {
        setRemaining(data.remaining);
      }
    } catch {
      setError('Failed to get a response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [pattern, isLoading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const theme = quiltographerTheme;

  // No pattern loaded state
  if (!pattern) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: theme.colors.washi }}
      >
        <Surface variant="rice" elevated rounded padding="lg" className="max-w-md w-full text-center">
          <Stack gap="md">
            <Text as="h1" size="2xl" weight="bold" color="indigo">
              Pattern Assistant
            </Text>
            <Text color="muted">
              No pattern loaded. Upload and parse a pattern in the{' '}
              <a href="/reader" style={{ color: theme.colors.persimmon, textDecoration: 'underline' }}>
                Pattern Reader
              </a>{' '}
              first, then come back to ask questions about it.
            </Text>
            <div style={{ borderTop: theme.borders.hairline, paddingTop: '1rem' }}>
              <Text size="sm" color="faint" className="mb-3">Or try with a demo pattern:</Text>
              <Button variant="outline" color="persimmon" onClick={loadDemoPattern}>
                Load Demo Pattern
              </Button>
            </div>
          </Stack>
        </Surface>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: theme.colors.washi }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-10 border-b"
        style={{
          backgroundColor: theme.colors.indigo,
          borderColor: 'rgba(255,255,255,0.1)',
        }}
      >
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a
              href="/reader"
              className="text-white/70 hover:text-white transition-colors text-sm"
              title="Back to Reader"
            >
              ← Reader
            </a>
            <div
              className="w-px h-5"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            />
            <div>
              <h1 className="text-white font-semibold text-base leading-tight">
                Pattern Assistant
              </h1>
              <p className="text-white/60 text-xs truncate max-w-[200px] sm:max-w-none">
                {pattern.name}
              </p>
            </div>
          </div>
          {remaining !== null && remaining < 10 && (
            <span className="text-white/50 text-xs">
              {remaining} messages left
            </span>
          )}
        </div>
      </header>

      {/* Chat area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Welcome message */}
          {messages.length === 0 && (
            <div className="mb-6">
              <Surface variant="rice" rounded border padding="md">
                <Stack gap="sm">
                  <Text weight="semibold" color="indigo">
                    Ask me anything about &ldquo;{pattern.name}&rdquo;
                  </Text>
                  <Text size="sm" color="muted">
                    I&apos;ve read the full pattern — {pattern.steps?.length || 0} steps,{' '}
                    {pattern.materials?.length || 0} materials, and all cutting instructions.
                    Ask about specific steps, fabric amounts, techniques, or anything else!
                  </Text>
                </Stack>
              </Surface>

              {/* Suggested questions */}
              <div className="mt-4 flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-sm px-3 py-1.5 rounded-full border transition-colors"
                    style={{
                      borderColor: theme.colors.persimmon + '40',
                      color: theme.colors.persimmon,
                      backgroundColor: theme.colors.rice,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.persimmon + '10';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.rice;
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className="max-w-[85%] sm:max-w-[75%] rounded-xl px-4 py-3"
                style={
                  msg.role === 'user'
                    ? {
                        backgroundColor: theme.colors.indigo,
                        color: theme.colors.rice,
                      }
                    : {
                        backgroundColor: theme.colors.rice,
                        border: theme.borders.subtle,
                        color: theme.colors.inkBlack,
                      }
                }
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </p>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="mb-4 flex justify-start">
              <div
                className="rounded-xl px-4 py-3"
                style={{
                  backgroundColor: theme.colors.rice,
                  border: theme.borders.subtle,
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-gray-400">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              className="mb-4 rounded-lg px-4 py-3 text-sm"
              style={{
                backgroundColor: '#fef2f2',
                color: '#991b1b',
                border: '1px solid #fecaca',
              }}
            >
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input area */}
      <footer
        className="sticky bottom-0 border-t"
        style={{
          backgroundColor: theme.colors.rice,
          borderColor: 'rgba(0,0,0,0.1)',
        }}
      >
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about this pattern..."
              rows={1}
              className="flex-1 resize-none rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-shadow"
              style={{
                borderColor: 'rgba(0,0,0,0.15)',
                backgroundColor: theme.colors.washi,
                color: theme.colors.inkBlack,
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.colors.persimmon}40`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
              disabled={isLoading}
            />
            <Button
              variant="primary"
              color="persimmon"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
            >
              {isLoading ? '...' : 'Send'}
            </Button>
          </div>
          <p className="text-xs mt-2" style={{ color: theme.colors.inkLight }}>
            Press Enter to send. Shift+Enter for a new line.
          </p>
        </div>
      </footer>
    </div>
  );
}
