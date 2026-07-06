import { Router } from "express";
import {
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  createNotification,
} from "../controllers/notification.controller";
import { requireAuth, requireRole } from "../middleware/auth";

export const notificationRouter = Router();

notificationRouter.use(requireAuth);

notificationRouter.get("/", listNotifications);
notificationRouter.get("/unread-count", getUnreadCount);
notificationRouter.put("/read-all", markAllAsRead);
notificationRouter.delete("/clear", clearAllNotifications);
notificationRouter.delete("/:id", deleteNotification);
notificationRouter.put("/:id/read", markAsRead);
notificationRouter.post("/", requireRole("ADMIN"), createNotification);
