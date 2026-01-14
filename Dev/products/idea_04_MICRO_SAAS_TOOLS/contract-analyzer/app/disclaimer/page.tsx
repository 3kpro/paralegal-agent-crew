import Link from 'next/link';
import { Shield, AlertCircle, Scale, FileText, Menu } from 'lucide-react';
import MobileNav from '@/components/MobileNav';

export default function DisclaimerPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Shield className="w-8 h-8 text-blue-600" />
                        <span className="text-2xl font-bold text-gray-900">ContractGuard AI</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6">
                        <Link href="/how-it-works" className="text-sm font-medium text-gray-600 hover:text-blue-600">How it Works</Link>
                        <Link href="/analyze" className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-100">Try Free</Link>
                    </nav>
                    <MobileNav />
                </div>
            </header>

            <main className="flex-1 max-w-4xl mx-auto px-6 py-20">
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-12">
                    <div className="flex items-center gap-4 mb-8 text-blue-600">
                        <Scale className="w-12 h-12" />
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Legal Disclaimer</h1>
                    </div>

                    <div className="prose prose-blue max-w-none space-y-8 text-gray-600 leading-relaxed">
                        <section className="bg-red-50 p-6 rounded-2xl border border-red-100 flex gap-4">
                            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                            <p className="text-red-900 font-bold m-0">
                                IMPORTANT: ContractGuard AI is not a law firm. We do not provide legal advice, legal opinions, or recommendations about your legal rights, remedies, or strategies.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <FileText className="w-6 h-6 text-blue-600" />
                                1. No Attorney-Client Relationship
                            </h2>
                            <p>
                                Your use of ContractGuard AI, including any analysis results, templates, or communication with our support team, does not create an attorney-client relationship. The information provided is for informational and educational purposes only.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900">2. Automated AI Analysis</h2>
                            <p>
                                Our analysis is performed by automated Artificial Intelligence models. While we strive for accuracy, AI can make mistakes, hallucinate, or miss nuance. The analysis is a tool to help you identify <i>potential</i> risks, not a definitive legal audit.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900">3. Consult a Licensed Attorney</h2>
                            <p>
                                You should always consult with a licensed attorney in your jurisdiction before signing any legal document. A lawyer can provide advice based on your specific situation, state laws, and business objectives. ContractGuard AI should be used as a supplementary tool, never a replacement for professional legal counsel.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900">4. Limitation of Liability</h2>
                            <p>
                                ContractGuard AI (and its parent company 3KPRO SERVICES) shall not be held liable for any damages, losses, or legal issues arising from your reliance on our tools. By using this service, you acknowledge that you are doing so at your own risk.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900">5. Jurisdictional Nuances</h2>
                            <p>
                                Laws vary significantly by country, state, and province. Our general analysis may not account for local statutes, industry-specific regulations, or recent court rulings in your specific region.
                            </p>
                        </section>
                    </div>

                    <div className="mt-12 pt-8 border-t flex justify-center">
                        <Link 
                            href="/analyze" 
                            className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all"
                        >
                            Back to Application
                        </Link>
                    </div>
                </div>
            </main>

            {/* Simple Footer */}
            <footer className="py-12 text-center text-sm text-gray-400">
                <p>© 2026 ContractGuard AI. All rights reserved.</p>
            </footer>
        </div>
    );
}
