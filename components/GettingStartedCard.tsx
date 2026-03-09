"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, Calendar, ImageIcon, Hash, Check, X, ArrowRight } from "lucide-react";
import { messages, type Locale } from "@/lib/i18n";

type Props = {
  stats: { companies: number; plans: number; images: number };
  locale: Locale;
};

export default function GettingStartedCard({ stats, locale }: Props) {
  const t = messages[locale].gettingStarted;
  const isRtl = locale === "ar";
  const [dismissed, setDismissed] = useState(false);
  const [triedHashtags, setTriedHashtags] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDismissed(localStorage.getItem("nawaa-getting-started-dismissed") === "true");
      setTriedHashtags(localStorage.getItem("nawaa-tried-hashtags") === "true");
    }
  }, []);

  const items = [
    { done: stats.companies > 0, label: t.addCompany, desc: t.addCompanyDesc, href: "/companies", icon: Building2, color: "text-[#006C35]", onClick: undefined as (() => void) | undefined },
    { done: stats.plans > 0, label: t.generatePlan, desc: t.generatePlanDesc, href: "/planner", icon: Calendar, color: "text-[#7C3AED]", onClick: undefined },
    { done: stats.images > 0, label: t.createVisual, desc: t.createVisualDesc, href: "/vision-studio", icon: ImageIcon, color: "text-[#8B5CF6]", onClick: undefined },
    { done: triedHashtags, label: t.tryHashtags, desc: t.tryHashtagsDesc, href: "/hashtags", icon: Hash, color: "text-blue-500", onClick: () => { localStorage.setItem("nawaa-tried-hashtags", "true"); setTriedHashtags(true); } },
  ];

  const completedCount = items.filter((i) => i.done).length;
  const allDone = completedCount === 4;

  if (dismissed || allDone) return null;

  const handleDismiss = () => {
    localStorage.setItem("nawaa-getting-started-dismissed", "true");
    setDismissed(true);
  };

  const progress = (completedCount / 4) * 100;

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="rounded-xl border border-[#D4EBD9] bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-[#D4EBD9]">
        <div>
          <h2 className="text-xl font-bold text-[#004D26]">{t.title}</h2>
          <p className="text-sm text-[#5A8A6A] mt-0.5">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-[#006C35]">
            {completedCount}/4 {t.completed}
          </span>
          <button
            type="button"
            onClick={handleDismiss}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5A8A6A] hover:bg-[#F0F7F2] hover:text-[#006C35] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-[#F0F7F2]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#006C35] to-[#00A352] transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Checklist */}
      <div className="p-5 space-y-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={item.onClick}
            className={`flex items-center gap-4 rounded-xl p-4 transition-all ${
              item.done
                ? "bg-[#F0F7F2]/50 opacity-70"
                : "border border-[#D4EBD9] hover:border-[#006C35]/40 hover:bg-[#F8FBF8]"
            }`}
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              item.done ? "bg-[#006C35]" : "bg-[#F0F7F2]"
            }`}>
              {item.done ? (
                <Check className="h-5 w-5 text-white" />
              ) : (
                <item.icon className={`h-5 w-5 ${item.color}`} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold ${item.done ? "text-[#5A8A6A] line-through" : "text-[#004D26]"}`}>
                {item.label}
              </p>
              <p className="text-xs text-[#5A8A6A] mt-0.5">{item.desc}</p>
            </div>
            {!item.done && (
              <ArrowRight className={`h-4 w-4 shrink-0 text-[#5A8A6A] ${isRtl ? "rotate-180" : ""}`} />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
