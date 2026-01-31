"use client";

import { motion } from "framer-motion";
import { Wand2, Trophy } from "lucide-react";

interface QuickWinsProps {
  wins: string[];
}

export default function QuickWins({ wins }: QuickWinsProps) {
  if (!wins || wins.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.5 }}
      className="p-6 bg-gradient-to-br from-coral-500/10 to-purple-500/10 backdrop-blur-xl border-2 border-coral-500/30 rounded-3xl"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-coral-500 to-purple-500 rounded-xl">
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-bold text-white">Quick Wins</h2>
      </div>

      <div className="space-y-3">
        {wins.map((win, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + index * 0.1, duration: 0.3 }}
            className="flex items-start gap-3 p-3 bg-[#343a40]/50 rounded-xl border border-gray-700/30"
          >
            <Wand2 className="w-4 h-4 text-coral-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-200 leading-relaxed">{win}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
