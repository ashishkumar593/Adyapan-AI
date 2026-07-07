"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Download, CheckCircle2, Cpu, Loader2, Plus, History,
  HelpCircle, ChevronRight, Search, Copy, FileDown, Printer, FileText, Check
} from "lucide-react";
import { useSocket } from "@/context/SocketContext";

interface NoteSection {
  title: string;
  content: string;
  bulletPoints: string[];
}

export function NotesGeneratorView() {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState("");
  const [notesData, setNotesData] = useState<{
    topic: string;
    sections: NoteSection[];
    wordCount: number;
    studyTime: string;
    difficulty: string;
  } | null>(null);

  const [topic, setTopic] = useState("Database Management Systems");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [noteType, setNoteType] = useState("Detailed Notes");
  const [activeSection, setActiveSection] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState<"dashboard" | "help">("dashboard");

  const { socket, isConnected } = useSocket();
  const userIdRef = useRef<string>("");

  const MOCK_NOTES = {
    topic: "Database Management Systems",
    sections: [
      {
        title: "Relational Data Model",
        content: "The relational data model represents data in the form of relations (tables). Each relation consists of rows (tuples) and columns (attributes). It is the most widely used data model in modern database management.",
        bulletPoints: [
          "Relation schema defines the table structure (attributes).",
          "Keys (Primary key, foreign key) enforce entity and referential integrity.",
          "Relational algebra provides the formal query operations (select, project, join)."
        ]
      },
      {
        title: "Normalization & Normal Forms",
        content: "Normalization is the process of organizing database fields and tables to minimize redundancy and dependency. It divides large tables into smaller ones and defines relationships between them.",
        bulletPoints: [
          "First Normal Form (1NF) ensures atomic values in attributes.",
          "Second Normal Form (2NF) removes partial dependencies.",
          "Third Normal Form (3NF) removes transitive dependencies.",
          "Boyce-Codd Normal Form (BCNF) is a stronger version of 3NF."
        ]
      },
      {
        title: "Transaction & ACID Properties",
        content: "A transaction is a single logical unit of database processing. To ensure reliability and consistency, databases enforce the ACID rules on every transaction executed.",
        bulletPoints: [
          "Atomicity: Either the whole transaction succeeds, or none of it does.",
          "Consistency: Database transitions from one valid state to another.",
          "Isolation: Concurrent transactions run without interfering with each other.",
          "Durability: Committed data is permanently saved in the system."
        ]
      }
    ],
    wordCount: 1850,
    studyTime: "45 mins",
    difficulty: "Intermediate"
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem("adyapan-user");
      if (raw) userIdRef.current = (JSON.parse(raw) as { id?: string })?.id ?? "";
    } catch { /* */ }
  }, []);

  const handleGenerate = () => {
    setGenerating(true);
    setProgress(0);
    setStatusMsg("Starting notes generator pipeline...");

    const stages = [
      { msg: "Extracting core syllabus...", prg: 20 },
      { msg: "Analyzing subject requirements...", prg: 40 },
      { msg: "Structuring chapter-wise layout...", prg: 70 },
      { msg: "Generating notes modules...", prg: 90 },
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
        setNotesData(MOCK_NOTES);
        if (MOCK_NOTES.sections.length > 0) {
          setActiveSection(MOCK_NOTES.sections[0].title);
        }
      }
    }, 1000);
  };

  const handleScrollToSection = (title: string) => {
    setActiveSection(title);
    const element = document.getElementById(`section-${title.replace(/\s+/g, "-")}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const loadHistoryItem = (topicName: string) => {
    setTopic(topicName);
    setNotesData(MOCK_NOTES);
    if (MOCK_NOTES.sections.length > 0) {
      setActiveSection(MOCK_NOTES.sections[0].title);
    }
  };

  const filteredSections = notesData?.sections.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.content.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="flex flex-col gap-6 p-6 antialiased text-white max-w-7xl mx-auto w-full">
      {/* SECTION 1 — HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-[30px] font-extrabold tracking-tight text-white flex items-center gap-2">
            <BookOpen className="text-amber-500" size={24} /> Notes Generator
          </h1>
          <p className="text-[14px] text-gray-400 mt-1 max-w-2xl">
            Generate comprehensive, topic-wise study notes with AI.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setNotesData(null); setGenerating(false); }}
            className="h-11 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-extrabold flex items-center gap-1.5 transition-colors"
          >
            <Plus size={20} /> Create New
          </button>
          <button
            onClick={() => {
              const el = document.getElementById("recent-notes-section");
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
          <h2 className="text-[20px] font-bold text-white">Notes Generator Help</h2>
          <p className="text-[15px] text-gray-300">
            Define any topic or copy-paste core syllabus items. The generator partitions the topic into logical subdivisions, structures core content blocks, lists key terms, and outputs structured bullet points suitable for study revisions.
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
              { title: "Notes Created", value: "28", desc: "Across all subjects" },
              { title: "Average Pages", value: "14 pages", desc: "Highly structured content" },
              { title: "Formats Generated", value: "4 formats", desc: "PDF, DOCX, Markdown, Text" },
              { title: "Total Hours Saved", value: "24 Hours", desc: "Premium Efficiency Available" }
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
                <h3 className="text-[18px] font-bold text-white">Generating Notes via Pipeline</h3>
                <p className="text-[14px] text-gray-400 mt-1">{statusMsg}</p>
              </div>
              <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <div className="text-[14px] font-bold text-amber-500 flex items-center gap-2">
                <Loader2 className="animate-spin" size={14} /> {progress}% Complete
              </div>
            </div>
          ) : !notesData ? (
            <div className="space-y-6">
              {/* SECTION 3 — CONFIGURATION WORKSPACE */}
              <div className="p-6 border border-white/5 bg-white/[0.01] rounded-2xl max-w-3xl mx-auto w-full space-y-6">
                <h3 className="text-[18px] font-bold text-white">Configure Notes Outline</h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[14px] font-semibold text-gray-300">Topic or Subject</label>
                    <input
                      type="text"
                      value={topic}
                      onChange={e => setTopic(e.target.value)}
                      placeholder="e.g. Operating Systems, Advanced Data Structures"
                      className="w-full h-12 bg-black/20 border border-white/10 rounded-xl px-4 text-[15px] text-white focus:outline-none focus:border-amber-500/50"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[14px] font-semibold text-gray-300">Difficulty</label>
                      <select
                        value={difficulty}
                        onChange={e => setDifficulty(e.target.value)}
                        className="w-full h-12 bg-black/20 border border-white/10 rounded-xl px-4 text-[15px] text-gray-300 focus:outline-none focus:border-amber-500/50 appearance-none"
                      >
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[14px] font-semibold text-gray-300">Note Type</label>
                      <select
                        value={noteType}
                        onChange={e => setNoteType(e.target.value)}
                        className="w-full h-12 bg-black/20 border border-white/10 rounded-xl px-4 text-[15px] text-gray-300 focus:outline-none focus:border-amber-500/50 appearance-none"
                      >
                        <option>Detailed Notes</option>
                        <option>Short Revision</option>
                        <option>Formulas Only</option>
                        <option>Exam Cheat Sheet</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleGenerate}
                    className="h-11 flex-1 rounded-xl bg-amber-500 text-black font-extrabold text-sm hover:bg-amber-400 transition-colors flex items-center justify-center gap-2"
                  >
                    <BookOpen size={20} /> Generate Notes
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
                <h2 className="text-[20px] font-bold text-white">Choose from Templates</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { title: "Exam Study Guide", desc: "Structured to highlight essential exam components, sample review formulations, and critical milestones." },
                    { title: "Key Terms & Glossaries", desc: "Filters subject files to isolate definitions, equations, algorithms, and core keywords." },
                    { title: "Interview Prep Notes", desc: "Formulates questions, brief code samples, and conceptual outlines suitable for placement audits." }
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
                    { step: "Configure topic", desc: "Input a study module brief or syllabus guidelines, choose details level." },
                    { step: "Draft Outline", desc: "The generator designs structure partitions and details theoretical summaries." },
                    { step: "Review & Export", desc: "Open notes directly, copy sections, or download formatted study materials." }
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
                    Chapters Navigation
                  </span>
                  <div className="space-y-1">
                    {notesData.sections.map(s => (
                      <button
                        key={s.title}
                        onClick={() => handleScrollToSection(s.title)}
                        className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                          activeSection === s.title
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                            : "text-gray-400 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <span className="truncate text-[14px]">{s.title}</span>
                        <ChevronRight size={14} className={activeSection === s.title ? "text-amber-500" : "text-gray-600"} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* MAIN CONTENT PANELS (6 Cols) */}
              <div className="md:col-span-6 space-y-6">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <Search size={16} />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search notes content..."
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] focus:border-[#f59e0b] focus:outline-none rounded-xl p-3 pl-9.5 text-xs text-white"
                    style={{ background: "rgba(0,0,0,0.4)", borderColor: "rgba(255,255,255,0.08)" }}
                  />
                </div>

                <div className="space-y-6">
                  {filteredSections.map((s, idx) => (
                    <div
                      key={s.title}
                      id={`section-${s.title.replace(/\s+/g, "-")}`}
                      className="p-6 border rounded-2xl bg-white/[0.01] border-white/5 space-y-4"
                    >
                      <div className="flex items-center justify-between border-b pb-3 border-white/5">
                        <h3 className="text-[18px] font-bold text-white">{s.title}</h3>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                          Section 0{idx + 1}
                        </span>
                      </div>

                      <p className="text-[15px] leading-relaxed text-gray-300">{s.content}</p>

                      <div className="space-y-2">
                        <span className="text-[10px] uppercase tracking-wider font-bold block text-amber-500">
                          Syllabus Review Points
                        </span>
                        <ul className="list-disc pl-4 space-y-1 text-[15px] text-gray-300">
                          {s.bulletPoints.map((b, i) => (
                            <li key={i}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary controls footer bar */}
                <div className="p-3 border border-white/5 bg-white/[0.01] rounded-2xl flex flex-wrap gap-2 items-center justify-between">
                  <div className="flex gap-2">
                    <button
                      onClick={() => alert("📋 Notes copied to clipboard.")}
                      className="h-11 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Copy size={20} /> Copy
                    </button>
                    <button
                      onClick={() => alert("📥 Notes PDF exported successfully.")}
                      className="h-11 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <FileDown size={20} /> Export PDF
                    </button>
                  </div>
                  <button
                    onClick={() => { setNotesData(null); }}
                    className="h-11 px-4 rounded-xl bg-amber-500 text-black font-extrabold text-sm hover:bg-amber-400 transition-colors"
                  >
                    Generate New Notes
                  </button>
                </div>
              </div>

              {/* RIGHT SIDEBAR (3 Cols) */}
              <div className="md:col-span-3 space-y-4">
                <div className="p-4 border border-white/5 rounded-2xl bg-white/[0.01] space-y-3">
                  <span className="text-[14px] font-black uppercase tracking-wider text-amber-500 block">
                    AI Notes Insights
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { label: "Main Topic", value: "DBMS" },
                      { label: "Difficulty", value: notesData.difficulty },
                      { label: "Words", value: notesData.wordCount },
                      { label: "Study Time", value: notesData.studyTime }
                    ].map(insight => (
                      <div key={insight.label} className="p-3 border border-white/5 rounded-xl bg-black/20 text-center space-y-1">
                        <span className="text-[14px] text-gray-400 block">{insight.label}</span>
                        <span className="text-[15px] font-bold text-white block">{insight.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 11 — RECENT NOTES TABLE */}
          <div id="recent-notes-section" className="space-y-3 pt-6 border-t border-white/5">
            <h2 className="text-[20px] font-bold text-white">Recent Notes</h2>
            <div className="border border-white/5 rounded-2xl overflow-hidden bg-white/[0.01]">
              <table className="w-full text-left border-collapse text-[15px]">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02] text-gray-400 font-bold text-xs uppercase tracking-wider">
                    <th className="p-4">Topic</th>
                    <th className="p-4">Date Created</th>
                    <th className="p-4">Type</th>
                    <th className="p-4 text-center">Sections</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    { name: "Database Management Systems", date: "Today", type: "Detailed Notes", sections: 3 },
                    { name: "Data Structures & Algorithms", date: "Yesterday", type: "Short Revision", sections: 5 },
                    { name: "Compiler Design Guide", date: "4 Jul", type: "Exam Cheat Sheet", sections: 4 }
                  ].map(note => (
                    <tr key={note.name} className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-4 font-semibold text-white flex items-center gap-2">
                        <FileText size={16} className="text-amber-500" /> {note.name}
                      </td>
                      <td className="p-4 text-gray-400">{note.date}</td>
                      <td className="p-4 text-gray-300 font-medium">{note.type}</td>
                      <td className="p-4 text-center text-gray-300 font-medium">{note.sections}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => loadHistoryItem(note.name)}
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
