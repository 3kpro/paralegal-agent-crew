"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Shield, LayoutDashboard, FileText, LayoutGrid, HelpCircle, CreditCard } from 'lucide-react';

export default function MobileNav() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    const menuItems = [
        { href: '/how-it-works', label: 'How it Works', icon: HelpCircle },
        { href: '/analyze', label: 'New Analysis', icon: Shield },
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/templates', label: 'Templates', icon: LayoutGrid },
        { href: '/pricing', label: 'Pricing', icon: CreditCard },
        { href: '/disclaimer', label: 'Disclaimer', icon: FileText },
    ];

    return (
        <div className="md:hidden">
            <button 
                onClick={toggleMenu}
                className="p-2 text-gray-600 hover:text-blue-600 focus:outline-none"
                aria-label="Toggle menu"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 bg-white border-b shadow-xl animate-fade-in z-50 overflow-hidden">
                    <nav className="flex flex-col p-6 space-y-4">
                        {menuItems.map((item) => (
                            <Link 
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-4 p-3 text-lg font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors"
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        ))}
                        <Link 
                            href="/sign-in"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center justify-center p-4 bg-gray-900 text-white rounded-xl font-bold transition-colors hover:bg-black"
                        >
                            Sign In / Sign Up
                        </Link>
                    </nav>
                </div>
            )}
        </div>
    );
}
