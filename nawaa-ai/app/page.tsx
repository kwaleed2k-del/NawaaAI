"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect } from "react";
import {
  Brain,
  Calendar,
  Palette,
  Globe,
  Target,
  Download,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { messages } from "@/lib/i18n";

const BG = "#020B05";
const SURFACE = "#0B1A0F";
const BORDER = "#172E1F";
const PRIMARY = "#006C35";
const GREEN_LIGHT = "#00A352";
const GOLD = "#C9A84C";
const TEXT = "#D0EBDA";
const MUTED = "#7B9E86";

const islamicStarPattern = (
  <svg
    className="absolute inset-0 h-full w-full opacity-[0.06]"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern
        id="star"
        width="80"
        height="80"
        patternUnits="userSpaceOnUse"
      >
        <path
          d="M40 0 L48 28 L76 28 L54 46 L62 74 L40 56 L18 74 L26 46 L4 28 L32 28 Z"
          fill={GOLD}
          fillOpacity="0.4"
        />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#star)" />
  </svg>
);

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const stagger = {
  whileInView: { transition: { staggerChildren: 0.08 } },
  viewport: { once: true },
};

const featureKeys = [
  { title: "feature1Title" as const, desc: "feature1Desc" as const, icon: Brain },
  { title: "feature2Title" as const, desc: "feature2Desc" as const, icon: Calendar },
  { title: "feature3Title" as const, desc: "feature3Desc" as const, icon: Palette },
  { title: "feature4Title" as const, desc: "feature4Desc" as const, icon: Globe },
  { title: "feature5Title" as const, desc: "feature5Desc" as const, icon: Target },
  { title: "feature6Title" as const, desc: "feature6Desc" as const, icon: Download },
];

export default function LandingPage() {
  const { locale, setLocale } = useAppStore();

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("nawaa-locale") : null;
    if (stored === "en" || stored === "ar") setLocale(stored);
  }, [setLocale]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  const L = messages[locale].landing;
  const N = messages[locale].nav;
  const isRtl = locale === "ar";

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ backgroundColor: BG, color: TEXT }}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Navbar */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 z-50 w-full border-b"
        style={{ borderColor: BORDER, backgroundColor: `${BG}ee` }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span
              className="text-xl font-bold"
              style={{
                background: `linear-gradient(135deg, ${GOLD}, ${GREEN_LIGHT})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {locale === "ar" ? "نواة" : "Nawaa"} AI
            </span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="#features" className="text-sm hover:opacity-90" style={{ color: MUTED }}>
              {N.features}
            </Link>
            <Link href="#pricing" className="text-sm hover:opacity-90" style={{ color: MUTED }}>
              {N.pricing}
            </Link>
            <Link href="#about" className="text-sm hover:opacity-90" style={{ color: MUTED }}>
              {N.about}
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
              className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:opacity-90"
              style={{ borderColor: BORDER, color: TEXT }}
            >
              {locale === "ar" ? "English" : "العربية"}
            </button>
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-[#D0EBDA] hover:bg-white/5"
              >
                {N.login}
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                className="rounded-lg font-medium"
                style={{ backgroundColor: PRIMARY, color: "#fff" }}
              >
                {N.signUp}
              </Button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-24 pb-16">
        {islamicStarPattern}
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl"
            style={{ fontFamily: "var(--font-cairo)" }}
          >
            {L.heroTitle}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg sm:text-xl"
            style={{ color: MUTED }}
          >
            {L.heroSub}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <Link href="/signup">
              <Button
                size="lg"
                className="rounded-xl px-8"
                style={{ backgroundColor: PRIMARY, color: "#fff" }}
              >
                {L.startFree}
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="rounded-xl border-2 px-8"
              style={{ borderColor: GOLD, color: GOLD }}
            >
              {L.watchDemo}
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3"
          >
            {[
              { value: "500+", label: L.brands },
              { value: "50K+", label: L.postsGenerated },
              { value: "10x", label: L.faster },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="rounded-2xl border p-6"
                style={{ borderColor: BORDER, backgroundColor: SURFACE }}
              >
                <div className="text-2xl font-bold" style={{ color: GOLD }}>
                  {stat.value}
                </div>
                <div className="text-sm" style={{ color: MUTED }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.h2
            {...fadeUp}
            className="mb-12 text-center text-3xl font-bold"
            style={{ color: TEXT }}
          >
            {L.featuresTitle}
          </motion.h2>
          <motion.div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            variants={stagger}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
          >
            {featureKeys.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                className="rounded-2xl border p-6 transition-transform hover:-translate-y-1"
                style={{ borderColor: BORDER, backgroundColor: SURFACE }}
              >
                <f.icon className="h-10 w-10" style={{ color: GREEN_LIGHT }} />
                <h3 className="mt-4 text-lg font-semibold">{L[f.title]}</h3>
                <p className="mt-2 text-sm" style={{ color: MUTED }}>
                  {L[f.desc]}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-24" style={{ backgroundColor: SURFACE }}>
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold">{L.howItWorksTitle}</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              { step: "1", title: L.addCompany, desc: L.addCompanyDesc },
              { step: "2", title: L.generatePlan, desc: L.generatePlanDesc },
              { step: "3", title: L.downloadPost, desc: L.downloadPostDesc },
            ].map((s) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="rounded-2xl border p-6"
                style={{ borderColor: BORDER }}
              >
                <div
                  className="mx-auto flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold"
                  style={{ backgroundColor: PRIMARY, color: "#fff" }}
                >
                  {s.step}
                </div>
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm" style={{ color: MUTED }}>
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-xl font-semibold" style={{ color: MUTED }}>
            {L.platformTitle}
          </h2>
          <div className="mt-6 flex flex-wrap justify-center gap-6">
            {["Instagram", "TikTok", "Snapchat", "X", "LinkedIn", "YouTube"].map(
              (p) => (
                <span
                  key={p}
                  className="rounded-full border px-4 py-2 text-sm"
                  style={{ borderColor: BORDER, color: MUTED }}
                >
                  {p}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold">{L.pricingTitle}</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { name: L.freeName, price: L.freePrice, desc: L.freeDesc, cta: L.freeCta },
              { name: L.proName, price: L.proPrice, desc: L.proDesc, cta: L.proCta, highlight: true },
              { name: L.agencyName, price: L.agencyPrice, desc: L.agencyDesc, cta: L.agencyCta },
            ].map((tier) => (
              <motion.div
                key={tier.name}
                whileHover={{ y: -4 }}
                className="rounded-2xl border p-8"
                style={{
                  borderColor: tier.highlight ? GOLD : BORDER,
                  backgroundColor: SURFACE,
                  boxShadow: tier.highlight ? `0 0 0 1px ${GOLD}40` : undefined,
                }}
              >
                <h3 className="text-xl font-bold">{tier.name}</h3>
                <div className="mt-2 text-2xl font-bold" style={{ color: GOLD }}>
                  {tier.price}
                </div>
                <p className="mt-2 text-sm" style={{ color: MUTED }}>
                  {tier.desc}
                </p>
                <Button
                  className="mt-6 w-full rounded-xl"
                  style={{
                    backgroundColor: tier.highlight ? GOLD : PRIMARY,
                    color: "#020B05",
                  }}
                >
                  {tier.cta}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        id="about"
        className="border-t px-4 py-12"
        style={{ borderColor: BORDER, backgroundColor: BG }}
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" style={{ color: GOLD }} />
            <span className="font-semibold">{locale === "ar" ? "نواة" : "Nawaa"} AI</span>
          </div>
          <p className="text-center text-sm" style={{ color: MUTED }}>
            {L.footerTagline}
          </p>
          <div className="flex gap-4">
            <Link href="/login" className="text-sm" style={{ color: MUTED }}>
              {N.login}
            </Link>
            <Link href="/signup" className="text-sm" style={{ color: MUTED }}>
              {N.signUp}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
