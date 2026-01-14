import Link from 'next/link';
import { 
  Shield, 
  Upload, 
  FileSearch, 
  Download, 
  ArrowRight, 
  Zap, 
  Search, 
  CheckCircle, 
  ShieldAlert, 
  MousePointer2,
  Menu
} from 'lucide-react';
import MobileNav from '@/components/MobileNav';
import AnalysisResults from '@/components/AnalysisResults';

const sampleResults = {
    summary: "This Independent Contractor Agreement contains several clauses that significantly favor the Client. The most critical issues relate to unlimited liability and a very broad intellectual property transfer that includes pre-existing work. We recommend negotiating these terms to protect your business assets.",
    risks: [
        {
            category: "Liability",
            severity: "Critical",
            clause: "Contractor shall indemnify and hold harmless the Client from any and all claims, damages, or losses without limitation...",
            issue: "Unlimited liability clause. This puts your entire business and personal assets at risk for any claim, regardless of fault.",
            suggestion: "Cap liability at the total amount of fees paid under the agreement or a specific dollar amount (e.g., $50,000)."
        },
        {
            category: "Intellectual Property",
            severity: "Critical",
            clause: "All work product, including any pre-existing code and tools used by Contractor, shall become the sole property of Client.",
            issue: "Overly broad IP transfer. You are losing rights to your own tools and code that you developed before this project.",
            suggestion: "Revise to ensure you retain ownership of 'Background Technology' and only transfer rights to the unique deliverables created for the Client."
        },
        {
            category: "Payment Terms",
            severity: "Medium",
            clause: "Payment shall be made within 90 days of receipt of a valid invoice.",
            issue: "Net 90 payment terms are significantly longer than the industry standard (Net 30).",
            suggestion: "Request Net 30 or Net 45 terms, and add a late fee provision for overdue payments."
        }
    ]
};

export default function HowItWorksPage() {
    return (
        <div className="min-h-screen bg-white text-gray-900">
            {/* Header */}
            <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Shield className="w-8 h-8 text-blue-600" />
                        <span className="text-2xl font-bold text-gray-900">ContractGuard AI</span>
                    </Link>
                    <nav className="flex items-center gap-6">
                        <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-blue-600">Pricing</Link>
                        <Link href="/templates" className="text-sm font-medium text-gray-600 hover:text-blue-600">Templates</Link>
                        <Link href="/analyze" className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-100">Try Free</Link>
                    </nav>
                    <MobileNav />
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-20">
                {/* Hero */}
                <div className="text-center mb-24 animate-fade-in-up">
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
                        Powerfully Simple <br />
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Legal Protection</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed animate-fade-in [animation-delay:200ms]">
                        Understanding how ContractGuard AI works is the first step toward signing your next deal with 100% confidence.
                    </p>
                </div>

                {/* Steps with "Visual Walkthrough" */}
                <div className="space-y-40">
                    {/* Step 1 */}
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-6">
                            <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-bold text-2xl shadow-xl shadow-blue-200">1</div>
                            <h2 className="text-4xl font-bold">Securely Upload</h2>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Simply drag and drop your PDF, DOCX, or text file into our secure portal. We support NDAs, SoWs, freelance agreements, and more.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    'AES-256 Bank-level encryption',
                                    'Documents never used for AI training',
                                    'Instant text extraction & cleanup'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-gray-50 p-8 rounded-[2rem] border-2 border-dashed border-gray-200 aspect-video flex flex-col items-center justify-center text-center relative overflow-hidden group">
                            <Upload className="w-16 h-16 text-blue-400 mb-4 group-hover:-translate-y-2 transition-transform" />
                            <div className="text-xl font-bold text-gray-400 uppercase tracking-widest">drop_contract.pdf</div>
                            <div className="absolute bottom-4 right-4 animate-bounce">
                                <MousePointer2 className="w-10 h-10 text-gray-900 fill-current" />
                            </div>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="grid md:grid-cols-2 gap-16 items-center md:flex-row-reverse">
                        <div className="md:order-2 space-y-6">
                            <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-bold text-2xl shadow-xl shadow-indigo-200">2</div>
                            <h2 className="text-4xl font-bold">AI Risk Scanning</h2>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Our bespoke AI model, powered by Anthropic's Claude 3.5 Sonnet, performs a deep audit across 20+ specialized legal risk categories.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                                    <ShieldAlert className="w-6 h-6 text-red-600 mb-2" />
                                    <div className="font-bold text-red-900">Payment Traps</div>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                    <Search className="w-6 h-6 text-blue-600 mb-2" />
                                    <div className="font-bold text-blue-900">IP Loopholes</div>
                                </div>
                            </div>
                        </div>
                        <div className="md:order-1 relative">
                            <div className="bg-gray-900 rounded-[2rem] p-8 shadow-2xl">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                </div>
                                <div className="space-y-4 font-mono text-sm text-blue-400">
                                    <div className="flex gap-4"><span className="text-gray-600">01</span> <span>{'{'}</span></div>
                                    <div className="flex gap-4"><span className="text-gray-600">02</span> <span className="ml-4 italic text-gray-500">// Scanning Section 4.2...</span></div>
                                    <div className="flex gap-4"><span className="text-gray-600">03</span> <span className="ml-4">"severity": <span className="text-red-400">"CRITICAL"</span>,</span></div>
                                    <div className="flex gap-4"><span className="text-gray-600">04</span> <span className="ml-4">"found": <span className="text-green-400">"Unlimited Liability"</span></span></div>
                                    <div className="flex gap-4"><span className="text-gray-600">05</span> <span>{'}'}</span></div>
                                </div>
                            </div>
                            <Zap className="absolute -top-6 -right-6 w-16 h-16 text-yellow-400 animate-pulse fill-current" />
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-6">
                            <div className="w-14 h-14 bg-green-600 text-white rounded-2xl flex items-center justify-center font-bold text-2xl shadow-xl shadow-green-200">3</div>
                            <h2 className="text-4xl font-bold">Review & Export</h2>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Get an executive breakdown of every red flag. We translate "legalese" into plain English and suggest exact wording for negotiations.
                            </p>
                            <Link 
                                href="/analyze"
                                className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline py-2"
                            >
                                Start your first scan for free <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="bg-white rounded-2xl border shadow-xl p-6 transform rotate-2 hover:rotate-0 transition-transform">
                            <div className="flex items-center justify-between border-b pb-4 mb-4">
                                <div className="font-bold">Summary Report</div>
                                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                                    <Download className="w-4 h-4 text-blue-600" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="h-4 bg-gray-100 rounded w-[90%]"></div>
                                <div className="h-4 bg-gray-100 rounded w-[80%]"></div>
                                <div className="h-4 bg-gray-100 rounded w-[70%]"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sample Report Section */}
                <div className="mt-48 pt-24 border-t">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">See a Real Sample Report</h2>
                        <p className="text-gray-600 text-lg">Below is an example of the actual analysis generated for a high-risk contractor agreement.</p>
                    </div>
                    
                    <div className="bg-gray-50 p-6 md:p-12 rounded-[3rem] border border-gray-100">
                        <AnalysisResults results={sampleResults as any} />
                    </div>
                </div>

                {/* Call to Action */}
                <div className="mt-48 bg-gray-900 rounded-[3rem] p-12 md:p-20 text-center text-white">
                    <h2 className="text-4xl md:text-5xl font-bold mb-8 italic">Ready to sign with confidence?</h2>
                    <p className="text-xl text-gray-400 mb-10 max-w-xl mx-auto">Join thousands of professionals who use ContractGuard AI to level the playing field.</p>
                    <Link 
                        href="/analyze" 
                        className="inline-block px-10 py-5 bg-blue-600 text-white rounded-2xl font-bold text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
                    >
                        Try It Now — It's Free
                    </Link>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t bg-gray-50 py-12">
                <div className="max-w-7xl mx-auto px-6 text-center space-y-4">
                    <p className="text-sm text-gray-500">© 2026 ContractGuard AI. Not a law firm. No legal advice provided.</p>
                    <Link href="/disclaimer" className="text-xs text-blue-600 font-bold hover:underline uppercase tracking-widest">Read Full Legal Disclaimer</Link>
                </div>
            </footer>
        </div>
    );
}
