import { Router } from "express";
import {
  createOrder,
  verifyPayment,
  getStatus,
  cancelSubscription,
  listPlans,
} from "../controllers/payment.controller";
import { requireAuth } from "../middleware/auth";

export const paymentRouter = Router();

paymentRouter.get("/plans", listPlans);

paymentRouter.use(requireAuth);

paymentRouter.post("/create-order", createOrder);
paymentRouter.post("/verify", verifyPayment);
paymentRouter.get("/status", getStatus);
paymentRouter.post("/cancel", cancelSubscription);
