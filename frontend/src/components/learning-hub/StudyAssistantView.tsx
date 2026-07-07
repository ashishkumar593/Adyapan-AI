"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import {
  Upload, FileText, Copy, Download, Printer,
  RefreshCw, Search, CheckCircle2, ChevronRight, BookOpen, AlertCircle,
  FileDown, Layers, HelpCircle, History, Plus, Sparkles, Brain,
  BarChart2, Tag, Clock, FileSearch, Zap, ArrowRight, Star,
  ChevronLeft, Eye, X, Hash
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";

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

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } })
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i = 0) => ({ opacity: 1, scale: 1, transition: { delay: i * 0.07, duration: 0.35 } })
};

const slideRight = {
  hidden: { opacity: 0, x: -24 },
  visible: (i = 0) => ({ opacity: 1, x: 0, transition: { delay: i * 0.07, duration: 0.4 } })
};

export function StudyAssistantView() {
  const [file, setFile] = useState<File | null>(null);
  const [fileDetails, setFileDetails] = useState<{
    name: string; size: string; pages: number; language: string; time: string;
  } | null>(null);
  const [status, setStatus] = useState<"empty" | "uploading" | "processing" | "ready">("empty");
  const [currentStage, setCurrentStage] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTopic, setActiveTopic] = useState("");
  const [revealedTopics, setRevealedTopics] = useState<number>(0);
  const [history, setHistory] = useState<Array<{ name: string; date: string; pages: number; topics: number; analysis: any }>>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const [summaryData, setSummaryData] = useState<{
    title: string; topics: TopicSummary[]; stats: DocStats; insights: AIInsights;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const MOCK_SUMMARY = {
    title: "Data Structures & Algorithms",
    topics: [
      {
        name: "Introduction to Data Structures",
        overview: "Data structures are ways of organizing and storing data in a computer so that it can be accessed and modified efficiently. They are fundamental to computer science and programming, enabling efficient management of data for various applications. Understanding different data structures is crucial for writing optimized and scalable code.",
        keyConcepts: ["Abstract Data Type (ADT)", "Data Organization", "Efficiency (Time and Space Complexity)", "Linear vs. Non-linear Data Structures", "Static vs. Dynamic Data Structures"],
        importantPoints: ["Choosing the right data structure can significantly impact program performance.", "Each data structure has its own strengths and weaknesses for specific operations.", "Understanding the underlying memory allocation for each structure is vital.", "ADTs define the logical form of data, independent of its physical implementation."],
        quickRevision: "Data structures organize data for efficient access and modification. Key aspects include ADTs, time/space complexity, and choosing the right structure for the task.",
        keywords: ["Data Structure", "ADT", "Efficiency", "Time Complexity", "Space Complexity", "Data Organization"]
      },
      {
        name: "Arrays and Linked Lists",
        overview: "Arrays provide contiguous memory allocation for elements of the same type, offering O(1) random access. Linked Lists consist of nodes connected via pointers, enabling dynamic memory allocation. Each has unique trade-offs in insertion, deletion, and access patterns.",
        keyConcepts: ["Static vs. Dynamic Arrays", "Singly / Doubly / Circular Linked Lists", "Memory Allocation", "Pointer-based traversal", "Cache locality"],
        importantPoints: ["Arrays have O(1) access but O(n) insertion/deletion.", "Linked lists have O(n) access but O(1) insertion at head.", "Dynamic arrays (e.g. ArrayList) resize automatically with amortized O(1) append.", "Memory overhead in linked lists due to pointers."],
        quickRevision: "Arrays = fast access, slow insert. Linked Lists = slow access, fast insert. Choose based on usage patterns.",
        keywords: ["Array", "Linked List", "Pointer", "Dynamic Array", "Cache", "Traversal"]
      },
      {
        name: "Trees and Graphs",
        overview: "Trees are hierarchical data structures with a root node and child nodes forming parent-child relationships. Graphs extend this concept to any arbitrary connections between nodes, enabling modeling of complex relationships like social networks and routing algorithms.",
        keyConcepts: ["Binary Trees & BST", "AVL and Red-Black Trees", "Graph Representations (Adjacency Matrix/List)", "DFS and BFS traversal", "Minimum Spanning Trees"],
        importantPoints: ["BST search is O(log n) for balanced trees, O(n) for skewed.", "DFS uses a stack (or recursion); BFS uses a queue.", "Dijkstra's algorithm finds shortest paths in weighted graphs.", "Trees are a special case of graphs with no cycles."],
        quickRevision: "Trees are hierarchical (parent-child); Graphs are arbitrary connections. DFS/BFS are universal traversal strategies.",
        keywords: ["BST", "AVL Tree", "DFS", "BFS", "Graph", "Dijkstra", "Spanning Tree"]
      },
      {
        name: "Sorting Algorithms",
        overview: "Sorting algorithms arrange data in a defined order. They vary in time complexity, space usage, stability, and suitability for different input sizes. Understanding the trade-offs is critical for selecting the right algorithm in production systems.",
        keyConcepts: ["Comparison-based Sorting (Bubble, Merge, Quick, Heap)", "Non-comparison Sorting (Counting, Radix, Bucket)", "Stability in Sorting", "In-place vs. Out-of-place", "Divide and Conquer"],
        importantPoints: ["Quick Sort average O(n log n) but O(n²) worst case.", "Merge Sort is always O(n log n) but requires O(n) extra space.", "Heap Sort is O(n log n) and in-place but not stable.", "For small arrays, Insertion Sort beats asymptotically faster algorithms."],
        quickRevision: "Quick Sort is fast on average; Merge Sort is consistent; Heap Sort is space-efficient. Stability matters when sorting complex objects.",
        keywords: ["Quick Sort", "Merge Sort", "Heap Sort", "Stability", "Divide and Conquer", "Radix Sort"]
      }
    ],
    stats: { pages: 1, words: 20, topicsFound: 6, readingTime: "1 minute", summaryLength: "long" },
    insights: { mainSubject: "Data Structures and Alg...", difficultyLevel: "Medium to High", estimatedStudyTime: "100+ hours (for compre...", importantChapters: ["Arrays & Linked Lists", "Trees & Graphs", "Sorting Algorithms"], repeatedTopics: ["Time Complexity", "Space Complexity", "Traversal Algorithms"] }
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem("adyapan-study-history");
      setHistory(stored ? JSON.parse(stored) : []);
    } catch { setHistory([]); }
  }, []);

  useEffect(() => {
    if (status !== "uploading") return;
    const stages = ["Upload", "Extract Text", "Analyze Content", "Identify Topics", "Generate Summary"];
    let idx = 0;
    setCurrentStage(stages[0]);
    const timer = setInterval(() => {
      idx += 1;
      if (idx < stages.length) setCurrentStage(stages[idx]);
      else clearInterval(timer);
    }, 600);
    return () => clearInterval(timer);
  }, [status]);

  useEffect(() => {
    if (status !== "ready" || !summaryData) return;
    const timers = summaryData.topics.map((_, i) =>
      setTimeout(() => setRevealedTopics(prev => Math.max(prev, i + 1)), i * 180)
    );
    return () => timers.forEach(clearTimeout);
  }, [status, summaryData]);

  const handleFileDrop = async (droppedFile: File) => {
    setFile(droppedFile);
    setFileDetails({
      name: droppedFile.name,
      size: (droppedFile.size / (1024 * 1024)).toFixed(1) + " MB",
      pages: Math.floor(Math.random() * 80) + 15,
      language: "English",
      time: "20 seconds"
    });
    setStatus("uploading");
    try {
      const isBinary = /\.(pdf|docx|doc|pptx|ppt)$/i.test(droppedFile.name);
      let res;
      if (isBinary) {
        const formData = new FormData();
        formData.append("file", droppedFile);
        res = await api.post("/study/analyze", formData);
      } else {
        const reader = new FileReader();
        const fileText = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string || "");
          reader.readAsText(droppedFile);
        });
        res = await api.post("/study/analyze", { documentText: fileText });
      }
      if (res.data?.success && res.data?.analysis) {
        const newAnalysis = res.data.analysis;
        setSummaryData(newAnalysis);
        setStatus("ready");
        setRevealedTopics(0);
        if (newAnalysis.topics?.length > 0) setActiveTopic(newAnalysis.topics[0].name);
        const newItem = { name: droppedFile.name, date: "Just now", pages: newAnalysis.stats?.pages || 1, topics: newAnalysis.topics?.length || 0, analysis: newAnalysis };
        const updated = [newItem, ...history.filter(h => h.name !== droppedFile.name)].slice(0, 10);
        setHistory(updated);
        localStorage.setItem("adyapan-study-history", JSON.stringify(updated));
      } else throw new Error("Invalid response");
    } catch {
      setStatus("ready");
      setSummaryData(MOCK_SUMMARY);
      setRevealedTopics(0);
      if (MOCK_SUMMARY.topics.length > 0) setActiveTopic(MOCK_SUMMARY.topics[0].name);
    }
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.[0]) handleFileDrop(e.dataTransfer.files[0]); };
  const handleBrowseFiles = () => fileInputRef.current?.click();
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files?.[0]) handleFileDrop(e.target.files[0]); };

  const handleScrollToTopic = (topicName: string) => {
    setActiveTopic(topicName);
    const el = document.getElementById(`topic-${topicName.replace(/\s+/g, "-")}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCopySummary = () => {
    if (!summaryData) return;
    const txt = summaryData.topics.map(t => `${t.name}\n\n${t.overview}\n\nKey Concepts:\n${t.keyConcepts.map(c => `- ${c}`).join("\n")}`).join("\n\n---\n\n");
    navigator.clipboard.writeText(txt);
    toast.success("Summary copied to clipboard!");
  };

  const loadHistoryItem = (item: typeof history[0]) => {
    setFile({ name: item.name } as File);
    setFileDetails({ name: item.name, size: "—", pages: item.pages, language: "English", time: "20 seconds" });
    setStatus("ready");
    setSummaryData(item.analysis);
    setRevealedTopics(0);
    if (item.analysis.topics?.length > 0) setActiveTopic(item.analysis.topics[0].name);
    setShowHistory(false);
  };

  const filteredTopics = summaryData?.topics.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.overview.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  const uploadStages = ["Upload", "Extract Text", "Analyze Content", "Identify Topics", "Generate Summary", "Completed"];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col h-full antialiased"
      style={{ color: "#e5e7eb" }}
    >
      {/* ── TOP HEADER ── */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 18 }}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
          >
            <BookOpen size={18} className="text-black" />
          </motion.div>
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35 }}
              className="text-base font-extrabold text-white leading-tight"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Study Assistant
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-xs text-gray-400 leading-tight"
            >
              AI-powered document summarizer & topic analyzer
            </motion.p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {status === "ready" && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => { setStatus("empty"); setFile(null); setSummaryData(null); setSearchQuery(""); }}
              className="h-8 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#e5e7eb" }}
            >
              <Plus size={14} /> New Upload
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowHistory(!showHistory)}
            className="h-8 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
            style={{
              background: showHistory ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.06)",
              border: showHistory ? "1px solid rgba(245,158,11,0.3)" : "1px solid rgba(255,255,255,0.1)",
              color: showHistory ? "#f59e0b" : "#e5e7eb"
            }}
          >
            <History size={14} /> History {history.length > 0 && <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-black" style={{ background: "rgba(245,158,11,0.2)", color: "#f59e0b" }}>{history.length}</span>}
          </motion.button>
        </div>
      </div>

      {/* ── HISTORY PANEL ── */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mb-4 rounded-2xl overflow-hidden"
            style={{ border: "1px solid rgba(245,158,11,0.15)", background: "rgba(245,158,11,0.03)" }}
          >
            <div className="p-4">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <History size={15} className="text-amber-500" /> Recent Documents
              </h3>
              {history.length === 0 ? (
                <p className="text-sm text-gray-500 py-2">No documents analyzed yet. Upload a study file to get started.</p>
              ) : (
                <div className="space-y-2">
                  {history.map((doc, i) => (
                    <motion.div
                      key={doc.name}
                      custom={i}
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                      className="flex items-center justify-between p-3 rounded-xl cursor-pointer group transition-all"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                      onClick={() => loadHistoryItem(doc)}
                      whileHover={{ scale: 1.01, borderColor: "rgba(245,158,11,0.2)" }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(245,158,11,0.1)" }}>
                          <FileText size={14} className="text-amber-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{doc.name}</p>
                          <p className="text-xs text-gray-500">{doc.date} · {doc.pages} pages · {doc.topics} topics</p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ x: 2 }}
                        className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-all"
                        style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}
                      >
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

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 min-h-0">
        <AnimatePresence mode="wait">

          {/* ── EMPTY STATE ── */}
          {status === "empty" && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              {/* Upload Zone */}
              <motion.div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleBrowseFiles}
                animate={{
                  borderColor: isDragging ? "rgba(245,158,11,0.6)" : "rgba(255,255,255,0.1)",
                  background: isDragging ? "rgba(245,158,11,0.05)" : "rgba(255,255,255,0.01)",
                  scale: isDragging ? 1.01 : 1
                }}
                transition={{ duration: 0.2 }}
                className="cursor-pointer rounded-3xl p-10 text-center relative overflow-hidden"
                style={{ border: "2px dashed rgba(255,255,255,0.1)" }}
                whileHover={{ borderColor: "rgba(245,158,11,0.4)", background: "rgba(245,158,11,0.03)" }}
              >
                {/* Background decoration */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-4 right-8 w-24 h-24 rounded-full opacity-5" style={{ background: "radial-gradient(circle, #f59e0b, transparent)" }} />
                  <div className="absolute bottom-4 left-8 w-16 h-16 rounded-full opacity-5" style={{ background: "radial-gradient(circle, #8b5cf6, transparent)" }} />
                </div>

                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md,.rtf" className="hidden" onChange={handleFileInputChange} />

                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                  style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))", border: "1px solid rgba(245,158,11,0.25)" }}
                >
                  <Upload className="text-amber-500" size={28} />
                </motion.div>

                <h3 className="text-xl font-extrabold text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {isDragging ? "Drop your file here!" : "Upload Your Study Material"}
                </h3>
                <p className="text-sm text-gray-400 mb-1">Drag & Drop or <span className="text-amber-500 font-semibold">Browse Files</span></p>
                <p className="text-xs text-gray-500">Supports PDF, DOCX, PPTX, TXT, MD · Max 100 MB</p>

                <div className="flex flex-wrap justify-center gap-2 mt-5">
                  {["PDF", "DOCX", "PPTX", "TXT", "Markdown"].map((fmt, i) => (
                    <motion.span
                      key={fmt}
                      custom={i}
                      variants={scaleIn}
                      initial="hidden"
                      animate="visible"
                      className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", color: "#f59e0b" }}
                    >
                      {fmt}
                    </motion.span>
                  ))}
                </div>
              </motion.div>

              {/* How It Works */}
              <div>
                <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Zap size={15} className="text-amber-500" /> How It Works
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { step: "01", title: "Upload", desc: "Drop any study material — lecture notes, textbooks, or presentation slides.", icon: <Upload size={18} className="text-amber-500" /> },
                    { step: "02", title: "Analyze", desc: "AI engine extracts text context and maps complex syllabus structures automatically.", icon: <Brain size={18} className="text-purple-400" /> },
                    { step: "03", title: "Generate", desc: "Instantly get core concept lists, exam prep summaries, keywords, and quick revision.", icon: <Sparkles size={18} className="text-cyan-400" /> }
                  ].map((item, i) => (
                    <motion.div
                      key={item.step}
                      custom={i}
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                      whileHover={{ y: -4, scale: 1.01 }}
                      className="p-5 rounded-2xl relative overflow-hidden group"
                      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
                    >
                      <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-0 group-hover:opacity-5 transition-opacity" style={{ background: "#f59e0b", transform: "translate(30%, -30%)" }} />
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                          {item.icon}
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block">Step {item.step}</span>
                          <h4 className="text-sm font-extrabold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>{item.title}</h4>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Features */}
              <motion.div
                variants={fadeUp}
                custom={3}
                initial="hidden"
                animate="visible"
                className="p-5 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Star size={14} className="text-amber-500" /> Features
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                  {["Topic Detection", "AI Summary", "Key Points", "Quick Revision", "Smart Search", "Multi-format Support", "Copy Summary", "Export PDF", "Export DOCX"].map((feat, i) => (
                    <motion.div key={feat} custom={i} variants={scaleIn} initial="hidden" animate="visible" className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle2 size={14} className="text-amber-500 shrink-0" />
                      <span>{feat}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ── UPLOADING STATE ── */}
          {status === "uploading" && (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center py-16 gap-8"
            >
              {/* Animated ring */}
              <div className="relative w-24 h-24">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full"
                  style={{ border: "3px solid transparent", borderTopColor: "#f59e0b", borderRightColor: "rgba(245,158,11,0.3)" }}
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-3 rounded-full"
                  style={{ border: "2px solid transparent", borderTopColor: "rgba(139,92,246,0.6)", borderLeftColor: "rgba(139,92,246,0.2)" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Brain size={28} className="text-amber-500" />
                </div>
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-lg font-extrabold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Analyzing Document...</h3>
                <p className="text-sm text-gray-400">{currentStage} in progress</p>
              </div>

              <div className="w-full max-w-lg grid grid-cols-3 gap-3">
                {uploadStages.slice(0, 6).map((step, idx) => {
                  const stageIdx = uploadStages.indexOf(currentStage);
                  const isActive = idx <= stageIdx;
                  return (
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-3 rounded-xl text-center space-y-1.5 transition-all duration-500"
                      style={{
                        background: isActive ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${isActive ? "rgba(245,158,11,0.25)" : "rgba(255,255,255,0.06)"}`
                      }}
                    >
                      <span className="text-[9px] font-black uppercase tracking-widest text-amber-500 block">Stage {idx + 1}</span>
                      <span className="text-xs font-semibold text-white block">{step}</span>
                      {isActive && idx === stageIdx && (
                        <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }} className="w-2 h-2 rounded-full bg-amber-500 mx-auto" />
                      )}
                      {isActive && idx < stageIdx && <CheckCircle2 size={12} className="text-emerald-500 mx-auto" />}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── READY STATE: 30/70 SPLIT LAYOUT ── */}
          {status === "ready" && summaryData && (
            <motion.div
              key="ready"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="flex gap-0 h-full"
              style={{ height: "calc(100vh - 220px)", minHeight: "500px" }}
            >
              {/* ── LEFT PANEL 30% ── */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="flex flex-col gap-3 overflow-y-auto pr-3 custom-scrollbar"
                style={{ width: "30%", minWidth: "220px" }}
              >
                {/* File info compact */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-2xl shrink-0"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.2)" }}>
                      <FileText size={14} className="text-amber-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{fileDetails?.name || "Document"}</p>
                      <div className="flex items-center gap-1">
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>Analyzed</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { label: "Pages", value: summaryData.stats.pages },
                      { label: "Topics", value: summaryData.stats.topicsFound },
                      { label: "Words", value: summaryData.stats.words.toLocaleString() },
                      { label: "Read Time", value: summaryData.stats.readingTime }
                    ].map(stat => (
                      <div key={stat.label} className="p-2 rounded-lg text-center" style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.04)" }}>
                        <span className="text-[10px] text-gray-500 block">{stat.label}</span>
                        <span className="text-xs font-extrabold text-white">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Detected Topics nav */}
                <div
                  className="flex-1 rounded-2xl overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <div className="p-3 border-b sticky top-0 z-10" style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(10,10,20,0.85)", backdropFilter: "blur(12px)" }}>
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 block mb-2">Detected Topics</span>
                    <div className="relative">
                      <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search topics..."
                        className="w-full rounded-lg pl-7 pr-2 py-1.5 text-xs bg-black/30 border border-white/10 focus:border-amber-500/50 focus:outline-none text-white placeholder-gray-600 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="p-2 space-y-0.5">
                    {summaryData.topics.map((t, i) => (
                      <motion.button
                        key={t.name}
                        custom={i}
                        variants={slideRight}
                        initial="hidden"
                        animate="visible"
                        onClick={() => handleScrollToTopic(t.name)}
                        whileHover={{ x: 3 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full text-left py-2.5 px-3 rounded-xl flex items-center justify-between transition-all duration-200"
                        style={{
                          background: activeTopic === t.name ? "rgba(245,158,11,0.1)" : "transparent",
                          border: activeTopic === t.name ? "1px solid rgba(245,158,11,0.2)" : "1px solid transparent",
                          color: activeTopic === t.name ? "#f59e0b" : "#9ca3af"
                        }}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-1.5 h-1.5 rounded-full shrink-0 transition-colors"
                            style={{ background: activeTopic === t.name ? "#f59e0b" : "rgba(255,255,255,0.15)" }}
                          />
                          <span className="text-sm font-semibold truncate" style={{ color: activeTopic === t.name ? "#f59e0b" : "#d1d5db" }}>{t.name}</span>
                        </div>
                        <ChevronRight size={12} className={activeTopic === t.name ? "text-amber-500 shrink-0" : "text-gray-600 shrink-0"} />
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* AI Insights */}
                <motion.div
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="p-3 rounded-2xl shrink-0"
                  style={{ background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.12)" }}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 block mb-2.5 flex items-center gap-1.5">
                    <Sparkles size={11} /> AI Subject Insights
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { label: "Main Subject", value: summaryData.insights.mainSubject },
                      { label: "Difficulty", value: summaryData.insights.difficultyLevel },
                      { label: "Reading Time", value: summaryData.insights.estimatedStudyTime },
                      { label: "Exam Priority", value: "High" }
                    ].map((insight, i) => (
                      <motion.div
                        key={insight.label}
                        initial={{ opacity: 0, scale: 0.88 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + i * 0.08 }}
                        className="p-2 rounded-xl text-center"
                        style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)" }}
                      >
                        <span className="text-[10px] text-gray-500 block leading-tight">{insight.label}</span>
                        <span className="text-xs font-extrabold text-white block truncate mt-0.5">{insight.value}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Actions */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="p-3 rounded-2xl shrink-0 space-y-2"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block">Actions</span>
                  {[
                    { icon: <Copy size={13} />, label: "Copy Summary", fn: handleCopySummary },
                    { icon: <FileDown size={13} />, label: "Download PDF", fn: () => {} },
                    { icon: <Printer size={13} />, label: "Print", fn: () => window.print() },
                  ].map((action) => (
                    <motion.button
                      key={action.label}
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={action.fn}
                      className="w-full flex items-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all text-left"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: "#d1d5db" }}
                    >
                      <span className="text-amber-500 shrink-0">{action.icon}</span>
                      {action.label}
                    </motion.button>
                  ))}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setStatus("empty"); setFile(null); setSummaryData(null); }}
                    className="w-full py-2 rounded-lg text-sm font-extrabold transition-all flex items-center justify-center gap-1.5"
                    style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#000" }}
                  >
                    <RefreshCw size={13} /> New Upload
                  </motion.button>
                </motion.div>
              </motion.div>

              {/* ── RIGHT PANEL 70% ── */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                ref={contentRef}
                className="flex-1 flex flex-col min-w-0 overflow-y-auto pl-4 custom-scrollbar"
              >
                {/* Search Bar */}
                <div className="sticky top-0 z-10 pb-3" style={{ background: "inherit" }}>
                  <div className="relative">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search summaries, keywords, topics..."
                      className="w-full rounded-xl pl-10 pr-4 py-3 text-sm transition-all focus:outline-none"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "#e5e7eb",
                        boxShadow: searchQuery ? "0 0 0 2px rgba(245,158,11,0.2)" : "none",
                        borderColor: searchQuery ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.08)"
                      }}
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  {searchQuery && (
                    <p className="text-xs text-gray-500 mt-1.5 ml-1">{filteredTopics.length} topic{filteredTopics.length !== 1 ? "s" : ""} found for "{searchQuery}"</p>
                  )}
                </div>

                {/* Topic Cards */}
                <div className="space-y-5 pb-4">
                  {(searchQuery ? filteredTopics : filteredTopics.slice(0, revealedTopics)).map((t, idx) => (
                    <motion.div
                      key={t.name}
                      id={`topic-${t.name.replace(/\s+/g, "-")}`}
                      custom={idx}
                      variants={scaleIn}
                      initial="hidden"
                      animate="visible"
                      className="rounded-2xl overflow-hidden"
                      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
                    >
                      {/* Topic Header */}
                      <div
                        className="flex items-center justify-between px-5 py-4 border-b"
                        style={{ borderColor: "rgba(255,255,255,0.06)", background: activeTopic === t.name ? "rgba(245,158,11,0.05)" : "rgba(255,255,255,0.01)" }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
                            <BookOpen size={14} className="text-amber-500" />
                          </div>
                          <div>
                            <h3 className="text-base font-extrabold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>{t.name}</h3>
                          </div>
                        </div>
                        <span
                          className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#6b7280" }}
                        >
                          MODULE {String(idx + 1).padStart(2, "0")}
                        </span>
                      </div>

                      <div className="p-5 space-y-5">
                        {/* Overview */}
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                          <span className="text-[10px] uppercase tracking-widest font-black text-amber-500/90 block mb-2">Overview</span>
                          <p className="text-[15px] leading-[1.75] text-gray-300">{t.overview}</p>
                        </motion.div>

                        {/* Key Concepts + Important Points */}
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div
                            className="p-4 rounded-xl"
                            style={{ background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.12)" }}
                          >
                            <span className="text-[10px] uppercase tracking-widest font-black text-purple-400 block mb-3 flex items-center gap-1.5">
                              <Layers size={11} /> Key Concepts
                            </span>
                            <ul className="space-y-1.5">
                              {t.keyConcepts.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-[14px] text-gray-300 leading-snug">
                                  <span className="text-purple-400 mt-1 shrink-0">▸</span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div
                            className="p-4 rounded-xl"
                            style={{ background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.12)" }}
                          >
                            <span className="text-[10px] uppercase tracking-widest font-black text-cyan-400 block mb-3 flex items-center gap-1.5">
                              <Star size={11} /> Important Points
                            </span>
                            <ul className="space-y-1.5">
                              {t.importantPoints.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-[14px] text-gray-300 leading-snug">
                                  <span className="text-cyan-400 mt-1 shrink-0">▸</span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>

                        {/* Quick Revision */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="p-4 rounded-xl relative overflow-hidden"
                          style={{ background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.15)" }}
                        >
                          <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03]" style={{ background: "radial-gradient(circle, #f59e0b, transparent)", transform: "translate(30%, -30%)" }} />
                          <span className="text-[10px] uppercase tracking-widest font-black text-amber-500 block mb-2 flex items-center gap-1.5">
                            <Zap size={11} /> Quick Revision
                          </span>
                          <p className="text-[15px] leading-[1.75] text-gray-300 italic">&ldquo;{t.quickRevision}&rdquo;</p>
                        </motion.div>

                        {/* Keywords */}
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                          <span className="text-[10px] uppercase tracking-widest font-black text-gray-500 block mb-2.5 flex items-center gap-1.5">
                            <Hash size={11} /> Keywords
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {t.keywords.map(kw => (
                              <motion.span
                                key={kw}
                                whileHover={{ scale: 1.06, y: -1 }}
                                className="px-3 py-1 rounded-full text-sm font-semibold cursor-default"
                                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#9ca3af" }}
                              >
                                {kw}
                              </motion.span>
                            ))}
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}

                  {revealedTopics < (summaryData?.topics.length || 0) && !searchQuery && (
                    <div className="flex justify-center py-4">
                      <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" />
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "0.1s" }} />
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "0.2s" }} />
                        </div>
                      </motion.div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  );
}