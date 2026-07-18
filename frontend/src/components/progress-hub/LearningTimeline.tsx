"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { FileText, Clock, HelpCircle, RotateCcw, Layers, Map } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export interface TimelineEvent {
  date: string;
  displayDate: string;
  title: string;
  description: string;
  type: "upload" | "note" | "quiz" | "milestone" | "revision" | "flashcard" | "mindmap";
  icon: string;
}

interface LearningTimelineProps {
  events: TimelineEvent[];
}

const TYPE_STYLES = {
  upload: { color: "from-blue-500 to-blue-600", icon: FileText, glow: "#3b82f6" },
  note: { color: "from-violet-500 to-violet-600", icon: Layers, glow: "#8b5cf6" },
  quiz: { color: "from-emerald-500 to-emerald-600", icon: HelpCircle, glow: "#10b981" },
  revision: { color: "from-amber-500 to-amber-600", icon: RotateCcw, glow: "#f59e0b" },
  flashcard: { color: "from-pink-500 to-pink-600", icon: Clock, glow: "#ec4899" },
  mindmap: { color: "from-teal-500 to-teal-600", icon: Map, glow: "#14b8a6" },
  milestone: { color: "from-orange-500 to-red-500", icon: Clock, glow: "#f97316" },
};

function TimelineItem({ event, index, isDark }: { event: TimelineEvent; index: number; isDark: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const style = TYPE_STYLES[event.type] || TYPE_STYLES.note;
  const IconComponent = style.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex items-start gap-4 group"
    >
      {/* Timeline dot */}
      <div className="flex-shrink-0 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          className={`w-10 h-10 rounded-full bg-gradient-to-br ${style.color} flex items-center justify-center shadow-lg relative`}
          style={{ boxShadow: `0 0 16px ${style.glow}40` }}
        >
          {/* Pulse animation for active dot */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ background: `radial-gradient(circle, ${style.glow}30, transparent)` }}
          />
          <span className="text-sm relative z-10">{event.icon}</span>
        </motion.div>
        {/* Line */}
        <div className="w-0.5 h-full mt-1" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }} />
      </div>

      {/* Card */}
      <motion.div
        whileHover={{ x: 4 }}
        className="flex-1 mb-6 pb-6 last:border-0"
        style={{ borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"}` }}
      >
        <div className="flex items-center gap-2 mb-1">
          <IconComponent size={12} style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(15,23,42,0.4)" }} />
          <span className="text-[11px] font-bold tracking-wider" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(15,23,42,0.45)" }}>{event.displayDate}</span>
        </div>
        <h4 className="text-sm font-bold leading-tight" style={{ color: isDark ? "#f3f4f6" : "#0f172a" }}>
          {event.title}
        </h4>
        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(15,23,42,0.45)" }}>{event.description}</p>
      </motion.div>
    </motion.div>
  );
}

export function LearningTimeline({ events }: LearningTimelineProps) {
  const theme = useTheme();
  const isDark = theme === "dark";

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Clock size={48} style={{ color: isDark ? "rgba(255,255,255,0.2)" : "rgba(15,23,42,0.2)" }} className="mb-4" />
        <p className="font-semibold" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(15,23,42,0.5)" }}>Your timeline is empty</p>
        <p className="text-sm mt-1" style={{ color: isDark ? "rgba(255,255,255,0.25)" : "rgba(15,23,42,0.3)" }}>Start using AI tools to build your learning journey</p>
      </div>
    );
  }

  return (
    <div className="max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
      <div className="space-y-0">
        {events.map((event, i) => (
          <TimelineItem key={`${event.date}-${i}`} event={event} index={i} isDark={isDark} />
        ))}
      </div>
    </div>
  );
}
