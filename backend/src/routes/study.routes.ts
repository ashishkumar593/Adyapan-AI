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
import { generatePdfFromHtml } from "../services/pdf-generator.service";

const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

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

    const wordCount = documentText.split(/\s+/).length;
    const prompt = `You are an expert academic tutor. Analyze the following document and produce a comprehensive, topic-focused JSON summary. Every topic must be explained in the context of the document's main subject.

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
      "overview": string (very detailed, at least 400-600 words, written as a thorough explanation of this topic within the context of the document's subject),
      "subtopics": [
        {
          "name": string,
          "content": string (detailed explanation of this subtopic, at least 200-300 words, connecting it back to the main topic)
        }
      ] (at least 3-5 subtopics per topic),
      "keyConcepts": [string] (at least 5-8 concepts, each explained in 1-2 sentences),
      "importantPoints": [string] (at least 5-10 important points),
      "questions": [string] (at least 5 exam-style questions that test understanding),
      "quickRevision": string (a concise 3-5 sentence revision summary of this topic),
      "keywords": [string] (at least 5-8 key terms)
    }
  ]
}

CRITICAL INSTRUCTIONS:
- Extract 5-8 major topics. Each topic must be explained thoroughly in the context of "${wordCount > 5000 ? "this substantial document" : "this document"}".
- Each overview MUST be 400-600 words, explaining the topic deeply and connecting it to the document's main subject. Do NOT be brief or generic.
- Each subtopic MUST be 200-300 words with concrete details from the document.
- Include 5-8 keyConcepts per topic, each with a meaningful 1-2 sentence explanation.
- Include 5-10 importantPoints per topic with specific details.
- Include 5+ exam-style questions per topic that test real understanding.
- quickRevision must be a concise summary capturing the essence of the topic.
- Return ONLY valid JSON. No markdown, no code fences, no commentary.`;

    let analysis: any = await generateJSON(
      "You are an expert academic tutor. Analyze the provided document thoroughly and return a detailed structured JSON summary. Focus on explaining each topic in the context of the document's main subject. Provide comprehensive overviews, detailed subtopics, and meaningful practice questions.",
      prompt,
      { model: "google/gemini-2.5-flash", maxTokens: 16384, responseFormat: { type: "json_object" } },
      null
    );

    if (!analysis) {
      analysis = await generateJSON(
        "You are an expert academic tutor. Analyze the provided document thoroughly and return a detailed structured JSON summary. Focus on explaining each topic in the context of the document's main subject. Provide comprehensive overviews, detailed subtopics, and meaningful practice questions.",
        prompt,
        { model: MODELS.FAST, maxTokens: 16384, responseFormat: { type: "json_object" } },
        null
      );
    }

    if (!analysis) {
      analysis = {
        title: "Document Analysis",
        stats: { pages: 1, words: documentText.split(/\s+/).length, topicsFound: 3, readingTime: `${Math.max(1, Math.round(documentText.split(/\s+/).length / 200))} min`, summaryLength: "Complete" },
        insights: { mainSubject: "Study Material", difficultyLevel: "Intermediate", estimatedStudyTime: `${Math.max(1, Math.round(documentText.split(/\s+/).length / 200))} min`, importantChapters: ["Chapter 1"], repeatedTopics: [] },
        topics: [
          { 
            name: "Main Content", 
            overview: documentText.slice(0, 1500) + "...", 
            subtopics: [
              { name: "Document Overview", content: "General contents and structural layout extracted from the document." },
              { name: "Key Sections", content: "Key educational units and chapters identified for studying." }
            ],
            keyConcepts: ["Review the document content thoroughly", "Focus on key definitions and examples provided"], 
            importantPoints: ["Read through each section carefully", "Take notes on important definitions", "Review examples and case studies"], 
            questions: ["What are the main themes covered in this document?", "Explain the key concepts in your own words.", "How do the different sections relate to each other?", "What practical applications can you derive from the content?", "Summarize the document in 3-5 sentences."], 
            quickRevision: "This document covers important academic content. Review each section systematically and practice with the provided questions to reinforce understanding.", 
            keywords: documentText.split(/\s+/).filter(w => w.length > 1 && /^[a-zA-Z0-9]+$/.test(w)).filter((_, i, a) => a.indexOf(_) === i).slice(0, 20) 
          }
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

// Export document analysis as PDF
studyRouter.post("/export/pdf", async (req, res) => {
  try {
    const { analysis } = req.body;

    if (!analysis || !analysis.topics || !Array.isArray(analysis.topics)) {
      res.status(400).json({ success: false, error: "Valid analysis data is required" });
      return;
    }

    const title = analysis.title || "Document Analysis";
    const topics = analysis.topics as Array<{
      name: string; overview: string;
      subtopics?: Array<{ name: string; content: string }>;
      keyConcepts?: string[]; importantPoints?: string[];
      questions?: string[]; quickRevision?: string; keywords?: string[];
    }>;

    const topicSections = topics.map((t, i) => {
      const subtopicsHtml = t.subtopics?.length
        ? `<div style="margin-top:16px;"><h3 style="font-size:14px;font-weight:700;color:#1e293b;margin-bottom:8px;">Subtopics</h3>`
          + t.subtopics.map(sub => `
            <div style="margin-bottom:12px;padding-left:16px;border-left:3px solid #f59e0b;">
              <h4 style="font-size:13px;font-weight:700;color:#334155;margin-bottom:4px;">${escapeXml(sub.name)}</h4>
              <p style="font-size:12px;line-height:1.7;color:#475569;">${escapeXml(sub.content)}</p>
            </div>`).join("")
          + `</div>`
        : "";

      const conceptsHtml = t.keyConcepts?.length
        ? `<div style="margin-top:16px;padding:14px;background:#f5f3ff;border-radius:8px;border:1px solid #e9d5ff;">
            <h3 style="font-size:13px;font-weight:700;color:#7c3aed;margin-bottom:8px;">Key Concepts</h3>
            <ul style="margin:0;padding-left:18px;font-size:12px;line-height:1.8;color:#475569;">
              ${t.keyConcepts.map(c => `<li style="margin-bottom:2px;">${escapeXml(c)}</li>`).join("")}
            </ul>
          </div>`
        : "";

      const pointsHtml = t.importantPoints?.length
        ? `<div style="margin-top:12px;padding:14px;background:#ecfeff;border-radius:8px;border:1px solid #a5f3fc;">
            <h3 style="font-size:13px;font-weight:700;color:#0891b2;margin-bottom:8px;">Important Points</h3>
            <ul style="margin:0;padding-left:18px;font-size:12px;line-height:1.8;color:#475569;">
              ${t.importantPoints.map(p => `<li style="margin-bottom:2px;">${escapeXml(p)}</li>`).join("")}
            </ul>
          </div>`
        : "";

      const questionsHtml = t.questions?.length
        ? `<div style="margin-top:12px;padding:14px;background:#fffbeb;border-radius:8px;border:1px solid #fde68a;">
            <h3 style="font-size:13px;font-weight:700;color:#d97706;margin-bottom:8px;">Practice Questions</h3>
            <ol style="margin:0;padding-left:18px;font-size:12px;line-height:1.8;color:#475569;">
              ${t.questions.map(q => `<li style="margin-bottom:3px;">${escapeXml(q)}</li>`).join("")}
            </ol>
          </div>`
        : "";

      const revisionHtml = t.quickRevision
        ? `<div style="margin-top:12px;padding:12px 14px;background:#fef3c7;border-radius:8px;border:1px solid #fcd34d;">
            <h3 style="font-size:13px;font-weight:700;color:#92400e;margin-bottom:6px;">Quick Revision</h3>
            <p style="font-size:12px;line-height:1.7;color:#78350f;font-style:italic;margin:0;">${escapeXml(t.quickRevision)}</p>
          </div>`
        : "";

      const keywordsHtml = t.keywords?.length
        ? `<div style="margin-top:12px;display:flex;flex-wrap:wrap;gap:6px;">
            ${t.keywords.map(kw => `<span style="font-size:10px;padding:3px 8px;border-radius:12px;background:#f1f5f9;border:1px solid #e2e8f0;color:#475569;">${escapeXml(kw)}</span>`).join("")}
          </div>`
        : "";

      return `
        <div style="margin-top:32px;page-break-inside:avoid;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
            <span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:8px;background:#f59e0b;color:#000;font-size:12px;font-weight:800;flex-shrink:0;">${i + 1}</span>
            <h2 style="font-size:17px;font-weight:800;color:#0f172a;margin:0;">${escapeXml(t.name)}</h2>
          </div>
          <p style="font-size:13px;line-height:1.85;color:#334155;white-space:pre-wrap;">${escapeXml(t.overview)}</p>
          ${subtopicsHtml}
          ${conceptsHtml}
          ${pointsHtml}
          ${questionsHtml}
          ${revisionHtml}
          ${keywordsHtml}
        </div>`;
    }).join("");

    const insights = analysis.insights || {};
    const stats = analysis.stats || {};

    const htmlContent = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; color: #0f172a; line-height: 1.6; }
  @page { size: A4; }
</style></head>
<body>
  <div style="max-width:750px;margin:0 auto;padding:32px 24px;">
    <div style="text-align:center;padding-bottom:24px;border-bottom:2px solid #e2e8f0;margin-bottom:24px;">
      <h1 style="font-size:24px;font-weight:800;color:#0f172a;margin-bottom:6px;">${escapeXml(title)}</h1>
      <p style="font-size:11px;color:#94a3b8;">Generated by Adyapan AI</p>
    </div>

    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:24px;">
      ${[
        { label: "Words", value: String(stats.words || 0) },
        { label: "Topics", value: String(stats.topicsFound || topics.length) },
        { label: "Reading Time", value: stats.readingTime || "N/A" },
        { label: "Difficulty", value: insights.difficultyLevel || "N/A" },
      ].map(s => `
        <div style="text-align:center;padding:10px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
          <div style="font-size:16px;font-weight:800;color:#0f172a;">${escapeXml(s.value)}</div>
          <div style="font-size:9px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;">${escapeXml(s.label)}</div>
        </div>`).join("")}
    </div>

    ${insights.mainSubject ? `
    <div style="padding:12px 16px;background:#fffbeb;border-radius:8px;border:1px solid #fde68a;margin-bottom:20px;">
      <span style="font-size:10px;font-weight:700;color:#d97706;text-transform:uppercase;letter-spacing:0.08em;">Main Subject</span>
      <p style="font-size:13px;color:#92400e;margin-top:2px;">${escapeXml(insights.mainSubject)}</p>
    </div>` : ""}

    <div style="border-top:1px solid #e2e8f0;padding-top:8px;">
      ${topicSections}
    </div>
  </div>
</body></html>`;

    const filename = `${title.replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "_")}_AdyapanAI_Analysis.pdf`;
    const pdfBuffer = await generatePdfFromHtml(htmlContent, title);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": pdfBuffer.length.toString(),
    });
    res.send(pdfBuffer);
  } catch (error) {
    handleRouteError(res, error, "Study.export.pdf", "PDF generation failed");
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
