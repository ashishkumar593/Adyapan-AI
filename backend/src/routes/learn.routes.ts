import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { generateLearnLesson } from "../lib/ai/gemini";
export const learnRouter = Router();

learnRouter.use(requireAuth);

learnRouter.post("/generate", async (req, res) => {
  try {
    const { topic, duration, level } = req.body;
    const result = await generateLearnLesson(topic, duration || "10m", level || "intermediate");
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: "Lesson generation failed" });
  }
});
