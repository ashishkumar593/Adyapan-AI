import { useState } from "react";
import { PenTool, Download, Copy } from "lucide-react";

export function AssignmentGeneratorView() {
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setResult("# Global Market Trends in 2026\n\n## Introduction\nThe global economy has shifted significantly due to AI adoption...\n\n## Main Body\nArtificial intelligence has fundamentally changed the operational capacity of industries globally. Financial districts have adopted decentralized autonomous agents...\n\n## Conclusion\nIn conclusion, the paradigm shift is irreversible. Adaptation is mandatory for survival.");
      setGenerating(false);
    }, 2500);
  };

  return (
    <div className="flex flex-col h-full gap-6 relative animate-in fade-in zoom-in-95 duration-300">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Assignment Generator</h2>
        <p className="text-sm text-gray-400">Generate high-quality academic assignments, reports, and essays instantly.</p>
      </div>

      {!result ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 max-w-2xl mx-auto w-full space-y-6 mt-10">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300">Assignment Topic</label>
            <input type="text" placeholder="e.g. The impact of quantum computing on cryptography" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300">Academic Level</label>
              <select className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-amber-500/50 appearance-none">
                <option>High School</option>
                <option>Undergraduate</option>
                <option>Master&apos;s</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300">Word Count</label>
              <select className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-amber-500/50 appearance-none">
                <option>500 words</option>
                <option>1000 words</option>
                <option>2000 words</option>
              </select>
            </div>
          </div>

          <button onClick={handleGenerate} disabled={generating} className="w-full bg-amber-500 text-black font-bold py-3 rounded-lg hover:bg-amber-400 transition-colors flex items-center justify-center gap-2">
            {generating ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <PenTool size={18} />}
            {generating ? "Writing Assignment..." : "Generate Assignment"}
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-center justify-between bg-white/5 border border-white/10 p-4 rounded-xl">
            <div className="flex gap-2">
              <button onClick={() => setResult(null)} className="px-4 py-2 bg-white/5 border border-white/10 text-white text-sm font-medium rounded-lg hover:bg-white/10 transition-colors">Start Over</button>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white text-sm font-medium rounded-lg hover:bg-white/10 transition-colors">
                <Copy size={16} /> Copy Text
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-black text-sm font-bold rounded-lg hover:bg-amber-400 transition-colors">
                <Download size={16} /> Export DOCX
              </button>
            </div>
          </div>
          <div className="flex-1 bg-black/40 border border-white/10 rounded-xl p-8 overflow-y-auto font-serif text-base leading-loose text-gray-200 whitespace-pre-wrap shadow-inner max-w-4xl mx-auto w-full">
            {result}
          </div>
        </div>
      )}
    </div>
  );
}
