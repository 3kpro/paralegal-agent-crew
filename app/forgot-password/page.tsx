"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const supabase = createClient();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setEmailSent(true);
      setMessage("Check your email for the password reset link!");
    } catch (err: any) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo & Tagline */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">3K</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              Content Cascade AI
            </span>
          </Link>
          <p className="text-gray-600 mt-2">Reset your password</p>
        </div>

        {/* Reset Password Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {emailSent ? "Email Sent!" : "Forgot Password?"}
          </h1>

          {emailSent ? (
            <div className="text-center">
              <div className="mb-6">
                <svg
                  className="w-16 h-16 text-green-500 mx-auto mb-4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p className="text-gray-600 text-lg">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Check your email and click the link to reset your password.
                  The link will expire in 24 hours.
                </p>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 mb-4">
                    Didn't receive the email? Check your spam folder or try
                    again.
                  </p>

                  <button
                    onClick={() => {
                      setEmailSent(false);
                      setMessage("");
                      setError("");
                    }}
                    className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-6">
                Enter your email address and we'll send you a link to reset your
                password.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {message && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">
                  {message}
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="you@example.com"
                  />
                </div>

                {/* Reset Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-lg transition-colors shadow-lg"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            </>
          )}

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-indigo-600 hover:text-indigo-500 text-sm font-medium flex items-center justify-center space-x-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M15 19l-7-7 7-7"></path>
              </svg>
              <span>Back to login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
