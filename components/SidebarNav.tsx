"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { InteractiveHoverButton } from "@/components/ui";
import {
  LayoutDashboard,
  Zap,
  Palette,
  Calendar,
  Brain,
  Link as LinkIcon,
  BarChart3,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/campaigns", label: "Campaigns", icon: Zap },
  { href: "/campaigns/new", label: "Create", icon: Palette },
  { href: "/contentflow", label: "ContentFlow", icon: Calendar },
  { href: "/ai-studio", label: "AI Studio", icon: Brain },
  { href: "/social-accounts", label: "Social Accounts", icon: LinkIcon },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-6 space-y-2 px-3">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
        
        return (
          <Link key={item.href} href={item.href} className="block">
            <InteractiveHoverButton
              text={item.label}
              variant={isActive ? "primary" : "outline"}
              className={`w-full justify-start text-left ${
                isActive
                  ? "border-tron-cyan bg-gradient-to-r from-tron-cyan/20 to-tron-magenta/20"
                  : "border-tron-cyan/10 hover:border-tron-cyan/50"
              }`}
            />
          </Link>
        );
      })}
    </nav>
  );
}

export function SidebarFooter() {
  return (
    <div className="absolute bottom-0 w-64 border-t border-tron-grid px-3 py-3 space-y-2">
      <Link href="/help" className="block">
        <InteractiveHoverButton
          text="Help"
          variant="outline"
          className="w-full justify-start text-left border-tron-cyan/10 hover:border-tron-cyan/50"
        />
      </Link>
      <form action="/api/auth/signout" method="post">
        <InteractiveHoverButton
          type="submit"
          text="Logout"
          variant="outline"
          className="w-full justify-start text-left border-tron-magenta/30 hover:border-tron-magenta"
        />
      </form>
    </div>
  );
}
