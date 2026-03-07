"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Building2,
  Calendar,
  Image as ImageIcon,
  Globe,
  Plus,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";
import { messages } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { GlowCard } from "@/components/GlowCard";
import { AnimatedCounter } from "@/components/AnimatedCounter";

type Company = {
  id: string;
  name: string;
  name_ar: string | null;
  industry: string | null;
  logo_url: string | null;
  brand_colors: string[] | null;
  platforms: string[] | null;
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

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { user, selectedCompany, setSelectedCompany, locale } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [latestPlan, setLatestPlan] = useState<ContentPlan | null>(null);
  const [recentImages, setRecentImages] = useState<GeneratedImage[]>([]);
  const [stats, setStats] = useState({
    companies: 0,
    plans: 0,
    images: 0,
    platforms: 0,
  });

  const t = messages[locale].dashboard;

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) {
        setLoading(false);
        return;
      }
      const [companiesRes, plansRes, imagesRes] = await Promise.all([
        supabase.from("companies").select("*").eq("user_id", u.id).order("created_at", { ascending: false }),
        supabase.from("content_plans").select("*").eq("user_id", u.id).order("created_at", { ascending: false }).limit(1),
        supabase.from("generated_images").select("*").eq("user_id", u.id).order("created_at", { ascending: false }).limit(6),
      ]);
      const comps = (companiesRes.data || []) as Company[];
      setCompanies(comps);
      if (comps.length && !selectedCompany) setSelectedCompany(comps[0]);
      const plans = plansRes.data as ContentPlan[] | null;
      setLatestPlan(plans?.[0] || null);
      setRecentImages((imagesRes.data || []) as GeneratedImage[]);
      const platformSet = new Set<string>();
      comps.forEach((c) => (c.platforms || []).forEach((p) => platformSet.add(p)));
      setStats({
        companies: comps.length,
        plans: plansRes.count ?? (plans?.length ? 1 : 0),
        images: imagesRes.data?.length ?? 0,
        platforms: platformSet.size,
      });
      setLoading(false);
    })();
  }, [selectedCompany, setSelectedCompany]);

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "there";
  const days = latestPlan?.plan_data?.days?.slice(0, 7) || [];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 rounded-lg bg-[#172E1F] animate-shimmer" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl bg-[#0B1A0F] border border-[#172E1F] animate-shimmer" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl bg-[#0B1A0F] border border-[#172E1F] animate-shimmer" />
      </div>
    );
  }

  const statItems = [
    { label: t.totalCompanies, value: stats.companies, icon: Building2, color: "text-[#00A352]", bgGrad: "bg-gradient-to-br from-[#006C35]/20 to-[#00A352]/10", glowColor: "green" as const },
    { label: t.plansGenerated, value: stats.plans, icon: Calendar, color: "text-[#C9A84C]", bgGrad: "bg-gradient-to-br from-[#C9A84C]/20 to-[#E8D5A0]/10", glowColor: "gold" as const },
    { label: t.imagesCreated, value: stats.images, icon: ImageIcon, color: "text-[#00A352]", bgGrad: "bg-gradient-to-br from-[#006C35]/20 to-[#00A352]/10", glowColor: "green" as const },
    { label: t.platformsActive, value: stats.platforms, icon: Globe, color: "text-[#C9A84C]", bgGrad: "bg-gradient-to-br from-[#C9A84C]/20 to-[#E8D5A0]/10", glowColor: "gold" as const },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <motion.div variants={item}>
        <h1 className="font-cairo text-3xl font-bold text-[#D0EBDA] md:text-4xl">
          {t.greeting}, {displayName} {"\ud83d\udc4b"}
        </h1>
        <p className="mt-2 text-base text-[#7B9E86]">
          {formatDate(new Date())} — {locale === "ar" ? "\u0646\u0648\u0627\u0629" : "Nawaa"} AI
        </p>
      </motion.div>

      {/* Stat Cards with GlowCard and AnimatedCounter */}
      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statItems.map((s) => (
          <GlowCard key={s.label} glowColor={s.glowColor}>
            <CardContent className="flex items-center gap-5 p-6">
              <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl", s.bgGrad)}>
                <s.icon className={cn("h-7 w-7", s.color)} />
              </div>
              <div>
                <AnimatedCounter
                  end={s.value}
                  duration={1500}
                  className="text-3xl font-bold text-[#D0EBDA]"
                />
                <p className="text-sm text-[#7B9E86] mt-0.5">{s.label}</p>
              </div>
            </CardContent>
          </GlowCard>
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Latest Plan */}
        <motion.div variants={item} className="lg:col-span-3">
          <Card className="glass border-[#172E1F]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-[#D0EBDA]">{t.latestPlan}</CardTitle>
              {latestPlan && (
                <Button asChild variant="outline" size="sm" className="border-[#172E1F] text-[#D0EBDA] hover:bg-[#172E1F]">
                  <Link href="/planner">{t.viewFullPlan}</Link>
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {days.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7">
                  {days.map((d, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -2 }}
                      className="rounded-xl border border-[#172E1F] bg-[#061009] p-3 text-center transition-colors hover:border-[#1E4030]"
                    >
                      <p className="text-sm text-[#7B9E86]">{locale === "ar" ? d.dayAr : d.dayEn || d.dayAr}</p>
                      <p className="truncate text-sm font-medium text-[#D0EBDA] mt-1">{locale === "ar" ? d.topicAr : d.topic || d.topicAr}</p>
                      <span className="mt-1.5 inline-block rounded bg-[#006C35]/30 px-2 py-0.5 text-xs text-[#00A352]">
                        {d.platform}
                      </span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-[#7B9E86]">
                  {t.noPlansYet}
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="border-[#172E1F] bg-[#0B1A0F]">
            <CardHeader>
              <CardTitle className="text-[#D0EBDA]">{t.quickActions}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button asChild className="h-14 justify-start gap-3 text-[15px] font-semibold bg-gradient-to-r from-[#006C35] to-[#00A352] hover:shadow-[0_0_20px_rgba(0,163,82,0.2)] transition-shadow rounded-xl">
                <Link href="/companies">
                  <Building2 className="h-5 w-5" />
                  {t.addNewCompany}
                </Link>
              </Button>
              <Button asChild className="h-14 justify-start gap-3 text-[15px] font-semibold bg-gradient-to-r from-[#C9A84C] to-[#E8D5A0] text-[#020B05] hover:shadow-[0_0_20px_rgba(201,168,76,0.2)] transition-shadow rounded-xl">
                <Link href="/planner">
                  <Calendar className="h-5 w-5" />
                  {t.generateThisWeek}
                </Link>
              </Button>
              <Button asChild className="h-14 justify-start gap-3 text-[15px] font-semibold bg-gradient-to-r from-[#00A352] to-[#006C35] hover:shadow-[0_0_20px_rgba(0,163,82,0.2)] transition-shadow rounded-xl">
                <Link href="/vision-studio">
                  <Sparkles className="h-5 w-5" />
                  {t.createVisual}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Companies */}
      <motion.div variants={item}>
        <h2 className="mb-5 font-cairo text-xl font-bold text-[#D0EBDA]">{t.yourCompanies}</h2>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-nawaa">
          {companies.map((c) => (
            <GlowCard
              key={c.id}
              glowColor="green"
              className="min-w-[200px] shrink-0"
            >
              <Link
                href="/companies"
                className="flex flex-col p-5"
              >
                <div
                  className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold text-white transition-shadow group-hover:shadow-[0_0_15px_rgba(0,108,53,0.3)]"
                  style={{
                    backgroundColor: c.brand_colors?.[0] || "#006C35",
                  }}
                >
                  {c.name?.charAt(0) || "?"}
                </div>
                <p className="truncate text-center text-[15px] font-semibold text-[#D0EBDA]">{c.name}</p>
                {c.name_ar && (
                  <p className="truncate text-center text-sm text-[#7B9E86]">{c.name_ar}</p>
                )}
                {c.industry && (
                  <span className="mt-1.5 inline-block self-center rounded-full bg-[#172E1F] px-2.5 py-1 text-xs text-[#7B9E86]">
                    {c.industry}
                  </span>
                )}
              </Link>
            </GlowCard>
          ))}
          <Link
            href="/companies"
            className="flex min-w-[200px] shrink-0 flex-col items-center justify-center rounded-2xl border border-dashed border-[#172E1F] bg-[#061009] p-5 text-[#7B9E86] transition-colors hover:border-[#006C35] hover:text-[#00A352]"
          >
            <Plus className="mb-2 h-9 w-9" />
            <span className="text-[15px] font-semibold">{t.addCompany}</span>
          </Link>
        </div>
      </motion.div>

      {/* Recent Images */}
      <motion.div variants={item}>
        <h2 className="mb-5 font-cairo text-xl font-bold text-[#D0EBDA]">{t.recentImages}</h2>
        {recentImages.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {recentImages.map((img) => {
              const url = img.image_urls?.[0];
              return (
                <motion.div
                  key={img.id}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="group aspect-square overflow-hidden rounded-xl border border-[#172E1F] bg-[#061009]"
                >
                  {url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={url} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[#7B9E86]">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <p className="rounded-2xl border border-[#172E1F] bg-[#0B1A0F] py-8 text-center text-sm text-[#7B9E86]">
            {t.noImagesYet}
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
