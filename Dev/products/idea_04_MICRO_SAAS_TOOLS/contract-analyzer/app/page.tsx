import Link from 'next/link';
import { Shield, Upload, FileSearch, Download, CheckCircle } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">ContractGuard AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
            <Link href="/templates" className="text-gray-600 hover:text-gray-900">Templates</Link>
            <Link href="/login" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-6">
            <span className="text-sm font-semibold text-blue-600">AI-Powered Contract Analysis</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Catch Contract Red Flags
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Before You Sign
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Legal protection without the legal bill. Analyze NDAs, SoWs, and agreements in 60 seconds.
            No lawyer required.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              href="/analyze"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg transition-colors shadow-lg shadow-blue-200"
            >
              Try Free Analysis
            </Link>
            <Link
              href="/demo"
              className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg font-semibold text-lg transition-colors border-2 border-gray-200"
            >
              Watch Demo
            </Link>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            No credit card required • 1 free analysis
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
          How It Works
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">1. Upload Contract</h3>
            <p className="text-gray-600">
              Drop your PDF, Word, or text file. We support NDAs, SoWs, freelance agreements, and more.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileSearch className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">2. AI Analysis</h3>
            <p className="text-gray-600">
              Claude AI scans for 20+ red flags: payment terms, liability, IP ownership, and more.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">3. Get Report</h3>
            <p className="text-gray-600">
              Download a professional PDF report with plain-English explanations and suggested fixes.
            </p>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="max-w-7xl mx-auto px-6 py-20 bg-white/50 rounded-3xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
          What We Detect
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            'Unfair payment terms (Net 90+, missing schedules)',
            'Unlimited liability clauses',
            'Broad IP ownership (client owns all your work)',
            'Missing termination clauses',
            'One-sided indemnification',
            'Overly broad non-competes',
            'Missing confidentiality terms',
            'Ambiguous success criteria',
          ].map((feature, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Don't Sign Blind
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Get your first contract analyzed free. No credit card required.
          </p>
          <Link
            href="/analyze"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
          >
            Analyze Contract Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">
              <strong>Legal Disclaimer:</strong> ContractGuard AI is not a law firm and does not provide legal advice.
              This analysis is for informational purposes only. Always consult a licensed attorney before signing any contract.
            </p>
            <p>&copy; 2026 ContractGuard AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
