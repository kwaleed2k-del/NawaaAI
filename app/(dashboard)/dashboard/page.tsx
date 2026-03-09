"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Calendar,
  Image as ImageIcon,
  Globe,
  Plus,
  Sparkles,
  ArrowRight,
  Eye,
  Zap,
  TrendingUp,
  Rocket,
  Quote,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useAppStore, type Company } from "@/lib/store";
import { messages } from "@/lib/i18n";
import { formatDate } from "@/lib/utils";
import GettingStartedCard from "@/components/GettingStartedCard";

/* ── Loading Messages ── */
const LOADING_LINES_EN = [
  { emoji: "\ud83d\udcca", text: "Fetching your companies & stats..." },
  { emoji: "\ud83d\udcc5", text: "Loading your latest content plans..." },
  { emoji: "\ud83d\uddbc\ufe0f", text: "Gathering your generated images..." },
  { emoji: "\ud83d\udce1", text: "Syncing your platform data..." },
  { emoji: "\u2699\ufe0f", text: "Preparing your personalized dashboard..." },
  { emoji: "\ud83d\udce6", text: "Unpacking your marketing insights..." },
  { emoji: "\ud83d\udd0d", text: "Scanning your brand analytics..." },
  { emoji: "\ud83c\udf10", text: "Connecting to your workspace..." },
];
const LOADING_LINES_AR = [
  { emoji: "\ud83d\udcca", text: "\u062c\u0627\u0631\u064a \u062a\u062d\u0645\u064a\u0644 \u0634\u0631\u0643\u0627\u062a\u0643 \u0648\u0625\u062d\u0635\u0627\u0626\u064a\u0627\u062a\u0643..." },
  { emoji: "\ud83d\udcc5", text: "\u062c\u0627\u0631\u064a \u062a\u062d\u0645\u064a\u0644 \u0623\u062d\u062f\u062b \u062e\u0637\u0637 \u0627\u0644\u0645\u062d\u062a\u0648\u0649..." },
  { emoji: "\ud83d\uddbc\ufe0f", text: "\u062c\u0627\u0631\u064a \u062c\u0645\u0639 \u0635\u0648\u0631\u0643 \u0627\u0644\u0645\u064f\u0648\u0644\u0651\u062f\u0629..." },
  { emoji: "\ud83d\udce1", text: "\u062c\u0627\u0631\u064a \u0645\u0632\u0627\u0645\u0646\u0629 \u0628\u064a\u0627\u0646\u0627\u062a \u0645\u0646\u0635\u0627\u062a\u0643..." },
  { emoji: "\u2699\ufe0f", text: "\u062c\u0627\u0631\u064a \u062a\u062c\u0647\u064a\u0632 \u0644\u0648\u062d\u0629 \u062a\u062d\u0643\u0645\u0643 \u0627\u0644\u0645\u062e\u0635\u0635\u0629..." },
  { emoji: "\ud83d\udce6", text: "\u062c\u0627\u0631\u064a \u0641\u062a\u062d \u0631\u0624\u0649 \u0627\u0644\u062a\u0633\u0648\u064a\u0642 \u0627\u0644\u062e\u0627\u0635\u0629 \u0628\u0643..." },
  { emoji: "\ud83d\udd0d", text: "\u062c\u0627\u0631\u064a \u0641\u062d\u0635 \u062a\u062d\u0644\u064a\u0644\u0627\u062a \u0639\u0644\u0627\u0645\u062a\u0643..." },
  { emoji: "\ud83c\udf10", text: "\u062c\u0627\u0631\u064a \u0627\u0644\u0627\u062a\u0635\u0627\u0644 \u0628\u0645\u0633\u0627\u062d\u0629 \u0639\u0645\u0644\u0643..." },
];

/* ── Marketing Quotes ── */
const MARKETING_QUOTES_EN = [
  { text: "The best marketing doesn't feel like marketing.", author: "Tom Fishburne", role: "Marketoonist" },
  { text: "Content is king, but context is God.", author: "Gary Vaynerchuk", role: "CEO, VaynerMedia" },
  { text: "Make the customer the hero of your story.", author: "Ann Handley", role: "Chief Content Officer" },
  { text: "People don't buy what you do, they buy why you do it.", author: "Simon Sinek", role: "Author & Speaker" },
  { text: "Your brand is what people say about you when you're not in the room.", author: "Jeff Bezos", role: "Founder, Amazon" },
  { text: "Marketing is no longer about the stuff you make, but the stories you tell.", author: "Seth Godin", role: "Marketing Guru" },
  { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs", role: "Co-founder, Apple" },
  { text: "The aim of marketing is to know the customer so well the product sells itself.", author: "Peter Drucker", role: "Management Consultant" },
];
const MARKETING_QUOTES_AR = [
  { text: "\u0623\u0641\u0636\u0644 \u062a\u0633\u0648\u064a\u0642 \u0647\u0648 \u0627\u0644\u0630\u064a \u0644\u0627 \u064a\u0628\u062f\u0648 \u0643\u062a\u0633\u0648\u064a\u0642.", author: "Tom Fishburne", role: "Marketoonist" },
  { text: "\u0627\u0644\u0645\u062d\u062a\u0648\u0649 \u0647\u0648 \u0627\u0644\u0645\u0644\u0643\u060c \u0644\u0643\u0646 \u0627\u0644\u0633\u064a\u0627\u0642 \u0647\u0648 \u0627\u0644\u0625\u0644\u0647.", author: "Gary Vaynerchuk", role: "VaynerMedia \u0631\u0626\u064a\u0633" },
  { text: "\u0627\u062c\u0639\u0644 \u0627\u0644\u0639\u0645\u064a\u0644 \u0628\u0637\u0644 \u0642\u0635\u062a\u0643.", author: "Ann Handley", role: "\u0631\u0626\u064a\u0633\u0629 \u0627\u0644\u0645\u062d\u062a\u0648\u0649" },
  { text: "\u0627\u0644\u0646\u0627\u0633 \u0644\u0627 \u064a\u0634\u062a\u0631\u0648\u0646 \u0645\u0627 \u062a\u0641\u0639\u0644\u0647\u060c \u0628\u0644 \u064a\u0634\u062a\u0631\u0648\u0646 \u0644\u0645\u0627\u0630\u0627 \u062a\u0641\u0639\u0644\u0647.", author: "Simon Sinek", role: "\u0645\u0624\u0644\u0641 \u0648\u0645\u062a\u062d\u062f\u062b" },
  { text: "\u0639\u0644\u0627\u0645\u062a\u0643 \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629 \u0647\u064a \u0645\u0627 \u064a\u0642\u0648\u0644\u0647 \u0627\u0644\u0646\u0627\u0633 \u0639\u0646\u0643 \u0639\u0646\u062f\u0645\u0627 \u0644\u0627 \u062a\u0643\u0648\u0646 \u0641\u064a \u0627\u0644\u063a\u0631\u0641\u0629.", author: "Jeff Bezos", role: "Amazon \u0645\u0624\u0633\u0633" },
  { text: "\u0627\u0644\u062a\u0633\u0648\u064a\u0642 \u0644\u0645 \u064a\u0639\u062f \u0639\u0646 \u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a\u060c \u0628\u0644 \u0639\u0646 \u0627\u0644\u0642\u0635\u0635 \u0627\u0644\u062a\u064a \u062a\u0631\u0648\u064a\u0647\u0627.", author: "Seth Godin", role: "\u062e\u0628\u064a\u0631 \u062a\u0633\u0648\u064a\u0642" },
  { text: "\u0627\u0644\u0627\u0628\u062a\u0643\u0627\u0631 \u064a\u0645\u064a\u0632 \u0628\u064a\u0646 \u0627\u0644\u0642\u0627\u0626\u062f \u0648\u0627\u0644\u062a\u0627\u0628\u0639.", author: "Steve Jobs", role: "Apple \u0645\u0624\u0633\u0633" },
  { text: "\u0647\u062f\u0641 \u0627\u0644\u062a\u0633\u0648\u064a\u0642 \u0647\u0648 \u0645\u0639\u0631\u0641\u0629 \u0627\u0644\u0639\u0645\u064a\u0644 \u062c\u064a\u062f\u0627\u064b \u0628\u062d\u064a\u062b \u064a\u0628\u064a\u0639 \u0627\u0644\u0645\u0646\u062a\u062c \u0646\u0641\u0633\u0647.", author: "Peter Drucker", role: "\u0645\u0633\u062a\u0634\u0627\u0631 \u0625\u062f\u0627\u0631\u064a" },
];

/* ── Platform data ── */
const PLATFORM_GRADIENT: Record<string, string> = {
  instagram: "from-pink-500 to-rose-500",
  tiktok: "from-slate-800 to-slate-600",
  x: "from-slate-700 to-slate-500",
  snapchat: "from-yellow-400 to-amber-400",
  linkedin: "from-blue-600 to-blue-500",
};
const PLATFORM_EMOJI: Record<string, string> = {
  instagram: "\ud83d\udcf8", tiktok: "\ud83c\udfb5", x: "\u2716\ufe0f",
  snapchat: "\ud83d\udc7b", linkedin: "\ud83d\udcbc",
};

type ContentPlan = {
  id: string;
  title: string | null;
  week_start: string;
  plan_data: { days?: Array<{ dayAr?: string; dayEn?: string; platform?: string; topic?: string; topicAr?: string }> };
};
type GeneratedImage = {
  id: string;
  image_urls: string[] | null;
  company_id: string | null;
  created_at: string;
};

export default function DashboardPage() {
  const { user, selectedCompany, setSelectedCompany, locale } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [latestPlan, setLatestPlan] = useState<ContentPlan | null>(null);
  const [recentImages, setRecentImages] = useState<GeneratedImage[]>([]);
  const [stats, setStats] = useState({ companies: 0, plans: 0, images: 0, platforms: 0 });

  const t = messages[locale].dashboard;

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    const supabase = createClient();
    const uid = user.id;
    (async () => {
      try {
        const [companiesRes, plansRes, imagesRes, plansCountRes, allImagesRes] = await Promise.all([
          supabase.from("companies").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
          supabase.from("content_plans").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(1),
          supabase.from("generated_images").select("id, image_urls, company_id, created_at").eq("user_id", uid).order("created_at", { ascending: false }).limit(5),
          supabase.from("content_plans").select("id", { count: "exact", head: true }).eq("user_id", uid),
          supabase.from("generated_images").select("id", { count: "exact", head: true }).eq("user_id", uid),
        ]);
        const comps = (companiesRes.data || []) as Company[];
        setCompanies(comps);
        if (comps.length && !selectedCompany) setSelectedCompany(comps[0]);
        setLatestPlan((plansRes.data as ContentPlan[] | null)?.[0] || null);
        setRecentImages((imagesRes.data || []) as GeneratedImage[]);
        const platformSet = new Set<string>();
        comps.forEach((c) => (c.platforms || []).forEach((p) => platformSet.add(p)));
        const totalImages = allImagesRes.count ?? 0;
        setStats({ companies: comps.length, plans: plansCountRes.count ?? 0, images: totalImages, platforms: platformSet.size });
      } catch { /* supabase query error */ }
      setLoading(false);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "there";
  const days = latestPlan?.plan_data?.days?.slice(0, 7) || [];

  /* ── Quote Rotation ── */
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * MARKETING_QUOTES_EN.length));
  useEffect(() => {
    const interval = setInterval(() => setQuoteIndex((p) => (p + 1) % MARKETING_QUOTES_EN.length), 3000);
    return () => clearInterval(interval);
  }, []);

  /* ── Loading State ── */
  const [lineIndex, setLineIndex] = useState(() => Math.floor(Math.random() * LOADING_LINES_EN.length));
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => setLineIndex((p) => (p + 1) % LOADING_LINES_EN.length), 2400);
    return () => clearInterval(interval);
  }, [loading]);

  if (loading) {
    const lines = locale === "ar" ? LOADING_LINES_AR : LOADING_LINES_EN;
    const current = lines[lineIndex];
    return (
      <div dir={locale === "ar" ? "rtl" : "ltr"} className="flex items-center justify-center min-h-[75vh]">
        <div className="flex flex-col items-center gap-10 w-full max-w-md px-6">
          <div className="relative">
            <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="absolute -inset-5 rounded-3xl bg-gradient-to-br from-[#006C35] to-[#00A352]" />
            <motion.div animate={{ scale: [1, 1.08, 1], opacity: [0.08, 0.18, 0.08] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }} className="absolute -inset-10 rounded-[2rem] bg-gradient-to-br from-[#006C35] to-[#00A352]" />
            <motion.div animate={{ y: [0, -12, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }} className="relative flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-[#006C35] to-[#00A352] shadow-[0_12px_40px_rgba(0,108,53,0.4)]">
              <Sparkles className="h-14 w-14 text-white" />
            </motion.div>
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#004D26]">{locale === "ar" ? "\u062c\u0627\u0631\u064a \u062a\u062d\u0645\u064a\u0644 \u0628\u064a\u0627\u0646\u0627\u062a\u0643" : "Loading your data"}</h2>
            <p className="text-base text-[#5A8A6A]">{locale === "ar" ? "\u0644\u062d\u0638\u0629 \u0648\u0627\u062d\u062f\u0629 \u0641\u0642\u0637..." : "Just a moment..."}</p>
          </div>
          <div className="h-20 w-full flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div key={lineIndex} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }} transition={{ duration: 0.4 }} className="flex items-center gap-4 rounded-2xl border border-[#D4EBD9] bg-white px-6 py-4 shadow-sm w-full">
                <span className="text-4xl shrink-0">{current.emoji}</span>
                <p className="text-base font-semibold text-[#004D26] leading-snug">{current.text}</p>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="w-full space-y-3">
            <div className="h-2 rounded-full bg-[#D4EBD9] overflow-hidden">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-[#006C35] via-[#00A352] to-[#006C35]" animate={{ x: ["-100%", "100%"] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }} style={{ width: "60%" }} />
            </div>
            <div className="grid grid-cols-4 gap-2 opacity-40">
              {[0, 1, 2, 3].map((i) => (
                <motion.div key={i} animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }} className="h-16 rounded-xl bg-[#D4EBD9]" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Stat cards config ── */
  const statItems = [
    { label: t.totalCompanies, value: stats.companies, icon: Building2, gradient: "from-emerald-500 to-green-600", glow: "shadow-emerald-500/25" },
    { label: t.plansGenerated, value: stats.plans, icon: Calendar, gradient: "from-amber-400 to-orange-500", glow: "shadow-amber-400/25" },
    { label: t.imagesCreated, value: stats.images, icon: ImageIcon, gradient: "from-violet-500 to-purple-600", glow: "shadow-violet-500/25" },
    { label: t.platformsActive, value: stats.platforms, icon: Globe, gradient: "from-sky-400 to-blue-600", glow: "shadow-sky-400/25" },
  ];

  /* ── Quick actions config ── */
  const quickActions = [
    { href: "/companies", icon: Building2, title: t.addNewCompany, desc: locale === "ar" ? "\u0627\u0636\u0641 \u0634\u0631\u0643\u0629 \u062c\u062f\u064a\u062f\u0629 \u0648\u062d\u0644\u0644 \u0647\u0648\u064a\u062a\u0647\u0627" : "Add a new brand and analyze its identity", gradient: "from-emerald-500 to-green-600", glow: "hover:shadow-emerald-500/20" },
    { href: "/planner", icon: Calendar, title: t.generateThisWeek, desc: locale === "ar" ? "\u062e\u0637\u0629 \u0645\u062d\u062a\u0648\u0649 \u0627\u0633\u0628\u0648\u0639\u064a\u0629 \u0645\u062e\u0635\u0635\u0629 \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a" : "AI-powered weekly content plan", gradient: "from-amber-400 to-orange-500", glow: "hover:shadow-amber-400/20" },
    { href: "/vision-studio", icon: Sparkles, title: t.createVisual, desc: locale === "ar" ? "\u0635\u0648\u0631 \u0627\u062d\u062a\u0631\u0627\u0641\u064a\u0629 \u0645\u0648\u0644\u062f\u0629 \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a" : "Professional AI-generated visuals", gradient: "from-violet-500 to-purple-600", glow: "hover:shadow-violet-500/20" },
  ];

  const isRtl = locale === "ar";

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="space-y-10 pb-16">

      {/* ═══════════════════ HERO ═══════════════════ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#003D1F] via-[#006C35] to-[#00A352] p-8 sm:p-10 lg:p-14">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#00A352]/30 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-emerald-400/20 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        <div className="absolute top-10 right-20 w-2 h-2 rounded-full bg-white/30 animate-pulse" />
        <div className="absolute top-24 right-40 w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse" style={{ animationDelay: "0.5s" }} />
        <div className="absolute bottom-8 left-32 w-2.5 h-2.5 rounded-full bg-white/25 animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          {/* Left side - Greeting */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                <Sparkles className="h-5 w-5 text-emerald-200" />
              </div>
              <span className="text-lg font-bold text-emerald-200/80 tracking-wide">{locale === "ar" ? "\u0646\u0648\u0627\u0629" : "Nawaa"} AI</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
              {t.greeting}, {displayName} {"\ud83d\udc4b"}
            </h1>
            <p className="mt-4 text-xl sm:text-2xl font-medium text-emerald-100/70">{formatDate(new Date())}</p>

            {/* Mini inline stats in hero */}
            <div className="mt-8 flex flex-wrap gap-4">
              {statItems.slice(0, 3).map((s, i) => (
                <div key={i} className="flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 px-5 py-3">
                  <s.icon className="h-6 w-6 text-emerald-200" />
                  <div>
                    <p className="text-2xl font-black text-white">{s.value}</p>
                    <p className="text-sm font-medium text-emerald-200/60">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Rotating Quotes */}
          <div className="lg:max-w-lg xl:max-w-xl">
            <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 p-8 lg:p-10 relative overflow-hidden">
              <Quote className={`h-12 w-12 text-emerald-300/30 mb-4 ${isRtl ? "scale-x-[-1]" : ""}`} />
              <AnimatePresence mode="wait">
                <motion.div
                  key={quoteIndex}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.5 }}
                >
                  <p className="text-2xl lg:text-3xl font-bold text-white/95 leading-relaxed italic mb-6">
                    &ldquo;{(locale === "ar" ? MARKETING_QUOTES_AR : MARKETING_QUOTES_EN)[quoteIndex].text}&rdquo;
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-300 to-emerald-500 flex items-center justify-center text-lg font-black text-white shadow-lg">
                      {(locale === "ar" ? MARKETING_QUOTES_AR : MARKETING_QUOTES_EN)[quoteIndex].author.charAt(0)}
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">{(locale === "ar" ? MARKETING_QUOTES_AR : MARKETING_QUOTES_EN)[quoteIndex].author}</p>
                      <p className="text-base text-emerald-200/70">{(locale === "ar" ? MARKETING_QUOTES_AR : MARKETING_QUOTES_EN)[quoteIndex].role}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
              {/* Quote dots indicator */}
              <div className="flex gap-2 mt-6 justify-center">
                {MARKETING_QUOTES_EN.slice(0, 8).map((_, i) => (
                  <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === quoteIndex ? "w-6 bg-emerald-300" : "w-2 bg-white/20"}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════ GETTING STARTED ═══════════════════ */}
      <GettingStartedCard stats={stats} locale={locale} />

      {/* ═══════════════════ STATS GRID ═══════════════════ */}
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
        {statItems.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${s.gradient} p-7 shadow-xl ${s.glow} hover:shadow-2xl transition-all duration-300 hover:scale-[1.03] cursor-default`}
          >
            {/* Card glow blob */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm mb-5">
                <s.icon className="h-8 w-8 text-white" />
              </div>
              <p className="text-5xl lg:text-6xl font-black text-white tracking-tight">{s.value.toLocaleString()}</p>
              <p className="text-lg font-bold text-white/70 mt-2">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ═══════════════════ QUICK ACTIONS ═══════════════════ */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-3xl font-black text-[#004D26]">{t.quickActions}</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((a, i) => (
            <motion.div key={a.href} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}>
              <Link href={a.href} className={`group relative block overflow-hidden rounded-2xl border-2 border-transparent bg-white p-8 shadow-lg ${a.glow} hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}>
                {/* Top gradient accent bar */}
                <div className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${a.gradient}`} />
                <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${a.gradient} shadow-lg`}>
                  <a.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-extrabold text-[#004D26] mb-2">{a.title}</h3>
                <p className="text-lg text-[#5A8A6A] leading-relaxed">{a.desc}</p>
                <div className={`mt-6 inline-flex items-center gap-2 text-lg font-bold bg-gradient-to-r ${a.gradient} bg-clip-text text-transparent`}>
                  {locale === "ar" ? "\u0627\u0628\u062f\u0623 \u0627\u0644\u0622\u0646" : "Get started"} <ArrowRight className={`h-5 w-5 text-emerald-500 group-hover:translate-x-1 transition-transform ${isRtl ? "rotate-180 group-hover:-translate-x-1" : ""}`} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ═══════════════════ LATEST PLAN ═══════════════════ */}
      <div className="rounded-2xl border-2 border-[#D4EBD9] bg-white overflow-hidden shadow-lg">
        <div className="flex items-center justify-between p-7 border-b-2 border-[#D4EBD9]">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-400/20">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#004D26]">{t.latestPlan}</h2>
          </div>
          {latestPlan && (
            <Link href="/my-plans" className="flex items-center gap-2 text-lg font-bold text-[#006C35] hover:underline">
              {t.viewFullPlan} <ArrowRight className={`h-5 w-5 ${isRtl ? "rotate-180" : ""}`} />
            </Link>
          )}
        </div>
        <div className="p-7">
          {days.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
              {days.map((d, i) => {
                const key = d.platform?.toLowerCase().trim() ?? "";
                const grad = PLATFORM_GRADIENT[key] || "from-gray-400 to-gray-500";
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="group relative overflow-hidden rounded-2xl border-2 border-[#D4EBD9] p-5 text-center hover:border-transparent hover:shadow-lg transition-all duration-300"
                  >
                    {/* Hover gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${grad} opacity-0 group-hover:opacity-5 transition-opacity`} />
                    <div className={`mx-auto mb-3 h-1.5 w-12 rounded-full bg-gradient-to-r ${grad}`} />
                    <p className="text-lg font-bold text-[#004D26]">{locale === "ar" ? d.dayAr : d.dayEn || d.dayAr}</p>
                    <p className="my-3 text-4xl">{PLATFORM_EMOJI[key] || "\ud83d\udce2"}</p>
                    <p className="text-base text-[#2D5A3D] leading-snug line-clamp-2">{locale === "ar" ? d.topicAr : d.topic || d.topicAr}</p>
                    <span className={`mt-3 inline-block rounded-xl bg-gradient-to-r ${grad} px-3 py-1 text-sm font-bold text-white capitalize`}>{d.platform}</span>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100">
                <Calendar className="h-10 w-10 text-amber-500" />
              </div>
              <p className="text-xl text-[#5A8A6A]">{t.noPlansYet}</p>
              <Link href="/planner" className="mt-4 inline-flex items-center gap-2 text-lg font-bold text-amber-600 hover:underline">
                {locale === "ar" ? "\u0627\u0628\u062f\u0623 \u0627\u0644\u0622\u0646" : "Create one now"} <ArrowRight className={`h-5 w-5 ${isRtl ? "rotate-180" : ""}`} />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════ YOUR COMPANIES ═══════════════════ */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-3xl font-black text-[#004D26]">{t.yourCompanies}</h2>
          </div>
          <Link href="/companies" className="flex items-center gap-2 text-lg font-bold text-[#006C35] hover:underline">
            {locale === "ar" ? "\u0639\u0631\u0636 \u0627\u0644\u0643\u0644" : "View all"} <ArrowRight className={`h-5 w-5 ${isRtl ? "rotate-180" : ""}`} />
          </Link>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-nawaa">
          {companies.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
              <Link href="/companies" className="group block min-w-[280px] shrink-0 rounded-2xl border-2 border-[#D4EBD9] bg-white p-7 text-center hover:border-emerald-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div
                  className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-2xl text-4xl font-black text-white overflow-hidden shadow-lg"
                  style={{ backgroundColor: c.brand_colors?.[0] || "#006C35" }}
                >
                  {c.logo_url ? <img src={c.logo_url} alt="" className="h-full w-full object-cover" /> : c.name?.charAt(0) || "?"}
                </div>
                <p className="text-xl font-extrabold text-[#004D26] truncate">{c.name}</p>
                {c.industry && (
                  <span className="mt-3 inline-block rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 px-4 py-1.5 text-base font-semibold text-emerald-700">{c.industry}</span>
                )}
              </Link>
            </motion.div>
          ))}
          <Link href="/companies" className="min-w-[280px] shrink-0 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#D4EBD9] p-7 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all duration-300 group">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 group-hover:bg-emerald-200 transition-colors">
              <Plus className="h-8 w-8 text-emerald-600" />
            </div>
            <span className="text-xl font-extrabold text-[#004D26]">{t.addCompany}</span>
          </Link>
        </div>
      </div>

      {/* ═══════════════════ RECENT IMAGES ═══════════════════ */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
              <ImageIcon className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-3xl font-black text-[#004D26]">{t.recentImages}</h2>
          </div>
          {recentImages.length > 0 && (
            <Link href="/my-generations" className="flex items-center gap-2 text-lg font-bold text-violet-600 hover:underline">
              {locale === "ar" ? "\u0639\u0631\u0636 \u0627\u0644\u0643\u0644" : "View all"} <ArrowRight className={`h-5 w-5 ${isRtl ? "rotate-180" : ""}`} />
            </Link>
          )}
        </div>
        {recentImages.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {recentImages.filter(img => img.image_urls?.[0]).slice(0, 5).map((img, i) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                className="group relative aspect-square overflow-hidden rounded-2xl border-2 border-[#D4EBD9] shadow-md hover:shadow-xl hover:border-violet-300 transition-all duration-300"
              >
                <img src={img.image_urls![0]} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="rounded-xl bg-white/90 backdrop-blur-sm px-5 py-2.5 text-lg font-bold text-[#004D26] flex items-center gap-2 shadow-lg">
                    <Eye className="h-5 w-5" /> {locale === "ar" ? "\u0639\u0631\u0636" : "View"}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 py-16 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100">
              <ImageIcon className="h-10 w-10 text-violet-500" />
            </div>
            <p className="text-xl text-violet-400 font-semibold">{t.noImagesYet}</p>
            <Link href="/vision-studio" className="mt-4 inline-flex items-center gap-2 text-lg font-bold text-violet-600 hover:underline">
              {locale === "ar" ? "\u0627\u0628\u062f\u0623 \u0627\u0644\u0625\u0646\u0634\u0627\u0621" : "Start creating"} <ArrowRight className={`h-5 w-5 ${isRtl ? "rotate-180" : ""}`} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
