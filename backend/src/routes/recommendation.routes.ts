import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  generateRecommendations,
  getDashboardRecommendations,
  getStudyRecommendations,
  getRevisionRecommendations,
  getExamRecommendations,
  getInterviewRecommendations
} from "../controllers/recommendation.controller";

export const recommendationRouter = Router();

// Secure all recommendation routes
recommendationRouter.use(requireAuth);

// API Endpoints
recommendationRouter.post("/generate", generateRecommendations);
recommendationRouter.get("/dashboard", getDashboardRecommendations);
recommendationRouter.get("/study", getStudyRecommendations);
recommendationRouter.get("/revision", getRevisionRecommendations);
recommendationRouter.get("/exam", getExamRecommendations);
recommendationRouter.get("/interview", getInterviewRecommendations);
