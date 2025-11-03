"use client";

import { motion } from "framer-motion";
import { TrendingTopics } from "@/components/ui/TrendingTopics";
import { Search } from "lucide-react";
import { useState } from "react";

const TRENDING_TOPICS = [
  {
    title: "First-Party Data Strategy Now",
    searches: "140K",
    relatedTopics: 3
  },
  {
    title: "Hyper-Personalization Without Big Data",
    searches: "90K",
    relatedTopics: 3
  },
  {
    title: "Micro-Influencer ROI Blueprint",
    searches: "80K",
    relatedTopics: 3
  },
  {
    title: "Community Building For Sales Growth",
    searches: "70K",
    relatedTopics: 3
  }
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<typeof TRENDING_TOPICS[0] | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-tron-dark via-tron-grid to-tron-dark p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Search Section */}
        <section>
          <h2 className="text-2xl font-bold text-tron-text mb-4">
            Search Keywords
          </h2>
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search marketing trends and keywords..."
              className="w-full px-6 pr-16 py-4 bg-tron-dark/50 backdrop-blur-xl border-2 border-tron-cyan/30 rounded-2xl focus:ring-4 focus:ring-tron-cyan/20 focus:border-tron-cyan text-tron-text text-lg font-light placeholder-tron-text-muted/50 transition-all"
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-gradient-to-r from-tron-cyan to-tron-magenta rounded-xl text-white shadow-lg shadow-tron-cyan/30"
            >
              <Search className="w-5 h-5" />
            </motion.button>
          </div>
        </section>

        {/* Trending Topics Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-tron-text">
              Trending Topics
            </h2>
            <span className="text-sm text-tron-text-muted">
              {TRENDING_TOPICS.length} results
            </span>
          </div>
          <TrendingTopics
            topics={TRENDING_TOPICS}
            selectedTopic={selectedTopic}
            onTopicSelect={setSelectedTopic}
          />
        </section>
      </div>
    </div>
  )
}