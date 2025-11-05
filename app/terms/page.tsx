import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | TrendPulse',
  description: 'Terms of Service for TrendPulse - AI-powered social media content generation platform',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-tron-dark via-tron-darker to-black">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="bg-tron-dark/50 backdrop-blur-sm border border-tron-cyan/20 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-tron-cyan to-tron-magenta mb-8">
            Terms of Service
          </h1>
          
          <div className="space-y-6 text-tron-text">
            <p className="text-sm text-tron-text/70">
              <strong>Last Updated:</strong> November 4, 2025
            </p>

            <section>
              <h2 className="text-2xl font-semibold text-tron-cyan mb-4">1. Acceptance of Terms</h2>
              <p className="leading-relaxed">
                By accessing or using TrendPulse ("Service"), you agree to be bound by these Terms of Service ("Terms"). 
                If you do not agree to these Terms, do not use the Service. These Terms constitute a legally binding 
                agreement between you and 3K Pro Services ("Company," "we," "us," or "our").
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-tron-cyan mb-4">2. Description of Service</h2>
              <p className="leading-relaxed">
                TrendPulse is an AI-powered platform that enables users to generate and publish social media content 
                across multiple platforms including Twitter, LinkedIn, Facebook, Instagram, TikTok, and Reddit. 
                The Service uses artificial intelligence to create content based on user preferences and trending topics.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-tron-cyan mb-4">3. Eligibility</h2>
              <p className="leading-relaxed mb-3">To use the Service, you must:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Be at least 13 years of age</li>
                <li>Have the legal capacity to enter into binding contracts</li>
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-tron-cyan mb-4">4. Account Registration</h2>
              <p className="leading-relaxed mb-3">When creating an account, you agree to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your information as necessary</li>
                <li>Keep your password secure and confidential</li>
                <li>Notify us immediately of unauthorized access</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-tron-cyan mb-4">5. Social Media Account Connections</h2>
              <p className="leading-relaxed mb-3">By connecting social media accounts, you:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Authorize us to access and post content on your behalf</li>
                <li>Grant us permission to use necessary API access</li>
                <li>Acknowledge that you comply with each platform's terms of service</li>
                <li>Accept responsibility for all content posted through our Service</li>
                <li>Understand you can disconnect accounts at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-tron-cyan mb-4">6. AI-Generated Content</h2>
              
              <h3 className="text-xl font-semibold text-tron-magenta mb-3 mt-4">6.1 Content Ownership</h3>
              <p className="leading-relaxed">
                You retain ownership of content generated through the Service. However, you grant us a non-exclusive, 
                worldwide, royalty-free license to use, store, and process your content to provide the Service.
              </p>

              <h3 className="text-xl font-semibold text-tron-magenta mb-3 mt-4">6.2 Content Responsibility</h3>
              <p className="leading-relaxed mb-3">You are solely responsible for:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Reviewing all AI-generated content before publishing</li>
                <li>Ensuring content accuracy and appropriateness</li>
                <li>Compliance with platform-specific content policies</li>
                <li>Any legal consequences arising from published content</li>
              </ul>

              <h3 className="text-xl font-semibold text-tron-magenta mb-3 mt-4">6.3 No Guarantees</h3>
              <p className="leading-relaxed">
                We do not guarantee that AI-generated content will be error-free, suitable for your purposes, 
                or compliant with all regulations. Content should be reviewed and edited as needed.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-tron-cyan mb-4">7. Prohibited Uses</h2>
              <p className="leading-relaxed mb-3">You agree NOT to use the Service to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Generate illegal, harmful, or fraudulent content</li>
                <li>Violate intellectual property rights</li>
                <li>Spread misinformation or spam</li>
                <li>Harass, threaten, or abuse others</li>
                <li>Violate any social media platform's terms of service</li>
                <li>Attempt to gain unauthorized access to systems</li>
                <li>Interfere with or disrupt the Service</li>
                <li>Use automated tools to abuse the Service</li>
                <li>Resell or redistribute the Service without authorization</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-tron-cyan mb-4">8. Subscription and Payment</h2>
              
              <h3 className="text-xl font-semibold text-tron-magenta mb-3 mt-4">8.1 Pricing</h3>
              <p className="leading-relaxed">
                Subscription prices are listed on our website and may change with 30 days' notice. 
                You will be charged the rate in effect at the time of your renewal.
              </p>

              <h3 className="text-xl font-semibold text-tron-magenta mb-3 mt-4">8.2 Billing</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Subscriptions automatically renew unless canceled</li>
                <li>Payment is due at the start of each billing period</li>
                <li>Failed payments may result in service suspension</li>
                <li>No refunds for partial months or unused services</li>
              </ul>

              <h3 className="text-xl font-semibold text-tron-magenta mb-3 mt-4">8.3 Cancellation</h3>
              <p className="leading-relaxed">
                You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-tron-cyan mb-4">9. Intellectual Property</h2>
              <p className="leading-relaxed">
                The Service, including all software, designs, text, graphics, and other content (excluding user-generated content), 
                is owned by us or our licensors and protected by copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-tron-cyan mb-4">10. Third-Party Services</h2>
              <p className="leading-relaxed">
                The Service integrates with third-party AI providers (OpenAI, Anthropic, Google) and social media platforms. 
                Your use of these services is subject to their respective terms and privacy policies. We are not responsible 
                for third-party services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-tron-cyan mb-4">11. Disclaimers</h2>
              <div className="bg-tron-darker/50 border border-tron-magenta/30 rounded-lg p-4">
                <p className="leading-relaxed mb-3">
                  <strong>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND.</strong>
                </p>
                <p className="leading-relaxed">
                  We disclaim all warranties, express or implied, including merchantability, fitness for a particular purpose, 
                  and non-infringement. We do not warrant that the Service will be uninterrupted, secure, or error-free.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-tron-cyan mb-4">12. Limitation of Liability</h2>
              <div className="bg-tron-darker/50 border border-tron-magenta/30 rounded-lg p-4">
                <p className="leading-relaxed">
                  <strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</strong> We shall not be liable for any indirect, 
                  incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, 
                  arising from your use of the Service. Our total liability shall not exceed the amount you paid us in 
                  the 12 months preceding the claim.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-tron-cyan mb-4">13. Indemnification</h2>
              <p className="leading-relaxed">
                You agree to indemnify and hold harmless the Company, its officers, directors, employees, and agents from 
                any claims, damages, liabilities, and expenses (including legal fees) arising from your use of the Service, 
                violation of these Terms, or infringement of third-party rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-tron-cyan mb-4">14. Termination</h2>
              <p className="leading-relaxed mb-3">We may suspend or terminate your account if you:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Violate these Terms</li>
                <li>Engage in fraudulent or illegal activity</li>
                <li>Fail to pay subscription fees</li>
                <li>Abuse or misuse the Service</li>
              </ul>
              <p className="leading-relaxed mt-3">
                Upon termination, your right to use the Service immediately ceases, and we may delete your data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-tron-cyan mb-4">15. Governing Law</h2>
              <p className="leading-relaxed">
                These Terms are governed by the laws of the jurisdiction in which the Company operates, 
                without regard to conflict of law principles. Any disputes shall be resolved in the courts 
                of that jurisdiction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-tron-cyan mb-4">16. Changes to Terms</h2>
              <p className="leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify you of material changes 
                via email or through the Service. Continued use after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-tron-cyan mb-4">17. Severability</h2>
              <p className="leading-relaxed">
                If any provision of these Terms is found unenforceable, the remaining provisions shall continue in full effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-tron-cyan mb-4">18. Entire Agreement</h2>
              <p className="leading-relaxed">
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and the Company 
                regarding the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-tron-cyan mb-4">19. Contact Information</h2>
              <p className="leading-relaxed">
                For questions about these Terms, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-tron-darker/50 border border-tron-cyan/30 rounded-lg">
                <p><strong>3K Pro Services</strong></p>
                <p><strong>Email:</strong> info@3kpro.xyz</p>
                <p><strong>Website:</strong> https://trendpulse.3kpro.services</p>
              </div>
            </section>

            <section className="mt-8 pt-6 border-t border-tron-cyan/20">
              <p className="text-sm text-tron-text/70">
                By using TrendPulse, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
