import { prisma } from "../config/prisma";

type ProfileInput = {
  college?: string;
  branch?: string;
  phone?: string;
  year?: string;
  careerGoal?: string;
  skills?: unknown;
  linkedin?: string;
  github?: string;
  resumeUrl?: string;
  resumeName?: string;
};

function normalizeSkills(skills: unknown) {
  if (!Array.isArray(skills)) return [];
  return skills.map((skill) => String(skill).trim()).filter(Boolean);
}

export function getProfile(userId: string) {
  return prisma.profile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      },
    },
  });
}

export function upsertProfile(userId: string, input: ProfileInput) {
  const data = {
    college: input.college,
    branch: input.branch,
    phone: input.phone,
    year: input.year,
    careerGoal: input.careerGoal,
    skills: normalizeSkills(input.skills),
    linkedin: input.linkedin,
    github: input.github,
    ...(input.resumeUrl !== undefined && { resumeUrl: input.resumeUrl }),
    ...(input.resumeName !== undefined && { resumeName: input.resumeName }),
  };

  return prisma.profile.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
}

export function clearResume(userId: string) {
  return prisma.profile.update({
    where: { userId },
    data: { resumeUrl: null, resumeName: null },
  });
}
