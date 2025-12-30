"use client";

import { useState } from "react";
import { CaretDown as ChevronDown, CaretUp as ChevronUp, CheckCircle, Circle, WarningCircle as AlertCircle } from "@phosphor-icons/react";

interface SetupStep {
  id: string;
  title: string;
  description: string;
  steps: string[];
  note?: string;
}

const setupSteps: SetupStep[] = [
  {
    id: "check-account-type",
    title: "Step 1: Check Your Instagram Account Type",
    description: "First, verify if your Instagram account is already a Business or Creator account",
    steps: [
      "Open the Instagram mobile app",
      "Go to your profile",
      "Tap the three lines (☰) in the top right",
      "Look for 'Switch Account Type' or 'Account Type'",
      "If you see 'Switch to Personal Account', you already have a Business/Creator account ✅",
      "If you see 'Switch to Professional Account', continue to Step 2"
    ],
    note: "Personal accounts cannot use Instagram publishing API"
  },
  {
    id: "convert-to-business",
    title: "Step 2: Convert to Business or Creator Account",
    description: "Convert your personal Instagram account to a professional account",
    steps: [
      "From your profile, tap the three lines (☰) in the top right",
      "Tap 'Settings and privacy'",
      "Scroll down and tap 'Account type and tools'",
      "Tap 'Switch to professional account'",
      "Choose either 'Creator' (for influencers, artists) or 'Business' (for brands, companies)",
      "Select your category (e.g., 'Digital Creator', 'Business Service')",
      "Tap 'Done' to complete the setup"
    ],
    note: "Both Business and Creator accounts work with Xelora"
  },
  {
    id: "create-facebook-page",
    title: "Step 3: Create a Facebook Page (If You Don't Have One)",
    description: "Instagram Business accounts require a connected Facebook Page",
    steps: [
      "Go to facebook.com/pages/create on desktop or mobile browser",
      "Click 'Get Started'",
      "Enter your Page name (can match your Instagram username)",
      "Select a category (e.g., 'Brand', 'Public Figure', 'Business')",
      "Add a profile picture and cover photo (optional)",
      "Click 'Create Page'",
      "Your Facebook Page is now ready to link to Instagram"
    ],
    note: "You can use an existing Facebook Page if you're already an admin"
  },
  {
    id: "link-instagram-to-page",
    title: "Step 4: Link Instagram to Your Facebook Page",
    description: "Connect your Instagram Business account to your Facebook Page",
    steps: [
      "Open Instagram mobile app and go to your profile",
      "Tap the three lines (☰) in the top right",
      "Tap 'Settings and privacy'",
      "Under 'For professionals', tap 'Account type and tools'",
      "Tap 'Connect or create a Page'",
      "Choose 'Connect to a Page you manage' or create a new one",
      "Select your Facebook Page from the list",
      "Tap 'Connect' to link the accounts",
      "Your Instagram is now linked to a Facebook Page ✅"
    ],
    note: "This connection allows Xelora to publish to your Instagram via the Facebook Graph API"
  }
];

export default function InstagramAccountSetupGuide() {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const toggleStep = (stepId: string) => {
    setExpandedStep(expandedStep === stepId ? null : stepId);
  };

  const toggleComplete = (stepId: string) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepId)) {
      newCompleted.delete(stepId);
    } else {
      newCompleted.add(stepId);
    }
    setCompletedSteps(newCompleted);
  };

  const allStepsCompleted = setupSteps.every(step => completedSteps.has(step.id));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-purple-400 mt-0.5 flex-shrink-0" size={20} weight="duotone" />
          <div>
            <h3 className="text-sm font-semibold text-purple-300 mb-1">
              Instagram Publishing Requirements
            </h3>
            <p className="text-xs text-gray-300 mb-2">
              To publish to Instagram via Xelora, your account must be:
            </p>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>• A <strong>Business</strong> or <strong>Creator</strong> account (not Personal)</li>
              <li>• Linked to a <strong>Facebook Page</strong> that you manage</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Setup Steps */}
      <div className="space-y-2">
        {setupSteps.map((step) => {
          const isExpanded = expandedStep === step.id;
          const isCompleted = completedSteps.has(step.id);

          return (
            <div
              key={step.id}
              className="border border-gray-700 rounded-lg overflow-hidden transition-all"
            >
              {/* Step Header */}
              <button
                onClick={() => toggleStep(step.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors text-left"
              >
                <div className="flex items-start gap-3 flex-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleComplete(step.id);
                    }}
                    className="mt-0.5 flex-shrink-0"
                  >
                    {isCompleted ? (
                      <CheckCircle className="text-green-400" size={20} weight="duotone" />
                    ) : (
                      <Circle className="text-gray-500" size={20} weight="duotone" />
                    )}
                  </button>
                  <div className="flex-1">
                    <h4 className={`text-sm font-semibold ${isCompleted ? 'text-green-400' : 'text-white'}`}>
                      {step.title}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">
                      {step.description}
                    </p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="text-gray-400 flex-shrink-0" size={20} weight="duotone" />
                ) : (
                  <ChevronDown className="text-gray-400 flex-shrink-0" size={20} weight="duotone" />
                )}
              </button>

              {/* Step Content */}
              {isExpanded && (
                <div className="px-4 pb-4 pl-11 space-y-3">
                  <ol className="space-y-2">
                    {step.steps.map((instruction, index) => (
                      <li key={index} className="text-sm text-gray-300 flex gap-2">
                        <span className="text-[#00C7F2] font-semibold flex-shrink-0">
                          {index + 1}.
                        </span>
                        <span>{instruction}</span>
                      </li>
                    ))}
                  </ol>
                  {step.note && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3 mt-3">
                      <p className="text-xs text-blue-300">
                        💡 <strong>Note:</strong> {step.note}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion Status */}
      {allStepsCompleted && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-400 flex-shrink-0" size={24} weight="duotone" />
            <div>
              <p className="text-sm font-semibold text-green-300">
                All Steps Completed! 🎉
              </p>
              <p className="text-xs text-gray-300 mt-1">
                Your Instagram account is now ready to connect with Xelora. Click "Connect Instagram" below to continue.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Reference */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
        <h4 className="text-xs font-semibold text-gray-300 mb-2">
          📱 Quick Reference
        </h4>
        <div className="space-y-2 text-xs text-gray-400">
          <div>
            <strong className="text-gray-300">Already have a Business/Creator account?</strong>
            <p>Skip to Step 3 to ensure your account is linked to a Facebook Page.</p>
          </div>
          <div>
            <strong className="text-gray-300">Need help?</strong>
            <p>Check out <a href="https://help.instagram.com/502981923235522" target="_blank" rel="noopener noreferrer" className="text-[#00C7F2] hover:underline">Instagram's official guide</a> for more details.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
