"use client";

import { Gear as Settings, CaretDown as ChevronDown } from "@phosphor-icons/react";

interface Profile {
  email?: string;
  full_name?: string;
  subscription_tier?: string;
}

interface UserMenuDropdownProps {
  user: Profile | null;
  isOpen: boolean;
  onToggle: () => void;
  onLogout: () => void;
  onSettingsOpen: () => void;
}

export function UserMenuDropdown({
  user,
  isOpen,
  onToggle,
  onLogout,
  onSettingsOpen,
}: UserMenuDropdownProps) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center space-x-2 hover:bg-gray-700/50 rounded-lg px-2 py-1 transition-colors"
      >
        <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-coral-400 to-coral-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
          {user?.full_name?.charAt(0) || "U"}
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-white">
            {user?.full_name || "User"}
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-200 hidden md:block" weight="duotone" />
      </button>

      {/* User Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <div className="text-sm font-medium text-gray-900">
              {user?.full_name || "User"}
            </div>
            <div className="text-xs text-gray-300">{user?.email}</div>
          </div>
          
          <button
            onClick={() => {
              onToggle(); // Close menu
              onSettingsOpen();
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            <Settings className="w-4 h-4" weight="duotone" />
            Settings
          </button>
          
          <button
            onClick={() => onToggle()}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Invite team members
          </button>
          
          <a
            href="/support"
            onClick={() => onToggle()}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Help & Support
          </a>
          
          <button
            onClick={onLogout}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
