import { useState } from "react";
import { CheckSquare, ArrowRight, PlayCircle, Trophy } from "lucide-react";

export function QuizGeneratorView() {
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setStep(2);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full gap-6 relative animate-in fade-in zoom-in-95 duration-300">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Quiz Generator</h2>
        <p className="text-sm text-gray-400">Generate targeted MCQs and test your knowledge interactively.</p>
      </div>

      {step === 1 && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 max-w-2xl mx-auto w-full space-y-6 mt-10">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300">Topic</label>
            <input type="text" placeholder="e.g. React Hooks, AWS Architecture" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300">Number of Questions</label>
              <select className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-amber-500/50 appearance-none">
                <option>5 Questions</option>
                <option>10 Questions</option>
                <option>20 Questions</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300">Difficulty</label>
              <select className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-amber-500/50 appearance-none">
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
          </div>

          <button onClick={handleGenerate} disabled={generating} className="w-full bg-amber-500 text-black font-bold py-3 rounded-lg hover:bg-amber-400 transition-colors flex items-center justify-center gap-2">
            {generating ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <PlayCircle size={18} />}
            {generating ? "Generating Quiz..." : "Start Quiz"}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="flex-1 flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-xl p-8 max-w-3xl mx-auto w-full">
          <div className="flex justify-between w-full mb-8 text-sm font-semibold text-gray-400">
            <span>Question 1 of 10</span>
            <span className="text-amber-500 flex items-center gap-1"><Trophy size={14} /> Score: 0</span>
          </div>
          
          <h3 className="text-xl text-white font-medium mb-8 text-center leading-relaxed">
            Which hook is used to perform side effects in functional components?
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {["useState", "useEffect", "useContext", "useReducer"].map((opt, i) => (
              <button key={i} onClick={() => setStep(3)} className="p-4 bg-black/20 border border-white/10 rounded-xl text-gray-300 hover:border-amber-500/50 hover:bg-amber-500/10 transition-colors text-left font-medium">
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex-1 flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-xl p-8 max-w-2xl mx-auto w-full">
          <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mb-6">
            <CheckSquare size={32} />
          </div>
          <h3 className="text-2xl text-white font-bold mb-2">Quiz Completed!</h3>
          <p className="text-gray-400 mb-8">You scored 9/10 (90% Accuracy)</p>
          
          <div className="w-full bg-black/20 rounded-xl p-4 mb-6 border border-white/5">
            <div className="text-sm font-semibold text-gray-400 mb-2">Strong Topics: <span className="text-green-400">React Hooks</span></div>
            <div className="text-sm font-semibold text-gray-400">Weak Topics: <span className="text-red-400">Context API</span></div>
          </div>

          <button onClick={() => setStep(1)} className="px-6 py-3 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400 transition-colors flex items-center gap-2">
            Return to Generator <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
