"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play, PlayCircle, Clock, Eye, Lightning as Zap } from "@phosphor-icons/react";
import { BouncingDots } from "@/components/ui/bouncing-dots";

export default function DemoVideoSection() {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayVideo = () => {
    setIsPlaying(true);
    // In a real implementation, this would trigger the video player
    console.log("Playing demo video...");
  };

  return (
    <section id="demo" className="py-24 bg-tron-grid">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-tron-grid rounded-full mb-6 border border-tron-cyan">
              <Eye className="w-4 h-4 text-tron-cyan" weight="duotone" />
              <span className="text-sm font-semibold text-tron-cyan">
                See it in action
              </span>
            </div>

              <h2 className="text-4xl md:text-5xl font-bold text-tron-text mb-6">
              Watch How It Works
              <br />
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                In Just 60 Seconds
              </span>
            </h2>

            <p className="text-xl text-tron-text-muted max-w-3xl mx-auto">
              See how XELORA decodes Viral DNA and generates content in seconds.
            </p>
          </motion.div>

          {/* Video Player */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative bg-black rounded-2xl shadow-2xl overflow-hidden">
              {/* Video Placeholder */}
              <div className="aspect-video bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center relative">
                {!isPlaying ? (
                  <>
                    {/* Play Button Overlay */}
                    <button
                      onClick={handlePlayVideo}
                      className="group relative z-10"
                      aria-label="Play demo video"
                      title="Play demo video"
                    >
                      <div className="w-24 h-24 bg-tron-cyan rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                        <Play
                          className="w-12 h-12 text-tron-dark ml-1"
                          fill="currentColor"
                          weight="duotone"
                        />
                      </div>
                      <div className="absolute inset-0 bg-tron-cyan/20 rounded-full opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                    </button>

                    {/* Video Info Overlay */}
                      <div className="absolute bottom-6 left-6 flex items-center gap-4 text-white">
                      <div className="flex items-center gap-2 bg-black/50 rounded-full px-3 py-1 backdrop-blur-sm">
                        <Clock className="w-4 h-4" weight="duotone" />
                        <span className="text-sm font-medium">1:00</span>
                      </div>
                      <div className="text-sm bg-black/50 rounded-full px-3 py-1 backdrop-blur-sm">
                        60-Second Demo
                      </div>
                    </div>

                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-10 left-10 w-32 h-32 border border-white rounded-full"></div>
                      <div className="absolute bottom-10 right-10 w-24 h-24 border border-white rounded-full"></div>
                      <div className="absolute top-1/2 right-1/4 w-16 h-16 border border-white rounded-full"></div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full">
                     {/* TODO: Replace 'PLACEHOLDER_ID' with the actual YouTube Video ID */}
                  <div className="w-full h-full bg-black">
                    <video
                      className="w-full h-full object-contain"
                      src="https://hvcmidkylzrhmrwyigqr.supabase.co/storage/v1/object/public/media/marketing/Xelora_demo_YT_final.mp4"
                      controls
                      autoPlay
                      playsInline
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  </div>
                )}
              </div>

              {/* Video Controls Bar (when playing) */}

            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full opacity-20 blur-xl"></div>
            <div className="absolute -bottom-6 -left-6 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20 blur-xl"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
