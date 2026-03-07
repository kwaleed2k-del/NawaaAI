"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Hash,
  LogOut,
  Search,
  Settings,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";
import { signOut } from "@/lib/auth-actions";
import { cn, extractInitials } from "@/lib/utils";
import { messages } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { href: "/dashboard", key: "dashboard" as const, icon: BarChart3 },
  { href: "/companies", key: "companies" as const, icon: Building2 },
  { href: "/planner", key: "planner" as const, icon: Calendar },
  { href: "/vision-studio", key: "visionStudio" as const, icon: Sparkles, badge: "AI" },
  { href: "/insights", key: "insights" as const, icon: TrendingUp },
  { href: "/hashtags", key: "hashtags" as const, icon: Hash },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { user, setUser, locale, setLocale } = useAppStore();

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("nawaa-locale") : null;
    if (stored === "en" || stored === "ar") setLocale(stored);
  }, [setLocale]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (u) setUser({ id: u.id, email: u.email ?? null });
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email ?? null } : null);
    });
    return () => subscription.unsubscribe();
  }, [setUser]);

  const displayName = user?.email?.split("@")[0] ?? "User";
  const t = messages[locale].nav;
  const isRtl = locale === "ar";

  return (
    <div className="flex min-h-screen bg-[#020B05] text-[#D0EBDA]">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 64 : 240 }}
        className={cn(
          "fixed top-0 z-40 flex h-full flex-col border-[#172E1F] bg-[#061009]",
          isRtl ? "right-0 border-l" : "left-0 border-r"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-[#172E1F] px-3">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-1">
              <span className="bg-gradient-to-r from-[#C9A84C] to-[#E8D5A0] bg-clip-text font-bold text-transparent">
                {locale === "ar" ? "نواة" : "Nawaa"}
              </span>
              <span className="text-sm text-[#00A352]">AI</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-[#7B9E86] hover:text-[#D0EBDA]"
            onClick={() => setCollapsed((c) => !c)}
          >
            {collapsed ? (isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />) : (isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />)}
          </Button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  isActive
                    ? "border-[#00A352] bg-[rgba(0,108,53,0.15)] text-[#D0EBDA]"
                    : "text-[#7B9E86] hover:bg-[#0B1A0F] hover:text-[#D0EBDA]",
                  isActive && (isRtl ? "border-r-[3px]" : "border-l-[3px]")
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1">{t[item.key]}</span>
                    {item.badge && (
                      <span className="rounded bg-[#C9A84C]/20 px-1.5 text-xs text-[#C9A84C]">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[#172E1F] p-2">
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#7B9E86] hover:bg-[#0B1A0F] hover:text-[#D0EBDA]"
          >
            <Settings className="h-5 w-5" />
            {!collapsed && <span>{t.settings}</span>}
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#7B9E86] hover:bg-[#0B1A0F] hover:text-[#D0EBDA]"
            >
              <LogOut className="h-5 w-5" />
              {!collapsed && <span>{t.logout}</span>}
            </button>
          </form>
          {!collapsed && (
            <p className="mt-2 px-3 text-xs text-[#7B9E86]">🇸🇦</p>
          )}
        </div>
      </motion.aside>

      {/* Main */}
      <div
        className="flex flex-1 flex-col"
        style={isRtl ? { marginRight: collapsed ? 64 : 240 } : { marginLeft: collapsed ? 64 : 240 }}
      >
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-[#172E1F] bg-[#0B1A0F] px-4">
          <div className="flex flex-1 items-center gap-2">
            <div className={cn("relative max-w-md flex-1", isRtl && "flex-row-reverse")}>
              <Search className={cn("absolute top-1/2 h-4 w-4 -translate-y-1/2 text-[#7B9E86]", isRtl ? "right-3" : "left-3")} />
              <input
                type="search"
                placeholder={t.search}
                className={cn(
                  "h-9 w-full rounded-lg border border-[#172E1F] bg-[#061009] pr-3 text-sm text-[#D0EBDA] placeholder:text-[#7B9E86] focus:border-[#006C35] focus:outline-none",
                  isRtl ? "pl-3 pr-9" : "pl-9"
                )}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
              className="rounded-lg border border-[#172E1F] px-3 py-1.5 text-sm font-medium text-[#D0EBDA] hover:bg-[#172E1F]"
            >
              {locale === "ar" ? "English" : "العربية"}
            </button>
            <span className="hidden text-sm text-[#7B9E86] sm:inline">
              AI Credits: <span className="text-[#00A352]">47</span> {messages[locale].dashboard.creditsRemaining}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full bg-[#006C35] text-white"
                >
                  {extractInitials(displayName)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-[#172E1F] bg-[#0B1A0F] text-[#D0EBDA]">
                <DropdownMenuItem className="focus:bg-[#061009]">{displayName}</DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <form action={signOut}>
                    <button type="submit" className="w-full text-left">
                      {t.logout}
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
