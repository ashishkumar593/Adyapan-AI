"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import {
  LineChart, ArrowLeft, ChevronRight,
  Briefcase, Sparkles, RefreshCw, Star, Info, Calendar
} from "lucide-react";

import type { ResumeHubViewType } from "@/types/resume";

interface SwotAnalysisReport {
  id: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  createdAt: string;
  resume?: {
    title: string;
  };
}

interface JobMatchResult {
  matchPercentage: number;
  feedback: string[];
  gapAnalysis: string[];
}

interface ResumeListItem {
  id: string;
  title: string;
}

interface ResumeAnalyzerViewProps {
  setView: (v: ResumeHubViewType) => void;
}

export function ResumeAnalyzerView({ setView }: ResumeAnalyzerViewProps) {
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"swot" | "match">("swot");

  // SWOT results
  const [swotReport, setSwotReport] = useState<SwotAnalysisReport | null>(null);
  const [swotHistory, setSwotHistory] = useState<SwotAnalysisReport[]>([]);

  // Job Match results
  const [jobDescription, setJobDescription] = useState("");
  const [matchResult, setMatchResult] = useState<JobMatchResult | null>(null);



  const loadResumes = async () => {
    try {
      const res = await api.get("/resume/list");
      const list = res.data.resumes || [];
      setResumes(list);
      if (list.length > 0) {
        setSelectedResumeId(list[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadSwotHistory = async () => {
    try {
      const res = await api.get("/resume-analysis/history");
      setSwotHistory(res.data.analyses || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadResumes();
    loadSwotHistory();
  }, []);

  const handleRunSwot = async () => {
    if (!selectedResumeId) return;
    setLoading(true);
    try {
      const res = await api.post("/resume/analyze", { resumeId: selectedResumeId });
      if (res.data.success && res.data.analysis) {
        setSwotReport(res.data.analysis);
        loadSwotHistory();
      }
    } catch (err) {
      console.error(err);
      alert("❌ Failed to perform SWOT analysis.");
    } finally {
      setLoading(false);
    }
  };

  const handleRunJobMatch = async () => {
    if (!selectedResumeId || !jobDescription.trim()) return;
    setLoading(true);
    try {
      const res = await api.post("/resume/job-match", {
        resumeId: selectedResumeId,
        jobDescription,
      });
      if (res.data.success && res.data.matchResult) {
        setMatchResult(res.data.matchResult);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Failed to match job description.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#10b981"; // green
    if (score >= 60) return "#f59e0b"; // orange
    return "#ef4444"; // red
  };

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
            Resume Analyzer
          </h1>
          <p className="text-xs text-white/50">Run deep SWOT analysis and test job description matching.</p>
        </div>
      </div>

      {/* Select resume draft */}
      <div className="backdrop-blur-md bg-white/3 border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1 w-full">
          <label className="block text-[9px] text-white/50 uppercase font-semibold mb-1">Select Resume Draft</label>
          {resumes.length === 0 ? (
            <div className="text-xs text-red-400">No resumes found. Please create a draft in Resume Builder first.</div>
          ) : (
            <select
              value={selectedResumeId}
              onChange={e => setSelectedResumeId(e.target.value)}
              className="w-full bg-[#0d0d19] border border-white/5 focus:border-[#f59e0b] focus:outline-none rounded-lg p-2.5 text-xs text-white"
            >
              {resumes.map(r => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </select>
          )}
        </div>

        {/* Tab Selector */}
        <div className="flex bg-white/5 border border-white/5 rounded-xl p-1 w-full sm:w-auto mt-3 sm:mt-0">
          <button
            onClick={() => setMode("swot")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${mode === "swot" ? "bg-[#f59e0b] text-black" : "text-white/70"}`}
          >
            SWOT Audit
          </button>
          <button
            onClick={() => setMode("match")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${mode === "match" ? "bg-[#f59e0b] text-black" : "text-white/70"}`}
          >
            Job Matcher
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Columns: Action Panels */}
        <div className="lg:col-span-7 space-y-6">
          {mode === "swot" ? (
            // SWOT panel
            <div className="space-y-6">
              {!swotReport ? (
                <div className="backdrop-blur-md bg-white/3 border border-white/5 rounded-2xl p-6 text-center space-y-4">
                  <Star className="w-10 h-10 text-[#f59e0b] mx-auto opacity-70" />
                  <h3 className="text-sm font-bold text-white">SWOT Profile Audit</h3>
                  <p className="text-xs text-white/50 max-w-sm mx-auto leading-relaxed">
                    Evaluate your resume&apos;s Strengths, Weaknesses/Gaps, and Recommendations for growth using artificial intelligence.
                  </p>
                  <button
                    disabled={loading || !selectedResumeId}
                    onClick={handleRunSwot}
                    className="inline-flex items-center gap-2 bg-[#f59e0b] hover:bg-[#d97706] text-black font-bold text-xs px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Performing SWOT...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> Run SWOT Audit
                      </>
                    )}
                  </button>
                </div>
              ) : (
                // SWOT Results
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-white">SWOT Analysis Results</h3>
                    <button
                      onClick={() => setSwotReport(null)}
                      className="text-xs font-bold text-[#f59e0b] hover:underline bg-transparent border-none cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {/* Strengths */}
                    <div className="backdrop-blur-md bg-white/3 border border-white/5 rounded-2xl p-5 space-y-3">
                      <h4 className="text-xs font-bold text-emerald-400 border-b border-white/5 pb-2">✓ Strengths</h4>
                      <ul className="space-y-1.5 text-[10px] text-white/70 pl-2">
                        {((swotReport.strengths || []) as string[]).map((str, idx) => (
                          <li key={idx} className="list-disc leading-relaxed">{str}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Weaknesses */}
                    <div className="backdrop-blur-md bg-white/3 border border-white/5 rounded-2xl p-5 space-y-3">
                      <h4 className="text-xs font-bold text-red-400 border-b border-white/5 pb-2">✗ Weaknesses & Gaps</h4>
                      <ul className="space-y-1.5 text-[10px] text-white/70 pl-2">
                        {((swotReport.weaknesses || []) as string[]).map((wk, idx) => (
                          <li key={idx} className="list-disc leading-relaxed">{wk}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommendations */}
                    <div className="backdrop-blur-md bg-white/3 border border-white/5 rounded-2xl p-5 space-y-3">
                      <h4 className="text-xs font-bold text-[#f59e0b] border-b border-white/5 pb-2">✦ Recommendations</h4>
                      <ul className="space-y-1.5 text-[10px] text-white/70 pl-2">
                        {((swotReport.recommendations || []) as string[]).map((rec, idx) => (
                          <li key={idx} className="list-disc leading-relaxed">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Job Matcher panel
            <div className="space-y-6">
              {!matchResult ? (
                <div className="backdrop-blur-md bg-white/3 border border-white/5 rounded-2xl p-6 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <Briefcase className="w-4 h-4 text-[#f59e0b]" /> Job Match Evaluation
                  </h3>
                  <div>
                    <label className="block text-[10px] text-white/50 uppercase font-semibold mb-1.5">Paste Job Description</label>
                    <textarea
                      rows={6}
                      value={jobDescription}
                      onChange={e => setJobDescription(e.target.value)}
                      placeholder="Paste the target job description (JD) details here..."
                      className="w-full bg-white/2 border border-white/5 focus:border-[#f59e0b] focus:outline-none rounded-lg p-2.5 text-xs text-white resize-none"
                    />
                  </div>
                  <button
                    disabled={loading || !selectedResumeId || !jobDescription.trim()}
                    onClick={handleRunJobMatch}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#f59e0b] hover:bg-[#d97706] text-black font-bold text-xs p-3 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Calculating Match...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> Calculate Match Rate
                      </>
                    )}
                  </button>
                </div>
              ) : (
                // Job Matcher Results
                <div className="space-y-6">
                  <div className="backdrop-blur-md bg-white/3 border border-white/5 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
                    {/* SVG Gauge */}
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="54" stroke="rgba(255,255,255,0.05)" strokeWidth="10" fill="transparent" />
                        <circle
                          cx="64"
                          cy="64"
                          r="54"
                          stroke={getScoreColor(matchResult.matchPercentage)}
                          strokeWidth="10"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 54}
                          strokeDashoffset={2 * Math.PI * 54 * (1 - matchResult.matchPercentage / 100)}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute text-center">
                        <span className="text-2xl font-extrabold text-white">{matchResult.matchPercentage}%</span>
                        <span className="block text-[8px] text-white/50 uppercase tracking-wider">Match</span>
                      </div>
                    </div>

                    <div className="flex-1 text-center sm:text-left space-y-2">
                      <h3 className="text-base font-bold text-white">Job Compatibility Results</h3>
                      <p className="text-xs text-white/60">
                        Review target gaps in requirements and adjust your draft summary or experience points accordingly.
                      </p>
                      <button
                        onClick={() => { setMatchResult(null); setJobDescription(""); }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#f59e0b] hover:underline bg-transparent border-none cursor-pointer mt-2"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Compare Another Job
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tailoring Feedback */}
                    <div className="backdrop-blur-md bg-white/3 border border-white/5 rounded-2xl p-5 space-y-3">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-2">
                        <Info className="w-4 h-4 text-cyan-400" /> Tailoring Advice
                      </h4>
                      <ul className="space-y-1.5 text-[10px] text-white/70 pl-2">
                        {((matchResult.feedback || []) as string[]).map((f, i) => (
                          <li key={i} className="list-disc leading-relaxed">{f}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Requirements Gap */}
                    <div className="backdrop-blur-md bg-white/3 border border-white/5 rounded-2xl p-5 space-y-3">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-2">
                        <Info className="w-4 h-4 text-[#f59e0b]" /> Gaps Identified
                      </h4>
                      <ul className="space-y-1.5 text-[10px] text-white/70 pl-2">
                        {((matchResult.gapAnalysis || []) as string[]).map((gap, i) => (
                          <li key={i} className="list-disc leading-relaxed text-red-300">{gap}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right 5 Columns: SWOT History */}
        <div className="lg:col-span-5 space-y-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <LineChart className="w-5 h-5 text-[#f59e0b]" /> SWOT Audits History
          </h2>
          <div className="backdrop-blur-md bg-white/3 border border-white/5 rounded-2xl p-4 space-y-3 max-h-[480px] overflow-y-auto">
            {swotHistory.length === 0 ? (
              <div className="text-center py-12 text-white/40">
                <LineChart className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <span className="text-xs font-semibold">No past SWOT reviews.</span>
              </div>
            ) : (
              swotHistory.map((h) => (
                <div
                  key={h.id}
                  onClick={() => {
                    setMode("swot");
                    setSwotReport(h);
                  }}
                  className="p-3 bg-white/2 hover:bg-white/5 border border-white/5 rounded-xl flex items-center justify-between cursor-pointer transition-colors group"
                >
                  <div className="min-width-0 flex-1 pr-2">
                    <div className="text-xs font-bold text-white group-hover:text-[#f59e0b] truncate transition-colors">
                      {h.resume?.title || "Draft Resume"}
                    </div>
                    <div className="text-[9px] text-white/40 mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(h.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/35 group-hover:text-white transition-colors" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
