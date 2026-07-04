import { useState } from "react";
import { GitMerge, Download, Share2 } from "lucide-react";

export function MindMapsView() {
  const [generating, setGenerating] = useState(false);
  const [mapRendered, setMapRendered] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setMapRendered(true);
      setGenerating(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full gap-6 relative animate-in fade-in zoom-in-95 duration-300">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Mind Maps</h2>
        <p className="text-sm text-gray-400">Generate visual knowledge graphs from complex topics.</p>
      </div>

      {!mapRendered ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 max-w-2xl mx-auto w-full space-y-6 mt-10">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300">Topic to Visualize</label>
            <input type="text" placeholder="e.g. Cellular Respiration, React Lifecycle" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50" />
          </div>
          
          <button onClick={handleGenerate} disabled={generating} className="w-full bg-amber-500 text-black font-bold py-3 rounded-lg hover:bg-amber-400 transition-colors flex items-center justify-center gap-2">
            {generating ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <GitMerge size={18} />}
            {generating ? "Mapping Nodes..." : "Generate Mind Map"}
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-center justify-between bg-white/5 border border-white/10 p-4 rounded-xl z-10">
            <button onClick={() => setMapRendered(false)} className="px-4 py-2 bg-white/5 border border-white/10 text-white text-sm font-medium rounded-lg hover:bg-white/10 transition-colors">Start Over</button>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white text-sm font-medium rounded-lg hover:bg-white/10 transition-colors">
                <Share2 size={16} /> Share
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-black text-sm font-bold rounded-lg hover:bg-amber-400 transition-colors">
                <Download size={16} /> Export PNG
              </button>
            </div>
          </div>
          
          <div className="flex-1 relative bg-[#0a0a0f] border border-white/10 rounded-xl overflow-hidden flex items-center justify-center">
            {/* Mock Node Map Visual representation */}
            <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="px-6 py-3 bg-amber-500 text-black font-bold rounded-xl shadow-lg shadow-amber-500/20 z-20">Main Topic: AI</div>
              <div className="w-0.5 h-12 bg-white/20"></div>
              <div className="flex gap-16 relative">
                <div className="absolute top-0 left-[20%] right-[20%] h-0.5 bg-white/20"></div>
                <div className="flex flex-col items-center pt-6">
                  <div className="w-0.5 h-6 bg-white/20 absolute top-0"></div>
                  <div className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg">Machine Learning</div>
                </div>
                <div className="flex flex-col items-center pt-6">
                  <div className="w-0.5 h-6 bg-white/20 absolute top-0"></div>
                  <div className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg">Deep Learning</div>
                </div>
                <div className="flex flex-col items-center pt-6">
                  <div className="w-0.5 h-6 bg-white/20 absolute top-0"></div>
                  <div className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg">NLP</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
