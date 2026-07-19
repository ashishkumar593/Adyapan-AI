import type { NextFunction, Request, Response } from "express";
import {
  optimizeLinkedInProfile,
  generateResumeSummary,
  generateLinkedInFullProfile,
  generateLinkedInHeadlines,
  generateLinkedInAbout,
  generateLinkedInExperience,
  generateLinkedInProjects,
  generateLinkedInSkills,
  generateLinkedInNetworking,
  generateLinkedInContentIdeas,
  generateLinkedInRecruiterVisibility,
} from "../lib/ai/gemini";
import { getUserPrismaFromRequest } from "../utils/prisma";
import { requireUserId } from "../utils/request";

// ─── 1. Full LinkedIn Profile Optimization ──────────────────────────────────
export async function generateFullLinkedInProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = requireUserId(req);
    const userPrisma = await getUserPrismaFromRequest(req);
    const { resumeId, targetRole } = req.body;

    let resumeText = "";
    let candidateProfile: any = null;
    let atsReport: any = null;

    // Try to get resume data from builder
    if (resumeId) {
      const resume = await userPrisma.resume.findUnique({ where: { id: resumeId } });
      if (resume) {
        resumeText = [
          resume.personalInfo ? `Name: ${(resume.personalInfo as any)?.fullName || ""}` : "",
          resume.summary || "",
          resume.experience ? JSON.stringify(resume.experience) : "",
          resume.projects ? JSON.stringify(resume.projects) : "",
          resume.skills ? JSON.stringify(resume.skills) : "",
          resume.education ? JSON.stringify(resume.education) : "",
          resume.certifications ? JSON.stringify(resume.certifications) : "",
        ].filter(Boolean).join("\n");
      }
    }

    // Try uploaded resume
    if (!resumeText) {
      const uploaded = await userPrisma.uploadedResume.findFirst({
        where: { userId, isActive: true },
        include: { candidateProfile: true },
      });
      if (uploaded) {
        resumeText = uploaded.extractedText || "";
        candidateProfile = uploaded.candidateProfile;
      }
    }

    // Try ATS report
    if (resumeId) {
      atsReport = await userPrisma.aTSReport.findFirst({
        where: { userId, resumeId },
        orderBy: { createdAt: "desc" },
      });
    }

    if (!resumeText && !candidateProfile) {
      return res.status(400).json({ success: false, error: "No resume data found. Please upload a resume first." });
    }

    const profile = await generateLinkedInFullProfile({
      resumeText: resumeText || JSON.stringify(candidateProfile || {}),
      candidateProfile,
      atsReport: atsReport?.reportJson || atsReport,
      targetRole: targetRole || "Software Engineer",
    });

    // Save to database
    const report = await userPrisma.linkedInReport.create({
      data: {
        userId,
        headline: profile.headline,
        aboutSection: profile.aboutSection,
        skills: JSON.stringify(profile.skills),
        recommendations: JSON.stringify(profile.recommendations),
        score: profile.scores.overall,
        experienceJson: JSON.stringify(profile.experience),
        projectsJson: JSON.stringify(profile.projects),
        featuredJson: JSON.stringify(profile.featured),
        networkingJson: JSON.stringify(profile.networking),
        contentIdeasJson: JSON.stringify(profile.contentIdeas),
        headlineScore: profile.scores.headline,
        aboutScore: profile.scores.about,
        experienceScore: profile.scores.experience,
        projectsScore: profile.scores.projects,
        skillsScore: profile.scores.skills,
        keywordScore: profile.scores.keyword,
        visibilityScore: profile.scores.visibility,
        completenessScore: profile.completeness.score,
        completenessJson: JSON.stringify(profile.completeness),
        targetRole: targetRole || "Software Engineer",
        versionNumber: 1,
      },
    });

    res.status(201).json({ success: true, profile, reportId: report.id });
  } catch (error) {
    next(error);
  }
}

// ─── 2. Legacy Analyze (backward compatible) ────────────────────────────────
export async function analyzeLinkedIn(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = requireUserId(req);
    const userPrisma = await getUserPrismaFromRequest(req);
    const { headline, about, experience, skills, targetRole } = req.body;

    const reportData = await optimizeLinkedInProfile({
      headline: headline || "",
      about: about || "",
      experience: experience || "",
      skills: skills || "",
      targetRole: targetRole || "Software Engineer",
    });

    const report = await userPrisma.linkedInReport.create({
      data: {
        userId,
        headline: reportData.headline,
        aboutSection: reportData.aboutSection,
        skills: JSON.stringify(reportData.skills),
        recommendations: JSON.stringify(reportData.recommendations),
        score: reportData.score,
        targetRole: targetRole || "Software Engineer",
      },
    });

    res.status(201).json({ success: true, report });
  } catch (error) {
    next(error);
  }
}

// ─── 3. Generate Headlines ──────────────────────────────────────────────────
export async function generateHeadline(req: Request, res: Response, next: NextFunction) {
  try {
    const { targetRole, skills, experience, count } = req.body;
    const headlines = await generateLinkedInHeadlines({
      targetRole: targetRole || "Software Engineer",
      skills: skills || "",
      experience: experience || "",
      count: count || 5,
    });
    res.json({ success: true, headlines });
  } catch (error) {
    next(error);
  }
}

// ─── 4. Generate About Section ──────────────────────────────────────────────
export async function generateAbout(req: Request, res: Response, next: NextFunction) {
  try {
    const { targetRole, experience, skills, variant, resumeText } = req.body;
    const about = await generateLinkedInAbout({
      targetRole: targetRole || "Software Engineer",
      resumeText: resumeText || `Experience: ${experience || "Student/Entry-level"}\nSkills: ${skills || "Web Development"}`,
      variant: variant || "Professional",
    });
    res.json({ success: true, about });
  } catch (error) {
    next(error);
  }
}

// ─── 5. Optimize Experience ─────────────────────────────────────────────────
export async function optimizeExperience(req: Request, res: Response, next: NextFunction) {
  try {
    const { experienceJson, targetRole } = req.body;
    const optimized = await generateLinkedInExperience({
      experienceJson: experienceJson || [],
      targetRole: targetRole || "Software Engineer",
    });
    res.json({ success: true, experience: optimized });
  } catch (error) {
    next(error);
  }
}

// ─── 6. Optimize Projects ───────────────────────────────────────────────────
export async function optimizeProjects(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectsJson, targetRole } = req.body;
    const optimized = await generateLinkedInProjects({
      projectsJson: projectsJson || [],
      targetRole: targetRole || "Software Engineer",
    });
    res.json({ success: true, projects: optimized });
  } catch (error) {
    next(error);
  }
}

// ─── 7. Optimize Skills ─────────────────────────────────────────────────────
export async function optimizeSkills(req: Request, res: Response, next: NextFunction) {
  try {
    const { currentSkills, atsKeywords, targetRole } = req.body;
    const result = await generateLinkedInSkills({
      currentSkills: currentSkills || [],
      atsKeywords: atsKeywords || [],
      targetRole: targetRole || "Software Engineer",
    });
    res.json({ success: true, skills: result });
  } catch (error) {
    next(error);
  }
}

// ─── 8. Generate Networking Templates ───────────────────────────────────────
export async function generateNetworking(req: Request, res: Response, next: NextFunction) {
  try {
    const { profile, targetRole, context } = req.body;
    const templates = await generateLinkedInNetworking({
      profile: profile || {},
      targetRole: targetRole || "Software Engineer",
      context: context || "General networking",
    });
    res.json({ success: true, templates });
  } catch (error) {
    next(error);
  }
}

// ─── 9. Generate Content Ideas ──────────────────────────────────────────────
export async function generateContentIdeas(req: Request, res: Response, next: NextFunction) {
  try {
    const { projects, experience, skills, targetRole } = req.body;
    const ideas = await generateLinkedInContentIdeas({
      projects: projects || [],
      experience: experience || [],
      skills: skills || [],
      targetRole: targetRole || "Software Engineer",
    });
    res.json({ success: true, ideas });
  } catch (error) {
    next(error);
  }
}

// ─── 10. Recruiter Visibility Analysis ──────────────────────────────────────
export async function analyzeRecruiterVisibility(req: Request, res: Response, next: NextFunction) {
  try {
    const { headline, about, skills, experience, targetRole } = req.body;
    const analysis = await generateLinkedInRecruiterVisibility({
      headline: headline || "",
      about: about || "",
      skills: skills || [],
      experience: experience || [],
      targetRole: targetRole || "Software Engineer",
    });
    res.json({ success: true, analysis });
  } catch (error) {
    next(error);
  }
}

// ─── 11. Version History ────────────────────────────────────────────────────
export async function listLinkedInReports(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = requireUserId(req);
    const userPrisma = await getUserPrismaFromRequest(req);
    const reports = await userPrisma.linkedInReport.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json({ success: true, reports });
  } catch (error) {
    next(error);
  }
}

// ─── 12. Get Latest Report ──────────────────────────────────────────────────
export async function getLatestReport(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = requireUserId(req);
    const userPrisma = await getUserPrismaFromRequest(req);
    const report = await userPrisma.linkedInReport.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, report });
  } catch (error) {
    next(error);
  }
}

// ─── 13. Get Report by ID ───────────────────────────────────────────────────
export async function getReportById(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = requireUserId(req);
    const userPrisma = await getUserPrismaFromRequest(req);
    const { id } = req.params;
    const report = await userPrisma.linkedInReport.findFirst({
      where: { id, userId },
    });
    if (!report) return res.status(404).json({ success: false, error: "Report not found" });
    res.json({ success: true, report });
  } catch (error) {
    next(error);
  }
}

// ─── 14. Delete Report ──────────────────────────────────────────────────────
export async function deleteReport(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = requireUserId(req);
    const userPrisma = await getUserPrismaFromRequest(req);
    const { id } = req.params;
    await userPrisma.linkedInReport.deleteMany({ where: { id, userId } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

// ─── 15. Duplicate Report ───────────────────────────────────────────────────
export async function duplicateReport(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = requireUserId(req);
    const userPrisma = await getUserPrismaFromRequest(req);
    const { id } = req.params;
    const original = await userPrisma.linkedInReport.findFirst({ where: { id, userId } });
    if (!original) return res.status(404).json({ success: false, error: "Report not found" });

    const duplicate = await userPrisma.linkedInReport.create({
      data: {
        userId,
        headline: original.headline,
        aboutSection: original.aboutSection,
        skills: original.skills,
        recommendations: original.recommendations,
        score: original.score,
        experienceJson: original.experienceJson,
        projectsJson: original.projectsJson,
        featuredJson: original.featuredJson,
        networkingJson: original.networkingJson,
        contentIdeasJson: original.contentIdeasJson,
        headlineScore: original.headlineScore,
        aboutScore: original.aboutScore,
        experienceScore: original.experienceScore,
        projectsScore: original.projectsScore,
        skillsScore: original.skillsScore,
        keywordScore: original.keywordScore,
        visibilityScore: original.visibilityScore,
        completenessScore: original.completenessScore,
        completenessJson: original.completenessJson,
        targetRole: original.targetRole,
        versionNumber: original.versionNumber + 1,
        versionLabel: `Copy of ${original.versionLabel || `v${original.versionNumber}`}`,
      },
    });

    res.status(201).json({ success: true, report: duplicate });
  } catch (error) {
    next(error);
  }
}

// ─── 16. Update Report (for inline edits) ───────────────────────────────────
export async function updateReport(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = requireUserId(req);
    const userPrisma = await getUserPrismaFromRequest(req);
    const { id } = req.params;
    const updates = req.body;

    const report = await userPrisma.linkedInReport.findFirst({ where: { id, userId } });
    if (!report) return res.status(404).json({ success: false, error: "Report not found" });

    const allowed: Record<string, any> = {};
    const fields = ["headline", "aboutSection", "skills", "recommendations", "score",
      "experienceJson", "projectsJson", "featuredJson", "networkingJson", "contentIdeasJson",
      "headlineScore", "aboutScore", "experienceScore", "projectsScore", "skillsScore",
      "keywordScore", "visibilityScore", "completenessScore", "completenessJson",
      "targetRole", "versionLabel"];
    
    for (const f of fields) {
      if (updates[f] !== undefined) allowed[f] = updates[f];
    }

    const updated = await userPrisma.linkedInReport.update({
      where: { id },
      data: { ...allowed, versionNumber: report.versionNumber + 1 },
    });

    res.json({ success: true, report: updated });
  } catch (error) {
    next(error);
  }
}
