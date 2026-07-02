import type { NextFunction, Request, Response } from "express";
import path from "path";
import fs from "fs";
import { getProfile, upsertProfile, clearResume } from "../services/profile.service";

export async function getMyProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const profile = await getProfile(req.user?.userId ?? "");
    res.json({ success: true, profile });
  } catch (error) {
    next(error);
  }
}

export async function updateMyProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const profile = await upsertProfile(req.user?.userId ?? "", req.body);
    res.json({ success: true, profile });
  } catch (error) {
    next(error);
  }
}

export async function uploadResume(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: "No file uploaded" });
      return;
    }

    const resumeUrl = `/uploads/${req.file.filename}`;
    const resumeName = req.file.originalname;

    const profile = await upsertProfile(req.user?.userId ?? "", {
      resumeUrl,
      resumeName,
    });

    res.json({ success: true, profile });
  } catch (error) {
    next(error);
  }
}

export async function removeResume(req: Request, res: Response, next: NextFunction) {
  try {
    const existing = await getProfile(req.user?.userId ?? "");
    if (existing?.resumeUrl) {
      const filePath = path.join(process.cwd(), "uploads", path.basename(existing.resumeUrl));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    const profile = await clearResume(req.user?.userId ?? "");
    res.json({ success: true, profile });
  } catch (error) {
    next(error);
  }
}
