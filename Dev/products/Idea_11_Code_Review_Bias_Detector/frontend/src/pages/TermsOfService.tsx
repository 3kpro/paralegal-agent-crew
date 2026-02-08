import React from 'react';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-gray-400 mb-8">
          <strong>Effective Date:</strong> February 7, 2026
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              These Terms of Service ("Terms") govern your access to and use of FairMerge, an engineering velocity optimization
              tool provided by <strong>3K Pro Services LLC</strong> ("we," "our," or "us"). By creating an account or using
              FairMerge, you agree to be bound by these Terms.
            </p>
            <p className="text-gray-300 leading-relaxed mt-3">
              If you are using FairMerge on behalf of an organization, you represent that you have the authority to bind
              that organization to these Terms, and "you" refers to both you and the organization.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-gray-300 leading-relaxed">
              FairMerge is a <strong>team analytics tool for engineering managers</strong> designed to:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mt-3">
              <li>Analyze pull request review patterns to identify workflow bottlenecks</li>
              <li>Measure "Nitpick Ratio" (style comments vs. substantive feedback)</li>
              <li>Visualize review load distribution to prevent reviewer burnout</li>
              <li>Track PR staleness (time-to-first-review metrics)</li>
              <li>Generate "Team Health Check" reports with actionable velocity insights</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-3">
              FairMerge is <strong>NOT</strong> an employee monitoring tool, HR surveillance system, or performance evaluation
              platform. It is designed to optimize team processes, not to track individual productivity.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Account Registration and Security</h2>

            <h3 className="text-xl font-medium mt-6 mb-3">3.1 Account Creation</h3>
            <p className="text-gray-300 leading-relaxed">
              You must provide accurate and complete information when creating an account. You are responsible for maintaining
              the confidentiality of your account credentials and for all activities that occur under your account.
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">3.2 GitHub OAuth Access</h3>
            <p className="text-gray-300 leading-relaxed">
              By connecting your GitHub account, you grant FairMerge read-only access to repository metadata (pull requests,
              reviews, comments). You may revoke this access at any time through your GitHub account settings.
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">3.3 Account Termination</h3>
            <p className="text-gray-300 leading-relaxed">
              You may delete your account at any time from the Settings page. We reserve the right to suspend or terminate
              accounts that violate these Terms or engage in abusive behavior.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use Policy</h2>

            <h3 className="text-xl font-medium mt-6 mb-3">4.1 Permitted Uses</h3>
            <p className="text-gray-300 leading-relaxed">You may use FairMerge to:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mt-3">
              <li>Analyze your own team's code review patterns</li>
              <li>Generate reports to optimize team workflows and processes</li>
              <li>Identify bottlenecks and improve engineering velocity</li>
              <li>Export data for internal team discussions or presentations</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">4.2 Prohibited Uses</h3>
            <p className="text-gray-300 leading-relaxed">You may NOT use FairMerge to:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mt-3">
              <li>
                <strong>Employee Surveillance:</strong> Track individual developer productivity, performance reviews, or
                disciplinary actions
              </li>
              <li>
                <strong>Harassment:</strong> Use insights to target, demote, or discriminate against specific team members
              </li>
              <li>
                <strong>Unauthorized Access:</strong> Analyze repositories you do not have permission to access
              </li>
              <li>
                <strong>Data Scraping:</strong> Extract data via automated means beyond the FairMerge interface
              </li>
              <li>
                <strong>Reverse Engineering:</strong> Attempt to decompile, disassemble, or reverse engineer the service
              </li>
              <li>
                <strong>Malicious Activity:</strong> Introduce viruses, malware, or engage in activities that disrupt the service
              </li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-3">
              Violation of this policy may result in immediate account suspension and, where applicable, legal action.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Subscription and Billing</h2>

            <h3 className="text-xl font-medium mt-6 mb-3">5.1 Pricing Plans</h3>
            <p className="text-gray-300 leading-relaxed">
              FairMerge offers the following subscription tiers:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mt-3">
              <li><strong>Team Plan:</strong> $149/month (billed monthly)</li>
              <li><strong>Growth Plan:</strong> $349/month (billed monthly)</li>
              <li><strong>Enterprise Plan:</strong> $749/month (custom billing available)</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-3">
              Pricing is subject to change with 30 days' notice. Current customers will be grandfathered at their existing
              rate for 12 months.
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">5.2 Payment Terms</h3>
            <p className="text-gray-300 leading-relaxed">
              Subscriptions are billed monthly via Stripe. You authorize us to charge your payment method on file at the
              start of each billing cycle. If payment fails, we will attempt to charge your card up to 3 times over 10 days.
              If payment is not resolved, your account will be suspended.
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">5.3 Cancellation and Refunds</h3>
            <p className="text-gray-300 leading-relaxed">
              You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing cycle
              (no prorated refunds). After cancellation, you will retain read-only access to exported reports, but will not
              be able to generate new analyses.
            </p>
            <p className="text-gray-300 leading-relaxed mt-3">
              <strong>Refund Policy:</strong> We offer a full refund within the first 14 days of your initial subscription
              if you are not satisfied. After 14 days, all payments are non-refundable. Contact
              <a href="mailto:support@3kpro.services" className="text-blue-400 hover:underline ml-1">support@3kpro.services</a> to request a refund.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>

            <h3 className="text-xl font-medium mt-6 mb-3">6.1 Your Data</h3>
            <p className="text-gray-300 leading-relaxed">
              You retain all rights to your repository data. FairMerge analyzes your data to generate insights, but does
              not claim ownership of your pull requests, comments, or team information.
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">6.2 Generated Reports</h3>
            <p className="text-gray-300 leading-relaxed">
              Reports generated by FairMerge (including charts, metrics, and AI classifications) belong to you. You may
              share, present, or publish these reports without restriction.
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">6.3 FairMerge Platform</h3>
            <p className="text-gray-300 leading-relaxed">
              FairMerge's software, algorithms, UI design, and branding are the intellectual property of 3K Pro Services LLC.
              You may not copy, modify, distribute, or create derivative works based on FairMerge without our written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Disclaimer of Warranties</h2>
            <p className="text-gray-300 leading-relaxed">
              FairMerge is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express or implied,
              including but not limited to:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mt-3">
              <li><strong>Accuracy:</strong> We do not guarantee that AI classifications or metrics are 100% accurate</li>
              <li><strong>Availability:</strong> We do not guarantee uninterrupted or error-free service</li>
              <li><strong>Fitness for Purpose:</strong> FairMerge provides insights, not guarantees of improved velocity</li>
              <li><strong>Third-Party Integrations:</strong> GitHub or other integrations may change or break without notice</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-3">
              You acknowledge that FairMerge is a decision-support tool. You are solely responsible for how you interpret
              and act on insights generated by the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-300 leading-relaxed">
              To the maximum extent permitted by law, 3K Pro Services LLC and its affiliates, officers, employees, and
              agents shall not be liable for:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mt-3">
              <li><strong>Indirect Damages:</strong> Loss of profits, data, goodwill, or business opportunities</li>
              <li><strong>Service Interruptions:</strong> Downtime, data loss, or service degradation</li>
              <li><strong>Misuse of Insights:</strong> Employment decisions, legal disputes, or discrimination claims arising from FairMerge data</li>
              <li><strong>Third-Party Actions:</strong> GitHub API changes, OAuth revocations, or external service failures</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-3">
              Our total liability for any claims arising from your use of FairMerge is limited to the amount you paid us
              in the 12 months preceding the claim (or $500, whichever is greater).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Indemnification</h2>
            <p className="text-gray-300 leading-relaxed">
              You agree to indemnify and hold harmless 3K Pro Services LLC from any claims, damages, or expenses (including
              attorney fees) arising from:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mt-3">
              <li>Your violation of these Terms</li>
              <li>Your misuse of FairMerge (e.g., employee surveillance, harassment)</li>
              <li>Your violation of any third-party rights (e.g., accessing unauthorized repositories)</li>
              <li>Any employment or HR disputes arising from your use of FairMerge insights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Dispute Resolution</h2>

            <h3 className="text-xl font-medium mt-6 mb-3">10.1 Informal Resolution</h3>
            <p className="text-gray-300 leading-relaxed">
              Before filing a lawsuit, you agree to contact us at
              <a href="mailto:support@3kpro.services" className="text-blue-400 hover:underline ml-1">support@3kpro.services</a> to attempt to resolve the dispute informally.
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">10.2 Governing Law and Jurisdiction</h3>
            <p className="text-gray-300 leading-relaxed">
              These Terms are governed by the laws of the State of Oklahoma, without regard to its conflict of law principles.
              Any legal action or proceeding arising under these Terms will be brought exclusively in the federal or state
              courts located in Tulsa County, Oklahoma.
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">10.3 Arbitration</h3>
            <p className="text-gray-300 leading-relaxed">
              For disputes exceeding $10,000, you agree to resolve the dispute through binding arbitration under the rules
              of the American Arbitration Association (AAA). Arbitration will be conducted in Tulsa, Oklahoma, or remotely
              at your option.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update these Terms from time to time. If we make material changes, we will notify you via email or
              a prominent notice in the FairMerge dashboard at least 30 days before the changes take effect. Continued
              use of FairMerge after changes indicates acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Severability</h2>
            <p className="text-gray-300 leading-relaxed">
              If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will remain
              in full force and effect. The invalid provision will be modified to reflect the parties' intention as closely
              as possible.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Entire Agreement</h2>
            <p className="text-gray-300 leading-relaxed">
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and 3K Pro Services LLC
              regarding FairMerge. They supersede all prior agreements, understandings, or representations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">14. Contact Information</h2>
            <p className="text-gray-300 leading-relaxed">
              If you have questions about these Terms or need support, contact us at:
            </p>
            <div className="bg-gray-800 p-6 rounded-lg mt-4">
              <p className="text-gray-300"><strong>3K Pro Services LLC</strong></p>
              <p className="text-gray-300">Email: <a href="mailto:support@3kpro.services" className="text-blue-400 hover:underline">support@3kpro.services</a></p>
              <p className="text-gray-300">Legal: <a href="mailto:legal@3kpro.services" className="text-blue-400 hover:underline">legal@3kpro.services</a></p>
              <p className="text-gray-300">Website: <a href="https://3kpro.services" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">3kpro.services</a></p>
              <p className="text-gray-300 mt-2 text-sm text-gray-400">
                For legal inquiries, please include "FairMerge Legal" in your subject line.
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

export default TermsOfService;
