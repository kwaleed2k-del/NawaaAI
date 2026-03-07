"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/auth-actions";
import { createClient } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";
import { messages } from "@/lib/i18n";
import { IslamicPattern } from "@/components/IslamicPattern";
import toast from "react-hot-toast";
import { Sparkles } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { locale, setLocale } = useAppStore();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [terms, setTerms] = useState(false);
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error(t.passwordsDontMatch);
      return;
    }
    if (!terms) {
      toast.error(t.acceptTerms);
      return;
    }
    setLoading(true);
    const result = await signUp(email, password, fullName);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(t.signUpSuccess);
    router.push("/companies");
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
      <div className="relative hidden w-1/2 flex-col justify-center overflow-hidden bg-gradient-to-br from-[#020B05] via-[#0B1A0F] to-[#061A0D] lg:flex">
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-1/3 left-1/4 h-[350px] w-[350px] rounded-full bg-[#006C35]/15 blur-[120px]"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/3 h-[250px] w-[250px] rounded-full bg-[#C9A84C]/10 blur-[100px]"
          animate={{
            scale: [1, 1.15, 1],
            x: [0, -20, 0],
            y: [0, 25, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Islamic pattern overlay */}
        <IslamicPattern variant="arabesque" opacity={0.04} animated />

        {/* Floating geometric shapes */}
        <motion.div
          className="absolute top-[15%] right-[20%] h-16 w-16 rounded-md border border-[#C9A84C]/10"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ transform: "rotate(45deg)" }}
        />
        <motion.div
          className="absolute bottom-[20%] left-[15%] h-12 w-12 rounded-full border border-[#006C35]/15"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Content */}
        <div className="relative z-10 px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-4"
          >
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#C9A84C] to-[#E8D5A0] flex items-center justify-center shadow-[0_8px_24px_rgba(201,168,76,0.3)]">
              <Sparkles className="h-8 w-8 text-[#020B05]" />
            </div>
            <div>
              <span className="text-gradient-gold text-4xl font-bold">
                {locale === "ar" ? "نواة" : "Nawaa"}
              </span>
              <span className="text-[#D0EBDA] text-4xl font-bold"> AI</span>
            </div>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 max-w-sm text-lg text-[#7B9E86]"
          >
            {messages[locale].auth.joinNawaa}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-2 max-w-xs text-base text-[#7B9E86]/60"
          >
            {locale === "ar"
              ? "ابدأ رحلتك مع منصة الذكاء الاصطناعي المتقدمة"
              : "Start your journey with the advanced AI platform"}
          </motion.p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="relative flex flex-1 flex-col justify-center bg-[#0B1A0F]/80 px-6 py-12 lg:px-16">
        <div className="absolute end-4 top-4 lg:end-8 lg:top-8 z-10">
          <button
            type="button"
            onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
            className="glass rounded-lg border border-[#172E1F] px-3 py-1.5 text-sm font-medium text-[#D0EBDA] transition-all duration-300 hover:bg-[#172E1F] hover:border-[#C9A84C]/20"
          >
            {locale === "ar" ? "English" : "العربية"}
          </button>
        </div>
        <motion.div
          initial={{ opacity: 0, x: isRtl ? -30 : 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto w-full max-w-md"
        >
          <div className="glass rounded-2xl p-10">
            <h1 className="text-3xl font-bold text-[#D0EBDA]">{t.joinNawaa}</h1>
            <p className="mt-2 text-base text-[#7B9E86]">{t.createAccount}</p>
            <form onSubmit={handleSubmit} className="mt-10 space-y-5">
              <div>
                <Label className="text-base font-medium text-[#D0EBDA]">{t.fullName}</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="mt-2 h-12 border-[#172E1F] bg-[#020B05]/80 text-[#D0EBDA] text-base transition-all duration-300 focus:border-[#006C35] focus:shadow-[0_0_15px_rgba(0,108,53,0.15)]"
                  placeholder={locale === "ar" ? "الاسم الكامل" : "Your name"}
                />
              </div>
              <div>
                <Label className="text-base font-medium text-[#D0EBDA]">{t.email}</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-2 h-12 border-[#172E1F] bg-[#020B05]/80 text-[#D0EBDA] text-base transition-all duration-300 focus:border-[#006C35] focus:shadow-[0_0_15px_rgba(0,108,53,0.15)]"
                  placeholder="you@company.com"
                />
              </div>
              <div>
                <Label className="text-base font-medium text-[#D0EBDA]">{t.password}</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="mt-2 h-12 border-[#172E1F] bg-[#020B05]/80 text-[#D0EBDA] text-base transition-all duration-300 focus:border-[#006C35] focus:shadow-[0_0_15px_rgba(0,108,53,0.15)]"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <Label className="text-base font-medium text-[#D0EBDA]">{t.confirmPassword}</Label>
                <Input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className="mt-2 h-12 border-[#172E1F] bg-[#020B05]/80 text-[#D0EBDA] text-base transition-all duration-300 focus:border-[#006C35] focus:shadow-[0_0_15px_rgba(0,108,53,0.15)]"
                  placeholder="••••••••"
                />
              </div>
              <label className="flex items-center gap-3 text-base text-[#7B9E86]">
                <input
                  type="checkbox"
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                  className="h-4 w-4 rounded border-[#172E1F] bg-[#020B05]"
                />
                {t.agreeTerms}
              </label>
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[#006C35] to-[#00A352] text-white transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,108,53,0.3)]"
              >
                {loading ? "..." : t.signUp}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-transparent bg-gradient-to-r from-transparent via-[#C9A84C]/20 to-transparent h-px" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="glass rounded-full px-3 py-1 text-[#7B9E86]">{t.or}</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogle}
              disabled={loading}
              className="w-full h-12 text-base border-[#172E1F] text-[#D0EBDA] transition-all duration-300 hover:border-[#C9A84C]/30 hover:bg-[#C9A84C]/5"
            >
              {t.continueGoogle}
            </Button>
            <p className="mt-8 text-center text-base text-[#7B9E86]">
              {t.hasAccount}{" "}
              <Link href="/login" className="text-[#00A352] font-medium hover:underline">
                {t.signIn}
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
