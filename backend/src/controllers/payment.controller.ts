import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { env } from "../config/env";
import { httpError } from "../utils/httpError";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: env.razorpay.keyId,
  key_secret: env.razorpay.keySecret,
});

const PLAN_PRICES: Record<string, { amount: number; label: string }> = {
  pro_monthly: { amount: 14900, label: "Pro Monthly" },
  pro_yearly: { amount: 99900, label: "Pro Yearly" },
};

// ─── 1. Create Order ─────────────────────────────────────────────

export async function createOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) throw httpError(401, "Unauthorized");

    const { plan } = req.body;
    if (!plan || !PLAN_PRICES[plan]) throw httpError(400, "Invalid plan. Choose pro_monthly or pro_yearly.");

    const { amount, label } = PLAN_PRICES[plan];

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `receipt_${userId}_${Date.now()}`,
      notes: { userId, plan, label },
    });

    await prisma.payment.create({
      data: {
        userId,
        orderId: order.id,
        amount,
        currency: "INR",
        plan,
        status: "created",
      },
    });

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      },
      key: env.razorpay.keyId,
    });
  } catch (error) {
    next(error);
  }
}

// ─── 2. Verify Payment ──────────────────────────────────────────

export async function verifyPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) throw httpError(401, "Unauthorized");

    const { orderId, paymentId, signature } = req.body;
    if (!orderId || !paymentId || !signature) {
      throw httpError(400, "Missing payment verification fields");
    }

    const expectedSig = crypto
      .createHmac("sha256", env.razorpay.keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    if (expectedSig !== signature) {
      throw httpError(400, "Invalid payment signature");
    }

    const payment = await prisma.payment.findUnique({ where: { orderId } });
    if (!payment) throw httpError(404, "Payment record not found");
    if (payment.userId !== userId) throw httpError(403, "Payment does not belong to this user");

    const planKey = payment.plan as keyof typeof PLAN_PRICES;
    const planLabel = PLAN_PRICES[planKey]?.label ?? payment.plan;

    await prisma.payment.update({
      where: { orderId },
      data: { paymentId, signature, status: "paid" },
    });

    const now = new Date();
    const end = new Date(now);
    if (payment.plan === "pro_yearly") {
      end.setFullYear(end.getFullYear() + 1);
    } else {
      end.setMonth(end.getMonth() + 1);
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        plan: planLabel.toLowerCase().replace(" ", "_"),
        razorpayCustomerId: paymentId,
        razorpaySubscriptionId: orderId,
        subscriptionStatus: "active",
        subscriptionEnd: end,
      },
    });

    res.json({ success: true, message: "Payment verified and subscription activated" });
  } catch (error) {
    next(error);
  }
}

// ─── 3. Get Subscription Status ─────────────────────────────────

export async function getStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) throw httpError(401, "Unauthorized");

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        plan: true,
        subscriptionStatus: true,
        subscriptionEnd: true,
        razorpaySubscriptionId: true,
      },
    });

    if (!user) throw httpError(404, "User not found");

    const isActive = user.subscriptionStatus === "active" && user.subscriptionEnd && new Date(user.subscriptionEnd) > new Date();

    res.json({
      success: true,
      subscription: {
        plan: user.plan,
        status: isActive ? "active" : "inactive",
        endDate: user.subscriptionEnd,
        razorpaySubscriptionId: user.razorpaySubscriptionId,
      },
    });
  } catch (error) {
    next(error);
  }
}

// ─── 4. Cancel Subscription ─────────────────────────────────────

export async function cancelSubscription(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) throw httpError(401, "Unauthorized");

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw httpError(404, "User not found");
    if (user.subscriptionStatus !== "active") throw httpError(400, "No active subscription");

    // Cancel at Razorpay if subscription ID exists
    if (user.razorpaySubscriptionId) {
      try {
        await razorpay.subscriptions.cancel(user.razorpaySubscriptionId);
      } catch {
        // subscription might not exist at Razorpay (one-time orders)
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: "cancelled",
        subscriptionEnd: new Date(),
      },
    });

    res.json({ success: true, message: "Subscription cancelled" });
  } catch (error) {
    next(error);
  }
}

// ─── 5. Plans List ──────────────────────────────────────────────

export async function listPlans(_req: Request, res: Response) {
  res.json({
    success: true,
    plans: Object.entries(PLAN_PRICES).map(([id, p]) => ({
      id,
      label: p.label,
      amount: p.amount,
      currency: "INR",
    })),
  });
}
