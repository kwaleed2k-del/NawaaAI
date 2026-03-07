"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

export default function InsightsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-cairo text-2xl font-bold text-[#D0EBDA]">Insights</h1>
        <p className="text-sm text-[#7B9E86]">Analytics and performance overview</p>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center rounded-2xl glass py-24"
      >
        <div className="relative">
          <TrendingUp className="h-16 w-16 text-[#C9A84C]/50" />
          <div className="absolute inset-0 animate-glow-pulse rounded-full" />
        </div>
        <p className="mt-6 text-xl font-semibold text-gradient-gold">Coming Soon</p>
        <p className="mt-2 max-w-sm text-center text-sm text-[#7B9E86]">
          Performance metrics, engagement trends, and content analytics will appear here.
        </p>
      </motion.div>
    </div>
  );
}
