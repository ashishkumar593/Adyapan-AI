"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Presentation, Download, Loader2, RefreshCw, CheckCircle2,
  Plus, History, HelpCircle, ChevronRight, Search, FileText, Cpu, Copy, FileDown
} from "lucide-react";
import { useSocket } from "@/context/SocketContext";

interface Slide {
  title: string;
  bullets: string[];
  notes: string;
}

export function PptGeneratorView() {
  const [generating, setGenerating] = useState(false);
  const [slides, setSlides] = useState<Slide[] | null>(null);
  const [topic, setTopic] = useState("EdTech Pitch Deck");
  const [slideCount, setSlideCount] = useState("5 Slides");
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState("");
  const [activeView, setActiveView] = useState<"dashboard" | "help">("dashboard");
  const [activeSlide, setActiveSlide] = useState(0);

  const { socket, isConnected } = useSocket();
  const userIdRef = useRef<string>("");

  const MOCK_SLIDES = [
    {
      title: "Adyapan AI Startup Introduction",
      bullets: [
        "Unlocking student potential with generative learning models.",
        "Integrated AI Study Assistants, Notes Generators, and Interview preparation portals.",
        "A cohesive database structure designed for maximum availability."
      ],
      notes: "Welcome the stakeholders and introduce the core vision of Adyapan AI."
    },
    {
      title: "Market Opportunity & Pain Points",
      bullets: [
        "Traditional study materials are fragmented and dry.",
        "Placement preparation is unstructured and creates anxiety.",
        "Growing demand for personalized study aids in higher education."
      ],
      notes: "Emphasize why personalization is the next biggest growth driver in EdTech."
    },
    {
      title: "The Product Workspace Architecture",
      bullets: [
        "Unified dashboard with dedicated, separate modules.",
        "State management using Next.js client structures.",
        "High performance database queries with Neon PostgreSQL."
      ],
      notes: "Point out the technical efficiency and structural speed parameters."
    }
  ];

  useEffect(() => {
    try {
      const raw = localStorage.getItem("adyapan-user");
      if (raw) userIdRef.current = (JSON.parse(raw) as { id?: string })?.id ?? "";
    } catch { /* */ }
  }, []);

  const handleGenerate = () => {
    setGenerating(true);
    setProgress(0);
    setStatusMsg("Starting Presentation Generator...");

    const stages = [
      { msg: "Structuring presentation outline...", prg: 25 },
      { msg: "Writing slide text components...", prg: 50 },
      { msg: "Creating speaker notes prompts...", prg: 75 },
      { msg: "Complete!", prg: 100 }
    ];

    let step = 0;
    const timer = setInterval(() => {
      if (step < stages.length) {
        setStatusMsg(stages[step].msg);
        setProgress(stages[step].prg);
        step++;
      } else {
        clearInterval(timer);
        setGenerating(false);
        setSlides(MOCK_SLIDES);
        setActiveSlide(0);
      }
    }, 1000);
  };

  const loadHistoryItem = (topicName: string) => {
    setTopic(topicName);
    setSlides(MOCK_SLIDES);
    setActiveSlide(0);
  };

  return (
    <div className="flex flex-col gap-6 p-6 antialiased text-white max-w-7xl mx-auto w-full">
      {/* SECTION 1 — HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-[30px] font-extrabold tracking-tight text-white flex items-center gap-2">
            <Presentation className="text-amber-500" size={24} /> PPT Generator
          </h1>
          <p className="text-[14px] text-gray-400 mt-1 max-w-2xl">
            Generate clean, content-rich presentation slides with speaker notes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setSlides(null); setGenerating(false); }}
            className="h-11 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-extrabold flex items-center gap-1.5 transition-colors"
          >
            <Plus size={20} /> Create New
          </button>
          <button
            onClick={() => {
              const el = document.getElementById("recent-ppts-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="h-11 px-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-semibold flex items-center gap-1.5 transition-colors text-white"
          >
            <History size={20} /> History
          </button>
          <button
            onClick={() => setActiveView(activeView === "help" ? "dashboard" : "help")}
            className="h-11 px-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-semibold flex items-center gap-1.5 transition-colors text-white"
          >
            <HelpCircle size={20} /> Help
          </button>
        </div>
      </div>

      {activeView === "help" ? (
        <div className="p-6 border border-white/5 bg-white/[0.01] rounded-2xl space-y-4">
          <h2 className="text-[20px] font-bold text-white">PPT Generator Help</h2>
          <p className="text-[15px] text-gray-300">
            Specify a presentation topic or copy-paste lecture concepts. The AI structures a sequential slide progression, writes clear bullet points, and appends reference speaker notes for live narration.
          </p>
          <button onClick={() => setActiveView("dashboard")} className="h-11 px-4 rounded-2xl bg-amber-500 text-black font-extrabold text-sm hover:bg-amber-400 transition-colors">
            Back to Dashboard
          </button>
        </div>
      ) : (
        <>
          {/* SECTION 2 — QUICK STATS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { title: "Presentations Made", value: "22", desc: "+4 This Month" },
              { title: "Slides Generated", value: "154 slides", desc: "Structured layouts" },
              { title: "Templates Used", value: "6 unique styles", desc: "For different subjects" },
              { title: "Total Hours Saved", value: "32 Hours", desc: "Premium Efficiency Available" }
            ].map(stat => (
              <div key={stat.title} className="h-[170px] p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col justify-between">
                <span className="text-[14px] text-gray-400 font-medium">{stat.title}</span>
                <span className="text-3xl font-extrabold text-white">{stat.value}</span>
                <span className="text-[14px] text-amber-500 font-semibold">{stat.desc}</span>
              </div>
            ))}
          </div>

          {generating ? (
            <div className="flex flex-col items-center justify-center p-8 border border-white/5 bg-white/[0.01] rounded-2xl space-y-6 max-w-2xl mx-auto w-full">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500 animate-pulse">
                <Cpu size={32} />
              </div>
              <div className="text-center">
                <h3 className="text-[18px] font-bold text-white">Generating Slides via AI Pipeline</h3>
                <p className="text-[14px] text-gray-400 mt-1">{statusMsg}</p>
              </div>
              <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <div className="text-[14px] font-bold text-amber-500 flex items-center gap-2">
                <Loader2 className="animate-spin" size={14} /> {progress}% Complete
              </div>
            </div>
          ) : !slides ? (
            <div className="space-y-6">
              {/* SECTION 3 — CONFIGURATION WORKSPACE */}
              <div className="p-6 border border-white/5 bg-white/[0.01] rounded-2xl max-w-3xl mx-auto w-full space-y-6">
                <h3 className="text-[18px] font-bold text-white">Configure Slides Outline</h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[14px] font-semibold text-gray-300">Presentation Topic</label>
                    <input
                      type="text"
                      value={topic}
                      onChange={e => setTopic(e.target.value)}
                      placeholder="e.g. Pitch Deck for an EdTech Startup"
                      className="w-full h-12 bg-black/20 border border-white/10 rounded-xl px-4 text-[15px] text-white focus:outline-none focus:border-amber-500/50"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[14px] font-semibold text-gray-300">Slide Count</label>
                      <select
                        value={slideCount}
                        onChange={e => setSlideCount(e.target.value)}
                        className="w-full h-12 bg-black/20 border border-white/10 rounded-xl px-4 text-[15px] text-gray-300 focus:outline-none focus:border-amber-500/50 appearance-none"
                      >
                        <option>5 Slides</option>
                        <option>10 Slides</option>
                        <option>15 Slides</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleGenerate}
                    className="h-11 flex-1 rounded-xl bg-amber-500 text-black font-extrabold text-sm hover:bg-amber-400 transition-colors flex items-center justify-center gap-2"
                  >
                    <Presentation size={20} /> Generate Presentation
                  </button>
                  <button
                    onClick={() => setTopic("")}
                    className="h-11 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-semibold transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* SECTION 4 — PRESETS SECTION */}
              <div className="space-y-3">
                <h2 className="text-[20px] font-bold text-white">Choose Slide Presets</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { title: "Startup Pitch Deck", desc: "Constructs slides maps showing introduction, market analysis, products, and financials." },
                    { title: "Academic Lecture Presentation", desc: "Partitions lecture modules into key concept maps, explanations, and summarization points." },
                    { title: "Product Feature Slides", desc: "Focuses on detailing technical attributes, advantages, and user guides layouts." }
                  ].map(tpl => (
                    <div
                      key={tpl.title}
                      onClick={() => setTopic(tpl.title)}
                      className="p-6 border border-white/5 rounded-2xl bg-white/[0.01] hover:bg-amber-500/[0.01] hover:border-amber-500/30 transition-all cursor-pointer space-y-2"
                    >
                      <h4 className="text-[18px] font-bold text-white">{tpl.title}</h4>
                      <p className="text-[14px] text-gray-400 leading-relaxed">{tpl.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 12 — HOW IT WORKS */}
              <div className="space-y-3">
                <h2 className="text-[20px] font-bold text-white">How It Works</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { step: "Brief Slide Topic", desc: "State the presentation goal and select target page/slide count." },
                    { step: "Formulate Content", desc: "AI maps logical sequences, designs bullet outlines, and appends notes." },
                    { step: "Export Presentation", desc: "Preview all generated slide templates and export files to PowerPoint." }
                  ].map((item, idx) => (
                    <div key={item.step} className="p-6 border border-white/5 rounded-2xl bg-white/[0.01] space-y-2">
                      <div className="text-[14px] font-black text-amber-500 uppercase tracking-widest">Step 0{idx + 1}</div>
                      <h4 className="text-[18px] font-bold text-white">{item.step}</h4>
                      <p className="text-[15px] text-gray-300 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* LEFT SIDEBAR (3 Cols) */}
              <div className="md:col-span-3 space-y-4">
                <div className="p-4 border border-white/5 rounded-2xl bg-white/[0.01] space-y-3">
                  <span className="text-[14px] font-black uppercase tracking-wider text-amber-500 block">
                    Slides Outline
                  </span>
                  <div className="space-y-1">
                    {slides.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveSlide(idx)}
                        className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                          activeSlide === idx
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                            : "text-gray-400 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <span className="truncate text-[14px]">Slide {idx + 1}: {s.title}</span>
                        <ChevronRight size={14} className={activeSlide === idx ? "text-amber-500" : "text-gray-600"} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* MAIN CONTENT PREVIEW (6 Cols) */}
              <div className="md:col-span-6 space-y-6">
                <div className="aspect-video bg-gradient-to-br from-[#1a1c29] to-[#0f111a] border border-white/10 rounded-2xl p-8 flex flex-col justify-between shadow-lg">
                  <div>
                    <div className="text-[10px] text-amber-500 font-bold tracking-widest uppercase mb-2">Slide {activeSlide + 1}</div>
                    <h3 className="text-[20px] font-bold text-white mb-4 leading-tight">{slides[activeSlide]?.title}</h3>
                    <ul className="space-y-2">
                      {slides[activeSlide]?.bullets.map((b, j) => (
                        <li key={j} className="text-gray-300 text-[15px] leading-relaxed list-disc ml-4">{b}</li>
                      ))}
                    </ul>
                  </div>

                  {slides[activeSlide]?.notes && (
                    <div className="mt-4 pt-3 border-t border-white/5">
                      <p className="text-[10px] text-amber-500/70 font-bold uppercase tracking-wider mb-1">Speaker Notes</p>
                      <p className="text-gray-400 text-xs italic">"{slides[activeSlide]?.notes}"</p>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="p-3 border border-white/5 bg-white/[0.01] rounded-2xl flex flex-wrap gap-2 justify-between items-center">
                  <div className="flex gap-2">
                    <button
                      onClick={() => alert("📋 Copied slide details.")}
                      className="h-11 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Copy size={20} /> Copy Slide
                    </button>
                    <button
                      onClick={() => alert("📥 Exported PPTX successfully.")}
                      className="h-11 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <FileDown size={20} /> Export PPTX
                    </button>
                  </div>
                  <button
                    onClick={() => setSlides(null)}
                    className="h-11 px-4 rounded-xl bg-amber-500 text-black font-extrabold text-sm hover:bg-amber-400 transition-colors"
                  >
                    Start New Slides
                  </button>
                </div>
              </div>

              {/* RIGHT SIDEBAR STATS (3 Cols) */}
              <div className="md:col-span-3 space-y-4">
                <div className="p-4 border border-white/5 rounded-2xl bg-white/[0.01] space-y-3">
                  <span className="text-[14px] font-black uppercase tracking-wider text-amber-500 block">
                    Slides Metadata
                  </span>
                  <div className="space-y-2 text-xs">
                    {[
                      { label: "Target Topic", val: topic },
                      { label: "Total Slides", val: slides.length },
                      { label: "Theme Style", val: "Tech Premium" },
                      { label: "Language", val: "English" }
                    ].map(stat => (
                      <div key={stat.label} className="flex justify-between items-center py-1 border-b border-white/[0.03]">
                        <span className="text-gray-400 text-[14px]">{stat.label}</span>
                        <span className="font-extrabold text-white text-[15px]">{stat.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 11 — RECENT PPTS TABLE */}
          <div id="recent-ppts-section" className="space-y-3 pt-6 border-t border-white/5">
            <h2 className="text-[20px] font-bold text-white">Recent Presentations</h2>
            <div className="border border-white/5 rounded-2xl overflow-hidden bg-white/[0.01]">
              <table className="w-full text-left border-collapse text-[15px]">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02] text-gray-400 font-bold text-xs uppercase tracking-wider">
                    <th className="p-4">Topic</th>
                    <th className="p-4">Date Completed</th>
                    <th className="p-4 text-center">Slides count</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    { name: "EdTech Pitch Deck", date: "Today", count: 5 },
                    { name: "Syllabus Review Slides", date: "Yesterday", count: 10 },
                    { name: "Computer Networking PPT", date: "5 Jul", count: 15 }
                  ].map(ppt => (
                    <tr key={ppt.name} className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-4 font-semibold text-white flex items-center gap-2">
                        <FileText size={16} className="text-amber-500" /> {ppt.name}
                      </td>
                      <td className="p-4 text-gray-400">{ppt.date}</td>
                      <td className="p-4 text-center text-gray-300 font-medium">{ppt.count} slides</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => loadHistoryItem(ppt.name)}
                          className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500 text-amber-500 hover:text-black font-extrabold text-xs transition-all"
                        >
                          Open
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}