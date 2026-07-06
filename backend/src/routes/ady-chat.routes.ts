import { Router } from "express";
import {
  listSessions,
  createSession,
  getSession,
  deleteSession,
  updateSession,
  sendMessage,
  uploadFile,
  uploadChatFile,
} from "../controllers/ady-chat.controller";
import { requireAuth } from "../middleware/auth";

export const adyChatRouter = Router();

adyChatRouter.use(requireAuth);

adyChatRouter.get("/sessions", listSessions);
adyChatRouter.post("/sessions", createSession);
adyChatRouter.get("/sessions/:id", getSession);
adyChatRouter.delete("/sessions/:id", deleteSession);
adyChatRouter.patch("/sessions/:id", updateSession);

adyChatRouter.post("/send", sendMessage);
adyChatRouter.post("/upload", uploadChatFile, uploadFile);
