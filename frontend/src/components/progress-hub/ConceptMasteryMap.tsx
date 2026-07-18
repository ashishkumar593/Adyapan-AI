"use client";

import { motion } from "framer-motion";
import { Brain } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export interface ConceptMasteryItem {
  conceptName: string;
  topicName: string | null;
  masteryScore: number;
  interactions: number;
  revisionCount: number;
  practiceCount: number;
  lastReviewed: string;
  status: "Strong" | "Good" | "Needs Revision" | "Weak Area";
}

interface ConceptMasteryMapProps {
  concepts: ConceptMasteryItem[];
}

const STATUS_CONFIG = {
  "Strong": { color: "#10b981", bg: "rgba(16,185,129,0.12)", label: "Strong", stroke: "#10b981" },
  "Good": { color: "#3b82f6", bg: "rgba(59,130,246,0.12)", label: "Good", stroke: "#3b82f6" },
  "Needs Revision": { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", label: "Needs Revision", stroke: "#f59e0b" },
  "Weak Area": { color: "#ef4444", bg: "rgba(239,68,68,0.12)", label: "Weak Area", stroke: "#ef4444" },
};

function MasteryRing({ score, status, size = 64, isDark = true }: { score: number; status: string; size?: number; isDark?: boolean }) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG["Weak Area"];
  const radius = size / 2 - 6;
  const circumference = 2 * Math.PI * radius;
  const offset = ((100 - score) / 100) * circumference;
  const center = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
      <circle cx={center} cy={center} r={radius} fill="none" stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"} strokeWidth="5" />
      <motion.circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={cfg.stroke}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        style={{ filter: `drop-shadow(0 0 4px ${cfg.stroke}80)` }}
      />
    </svg>
  );
}

export function ConceptMasteryMap({ concepts }: ConceptMasteryMapProps) {
  const theme = useTheme();
  const isDark = theme === "dark";

  if (concepts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Brain size={48} style={{ color: isDark ? "rgba(255,255,255,0.2)" : "rgba(15,23,42,0.2)" }} className="mb-4" />
        <p className="font-semibold" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(15,23,42,0.5)" }}>No concept mastery data yet</p>
        <p className="text-sm mt-1" style={{ color: isDark ? "rgba(255,255,255,0.25)" : "rgba(15,23,42,0.3)" }}>Start studying topics to see concept mastery mapping</p>
      </div>
    );
  }

  // Group by status
  const grouped = {
    "Strong": concepts.filter((c) => c.status === "Strong"),
    "Good": concepts.filter((c) => c.status === "Good"),
    "Needs Revision": concepts.filter((c) => c.status === "Needs Revision"),
    "Weak Area": concepts.filter((c) => c.status === "Weak Area"),
  };

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-3">
        {(Object.keys(grouped) as (keyof typeof grouped)[]).map((status) => {
          const cfg = STATUS_CONFIG[status];
          return (
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center gap-1 p-3 rounded-xl border"
              style={{ borderColor: `${cfg.stroke}30`, background: cfg.bg }}
            >
              <span className="text-2xl font-black" style={{ color: cfg.color }}>{grouped[status].length}</span>
              <span className="text-[10px] font-bold text-center leading-tight" style={{ color: `${cfg.color}cc` }}>{status}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Concept grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {concepts.slice(0, 24).map((concept, i) => {
          const cfg = STATUS_CONFIG[concept.status];
          return (
            <motion.div
              key={concept.conceptName}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04, duration: 0.4 }}
              whileHover={{ scale: 1.04, y: -2, boxShadow: `0 0 20px ${cfg.stroke}20` }}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl border cursor-default transition-all duration-200"
              style={{ borderColor: `${cfg.stroke}25`, background: `${cfg.bg}` }}
            >
              <div className="relative">
                <MasteryRing score={concept.masteryScore} status={concept.status} size={56} isDark={isDark} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-black" style={{ color: cfg.color }}>{concept.masteryScore}%</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold leading-tight" style={{ color: isDark ? "#f3f4f6" : "#0f172a" }}>{concept.conceptName}</p>
                {concept.topicName && (
                  <p className="text-[10px] mt-0.5" style={{ color: isDark ? "rgba(255,255,255,0.35)" : "rgba(15,23,42,0.35)" }}>{concept.topicName}</p>
                )}
              </div>
              <span
                className="text-[9px] font-black px-2 py-0.5 rounded-full"
                style={{ color: cfg.color, background: cfg.bg }}
              >
                {concept.status}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
