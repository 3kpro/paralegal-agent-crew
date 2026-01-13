"use client";

import Link from "next/link";
import { FileText, History, LogIn } from "lucide-react";
import { Button } from "./ui/button";

export function Header() {
  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-5xl mx-auto items-center px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <div className="bg-primary text-primary-foreground p-1 rounded-md">
            <FileText className="h-5 w-5" />
          </div>
          <span>InvoiceGen</span>
        </Link>
        <nav className="flex items-center gap-4 ml-6">
          <Link 
            href="/" 
            className="text-sm font-medium transition-colors hover:text-foreground text-foreground/60"
          >
            Create
          </Link>
          <Link 
            href="/invoices" 
            className="text-sm font-medium transition-colors hover:text-foreground text-foreground/60"
          >
            History
          </Link>
          <Link 
            href="/pricing" 
            className="text-sm font-medium transition-colors hover:text-foreground text-foreground/60"
          >
            Pricing
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
           {/* Placeholder for Auth */}
           <Button variant="ghost" size="sm">
             <LogIn className="h-4 w-4 mr-2" />
             Sign In
           </Button>
        </div>
      </div>
    </header>
  );
}
