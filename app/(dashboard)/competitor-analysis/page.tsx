"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Swords, Plus, Trash2, Download, Save, Loader2,
  ChevronDown, AlertTriangle, Target, TrendingUp,
  Shield, Zap, Clock, Calendar, Rocket, Lightbulb, BarChart3,
  Building2, Eye, Star, Crosshair, Globe, Sparkles, ArrowRight,
} from "lucide-react";
import { useAppStore, type Company } from "@/lib/store";
import { createClient } from "@/lib/supabase";
import { messages } from "@/lib/i18n";
import { exportCompetitorPdf } from "@/lib/export-competitor-pdf";

interface Competitor { name: string; handle: string; platform: string; websiteUrl: string; }
interface StrategyAction { action: string; priority: string; impact: string; kpi?: string; }
interface ContentSeries { name: string; description: string; platform: string; }
interface CompetitorResult {
  name: string; handle: string; platform: string; postingFrequency: string;
  contentTypes: string[]; contentThemes?: string[]; captionStyle: string; hashtagStrategy: string;
  engagementLevel: string; visualStyle: string; audienceProfile?: string; contentCalendar?: string;
  paidStrategy?: string; strengths: string[]; weakPoints: string[]; threatLevel: number;
  overallScore: number; keyInsight: string; stealThisMove?: string;
}
interface AnalysisData {
  executiveSummary: string;
  brandAssessment: {
    strengths: string[]; weaknesses: string[]; opportunities?: string[]; threats?: string[];
    overallScore: number; marketPosition?: string;
  };
  competitors: CompetitorResult[];
  comparisonMatrix: { categories: string[]; yourBrand: number[]; competitors: Record<string, number[]>; };
  winningStrategy: {
    immediate: StrategyAction[]; shortTerm: StrategyAction[]; longTerm: StrategyAction[];
    contentGaps: string[]; differentiators: string[]; quickWins?: string[];
    contentSeries?: ContentSeries[];
  };
  saudiMarketInsights: {
    trendAlignment: string; vision2030Relevance: string; culturalFit: string;
    localOpportunities?: string; ramadanStrategy?: string;
  };
}
interface SavedAnalysis { id: string; company_id: string; competitors: Competitor[]; analysis_data: AnalysisData; output_language: string; created_at: string; }

const PLATFORMS = [
  { value: "instagram", label: "Instagram" }, { value: "twitter", label: "X (Twitter)" },
  { value: "tiktok", label: "TikTok" }, { value: "snapchat", label: "Snapchat" },
  { value: "linkedin", label: "LinkedIn" },
];
const emptyCompetitor: Competitor = { name: "", handle: "", platform: "instagram", websiteUrl: "" };

function ScoreBar({ score, color, height = "h-3" }: { score: number; color?: string; height?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`flex-1 ${height} bg-[#E8F0EA] rounded-full overflow-hidden`}>
        <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${score}%`, backgroundColor: color || (score >= 70 ? "#006C35" : score >= 40 ? "#C9A84C" : "#ef4444") }} />
      </div>
      <span className="text-base font-bold font-mono w-10 text-right text-[#0A1F0F]">{score}</span>
    </div>
  );
}

function ScoreCircle({ score, size = 80, label }: { score: number; size?: number; label?: string }) {
  const circumference = 2 * Math.PI * 34;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? "#006C35" : score >= 40 ? "#C9A84C" : "#ef4444";
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="34" fill="none" stroke="#E8F0EA" strokeWidth="6" />
        <circle cx="40" cy="40" r="34" fill="none" stroke={color} strokeWidth="6" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 40 40)" className="transition-all duration-1000 ease-out" />
        <text x="40" y="44" textAnchor="middle" className="fill-[#0A1F0F] text-xl font-bold" style={{ fontSize: "20px", fontWeight: 800 }}>{score}</text>
      </svg>
      {label && <span className="text-sm font-bold text-[#5A8A6A] text-center">{label}</span>}
    </div>
  );
}

function ThreatBadge({ level }: { level: number }) {
  const cfg = level >= 7 ? { bg: "bg-red-100 text-red-700 border-red-200", label: "HIGH THREAT" } : level >= 4 ? { bg: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "MEDIUM" } : { bg: "bg-green-100 text-[#006C35] border-[#D4EBD9]", label: "LOW" };
  return <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-black border-2 ${cfg.bg}`}><AlertTriangle className="h-4 w-4" />{cfg.label} ({level}/10)</span>;
}

function PriorityBadge({ priority }: { priority: string }) {
  const c: Record<string, string> = { high: "bg-red-100 text-red-700 border-red-200", medium: "bg-yellow-100 text-yellow-800 border-yellow-200", low: "bg-green-100 text-[#006C35] border-[#D4EBD9]" };
  return <span className={`inline-flex items-center px-3 py-1 rounded-xl text-sm font-black border-2 uppercase tracking-wide ${c[priority.toLowerCase()] || c.medium}`}>{priority}</span>;
}

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border-2 border-[#D4EBD9] bg-white p-8 ${className}`}>{children}</div>;
}

function SectionTitle({ icon: Icon, children, color = "text-[#006C35]" }: { icon: React.ElementType; children: React.ReactNode; color?: string }) {
  return <h3 className={`flex items-center gap-3 text-2xl font-black text-[#0A1F0F] mb-5`}><Icon className={`h-7 w-7 ${color}`} />{children}</h3>;
}

export default function CompetitorAnalysisPage() {
  const { user, selectedCompany, setSelectedCompany, locale } = useAppStore();
  const t = messages[locale].competitorAnalysis;
  const isRtl = locale === "ar";

  const [companies, setCompanies] = useState<Company[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([{ ...emptyCompetitor }]);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [showPrevious, setShowPrevious] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "compare" | "strategy">("overview");
  const [outputLanguage, setOutputLanguage] = useState<"en" | "ar">(locale as "en" | "ar");

  useEffect(() => {
    if (!user?.id) return;
    const supabase = createClient();
    supabase.from("companies").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setCompanies(data); });
  }, [user?.id]);

  const loadSavedAnalyses = useCallback(async () => {
    if (!user?.id) return;
    try {
      const supabase = createClient();
      const { data } = await supabase.from("competitor_analyses").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10);
      if (data) setSavedAnalyses(data);
    } catch { /* table may not exist */ }
  }, [user?.id]);

  useEffect(() => { loadSavedAnalyses(); }, [loadSavedAnalyses]);

  const addCompetitor = () => { if (competitors.length < 5) setCompetitors([...competitors, { ...emptyCompetitor }]); };
  const removeCompetitor = (i: number) => setCompetitors(competitors.filter((_, j) => j !== i));
  const updateCompetitor = (i: number, f: keyof Competitor, v: string) => { const u = [...competitors]; u[i] = { ...u[i], [f]: v }; setCompetitors(u); };

  const runAnalysis = async () => {
    if (!selectedCompany) { setError(t.selectCompany); return; }
    const valid = competitors.filter((c) => c.name.trim());
    if (!valid.length) { setError(locale === "ar" ? "أضف منافساً واحداً على الأقل" : "Add at least one competitor with a name"); return; }
    setLoading(true); setError(""); setAnalysisData(null);
    try {
      const res = await fetch("/api/competitor-analysis", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName: selectedCompany.name, companyDescription: selectedCompany.description || "", competitors: valid, outputLanguage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setAnalysisData(data.analysis);
      setActiveTab("overview");
    } catch (err) { setError(err instanceof Error ? err.message : t.errorAnalyzing); } finally { setLoading(false); }
  };

  const saveAnalysis = async () => {
    if (!user?.id || !analysisData || !selectedCompany) return;
    setSaving(true); setSaveStatus("");
    try {
      const supabase = createClient();
      const { error: e } = await supabase.from("competitor_analyses").insert({ user_id: user.id, company_id: selectedCompany.id, competitors, analysis_data: analysisData, output_language: outputLanguage });
      if (e) throw e;
      setSaveStatus(t.saved); loadSavedAnalyses(); setTimeout(() => setSaveStatus(""), 2000);
    } catch { setSaveStatus("Error"); } finally { setSaving(false); }
  };

  const loadAnalysis = (s: SavedAnalysis) => { setCompetitors(s.competitors); setAnalysisData(s.analysis_data); setShowPrevious(false); setActiveTab("overview"); };
  const deleteAnalysis = async (id: string) => { const supabase = createClient(); await supabase.from("competitor_analyses").delete().eq("id", id); loadSavedAnalyses(); };
  const handleExportPdf = async () => { if (analysisData && selectedCompany) await exportCompetitorPdf(analysisData, selectedCompany.name, competitors, outputLanguage); };

  return (
    <div className="space-y-8 w-full" dir={isRtl ? "rtl" : "ltr"}>
      {/* ═══ HEADER ═══ */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#006C35] to-[#00A352] flex items-center justify-center shadow-[0_6px_20px_rgba(0,108,53,0.3)]">
            <Swords className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#0A1F0F]">{t.pageTitle}</h1>
            <p className="text-lg text-[#5A8A6A] font-medium">{t.pageSub}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {analysisData && (
            <>
              <button onClick={handleExportPdf} className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-[#D4EBD9] text-base font-bold text-[#2D5A3D] hover:bg-[#F0F7F2] transition-colors">
                <Download className="h-5 w-5" /> {t.exportPdf}
              </button>
              <button onClick={saveAnalysis} disabled={saving} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#006C35] to-[#00A352] text-base font-bold text-white shadow-md hover:shadow-lg transition-all">
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                {saveStatus || t.save}
              </button>
            </>
          )}
          <button onClick={() => setShowPrevious(!showPrevious)} className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-[#D4EBD9] text-base font-bold text-[#2D5A3D] hover:bg-[#F0F7F2] transition-colors">
            <Clock className="h-5 w-5" /> {t.loadPrevious}
            <ChevronDown className={`h-4 w-4 transition-transform ${showPrevious ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* Previous Analyses */}
      {showPrevious && (
        <SectionCard>
          <h3 className="font-black text-xl text-[#0A1F0F] mb-4">{t.loadPrevious}</h3>
          {savedAnalyses.length === 0 ? <p className="text-base text-[#5A8A6A]">{t.noPreviousAnalyses}</p> : (
            <div className="space-y-3">{savedAnalyses.map((sa) => (
              <div key={sa.id} className="flex items-center justify-between p-4 rounded-xl border-2 border-[#D4EBD9] hover:bg-[#F0F7F2] transition-colors">
                <div><p className="text-base font-bold text-[#0A1F0F]">{sa.competitors?.map((c) => c.name).join(", ")}</p><p className="text-sm text-[#5A8A6A]">{new Date(sa.created_at).toLocaleDateString()}</p></div>
                <div className="flex gap-2">
                  <button onClick={() => loadAnalysis(sa)} className="px-4 py-2 rounded-xl border-2 border-[#006C35] text-sm font-bold text-[#006C35] hover:bg-[#F0F7F2]">{t.load}</button>
                  <button onClick={() => deleteAnalysis(sa.id)} className="p-2 rounded-xl text-[#5A8A6A] hover:text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}</div>
          )}
        </SectionCard>
      )}

      {/* ═══ COMPANY SELECTOR ═══ */}
      <SectionCard>
        <div className="flex items-center gap-3 mb-4">
          <Building2 className="h-6 w-6 text-[#006C35]" />
          <h3 className="font-black text-xl text-[#0A1F0F]">{locale === "ar" ? "اختر الشركة" : "Select Company"}</h3>
        </div>
        {companies.length === 0 ? (
          <p className="text-base text-[#5A8A6A]">{locale === "ar" ? "لا توجد شركات. أضف شركة أولاً." : "No companies found. Add one from Companies page."}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {companies.map((c) => (
              <button key={c.id} onClick={() => setSelectedCompany(c)} className={`p-5 rounded-2xl border-2 text-start transition-all ${selectedCompany?.id === c.id ? "border-[#006C35] bg-[#F0F7F2] shadow-[0_0_0_4px_rgba(0,108,53,0.1)]" : "border-[#D4EBD9] hover:border-[#00A352] hover:bg-[#F8FBF8]"}`}>
                <p className="font-bold text-lg text-[#0A1F0F] truncate">{c.name}</p>
                {c.industry && <p className="text-sm text-[#5A8A6A] mt-1">{c.industry}</p>}
              </button>
            ))}
          </div>
        )}
      </SectionCard>

      {/* ═══ COMPETITOR INPUT ═══ */}
      <SectionCard className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-xl text-[#0A1F0F]">{t.addCompetitor}</h3>
            <p className="text-base text-[#5A8A6A]">{t.maxCompetitors} · {competitors.length}/5</p>
          </div>
          <button onClick={addCompetitor} disabled={competitors.length >= 5} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-[#D4EBD9] text-base font-bold text-[#006C35] hover:bg-[#F0F7F2] disabled:opacity-40 transition-colors">
            <Plus className="h-5 w-5" /> {t.addCompetitor}
          </button>
        </div>

        {competitors.map((comp, idx) => (
          <div key={idx} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_160px_1fr_auto] gap-4 items-end p-5 rounded-2xl border-2 border-[#D4EBD9] bg-[#F8FBF8]">
            <div>
              <label className="text-sm font-bold text-[#5A8A6A] mb-1.5 block">{t.competitorName}</label>
              <input value={comp.name} onChange={(e) => updateCompetitor(idx, "name", e.target.value)} placeholder={locale === "ar" ? "اسم المنافس" : "Competitor name"} className="w-full h-12 rounded-xl border-2 border-[#D4EBD9] bg-white px-4 text-base text-[#0A1F0F] focus:border-[#006C35] focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="text-sm font-bold text-[#5A8A6A] mb-1.5 block">{t.socialHandle}</label>
              <input value={comp.handle} onChange={(e) => updateCompetitor(idx, "handle", e.target.value)} placeholder="@handle" className="w-full h-12 rounded-xl border-2 border-[#D4EBD9] bg-white px-4 text-base text-[#0A1F0F] focus:border-[#006C35] focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="text-sm font-bold text-[#5A8A6A] mb-1.5 block">{t.platform}</label>
              <select value={comp.platform} onChange={(e) => updateCompetitor(idx, "platform", e.target.value)} className="w-full h-12 rounded-xl border-2 border-[#D4EBD9] bg-white px-4 text-base text-[#0A1F0F] focus:border-[#006C35] focus:outline-none transition-colors">
                {PLATFORMS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-bold text-[#5A8A6A] mb-1.5 block">{t.websiteUrl}</label>
              <input value={comp.websiteUrl} onChange={(e) => updateCompetitor(idx, "websiteUrl", e.target.value)} placeholder="https://..." className="w-full h-12 rounded-xl border-2 border-[#D4EBD9] bg-white px-4 text-base text-[#0A1F0F] focus:border-[#006C35] focus:outline-none transition-colors" />
            </div>
            {competitors.length > 1 && (
              <button onClick={() => removeCompetitor(idx)} className="h-12 w-12 flex items-center justify-center rounded-xl text-[#5A8A6A] hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="h-5 w-5" /></button>
            )}
          </div>
        ))}

        {error && <p className="text-base text-red-600 flex items-center gap-2 font-bold"><AlertTriangle className="h-5 w-5" /> {error}</p>}

        {/* Language Toggle */}
        <div className="flex items-center justify-between p-5 rounded-2xl border-2 border-[#D4EBD9] bg-[#F8FBF8]">
          <div>
            <h4 className="font-black text-base text-[#0A1F0F]">{locale === "ar" ? "لغة التحليل" : "Analysis Language"}</h4>
            <p className="text-sm text-[#5A8A6A]">{locale === "ar" ? "اختر لغة نتائج التحليل والتقرير" : "Choose the language for the analysis output & PDF report"}</p>
          </div>
          <div className="flex rounded-xl border-2 border-[#D4EBD9] overflow-hidden">
            <button
              onClick={() => setOutputLanguage("en")}
              className={`px-6 py-3 text-base font-bold transition-all ${outputLanguage === "en" ? "bg-gradient-to-r from-[#006C35] to-[#00A352] text-white" : "bg-white text-[#5A8A6A] hover:bg-[#F0F7F2]"}`}
            >
              English
            </button>
            <button
              onClick={() => setOutputLanguage("ar")}
              className={`px-6 py-3 text-base font-bold transition-all ${outputLanguage === "ar" ? "bg-gradient-to-r from-[#006C35] to-[#00A352] text-white" : "bg-white text-[#5A8A6A] hover:bg-[#F0F7F2]"}`}
            >
              العربية
            </button>
          </div>
        </div>

        <button onClick={runAnalysis} disabled={loading} className="w-full h-16 rounded-2xl bg-gradient-to-r from-[#006C35] to-[#00A352] text-white text-xl font-black shadow-[0_6px_24px_rgba(0,108,53,0.3)] hover:shadow-[0_8px_32px_rgba(0,108,53,0.4)] disabled:opacity-60 transition-all flex items-center justify-center gap-3">
          {loading ? <><Loader2 className="h-6 w-6 animate-spin" /> {t.analyzing}</> : <><Swords className="h-6 w-6" /> {t.analyze}</>}
        </button>
      </SectionCard>

      {/* ═══ RESULTS ═══ */}
      {analysisData && (
        <div className="space-y-6">
          {/* Tab bar */}
          <div className="flex rounded-2xl border-2 border-[#D4EBD9] bg-white p-1.5 gap-1.5">
            {([
              { key: "overview" as const, label: t.overview, icon: Target },
              { key: "compare" as const, label: t.compare, icon: BarChart3 },
              { key: "strategy" as const, label: t.winningStrategy, icon: Rocket },
            ]).map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex-1 flex items-center justify-center gap-2.5 py-4 rounded-xl text-lg font-black transition-all ${activeTab === tab.key ? "bg-gradient-to-r from-[#006C35] to-[#00A352] text-white shadow-lg" : "text-[#5A8A6A] hover:bg-[#F0F7F2]"}`}>
                <tab.icon className="h-5 w-5" /> {tab.label}
              </button>
            ))}
          </div>

          {/* ═══ OVERVIEW TAB ═══ */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Executive Summary */}
              <SectionCard>
                <SectionTitle icon={Target}>{t.executiveSummary}</SectionTitle>
                <p className="text-base leading-8 text-[#2D5A3D] whitespace-pre-line">{analysisData.executiveSummary}</p>
              </SectionCard>

              {/* Brand Assessment — SWOT style */}
              <SectionCard>
                <div className="flex items-center justify-between mb-6">
                  <SectionTitle icon={Shield}>{t.brandAssessment}</SectionTitle>
                  <ScoreCircle score={analysisData.brandAssessment.overallScore} size={100} />
                </div>
                {analysisData.brandAssessment.marketPosition && (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-[#006C35]/5 to-[#00A352]/5 border border-[#D4EBD9] mb-6">
                    <p className="text-base text-[#2D5A3D] leading-7 font-medium">{analysisData.brandAssessment.marketPosition}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 rounded-2xl bg-green-50/50 border border-green-200">
                    <h4 className="font-black text-lg text-[#006C35] mb-3 flex items-center gap-2"><TrendingUp className="h-5 w-5" /> {t.strengths}</h4>
                    <ul className="space-y-2.5">{analysisData.brandAssessment.strengths.map((s, i) => <li key={i} className="text-base text-[#2D5A3D] leading-7 flex items-start gap-2"><span className="text-[#006C35] font-black text-lg mt-0.5">+</span><span>{s}</span></li>)}</ul>
                  </div>
                  <div className="p-5 rounded-2xl bg-red-50/50 border border-red-200">
                    <h4 className="font-black text-lg text-red-600 mb-3 flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> {t.weaknesses}</h4>
                    <ul className="space-y-2.5">{analysisData.brandAssessment.weaknesses.map((w, i) => <li key={i} className="text-base text-[#2D5A3D] leading-7 flex items-start gap-2"><span className="text-red-500 font-black text-lg mt-0.5">-</span><span>{w}</span></li>)}</ul>
                  </div>
                  {analysisData.brandAssessment.opportunities && (
                    <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-200">
                      <h4 className="font-black text-lg text-blue-600 mb-3 flex items-center gap-2"><Sparkles className="h-5 w-5" /> {locale === "ar" ? "الفرص" : "Opportunities"}</h4>
                      <ul className="space-y-2.5">{analysisData.brandAssessment.opportunities.map((o, i) => <li key={i} className="text-base text-[#2D5A3D] leading-7 flex items-start gap-2"><span className="text-blue-500 font-black text-lg mt-0.5">★</span><span>{o}</span></li>)}</ul>
                    </div>
                  )}
                  {analysisData.brandAssessment.threats && (
                    <div className="p-5 rounded-2xl bg-orange-50/50 border border-orange-200">
                      <h4 className="font-black text-lg text-orange-600 mb-3 flex items-center gap-2"><Crosshair className="h-5 w-5" /> {locale === "ar" ? "التهديدات" : "Threats"}</h4>
                      <ul className="space-y-2.5">{analysisData.brandAssessment.threats.map((t2, i) => <li key={i} className="text-base text-[#2D5A3D] leading-7 flex items-start gap-2"><span className="text-orange-500 font-black text-lg mt-0.5">!</span><span>{t2}</span></li>)}</ul>
                    </div>
                  )}
                </div>
              </SectionCard>

              {/* Competitor Cards */}
              <div>
                <h3 className="flex items-center gap-3 text-2xl font-black text-[#0A1F0F] mb-5"><Swords className="h-7 w-7 text-[#006C35]" /> {t.competitorProfiles}</h3>
                <div className="space-y-6">
                  {analysisData.competitors.map((comp, i) => (
                    <SectionCard key={i}>
                      <div className="flex items-start justify-between mb-5 flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                          <ScoreCircle score={comp.overallScore} size={72} />
                          <div>
                            <h4 className="font-black text-2xl text-[#0A1F0F]">{comp.name}</h4>
                            <p className="text-base text-[#5A8A6A] font-medium">{comp.handle} · {comp.platform}</p>
                          </div>
                        </div>
                        <ThreatBadge level={comp.threatLevel} />
                      </div>

                      {/* Key Insight Banner */}
                      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#006C35]/5 to-[#C9A84C]/5 border-2 border-[#D4EBD9] mb-6">
                        <p className="text-sm font-black text-[#006C35] uppercase tracking-wider mb-1">{locale === "ar" ? "الرؤية الرئيسية" : "KEY INSIGHT"}</p>
                        <p className="text-base text-[#0A1F0F] leading-7 font-medium">{comp.keyInsight}</p>
                      </div>

                      {comp.stealThisMove && (
                        <div className="p-5 rounded-2xl bg-[#C9A84C]/5 border-2 border-[#C9A84C]/20 mb-6">
                          <p className="text-sm font-black text-[#C9A84C] uppercase tracking-wider mb-1 flex items-center gap-2"><Star className="h-4 w-4" /> {locale === "ar" ? "اسرق هذه الحركة" : "STEAL THIS MOVE"}</p>
                          <p className="text-base text-[#0A1F0F] leading-7 font-medium">{comp.stealThisMove}</p>
                        </div>
                      )}

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-4">
                          {[
                            { label: t.postingFrequency, value: comp.postingFrequency, icon: Calendar },
                            { label: t.engagement, value: comp.engagementLevel, icon: BarChart3 },
                            { label: t.hashtagStrategy, value: comp.hashtagStrategy, icon: Target },
                            { label: t.visualBranding, value: comp.visualStyle, icon: Eye },
                          ].map((item) => (
                            <div key={item.label} className="p-4 rounded-xl bg-[#F8FBF8] border border-[#D4EBD9]">
                              <p className="text-sm font-black text-[#006C35] mb-1 flex items-center gap-1.5"><item.icon className="h-4 w-4" />{item.label}</p>
                              <p className="text-base text-[#2D5A3D] leading-7">{item.value}</p>
                            </div>
                          ))}
                          {comp.captionStyle && (
                            <div className="p-4 rounded-xl bg-[#F8FBF8] border border-[#D4EBD9]">
                              <p className="text-sm font-black text-[#006C35] mb-1">{locale === "ar" ? "أسلوب الكتابة" : "Caption Style"}</p>
                              <p className="text-base text-[#2D5A3D] leading-7">{comp.captionStyle}</p>
                            </div>
                          )}
                        </div>
                        <div className="space-y-4">
                          {comp.audienceProfile && (
                            <div className="p-4 rounded-xl bg-[#F8FBF8] border border-[#D4EBD9]">
                              <p className="text-sm font-black text-[#006C35] mb-1">{locale === "ar" ? "ملف الجمهور" : "Audience Profile"}</p>
                              <p className="text-base text-[#2D5A3D] leading-7">{comp.audienceProfile}</p>
                            </div>
                          )}
                          {comp.contentCalendar && (
                            <div className="p-4 rounded-xl bg-[#F8FBF8] border border-[#D4EBD9]">
                              <p className="text-sm font-black text-[#006C35] mb-1">{locale === "ar" ? "تقويم المحتوى" : "Content Calendar"}</p>
                              <p className="text-base text-[#2D5A3D] leading-7">{comp.contentCalendar}</p>
                            </div>
                          )}
                          {comp.paidStrategy && (
                            <div className="p-4 rounded-xl bg-[#F8FBF8] border border-[#D4EBD9]">
                              <p className="text-sm font-black text-[#006C35] mb-1">{locale === "ar" ? "الاستراتيجية المدفوعة" : "Paid Strategy"}</p>
                              <p className="text-base text-[#2D5A3D] leading-7">{comp.paidStrategy}</p>
                            </div>
                          )}
                          <div className="p-5 rounded-xl bg-green-50/50 border border-green-200">
                            <p className="text-sm font-black text-[#006C35] mb-2">{t.strengths}</p>
                            {comp.strengths.map((s, j) => <p key={j} className="text-base text-[#2D5A3D] leading-7">+ {s}</p>)}
                          </div>
                          <div className="p-5 rounded-xl bg-red-50/50 border border-red-200">
                            <p className="text-sm font-black text-red-600 mb-2">{t.weaknesses}</p>
                            {comp.weakPoints.map((w, j) => <p key={j} className="text-base text-[#2D5A3D] leading-7">- {w}</p>)}
                          </div>
                        </div>
                      </div>
                    </SectionCard>
                  ))}
                </div>
              </div>

              {/* Saudi Market Insights */}
              <SectionCard>
                <SectionTitle icon={Globe}>🇸🇦 {t.saudiMarketInsights}</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { key: "trendAlignment" as const, label: t.trendAlignment, icon: TrendingUp },
                    { key: "vision2030Relevance" as const, label: t.vision2030, icon: Rocket },
                    { key: "culturalFit" as const, label: t.culturalFit, icon: Shield },
                  ].map((item) => (
                    <div key={item.key} className="p-5 rounded-2xl bg-[#F8FBF8] border border-[#D4EBD9]">
                      <h4 className="font-black text-base text-[#006C35] mb-2 flex items-center gap-2"><item.icon className="h-5 w-5" />{item.label}</h4>
                      <p className="text-base text-[#2D5A3D] leading-7">{analysisData.saudiMarketInsights[item.key]}</p>
                    </div>
                  ))}
                  {analysisData.saudiMarketInsights.localOpportunities && (
                    <div className="p-5 rounded-2xl bg-[#F8FBF8] border border-[#D4EBD9]">
                      <h4 className="font-black text-base text-[#006C35] mb-2 flex items-center gap-2"><Sparkles className="h-5 w-5" />{locale === "ar" ? "فرص محلية" : "Local Opportunities"}</h4>
                      <p className="text-base text-[#2D5A3D] leading-7">{analysisData.saudiMarketInsights.localOpportunities}</p>
                    </div>
                  )}
                  {analysisData.saudiMarketInsights.ramadanStrategy && (
                    <div className="md:col-span-2 p-5 rounded-2xl bg-gradient-to-r from-[#006C35]/5 to-[#C9A84C]/5 border-2 border-[#D4EBD9]">
                      <h4 className="font-black text-base text-[#C9A84C] mb-2 flex items-center gap-2"><Star className="h-5 w-5" />{locale === "ar" ? "استراتيجية رمضان" : "Ramadan Strategy"}</h4>
                      <p className="text-base text-[#2D5A3D] leading-7">{analysisData.saudiMarketInsights.ramadanStrategy}</p>
                    </div>
                  )}
                </div>
              </SectionCard>
            </div>
          )}

          {/* ═══ COMPARE TAB ═══ */}
          {activeTab === "compare" && (
            <div className="space-y-6">
              <SectionCard>
                <SectionTitle icon={BarChart3}>{t.comparisonMatrix}</SectionTitle>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-[#D4EBD9]">
                        <th className="text-start py-4 px-3 font-black text-base text-[#5A8A6A]">{t.category}</th>
                        <th className="text-start py-4 px-3 font-black text-base text-[#006C35]">{t.yourBrand}</th>
                        {Object.keys(analysisData.comparisonMatrix.competitors).map((n) => <th key={n} className="text-start py-4 px-3 font-black text-base text-[#0A1F0F]">{n}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {analysisData.comparisonMatrix.categories.map((cat, idx) => (
                        <tr key={cat} className="border-b border-[#D4EBD9]/50 hover:bg-[#F8FBF8] transition-colors">
                          <td className="py-4 px-3 font-bold text-base text-[#5A8A6A]">{cat}</td>
                          <td className="py-4 px-3 min-w-[200px]"><ScoreBar score={analysisData.comparisonMatrix.yourBrand[idx]} color="#006C35" /></td>
                          {Object.entries(analysisData.comparisonMatrix.competitors).map(([n, scores]) => (
                            <td key={n} className="py-4 px-3 min-w-[200px]"><ScoreBar score={scores[idx]} /></td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>

              {/* Score Summary */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="rounded-2xl border-2 border-[#006C35] bg-[#F0F7F2] p-6 flex flex-col items-center">
                  <ScoreCircle score={analysisData.brandAssessment.overallScore} size={90} />
                  <p className="text-base font-black text-[#006C35] mt-2">{t.yourBrand}</p>
                </div>
                {analysisData.competitors.map((comp) => (
                  <div key={comp.name} className="rounded-2xl border-2 border-[#D4EBD9] bg-white p-6 flex flex-col items-center">
                    <ScoreCircle score={comp.overallScore} size={90} />
                    <p className="text-base font-black text-[#0A1F0F] mt-2">{comp.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ WINNING STRATEGY TAB ═══ */}
          {activeTab === "strategy" && (
            <div className="space-y-6">
              {/* Quick Wins */}
              {analysisData.winningStrategy.quickWins && analysisData.winningStrategy.quickWins.length > 0 && (
                <SectionCard className="bg-gradient-to-r from-[#006C35]/5 to-[#00A352]/5 border-[#006C35]/20">
                  <SectionTitle icon={Zap} color="text-[#C9A84C]">{locale === "ar" ? "مكاسب سريعة — نفذها اليوم!" : "Quick Wins — Do These TODAY!"}</SectionTitle>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysisData.winningStrategy.quickWins.map((w, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white border-2 border-[#D4EBD9]">
                        <div className="w-8 h-8 rounded-lg bg-[#C9A84C] flex items-center justify-center shrink-0"><span className="text-white font-black text-sm">{i + 1}</span></div>
                        <p className="text-base text-[#0A1F0F] leading-7">{w}</p>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}

              {/* Immediate */}
              <SectionCard>
                <SectionTitle icon={Zap} color="text-red-500">{t.immediateActions}</SectionTitle>
                <div className="space-y-4">
                  {analysisData.winningStrategy.immediate.map((a, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-red-50/50 border-2 border-red-100">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <p className="text-base text-[#0A1F0F] leading-7 flex-1 font-medium">{a.action}</p>
                        <div className="flex gap-2 shrink-0"><PriorityBadge priority={a.priority} /></div>
                      </div>
                      {a.kpi && <p className="text-sm text-[#5A8A6A] flex items-center gap-1.5 mt-2"><ArrowRight className="h-4 w-4" /><span className="font-bold">KPI:</span> {a.kpi}</p>}
                    </div>
                  ))}
                </div>
              </SectionCard>

              {/* Short-term */}
              <SectionCard>
                <SectionTitle icon={Calendar} color="text-[#C9A84C]">{t.shortTermActions}</SectionTitle>
                <div className="space-y-4">
                  {analysisData.winningStrategy.shortTerm.map((a, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-yellow-50/30 border-2 border-yellow-100">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <p className="text-base text-[#0A1F0F] leading-7 flex-1 font-medium">{a.action}</p>
                        <div className="flex gap-2 shrink-0"><PriorityBadge priority={a.priority} /></div>
                      </div>
                      {a.kpi && <p className="text-sm text-[#5A8A6A] flex items-center gap-1.5 mt-2"><ArrowRight className="h-4 w-4" /><span className="font-bold">KPI:</span> {a.kpi}</p>}
                    </div>
                  ))}
                </div>
              </SectionCard>

              {/* Long-term */}
              <SectionCard>
                <SectionTitle icon={Rocket} color="text-[#006C35]">{t.longTermActions}</SectionTitle>
                <div className="space-y-4">
                  {analysisData.winningStrategy.longTerm.map((a, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-[#F0F7F2] border-2 border-[#D4EBD9]">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <p className="text-base text-[#0A1F0F] leading-7 flex-1 font-medium">{a.action}</p>
                        <div className="flex gap-2 shrink-0"><PriorityBadge priority={a.priority} /></div>
                      </div>
                      {a.kpi && <p className="text-sm text-[#5A8A6A] flex items-center gap-1.5 mt-2"><ArrowRight className="h-4 w-4" /><span className="font-bold">KPI:</span> {a.kpi}</p>}
                    </div>
                  ))}
                </div>
              </SectionCard>

              {/* Content Series */}
              {analysisData.winningStrategy.contentSeries && analysisData.winningStrategy.contentSeries.length > 0 && (
                <SectionCard>
                  <SectionTitle icon={Sparkles} color="text-[#C9A84C]">{locale === "ar" ? "سلاسل محتوى مقترحة" : "Recommended Content Series"}</SectionTitle>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {analysisData.winningStrategy.contentSeries.map((s, i) => (
                      <div key={i} className="p-5 rounded-2xl border-2 border-[#C9A84C]/20 bg-[#C9A84C]/5">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-black text-lg text-[#0A1F0F]">{s.name}</h4>
                          <span className="px-3 py-1 rounded-lg bg-[#006C35] text-white text-sm font-bold">{s.platform}</span>
                        </div>
                        <p className="text-base text-[#2D5A3D] leading-7">{s.description}</p>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}

              {/* Content Gaps & Differentiators */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SectionCard>
                  <SectionTitle icon={Lightbulb} color="text-[#C9A84C]">{t.contentGaps}</SectionTitle>
                  <div className="space-y-3">
                    {analysisData.winningStrategy.contentGaps.map((g, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-[#F8FBF8] border border-[#D4EBD9]">
                        <Lightbulb className="h-5 w-5 mt-1 shrink-0 text-[#C9A84C]" />
                        <p className="text-base text-[#2D5A3D] leading-7">{g}</p>
                      </div>
                    ))}
                  </div>
                </SectionCard>
                <SectionCard>
                  <SectionTitle icon={Shield}>{t.differentiators}</SectionTitle>
                  <div className="space-y-3">
                    {analysisData.winningStrategy.differentiators.map((d, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-[#F8FBF8] border border-[#D4EBD9]">
                        <Shield className="h-5 w-5 mt-1 shrink-0 text-[#006C35]" />
                        <p className="text-base text-[#2D5A3D] leading-7">{d}</p>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!analysisData && !loading && (
        <div className="rounded-2xl border-2 border-dashed border-[#D4EBD9] bg-white flex flex-col items-center justify-center py-20 text-center">
          <Swords className="h-16 w-16 text-[#D4EBD9] mb-5" />
          <p className="text-[#5A8A6A] text-xl font-medium">{t.noAnalysisYet}</p>
        </div>
      )}
    </div>
  );
}
