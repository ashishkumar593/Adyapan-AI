"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Sparkles, Clock, GraduationCap, BookOpen, CheckCircle,
  AlertTriangle, Lightbulb, Layers, Edit3, Check, Plus, Play,
  Terminal, ChevronRight, ChevronDown, Award, BookOpenCheck, Zap,
  X, RotateCcw, Copy, FileText, Star, Brain, Cpu
} from "lucide-react";
import { api } from "@/services/api";

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
    isDark,
    text: isDark ? "#e5e7eb" : "#0f172a", textSec: isDark ? "#9ca3af" : "#475569", textMuted: isDark ? "#6b7280" : "#94a3b8",
    bg: isDark ? "rgba(255,255,255,0.025)" : "#ffffff", bgHover: isDark ? "rgba(255,255,255,0.04)" : "#f8fafc",
    surface: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", surfaceHover: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
    border: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)", borderHover: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.18)",
    inputBg: isDark ? "rgba(0,0,0,0.35)" : "#f1f5f9",
    cardBg: isDark ? "rgba(255,255,255,0.025)" : "#ffffff", cardBgAlt: isDark ? "rgba(0,0,0,0.25)" : "#f8fafc",
    stickyBg: isDark ? "rgba(10,10,20,0.88)" : "rgba(248,250,252,0.92)",
    divider: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)",
    green: "#10b981", greenBg: isDark ? "rgba(16,185,129,0.1)" : "rgba(16,185,129,0.08)",
    emerald: "#10b981", emeraldBg: isDark ? "rgba(16,185,129,0.08)" : "rgba(16,185,129,0.06)", emeraldBorder: isDark ? "rgba(16,185,129,0.18)" : "rgba(16,185,129,0.25)",
    violet: "#8b5cf6", violetBg: isDark ? "rgba(139,92,246,0.08)" : "rgba(139,92,246,0.06)", violetBorder: isDark ? "rgba(139,92,246,0.18)" : "rgba(139,92,246,0.2)",
    amber: "#f59e0b", amberBg: isDark ? "rgba(245,158,11,0.07)" : "rgba(245,158,11,0.08)", amberBorder: isDark ? "rgba(245,158,11,0.18)" : "rgba(245,158,11,0.25)",
    rose: "#f43f5e", roseBg: isDark ? "rgba(244,63,94,0.07)" : "rgba(244,63,94,0.06)", roseBorder: isDark ? "rgba(244,63,94,0.18)" : "rgba(244,63,94,0.2)",
    purpleBg: isDark ? "rgba(139,92,246,0.06)" : "rgba(139,92,246,0.05)", purpleBorder: isDark ? "rgba(139,92,246,0.14)" : "rgba(139,92,246,0.15)",
  };
};

interface UnifiedConcept { title: string; content: string; sub_concepts?: string[]; tips?: string[]; }
interface UnifiedExample { title: string; scenario: string; code_or_data?: string; explanation?: string; }
interface UnifiedPractice { question: string; guidance?: string; expected_answer?: string; red_flag?: string; }
interface UnifiedQuizQuestion { question: string; options: string[]; answer: string; explanation: string; }
interface UnifiedLesson {
  learning_goal?: string; estimated_completion_time?: string; lesson_structure?: string[];
  overview: string; why_matters?: string; simple_explanation?: string; real_life_analogy?: string;
  example?: string; key_takeaways?: string[]; mini_quiz?: UnifiedQuizQuestion[];
  key_concepts: UnifiedConcept[]; examples?: UnifiedExample[]; practice_questions?: UnifiedPractice[];
  quiz?: UnifiedQuizQuestion[]; summary?: string;
}

const loadingSteps = [
  "Analyzing Topic Semantics",
  "Building Custom Learning Path",
  "Creating Real-World Analogies",
  "Generating Comprehension Checkpoint Quiz",
  "Finalizing Visual Revision Sheet"
];

const modeConfig = {
  beginner: { borderColor: "border-emerald-500/15", textColor: "text-emerald-400", accentBg: "bg-emerald-500/10", glowColor: "from-emerald-500/20 to-teal-500/20", icon: BookOpen },
  intermediate: { borderColor: "border-violet-500/15", textColor: "text-violet-400", accentBg: "bg-violet-500/10", glowColor: "from-violet-500/20 to-purple-500/20", icon: Cpu },
  interview: { borderColor: "border-amber-500/15", textColor: "text-amber-400", accentBg: "bg-amber-500/10", glowColor: "from-amber-500/20 to-yellow-500/20", icon: Award },
  revision: { borderColor: "border-rose-500/15", textColor: "text-rose-400", accentBg: "bg-rose-500/10", glowColor: "from-rose-500/20 to-red-500/20", icon: Zap }
};

function parseMarkdown(text: string): React.ReactNode {
  if (!text) return null;
  const blocks = text.split(/(```[\s\S]*?```)/g);
  return (
    <>
      {blocks.map((block, blockIdx) => {
        if (block.startsWith("```") && block.endsWith("```")) {
          const match = block.match(/```(\w*)\n?([\s\S]*?)```/);
          const lang = match ? match[1] : "";
          const codeContent = match ? match[2].trim() : block.slice(3, -3).trim();
          return (
            <div key={blockIdx} className="my-3 rounded-lg border overflow-hidden font-mono text-[11px] leading-relaxed" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.45)" }}>
              {lang && <div className="flex justify-between items-center px-4 py-1.5 border-b text-[9px] uppercase" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.3)", color: "rgba(255,255,255,0.3)" }}><span>{lang}</span></div>}
              <pre className="p-3 overflow-x-auto" style={{ color: "rgba(255,255,255,0.7)" }}><code>{codeContent}</code></pre>
            </div>
          );
        }
        const inlineParts = block.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`|\n)/g);
        return (
          <span key={blockIdx}>
            {inlineParts.map((part, inlineIdx) => {
              if (part.startsWith("**") && part.endsWith("**")) return <strong key={inlineIdx} className="font-extrabold" style={{ color: "rgba(255,255,255,0.95)" }}>{part.slice(2, -2)}</strong>;
              if (part.startsWith("*") && part.endsWith("*")) return <em key={inlineIdx} className="italic" style={{ color: "rgba(255,255,255,0.7)" }}>{part.slice(1, -1)}</em>;
              if (part.startsWith("`") && part.endsWith("`")) return <code key={inlineIdx} className="font-mono text-xs px-1.5 py-0.5 rounded border" style={{ background: "rgba(139,92,246,0.1)", borderColor: "rgba(139,92,246,0.2)", color: "#a78bfa" }}>{part.slice(1, -1)}</code>;
              if (part === "\n") return <br key={inlineIdx} />;
              return <span key={inlineIdx}>{part}</span>;
            })}
          </span>
        );
      })}
    </>
  );
}

export function LearnView() {
  const theme = useTheme();
  const c = mkColors(theme);

  const [inputTopic, setInputTopic] = useState("");
  const [duration, setDuration] = useState<"5m" | "10m" | "20m" | "30m">("10m");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "interview" | "revision">("intermediate");
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [lessonData, setLessonData] = useState<UnifiedLesson | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentTopic, setCurrentTopic] = useState("");

  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<number, boolean>>({});
  const [expandedConceptIdx, setExpandedConceptIdx] = useState<number | null>(null);
  const [practiceRevealed, setPracticeRevealed] = useState<Record<number, boolean>>({});

  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [scratchpadTab, setScratchpadTab] = useState<"notes" | "takeaways" | "playground">("notes");
  const [notesText, setNotesText] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [playgroundOutput, setPlaygroundOutput] = useState<string | null>(null);
  const [isRunningPlayground, setIsRunningPlayground] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const examples = [
    "Explain Gradient Descent",
    "Teach me SQL Joins",
    "Explain Neural Networks",
    "Explain React Server Components"
  ];

  useEffect(() => {
    if (lessonData && currentTopic) {
      const saved = localStorage.getItem(`adyapan-learn-notes-${currentTopic}`);
      if (saved) setNotesText(saved);
    }
  }, [lessonData, currentTopic]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleNotesChange = (val: string) => {
    setNotesText(val);
    if (lessonData && currentTopic) {
      setIsSavingNotes(true);
      localStorage.setItem(`adyapan-learn-notes-${currentTopic}`, val);
      setTimeout(() => setIsSavingNotes(false), 500);
    }
  };

  const handleImportConcept = (concept: UnifiedConcept) => {
    const divider = notesText ? "\n\n" : "";
    const formatted = `### ${concept.title}\n${concept.content}`;
    handleNotesChange(notesText + divider + formatted);
  };

  const handleImportTakeaway = (takeaway: string) => {
    const divider = notesText ? "\n\n" : "";
    handleNotesChange(notesText + divider + `* ${takeaway}`);
  };

  const handleRunPlayground = () => {
    if (isRunningPlayground) return;
    setIsRunningPlayground(true);
    setPlaygroundOutput("[Compiling and executing simulation...]");
    setTimeout(() => {
      const t = currentTopic.toLowerCase();
      if (t.includes("gradient")) {
        setPlaygroundOutput(`[Running script.py...]\nOld weight: 10.0\nLearning Rate: 0.01\nGradient: 2.5\nNew weight = weight - (learning_rate * gradient)\nNew weight: 9.975\n\nProcess completed successfully.`);
      } else if (t.includes("sql") || t.includes("join")) {
        setPlaygroundOutput(`[Running script.py...]\nExecuting database query...\nINNER JOIN matching rows: 3 returned\n- Order 101 | User A | $250.00\n- Order 102 | User B | $120.50\n- Order 103 | User C | $45.00\n\nProcess completed successfully.`);
      } else {
        setPlaygroundOutput(`[Running script.py...]\nInputs: [0.5, -0.2]\nWeights: [0.8, 0.4]\nBias: -0.1\nWeighted Sum (z): 0.22\nActivation ReLU(z): 0.22\n\nProcess completed successfully.`);
      }
      setIsRunningPlayground(false);
    }, 1000);
  };

  const handleGenerate = async (targetTopic: string) => {
    if (!targetTopic.trim()) return;

    setLessonData(null);
    setError(null);
    setIsGenerating(true);
    setLoadingStep(0);
    setQuizAnswers({});
    setQuizSubmitted({});
    setExpandedConceptIdx(null);
    setPracticeRevealed({});

    intervalRef.current = setInterval(() => {
      setLoadingStep(prev => prev < loadingSteps.length - 1 ? prev + 1 : prev);
    }, 2000);

    try {
      const response = await api.post("/learn/generate", {
        topic: targetTopic,
        duration,
        level
      });

      if (intervalRef.current) clearInterval(intervalRef.current);
      setLoadingStep(4);

      setTimeout(() => {
        setLessonData(response.data);
        setCurrentTopic(targetTopic);
        setIsGenerating(false);
      }, 500);
    } catch (err: any) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setError(err?.response?.data?.error || err?.message || "Failed to generate lesson");
      setIsGenerating(false);
    }
  };

  const handleQuizSelect = (questionIdx: number, option: string) => {
    if (quizSubmitted[questionIdx]) return;
    setQuizAnswers(prev => ({ ...prev, [questionIdx]: option }));
  };

  const handleQuizSubmit = (questionIdx: number, correctAns: string) => {
    if (!quizAnswers[questionIdx]) return;
    setQuizSubmitted(prev => ({ ...prev, [questionIdx]: true }));
  };

  const renderBeginner = (data: UnifiedLesson) => (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="p-6 rounded-2xl" style={{ background: c.cardBg, border: `1px solid ${c.emeraldBorder}` }}>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider" style={{ color: c.emerald }}>
              <BookOpen size={14} /> Simple Overview
            </div>
            <div className="text-sm leading-relaxed" style={{ color: c.textSec }}>{parseMarkdown(data.overview)}</div>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="p-6 rounded-2xl" style={{ background: c.emeraldBg, border: `1px solid ${c.emeraldBorder}` }}>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider" style={{ color: c.emerald }}>
              <Lightbulb size={14} /> Why This Matters
            </div>
            <div className="text-sm leading-relaxed" style={{ color: c.textSec }}>{parseMarkdown(data.why_matters || "")}</div>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="p-6 rounded-2xl" style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider" style={{ color: c.emerald }}>
              <Sparkles size={14} /> Simple Explanation
            </div>
            <div className="text-sm leading-relaxed whitespace-pre-line" style={{ color: c.textSec }}>{parseMarkdown(data.simple_explanation || "")}</div>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
        <div className="p-6 rounded-2xl" style={{ background: c.cardBgAlt, border: `1px solid ${c.emeraldBorder}` }}>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider" style={{ color: c.emerald }}>
              <Layers size={14} /> Real-Life Analogy
            </div>
            <div className="text-sm leading-relaxed" style={{ color: c.textSec }}>{parseMarkdown(data.real_life_analogy || "")}</div>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <div className="p-6 rounded-2xl" style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
          <div className="space-y-3">
            <div className="text-xs font-extrabold uppercase tracking-wider" style={{ color: c.emerald }}>A Simple Example</div>
            <div className="text-sm leading-relaxed" style={{ color: c.textMuted }}>{parseMarkdown(data.example || "")}</div>
          </div>
        </div>
      </motion.div>

      {data.key_takeaways && data.key_takeaways.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs uppercase font-extrabold tracking-wider" style={{ color: c.textMuted }}>{data.key_takeaways.length} Key Takeaways</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.key_takeaways.map((takeaway, idx) => (
              <motion.div key={idx} whileHover={{ y: -3, scale: 1.01 }}
                className="p-5 rounded-xl relative overflow-hidden flex flex-col justify-between"
                style={{ background: c.emeraldBg, border: `1px solid ${c.emeraldBorder}` }}>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={14} style={{ color: c.emerald }} />
                    <span className="text-[10px] font-mono" style={{ color: c.textMuted }}>RULE {idx + 1}</span>
                  </div>
                  <p className="text-xs font-medium leading-relaxed" style={{ color: c.textSec }}>{takeaway}</p>
                </div>
                {isScratchpadOpen && (
                  <div className="pt-3 mt-3 border-t flex justify-end" style={{ borderColor: c.divider }}>
                    <button onClick={() => handleImportTakeaway(takeaway)}
                      className="px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                      style={{ background: c.emeraldBg, border: `1px solid ${c.emeraldBorder}`, color: c.emerald }}>
                      <Plus size={8} /> Copy to Notes
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {data.mini_quiz && data.mini_quiz.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs uppercase font-extrabold tracking-wider flex items-center gap-1.5" style={{ color: c.textMuted }}>
            <BookOpenCheck size={13} style={{ color: c.emerald }} /> Comprehension Checkpoint Quiz
          </h3>
          <div className="space-y-6">
            {data.mini_quiz.map((quiz, qIdx) => {
              const userAns = quizAnswers[qIdx];
              const isSubmitted = quizSubmitted[qIdx];
              return (
                <div key={qIdx} className="p-6 rounded-2xl" style={{ background: c.cardBg, border: `1px solid ${c.emeraldBorder}` }}>
                  <div className="space-y-5">
                    <div className="pb-3" style={{ borderBottom: `1px solid ${c.divider}` }}>
                      <span className="text-[10px] font-mono" style={{ color: c.textMuted }}>QUESTION {qIdx + 1} OF {data.mini_quiz!.length}</span>
                      <h4 className="text-sm font-bold mt-1" style={{ color: c.text }}>{quiz.question}</h4>
                    </div>
                    <div className="space-y-2">
                      {quiz.options.map((opt) => {
                        const isSelected = userAns === opt;
                        const isCorrect = opt === quiz.answer;
                        let optionStyle: React.CSSProperties = { background: "rgba(0,0,0,0.35)", borderColor: c.border };
                        if (isSelected && !isSubmitted) {
                          optionStyle = { background: c.emeraldBg, borderColor: c.emerald, color: c.emerald };
                        } else if (isSubmitted) {
                          if (isCorrect) {
                            optionStyle = { background: "rgba(16,185,129,0.15)", borderColor: c.emerald, color: c.emerald };
                          } else if (isSelected) {
                            optionStyle = { background: "rgba(244,63,94,0.15)", borderColor: c.rose, color: c.rose };
                          } else {
                            optionStyle = { background: "rgba(0,0,0,0.2)", borderColor: c.border, opacity: 0.55 };
                          }
                        }
                        return (
                          <button key={opt} disabled={isSubmitted} onClick={() => handleQuizSelect(qIdx, opt)}
                            className="w-full text-left p-3.5 rounded-xl border text-xs font-semibold transition-all duration-200 cursor-pointer flex justify-between items-center"
                            style={optionStyle}>
                            <span>{opt}</span>
                            {isSubmitted && isCorrect && <CheckCircle size={15} style={{ color: c.emerald }} />}
                            {isSubmitted && isSelected && !isCorrect && <AlertTriangle size={15} style={{ color: c.rose }} />}
                          </button>
                        );
                      })}
                    </div>
                    <div className="pt-1 flex flex-col gap-3">
                      {!isSubmitted ? (
                        <button disabled={!userAns} onClick={() => handleQuizSubmit(qIdx, quiz.answer)}
                          className="w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-40"
                          style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#000", border: "none" }}>
                          Submit Answer
                        </button>
                      ) : (
                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                          className="p-3.5 rounded-xl space-y-1.5 text-xs"
                          style={{ background: c.cardBgAlt, border: `1px solid ${c.border}` }}>
                          <div className="font-extrabold flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                            {userAns === quiz.answer
                              ? <span style={{ color: c.emerald }}>✔ Correct Answer</span>
                              : <span style={{ color: c.rose }}>✘ Incorrect</span>}
                          </div>
                          <p className="leading-relaxed" style={{ color: c.textMuted }}>{quiz.explanation}</p>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const renderIntermediate = (data: UnifiedLesson) => {
    const mode = modeConfig[level] || modeConfig.intermediate;
    const ModeIcon = mode.icon;

    return (
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="p-6 rounded-2xl" style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider" style={{ color: (c[mode.textColor.replace("text-", "") as keyof typeof c] as string) || c.text }}>
                <ModeIcon size={14} /> Comprehension Overview
              </div>
              <div className="text-sm leading-relaxed" style={{ color: c.textSec }}>{parseMarkdown(data.overview)}</div>
            </div>
          </div>
        </motion.div>

        {data.key_concepts && data.key_concepts.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xs uppercase font-extrabold tracking-wider" style={{ color: c.textMuted }}>Core Syllabus Concepts</h3>
            <div className="space-y-4">
              {data.key_concepts.map((concept, idx) => {
                const isExpanded = expandedConceptIdx === idx;
                return (
                  <div key={idx} onClick={() => setExpandedConceptIdx(isExpanded ? null : idx)}
                    className="p-5 rounded-2xl border transition-all duration-300 cursor-pointer text-left relative overflow-hidden"
                    style={{
                      background: isExpanded ? c.cardBg : c.cardBgAlt,
                      borderColor: isExpanded ? c.borderHover : c.border
                    }}>
                    <div className="flex justify-between items-start w-full">
                      <h4 className="text-xs font-black uppercase tracking-wider transition-colors" style={{ color: c.text }}>
                        {concept.title}
                      </h4>
                      {isExpanded
                        ? <ChevronDown size={14} style={{ color: (c[mode.textColor.replace("text-", "") as keyof typeof c] as string) || c.text }} />
                        : <ChevronRight size={14} style={{ color: c.textMuted }} />}
                    </div>
                    {isExpanded && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.2 }}
                        className="mt-3.5 space-y-4 pt-3 border-t" style={{ borderColor: c.divider }}>
                        <div className="text-xs leading-relaxed" style={{ color: c.textSec }}>{parseMarkdown(concept.content)}</div>

                        {concept.sub_concepts && concept.sub_concepts.length > 0 && (
                          <div className="space-y-2 pl-2" style={{ borderLeft: `2px solid ${c.borderHover}` }}>
                            <span className="text-[9px] uppercase tracking-widest font-extrabold block" style={{ color: c.textMuted }}>Sub-Concepts</span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {concept.sub_concepts.map((sub, sIdx) => (
                                <div key={sIdx} className="p-2.5 rounded-lg text-xs font-medium" style={{ background: c.cardBgAlt, border: `1px solid ${c.border}`, color: c.textMuted }}>
                                  {sub}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {concept.tips && concept.tips.length > 0 && (
                          <div className="p-4 rounded-xl space-y-2" style={{ background: (c[mode.textColor.replace("text-", "") + "Bg" as keyof typeof c] as string) || c.amberBg, border: `1px solid ${c.border}` }}>
                            <span className="text-[9px] uppercase tracking-widest font-extrabold flex items-center gap-1.5" style={{ color: (c[mode.textColor.replace("text-", "") as keyof typeof c] as string) || c.amber }}>
                              <AlertTriangle size={11} /> Important Rule / Tip
                            </span>
                            <ul className="list-disc pl-4 text-xs space-y-1 leading-relaxed" style={{ color: c.textSec }}>
                              {concept.tips.map((tip, tIdx) => <li key={tIdx}>{tip}</li>)}
                            </ul>
                          </div>
                        )}

                        {isScratchpadOpen && (
                          <div className="flex justify-end pt-2">
                            <button onClick={(e) => { e.stopPropagation(); handleImportConcept(concept); }}
                              className="px-2.5 py-1 rounded text-[9px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                              style={{ background: c.violetBg, border: `1px solid ${c.violetBorder}`, color: c.violet }}>
                              <Plus size={8} /> Copy to Scratchpad
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {data.examples && data.examples.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xs uppercase font-extrabold tracking-wider" style={{ color: c.textMuted }}>Explanatory Walkthroughs & Code</h3>
            <div className="space-y-4">
              {data.examples.map((ex, idx) => (
                <div key={idx} className="p-6 rounded-2xl" style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider" style={{ color: c.textMuted }}>
                      <Terminal size={14} /> {ex.title}
                    </div>
                    <div className="text-sm leading-relaxed whitespace-pre-line" style={{ color: c.textSec }}>{parseMarkdown(ex.scenario)}</div>
                    {ex.code_or_data && (
                      <div className="rounded-xl border font-mono text-xs leading-relaxed whitespace-pre-wrap select-text p-4" style={{ borderColor: c.border, background: "rgba(0,0,0,0.4)", color: c.textSec }}>
                        <code>{ex.code_or_data}</code>
                      </div>
                    )}
                    {ex.explanation && (
                      <p className="text-xs italic pl-2 leading-relaxed" style={{ color: c.textMuted, borderLeft: `2px solid ${c.borderHover}` }}>{ex.explanation}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.practice_questions && data.practice_questions.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xs uppercase font-extrabold tracking-wider" style={{ color: c.textMuted }}>Interactive Challenges & Scenarios</h3>
            <div className="space-y-4">
              {data.practice_questions.map((pr, idx) => {
                const isAnswerRevealed = practiceRevealed[idx];
                return (
                  <div key={idx} className="p-5 rounded-2xl space-y-4" style={{ background: c.cardBgAlt, border: `1px solid ${c.border}` }}>
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <span className="text-[9px] font-extrabold uppercase font-mono" style={{ color: c.textMuted }}>CHALLENGE {idx + 1}</span>
                        <h4 className="text-sm font-bold leading-relaxed" style={{ color: c.text }}>{pr.question}</h4>
                      </div>
                    </div>
                    {pr.guidance && (
                      <div className="text-xs p-3 rounded-lg leading-relaxed font-medium" style={{ background: c.cardBgAlt, border: `1px solid ${c.border}`, color: c.textMuted }}>
                        <strong>Guidance/Hint:</strong> {pr.guidance}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-3">
                      <button onClick={() => setPracticeRevealed(prev => ({ ...prev, [idx]: !isAnswerRevealed }))}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-bold h-8 border transition-all cursor-pointer"
                        style={{
                          background: isAnswerRevealed ? c.surfaceHover : c.violetBg,
                          borderColor: c.borderHover,
                          color: isAnswerRevealed ? c.text : c.violet
                        }}>
                        {isAnswerRevealed ? "Hide Solution" : "Reveal Model Answer"}
                      </button>
                    </div>
                    <AnimatePresence>
                      {isAnswerRevealed && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                          className="space-y-3 pt-3 border-t overflow-hidden" style={{ borderColor: c.divider }}>
                          {pr.expected_answer && (
                            <div className="space-y-1">
                              <span className="text-[9px] uppercase tracking-widest font-extrabold block" style={{ color: c.emerald }}>Ideal Model Answer</span>
                              <div className="text-xs leading-relaxed p-3.5 rounded-xl" style={{ background: c.emeraldBg, border: `1px solid ${c.emeraldBorder}`, color: c.textSec }}>
                                {parseMarkdown(pr.expected_answer)}
                              </div>
                            </div>
                          )}
                          {pr.red_flag && (
                            <div className="space-y-1">
                              <span className="text-[9px] uppercase tracking-widest font-extrabold block" style={{ color: c.rose }}>Critical Trap / Common Mistake</span>
                              <div className="text-xs leading-relaxed p-3.5 rounded-xl" style={{ background: c.roseBg, border: `1px solid ${c.roseBorder}`, color: c.textSec }}>
                                {parseMarkdown(pr.red_flag)}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {data.quiz && data.quiz.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xs uppercase font-extrabold tracking-wider flex items-center gap-1.5" style={{ color: c.textMuted }}>
              <BookOpenCheck size={13} style={{ color: (c[mode.textColor.replace("text-", "") as keyof typeof c] as string) || c.text }} /> Comprehension Checkpoint Quiz
            </h3>
            <div className="space-y-6">
              {data.quiz.map((q, qIdx) => {
                const userAns = quizAnswers[qIdx];
                const isSubmitted = quizSubmitted[qIdx];
                return (
                  <div key={qIdx} className="p-6 rounded-2xl" style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
                    <div className="space-y-5">
                      <div className="pb-3" style={{ borderBottom: `1px solid ${c.divider}` }}>
                        <span className="text-[10px] font-mono" style={{ color: c.textMuted }}>QUESTION {qIdx + 1} OF {data.quiz!.length}</span>
                        <h4 className="text-sm font-bold mt-1" style={{ color: c.text }}>{q.question}</h4>
                      </div>
                      <div className="space-y-2">
                        {q.options.map((opt) => {
                          const isSelected = userAns === opt;
                          const isCorrect = opt === q.answer;
                          let optionStyle: React.CSSProperties = { background: "rgba(0,0,0,0.35)", borderColor: c.border };
                          if (isSelected && !isSubmitted) {
                            optionStyle = { background: c.cardBgAlt, borderColor: c.borderHover, color: c.text };
                          } else if (isSubmitted) {
                            if (isCorrect) {
                              optionStyle = { background: "rgba(16,185,129,0.15)", borderColor: c.emerald, color: c.emerald };
                            } else if (isSelected) {
                              optionStyle = { background: "rgba(244,63,94,0.15)", borderColor: c.rose, color: c.rose };
                            } else {
                              optionStyle = { background: "rgba(0,0,0,0.2)", borderColor: c.border, opacity: 0.55 };
                            }
                          }
                          return (
                            <button key={opt} disabled={isSubmitted} onClick={() => handleQuizSelect(qIdx, opt)}
                              className="w-full text-left p-3.5 rounded-xl border text-xs font-semibold transition-all duration-200 cursor-pointer flex justify-between items-center"
                              style={optionStyle}>
                              <span>{opt}</span>
                              {isSubmitted && isCorrect && <CheckCircle size={15} style={{ color: c.emerald }} />}
                              {isSubmitted && isSelected && !isCorrect && <AlertTriangle size={15} style={{ color: c.rose }} />}
                            </button>
                          );
                        })}
                      </div>
                      <div className="pt-1 flex flex-col gap-3">
                        {!isSubmitted ? (
                          <button disabled={!userAns} onClick={() => handleQuizSubmit(qIdx, q.answer)}
                            className="w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-40"
                            style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)", color: "#fff", border: "none" }}>
                            Submit Answer
                          </button>
                        ) : (
                          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                            className="p-4 rounded-xl text-xs leading-relaxed" style={{ background: c.cardBgAlt, border: `1px solid ${c.border}`, color: c.textSec }}>
                            <strong style={{ color: c.emerald }}>Explanation:</strong> {q.explanation}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {data.summary && (
          <div className="space-y-4">
            <h3 className="text-xs uppercase font-extrabold tracking-wider flex items-center gap-1.5" style={{ color: c.textMuted }}>
              <Terminal size={13} /> Study Recap & Summary
            </h3>
            <div className="p-6 rounded-2xl relative overflow-hidden" style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
              <div className="relative space-y-4 select-text">
                <div className="flex justify-between items-center pb-3" style={{ borderBottom: `1px solid ${c.divider}` }}>
                  <span className="text-xs font-black tracking-widest uppercase" style={{ color: (c[mode.textColor.replace("text-", "") as keyof typeof c] as string) || c.text }}>REVISION CHEAT SHEET</span>
                  <span className="text-[10px] font-mono" style={{ color: c.textMuted }}>ACCELERATED DIGEST</span>
                </div>
                <div className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: c.textSec }}>{parseMarkdown(data.summary)}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAdaptiveLesson = (data: UnifiedLesson) => {
    if (level === "beginner") return renderBeginner(data);
    return renderIntermediate(data);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
      className="flex flex-col antialiased" style={{ color: c.text }}>
      <style>{`.lv-scroll { scrollbar-width: thin; } .lv-hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }`}</style>

      {/* HEADER */}
      <div className="flex items-center justify-between pb-3 mb-3" style={{ borderBottom: `1px solid ${c.divider}` }}>
        <div className="flex items-center gap-2.5">
          <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 280, damping: 18 }}
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)" }}>
            <BookOpen size={18} style={{ color: "#fff" }} />
          </motion.div>
          <div>
            <motion.h1 initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
              className="text-base font-extrabold leading-tight" style={{ color: c.text, fontFamily: "'Outfit', sans-serif" }}>
              Learn Any Topic
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
              className="text-xs leading-tight" style={{ color: c.textMuted }}>
              AI-powered accelerated learning plans
            </motion.p>
          </div>
        </div>
      </div>

      {/* TOPICS INPUT */}
      <div className="space-y-6 mb-6" style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: "16px", padding: "24px" }}>
        <div className="space-y-2.5">
          <label className="text-[10px] uppercase font-extrabold tracking-wider flex items-center gap-1.5" style={{ color: c.textMuted }}>
            <Search size={12} style={{ color: c.violet }} /> Learning Objective
          </label>
          <div className="relative">
            <input type="text" value={inputTopic} onChange={e => setInputTopic(e.target.value)}
              placeholder="What would you like to learn today?"
              onKeyDown={e => { if (e.key === "Enter") handleGenerate(inputTopic); }}
              className="w-full pl-5 pr-12 py-4 rounded-xl text-sm font-medium outline-none transition-all"
              style={{ background: c.inputBg, border: `1px solid ${c.border}`, color: c.text }} />
            <button onClick={() => handleGenerate(inputTopic)} disabled={isGenerating || !inputTopic.trim()}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all cursor-pointer disabled:opacity-40"
              style={{ background: c.surface, border: `1px solid ${c.border}`, color: c.textMuted }}>
              <Sparkles size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 pt-1.5">
            {examples.map(ex => (
              <button key={ex} onClick={() => { setInputTopic(ex); handleGenerate(ex); }}
                className="px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer"
                style={{ background: c.surface, border: `1px solid ${c.border}`, color: c.textMuted }}>
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* DURATION & MODE */}
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] uppercase font-extrabold tracking-wider flex items-center gap-1.5" style={{ color: c.textMuted }}>
              <Clock size={12} style={{ color: c.violet }} /> Learning Timeframe
            </label>
            <div className="flex p-1 rounded-xl max-w-md" style={{ background: c.inputBg, border: `1px solid ${c.border}` }}>
              {[
                { id: "5m" as const, label: "5 Min" },
                { id: "10m" as const, label: "10 Min" },
                { id: "20m" as const, label: "20 Min" },
                { id: "30m" as const, label: "30 Min" }
              ].map(t => {
                const isActive = duration === t.id;
                return (
                  <button key={t.id} onClick={() => setDuration(t.id)}
                    className="flex-1 py-2.5 rounded-lg text-xs font-bold text-center select-none cursor-pointer relative z-10 transition-colors">
                    <span style={{ color: isActive ? c.text : c.textMuted }}>{t.label}</span>
                    {isActive && (
                      <motion.div layoutId="activeDuration"
                        className="absolute inset-0 rounded-lg -z-10"
                        style={{ background: c.surfaceHover, border: `1px solid ${c.borderHover}` }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] uppercase font-extrabold tracking-wider flex items-center gap-1.5" style={{ color: c.textMuted }}>
              <GraduationCap size={13} style={{ color: c.violet }} /> Learning Mode Selector
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { id: "beginner" as const, label: "Beginner", icon: BookOpen, desc: "Understand from scratch with simple terms & analogies", color: "emerald" },
                { id: "intermediate" as const, label: "Intermediate", icon: Layers, desc: "Dive into practical details, mechanics, and design", color: "violet" },
                { id: "interview" as const, label: "Interview", icon: Award, desc: "Prepare for placements, trade-offs, and traps", color: "amber" },
                { id: "revision" as const, label: "Quick Revision", icon: Zap, desc: "Refresh knowledge with condensed sheets", color: "rose" }
              ].map(m => {
                const isActive = level === m.id;
                const Icon = m.icon;
                const colorKey = m.color as keyof typeof c;
                const borderColor = `${m.color}Border` as keyof typeof c;
                const bgColor = `${m.color}Bg` as keyof typeof c;
                return (
                  <motion.button key={m.id} type="button" onClick={() => setLevel(m.id)}
                    whileHover={{ scale: 1.02, y: -4 }} whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="relative p-5 rounded-2xl border text-left flex flex-col justify-between h-[170px] cursor-pointer transition-all duration-300 group overflow-hidden"
                    style={{
                      background: (isActive ? c[bgColor] : c.cardBg) as string,
                      borderColor: (isActive ? c[borderColor] : c.border) as string
                    }}>
                    <div className="flex justify-between items-center w-full relative z-10">
                      <div className="p-2 rounded-xl" style={{
                        background: (isActive ? c[bgColor] : c.surface) as string,
                        color: (isActive ? c[colorKey] : c.textMuted) as string
                      }}>
                        <Icon size={18} />
                      </div>
                      {isActive && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full" style={{ background: c[bgColor] as string, color: c[colorKey] as string, border: `1px solid ${c[borderColor] as string}` }}>
                          Active
                        </span>
                      )}
                    </div>
                    <div className="space-y-1.5 relative z-10">
                      <h4 className="text-sm font-black leading-none tracking-tight" style={{ color: c.text }}>{m.label}</h4>
                      <p className="text-[11px] leading-normal line-clamp-2" style={{ color: c.textMuted }}>{m.desc}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        <button onClick={() => handleGenerate(inputTopic)} disabled={isGenerating || !inputTopic.trim()}
          className="w-full py-3 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)", color: "#fff", border: "none" }}>
          <Sparkles size={16} /> Generate Accelerated Lesson
        </button>
      </div>

      {/* LOADING STATE */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
            className="p-6 rounded-2xl space-y-6 relative overflow-hidden mb-6"
            style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
            <div className="space-y-4 max-w-xl mx-auto text-center">
              <h3 className="text-lg font-bold flex items-center justify-center gap-2" style={{ color: c.text }}>
                <Sparkles size={18} style={{ color: c.violet }} /> Generating Personalized Lesson...
              </h3>
              <p className="text-xs font-mono" style={{ color: c.textMuted }}>Synthesizing topic boundaries via AI model</p>
            </div>
            <div className="relative max-w-md mx-auto py-4">
              <div className="absolute left-[15px] top-6 bottom-6 w-[2px]" style={{ background: c.border }} />
              <div className="space-y-6 relative">
                {loadingSteps.map((step, idx) => {
                  const isDone = loadingStep > idx;
                  const isActive = loadingStep === idx;
                  return (
                    <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                      className="flex items-center gap-4 pl-1">
                      <div className="relative z-10 flex items-center justify-center">
                        {isDone ? (
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{ background: c.greenBg, border: `1px solid ${c.emerald}`, color: c.emerald }}>
                            <Check size={14} />
                          </div>
                        ) : isActive ? (
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold animate-pulse"
                            style={{ background: c.violetBg, border: `1px solid ${c.violet}`, color: c.violet }}>
                            <RotateCcw className="animate-spin" size={12} />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-mono"
                            style={{ background: c.inputBg, border: `1px solid ${c.border}`, color: c.textMuted }}>
                            {idx + 1}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <span className="text-xs font-mono" style={{
                          color: isDone ? c.emerald : isActive ? c.violet : c.textMuted,
                          fontWeight: isActive ? 700 : 400
                        }}>{step}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ERROR STATE */}
      {error && (
        <div className="p-4 rounded-xl flex items-start gap-3 mb-6" style={{ background: c.roseBg, border: `1px solid ${c.roseBorder}` }}>
          <AlertTriangle size={18} style={{ color: c.rose }} className="shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold" style={{ color: c.text }}>Generation Failed</h4>
            <p className="text-xs leading-normal" style={{ color: c.textMuted }}>{error}</p>
          </div>
        </div>
      )}

      {/* LESSON CONTENT */}
      <AnimatePresence>
        {lessonData && !isGenerating && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-8">
            {/* LESSON HEADER */}
            <div className="p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              style={{ background: c.surface, border: `1px solid ${c.border}` }}>
              <div className="space-y-1">
                <div className="inline-flex gap-1.5 items-center text-[10px] uppercase font-extrabold tracking-wider" style={{ color: c.violet }}>
                  <Sparkles size={10} /> Adaptive Lesson Generated ({duration} &bull; {level})
                </div>
                <h2 className="text-xl font-black tracking-tight" style={{ color: c.text }}>{currentTopic}</h2>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setIsScratchpadOpen(!isScratchpadOpen)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                  style={{
                    background: isScratchpadOpen ? c.violetBg : c.surface,
                    border: `1px solid ${isScratchpadOpen ? c.violetBorder : c.border}`,
                    color: isScratchpadOpen ? c.violet : c.text
                  }}>
                  <Edit3 size={13} className="inline mr-1.5" />
                  {isScratchpadOpen ? "Hide Study Companion" : "Open Study Companion"}
                </button>
                <div className="text-xs px-3 py-1 rounded-lg flex items-center gap-1.5" style={{ background: c.cardBgAlt, border: `1px solid ${c.border}`, color: c.textMuted }}>
                  <Clock size={12} style={{ color: c.violet }} /> Digest: {duration}
                </div>
              </div>
            </div>

            {/* SPLIT SCREEN */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className={isScratchpadOpen ? "lg:col-span-7 space-y-8" : "lg:col-span-12 space-y-8"}>
                {renderAdaptiveLesson(lessonData)}

                <div className="pt-4" style={{ borderTop: `1px solid ${c.divider}` }}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl"
                    style={{ background: c.violetBg, border: `1px solid ${c.violetBorder}` }}>
                    <div className="space-y-1">
                      <p className="text-sm font-black flex items-center gap-2" style={{ color: c.text }}>
                        <Zap size={15} style={{ color: c.violet }} /> Ready to test your understanding?
                      </p>
                      <p className="text-xs" style={{ color: c.textMuted }}>
                        Generate a personalized quiz on <strong style={{ color: c.textSec }}>{currentTopic}</strong> based on your learning mode.
                      </p>
                    </div>
                    <button className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer"
                      style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)", color: "#fff", border: "none" }}>
                      <Award size={15} /> Generate Quiz <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* SCRATCHPAD */}
              {isScratchpadOpen && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  className="lg:col-span-5 rounded-2xl p-5 sticky top-6 space-y-5"
                  style={{ background: c.stickyBg, border: `1px solid ${c.violetBorder}`, backdropFilter: "blur(12px)" }}>
                  <div className="flex justify-between items-center pb-3" style={{ borderBottom: `1px solid ${c.divider}` }}>
                    <div className="space-y-0.5">
                      <h3 className="text-sm font-bold flex items-center gap-1.5" style={{ color: c.text }}>
                        <Edit3 size={14} style={{ color: c.violet }} /> Active Scratchpad
                      </h3>
                      <p className="text-[10px]" style={{ color: c.textMuted }}>Study notes companion</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono" style={{ color: c.textMuted }}>
                      {isSavingNotes ? (
                        <><span className="h-1.5 w-1.5 rounded-full animate-ping" style={{ background: c.violet }} /><span>Saving...</span></>
                      ) : (
                        <><Check size={11} style={{ color: c.emerald }} /><span style={{ color: c.emerald }}>Auto-saved</span></>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-1 p-1 rounded-lg" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
                    {[
                      { id: "notes" as const, label: "My Notes" },
                      { id: "takeaways" as const, label: "Takeaways" },
                      { id: "playground" as const, label: "Playground" }
                    ].map(t => {
                      const isActive = scratchpadTab === t.id;
                      return (
                        <button key={t.id} onClick={() => setScratchpadTab(t.id)}
                          className="flex-1 py-1.5 rounded-md text-[10px] font-semibold text-center select-none cursor-pointer relative z-10 transition-colors">
                          <span style={{ color: isActive ? c.text : c.textMuted }}>{t.label}</span>
                          {isActive && (
                            <motion.div layoutId="activeScratchTab"
                              className="absolute inset-0 rounded-md -z-10"
                              style={{ background: c.surfaceHover, border: `1px solid ${c.borderHover}` }}
                              transition={{ type: "spring", stiffness: 380, damping: 30 }} />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="min-h-[300px] flex flex-col">
                    {scratchpadTab === "notes" && (
                      <div className="flex-1 flex flex-col space-y-3">
                        <textarea value={notesText} onChange={e => handleNotesChange(e.target.value)}
                          placeholder="Write notes here or copy concepts from 'Takeaways' tab..."
                          className="flex-1 w-full min-h-[320px] p-3 rounded-lg text-sm leading-relaxed resize-y outline-none"
                          style={{ background: c.inputBg, border: `1px solid ${c.border}`, color: c.textSec }} />
                        <div className="text-[10px] flex justify-between" style={{ color: c.textMuted }}>
                          <span>Markdown supported</span>
                          <span>{notesText.length} chars</span>
                        </div>
                      </div>
                    )}

                    {scratchpadTab === "takeaways" && (
                      <div className="space-y-4">
                        <div className="text-[11px] leading-normal p-3 rounded-lg flex items-start gap-2" style={{ background: c.surface, border: `1px solid ${c.border}`, color: c.textMuted }}>
                          <Sparkles size={12} style={{ color: c.violet }} className="shrink-0 mt-0.5" />
                          <span>Copy concepts directly into your active Scratchpad notes.</span>
                        </div>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                          {lessonData.key_concepts.map((concept, idx) => (
                            <div key={idx} className="p-3 rounded-xl transition-colors space-y-2" style={{ background: c.cardBg, border: `1px solid ${c.border}` }}>
                              <div className="flex justify-between items-center">
                                <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: c.text }}>{concept.title}</h4>
                                <button onClick={() => handleImportConcept(concept)}
                                  className="px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                                  style={{ background: c.violetBg, border: `1px solid ${c.violetBorder}`, color: c.violet }}>
                                  <Plus size={8} /> Copy to Notes
                                </button>
                              </div>
                              <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: c.textMuted }}>{concept.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {scratchpadTab === "playground" && (
                      <div className="space-y-4 flex-1 flex flex-col justify-between">
                        <div className="space-y-3 flex-1 flex flex-col">
                          <div className="flex justify-between items-center text-[10px] font-mono pl-1" style={{ color: c.textMuted }}>
                            <span className="flex items-center gap-1"><Terminal size={11} style={{ color: c.violet }} /> simulator_script.py</span>
                          </div>
                          <div className="rounded-xl border font-mono text-[11px] leading-relaxed p-4 flex-1 min-h-[160px] whitespace-pre-wrap select-text"
                            style={{ borderColor: c.border, background: "rgba(0,0,0,0.4)", color: c.textSec }}>
                            <code>
                              {currentTopic.toLowerCase().includes("gradient")
                                ? `# Gradient Descent optimization simulator\nimport numpy as np\n\nweights = 10.0\nlearning_rate = 0.01\ngradient = 2.5\n\nprint("Updating weights...")\nweights = weights - (learning_rate * gradient)\nprint(f"Final weights: {weights}")`
                                : currentTopic.toLowerCase().includes("sql") || currentTopic.toLowerCase().includes("join")
                                  ? `# SQL Join execution simulation\nimport sqlite3\n\nconn = sqlite3.connect(':memory:')\n# Executing query:\n# SELECT o.id, c.name FROM orders o INNER JOIN customers c ON o.cust_id = c.id`
                                  : `# Activation Function execution\nimport numpy as np\n\ninputs = np.array([0.5, -0.2])\nweights = np.array([0.8, 0.4])\nbias = -0.1\n\nz = np.dot(inputs, weights) + bias\nactivation = max(0, z)\nprint(f"ReLU activation: {activation}")`}
                            </code>
                          </div>
                          <button onClick={handleRunPlayground} disabled={isRunningPlayground}
                            className="w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40"
                            style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)", color: "#fff", border: "none" }}>
                            {isRunningPlayground ? "Running script..." : "Execute Python Script"} <Play size={10} fill="currentColor" />
                          </button>
                        </div>
                        {playgroundOutput && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="rounded-lg border p-3 font-mono text-[10px] leading-relaxed whitespace-pre-wrap"
                            style={{ borderColor: c.border, background: "rgba(0,0,0,0.4)", color: c.emerald }}>
                            {playgroundOutput}
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
