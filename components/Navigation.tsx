"use client";

import Link from "next/link";
import { Button } from "./ui/Button";
import { cn } from "@/lib/utils";

export const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-black bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 border border-black flex items-center justify-center font-bold text-xl tracking-tighter group-hover:bg-black group-hover:text-white transition-all">
            3K
          </div>
          <span className="text-xl font-bold tracking-tight text-black uppercase group-hover:opacity-80 transition-opacity">
            XELORA
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/try" className="hidden sm:inline-flex text-xs font-bold uppercase tracking-widest text-black/60 hover:text-black transition-colors">
            Try Free
          </Link>
          <Link href="/login">
            <button className="hidden sm:inline-flex text-xs font-bold uppercase tracking-widest text-black/60 hover:text-black transition-colors">
              Sign In
            </button>
          </Link>
          <Link href="/signup">
             <button className="px-6 py-3 border border-black bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all">
               Get Started
             </button>
          </Link>
        </div>
      </div>
    </nav>
  );
};
