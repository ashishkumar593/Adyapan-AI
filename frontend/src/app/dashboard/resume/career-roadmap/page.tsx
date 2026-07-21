"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, Moon, Sun, Menu, X, Compass } from "lucide-react";

const CareerNavigationEngine = dynamic(
  () => import("@/components/resume-hub/CareerNavigationEngine").then(m => m.CareerNavigationEngine),
  {
    ssr: false,
    loading: () => <div className="w-full min-h-[400px] flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" /></div>
  }
);

export default function CareerRoadmapPage() {
  useRequireAuth("USER");
  const [theme, setTheme] = useState("dark");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const savedTheme = localStorage.getItem("adyapan-theme") || "dark";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
    try {
      const raw = localStorage.getItem("adyapan-user") || sessionStorage.getItem("adyapan-user");
      if (raw) {
        const parsed = JSON.parse(raw);
        setUserName(parsed?.name || "");
      }
    } catch {}
    const obs = new MutationObserver(() => {
      setTheme(document.documentElement.getAttribute("data-theme") || "dark");
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  const isDark = theme === "dark";

  return (
    <div className="relative overflow-hidden" style={{ minHeight: "100vh", background: isDark ? "#080710" : "#f0f4ff", color: isDark ? "#fff" : "#0f172a" }}>
      {/* Minimal top nav */}
      <header style={{
        position: "fixed", top: 0, left: 0, width: "100%", height: 56,
        background: isDark ? "#060b0e" : "#ffffff",
        borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)"}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 1rem", zIndex: 105, boxSizing: "border-box",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Link href="/dashboard/user" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "0.4rem 0.8rem", borderRadius: 8, fontSize: "0.8rem", fontWeight: 600, color: isDark ? "#fff" : "#0f172a", textDecoration: "none", border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)"}`, background: isDark ? "#0d151c" : "rgba(0,0,0,0.04)" }}>
            <ArrowLeft size={14} /> Dashboard
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Compass size={18} style={{ color: "#f59e0b" }} />
            <span style={{ fontWeight: 700, fontSize: "0.95rem", color: isDark ? "#fff" : "#0f172a" }}>Career Roadmap</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button onClick={() => { const n = theme === "dark" ? "light" : "dark"; setTheme(n); localStorage.setItem("adyapan-theme", n); document.documentElement.setAttribute("data-theme", n); }}
            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 8, border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)"}`, background: isDark ? "#0d151c" : "rgba(0,0,0,0.04)", color: isDark ? "#fff" : "#0f172a", cursor: "pointer" }}>
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {userName && (
            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: isDark ? "rgba(255,255,255,0.7)" : "#475569" }}>{userName}</span>
          )}
        </div>
      </header>
      <main style={{ paddingTop: 56 }}>
        <CareerNavigationEngine setView={() => {}} />
      </main>
    </div>
  );
}
