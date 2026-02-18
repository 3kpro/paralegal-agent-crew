"use client";

import React, { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

import StepTopicInput from "./components/StepTopicInput";
import StepPlatformSelect from "./components/StepPlatformSelect";
import StepAnalyzing from "./components/StepAnalyzing";
import StepViralReveal from "./components/StepViralReveal";
import StepContentPreview from "./components/StepContentPreview";
import StepSignupGate from "./components/StepSignupGate";

type Step = 1 | 2 | 3 | 4 | 5 | 6;

interface ViralDNA {
  hookType: string;
  primaryEmotion: string;
  valueProp: string;
}

const slideVariants = {
  enter: { opacity: 0, y: 30 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function TryPage() {
  // Flow state
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [error, setError] = useState<string | null>(null);

  // Step 1
  const [topic, setTopic] = useState("");

  // Step 2
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  // Step 4 — Viral Score
  const [viralScore, setViralScore] = useState(0);
  const [viralPotential, setViralPotential] = useState<"high" | "medium" | "low">("low");
  const [viralDNA, setViralDNA] = useState<ViralDNA | undefined>();
  const [aiReasoning, setAiReasoning] = useState("");

  // Step 5 — Generated content
  const [generatedContent, setGeneratedContent] = useState<Record<string, any>>({});
  const [gatingMeta, setGatingMeta] = useState<Record<string, string>>({});
  const [contentReady, setContentReady] = useState(false);

  // Fire both APIs in parallel when entering Step 3
  const startAnalysis = useCallback(async () => {
    setCurrentStep(3);
    setError(null);
    setContentReady(false);

    try {
      // Fire predict + generate in parallel
      const [predictRes, generateRes] = await Promise.all([
        fetch(`/api/try/predict?keyword=${encodeURIComponent(topic)}`),
        fetch("/api/try/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic, formats: selectedPlatforms }),
        }),
      ]);

      // Handle predict result
      if (predictRes.ok) {
        const predictData = await predictRes.json();
        if (predictData.success && predictData.topic) {
          setViralScore(predictData.topic.viralScore || 0);
          setViralPotential(predictData.topic.viralPotential || "low");
          setViralDNA(predictData.topic.viralDNA);
          setAiReasoning(predictData.topic.aiReasoning || "");
        }
      } else {
        const errData = await predictRes.json().catch(() => ({}));
        if (predictRes.status === 429) {
          setError(errData.message || "Rate limit reached. Try again tomorrow.");
          return;
        }
      }

      // Handle generate result
      if (generateRes.ok) {
        const genData = await generateRes.json();
        if (genData.success) {
          setGeneratedContent(genData.content || {});
          setGatingMeta(genData.gatingMeta || {});
          setContentReady(true);
        }
      } else {
        const errData = await generateRes.json().catch(() => ({}));
        if (generateRes.status === 429) {
          setError(errData.message || "Rate limit reached. Try again tomorrow.");
          return;
        }
      }

      // Move to score reveal
      setCurrentStep(4);
    } catch (err) {
      console.error("[Try] Analysis error:", err);
      setError("Something went wrong. Please try again.");
    }
  }, [topic, selectedPlatforms]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Minimal header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <Link href="/" className="text-sm font-bold tracking-widest text-white/60 hover:text-white transition-colors">
          XELORA
        </Link>
        <Link
          href="/signup"
          className="text-xs font-medium text-gray-500 hover:text-white transition-colors"
        >
          Sign Up
        </Link>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-6 py-12 md:py-20">
        {/* Error banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400"
          >
            {error}
            {error.includes("Rate limit") || error.includes("limit reached") ? (
              <Link
                href="/signup?ref=try-limit"
                className="ml-2 underline font-medium text-red-300 hover:text-white"
              >
                Sign up for unlimited access
              </Link>
            ) : null}
          </motion.div>
        )}

        {/* Step content with transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {currentStep === 1 && (
              <StepTopicInput
                topic={topic}
                onTopicChange={setTopic}
                onContinue={() => setCurrentStep(2)}
              />
            )}

            {currentStep === 2 && (
              <StepPlatformSelect
                selectedPlatforms={selectedPlatforms}
                onPlatformsChange={setSelectedPlatforms}
                onContinue={startAnalysis}
                onBack={() => setCurrentStep(1)}
              />
            )}

            {currentStep === 3 && (
              <StepAnalyzing topic={topic} />
            )}

            {currentStep === 4 && (
              <StepViralReveal
                viralScore={viralScore}
                viralPotential={viralPotential}
                viralDNA={viralDNA}
                aiReasoning={aiReasoning}
                onContinue={() => {
                  if (contentReady) {
                    setCurrentStep(5);
                  }
                }}
                onRetry={() => {
                  setTopic("");
                  setError(null);
                  setCurrentStep(1);
                }}
              />
            )}

            {currentStep === 5 && (
              <StepContentPreview
                content={generatedContent}
                gatingMeta={gatingMeta}
                platforms={selectedPlatforms}
                onContinue={() => setCurrentStep(6)}
              />
            )}

            {currentStep === 6 && (
              <StepSignupGate topic={topic} viralScore={viralScore} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Powered by line */}
        <div className="mt-16 text-center">
          <p className="text-xs text-gray-700">
            Powered by{" "}
            <Link href="/" className="text-gray-500 hover:text-white transition-colors">
              Xelora Viral DNA™
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
