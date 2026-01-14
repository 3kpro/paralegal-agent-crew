import Link from 'next/link';
import { Shield, LayoutGrid, Menu } from 'lucide-react';
import { UserButton } from "@clerk/nextjs";
import MobileNav from '@/components/MobileNav';
import { getTemplates } from '@/app/actions/get-templates';
import { getUserStatus } from '@/app/actions/get-user-status';
import TemplateBrowser from '@/components/TemplateBrowser';

export const dynamic = 'force-dynamic';

export default async function TemplatesPage() {
    const { data: templates = [] } = await getTemplates();
    const userStatus = await getUserStatus();

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
                            href="/dashboard" 
                            className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                        >
                            Dashboard
                        </Link>
                        <UserButton afterSignOutUrl="/" />
                    </div>
                    <MobileNav />
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12 animate-fade-in-up">
                <div className="mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
                        <LayoutGrid className="w-10 h-10 text-blue-600" />
                        Legal Template Library
                    </h1>
                    <p className="text-xl text-gray-600 mt-4 max-w-3xl">
                        Professional, pre-reviewed legal templates tailored for freelancers and consultants. 
                        Save thousands on legal fees with our attorney-drafted contracts.
                    </p>
                </div>

                <TemplateBrowser templates={templates} userStatus={userStatus} />
            </main>
        </div>
    );
}
