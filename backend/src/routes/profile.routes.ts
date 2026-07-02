import { Router } from "express";
import { getMyProfile, updateMyProfile, uploadResume, removeResume } from "../controllers/profile.controller";
import { requireAuth } from "../middleware/auth";
import { upload } from "../middleware/upload";

export const profileRouter = Router();

profileRouter.get("/me", requireAuth, getMyProfile);
profileRouter.put("/me", requireAuth, updateMyProfile);
profileRouter.post("/upload-resume", requireAuth, upload.single("resume"), uploadResume);
profileRouter.post("/remove-resume", requireAuth, removeResume);
