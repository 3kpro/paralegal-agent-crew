"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Lifebuoy,
  PaperPlaneTilt,
  CheckCircle,
  Bug,
  Question,
  Lightbulb,
  CreditCard,
  UserCircle,
  Warning
} from "@phosphor-icons/react";

type IssueType = "bug" | "question" | "feature" | "billing" | "account" | "other";

const issueTypes: { value: IssueType; label: string; icon: React.ElementType; description: string }[] = [
  { value: "bug", label: "Bug Report", icon: Bug, description: "Something isn't working correctly" },
  { value: "question", label: "Question", icon: Question, description: "I need help with something" },
  { value: "feature", label: "Feature Request", icon: Lightbulb, description: "I have an idea for improvement" },
  { value: "billing", label: "Billing", icon: CreditCard, description: "Payment or subscription issue" },
  { value: "account", label: "Account", icon: UserCircle, description: "Account access or settings" },
  { value: "other", label: "Other", icon: Warning, description: "Something else" },
];

export default function SupportPage() {
  const [issueType, setIssueType] = useState<IssueType | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Format issue type for display
    const issueLabels: Record<string, string> = {
      bug: "Bug Report",
      question: "Question",
      feature: "Feature Request",
      billing: "Billing",
      account: "Account",
      other: "Other",
    };
    const issueLabel = issueLabels[issueType || "other"] || issueType;

    try {
      // Call Web3Forms directly from client-side (free plan requirement)
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: "3ac337df-1baf-4b0b-a320-638e3e1917b2",
          subject: `[XELORA] [${issueLabel}] ${subject}`,
          from_name: "XELORA Support Form",
          replyto: email,
          message: `
═══════════════════════════════════════════════════
  XELORA SUPPORT REQUEST
═══════════════════════════════════════════════════

TYPE:     ${issueLabel}
FROM:     ${email}
SUBJECT:  ${subject}

───────────────────────────────────────────────────
  MESSAGE
───────────────────────────────────────────────────

${message}

═══════════════════════════════════════════════════
Sent via XELORA Support Form
https://xelora.app/support
          `.trim(),
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to send message");
      }

      setIsSubmitted(true);
    } catch (err) {
      setError("Failed to send your message. Please try again or email us directly at xelora@3kpro.services");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" weight="duotone" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Message Sent!</h1>
          <p className="text-gray-400 mb-6">
            Thank you for reaching out. We'll get back to you within 24 hours.
          </p>
          <button
            onClick={() => {
              setIsSubmitted(false);
              setIssueType(null);
              setSubject("");
              setMessage("");
            }}
            className="px-6 py-2.5 bg-coral-500 hover:bg-coral-600 text-white rounded-lg font-medium transition-colors"
          >
            Send Another Message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-coral-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lifebuoy className="w-8 h-8 text-coral-400" weight="duotone" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">How can we help?</h1>
        <p className="text-gray-400">
          We're here to help. Send us a message and we'll respond within 24 hours.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Issue Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            What can we help you with?
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {issueTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = issueType === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setIssueType(type.value)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? "border-coral-500 bg-coral-500/10"
                      : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 mb-2 ${isSelected ? "text-coral-400" : "text-gray-400"}`}
                    weight="duotone"
                  />
                  <div className={`font-medium ${isSelected ? "text-white" : "text-gray-300"}`}>
                    {type.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            Your email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-coral-500 focus:ring-1 focus:ring-coral-500 transition-colors"
          />
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
            Subject
          </label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            placeholder="Brief description of your issue"
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-coral-500 focus:ring-1 focus:ring-coral-500 transition-colors"
          />
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
            Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={6}
            placeholder="Please describe your issue or question in detail. Include any relevant information that might help us assist you better."
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-coral-500 focus:ring-1 focus:ring-coral-500 transition-colors resize-none"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-5 bg-red-500/10 border border-red-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <Warning className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" weight="duotone" />
              <div>
                <p className="text-red-400 font-medium mb-2">Unable to send message</p>
                <p className="text-gray-400 text-sm mb-4">
                  We're having trouble submitting your request. Please email us directly instead.
                </p>
                <a
                  href={`mailto:xelora@3kpro.services?subject=${encodeURIComponent(`[${issueType?.toUpperCase() || 'SUPPORT'}] ${subject}`)}&body=${encodeURIComponent(`Issue Type: ${issueType}\n\n${message}\n\n---\nFrom: ${email}`)}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <PaperPlaneTilt className="w-4 h-4" weight="duotone" />
                  Open Email Client
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-4">
          <p className="text-sm text-gray-500">
            Or email us directly at{" "}
            <a
              href="mailto:xelora@3kpro.services"
              className="text-coral-400 hover:text-coral-300 transition-colors"
            >
              xelora@3kpro.services
            </a>
          </p>
          <button
            type="submit"
            disabled={isSubmitting || !issueType}
            className="w-full sm:w-auto px-8 py-3 bg-coral-500 hover:bg-coral-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Sending...
              </>
            ) : (
              <>
                <PaperPlaneTilt className="w-5 h-5" weight="duotone" />
                Send Message
              </>
            )}
          </button>
        </div>
      </form>

      {/* FAQ Quick Links */}
      <div className="mt-16 pt-8 border-t border-gray-800">
        <h2 className="text-lg font-semibold text-white mb-4">Common Questions</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Link
            href="/#faq"
            className="p-4 bg-gray-800/30 hover:bg-gray-800/50 border border-gray-700/50 rounded-xl transition-colors group"
          >
            <div className="font-medium text-gray-300 group-hover:text-white transition-colors">
              How does the Viral Score work?
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Learn about our prediction algorithm
            </div>
          </Link>
          <Link
            href="/#pricing"
            className="p-4 bg-gray-800/30 hover:bg-gray-800/50 border border-gray-700/50 rounded-xl transition-colors group"
          >
            <div className="font-medium text-gray-300 group-hover:text-white transition-colors">
              What's included in each plan?
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Compare features and pricing
            </div>
          </Link>
          <Link
            href="/social-accounts"
            className="p-4 bg-gray-800/30 hover:bg-gray-800/50 border border-gray-700/50 rounded-xl transition-colors group"
          >
            <div className="font-medium text-gray-300 group-hover:text-white transition-colors">
              How do I connect my social accounts?
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Link Twitter, LinkedIn, and more
            </div>
          </Link>
          <Link
            href="/settings"
            className="p-4 bg-gray-800/30 hover:bg-gray-800/50 border border-gray-700/50 rounded-xl transition-colors group"
          >
            <div className="font-medium text-gray-300 group-hover:text-white transition-colors">
              How do I manage my subscription?
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Upgrade, downgrade, or cancel
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
