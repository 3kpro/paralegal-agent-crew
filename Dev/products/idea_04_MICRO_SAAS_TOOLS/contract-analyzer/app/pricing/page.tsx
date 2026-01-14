"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Shield, Check, Loader2, Menu } from 'lucide-react';
import { createCheckoutSession } from '@/app/actions/create-checkout';
import MobileNav from '@/components/MobileNav';
import { toast } from 'sonner';

const plans = [
    {
        name: "Free",
        price: "$0",
        description: "Perfect for a single contract review.",
        features: [
            "1 Contract Analysis",
            "Basic Risk Detection",
            "Web Results View",
            "Community Support"
        ],
        buttonText: "Current Plan",
        disabled: true,
    },
    {
        name: "Pro Monthly",
        price: "$14",
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY || "", // Should be in env
        description: "For active freelancers and consultants.",
        features: [
            "Unlimited Analyses",
            "Advanced Risk Detection",
            "Downloadable PDF Reports",
            "Priority Support",
            "Risk Score Tracking"
        ],
        buttonText: "Upgrade to Pro",
        mode: 'subscription' as const,
        highlight: true,
    },
    {
        name: "Lifetime",
        price: "$99",
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_LIFETIME || "", // Should be in env
        description: "Pay once, protected forever.",
        features: [
            "Everything in Pro",
            "One-time Payment",
            "Future Feature Access",
            "Premium Templates (Soon)"
        ],
        buttonText: "Go Lifetime",
        mode: 'payment' as const,
    }
];

export default function PricingPage() {
    const [loading, setLoading] = useState<string | null>(null);

    const handleSubscribe = async (plan: typeof plans[0]) => {
        if (plan.disabled) return;
        
        setLoading(plan.name);
        try {
            const { url } = await createCheckoutSession(plan.priceId, plan.mode as any);
            if (url) {
                window.location.href = url;
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to start checkout");
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Shield className="w-8 h-8 text-blue-600" />
                        <span className="text-2xl font-bold text-gray-900">ContractGuard AI</span>
                    </Link>
                    <nav className="flex items-center gap-6">
                        <Link href="/how-it-works" className="text-sm font-medium text-gray-600 hover:text-blue-600">How it Works</Link>
                        <Link href="/templates" className="text-sm font-medium text-gray-600 hover:text-blue-600">Templates</Link>
                        <Link href="/analyze" className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-100">Try Free</Link>
                    </nav>
                    <MobileNav />
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto px-6 py-20">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                        Simple, Transparent Pricing
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Protect yourself from legal pitfalls without the expensive attorney fees. Choose the plan that fits your work.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 items-start">
                    {plans.map((plan) => (
                        <div 
                            key={plan.name}
                            className={`
                                relative p-8 rounded-3xl bg-white border shadow-sm transition-all hover:shadow-xl
                                ${plan.highlight ? 'ring-2 ring-blue-600 border-transparent' : 'border-gray-200'}
                            `}
                        >
                            {plan.highlight && (
                                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wide">
                                    Most Popular
                                </span>
                            )}

                            <div className="mb-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                <p className="text-gray-500 text-sm">{plan.description}</p>
                            </div>

                            <div className="mb-8 flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                                {plan.name === 'Pro Monthly' && <span className="text-gray-500">/month</span>}
                            </div>

                            <button
                                onClick={() => handleSubscribe(plan)}
                                disabled={plan.disabled || !!loading}
                                className={`
                                    w-full py-4 rounded-xl font-bold text-lg mb-8 transition-all flex items-center justify-center gap-2
                                    ${plan.disabled 
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                        : plan.highlight
                                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100'
                                            : 'bg-gray-900 text-white hover:bg-black shadow-lg shadow-gray-100'
                                    }
                                `}
                            >
                                {loading === plan.name ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : plan.buttonText}
                            </button>

                            <ul className="space-y-4">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3 text-gray-600">
                                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-20 text-center bg-blue-50 rounded-3xl p-12 ring-1 ring-blue-100">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Enterprise or High Volume?</h2>
                    <p className="text-gray-600 mb-8 max-w-xl mx-auto italic">
                        "ContractGuard is the only tool that actually caught a vague liability clause in my last NDA. Saved me thousands in potential legal debt."
                    </p>
                    <Link 
                        href="mailto:support@3kpro.services" 
                        className="text-blue-600 font-bold hover:underline"
                    >
                        Contact Sales for Custom Plans &rarr;
                    </Link>
                </div>

                {/* Comparison Table */}
                <div className="mt-32">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Compare Features</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="p-6 font-bold text-gray-900">Feature</th>
                                    <th className="p-6 font-bold text-gray-900">Free</th>
                                    <th className="p-6 font-bold text-gray-900 text-blue-600">Pro</th>
                                    <th className="p-6 font-bold text-gray-900">Lifetime</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {[
                                    { f: "AI Analysis Limit", v: ["1 Total", "Unlimited", "Unlimited"] },
                                    { f: "Advanced Risk Detection", v: [false, true, true] },
                                    { f: "Risk Scoring", v: [false, true, true] },
                                    { f: "PDF Export", v: [false, true, true] },
                                    { f: "Premium Templates", v: [false, true, true] },
                                    { f: "Analysis History", v: ["Basic", "Priority", "Priority"] },
                                    { f: "Support", v: ["Email", "Priority", "Priority"] },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-6 text-gray-700 font-medium">{row.f}</td>
                                        {row.v.map((val, j) => (
                                            <td key={j} className="p-6 text-gray-600">
                                                {typeof val === 'boolean' ? (
                                                    val ? <Check className="w-5 h-5 text-green-500" /> : <span className="text-gray-300">—</span>
                                                ) : val}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mt-32 max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>
                    <div className="grid gap-6">
                        {[
                            {
                                q: "Is this a replacement for a lawyer?",
                                a: "No. ContractGuard AI is a tool to help you identify potential risks and understand your contracts better. We provide automated analysis, not legal advice. Always consult with a licensed attorney for final legal review."
                            },
                            {
                                q: "What file formats do you support?",
                                a: "We support PDF, DOCX, and plain text files. Our AI is optimized to extract and analyze text accurately from all common legal document formats."
                            },
                            {
                                q: "How secure is my data?",
                                a: "Extremely. We use industry-standard encryption for data at rest and in transit. Your documents are processed securely and are never used to train global AI models."
                            },
                            {
                                q: "Can I cancel my subscription any time?",
                                a: "Absolutely. You can manage and cancel your Pro Monthly subscription at any time through our Stripe-powered billing portal with a single click."
                            }
                        ].map((faq, i) => (
                            <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.q}</h3>
                                <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t bg-white py-12">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Shield className="w-6 h-6 text-blue-600" />
                        <span className="font-bold text-gray-900">ContractGuard AI</span>
                    </div>
                    <div className="text-sm text-gray-500">
                        © 2026 ContractGuard AI. Not a law firm. No legal advice provided.
                    </div>
                    <div className="flex gap-6">
                        <Link href="/" className="text-sm text-gray-600 hover:text-blue-600">Home</Link>
                        <Link href="/disclaimer" className="text-sm text-gray-600 hover:text-blue-600 font-bold">Disclaimer</Link>
                        <Link href="/analyze" className="text-sm text-gray-600 hover:text-blue-600">Analyze</Link>
                        <Link href="/templates" className="text-sm text-gray-600 hover:text-blue-600">Templates</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
