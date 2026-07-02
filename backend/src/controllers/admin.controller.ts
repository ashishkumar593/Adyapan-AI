import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";

export async function getAdminOverview(_req: Request, res: Response, next: NextFunction) {
  try {
    const [totalUsers, adminUsers, completedProfiles] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.profile.count({ where: { college: { not: null } } }),
    ]);

    res.json({
      success: true,
      overview: { totalUsers, adminUsers, completedProfiles },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10));
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit ?? "20"), 10)));
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          profile: {
            select: {
              college: true,
              branch: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}
