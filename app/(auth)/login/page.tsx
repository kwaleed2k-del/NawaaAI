"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth-actions";
import { createClient } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";
import { messages } from "@/lib/i18n";
import toast from "react-hot-toast";
import { Sparkles, Eye, EyeOff, Building2, FileText, Zap, ArrowLeft, ArrowRight, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { locale, setLocale } = useAppStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("nawaa-locale") : null;
    if (stored === "en" || stored === "ar") setLocale(stored);
  }, [setLocale]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  const t = messages[locale].auth;
  const isRtl = locale === "ar";
  const BackArrow = isRtl ? ArrowRight : ArrowLeft;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(t.signInSuccess);
    router.push("/dashboard");
    router.refresh();
  }

  async function handleGoogle() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setLoading(false);
      toast.error(error.message);
    }
  }

  return (
    <div className="flex min-h-screen" dir={isRtl ? "rtl" : "ltr"}>
      {/* Left panel - branding */}
      <div className="relative hidden w-1/2 flex-col justify-center overflow-hidden lg:flex" style={{ background: "linear-gradient(135deg, #006C35 0%, #004D26 50%, #003318 100%)" }}>
        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 h-[400px] w-[400px] rounded-full bg-[#00A352]/20 blur-[100px]" />
        <div className="absolute -bottom-20 -left-20 h-[350px] w-[350px] rounded-full bg-[#C9A84C]/15 blur-[100px]" />
        <div className="absolute top-[30%] right-[10%] h-[200px] w-[200px] rounded-full bg-[#C9A84C]/10 blur-[60px]" />
        <motion.div
          className="absolute top-[10%] right-[15%] h-24 w-24 rounded-2xl border border-white/10"
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-[15%] left-[10%] h-20 w-20 rounded-full border border-white/10"
          animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-[60%] right-[25%] h-12 w-12 rounded-lg border border-[#C9A84C]/20"
          animate={{ y: [0, -20, 0], rotate: [0, 45, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Floating emojis */}
        <div className="absolute top-8 right-12 flex gap-3">
          {["\u{1F680}", "\u2728", "\u{1F1F8}\u{1F1E6}"].map((em, i) => (
            <motion.span
              key={i}
              animate={{ y: [0, -8, 0], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.5 }}
              className="text-3xl"
            >
              {em}
            </motion.span>
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 px-16 xl:px-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex items-center gap-5"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="h-24 w-24 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.1)]"
            >
              <Sparkles className="h-12 w-12 text-white" />
            </motion.div>
            <div>
              <span className="text-6xl xl:text-7xl font-extrabold text-white font-['Cairo']">
                {t.brandName}
              </span>
              <span className="text-6xl xl:text-7xl font-extrabold text-[#C9A84C]"> AI</span>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-8 max-w-lg text-2xl text-white/80 leading-relaxed font-medium"
          >
            {t.brandTagline}
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="mt-16 flex gap-8"
          >
            {[
              { value: "500+", label: t.statBrands, icon: Building2 },
              { value: "10K+", label: t.statPosts, icon: FileText },
              { value: "3x", label: t.statFaster, icon: Zap },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="h-16 w-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/10">
                  <stat.icon className="h-8 w-8 text-white/90" />
                </div>
                <div>
                  <p className="text-4xl font-extrabold text-white">{stat.value}</p>
                  <p className="text-lg text-white/60 font-medium">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Bottom tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-0 right-0 text-center"
        >
          <p className="text-lg text-white/40 font-medium">{messages[locale].landing.footerTagline}</p>
        </motion.div>
      </div>

      {/* Right panel - form */}
      <div className="relative flex flex-1 flex-col justify-center bg-[#F8FBF8] px-8 py-16 lg:px-16 xl:px-24">
        {/* Top bar: back arrow + language */}
        <div className="absolute start-6 top-6 lg:start-10 lg:top-10 z-10">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-2xl border-2 border-[#D4EBD9] bg-white px-5 py-3 text-lg font-bold text-[#004D26] hover:bg-[#F0F7F2] hover:border-[#00A352] hover:shadow-lg transition-all"
          >
            <BackArrow className="h-5 w-5" />
            {locale === "ar" ? "الرئيسية" : "Home"}
          </Link>
        </div>
        <div className="absolute end-6 top-6 lg:end-10 lg:top-10 z-10">
          <button
            type="button"
            onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
            className="rounded-2xl border-2 border-[#D4EBD9] bg-white px-5 py-3 text-lg font-bold text-[#2D5A3D] transition-all hover:bg-[#F0F7F2] hover:border-[#00A352] hover:shadow-lg"
          >
            {locale === "ar" ? "English" : "\u0627\u0644\u0639\u0631\u0628\u064a\u0629"}
          </button>
        </div>

        {/* Mobile logo */}
        <div className="mb-10 flex items-center gap-4 lg:hidden">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#006C35] to-[#00A352] flex items-center justify-center shadow-lg">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <span className="text-4xl font-extrabold text-[#004D26] font-['Cairo']">
            {t.brandName} <span className="text-[#00A352]">AI</span>
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto w-full max-w-xl"
        >
          <div className="relative rounded-3xl bg-white border-2 border-[#D4EBD9] p-10 md:p-14 shadow-[0_20px_60px_rgba(0,108,53,0.08)] overflow-hidden">
            {/* Top gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#006C35] via-[#00A352] to-[#C9A84C]" />

            {/* Decorative corner glow */}
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[#006C35]/5 blur-2xl" />
            <div className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-[#C9A84C]/5 blur-2xl" />

            <div className="relative z-10">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-5xl font-extrabold text-[#004D26] font-['Cairo']"
              >
                {t.welcomeBack}
              </motion.h1>
              <p className="mt-3 text-xl text-[#5A8A6A] font-medium">{t.signInContinue}</p>

              <form onSubmit={handleSubmit} className="mt-10 space-y-7">
                <div>
                  <Label className="text-lg font-bold text-[#004D26] mb-2 block">{t.email}</Label>
                  <div className="relative">
                    <Mail className={`absolute top-1/2 -translate-y-1/2 h-6 w-6 text-[#5A8A6A] ${isRtl ? "right-5" : "left-5"}`} />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={`h-16 rounded-2xl border-2 border-[#D4EBD9] bg-[#F8FBF8] text-[#0A1F0F] placeholder:text-[#5A8A6A]/50 text-lg font-medium transition-all focus:border-[#006C35] focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,108,53,0.08)] ${isRtl ? "pr-14 pl-5" : "pl-14 pr-5"}`}
                      placeholder="you@company.com"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-lg font-bold text-[#004D26] mb-2 block">{t.password}</Label>
                  <div className="relative">
                    <Lock className={`absolute top-1/2 -translate-y-1/2 h-6 w-6 text-[#5A8A6A] ${isRtl ? "right-5" : "left-5"}`} />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className={`h-16 rounded-2xl border-2 border-[#D4EBD9] bg-[#F8FBF8] text-[#0A1F0F] text-lg font-medium transition-all focus:border-[#006C35] focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,108,53,0.08)] ${isRtl ? "pr-14 pl-14" : "pl-14 pr-14"}`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute top-1/2 -translate-y-1/2 text-[#5A8A6A] hover:text-[#006C35] transition-colors p-1 ${isRtl ? "left-4" : "right-4"}`}
                    >
                      {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                    </button>
                  </div>
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="relative w-full h-16 text-xl font-extrabold rounded-2xl text-white bg-gradient-to-r from-[#006C35] to-[#00A352] shadow-[0_8px_30px_rgba(0,108,53,0.35)] hover:shadow-[0_12px_40px_rgba(0,108,53,0.45)] transition-all overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite] pointer-events-none" />
                    {loading ? (
                      <div className="h-7 w-7 animate-spin rounded-full border-3 border-white/30 border-t-white" />
                    ) : (
                      t.signIn
                    )}
                  </Button>
                </motion.div>
              </form>

              {/* Divider */}
              <div className="relative my-10">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-[#D4EBD9] to-transparent" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-6 text-lg font-semibold text-[#5A8A6A]">{t.or}</span>
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogle}
                  disabled={loading}
                  className="w-full h-16 text-xl font-bold rounded-2xl border-2 border-[#D4EBD9] bg-white text-[#0A1F0F] transition-all hover:border-[#00A352] hover:bg-[#F0F7F2] hover:shadow-lg"
                >
                  <svg className="h-7 w-7 me-3" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  {t.continueGoogle}
                </Button>
              </motion.div>

              <p className="mt-10 text-center text-xl text-[#5A8A6A]">
                {t.noAccount}{" "}
                <Link href="/signup" className="text-[#006C35] font-extrabold hover:underline hover:text-[#00A352] transition-colors">
                  {t.signUp}
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
