import { Router } from "express";
import {
  generateCoverLetter,
  listCoverLetters,
  getCoverLetter,
  deleteCoverLetter,
} from "../controllers/cover-letter.controller";
import { requireAuth } from "../middleware/auth";

export const coverLetterRouter = Router();

coverLetterRouter.post("/generate", requireAuth, generateCoverLetter);
coverLetterRouter.get("/history", requireAuth, listCoverLetters);
coverLetterRouter.get("/:id", requireAuth, getCoverLetter);
coverLetterRouter.delete("/:id", requireAuth, deleteCoverLetter);
