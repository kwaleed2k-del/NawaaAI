"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Building2, Plus, Pencil, Check, Upload, Loader2, Sparkles, FileText, Clock, Target, Megaphone, Users, Zap, Shield, Flame, Crown, BadgeCheck } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase";
import { useAppStore, type Company } from "@/lib/store";
import { cn, truncate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GlowCard } from "@/components/GlowCard";
import toast from "react-hot-toast";

const INDUSTRIES = [
  "Food & Beverage",
  "Fashion",
  "Real Estate",
  "Technology",
  "Healthcare",
  "Education",
  "Retail",
  "Finance",
  "Other",
];

const TONES = [
  "Professional",
  "Playful",
  "Luxurious",
  "Inspirational",
  "Educational",
  "Bold",
];

const PLATFORMS = [
  "Instagram",
  "X (Twitter)",
  "TikTok",
  "Snapchat",
  "LinkedIn",
  "YouTube",
  "WhatsApp",
];

const FALLBACK_COLORS = ["#006C35", "#00A352", "#C9A84C", "#0B1A0F", "#D0EBDA"];

/* ─────────── Brand Analysis Visual Display ─────────── */

function BrandAnalysisDisplay({ data }: { data: Record<string, unknown> }) {
  const bp = data.brandPersonality as {
    innovation?: number; trust?: number; energy?: number;
    elegance?: number; boldness?: number; summary?: string;
  } | undefined;

  const pillars = data.contentPillars as Array<{
    name: string; nameAr?: string; description: string; percentage: number;
  }> | undefined;

  const audience = data.audienceInsights as {
    primaryAge?: string; interests?: string[];
    saudiSpecific?: string; bestPostingTimes?: Array<{ day: string; time: string; reason: string }>;
  } | undefined;

  const mix = data.contentMix as Record<string, number> | undefined;

  const platform = data.platformStrategy as {
    primary?: string; secondary?: string; rationale?: string;
  } | undefined;

  const tone = data.toneGuide as {
    doUse?: string[]; avoid?: string[]; exampleCaption?: string;
  } | undefined;

  const vision = data.vision2030Alignment as string | undefined;

  const personalityDimensions = bp ? [
    { key: "innovation", label: "Innovation", icon: <Zap className="h-3.5 w-3.5" />, value: bp.innovation ?? 0 },
    { key: "trust", label: "Trust", icon: <Shield className="h-3.5 w-3.5" />, value: bp.trust ?? 0 },
    { key: "energy", label: "Energy", icon: <Flame className="h-3.5 w-3.5" />, value: bp.energy ?? 0 },
    { key: "elegance", label: "Elegance", icon: <Crown className="h-3.5 w-3.5" />, value: bp.elegance ?? 0 },
    { key: "boldness", label: "Boldness", icon: <BadgeCheck className="h-3.5 w-3.5" />, value: bp.boldness ?? 0 },
  ] : [];

  const mixColors: Record<string, string> = {
    educational: "#006C35",
    promotional: "#C9A84C",
    engagement: "#00A352",
    storytelling: "#3B82F6",
    entertainment: "#A855F7",
  };

  const mixTotal = mix ? Object.values(mix).reduce((a, b) => a + b, 0) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 space-y-4"
    >
      {/* Brand Personality */}
      {bp && (
        <div className="rounded-xl border border-[#172E1F] bg-[#020B05] p-4">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gradient-gold">
            <Sparkles className="h-4 w-4 text-[#C9A84C]" />
            Brand Personality
          </h4>
          <div className="space-y-2.5">
            {personalityDimensions.map((d) => (
              <div key={d.key} className="flex items-center gap-2">
                <span className="text-[#7B9E86]">{d.icon}</span>
                <span className="w-20 text-xs text-[#D0EBDA]">{d.label}</span>
                <div className="flex-1 h-2.5 rounded-full bg-[#172E1F] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${d.value}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-[#006C35] to-[#00A352]"
                  />
                </div>
                <span className="w-8 text-right text-xs font-medium text-[#C9A84C]">{d.value}</span>
              </div>
            ))}
          </div>
          {bp.summary && (
            <p className="mt-3 text-xs text-[#7B9E86] italic border-t border-[#172E1F] pt-2">{bp.summary}</p>
          )}
        </div>
      )}

      {/* Content Pillars */}
      {pillars && pillars.length > 0 && (
        <div className="rounded-xl border border-[#172E1F] bg-[#020B05] p-4">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gradient-gold">
            <Target className="h-4 w-4 text-[#C9A84C]" />
            Content Pillars
          </h4>
          <div className="grid gap-2">
            {pillars.map((p, i) => (
              <div key={i} className="rounded-lg bg-[#0B1A0F] border border-[#172E1F] p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-[#D0EBDA]">
                    {p.name}{p.nameAr ? ` — ${p.nameAr}` : ""}
                  </span>
                  <span className="text-xs font-bold text-[#C9A84C]">{p.percentage}%</span>
                </div>
                <p className="text-xs text-[#7B9E86] mb-2">{p.description}</p>
                <div className="h-1.5 rounded-full bg-[#172E1F] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${p.percentage}%` }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className="h-full rounded-full bg-gradient-to-r from-[#C9A84C] to-[#E8D5A0]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audience Insights */}
      {audience && (
        <div className="rounded-xl border border-[#172E1F] bg-[#020B05] p-4">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gradient-gold">
            <Users className="h-4 w-4 text-[#C9A84C]" />
            Audience Insights
          </h4>
          <div className="flex flex-wrap gap-2 mb-3">
            {audience.primaryAge && (
              <span className="rounded-full bg-gradient-to-r from-[#006C35] to-[#00A352] px-3 py-1 text-xs font-medium text-white">
                Age: {audience.primaryAge}
              </span>
            )}
            {audience.interests?.map((interest, i) => (
              <span key={i} className="rounded-full bg-[#172E1F] px-2.5 py-1 text-xs text-[#D0EBDA]">
                {interest}
              </span>
            ))}
          </div>
          {audience.saudiSpecific && (
            <div className="rounded-lg bg-[#0B1A0F] border border-[#C9A84C]/20 p-3 mb-3">
              <p className="text-xs text-[#C9A84C] font-medium mb-1">🇸🇦 Saudi/Gulf Insight</p>
              <p className="text-xs text-[#D0EBDA]">{audience.saudiSpecific}</p>
            </div>
          )}
          {audience.bestPostingTimes && audience.bestPostingTimes.length > 0 && (
            <div className="grid gap-2 sm:grid-cols-2">
              {audience.bestPostingTimes.map((t, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg bg-[#0B1A0F] border border-[#172E1F] p-2.5">
                  <Clock className="h-3.5 w-3.5 text-[#00A352] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-[#D0EBDA]">{t.day} · {t.time}</p>
                    <p className="text-xs text-[#7B9E86]">{t.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content Mix */}
      {mix && mixTotal > 0 && (
        <div className="rounded-xl border border-[#172E1F] bg-[#020B05] p-4">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gradient-gold">
            <Megaphone className="h-4 w-4 text-[#C9A84C]" />
            Content Mix
          </h4>
          {/* Stacked bar */}
          <div className="h-4 rounded-full overflow-hidden flex mb-3">
            {Object.entries(mix).map(([key, val]) => (
              <motion.div
                key={key}
                initial={{ width: 0 }}
                animate={{ width: `${(val / mixTotal) * 100}%` }}
                transition={{ duration: 0.6 }}
                className="h-full first:rounded-l-full last:rounded-r-full"
                style={{ backgroundColor: mixColors[key] || "#7B9E86" }}
                title={`${key}: ${val}%`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {Object.entries(mix).map(([key, val]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: mixColors[key] || "#7B9E86" }} />
                <span className="text-xs text-[#D0EBDA] capitalize">{key}</span>
                <span className="text-xs font-medium text-[#C9A84C]">{val}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Platform Strategy */}
      {platform && (
        <div className="rounded-xl border border-[#172E1F] bg-[#020B05] p-4">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gradient-gold">
            <Target className="h-4 w-4 text-[#C9A84C]" />
            Platform Strategy
          </h4>
          <div className="flex flex-wrap gap-2 mb-2">
            {platform.primary && (
              <span className="rounded-full bg-gradient-to-r from-[#006C35] to-[#00A352] px-3 py-1.5 text-xs font-semibold text-white">
                ★ {platform.primary}
              </span>
            )}
            {platform.secondary && (
              <span className="rounded-full bg-[#172E1F] border border-[#006C35]/30 px-3 py-1.5 text-xs font-medium text-[#D0EBDA]">
                {platform.secondary}
              </span>
            )}
          </div>
          {platform.rationale && (
            <p className="text-xs text-[#7B9E86] italic">{platform.rationale}</p>
          )}
        </div>
      )}

      {/* Tone Guide */}
      {tone && (
        <div className="rounded-xl border border-[#172E1F] bg-[#020B05] p-4">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gradient-gold">
            <Megaphone className="h-4 w-4 text-[#C9A84C]" />
            Tone Guide
          </h4>
          <div className="flex flex-wrap gap-3 mb-3">
            <div className="flex-1 min-w-[140px]">
              <p className="text-xs font-medium text-[#00A352] mb-1.5">✓ Do use</p>
              <div className="flex flex-wrap gap-1">
                {tone.doUse?.map((t, i) => (
                  <span key={i} className="rounded-full bg-[#006C35]/20 border border-[#006C35]/40 px-2 py-0.5 text-xs text-[#00A352]">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex-1 min-w-[140px]">
              <p className="text-xs font-medium text-red-400 mb-1.5">✗ Avoid</p>
              <div className="flex flex-wrap gap-1">
                {tone.avoid?.map((t, i) => (
                  <span key={i} className="rounded-full bg-red-500/10 border border-red-500/30 px-2 py-0.5 text-xs text-red-400">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {tone.exampleCaption && (
            <div className="rounded-lg bg-[#0B1A0F] border-l-2 border-[#C9A84C] p-3">
              <p className="text-xs text-[#7B9E86] mb-1">Example caption</p>
              <p className="text-sm text-[#D0EBDA] italic">&ldquo;{tone.exampleCaption}&rdquo;</p>
            </div>
          )}
        </div>
      )}

      {/* Vision 2030 Alignment */}
      {vision && (
        <div className="rounded-xl border border-[#C9A84C]/30 bg-gradient-to-br from-[#020B05] to-[#0B1A0F] p-4">
          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#C9A84C]">
            🏛️ Vision 2030 Alignment
          </h4>
          <p className="text-sm text-[#D0EBDA]">{vision}</p>
        </div>
      )}
    </motion.div>
  );
}

export default function CompaniesPage() {
  const supabase = createBrowserClient();
  const { setSelectedCompany } = useAppStore();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [brandAnalysis, setBrandAnalysis] = useState<Record<string, unknown> | null>(null);
  const [outputLanguage, setOutputLanguage] = useState<"en" | "ar">("ar");

  const [form, setForm] = useState({
    name: "",
    name_ar: "",
    industry: "",
    website: "",
    description: "",
    logo_url: "",
    brand_colors: [] as string[],
    tone: "",
    target_audience: "",
    unique_value: "",
    competitors: "",
    platforms: [] as string[],
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  async function loadCompanies() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) {
      toast.error(error.message);
      setCompanies([]);
    } else {
      setCompanies((data as Company[]) ?? []);
    }
    setLoading(false);
  }

  function openAdd() {
    setEditingId(null);
    setForm({
      name: "",
      name_ar: "",
      industry: "",
      website: "",
      description: "",
      logo_url: "",
      brand_colors: [...FALLBACK_COLORS],
      tone: "",
      target_audience: "",
      unique_value: "",
      competitors: "",
      platforms: [],
    });
    setBrandAnalysis(null);
    setFormOpen(true);
  }

  function openEdit(c: Company) {
    setEditingId(c.id);
    setForm({
      name: c.name ?? "",
      name_ar: c.name_ar ?? "",
      industry: c.industry ?? "",
      website: c.website ?? "",
      description: c.description ?? "",
      logo_url: c.logo_url ?? "",
      brand_colors: c.brand_colors?.length ? c.brand_colors : [...FALLBACK_COLORS],
      tone: c.tone ?? "",
      target_audience: c.target_audience ?? "",
      unique_value: c.unique_value ?? "",
      competitors: c.competitors ?? "",
      platforms: c.platforms ?? [],
    });
    setBrandAnalysis(null);
    setFormOpen(true);
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Sign in to upload");
        return;
      }
      const path = `${user.id}/${Date.now()}-${file.name}`;
      toast.loading("Uploading logo...", { id: "logo-upload" });
      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(path, file, { upsert: true });
      if (uploadError) {
        console.error("Logo upload error:", uploadError);
        toast.error(`Upload failed: ${uploadError.message}`, { id: "logo-upload" });
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from("logos").getPublicUrl(path);
      setForm((f) => ({ ...f, logo_url: publicUrl }));
      toast.success("Logo uploaded!", { id: "logo-upload" });
      // Extract colors
      const fd = new FormData();
      fd.append("image", file);
      try {
        const res = await fetch("/api/extract-colors", { method: "POST", body: fd });
        const json = await res.json();
        if (json.success && json.colors?.length) {
          const hexes = json.colors.map((c: { hex: string }) => c.hex);
          setForm((f) => ({ ...f, brand_colors: hexes.slice(0, 5) }));
          toast.success("Brand colors extracted from logo");
        }
      } catch (err) {
        console.error("Color extraction error:", err);
        toast.error("Color extraction failed — using defaults");
      }
    } catch (err) {
      console.error("Logo upload unexpected error:", err);
      toast.error("Unexpected error during upload");
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPdf(true);
    toast.loading("Extracting text from PDF...", { id: "pdf-upload" });
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/extract-pdf", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "PDF extraction failed");
      if (json.text) {
        setForm((f) => ({ ...f, description: json.text }));
        toast.success("Company profile extracted!", { id: "pdf-upload" });
      }
    } catch (err) {
      console.error("PDF extraction error:", err);
      toast.error(err instanceof Error ? err.message : "PDF extraction failed", { id: "pdf-upload" });
    } finally {
      setUploadingPdf(false);
    }
  }

  function togglePlatform(p: string) {
    setForm((f) => ({
      ...f,
      platforms: f.platforms.includes(p)
        ? f.platforms.filter((x) => x !== p)
        : [...f.platforms, p],
    }));
  }

  async function saveCompany() {
    if (!form.name.trim()) {
      toast.error("Company name is required");
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setSaving(true);
    const payload = {
      user_id: user.id,
      name: form.name.trim(),
      name_ar: form.name_ar.trim() || null,
      industry: form.industry || null,
      website: form.website.trim() || null,
      description: form.description.trim() || null,
      logo_url: form.logo_url || null,
      brand_colors: form.brand_colors.length ? form.brand_colors : FALLBACK_COLORS,
      tone: form.tone || null,
      target_audience: form.target_audience.trim() || null,
      unique_value: form.unique_value.trim() || null,
      competitors: form.competitors.trim() || null,
      platforms: form.platforms,
    };
    if (editingId) {
      const { error } = await supabase
        .from("companies")
        .update(payload)
        .eq("id", editingId)
        .eq("user_id", user.id);
      if (error) toast.error(error.message);
      else {
        toast.success("Company saved");
        setFormOpen(false);
        loadCompanies();
      }
    } else {
      const { error } = await supabase.from("companies").insert(payload);
      if (error) toast.error(error.message);
      else {
        toast.success("Company saved");
        setFormOpen(false);
        loadCompanies();
      }
    }
    setSaving(false);
  }

  async function runAnalyze() {
    if (!form.name.trim()) {
      toast.error("Save company first or enter a name");
      return;
    }
    setAnalyzing(true);
    setBrandAnalysis(null);
    try {
      const res = await fetch("/api/analyze-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: {
            name: form.name,
            name_ar: form.name_ar,
            industry: form.industry,
            description: form.description,
            website: form.website,
            target_audience: form.target_audience,
            tone: form.tone,
            platforms: form.platforms,
            competitors: form.competitors,
            unique_value: form.unique_value,
          },
          outputLanguage,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Analysis failed");
      setBrandAnalysis(json.analysis);
      toast.success("Brand DNA ready");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Analysis failed");
    }
    setAnalyzing(false);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 animate-shimmer rounded bg-[#0B1A0F]" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 animate-shimmer rounded-2xl bg-[#0B1A0F] border border-[#172E1F]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-['Cairo'] text-3xl font-bold text-[#D0EBDA] md:text-4xl">{"\u0634\u0631\u0643\u0627\u062a\u0643"}</h1>
          <p className="mt-1 text-base text-[#7B9E86]">Your Companies</p>
        </div>
        <Button
          onClick={openAdd}
          className="h-12 px-6 text-[15px] font-semibold rounded-xl bg-gradient-to-r from-[#C9A84C] to-[#E8D5A0] text-[#020B05] hover:shadow-[0_0_20px_rgba(201,168,76,0.3)] transition-shadow"
        >
          <Plus className="mr-2 h-5 w-5" />
          Add Company
        </Button>
      </div>

      {companies.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-[#172E1F] bg-[#0B1A0F] py-16"
        >
          <Building2 className="h-16 w-16 text-[#7B9E86]" />
          <p className="mt-4 text-[#D0EBDA]">No companies yet</p>
          <p className="text-sm text-[#7B9E86]">Add your first company to get started</p>
          <Button onClick={openAdd} className="mt-6 bg-[#006C35] hover:bg-[#00A352]">
            Add Company
          </Button>
        </motion.div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((c, i) => (
            <GlowCard
              key={c.id}
              glowColor={i % 2 === 0 ? "green" : "gold"}
            >
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-bold text-[#020B05] transition-shadow hover:shadow-[0_0_15px_rgba(0,108,53,0.3)]"
                      style={{
                        backgroundColor: c.brand_colors?.[0] ?? "#006C35",
                      }}
                    >
                      {c.logo_url ? (
                        <img src={c.logo_url} alt="" className="h-full w-full rounded-full object-cover" />
                      ) : (
                        c.name?.charAt(0) ?? "?"
                      )}
                    </div>
                    {/* Blur glow behind logo */}
                    <div
                      className="absolute inset-0 -z-10 rounded-full blur-md opacity-40"
                      style={{ backgroundColor: c.brand_colors?.[0] ?? "#006C35" }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[16px] font-semibold text-[#D0EBDA]">{c.name}</p>
                    {c.name_ar && <p className="text-sm text-[#7B9E86] mt-0.5">{c.name_ar}</p>}
                    {c.industry && (
                      <span className="mt-1.5 inline-block rounded-full bg-[#172E1F] px-2.5 py-1 text-xs text-[#7B9E86]">
                        {c.industry}
                      </span>
                    )}
                  </div>
                </div>
                {/* Color swatches with spring animation */}
                {c.brand_colors?.length ? (
                  <div className="mt-3 flex gap-1.5">
                    {c.brand_colors.slice(0, 5).map((hex, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.3, y: -2 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        className="h-5 w-5 rounded-full border border-[#172E1F] cursor-pointer"
                        style={{ backgroundColor: hex }}
                        title={hex}
                      />
                    ))}
                  </div>
                ) : null}
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    className="h-10 px-4 text-sm font-medium border-[#172E1F] text-[#D0EBDA] hover:bg-[#172E1F] rounded-xl"
                    onClick={() => openEdit(c)}
                  >
                    <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button
                    className="h-10 px-4 text-sm font-medium bg-[#006C35] hover:bg-[#00A352] rounded-xl"
                    onClick={() => setSelectedCompany(c)}
                  >
                    <Check className="mr-1.5 h-3.5 w-3.5" /> Select
                  </Button>
                </div>
              </motion.div>
            </GlowCard>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto glass-strong border-[#172E1F] text-[#D0EBDA] sm:max-w-3xl scrollbar-nawaa">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Company" : "Add Company"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <section>
              <h3 className="mb-3 text-sm font-semibold text-gradient-gold">Basic Info</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Name (English) *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="border-[#172E1F] bg-[#020B05] text-[#D0EBDA]"
                    placeholder="Company name"
                  />
                </div>
                <div>
                  <Label>Name (Arabic)</Label>
                  <Input
                    value={form.name_ar}
                    onChange={(e) => setForm((f) => ({ ...f, name_ar: e.target.value }))}
                    className="border-[#172E1F] bg-[#020B05] text-[#D0EBDA]"
                    placeholder={"\u0627\u0633\u0645 \u0627\u0644\u0634\u0631\u0643\u0629"}
                  />
                </div>
                <div>
                  <Label>Industry</Label>
                  <Select
                    value={form.industry}
                    onValueChange={(v) => setForm((f) => ({ ...f, industry: v }))}
                  >
                    <SelectTrigger className="border-[#172E1F] bg-[#020B05]">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((ind) => (
                        <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Website</Label>
                  <Input
                    value={form.website}
                    onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                    className="border-[#172E1F] bg-[#020B05] text-[#D0EBDA]"
                    placeholder="https://"
                  />
                </div>
              </div>
              <div className="mt-3">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="border-[#172E1F] bg-[#020B05] text-[#D0EBDA]"
                  rows={5}
                />
                <div className="mt-2 flex items-center gap-3">
                  <label className={cn("cursor-pointer flex items-center gap-1.5", uploadingPdf && "pointer-events-none opacity-50")}>
                    <input type="file" accept="application/pdf" className="hidden" onChange={handlePdfUpload} />
                    {uploadingPdf ? (
                      <Loader2 className="h-4 w-4 text-[#C9A84C] animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4 text-[#7B9E86]" />
                    )}
                    <span className="text-sm text-[#00A352] hover:underline">
                      {uploadingPdf ? "Extracting..." : "Or upload company profile (PDF)"}
                    </span>
                  </label>
                </div>
              </div>
            </section>

            <section>
              <h3 className="mb-3 text-sm font-semibold text-gradient-gold">Brand Identity</h3>
              <div className="mb-3">
                <Label>Logo</Label>
                <div className="mt-1 flex items-center gap-3">
                  {uploadingLogo ? (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-[#C9A84C] bg-[#020B05]">
                      <Loader2 className="h-6 w-6 text-[#C9A84C] animate-spin" />
                    </div>
                  ) : form.logo_url ? (
                    <img src={form.logo_url} alt="" className="h-16 w-16 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-[#172E1F] bg-[#020B05]">
                      <Upload className="h-6 w-6 text-[#7B9E86]" />
                    </div>
                  )}
                  <label className={cn("cursor-pointer", uploadingLogo && "pointer-events-none opacity-50")}>
                    <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleLogoUpload} />
                    <span className="text-sm text-[#00A352] hover:underline">
                      {uploadingLogo ? "Uploading..." : "Upload PNG/JPG"}
                    </span>
                  </label>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.brand_colors.map((hex, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.3, y: -2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className="h-8 w-8 rounded-full border border-[#172E1F] cursor-pointer"
                    style={{ backgroundColor: hex }}
                    title={hex}
                  />
                ))}
              </div>
              <div className="mt-3">
                <Label>Tone</Label>
                <Select value={form.tone} onValueChange={(v) => setForm((f) => ({ ...f, tone: v }))}>
                  <SelectTrigger className="border-[#172E1F] bg-[#020B05]">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TONES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </section>

            <section>
              <h3 className="mb-3 text-sm font-semibold text-gradient-gold">Marketing</h3>
              <div className="space-y-3">
                <div>
                  <Label>Target audience</Label>
                  <Textarea
                    value={form.target_audience}
                    onChange={(e) => setForm((f) => ({ ...f, target_audience: e.target.value }))}
                    className="border-[#172E1F] bg-[#020B05] text-[#D0EBDA]"
                    rows={2}
                    placeholder="Who is your ideal customer?"
                  />
                </div>
                <div>
                  <Label>Unique value</Label>
                  <Textarea
                    value={form.unique_value}
                    onChange={(e) => setForm((f) => ({ ...f, unique_value: e.target.value }))}
                    className="border-[#172E1F] bg-[#020B05] text-[#D0EBDA]"
                    rows={2}
                    placeholder="What makes you different?"
                  />
                </div>
                <div>
                  <Label>Competitors (optional)</Label>
                  <Input
                    value={form.competitors}
                    onChange={(e) => setForm((f) => ({ ...f, competitors: e.target.value }))}
                    className="border-[#172E1F] bg-[#020B05] text-[#D0EBDA]"
                  />
                </div>
                <div>
                  <Label>Platforms</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {PLATFORMS.map((p) => (
                      <motion.button
                        key={p}
                        type="button"
                        onClick={() => togglePlatform(p)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                          "rounded-full px-3 py-1 text-sm transition",
                          form.platforms.includes(p)
                            ? "bg-gradient-to-r from-[#006C35] to-[#00A352] text-white"
                            : "bg-[#172E1F] text-[#7B9E86] hover:bg-[#1E4030]"
                        )}
                      >
                        {p}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="border-t border-[#172E1F] pt-4">
              <div className="mb-2 flex items-center gap-2">
                <Label>Generate analysis in:</Label>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant={outputLanguage === "en" ? "default" : "outline"}
                    className={outputLanguage === "en" ? "bg-gradient-to-r from-[#006C35] to-[#00A352]" : "border-[#172E1F]"}
                    onClick={() => setOutputLanguage("en")}
                  >
                    English
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={outputLanguage === "ar" ? "default" : "outline"}
                    className={outputLanguage === "ar" ? "bg-gradient-to-r from-[#006C35] to-[#00A352]" : "border-[#172E1F]"}
                    onClick={() => setOutputLanguage("ar")}
                  >
                    {"\u0627\u0644\u0639\u0631\u0628\u064a\u0629"}
                  </Button>
                </div>
              </div>
              <Button
                type="button"
                onClick={runAnalyze}
                disabled={analyzing}
                className="bg-gradient-to-r from-[#C9A84C] to-[#E8D5A0] text-[#020B05] hover:shadow-[0_0_20px_rgba(201,168,76,0.3)] transition-shadow"
              >
                {analyzing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Analyze with AI
              </Button>
              {brandAnalysis && <BrandAnalysisDisplay data={brandAnalysis} />}
            </section>

            <div className="flex justify-end gap-2">
              <Button variant="outline" className="border-[#172E1F]" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveCompany} disabled={saving} className="bg-[#006C35] hover:bg-[#00A352]">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
