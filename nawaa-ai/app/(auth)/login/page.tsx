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

const patternSvg = (
  <svg className="absolute inset-0 h-full w-full opacity-[0.06]" viewBox="0 0 100 100" preserveAspectRatio="none">
    <defs>
      <pattern id="islamic-login" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M10 0 L20 10 L10 20 L0 10 Z" fill="currentColor" className="text-[#C9A84C]" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#islamic-login)" />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const { locale, setLocale } = useAppStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      <div className="relative hidden w-1/2 flex-col justify-center bg-[#020B05] lg:flex">
        {patternSvg}
        <div className="relative z-10 px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold"
          >
            <span className="bg-gradient-to-l from-[#C9A84C] to-[#E8D5A0] bg-clip-text text-transparent">
              {locale === "ar" ? "نواة" : "Nawaa"}
            </span>
            <span className="text-[#D0EBDA]"> AI</span>
          </motion.div>
          <p className="mt-4 max-w-sm text-[#7B9E86]">{messages[locale].landing.heroSub}</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-center bg-[#0B1A0F] px-6 py-12 lg:px-16">
        <div className="absolute end-4 top-4 lg:end-8 lg:top-8">
          <button
            type="button"
            onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
            className="rounded-lg border border-[#172E1F] px-3 py-1.5 text-sm font-medium text-[#D0EBDA] hover:bg-[#172E1F]"
          >
            {locale === "ar" ? "English" : "العربية"}
          </button>
        </div>
        <motion.div
          initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mx-auto w-full max-w-md"
        >
          <h1 className="text-2xl font-bold text-[#D0EBDA]">{t.welcomeBack}</h1>
          <p className="mt-1 text-sm text-[#7B9E86]">{t.signInContinue}</p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <Label className="text-[#D0EBDA]">{t.email}</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 border-[#172E1F] bg-[#020B05] text-[#D0EBDA] placeholder:text-[#7B9E86]"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <Label className="text-[#D0EBDA]">{t.password}</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 border-[#172E1F] bg-[#020B05] text-[#D0EBDA]"
                placeholder="••••••••"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#006C35] hover:bg-[#00A352] text-white"
            >
              {loading ? "..." : t.signIn}
            </Button>
          </form>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#172E1F]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#0B1A0F] px-2 text-[#7B9E86]">{t.or}</span>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full border-[#172E1F] text-[#D0EBDA] hover:bg-[#172E1F]"
          >
            {t.continueGoogle}
          </Button>
          <p className="mt-6 text-center text-sm text-[#7B9E86]">
            {t.noAccount}{" "}
            <Link href="/signup" className="text-[#00A352] hover:underline">
              {t.signUp}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
