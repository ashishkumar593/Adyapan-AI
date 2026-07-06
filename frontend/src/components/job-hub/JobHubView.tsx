"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase, Search, Filter, MapPin, Calendar, DollarSign, Send,
  Sparkles, CheckCircle2, XCircle, Info, Heart, ArrowRight, Share2,
  Trash2, Plus, Clock, MessageSquare, Award, ArrowLeft, ArrowRightLeft,
  ChevronRight, AlertCircle, FileText, UserCheck, Play, PlusCircle, Check, RefreshCw
} from "lucide-react";

interface Job {
  id: string;
  role: string;
  company: string;
  logoBg: string;
  location: string;
  mode: "Remote" | "Hybrid" | "On-site";
  type: "Full-Time" | "Part-Time" | "Contract";
  salary: string;
  experience: string;
  skills: string[];
  description: string;
  responsibilities: string[];
  eligibility: string[];
  deadline: string;
  website: string;
}

interface Referral {
  id: string;
  company: string;
  role: string;
  deadline: string;
  status: "Requested" | "Accepted" | "Under Review";
  outreachMsg?: string;
}

interface HiringChallenge {
  id: string;
  title: string;
  category: "Coding" | "SQL" | "Machine Learning" | "Web Dev";
  difficulty: "Easy" | "Medium" | "Hard";
  duration: string;
  eligibility: string;
  company: string;
  score?: number;
  rank?: number;
  completed: boolean;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface JobHubViewProps {
  setView: (v: any) => void;
  activeModule?: string;
  theme?: string;
}

const MOCK_JOBS: Job[] = [
  {
    id: "job-1",
    role: "Full Stack Engineer",
    company: "Meta",
    logoBg: "#0668E1",
    location: "Menlo Park, CA (Hybrid)",
    mode: "Hybrid",
    type: "Full-Time",
    salary: "$140,000 - $180,000 / yr",
    experience: "1-3 Years",
    skills: ["React", "Node.js", "Express", "PostgreSQL", "System Design"],
    description: "Join the Meta Infrastructure Tools team to help build high-performance developer tools, dashboards, and automated service pipelines for global systems.",
    responsibilities: [
      "Design and maintain reusable React components and micro-frontend structures.",
      "Optimize Node.js server performance and postgres query configurations.",
      "Collaborate with reliability engineering to configure system scale and parameters."
    ],
    eligibility: [
      "Bachelor's or Master's degree in Computer Science, or equivalent engineering background.",
      "1+ years of professional development experience with React and Node."
    ],
    deadline: "2026-09-15",
    website: "https://careers.meta.com"
  },
  {
    id: "job-2",
    role: "AI Engineer",
    company: "Google",
    logoBg: "#4285F4",
    location: "Remote, US",
    mode: "Remote",
    type: "Full-Time",
    salary: "$160,000 - $210,000 / yr",
    experience: "3+ Years",
    skills: ["Python", "TensorFlow", "PyTorch", "Transformers", "LLMs"],
    description: "Work on cutting-edge generative AI applications in Google Cloud. You will integrate foundation models into client products and train custom adapter layers.",
    responsibilities: [
      "Develop model integration logic and handle prompt safety parameters.",
      "Deploy inference models efficiently on cloud clusters using Kubernetes.",
      "Fine-tune pre-trained models on specialized domain datasets."
    ],
    eligibility: [
      "Masters or PhD in CS, ML, or related quantitative discipline.",
      "Experience deploying deep learning pipelines in cloud settings."
    ],
    deadline: "2026-08-30",
    website: "https://careers.google.com"
  },
  {
    id: "job-3",
    role: "Software Development Engineer (SDE-1)",
    company: "Amazon",
    logoBg: "#FF9900",
    location: "Bangalore, India",
    mode: "On-site",
    type: "Full-Time",
    salary: "₹18,000,000 - ₹24,000,000 / yr",
    experience: "0-2 Years",
    skills: ["Java", "Spring Boot", "AWS", "SQL", "Data Structures"],
    description: "Build robust, scalable transaction backends inside Amazon Fulfillment Services. Participate in design discussions, write tests, and support deployment loops.",
    responsibilities: [
      "Develop reliable RESTful endpoints and microservice architectures.",
      "Optimize database queries and transaction locks.",
      "Write unit and integration tests to maintain high software coverage standards."
    ],
    eligibility: [
      "B.Tech/M.Tech in CS or equivalent field.",
      "Strong coding foundation in Java/C++ and core algorithmic structures."
    ],
    deadline: "2026-09-05",
    website: "https://amazon.jobs"
  }
];

const MOCK_CHALLENGES: HiringChallenge[] = [
  { id: "ch-1", title: "Global Coding Hackathon", category: "Coding", difficulty: "Medium", duration: "3 Hours", eligibility: "Open to all students", company: "Microsoft", completed: false },
  { id: "ch-2", title: "PostgreSQL Optimizer Duel", category: "SQL", difficulty: "Hard", duration: "1.5 Hours", eligibility: "SDE-2 eligible candidates", company: "Uber", completed: true, score: 92, rank: 14 },
  { id: "ch-3", title: "DeepLearning Classifier Challenge", category: "Machine Learning", difficulty: "Hard", duration: "6 Hours", eligibility: "Graduating students only", company: "Nvidia", completed: false }
];

export function JobHubView({ setView, activeModule = "job-hub", theme = "dark" }: JobHubViewProps) {
  const isDark = theme === "dark";
  const c = {
    bg: isDark ? "#080710" : "#f0f4ff",
    surface: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
    surfaceHover: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
    border: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)",
    text: isDark ? "#ffffff" : "#0f172a",
    textSec: isDark ? "rgba(255,255,255,0.7)" : "#475569",
    textMuted: isDark ? "rgba(255,255,255,0.4)" : "#94a3b8",
    primary: "#f59e0b",
    primaryDark: "#d97706",
    cardBg: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
    inputBg: isDark ? "rgba(0,0,0,0.4)" : "#ffffff",
    green: "#10b981",
    red: "#ef4444",
  };

  // Tab State: "matching" | "jd-match" | "referrals" | "challenges"
  const [tab, setTab] = useState<"matching" | "jd-match" | "referrals" | "challenges">("matching");

  // Search & Filter State (Matching)
  const [searchQuery, setSearchQuery] = useState("");
  const [locFilter, setLocFilter] = useState("All");
  const [modeFilter, setModeFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  // Saved / Modals
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [appliedCount, setAppliedCount] = useState(3);

  // Resume vs JD Analyzer state
  const [jdText, setJdText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [matchReport, setMatchReport] = useState<any | null>(null);

  // Referrals state
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [refCompany, setRefCompany] = useState("Google");
  const [refRole, setRefRole] = useState("AI Engineer");
  const [refNotes, setRefNotes] = useState("");

  // AI Assistant panel state
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hello! I am your Adyapan AI Career Assistant. Ask me to find SDE jobs, audit your resume against a job description, or generate referral emails!" }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync tab with activeModule from props
  useEffect(() => {
    if (activeModule === "job-matching") setTab("matching");
    else if (activeModule === "job-jd-match") setTab("jd-match");
    else if (activeModule === "job-referrals") setTab("referrals");
    else if (activeModule === "job-challenges") setTab("challenges");
  }, [activeModule]);

  // Load tracker databases from localStorage
  useEffect(() => {
    const savedSaves = localStorage.getItem("ady-job-saves");
    if (savedSaves) {
      try { setSavedJobs(JSON.parse(savedSaves)); } catch { /* ignore */ }
    }

    const savedRefs = localStorage.getItem("ady-job-referrals");
    if (savedRefs) {
      try { setReferrals(JSON.parse(savedRefs)); } catch { /* ignore */ }
    } else {
      const defaults: Referral[] = [
        { id: "ref-1", company: "Google", role: "AI Engineer", deadline: "2026-08-30", status: "Requested", outreachMsg: "Dear Hiring Team,\n\nI am writing to express my interest..." }
      ];
      setReferrals(defaults);
      localStorage.setItem("ady-job-referrals", JSON.stringify(defaults));
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleToggleSaveJob = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    let updated: string[];
    if (savedJobs.includes(id)) {
      updated = savedJobs.filter(x => x !== id);
    } else {
      updated = [...savedJobs, id];
    }
    setSavedJobs(updated);
    localStorage.setItem("ady-job-saves", JSON.stringify(updated));
  };

  const handleRunJdAnalyzer = async () => {
    if (!jdText.trim() || analyzing) return;
    setAnalyzing(true);
    setMatchReport(null);

    try {
      await new Promise(r => setTimeout(r, 2000));
      // Mock compatibility evaluation
      setMatchReport({
        overallScore: 78,
        skillsMatch: 80,
        experienceMatch: 70,
        educationMatch: 90,
        atsCompatibility: 85,
        keywordsFound: ["React", "Node.js", "Express", "SQL"],
        keywordsMissing: ["TypeScript", "System Design", "Microservices"],
        keywordsSuggested: ["Next.js", "PostgreSQL", "Docker", "REST API"],
        missingSkills: ["TypeScript", "System Design"],
        learningPath: [
          "Study TypeScript basics via Microsoft Learn.",
          "Read 'System Design Primer' on GitHub to understand architectural concepts."
        ],
        suggestions: [
          "Rewrite your Project 1 summary to focus on React scalability and state hooks.",
          "Add 'REST API design' directly to your skills section.",
          "Include a sentence explaining postgres database caching in your experience description."
        ],
        strengths: ["Excellent backend Node alignment", "Solid education background"],
        improvements: ["Needs stronger system design concepts", "Add modern TypeScript syntax keywords"],
        hiringProbability: "High",
        readiness: "Ready"
      });
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRequestReferralSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refCompany.trim() || !refRole.trim()) return;

    // Generate simulated outreach message
    const generatedOutreach = `Hi there,\n\nI hope this message finds you well.\n\nI recently came across the ${refRole} opening at ${refCompany} and was incredibly impressed by the team's work. With my background in React, Next.js, and Python, I believe I could contribute significantly to your goals. Would you be open to reviewing my resume for a potential referral?\n\nThank you,\nCandidate`;

    const newRef: Referral = {
      id: `ref-${Date.now()}`,
      company: refCompany.trim(),
      role: refRole.trim(),
      deadline: new Date(Date.now() + 30*24*60*60*1000).toISOString().split("T")[0],
      status: "Requested",
      outreachMsg: generatedOutreach
    };

    const updated = [newRef, ...referrals];
    setReferrals(updated);
    localStorage.setItem("ady-job-referrals", JSON.stringify(updated));

    // Clear form
    setRefCompany("Google");
    setRefRole("AI Engineer");
    setRefNotes("");
    setShowReferralModal(false);
  };

  const handleAssistantSend = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const promptText = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", content: promptText }]);
    setChatLoading(true);

    try {
      await new Promise(r => setTimeout(r, 1500));
      let responseText = "I parsed your query but didn't find any direct triggers. I can help search for SDE jobs, audit resume files, or draft outreach letters. Try:\n- *'Show remote jobs'* \n- *'Draft referral letter'*";

      if (promptText.toLowerCase().includes("remote")) {
        setModeFilter("Remote");
        setTab("matching");
        responseText = "🔍 **Action Triggered**: Matching filters updated to **Remote** jobs. You can see updated listings in the **Job Matching** tab.";
      } else if (promptText.toLowerCase().includes("referral")) {
        setTab("referrals");
        responseText = "👥 **Action Triggered**: Navigated to **Job Referrals**. You can click 'Request Referral' to instantly auto-generate customized outreach messages.";
      } else if (promptText.toLowerCase().includes("compare") || promptText.toLowerCase().includes("jd")) {
        setTab("jd-match");
        responseText = "📄 **Action Triggered**: Navigated to **Resume vs JD Match**. Paste your target Job Description there to calculate ATS compatibility.";
      } else if (promptText.toLowerCase().includes("challenge")) {
        setTab("challenges");
        responseText = "🏆 **Action Triggered**: Navigated to **Hiring Challenges** to practice mock tests and review coding leaderboards.";
      }

      setChatMessages(prev => [...prev, { role: "assistant", content: responseText }]);
    } catch (err) {
      console.error(err);
    } finally {
      setChatLoading(false);
    }
  };

  const filteredJobs = MOCK_JOBS.filter(job => {
    const matchesSearch =
      job.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLoc = locFilter === "All" || job.location.toLowerCase().includes(locFilter.toLowerCase());
    const matchesMode = modeFilter === "All" || job.mode === modeFilter;
    const matchesType = typeFilter === "All" || job.type === typeFilter;

    return matchesSearch && matchesLoc && matchesMode && matchesType;
  });

  return (
    <div className="relative flex flex-col h-full min-h-[calc(100vh-120px)]" style={{ color: c.text }}>
      <div className="flex-1 flex flex-col gap-6">

        {/* ==================== 1. DASHBOARD OVERVIEW CARDS ==================== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
          {[
            { label: "Recommended Jobs", val: `${MOCK_JOBS.length}`, icon: <Briefcase className="text-amber-500" /> },
            { label: "Resume Match Score", val: "85%", icon: <Award className="text-cyan-500" /> },
            { label: "Saved Listings", val: `${savedJobs.length}`, icon: <Heart className="text-red-500 fill-current" /> },
            { label: "Active Applications", val: `${appliedCount}`, icon: <CheckCircle2 className="text-emerald-500" /> }
          ].map((card, idx) => (
            <div key={idx} className="p-4 border rounded-xl flex items-center justify-between" style={{ background: c.cardBg, borderColor: c.border }}>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: c.textSec }}>{card.label}</span>
                <span className="text-xl font-extrabold block" style={{ fontFamily: "'Outfit', sans-serif" }}>{card.val}</span>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 shrink-0">
                {card.icon}
              </div>
            </div>
          ))}
        </div>

        {/* ==================== 2. NAVIGATION TABS ==================== */}
        <div className="flex justify-between items-center border-b shrink-0" style={{ borderColor: c.border }}>
          <div className="flex gap-2">
            {[
              { id: "matching" as const, label: "Job Matching" },
              { id: "jd-match" as const, label: "Resume vs JD Match" },
              { id: "referrals" as const, label: "Job Referrals" },
              { id: "challenges" as const, label: "Hiring Challenges" }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`py-2.5 px-4 font-bold text-xs border-b-2 transition-colors -mb-[1px]`}
                style={{
                  color: tab === t.id ? c.primary : c.textSec,
                  borderColor: tab === t.id ? c.primary : "transparent"
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setAssistantOpen(!assistantOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20"
          >
            <Sparkles size={12} className="animate-pulse" /> AI Assistant
          </button>
        </div>

        {/* ==================== 3. CONTENT AREA ==================== */}
        <div className="flex-1 min-h-0">
          <AnimatePresence mode="wait">

            {/* TAB A: JOB MATCHING */}
            {tab === "matching" && (
              <motion.div
                key="matching"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 flex flex-col h-full"
              >
                {/* Search & Advanced Filters */}
                <div className="p-4 rounded-xl border space-y-3" style={{ background: c.cardBg, borderColor: c.border }}>
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: c.textMuted }}>
                        <Search size={14} />
                      </span>
                      <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by job title, company name, tech stack..."
                        className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] focus:border-[#f59e0b] focus:outline-none rounded-lg py-2 pl-9 pr-4 text-xs"
                        style={{ background: c.inputBg, color: c.text, borderColor: c.border }}
                      />
                    </div>
                  </div>

                  {/* Filters Row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider block" style={{ color: c.textSec }}>Location</label>
                      <select
                        value={locFilter}
                        onChange={(e) => setLocFilter(e.target.value)}
                        className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] focus:border-[#f59e0b] focus:outline-none rounded-lg p-2 text-xs"
                        style={{ background: c.inputBg, color: c.text, borderColor: c.border }}
                      >
                        <option value="All">All Locations</option>
                        <option value="Menlo Park">Menlo Park</option>
                        <option value="Bangalore">Bangalore</option>
                        <option value="US">United States (US)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider block" style={{ color: c.textSec }}>Work Mode</label>
                      <select
                        value={modeFilter}
                        onChange={(e) => setModeFilter(e.target.value)}
                        className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] focus:border-[#f59e0b] focus:outline-none rounded-lg p-2 text-xs"
                        style={{ background: c.inputBg, color: c.text, borderColor: c.border }}
                      >
                        <option value="All">All Modes</option>
                        <option value="Remote">Remote</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="On-site">On-site</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider block" style={{ color: c.textSec }}>Job Type</label>
                      <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] focus:border-[#f59e0b] focus:outline-none rounded-lg p-2 text-xs"
                        style={{ background: c.inputBg, color: c.text, borderColor: c.border }}
                      >
                        <option value="All">All Types</option>
                        <option value="Full-Time">Full-Time</option>
                        <option value="Part-Time">Part-Time</option>
                        <option value="Contract">Contract</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Job Cards */}
                {filteredJobs.length === 0 ? (
                  <div className="text-center py-12 border border-dashed rounded-xl" style={{ borderColor: c.border }}>
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50 text-gray-400" />
                    <span className="text-xs font-semibold" style={{ color: c.textMuted }}>No jobs match your search parameters.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredJobs.map(job => {
                      const isSaved = savedJobs.includes(job.id);
                      return (
                        <div
                          key={job.id}
                          onClick={() => setSelectedJob(job)}
                          className="p-5 border rounded-xl hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group"
                          style={{ background: c.cardBg, borderColor: c.border }}
                        >
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <div className="flex gap-3 items-center">
                                <div
                                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0"
                                  style={{ background: job.logoBg }}
                                >
                                  {job.company[0]}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-extrabold text-sm truncate" style={{ color: c.text, fontFamily: "'Outfit', sans-serif" }}>{job.role}</h4>
                                  <span className="text-[10px] font-bold" style={{ color: c.textSec }}>{job.company}</span>
                                </div>
                              </div>
                              <button
                                onClick={(e) => handleToggleSaveJob(job.id, e)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/20 group-hover:bg-white/10"
                              >
                                <Heart size={14} className={isSaved ? "text-red-500 fill-current" : "text-gray-400"} />
                              </button>
                            </div>

                            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] font-semibold" style={{ color: c.textSec }}>
                              <span className="flex items-center gap-1"><MapPin size={12} /> {job.location} ({job.mode})</span>
                              <span className="flex items-center gap-1"><Calendar size={12} /> {job.type}</span>
                              <span className="flex items-center gap-1"><DollarSign size={12} /> {job.salary}</span>
                            </div>

                            <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: c.textMuted }}>{job.description}</p>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-1.5">
                            {job.skills.slice(0, 3).map(s => (
                              <span key={s} className="px-2 py-0.5 rounded text-[9px] font-bold bg-white/5 border border-white/10" style={{ borderColor: c.border, color: c.textSec }}>
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB B: RESUME VS JD MATCH */}
            {tab === "jd-match" && (
              <motion.div
                key="jd-match"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Input paste field */}
                <div className="p-5 border rounded-2xl space-y-4" style={{ background: c.cardBg, borderColor: c.border }}>
                  <h3 className="text-base font-extrabold flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    <ArrowRightLeft size={16} className="text-amber-500" /> Resume vs Job Description Matcher
                  </h3>
                  <textarea
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    placeholder="Paste the target Job Description (JD) here..."
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] focus:border-[#f59e0b] focus:outline-none rounded-lg p-3 text-xs resize-none h-32"
                    style={{ background: c.inputBg, color: c.text, borderColor: c.border }}
                  />
                  <button
                    onClick={handleRunJdAnalyzer}
                    disabled={!jdText.trim() || analyzing}
                    className="py-2 px-4 rounded-lg bg-amber-500 text-black font-extrabold text-xs hover:bg-amber-400 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {analyzing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Running AI Analysis...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" /> Run Compatibility Analyzer
                      </>
                    )}
                  </button>
                </div>

                {/* Match Report Results */}
                {matchReport && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Score Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-5 border rounded-2xl text-center space-y-3 flex flex-col items-center justify-center" style={{ background: c.cardBg, borderColor: c.border }}>
                        <div className="text-3xl font-extrabold text-amber-500">{matchReport.overallScore}%</div>
                        <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: c.textMuted }}>Overall Compatibility</div>
                      </div>

                      <div className="p-5 border rounded-2xl md:col-span-2 space-y-3" style={{ background: c.cardBg, borderColor: c.border }}>
                        <h4 className="text-xs font-bold uppercase tracking-wider mb-2">Metrics Analysis</h4>
                        <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                          <div>
                            <span className="text-[10px] block" style={{ color: c.textSec }}>Skills Match</span>
                            <span className="text-sm font-extrabold" style={{ color: c.text }}>{matchReport.skillsMatch}%</span>
                          </div>
                          <div>
                            <span className="text-[10px] block" style={{ color: c.textSec }}>Experience Match</span>
                            <span className="text-sm font-extrabold" style={{ color: c.text }}>{matchReport.experienceMatch}%</span>
                          </div>
                          <div>
                            <span className="text-[10px] block" style={{ color: c.textSec }}>Education Alignment</span>
                            <span className="text-sm font-extrabold" style={{ color: c.text }}>{matchReport.educationMatch}%</span>
                          </div>
                          <div>
                            <span className="text-[10px] block" style={{ color: c.textSec }}>ATS compatibility</span>
                            <span className="text-sm font-extrabold" style={{ color: c.text }}>{matchReport.atsCompatibility}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Keywords Analysis */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-5 border rounded-2xl space-y-3" style={{ background: c.cardBg, borderColor: c.border }}>
                        <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-emerald-500">
                          <CheckCircle2 size={14} /> Keywords Found
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {matchReport.keywordsFound.map((k: string) => (
                            <span key={k} className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">{k}</span>
                          ))}
                        </div>
                      </div>

                      <div className="p-5 border rounded-2xl space-y-3" style={{ background: c.cardBg, borderColor: c.border }}>
                        <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-red-500">
                          <XCircle size={14} /> Missing Keywords
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {matchReport.keywordsMissing.map((k: string) => (
                            <span key={k} className="px-2 py-0.5 rounded text-[9px] font-bold bg-red-500/10 text-red-500 border border-red-500/20">{k}</span>
                          ))}
                        </div>
                      </div>

                      <div className="p-5 border rounded-2xl space-y-3" style={{ background: c.cardBg, borderColor: c.border }}>
                        <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-cyan-500">
                          <Info size={14} /> Suggested Terms
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {matchReport.keywordsSuggested.map((k: string) => (
                            <span key={k} className="px-2 py-0.5 rounded text-[9px] font-bold bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">{k}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* AI Optimization Suggestions */}
                    <div className="p-5 border rounded-2xl space-y-3" style={{ background: c.cardBg, borderColor: c.border }}>
                      <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-amber-500">
                        <Sparkles size={14} /> Actionable Resume Edits
                      </h4>
                      <ul className="space-y-2">
                        {matchReport.suggestions.map((s: string, idx: number) => (
                          <li key={idx} className="text-xs leading-relaxed flex items-start gap-2" style={{ color: c.textSec }}>
                            <span className="text-amber-500">•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="pt-4 flex gap-2">
                        <button
                          onClick={() => setView("resume-hub")}
                          className="py-1.5 px-3 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold transition-colors"
                          style={{ borderColor: c.border, color: c.text }}
                        >
                          Optimize Resume
                        </button>
                        <button
                          onClick={() => setView("cover-letter")}
                          className="py-1.5 px-3 rounded bg-amber-500 text-black hover:bg-amber-400 text-xs font-bold transition-colors"
                        >
                          Draft Cover Letter
                        </button>
                      </div>
                    </div>

                  </motion.div>
                )}
              </motion.div>
            )}

            {/* TAB C: JOB REFERRALS */}
            {tab === "referrals" && (
              <motion.div
                key="referrals"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Referrals list */}
                <div className="p-4 border rounded-xl flex justify-between items-center bg-white/[0.01]" style={{ borderColor: c.border }}>
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase tracking-wider font-bold block" style={{ color: c.textMuted }}>Total Requests</span>
                    <span className="text-base font-black" style={{ color: c.text }}>{referrals.length}</span>
                  </div>
                  <button
                    onClick={() => setShowReferralModal(true)}
                    className="py-2 px-4 rounded-lg bg-amber-500 text-black font-extrabold text-xs hover:bg-amber-400 transition-colors flex items-center gap-1.5"
                  >
                    <PlusCircle size={14} /> Request Referral
                  </button>
                </div>

                {/* Referral tracker grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {referrals.map(ref => (
                    <div
                      key={ref.id}
                      className="p-5 border rounded-2xl space-y-4"
                      style={{ background: c.cardBg, borderColor: c.border }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-extrabold text-sm" style={{ color: c.text }}>{ref.role}</h4>
                          <span className="text-[10px] font-bold" style={{ color: c.textSec }}>{ref.company}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          {ref.status}
                        </span>
                      </div>

                      {ref.outreachMsg && (
                        <div className="space-y-1.5 pt-2 border-t" style={{ borderColor: c.border }}>
                          <span className="text-[9px] uppercase tracking-wider font-bold text-amber-500">Suggested Outreach Message:</span>
                          <textarea
                            readOnly
                            value={ref.outreachMsg}
                            onClick={(e) => {
                              (e.currentTarget as HTMLTextAreaElement).select();
                              navigator.clipboard.writeText(ref.outreachMsg || "");
                            }}
                            className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] focus:border-[#f59e0b] focus:outline-none rounded-lg p-2.5 text-[10px] resize-none h-24 select-all"
                            style={{ background: c.inputBg, color: c.textMuted, borderColor: c.border }}
                          />
                          <span className="text-[8px]" style={{ color: c.textMuted }}>*Click inside textarea to select and copy all.</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TAB D: HIRING CHALLENGES */}
            {tab === "challenges" && (
              <motion.div
                key="challenges"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Available Contests */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {MOCK_CHALLENGES.map(ch => (
                    <div
                      key={ch.id}
                      className="p-5 border rounded-2xl flex flex-col justify-between"
                      style={{ background: c.cardBg, borderColor: c.border }}
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-white/5 border text-gray-400" style={{ borderColor: c.border }}>
                            {ch.category}
                          </span>
                          {ch.completed ? (
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                              Rank #{ch.rank}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                              Active
                            </span>
                          )}
                        </div>
                        <h4 className="font-extrabold text-sm" style={{ color: c.text }}>{ch.title}</h4>
                        <span className="text-[10px] font-bold" style={{ color: c.textSec }}>Host: {ch.company}</span>
                        <div className="text-[10px]" style={{ color: c.textMuted }}>
                          Duration: {ch.duration} · Difficulty: {ch.difficulty}
                        </div>
                      </div>

                      <div className="mt-6 pt-3 border-t flex justify-end" style={{ borderColor: c.border }}>
                        {ch.completed ? (
                          <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                            <Check size={12} /> Challenge Solved ({ch.score}%)
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              alert("🚀 Starting Challenge environment. All inputs and compilers are initialized.");
                            }}
                            className="py-1.5 px-3 rounded bg-amber-500 text-black hover:bg-amber-400 text-[10px] font-bold flex items-center gap-1.5 transition-colors"
                          >
                            <Play size={10} className="fill-current" /> Participate Now
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* ==================== 4. DETAIL MODAL DIALOG ==================== */}
      <AnimatePresence>
        {selectedJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedJob(null)}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl border p-6 overflow-y-auto max-h-[85vh] space-y-4 shadow-2xl relative"
              style={{ background: isDark ? "#0d1117" : "#ffffff", borderColor: c.border }}
            >
              {/* Header */}
              <div className="flex gap-4 items-center">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-base shrink-0"
                  style={{ background: selectedJob.logoBg }}
                >
                  {selectedJob.company[0]}
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-base" style={{ fontFamily: "'Outfit', sans-serif" }}>{selectedJob.role}</h3>
                  <span className="text-xs font-bold" style={{ color: c.textSec }}>{selectedJob.company} · {selectedJob.location}</span>
                </div>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-3 gap-2 border-y py-3 text-center text-xs" style={{ borderColor: c.border }}>
                <div>
                  <span className="text-[9px] uppercase tracking-wider block" style={{ color: c.textMuted }}>Salary Range</span>
                  <span className="font-bold">{selectedJob.salary}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider block" style={{ color: c.textMuted }}>Experience Required</span>
                  <span className="font-bold">{selectedJob.experience}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider block" style={{ color: c.textMuted }}>Deadline</span>
                  <span className="font-bold text-amber-500">{selectedJob.deadline}</span>
                </div>
              </div>

              {/* Main Content */}
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: c.text }}>Role Description</h4>
                  <p className="text-xs leading-relaxed" style={{ color: c.textSec }}>{selectedJob.description}</p>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: c.text }}>Responsibilities</h4>
                  <ul className="list-disc list-inside text-xs leading-relaxed space-y-1" style={{ color: c.textSec }}>
                    {selectedJob.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: c.text }}>Required Skills</h4>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedJob.skills.map(s => (
                      <span key={s} className="px-2 py-0.5 rounded text-[9px] font-bold bg-white/5 border" style={{ borderColor: c.border, color: c.textSec }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 justify-end">
                <button
                  onClick={() => handleToggleSaveJob(selectedJob.id)}
                  className="py-2 px-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold transition-colors"
                  style={{ borderColor: c.border, color: c.text }}
                >
                  {savedJobs.includes(selectedJob.id) ? "Saved" : "Save Job"}
                </button>
                <button
                  onClick={() => {
                    setAppliedCount(prev => prev + 1);
                    alert("🚀 Applied successfully! Card added to your application tracker.");
                    setSelectedJob(null);
                  }}
                  className="py-2 px-4 rounded-lg bg-amber-500 text-black hover:bg-amber-400 text-xs font-bold transition-colors"
                >
                  Apply Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== 5. REFERRAL REQUEST MODAL OVERLAY ==================== */}
      <AnimatePresence>
        {showReferralModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowReferralModal(false)}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.form
              onSubmit={handleRequestReferralSubmit}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border p-6 space-y-4 shadow-2xl relative"
              style={{ background: isDark ? "#0d1117" : "#ffffff", borderColor: c.border }}
            >
              <h3 className="font-extrabold text-sm font-sans" style={{ fontFamily: "'Outfit', sans-serif" }}>Request Employee Referral</h3>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider block" style={{ color: c.textSec }}>Target Company</label>
                <input
                  required
                  value={refCompany}
                  onChange={(e) => setRefCompany(e.target.value)}
                  placeholder="e.g. Google"
                  className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] focus:border-[#f59e0b] focus:outline-none rounded-lg p-2 text-xs"
                  style={{ background: c.inputBg, color: c.text, borderColor: c.border }}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider block" style={{ color: c.textSec }}>Role Title</label>
                <input
                  required
                  value={refRole}
                  onChange={(e) => setRefRole(e.target.value)}
                  placeholder="e.g. AI Engineer"
                  className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] focus:border-[#f59e0b] focus:outline-none rounded-lg p-2 text-xs"
                  style={{ background: c.inputBg, color: c.text, borderColor: c.border }}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider block" style={{ color: c.textSec }}>Outreach details</label>
                <textarea
                  value={refNotes}
                  onChange={(e) => setRefNotes(e.target.value)}
                  placeholder="Any referral link or details..."
                  className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] focus:border-[#f59e0b] focus:outline-none rounded-lg p-2 text-xs resize-none h-16"
                  style={{ background: c.inputBg, color: c.text, borderColor: c.border }}
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowReferralModal(false)}
                  className="py-1.5 px-3 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold transition-colors"
                  style={{ borderColor: c.border }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-1.5 px-3 rounded bg-amber-500 text-black hover:bg-amber-400 text-xs font-bold transition-colors"
                >
                  Request Referral
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== 6. FLOATING CHAT SIDEBAR PANEL ==================== */}
      <AnimatePresence>
        {assistantOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-[70px] right-0 bottom-0 z-[190] w-80 border-l flex flex-col shadow-2xl"
            style={{ background: isDark ? "#0d1117" : "#ffffff", borderColor: c.border }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b flex justify-between items-center" style={{ borderColor: c.border }}>
              <div className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" />
                <span className="text-xs font-black uppercase tracking-wider" style={{ color: c.text }}>AI Career Assistant</span>
              </div>
              <button
                onClick={() => setAssistantOpen(false)}
                className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10 text-gray-400 hover:text-white"
              >
                <XCircle size={14} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {chatMessages.map((msg, idx) => {
                const isAI = msg.role === "assistant";
                return (
                  <div key={idx} className={`flex ${isAI ? "justify-start" : "justify-end"}`}>
                    <div
                      className={`max-w-[85%] p-2.5 rounded-xl text-xs leading-relaxed ${
                        isAI
                          ? "bg-white/5 border border-white/10 rounded-tl-sm"
                          : "bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-tr-sm"
                      }`}
                      style={{ borderColor: c.border }}
                    >
                      <p className="whitespace-pre-line">{msg.content}</p>
                    </div>
                  </div>
                );
              })}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 rounded-xl rounded-tl-sm p-3 flex items-center gap-1.5">
                    <Clock size={12} className="text-amber-500 animate-spin" />
                    <span className="text-[10px] font-bold" style={{ color: c.textMuted }}>Drafting response...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Suggestions */}
            <div className="p-3 border-t bg-white/[0.01] flex flex-col gap-1.5" style={{ borderColor: c.border }}>
              <span className="text-[8px] uppercase tracking-wider font-extrabold" style={{ color: c.textMuted }}>Suggestions</span>
              {[
                "Find remote software engineering jobs",
                "Compare my resume to SDE description",
                "Help me request a referral"
              ].map(s => (
                <button
                  key={s}
                  onClick={() => { setChatInput(s); }}
                  className="w-full text-left p-1.5 bg-white/5 border border-white/10 rounded hover:bg-white/10 text-[10px] font-semibold truncate transition-colors"
                  style={{ borderColor: c.border, color: c.textSec }}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Input form */}
            <div className="p-3 border-t flex gap-1.5" style={{ borderColor: c.border }}>
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask career assistant..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAssistantSend();
                }}
                className="flex-1 bg-[var(--bg-card)] border border-[var(--border-color)] focus:border-[#f59e0b] focus:outline-none rounded-lg p-2 text-xs"
                style={{ background: c.inputBg, color: c.text, borderColor: c.border }}
              />
              <button
                onClick={handleAssistantSend}
                disabled={!chatInput.trim() || chatLoading}
                className="w-8 h-8 rounded-lg bg-amber-500 text-black hover:bg-amber-400 flex items-center justify-center shrink-0 disabled:opacity-30 transition-colors"
              >
                <Send size={12} />
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
