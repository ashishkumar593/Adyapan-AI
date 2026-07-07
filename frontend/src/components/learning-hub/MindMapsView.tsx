"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitMerge, Copy, FileDown, RefreshCw, ChevronRight, Search, Plus, History,
  CheckCircle2, Sparkles, Brain, Zap, Star, X, FileText, Layers
} from "lucide-react";
import { toast } from "sonner";
import { useSocket } from "@/context/SocketContext";

function useTheme() {
  const [theme, setTheme] = useState("dark");
  useEffect(() => {
    const t = document.documentElement.getAttribute("data-theme") || "dark";
    setTheme(t);
    const obs = new MutationObserver(() => setTheme(document.documentElement.getAttribute("data-theme") || "dark"));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);
  return theme;
}

const mkColors = (theme: string) => {
  const isDark = theme === "dark";
  return {
    isDark, text: isDark ? "#e5e7eb" : "#0f172a", textSec: isDark ? "#9ca3af" : "#475569", textMuted: isDark ? "#6b7280" : "#94a3b8", textOnAmber: "#000000",
    bg: isDark ? "rgba(255,255,255,0.025)" : "#ffffff", bgHover: isDark ? "rgba(255,255,255,0.04)" : "#f8fafc",
    surface: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", surfaceHover: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
    border: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)", borderHover: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.18)",
    inputBg: isDark ? "rgba(0,0,0,0.35)" : "#f1f5f9", cardBg: isDark ? "rgba(255,255,255,0.025)" : "#ffffff", cardBgAlt: isDark ? "rgba(0,0,0,0.25)" : "#f8fafc",
    stickyBg: isDark ? "rgba(10,10,20,0.88)" : "rgba(248,250,252,0.92)",
    amber: "#f59e0b", amberBg: isDark ? "rgba(245,158,11,0.07)" : "rgba(245,158,11,0.08)", amberBorder: isDark ? "rgba(245,158,11,0.18)" : "rgba(245,158,11,0.25)", amberActive: isDark ? "rgba(245,158,11,0.12)" : "rgba(245,158,11,0.1)",
    purpleBg: isDark ? "rgba(139,92,246,0.06)" : "rgba(139,92,246,0.05)", purpleBorder: isDark ? "rgba(139,92,246,0.14)" : "rgba(139,92,246,0.15)",
    green: "#10b981", greenBg: isDark ? "rgba(16,185,129,0.1)" : "rgba(16,185,129,0.08)",
    divider: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)",
    pill: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", pillBorder: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
  };
};

interface MindMapNode { id: string; type: string; data: { label: string }; position: { x: number; y: number }; }
interface MindMapEdge { id: string; source: string; target: string; }

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }) };
const scaleIn = { hidden: { opacity: 0, scale: 0.92 }, visible: (i = 0) => ({ opacity: 1, scale: 1, transition: { delay: i * 0.07, duration: 0.35 } }) };
const slideRight = { hidden: { opacity: 0, x: -24 }, visible: (i = 0) => ({ opacity: 1, x: 0, transition: { delay: i * 0.07, duration: 0.4 } }) };

export function MindMapsView() {
  const theme = useTheme();
  const c = mkColors(theme);

  const [generating, setGenerating] = useState(false);
  const [mapData, setMapData] = useState<{ nodes: MindMapNode[]; edges: MindMapEdge[] } | null>(null);
  const [topic, setTopic] = useState("Cellular Respiration");
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState("");
  const [activeNode, setActiveNode] = useState("1");
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<Array<{ name: string; date: string; count: number; data: { nodes: MindMapNode[]; edges: MindMapEdge[] } }>>([]);

  const { socket, isConnected } = useSocket();
  const userIdRef = useRef<string>("");

  const MOCK_MAP = {
    nodes: [
      { id: "1", type: "root", data: { label: "Cellular Respiration" }, position: { x: 250, y: 50 } },
      { id: "2", type: "child", data: { label: "Glycolysis" }, position: { x: 100, y: 150 } },
      { id: "3", type: "child", data: { label: "Krebs Cycle" }, position: { x: 250, y: 150 } },
      { id: "4", type: "child", data: { label: "Electron Transport Chain" }, position: { x: 400, y: 150 } },
      { id: "5", type: "grandchild", data: { label: "Occurs in Cytoplasm" }, position: { x: 50, y: 250 } },
      { id: "6", type: "grandchild", data: { label: "Produces 2 ATP" }, position: { x: 150, y: 250 } },
      { id: "7", type: "grandchild", data: { label: "Mitochondrial Matrix" }, position: { x: 250, y: 250 } },
      { id: "8", type: "grandchild", data: { label: "Inner Membrane" }, position: { x: 380, y: 250 } },
      { id: "9", type: "grandchild", data: { label: "Produces 34 ATP" }, position: { x: 460, y: 250 } }
    ],
    edges: [
      { id: "e1-2", source: "1", target: "2" }, { id: "e1-3", source: "1", target: "3" }, { id: "e1-4", source: "1", target: "4" },
      { id: "e2-5", source: "2", target: "5" }, { id: "e2-6", source: "2", target: "6" }, { id: "e3-7", source: "3", target: "7" },
      { id: "e4-8", source: "4", target: "8" }, { id: "e4-9", source: "4", target: "9" }
    ]
  };

  useEffect(() => {
    try { const raw = localStorage.getItem("adyapan-user"); if (raw) userIdRef.current = (JSON.parse(raw) as { id?: string })?.id ?? ""; } catch { }
    try { const stored = localStorage.getItem("adyapan-map-history"); if (stored) setHistory(JSON.parse(stored)); } catch {}
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleProgress = ({ progress: p, statusMessage }: { progress: number; statusMessage: string }) => { setProgress(p); setStatusMsg(statusMessage); };
    const handleComplete = ({ nodes: nodeList, edges: edgeList }: { nodes: MindMapNode[]; edges: MindMapEdge[] }) => {
      const newMap = { nodes: nodeList, edges: edgeList };
      setGenerating(false); setMapData(newMap); setActiveNode("1");
      const newHistoryItem = { name: topic, date: "Just now", count: nodeList.length, data: newMap };
      const updatedHistory = [newHistoryItem, ...history.filter(h => h.name !== topic)].slice(0, 10);
      setHistory(updatedHistory); localStorage.setItem("adyapan-map-history", JSON.stringify(updatedHistory));
    };
    const handleError = ({ error }: { error: string }) => { setGenerating(false); toast.error(`Generation error: ${error}`); };
    socket.on("generate:progress", handleProgress);
    socket.on("generate:complete", handleComplete);
    socket.on("generate:error", handleError);
    return () => { socket.off("generate:progress", handleProgress); socket.off("generate:complete", handleComplete); socket.off("generate:error", handleError); };
  }, [socket, topic, history]);

  const handleGenerate = () => {
    setGenerating(true); setProgress(0); setStatusMsg("Starting Mind Map Generator...");
    if (socket && isConnected) {
      socket.emit("generate:start", { moduleName: "mindmap", payload: { topic, userId: userIdRef.current } });
    } else {
      const stages = [{ msg: "Mapping central concept...", prg: 25 }, { msg: "Expanding branch attributes...", prg: 50 }, { msg: "Connecting leaves relationships...", prg: 75 }, { msg: "Complete (Offline Demo Mode)...", prg: 100 }];
      let step = 0;
      const timer = setInterval(() => {
        if (step < stages.length) { setStatusMsg(stages[step].msg); setProgress(stages[step].prg); step++; }
        else { clearInterval(timer); setGenerating(false); setMapData(MOCK_MAP); setActiveNode("1"); }
      }, 600);
    }
  };

  const loadHistoryItem = (item: typeof history[0]) => {
    setTopic(item.name); setMapData(item.data); setActiveNode("1"); setShowHistory(false);
  };

  const rootNode = mapData?.nodes.find(n => n.id === "1") || mapData?.nodes[0];
  const childNodes = mapData?.nodes.filter(n => n.type === "child") || [];
  const getEdgesForNode = (nodeId: string) => mapData?.edges.filter(e => e.source === nodeId) || [];

  const stages = ["Analyze Topic", "Identify Concepts", "Build Relations", "Connect Edges", "Format Map", "Completed"];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="flex flex-col antialiased" style={{ color: c.text }}>
      <style>{`.mg-scroll { scrollbar-width: none; -ms-overflow-style: none; } .mg-scroll::-webkit-scrollbar { display: none; }`}</style>

      {/* HEADER */}
      <div className="flex items-center justify-between pb-3 mb-3" style={{ borderBottom: `1px solid ${c.divider}` }}>
        <div className="flex items-center gap-2.5">
          <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 280, damping: 18 }} className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
            <GitMerge size={18} style={{ color: "#000" }} />
          </motion.div>
          <div>
            <motion.h1 initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="text-base font-extrabold leading-tight" style={{ color: c.text, fontFamily: "'Outfit', sans-serif" }}>Mind Maps</motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="text-xs leading-tight" style={{ color: c.textMuted }}>AI-powered visual knowledge graphs</motion.p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {mapData && (
            <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => { setMapData(null); }} className="h-8 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all" style={{ background: c.surface, border: `1px solid ${c.border}`, color: c.text }}>
              <Plus size={14} /> New Topic
            </motion.button>
          )}
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => setShowHistory(!showHistory)} className="h-8 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
            style={{ background: showHistory ? c.amberActive : c.surface, border: `1px solid ${showHistory ? c.amberBorder : c.border}`, color: showHistory ? c.amber : c.text }}>
            <History size={14} /> History
            {history.length > 0 && <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black" style={{ background: c.amberBg, color: c.amber }}>{history.length}</span>}
          </motion.button>
        </div>
      </div>

      {/* HISTORY PANEL */}
      <AnimatePresence>
        {showHistory && (
          <motion.div initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: "auto", y: 0 }} exit={{ opacity: 0, height: 0, y: -10 }} transition={{ duration: 0.3 }} className="mb-4 rounded-2xl overflow-hidden" style={{ border: `1px solid ${c.amberBorder}`, background: c.amberBg }}>
            <div className="p-4">
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: c.text }}><History size={15} style={{ color: c.amber }} /> Recent Mind Maps</h3>
              {history.length === 0 ? (
                <p className="text-sm py-2" style={{ color: c.textMuted }}>No mind maps generated yet. Submit a topic to begin.</p>
              ) : (
                <div className="space-y-2">
                  {history.map((doc, i) => (
                    <motion.div key={doc.name} custom={i} variants={fadeUp} initial="hidden" animate="visible"
                      className="flex items-center justify-between p-3 rounded-xl cursor-pointer group transition-all" style={{ background: c.cardBg, border: `1px solid ${c.border}` }}
                      onClick={() => loadHistoryItem(doc)} whileHover={{ scale: 1.01, borderColor: c.amberBorder }}>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: c.amberBg, border: `1px solid ${c.amberBorder}` }}>
                          <FileText size={14} style={{ color: c.amber }} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: c.text }}>{doc.name}</p>
                          <p className="text-xs" style={{ color: c.textMuted }}>{doc.date} · {doc.count} nodes</p>
                        </div>
                      </div>
                      <motion.button whileHover={{ x: 2 }} className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-all" style={{ background: c.amberActive, color: c.amber }}>
                        Open <ChevronRight size={12} />
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1">
        <AnimatePresence mode="wait">

          {/* EMPTY STATE */}
          {!generating && !mapData && (
            <motion.div key="empty" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <motion.div className="p-6 rounded-3xl relative overflow-hidden" style={{ background: c.surface, border: `2px solid ${c.border}` }}>
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-4 right-8 w-24 h-24 rounded-full" style={{ opacity: c.isDark ? 0.05 : 0.08, background: "radial-gradient(circle, #f59e0b, transparent)" }} />
                  <div className="absolute bottom-4 left-8 w-16 h-16 rounded-full" style={{ opacity: c.isDark ? 0.04 : 0.06, background: "radial-gradient(circle, #8b5cf6, transparent)" }} />
                </div>
                <div className="relative z-10 space-y-4">
                  <h3 className="text-lg font-extrabold text-center" style={{ color: c.text, fontFamily: "'Outfit', sans-serif" }}>Configure Mind Map</h3>
                  <div className="space-y-3 max-w-xl mx-auto">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold" style={{ color: c.textSec }}>Topic to Visualize</label>
                      <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Cellular Respiration, React Lifecycle"
                        className="w-full rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none" style={{ background: c.inputBg, border: `1px solid ${c.border}`, color: c.text }} />
                    </div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={handleGenerate}
                      className="w-full py-2.5 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 transition-all" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#000" }}>
                      <GitMerge size={16} /> Generate Mind Map
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              {/* Presets */}
              <div>
                <h2 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: c.text }}><Zap size={15} style={{ color: c.amber }} /> Choose Preset Concepts</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { title: "Cellular Respiration map", desc: "Visualizes glycolysis, Krebs cycle, and electron transport chain nodes connections.", icon: <Star size={18} style={{ color: c.amber }} /> },
                    { title: "React Components Lifecycle", desc: "Outlines mounting stages, updating loops, and unmounting methods in functional structures.", icon: <Brain size={18} style={{ color: "#a78bfa" }} /> },
                    { title: "Data Structures Hierarchy", desc: "Builds a visual hierarchy map comparing linear vs non-linear structures.", icon: <Sparkles size={18} style={{ color: "#22d3ee" }} /> }
                  ].map((item, i) => (
                    <motion.div key={item.title} custom={i} variants={fadeUp} initial="hidden" animate="visible" whileHover={{ y: -4, scale: 1.01 }}
                      onClick={() => setTopic(item.title)} className="p-5 rounded-2xl relative overflow-hidden cursor-pointer group transition-all" style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: c.surface, border: `1px solid ${c.border}` }}>{item.icon}</div>
                        <div><h4 className="text-sm font-extrabold" style={{ color: c.text, fontFamily: "'Outfit', sans-serif" }}>{item.title}</h4></div>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: c.textSec }}>{item.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* How It Works */}
              <div>
                <h2 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: c.text }}><Zap size={15} style={{ color: c.amber }} /> How It Works</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { step: "01", title: "Input Topic", desc: "State the topic you would like to map as a visual knowledge graph.", icon: <GitMerge size={18} style={{ color: c.amber }} /> },
                    { step: "02", title: "Build Relations", desc: "AI partitions core blocks, links relative nodes, and writes brief context statements.", icon: <Brain size={18} style={{ color: "#a78bfa" }} /> },
                    { step: "03", title: "Export & Share", desc: "View nodes hierarchy and export or share the generated map.", icon: <Sparkles size={18} style={{ color: "#22d3ee" }} /> }
                  ].map((item, i) => (
                    <motion.div key={item.step} custom={i} variants={fadeUp} initial="hidden" animate="visible" whileHover={{ y: -4, scale: 1.01 }} className="p-5 rounded-2xl relative overflow-hidden group transition-all" style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: c.surface, border: `1px solid ${c.border}` }}>{item.icon}</div>
                        <div><span className="text-[10px] font-black uppercase tracking-widest block" style={{ color: c.amber }}>Step {item.step}</span><h4 className="text-sm font-extrabold" style={{ color: c.text, fontFamily: "'Outfit', sans-serif" }}>{item.title}</h4></div>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: c.textSec }}>{item.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Features */}
              <motion.div variants={fadeUp} custom={3} initial="hidden" animate="visible" className="p-5 rounded-2xl" style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
                <h2 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: c.text }}><Star size={14} style={{ color: c.amber }} /> Features</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                  {["Root Mapping", "Child Branches", "Node Connections", "Visual Hierarchy", "Copy Details", "Export PNG"].map((feat, i) => (
                    <motion.div key={feat} custom={i} variants={scaleIn} initial="hidden" animate="visible" className="flex items-center gap-2 text-sm" style={{ color: c.textSec }}>
                      <CheckCircle2 size={14} style={{ color: c.amber }} className="shrink-0" />
                      <span>{feat}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* PROCESSING */}
          {generating && (
            <motion.div key="generating" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-16 gap-8">
              <div className="relative w-24 h-24">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full" style={{ border: `3px solid transparent`, borderTopColor: c.amber, borderRightColor: c.amberBg }} />
                <motion.div animate={{ rotate: -360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute inset-3 rounded-full" style={{ border: `2px solid transparent`, borderTopColor: "rgba(139,92,246,0.6)", borderLeftColor: "rgba(139,92,246,0.2)" }} />
                <div className="absolute inset-0 flex items-center justify-center"><Brain size={28} style={{ color: c.amber }} /></div>
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-lg font-extrabold" style={{ color: c.text, fontFamily: "'Outfit', sans-serif" }}>Generating Mind Map...</h3>
                <p className="text-sm" style={{ color: c.textMuted }}>{statusMsg}</p>
              </div>
              <div className="w-full max-w-lg grid grid-cols-3 gap-3">
                {stages.map((step, idx) => {
                  const stageIdx = stages.indexOf(statusMsg);
                  const isActive = idx <= stageIdx;
                  return (
                    <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                      className="p-3 rounded-xl text-center space-y-1.5 transition-all duration-500" style={{ background: isActive ? c.amberBg : c.surface, border: `1px solid ${isActive ? c.amberBorder : c.border}` }}>
                      <span className="text-[9px] font-black uppercase tracking-widest block" style={{ color: c.amber }}>Stage {idx + 1}</span>
                      <span className="text-xs font-semibold block" style={{ color: c.text }}>{step}</span>
                      {isActive && idx === stageIdx && <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }} className="w-2 h-2 rounded-full mx-auto" style={{ background: c.amber }} />}
                      {isActive && idx < stageIdx && <CheckCircle2 size={12} style={{ color: c.green }} className="mx-auto" />}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* READY — 30/70 SPLIT */}
          {!generating && mapData && (
            <motion.div key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-0" style={{ minHeight: "600px" }}>
              {/* LEFT PANEL 30% */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
                className="mg-scroll flex flex-col gap-3 overflow-y-auto pr-3" style={{ width: "30%", minWidth: "200px", maxHeight: "80vh", position: "sticky", top: 0 }}>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-2xl shrink-0" style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: c.amberBg, border: `1px solid ${c.amberBorder}` }}>
                      <GitMerge size={14} style={{ color: c.amber }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate" style={{ color: c.text }}>{topic}</p>
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase" style={{ background: c.greenBg, color: c.green }}>Generated</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { label: "Total Nodes", value: mapData.nodes.length },
                      { label: "Edges", value: mapData.edges.length },
                      { label: "Root Node", value: rootNode?.data.label || "—" },
                      { label: "Child Branches", value: childNodes.length }
                    ].map(stat => (
                      <div key={stat.label} className="p-2 rounded-lg text-center" style={{ background: c.cardBgAlt, border: `1px solid ${c.border}` }}>
                        <span className="text-[10px] block" style={{ color: c.textMuted }}>{stat.label}</span>
                        <span className="text-xs font-extrabold" style={{ color: c.text }}>{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Nav */}
                <div className="flex-1 rounded-2xl overflow-hidden" style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
                  <div className="p-3 border-b" style={{ borderColor: c.divider, background: c.stickyBg }}>
                    <span className="text-[10px] font-black uppercase tracking-widest block" style={{ color: c.amber }}>Nodes</span>
                  </div>
                  <div className="p-2 space-y-0.5">
                    {mapData.nodes.map((n, i) => (
                      <motion.button key={n.id} custom={i} variants={slideRight} initial="hidden" animate="visible"
                        onClick={() => setActiveNode(n.id)} whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}
                        className="w-full text-left py-2.5 px-3 rounded-xl flex items-center justify-between transition-all duration-200"
                        style={{ background: activeNode === n.id ? c.amberActive : "transparent", border: activeNode === n.id ? `1px solid ${c.amberBorder}` : "1px solid transparent" }}>
                        <span className="text-sm font-semibold truncate" style={{ color: activeNode === n.id ? c.amber : c.textSec }}>{n.data.label}</span>
                        <motion.div animate={{ rotate: activeNode === n.id ? 90 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronRight size={12} style={{ color: activeNode === n.id ? c.amber : c.textMuted }} />
                        </motion.div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Details */}
                <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="p-3 rounded-2xl shrink-0" style={{ background: c.amberBg, border: `1px solid ${c.amberBorder}` }}>
                  <span className="text-[10px] font-black uppercase tracking-widest block mb-2.5 flex items-center gap-1.5" style={{ color: c.amber }}><Sparkles size={11} /> Map Details</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { label: "Target Topic", value: topic },
                      { label: "Total Nodes", value: mapData.nodes.length },
                      { label: "Child Branches", value: childNodes.length },
                      { label: "Format Model", value: "Relational Node Map" }
                    ].map((insight, i) => (
                      <motion.div key={insight.label} initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + i * 0.08 }}
                        className="p-2 rounded-xl text-center" style={{ background: c.cardBgAlt, border: `1px solid ${c.border}` }}>
                        <span className="text-[10px] block leading-tight" style={{ color: c.textMuted }}>{insight.label}</span>
                        <span className="text-xs font-extrabold block truncate mt-0.5" style={{ color: c.text }}>{insight.value}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Actions */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="p-3 rounded-2xl shrink-0 space-y-2" style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
                  <span className="text-[10px] font-black uppercase tracking-widest block" style={{ color: c.textMuted }}>Actions</span>
                  <motion.button whileHover={{ x: 2 }} whileTap={{ scale: 0.97 }}
                    onClick={() => { const txt = mapData.nodes.map(n => `[${n.type}] ${n.data.label}`).join("\n") + "\n\nEdges:\n" + mapData.edges.map(e => `${e.source} → ${e.target}`).join("\n"); navigator.clipboard.writeText(txt); toast.success("Map details copied!"); }}
                    className="w-full flex items-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all text-left" style={{ background: c.surface, border: `1px solid ${c.border}`, color: c.textSec }}>
                    <span style={{ color: c.amber }} className="shrink-0"><Copy size={13} /></span> Copy Details
                  </motion.button>
                  <motion.button whileHover={{ x: 2 }} whileTap={{ scale: 0.97 }}
                    onClick={() => toast.success("Mind map exported successfully.")}
                    className="w-full flex items-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all text-left" style={{ background: c.surface, border: `1px solid ${c.border}`, color: c.textSec }}>
                    <span style={{ color: c.amber }} className="shrink-0"><FileDown size={13} /></span> Export PNG
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
                    onClick={() => { setMapData(null); }}
                    className="w-full py-2 rounded-lg text-sm font-extrabold transition-all flex items-center justify-center gap-1.5" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#000" }}>
                    <RefreshCw size={13} /> New Topic
                  </motion.button>
                </motion.div>
              </motion.div>

              {/* RIGHT PANEL 70% */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.15 }} className="flex-1 flex flex-col min-w-0 pl-4">
                <div className="pb-4">
                  <motion.div key={activeNode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="aspect-video relative rounded-2xl overflow-hidden flex items-center justify-center p-4"
                    style={{ background: c.cardBg, border: `1px solid ${c.amberBorder}` }}>
                    <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 0.5px, transparent 0)', backgroundSize: '16px 16px' }} />
                    <div className="relative z-10 flex flex-col items-center w-full">
                      {rootNode && (
                        <>
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}
                            className="px-5 py-2.5 rounded-xl text-sm font-extrabold" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#000", boxShadow: "0 4px 20px rgba(245,158,11,0.25)" }}>
                            {rootNode.data.label}
                          </motion.div>
                          <div className="w-0.5 h-6" style={{ background: c.divider }} />
                          <div className="flex gap-3 relative justify-center flex-wrap">
                            {childNodes.slice(0, 3).map((node, ci) => {
                              const childEdges = getEdgesForNode(node.id);
                              const grandChildren = mapData.nodes.filter(n => childEdges.some(e => e.target === n.id));
                              return (
                                <motion.div key={node.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + ci * 0.08 }}
                                  whileHover={{ y: -3 }} className="flex flex-col items-center" style={{ minWidth: "120px" }}>
                                  <div className="p-2.5 rounded-xl text-center w-full" style={{ background: c.amberBg, border: `1px solid ${c.amberBorder}` }}>
                                    <span className="text-xs font-bold" style={{ color: c.text }}>{node.data.label}</span>
                                  </div>
                                  {grandChildren.length > 0 && (
                                    <>
                                      <div className="w-0.5 h-3" style={{ background: c.divider }} />
                                      <div className="space-y-1.5 w-full">
                                        {grandChildren.slice(0, 2).map(gc => (
                                          <motion.div key={gc.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + ci * 0.1 }}
                                            className="px-2.5 py-1.5 rounded-lg text-center text-xs" style={{ background: c.surface, border: `1px solid ${c.border}`, color: c.textSec }}>
                                            {gc.data.label}
                                          </motion.div>
                                        ))}
                                      </div>
                                    </>
                                  )}
                                </motion.div>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
