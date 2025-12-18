"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, Rocket } from "lucide-react";

interface ProgressTrackerProps {
  progress: {
    first_campaign_created: boolean;
    first_content_generated: boolean;
    first_platform_connected: boolean;
    first_publish: boolean;
  };
}

const milestones = [
  {
    key: "first_campaign_created" as const,
    label: "Created First Campaign",
    description: "You've started your content creation journey",
  },
  {
    key: "first_content_generated" as const,
    label: "Generated Content",
    description: "AI-powered content is ready to go",
  },
  {
    key: "first_platform_connected" as const,
    label: "Connected Platform",
    description: "Ready to publish to social media",
  },
  {
    key: "first_publish" as const,
    label: "Published Content",
    description: "Your content is live and reaching audiences",
  },
];

export default function ProgressTracker({ progress }: ProgressTrackerProps) {
  const completedCount = Object.values(progress).filter(Boolean).length;
  const totalMilestones = milestones.length;
  const progressPercentage = (completedCount / totalMilestones) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      className="p-6 bg-[#343a40] backdrop-blur-xl border-2 border-gray-700/50 rounded-3xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <Rocket className="w-5 h-5 text-blue-500" />
            </div>
            Your Progress
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {completedCount} of {totalMilestones} milestones completed
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-700/50 rounded-full h-2 relative overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ delay: 0.9, duration: 1, ease: "easeOut" }}
            className="bg-gradient-to-r from-coral-500 to-purple-500 h-full rounded-full"
          />
        </div>
        <p className="text-xs text-gray-400 mt-2 text-right">
          {Math.round(progressPercentage)}% complete
        </p>
      </div>

      {/* Milestones */}
      <div className="space-y-3">
        {milestones.map((milestone, index) => {
          const isCompleted = progress[milestone.key];

          return (
            <motion.div
              key={milestone.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 + index * 0.1, duration: 0.3 }}
              className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                isCompleted
                  ? "bg-green-500/10 border-green-500/30"
                  : "bg-gray-700/20 border-gray-700/30"
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    isCompleted ? "text-white" : "text-gray-400"
                  }`}
                >
                  {milestone.label}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {milestone.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
