"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Building2, Plus, Pencil, Check, Upload, Loader2, Sparkles } from "lucide-react";
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

export default function CompaniesPage() {
  const supabase = createClient();
  const { setSelectedCompany } = useAppStore();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Sign in to upload");
      return;
    }
    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("logos")
      .upload(path, file, { upsert: true });
    if (uploadError) {
      toast.error(uploadError.message);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("logos").getPublicUrl(path);
    setForm((f) => ({ ...f, logo_url: publicUrl }));
    // Extract colors
    const fd = new FormData();
    fd.append("image", file);
    try {
      const res = await fetch("/api/extract-colors", { method: "POST", body: fd });
      const json = await res.json();
      if (json.success && json.colors?.length) {
        const hexes = json.colors.map((c: { hex: string }) => c.hex);
        setForm((f) => ({ ...f, brand_colors: hexes.slice(0, 5) }));
        toast.success("Colors extracted");
      }
    } catch {
      toast.error("Color extraction failed");
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
      setBrandAnalysis(json);
      toast.success("Brand DNA ready");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Analysis failed");
    }
    setAnalyzing(false);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 animate-pulse rounded bg-[#0B1A0F]" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-[#0B1A0F]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-['Cairo'] text-2xl font-bold text-[#D0EBDA]">شركاتك</h1>
          <p className="text-sm text-[#7B9E86]">Your Companies</p>
        </div>
        <Button
          onClick={openAdd}
          className="bg-[#C9A84C] text-[#020B05] hover:bg-[#E8D5A0]"
        >
          <Plus className="mr-2 h-4 w-4" />
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group rounded-2xl border border-[#172E1F] bg-[#0B1A0F] p-4 transition hover:border-[#1E4030] hover:-translate-y-0.5"
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-[#020B05]"
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
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-[#D0EBDA]">{c.name}</p>
                  {c.name_ar && <p className="text-sm text-[#7B9E86]">{c.name_ar}</p>}
                  {c.industry && (
                    <span className="mt-1 inline-block rounded-full bg-[#172E1F] px-2 py-0.5 text-xs text-[#7B9E86]">
                      {c.industry}
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#172E1F] text-[#D0EBDA] hover:bg-[#172E1F]"
                  onClick={() => openEdit(c)}
                >
                  <Pencil className="mr-1 h-3 w-3" /> Edit
                </Button>
                <Button
                  size="sm"
                  className="bg-[#006C35] hover:bg-[#00A352]"
                  onClick={() => setSelectedCompany(c)}
                >
                  <Check className="mr-1 h-3 w-3" /> Select
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-[#172E1F] bg-[#0B1A0F] text-[#D0EBDA] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Company" : "Add Company"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <section>
              <h3 className="mb-3 text-sm font-semibold text-[#C9A84C]">Basic Info</h3>
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
                    placeholder="اسم الشركة"
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
                <Label>Description (max 300)</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value.slice(0, 300) }))}
                  className="border-[#172E1F] bg-[#020B05] text-[#D0EBDA]"
                  rows={3}
                  maxLength={300}
                />
                <span className="text-xs text-[#7B9E86]">{form.description.length}/300</span>
              </div>
            </section>

            <section>
              <h3 className="mb-3 text-sm font-semibold text-[#C9A84C]">Brand Identity</h3>
              <div className="mb-3">
                <Label>Logo</Label>
                <div className="mt-1 flex items-center gap-3">
                  {form.logo_url ? (
                    <img src={form.logo_url} alt="" className="h-16 w-16 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-[#172E1F] bg-[#020B05]">
                      <Upload className="h-6 w-6 text-[#7B9E86]" />
                    </div>
                  )}
                  <label className="cursor-pointer">
                    <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleLogoUpload} />
                    <span className="text-sm text-[#00A352] hover:underline">Upload PNG/JPG</span>
                  </label>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.brand_colors.map((hex, idx) => (
                  <div
                    key={idx}
                    className="h-8 w-8 rounded-full border border-[#172E1F]"
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
              <h3 className="mb-3 text-sm font-semibold text-[#C9A84C]">Marketing</h3>
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
                      <button
                        key={p}
                        type="button"
                        onClick={() => togglePlatform(p)}
                        className={cn(
                          "rounded-full px-3 py-1 text-sm transition",
                          form.platforms.includes(p)
                            ? "bg-[#006C35] text-white"
                            : "bg-[#172E1F] text-[#7B9E86] hover:bg-[#1E4030]"
                        )}
                      >
                        {p}
                      </button>
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
              <Button
                type="button"
                onClick={runAnalyze}
                disabled={analyzing}
                className="bg-[#C9A84C] text-[#020B05] hover:bg-[#E8D5A0]"
              >
                {analyzing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Analyze with AI
              </Button>
              {brandAnalysis && (
                <pre className="mt-3 max-h-48 overflow-auto rounded-lg bg-[#020B05] p-3 text-xs text-[#7B9E86]">
                  {JSON.stringify(brandAnalysis, null, 2)}
                </pre>
              )}
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
