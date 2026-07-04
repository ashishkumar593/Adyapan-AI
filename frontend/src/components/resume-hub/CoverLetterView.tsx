"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import {
  Zap, ArrowLeft, Copy, Download, Trash2,
  Sparkles, RefreshCw, Calendar, FileText, Check
} from "lucide-react";

import type { ResumeHubViewType } from "@/types/resume";

interface CoverLetterItem {
  id: string;
  companyName: string;
  role: string;
  content: string;
  createdAt: string;
}

interface CoverLetterViewProps {
  setView: (v: ResumeHubViewType) => void;
}

export function CoverLetterView({ setView }: CoverLetterViewProps) {
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState("Professional");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<CoverLetterItem[]>([]);

  const loadHistory = async () => {
    try {
      const res = await api.get("/cover-letter/history");
      setHistory(res.data.coverLetters || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleGenerate = async () => {
    if (!companyName || !role) return;
    setLoading(true);
    try {
      const res = await api.post("/cover-letter/generate", {
        companyName,
        role,
        jobDescription,
        tone,
      });
      if (res.data.success && res.data.coverLetter) {
        setContent(res.data.coverLetter.content);
        loadHistory();
      }
    } catch (err) {
      console.error(err);
      alert("❌ Failed to generate cover letter.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this cover letter?")) return;
    try {
      await api.delete(`/cover-letter/${id}`);
      setHistory(prev => prev.filter(item => item.id !== id));
      if (reportIdMatches(id)) setContent("");
    } catch (err) {
      console.error(err);
    }
  };

  const reportIdMatches = (deletedId: string) => {
    const activeItem = history.find(h => h.content === content);
    return activeItem?.id === deletedId;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${companyName.replace(/\s+/g, "_")}_${role.replace(/\s+/g, "_")}_Cover_Letter.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const tones = ["Professional", "Formal", "Confident", "Friendly"];

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
            Cover Letter Generator
          </h1>
          <p className="text-xs text-white/50">Create personalized, tone-specific letters with AI assistance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Columns: Form / Editor */}
        <div className="lg:col-span-7 space-y-6">
          {!content ? (
            <div className="backdrop-blur-md bg-white/3 border border-white/5 rounded-2xl p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-white/50 uppercase font-semibold mb-1">Company Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    placeholder="e.g. Google"
                    className="w-full bg-white/2 border border-white/5 focus:border-[#f59e0b] focus:outline-none rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-white/50 uppercase font-semibold mb-1">Target Role</label>
                  <input
                    type="text"
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    placeholder="e.g. Software Engineer"
                    className="w-full bg-white/2 border border-white/5 focus:border-[#f59e0b] focus:outline-none rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-white/50 uppercase font-semibold mb-1">Job Description (Optional)</label>
                <textarea
                  rows={4}
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)}
                  placeholder="Paste details to align cover letter highlights..."
                  className="w-full bg-white/2 border border-white/5 focus:border-[#f59e0b] focus:outline-none rounded-lg p-2.5 text-xs text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-white/50 uppercase font-semibold mb-1.5">Writing Tone</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {tones.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTone(t)}
                      className={`py-2 px-3 text-xs font-bold rounded-lg border transition-colors ${tone === t ? "bg-[#f59e0b]/10 border-[#f59e0b] text-[#f59e0b]" : "bg-white/2 border-white/5 text-white/70 hover:border-white/20"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <button
                disabled={loading || !companyName || !role}
                onClick={handleGenerate}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#f59e0b] hover:bg-[#d97706] text-black font-bold text-xs p-3 rounded-xl transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Drafting Letter...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Generate Cover Letter
                  </>
                )}
              </button>
            </div>
          ) : (
            // Editor Console
            <div className="backdrop-blur-md bg-white/3 border border-white/5 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">{companyName} — {role}</h3>
                  <span className="text-[10px] text-white/50">Tone: {tone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="p-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                  >
                    <Download className="w-4 h-4" /> Download
                  </button>
                </div>
              </div>

              <textarea
                rows={16}
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full bg-black/30 border border-white/5 focus:border-white/15 focus:outline-none rounded-xl p-4 text-xs text-white/90 leading-relaxed font-mono"
              />

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setContent("")}
                  className="text-xs font-bold text-white/40 hover:text-white transition-colors"
                >
                  Create New Letter
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right 5 Columns: History */}
        <div className="lg:col-span-5 space-y-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#f59e0b]" /> Letters History
          </h2>
          <div className="backdrop-blur-md bg-white/3 border border-white/5 rounded-2xl p-4 space-y-3 max-h-[480px] overflow-y-auto">
            {history.length === 0 ? (
              <div className="text-center py-12 text-white/40">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <span className="text-xs font-semibold">No letters generated yet.</span>
              </div>
            ) : (
              history.map((h) => (
                <div
                  key={h.id}
                  onClick={() => {
                    setCompanyName(h.companyName);
                    setRole(h.role);
                    setContent(h.content);
                  }}
                  className="p-3 bg-white/2 hover:bg-white/5 border border-white/5 rounded-xl flex items-center justify-between cursor-pointer transition-colors group"
                >
                  <div className="min-width-0 flex-1 pr-2">
                    <div className="text-xs font-bold text-white group-hover:text-[#f59e0b] truncate transition-colors">
                      {h.role} @ {h.companyName}
                    </div>
                    <div className="text-[9px] text-white/40 mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(h.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDelete(h.id, e)}
                    className="w-7 h-7 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-white/40 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
