import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | TrendPulse',
  description: 'Privacy Policy for TrendPulse - AI-powered social media content generation platform',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-tron-dark via-tron-darker to-black">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="bg-tron-dark/50 backdrop-blur-sm border border-tron-cyan/20 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-tron-cyan to-tron-magenta mb-8">
            Privacy Policy
          </h1>
          
          <div className="space-y-6 text-tron-text">
            <p className="text-sm text-tron-text/70">
              <strong>Last Updated:</strong> November 4, 2025
            </p>

            <section>
              <h2 className="text-2xl font-semibold text-tron-cyan mb-4">1. Introduction</h2>
              <p className="leading-relaxed">
                Welcome to TrendPulse ("we," "our," or "us"). We are committed to protecting your privacy and personal information. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered 
                social media content generation platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-tron-cyan mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-tron-magenta mb-3 mt-4">2.1 Information You Provide</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Account information (name, email address, password)</li>
                <li>Social media account credentials (through OAuth connections)</li>
                <li>Content preferences and settings</li>
                <li>Generated content and campaigns</li>
                <li>Payment and billing information</li>
              </ul>

              <h3 className="text-xl font-semibold text-tron-magenta mb-3 mt-4">2.2 Automatically Collected Information</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Usage data and analytics</li>
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Cookies and similar tracking technologies</li>
                <li>Log data and performance metrics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-tron-cyan mb-4">3. How We Use Your Information</h2>
              <p className="mb-3">We use your information to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide and maintain our service</li>
                <li>Generate AI-powered content based on your preferences</li>
                <li>Connect and post to your social media accounts</li>
                <li>Process payments and billing</li>
                <li>Send service updates and notifications</li>
                <li>Improve our platform and develop new features</li>
                <li>Analyze usage patterns and optimize performance</li>
                <li>Prevent fraud and ensure platform security</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-tron-cyan mb-4">4. Social Media Integration</h2>
              <p className="leading-relaxed mb-3">
                When you connect your social media accounts (Twitter, LinkedIn, Facebook, Instagram, TikTok, Reddit), we:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Use OAuth 2.0 for secure authentication</li>
                <li>Store encrypted access tokens in our secure database</li>
                <li>Only request permissions necessary for content posting</li>
                <li>Never store your social media passwords</li>
                <li>Allow you to disconnect accounts at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-tron-cyan mb-4">5. AI Content Generation</h2>
              <p className="leading-relaxed">
                We use third-party AI services (OpenAI, Anthropic, Google Gemini) to generate content. Your prompts and 
                generated content may be processed by these services according to their respective privacy policies. We do not 
                use your data to train AI models without your explicit consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-tron-cyan mb-4">6. Data Security</h2>
              <p className="leading-relaxed mb-3">We implement industry-standard security measures:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>AES-256-GCM encryption for sensitive data</li>
                <li>Secure HTTPS connections</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication</li>
                <li>Encrypted database storage</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-tron-cyan mb-4">7. Data Sharing and Disclosure</h2>
              <p className="leading-relaxed mb-3">We may share your information with:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Service Providers:</strong> AI providers, hosting services, payment processors</li>
                <li><strong>Social Media Platforms:</strong> When you authorize content posting</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In connection with mergers or acquisitions</li>
              </ul>
              <p className="leading-relaxed mt-3">
                <strong>We never sell your personal information to third parties.</strong>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-tron-cyan mb-4">8. Your Rights</h2>
              <p className="leading-relaxed mb-3">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Delete your account and data</li>
                <li>Export your data</li>
                <li>Opt-out of marketing communications</li>
                <li>Disconnect social media accounts</li>
                <li>Object to data processing</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-tron-cyan mb-4">9. Data Retention</h2>
              <p className="leading-relaxed">
                We retain your data for as long as your account is active or as needed to provide services. 
                You can request account deletion at any time, and we will delete your data within 30 days, 
                except where required by law to retain it longer.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-tron-cyan mb-4">10. Cookies and Tracking</h2>
              <p className="leading-relaxed">
                We use cookies and similar technologies for authentication, preferences, and analytics. 
                You can control cookies through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-tron-cyan mb-4">11. Children's Privacy</h2>
              <p className="leading-relaxed">
                Our service is not intended for users under 13 years of age. We do not knowingly collect 
                information from children under 13. If we become aware of such collection, we will delete the information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-tron-cyan mb-4">12. International Data Transfers</h2>
              <p className="leading-relaxed">
                Your data may be transferred to and processed in countries other than your own. 
                We ensure appropriate safeguards are in place for such transfers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-tron-cyan mb-4">13. Changes to This Policy</h2>
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of significant changes 
                via email or through our platform. Continued use after changes constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-tron-cyan mb-4">14. Contact Us</h2>
              <p className="leading-relaxed">
                If you have questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-tron-darker/50 border border-tron-cyan/30 rounded-lg">
                <p><strong>Email:</strong> info@3kpro.xyz</p>
                <p><strong>Website:</strong> https://trendpulse.3kpro.services</p>
              </div>
            </section>

            <section className="mt-8 pt-6 border-t border-tron-cyan/20">
              <p className="text-sm text-tron-text/70">
                By using TrendPulse, you acknowledge that you have read and understood this Privacy Policy 
                and agree to its terms.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
