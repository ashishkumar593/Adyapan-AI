import { Router } from "express";
import {
  analyzeLinkedIn,
  generateHeadline,
  generateAbout,
  listLinkedInReports,
} from "../controllers/linkedin.controller";
import { requireAuth } from "../middleware/auth";

export const linkedinRouter = Router();

linkedinRouter.post("/analyze", requireAuth, analyzeLinkedIn);
linkedinRouter.post("/generate-headline", requireAuth, generateHeadline);
linkedinRouter.post("/generate-about", requireAuth, generateAbout);
linkedinRouter.get("/history", requireAuth, listLinkedInReports);
