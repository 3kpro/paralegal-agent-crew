import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ErrorBoundary from "@/components/ErrorBoundary";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-tron-dark flex">
        {/* Sidebar */}
        <aside className="w-64 bg-tron-grid text-tron-text fixed h-full border-r border-tron-cyan/20 hidden md:block">
          <div className="p-6">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-tron-cyan to-tron-magenta rounded-lg flex items-center justify-center shadow-lg shadow-tron-cyan/50">
                <span className="text-tron-dark font-bold">3K</span>
              </div>
              <span className="font-bold text-lg">Content Cascade</span>
            </Link>
          </div>

          <nav className="mt-6">
            <Link
              href="/dashboard"
              className="flex items-center space-x-3 px-6 py-3 hover:bg-tron-cyan/20 hover:border-l-4 hover:border-tron-cyan transition-all"
            >
              <span className="text-xl">📊</span>
              <span>Dashboard</span>
            </Link>
            <Link
              href="/campaigns"
              className="flex items-center space-x-3 px-6 py-3 hover:bg-tron-cyan/20 hover:border-l-4 hover:border-tron-cyan transition-all"
            >
              <span className="text-xl">⚡</span>
              <span>Campaigns</span>
            </Link>
            <Link
              href="/campaigns/new"
              className="flex items-center space-x-3 px-6 py-3 hover:bg-tron-cyan/20 hover:border-l-4 hover:border-tron-cyan transition-all"
            >
              <span className="text-xl">🎨</span>
              <span>Create</span>
            </Link>
            <Link
              href="/contentflow"
              className="flex items-center space-x-3 px-6 py-3 hover:bg-tron-cyan/20 hover:border-l-4 hover:border-tron-cyan transition-all"
            >
              <span className="text-xl">📅</span>
              <span>ContentFlow</span>
            </Link>
            <Link
              href="/ai-studio"
              className="flex items-center space-x-3 px-6 py-3 hover:bg-tron-cyan/20 hover:border-l-4 hover:border-tron-cyan transition-all"
            >
              <span className="text-xl">🧠</span>
              <span>AI Studio</span>
            </Link>
            <Link
              href="/social-accounts"
              className="flex items-center space-x-3 px-6 py-3 hover:bg-tron-cyan/20 hover:border-l-4 hover:border-tron-cyan transition-all"
            >
              <span className="text-xl">🔗</span>
              <span>Social Accounts</span>
            </Link>
            <Link
              href="/analytics"
              className="flex items-center space-x-3 px-6 py-3 hover:bg-tron-cyan/20 hover:border-l-4 hover:border-tron-cyan transition-all"
            >
              <span className="text-xl">📈</span>
              <span>Analytics</span>
            </Link>
            <Link
              href="/settings"
              className="flex items-center space-x-3 px-6 py-3 hover:bg-tron-cyan/20 hover:border-l-4 hover:border-tron-cyan transition-all"
            >
              <span className="text-xl">🔧</span>
              <span>Settings</span>
            </Link>
          </nav>

          <div className="absolute bottom-0 w-64 border-t border-tron-grid">
            <Link
              href="/help"
              className="flex items-center space-x-3 px-6 py-3 hover:bg-tron-cyan/20 transition-colors"
            >
              <span className="text-xl">💡</span>
              <span>Help</span>
            </Link>
            <form action="/api/auth/signout" method="post">
              <button
                type="submit"
                className="flex items-center space-x-3 px-6 py-3 hover:bg-tron-magenta/20 transition-colors w-full text-left"
              >
                <span className="text-xl">🚪</span>
                <span>Logout</span>
              </button>
            </form>
          </div>
        </aside>

        {/* Main Content */}
        <div className="md:ml-64 flex-1">
          {/* Top Bar */}
          <header className="bg-tron-grid border-b border-tron-cyan/30 px-4 md:px-8 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-semibold text-tron-text">
                Content Cascade AI
              </h2>
              <div className="flex items-center space-x-2 md:space-x-4">
                <span className="text-sm text-tron-text-muted hidden md:inline">
                  {profile?.email}
                </span>
                <div className="w-8 h-8 md:w-10 md:h-10 bg-tron-cyan rounded-full flex items-center justify-center text-tron-dark font-semibold shadow-lg shadow-tron-cyan/50">
                  {profile?.full_name?.charAt(0) || "U"}
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="min-h-[calc(100vh-73px)] pb-16 md:pb-0">
            <ErrorBoundary>{children}</ErrorBoundary>
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-tron-grid border-t border-tron-cyan/30 px-2 py-2">
          <div className="grid grid-cols-5 gap-1">
            <Link
              href="/dashboard"
              className="flex flex-col items-center py-2 px-1 rounded-lg hover:bg-tron-cyan/20 transition-colors"
            >
              <span className="text-lg">📊</span>
              <span className="text-xs text-tron-text mt-1">Dashboard</span>
            </Link>
            <Link
              href="/campaigns"
              className="flex flex-col items-center py-2 px-1 rounded-lg hover:bg-tron-cyan/20 transition-colors"
            >
              <span className="text-lg">⚡</span>
              <span className="text-xs text-tron-text mt-1">Campaigns</span>
            </Link>
            <Link
              href="/campaigns/new"
              className="flex flex-col items-center py-2 px-1 rounded-lg hover:bg-tron-cyan/20 transition-colors"
            >
              <span className="text-lg">🎨</span>
              <span className="text-xs text-tron-text mt-1">Create</span>
            </Link>
            <Link
              href="/ai-studio"
              className="flex flex-col items-center py-2 px-1 rounded-lg hover:bg-tron-cyan/20 transition-colors"
            >
              <span className="text-lg">🧠</span>
              <span className="text-xs text-tron-text mt-1">AI Studio</span>
            </Link>
            <Link
              href="/settings"
              className="flex flex-col items-center py-2 px-1 rounded-lg hover:bg-tron-cyan/20 transition-colors"
            >
              <span className="text-lg">🔧</span>
              <span className="text-xs text-tron-text mt-1">Settings</span>
            </Link>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
