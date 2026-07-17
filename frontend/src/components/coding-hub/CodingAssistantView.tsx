"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code2,
  Lightbulb,
  FolderKanban,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Copy,
  Check,
  RotateCcw,
  Terminal,
  Play,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";
import { useTheme } from "@/hooks/useTheme";
import { ChatBackground } from "@/components/ady-chat/ChatBackground";
import { renderMarkdown } from "@/utils/renderMarkdown";

type Step = "mode" | "input" | "result";
type Mode = "generate" | "explain" | "project";

const MODES: {
  id: Mode;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  placeholder: string;
  fields: { name: string; label: string; placeholder: string; type: "textarea" | "input" }[];
}[] = [
  {
    id: "generate",
    title: "Generate Code",
    description: "Describe what you want to build and get production-ready code",
    icon: <Code2 size={28} />,
    color: "#10b981",
    placeholder: "e.g., Build a REST API with JWT authentication, rate limiting, and role-based access control",
    fields: [
      { name: "prompt", label: "What do you want to build?", placeholder: "Describe your code requirement in detail...", type: "textarea" },
    ],
  },
  {
    id: "explain",
    title: "Explain Code",
    description: "Paste any code and get a detailed line-by-line explanation",
    icon: <Lightbulb size={28} />,
    color: "#f59e0b",
    placeholder: "Paste your code here...",
    fields: [
      { name: "code", label: "Paste your code", placeholder: "// Paste your code here...", type: "textarea" },
    ],
  },
  {
    id: "project",
    title: "Create Project",
    description: "Get a full project plan with architecture, tech stack, and roadmap",
    icon: <FolderKanban size={28} />,
    color: "#0ea5e9",
    placeholder: "e.g., Real-time chat application with React, Socket.io, and Express",
    fields: [
      { name: "projectName", label: "Project Name / Topic", placeholder: "e.g., Real-time Chat App", type: "input" },
      { name: "description", label: "Description (optional)", placeholder: "Describe the project goals, features, and requirements...", type: "textarea" },
    ],
  },
];

export default function CodingAssistantView() {
  const theme = useTheme();
  const isDark = theme === "dark";

  const [step, setStep] = useState<Step>("mode");
  const [selectedMode, setSelectedMode] = useState<Mode | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  const modeConfig = MODES.find((m) => m.id === selectedMode);

  const handleSelectMode = (mode: Mode) => {
    setSelectedMode(mode);
    setFormValues({});
    setStep("input");
  };

  const handleSubmit = async () => {
    if (!selectedMode) return;

    if (selectedMode === "generate" && !formValues.prompt?.trim()) {
      toast.error("Please describe what you want to build");
      return;
    }
    if (selectedMode === "explain" && !formValues.code?.trim()) {
      toast.error("Please paste your code");
      return;
    }
    if (selectedMode === "project" && !formValues.projectName?.trim()) {
      toast.error("Please enter a project name");
      return;
    }

    setLoading(true);
    try {
      let res;
      if (selectedMode === "generate") {
        res = await api.post("/coding/generate", { prompt: formValues.prompt });
      } else if (selectedMode === "explain") {
        res = await api.post("/coding/explain", { codeSnippet: formValues.code });
      } else {
        const payload = formValues.description
          ? { projectName: `${formValues.projectName}: ${formValues.description}` }
          : { projectName: formValues.projectName };
        res = await api.post("/coding/project", payload);
      }
      setResult(res.data);
      setStep("result");
    } catch (err) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      toast.error(e?.response?.data?.error || e?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep("mode");
    setSelectedMode(null);
    setFormValues({});
    setResult(null);
  };

  const handleBack = () => {
    if (step === "result") {
      setResult(null);
      setStep("input");
    } else if (step === "input") {
      setStep("mode");
      setSelectedMode(null);
      setFormValues({});
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const currentColor = modeConfig?.color || "#10b981";

  return (
    <div
      className="relative flex flex-col overflow-hidden w-full"
      style={{
        margin: "-1.25rem",
        width: "calc(100% + 2.5rem)",
        height: "calc(100% + 2.5rem)",
        background: isDark ? "#070715" : "#f0f4ff",
        color: isDark ? "#fff" : "#1a1a2e",
      }}
    >
      <ChatBackground isDark={isDark} />

      <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div
          className="px-6 py-4 border-b flex items-center justify-between flex-shrink-0"
          style={{
            borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
            background: isDark ? "rgba(7,7,21,0.9)" : "rgba(240,244,255,0.9)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex items-center gap-3">
            {step !== "mode" && (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={handleBack}
                className="w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer border"
                style={{
                  background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                  borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                }}
              >
                <ArrowLeft size={16} style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)" }} />
              </motion.button>
            )}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${currentColor}30, ${currentColor}08)`,
                border: `1px solid ${currentColor}40`,
                color: currentColor,
              }}
            >
              {modeConfig?.icon || <Code2 size={18} />}
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {step === "mode" ? "CodeForge Assistant" : modeConfig?.title}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                {/* Step indicators */}
                {(["mode", "input", "result"] as Step[]).map((s) => {
                  const steps = ["mode", "input", "result"];
                  const currentIdx = steps.indexOf(step);
                  const thisIdx = steps.indexOf(s);
                  const isActive = thisIdx === currentIdx;
                  const isDone = thisIdx < currentIdx;
                  return (
                    <span
                      key={s}
                      className="w-5 h-1 rounded-full transition-all duration-300"
                      style={{
                        background: isActive
                          ? currentColor
                          : isDone
                          ? `${currentColor}60`
                          : isDark
                          ? "rgba(255,255,255,0.1)"
                          : "rgba(0,0,0,0.1)",
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {step !== "mode" && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border cursor-pointer"
                style={{
                  background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                  borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                  color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)",
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <RotateCcw size={12} />
                Start Over
              </motion.button>
            )}
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <AnimatePresence mode="wait">
            {/* Step 1: Choose Mode */}
            {step === "mode" && (
              <motion.div
                key="mode"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto px-6 py-12"
              >
                <div className="text-center mb-10">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                    style={{
                      background: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(14,165,233,0.1))",
                      border: "1.5px solid rgba(16,185,129,0.3)",
                      boxShadow: "0 0 30px rgba(16,185,129,0.1)",
                    }}
                  >
                    <Code2 size={30} style={{ color: "#10b981" }} />
                  </motion.div>
                  <h1
                    className="text-3xl font-extrabold tracking-tight mb-2"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    Adyapan{" "}
                    <span style={{ color: "#10b981" }}>CodeForge</span>
                  </h1>
                  <p className="text-sm max-w-md mx-auto" style={{ color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)" }}>
                    Choose what you want to do
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {MODES.map((m, i) => (
                    <motion.button
                      key={m.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.1 }}
                      onClick={() => handleSelectMode(m.id)}
                      className="text-left p-6 rounded-2xl border transition-all cursor-pointer group"
                      style={{
                        background: isDark ? "rgba(8,6,25,0.5)" : "rgba(255,255,255,0.7)",
                        borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                      }}
                      whileHover={{
                        scale: 1.02,
                        borderColor: `${m.color}50`,
                        boxShadow: `0 8px 30px ${m.color}12`,
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all"
                        style={{
                          background: `${m.color}15`,
                          color: m.color,
                          border: `1px solid ${m.color}30`,
                        }}
                      >
                        {m.icon}
                      </div>
                      <h3 className="text-base font-bold mb-1.5" style={{ color: isDark ? "#fff" : "#1a1a2e" }}>
                        {m.title}
                      </h3>
                      <p className="text-xs leading-relaxed" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)" }}>
                        {m.description}
                      </p>
                      <div
                        className="flex items-center gap-1 mt-4 text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: m.color }}
                      >
                        Get Started <ArrowRight size={13} />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Input */}
            {step === "input" && modeConfig && (
              <motion.div
                key="input"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                className="max-w-3xl mx-auto px-6 py-10"
              >
                <div className="space-y-5">
                  {modeConfig.fields.map((field) => (
                    <div key={field.name}>
                      <label
                        className="block text-xs font-bold uppercase tracking-wider mb-2"
                        style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)" }}
                      >
                        {field.label}
                      </label>
                      {field.type === "textarea" ? (
                        <textarea
                          value={formValues[field.name] || ""}
                          onChange={(e) => setFormValues((prev) => ({ ...prev, [field.name]: e.target.value }))}
                          placeholder={field.placeholder}
                          className="w-full rounded-xl border p-4 text-sm leading-relaxed resize-none outline-none transition-all"
                          style={{
                            background: isDark ? "rgba(8,6,25,0.6)" : "rgba(255,255,255,0.8)",
                            borderColor: `${currentColor}25`,
                            color: isDark ? "#fff" : "#1a1a2e",
                            minHeight: field.name === "code" ? "200px" : "120px",
                          }}
                          rows={field.name === "code" ? 10 : 5}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = `${currentColor}60`;
                            e.currentTarget.style.boxShadow = `0 0 0 3px ${currentColor}10`;
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = `${currentColor}25`;
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        />
                      ) : (
                        <input
                          value={formValues[field.name] || ""}
                          onChange={(e) => setFormValues((prev) => ({ ...prev, [field.name]: e.target.value }))}
                          placeholder={field.placeholder}
                          className="w-full rounded-xl border p-4 text-sm outline-none transition-all"
                          style={{
                            background: isDark ? "rgba(8,6,25,0.6)" : "rgba(255,255,255,0.8)",
                            borderColor: `${currentColor}25`,
                            color: isDark ? "#fff" : "#1a1a2e",
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = `${currentColor}60`;
                            e.currentTarget.style.boxShadow = `0 0 0 3px ${currentColor}10`;
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = `${currentColor}25`;
                            e.currentTarget.style.boxShadow = "none";
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSubmit();
                            }
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end mt-6">
                  <motion.button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold cursor-pointer"
                    style={{
                      background: loading ? `${currentColor}50` : currentColor,
                      color: "#000",
                      boxShadow: `0 4px 16px ${currentColor}30`,
                      opacity: loading ? 0.7 : 1,
                    }}
                    whileHover={!loading ? { scale: 1.03, boxShadow: `0 6px 24px ${currentColor}40` } : {}}
                    whileTap={!loading ? { scale: 0.97 } : {}}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Play size={14} fill="currentColor" />
                        Generate
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Results */}
            {step === "result" && result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto px-6 py-8"
              >
                {selectedMode === "generate" && <GenerateResult result={result as Record<string, string>} isDark={isDark} onCopy={handleCopy} />}
                {selectedMode === "explain" && <ExplainResult result={result as Record<string, string>} isDark={isDark} />}
                {selectedMode === "project" && <ProjectResult result={result as Record<string, unknown>} isDark={isDark} />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── Result Renderers ────────────────────────────────────────────────────────

function GenerateResult({
  result,
  isDark,
  onCopy,
}: {
  result: Record<string, string>;
  isDark: boolean;
  onCopy: (text: string) => void;
}) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyField = (key: string, val: string) => {
    onCopy(val);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const sections: { key: string; label: string; value: string }[] = [];
  if (result.code) sections.push({ key: "code", label: "Code", value: result.code });
  if (result.folderStructure) sections.push({ key: "folder", label: "Folder Structure", value: result.folderStructure });
  if (result.setupGuide) sections.push({ key: "setup", label: "Setup Guide", value: result.setupGuide });

  return (
    <div className="space-y-4">
      {sections.map((s) => (
        <div
          key={s.key}
          className="rounded-2xl border overflow-hidden"
          style={{
            background: isDark ? "rgba(8,6,25,0.6)" : "rgba(255,255,255,0.9)",
            borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}
          >
            <span
              className="text-[10px] uppercase font-black tracking-widest"
              style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)" }}
            >
              {s.label}
            </span>
            <motion.button
              onClick={() => copyField(s.key, s.value)}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold cursor-pointer"
              style={{
                background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)",
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {copiedField === s.key ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              {copiedField === s.key ? "Copied" : "Copy"}
            </motion.button>
          </div>
          <div
            className="p-4 text-sm leading-relaxed overflow-x-auto max-h-[500px] overflow-y-auto"
            style={{ color: isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.7)" }}
          >
            {renderMarkdown(s.value, isDark)}
          </div>
        </div>
      ))}
    </div>
  );
}

function ExplainResult({ result, isDark }: { result: Record<string, string>; isDark: boolean }) {
  return (
    <div className="space-y-4">
      {result.explanation && (
        <div
          className="rounded-2xl border overflow-hidden"
          style={{
            background: isDark ? "rgba(8,6,25,0.6)" : "rgba(255,255,255,0.9)",
            borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
          }}
        >
          <div
            className="px-4 py-3 border-b"
            style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}
          >
            <span
              className="text-[10px] uppercase font-black tracking-widest"
              style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)" }}
            >
              Explanation
            </span>
          </div>
          <div
            className="p-5 text-sm leading-relaxed"
            style={{ color: isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.7)" }}
          >
            {renderMarkdown(result.explanation, isDark)}
          </div>
        </div>
      )}

      {result.complexity && (
        <div
          className="rounded-2xl border p-4 flex items-center gap-3"
          style={{
            background: isDark ? "rgba(8,6,25,0.6)" : "rgba(255,255,255,0.9)",
            borderColor: "rgba(245,158,11,0.2)",
          }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(245,158,11,0.12)" }}
          >
            <Terminal size={16} style={{ color: "#f59e0b" }} />
          </div>
          <div>
            <span
              className="text-[10px] font-bold uppercase tracking-wider block"
              style={{ color: "#f59e0b" }}
            >
              Complexity
            </span>
            <span className="text-xs font-mono" style={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)" }}>
              {result.complexity}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectResult({ result, isDark }: { result: Record<string, unknown>; isDark: boolean }) {
  const architecture = result.architecture as string | undefined;
  const techStack = result.techStack as string[] | undefined;
  const folderStructure = result.folderStructure as string | undefined;
  const features = result.features as string[] | undefined;
  const roadmap = result.roadmap as string[] | undefined;

  return (
    <div className="space-y-4">
      {architecture && (
        <ResultCard title="Architecture" isDark={isDark}>
          <div className="text-sm leading-relaxed" style={{ color: isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.7)" }}>
            {renderMarkdown(architecture, isDark)}
          </div>
        </ResultCard>
      )}

      {techStack && techStack.length > 0 && (
        <ResultCard title="Tech Stack" isDark={isDark}>
          <div className="flex flex-wrap gap-2">
            {techStack.map((t: string, i: number) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-lg text-xs font-bold"
                style={{
                  background: isDark ? "rgba(14,165,233,0.1)" : "rgba(14,165,233,0.06)",
                  color: "#0ea5e9",
                  border: "1px solid rgba(14,165,233,0.2)",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </ResultCard>
      )}

      {folderStructure && (
        <ResultCard title="Folder Structure" isDark={isDark}>
          <div className="text-sm leading-relaxed" style={{ color: isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.7)" }}>
            {renderMarkdown(folderStructure, isDark)}
          </div>
        </ResultCard>
      )}

      {features && features.length > 0 && (
        <ResultCard title="Features" isDark={isDark}>
          <div className="space-y-2">
            {features.map((f: string, i: number) => (
              <div key={i} className="flex items-start gap-2 text-xs" style={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)" }}>
                <span className="text-emerald-500 font-bold mt-0.5">&#10003;</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </ResultCard>
      )}

      {roadmap && roadmap.length > 0 && (
        <ResultCard title="Roadmap" isDark={isDark}>
          <div className="space-y-2">
            {roadmap.map((step: string, i: number) => (
              <div key={i} className="flex items-start gap-2 text-xs" style={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)" }}>
                <span className="text-sky-500 font-bold mt-0.5">{i + 1}.</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </ResultCard>
      )}
    </div>
  );
}

function ResultCard({
  title,
  isDark,
  children,
}: {
  title: string;
  isDark: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{
        background: isDark ? "rgba(8,6,25,0.6)" : "rgba(255,255,255,0.9)",
        borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
      }}
    >
      <div
        className="px-4 py-3 border-b"
        style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}
      >
        <span
          className="text-[10px] uppercase font-black tracking-widest"
          style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)" }}
        >
          {title}
        </span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
