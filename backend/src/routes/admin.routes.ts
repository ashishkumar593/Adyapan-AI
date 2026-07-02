import { Router } from "express";
import { getAdminOverview, getAdminUsers } from "../controllers/admin.controller";
import { requireAuth, requireRole } from "../middleware/auth";

export const adminRouter = Router();

const guard = [requireAuth, requireRole("ADMIN")];

adminRouter.get("/overview", ...guard, getAdminOverview);
adminRouter.get("/users", ...guard, getAdminUsers);
