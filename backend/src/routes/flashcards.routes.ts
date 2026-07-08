import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { generateFlashcards } from "../lib/ai/gemini";
export const flashcardsRouter = Router();

flashcardsRouter.use(requireAuth);

flashcardsRouter.post("/generate", async (req, res) => {
  try {
    const { topic, mode, cardCount } = req.body;
    const result = await generateFlashcards(topic, mode || "intermediate", cardCount || 5);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: "Flashcard generation failed" });
  }
});
