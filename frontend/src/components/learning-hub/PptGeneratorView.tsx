import { useState } from "react";
import { Presentation, Download } from "lucide-react";

export function PptGeneratorView() {
  const [generating, setGenerating] = useState(false);
  const [slides, setSlides] = useState<{ title: string; content: string }[] | null>(null);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setSlides([
        { title: "Introduction to AI", content: "Artificial Intelligence is transforming industries by automating processes and providing deep insights." },
        { title: "Machine Learning Models", content: "Supervised, Unsupervised, and Reinforcement learning form the core of modern predictive systems." },
        { title: "Future Outlook", content: "The next decade will see a transition to Artificial General Intelligence (AGI) and massive infrastructure upgrades." }
      ]);
      setGenerating(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full gap-6 relative animate-in fade-in zoom-in-95 duration-300">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">PPT Generator</h2>
        <p className="text-sm text-gray-400">Generate fully structured presentations (PPTX) with AI.</p>
      </div>

      {!slides ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 max-w-2xl mx-auto w-full space-y-6 mt-10">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300">Presentation Topic</label>
            <input type="text" placeholder="e.g. Pitch Deck for an EdTech Startup" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300">Slide Count</label>
              <select className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-amber-500/50 appearance-none">
                <option>5 Slides</option>
                <option>10 Slides</option>
                <option>15 Slides</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300">Visual Theme</label>
              <select className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-amber-500/50 appearance-none">
                <option>Modern Dark</option>
                <option>Corporate Light</option>
                <option>Creative Gradient</option>
              </select>
            </div>
          </div>

          <button onClick={handleGenerate} disabled={generating} className="w-full bg-amber-500 text-black font-bold py-3 rounded-lg hover:bg-amber-400 transition-colors flex items-center justify-center gap-2">
            {generating ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Presentation size={18} />}
            {generating ? "Crafting Slides..." : "Generate Presentation"}
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-center justify-between bg-white/5 border border-white/10 p-4 rounded-xl">
            <button onClick={() => setSlides(null)} className="px-4 py-2 bg-white/5 border border-white/10 text-white text-sm font-medium rounded-lg hover:bg-white/10 transition-colors">Start Over</button>
            <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-black text-sm font-bold rounded-lg hover:bg-amber-400 transition-colors">
              <Download size={16} /> Download .pptx
            </button>
          </div>
          
          <div className="flex-1 bg-black/20 rounded-xl overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6 p-6 content-start">
            {slides.map((s, i) => (
              <div key={i} className="aspect-video bg-gradient-to-br from-[#1a1c29] to-[#0f111a] border border-white/10 rounded-xl p-8 flex flex-col justify-center shadow-lg hover:border-amber-500/30 transition-colors">
                <div className="text-xs text-amber-500 font-bold tracking-widest uppercase mb-4">Slide {i + 1}</div>
                <h3 className="text-2xl font-bold text-white mb-4 leading-tight">{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{s.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
