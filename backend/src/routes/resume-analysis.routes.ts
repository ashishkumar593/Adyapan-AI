import { Router } from "express";
import { getResumeAnalysis, listResumeAnalyses } from "../controllers/resume-analyzer.controller";
import { requireAuth } from "../middleware/auth";

export const resumeAnalysisRouter = Router();

resumeAnalysisRouter.get("/history", requireAuth, listResumeAnalyses);
resumeAnalysisRouter.get("/:id", requireAuth, getResumeAnalysis);
