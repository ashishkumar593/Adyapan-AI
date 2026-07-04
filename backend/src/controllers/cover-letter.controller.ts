import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { httpError } from "../utils/httpError";
import { generateCoverLetterText } from "../lib/ai/gemini";

/**
 * 1. Generate Cover Letter
 */
export async function generateCoverLetter(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) throw httpError(401, "Unauthorized");

    const { companyName, role, jobDescription, tone } = req.body;

    if (!companyName) throw httpError(400, "Company name is required");
    if (!role) throw httpError(400, "Role/Title is required");

    const selectedTone = tone || "Professional";

    // Call Gemini to generate cover letter text
    const content = await generateCoverLetterText(companyName, role, jobDescription || "", selectedTone);

    // Save to database
    const coverLetter = await prisma.coverLetter.create({
      data: {
        userId,
        companyName,
        role,
        content,
      },
    });

    res.status(201).json({ success: true, coverLetter });
  } catch (error) {
    next(error);
  }
}

/**
 * 2. Get User Cover Letters History
 */
export async function listCoverLetters(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) throw httpError(401, "Unauthorized");

    const coverLetters = await prisma.coverLetter.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, coverLetters });
  } catch (error) {
    next(error);
  }
}

/**
 * 3. Get Specific Cover Letter
 */
export async function getCoverLetter(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) throw httpError(401, "Unauthorized");

    const coverLetter = await prisma.coverLetter.findFirst({
      where: { id: req.params.id as string, userId },
    });

    if (!coverLetter) {
      throw httpError(404, "Cover letter not found");
    }

    res.json({ success: true, coverLetter });
  } catch (error) {
    next(error);
  }
}

/**
 * 4. Delete Cover Letter
 */
export async function deleteCoverLetter(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) throw httpError(401, "Unauthorized");

    const letterId = req.params.id as string;

    const letter = await prisma.coverLetter.findFirst({
      where: { id: letterId, userId },
    });
    if (!letter) throw httpError(404, "Cover letter not found");

    await prisma.coverLetter.delete({
      where: { id: letterId },
    });

    res.json({ success: true, message: "Cover letter deleted successfully" });
  } catch (error) {
    next(error);
  }
}
