"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Sparkles, Save, Download, Loader2, Palette } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useAppStore, type Company } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format, addDays, nextSaturday, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { exportPlanToPDF } from "@/lib/export-plan-pdf";
import toast from "react-hot-toast";

const PLATFORMS = [
  { id: "instagram", label: "Instagram", color: "bg-pink-500/20 text-pink-400" },
  { id: "tiktok", label: "TikTok", color: "bg-zinc-800 text-white" },
  { id: "x", label: "X", color: "bg-zinc-700 text-white" },
  { id: "snapchat", label: "Snapchat", color: "bg-yellow-400/20 text-yellow-400" },
  { id: "linkedin", label: "LinkedIn", color: "bg-blue-600/20 text-blue-400" },
  { id: "youtube", label: "YouTube", color: "bg-red-600/20 text-red-400" },
  { id: "whatsapp", label: "WhatsApp", color: "bg-green-600/20 text-green-400" },
];

const LOADING_MESSAGES = [
  "🔍 Analyzing your brand...",
  "🧠 Understanding your audience...",
  "✍️ Crafting content strategy...",
  "📅 Building your weekly calendar...",
  "✨ Adding the Saudi touch...",
];

type PlanDay = {
  dayIndex: number;
  dayEn: string;
  dayAr: string;
  date: string;
  platform: string;
  contentType: string;
  topic: string;
  topicAr?: string;
  caption: string;
  captionAr?: string;
  hashtags: string[];
  postingTime: string;
  contentTips?: string;
  imagePromptHint?: string;
};

type Plan = {
  weekTheme: string;
  weekThemeAr: string;
  days: PlanDay[];
  weeklyStrategy?: string;
  expectedEngagement?: string;
};

export default function PlannerPage() {
  const supabase = createClient();
  const { selectedCompany, setSelectedCompany } = useAppStore();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [weekStart, setWeekStart] = useState("");
  const [userPrompt, setUserPrompt] = useState("");
  const [outputLanguage, setOutputLanguage] = useState<"en" | "ar">("ar");
  const [generating, setGenerating] = useState(false);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [saving, setSaving] = useState(false);
  const [refineOpen, setRefineOpen] = useState(false);
  const [refineText, setRefineText] = useState("");

  useEffect(() => {
    const sat = nextSaturday(new Date());
    setWeekStart(format(sat, "yyyy-MM-dd"));
  }, []);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("companies")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setCompanies((data as Company[]) ?? []);
      if (data?.length && !selectedCompany) setSelectedCompany(data[0] as Company);
      setLoadingCompanies(false);
    })();
  }, [selectedCompany, setSelectedCompany]);

  useEffect(() => {
    if (!generating) return;
    const t = setInterval(() => {
      setLoadingMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 1500);
    return () => clearInterval(t);
  }, [generating]);

  function togglePlatform(id: string) {
    setPlatforms((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id]
    );
  }

  async function handleGenerate() {
    if (!selectedCompany) {
      toast.error("Select a company first");
      return;
    }
    setGenerating(true);
    setPlan(null);
    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: selectedCompany,
          platforms: platforms.length ? platforms : PLATFORMS.map((p) => p.id),
          weekStart,
          userPrompt: userPrompt.trim() || undefined,
          outputLanguage,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to generate plan");
      setPlan(json.plan);
      toast.success("Plan generated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate plan");
    }
    setGenerating(false);
  }

  async function handleSave() {
    if (!plan || !selectedCompany) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("content_plans").insert({
      user_id: user.id,
      company_id: selectedCompany.id,
      title: `${plan.weekTheme} — ${weekStart}`,
      week_start: weekStart,
      platforms: platforms.length ? platforms : PLATFORMS.map((p) => p.id),
      prompt: userPrompt.trim() || null,
      plan_data: plan,
    });
    if (error) toast.error(error.message);
    else toast.success("Plan saved");
    setSaving(false);
  }

  function handleExportPDF() {
    if (!plan || !selectedCompany) return;
    exportPlanToPDF(plan, selectedCompany, outputLanguage).then(
      () => toast.success("PDF downloaded"),
      (e) => toast.error(e instanceof Error ? e.message : "Export failed")
    );
  }

  if (loadingCompanies) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64 rounded-lg bg-[#172E1F]" />
        <Skeleton className="h-64 rounded-2xl bg-[#0B1A0F] border border-[#172E1F]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-['Cairo'] text-2xl font-bold text-[#D0EBDA]">Content Planner</h1>
        <p className="text-sm text-[#7B9E86]">مخطط المحتوى — Generate your weekly content plan</p>
      </div>

      <AnimatePresence>
        {generating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#020B05]/90"
          >
            <div className="h-24 w-24 animate-pulse rounded-full border-4 border-[#C9A84C]/50 bg-[#0B1A0F]" />
            <p className="mt-6 text-lg text-[#D0EBDA]">
              {LOADING_MESSAGES[loadingMsgIndex]}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {!plan ? (
        <Card className="border-[#172E1F] bg-[#0B1A0F]">
          <CardHeader>
            <CardTitle className="text-[#D0EBDA]">Setup</CardTitle>
            <p className="text-sm text-[#7B9E86]">Choose company, platforms, and week</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#D0EBDA]">Company</label>
              <select
                value={selectedCompany?.id ?? ""}
                onChange={(e) => {
                  const c = companies.find((x) => x.id === e.target.value);
                  if (c) setSelectedCompany(c);
                }}
                className="w-full rounded-lg border border-[#172E1F] bg-[#020B05] px-3 py-2 text-[#D0EBDA]"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#D0EBDA]">Platforms</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePlatform(p.id)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-sm transition",
                      platforms.includes(p.id) ? p.color : "bg-[#172E1F] text-[#7B9E86]"
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setPlatforms(platforms.length === PLATFORMS.length ? [] : PLATFORMS.map((p) => p.id))}
                className="mt-2 text-xs text-[#00A352] hover:underline"
              >
                {platforms.length === PLATFORMS.length ? "Clear all" : "Select all"}
              </button>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#D0EBDA]">Week start (Saturday)</label>
              <input
                type="date"
                value={weekStart}
                onChange={(e) => setWeekStart(e.target.value)}
                className="rounded-lg border border-[#172E1F] bg-[#020B05] px-3 py-2 text-[#D0EBDA]"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#D0EBDA]">Generate in</label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={outputLanguage === "en" ? "default" : "outline"}
                  className={outputLanguage === "en" ? "bg-[#006C35]" : "border-[#172E1F]"}
                  onClick={() => setOutputLanguage("en")}
                >
                  English
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={outputLanguage === "ar" ? "default" : "outline"}
                  className={outputLanguage === "ar" ? "bg-[#006C35]" : "border-[#172E1F]"}
                  onClick={() => setOutputLanguage("ar")}
                >
                  العربية
                </Button>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#D0EBDA]">Special focus (optional)</label>
              <Textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="e.g. Ramadan campaign, new product launch"
                className="min-h-[80px] border-[#172E1F] bg-[#020B05] text-[#D0EBDA]"
              />
            </div>
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full bg-[#C9A84C] text-[#020B05] hover:bg-[#E8D5A0]"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[#D0EBDA]">
                {plan.weekThemeAr || plan.weekTheme}
              </h2>
              <p className="text-sm text-[#7B9E86]">
                {weekStart && plan.days?.[0]?.date
                  ? `${format(parseISO(plan.days[0].date), "MMM d")} – ${format(parseISO(plan.days[6]?.date ?? weekStart), "MMM d, yyyy")}`
                  : weekStart}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-[#172E1F] text-[#D0EBDA]"
                onClick={() => setRefineOpen(true)}
              >
                Refine with AI
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-[#172E1F] text-[#D0EBDA]"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}
                Save Plan
              </Button>
              <Button
                size="sm"
                className="bg-[#006C35] hover:bg-[#00A352]"
                onClick={handleExportPDF}
              >
                <Download className="mr-1 h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
            {plan.days?.map((day) => {
              const platformStyle = PLATFORMS.find((p) => p.id === day.platform)?.color ?? "bg-[#172E1F]";
              return (
                <motion.div
                  key={day.dayIndex}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-[#172E1F] bg-[#0B1A0F] p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-[#D0EBDA]">{day.dayAr || day.dayEn}</span>
                    <span className="text-xs text-[#7B9E86]">{day.date}</span>
                  </div>
                  <span className={cn("inline-block rounded px-2 py-0.5 text-xs", platformStyle)}>
                    {day.platform}
                  </span>
                  <span className="ml-1 text-xs text-[#7B9E86]">{day.contentType}</span>
                  <p className="mt-2 font-medium text-[#D0EBDA]">{day.topicAr || day.topic}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-[#7B9E86]">
                    {day.captionAr || day.caption}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {day.hashtags?.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-[#172E1F] px-1.5 py-0.5 text-[10px] text-[#00A352]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="mt-1 text-[10px] text-[#7B9E86]">{day.postingTime}</p>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="mt-3 w-full border-[#172E1F] text-[#D0EBDA]"
                  >
                    <Link
                      href={{
                        pathname: "/vision-studio",
                        query: { planId: "current", dayIndex: day.dayIndex },
                      }}
                    >
                      <Palette className="mr-1 h-3 w-3" />
                      Generate Image
                    </Link>
                  </Button>
                </motion.div>
              );
            })}
          </div>

          <Button
            variant="outline"
            className="border-[#172E1F] text-[#7B9E86]"
            onClick={() => setPlan(null)}
          >
            Generate new plan
          </Button>
        </>
      )}

      <Dialog open={refineOpen} onOpenChange={setRefineOpen}>
        <DialogContent className="border-[#172E1F] bg-[#0B1A0F] text-[#D0EBDA]">
          <DialogHeader>
            <DialogTitle>Refine with AI</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#7B9E86]">Tell AI what to change...</p>
          <Textarea
            value={refineText}
            onChange={(e) => setRefineText(e.target.value)}
            className="min-h-[100px] border-[#172E1F] bg-[#020B05]"
            placeholder="e.g. More reels, less carousels; focus on product shots"
          />
          <Button
            className="bg-[#006C35] hover:bg-[#00A352]"
            onClick={async () => {
              setRefineOpen(false);
              const focusPrompt = refineText.trim();
              setRefineText("");
              if (focusPrompt) setUserPrompt(focusPrompt);
              setPlan(null);
              setGenerating(true);
              try {
                const res = await fetch("/api/generate-plan", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    company: selectedCompany,
                    platforms: platforms.length ? platforms : PLATFORMS.map((p) => p.id),
                    weekStart,
                    userPrompt: focusPrompt || userPrompt,
                    outputLanguage,
                  }),
                });
                const json = await res.json();
                if (!res.ok) throw new Error(json.error);
                setPlan(json.plan);
                toast.success("Plan refined");
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Failed");
              }
              setGenerating(false);
            }}
          >
            Regenerate
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
