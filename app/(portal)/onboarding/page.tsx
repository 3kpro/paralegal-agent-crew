"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Music,
  MessageCircle,
} from "lucide-react";
import InterestSelection, { type Interest } from "@/components/onboarding/InterestSelection";
import TrendingTopicsPreview from "@/components/onboarding/TrendingTopicsPreview";

interface ValuePropSlide {
  text: string;
  subtext: string;
}

const valuePropSlides: ValuePropSlide[] = [
  {
    text: "Know what will go viral.",
    subtext: "Before you hit publish.",
  },
  {
    text: "XELORA gives every post a Viral Score™.",
    subtext: "0-100. 87% accurate. 2 seconds.",
  },
  {
    text: "Find trending topics across all platforms.",
    subtext: "Twitter. Reddit. TikTok. LinkedIn. All in one place.",
  },
  {
    text: "AI generates content for you.",
    subtext: "Platform-optimized. Engagement-focused.",
  },
  {
    text: "Ready?",
    subtext: "Let's set up your account in 2 minutes.",
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0); // Start at 0 for value prop intro
  const [valueSlideIndex, setValueSlideIndex] = useState(0);
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
        {/* Step 0: Value Prop Intro (WelcomeAnimation hooks) */}
        {step === 0 && (
          <div className="relative">
            {/* Animated background */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 welcome-grid-background" />
            </div>

            {/* Skip button */}
            <button
              onClick={() => setStep(1)}
              className="absolute top-0 right-0 text-gray-400 hover:text-[#00C7F2] transition-colors text-sm z-10"
            >
              Skip →
            </button>

            {/* Value prop slides */}
            <div className="relative min-h-[500px] flex flex-col items-center justify-center text-center px-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={valueSlideIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.0 }}
                  className="space-y-6"
                >
                  {/* Main text */}
                  <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight">
                    {valuePropSlides[valueSlideIndex].text}
                  </h1>

                  {/* Subtext */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 1.0 }}
                    className="text-xl md:text-2xl text-[#00C7F2] font-light"
                  >
                    {valuePropSlides[valueSlideIndex].subtext}
                  </motion.p>

                  {/* Continue button (only on last slide) */}
                  {valueSlideIndex === valuePropSlides.length - 1 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.2, duration: 0.5 }}
                      className="pt-8"
                    >
                      <button
                        onClick={() => setStep(1)}
                        className="px-12 py-4 bg-gradient-to-r from-[#00C7F2] to-blue-500 text-white text-lg font-semibold rounded-lg hover:shadow-2xl hover:shadow-[#00C7F2]/40 hover:scale-105 transition-all"
                      >
                        Let's Get Started →
                      </button>
                    </motion.div>
                  )}

                  {/* Next slide button (not on last slide) */}
                  {valueSlideIndex < valuePropSlides.length - 1 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.5, duration: 0.5 }}
                      className="pt-8"
                    >
                      <button
                        onClick={() => setValueSlideIndex(valueSlideIndex + 1)}
                        className="text-[#00C7F2] hover:text-white transition-colors text-sm"
                      >
                        Next →
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Progress dots */}
              <motion.div
                className="flex justify-center gap-2 mt-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {valuePropSlides.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      index === valueSlideIndex
                        ? "w-8 bg-[#00C7F2]"
                        : index < valueSlideIndex
                          ? "w-1.5 bg-[#00C7F2]/50"
                          : "w-1.5 bg-gray-700"
                    }`}
                  />
                ))}
              </motion.div>
            </div>

            {/* Decorative elements */}
            <motion.div
              className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#00C7F2]/5 rounded-full blur-3xl pointer-events-none"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.5, 0.3, 0.5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2,
              }}
            />
          </div>
        )}

        {/* Progress bar (Steps 1-4) */}
        {step > 0 && (
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
        )}

        {/* Step Content (Steps 1-4) */}
        {step > 0 && (
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
                Tell us about yourself (Optional)
              </h1>
              <p className="text-gray-400 mb-2">
                This helps us give you better content recommendations and industry-specific trends.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                💡 You can skip this and add it later if you prefer
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
                Connect your platforms (Optional)
              </h1>
              <p className="text-gray-400 mb-2">
                Connect now to publish directly from XELORA, or skip and copy-paste content manually.
              </p>
              <div className="bg-tron-grid border border-tron-cyan/20 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-300 font-semibold mb-2">
                  ✅ Benefits of connecting:
                </p>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• One-click publishing to all platforms</li>
                  <li>• Track engagement and performance</li>
                  <li>• Schedule posts for optimal times</li>
                  <li>• No more switching between tabs</li>
                </ul>
              </div>
              <p className="text-xs text-gray-500 mb-6">
                Don't want to connect yet? No problem—you can still use XELORA to generate and copy content.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => router.push("/api/auth/connect/twitter")}
                  className="h-16 border-2 border-gray-700 hover:border-[#00C7F2] rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <Twitter size={24} className="text-gray-300" />
                  <span className="font-medium text-gray-300">
                    Twitter
                  </span>
                </button>
                <button
                  onClick={() => router.push("/api/auth/connect/linkedin")}
                  className="h-16 border-2 border-gray-700 hover:border-[#00C7F2] rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <Linkedin size={24} className="text-gray-300" />
                  <span className="font-medium text-gray-300">
                    LinkedIn
                  </span>
                </button>
                <button
                  onClick={() => router.push("/api/auth/connect/facebook")}
                  className="h-16 border-2 border-gray-700 hover:border-[#00C7F2] rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <Facebook size={24} className="text-gray-300" />
                  <span className="font-medium text-gray-300">
                    Facebook
                  </span>
                </button>
                <button
                  onClick={() => router.push("/api/auth/connect/instagram")}
                  className="h-16 border-2 border-gray-700 hover:border-[#00C7F2] rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <Instagram size={24} className="text-gray-300" />
                  <span className="font-medium text-gray-300">
                    Instagram
                  </span>
                </button>
                <button
                  onClick={() => router.push("/api/auth/connect/tiktok")}
                  className="h-16 border-2 border-gray-700 hover:border-[#00C7F2] rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <Music size={24} className="text-gray-300" />
                  <span className="font-medium text-gray-300">
                    TikTok
                  </span>
                </button>
                <button
                  onClick={() => router.push("/api/auth/connect/reddit")}
                  className="h-16 border-2 border-gray-700 hover:border-[#00C7F2] rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <MessageCircle size={24} className="text-gray-300" />
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
        )}
      </div>
    </div>
  );
}
