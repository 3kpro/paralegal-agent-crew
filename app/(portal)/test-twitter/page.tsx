"use client";

import { useState } from "react";
import PublishButton from "@/components/PublishButton";
import { motion } from "framer-motion";
import { Sparkle as Sparkles, ArrowsClockwise as RefreshCw } from "@phosphor-icons/react";
import { BouncingDots } from "@/components/ui/bouncing-dots";

const mockContent = [
  "🚀 Just discovered the secret to viral content: AI + trending topics = engagement gold! Who else is using XELORA? #ContentMarketing #AI",
  "Breaking: The future of social media is here. And it's automated. 🤖✨ #TechTrends #SocialMedia",
  "Hot take: If you're not using AI for content creation in 2025, you're already behind. XELORA is changing the game! 🔥",
  "💡 Pro tip: The best time to post on Twitter is... RIGHT NOW. Test it with XELORA! #TwitterTips #GrowthHacking",
  "This is a test tweet from XELORA's testing page. If you see this, our Twitter integration is WORKING! 🎉 #DevLife",
];

export default function TestTwitterPage() {
  const [selectedContent, setSelectedContent] = useState(mockContent[0]);
  const [customContent, setCustomContent] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const contentToPublish = useCustom ? customContent : selectedContent;

  const handlePublishSuccess = (results: any) => {
    console.log("✅ Publish success:", results);
    // Handle both single result and multi-platform results
    if (results.results && Array.isArray(results.results)) {
      // Multi-platform publish
      setLastResult({
        success: true,
        platforms: results.results,
        errors: results.errors,
      });
    } else {
      // Single platform publish (legacy format)
      setLastResult({ success: true, ...results });
    }
  };

  const handlePublishError = (error: string) => {
    console.error("❌ Publish error:", error);
    setLastResult({ success: false, error });
  };

  const randomizeMockContent = () => {
    const randomIndex = Math.floor(Math.random() * mockContent.length);
    setSelectedContent(mockContent[randomIndex]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-tron-dark via-[#0a0f1e] to-tron-dark p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-tron-cyan mb-2">
            🧪 Twitter Publishing Test Lab
          </h1>
          <p className="text-tron-text-muted">
            Test Twitter posting without creating full campaigns. Select mock
            content or write your own.
          </p>
        </motion.div>

        {/* Content Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-tron-grid/50 backdrop-blur-xl border-2 border-tron-cyan/30 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-tron-text">
              Select Content to Publish
            </h2>
            <label className="flex items-center gap-2 text-sm text-tron-text-muted">
              <input
                type="checkbox"
                checked={useCustom}
                onChange={(e) => setUseCustom(e.target.checked)}
                className="w-4 h-4 text-tron-cyan bg-tron-dark border-tron-cyan/30 rounded focus:ring-tron-cyan"
              />
              Use custom content
            </label>
          </div>

          {useCustom ? (
            <div>
              <textarea
                value={customContent}
                onChange={(e) => setCustomContent(e.target.value)}
                placeholder="Write your custom tweet here..."
                className="w-full h-32 p-4 bg-tron-dark/50 border border-tron-cyan/30 rounded-lg text-tron-text placeholder-tron-text-muted focus:border-tron-cyan focus:outline-none resize-none"
                maxLength={280}
              />
              <p className="text-xs text-tron-text-muted mt-2">
                {customContent.length}/280 characters
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={randomizeMockContent}
                  className="px-3 py-1.5 bg-tron-cyan/20 hover:bg-tron-cyan/30 text-tron-cyan text-sm rounded-lg transition-colors flex items-center gap-2"
                >
                  <BouncingDots className="bg-tron-cyan w-1.5 h-1.5" />
                  Randomize
                </button>
              </div>
              <div className="space-y-2">
                {mockContent.map((content, index) => (
                  <label
                    key={index}
                    className={`
                      block p-3 rounded-lg border cursor-pointer transition-all
                      ${
                        selectedContent === content
                          ? "bg-tron-cyan/20 border-tron-cyan/50"
                          : "bg-tron-dark/50 border-tron-cyan/20 hover:border-tron-cyan/40"
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="mockContent"
                      checked={selectedContent === content}
                      onChange={() => setSelectedContent(content)}
                      className="sr-only"
                    />
                    <p className="text-sm text-tron-text">{content}</p>
                  </label>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-tron-grid/50 backdrop-blur-xl border-2 border-tron-cyan/30 rounded-2xl p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-tron-text mb-4">
            Preview
          </h2>
          <div className="bg-tron-dark/50 border border-tron-cyan/20 rounded-lg p-4">
            <p className="text-tron-text whitespace-pre-wrap">
              {contentToPublish || (
                <span className="text-tron-text-muted italic">
                  No content selected...
                </span>
              )}
            </p>
          </div>
          <p className="text-xs text-tron-text-muted mt-2">
            {contentToPublish.length} characters
          </p>
        </motion.div>

        {/* Publish Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-tron-grid/50 backdrop-blur-xl border-2 border-tron-cyan/30 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-tron-text mb-1">
                Ready to Publish?
              </h2>
              <p className="text-sm text-tron-text-muted">
                Click the button to test Twitter posting
              </p>
            </div>
            <PublishButton
              content={contentToPublish}
              onPublishSuccess={handlePublishSuccess}
              onPublishError={handlePublishError}
              disabled={!contentToPublish.trim()}
              variant="primary"
              size="lg"
            />
          </div>
        </motion.div>

        {/* Results */}
        {lastResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
              bg-tron-grid/50 backdrop-blur-xl border-2 rounded-2xl p-6
              ${
                lastResult.success
                  ? "border-green-500/30"
                  : "border-red-500/30"
              }
            `}
          >
            <h2
              className={`text-xl font-semibold mb-4 ${
                lastResult.success ? "text-green-400" : "text-red-400"
              }`}
            >
              {lastResult.success ? "✅ Success!" : "❌ Error"}
            </h2>
            {lastResult.success && lastResult.platforms ? (
              // Multi-platform results
              <div className="space-y-4">
                {lastResult.platforms.map((post: any, idx: number) => (
                  <div
                    key={idx}
                    className="bg-tron-dark/50 border border-green-500/30 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-tron-text">
                        {post.platform} - @{post.account}
                      </h3>
                      <span className="text-xs text-green-400">✓ Posted</span>
                    </div>
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-tron-cyan hover:underline"
                    >
                      View Post →
                    </a>
                  </div>
                ))}
                {lastResult.errors && lastResult.errors.length > 0 && (
                  <div className="bg-tron-dark/50 border border-yellow-500/30 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-400 mb-2">
                      Partial Failures:
                    </h3>
                    {lastResult.errors.map((error: string, idx: number) => (
                      <p key={idx} className="text-sm text-tron-text-muted">
                        • {error}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Single platform or error
              <>
                <div className="bg-tron-dark/50 border border-tron-cyan/20 rounded-lg p-4">
                  <pre className="text-sm text-tron-text overflow-x-auto">
                    {JSON.stringify(lastResult, null, 2)}
                  </pre>
                </div>
                {lastResult.success && lastResult.url && (
                  <a
                    href={lastResult.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-tron-cyan hover:bg-tron-cyan/80 text-tron-dark font-semibold rounded-lg transition-colors"
                  >
                    <Sparkles className="w-4 h-4" weight="duotone" />
                    View Post
                  </a>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* Debug Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-xs text-tron-text-muted text-center"
        >
          <p>
            💡 Open browser console (F12) to see detailed logs from
            PublishButton
          </p>
          <p className="mt-1">
            Check for: [PublishButton] logs, API calls to /api/social/post
          </p>
        </motion.div>
      </div>
    </div>
  );
}
