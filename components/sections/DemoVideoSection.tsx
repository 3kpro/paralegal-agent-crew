"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Clock, Eye, Brain } from "@phosphor-icons/react";
import { BGPattern } from "@/components/ui/bg-pattern";

export default function DemoVideoSection() {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayVideo = () => {
    setIsPlaying(true);
    // In a real implementation, this would trigger the video player
    console.log("Playing demo video...");
  };

  return (
    <section id="demo" className="py-24 bg-background relative overflow-hidden border-t border-border">
      {/* Background Pattern */}
      <BGPattern
        variant="grid"
        mask="fade-center"
        size={24}
        fill="rgba(0,0,0,0.05)"
        className="z-0"
        style={{ zIndex: 0 }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-none mb-6">
              <Eye className="w-4 h-4 text-foreground" weight="duotone" />
              <span className="text-sm font-bold text-foreground uppercase tracking-widest">
                See it in action
              </span>
            </div>

            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 uppercase tracking-tighter">
              Watch How It <span className="text-muted-foreground">Works.</span>
            </h2>

            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-medium">
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
            <div className="relative bg-black rounded-none shadow-2xl overflow-hidden border border-border">
              {/* Video Placeholder */}
              <div className="aspect-video bg-muted flex items-center justify-center relative">
                {!isPlaying ? (
                  <>
                    {/* Play Button Overlay */}
                    <button
                      onClick={handlePlayVideo}
                      className="group relative z-10"
                      aria-label="Play demo video"
                      title="Play demo video"
                    >
                      <div className="w-24 h-24 bg-foreground text-background flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform duration-300">
                        <Play
                          className="w-12 h-12 ml-1"
                          fill="currentColor"
                          weight="bold"
                        />
                      </div>
                    </button>

                    {/* Video Info Overlay */}
                    <div className="absolute bottom-6 left-6 flex items-center gap-4 text-foreground">
                      <div className="flex items-center gap-2 bg-background/80 border border-border rounded-none px-3 py-1 backdrop-blur-sm">
                        <Clock className="w-4 h-4" weight="bold" />
                        <span className="text-xs font-bold uppercase tracking-widest">1:00</span>
                      </div>
                      <div className="text-xs font-bold uppercase tracking-widest bg-background/80 border border-border rounded-none px-3 py-1 backdrop-blur-sm">
                        60-Second Demo
                      </div>
                    </div>

                    {/* Background decoration */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute top-10 left-10 w-32 h-32 border border-foreground rounded-full"></div>
                      <div className="absolute bottom-10 right-10 w-24 h-24 border border-foreground rounded-full"></div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full">
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
                )}
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-6 -right-6 w-12 h-12 bg-foreground/5 rounded-full filter blur-xl"></div>
            <div className="absolute -bottom-6 -left-6 w-8 h-8 bg-foreground/5 rounded-full filter blur-xl"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
