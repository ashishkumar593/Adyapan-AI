import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { generateStudyResponse, generateLearnLesson } from "../lib/ai/gemini";
import { generateJSON, MODELS } from "../lib/ai/openrouter";
import { env } from "../config/env";
import multer from "multer";
const { PDFParse } = require("pdf-parse");
import mammoth from "mammoth";
import { getUserPrismaFromRequest } from "../utils/prisma";
import { StreakService } from "../services/streak.service";
import { handleRouteError } from "../utils/routeError";
import { getTimezone } from "../utils/request";

const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const studyRouter = Router();

studyRouter.use(requireAuth);

async function extractTextFromFile(file: Express.Multer.File): Promise<string> {
  const mimeType = file.mimetype;
  if (mimeType === "application/pdf") {
    const pdf = new PDFParse({ data: file.buffer });
    const result = await pdf.getText();
    return result.text;
  } else if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword"
  ) {
    const parsed = await mammoth.extractRawText({ buffer: file.buffer });
    return parsed.value;
  } else {
    return file.buffer.toString("utf-8");
  }
}

studyRouter.post("/upload", async (req, res) => {
  try {
    const { fileName, fileType, fileUrl, content } = req.body;
    const userPrisma = await getUserPrismaFromRequest(req);
    const doc = await userPrisma.uploadedDocument.create({
      data: {
        userId: req.user!.userId,
        fileName,
        fileType,
        fileUrl,
      },
    });

    // Track Streak Activity
    StreakService.trackActivity(
      req.user!.userId,
      "UPLOAD_DOCUMENT",
      "study_assistant",
      doc.id,
      10, // 10 points
      getTimezone(req),
      userPrisma
    ).catch(err => console.error("Streak tracking error:", err));

    res.json({ success: true, doc });
  } catch (error) {
    handleRouteError(res, error, "Study.upload", "Failed to upload document");
  }
});

studyRouter.post("/chat", async (req, res) => {
  try {
    const { query, context } = req.body;
    const responseText = await generateStudyResponse(context || "", query);
    const userPrisma = await getUserPrismaFromRequest(req);

    // Track Streak Activity
    StreakService.trackActivity(
      req.user!.userId,
      "AI_CHAT_SESSION",
      "study_assistant",
      null,
      10, // 10 points
      getTimezone(req),
      userPrisma
    ).catch(err => console.error("Streak tracking error:", err));

    res.json({ success: true, response: responseText });
  } catch (error) {
    handleRouteError(res, error, "Study.chat", "Chat processing failed");
  }
});

// Analyze uploaded document using Gemini - returns structured summary
studyRouter.post("/analyze", uploadMemory.single("file"), async (req, res) => {
  try {
    let documentText = req.body.documentText as string | undefined;

    // If a file was uploaded, extract text from it
    if (!documentText && req.file) {
      documentText = await extractTextFromFile(req.file);
    }

    if (!documentText) {
      return res.status(400).json({ error: "Document text or file is required" });
    }

    const prompt = `You are an expert academic tutor. Analyze the following document text and return a highly detailed, thorough structured JSON summary.

Document Text:
"""
${documentText.slice(0, 200000)}
"""

Return a JSON object with this exact structure:
{
  "title": "Document title or subject",
  "stats": { "pages": number, "words": number, "topicsFound": number, "readingTime": string, "summaryLength": string },
  "insights": { "mainSubject": string, "difficultyLevel": string, "estimatedStudyTime": string, "importantChapters": [string], "repeatedTopics": [string] },
  "topics": [
    {
      "name": string,
      "overview": string (very detailed, at least 300-500 words covering all key points in this topic),
      "keyConcepts": [string] (at least 5-8 concepts, each explained in 1-2 sentences),
      "importantPoints": [string] (at least 5-10 important points),
      "questions": [string] (at least 5 important exam-style questions based on the topic),
      "quickRevision": string,
      "keywords": [string]
    }
  ]
}

Important instructions:
- Extract 5-8 major topics from the document. Be thorough and educational.
- Each overview MUST be detailed — at least 300-500 words. Do NOT be brief.
- Each topic MUST have at least 5 important exam-style questions that test understanding of that topic.
- Each topic should have detailed keyConcepts (at least 5) and importantPoints (at least 5).
- Return ONLY valid JSON. No markdown, no code fences.`;

    let analysis: any = await generateJSON(
      "You are an expert academic tutor. Analyze the document and return a detailed structured JSON summary with many topics, each containing thorough explanations and practice questions.",
      prompt,
      { model: "google/gemini-2.5-flash", maxTokens: 8000 },
      null
    );

    if (!analysis) {
      analysis = await generateJSON(
        "You are an expert academic tutor. Analyze the document and return a detailed structured JSON summary with many topics, each containing thorough explanations and practice questions.",
        prompt,
        { model: MODELS.FAST, maxTokens: 8000 },
        null
      );
    }

    if (!analysis) {
      analysis = {
        title: "Document Analysis",
        stats: { pages: 1, words: documentText.split(/\s+/).length, topicsFound: 3, readingTime: `${Math.max(1, Math.round(documentText.split(/\s+/).length / 200))} min`, summaryLength: "Complete" },
        insights: { mainSubject: "Study Material", difficultyLevel: "Intermediate", estimatedStudyTime: `${Math.max(1, Math.round(documentText.split(/\s+/).length / 200))} min`, importantChapters: ["Chapter 1"], repeatedTopics: [] },
        topics: [
          { name: "Main Content", overview: documentText.slice(0, 1500) + "...", keyConcepts: ["Review the document content thoroughly", "Focus on key definitions and examples provided"], importantPoints: ["Read through each section carefully", "Take notes on important definitions", "Review examples and case studies"], questions: ["What are the main themes covered in this document?", "Explain the key concepts in your own words.", "How do the different sections relate to each other?", "What practical applications can you derive from the content?", "Summarize the document in 3-5 sentences."], quickRevision: "This document covers important academic content. Review each section systematically and practice with the provided questions to reinforce understanding.", keywords: documentText.split(/\s+/).filter(w => w.length > 1 && /^[a-zA-Z0-9]+$/.test(w)).filter((_, i, a) => a.indexOf(_) === i).slice(0, 20) }
        ]
      };
    }

    const userPrisma = await getUserPrismaFromRequest(req);
    // Track Streak Activity
    StreakService.trackActivity(
      req.user!.userId,
      "GENERATE_SUMMARY",
      "study_assistant",
      null,
      15, // 15 points
      getTimezone(req),
      userPrisma
    ).catch(err => console.error("Streak tracking error:", err));

    res.json({ success: true, analysis });
  } catch (error) {
    handleRouteError(res, error, "Study.analyze", "Failed to analyze document. Please try again.");
  }
});

// Generate AI lesson on a topic (migrated from learn module)
studyRouter.post("/generate-lesson", async (req, res) => {
  try {
    const { topic, duration, level } = req.body;
    const result = await generateLearnLesson(topic, duration || "10m", level || "intermediate");
    const userPrisma = await getUserPrismaFromRequest(req);

    // Track Streak Activity
    StreakService.trackActivity(
      req.user!.userId,
      "GENERATE_NOTES",
      "study_assistant",
      null,
      15, // 15 points
      getTimezone(req),
      userPrisma
    ).catch(err => console.error("Streak tracking error:", err));

    res.json({ success: true, data: result });
  } catch (error) {
    handleRouteError(res, error, "Study.generateLesson", "Lesson generation failed");
  }
});

// Get study sessions with messages
studyRouter.get("/sessions", async (req, res) => {
  try {
    const userPrisma = await getUserPrismaFromRequest(req);
    const sessions = await userPrisma.studySession.findMany({
      where: { userId: req.user!.userId },
      include: { messages: true, documents: true },
      orderBy: { updatedAt: "desc" },
    });
    res.json({ success: true, sessions });
  } catch (error) {
    handleRouteError(res, error, "Study.sessions", "Failed to fetch sessions");
  }
});

studyRouter.get("/history", async (req, res) => {
  try {
    const userPrisma = await getUserPrismaFromRequest(req);
    const sessions = await userPrisma.studySession.findMany({
      where: { userId: req.user!.userId },
      include: { messages: true },
    });
    res.json({ success: true, sessions });
  } catch (error) {
    handleRouteError(res, error, "Study.history", "Failed to fetch history");
  }
});
