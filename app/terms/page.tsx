"use client";

import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";

export default function TermsPage() {
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
              Terms of <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40">Service.</span>
            </h1>

            <div className="space-y-12 text-muted-foreground font-medium leading-relaxed">
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 uppercase tracking-tight">1. Acceptance of Terms</h2>
                <p>
                  By accessing or using XELORA, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 uppercase tracking-tight">2. Description of Service</h2>
                <p>
                  XELORA is a social media management platform that provides AI-powered content generation, trend discovery, and multi-platform publishing capabilities for businesses and individuals.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-6 uppercase tracking-tight">3. User Accounts</h2>
                <h3 className="text-xl font-bold text-foreground/80 mb-3">Registration</h3>
                <p className="mb-6">
                  You must create an account to use XELORA. You agree to provide accurate, current information and keep your account secure.
                </p>

                <h3 className="text-xl font-bold text-foreground/80 mb-3">Account Responsibility</h3>
                <p>
                  You are responsible for all activity that occurs under your account. You must immediately notify us of any unauthorized access.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-6 uppercase tracking-tight">4. Social Media Connections</h2>
                <p className="mb-4">When you connect social media accounts to XELORA:</p>
                <ul className="space-y-4">
                  {[
                    "You grant us permission to post content on your behalf",
                    "You remain responsible for all content posted through our platform",
                    "You must comply with each platform's terms of service",
                    "You can revoke access at any time through account settings"
                  ].map(item => (
                    <li key={item} className="flex items-start">
                      <div className="w-1.5 h-1.5 bg-white mr-4 mt-2 rotate-45 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-6 uppercase tracking-tight">5. Acceptable Use</h2>
                <p className="mb-6">You agree NOT to:</p>
                <ul className="grid md:grid-cols-2 gap-4">
                   {[
                     "Post illegal or offensive content",
                     "Spam or harass others",
                     "Violate intellectual property",
                     "Circumvent security measures",
                     "Reverse engineer software",
                     "Automated scraping"
                   ].map(item => (
                     <div key={item} className="flex items-center p-3 rounded border border-white/5 bg-white/2">
                        <div className="w-1 h-1 bg-white mr-4 rotate-45 shrink-0" />
                        <span className="text-sm">{item}</span>
                     </div>
                   ))}
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-6 uppercase tracking-tight">6. Content Ownership</h2>
                <h3 className="text-xl font-bold text-foreground/80 mb-3">Your Content</h3>
                <p className="mb-6">
                  You retain ownership of all content you create. By using our service, you grant us a license to store and process your content solely to provide the service.
                </p>

                <h3 className="text-xl font-bold text-foreground/80 mb-3">AI-Generated Content</h3>
                <p>
                  Content generated by our AI tools is provided as-is. You are responsible for reviewing and editing AI-generated content before publishing.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 uppercase tracking-tight">7. Subscription and Payment</h2>
                <p>
                  Subscriptions renew automatically unless cancelled. Payment is processed through Stripe. Refunds are provided according to our policy. We reserve the right to modify pricing with notice.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 uppercase tracking-tight">8. Service Availability</h2>
                <p>
                  We strive for availability but do not guarantee uninterrupted access. We may perform maintenance or experience outages beyond our control.
                </p>
              </section>

              <section className="p-10 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md">
                <h2 className="text-2xl font-bold text-foreground mb-8 uppercase tracking-tight">Contact Interface</h2>
                <div className="grid md:grid-cols-2 gap-10 text-sm">
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground mb-3 opacity-60">Legal Channel</div>
                    <a href="mailto:support@getxelora.com" className="text-lg text-foreground hover:opacity-80 transition-opacity font-bold underline underline-offset-4">support@getxelora.com</a>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground mb-3 opacity-60">Operations Center</div>
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

