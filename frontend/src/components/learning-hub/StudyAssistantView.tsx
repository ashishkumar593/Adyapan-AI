import { useState, useEffect } from "react";
import { Upload, Send, Bot, User } from "lucide-react";
import { useSocket } from "@/context/SocketContext";

export function StudyAssistantView() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: "model", content: "Hello! I am your AI Study Assistant. Ask me any academic question to get started in real-time." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { socket, isConnected } = useSocket();

  const sessionId = "global-study-session-123";

  useEffect(() => {
    if (!socket) return;

    // Join the study session room
    socket.emit("join_session", sessionId);

    // Listen to incoming real-time chunks
    socket.on("study:chunk", ({ text }: { text: string }) => {
      setLoading(false);
      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.role === "model") {
          return [
            ...prev.slice(0, -1),
            { role: "model", content: lastMsg.content + text }
          ];
        } else {
          return [...prev, { role: "model", content: text }];
        }
      });
    });

    socket.on("study:complete", () => {
      setLoading(false);
    });

    socket.on("study:error", ({ error }: { error: string }) => {
      setLoading(false);
      setMessages((prev) => [...prev, { role: "model", content: `❌ Error: ${error}` }]);
    });

    return () => {
      socket.off("study:chunk");
      socket.off("study:complete");
      socket.off("study:error");
    };
  }, [socket]);

  const handleSend = async () => {
    if (!input.trim() || !socket) return;
    
    // Add User Message
    setMessages(prev => [...prev, { role: "user", content: input }]);
    setInput("");
    setLoading(true);

    // Trigger AI Message scaffold
    setMessages(prev => [...prev, { role: "model", content: "" }]);

    // Emit study assistant query over socket
    socket.emit("study:message", {
      sessionId,
      query: input,
      context: "User is studying web development, software engineering, algorithms, and general sciences."
    });
  };

  return (
    <div className="flex flex-col h-full gap-4 relative animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Study Assistant</h2>
          <p className="text-sm text-gray-400">
            Status: {isConnected ? <span className="text-green-400 font-bold">● Realtime Connected</span> : <span className="text-red-400">● Reconnecting...</span>}
          </p>
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
              {msg.content || (loading && msg.role === "model" ? "Thinking..." : "")}
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
        <button onClick={handleSend} disabled={loading || !input.trim() || !isConnected} className="px-5 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

