"use client";

import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUp } from "@phosphor-icons/react";
import { ValidationType, ValidationContext } from "../types";

interface ValidationDataFormProps {
  validationType: ValidationType;
  data: ValidationContext;
  onChange: (data: ValidationContext) => void;
  onContinue: () => void;
  onBack: () => void;
}

interface FormStep {
  field: keyof ValidationContext;
  question: string;
  subtitle: string;
  placeholder: string;
  type: "text" | "url" | "textarea";
  optional: boolean;
}

// Build the ordered question steps for each validation type
function buildSteps(validationType: ValidationType): FormStep[] {
  const isPhysical = validationType.startsWith("physical");
  const isSaas = validationType.startsWith("saas");
  const isService = validationType.startsWith("service");
  const isExisting = validationType.endsWith("-existing");
  const isNew = validationType.endsWith("-new");

  if (validationType === "custom") {
    return [
      {
        field: "customQuery",
        question: "What do you want to validate?",
        subtitle: "Describe your idea, topic, or concept — the more specific the better.",
        placeholder: "e.g., A subscription box for remote workers who want healthier snacks...",
        type: "textarea",
        optional: false,
      },
      {
        field: "targetAudience",
        question: "Who are you trying to reach?",
        subtitle: "Your target audience helps us find the most relevant trends.",
        placeholder: "e.g., Small business owners, Gen Z creators, Remote freelancers...",
        type: "text",
        optional: true,
      },
    ];
  }

  const nameParts = {
    question: isPhysical
      ? "What's your product called?"
      : isSaas
      ? "What's your app or platform called?"
      : "What's your service called?",
    subtitle: isPhysical
      ? "Just the name — we'll dig into the details next."
      : isSaas
      ? "The name people will search for or sign up to."
      : "The name you use with clients.",
    placeholder: isPhysical
      ? "e.g., EcoBottle Pro"
      : isSaas
      ? "e.g., Xelora, TaskFlow"
      : "e.g., Strategic Growth Consulting",
  };

  const steps: FormStep[] = [
    {
      field: "productName",
      question: nameParts.question,
      subtitle: nameParts.subtitle,
      placeholder: nameParts.placeholder,
      type: "text",
      optional: false,
    },
    {
      field: "description",
      question: isExisting
        ? "Describe what it does and who it's for."
        : "Describe what you're launching and the problem it solves.",
      subtitle: isExisting
        ? "A few sentences is plenty — think elevator pitch."
        : "What gap in the market are you filling?",
      placeholder: isExisting
        ? "e.g., A reusable water bottle with a built-in UV purifier for outdoor enthusiasts..."
        : "e.g., A lightweight CRM built for solo founders who need less, not more...",
      type: "textarea",
      optional: false,
    },
  ];

  if (isExisting) {
    steps.push({
      field: "productUrl",
      question: isSaas ? "What's your app URL?" : "Do you have a website or product page?",
      subtitle: "We'll use this to make content feel grounded and real.",
      placeholder: isSaas ? "https://yourapp.com" : "https://yourproduct.com",
      type: "url",
      optional: true,
    });

    if (isSaas) {
      steps.push({
        field: "pricingModel",
        question: "What's your pricing model?",
        subtitle: "Helps us match content to where people are in the buying journey.",
        placeholder: "e.g., Freemium, $29/mo, Free trial then $49/mo...",
        type: "text",
        optional: true,
      });
      steps.push({
        field: "freeTrialUrl",
        question: "Got a free trial or signup link?",
        subtitle: "We'll build CTAs around this if you provide it.",
        placeholder: "https://yourapp.com/signup",
        type: "url",
        optional: true,
      });
    }

    steps.push({
      field: "uniqueValue",
      question: "What makes it genuinely different?",
      subtitle: "The edge that makes it worth switching to or buying.",
      placeholder: isSaas
        ? "e.g., Only platform that combines AI with real-time trend data"
        : "e.g., Ships within 24 hrs, 100% plastic-free packaging",
      type: "text",
      optional: true,
    });
  }

  if (isNew) {
    steps.push({
      field: "targetMarket",
      question: "Who is this launching for?",
      subtitle: "Your core target market — the people who need this most.",
      placeholder: "e.g., Remote workers, Fitness enthusiasts, Solo founders...",
      type: "text",
      optional: true,
    });
    steps.push({
      field: "problemSolved",
      question: "What problem are you solving?",
      subtitle: "The sharper the problem statement, the better the campaign angle.",
      placeholder: isSaas
        ? "e.g., Founders waste 3+ hours a week manually posting on social media"
        : isPhysical
        ? "e.g., Tap water is fine but nobody trusts it hiking"
        : "e.g., Small teams can't afford a fractional CMO but need one",
      type: "text",
      optional: true,
    });
  }

  steps.push({
    field: "targetAudience",
    question: "Who should see this content?",
    subtitle: "The platform audience you're writing for.",
    placeholder: "e.g., Marketing managers, Gen Z shoppers, B2B decision makers...",
    type: "text",
    optional: true,
  });

  return steps;
}

const slideVariants = {
  enter: { opacity: 0, y: 28 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const ValidationDataForm = memo<ValidationDataFormProps>(
  ({ validationType, data, onChange, onContinue, onBack }) => {
    const steps = buildSteps(validationType);
    const [stepIndex, setStepIndex] = useState(0);
    const [direction, setDirection] = useState<1 | -1>(1);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

    const currentStep = steps[stepIndex];
    const totalSteps = steps.length;
    const isLast = stepIndex === totalSteps - 1;

    const currentValue = (data[currentStep.field] as string) ?? "";
    const canAdvance = currentStep.optional || currentValue.trim().length > 0;

    // Auto-focus the input when step changes
    useEffect(() => {
      const timer = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(timer);
    }, [stepIndex]);

    const handleNext = useCallback(() => {
      if (!canAdvance) return;
      if (isLast) {
        onContinue();
      } else {
        setDirection(1);
        setStepIndex((i) => i + 1);
      }
    }, [canAdvance, isLast, onContinue]);

    const handleBack = useCallback(() => {
      if (stepIndex === 0) {
        onBack();
      } else {
        setDirection(-1);
        setStepIndex((i) => i - 1);
      }
    }, [stepIndex, onBack]);

    const handleChange = useCallback(
      (value: string) => {
        onChange({ ...data, [currentStep.field]: value });
      },
      [data, onChange, currentStep.field]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleNext();
        }
      },
      [handleNext]
    );

    const inputClass =
      "w-full px-5 py-4 bg-black/40 border border-white/10 rounded-2xl text-white text-base placeholder:text-gray-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/10 transition-all resize-none";

    return (
      <div className="flex flex-col min-h-[60vh] max-w-xl mx-auto w-full">
        {/* Progress dots */}
        <div className="flex items-center gap-2 mb-10">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === stepIndex
                  ? "w-6 bg-white"
                  : i < stepIndex
                  ? "w-3 bg-white/40"
                  : "w-3 bg-white/10"
              }`}
            />
          ))}
          <span className="ml-2 text-xs text-gray-600 font-medium">
            {stepIndex + 1} / {totalSteps}
          </span>
        </div>

        {/* Animated question + input */}
        <div className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={stepIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="space-y-6"
            >
              {/* Question */}
              <div className="space-y-1.5">
                <h2 className="text-2xl md:text-3xl font-bold text-white leading-snug">
                  {currentStep.question}
                </h2>
                <p className="text-sm text-gray-500">{currentStep.subtitle}</p>
              </div>

              {/* Input */}
              {currentStep.type === "textarea" ? (
                <textarea
                  ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                  value={currentValue}
                  onChange={(e) => handleChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={currentStep.placeholder}
                  rows={3}
                  className={inputClass}
                />
              ) : (
                <input
                  ref={inputRef as React.RefObject<HTMLInputElement>}
                  type={currentStep.type}
                  value={currentValue}
                  onChange={(e) => handleChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={currentStep.placeholder}
                  className={inputClass}
                />
              )}

              {/* Action row */}
              <div className="flex items-center gap-4">
                <motion.button
                  onClick={handleNext}
                  disabled={!canAdvance}
                  whileHover={canAdvance ? { scale: 1.03 } : {}}
                  whileTap={canAdvance ? { scale: 0.97 } : {}}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    canAdvance
                      ? "bg-white text-black hover:bg-white/90"
                      : "bg-white/5 text-gray-600 cursor-not-allowed"
                  }`}
                >
                  {isLast ? "Generate Campaign" : "Continue"}
                  {isLast ? (
                    <ArrowUp className="w-4 h-4" weight="bold" />
                  ) : (
                    <ArrowRight className="w-4 h-4" weight="bold" />
                  )}
                </motion.button>

                {currentStep.optional && (
                  <button
                    onClick={handleNext}
                    className="text-xs text-gray-600 hover:text-gray-400 transition-colors font-medium"
                  >
                    Skip →
                  </button>
                )}

                {currentStep.type !== "textarea" && (
                  <span className="text-xs text-gray-700 ml-auto hidden md:block">
                    press <kbd className="font-mono bg-white/5 px-1.5 py-0.5 rounded text-gray-500">↵ Enter</kbd>
                  </span>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Back */}
        <div className="mt-10">
          <button
            onClick={handleBack}
            className="text-gray-600 hover:text-gray-300 text-sm font-medium transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            {stepIndex === 0 ? "Go Back" : "Previous"}
          </button>
        </div>
      </div>
    );
  }
);

ValidationDataForm.displayName = "ValidationDataForm";

export default ValidationDataForm;
