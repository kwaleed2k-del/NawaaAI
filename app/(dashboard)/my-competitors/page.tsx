"use client";

import { useEffect, useState } from "react";
import {
  Swords, Clock, Trash2, Loader2, Sparkles, Eye, X, Download,
  ChevronUp, Target, BarChart3, Shield, TrendingUp, AlertTriangle,
  Calendar, Rocket, Star, Building2,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import toast from "react-hot-toast";
import { exportCompetitorPdf } from "@/lib/export-competitor-pdf";

/* ── Types ── */

interface Competitor { name: string; handle: string; platform: string; websiteUrl: string; }
interface StrategyAction { action: string; priority: string; impact: string; kpi?: string; }
interface CompetitorResult {
  name: string; handle: string; platform: string; postingFrequency: string;
  contentTypes: string[]; captionStyle: string; hashtagStrategy: string;
  engagementLevel: string; visualStyle: string; strengths: string[];
  weakPoints: string[]; threatLevel: number; overallScore: number; keyInsight: string;
  stealThisMove?: string;
}
interface AnalysisData {
  executiveSummary: string;
  brandAssessment: { strengths: string[]; weaknesses: string[]; opportunities?: string[]; threats?: string[]; overallScore: number; marketPosition?: string; };
  competitors: CompetitorResult[];
  comparisonMatrix: { categories: string[]; yourBrand: number[]; competitors: Record<string, number[]>; };
  winningStrategy: { immediate: StrategyAction[]; shortTerm: StrategyAction[]; longTerm: StrategyAction[]; contentGaps: string[]; differentiators: string[]; quickWins?: string[]; };
  saudiMarketInsights: { trendAlignment: string; vision2030Relevance: string; culturalFit: string; localOpportunities?: string; ramadanStrategy?: string; };
}
interface SavedAnalysis {
  id: string; user_id: string; company_id: string; competitors: Competitor[];
  analysis_data: AnalysisData; output_language: string; created_at: string;
}
interface CompanyInfo { id: string; name: string; name_ar: string | null; logo_url: string | null; brand_colors: string[] | null; }

/* ── Score Circle ── */
function ScoreCircle({ score, size = 64 }: { score: number; size?: number }) {
  const circumference = 2 * Math.PI * 26;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? "#006C35" : score >= 40 ? "#C9A84C" : "#ef4444";
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <circle cx="30" cy="30" r="26" fill="none" stroke="#E8F0EA" strokeWidth="5" />
      <circle cx="30" cy="30" r="26" fill="none" stroke={color} strokeWidth="5" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 30 30)" className="transition-all duration-700" />
      <text x="30" y="34" textAnchor="middle" style={{ fontSize: "16px", fontWeight: 800, fill: "#0A1F0F" }}>{score}</text>
    </svg>
  );
}

function ThreatBadge({ level }: { level: number }) {
  const cfg = level >= 7 ? { bg: "bg-red-100 text-red-700 border-red-200", label: "HIGH" } : level >= 4 ? { bg: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "MED" } : { bg: "bg-green-100 text-[#006C35] border-[#D4EBD9]", label: "LOW" };
  return <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black border ${cfg.bg}`}><AlertTriangle className="h-3 w-3" />{cfg.label}</span>;
}

const ACCENT_COLORS = [
  "from-[#006C35] via-[#00A352] to-[#C9A84C]",
  "from-[#C9A84C] via-[#E8D5A0] to-[#C9A84C]",
  "from-blue-500 via-indigo-500 to-purple-500",
  "from-purple-500 via-fuchsia-500 to-pink-500",
];

export default function MyCompetitorsPage() {
  const supabase = createClient();
  const { locale, user } = useAppStore();
  const isAr = locale === "ar";

  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [companies, setCompanies] = useState<CompanyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (user) loadData();
    else setLoading(false);
  }, [user]);

  async function loadData() {
    if (!user) { setLoading(false); return; }
    try {
      const [analysesRes, companiesRes] = await Promise.all([
        supabase.from("competitor_analyses").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("companies").select("id, name, name_ar, logo_url, brand_colors").eq("user_id", user.id),
      ]);
      setAnalyses((analysesRes.data as SavedAnalysis[]) ?? []);
      setCompanies((companiesRes.data as CompanyInfo[]) ?? []);
    } catch { /* table may not exist yet */ }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const { data: { user: u } } = await supabase.auth.getUser();
    if (!u) { setDeletingId(null); return; }
    const { error } = await supabase.from("competitor_analyses").delete().eq("id", id).eq("user_id", u.id);
    if (error) {
      toast.error(isAr ? "فشل الحذف" : "Failed to delete");
    } else {
      toast.success(isAr ? "تم الحذف" : "Deleted");
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
      if (expandedId === id) setExpandedId(null);
    }
    setDeletingId(null);
    setConfirmDeleteId(null);
  }

  function handleExportPdf(analysis: SavedAnalysis) {
    const company = companies.find((c) => c.id === analysis.company_id);
    const companyName = company ? (isAr && company.name_ar ? company.name_ar : company.name) : "Analysis";
    exportCompetitorPdf(analysis.analysis_data, companyName, analysis.competitors, (analysis.output_language || locale) as "en" | "ar");
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#D4EBD9] via-[#E8F5EC] to-[#D4EBD9] p-8">
          <Skeleton className="h-10 w-80 rounded-xl bg-white/50" />
          <Skeleton className="mt-3 h-6 w-60 rounded-lg bg-white/30" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border-2 border-[#D4EBD9] bg-white overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-[#D4EBD9] via-[#E8F5EC] to-[#D4EBD9]" />
              <div className="p-6 space-y-4">
                <Skeleton className="h-6 w-full rounded-lg bg-[#D4EBD9]/40" />
                <Skeleton className="h-5 w-3/4 rounded-lg bg-[#D4EBD9]/30" />
                <Skeleton className="h-12 w-full rounded-xl bg-[#D4EBD9]/20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Empty state ── */
  if (analyses.length === 0) {
    return (
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#006C35] via-[#00A352] to-[#C9A84C] p-8 md:p-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-sm">
            {isAr ? "تحليلاتي التنافسية" : "My Competitor Analyses"}
          </h1>
          <div className="mt-3 flex items-center gap-2 text-white/80 text-lg">
            <Swords className="h-5 w-5" />
            <span>{isAr ? "عرض وإدارة جميع تحليلات المنافسين المحفوظة" : "View and manage all your saved competitor analyses"}</span>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-[#D4EBD9] bg-[#F8FBF8] py-24 px-6">
          <div className="relative">
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-[#006C35] via-[#00A352] to-[#C9A84C] shadow-lg">
              <Swords className="h-14 w-14 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#C9A84C] to-[#E8D5A0] shadow-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="mt-8 text-2xl font-bold text-[#004D26]">{isAr ? "لا توجد تحليلات محفوظة بعد" : "No saved analyses yet"}</p>
          <p className="mt-3 text-lg text-[#5A8A6A] max-w-md text-center leading-relaxed">
            {isAr ? "انتقل إلى تحليل المنافسين لإنشاء وحفظ أول تحليل" : "Go to Competitor Analysis to create and save your first analysis"}
          </p>
          <a href="/competitor-analysis" className="mt-8 inline-flex h-14 items-center justify-center gap-3 px-10 text-lg font-bold rounded-2xl bg-gradient-to-r from-[#006C35] via-[#00A352] to-[#C9A84C] text-white hover:shadow-md transition-all duration-300 shadow-lg hover:scale-[1.02]">
            <Swords className="h-6 w-6" />
            {isAr ? "اذهب إلى تحليل المنافسين" : "Go to Competitor Analysis"}
          </a>
        </div>
      </div>
    );
  }

  /* ── Main view ── */
  const expandedAnalysis = analyses.find((a) => a.id === expandedId);

  return (
    <div className="space-y-8" dir={isAr ? "rtl" : "ltr"}>
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#006C35] via-[#00A352] to-[#C9A84C] p-8 md:p-10">
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-sm">
              {isAr ? "تحليلاتي التنافسية" : "My Competitor Analyses"}
            </h1>
            <div className="mt-3 flex items-center gap-2 text-white/80 text-lg">
              <Sparkles className="h-5 w-5" />
              <span>{isAr ? "عرض وإدارة جميع تحليلات المنافسين المحفوظة" : "View and manage all your saved competitor analyses"}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-white/20 border border-white/30 px-5 py-3">
            <Swords className="h-6 w-6 text-white" />
            <span className="text-2xl font-extrabold text-white">{analyses.length}</span>
            <span className="text-lg text-white/80 font-medium">{isAr ? (analyses.length === 1 ? "تحليل" : "تحليلات") : (analyses.length === 1 ? "analysis" : "analyses")}</span>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {analyses.map((analysis, i) => {
          const isExpanded = expandedId === analysis.id;
          const company = companies.find((c) => c.id === analysis.company_id);
          const accentIdx = i % ACCENT_COLORS.length;
          const competitorNames = analysis.competitors?.map((c) => c.name).join(", ") || "—";
          const data = analysis.analysis_data;
          const brandScore = data?.brandAssessment?.overallScore ?? 0;

          return (
            <div key={analysis.id} className={cn("group relative overflow-hidden rounded-2xl border-2 bg-white transition-all duration-300 hover:shadow-lg", isExpanded ? "border-[#006C35]/50 shadow-lg" : "border-[#D4EBD9] hover:border-[#006C35]/40")}>
              <div className={cn("h-2 bg-gradient-to-r", ACCENT_COLORS[accentIdx])} />
              <div className="p-6">
                {/* Company */}
                {company && (
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl overflow-hidden border-2 border-[#D4EBD9] shadow-sm" style={{ backgroundColor: company.brand_colors?.[0] || "#F0F7F2" }}>
                      {company.logo_url ? <img src={company.logo_url} alt="" className="h-full w-full object-cover" /> : <span className="text-lg font-extrabold text-white drop-shadow-sm">{company.name?.charAt(0) || "?"}</span>}
                    </div>
                    <span className="text-lg font-bold text-[#004D26]">{isAr ? company.name_ar || company.name : company.name}</span>
                  </div>
                )}

                {/* Competitors */}
                <h3 className="text-xl font-bold text-[#004D26] leading-snug line-clamp-2">
                  {isAr ? "vs " : "vs "}{competitorNames}
                </h3>

                {/* Score + Competitor count */}
                <div className="mt-3 flex items-center gap-4">
                  <ScoreCircle score={brandScore} size={56} />
                  <div>
                    <p className="text-sm font-bold text-[#5A8A6A]">{isAr ? "نتيجة علامتك" : "Your Brand Score"}</p>
                    <p className="text-base font-bold text-[#0A1F0F]">{data?.competitors?.length ?? 0} {isAr ? "منافسين" : "competitors"}</p>
                  </div>
                </div>

                {/* Competitor threat pills */}
                {data?.competitors && data.competitors.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {data.competitors.map((c) => (
                      <div key={c.name} className="flex items-center gap-1.5 rounded-xl bg-[#F8FBF8] border border-[#D4EBD9] px-3 py-1.5">
                        <span className="text-sm font-bold text-[#0A1F0F]">{c.name}</span>
                        <ThreatBadge level={c.threatLevel} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Language + Date */}
                <div className="mt-4 flex items-center gap-3 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F0F7F2] border border-[#D4EBD9] px-3 py-1 text-sm text-[#5A8A6A]">
                    {analysis.output_language === "ar" ? "العربية" : "English"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F0F7F2] border border-[#D4EBD9] px-3 py-1 text-sm text-[#5A8A6A]">
                    <Clock className="h-3.5 w-3.5" />
                    {(() => { try { return format(parseISO(analysis.created_at), "MMM d, yyyy"); } catch { return analysis.created_at; } })()}
                  </span>
                </div>

                {/* Actions */}
                <div className="mt-5 flex gap-2">
                  <Button onClick={() => setExpandedId(isExpanded ? null : analysis.id)} className={cn("flex-1 h-12 rounded-xl text-base font-bold transition-all", isExpanded ? "bg-[#006C35] text-white hover:bg-[#006C35]/90" : "bg-gradient-to-r from-[#006C35] to-[#00A352] text-white hover:shadow-sm shadow-md hover:scale-[1.02]")}>
                    {isExpanded ? <><ChevronUp className="mr-2 h-5 w-5" />{isAr ? "إخفاء" : "Collapse"}</> : <><Eye className="mr-2 h-5 w-5" />{isAr ? "عرض التحليل" : "View Analysis"}</>}
                  </Button>
                  <Button onClick={() => handleExportPdf(analysis)} variant="outline" className="h-12 px-4 rounded-xl border-2 border-[#D4EBD9] text-[#006C35] hover:bg-[#F0F7F2]">
                    <Download className="h-5 w-5" />
                  </Button>
                  {confirmDeleteId === analysis.id ? (
                    <div className="flex gap-1.5">
                      <Button onClick={() => handleDelete(analysis.id)} disabled={deletingId === analysis.id} className="h-12 px-4 rounded-xl bg-red-500 text-white hover:bg-red-600 text-base font-bold">
                        {deletingId === analysis.id ? <Loader2 className="h-5 w-5 animate-spin" /> : isAr ? "تأكيد" : "Yes"}
                      </Button>
                      <Button onClick={() => setConfirmDeleteId(null)} variant="outline" className="h-12 px-4 rounded-xl border-2 border-[#D4EBD9] text-[#5A8A6A]">
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => setConfirmDeleteId(analysis.id)} variant="outline" className="h-12 px-4 rounded-xl border-2 border-[#D4EBD9] text-red-400 hover:text-red-600 hover:border-red-300 hover:bg-red-50">
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Expanded Analysis Detail ── */}
      {expandedAnalysis && expandedAnalysis.analysis_data && (() => {
        const data = expandedAnalysis.analysis_data;
        const company = companies.find((c) => c.id === expandedAnalysis.company_id);
        const companyName = company ? (isAr && company.name_ar ? company.name_ar : company.name) : "";
        return (
          <div className="rounded-2xl border-2 border-[#006C35]/20 bg-[#F8FBF8] overflow-hidden">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#006C35] via-[#00A352] to-[#C9A84C] px-6 py-6 lg:px-8 lg:py-8">
              <div className="relative flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 border border-white/30">
                      <Swords className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-extrabold text-white drop-shadow-sm">
                        {isAr ? "تحليل المنافسين" : "Competitor Analysis"} — {companyName}
                      </h2>
                      <p className="text-lg text-white/80">
                        vs {expandedAnalysis.competitors.map((c) => c.name).join(", ")}
                      </p>
                    </div>
                  </div>
                </div>
                <Button onClick={() => setExpandedId(null)} className="h-12 px-5 rounded-xl bg-white/20 border border-white/30 text-white hover:bg-white/30 text-base font-bold">
                  <ChevronUp className="mr-2 h-5 w-5" /> {isAr ? "إغلاق" : "Close"}
                </Button>
              </div>
            </div>

            <div className="p-6 lg:p-8 space-y-6">
              {/* Executive Summary */}
              <div className="rounded-2xl border-2 border-[#D4EBD9] bg-white p-6">
                <h3 className="flex items-center gap-3 text-xl font-black text-[#0A1F0F] mb-4"><Target className="h-6 w-6 text-[#006C35]" />{isAr ? "الملخص التنفيذي" : "Executive Summary"}</h3>
                <p className="text-base leading-8 text-[#2D5A3D] whitespace-pre-line">{data.executiveSummary}</p>
              </div>

              {/* Brand Assessment */}
              <div className="rounded-2xl border-2 border-[#D4EBD9] bg-white p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="flex items-center gap-3 text-xl font-black text-[#0A1F0F]"><Shield className="h-6 w-6 text-[#006C35]" />{isAr ? "تقييم علامتك" : "Brand Assessment"}</h3>
                  <ScoreCircle score={data.brandAssessment.overallScore} size={72} />
                </div>
                {data.brandAssessment.marketPosition && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-[#006C35]/5 to-[#00A352]/5 border border-[#D4EBD9] mb-5">
                    <p className="text-base text-[#2D5A3D] leading-7">{data.brandAssessment.marketPosition}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="p-4 rounded-xl bg-green-50/50 border border-green-200">
                    <h4 className="font-black text-base text-[#006C35] mb-2 flex items-center gap-2"><TrendingUp className="h-4 w-4" />{isAr ? "نقاط القوة" : "Strengths"}</h4>
                    <ul className="space-y-2">{data.brandAssessment.strengths.map((s, i) => <li key={i} className="text-base text-[#2D5A3D] leading-7">+ {s}</li>)}</ul>
                  </div>
                  <div className="p-4 rounded-xl bg-red-50/50 border border-red-200">
                    <h4 className="font-black text-base text-red-600 mb-2 flex items-center gap-2"><AlertTriangle className="h-4 w-4" />{isAr ? "نقاط الضعف" : "Weaknesses"}</h4>
                    <ul className="space-y-2">{data.brandAssessment.weaknesses.map((w, i) => <li key={i} className="text-base text-[#2D5A3D] leading-7">- {w}</li>)}</ul>
                  </div>
                </div>
              </div>

              {/* Competitor Cards */}
              <div>
                <h3 className="flex items-center gap-3 text-xl font-black text-[#0A1F0F] mb-5"><Swords className="h-6 w-6 text-[#006C35]" />{isAr ? "ملفات المنافسين" : "Competitor Profiles"}</h3>
                <div className="grid gap-5 sm:grid-cols-2">
                  {data.competitors.map((comp, i) => (
                    <div key={i} className="rounded-2xl border-2 border-[#D4EBD9] bg-white p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <ScoreCircle score={comp.overallScore} size={52} />
                          <div>
                            <h4 className="font-black text-lg text-[#0A1F0F]">{comp.name}</h4>
                            <p className="text-sm text-[#5A8A6A]">{comp.handle} · {comp.platform}</p>
                          </div>
                        </div>
                        <ThreatBadge level={comp.threatLevel} />
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-r from-[#006C35]/5 to-[#C9A84C]/5 border border-[#D4EBD9] mb-4">
                        <p className="text-xs font-black text-[#006C35] uppercase tracking-wider mb-1">{isAr ? "الرؤية الرئيسية" : "KEY INSIGHT"}</p>
                        <p className="text-sm text-[#0A1F0F] leading-6">{comp.keyInsight}</p>
                      </div>
                      {comp.stealThisMove && (
                        <div className="p-4 rounded-xl bg-[#C9A84C]/5 border border-[#C9A84C]/20 mb-4">
                          <p className="text-xs font-black text-[#C9A84C] uppercase tracking-wider mb-1 flex items-center gap-1"><Star className="h-3 w-3" />{isAr ? "اسرق هذه الحركة" : "STEAL THIS MOVE"}</p>
                          <p className="text-sm text-[#0A1F0F] leading-6">{comp.stealThisMove}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-green-50/50 border border-green-200">
                          <p className="text-xs font-black text-[#006C35] mb-1">{isAr ? "القوة" : "Strengths"}</p>
                          {comp.strengths.slice(0, 3).map((s, j) => <p key={j} className="text-sm text-[#2D5A3D] leading-5">+ {s}</p>)}
                        </div>
                        <div className="p-3 rounded-lg bg-red-50/50 border border-red-200">
                          <p className="text-xs font-black text-red-600 mb-1">{isAr ? "الضعف" : "Weak Points"}</p>
                          {comp.weakPoints.slice(0, 3).map((w, j) => <p key={j} className="text-sm text-[#2D5A3D] leading-5">- {w}</p>)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comparison Matrix */}
              {data.comparisonMatrix && (
                <div className="rounded-2xl border-2 border-[#D4EBD9] bg-white p-6">
                  <h3 className="flex items-center gap-3 text-xl font-black text-[#0A1F0F] mb-5"><BarChart3 className="h-6 w-6 text-[#006C35]" />{isAr ? "مصفوفة المقارنة" : "Comparison Matrix"}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-[#D4EBD9]">
                          <th className="text-start py-3 px-3 font-black text-sm text-[#5A8A6A]">{isAr ? "الفئة" : "Category"}</th>
                          <th className="text-start py-3 px-3 font-black text-sm text-[#006C35]">{isAr ? "علامتك" : "Your Brand"}</th>
                          {Object.keys(data.comparisonMatrix.competitors).map((n) => <th key={n} className="text-start py-3 px-3 font-black text-sm text-[#0A1F0F]">{n}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {data.comparisonMatrix.categories.map((cat, idx) => (
                          <tr key={cat} className="border-b border-[#D4EBD9]/50">
                            <td className="py-3 px-3 font-bold text-sm text-[#5A8A6A]">{cat}</td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2.5 bg-[#E8F0EA] rounded-full overflow-hidden"><div className="h-full rounded-full bg-[#006C35]" style={{ width: `${data.comparisonMatrix.yourBrand[idx]}%` }} /></div>
                                <span className="text-sm font-bold w-8 text-right">{data.comparisonMatrix.yourBrand[idx]}</span>
                              </div>
                            </td>
                            {Object.entries(data.comparisonMatrix.competitors).map(([n, scores]) => {
                              const s = scores[idx];
                              const c = s >= 70 ? "#006C35" : s >= 40 ? "#C9A84C" : "#ef4444";
                              return (
                                <td key={n} className="py-3 px-3">
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2.5 bg-[#E8F0EA] rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${s}%`, backgroundColor: c }} /></div>
                                    <span className="text-sm font-bold w-8 text-right">{s}</span>
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Strategy Highlights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="rounded-2xl border-2 border-[#D4EBD9] bg-white p-6">
                  <h3 className="flex items-center gap-3 text-lg font-black text-[#0A1F0F] mb-4"><Rocket className="h-5 w-5 text-red-500" />{isAr ? "إجراءات فورية" : "Immediate Actions"}</h3>
                  <div className="space-y-3">
                    {data.winningStrategy.immediate.slice(0, 3).map((a, i) => (
                      <div key={i} className="p-3 rounded-xl bg-red-50/50 border border-red-100">
                        <p className="text-sm text-[#0A1F0F] leading-6">{a.action}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border-2 border-[#D4EBD9] bg-white p-6">
                  <h3 className="flex items-center gap-3 text-lg font-black text-[#0A1F0F] mb-4"><Calendar className="h-5 w-5 text-[#C9A84C]" />{isAr ? "إجراءات قصيرة المدى" : "Short-Term Actions"}</h3>
                  <div className="space-y-3">
                    {data.winningStrategy.shortTerm.slice(0, 3).map((a, i) => (
                      <div key={i} className="p-3 rounded-xl bg-yellow-50/30 border border-yellow-100">
                        <p className="text-sm text-[#0A1F0F] leading-6">{a.action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Content Gaps + Differentiators */}
              {(data.winningStrategy.contentGaps?.length > 0 || data.winningStrategy.differentiators?.length > 0) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {data.winningStrategy.contentGaps?.length > 0 && (
                    <div className="rounded-2xl border-2 border-[#D4EBD9] bg-white p-6">
                      <h3 className="flex items-center gap-3 text-lg font-black text-[#0A1F0F] mb-4"><Sparkles className="h-5 w-5 text-[#C9A84C]" />{isAr ? "فجوات المحتوى" : "Content Gaps"}</h3>
                      <div className="space-y-2">{data.winningStrategy.contentGaps.map((g, i) => <p key={i} className="text-sm text-[#2D5A3D] leading-6 flex items-start gap-2"><span className="text-[#C9A84C] mt-0.5">•</span>{g}</p>)}</div>
                    </div>
                  )}
                  {data.winningStrategy.differentiators?.length > 0 && (
                    <div className="rounded-2xl border-2 border-[#D4EBD9] bg-white p-6">
                      <h3 className="flex items-center gap-3 text-lg font-black text-[#0A1F0F] mb-4"><Shield className="h-5 w-5 text-[#006C35]" />{isAr ? "عوامل التميز" : "Differentiators"}</h3>
                      <div className="space-y-2">{data.winningStrategy.differentiators.map((d, i) => <p key={i} className="text-sm text-[#2D5A3D] leading-6 flex items-start gap-2"><span className="text-[#006C35] mt-0.5">•</span>{d}</p>)}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Saudi Market */}
              <div className="rounded-2xl border-2 border-[#D4EBD9] bg-white p-6">
                <h3 className="flex items-center gap-3 text-xl font-black text-[#0A1F0F] mb-5"><Building2 className="h-6 w-6 text-[#006C35]" />{isAr ? "رؤى السوق السعودي" : "Saudi Market Insights"}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#F8FBF8] border border-[#D4EBD9]">
                    <h4 className="font-black text-sm text-[#006C35] mb-1">{isAr ? "التوافق مع الاتجاهات" : "Trend Alignment"}</h4>
                    <p className="text-sm text-[#2D5A3D] leading-6">{data.saudiMarketInsights.trendAlignment}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#F8FBF8] border border-[#D4EBD9]">
                    <h4 className="font-black text-sm text-[#006C35] mb-1">{isAr ? "صلة برؤية 2030" : "Vision 2030"}</h4>
                    <p className="text-sm text-[#2D5A3D] leading-6">{data.saudiMarketInsights.vision2030Relevance}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#F8FBF8] border border-[#D4EBD9]">
                    <h4 className="font-black text-sm text-[#006C35] mb-1">{isAr ? "التوافق الثقافي" : "Cultural Fit"}</h4>
                    <p className="text-sm text-[#2D5A3D] leading-6">{data.saudiMarketInsights.culturalFit}</p>
                  </div>
                  {data.saudiMarketInsights.ramadanStrategy && (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-[#006C35]/5 to-[#C9A84C]/5 border border-[#C9A84C]/20">
                      <h4 className="font-black text-sm text-[#C9A84C] mb-1 flex items-center gap-1"><Star className="h-3 w-3" />{isAr ? "استراتيجية رمضان" : "Ramadan Strategy"}</h4>
                      <p className="text-sm text-[#2D5A3D] leading-6">{data.saudiMarketInsights.ramadanStrategy}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
