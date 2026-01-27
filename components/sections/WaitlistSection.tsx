"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Envelope as Mail, CheckCircle, ArrowRight, Users } from "@phosphor-icons/react";
import { BGPattern } from "@/components/ui/bg-pattern";
import { OrbitalLoader } from "@/components/ui/orbital-loader";

export default function WaitlistSection() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);

    // Simulate API call (replace with actual email capture service)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitted(true);
    setIsSubmitting(false);
    setEmail("");

    // Reset after 3 seconds for demo purposes
    setTimeout(() => {
      setIsSubmitted(false);
    }, 3000);
  };

  if (isSubmitted) {
    return (
      <section className="py-24 bg-[#343a40] relative overflow-hidden">
        <BGPattern
          variant="dots"
          mask="fade-edges"
          size={24}
          fill="rgba(0,199,242,0.1)"
          className="z-0"
          style={{ zIndex: 0 }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto text-center"
          >
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" weight="duotone" />
            <h2 className="text-3xl font-bold text-white mb-4">
              🎉 You're on the list!
            </h2>
            <p className="text-xl text-gray-300">
              We'll notify you when XELORA launches. Get ready to
              revolutionize your content workflow!
            </p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="waitlist"
      className="py-24 bg-[#343a40] relative overflow-hidden"
    >
      {/* Background Pattern */}
      <BGPattern
        variant="dots"
        mask="fade-edges"
        size={24}
        fill="rgba(0,199,242,0.1)"
        className="z-0"
        style={{ zIndex: 0 }}
      />
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10 z-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-coral-500 rounded-full opacity-20"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-coral-500 rounded-full opacity-20"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-coral-500 rounded-full opacity-20"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Enhanced Beta Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-coral-500/20 rounded-full backdrop-blur-sm mb-8 border border-coral-500/30 shadow-xl">
            <Users className="w-5 h-5 text-coral-400" weight="duotone" />
            <span className="text-sm font-bold text-coral-400">
              🎯 2,500+ Beta Creators Already Inside
            </span>
            <span className="px-2 py-1 bg-coral-500/30 rounded-full text-xs font-semibold text-white animate-pulse">
              LIVE BETA
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Join XELORA™ Beta
            <br />
            <span className="bg-gradient-to-r from-coral-400 to-coral-600 bg-clip-text text-transparent">
              Available Now
            </span>
          </h2>

          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Beta access includes full platform features plus exclusive early
            adopter benefits:
            <strong className="text-white"> 50% lifetime pricing</strong>,
            <strong className="text-white"> priority support</strong>, and
            <strong className="text-white">
              {" "}
              first access to new features
            </strong>
            .
          </p>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-8">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" weight="duotone" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#2b2b2b] text-white placeholder-gray-400 text-lg border-2 border-gray-700/50 focus:outline-none focus:border-coral-500/50"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-4 bg-coral-500 hover:bg-coral-600 text-white rounded-xl font-semibold text-lg shadow-xl border-2 border-transparent hover:border-coral-400/50 transition-all duration-200 disabled:opacity-70 flex items-center gap-2 whitespace-nowrap"
              >
                {isSubmitting ? (
                  <>
                    <OrbitalLoader className="w-5 h-5" />
                    Joining...
                  </>
                ) : (
                  <>
                    Get Beta Access
                    <ArrowRight className="w-5 h-5" weight="duotone" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-[#2b2b2b] backdrop-blur-sm rounded-2xl p-6 border-2 border-gray-700/50 hover:border-coral-500/50 transition-all duration-200 shadow-xl">
              <div className="text-3xl font-bold text-white mb-2">50%</div>
              <div className="text-gray-300">Lifetime Pricing Lock</div>
            </div>
            <div className="bg-[#2b2b2b] backdrop-blur-sm rounded-2xl p-6 border-2 border-gray-700/50 hover:border-coral-500/50 transition-all duration-200 shadow-xl">
              <div className="text-3xl font-bold text-white mb-2">6+</div>
              <div className="text-gray-300">Platform Publishing</div>
            </div>
            <div className="bg-[#2b2b2b] backdrop-blur-sm rounded-2xl p-6 border-2 border-gray-700/50 hover:border-coral-500/50 transition-all duration-200 shadow-xl">
              <div className="text-3xl font-bold text-white mb-2">24hr</div>
              <div className="text-gray-300">Beta Support Response</div>
            </div>
          </div>

          <p className="text-sm text-gray-400 mt-8">
            No spam, unsubscribe anytime. We respect your inbox.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
