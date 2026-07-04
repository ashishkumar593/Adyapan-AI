"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import {
  FileCheck2, ArrowLeft, UploadCloud, CheckCircle,
  AlertTriangle, Star, HelpCircle, Sparkles, RefreshCw, Calendar
} from "lucide-react";

import type { ResumeHubViewType } from "@/types/resume";

interface AtsReport {
  id: string;
  score: number;
  missingKeywords: string[];
  recommendations: {
    strengths?: string[];
    formattingIssues?: string[];
    recommendations?: string[];
  };
  createdAt: string;
  resume?: {
    title: string;
  };
}

interface AtsCheckerViewProps {
  setView: (v: ResumeHubViewType) => void;
}

export function AtsCheckerView({ setView }: AtsCheckerViewProps) {
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AtsReport | null>(null);
  const [history, setHistory] = useState<AtsReport[]>([]);
  const [dragging, setDragging] = useState(false);

  const loadHistory = async () => {
    try {
      const res = await api.get("/ats/history");
      setHistory(res.data.reports || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const f = e.dataTransfer.files[0];
      if (f.type === "application/pdf" || f.name.endsWith(".docx") || f.name.endsWith(".doc")) {
        setFile(f);
      } else {
        alert("Please upload a PDF or DOCX file.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("resume", file);
      fd.append("targetRole", targetRole);

      const res = await api.post("/ats/analyze", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data.success && res.data.report) {
        setReport(res.data.report);
        loadHistory();
      }
    } catch (err) {
      console.error(err);
      alert("❌ Failed to analyze resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to color code the score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "#10b981"; // green
    if (score >= 60) return "#f59e0b"; // orange
    return "#ef4444"; // red
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "rgba(16,185,129,0.1)";
    if (score >= 60) return "rgba(245,158,11,0.1)";
    return "rgba(239,68,68,0.1)";
  };

  // Extract nested recommendations from JSON field
  const recommendationsData = report?.recommendations || {};
  const strengths = recommendationsData.strengths || [];
  const formattingIssues = recommendationsData.formattingIssues || [];
  const recommendations = recommendationsData.recommendations || [];
  const missingKeywords = report?.missingKeywords || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setView("resume-hub")}
          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
            ATS Score Checker
          </h1>
          <p className="text-xs text-white/50">Upload your resume to check search visibility score.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Columns: File Upload / Result Display */}
        <div className="lg:col-span-7 space-y-6">
          {!report ? (
            <div className="backdrop-blur-md bg-white/3 border border-white/5 rounded-2xl p-6 space-y-6">
              {/* Inputs */}
              <div>
                <label className="block text-[10px] text-white/50 uppercase font-semibold mb-1.5">Target Job Role</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={e => setTargetRole(e.target.value)}
                  placeholder="e.g. Full Stack Engineer"
                  className="w-full bg-white/2 border border-white/5 focus:border-[#f59e0b] focus:outline-none rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              {/* Dropzone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
                  dragging ? "border-[#f59e0b] bg-[#f59e0b]/5" : "border-white/10 hover:border-white/20 bg-white/1"
                }`}
                onClick={() => document.getElementById("ats-file-input")?.click()}
              >
                <input
                  type="file"
                  id="ats-file-input"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <UploadCloud className="w-12 h-12 text-white/40 mx-auto mb-4" />
                {file ? (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white">{file.name}</p>
                    <p className="text-[10px] text-white/40">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-white">Drag & drop your resume here, or click to upload</p>
                    <p className="text-[10px] text-white/40 mt-1">Supports PDF, DOCX, DOC up to 5MB</p>
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                disabled={loading || !file}
                onClick={handleAnalyze}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#f59e0b] hover:bg-[#d97706] text-black font-bold text-xs p-3 rounded-xl transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Processing Audit...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Run ATS Audit
                  </>
                )}
              </button>
            </div>
          ) : (
            // Results Display
            <div className="space-y-6">
              {/* Score summary */}
              <div className="backdrop-blur-md bg-white/3 border border-white/5 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
                {/* SVG Gauge */}
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="54" stroke="rgba(255,255,255,0.05)" strokeWidth="10" fill="transparent" />
                    <circle
                      cx="64"
                      cy="64"
                      r="54"
                      stroke={getScoreColor(report.score)}
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 54}
                      strokeDashoffset={2 * Math.PI * 54 * (1 - report.score / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-2xl font-extrabold text-white">{report.score}</span>
                    <span className="block text-[8px] text-white/50 uppercase tracking-wider">Score</span>
                  </div>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2">
                  <div className="inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider" style={{ background: getScoreBg(report.score), color: getScoreColor(report.score) }}>
                    {report.score >= 80 ? "Optimized" : report.score >= 60 ? "Average" : "Needs Review"}
                  </div>
                  <h2 className="text-base font-bold text-white">ATS Analysis Complete</h2>
                  <p className="text-xs text-white/60">
                    Audit evaluated for target role: <strong className="text-[#f59e0b]">{targetRole}</strong>. Here are the strengths and key areas to enhance.
                  </p>
                  <button
                    onClick={() => { setReport(null); setFile(null); }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#f59e0b] hover:underline bg-transparent border-none cursor-pointer mt-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Analyze Another Resume
                  </button>
                </div>
              </div>

              {/* Specific Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Missing Keywords */}
                <div className="backdrop-blur-md bg-white/3 border border-white/5 rounded-2xl p-5 space-y-3">
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <AlertTriangle className="w-4 h-4 text-[#f59e0b]" /> Missing Keywords
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {missingKeywords.length === 0 ? (
                      <span className="text-xs text-white/40 italic">None detected. Great job!</span>
                    ) : (
                      missingKeywords.map((kw: string) => (
                        <span key={kw} className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/10 text-[10px] font-semibold rounded">
                          {kw}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Formatting Warnings */}
                <div className="backdrop-blur-md bg-white/3 border border-white/5 rounded-2xl p-5 space-y-3">
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <HelpCircle className="w-4 h-4 text-cyan-400" /> Formatting Warnings
                  </h3>
                  <ul className="space-y-1.5 text-[10px] text-white/70 pl-2">
                    {formattingIssues.length === 0 ? (
                      <li className="italic text-white/40">No formatting issues detected.</li>
                    ) : (
                      formattingIssues.map((issue: string, idx: number) => (
                        <li key={idx} className="list-disc leading-relaxed">{issue}</li>
                      ))
                    )}
                  </ul>
                </div>

                {/* Strengths */}
                <div className="backdrop-blur-md bg-white/3 border border-white/5 rounded-2xl p-5 space-y-3">
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <CheckCircle className="w-4 h-4 text-[#10b981]" /> Core Strengths
                  </h3>
                  <ul className="space-y-1.5 text-[10px] text-white/70 pl-2">
                    {strengths.length === 0 ? (
                      <li className="italic text-white/40">No major strengths highlighted.</li>
                    ) : (
                      strengths.map((str: string, idx: number) => (
                        <li key={idx} className="list-disc leading-relaxed text-emerald-400/90">{str}</li>
                      ))
                    )}
                  </ul>
                </div>

                {/* Recommendations */}
                <div className="backdrop-blur-md bg-white/3 border border-white/5 rounded-2xl p-5 space-y-3">
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <Star className="w-4 h-4 text-amber-400" /> Recommendations
                  </h3>
                  <ul className="space-y-1.5 text-[10px] text-white/70 pl-2">
                    {recommendations.length === 0 ? (
                      <li className="italic text-white/40">No specific recommendations.</li>
                    ) : (
                      recommendations.map((rec: string, idx: number) => (
                        <li key={idx} className="list-disc leading-relaxed">{rec}</li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right 5 Columns: Historical Reports */}
        <div className="lg:col-span-5 space-y-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-[#f59e0b]" /> Audit History
          </h2>
          <div className="backdrop-blur-md bg-white/3 border border-white/5 rounded-2xl p-4 space-y-3 max-h-[480px] overflow-y-auto">
            {history.length === 0 ? (
              <div className="text-center py-12 text-white/40">
                <FileCheck2 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <span className="text-xs font-semibold">No past evaluations found.</span>
              </div>
            ) : (
              history.map((h) => (
                <div
                  key={h.id}
                  onClick={() => {
                    // Populate from history item
                    setReport(h);
                  }}
                  className="p-3 bg-white/2 hover:bg-white/5 border border-white/5 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="min-width-0 flex-1 pr-2">
                    <div className="text-xs font-bold text-white truncate">
                      {h.resume?.title || "Imported Resume"}
                    </div>
                    <div className="text-[9px] text-white/40 mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(h.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center font-extrabold text-[10px]"
                    style={{ background: getScoreBg(h.score), color: getScoreColor(h.score) }}
                  >
                    {h.score}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
