import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env";
import { prisma } from "../config/prisma";

let io: Server;

export function initSocketServer(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: [
        env.frontendUrl,
        "http://localhost:3000",
        "http://localhost:3001",
        "https://adyapan-ai-gamma.vercel.app",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const genAI = new GoogleGenerativeAI(env.geminiApiKey);

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join personal notification room — called by frontend after auth
    socket.on("join_user", (userId: string) => {
      socket.join(`user:${userId}`);
      console.log(`Socket ${socket.id} joined user room: user:${userId}`);
    });

    // Leave user room on logout
    socket.on("leave_user", (userId: string) => {
      socket.leave(`user:${userId}`);
      console.log(`Socket ${socket.id} left user room: user:${userId}`);
    });

    // Join session specific room
    socket.on("join_session", (sessionId: string) => {
      socket.join(sessionId);
      console.log(`Socket ${socket.id} joined session room: ${sessionId}`);
    });

    // Real-time Study Assistant Streaming
    socket.on("study:message", async ({ sessionId, query, context }: { sessionId: string; query: string; context: string }) => {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `
          You are an expert academic tutor. Provide a clear, educational, and helpful response to the student's query.
          Context from uploaded documents:
          """
          ${context}
          """
          
          Student's Query: ${query}
          
          Answer clearly using markdown. If the query asks to explain a concept or formula, break it down simply.
        `;

        // Start generating stream
        const result = await model.generateContentStream(prompt);
        let fullResponse = "";

        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          fullResponse += chunkText;
          // Emit chunk to the session room
          io.to(sessionId).emit("study:chunk", { text: chunkText });
        }

        // Ensure the session exists in the database first
        let session = await prisma.studySession.findUnique({
          where: { id: sessionId },
        });

        if (!session) {
          // Find first user to connect the session to if none is provided
          const firstUser = await prisma.user.findFirst();
          if (firstUser) {
            session = await prisma.studySession.create({
              data: {
                id: sessionId,
                userId: firstUser.id,
                topic: "General Study",
              },
            });
          }
        }

        if (session) {
          // Save complete message exchange in database
          await prisma.studyMessage.create({
            data: {
              sessionId,
              role: "user",
              content: query,
            },
          });

          await prisma.studyMessage.create({
            data: {
              sessionId,
              role: "model",
              content: fullResponse,
            },
          });
        }

        io.to(sessionId).emit("study:complete", { fullResponse });

      } catch (error) {
        console.error("Socket study assistant streaming error:", error);
        io.to(sessionId).emit("study:error", { error: "Failed to process query in real-time." });
      }
    });

    // Real-time Pipeline Progress Simulator for Learning Hub Generators (Notes, Quiz, PPT, etc.)
    socket.on("generate:start", async ({ moduleName, payload }: { moduleName: string; payload: any }) => {
      const stepsMap: Record<string, string[]> = {
        notes: [
          "Parsing uploaded reading materials...",
          "Extracting key academic topics and theories...",
          "Fleshing out comprehensive explanations and summaries...",
          "Polishing layout formatting and generating markdown...",
        ],
        quiz: [
          "Scanning content for testable vocabulary and concepts...",
          "Drafting multiple-choice questions with balanced distractors...",
          "Verifying answer keys and writing explanations...",
          "Formatting quiz structures for interactive play...",
        ],
        assignment: [
          "Analyzing syllabus core competencies...",
          "Formulating challenging open-ended scenarios...",
          "Creating grading criteria and sample rubrics...",
          "Packaging assignment files...",
        ],
        ppt: [
          "Deconstructing topic into slide-by-slide structure...",
          "Drafting clean header slides and bullet-points...",
          "Adding code snippets or formulas where necessary...",
          "Polishing presentation schema JSON...",
        ],
        mindmap: [
          "Mapping conceptual hierarchy...",
          "Linking secondary nodes to core themes...",
          "Generating visual representation schema...",
          "Rendering interactive mind map node connections...",
        ]
      };

      const steps = stepsMap[moduleName] || ["Initiating generation pipeline...", "Structuring details...", "Completing file formats..."];
      const totalSteps = steps.length;

      try {
        for (let i = 0; i < totalSteps; i++) {
          const progress = Math.round(((i + 1) / totalSteps) * 100);
          socket.emit("generate:progress", {
            progress,
            statusMessage: steps[i],
          });
          // Wait 1.5 seconds between steps to visualize the real-time pipeline progress
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }

        socket.emit("generate:complete", {
          message: `${moduleName.toUpperCase()} generation complete!`,
        });
      } catch (error) {
        socket.emit("generate:error", { error: "Pipeline encountered an issue." });
      }
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}

export { io };
