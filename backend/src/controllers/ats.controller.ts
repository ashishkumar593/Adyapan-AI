import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { httpError } from "../utils/httpError";
import { analyzeResumeATS } from "../lib/ai/gemini";
const pdfParse = require("pdf-parse");
import mammoth from "mammoth";

/**
 * 1. Analyze Uploaded Resume File for ATS Score
 */
export async function analyzeATSReport(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) throw httpError(401, "Unauthorized");

    const targetRole = req.body.targetRole || "Software Engineer";
    const resumeId = req.body.resumeId || ""; // Optional, link to an existing Resume draft if provided

    if (!req.file) {
      throw httpError(400, "Please upload a PDF or DOCX resume file");
    }

    const fileBuffer = req.file.buffer;
    const mimeType = req.file.mimetype;
    let resumeText = "";

    // Extract text based on file format
    if (mimeType === "application/pdf") {
      const parsed = await pdfParse(fileBuffer);
      resumeText = parsed.text;
    } else if (
      mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mimeType === "application/msword"
    ) {
      const parsed = await mammoth.extractRawText({ buffer: fileBuffer });
      resumeText = parsed.value;
    } else {
      throw httpError(400, "Unsupported file format. Please upload a PDF or DOCX file.");
    }

    if (!resumeText.trim()) {
      throw httpError(400, "Could not extract text from the uploaded file.");
    }

    // Call Gemini AI for ATS scoring
    const analysis = await analyzeResumeATS(resumeText, targetRole);

    // If a resumeId is not provided, we can look up or associate a dummy or create a blank one,
    // or since the schema has resumeId, we can just save it. Wait, the schema has:
    // model ATSReport {
    //   id            String   @id @default(cuid())
    //   userId        String   @map("user_id")
    //   resumeId      String   @map("resume_id")
    //   score         Int
    //   ...
    // }
    // If no resumeId is passed, we can find the user's latest resume, or if they have none, we can create a dummy one or write a placeholder.
    // Let's check if the user has any resumes.
    let associatedResumeId = resumeId;
    if (!associatedResumeId) {
      const latestResume = await prisma.resume.findFirst({
        where: { userId },
        orderBy: { updatedAt: "desc" },
      });
      if (latestResume) {
        associatedResumeId = latestResume.id;
      } else {
        // Create a quick placeholder draft so we don't violate the DB constraint
        const placeholder = await prisma.resume.create({
          data: {
            userId,
            title: `Imported Resume (${new Date().toLocaleDateString()})`,
            template: "Modern",
            personalInfo: {},
            education: [],
            experience: [],
            projects: [],
            skills: [],
            certifications: [],
          },
        });
        associatedResumeId = placeholder.id;
      }
    }

    // Save ATS report to DB
    const report = await prisma.aTSReport.create({
      data: {
        userId,
        resumeId: associatedResumeId,
        score: analysis.score,
        missingKeywords: analysis.missingKeywords,
        recommendations: {
          recommendations: analysis.recommendations,
          formattingIssues: analysis.formattingIssues,
          strengths: analysis.strengths,
        },
      },
    });

    res.json({ success: true, report });
  } catch (error) {
    next(error);
  }
}

/**
 * 2. Get User ATS Auditing History
 */
export async function listATSReports(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) throw httpError(401, "Unauthorized");

    const reports = await prisma.aTSReport.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        resume: {
          select: { title: true },
        },
      },
    });

    res.json({ success: true, reports });
  } catch (error) {
    next(error);
  }
}

/**
 * 3. Get Specific ATS Report
 */
export async function getATSReport(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) throw httpError(401, "Unauthorized");

    const report = await prisma.aTSReport.findFirst({
      where: { id: req.params.id as string, userId },
      include: {
        resume: {
          select: { title: true },
        },
      },
    });

    if (!report) {
      throw httpError(404, "ATS Report not found");
    }

    res.json({ success: true, report });
  } catch (error) {
    next(error);
  }
}
