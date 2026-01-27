"use client";

import { useState, useEffect } from "react";
import { ChartBar as BarChart3, TrendUp as TrendingUp, Target, DownloadSimple as Download } from "@phosphor-icons/react";
import { OrbitalLoader } from "@/components/ui/orbital-loader";
import type { ViralScoreAnalytics } from "@/types/feedback";
import { formatEngagement, formatAccuracy } from "@/lib/feedback-tracking";

/**
 * Viral Score Analytics Component
 *
 * Displays prediction accuracy metrics and ML training data readiness.
 * Shows users how well the heuristic algorithm is performing.
 *
 * Created: November 3, 2025
 */

export default function ViralScoreAnalyticsComponent() {
  const [analytics, setAnalytics] = useState<ViralScoreAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      const response = await fetch("/api/feedback/analytics");
      const result = await response.json();

      if (result.success) {
        setAnalytics(result.data);
      } else {
        setError(result.error || "Failed to fetch analytics");
      }
    } catch (err) {
      setError("Failed to fetch analytics");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function exportMLData() {
    setExporting(true);
    try {
      const response = await fetch("/api/feedback/export-ml?format=csv&quality=high");

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `ml_training_data_${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
      } else {
        const result = await response.json();
        alert(result.error || "Failed to export data");
      }
    } catch (err) {
      alert("Failed to export data");
      console.error(err);
    } finally {
      setExporting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <OrbitalLoader className="w-10 h-10 text-tron-cyan" />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">{error || "No analytics data available"}</p>
      </div>
    );
  }

  const hasData = analytics.predictions_with_data > 0;
  const accuracyPercentage = analytics.avg_prediction_accuracy || 0;
  const isReadyForML = analytics.training_data_ready >= 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-tron-text">Viral Score™ Analytics</h2>
          <p className="text-sm text-tron-text-muted mt-1">
            Phase 1: Heuristic Algorithm Performance
          </p>
        </div>

        {isReadyForML && (
          <button
            onClick={exportMLData}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-tron-cyan text-tron-dark font-semibold rounded-lg hover:bg-tron-cyan/90 transition disabled:opacity-50"
          >
            {exporting ? (
              <>
                <OrbitalLoader className="w-5 h-5" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" weight="duotone" />
                Export ML Data
              </>
            )}
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Predictions */}
        <div className="p-6 bg-tron-dark/50 border border-tron-grid rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-5 h-5 text-tron-cyan" weight="duotone" />
            <p className="text-sm text-tron-text-muted">Total Predictions</p>
          </div>
          <p className="text-3xl font-bold text-tron-text">{analytics.total_predictions}</p>
          <p className="text-xs text-tron-text-muted mt-1">
            {analytics.predictions_with_data} with engagement data
          </p>
        </div>

        {/* Prediction Accuracy */}
        <div className="p-6 bg-tron-dark/50 border border-tron-grid rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-green-400" weight="duotone" />
            <p className="text-sm text-tron-text-muted">Avg Accuracy</p>
          </div>
          <p className="text-3xl font-bold text-tron-text">
            {hasData ? formatAccuracy(accuracyPercentage) : "N/A"}
          </p>
          <p className="text-xs text-tron-text-muted mt-1">
            ±{analytics.avg_prediction_error?.toFixed(1) ?? "N/A"} points error
          </p>
        </div>

        {/* Training Data Ready */}
        <div className="p-6 bg-tron-dark/50 border border-tron-grid rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-tron-magenta" weight="duotone" />
            <p className="text-sm text-tron-text-muted">Training Data</p>
          </div>
          <p className="text-3xl font-bold text-tron-text">{analytics.training_data_ready}</p>
          <p className="text-xs text-tron-text-muted mt-1">
            {isReadyForML ? "Ready for ML!" : `Need ${100 - analytics.training_data_ready} more`}
          </p>
        </div>

        {/* Viral Content Count */}
        <div className="p-6 bg-tron-dark/50 border border-tron-grid rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-2xl">🔥</div>
            <p className="text-sm text-tron-text-muted">Viral Content</p>
          </div>
          <p className="text-3xl font-bold text-tron-text">{analytics.actual_viral}</p>
          <p className="text-xs text-tron-text-muted mt-1">10K+ engagement</p>
        </div>
      </div>

      {/* Prediction Breakdown */}
      <div className="p-6 bg-tron-dark/50 border border-tron-grid rounded-xl">
        <h3 className="text-lg font-semibold text-tron-text mb-4">Prediction Breakdown</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* High Potential Predictions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-tron-text-muted">High Potential</span>
              <span className="text-sm font-semibold text-green-400">
                {analytics.predicted_high}
              </span>
            </div>
            <div className="w-full bg-tron-grid rounded-full h-2">
              <div
                className="bg-green-400 h-2 rounded-full"
                style={{
                  width: `${(analytics.predicted_high / (analytics.total_predictions || 1)) * 100}%`,
                }}
              />
            </div>
            {hasData && (
              <p className="text-xs text-tron-text-muted mt-1">
                {analytics.high_prediction_correct} became viral (
                {analytics.predicted_high > 0
                  ? ((analytics.high_prediction_correct / analytics.predicted_high) * 100).toFixed(0)
                  : 0}
                % accuracy)
              </p>
            )}
          </div>

          {/* Medium Potential Predictions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-tron-text-muted">Medium Potential</span>
              <span className="text-sm font-semibold text-yellow-400">
                {analytics.predicted_medium}
              </span>
            </div>
            <div className="w-full bg-tron-grid rounded-full h-2">
              <div
                className="bg-yellow-400 h-2 rounded-full"
                style={{
                  width: `${(analytics.predicted_medium / (analytics.total_predictions || 1)) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Low Potential Predictions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-tron-text-muted">Low Potential</span>
              <span className="text-sm font-semibold text-gray-400">
                {analytics.predicted_low}
              </span>
            </div>
            <div className="w-full bg-tron-grid rounded-full h-2">
              <div
                className="bg-gray-400 h-2 rounded-full"
                style={{
                  width: `${(analytics.predicted_low / (analytics.total_predictions || 1)) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ML Readiness Banner */}
      {isReadyForML ? (
        <div className="p-6 bg-gradient-to-r from-tron-cyan/20 to-tron-magenta/20 border border-tron-cyan rounded-xl">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 text-4xl">🎯</div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-tron-text mb-2">
                Ready for Phase 2: ML Training!
              </h3>
              <p className="text-sm text-tron-text-muted mb-4">
                You have {analytics.training_data_ready} training records ready. This is enough
                to train a machine learning model that can potentially outperform the heuristic
                algorithm.
              </p>
              <p className="text-xs text-tron-text-muted">
                <strong>Next Steps:</strong> Export the training data and train a RandomForest
                regression model. See docs/VIRAL_SCORE_IMPLEMENTATION.md for ML implementation guide.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-tron-dark/30 border border-tron-grid rounded-xl">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 text-4xl">📊</div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-tron-text mb-2">
                Collecting Training Data...
              </h3>
              <p className="text-sm text-tron-text-muted mb-4">
                Keep publishing content and the system will automatically track engagement.
                You need {100 - analytics.training_data_ready} more records to train an ML model.
              </p>
              <p className="text-xs text-tron-text-muted">
                <strong>How to collect faster:</strong> Publish content using different viral
                scores (high/medium/low) to build a diverse training dataset.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
