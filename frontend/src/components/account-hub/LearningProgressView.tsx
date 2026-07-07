"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, Clock, GraduationCap, Award
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35 } }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i = 0) => ({ opacity: 1, scale: 1, transition: { delay: i * 0.07, duration: 0.3 } }),
};

function useTheme() {
  const [theme, setTheme] = useState("dark");
  useEffect(() => {
    const t = document.documentElement.getAttribute("data-theme") || "dark";
    setTheme(t);
    const obs = new MutationObserver(() => {
      setTheme(document.documentElement.getAttribute("data-theme") || "dark");
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);
  return theme;
}

export function LearningProgressView() {
  const theme = useTheme();
  const isDark = theme === "dark";

  const c = {
    text: isDark ? "#ffffff" : "#0f172a",
    textSec: isDark ? "rgba(255,255,255,0.7)" : "#475569",
    textMuted: isDark ? "rgba(255,255,255,0.45)" : "#94a3b8",
    cardBg: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
    border: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
    primary: "#f59e0b",
    green: "#10b981",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-5xl mx-auto p-1"
      style={{ color: c.text }}
    >
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
          <TrendingUp className="text-amber-500" size={22} /> Learning Progress
        </h1>
        <p className="text-xs mt-1" style={{ color: c.textMuted }}>
          Track your overall learning progress, completion times, mastery of topics, and active badges.
        </p>
      </div>

      {/* Stats Summary row */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={0}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        {[
          { label: "Learning Hours", val: "42 hrs", icon: <Clock className="text-amber-500" /> },
          { label: "Courses Completed", val: "5", icon: <GraduationCap className="text-emerald-500" /> },
          { label: "Weekly Progress", val: "84%", icon: <TrendingUp className="text-cyan-500" /> },
          { label: "Current Streak", val: "7 Days", icon: <Award className="text-purple-500" /> }
        ].map((card, idx) => (
          <motion.div
            key={idx}
            custom={idx}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -3, scale: 1.01 }}
            className="p-4 border rounded-xl flex items-center justify-between"
            style={{ background: c.cardBg, borderColor: c.border }}
          >
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: c.textMuted }}>{card.label}</span>
              <span className="text-lg font-extrabold block">{card.val}</span>
            </div>
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 18 }}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 shrink-0"
            >
              {card.icon}
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {/* Progress Analytics Circle & Masteries */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={1}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        
        {/* Radial completion widget */}
        <motion.div
          custom={0} variants={fadeUp} initial="hidden" animate="visible"
          whileHover={{ y: -2, scale: 1.005 }}
          className="p-6 border rounded-2xl flex flex-col items-center justify-center text-center gap-4"
          style={{ background: c.cardBg, borderColor: c.border }}
        >
          <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="64" cy="64" r="54" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} strokeWidth="8" fill="transparent" />
              <circle
                cx="64" cy="64" r="54"
                stroke={c.primary}
                strokeWidth="8" fill="transparent"
                strokeDasharray={2 * Math.PI * 54}
                strokeDashoffset={2 * Math.PI * 54 * (1 - 0.78)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-3xl font-black block" style={{ color: c.text }}>78%</span>
              <span className="text-[8px] uppercase tracking-wider font-extrabold" style={{ color: c.textMuted }}>Syllabus Completion</span>
            </div>
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-extrabold">Active Progress</h4>
            <p className="text-xs leading-relaxed max-w-xs" style={{ color: c.textSec }}>
              You spent <strong>42 hours</strong> studying core DSA concepts and resolved <strong>15 challenges</strong> this month.
            </p>
          </div>
        </motion.div>

        {/* Topic completeness */}
        <motion.div
          custom={1} variants={fadeUp} initial="hidden" animate="visible"
          whileHover={{ y: -2, scale: 1.005 }}
          className="md:col-span-2 p-5 border rounded-2xl space-y-5"
          style={{ background: c.cardBg, borderColor: c.border }}
        >
          <h3 className="text-sm font-bold" style={{ color: c.primary }}>Subject Mastery</h3>
          <div className="space-y-4">
            {[
              { label: "Data Structures & Algorithms", val: 80, desc: "Stacks, Queues, Binary Trees, DFS/BFS traversals" },
              { label: "Database Management Systems", val: 75, desc: "SQL queries, Indexing, Transaction ACID properties" },
              { label: "System Design Basics", val: 50, desc: "Client-Server models, Load Balancers, API gateways" }
            ].map((subj, j) => (
              <motion.div
                key={subj.label}
                custom={j}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="space-y-1.5"
              >
                <div className="flex justify-between text-xs font-bold" style={{ color: c.textSec }}>
                  <span>{subj.label}</span>
                  <span>{subj.val}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/5 border overflow-hidden" style={{ borderColor: c.border }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${subj.val}%` }}
                    transition={{ duration: 1, delay: 0.3 + j * 0.15, ease: "easeOut" }}
                    className="h-full rounded-full bg-amber-500"
                  />
                </div>
                <span className="text-[10px] block" style={{ color: c.textMuted }}>{subj.desc}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </motion.div>

      {/* Badges / Achievements list */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={2}
        className="p-5 border rounded-2xl space-y-4"
        style={{ background: c.cardBg, borderColor: c.border }}
      >
        <h3 className="text-sm font-bold flex items-center gap-1.5" style={{ color: c.primary }}>
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 18 }}
          >
            <Award size={16} />
          </motion.div>
          Earned Badges & Achievements
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: "7 Days Streak", desc: "Maintained active study streak for a full week.", icon: <Award className="text-amber-500" /> },
            { title: "DSA Conqueror", desc: "Resolved more than 15 complex coding challenges.", icon: <Award className="text-cyan-500" /> },
            { title: "Syllabus Explorer", desc: "Created 3 distinct syllabus note modules.", icon: <Award className="text-emerald-500" /> }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              custom={idx}
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -3, scale: 1.02 }}
              className="p-4 border rounded-xl flex items-start gap-3 transition-colors hover:border-amber-500/25"
              style={{ borderColor: c.border, background: c.cardBg }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 280, damping: 18 }}
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-white/5 border border-white/10"
              >
                {item.icon}
              </motion.div>
              <div className="space-y-0.5">
                <span className="font-extrabold text-xs block" style={{ color: c.text }}>{item.title}</span>
                <p className="text-[10px]" style={{ color: c.textMuted }}>{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
