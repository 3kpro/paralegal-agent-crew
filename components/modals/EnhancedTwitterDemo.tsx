import React, { useState } from "react";
import { OrbitalLoader } from "@/components/ui/orbital-loader";
import { Button } from "../ui/Button";

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TwitterPostResult {
  success: boolean;
  trackingId: string;
  message: string;
  estimatedTime: string;
  metadata?: {
    contentLength: number;
    estimatedThreadLength: number;
    includesTrends: boolean;
    postingAccount: string;
  };
}

interface TwitterStatus {
  status: "processing" | "completed" | "failed";
  trackingId: string;
  progress: number;
  result?: {
    tweetId: string;
    threadContent: string[];
    postedAt: string;
  };
  error?: string;
}

export const EnhancedTwitterDemo: React.FC<DemoModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [demoInput, setDemoInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<TwitterPostResult | null>(null);
  const [status, setStatus] = useState<TwitterStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [style, setStyle] = useState<"professional" | "casual" | "educational">(
    "professional",
  );
  const [includeTrends, setIncludeTrends] = useState(false);

  const handleGenerateAndPost = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);
    setResult(null);
    setStatus(null);

    try {
      const response = await fetch("/api/twitter-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: demoInput,
          contentType: "text",
          style,
          includeEmojis: true,
          includeHashtags: true,
          includeTrends,
          twitterAccount: "default",
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult(data);

        // Start polling for status
        const pollInterval = setInterval(async () => {
          try {
            const statusResponse = await fetch(
              `/api/twitter-post?trackingId=${data.trackingId}`,
            );
            const statusData = await statusResponse.json();

            setStatus(statusData);

            if (statusData.status === "completed") {
              clearInterval(pollInterval);
              setIsGenerating(false);
            } else if (statusData.status === "failed") {
              clearInterval(pollInterval);
              setError(statusData.error || "Posting failed");
              setIsGenerating(false);
            }
          } catch (pollError) {
            console.error("Polling error:", pollError);
            clearInterval(pollInterval);
            setError("Failed to check posting status");
            setIsGenerating(false);
          }
        }, 2000);

        // Set timeout to prevent infinite polling
        setTimeout(() => {
          clearInterval(pollInterval);
          if (isGenerating) {
            setError(
              "Posting timed out. Please check your Twitter account manually.",
            );
            setIsGenerating(false);
          }
        }, 90000); // 90 second timeout
      } else {
        throw new Error(data.message || "Posting failed");
      }
    } catch (error) {
      console.error("Error:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
      setIsGenerating(false);
    }
  };

  const clearDemo = () => {
    setDemoInput("");
    setResult(null);
    setStatus(null);
    setError(null);
  };

  const openTwitter = () => {
    window.open("https://twitter.com/compose/tweet", "_blank");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            🚀 XELORA - Enhanced Twitter Integration
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              ✨ Enhanced Twitter Posting Demo
            </h3>

            <form onSubmit={handleGenerateAndPost} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content to Transform:
                </label>
                <textarea
                  placeholder="Paste your content here... (e.g., blog post, article, idea, or any text you want to turn into engaging Twitter posts)"
                  className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={demoInput}
                  onChange={(e) => setDemoInput(e.target.value)}
                  required
                />
                <div className="text-sm text-gray-500 mt-1">
                  {demoInput.length}/5000 characters
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Style:
                  </label>
                  <select
                    id="content-style"
                    value={style}
                    onChange={(e) => setStyle(e.target.value as any)}
                    aria-label="Content Style"
                    title="Select content style"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="professional">💼 Professional</option>
                    <option value="casual">😊 Casual</option>
                    <option value="educational">📚 Educational</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Twitter Account:
                  </label>
                  <select
                    id="twitter-account"
                    aria-label="Twitter Account"
                    title="Select Twitter account"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="default">@3kpro_services (Demo)</option>
                    <option value="personal">Your Personal Account</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeTrends"
                  checked={includeTrends}
                  onChange={(e) => setIncludeTrends(e.target.checked)}
                  className="mr-2"
                />
                <label
                  htmlFor="includeTrends"
                  className="text-sm text-gray-700"
                >
                  🔍 Include trending topics and hashtags (enhanced engagement)
                </label>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={isGenerating || !demoInput.trim()}
                  variant="primary"
                  className="flex-1"
                >
                  {isGenerating ? (
                    <>
                       <OrbitalLoader className="w-5 h-5 mr-2" />
                      Generating & Posting...
                    </>
                  ) : (
                    "🚀 Generate & Post to Twitter"
                  )}
                </Button>
                <Button type="button" onClick={clearDemo} variant="secondary">
                  Clear
                </Button>
              </div>
            </form>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <h4 className="font-semibold text-red-800 mb-2">❌ Error:</h4>
              <p className="text-red-700">{error}</p>
              <Button
                onClick={clearDemo}
                variant="secondary"
                size="sm"
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          )}

          {result && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h4 className="font-semibold text-blue-800 mb-4">
                📝 Processing Started:
              </h4>
              <div className="space-y-2">
                <p>
                  <strong>Tracking ID:</strong> {result.trackingId}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  {isGenerating ? "Processing..." : "Complete"}
                </p>
                <p>
                  <strong>Estimated Time:</strong> {result.estimatedTime}
                </p>
                {result.metadata && (
                  <>
                    <p>
                      <strong>Content Length:</strong>{" "}
                      {result.metadata.contentLength} characters
                    </p>
                    <p>
                      <strong>Estimated Thread Length:</strong>{" "}
                      {result.metadata.estimatedThreadLength} tweets
                    </p>
                    <p>
                      <strong>Includes Trends:</strong>{" "}
                      {result.metadata.includesTrends ? "Yes" : "No"}
                    </p>
                    <p>
                      <strong>Posting Account:</strong>{" "}
                      {result.metadata.postingAccount}
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {status && status.status === "completed" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h4 className="font-semibold text-green-800 mb-4">
                🎉 Successfully Posted to Twitter!
              </h4>
              {status.result && (
                <div className="space-y-4">
                  <div className="bg-white rounded border p-4">
                    <h5 className="font-semibold mb-2">Posted Content:</h5>
                    <div className="text-gray-800 whitespace-pre-wrap">
                      {status.result.threadContent?.join("\n\n") ||
                        "Content posted successfully"}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button
                      onClick={() =>
                        navigator.clipboard.writeText(
                          status.result?.threadContent?.join("\n\n") || "",
                        )
                      }
                      variant="primary"
                      size="sm"
                    >
                      📋 Copy Content
                    </Button>
                    <Button onClick={openTwitter} variant="outline" size="sm">
                      🐦 Open Twitter
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">
                📱 Twitter Posting
              </h4>
              <p className="text-sm text-blue-600">Enhanced Integration</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">
                🔍 Trend Analysis
              </h4>
              <p className="text-sm text-green-600">AI-Powered Optimization</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2">
                📊 Analytics
              </h4>
              <p className="text-sm text-purple-600">Real-time Tracking</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
