import { Router } from "express";
import { adminRouter } from "./admin.routes";
import { authRouter } from "./auth.routes";
import { healthRouter } from "./health.routes";
import { profileRouter } from "./profile.routes";
import { resumeRouter } from "./resume.routes";
import { atsRouter } from "./ats.routes";
import { resumeAnalysisRouter } from "./resume-analysis.routes";
import { coverLetterRouter } from "./cover-letter.routes";
import { linkedinRouter } from "./linkedin.routes";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/profile", profileRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/resume", resumeRouter);
apiRouter.use("/ats", atsRouter);
apiRouter.use("/resume-analysis", resumeAnalysisRouter);
apiRouter.use("/cover-letter", coverLetterRouter);
apiRouter.use("/linkedin", linkedinRouter);
