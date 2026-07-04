import { useState } from "react";
import { BookOpen, Download, CheckCircle2 } from "lucide-react";

export function NotesGeneratorView() {
  const [generating, setGenerating] = useState(false);
  const [notes, setNotes] = useState<string | null>(null);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setNotes("# Advanced Placement Readiness\n\n## 1. Core Principles\n- System Design requires scalability.\n- Database indexing reduces query latency.\n\n## 2. Algorithms\n- Dynamic programming optimizes overlapping subproblems.\n- Graph traversals (BFS/DFS) are fundamental for networks.");
      setGenerating(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full gap-6 relative animate-in fade-in zoom-in-95 duration-300">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Notes Generator</h2>
        <p className="text-sm text-gray-400">Generate structured, high-quality notes from any topic instantly.</p>
      </div>

      {!notes ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 max-w-2xl mx-auto w-full space-y-6 mt-10">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300">Topic or Subject</label>
            <input type="text" placeholder="e.g. Operating Systems, Advanced Data Structures" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300">Difficulty</label>
              <select className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-amber-500/50 appearance-none">
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300">Note Type</label>
              <select className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-amber-500/50 appearance-none">
                <option>Detailed Notes</option>
                <option>Short Revision</option>
                <option>Formulas Only</option>
                <option>Exam Cheat Sheet</option>
              </select>
            </div>
          </div>

          <button onClick={handleGenerate} disabled={generating} className="w-full bg-amber-500 text-black font-bold py-3 rounded-lg hover:bg-amber-400 transition-colors flex items-center justify-center gap-2">
            {generating ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <BookOpen size={18} />}
            {generating ? "Generating..." : "Generate Notes"}
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-center justify-between bg-white/5 border border-white/10 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-green-400 font-medium text-sm">
              <CheckCircle2 size={18} /> Notes Generated Successfully
            </div>
            <div className="flex gap-2">
              <button onClick={() => setNotes(null)} className="px-4 py-2 bg-white/5 border border-white/10 text-white text-sm font-medium rounded-lg hover:bg-white/10 transition-colors">Create New</button>
              <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-black text-sm font-bold rounded-lg hover:bg-amber-400 transition-colors">
                <Download size={16} /> Export PDF
              </button>
            </div>
          </div>
          <div className="flex-1 bg-black/40 border border-white/10 rounded-xl p-6 overflow-y-auto font-mono text-sm text-gray-300 whitespace-pre-wrap">
            {notes}
          </div>
        </div>
      )}
    </div>
  );
}
