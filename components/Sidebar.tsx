"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SquaresFour as LayoutDashboard,
  Lightning as Zap,
  Robot as Bot,
  Gear as Settings,
  SignOut as LogOut,
  CreditCard,
  List as Menu,
  X,
  Plus,
  Lifebuoy as LifeBuoy,
} from "@phosphor-icons/react";
import { useState } from "react";
import { XeloraLogo } from "@/components/XeloraLogo";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/campaigns", label: "Campaigns", icon: Zap },
  { href: "/helix", label: "Helix AI", icon: Bot },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  onLogout: () => void;
}

export function Sidebar({ onLogout }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col fixed left-0 top-0 h-full bg-[#1a1a1a] border-r border-gray-800 z-40 transition-all duration-300 ${
          isCollapsed ? "w-16" : "w-56"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
          {!isCollapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <XeloraLogo className="w-8 h-8" />
              <span className="font-bold text-white">XELORA</span>
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <Menu className="w-5 h-5" weight="duotone" />
            ) : (
              <X className="w-5 h-5" weight="duotone" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname?.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? "bg-coral-500/20 text-coral-400 border-l-2 border-coral-500"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                } ${isCollapsed ? "justify-center" : ""}`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-coral-400" : ""}`}
                  weight="duotone"
                />
                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-800 py-4 px-2 space-y-1">
          <Link
            href="/pricing"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all ${
              isCollapsed ? "justify-center" : ""
            }`}
            title={isCollapsed ? "Upgrade" : undefined}
          >
            <CreditCard className="w-5 h-5 flex-shrink-0" weight="duotone" />
            {!isCollapsed && <span className="text-sm font-medium">Upgrade</span>}
          </Link>
          <Link
            href="/support"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all ${
              isCollapsed ? "justify-center" : ""
            }`}
            title={isCollapsed ? "Support" : undefined}
          >
            <LifeBuoy className="w-5 h-5 flex-shrink-0" weight="duotone" />
            {!isCollapsed && <span className="text-sm font-medium">Support</span>}
          </Link>
          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all ${
              isCollapsed ? "justify-center" : ""
            }`}
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" weight="duotone" />
            {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Desktop content spacer */}
      <div
        className={`hidden md:block flex-shrink-0 transition-all duration-300 ${
          isCollapsed ? "w-16" : "w-56"
        }`}
      />
    </>
  );
}

export function MobileNav({ onLogout }: SidebarProps) {
  const pathname = usePathname();

  // Show only the most important items on mobile
  const mobileItems = [
    { href: "/dashboard", label: "Home", icon: LayoutDashboard },
    { href: "/campaigns", label: "Campaigns", icon: Zap },
    { href: "/campaigns/create", label: "Create", icon: Plus },
    { href: "/helix", label: "Helix", icon: Bot },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-gray-800 z-40 safe-area-pb">
      <div className="flex items-center justify-around py-2">
        {mobileItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "text-coral-400"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <Icon className="w-5 h-5" weight={isActive ? "fill" : "duotone"} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
