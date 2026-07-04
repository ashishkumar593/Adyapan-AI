import { useState } from "react";
import { Upload, Send, Bot, User } from "lucide-react";

export function StudyAssistantView() {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([{ role: "model", content: "Hello! I am your AI Study Assistant. Upload your notes or ask me any question to get started." }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: "user", content: input }]);
    setInput("");
    setLoading(true);
    
    // Mock API call
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "model", content: "That's a great question! Based on academic principles, the core concept revolves around optimizing systems for high throughput..." }]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full gap-4 relative animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Study Assistant</h2>
          <p className="text-sm text-gray-400">Upload documents and ask questions to learn faster.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors text-white">
          <Upload size={16} /> Upload Context (PDF/DOCX)
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
            {msg.role === "model" && <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0"><Bot size={16} /></div>}
            <div className={`p-3 rounded-xl max-w-[80%] text-sm ${msg.role === "user" ? "bg-amber-500 text-black rounded-tr-none font-medium" : "bg-white/5 border border-white/10 text-gray-200 rounded-tl-none"}`}>
              {msg.content}
            </div>
            {msg.role === "user" && <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-300 shrink-0"><User size={16} /></div>}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0"><Bot size={16} /></div>
             <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 rounded-tl-none flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" />
               <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "0.2s" }} />
               <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "0.4s" }} />
             </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask a question..."
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
        />
        <button onClick={handleSend} disabled={loading || !input.trim()} className="px-5 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
