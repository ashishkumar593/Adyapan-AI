import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Bug, Lightbulb, FolderKanban, Send, Code, Loader2 } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i = 0) => ({ opacity: 1, scale: 1, transition: { delay: i * 0.07, duration: 0.35 } }),
};

type Mode = "generate" | "debug" | "explain" | "project";

export function CodingAssistantView() {
  const [mode, setMode] = useState<Mode>("generate");
  const [input, setInput] = useState("");
  const [secondaryInput, setSecondaryInput] = useState(""); // For error messages in debug mode
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<Record<string, any> | null>(null);

  const handleGenerate = async () => {
    if (!input) return;
    setGenerating(true);
    setResult(null);

    try {
      const payload: Record<string, string> = {};
      if (mode === "generate") payload.prompt = input;
      else if (mode === "project") payload.projectName = input;
      else if (mode === "explain") payload.codeSnippet = input;
      else if (mode === "debug") {
        payload.errorMsg = secondaryInput;
        payload.codeSnippet = input;
      }

      // Mock delay to simulate real AI processing since backend isn't fully connected on client yet
      await new Promise(r => setTimeout(r, 2000));
      
      // Mock Responses based on mode
      if (mode === "generate") {
        setResult({
          setupGuide: "# Setup\\n1. Run `npm install`\\n2. Run `npm run dev`",
          folderStructure: "src/\\n  ├── components/\\n  └── pages/",
          code: "// Generated implementation\\nexport function Example() {\\n  return <div>Hello</div>;\\n}"
        });
      } else if (mode === "debug") {
        setResult({
          issue: "Syntax Error: missing closing bracket",
          rootCause: "On line 42, the function was left open which caused the parser to fail.",
          fixedCode: "function foo() {\\n  console.log('fixed');\\n}"
        });
      } else if (mode === "explain") {
        setResult({
          explanation: "This snippet creates an array and maps over it to double the values.",
          complexity: "Time: O(n), Space: O(n)"
        });
      } else if (mode === "project") {
        setResult({
          architecture: "Client-Server architecture using Next.js and Express.",
          techStack: ["Next.js", "Tailwind", "Node.js", "Prisma"],
          folderStructure: "project/\\n  ├── frontend/\\n  └── backend/",
          features: ["Auth", "Dashboard", "Live Chat"],
          roadmap: ["Setup Repository", "Build DB Schema", "Develop API"]
        });
      }

    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const tabs = [
    { id: "generate", label: "Generate Code", icon: Code },
    { id: "debug", label: "Debug Code", icon: Bug },
    { id: "explain", label: "Explain Code", icon: Lightbulb },
    { id: "project", label: "Plan Project", icon: FolderKanban },
  ];

   return (
     <motion.div
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
       transition={{ duration: 0.4 }}
       className="flex flex-col h-full bg-[#0a0a0f] text-white overflow-hidden rounded-xl border border-white/10"
     >
       
       {/* Header Tabs */}
       <div className="flex p-4 gap-2 border-b border-white/10 overflow-x-auto">
         {tabs.map((t, i) => {
           const Icon = t.icon;
           const isActive = mode === t.id;
           return (
             <motion.button
               key={t.id}
               custom={i}
               variants={fadeUp}
               initial="hidden"
               animate="visible"
               onClick={() => { setMode(t.id as Mode); setResult(null); setInput(""); setSecondaryInput(""); }}
               whileHover={{ scale: 1.04 }}
               whileTap={{ scale: 0.96 }}
               className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                 isActive ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-white/5 text-gray-400 hover:bg-white/10 border border-transparent"
               }`}
             >
               <motion.div
                 initial={{ scale: 0, rotate: -20 }}
                 animate={{ scale: 1, rotate: 0 }}
                 transition={{ type: "spring", stiffness: 280, damping: 18 }}
               >
                 <Icon size={16} />
               </motion.div>
               {t.label}
             </motion.button>
           );
         })}
       </div>

       <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
         {/* Input Area */}
         <motion.div
           variants={fadeUp}
           initial="hidden"
           animate="visible"
           custom={0}
           className="bg-white/5 border border-white/10 rounded-xl p-4"
         >
           <div className="flex items-center gap-2 mb-4 text-amber-500">
             <motion.div
               initial={{ scale: 0, rotate: -20 }}
               animate={{ scale: 1, rotate: 0 }}
               transition={{ type: "spring", stiffness: 280, damping: 18 }}
             >
               <Terminal size={18} />
             </motion.div>
             <h3 className="font-semibold text-sm">
               {mode === "generate" ? "What do you want to build?" :
                mode === "debug" ? "Paste your broken code" :
                mode === "explain" ? "Paste code to explain" :
                "Enter your project idea"}
             </h3>
           </div>
           
           <AnimatePresence>
             {mode === "debug" && (
               <motion.div
                 initial={{ opacity: 0, height: 0 }}
                 animate={{ opacity: 1, height: "auto" }}
                 exit={{ opacity: 0, height: 0 }}
                 transition={{ duration: 0.3 }}
               >
                 <textarea
                   value={secondaryInput}
                   onChange={(e) => setSecondaryInput(e.target.value)}
                   placeholder="Paste the error message here..."
                   className="w-full h-20 bg-black/40 border border-white/10 rounded-lg p-3 text-sm font-mono text-gray-300 focus:outline-none focus:border-amber-500/50 mb-3"
                 />
               </motion.div>
             )}
           </AnimatePresence>

           <textarea
             value={input}
             onChange={(e) => setInput(e.target.value)}
             placeholder={mode === "generate" || mode === "project" ? "Describe your requirements in detail..." : "Paste your code snippet here..."}
             className="w-full h-32 bg-black/40 border border-white/10 rounded-lg p-3 text-sm font-mono text-gray-300 focus:outline-none focus:border-amber-500/50"
           />

           <div className="flex justify-end mt-4">
             <motion.button
               onClick={handleGenerate}
               disabled={generating || !input}
               whileHover={{ scale: 1.04 }}
               whileTap={{ scale: 0.96 }}
               className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400 disabled:opacity-50 transition-colors"
             >
               {generating ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
               {generating ? "Processing..." : "Run AI Assist"}
             </motion.button>
           </div>
         </motion.div>

         {/* Results Area */}
         <AnimatePresence>
           {result && (
             <motion.div
               key={`result-${mode}`}
               initial={{ opacity: 0, scale: 0.92, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               transition={{ duration: 0.35, type: "spring", stiffness: 200, damping: 20 }}
               className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col gap-6"
             >
               {mode === "generate" && (
                 <>
                   <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
                     <h4 className="text-amber-500 text-xs font-bold uppercase tracking-wider mb-2">Folder Structure</h4>
                     <pre className="bg-black/50 p-4 rounded-lg text-sm text-gray-300 font-mono overflow-x-auto">{result.folderStructure}</pre>
                   </motion.div>
                   <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
                     <h4 className="text-amber-500 text-xs font-bold uppercase tracking-wider mb-2">Setup Guide</h4>
                     <div className="prose prose-invert max-w-none text-sm text-gray-300 bg-black/50 p-4 rounded-lg">{result.setupGuide}</div>
                   </motion.div>
                   <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
                     <h4 className="text-amber-500 text-xs font-bold uppercase tracking-wider mb-2">Source Code</h4>
                     <pre className="bg-black/50 p-4 rounded-lg text-sm text-green-400 font-mono overflow-x-auto">{result.code}</pre>
                   </motion.div>
                 </>
               )}

               {mode === "debug" && (
                 <>
                   <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg">
                     <h4 className="text-red-400 text-xs font-bold uppercase tracking-wider mb-2">Identified Issue</h4>
                     <p className="text-sm text-red-200">{result.issue}</p>
                   </motion.div>
                   <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
                     <h4 className="text-amber-500 text-xs font-bold uppercase tracking-wider mb-2">Root Cause</h4>
                     <p className="text-sm text-gray-300 bg-black/50 p-4 rounded-lg">{result.rootCause}</p>
                   </motion.div>
                   <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
                     <h4 className="text-green-500 text-xs font-bold uppercase tracking-wider mb-2">Fixed Code</h4>
                     <pre className="bg-black/50 p-4 rounded-lg text-sm text-green-400 font-mono overflow-x-auto">{result.fixedCode}</pre>
                   </motion.div>
                 </>
               )}

               {mode === "explain" && (
                 <>
                   <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
                     <h4 className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">Complexity</h4>
                     <p className="text-sm font-mono text-gray-300 bg-black/50 p-3 rounded-lg inline-block border border-blue-500/20">{result.complexity}</p>
                   </motion.div>
                   <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
                     <h4 className="text-amber-500 text-xs font-bold uppercase tracking-wider mb-2">Line-by-Line Breakdown</h4>
                     <div className="prose prose-invert max-w-none text-sm text-gray-300 bg-black/50 p-4 rounded-lg leading-relaxed whitespace-pre-wrap">{result.explanation}</div>
                   </motion.div>
                 </>
               )}

               {mode === "project" && (
                 <motion.div
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ staggerChildren: 0.08 }}
                   className="grid grid-cols-1 md:grid-cols-2 gap-6"
                 >
                   <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="col-span-full">
                     <h4 className="text-amber-500 text-xs font-bold uppercase tracking-wider mb-2">Architecture Overview</h4>
                     <p className="text-sm text-gray-300 bg-black/50 p-4 rounded-lg">{result.architecture}</p>
                   </motion.div>
                   <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
                     <h4 className="text-amber-500 text-xs font-bold uppercase tracking-wider mb-2">Tech Stack</h4>
                     <div className="flex flex-wrap gap-2">
                       {result.techStack.map((t: string, j: number) => (
                         <span key={j} className="px-3 py-1 bg-white/10 text-xs font-medium rounded-full text-gray-200">{t}</span>
                       ))}
                     </div>
                   </motion.div>
                   <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
                     <h4 className="text-amber-500 text-xs font-bold uppercase tracking-wider mb-2">Core Features</h4>
                     <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                       {result.features.map((f: string, j: number) => <li key={j}>{f}</li>)}
                     </ul>
                   </motion.div>
                   <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" className="col-span-full">
                     <h4 className="text-amber-500 text-xs font-bold uppercase tracking-wider mb-2">Development Roadmap</h4>
                     <div className="space-y-3">
                       {result.roadmap.map((step: string, j: number) => (
                         <motion.div
                           key={j}
                           custom={j}
                           variants={fadeUp}
                           initial="hidden"
                           animate="visible"
                           whileHover={{ y: -2, scale: 1.01 }}
                           className="flex gap-3 items-center bg-black/30 p-3 rounded-lg border border-white/5"
                         >
                           <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 text-xs font-bold">{j+1}</div>
                           <span className="text-sm text-gray-300">{step}</span>
                         </motion.div>
                       ))}
                     </div>
                   </motion.div>
                 </motion.div>
               )}
             </motion.div>
           )}
         </AnimatePresence>
       </div>
     </motion.div>
   );
}
