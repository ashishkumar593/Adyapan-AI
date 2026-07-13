import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  analyzePlagiarismSSE,
  analyzePlagiarismSync,
  getReport,
  humanizeText,
  rewriteSection,
} from "../controllers/plagiarism.controller";

export const plagiarismRouter = Router();

plagiarismRouter.use(requireAuth);

// Full analysis (SSE streaming)
plagiarismRouter.post("/analyze", analyzePlagiarismSSE);

// Full analysis (non-streaming fallback)
plagiarismRouter.post("/analyze-sync", analyzePlagiarismSync);

// Retrieve stored report
plagiarismRouter.get("/report/:id", getReport);

// Humanize AI-generated text
plagiarismRouter.post("/humanize", humanizeText);

// Rewrite a specific flagged section
plagiarismRouter.post("/rewrite-section", rewriteSection);
