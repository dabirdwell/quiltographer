'use client';

import { useState, useEffect, useCallback } from 'react';

interface SubscriptionState {
  isPro: boolean;
  isBeta: boolean;
  isLoading: boolean;
  customerId: string | null;
}

const STORAGE_KEY = 'quiltographer-subscription';
const BETA_KEY = 'quiltographer-beta';

export function useSubscription() {
  const [state, setState] = useState<SubscriptionState>({
    isPro: false,
    isBeta: false,
    isLoading: true,
    customerId: null,
  });

  useEffect(() => {
    // Check beta pass
    const isBeta = localStorage.getItem(BETA_KEY) === 'true';

    // Check subscription from localStorage (set after successful checkout)
    const stored = localStorage.getItem(STORAGE_KEY);
    let isPro = false;
    let customerId: string | null = null;

    if (stored) {
      try {
        const sub = JSON.parse(stored);
        customerId = sub.customerId || null;
        // Check if subscription is still active (not expired)
        if (sub.status === 'pro' && sub.currentPeriodEnd) {
          isPro = new Date(sub.currentPeriodEnd) > new Date();
        }
      } catch {
        // Invalid stored data
      }
    }

    // Check URL for checkout success
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success' && !isPro) {
      // Mark as pro after successful checkout redirect
      isPro = true;
      const newSub = {
        status: 'pro',
        customerId: customerId,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        activatedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSub));

      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete('checkout');
      window.history.replaceState({}, '', url.toString());
    }

    setState({ isPro: isPro || isBeta, isBeta, isLoading: false, customerId });
  }, []);

  const hasFullAccess = state.isPro || state.isBeta;

  const openPortal = useCallback(async () => {
    if (!state.customerId) return;
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: state.customerId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Failed to open portal:', error);
    }
  }, [state.customerId]);

  const cancelSubscription = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(prev => ({ ...prev, isPro: false, customerId: null }));
  }, []);

  return {
    ...state,
    hasFullAccess,
    openPortal,
    cancelSubscription,
  };
}
