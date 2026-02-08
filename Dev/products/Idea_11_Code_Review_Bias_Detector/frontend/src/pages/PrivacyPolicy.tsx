import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-gray-400 mb-8">
          <strong>Effective Date:</strong> February 7, 2026
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-gray-300 leading-relaxed">
              FairMerge ("we," "our," or "us") is an engineering velocity optimization tool provided by 3K Pro Services LLC.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service
              to analyze code review patterns and improve team productivity.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              FairMerge is designed as a <strong>team analytics tool for engineering managers</strong>, not an employee monitoring
              or HR surveillance system. We focus on aggregate insights to help teams identify bottlenecks and optimize workflows.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>

            <h3 className="text-xl font-medium mt-6 mb-3">2.1 Account Information</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Email address (via GitHub OAuth or direct signup)</li>
              <li>GitHub username and user ID</li>
              <li>Organization/team name (if provided)</li>
              <li>Subscription and billing information (processed by Stripe)</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">2.2 Repository Data (via GitHub OAuth)</h3>
            <p className="text-gray-300 leading-relaxed mb-3">
              When you connect your GitHub account, we collect metadata from pull requests in authorized repositories:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li><strong>Pull Request Metadata:</strong> PR titles, timestamps, status (open/closed/merged), file paths</li>
              <li><strong>Review Data:</strong> Review comments (text content), comment timestamps, reviewer usernames</li>
              <li><strong>Comment Classification:</strong> Our AI categorizes comments by type (nitpick, critical, process, toxic, praise)</li>
              <li><strong>Velocity Metrics:</strong> Time-to-first-review, time-to-merge, review load distribution</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-3">
              <strong>Important:</strong> We do NOT collect source code, file contents, or commit diffs. We only analyze
              review patterns and metadata.
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">2.3 Usage Data</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Login timestamps and IP addresses</li>
              <li>Dashboard views and report generations</li>
              <li>Feature usage patterns (e.g., export report, view specific charts)</li>
              <li>Browser type and device information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside text-gray-300 space-y-3 ml-4">
              <li>
                <strong>Velocity Analysis:</strong> To generate insights on nitpick ratios, review load balance, and PR staleness
                to help teams optimize workflows
              </li>
              <li>
                <strong>Report Generation:</strong> To create "Team Health Check" reports showing aggregate velocity metrics
              </li>
              <li>
                <strong>AI Classification:</strong> To categorize review comments using Google Gemini AI (see Section 7)
              </li>
              <li>
                <strong>Service Delivery:</strong> To provide dashboard access, handle authentication, and manage subscriptions
              </li>
              <li>
                <strong>Product Improvement:</strong> To analyze aggregated, anonymized usage patterns to improve FairMerge features
              </li>
              <li>
                <strong>Communication:</strong> To send service updates, billing notices, and respond to support requests
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Data Retention</h2>
            <p className="text-gray-300 leading-relaxed">
              <strong>Active Analysis Window:</strong> We analyze the most recent 90 days of pull request data by default.
              Historical data older than 90 days is automatically purged unless you explicitly configure a longer retention window.
            </p>
            <p className="text-gray-300 leading-relaxed mt-3">
              <strong>Account Data:</strong> Your account information and subscription data are retained as long as your account
              is active. Upon account deletion, all data is permanently deleted within 30 days.
            </p>
            <p className="text-gray-300 leading-relaxed mt-3">
              <strong>Exported Reports:</strong> Any reports you download or export are your responsibility. We do not retain
              copies of exported reports after delivery.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Data Sharing and Disclosure</h2>

            <h3 className="text-xl font-medium mt-6 mb-3">5.1 No Third-Party Sales</h3>
            <p className="text-gray-300 leading-relaxed">
              We do NOT sell, rent, or trade your data to third parties for marketing purposes. Ever.
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">5.2 Service Providers (Subprocessors)</h3>
            <p className="text-gray-300 leading-relaxed mb-3">
              We share data with the following trusted service providers who help us operate FairMerge:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li><strong>Google Gemini AI:</strong> Processes review comments for AI classification (GDPR-compliant)</li>
              <li><strong>Supabase:</strong> Database hosting and authentication (SOC 2 Type II certified)</li>
              <li><strong>Stripe:</strong> Payment processing and subscription management (PCI-DSS compliant)</li>
              <li><strong>Railway:</strong> Backend API hosting (SOC 2 Type II certified)</li>
              <li><strong>Vercel:</strong> Frontend hosting and CDN</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">5.3 Legal Obligations</h3>
            <p className="text-gray-300 leading-relaxed">
              We may disclose your information if required by law, court order, or government regulation, or to protect
              the rights, property, or safety of FairMerge, our users, or the public.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Your Privacy Rights (GDPR & CCPA)</h2>

            <h3 className="text-xl font-medium mt-6 mb-3">6.1 Access and Portability</h3>
            <p className="text-gray-300 leading-relaxed">
              You have the right to request a copy of all personal data we hold about you in a machine-readable format.
              Contact <a href="mailto:support@3kpro.services" className="text-blue-400 hover:underline">support@3kpro.services</a> to request a data export.
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">6.2 Right to Deletion</h3>
            <p className="text-gray-300 leading-relaxed">
              You can delete your account and all associated data at any time from the Settings page, or by emailing
              <a href="mailto:support@3kpro.services" className="text-blue-400 hover:underline">support@3kpro.services</a>.
              Deletion is permanent and cannot be undone.
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">6.3 Right to Rectification</h3>
            <p className="text-gray-300 leading-relaxed">
              If you believe any data we hold is inaccurate, you can update your account information or contact us to
              correct it.
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">6.4 Right to Object</h3>
            <p className="text-gray-300 leading-relaxed">
              You can revoke GitHub OAuth access at any time, which will stop us from collecting new repository data.
              Existing data will remain until you delete your account.
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">6.5 CCPA Rights (California Residents)</h3>
            <p className="text-gray-300 leading-relaxed">
              California residents have additional rights under the CCPA, including the right to know what personal information
              is collected, the right to opt-out of "sales" (we don't sell data), and the right to non-discrimination for
              exercising privacy rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. AI Processing and Google Gemini</h2>
            <p className="text-gray-300 leading-relaxed">
              FairMerge uses <strong>Google Gemini AI</strong> to classify review comments into categories (nitpick, critical,
              process, toxic, praise). This processing:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mt-3">
              <li>Is performed in real-time and not stored by Google after classification</li>
              <li>Does NOT use your data to train Google's AI models (per Google Cloud AI enterprise terms)</li>
              <li>Is GDPR-compliant under Google's Data Processing Amendment</li>
              <li>Does NOT include source code (only review comment text)</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-3">
              You can view Google's privacy practices at <a href="https://cloud.google.com/terms/cloud-privacy-notice" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">cloud.google.com/terms/cloud-privacy-notice</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Data Security</h2>
            <p className="text-gray-300 leading-relaxed">
              We implement industry-standard security measures to protect your data:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mt-3">
              <li><strong>Encryption in Transit:</strong> All data is transmitted over HTTPS/TLS 1.3</li>
              <li><strong>Encryption at Rest:</strong> Database data is encrypted using AES-256</li>
              <li><strong>Access Controls:</strong> Role-based access control (RBAC) limits internal data access</li>
              <li><strong>OAuth Security:</strong> GitHub tokens are stored securely and never logged</li>
              <li><strong>Regular Audits:</strong> We conduct quarterly security reviews and penetration tests</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-3">
              However, no system is 100% secure. If you discover a security vulnerability, please report it to
              <a href="mailto:security@3kpro.services" className="text-blue-400 hover:underline">security@3kpro.services</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. International Data Transfers</h2>
            <p className="text-gray-300 leading-relaxed">
              FairMerge is operated from the United States. If you are located outside the U.S., your data will be
              transferred to and processed in the U.S. We rely on Standard Contractual Clauses (SCCs) approved by the
              European Commission for GDPR compliance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
            <p className="text-gray-300 leading-relaxed">
              FairMerge is not intended for use by individuals under the age of 18. We do not knowingly collect personal
              information from children. If you believe we have inadvertently collected data from a minor, contact us
              immediately at <a href="mailto:support@3kpro.services" className="text-blue-400 hover:underline">support@3kpro.services</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Changes to This Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update this Privacy Policy from time to time. If we make material changes, we will notify you via
              email or a prominent notice in the FairMerge dashboard at least 30 days before the changes take effect.
              Continued use of FairMerge after changes indicates acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
            <p className="text-gray-300 leading-relaxed">
              If you have questions about this Privacy Policy or your personal data, contact us at:
            </p>
            <div className="bg-gray-800 p-6 rounded-lg mt-4">
              <p className="text-gray-300"><strong>3K Pro Services LLC</strong></p>
              <p className="text-gray-300">Email: <a href="mailto:support@3kpro.services" className="text-blue-400 hover:underline">support@3kpro.services</a></p>
              <p className="text-gray-300">Security: <a href="mailto:security@3kpro.services" className="text-blue-400 hover:underline">security@3kpro.services</a></p>
              <p className="text-gray-300">Website: <a href="https://3kpro.services" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">3kpro.services</a></p>
              <p className="text-gray-300 mt-2 text-sm text-gray-400">
                For GDPR-related inquiries, please include "GDPR Request" in your subject line.
              </p>
            </div>
          </section>

          <section className="pt-8 border-t border-gray-700">
            <p className="text-gray-400 text-sm">
              <strong>Last Updated:</strong> February 7, 2026<br />
              <strong>Version:</strong> 1.0
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
