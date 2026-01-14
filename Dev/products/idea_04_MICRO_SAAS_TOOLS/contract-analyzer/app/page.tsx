import Link from 'next/link';
import { 
  Shield, 
  Upload, 
  FileSearch, 
  Download, 
  CheckCircle, 
  ArrowRight, 
  Star, 
  Zap, 
  Lock, 
  Globe 
} from 'lucide-react';
import MobileNav from '@/components/MobileNav';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                ContractGuard AI
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/how-it-works" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">How it Works</Link>
            <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Pricing</Link>
            <Link href="/templates" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Templates</Link>
            <Link href="/sign-in" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Sign In</Link>
          </nav>
          <MobileNav />
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-50 rounded-full blur-[120px] opacity-60"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full mb-8 border border-blue-100 animate-fade-in">
            <Zap className="w-4 h-4 fill-current" />
            <span className="text-xs font-bold uppercase tracking-wider">Powered by Claude 3.5 Sonnet</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-extrabold text-gray-900 mb-8 tracking-tight leading-[1.1] animate-fade-in-up [animation-delay:200ms]">
            Catch Contract Red Flags <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 bg-clip-text text-transparent italic">
              Before They Catch You.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up [animation-delay:400ms]">
            Legal protection without the $400/hr lawyer bill. Scan NDAs, SoWs, and agreements in seconds with AI trained on thousands of contracts.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up [animation-delay:600ms]">
            <Link
              href="/analyze"
              className="group px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xl transition-all shadow-xl shadow-blue-200 hover:-translate-y-1 flex items-center gap-2"
            >
              Start Free Analysis
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/pricing"
              className="px-10 py-5 bg-white hover:bg-gray-50 text-gray-900 rounded-2xl font-bold text-xl transition-all border-2 border-gray-100 hover:border-gray-200"
            >
              View Pricing
            </Link>
          </div>

          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 grayscale opacity-50">
             <div className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <Globe className="w-6 h-6" /> GLOBAL_CORP
             </div>
             <div className="text-2xl font-bold text-gray-900">FREELANCE_INTL</div>
             <div className="text-xl font-bold text-gray-900 italic tracking-tighter">DESIGN_STUDIO</div>
             <div className="text-2xl font-black text-gray-900 uppercase">TechLabs</div>
          </div>
        </div>
      </section>

      {/* Trust/Benefits Section */}
      <section className="bg-gray-50 py-24 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-12">
                <div className="space-y-4">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center">
                        <Star className="w-6 h-6 text-amber-500 fill-current" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Trusted by Professionals</h3>
                    <p className="text-gray-600">Used by 5,000+ freelancers, consultants, and small business owners to prevent legal blunders.</p>
                </div>
                <div className="space-y-4">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center">
                        <Lock className="w-6 h-6 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Privacy First</h3>
                    <p className="text-gray-600">Your documents are encrypted and never used for global AI training. We protect your secrets.</p>
                </div>
                <div className="space-y-4">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center">
                        <Zap className="w-6 h-6 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Lightning Fast</h3>
                    <p className="text-gray-600">Get a comprehensive legal audit in under 60 seconds. Faster than your lawyer's coffee break.</p>
                </div>
            </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
                How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Three simple steps to legal peace of mind. No law degree required.
            </p>
        </div>

        <div className="grid md:grid-cols-3 gap-16 relative">
          {/* Connecting Line (Horizontal) - Only on desktop */}
          <div className="hidden lg:block absolute top-[20%] left-0 w-full h-0.5 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 -z-10"></div>

          <div className="text-center group">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl shadow-xl shadow-blue-200 flex items-center justify-center mx-auto mb-8 transform group-hover:-translate-y-2 transition-transform">
              <Upload className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">1. Drop your file</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Upload PDF, Word, or plain text. Our parser handles complex formatting instantly.
            </p>
          </div>

          <div className="text-center group">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl shadow-xl shadow-blue-200 flex items-center justify-center mx-auto mb-8 transform group-hover:-translate-y-2 transition-transform">
              <FileSearch className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">2. AI Audit</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Claude AI scans for payment traps, liability loopholes, and IP ownership issues.
            </p>
          </div>

          <div className="text-center group">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl shadow-xl shadow-blue-200 flex items-center justify-center mx-auto mb-8 transform group-hover:-translate-y-2 transition-transform">
              <Download className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">3. Save & Sign</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Get an executive summary and a detailed PDF audit with suggested fixes to share.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Highlight Section */}
      <section className="bg-gray-900 py-32 rounded-[3rem] mx-6">
        <div className="max-w-7xl mx-auto px-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-8 leading-tight">
                Stop guessing. <br />
                <span className="text-blue-400">Start knowing.</span>
              </h2>
              <p className="text-gray-400 text-xl mb-12 leading-relaxed">
                Most contracts are written to benefit the person who drafted them. ContractGuard levels the playing field for the modern worker.
              </p>
              
              <div className="space-y-6">
                {[
                  'Unfair payment terms (Net 90+ days)',
                  'Unlimited liability traps',
                  'Broad Intellectual Property transfers',
                  'Hidden termination penalties',
                  'Overly restrictive non-competes',
                  'Vague success criteria/scope'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 text-white font-medium">
                    <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-blue-400" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-1 shadow-2xl overflow-hidden aspect-video">
                    <div className="bg-gray-900 rounded-[1.4rem] h-full p-8 flex flex-col justify-center items-center text-center">
                        <div className="bg-red-500/10 text-red-400 px-4 py-2 rounded-lg text-sm font-bold mb-4 border border-red-500/20">
                            CRITICAL RISK FOUND
                        </div>
                        <h4 className="text-2xl font-bold text-white mb-2">Liability Clause Exceeded</h4>
                        <p className="text-gray-400 mb-6 max-w-xs">AI found "Unlimited Liability" which could put your personal assets at risk.</p>
                        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div className="w-[85%] h-full bg-red-500"></div>
                        </div>
                    </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-blue-600 rounded-full blur-[60px] opacity-30"></div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-indigo-600 rounded-full blur-[60px] opacity-30"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="text-center mb-20">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                Loved by Modern Workers
            </h2>
            <div className="flex items-center justify-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-amber-500 fill-current" />)}
            </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 text-left">
            {[
                {
                    name: "Sarah Jenkins",
                    role: "Freelance Designer",
                    quote: "I used to spend hours googling legal terms. Now I just drop my file here and I know exactly what to push back on. Saved me from a bad Net-90 deal!"
                },
                {
                    name: "David Chen",
                    role: "SaaS Consultant",
                    quote: "The risk scoring is incredible. It caught an IP ownership clause that would've cost me my base code. This tool is worth 10x the subscription."
                },
                {
                    name: "Elena Rodriguez",
                    role: "Agency Owner",
                    quote: "We run every SoW through ContractGuard before sending to our legal team. It clears up 80% of the back-and-forth instantly."
                }
            ].map((t, i) => (
                <div key={i} className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between">
                    <p className="text-gray-600 text-lg leading-relaxed italic mb-8">"{t.quote}"</p>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                            {t.name[0]}
                        </div>
                        <div>
                            <div className="font-bold text-gray-900">{t.name}</div>
                            <div className="text-sm text-gray-500">{t.role}</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-20 pb-40">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-blue-200">
            <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                    Protect Your Work. <br />
                    Secure Your Future.
                </h2>
                <p className="text-xl text-blue-100 mb-10 max-w-xl mx-auto">
                    Get your first analysis completely free. Join 5,000+ professionals who sign with confidence.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/analyze"
                        className="w-full sm:w-auto px-10 py-5 bg-white text-blue-600 rounded-2xl font-bold text-xl hover:bg-gray-50 transition-all shadow-xl"
                    >
                        Try Free Analysis
                    </Link>
                    <Link
                        href="/sign-up"
                        className="w-full sm:w-auto px-10 py-5 bg-blue-500 text-white border border-blue-400 rounded-2xl font-bold text-xl hover:bg-blue-400 transition-all shadow-xl"
                    >
                        Create Account
                    </Link>
                </div>
                <p className="text-blue-200 mt-6 text-sm">
                    No credit card required • GDPR Compliant • AES-256 Encryption
                </p>
            </div>
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-[80px]"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-32 -mb-32 blur-[80px]"></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
                <div className="flex items-center gap-2 mb-6">
                    <div className="bg-blue-600 p-1.5 rounded-lg">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-gray-900">ContractGuard AI</span>
                </div>
                <p className="text-gray-500 max-w-sm leading-relaxed">
                    AI-powered contract analysis for the modern workforce. Helping freelancers and small businesses sign with confidence.
                </p>
            </div>
            <div>
                <h4 className="font-bold text-gray-900 mb-6">Product</h4>
                <div className="flex flex-col gap-4 text-gray-500">
                    <Link href="/how-it-works" className="hover:text-blue-600">How it Works</Link>
                    <Link href="/analyze" className="hover:text-blue-600">Analyzer</Link>
                    <Link href="/templates" className="hover:text-blue-600">Templates</Link>
                    <Link href="/pricing" className="hover:text-blue-600">Pricing</Link>
                </div>
            </div>
            <div>
                <h4 className="font-bold text-gray-900 mb-6">Support</h4>
                <div className="flex flex-col gap-4 text-gray-500">
                    <Link href="#" className="hover:text-blue-600">Contact</Link>
                    <Link href="/disclaimer" className="hover:text-blue-600 font-medium text-blue-600/80">Legal Disclaimer</Link>
                    <Link href="#" className="hover:text-blue-600">Privacy Policy</Link>
                    <Link href="#" className="hover:text-blue-600">Terms of Service</Link>
                </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-sm text-gray-500 leading-relaxed max-w-2xl">
                <strong>Legal Disclaimer:</strong> ContractGuard AI is not a law firm and does not provide legal advice.
                The analysis provided is for informational purposes only. Always consult a licensed attorney before signing any contract.
            </div>
            <div className="text-sm text-gray-400 whitespace-nowrap">
                © 2026 3KPRO SERVICES. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
