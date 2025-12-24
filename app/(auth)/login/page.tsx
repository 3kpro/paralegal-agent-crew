"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { trackLogin } from "@/lib/analytics";

import { BGPattern } from "@/components/ui/bg-pattern";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  // Load saved remember me preference
  useEffect(() => {
    const savedPreference = localStorage.getItem("rememberMe");
    if (savedPreference !== null) {
      setRememberMe(savedPreference === "true");
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Store remember me preference
      localStorage.setItem("rememberMe", rememberMe.toString());

      // If remember me is false, use sessionStorage for session-only persistence
      if (!rememberMe) {
        sessionStorage.setItem("tempSession", "true");
      } else {
        // Clear any temporary session flag
        sessionStorage.removeItem("tempSession");
      }

      // Track successful login
      trackLogin();

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google");
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] overflow-hidden flex items-center justify-center px-4">
      <BGPattern
        variant="dots"
        mask="fade-center"
        size={24}
        fill="rgba(255,255,255,0.15)"
        className="absolute inset-0 z-0 h-full w-full opacity-100"
        style={{ zIndex: 0 }}
      />
      <div className="relative z-10 max-w-md w-full">
        {/* Logo & Tagline */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-4">
            <span className="text-3xl font-bold text-white uppercase tracking-wider">
              XELORA
            </span>
          </Link>
          <p className="text-gray-300 mt-2">
            Predict Momentum. Engineer Virality.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#343a40] rounded-2xl shadow-xl p-8 border-2 border-gray-700/50">
          <h1 className="text-2xl font-bold text-white mb-6">
            Welcome back
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-12 px-4 bg-[#2b2b2b] border-2 border-gray-700/50 rounded-lg focus:ring-2 focus:ring-coral-500/50 focus:border-coral-500/50 focus:outline-none text-white placeholder-gray-400"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-12 px-4 bg-[#2b2b2b] border-2 border-gray-700/50 rounded-lg focus:ring-2 focus:ring-coral-500/50 focus:border-coral-500/50 focus:outline-none text-white placeholder-gray-400"
                placeholder="••••••••"
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-700 bg-[#2b2b2b] text-coral-500 focus:ring-2 focus:ring-coral-500/50 cursor-pointer"
                />
                <span className="text-sm text-gray-300">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-coral-500 hover:text-coral-400"
              >
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-coral-500 hover:bg-coral-600 disabled:bg-coral-500/50 text-white font-semibold rounded-lg transition-colors shadow-xl border-2 border-transparent hover:border-coral-400/50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-700/50"></div>
            <span className="px-4 text-sm text-gray-400">OR</span>
            <div className="flex-1 border-t border-gray-700/50"></div>
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            className="w-full h-12 border-2 border-gray-700/50 hover:border-coral-500/50 hover:bg-[#2b2b2b]/50 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-coral-500 hover:text-coral-400 font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
