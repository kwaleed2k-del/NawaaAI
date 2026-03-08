import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface Competitor {
  name: string;
  handle: string;
  platform: string;
  websiteUrl: string;
}

interface StrategyAction {
  action: string;
  priority: string;
  impact: string;
  kpi?: string;
}

interface CompetitorResult {
  name: string;
  handle: string;
  platform: string;
  postingFrequency: string;
  contentTypes: string[];
  captionStyle: string;
  hashtagStrategy: string;
  engagementLevel: string;
  visualStyle: string;
  strengths: string[];
  weakPoints: string[];
  threatLevel: number;
  overallScore: number;
  keyInsight: string;
  stealThisMove?: string;
  audienceProfile?: string;
  contentCalendar?: string;
  paidStrategy?: string;
  companyOverview?: string;
  productsAndServices?: string;
  targetMarket?: string;
  brandPositioning?: string;
  websiteAnalysis?: string;
  digitalPresence?: string;
  pricingStrategy?: string;
  customerReviews?: string;
  technologyStack?: string;
}

interface IndustryAnalysis {
  marketOverview: string;
  competitiveLandscape: string;
  consumerTrends: string;
  futureOutlook: string;
}

interface AnalysisData {
  executiveSummary: string;
  brandAssessment: {
    strengths: string[];
    weaknesses: string[];
    opportunities?: string[];
    threats?: string[];
    overallScore: number;
    marketPosition?: string;
  };
  competitors: CompetitorResult[];
  comparisonMatrix: {
    categories: string[];
    yourBrand: number[];
    competitors: Record<string, number[]>;
  };
  winningStrategy: {
    immediate: StrategyAction[];
    shortTerm: StrategyAction[];
    longTerm: StrategyAction[];
    contentGaps: string[];
    differentiators: string[];
    quickWins?: string[];
    contentSeries?: { name: string; description: string; platform: string }[];
  };
  saudiMarketInsights: {
    trendAlignment: string;
    vision2030Relevance: string;
    culturalFit: string;
    localOpportunities?: string;
    ramadanStrategy?: string;
  };
  industryAnalysis?: IndustryAnalysis;
}

type Locale = "en" | "ar";

function scoreColor(score: number): string {
  return score >= 70 ? "#006C35" : score >= 40 ? "#C9A84C" : "#ef4444";
}

function threatColor(level: number): { bg: string; text: string; label: string; labelAr: string } {
  if (level >= 7) return { bg: "#FEE2E2", text: "#DC2626", label: "HIGH", labelAr: "عالي" };
  if (level >= 4) return { bg: "#FEF3C7", text: "#D97706", label: "MEDIUM", labelAr: "متوسط" };
  return { bg: "#DCFCE7", text: "#16A34A", label: "LOW", labelAr: "منخفض" };
}

function priorityColor(p: string): { bg: string; text: string } {
  const l = p.toLowerCase();
  if (l === "high") return { bg: "#FEE2E2", text: "#DC2626" };
  if (l === "medium") return { bg: "#FEF3C7", text: "#D97706" };
  return { bg: "#DCFCE7", text: "#16A34A" };
}

function barHtml(score: number, w: string = "100%"): string {
  const c = scoreColor(score);
  return `<div style="display:flex;align-items:center;gap:8px;width:${w}">
    <div style="flex:1;height:8px;background:#E8F0EA;border-radius:4px;overflow:hidden"><div style="height:100%;width:${score}%;background:${c};border-radius:4px"></div></div>
    <span style="font-size:12px;font-weight:700;color:#0A1F0F;min-width:24px;text-align:right">${score}</span>
  </div>`;
}

/* ═══ Page 1: Cover + Executive Summary + Brand Assessment ═══ */
function renderCoverPage(data: AnalysisData, companyName: string, locale: Locale): string {
  const dir = locale === "ar" ? "rtl" : "ltr";
  const isAr = locale === "ar";
  return `<div style="width:1120px;min-height:780px;padding:0;background:#F8FBF8;font-family:'Cairo','Plus Jakarta Sans',sans-serif;font-size:14px;line-height:1.5;direction:${dir};box-sizing:border-box;">
    <!-- Green header -->
    <div style="background:linear-gradient(135deg,#006C35,#00A352);padding:36px 48px;color:white;">
      <div style="font-size:36px;font-weight:800;margin:0;">${isAr ? "تحليل المنافسين" : "Competitor Analysis"}</div>
      <div style="font-size:18px;margin-top:8px;">${companyName}</div>
      <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:12px;color:rgba(255,255,255,0.7);">
        <span>${new Date().toLocaleDateString(isAr ? "ar-SA" : "en-US")}</span>
        <span>${isAr ? "نواة AI" : "Nawaa AI"}</span>
      </div>
    </div>

    <div style="padding:32px 48px;">
      <!-- Executive Summary -->
      <div style="margin-bottom:24px;">
        <h2 style="font-size:20px;font-weight:800;color:#006C35;margin:0 0 12px;">${isAr ? "الملخص التنفيذي" : "Executive Summary"}</h2>
        <p style="font-size:13px;color:#2D5A3D;line-height:1.8;margin:0;white-space:pre-wrap;">${data.executiveSummary}</p>
      </div>

      <!-- Brand Assessment -->
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;">
        <h2 style="font-size:20px;font-weight:800;color:#006C35;margin:0;">${isAr ? "تقييم علامتك" : "Brand Assessment"}</h2>
        <div style="width:64px;height:64px;border-radius:50%;border:4px solid ${scoreColor(data.brandAssessment.overallScore)};text-align:center;line-height:56px;">
          <span style="font-size:22px;font-weight:800;color:#0A1F0F;">${data.brandAssessment.overallScore}</span>
        </div>
      </div>

      ${data.brandAssessment.marketPosition ? `<div style="background:#F0F7F2;border:1px solid #D4EBD9;border-radius:12px;padding:12px 16px;margin-bottom:16px;font-size:13px;color:#2D5A3D;line-height:1.7;">${data.brandAssessment.marketPosition}</div>` : ""}

      <div style="display:flex;gap:24px;">
        <!-- Strengths -->
        <div style="flex:1;background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:14px 16px;">
          <h3 style="font-size:14px;font-weight:800;color:#006C35;margin:0 0 8px;">${isAr ? "نقاط القوة" : "Strengths"}</h3>
          ${data.brandAssessment.strengths.map(s => `<p style="font-size:12px;color:#2D5A3D;margin:4px 0;line-height:1.6;">+ ${s}</p>`).join("")}
        </div>
        <!-- Weaknesses -->
        <div style="flex:1;background:#FEF2F2;border:1px solid #FECACA;border-radius:12px;padding:14px 16px;">
          <h3 style="font-size:14px;font-weight:800;color:#DC2626;margin:0 0 8px;">${isAr ? "نقاط الضعف" : "Weaknesses"}</h3>
          ${data.brandAssessment.weaknesses.map(w => `<p style="font-size:12px;color:#2D5A3D;margin:4px 0;line-height:1.6;">- ${w}</p>`).join("")}
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="padding:8px 48px;font-size:10px;color:#5A8A6A;display:flex;justify-content:space-between;">
      <span>${isAr ? "نواة AI — تقرير تحليل المنافسين" : "Nawaa AI — Competitor Analysis Report"}</span>
      <span>1</span>
    </div>
  </div>`;
}

/* ═══ Competitor Page ═══ */
function renderCompetitorPage(comp: CompetitorResult, locale: Locale, pageNum: number): string {
  const dir = locale === "ar" ? "rtl" : "ltr";
  const isAr = locale === "ar";
  const tc = threatColor(comp.threatLevel);

  const businessRows = [
    ...(comp.companyOverview ? [{ label: isAr ? "نظرة عامة" : "Company Overview", value: comp.companyOverview }] : []),
    ...(comp.productsAndServices ? [{ label: isAr ? "المنتجات والخدمات" : "Products & Services", value: comp.productsAndServices }] : []),
    ...(comp.targetMarket ? [{ label: isAr ? "السوق المستهدف" : "Target Market", value: comp.targetMarket }] : []),
    ...(comp.brandPositioning ? [{ label: isAr ? "التموضع" : "Brand Positioning", value: comp.brandPositioning }] : []),
    ...(comp.websiteAnalysis ? [{ label: isAr ? "الموقع الإلكتروني" : "Website Analysis", value: comp.websiteAnalysis }] : []),
    ...(comp.digitalPresence ? [{ label: isAr ? "الحضور الرقمي" : "Digital Presence", value: comp.digitalPresence }] : []),
    ...(comp.pricingStrategy ? [{ label: isAr ? "التسعير" : "Pricing Strategy", value: comp.pricingStrategy }] : []),
    ...(comp.customerReviews ? [{ label: isAr ? "مراجعات العملاء" : "Customer Reviews", value: comp.customerReviews }] : []),
    ...(comp.technologyStack ? [{ label: isAr ? "البنية التقنية" : "Tech Stack", value: comp.technologyStack }] : []),
  ];

  const marketingRows = [
    { label: isAr ? "تكرار النشر" : "Posting Frequency", value: comp.postingFrequency },
    { label: isAr ? "التفاعل" : "Engagement", value: comp.engagementLevel },
    { label: isAr ? "الهاشتاقات" : "Hashtags", value: comp.hashtagStrategy },
    { label: isAr ? "الهوية البصرية" : "Visual Style", value: comp.visualStyle },
    ...(comp.captionStyle ? [{ label: isAr ? "أسلوب الكتابة" : "Caption Style", value: comp.captionStyle }] : []),
    ...(comp.audienceProfile ? [{ label: isAr ? "ملف الجمهور" : "Audience", value: comp.audienceProfile }] : []),
  ];

  return `<div style="width:1120px;min-height:780px;padding:0;background:#F8FBF8;font-family:'Cairo','Plus Jakarta Sans',sans-serif;font-size:14px;line-height:1.5;direction:${dir};box-sizing:border-box;">
    <!-- Header bar -->
    <div style="background:#006C35;padding:14px 48px;display:flex;justify-content:space-between;align-items:center;color:white;">
      <div style="font-size:20px;font-weight:800;">${comp.name} — ${comp.handle} | ${comp.platform}</div>
      <div style="display:flex;align-items:center;gap:16px;">
        <span style="background:${tc.bg};color:${tc.text};padding:4px 12px;border-radius:8px;font-size:12px;font-weight:700;">${isAr ? tc.labelAr : tc.label} (${comp.threatLevel}/10)</span>
        <div style="width:48px;height:48px;border-radius:50%;border:3px solid white;text-align:center;line-height:42px;">
          <span style="font-size:18px;font-weight:800;">${comp.overallScore}</span>
        </div>
      </div>
    </div>

    <div style="padding:20px 48px;">
      ${businessRows.length > 0 ? `
      <!-- Business Intelligence -->
      <h3 style="font-size:15px;font-weight:800;color:#006C35;margin:0 0 10px;">${isAr ? "معلومات الأعمال" : "Business Intelligence"}</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
        ${businessRows.map(r => `<div style="background:white;border:1px solid #D4EBD9;border-radius:10px;padding:10px 14px;">
          <span style="font-size:10px;color:#006C35;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">${r.label}</span>
          <p style="font-size:11px;color:#2D5A3D;margin:3px 0 0;line-height:1.5;">${r.value}</p>
        </div>`).join("")}
      </div>` : ""}

      <div style="display:flex;gap:20px;">
        <!-- Left: Marketing analysis -->
        <div style="flex:1;">
          <h3 style="font-size:14px;font-weight:800;color:#006C35;margin:0 0 8px;">${isAr ? "تحليل المحتوى" : "Content Analysis"}</h3>
          ${marketingRows.map(r => `<div style="margin-bottom:6px;">
            <span style="font-size:10px;color:#5A8A6A;font-weight:600;">${r.label}:</span>
            <p style="font-size:11px;color:#2D5A3D;margin:2px 0 0;line-height:1.5;">${r.value}</p>
          </div>`).join("")}
        </div>

        <!-- Right: Strengths & Weaknesses -->
        <div style="flex:1;">
          <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:10px;padding:10px 12px;margin-bottom:10px;">
            <h4 style="font-size:12px;font-weight:800;color:#006C35;margin:0 0 4px;">${isAr ? "نقاط القوة" : "Strengths"}</h4>
            ${comp.strengths.map(s => `<p style="font-size:10px;color:#2D5A3D;margin:2px 0;line-height:1.4;">+ ${s}</p>`).join("")}
          </div>
          <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:10px;padding:10px 12px;">
            <h4 style="font-size:12px;font-weight:800;color:#DC2626;margin:0 0 4px;">${isAr ? "نقاط الضعف" : "Weaknesses"}</h4>
            ${comp.weakPoints.map(w => `<p style="font-size:10px;color:#2D5A3D;margin:2px 0;line-height:1.4;">- ${w}</p>`).join("")}
          </div>
        </div>
      </div>

      <!-- Key Insight -->
      <div style="margin-top:12px;background:#F0F7F2;border:2px solid #D4EBD9;border-radius:10px;padding:10px 14px;">
        <span style="font-size:10px;font-weight:800;color:#006C35;text-transform:uppercase;letter-spacing:1px;">${isAr ? "الرؤية الرئيسية" : "KEY INSIGHT"}</span>
        <p style="font-size:12px;color:#0A1F0F;margin:4px 0 0;line-height:1.6;">${comp.keyInsight}</p>
      </div>

      ${comp.stealThisMove ? `
      <div style="margin-top:8px;background:rgba(201,168,76,0.08);border:2px solid rgba(201,168,76,0.2);border-radius:10px;padding:10px 14px;">
        <span style="font-size:10px;font-weight:800;color:#C9A84C;text-transform:uppercase;letter-spacing:1px;">${isAr ? "اسرق هذه الحركة" : "STEAL THIS MOVE"}</span>
        <p style="font-size:12px;color:#0A1F0F;margin:4px 0 0;line-height:1.6;">${comp.stealThisMove}</p>
      </div>` : ""}
    </div>

    <div style="padding:8px 48px;font-size:10px;color:#5A8A6A;display:flex;justify-content:space-between;">
      <span>${isAr ? "نواة AI — تقرير تحليل المنافسين" : "Nawaa AI — Competitor Analysis Report"}</span>
      <span>${pageNum}</span>
    </div>
  </div>`;
}

/* ═══ Comparison Matrix Page ═══ */
function renderMatrixPage(data: AnalysisData, locale: Locale, pageNum: number): string {
  const dir = locale === "ar" ? "rtl" : "ltr";
  const isAr = locale === "ar";
  const compNames = Object.keys(data.comparisonMatrix.competitors);

  return `<div style="width:1120px;min-height:780px;padding:0;background:#F8FBF8;font-family:'Cairo','Plus Jakarta Sans',sans-serif;font-size:14px;line-height:1.5;direction:${dir};box-sizing:border-box;">
    <div style="background:#0A1F0F;padding:14px 48px;color:white;">
      <div style="font-size:20px;font-weight:800;">${isAr ? "مصفوفة المقارنة" : "Comparison Matrix"}</div>
    </div>

    <div style="padding:24px 48px;">
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="border-bottom:2px solid #D4EBD9;">
            <th style="text-align:${isAr ? "right" : "left"};padding:8px 12px;font-size:12px;color:#5A8A6A;font-weight:700;">${isAr ? "الفئة" : "Category"}</th>
            <th style="text-align:${isAr ? "right" : "left"};padding:8px 12px;font-size:12px;color:#006C35;font-weight:700;">${isAr ? "علامتك" : "Your Brand"}</th>
            ${compNames.map(n => `<th style="text-align:${isAr ? "right" : "left"};padding:8px 12px;font-size:12px;color:#0A1F0F;font-weight:700;">${n}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${data.comparisonMatrix.categories.map((cat, idx) => `
            <tr style="border-bottom:1px solid rgba(212,235,217,0.5);">
              <td style="padding:10px 12px;font-size:12px;color:#5A8A6A;font-weight:600;">${cat}</td>
              <td style="padding:10px 12px;min-width:140px;">${barHtml(data.comparisonMatrix.yourBrand[idx])}</td>
              ${compNames.map(n => `<td style="padding:10px 12px;min-width:140px;">${barHtml(data.comparisonMatrix.competitors[n][idx])}</td>`).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>

      <!-- Score circles -->
      <div style="display:flex;gap:24px;margin-top:24px;justify-content:center;">
        <div style="text-align:center;">
          <div style="width:72px;height:72px;border-radius:50%;border:4px solid #006C35;text-align:center;line-height:64px;margin:0 auto;">
            <span style="font-size:24px;font-weight:800;color:#0A1F0F;">${data.brandAssessment.overallScore}</span>
          </div>
          <p style="font-size:12px;font-weight:700;color:#006C35;margin-top:6px;">${isAr ? "علامتك" : "Your Brand"}</p>
        </div>
        ${data.competitors.map(c => `<div style="text-align:center;">
          <div style="width:72px;height:72px;border-radius:50%;border:4px solid ${scoreColor(c.overallScore)};text-align:center;line-height:64px;margin:0 auto;">
            <span style="font-size:24px;font-weight:800;color:#0A1F0F;">${c.overallScore}</span>
          </div>
          <p style="font-size:12px;font-weight:700;color:#0A1F0F;margin-top:6px;">${c.name}</p>
        </div>`).join("")}
      </div>
    </div>

    <div style="padding:8px 48px;font-size:10px;color:#5A8A6A;display:flex;justify-content:space-between;">
      <span>${isAr ? "نواة AI — تقرير تحليل المنافسين" : "Nawaa AI — Competitor Analysis Report"}</span>
      <span>${pageNum}</span>
    </div>
  </div>`;
}

/* ═══ Winning Strategy Page ═══ */
function renderStrategyPage(data: AnalysisData, locale: Locale, pageNum: number): string {
  const dir = locale === "ar" ? "rtl" : "ltr";
  const isAr = locale === "ar";

  function actionBlock(actions: StrategyAction[], title: string, color: string) {
    return `<div style="margin-bottom:16px;">
      <h3 style="font-size:15px;font-weight:800;color:${color};margin:0 0 8px;">${title}</h3>
      ${actions.slice(0, 4).map(a => {
        const pc = priorityColor(a.priority);
        return `<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:6px;">
          <div style="flex:1;font-size:12px;color:#2D5A3D;line-height:1.6;">${a.action}</div>
          <span style="background:${pc.bg};color:${pc.text};padding:2px 10px;border-radius:8px;font-size:10px;font-weight:700;white-space:nowrap;">${a.priority}</span>
        </div>`;
      }).join("")}
    </div>`;
  }

  return `<div style="width:1120px;min-height:780px;padding:0;background:#F8FBF8;font-family:'Cairo','Plus Jakarta Sans',sans-serif;font-size:14px;line-height:1.5;direction:${dir};box-sizing:border-box;">
    <div style="background:#0A1F0F;padding:14px 48px;color:white;">
      <div style="font-size:20px;font-weight:800;">${isAr ? "استراتيجية الفوز" : "Winning Strategy"}</div>
    </div>

    <div style="padding:24px 48px;">
      ${actionBlock(data.winningStrategy.immediate, isAr ? "إجراءات فورية (هذا الأسبوع)" : "Immediate Actions (This Week)", "#DC2626")}
      ${actionBlock(data.winningStrategy.shortTerm, isAr ? "قصيرة المدى (2-4 أسابيع)" : "Short-Term (2-4 Weeks)", "#C9A84C")}
      ${actionBlock(data.winningStrategy.longTerm, isAr ? "طويلة المدى (1-3 أشهر)" : "Long-Term (1-3 Months)", "#006C35")}

      <div style="display:flex;gap:24px;margin-top:8px;">
        <!-- Content Gaps -->
        <div style="flex:1;">
          <h3 style="font-size:14px;font-weight:800;color:#C9A84C;margin:0 0 8px;">${isAr ? "فجوات المحتوى" : "Content Gaps"}</h3>
          ${data.winningStrategy.contentGaps.slice(0, 5).map(g => `<p style="font-size:11px;color:#2D5A3D;margin:3px 0;line-height:1.5;">• ${g}</p>`).join("")}
        </div>
        <!-- Differentiators -->
        <div style="flex:1;">
          <h3 style="font-size:14px;font-weight:800;color:#006C35;margin:0 0 8px;">${isAr ? "عوامل التميز" : "Differentiators"}</h3>
          ${data.winningStrategy.differentiators.slice(0, 5).map(d => `<p style="font-size:11px;color:#2D5A3D;margin:3px 0;line-height:1.5;">• ${d}</p>`).join("")}
        </div>
      </div>

      ${data.winningStrategy.quickWins && data.winningStrategy.quickWins.length > 0 ? `
      <div style="margin-top:16px;background:rgba(0,108,53,0.05);border:2px solid #D4EBD9;border-radius:12px;padding:14px 18px;">
        <h3 style="font-size:14px;font-weight:800;color:#C9A84C;margin:0 0 8px;">${isAr ? "مكاسب سريعة" : "Quick Wins"}</h3>
        ${data.winningStrategy.quickWins.slice(0, 4).map((w, i) => `<p style="font-size:12px;color:#0A1F0F;margin:4px 0;line-height:1.6;"><strong>${i + 1}.</strong> ${w}</p>`).join("")}
      </div>` : ""}
    </div>

    <div style="padding:8px 48px;font-size:10px;color:#5A8A6A;display:flex;justify-content:space-between;">
      <span>${isAr ? "نواة AI — تقرير تحليل المنافسين" : "Nawaa AI — Competitor Analysis Report"}</span>
      <span>${pageNum}</span>
    </div>
  </div>`;
}

/* ═══ Saudi Market Insights Page ═══ */
function renderSaudiPage(data: AnalysisData, locale: Locale, pageNum: number): string {
  const dir = locale === "ar" ? "rtl" : "ltr";
  const isAr = locale === "ar";

  return `<div style="width:1120px;min-height:780px;padding:0;background:#F8FBF8;font-family:'Cairo','Plus Jakarta Sans',sans-serif;font-size:14px;line-height:1.5;direction:${dir};box-sizing:border-box;">
    <div style="background:linear-gradient(135deg,#006C35,#00A352);padding:14px 48px;color:white;">
      <div style="font-size:20px;font-weight:800;">${isAr ? "رؤى السوق السعودي" : "Saudi Market Insights"}</div>
    </div>

    <div style="padding:32px 48px;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
        <div style="background:white;border:2px solid #D4EBD9;border-radius:16px;padding:20px;">
          <h3 style="font-size:15px;font-weight:800;color:#006C35;margin:0 0 8px;">${isAr ? "التوافق مع الاتجاهات" : "Trend Alignment"}</h3>
          <p style="font-size:13px;color:#2D5A3D;margin:0;line-height:1.8;">${data.saudiMarketInsights.trendAlignment}</p>
        </div>
        <div style="background:white;border:2px solid #D4EBD9;border-radius:16px;padding:20px;">
          <h3 style="font-size:15px;font-weight:800;color:#006C35;margin:0 0 8px;">${isAr ? "صلة برؤية 2030" : "Vision 2030 Relevance"}</h3>
          <p style="font-size:13px;color:#2D5A3D;margin:0;line-height:1.8;">${data.saudiMarketInsights.vision2030Relevance}</p>
        </div>
        <div style="background:white;border:2px solid #D4EBD9;border-radius:16px;padding:20px;">
          <h3 style="font-size:15px;font-weight:800;color:#006C35;margin:0 0 8px;">${isAr ? "التوافق الثقافي" : "Cultural Fit"}</h3>
          <p style="font-size:13px;color:#2D5A3D;margin:0;line-height:1.8;">${data.saudiMarketInsights.culturalFit}</p>
        </div>
        ${data.saudiMarketInsights.localOpportunities ? `
        <div style="background:white;border:2px solid #D4EBD9;border-radius:16px;padding:20px;">
          <h3 style="font-size:15px;font-weight:800;color:#006C35;margin:0 0 8px;">${isAr ? "فرص محلية" : "Local Opportunities"}</h3>
          <p style="font-size:13px;color:#2D5A3D;margin:0;line-height:1.8;">${data.saudiMarketInsights.localOpportunities}</p>
        </div>` : ""}
      </div>

      ${data.saudiMarketInsights.ramadanStrategy ? `
      <div style="margin-top:20px;background:linear-gradient(135deg,rgba(0,108,53,0.05),rgba(201,168,76,0.08));border:2px solid rgba(201,168,76,0.2);border-radius:16px;padding:20px;">
        <h3 style="font-size:15px;font-weight:800;color:#C9A84C;margin:0 0 8px;">${isAr ? "استراتيجية رمضان" : "Ramadan Strategy"}</h3>
        <p style="font-size:13px;color:#2D5A3D;margin:0;line-height:1.8;">${data.saudiMarketInsights.ramadanStrategy}</p>
      </div>` : ""}
    </div>

    <div style="padding:8px 48px;font-size:10px;color:#5A8A6A;display:flex;justify-content:space-between;">
      <span>${isAr ? "نواة AI — تقرير تحليل المنافسين" : "Nawaa AI — Competitor Analysis Report"}</span>
      <span>${pageNum}</span>
    </div>
  </div>`;
}

/* ═══ Industry Analysis Page ═══ */
function renderIndustryPage(data: AnalysisData, locale: Locale, pageNum: number): string {
  if (!data.industryAnalysis) return "";
  const dir = locale === "ar" ? "rtl" : "ltr";
  const isAr = locale === "ar";
  const ia = data.industryAnalysis;

  return `<div style="width:1120px;min-height:780px;padding:0;background:#F8FBF8;font-family:'Cairo','Plus Jakarta Sans',sans-serif;font-size:14px;line-height:1.5;direction:${dir};box-sizing:border-box;">
    <div style="background:#0A1F0F;padding:14px 48px;color:white;">
      <div style="font-size:20px;font-weight:800;">${isAr ? "تحليل الصناعة" : "Industry Analysis"}</div>
    </div>

    <div style="padding:32px 48px;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
        <div style="background:white;border:2px solid #D4EBD9;border-radius:16px;padding:20px;">
          <h3 style="font-size:15px;font-weight:800;color:#006C35;margin:0 0 8px;">${isAr ? "نظرة عامة على السوق" : "Market Overview"}</h3>
          <p style="font-size:13px;color:#2D5A3D;margin:0;line-height:1.8;">${ia.marketOverview}</p>
        </div>
        <div style="background:white;border:2px solid #D4EBD9;border-radius:16px;padding:20px;">
          <h3 style="font-size:15px;font-weight:800;color:#006C35;margin:0 0 8px;">${isAr ? "المشهد التنافسي" : "Competitive Landscape"}</h3>
          <p style="font-size:13px;color:#2D5A3D;margin:0;line-height:1.8;">${ia.competitiveLandscape}</p>
        </div>
        <div style="background:white;border:2px solid #D4EBD9;border-radius:16px;padding:20px;">
          <h3 style="font-size:15px;font-weight:800;color:#006C35;margin:0 0 8px;">${isAr ? "اتجاهات المستهلكين" : "Consumer Trends"}</h3>
          <p style="font-size:13px;color:#2D5A3D;margin:0;line-height:1.8;">${ia.consumerTrends}</p>
        </div>
        <div style="background:white;border:2px solid #D4EBD9;border-radius:16px;padding:20px;">
          <h3 style="font-size:15px;font-weight:800;color:#006C35;margin:0 0 8px;">${isAr ? "التوقعات المستقبلية" : "Future Outlook"}</h3>
          <p style="font-size:13px;color:#2D5A3D;margin:0;line-height:1.8;">${ia.futureOutlook}</p>
        </div>
      </div>
    </div>

    <div style="padding:8px 48px;font-size:10px;color:#5A8A6A;display:flex;justify-content:space-between;">
      <span>${isAr ? "نواة AI — تقرير تحليل المنافسين" : "Nawaa AI — Competitor Analysis Report"}</span>
      <span>${pageNum}</span>
    </div>
  </div>`;
}

/* ═══ Render HTML to PDF page via html2canvas ═══ */
async function addHtmlPage(pdf: jsPDF, html: string, isFirst: boolean) {
  if (!isFirst) pdf.addPage();

  const div = document.createElement("div");
  div.style.cssText = "position:fixed;left:-9999px;top:0;";
  div.innerHTML = html;
  document.body.appendChild(div);

  try {
    const canvas = await html2canvas(div, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#F8FBF8",
      logging: false,
    });
    const imgData = canvas.toDataURL("image/png");
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pdfW / canvas.width, pdfH / canvas.height) * 0.95;
    const w = canvas.width * ratio;
    const h = canvas.height * ratio;
    pdf.addImage(imgData, "PNG", (pdfW - w) / 2, (pdfH - h) / 2, w, h);
  } finally {
    document.body.removeChild(div);
  }
}

/* ═══ Main export function ═══ */
export async function exportCompetitorPdf(
  data: AnalysisData,
  companyName: string,
  competitors: Competitor[],
  locale: Locale
) {
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  let pageNum = 1;

  // Page 1: Cover + Executive Summary + Brand Assessment
  await addHtmlPage(pdf, renderCoverPage(data, companyName, locale), true);

  // Pages 2-N: One per competitor
  for (const comp of data.competitors) {
    pageNum++;
    await addHtmlPage(pdf, renderCompetitorPage(comp, locale, pageNum), false);
  }

  // Comparison Matrix page
  pageNum++;
  await addHtmlPage(pdf, renderMatrixPage(data, locale, pageNum), false);

  // Winning Strategy page
  pageNum++;
  await addHtmlPage(pdf, renderStrategyPage(data, locale, pageNum), false);

  // Industry Analysis page (if available)
  if (data.industryAnalysis) {
    pageNum++;
    await addHtmlPage(pdf, renderIndustryPage(data, locale, pageNum), false);
  }

  // Saudi Market Insights page
  pageNum++;
  await addHtmlPage(pdf, renderSaudiPage(data, locale, pageNum), false);

  pdf.save(`NawaaAI-CompetitorAnalysis-${companyName.replace(/\s+/g, "-")}.pdf`);
}
