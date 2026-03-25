"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const BETA_KEY = "quiltographer_beta_pass";
const BETA_CODE = "quilt2026";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for beta pass in URL or localStorage
    const urlBeta = searchParams.get("beta");
    if (urlBeta === BETA_CODE) {
      localStorage.setItem(BETA_KEY, "true");
      document.cookie = `${BETA_KEY}=true; path=/; max-age=2592000`; // 30 days
    }
    const hasBetaPass =
      urlBeta === BETA_CODE ||
      (typeof window !== "undefined" && localStorage.getItem(BETA_KEY) === "true");

    if (hasBetaPass) {
      setIsAuthenticated(true);
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    async function checkAuth() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          setIsAuthenticated(true);
        } else {
          // Preserve current path so user returns here after login
          const returnPath = window.location.pathname + window.location.search;
          router.replace(`/login?next=${encodeURIComponent(returnPath)}`);
        }
      } catch {
        router.replace("/login");
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setIsAuthenticated(false);
        router.replace("/login");
      } else {
        setIsAuthenticated(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, searchParams]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#264653]">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-8 h-8 border-2 border-[#e76f51] border-t-transparent rounded-full animate-spin"
            role="status"
            aria-label="Loading"
          />
          <p className="text-gray-400 text-sm">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
