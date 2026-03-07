"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, Download, ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useAppStore, type Company } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

type ContentPlanRow = {
  id: string;
  week_start: string;
  title: string | null;
  plan_data: { days?: Array<{ dayIndex: number; dayEn: string; dayAr: string; topic: string; topicAr?: string; caption?: string; imagePromptHint?: string; platform?: string; contentType?: string }> };
};

const STYLES = [
  { id: "lifestyle", label: "Lifestyle Photography", emoji: "\uD83D\uDCF8", desc: "Real people, warm tones" },
  { id: "graphic", label: "Bold Graphic Design", emoji: "\uD83C\uDFA8", desc: "Colorful, typographic" },
  { id: "luxury", label: "Luxury Editorial", emoji: "\u2728", desc: "Clean, premium, refined" },
  { id: "heritage", label: "Saudi Heritage", emoji: "\uD83C\uDF19", desc: "Patterns, calligraphy, traditional" },
];

export default function VisionStudioPage() {
  const supabase = createClient();
  const { selectedCompany, setSelectedCompany } = useAppStore();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [plans, setPlans] = useState<ContentPlanRow[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<ContentPlanRow | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [style, setStyle] = useState<string>("lifestyle");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [outputLanguage, setOutputLanguage] = useState<"en" | "ar">("ar");
  const [generating, setGenerating] = useState(false);
  const [images, setImages] = useState<{ id: number; style_label: string; url?: string; prompt_used: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: comps } = await supabase
        .from("companies")
        .select("*")
        .eq("user_id", user.id);
      setCompanies((comps as Company[]) ?? []);
      if (comps?.length && !selectedCompany) setSelectedCompany(comps[0] as Company);
      const { data: plansData } = await supabase
        .from("content_plans")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      setPlans((plansData as ContentPlanRow[]) ?? []);
      setLoading(false);
    })();
  }, [selectedCompany, setSelectedCompany]);

  useEffect(() => {
    if (!selectedCompany?.id) return;
    const filtered = plans.filter((p) => p.plan_data?.days?.length);
    if (filtered.length && !selectedPlan) setSelectedPlan(filtered[0]);
    else setSelectedPlan(filtered[0] ?? null);
    setSelectedDayIndex(0);
  }, [selectedCompany?.id, plans]);

  const currentDay = selectedPlan?.plan_data?.days?.[selectedDayIndex ?? 0];

  async function handleGenerate() {
    if (!selectedCompany || !currentDay) {
      toast.error("Select a company and a content day");
      return;
    }
    setGenerating(true);
    setImages([]);
    try {
      const res = await fetch("/api/generate-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: selectedCompany,
          dayContent: {
            platform: currentDay.platform,
            contentType: currentDay.contentType,
            topic: currentDay.topic,
            topicAr: currentDay.topicAr,
            caption: currentDay.caption,
            imagePromptHint: currentDay.imagePromptHint,
          },
          style,
          additionalInstructions: additionalInstructions.trim() || undefined,
          outputLanguage,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setImages(json.images ?? []);
      const { data: { user } } = await supabase.auth.getUser();
      if (user && json.images?.length) {
        await supabase.from("generated_images").insert({
          user_id: user.id,
          company_id: selectedCompany.id,
          plan_id: selectedPlan?.id ?? null,
          day_label: currentDay.dayAr || currentDay.dayEn,
          prompt_used: json.images.map((i: { prompt_used: string }) => i.prompt_used).join("\n---\n"),
          image_urls: json.images.map((i: { url: string }) => i.url).filter(Boolean),
        });
      }
      toast.success("Images generated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    }
    setGenerating(false);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64 rounded-lg bg-[#172E1F]" />
        <Skeleton className="h-96 rounded-2xl bg-[#0B1A0F] border border-[#172E1F]" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-6 lg:col-span-2">
        <div>
          <h1 className="font-['Cairo'] text-2xl font-bold text-[#D0EBDA]">
            Vision Studio
          </h1>
          <p className="text-sm text-[#7B9E86]">
            Generate visual content powered by AI
          </p>
        </div>

        <Card className="glass border-[#172E1F]">
          <CardHeader>
            <CardTitle className="text-base text-[#D0EBDA]">Company</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={selectedCompany?.id ?? ""}
              onChange={(e) => {
                const c = companies.find((x) => x.id === e.target.value);
                if (c) setSelectedCompany(c);
              }}
              className="w-full rounded-xl border border-[#172E1F] bg-[#020B05]/80 px-3 py-2 text-[#D0EBDA] transition-all duration-300 focus:border-[#006C35] focus:shadow-[0_0_15px_rgba(0,108,53,0.1)]"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {selectedCompany?.brand_colors?.length ? (
              <div className="mt-2 flex gap-1">
                {selectedCompany.brand_colors.slice(0, 5).map((hex, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.05, type: "spring" }}
                    whileHover={{ scale: 1.3, y: -2 }}
                    className="h-4 w-4 rounded-full border border-[#172E1F]"
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="glass border-[#172E1F]">
          <CardHeader>
            <CardTitle className="text-base text-[#D0EBDA]">Content day</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <select
              value={selectedPlan?.id ?? ""}
              onChange={(e) => {
                const p = plans.find((x) => x.id === e.target.value);
                setSelectedPlan(p ?? null);
                setSelectedDayIndex(0);
              }}
              className="w-full rounded-xl border border-[#172E1F] bg-[#020B05]/80 px-3 py-2 text-[#D0EBDA] transition-all duration-300 focus:border-[#006C35] focus:shadow-[0_0_15px_rgba(0,108,53,0.1)]"
            >
              {plans.filter((p) => p.plan_data?.days?.length).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title || p.week_start}
                </option>
              ))}
            </select>
            {selectedPlan?.plan_data?.days?.length ? (
              <div className="flex flex-wrap gap-1">
                {selectedPlan.plan_data.days.map((d, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedDayIndex(i)}
                    className={cn(
                      "rounded px-2 py-1 text-xs transition",
                      selectedDayIndex === i ? "bg-[#006C35] text-white" : "bg-[#172E1F] text-[#7B9E86]"
                    )}
                  >
                    {d.dayAr || d.dayEn}
                  </button>
                ))}
              </div>
            ) : null}
            {currentDay ? (
              <div className="rounded-lg border border-[#172E1F] bg-[#020B05] p-3 text-sm">
                <p className="font-medium text-[#D0EBDA]">{currentDay.topicAr || currentDay.topic}</p>
                <p className="mt-1 text-xs text-[#7B9E86]">{currentDay.imagePromptHint}</p>
              </div>
            ) : (
              <p className="text-sm text-[#7B9E86]">Save a content plan first, then pick a day.</p>
            )}
          </CardContent>
        </Card>

        <Card className="glass border-[#172E1F]">
          <CardHeader>
            <CardTitle className="text-base text-[#D0EBDA]">Style</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {STYLES.map((s) => (
              <motion.button
                key={s.id}
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStyle(s.id)}
                className={cn(
                  "rounded-xl border p-3 text-left transition",
                  style === s.id
                    ? "border-[#C9A84C] bg-[#C9A84C]/10 shadow-[0_0_15px_rgba(201,168,76,0.1)]"
                    : "border-[#172E1F] bg-[#020B05] hover:border-[#1E4030]"
                )}
              >
                <span className="text-lg">{s.emoji}</span>
                <p className="mt-1 text-sm font-medium text-[#D0EBDA]">{s.label}</p>
                <p className="text-xs text-[#7B9E86]">{s.desc}</p>
              </motion.button>
            ))}
          </CardContent>
        </Card>

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
              EN
            </Button>
            <Button
              type="button"
              size="sm"
              variant={outputLanguage === "ar" ? "default" : "outline"}
              className={outputLanguage === "ar" ? "bg-[#006C35]" : "border-[#172E1F]"}
              onClick={() => setOutputLanguage("ar")}
            >
              {"\u0639\u0631"}
            </Button>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#D0EBDA]">Extra instructions</label>
          <Textarea
            value={additionalInstructions}
            onChange={(e) => setAdditionalInstructions(e.target.value)}
            placeholder="Objects, mood, setting..."
            className="min-h-[80px] border-[#172E1F] bg-[#020B05] text-[#D0EBDA]"
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={generating || !currentDay}
          className="w-full bg-gradient-to-r from-[#C9A84C] to-[#E8D5A0] text-[#020B05] hover:shadow-[0_0_25px_rgba(201,168,76,0.3)] transition-all duration-300"
        >
          {generating ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-5 w-5" />
          )}
          Generate 4 Images
        </Button>
      </div>

      <div className="lg:col-span-3">
        <Card className="glass border-[#172E1F]">
          <CardHeader>
            <CardTitle className="text-[#D0EBDA]">Generated images</CardTitle>
          </CardHeader>
          <CardContent>
            {images.length === 0 && !generating ? (
              <div className="glass flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#172E1F] py-16">
                <ImageIcon className="h-16 w-16 text-[#7B9E86]" />
                <p className="mt-4 text-[#7B9E86]">Your images will appear here</p>
              </div>
            ) : generating ? (
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="relative aspect-square overflow-hidden rounded-xl bg-[#172E1F]">
                    <div className="absolute inset-0 animate-shimmer" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="h-8 w-8 text-[#C9A84C]/30 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {images.map((img, i) => (
                  <motion.div
                    key={img.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="group relative overflow-hidden rounded-xl border border-[#172E1F]"
                  >
                    {img.url ? (
                      <img
                        src={img.url}
                        alt={img.style_label}
                        className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : null}
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-[#020B05]/80 backdrop-blur-sm opacity-0 transition group-hover:opacity-100">
                      <motion.a
                        href={img.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        className="glass-strong rounded-lg px-3 py-1.5 text-sm text-[#D0EBDA]"
                      >
                        Full screen
                      </motion.a>
                      <motion.a
                        href={img.url}
                        download
                        whileHover={{ scale: 1.1 }}
                        className="glass-strong rounded-lg bg-[#006C35] px-3 py-1.5 text-sm text-white"
                      >
                        <Download className="inline h-4 w-4" />
                      </motion.a>
                    </div>
                    <span className="glass absolute bottom-2 left-2 rounded px-2 py-0.5 text-xs text-[#D0EBDA]">
                      {img.style_label}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
