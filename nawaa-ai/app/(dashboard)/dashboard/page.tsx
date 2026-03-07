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
        <Skeleton className="h-10 w-64 rounded-lg bg-[#172E1F]" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl bg-[#0B1A0F] border border-[#172E1F]" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl bg-[#0B1A0F] border border-[#172E1F]" />
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <motion.div variants={item}>
        <h1 className="font-cairo text-2xl font-bold text-[#D0EBDA] md:text-3xl">
          {t.greeting}, {displayName} 👋
        </h1>
        <p className="mt-1 text-sm text-[#7B9E86]">
          {formatDate(new Date())} — {locale === "ar" ? "نواة" : "Nawaa"} AI
        </p>
      </motion.div>

      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: t.totalCompanies, value: stats.companies, icon: Building2, color: "text-[#00A352]" },
          { label: t.plansGenerated, value: stats.plans, icon: Calendar, color: "text-[#C9A84C]" },
          { label: t.imagesCreated, value: stats.images, icon: ImageIcon, color: "text-[#00A352]" },
          { label: t.platformsActive, value: stats.platforms, icon: Globe, color: "text-[#C9A84C]" },
        ].map((s) => (
          <Card
            key={s.label}
            className="border-[#172E1F] bg-[#0B1A0F] transition-all hover:-translate-y-0.5 hover:border-[#1E4030]"
          >
            <CardContent className="flex items-center gap-4 p-5">
              <s.icon className={cn("h-8 w-8", s.color)} />
              <div>
                <p className="text-2xl font-bold text-[#D0EBDA]">{s.value}</p>
                <p className="text-xs text-[#7B9E86]">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-5">
        <motion.div variants={item} className="lg:col-span-3">
          <Card className="border-[#172E1F] bg-[#0B1A0F]">
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
                    <div
                      key={i}
                      className="rounded-xl border border-[#172E1F] bg-[#061009] p-2 text-center"
                    >
                      <p className="text-xs text-[#7B9E86]">{locale === "ar" ? d.dayAr : d.dayEn || d.dayAr}</p>
                      <p className="truncate text-xs font-medium text-[#D0EBDA]">{locale === "ar" ? d.topicAr : d.topic || d.topicAr}</p>
                      <span className="mt-1 inline-block rounded bg-[#006C35]/30 px-1.5 text-[10px] text-[#00A352]">
                        {d.platform}
                      </span>
                    </div>
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

        <motion.div variants={item} className="lg:col-span-2">
          <Card className="border-[#172E1F] bg-[#0B1A0F]">
            <CardHeader>
              <CardTitle className="text-[#D0EBDA]">{t.quickActions}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button asChild className="h-12 justify-start gap-2 bg-[#006C35] hover:bg-[#00A352]">
                <Link href="/companies">
                  <Building2 className="h-5 w-5" />
                  {t.addNewCompany}
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-12 justify-start gap-2 border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C]/10">
                <Link href="/planner">
                  <Calendar className="h-5 w-5" />
                  {t.generateThisWeek}
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-12 justify-start gap-2 border-[#00A352] text-[#00A352] hover:bg-[#00A352]/10">
                <Link href="/vision-studio">
                  <Sparkles className="h-5 w-5" />
                  {t.createVisual}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={item}>
        <h2 className="mb-4 font-cairo text-lg font-semibold text-[#D0EBDA]">{t.yourCompanies}</h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {companies.map((c) => (
            <Link
              key={c.id}
              href="/companies"
              className="flex min-w-[180px] shrink-0 flex-col rounded-2xl border border-[#172E1F] bg-[#0B1A0F] p-4 transition-all hover:-translate-y-0.5 hover:border-[#1E4030]"
            >
              <div
                className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white"
                style={{
                  backgroundColor: c.brand_colors?.[0] || "#006C35",
                }}
              >
                {c.name?.charAt(0) || "?"}
              </div>
              <p className="truncate text-center font-medium text-[#D0EBDA]">{c.name}</p>
              {c.name_ar && (
                <p className="truncate text-center text-xs text-[#7B9E86]">{c.name_ar}</p>
              )}
              {c.industry && (
                <span className="mt-1 inline-block self-center rounded-full bg-[#172E1F] px-2 py-0.5 text-[10px] text-[#7B9E86]">
                  {c.industry}
                </span>
              )}
            </Link>
          ))}
          <Link
            href="/companies"
            className="flex min-w-[180px] shrink-0 flex-col items-center justify-center rounded-2xl border border-dashed border-[#172E1F] bg-[#061009] p-4 text-[#7B9E86] transition-colors hover:border-[#006C35] hover:text-[#00A352]"
          >
            <Plus className="mb-1 h-8 w-8" />
            <span className="text-sm font-medium">{t.addCompany}</span>
          </Link>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <h2 className="mb-4 font-cairo text-lg font-semibold text-[#D0EBDA]">{t.recentImages}</h2>
        {recentImages.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {recentImages.map((img) => {
              const url = img.image_urls?.[0];
              return (
                <div
                  key={img.id}
                  className="aspect-square overflow-hidden rounded-xl border border-[#172E1F] bg-[#061009]"
                >
                  {url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[#7B9E86]">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                  )}
                </div>
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
