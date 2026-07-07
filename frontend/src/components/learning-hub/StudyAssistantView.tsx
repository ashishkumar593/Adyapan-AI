"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileText, Sparkles, Copy, Download, Printer, Share2,
  RefreshCw, Search, CheckCircle2, ChevronRight, BookOpen, AlertCircle,
  FileDown, Layers, HelpCircle, GraduationCap, History, Plus, Check, Clock
} from "lucide-react";

interface TopicSummary {
  name: string;
  overview: string;
  keyConcepts: string[];
  importantPoints: string[];
  quickRevision: string;
  keywords: string[];
}

interface DocStats {
  pages: number;
  words: number;
  topicsFound: number;
  readingTime: string;
  summaryLength: string;
}

interface AIInsights {
  mainSubject: string;
  difficultyLevel: string;
  estimatedStudyTime: string;
  importantChapters: string[];
  repeatedTopics: string[];
}

export function StudyAssistantView() {
  const [file, setFile] = useState<File | null>(null);
  const [fileDetails, setFileDetails] = useState<{
    name: string;
    size: string;
    pages: number;
    language: string;
    time: string;
  } | null>(null);

  const [status, setStatus] = useState<"empty" | "uploading" | "processing" | "ready">("empty");
  const [currentStage, setCurrentStage] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTopic, setActiveTopic] = useState("");
  const [activeView, setActiveView] = useState<"dashboard" | "help">("dashboard");

  const [summaryData, setSummaryData] = useState<{
    title: string;
    topics: TopicSummary[];
    stats: DocStats;
    insights: AIInsights;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  const c = {
    inputBg: "rgba(0,0,0,0.4)",
    border: "rgba(255,255,255,0.08)",
  };

  const MOCK_SUMMARY = {
    title: "Operating Systems Notes",
    topics: [
      {
        name: "Introduction to OS",
        overview: "An Operating System (OS) is an intermediary between a user of a computer and the computer hardware. The purpose of an OS is to provide an environment in which a user can execute programs in a convenient and efficient manner.",
        keyConcepts: [
          "Convenience & Efficiency",
          "Hardware Abstraction Layer",
          "Resource Allocator",
          "Kernel vs Systems Programs"
        ],
        importantPoints: [
          "The main goal is convenience; the secondary goal is resource efficiency.",
          "Kernel is the one program running at all times on the computer.",
          "Bootstrap program initializes the system at power-on."
        ],
        quickRevision: "The OS manages hardware, handles security access, regulates software executions, and allocates system resources efficiently. Convenience and efficiency are its two main target design goals.",
        keywords: ["Kernel", "Bootstrap", "Resource Allocator", "System Program"]
      },
      {
        name: "Process Management",
        overview: "A program in execution is called a process. A process needs resources like CPU time, memory, files, and I/O devices to accomplish its task. The OS handles creation, scheduling, and synchronization of processes.",
        keyConcepts: [
          "Process Control Block (PCB)",
          "Process States (Ready, Running, Blocked)",
          "Context Switching",
          "Inter-Process Communication (IPC)"
        ],
        importantPoints: [
          "PCB stores CPU registers, state, program counter, and scheduling info.",
          "Context switching is pure overhead during CPU context saves and restores.",
          "Shared memory and message passing are the two primary IPC models."
        ],
        quickRevision: "Process states change from new, ready, running, waiting, to terminated. The scheduler selects ready processes for execution. Context switches save states to PCBs and load new states.",
        keywords: ["PCB", "Context Switch", "IPC", "Process State", "Scheduler"]
      },
      {
        name: "Memory Management",
        overview: "Memory management optimizes CPU utilization by keeping multiple processes in memory. It tracks every byte of memory, allocating it to active processes and reclaiming it when they terminate.",
        keyConcepts: [
          "Paging & Segmentation",
          "Address Translation (Logical vs Physical)",
          "Translation Lookaside Buffer (TLB)",
          "Fragmentation (Internal vs External)"
        ],
        importantPoints: [
          "Paging divides physical memory into fixed-sized frames and logical memory into pages.",
          "TLB is a fast hardware cache that speeds up logical-to-physical address mapping.",
          "External fragmentation is solved by compaction or paging techniques."
        ],
        quickRevision: "Memory is allocated in frames and pages to avoid external fragmentation. TLBs speed up lookup. Page tables manage logical-to-physical maps. Internal fragmentation remains in allocated pages.",
        keywords: ["Paging", "Segmentation", "TLB", "Page Fault", "Virtual Memory"]
      },
      {
        name: "Virtual Memory",
        overview: "Virtual Memory separates logical user memory from physical memory. This allows programs to run even if they are larger than the computer's physical RAM, using disk space as a fallback mapping.",
        keyConcepts: [
          "Demand Paging",
          "Page Replacement Algorithms (FIFO, LRU, Optimal)",
          "Thrashing & Working Set Model",
          "Copy-on-Write"
        ],
        importantPoints: [
          "Demand paging loads pages into memory only when they are referenced.",
          "Page replacement happens when a page fault occurs and RAM is full.",
          "Thrashing happens when a process spends more time paging than executing."
        ],
        quickRevision: "Demand paging loads pages on demand. LRU and Optimal algorithms resolve page replacement. Over-allocating memory leads to thrashing, which is managed via working set limit controls.",
        keywords: ["Demand Paging", "LRU", "Thrashing", "Page Replacement", "Working Set"]
      }
    ],
    stats: {
      pages: 86,
      words: 34500,
      topicsFound: 4,
      readingTime: "2 hrs",
      summaryLength: "1,200 words"
    },
    insights: {
      mainSubject: "Computer Science",
      difficultyLevel: "Intermediate",
      estimatedStudyTime: "2 Hours",
      importantChapters: ["Process Management", "Memory Management", "Virtual Memory"],
      repeatedTopics: ["Context Switching", "Paging vs Segmentation", "Page Replacement Algorithms"]
    }
  };

  const handleFileDrop = (droppedFile: File) => {
    setFile(droppedFile);
    setFileDetails({
      name: droppedFile.name,
      size: (droppedFile.size / (1024 * 1024)).toFixed(1) + " MB",
      pages: Math.floor(Math.random() * 80) + 15,
      language: "English",
      time: "20 seconds"
    });
    setStatus("uploading");
  };

  useEffect(() => {
    if (status !== "uploading") return;

    const stages = [
      "Upload",
      "Extract Text",
      "Analyze Content",
      "Identify Topics",
      "Generate Summary",
      "Completed"
    ];

    let currentIdx = 0;
    setCurrentStage(stages[0]);

    const timer = setInterval(() => {
      currentIdx += 1;
      if (currentIdx < stages.length) {
        setCurrentStage(stages[currentIdx]);
      } else {
        clearInterval(timer);
        setStatus("ready");
        setSummaryData(MOCK_SUMMARY);
        if (MOCK_SUMMARY.topics.length > 0) {
          setActiveTopic(MOCK_SUMMARY.topics[0].name);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileDrop(e.dataTransfer.files[0]);
    }
  };

  const handleBrowseFiles = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileDrop(e.target.files[0]);
    }
  };

  const handleScrollToTopic = (topicName: string) => {
    setActiveTopic(topicName);
    const element = document.getElementById(`topic-${topicName.replace(/\s+/g, "-")}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleCopySummary = () => {
    if (!summaryData) return;
    const txt = summaryData.topics
      .map(t => `${t.name}\n\n${t.overview}\n\nKey Concepts:\n${t.keyConcepts.map(c => `- ${c}`).join("\n")}`)
      .join("\n\n---\n\n");
    navigator.clipboard.writeText(txt);
    alert("📋 Summary copied to clipboard successfully!");
  };

  const handlePrint = () => {
    window.print();
  };

  const loadHistoryItem = (name: string) => {
    setFile({ name } as File);
    setFileDetails({
      name,
      size: "18.2 MB",
      pages: 86,
      language: "English",
      time: "20 seconds"
    });
    setStatus("ready");
    setSummaryData(MOCK_SUMMARY);
    if (MOCK_SUMMARY.topics.length > 0) {
      setActiveTopic(MOCK_SUMMARY.topics[0].name);
    }
  };

  const filteredTopics = summaryData?.topics.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.overview.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  return (
    <div className="flex flex-col gap-6 p-6 antialiased text-white max-w-7xl mx-auto w-full">
      {/* SECTION 1 — HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-[30px] font-extrabold tracking-tight text-white flex items-center gap-2">
            <BookOpen className="text-amber-500" size={24} /> Study Assistant
          </h1>
          <p className="text-[14px] text-gray-400 mt-1 max-w-2xl">
            Upload PDF, DOCX, PPT, TXT or Markdown files and let AI generate topic-wise summaries, key concepts and quick revision notes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setStatus("empty"); setFile(null); setSummaryData(null); }}
            className="h-11 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-extrabold flex items-center gap-1.5 transition-colors"
          >
            <Plus size={20} /> New Upload
          </button>
          <button
            onClick={() => {
              const el = document.getElementById("recent-documents-section");
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
          <h2 className="text-[20px] font-bold text-white">Study Assistant Help Guide</h2>
          <p className="text-[15px] text-gray-300">
            Welcome to the Document Summarizer. Drop your academic notes, textbooks, slides, or guidelines here. The engine will extract the text context, automatically identify syllabus topics, generate chapter-wise bullet reviews, list keywords, and provide a 4-5 line fast revision block suitable for exams.
          </p>
          <button
            onClick={() => setActiveView("dashboard")}
            className="h-11 px-4 rounded-2xl bg-amber-500 text-black font-extrabold text-sm hover:bg-amber-400 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      ) : (
        <>
          {/* SECTION 2 — QUICK STATS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { title: "Uploaded Documents", value: "15", desc: "+3 Today" },
              { title: "Summaries Generated", value: "58", desc: "Across all documents" },
              { title: "Topics Extracted", value: "142", desc: "Automatically detected" },
              { title: "Storage Used", value: "1.8 GB / 10 GB", desc: "Premium Storage Available" }
            ].map(stat => (
              <div key={stat.title} className="h-[170px] p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col justify-between">
                <span className="text-[14px] text-gray-400 font-medium">{stat.title}</span>
                <span className="text-3xl font-extrabold text-white">{stat.value}</span>
                <span className="text-[14px] text-amber-500 font-semibold">{stat.desc}</span>
              </div>
            ))}
          </div>

          {/* EMPTY STATE OR MAIN WORKSPACE */}
          {status === "empty" ? (
            <div className="space-y-6">
              {/* SECTION 3 — UPLOAD AREA */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-white/10 hover:border-amber-500/50 rounded-2xl p-10 text-center transition-all bg-white/[0.01] hover:bg-amber-500/[0.01] cursor-pointer group max-w-3xl mx-auto w-full"
                onClick={handleBrowseFiles}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md,.rtf"
                  className="hidden"
                  onChange={handleFileInputChange}
                />
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 group-hover:border-amber-500/30 group-hover:bg-amber-500/10 transition-colors">
                  <Upload className="text-gray-400 group-hover:text-amber-500 transition-colors" size={20} />
                </div>
                <h3 className="text-[18px] font-bold text-white mb-1">Upload Your Study Material</h3>
                <p className="text-[15px] text-gray-300">Drag & Drop or Browse Files</p>
                <p className="text-[14px] text-gray-400 mt-2">Supports PDF, DOCX, PPTX, TXT, MD · Max Size 100 MB</p>
              </div>

              {/* SECTION 4 — SUPPORTED FORMATS CARDS */}
              <div className="space-y-3">
                <h2 className="text-[20px] font-bold text-white">Supported Formats</h2>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  {[
                    { title: "PDF", list: ["Books", "Notes", "Research"] },
                    { title: "Word", list: ["Assignments", "Reports", "Notes"] },
                    { title: "PowerPoint", list: ["Slides", "Presentations"] },
                    { title: "Markdown", list: ["Programming Notes", "Documentation"] },
                    { title: "Text", list: ["Simple Notes", "Articles"] },
                    { title: "Rich Text", list: [".rtf formats"] }
                  ].map(fmt => (
                    <div key={fmt.title} className="p-4 border border-white/5 rounded-2xl bg-white/[0.01] space-y-2">
                      <span className="text-[15px] font-bold text-white block">{fmt.title}</span>
                      <div className="space-y-1">
                        {fmt.list.map(l => (
                          <span key={l} className="text-[14px] text-gray-400 block">{l}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 12 — HOW IT WORKS */}
              <div className="space-y-3">
                <h2 className="text-[20px] font-bold text-white">How It Works</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { step: "Upload", desc: "Upload any study material (lecture notes, textbooks, presentation slides)." },
                    { step: "Analyze", desc: "AI engine parses documents, extracts text context, and maps complex syllabus structures." },
                    { step: "Generate", desc: "Instantly receive core concept lists, exam prep summaries, and keywords." }
                  ].map((item, idx) => (
                    <div key={item.step} className="p-6 border border-white/5 rounded-2xl bg-white/[0.01] space-y-2">
                      <div className="text-[14px] font-black text-amber-500 uppercase tracking-widest">Step 0{idx + 1}</div>
                      <h4 className="text-[18px] font-bold text-white">{item.step}</h4>
                      <p className="text-[15px] text-gray-300 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 13 — AI FEATURES CHECKLIST */}
              <div className="p-6 border border-white/5 rounded-2xl bg-white/[0.01] space-y-4">
                <h2 className="text-[20px] font-bold text-white">Document Summarizer Features</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    "Topic Detection",
                    "AI Summary",
                    "Key Points",
                    "Quick Revision",
                    "Smart Search",
                    "Multi-format Support",
                    "Copy Summary",
                    "Export PDF",
                    "Export DOCX"
                  ].map(feat => (
                    <div key={feat} className="flex items-center gap-2 text-xs text-gray-300">
                      <CheckCircle2 size={16} className="text-amber-500" />
                      <span className="text-[14px]">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* SECTION 5 — UPLOAD PROGRESS CARD */}
              <div className="p-6 border border-white/5 bg-white/[0.01] rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <FileText className="text-amber-500" size={24} />
                    <div>
                      <h3 className="text-[18px] font-bold text-white">{fileDetails?.name || "Uploading..."}</h3>
                      <p className="text-[14px] text-gray-400">{fileDetails?.size}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase tracking-wider">
                    {status === "ready" ? "Completed" : "Processing"}
                  </span>
                </div>

                {/* SECTION 6 — AI PROCESSING TIMELINE (HORIZONTAL) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[14px] text-gray-400 mb-1">
                    <span>AI Analysis Progress</span>
                    <span className="text-amber-500 font-extrabold">{status === "ready" ? "100%" : "Analyzing..."}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-center text-xs">
                    {[
                      { name: "Upload", isActive: true },
                      { name: "Extract Text", isActive: status === "ready" || currentStage !== "Upload" },
                      { name: "Analyze Content", isActive: status === "ready" || (currentStage !== "Upload" && currentStage !== "Extract Text") },
                      { name: "Identify Topics", isActive: status === "ready" || currentStage === "Identify Topics" || currentStage === "Generate Summary" || currentStage === "Completed" },
                      { name: "Generate Summary", isActive: status === "ready" || currentStage === "Generate Summary" || currentStage === "Completed" },
                      { name: "Completed", isActive: status === "ready" }
                    ].map((step, idx) => (
                      <div
                        key={step.name}
                        className={`p-2.5 rounded-xl border transition-colors flex flex-col items-center justify-center gap-1.5 ${
                          step.isActive
                            ? "bg-amber-500/10 border-amber-500/20 text-white"
                            : "bg-white/5 border-white/10 text-gray-500"
                        }`}
                      >
                        <span className="text-[10px] font-black uppercase text-amber-500">Stage 0{idx + 1}</span>
                        <span className="text-[14px] font-semibold">{step.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* MAIN LAYOUT SPLIT: TOPICS | SUMMARIES & INSIGHTS */}
              {status === "ready" && summaryData && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  {/* LEFT OUTLINE NAVIGATOR (3 Cols) */}
                  <div className="md:col-span-3 space-y-4">
                    <div className="p-4 border border-white/5 rounded-2xl bg-white/[0.01] space-y-3">
                      <span className="text-[14px] font-black uppercase tracking-wider text-amber-500 block">
                        Detected Topics
                      </span>
                      <div className="space-y-1">
                        {summaryData.topics.map(t => (
                          <button
                            key={t.name}
                            onClick={() => handleScrollToTopic(t.name)}
                            className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                              activeTopic === t.name
                                ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                : "text-gray-400 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            <span className="truncate text-[14px]">{t.name}</span>
                            <ChevronRight size={14} className={activeTopic === t.name ? "text-amber-500" : "text-gray-600"} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* CENTRAL SUMMARY PANELS (6 Cols) */}
                  <div className="md:col-span-6 space-y-6">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        <Search size={16} />
                      </span>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search summaries..."
                        className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] focus:border-[#f59e0b] focus:outline-none rounded-xl p-3 pl-9.5 text-xs text-white"
                        style={{ background: c.inputBg, borderColor: c.border }}
                      />
                    </div>

                    <div className="space-y-6">
                      {filteredTopics.map((t, idx) => (
                        <div
                          key={t.name}
                          id={`topic-${t.name.replace(/\s+/g, "-")}`}
                          className="p-6 border rounded-2xl bg-white/[0.01] border-white/5 space-y-4"
                        >
                          <div className="flex items-center justify-between border-b pb-3 border-white/5">
                            <h3 className="text-[18px] font-bold text-white">{t.name}</h3>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                              Module 0{idx + 1}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] uppercase tracking-wider font-bold block text-amber-500/95">
                              Overview
                            </span>
                            <p className="text-[15px] leading-relaxed text-gray-300">{t.overview}</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <span className="text-[10px] uppercase tracking-wider font-bold block text-gray-400">
                                Key Concepts
                              </span>
                              <ul className="list-disc pl-4 space-y-1 text-[15px] text-gray-300">
                                {t.keyConcepts.map((item, i) => (
                                  <li key={i}>{item}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="space-y-1.5">
                              <span className="text-[10px] uppercase tracking-wider font-bold block text-gray-400">
                                Important Points
                              </span>
                              <ul className="list-disc pl-4 space-y-1 text-[15px] text-gray-300">
                                {t.importantPoints.map((item, i) => (
                                  <li key={i}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="p-3 bg-amber-500/[0.03] border border-amber-500/10 rounded-xl space-y-1">
                            <span className="text-[10px] uppercase tracking-wider font-bold block text-amber-500">
                              Quick Revision
                            </span>
                            <p className="text-[15px] leading-relaxed text-gray-300 italic">
                              "{t.quickRevision}"
                            </p>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-[10px] uppercase tracking-wider font-bold block text-gray-400">
                              Keywords
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {t.keywords.map(kw => (
                                <span
                                  key={kw}
                                  className="px-2.5 py-1 rounded-lg text-[14px] bg-white/5 border border-white/10 text-gray-400 font-medium"
                                >
                                  {kw}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Summary controls footer bar */}
                    <div className="p-3 border border-white/5 bg-white/[0.01] rounded-2xl flex flex-wrap gap-2 items-center justify-between">
                      <div className="flex gap-2">
                        <button
                          onClick={handleCopySummary}
                          className="h-11 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Copy size={20} /> Copy
                        </button>
                        <button
                          onClick={() => alert("📥 Summary PDF exported successfully.")}
                          className="h-11 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <FileDown size={20} /> Download PDF
                        </button>
                        <button
                          onClick={handlePrint}
                          className="h-11 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Printer size={20} /> Print
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          setStatus("uploading");
                        }}
                        className="h-11 px-4 rounded-xl bg-amber-500 text-black font-extrabold text-sm hover:bg-amber-400 transition-colors"
                      >
                        Regenerate Summary
                      </button>
                    </div>
                  </div>

                  {/* RIGHT SIDEBAR: INSIGHTS & METADATA (3 Cols) */}
                  <div className="md:col-span-3 space-y-4">
                    {/* AI Insights Card Grid */}
                    <div className="p-4 border border-white/5 rounded-2xl bg-white/[0.01] space-y-3">
                      <span className="text-[14px] font-black uppercase tracking-wider text-amber-500 block">
                        AI Subject Insights
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: "Main Subject", value: summaryData.insights.mainSubject },
                          { label: "Difficulty", value: summaryData.insights.difficultyLevel },
                          { label: "Reading Time", value: summaryData.insights.estimatedStudyTime },
                          { label: "Exam Priority", value: "High" }
                        ].map(insight => (
                          <div key={insight.label} className="p-3 border border-white/5 rounded-xl bg-black/20 text-center space-y-1">
                            <span className="text-[14px] text-gray-400 block">{insight.label}</span>
                            <span className="text-[15px] font-bold text-white block">{insight.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stats List */}
                    <div className="p-4 border border-white/5 rounded-2xl bg-white/[0.01] space-y-3">
                      <span className="text-[14px] font-black uppercase tracking-wider text-amber-500 block">
                        Document Details
                      </span>
                      <div className="space-y-1.5 text-xs">
                        {[
                          { label: "Pages Detected", val: summaryData.stats.pages },
                          { label: "Word Count", val: summaryData.stats.words.toLocaleString() },
                          { label: "Topics Found", val: summaryData.stats.topicsFound },
                          { label: "Reading Time", val: summaryData.stats.readingTime },
                          { label: "Summary Length", val: summaryData.stats.summaryLength }
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
            </div>
          )}

          {/* SECTION 11 — RECENT DOCUMENTS HISTORY TABLE */}
          <div id="recent-documents-section" className="space-y-3 pt-6 border-t border-white/5">
            <h2 className="text-[20px] font-bold text-white">Recent Documents</h2>
            <div className="border border-white/5 rounded-2xl overflow-hidden bg-white/[0.01]">
              <table className="w-full text-left border-collapse text-[15px]">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02] text-gray-400 font-bold text-xs uppercase tracking-wider">
                    <th className="p-4">Document</th>
                    <th className="p-4">Uploaded</th>
                    <th className="p-4 text-center">Pages</th>
                    <th className="p-4 text-center">Topics</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    { name: "Operating_System_Notes.pdf", uploaded: "Today", pages: 86, topics: 12 },
                    { name: "DBMS_Concepts.docx", uploaded: "Yesterday", pages: 112, topics: 15 },
                    { name: "ML_Introduction.pptx", uploaded: "3 Jul", pages: 92, topics: 18 }
                  ].map(doc => (
                    <tr key={doc.name} className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-4 font-semibold text-white flex items-center gap-2">
                        <FileText size={16} className="text-amber-500" /> {doc.name}
                      </td>
                      <td className="p-4 text-gray-400">{doc.uploaded}</td>
                      <td className="p-4 text-center text-gray-300 font-medium">{doc.pages}</td>
                      <td className="p-4 text-center text-gray-300 font-medium">{doc.topics}</td>
                      <td className="p-4 text-emerald-500 font-bold">Completed</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => loadHistoryItem(doc.name)}
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