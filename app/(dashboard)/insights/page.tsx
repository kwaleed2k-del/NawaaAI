"use client";

import { motion, type Variants } from "framer-motion";
import { TrendingUp, BarChart3, PieChart, Activity, Sparkles } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { messages } from "@/lib/i18n";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

export default function InsightsPage() {
  const { locale } = useAppStore();
  const ti = messages[locale].insights;

  const metricCards = [
    {
      icon: BarChart3,
      label: ti.engagement,
      gradient: "from-[#006C35] to-[#00A352]",
      iconBg: "from-[#006C35]/20 to-[#00A352]/20",
      barColor: "from-[#006C35] to-[#00A352]",
      shadowColor: "hover:shadow-[0_20px_50px_-12px_rgba(0,108,53,0.35)]",
      barWidth: "65%",
    },
    {
      icon: PieChart,
      label: ti.reach,
      gradient: "from-[#C9A84C] to-[#E8C84C]",
      iconBg: "from-[#C9A84C]/20 to-[#E8C84C]/20",
      barColor: "from-[#C9A84C] to-[#E8C84C]",
      shadowColor: "hover:shadow-[0_20px_50px_-12px_rgba(201,168,76,0.35)]",
      barWidth: "55%",
    },
    {
      icon: Activity,
      label: ti.growth,
      gradient: "from-[#8B5CF6] to-[#A78BFA]",
      iconBg: "from-[#8B5CF6]/20 to-[#A78BFA]/20",
      barColor: "from-[#8B5CF6] to-[#A78BFA]",
      shadowColor: "hover:shadow-[0_20px_50px_-12px_rgba(139,92,246,0.35)]",
      barWidth: "70%",
    },
  ];

  const featureCards = [
    {
      icon: BarChart3,
      title: locale === "ar" ? "أداء المحتوى" : "Content Performance",
      description:
        locale === "ar"
          ? "تتبع أداء منشوراتك عبر جميع المنصات"
          : "Track how your posts perform across all platforms",
      gradient: "from-[#006C35] to-[#00A352]",
      accentBar: "from-[#006C35] to-[#00A352]",
    },
    {
      icon: TrendingUp,
      title: locale === "ar" ? "نمو الجمهور" : "Audience Growth",
      description:
        locale === "ar"
          ? "راقب نمو جمهورك واكتشف فرص التوسع"
          : "Monitor your audience growth and discover expansion opportunities",
      gradient: "from-[#C9A84C] to-[#E8C84C]",
      accentBar: "from-[#C9A84C] to-[#E8C84C]",
    },
    {
      icon: Activity,
      title: locale === "ar" ? "تحليلات التفاعل" : "Engagement Analytics",
      description:
        locale === "ar"
          ? "افهم كيف يتفاعل جمهورك مع محتواك"
          : "Understand how your audience interacts with your content",
      gradient: "from-[#3B82F6] to-[#60A5FA]",
      accentBar: "from-[#3B82F6] to-[#60A5FA]",
    },
    {
      icon: PieChart,
      title: locale === "ar" ? "مقارنة المنصات" : "Platform Comparison",
      description:
        locale === "ar"
          ? "قارن أداءك عبر المنصات المختلفة"
          : "Compare your performance across different platforms",
      gradient: "from-[#8B5CF6] to-[#A78BFA]",
      accentBar: "from-[#8B5CF6] to-[#A78BFA]",
    },
  ];

  return (
    <motion.div
      className="space-y-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Page Header: Gradient Banner ── */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#006C35] via-[#00A352] to-[#C9A84C] p-8 md:p-12">
        {/* Floating decorative elements */}
        <motion.div
          className="pointer-events-none absolute -top-6 -right-6 h-32 w-32 rounded-full bg-white/10"
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="pointer-events-none absolute bottom-4 left-8 h-20 w-20 rounded-full bg-white/10"
          animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.18, 0.08] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="pointer-events-none absolute top-1/2 right-1/4 h-14 w-14 rounded-full bg-white/5"
          animate={{ y: [0, -10, 0], opacity: [0.05, 0.15, 0.05] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />

        <div className="relative z-10">
          <h1 className="font-cairo text-4xl font-bold text-white md:text-5xl">
            {ti.pageTitle}
          </h1>
          <p className="mt-3 flex items-center gap-2 text-lg text-white/90 md:text-xl">
            <Sparkles className="h-5 w-5 text-[#C9A84C]" />
            {ti.pageSub}
            <Sparkles className="h-5 w-5 text-[#C9A84C]" />
          </p>
        </div>
      </motion.div>

      {/* ── Coming Soon Hero Section ── */}
      <motion.div variants={itemVariants} className="relative">
        {/* Animated gradient border wrapper */}
        <div className="relative rounded-2xl p-[3px]">
          <motion.div
            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#006C35] via-[#C9A84C] to-[#00A352]"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="relative rounded-2xl bg-[#F8FBF8] px-6 py-20 md:px-12 md:py-28">
            <div className="flex flex-col items-center justify-center text-center">
              {/* Animated icon */}
              <motion.div
                className="relative flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-br from-[#006C35] to-[#00A352]"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <TrendingUp className="text-white" style={{ width: 72, height: 72 }} />
                {/* Outer ring pulse */}
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-[#006C35]/30"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
                />
              </motion.div>

              {/* Floating emojis */}
              <div className="pointer-events-none absolute inset-0">
                <motion.span
                  className="absolute left-[15%] top-[20%] text-4xl"
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  📊
                </motion.span>
                <motion.span
                  className="absolute right-[15%] top-[18%] text-4xl"
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                >
                  📈
                </motion.span>
                <motion.span
                  className="absolute left-1/2 bottom-[12%] -translate-x-1/2 text-4xl"
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                >
                  🎯
                </motion.span>
              </div>

              {/* Coming Soon text */}
              <h2 className="mt-10 text-5xl font-extrabold bg-gradient-to-r from-[#006C35] to-[#C9A84C] bg-clip-text text-transparent">
                {ti.comingSoon}
              </h2>
              <p className="mt-4 max-w-lg text-xl leading-relaxed text-[#5A8A6A]">
                {ti.comingSoonDesc}
              </p>

              {/* ── Preview Metric Cards ── */}
              <motion.div
                className="mt-14 grid w-full max-w-2xl grid-cols-1 gap-6 sm:grid-cols-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {metricCards.map((item, i) => (
                  <motion.div
                    key={item.label}
                    variants={itemVariants}
                    transition={{ delay: 0.3 + i * 0.15 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className={`group cursor-default rounded-2xl border-2 border-[#D4EBD9] bg-white p-6 text-center shadow-md transition-shadow duration-300 ${item.shadowColor}`}
                  >
                    <motion.div
                      className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${item.iconBg}`}
                    >
                      <item.icon
                        className="h-8 w-8 transition-transform duration-300 group-hover:rotate-12"
                        style={{
                          color: item.gradient.includes("006C35")
                            ? "#006C35"
                            : item.gradient.includes("C9A84C")
                            ? "#C9A84C"
                            : "#8B5CF6",
                        }}
                      />
                    </motion.div>
                    <p className="mt-4 text-xl font-bold text-[#004D26]">{item.label}</p>
                    <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-[#F0F7F2]">
                      <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${item.barColor}`}
                        initial={{ width: "0%" }}
                        animate={{ width: item.barWidth }}
                        transition={{ delay: 0.6 + i * 0.2, duration: 1.2, ease: "easeOut" }}
                      />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── What to Expect Section ── */}
      <motion.div variants={itemVariants}>
        <h3 className="mb-8 text-center text-3xl font-bold text-[#004D26] md:text-4xl">
          {locale === "ar" ? "ماذا تتوقع" : "What to Expect"}
        </h3>
        <motion.div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {featureCards.map((card, i) => (
            <motion.div
              key={card.title}
              variants={itemVariants}
              transition={{ delay: 0.2 + i * 0.12 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative cursor-default overflow-hidden rounded-2xl border-2 border-[#D4EBD9] bg-white p-6 shadow-md transition-shadow duration-300 hover:shadow-xl"
            >
              {/* Gradient accent bar at top */}
              <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${card.accentBar}`} />

              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${card.gradient}`}
              >
                <card.icon className="h-7 w-7 text-white" />
              </div>
              <h4 className="mt-5 text-xl font-bold text-[#004D26]">{card.title}</h4>
              <p className="mt-2 text-lg leading-relaxed text-[#5A8A6A]">{card.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
