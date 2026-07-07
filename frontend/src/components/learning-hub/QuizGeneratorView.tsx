"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare, ArrowRight, PlayCircle, Trophy, Loader2, RefreshCw,
  Plus, History, HelpCircle, ChevronRight, Search, CheckCircle2, FileText, Cpu
} from "lucide-react";
import { useSocket } from "@/context/SocketContext";

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export function QuizGeneratorView() {
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [topic, setTopic] = useState("React Hooks");
  const [count, setCount] = useState("5 Questions");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState("");
  const [activeView, setActiveView] = useState<"dashboard" | "help">("dashboard");

  const { socket, isConnected } = useSocket();
  const userIdRef = useRef<string>("");

  const MOCK_QUESTIONS = [
    {
      question: "Which hook should be used to run side effects in a functional component?",
      options: ["useState", "useEffect", "useContext", "useReducer"],
      correctAnswer: "useEffect",
      explanation: "useEffect is designed to perform side effects (data fetching, subscriptions, DOM manipulations) in functional React components."
    },
    {
      question: "What is the return value of the useState hook?",
      options: ["A state value", "A state updater function", "An array with state value and state updater", "An object containing state details"],
      correctAnswer: "An array with state value and state updater",
      explanation: "useState returns an array containing exactly two items: the current state value and a dispatch function to update it."
    },
    {
      question: "Which React hook returns a memoized callback function?",
      options: ["useMemo", "useCallback", "useRef", "useTransition"],
      correctAnswer: "useCallback",
      explanation: "useCallback returns a memoized version of the callback function that only changes if one of the dependencies has changed."
    }
  ];

  useEffect(() => {
    try {
      const raw = localStorage.getItem("adyapan-user");
      if (raw) userIdRef.current = (JSON.parse(raw) as { id?: string })?.id ?? "";
    } catch { /* */ }
  }, []);

  const handleGenerate = () => {
    setGenerating(true);
    setProgress(0);
    setStatusMsg("Starting Quiz Generator pipeline...");

    const stages = [
      { msg: "Extracting sample questions...", prg: 30 },
      { msg: "Formulating difficulty bounds...", prg: 60 },
      { msg: "Writing answer explanations...", prg: 90 },
      { msg: "Complete!", prg: 100 }
    ];

    let currentIdx = 0;
    const timer = setInterval(() => {
      if (currentIdx < stages.length) {
        setStatusMsg(stages[currentIdx].msg);
        setProgress(stages[currentIdx].prg);
        currentIdx++;
      } else {
        clearInterval(timer);
        setGenerating(false);
        setQuestions(MOCK_QUESTIONS);
        setStep(2);
        setCurrentQ(0);
        setScore(0);
        setSelectedAnswer(null);
        setShowResult(false);
      }
    }, 1000);
  };

  const handleAnswer = (option: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(option);
    if (option === questions[currentQ]?.correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(c => c + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
  };

  const loadHistoryItem = (topicName: string) => {
    setTopic(topicName);
    setQuestions(MOCK_QUESTIONS);
    setStep(2);
    setCurrentQ(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const getOptionStyle = (opt: string) => {
    if (!selectedAnswer) return "bg-black/20 border border-white/10 text-gray-300 hover:border-amber-500/50 hover:bg-amber-500/10";
    if (opt === questions[currentQ]?.correctAnswer) return "bg-emerald-500/20 border border-emerald-500/50 text-emerald-300";
    if (opt === selectedAnswer) return "bg-red-500/20 border border-red-500/50 text-red-300";
    return "bg-black/20 border border-white/10 text-gray-500 opacity-50";
  };

  return (
    <div className="flex flex-col gap-6 p-6 antialiased text-white max-w-7xl mx-auto w-full">
      {/* SECTION 1 — HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-[30px] font-extrabold tracking-tight text-white flex items-center gap-2">
            <CheckSquare className="text-amber-500" size={24} /> Quiz Generator
          </h1>
          <p className="text-[14px] text-gray-400 mt-1 max-w-2xl">
            Generate targeted MCQ mock tests and check your revision correctness.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setStep(1); setQuestions([]); setShowResult(false); }}
            className="h-11 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-extrabold flex items-center gap-1.5 transition-colors"
          >
            <Plus size={20} /> Create New
          </button>
          <button
            onClick={() => {
              const el = document.getElementById("recent-quizzes-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="h-11 px-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-semibold flex items-center gap-1.5 transition-colors text-white"
          >
            <History size={20} /> History
          </button>
          <button
            onClick={() => setActiveView(activeView === "help" ? "dashboard" : "help")}
            className="h-11 px-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-semibold flex items-center gap-1.5 transition-colors text-white"
          >
            <HelpCircle size={20} /> Help
          </button>
        </div>
      </div>

      {activeView === "help" ? (
        <div className="p-6 border border-white/5 bg-white/[0.01] rounded-2xl space-y-4">
          <h2 className="text-[20px] font-bold text-white">Quiz Generator Help</h2>
          <p className="text-[15px] text-gray-300">
            Specify a topic, count of questions, and difficulty target. The AI engine designs single-select multiple choice queries along with concise logical explanations for each correct answer choice.
          </p>
          <button onClick={() => setActiveView("dashboard")} className="h-11 px-4 rounded-2xl bg-amber-500 text-black font-extrabold text-sm hover:bg-amber-400 transition-colors">
            Back to Dashboard
          </button>
        </div>
      ) : (
        <>
          {/* SECTION 2 — QUICK STATS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { title: "Quizzes Taken", value: "18", desc: "+3 This Week" },
              { title: "Questions Answered", value: "90 MCQ", desc: "Detailed explanations read" },
              { title: "Average Score", value: "82% Correct", desc: "Based on previous mock inputs" },
              { title: "Active Study Streak", value: "5 Days", desc: "Premium Training Active" }
            ].map(stat => (
              <div key={stat.title} className="h-[170px] p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col justify-between">
                <span className="text-[14px] text-gray-400 font-medium">{stat.title}</span>
                <span className="text-3xl font-extrabold text-white">{stat.value}</span>
                <span className="text-[14px] text-amber-500 font-semibold">{stat.desc}</span>
              </div>
            ))}
          </div>

          {generating ? (
            <div className="flex flex-col items-center justify-center p-8 border border-white/5 bg-white/[0.01] rounded-2xl space-y-6 max-w-2xl mx-auto w-full">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500 animate-pulse">
                <Cpu size={32} />
              </div>
              <div className="text-center">
                <h3 className="text-[18px] font-bold text-white">Generating Quiz via AI Pipeline</h3>
                <p className="text-[14px] text-gray-400 mt-1">{statusMsg}</p>
              </div>
              <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <div className="text-[14px] font-bold text-amber-500 flex items-center gap-2">
                <Loader2 className="animate-spin" size={14} /> {progress}% Complete
              </div>
            </div>
          ) : step === 1 ? (
            <div className="space-y-6">
              {/* SECTION 3 — CONFIGURATION WORKSPACE */}
              <div className="p-6 border border-white/5 bg-white/[0.01] rounded-2xl max-w-3xl mx-auto w-full space-y-6">
                <h3 className="text-[18px] font-bold text-white">Configure Quiz Outline</h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[14px] font-semibold text-gray-300">Topic or Syllabus Segment</label>
                    <input
                      type="text"
                      value={topic}
                      onChange={e => setTopic(e.target.value)}
                      placeholder="e.g. React Hooks, AWS Architecture"
                      className="w-full h-12 bg-black/20 border border-white/10 rounded-xl px-4 text-[15px] text-white focus:outline-none focus:border-amber-500/50"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[14px] font-semibold text-gray-300">Questions Count</label>
                      <select
                        value={count}
                        onChange={e => setCount(e.target.value)}
                        className="w-full h-12 bg-black/20 border border-white/10 rounded-xl px-4 text-[15px] text-gray-300 focus:outline-none focus:border-amber-500/50 appearance-none"
                      >
                        <option>5 Questions</option>
                        <option>10 Questions</option>
                        <option>20 Questions</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[14px] font-semibold text-gray-300">Difficulty</label>
                      <select
                        value={difficulty}
                        onChange={e => setDifficulty(e.target.value)}
                        className="w-full h-12 bg-black/20 border border-white/10 rounded-xl px-4 text-[15px] text-gray-300 focus:outline-none focus:border-amber-500/50 appearance-none"
                      >
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleGenerate}
                    className="h-11 flex-1 rounded-xl bg-amber-500 text-black font-extrabold text-sm hover:bg-amber-400 transition-colors flex items-center justify-center gap-2"
                  >
                    <PlayCircle size={20} /> Generate & Start Quiz
                  </button>
                  <button
                    onClick={() => setTopic("")}
                    className="h-11 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-semibold transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* SECTION 4 — PRESETS SECTION */}
              <div className="space-y-3">
                <h2 className="text-[20px] font-bold text-white">Choose Preset Challenges</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { title: "React Hooks Challenge", desc: "Isolate questions surrounding useEffect triggers, dependency lists, and custom hooks bindings." },
                    { title: "AWS Architecture Test", desc: "Filters quiz formulations to VPC setups, ELB nodes configurations, and DynamoDB indexes." },
                    { title: "Compiler Design Quiz", desc: "Formulates lexical analyzes steps, parse tree connections, and code optimizers stages queries." }
                  ].map(tpl => (
                    <div
                      key={tpl.title}
                      onClick={() => setTopic(tpl.title)}
                      className="p-6 border border-white/5 rounded-2xl bg-white/[0.01] hover:bg-amber-500/[0.01] hover:border-amber-500/30 transition-all cursor-pointer space-y-2"
                    >
                      <h4 className="text-[18px] font-bold text-white">{tpl.title}</h4>
                      <p className="text-[14px] text-gray-400 leading-relaxed">{tpl.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : !showResult ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* LEFT SIDEBAR Outline (3 Cols) */}
              <div className="md:col-span-3 space-y-4">
                <div className="p-4 border border-white/5 rounded-2xl bg-white/[0.01] space-y-3">
                  <span className="text-[14px] font-black uppercase tracking-wider text-amber-500 block">
                    Questions List
                  </span>
                  <div className="space-y-1">
                    {questions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentQ(idx)}
                        className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                          currentQ === idx
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                            : "text-gray-400 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <span className="truncate text-[14px]">Question 0{idx + 1}</span>
                        <ChevronRight size={14} className={currentQ === idx ? "text-amber-500" : "text-gray-600"} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* MAIN CONTENT MCQ PANEL (6 Cols) */}
              <div className="md:col-span-6 space-y-6">
                <div className="p-6 border border-white/5 rounded-2xl bg-white/[0.01] space-y-6">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-[14px] text-gray-400 font-semibold">Question {currentQ + 1} of {questions.length}</span>
                    <span className="text-amber-500 font-extrabold flex items-center gap-1"><Trophy size={14} /> Score: {score}</span>
                  </div>

                  <h3 className="text-[18px] text-white font-bold leading-relaxed">
                    {questions[currentQ]?.question}
                  </h3>

                  <div className="grid grid-cols-1 gap-3">
                    {questions[currentQ]?.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleAnswer(opt)}
                        className={`p-4 rounded-xl text-left font-semibold text-[15px] transition-all ${getOptionStyle(opt)}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  {selectedAnswer && (
                    <div className="space-y-4 pt-4 border-t border-white/5">
                      <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-1.5">
                        <span className="text-[10px] uppercase tracking-wider font-bold block text-amber-500">
                          AI Reason Explanation
                        </span>
                        <p className="text-[14px] text-gray-300 leading-relaxed">
                          {questions[currentQ]?.explanation}
                        </p>
                      </div>

                      <button
                        onClick={handleNext}
                        className="h-11 w-full bg-amber-500 text-black font-extrabold text-sm rounded-xl hover:bg-amber-400 transition-colors flex items-center justify-center gap-2"
                      >
                        {currentQ < questions.length - 1 ? <>Next Question <ArrowRight size={16} /></> : "View Results"}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT SIDEBAR STATS (3 Cols) */}
              <div className="md:col-span-3 space-y-4">
                <div className="p-4 border border-white/5 rounded-2xl bg-white/[0.01] space-y-3">
                  <span className="text-[14px] font-black uppercase tracking-wider text-amber-500 block">
                    Quiz Performance
                  </span>
                  <div className="space-y-2 text-xs">
                    {[
                      { label: "Target Topic", val: topic },
                      { label: "Difficulty", val: difficulty },
                      { label: "Answered", val: `${currentQ + (selectedAnswer ? 1 : 0)} / ${questions.length}` },
                      { label: "Correct Answers", val: score }
                    ].map(stat => (
                      <div key={stat.label} className="flex justify-between items-center py-1 border-b border-white/[0.03]">
                        <span className="text-gray-400 text-[14px]">{stat.label}</span>
                        <span className="font-extrabold text-white text-[15px]">{stat.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center border border-white/5 bg-white/[0.01] rounded-2xl p-8 max-w-2xl mx-auto w-full text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
                <CheckSquare size={32} />
              </div>
              <div>
                <h3 className="text-[20px] text-white font-bold">Quiz Completed!</h3>
                <p className="text-[15px] text-gray-400 mt-1">You scored {score}/{questions.length} ({Math.round((score / questions.length) * 100)}% Accuracy)</p>
              </div>

              <div className="w-full bg-black/20 border border-white/5 rounded-xl p-4 text-left text-xs space-y-2">
                <div className="text-[14px] font-semibold text-gray-400">
                  Strong Topics: <span className="text-green-400">{topic}</span>
                </div>
                <div className="text-[14px] font-semibold text-gray-400">
                  Target Accuracy: <span className={score / questions.length >= 0.7 ? "text-green-400" : "text-amber-400"}>{Math.round((score / questions.length) * 100)}%</span>
                </div>
              </div>

              <button
                onClick={() => { setStep(1); setShowResult(false); setQuestions([]); setCurrentQ(0); setScore(0); setSelectedAnswer(null); }}
                className="h-11 px-6 bg-amber-500 text-black font-extrabold text-sm rounded-xl hover:bg-amber-400 transition-colors flex items-center gap-2"
              >
                Try Again <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* SECTION 11 — RECENT QUIZZES TABLE */}
          <div id="recent-quizzes-section" className="space-y-3 pt-6 border-t border-white/5">
            <h2 className="text-[20px] font-bold text-white">Recent Quizzes</h2>
            <div className="border border-white/5 rounded-2xl overflow-hidden bg-white/[0.01]">
              <table className="w-full text-left border-collapse text-[15px]">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02] text-gray-400 font-bold text-xs uppercase tracking-wider">
                    <th className="p-4">Topic</th>
                    <th className="p-4">Date Completed</th>
                    <th className="p-4">Difficulty</th>
                    <th className="p-4 text-center">Score</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    { name: "React Hooks Challenge", date: "Today", difficulty: "Intermediate", score: "4/5" },
                    { name: "AWS VPC Architecture", date: "Yesterday", difficulty: "Advanced", score: "8/10" },
                    { name: "Compiler Lexer Stages", date: "4 Jul", difficulty: "Beginner", score: "5/5" }
                  ].map(quiz => (
                    <tr key={quiz.name} className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-4 font-semibold text-white flex items-center gap-2">
                        <FileText size={16} className="text-amber-500" /> {quiz.name}
                      </td>
                      <td className="p-4 text-gray-400">{quiz.date}</td>
                      <td className="p-4 text-gray-300 font-medium">{quiz.difficulty}</td>
                      <td className="p-4 text-center text-gray-300 font-medium">{quiz.score}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => loadHistoryItem(quiz.name)}
                          className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500 text-amber-500 hover:text-black font-extrabold text-xs transition-all"
                        >
                          Open
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}