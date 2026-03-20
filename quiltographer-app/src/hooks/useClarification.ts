'use client';

import { useState, useCallback } from 'react';

interface UseClarificationOptions {
  apiEndpoint?: string;
}

interface ClarificationResult {
  clarification: string | null;
  isLoading: boolean;
  error: string | null;
  remaining: number | null;
  requestClarification: (instruction: string, context?: string) => Promise<string | null>;
  reset: () => void;
}

/**
 * useClarification - Hook for AI-powered step clarification
 * 
 * Calls Claude Haiku 4.5 to explain confusing quilt pattern instructions
 * in plain, accessible language.
 * 
 * Usage:
 * ```tsx
 * const { clarification, isLoading, requestClarification } = useClarification();
 * 
 * const handleConfused = async () => {
 *   await requestClarification(step.instruction);
 * };
 * ```
 */
export function useClarification(options: UseClarificationOptions = {}): ClarificationResult {
  const { apiEndpoint = '/api/clarify' } = options;

  const [clarification, setClarification] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);

  const requestClarification = useCallback(async (
    instruction: string,
    context?: string
  ): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Include session ID and pro status for rate limiting
      const isPro = typeof window !== 'undefined' && localStorage.getItem('quiltographer-beta') === 'true';
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-pro-user': isPro ? 'true' : 'false',
        },
        body: JSON.stringify({
          instruction,
          context,
        }),
      });

      if (response.status === 429) {
        const data = await response.json();
        setError(data.error || 'Rate limit reached');
        return null;
      }

      if (!response.ok) {
        throw new Error('Failed to get clarification');
      }

      const data = await response.json();
      setClarification(data.clarification);
      if (data.remaining !== undefined) setRemaining(data.remaining);
      return data.clarification;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [apiEndpoint]);

  const reset = useCallback(() => {
    setClarification(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    clarification,
    isLoading,
    error,
    remaining,
    requestClarification,
    reset,
  };
}

/**
 * Mock clarification for development without API
 * 
 * Simulates the AI response with realistic delay and content.
 * Remove this when real API is implemented.
 */
export function useMockClarification(): ClarificationResult {
  const [clarification, setClarification] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestClarification = useCallback(async (
    instruction: string,
    _context?: string
  ): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate a mock clarification based on common quilting terms
    const mockClarifications: Record<string, string> = {
      'RST': 'Place the two fabric pieces with their printed/colored sides facing each other (the sides you want to show on the finished quilt touching). This is called "Right Sides Together" and ensures your seams will be hidden on the inside.',
      'HST': 'A Half Square Triangle is made by sewing two squares together diagonally, then cutting apart to create two identical triangle-square units. Each finished unit is half one fabric, half another.',
      'WOF': 'Width of Fabric means cutting across the full width of your fabric (usually 42-44 inches from selvage to selvage). Your strip will be as long as your fabric is wide.',
      'default': `Let me explain this step more simply:\n\n${instruction}\n\nThis means you should take the pieces mentioned and join them together following the measurements given. If you're unsure about any specific technique mentioned, feel free to ask about it specifically!`,
    };
    
    // Check for known abbreviations
    let response = mockClarifications.default;
    for (const [abbr, explanation] of Object.entries(mockClarifications)) {
      if (instruction.toUpperCase().includes(abbr)) {
        response = explanation;
        break;
      }
    }
    
    setClarification(response);
    return response;
  }, []);

  const reset = useCallback(() => {
    setClarification(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    clarification,
    isLoading,
    error,
    remaining: null,
    requestClarification,
    reset,
  };
}

export default useClarification;
