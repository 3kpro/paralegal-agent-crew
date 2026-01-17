import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About XELORA | A Product of 3KPRO.SERVICES",
  description:
    "XELORA is an AI-powered predictive intelligence platform for content creators, developed by 3KPRO.SERVICES, a Tulsa-based SaaS and web development company.",
  openGraph: {
    title: "About XELORA | A Product of 3KPRO.SERVICES",
    description:
      "XELORA is an AI-powered predictive intelligence platform for content creators, developed by 3KPRO.SERVICES.",
    url: "https://getxelora.com/about",
  },
  alternates: {
    canonical: "https://getxelora.com/about",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-tron-darker py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-tron-text mb-8">About XELORA</h1>

        <div className="space-y-8 text-tron-text-muted">
          <section>
            <h2 className="text-2xl font-semibold text-tron-text mb-4">
              A Product of 3KPRO.SERVICES
            </h2>
            <p className="mb-4">
              XELORA is developed and maintained by{" "}
              <a
                href="https://3kpro.services"
                target="_blank"
                rel="noopener noreferrer"
                className="text-tron-cyan hover:text-tron-cyan/80 transition-colors"
              >
                3KPRO.SERVICES
              </a>
              , a professional IT solutions company based in Tulsa, Oklahoma. We
              specialize in SaaS development, web services, and AI-powered business
              tools.
            </p>
            <p>
              Our mission is to empower creators and businesses with predictive
              intelligence tools that help them stay ahead of trends and maximize
              their content's impact.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-tron-text mb-4">
              What is XELORA?
            </h2>
            <p className="mb-4">
              XELORA is an AI-powered predictive intelligence platform designed for
              content creators, marketers, and brands. Our platform analyzes emerging
              signals across multiple platforms to reveal what's about to rise—before
              the internet reacts to it.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="bg-tron-dark/50 p-4 rounded-lg border border-tron-cyan/20">
                <h3 className="text-lg font-medium text-tron-cyan mb-2">
                  Predict Momentum
                </h3>
                <p className="text-sm">
                  Our Viral Score algorithm analyzes 1M+ viral posts to predict
                  content performance with 87% accuracy.
                </p>
              </div>
              <div className="bg-tron-dark/50 p-4 rounded-lg border border-tron-cyan/20">
                <h3 className="text-lg font-medium text-tron-cyan mb-2">
                  Engineer Virality
                </h3>
                <p className="text-sm">
                  Generate platform-optimized content for Twitter, LinkedIn,
                  Instagram, Facebook, Reddit, and TikTok.
                </p>
              </div>
              <div className="bg-tron-dark/50 p-4 rounded-lg border border-tron-cyan/20">
                <h3 className="text-lg font-medium text-tron-cyan mb-2">
                  Real-Time Signals
                </h3>
                <p className="text-sm">
                  Track emerging trends and signals before they peak, giving you
                  first-mover advantage.
                </p>
              </div>
              <div className="bg-tron-dark/50 p-4 rounded-lg border border-tron-cyan/20">
                <h3 className="text-lg font-medium text-tron-cyan mb-2">
                  Multi-Platform
                </h3>
                <p className="text-sm">
                  One campaign, six platforms. Automatically adapt content for
                  each platform's unique format.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-tron-text mb-4">
              Our Vision
            </h2>
            <p className="mb-4">
              We believe that success in content creation shouldn't be left to chance.
              By leveraging AI and predictive analytics, we're building tools that
              give creators the insights they need to make data-driven decisions
              about their content strategy.
            </p>
            <p>
              XELORA is the flagship product of the 3kpro ecosystem—a suite
              of AI-powered tools designed to help businesses and creators dominate
              the digital landscape.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-tron-text mb-4">
              About 3KPRO.SERVICES
            </h2>
            <p className="mb-4">
              <a
                href="https://3kpro.services"
                target="_blank"
                rel="noopener noreferrer"
                className="text-tron-cyan hover:text-tron-cyan/80 transition-colors"
              >
                3KPRO.SERVICES
              </a>{" "}
              is a professional IT solutions company offering:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
              <li>SaaS Product Development</li>
              <li>Custom Web Application Development</li>
              <li>AI Integration & Automation</li>
              <li>Cloud Infrastructure & DevOps</li>
              <li>Digital Marketing Solutions</li>
            </ul>
            <p>
              Based in Tulsa, Oklahoma, we serve clients worldwide with innovative
              technology solutions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-tron-text mb-4">Contact</h2>
            <p className="mb-4">
              Have questions about XELORA or interested in working with us?
            </p>
            <ul className="space-y-2">
              <li>
                <strong className="text-tron-text">Email:</strong>{" "}
                <a
                  href="mailto:info@3kpro.services"
                  className="text-tron-cyan hover:text-tron-cyan/80 transition-colors"
                >
                  info@3kpro.services
                </a>
              </li>
              <li>
                <strong className="text-tron-text">Website:</strong>{" "}
                <a
                  href="https://3kpro.services"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-tron-cyan hover:text-tron-cyan/80 transition-colors"
                >
                  3kpro.services
                </a>
              </li>
              <li>
                <strong className="text-tron-text">Location:</strong> Tulsa, Oklahoma,
                USA
              </li>
            </ul>
          </section>

          <div className="pt-8 border-t border-tron-cyan/20">
            <Link
              href="/"
              className="inline-flex items-center text-tron-cyan hover:text-tron-cyan/80 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
