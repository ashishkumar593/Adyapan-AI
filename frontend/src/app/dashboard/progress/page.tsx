"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useTheme } from "@/hooks/useTheme";
import { useEffect, useState } from "react";
import { ProgressDashboard } from "@/components/progress-hub/ProgressDashboard";
import { ArrowLeft, GraduationCap, LayoutDashboard, TrendingUp } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ProgressTrackingPage() {
  useRequireAuth("USER");
  const theme = useTheme();
  const isDark = theme === "dark";

  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const rawUser =
        localStorage.getItem("adyapan-user") ||
        sessionStorage.getItem("adyapan-user");
      if (rawUser) {
        try {
          setUser(JSON.parse(rawUser));
        } catch {
          /* ignore */
        }
      }
    }
  }, []);

  const C = {
    bg: isDark ? "#070715" : "#f8fafc",
    text: isDark ? "#f3f4f6" : "#0f172a",
    textSec: isDark ? "rgba(255,255,255,0.5)" : "rgba(15,23,42,0.55)",
    textMuted: isDark ? "rgba(255,255,255,0.3)" : "rgba(15,23,42,0.35)",
    textDim: isDark ? "rgba(255,255,255,0.2)" : "rgba(15,23,42,0.25)",
    headerBg: isDark ? "rgba(7,7,21,0.85)" : "rgba(255,255,255,0.85)",
    border: isDark ? "rgba(255,255,255,0.05)" : "rgba(15,23,42,0.07)",
    borderLight: isDark ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.05)",
    surface: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
    surfaceHover: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
    surfaceBtn: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
    surfaceBtnHover: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)",
    gradText: isDark ? "linear-gradient(to right, #ffffff, rgba(255,255,255,0.6))" : "linear-gradient(to right, #0f172a, rgba(15,23,42,0.6))",
    orb1: isDark ? "rgba(139,92,246,0.12)" : "rgba(139,92,246,0.05)",
    orb2: isDark ? "rgba(59,130,246,0.10)" : "rgba(59,130,246,0.04)",
    orb3: isDark ? "rgba(16,185,129,0.08)" : "rgba(16,185,129,0.035)",
  };

  return (
    <div className="min-h-screen text-white flex flex-col font-sans transition-colors duration-500" style={{ backgroundColor: C.bg, color: C.text }}>
      {/* ─── Aurora Background ─────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Primary orbs */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], x: [0, 30, 0] }}
          transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
          className="absolute top-[-8%] left-[-5%] w-[45%] h-[45%] rounded-full blur-[130px]"
          style={{ background: `radial-gradient(circle, ${C.orb1} 0%, transparent 70%)` }}
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], y: [0, 20, 0] }}
          transition={{ repeat: Infinity, duration: 15, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-8%] right-[-5%] w-[45%] h-[45%] rounded-full blur-[130px]"
          style={{ background: `radial-gradient(circle, ${C.orb2} 0%, transparent 70%)` }}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], x: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 18, ease: "easeInOut", delay: 4 }}
          className="absolute top-[40%] right-[10%] w-[30%] h-[30%] rounded-full blur-[100px]"
          style={{ background: `radial-gradient(circle, ${C.orb3} 0%, transparent 70%)` }}
        />

        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 3 + (i % 3),
              height: 3 + (i % 3),
              left: `${10 + i * 12}%`,
              top: `${15 + (i * 17) % 70}%`,
              background: i % 2 === 0 ? "#8b5cf660" : "#10b98160",
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              repeat: Infinity,
              duration: 4 + i * 0.7,
              delay: i * 0.5,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* ─── Header ────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 backdrop-blur-xl transition-colors duration-500"
        style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: C.headerBg }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/user"
              className="p-2 rounded-xl transition-all"
              style={{ border: `1px solid ${C.border}`, backgroundColor: C.surface, color: isDark ? "rgba(255,255,255,0.6)" : "rgba(15,23,42,0.6)" }}
            >
              <ArrowLeft size={16} />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                <TrendingUp size={16} className="text-white" />
              </div>
              <div>
                <span className="font-black text-base tracking-tight bg-clip-text text-transparent" style={{ backgroundImage: C.gradText }}>
                  Progress Tracker
                </span>
                <span className="hidden sm:block text-[10px] font-bold tracking-widest uppercase" style={{ color: C.textMuted }}>
                  AI Learning Intelligence
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl" style={{ border: `1px solid ${C.border}`, backgroundColor: C.surface }}>
                <div className="w-6 h-6 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-[10px] font-black text-violet-400">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-bold" style={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(15,23,42,0.7)" }}>{user.name}</span>
              </div>
            )}
            <Link
              href="/dashboard/user"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
              style={{
                backgroundColor: C.surfaceBtn,
                border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.08)"}`,
                color: isDark ? "rgba(255,255,255,0.7)" : "rgba(15,23,42,0.7)",
              }}
            >
              <LayoutDashboard size={13} />
              <span className="hidden sm:inline">Workspace</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Page Title Banner ──────────────────────────────────────────── */}
      <div className="relative z-10 transition-colors duration-500" style={{ borderBottom: `1px solid ${C.borderLight}`, backgroundColor: isDark ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.01)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase mb-2"
            style={{ color: C.textMuted }}
          >
            <GraduationCap size={14} className="text-violet-400" />
            Day 2 Feature · Adyapan AI
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-2xl sm:text-3xl font-black"
          >
            AI Progress Tracking Engine
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm mt-1.5"
            style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(15,23,42,0.5)" }}
          >
            Your learning GPS — track completion, mastery, streaks, and what to study next.
          </motion.p>
        </div>
      </div>

      {/* ─── Main Content ───────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 relative z-10">
        <ProgressDashboard />
      </main>

      {/* ─── Footer ────────────────────────────────────────────────────── */}
      <footer
        className="relative z-10 text-center py-6 text-[10px] font-bold tracking-widest transition-colors duration-500"
        style={{ color: C.textDim, borderTop: `1px solid ${C.borderLight}` }}
      >
        © {new Date().getFullYear()} ADYAPAN AI · PROGRESS TRACKING ENGINE · DAY 2
      </footer>
    </div>
  );
}
