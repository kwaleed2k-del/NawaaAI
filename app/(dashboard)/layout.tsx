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
import { motion, AnimatePresence } from "framer-motion";
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
    document.documentElement.classList.add("dark");
    return () => {
      document.documentElement.classList.remove("dark");
    };
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
    <div className="flex min-h-screen bg-[#020B05] text-[#D0EBDA] text-base">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 280 }}
        className={cn(
          "fixed top-0 z-40 flex h-full flex-col overflow-hidden glass-strong",
          isRtl ? "right-0 border-l border-[#172E1F]" : "left-0 border-r border-[#172E1F]"
        )}
      >
        <div className="flex h-20 items-center justify-between border-b border-[#172E1F] px-4">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-gradient-gold text-lg font-bold">
                {locale === "ar" ? "\u0646\u0648\u0627\u0629" : "Nawaa"}
              </span>
              <span className="text-base text-[#00A352] font-semibold">AI</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0 text-[#7B9E86] hover:text-[#D0EBDA]"
            onClick={() => setCollapsed((c) => !c)}
          >
            {collapsed ? (isRtl ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />) : (isRtl ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />)}
          </Button>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto p-4 scrollbar-nawaa">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-4 rounded-xl px-4 py-3.5 text-base font-medium transition-colors",
                  isActive
                    ? "bg-[rgba(0,108,53,0.15)] text-[#D0EBDA]"
                    : "text-[#7B9E86] hover:bg-[#0B1A0F] hover:text-[#D0EBDA]"
                )}
              >
                {/* Active indicator bar with glow */}
                {isActive && (
                  <motion.div
                    layoutId="activeNavItem"
                    className={cn(
                      "absolute top-0 bottom-0 w-[3px] rounded-full bg-gradient-to-b from-[#C9A84C] to-[#00A352]",
                      isRtl ? "right-0" : "left-0"
                    )}
                    style={{
                      boxShadow: "0 0 8px rgba(201,168,76,0.4)",
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon className={cn("h-6 w-6 shrink-0 transition-colors", isActive && "text-[#00A352]")} />
                {!collapsed && (
                  <>
                    <span className="flex-1">{t[item.key]}</span>
                    {item.badge && (
                      <span className="rounded bg-gradient-to-r from-[#C9A84C] to-[#E8D5A0] px-1.5 text-xs font-semibold text-[#020B05]">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[#172E1F] p-4">
          <Link
            href="/settings"
            className="flex items-center gap-4 rounded-xl px-4 py-3 text-base font-medium text-[#7B9E86] hover:bg-[#0B1A0F] hover:text-[#D0EBDA]"
          >
            <Settings className="h-6 w-6" />
            {!collapsed && <span>{t.settings}</span>}
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-base font-medium text-[#7B9E86] hover:bg-[#0B1A0F] hover:text-[#D0EBDA]"
            >
              <LogOut className="h-6 w-6" />
              {!collapsed && <span>{t.logout}</span>}
            </button>
          </form>
          {!collapsed && (
            <p className="mt-3 px-3 text-sm text-[#7B9E86]">{"\ud83c\uddf8\ud83c\udde6"}</p>
          )}
        </div>
      </motion.aside>

      {/* Main */}
      <div
        className="flex flex-1 flex-col"
        style={isRtl ? { marginRight: collapsed ? 80 : 280 } : { marginLeft: collapsed ? 80 : 280 }}
      >
        <header className="sticky top-0 z-30 flex h-20 items-center gap-4 border-b border-[#172E1F] bg-gradient-to-r from-[#0B1A0F] to-[#0B1A0F]/80 backdrop-blur-lg px-6">
          <div className="flex flex-1 items-center gap-2">
            <div className={cn("relative max-w-md flex-1", isRtl && "flex-row-reverse")}>
              <Search className={cn("absolute top-1/2 h-5 w-5 -translate-y-1/2 text-[#7B9E86]", isRtl ? "right-4" : "left-4")} />
              <input
                type="search"
                placeholder={t.search}
                className={cn(
                  "h-11 w-full rounded-xl border border-[#172E1F] bg-[#061009] pr-4 text-base text-[#D0EBDA] placeholder:text-[#7B9E86] focus:outline-none transition-all duration-300 focus:border-[#006C35] focus:shadow-[0_0_15px_rgba(0,108,53,0.1)]",
                  isRtl ? "pl-4 pr-12" : "pl-12"
                )}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
              className="rounded-xl border border-[#172E1F] px-4 py-2 text-base font-medium text-[#D0EBDA] hover:bg-[#172E1F] transition-colors"
            >
              {locale === "ar" ? "English" : "\u0627\u0644\u0639\u0631\u0628\u064a\u0629"}
            </button>
            <span className="hidden text-base text-[#7B9E86] sm:inline">
              AI Credits: <span className="text-gradient-gold font-semibold">47</span> {messages[locale].dashboard.creditsRemaining}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-[#006C35] text-base font-semibold text-white ring-2 ring-[#00A352]/30 ring-offset-1 ring-offset-[#020B05] transition-shadow hover:ring-[#00A352]/50"
                >
                  {extractInitials(displayName)}
                </button>
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

        <main className="flex-1 overflow-auto p-8 lg:p-10 scrollbar-nawaa">{children}</main>
      </div>
    </div>
  );
}
