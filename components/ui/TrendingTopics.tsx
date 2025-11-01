"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrendingTopic {
  title: string;
  searches?: string;
  relatedTopics?: number;
}

interface TrendingTopicsProps {
  topics: TrendingTopic[];
  onTopicSelect?: (topic: TrendingTopic) => void;
  selectedTopic?: TrendingTopic | null;
  className?: string;
}

export const TrendingTopics = ({
  topics,
  onTopicSelect,
  selectedTopic,
  className,
}: TrendingTopicsProps) => {
  return (
    <div className={cn("space-y-3", className)}>
      {topics.map((topic, i) => (
        <motion.button
          key={topic.title}
          onClick={() => onTopicSelect?.(topic)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className={cn(
            "group w-full text-left p-4 rounded-xl border-2 backdrop-blur-sm transition-all duration-300",
            "hover:border-tron-cyan hover:bg-tron-cyan/10 hover:shadow-lg hover:shadow-tron-cyan/20",
            selectedTopic?.title === topic.title
              ? "border-tron-cyan bg-tron-cyan/10"
              : "border-tron-cyan/20 bg-tron-dark/50"
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className={cn(
                "text-lg font-semibold transition-colors duration-300",
                selectedTopic?.title === topic.title
                  ? "text-tron-cyan"
                  : "text-tron-text group-hover:text-tron-cyan"
              )}>
                {topic.title}
              </h3>
              <div className="flex items-center gap-3 mt-1 text-sm">
                {topic.searches && (
                  <span className="text-tron-text-muted">
                    {topic.searches} searches
                  </span>
                )}
                {topic.relatedTopics && (
                  <span className="text-tron-cyan">
                    +{topic.relatedTopics} related topics
                  </span>
                )}
              </div>
            </div>
            <ChevronRight className={cn(
              "w-5 h-5 transform transition-all duration-300",
              "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0",
              selectedTopic?.title === topic.title
                ? "text-tron-cyan"
                : "text-tron-text-muted"
            )} />
          </div>
        </motion.button>
      ))}
    </div>
  );
};