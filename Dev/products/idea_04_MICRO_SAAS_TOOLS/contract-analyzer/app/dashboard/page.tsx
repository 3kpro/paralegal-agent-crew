import Link from 'next/link';
import { Shield, Plus, History, LayoutDashboard, Menu } from 'lucide-react';
import { UserButton } from "@clerk/nextjs";
import MobileNav from '@/components/MobileNav';
import { getAnalysisHistory } from '@/app/actions/get-history';
import HistoryList from '@/components/HistoryList';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const { data: history = [] } = await getAnalysisHistory();

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Header */}
            <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <Shield className="w-8 h-8 text-blue-600" />
                        <span className="text-2xl font-bold text-gray-900">ContractGuard AI</span>
                    </Link>
                    <div className="flex items-center gap-6">
                        <Link 
                            href="/how-it-works" 
                            className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                        >
                            How it Works
                        </Link>
                        <Link 
                            href="/analyze" 
                            className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                        >
                            New Analysis
                        </Link>
                        <Link 
                            href="/templates" 
                            className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                        >
                            Templates
                        </Link>
                        <UserButton afterSignOutUrl="/" />
                    </div>
                    <MobileNav />
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12 animate-fade-in-up">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <LayoutDashboard className="w-8 h-8 text-blue-600" />
                            Dashboard
                        </h1>
                        <p className="text-gray-500 mt-2">
                            Manage your contract analysis history and reports.
                        </p>
                    </div>
                    
                    <Link 
                        href="/analyze"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        New Analysis
                    </Link>
                </div>

                {/* Account Stats (Simplified for MVP) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Scans</span>
                        <div className="text-3xl font-bold text-gray-900 mt-1">{history.length}</div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Monthly Usage</span>
                        <div className="text-3xl font-bold text-blue-600 mt-1">
                            {history.length > 0 ? '1' : '0'} / 1
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Plan</span>
                        <div className="flex items-center justify-between mt-1">
                            <div className="text-2xl font-bold text-gray-900 capitalize">
                                {history[0]?.users?.subscription_status || 'Free'}
                            </div>
                            <Link href="/pricing" className="text-sm text-blue-600 font-bold hover:underline">
                                Upgrade
                            </Link>
                        </div>
                    </div>
                </div>

                {/* History Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 border-b pb-4">
                        <History className="w-5 h-5 text-gray-400" />
                        <h2 className="text-xl font-bold text-gray-900">Analysis History</h2>
                    </div>
                    
                    <HistoryList initialData={history} />
                </div>
            </main>
        </div>
    );
}
