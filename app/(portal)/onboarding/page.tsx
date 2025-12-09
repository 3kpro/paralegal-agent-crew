"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import InterestSelection, { type Interest } from "@/components/onboarding/InterestSelection";
import TrendingTopicsPreview from "@/components/onboarding/TrendingTopicsPreview";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Step 1: Interest Selection
  const [selectedInterests, setSelectedInterests] = useState<Interest[]>([]);

  // Step 3: Profile
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

        // Update profile with interests and company info
        await supabase
          .from("profiles")
          .update({
            company_name: companyName,
            interests: selectedInterests.map((i) => i.id), // Store interest IDs as array
          })
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
    <div className="min-h-screen bg-[#0A0F1F] flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-300">
              Step {step} of 4
            </span>
            <span className="text-sm text-gray-400">
              {step === 4 ? "Almost there!" : "Setting up your account"}
            </span>
          </div>
          <div className="w-full bg-gray-700/50 rounded-full h-2 relative overflow-hidden">
            <div
              className="bg-[#00C7F2] h-full rounded-full transition-all duration-300 absolute top-0 left-0"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-[#1a2030] rounded-2xl shadow-xl p-8 border-2 border-[#00C7F2]/30">
          {/* Step 1: Interest Selection */}
          {step === 1 && (
            <InterestSelection
              onNext={(interests) => {
                setSelectedInterests(interests);
                setStep(2);
              }}
            />
          )}

          {/* Step 2: Trending Topics Preview */}
          {step === 2 && (
            <TrendingTopicsPreview
              selectedInterests={selectedInterests}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}

          {/* Step 3: Complete Profile */}
          {step === 3 && (
            <>
              <h1 className="text-2xl font-bold text-white mb-2">
                Complete Your Profile
              </h1>
              <p className="text-gray-400 mb-6">
                Help us personalize your experience
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Company Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full h-12 px-4 bg-[#0F1628] border border-[#00C7F2]/30 rounded-lg focus:ring-2 focus:ring-[#00C7F2] focus:border-transparent text-white"
                    placeholder="Acme Inc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Industry (Optional)
                  </label>
                  <select
                    id="industry-select"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    aria-label="Industry"
                    title="Select your industry"
                    className="w-full h-12 px-4 bg-[#0F1628] border border-[#00C7F2]/30 rounded-lg focus:ring-2 focus:ring-[#00C7F2] focus:border-transparent text-white"
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
                  onClick={() => setStep(4)}
                  className="w-full h-14 bg-[#00C7F2] hover:bg-[#A17CF9] text-[#0A0F1F] font-semibold rounded-lg transition-colors uppercase tracking-wide"
                >
                  Next: Connect Socials →
                </button>
              </div>
            </>
          )}

          {/* Step 4: Connect Social Accounts */}
          {step === 4 && (
            <>
              <h1 className="text-2xl font-bold text-white mb-2">
                Connect Social Accounts
              </h1>
              <p className="text-gray-400 mb-6">
                Connect platforms to publish your content (you can skip this for
                now)
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => router.push("/api/auth/connect/twitter")}
                  className="h-16 border-2 border-gray-700 hover:border-[#00C7F2] rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <span className="text-2xl">🐦</span>
                  <span className="font-medium text-gray-300">
                    Twitter
                  </span>
                </button>
                <button
                  onClick={() => router.push("/api/auth/connect/linkedin")}
                  className="h-16 border-2 border-gray-700 hover:border-[#00C7F2] rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <span className="text-2xl">💼</span>
                  <span className="font-medium text-gray-300">
                    LinkedIn
                  </span>
                </button>
                <button
                  onClick={() => router.push("/api/auth/connect/facebook")}
                  className="h-16 border-2 border-gray-700 hover:border-[#00C7F2] rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <span className="text-2xl">📘</span>
                  <span className="font-medium text-gray-300">
                    Facebook
                  </span>
                </button>
                <button
                  onClick={() => router.push("/api/auth/connect/instagram")}
                  className="h-16 border-2 border-gray-700 hover:border-[#00C7F2] rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <span className="text-2xl">📸</span>
                  <span className="font-medium text-gray-300">
                    Instagram
                  </span>
                </button>
                <button
                  onClick={() => router.push("/api/auth/connect/tiktok")}
                  className="h-16 border-2 border-gray-700 hover:border-[#00C7F2] rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <span className="text-2xl">🎵</span>
                  <span className="font-medium text-gray-300">
                    TikTok
                  </span>
                </button>
                <button
                  onClick={() => router.push("/api/auth/connect/reddit")}
                  className="h-16 border-2 border-gray-700 hover:border-[#00C7F2] rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <span className="text-2xl">🤖</span>
                  <span className="font-medium text-gray-300">
                    Reddit
                  </span>
                </button>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="w-full h-14 bg-[#00C7F2] hover:bg-[#A17CF9] disabled:bg-[#00C7F2]/40 text-[#0A0F1F] font-semibold rounded-lg transition-colors uppercase tracking-wide"
                >
                  {loading ? "Completing..." : "Complete Setup →"}
                </button>
                <button
                  onClick={handleComplete}
                  className="w-full h-12 text-gray-400 hover:text-white font-medium transition-colors"
                >
                  Skip for now
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
