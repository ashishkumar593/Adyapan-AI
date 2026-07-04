import { Router } from "express";
import multer from "multer";
import { analyzeATSReport, listATSReports, getATSReport } from "../controllers/ats.controller";
import { requireAuth } from "../middleware/auth";

export const atsRouter = Router();

const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

atsRouter.post("/analyze", requireAuth, uploadMemory.single("resume"), analyzeATSReport);
atsRouter.get("/history", requireAuth, listATSReports);
atsRouter.get("/:id", requireAuth, getATSReport);
