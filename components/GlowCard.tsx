"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
  glowColor?: "gold" | "green";
};

export function GlowCard({ children, className, glowColor = "gold" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  function handleMouseMove(e: React.MouseEvent) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  const glowRgb = glowColor === "gold" ? "201,168,76" : "0,108,53";

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-[#172E1F] bg-[#0B1A0F] transition-all duration-300",
        isHovered && "border-transparent",
        className
      )}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {isHovered && (
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-60 transition-opacity"
          style={{
            background: `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, rgba(${glowRgb},0.15), transparent 60%)`,
          }}
        />
      )}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background: isHovered
            ? `radial-gradient(200px circle at ${mousePos.x}px ${mousePos.y}px, rgba(${glowRgb},0.4), rgba(${glowRgb},0.1) 40%, transparent 70%)`
            : "none",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: "1px",
          borderRadius: "1rem",
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
