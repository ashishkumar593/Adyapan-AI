"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/services/api";
import type { ResumeHubViewType } from "@/types/resume";
import {
  ArrowLeft, Plus, Trash2, Send, Mic, MicOff, Paperclip,
  Bot, User, Sparkles, Menu, X, ChevronDown, FileText,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────

interface ChatSession {
  id: string;
  title: string;
  model: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatMessage {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

interface ChatModel {
  id: string;
  name: string;
  provider: string;
  cheap: boolean;
}

const CHAT_MODELS: ChatModel[] = [
  { id: "openai/gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI", cheap: true },
  { id: "openai/gpt-4o", name: "GPT-4o", provider: "OpenAI", cheap: false },
  { id: "anthropic/claude-sonnet-4", name: "Claude Sonnet 4", provider: "Anthropic", cheap: false },
  { id: "anthropic/claude-3.5-haiku", name: "Claude 3.5 Haiku", provider: "Anthropic", cheap: true },
  { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "Google", cheap: true },
  { id: "google/gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "Google", cheap: false },
  { id: "deepseek/deepseek-chat", name: "DeepSeek V3", provider: "DeepSeek", cheap: true },
  { id: "deepseek/deepseek-r1", name: "DeepSeek R1", provider: "DeepSeek", cheap: true },
  { id: "meta-llama/llama-3.3-70b", name: "Llama 3.3 70B", provider: "Meta", cheap: true },
  { id: "mistralai/mistral-large", name: "Mistral Large", provider: "Mistral", cheap: false },
];

// ─── Props ──────────────────────────────────────────────────────────────

interface AdyChatViewProps {
  setView: (v: ResumeHubViewType) => void;
}

// ─── Theme hook ─────────────────────────────────────────────────────────

function useThemeColor() {
  const [theme, setTheme] = useState("dark");
  useEffect(() => {
    const t = document.documentElement.getAttribute("data-theme") || "dark";
    setTheme(t);
    const obs = new MutationObserver(() => {
      setTheme(document.documentElement.getAttribute("data-theme") || "dark");
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);
  return theme;
}

const themeColors = (theme: string) => ({
  bg: theme === "dark" ? "#080710" : "#f0f4ff",
  surface: theme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
  surfaceHover: theme === "dark" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
  border: theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)",
  text: theme === "dark" ? "#ffffff" : "#0f172a",
  textSec: theme === "dark" ? "rgba(255,255,255,0.7)" : "#475569",
  textMuted: theme === "dark" ? "rgba(255,255,255,0.4)" : "#94a3b8",
  primary: "#f59e0b",
  chatBg: theme === "dark" ? "#0a0e14" : "#f8fafc",
});

// ─── Voice Hook ─────────────────────────────────────────────────────────

function useVoiceRecognition(onResult: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggle = useCallback(() => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      onResult(transcript);
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [listening, onResult]);

  return { listening, toggle };
}

// =========================================================================
// MAIN COMPONENT
// =========================================================================

export function AdyChatView({ setView }: AdyChatViewProps) {
  const theme = useThemeColor();
  const c = themeColors(theme);

  // ─── State ──────────────────────────────────────────────────────────
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streamingText, setStreamingText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedModel, setSelectedModel] = useState(CHAT_MODELS[0].id);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; text: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Auto-scroll ────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  // ─── Load sessions ──────────────────────────────────────────────────
  const loadSessions = useCallback(async () => {
    try {
      const res = await api.get("/ady-chat/sessions");
      setSessions(res.data.sessions || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // ─── Load messages for active session ──────────────────────────────
  const loadMessages = useCallback(async (sessionId: string) => {
    try {
      const res = await api.get(`/ady-chat/sessions/${sessionId}`);
      if (res.data.success) {
        setMessages(res.data.messages || []);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (activeSessionId) {
      loadMessages(activeSessionId);
    } else {
      setMessages([]);
    }
  }, [activeSessionId, loadMessages]);

  // ─── Create new session ──────────────────────────────────────────
  const handleNewSession = async () => {
    try {
      const res = await api.post("/ady-chat/sessions", { model: selectedModel });
      if (res.data.success) {
        setSessions(prev => [res.data.session, ...prev]);
        setActiveSessionId(res.data.session.id);
        setMessages([]);
        setStreamingText("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ─── Delete session ──────────────────────────────────────────────
  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/ady-chat/sessions/${id}`);
      setSessions(prev => prev.filter(s => s.id !== id));
      if (activeSessionId === id) {
        setActiveSessionId(null);
        setMessages([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ─── File upload ─────────────────────────────────────────────────
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.post("/ady-chat/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        setUploadedFile({ name: res.data.filename, text: res.data.text });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to upload file.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ─── Voice input ─────────────────────────────────────────────────
  const handleVoiceResult = useCallback((text: string) => {
    setInput(prev => prev + text);
  }, []);

  const { listening, toggle: toggleVoice } = useVoiceRecognition(handleVoiceResult);

  // ─── Send message ────────────────────────────────────────────────
  const handleSend = async () => {
    const text = input.trim();
    if (!text && !uploadedFile) return;

    let finalMessage = text;
    if (uploadedFile) {
      finalMessage = `[File: ${uploadedFile.name}]\n\n${uploadedFile.text}\n\n---\n${text || "Please analyze this document."}`;
    }

    // Create session if none active
    let sessionId = activeSessionId;
    if (!sessionId) {
      try {
        const res = await api.post("/ady-chat/sessions", { model: selectedModel, title: finalMessage.slice(0, 80) });
        if (res.data.success) {
          sessionId = res.data.session.id;
          setActiveSessionId(sessionId);
          setSessions(prev => [res.data.session, ...prev]);
        }
      } catch (err) {
        console.error(err);
        return;
      }
    }

    // Optimistically add user message
    const userMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      sessionId: sessionId!,
      role: "user",
      content: finalMessage,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setUploadedFile(null);
    setLoading(true);
    setStreamingText("");

    // Update session model if changed
    const currentSession = sessions.find(s => s.id === sessionId);
    if (currentSession && currentSession.model !== selectedModel) {
      api.patch(`/ady-chat/sessions/${sessionId}`, { model: selectedModel }).catch(() => {});
    }

    // Streaming fetch
    const token = typeof window !== "undefined" ? localStorage.getItem("adyapan-token") : null;
    try {
      const res = await fetch(`${api.defaults.baseURL}/ady-chat/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ sessionId, message: finalMessage, model: selectedModel }),
      });

      if (!res.ok) throw new Error("Request failed");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(trimmed.slice(6));
            if (data.type === "chunk") {
              accumulated += data.text;
              setStreamingText(accumulated);
            } else if (data.type === "done") {
              // Add complete message
              const aiMsg: ChatMessage = {
                id: `ai-${Date.now()}`,
                sessionId: sessionId!,
                role: "assistant",
                content: accumulated,
                createdAt: new Date().toISOString(),
              };
              setMessages(prev => [...prev, aiMsg]);
              setStreamingText("");
              loadSessions(); // refresh sidebar titles
            } else if (data.type === "error") {
              throw new Error(data.message);
            }
          } catch { /* skip */ }
        }
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        sessionId: sessionId!,
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
        createdAt: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
      setStreamingText("");
    }
  };

  // ─── Keyboard handler ───────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ─── Model display helper ──────────────────────────────────────
  const currentModelObj = CHAT_MODELS.find(m => m.id === selectedModel) || CHAT_MODELS[0];

  // ─── Render a message ──────────────────────────────────────────
  const renderMessage = (msg: ChatMessage, index: number) => {
    const isUser = msg.role === "user";
    return (
      <div key={msg.id || index} className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
        {!isUser && (
          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-1">
            <Bot className="w-4 h-4 text-amber-500" />
          </div>
        )}
        <div className={`max-w-[75%] ${isUser ? "order-1" : "order-2"}`}>
          <div
            className={`px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap rounded-2xl ${
              isUser
                ? "bg-amber-500 text-black rounded-br-md"
                : "bg-[var(--bg-card)] text-[var(--text-primary)] rounded-bl-md"
            }`}
            style={isUser ? {} : { background: c.surface, border: `1px solid ${c.border}`, color: c.text }}
          >
            {msg.content}
          </div>
          <div className={`text-[10px] mt-1 ${isUser ? "text-right" : "text-left"}`} style={{ color: c.textMuted }}>
            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
        {isUser && (
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 mt-1">
            <User className="w-4 h-4 text-black" />
          </div>
        )}
      </div>
    );
  };

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col" style={{ background: c.bg }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b flex-shrink-0" style={{ borderColor: c.border }}>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{ background: c.surface, color: c.text, border: `1px solid ${c.border}` }}
        >
          <Menu className="w-4 h-4" />
        </button>
        <button
          onClick={() => setView("resume-hub")}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{ background: c.surface, color: c.text, border: `1px solid ${c.border}` }}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1" />
        <div className="relative">
          <button
            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
            style={{ background: c.surface, color: c.text, border: `1px solid ${c.border}` }}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            {currentModelObj.name}
            <ChevronDown className={`w-3 h-3 transition-transform ${modelDropdownOpen ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {modelDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute right-0 top-full mt-2 w-56 rounded-xl shadow-2xl z-50 overflow-hidden"
                style={{ background: theme === "dark" ? "#1a1a2e" : "#ffffff", border: `1px solid ${c.border}` }}
              >
                {CHAT_MODELS.map(model => (
                  <button
                    key={model.id}
                    onClick={() => { setSelectedModel(model.id); setModelDropdownOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-left transition-colors"
                    style={{
                      background: selectedModel === model.id ? "rgba(245,158,11,0.1)" : "transparent",
                      color: selectedModel === model.id ? c.primary : c.text,
                    }}
                  >
                    <div className="flex-1">
                      <div className="font-bold">{model.name}</div>
                      <div style={{ color: c.textMuted }}>{model.provider} {model.cheap ? "· Fast" : "· Premium"}</div>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-r flex-shrink-0 overflow-hidden flex flex-col"
              style={{ borderColor: c.border, background: c.bg }}
            >
              <div className="p-3">
                <button
                  onClick={handleNewSession}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all"
                  style={{
                    background: "linear-gradient(135deg, #f59e0b, #d97706)",
                    color: "#000",
                  }}
                >
                  <Plus className="w-4 h-4" /> New Chat
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-2 space-y-1">
                {sessions.length === 0 ? (
                  <div className="text-center py-10" style={{ color: c.textMuted }}>
                    <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <div className="text-xs font-semibold">No chats yet</div>
                  </div>
                ) : (
                  sessions.map(s => (
                    <div
                      key={s.id}
                      onClick={() => setActiveSessionId(s.id)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-colors group"
                      style={{
                        background: activeSessionId === s.id ? "rgba(245,158,11,0.1)" : "transparent",
                        color: activeSessionId === s.id ? c.primary : c.text,
                      }}
                    >
                      <MessageCircleIcon className="w-4 h-4 flex-shrink-0" style={{ color: c.textMuted }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold truncate">{s.title}</div>
                        <div className="text-[9px]" style={{ color: c.textMuted }}>
                          {new Date(s.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteSession(s.id, e)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/10"
                      >
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.length === 0 && !streamingText ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-amber-500" />
                </div>
                <h2 className="text-xl font-extrabold mb-2" style={{ fontFamily: "'Outfit', sans-serif", color: c.text }}>
                  Ady Chat
                </h2>
                <p className="text-sm max-w-md mb-8" style={{ color: c.textSec }}>
                  Ask me anything. I support text, voice, and file uploads.
                </p>
                <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                  {[
                    "Explain quantum computing simply",
                    "Write a Python script to sort files",
                    "Summarize this article",
                    "Help me debug my code",
                  ].map(hint => (
                    <button
                      key={hint}
                      onClick={() => setInput(hint)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
                      style={{ background: c.surface, color: c.textSec, border: `1px solid ${c.border}` }}
                    >
                      {hint}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => renderMessage(msg, i))}
                {streamingText && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-amber-500" />
                    </div>
                    <div
                      className="px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap rounded-2xl rounded-bl-md max-w-[75%]"
                      style={{ background: c.surface, border: `1px solid ${c.border}`, color: c.text }}
                    >
                      {streamingText}
                      <span className="inline-block w-2 h-4 ml-0.5 animate-pulse" style={{ background: c.primary }} />
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="border-t px-4 py-3" style={{ borderColor: c.border }}>
            {/* Uploaded file badge */}
            {uploadedFile && (
              <div className="flex items-center gap-2 mb-2 px-3 py-1.5 rounded-lg text-xs" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
                <FileText className="w-3.5 h-3.5 text-amber-500" />
                <span className="flex-1 font-semibold truncate" style={{ color: c.text }}>{uploadedFile.name}</span>
                <button onClick={() => setUploadedFile(null)} className="hover:opacity-70">
                  <X className="w-3.5 h-3.5" style={{ color: c.textMuted }} />
                </button>
              </div>
            )}

            <div className="flex items-end gap-2" style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 16, padding: "8px 12px" }}>
              {/* File upload button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors hover:bg-white/5"
                style={{ color: c.textMuted }}
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={handleFileSelect} />

              {/* Voice button */}
              <button
                onClick={toggleVoice}
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                style={{
                  color: listening ? c.primary : c.textMuted,
                  background: listening ? "rgba(245,158,11,0.15)" : "transparent",
                }}
              >
                {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Text input */}
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={listening ? "Listening..." : "Message Ady..."}
                rows={1}
                className="flex-1 bg-transparent border-none outline-none resize-none text-sm py-1.5 px-2"
                style={{ color: c.text, maxHeight: 120 }}
                onInput={e => {
                  const el = e.target as HTMLTextAreaElement;
                  el.style.height = "auto";
                  el.style.height = Math.min(el.scrollHeight, 120) + "px";
                }}
              />

              {/* Send button */}
              <button
                onClick={handleSend}
                disabled={loading || (!input.trim() && !uploadedFile)}
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                style={{
                  background: loading || (!input.trim() && !uploadedFile) ? c.surface : c.primary,
                  color: loading || (!input.trim() && !uploadedFile) ? c.textMuted : "#000",
                }}
              >
                {loading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Icon helper ───────────────────────────────────────────────────────

function MessageCircleIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
