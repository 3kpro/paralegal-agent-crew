import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | XELORA",
  description:
    "Read XELORA's privacy policy to understand how we collect, use, and protect your personal information and data.",
  openGraph: {
    title: "Privacy Policy | XELORA",
    description:
      "Read XELORA's privacy policy to understand how we collect, use, and protect your personal information.",
    url: "https://xelora.app/privacy",
  },
  alternates: {
    canonical: "https://xelora.app/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-tron-darker py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-tron-text mb-8">Privacy Policy</h1>

        <div className="space-y-6 text-tron-text-muted">
          <section>
            <h2 className="text-2xl font-semibold text-tron-text mb-4">Introduction</h2>
            <p>
              XELORA ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our social media management platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-tron-text mb-4">Information We Collect</h2>
            <h3 className="text-xl font-medium text-tron-text mb-2">Account Information</h3>
            <p className="mb-4">
              When you register for XELORA, we collect your email address, name, and password. You may also provide additional profile information.
            </p>

            <h3 className="text-xl font-medium text-tron-text mb-2">Social Media Connections</h3>
            <p className="mb-4">
              When you connect social media accounts (Twitter, Instagram, LinkedIn, TikTok, Facebook), we store encrypted access tokens and basic profile information to enable posting on your behalf.
            </p>

            <h3 className="text-xl font-medium text-tron-text mb-2">Usage Data</h3>
            <p>
              We collect information about how you use XELORA, including campaigns created, content generated, posts published, and platform usage statistics.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-tron-text mb-4">How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide and maintain our service</li>
              <li>Generate AI-powered content for your social media campaigns</li>
              <li>Post content to your connected social media accounts</li>
              <li>Send you service-related notifications</li>
              <li>Improve our platform through analytics</li>
              <li>Process payments for subscriptions</li>
              <li>Provide customer support</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-tron-text mb-4">Data Security</h2>
            <p className="mb-4">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>All social media tokens are encrypted using AES-256 encryption</li>
              <li>HTTPS/TLS encryption for all data transmission</li>
              <li>Secure database with row-level security policies</li>
              <li>Regular security audits and updates</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-tron-text mb-4">Third-Party Services</h2>
            <p className="mb-4">
              XELORA integrates with the following third-party services:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Social Media Platforms:</strong> Twitter/X, Instagram, LinkedIn, TikTok, Facebook</li>
              <li><strong>AI Providers:</strong> Claude AI (Anthropic), Google Gemini</li>
              <li><strong>Payment Processing:</strong> Stripe</li>
              <li><strong>Authentication & Database:</strong> Supabase</li>
            </ul>
            <p className="mt-4">
              Each third-party service has its own privacy policy. We encourage you to review their policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-tron-text mb-4">Data Retention</h2>
            <p>
              We retain your personal information for as long as your account is active or as needed to provide services. You can request deletion of your account and data at any time through your account settings or by contacting support.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-tron-text mb-4">Your Rights</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
              <li>Revoke social media connections at any time</li>
              <li>Opt out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-tron-text mb-4">Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at:
            </p>
            <p className="mt-2">
              Email: support@xelora.app<br />
              Website: https://xelora.app
            </p>
          </section>

          <p className="text-sm text-tron-text-muted mt-8 pt-8 border-t border-tron-cyan/20">
            Last Updated: November 24, 2024
          </p>
        </div>
      </div>
    </div>
  );
}
