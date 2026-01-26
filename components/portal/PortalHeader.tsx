"use client";

import { Bell } from "@phosphor-icons/react";
import { XeloraLogo } from "@/components/XeloraLogo";
import { UserMenuDropdown } from "./UserMenuDropdown";

interface Profile {
  email?: string;
  full_name?: string;
  subscription_tier?: string;
}

interface PortalHeaderProps {
  user: Profile | null;
  showUserMenu: boolean;
  onToggleUserMenu: () => void;
  onLogout: () => void;
  onSettingsOpen: () => void;
  onWhatsNewOpen: () => void;
}

export function PortalHeader({
  user,
  showUserMenu,
  onToggleUserMenu,
  onLogout,
  onSettingsOpen,
  onWhatsNewOpen,
}: PortalHeaderProps) {
  return (
    <header className="bg-[#0a0a0a] border-b border-gray-800 px-4 md:px-8 py-3 relative z-20 flex-shrink-0">
      <div className="flex items-center justify-between w-full">
        {/* Logo - only show on mobile since desktop has sidebar */}
        <div className="flex items-center gap-3 md:hidden">
          <span className="text-lg font-bold text-white uppercase tracking-wide">
            XELORA
          </span>
          <XeloraLogo className="w-8 h-8" />
        </div>

        {/* Spacer for desktop to push right items */}
        <div className="hidden md:flex flex-1" />

        <div className="flex items-center space-x-2 md:space-x-3 flex-shrink-0">
          {/* What's New Button */}
          <button
            onClick={onWhatsNewOpen}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <Bell className="w-4 h-4" weight="duotone" />
            <span className="hidden md:inline">What's New</span>
          </button>

          {/* User Menu */}
          <UserMenuDropdown
            user={user}
            isOpen={showUserMenu}
            onToggle={onToggleUserMenu}
            onLogout={onLogout}
            onSettingsOpen={onSettingsOpen}
          />
        </div>
      </div>
    </header>
  );
}
