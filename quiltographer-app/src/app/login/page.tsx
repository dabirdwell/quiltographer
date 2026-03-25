"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [showEmail, setShowEmail] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/reader";

  async function handleGoogleSignIn() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    setErrorMessage("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });

      if (error) {
        setStatus("error");
        setErrorMessage(error.message);
      } else {
        setStatus("sent");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#264653]">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#e76f51]"
            style={{ boxShadow: "0 2px 8px rgba(231, 111, 81, 0.3)" }}
          >
            <span className="font-bold text-lg text-white">Q</span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            Sign in to Quiltographer
          </h1>
          <p className="text-sm text-gray-300">
            Your AI-powered pattern reader
          </p>
        </div>

        {status === "sent" ? (
          /* Success state */
          <div className="rounded-xl p-6 text-center space-y-3 bg-[#2a5a6e] border border-[#3a6a7e]">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto bg-[#e76f51]/20">
              <svg
                className="w-6 h-6 text-[#e76f51]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-base font-medium text-white">
              Check your email for a login link
            </p>
            <p className="text-sm text-gray-300">
              We sent a magic link to{" "}
              <span className="font-medium text-[#e9c46a]">{email}</span>
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Google Sign-In */}
            <button
              onClick={handleGoogleSignIn}
              className="flex items-center justify-center gap-3 w-full py-3 rounded-xl font-medium text-base cursor-pointer transition-all duration-200 bg-white text-gray-800 hover:bg-gray-50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#3a6a7e]" />
              <span className="text-xs text-gray-400">or</span>
              <div className="flex-1 h-px bg-[#3a6a7e]" />
            </div>

            {/* Email sign-in */}
            {!showEmail ? (
              <button
                onClick={() => setShowEmail(true)}
                className="w-full py-3 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 bg-transparent border border-[#3a6a7e] text-gray-300 hover:border-gray-400"
              >
                Sign in with email
              </button>
            ) : (
              <form onSubmit={handleEmailSubmit} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoFocus
                  className="w-full rounded-xl px-4 py-3 text-[15px] outline-none bg-[#2a5a6e] border border-[#3a6a7e] text-white placeholder-gray-400 focus:border-[#e76f51]"
                />
                {status === "error" && (
                  <p className="text-sm text-red-400">{errorMessage}</p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 bg-[#e76f51] text-white border-none disabled:opacity-70 disabled:cursor-wait hover:bg-[#d65f43]"
                >
                  {status === "loading" ? "Sending..." : "Send Magic Link"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Bottom links */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-400">
            Free to start. No credit card needed.
          </p>
          <Link
            href="/"
            className="inline-block text-sm text-gray-300 hover:text-white transition-colors"
          >
            &larr; Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#264653]">
        <div className="w-8 h-8 border-2 border-[#e76f51] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
