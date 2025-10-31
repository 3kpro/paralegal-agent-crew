"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Step 1: Profile
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Update onboarding progress
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from("onboarding_progress")
          .update({
            profile_completed: true,
            completed: true,
            current_step: 4,
          })
          .eq("user_id", user.id);

        // Update profile
        await supabase
          .from("profiles")
          .update({ company_name: companyName })
          .eq("id", user.id);
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Onboarding error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-tron-dark via-tron-grid to-tron-dark flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-tron-text-muted">
              Step {step} of 2
            </span>
            <span className="text-sm text-tron-text-muted/80">
              Almost there!
            </span>
          </div>
          <div className="w-full bg-tron-grid rounded-full h-2 relative overflow-hidden">
            <div
              className="bg-tron-cyan h-full rounded-full transition-all duration-300 absolute top-0 left-0 progress-bar"
              style={{ "--progress-width": `${(step / 2) * 100}%` } as React.CSSProperties}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-tron-grid rounded-2xl shadow-xl p-8 border border-tron-cyan/30">
          {step === 1 && (
            <>
              <h1 className="text-2xl font-bold text-tron-text mb-2">
                Complete Your Profile
              </h1>
              <p className="text-tron-text-muted mb-6">
                Help us personalize your experience
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-tron-text-muted mb-2">
                    Company Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full h-12 px-4 bg-tron-dark border border-tron-grid rounded-lg focus:ring-2 focus:ring-tron-cyan focus:border-transparent text-tron-text"
                    placeholder="Acme Inc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-tron-text-muted mb-2">
                    Industry (Optional)
                  </label>
                  <select
                    id="industry-select"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    aria-label="Industry"
                    title="Select your industry"
                    className="w-full h-12 px-4 bg-tron-dark border border-tron-grid rounded-lg focus:ring-2 focus:ring-tron-cyan focus:border-transparent text-tron-text"
                  >
                    <option value="">Select industry...</option>
                    <option value="technology">Technology</option>
                    <option value="marketing">Marketing</option>
                    <option value="ecommerce">E-commerce</option>
                    <option value="education">Education</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="finance">Finance</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full h-14 bg-tron-cyan hover:bg-tron-cyan/80 text-white font-semibold rounded-lg transition-colors"
                >
                  Next: Connect Socials →
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="text-2xl font-bold text-tron-text mb-2">
                Connect Social Accounts
              </h1>
              <p className="text-tron-text-muted mb-6">
                Connect platforms to publish your content (you can skip this for
                now)
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => router.push("/api/auth/connect/twitter")}
                  className="h-16 border-2 border-tron-grid hover:border-tron-cyan rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <span className="text-2xl">🐦</span>
                  <span className="font-medium text-tron-text-muted">
                    Twitter
                  </span>
                </button>
                <button
                  onClick={() => router.push("/api/auth/connect/linkedin")}
                  className="h-16 border-2 border-tron-grid hover:border-tron-cyan rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <span className="text-2xl">💼</span>
                  <span className="font-medium text-tron-text-muted">
                    LinkedIn
                  </span>
                </button>
                <button
                  onClick={() => router.push("/api/auth/connect/facebook")}
                  className="h-16 border-2 border-tron-grid hover:border-tron-cyan rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <span className="text-2xl">📘</span>
                  <span className="font-medium text-tron-text-muted">
                    Facebook
                  </span>
                </button>
                <button
                  onClick={() => router.push("/api/auth/connect/instagram")}
                  className="h-16 border-2 border-tron-grid hover:border-tron-cyan rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <span className="text-2xl">📸</span>
                  <span className="font-medium text-tron-text-muted">
                    Instagram
                  </span>
                </button>
                <button
                  onClick={() => router.push("/api/auth/connect/tiktok")}
                  className="h-16 border-2 border-tron-grid hover:border-tron-cyan rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <span className="text-2xl">🎵</span>
                  <span className="font-medium text-tron-text-muted">
                    TikTok
                  </span>
                </button>
                <button
                  onClick={() => router.push("/api/auth/connect/reddit")}
                  className="h-16 border-2 border-tron-grid hover:border-tron-cyan rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <span className="text-2xl">🤖</span>
                  <span className="font-medium text-tron-text-muted">
                    Reddit
                  </span>
                </button>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="w-full h-14 bg-tron-cyan hover:bg-tron-cyan/80 disabled:bg-tron-cyan/40 text-white font-semibold rounded-lg transition-colors"
                >
                  {loading ? "Completing..." : "Complete Setup →"}
                </button>
                <button
                  onClick={handleComplete}
                  className="w-full h-12 text-tron-text-muted hover:text-tron-text font-medium transition-colors"
                >
                  Skip for now
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      
      <style jsx>{`
        :global(.progress-bar) {
          width: var(--progress-width);
        }
      `}</style>
    </div>
  );
}
