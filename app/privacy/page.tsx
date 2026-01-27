import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | XELORA",
  description:
    "Read XELORA's privacy policy to understand how we collect, use, and protect your personal information and data.",
  openGraph: {
    title: "Privacy Policy | XELORA",
    description:
      "Read XELORA's privacy policy to understand how we collect, use, and protect your personal information.",
    url: "https://getxelora.com/privacy",
  },
  alternates: {
    canonical: "https://getxelora.com/privacy",
  },
};

"use client";

import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary selection:text-primary-foreground">
      <Navigation />
      
      <main className="flex-1 pt-32 pb-20 relative overflow-hidden">
        {/* Background with Grid Pattern */}
        <div 
          className="absolute inset-0 z-0 bg-grid-pattern opacity-10" 
          style={{ maskImage: "linear-gradient(to bottom, black 40%, transparent 100%)" }} 
        />

        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground uppercase tracking-tighter mb-16">
              Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40">Policy.</span>
            </h1>

            <div className="space-y-12 text-muted-foreground font-medium leading-relaxed">
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 uppercase tracking-tight">Introduction</h2>
                <p>
                  XELORA ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our social media management platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-6 uppercase tracking-tight">Information We Collect</h2>
                <h3 className="text-xl font-bold text-foreground/80 mb-3">Account Information</h3>
                <p className="mb-6">
                  When you register for XELORA, we collect your email address, name, and password. You may also provide additional profile information.
                </p>

                <h3 className="text-xl font-bold text-foreground/80 mb-3">Social Media Connections</h3>
                <p className="mb-6">
                  When you connect social media accounts (Twitter, Instagram, LinkedIn, TikTok, Facebook), we store encrypted access tokens and basic profile information to enable posting on your behalf.
                </p>

                <h3 className="text-xl font-bold text-foreground/80 mb-3">Usage Data</h3>
                <p>
                  We collect information about how you use XELORA, including campaigns created, content generated, posts published, and platform usage statistics.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-6 uppercase tracking-tight">How We Use Your Information</h2>
                <ul className="space-y-4">
                  {[
                    "Provide and maintain our service",
                    "Generate AI-powered content for your social media campaigns",
                    "Post content to your connected social media accounts",
                    "Send you service-related notifications",
                    "Improve our platform through analytics",
                    "Process payments for subscriptions",
                    "Provide customer support"
                  ].map(item => (
                    <li key={item} className="flex items-start">
                      <div className="w-1.5 h-1.5 bg-white mr-4 mt-2 rotate-45 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-6 uppercase tracking-tight">Data Security</h2>
                <p className="mb-6">
                  We implement industry-standard security measures to protect your information:
                </p>
                <ul className="space-y-4">
                  {[
                    "All social media tokens are encrypted using AES-256 encryption",
                    "HTTPS/TLS encryption for all data transmission",
                    "Secure database with row-level security policies",
                    "Regular security audits and updates"
                  ].map(item => (
                    <li key={item} className="flex items-start">
                      <div className="w-1.5 h-1.5 bg-white mr-4 mt-2 rotate-45 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-6 uppercase tracking-tight">Third-Party Services</h2>
                <p className="mb-6">
                  XELORA integrates with the following third-party services:
                </p>
                <ul className="grid md:grid-cols-2 gap-4">
                  {[
                    { label: "Social Media Platforms", value: "Twitter/X, Instagram, LinkedIn, TikTok, Facebook" },
                    { label: "AI Providers", value: "Anthropic, Google Gemini" },
                    { label: "Payment Processing", value: "Stripe" },
                    { label: "Authentication & Database", value: "Supabase" }
                  ].map(item => (
                    <div key={item.label} className="p-4 rounded border border-white/5 bg-white/2">
                       <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{item.label}</div>
                       <div className="text-foreground font-bold">{item.value}</div>
                    </div>
                  ))}
                </ul>
                <p className="mt-6">
                  Each third-party service has its own privacy policy. We encourage you to review their policies.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 uppercase tracking-tight">Data Retention</h2>
                <p>
                  We retain your personal information for as long as your account is active or as needed to provide services. You can request deletion of your account and data at any time through your account settings or by contacting support.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-6 uppercase tracking-tight">Your Rights</h2>
                <p className="mb-6">You have the right to:</p>
                <ul className="grid md:grid-cols-2 gap-4">
                   {[
                     "Access your personal data",
                     "Correct inaccurate data",
                     "Request deletion of your data",
                     "Export your data",
                     "Revoke social media connections",
                     "Opt out of marketing"
                   ].map(item => (
                     <div key={item} className="flex items-center p-3 rounded border border-white/5 bg-white/2">
                        <div className="w-1 h-1 bg-white mr-4 rotate-45 shrink-0" />
                        <span className="text-sm">{item}</span>
                     </div>
                   ))}
                </ul>
              </section>

              <section className="p-10 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md">
                <h2 className="text-2xl font-bold text-foreground mb-8 uppercase tracking-tight">Contact Interface</h2>
                <div className="grid md:grid-cols-2 gap-8 text-sm">
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground mb-3 opacity-60">Operations Channel</div>
                    <a href="mailto:support@getxelora.com" className="text-lg text-foreground hover:opacity-80 transition-opacity font-bold underline underline-offset-4">support@getxelora.com</a>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground mb-3 opacity-60">Geographic Node</div>
                    <div className="text-lg text-foreground font-bold italic">Tulsa // Oklahoma // USA</div>
                  </div>
                </div>
              </section>

              <p className="text-[10px] text-muted-foreground mt-20 pt-8 border-t border-white/10 font-bold uppercase tracking-widest opacity-60">
                Last Updated: November 24, 2024
              </p>
            </div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

