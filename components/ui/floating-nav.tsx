"use client"

import { useRouter } from "next/navigation"
import { MenuItem, MenuContainer } from "./fluid-menu"
import {
  Menu as MenuIcon,
  X,
  LayoutDashboard,
  Zap,
  Palette,
  FileText,
  Sparkles,
  Users,
  BarChart3,
  Settings,
  LogOut,
  CreditCard,
  Rocket,
} from "lucide-react"

export function FloatingNav() {
  const router = useRouter()

  const handleLogout = async () => {
    // Clean up remember me preferences and session storage
    localStorage.removeItem("rememberMe")
    sessionStorage.removeItem("tempSession")

    // Sign out via API
    const form = document.createElement("form")
    form.method = "POST"
    form.action = "/api/auth/signout"
    document.body.appendChild(form)
    form.submit()
  }

  return (
    <div className="fixed left-8 top-32 z-50">
      <MenuContainer>
        <MenuItem 
          icon={
            <div className="relative w-6 h-6">
              <div className="absolute inset-0 transition-all duration-300 ease-in-out origin-center opacity-100 scale-100 rotate-0 [div[data-expanded=true]_&]:opacity-0 [div[data-expanded=true]_&]:scale-0 [div[data-expanded=true]_&]:rotate-180">
                <MenuIcon size={24} strokeWidth={1.5} className="text-coral-400" />
              </div>
              <div className="absolute inset-0 transition-all duration-300 ease-in-out origin-center opacity-0 scale-0 -rotate-180 [div[data-expanded=true]_&]:opacity-100 [div[data-expanded=true]_&]:scale-100 [div[data-expanded=true]_&]:rotate-0">
                <X size={24} strokeWidth={1.5} className="text-coral-400" />
              </div>
            </div>
          }
          label="Menu"
        />
        <MenuItem
          icon={<LayoutDashboard size={22} strokeWidth={1.5} className="text-coral-400" />}
          onClick={() => router.push('/dashboard')}
          label="Dashboard"
        />
        <MenuItem
          icon={<Zap size={22} strokeWidth={1.5} className="text-coral-400" />}
          onClick={() => router.push('/campaigns')}
          label="Campaigns"
        />

        <MenuItem
          icon={<FileText size={22} strokeWidth={1.5} className="text-coral-400" />}
          onClick={() => router.push('/contentflow')}
          label="ContentFlow"
        />
        <MenuItem
          icon={<Sparkles size={22} strokeWidth={1.5} className="text-coral-400" />}
          onClick={() => router.push('/ai-studio')}
          label="Reactor"
        />
        <MenuItem
          icon={<BarChart3 size={22} strokeWidth={1.5} className="text-coral-400" />}
          onClick={() => router.push('/analytics')}
          label="Analytics"
        />
        <MenuItem
          icon={<Settings size={22} strokeWidth={1.5} className="text-coral-400" />}
          onClick={() => router.push('/settings')}
          label="Settings"
        />
        <MenuItem
          icon={<CreditCard size={22} strokeWidth={1.5} className="text-coral-400" />}
          onClick={() => router.push('/pricing')}
          label="Upgrade"
        />
        <MenuItem
          icon={<LogOut size={22} strokeWidth={1.5} className="text-red-400" />}
          onClick={handleLogout}
          label="Logout"
        />
      </MenuContainer>
    </div>
  )
}
