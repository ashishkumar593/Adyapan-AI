import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../../config/env";

const genAI = new GoogleGenerativeAI(env.geminiApiKey);

// Helper to clean and parse JSON response from Gemini
function parseGeminiJson<T>(text: string, defaultValue: T): T {
  try {
    // Strip markdown code block formatting if present
    const cleaned = text
      .replace(/^```json\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();
    return JSON.parse(cleaned) as T;
  } catch (error) {
    console.error("Failed to parse Gemini JSON:", text, error);
    return defaultValue;
  }
}

/**
 * 1. Generate Resume Summary
 */
export async function generateResumeSummary(
  personalInfo: any,
  education: any,
  experience: any,
  skills: any
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `
    You are an expert resume writer. Generate a professional and compelling resume summary (3-4 sentences, about 50-80 words) based on the following candidate details:
    
    Personal Info: ${JSON.stringify(personalInfo)}
    Education: ${JSON.stringify(education)}
    Experience: ${JSON.stringify(experience)}
    Skills: ${JSON.stringify(skills)}
    
    Focus on key achievements, years of experience (if applicable), and core competencies. Write in a confident, professional, third-person tone (without using pronouns like "I" or "my").
    Return ONLY the summary text, nothing else.
  `;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Error in generateResumeSummary:", error);
    return "Results-driven professional with a proven track record of academic and practical excellence, seeking to leverage skills in technology and problem-solving to contribute to organizational success.";
  }
}

/**
 * 2. Generate Project Descriptions
 */
export async function generateProjectDescription(
  title: string,
  techStack: string,
  role: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `
    Generate 3 professional, action-oriented bullet points describing a project for a resume.
    Project Title: ${title}
    Technologies Used: ${techStack}
    Role: ${role}
    
    Guidelines:
    - Use the XYZ formula (Accomplished [X] as measured by [Y], by doing [Z]) where possible.
    - Start each bullet point with a strong action verb (e.g., Developed, Designed, Architected, Optimized).
    - Focus on measurable outcomes, technical challenges solved, and performance improvements.
    - Return the bullet points separated by newlines, with NO bullet symbols or numbers (just the plain text on each line).
  `;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Error in generateProjectDescription:", error);
    return `Designed and built ${title} utilizing ${techStack} to solve core system requirements.\nOptimized backend performance and frontend usability for enhanced scalability.\nCollaborated with developers to integrate data endpoints and ensure seamless deployment.`;
  }
}

/**
 * 3. Generate Experience Bullet Points
 */
export async function generateExperienceBulletPoints(
  role: string,
  company: string,
  description: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `
    You are a professional CV optimizer. Enhance the experience bullet points for this work history item:
    Role: ${role}
    Company: ${company}
    Draft Description/Context: ${description}
    
    Generate 3 highly professional, impactful, and result-oriented bullet points.
    - Start each with a strong action verb.
    - Quantify achievements where possible.
    - Align the text with modern industry standards.
    - Return the bullet points separated by newlines, with NO bullet symbols or numbers (just the plain text on each line).
  `;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Error in generateExperienceBulletPoints:", error);
    return `Spearheaded software development initiatives as a ${role} at ${company}, improving deployment velocity.\nArchitected scalable database architectures and clean REST APIs to serve client applications.\nDebugged critical production bugs, reducing latency and boosting customer satisfaction rates.`;
  }
}

/**
 * 4. Generate Skills Recommendations
 */
export async function generateSkillsRecommendations(existingSkills: string[]): Promise<string[]> {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });
  const prompt = `
    Based on the following list of skills currently possessed by a candidate, recommend 5 additional highly relevant skills, technologies, or concepts they should learn or add to their resume.
    Existing Skills: ${existingSkills.join(", ")}
    
    Return a JSON array containing exactly 5 string values. Example: ["React", "TypeScript", "Docker", "AWS", "CI/CD"]
  `;

  try {
    const result = await model.generateContent(prompt);
    return parseGeminiJson<string[]>(result.response.text(), []);
  } catch (error) {
    console.error("Error in generateSkillsRecommendations:", error);
    return [];
  }
}

/**
 * 5. Analyze Resume ATS Score
 */
interface ATSAnalysisResult {
  score: number;
  missingKeywords: string[];
  recommendations: string[];
  formattingIssues: string[];
  strengths: string[];
}

export async function analyzeResumeATS(
  resumeText: string,
  targetRole: string
): Promise<ATSAnalysisResult> {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });
  const prompt = `
    You are an Applicant Tracking System (ATS) auditor. Analyze the following resume text against the target role: "${targetRole}".
    
    Resume Text:
    """
    ${resumeText}
    """
    
    Perform a strict evaluation and output a JSON object containing:
    1. "score": An integer between 0 and 100 representing the ATS readiness and relevance.
    2. "missingKeywords": A JSON array of key technologies, skills, or industry terminology missing from the resume.
    3. "recommendations": A JSON array of specific improvements (e.g. "Include a clear GitHub link", "Quantify accomplishments in experience").
    4. "formattingIssues": A JSON array of formatting issues detected (e.g. "Complex tables might parse poorly", "Non-standard section headers").
    5. "strengths": A JSON array of elements done correctly.
    
    Ensure the JSON matches this structure exactly.
  `;

  const fallback: ATSAnalysisResult = {
    score: 60,
    missingKeywords: ["TypeScript", "Docker", "Unit Testing"],
    recommendations: ["Quantify achievements in experience section", "Structure section headers clearly"],
    formattingIssues: ["Verify font consistency", "Avoid headers/footers in templates"],
    strengths: ["Clean personal contact info", "Strong technical skills listed"],
  };

  try {
    const result = await model.generateContent(prompt);
    return parseGeminiJson<ATSAnalysisResult>(result.response.text(), fallback);
  } catch (error) {
    console.error("Error in analyzeResumeATS:", error);
    return fallback;
  }
}

/**
 * 6. Analyze Resume SWOT
 */
interface SWOTAnalysisResult {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export async function analyzeResumeSWOT(resumeText: string): Promise<SWOTAnalysisResult> {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });
  const prompt = `
    Perform a deep, critical review of the candidate's resume content. Detail the Strengths, Weaknesses/Gaps, and Recommendations for growth.
    
    Resume Text:
    """
    ${resumeText}
    """
    
    Output a JSON object containing:
    1. "strengths": A JSON array of 3-4 professional strengths.
    2. "weaknesses": A JSON array of 3-4 weaknesses or experience/skill gaps.
    3. "recommendations": A JSON array of 3-4 actionable recommendations to advance their profile.
  `;

  const fallback: SWOTAnalysisResult = {
    strengths: ["Clear project descriptions", "Relevant tech stack for modern development"],
    weaknesses: ["Lack of leadership or team collaboration metrics", "Certifications section is empty"],
    recommendations: ["Incorporate cloud platforms (AWS/GCP/Azure) skills", "Complete professional certifications"],
  };

  try {
    const result = await model.generateContent(prompt);
    return parseGeminiJson<SWOTAnalysisResult>(result.response.text(), fallback);
  } catch (error) {
    console.error("Error in analyzeResumeSWOT:", error);
    return fallback;
  }
}

/**
 * 7. Job Match Rate
 */
interface JobMatchResult {
  matchPercentage: number;
  feedback: string[];
  gapAnalysis: string[];
}

export async function analyzeJobMatch(
  resumeText: string,
  jobDescription: string
): Promise<JobMatchResult> {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });
  const prompt = `
    Compare the candidate's resume against the Job Description (JD). Compute a match percentage and suggest modifications to tailor the resume.
    
    Resume:
    """
    ${resumeText}
    """
    
    Job Description:
    """
    ${jobDescription}
    """
    
    Output a JSON object containing:
    1. "matchPercentage": An integer between 0 and 100.
    2. "feedback": A JSON array of feedback comments.
    3. "gapAnalysis": A JSON array of specific requirements in the JD that are not met in the resume.
  `;

  const fallback: JobMatchResult = {
    matchPercentage: 55,
    feedback: ["Align resume summary with target role keywords", "Highlight specific tech stack mentioned in the job description"],
    gapAnalysis: ["Missing explicit testing experience (Jest/PyTest)", "System Design experience is not highlighted"],
  };

  try {
    const result = await model.generateContent(prompt);
    return parseGeminiJson<JobMatchResult>(result.response.text(), fallback);
  } catch (error) {
    console.error("Error in analyzeJobMatch:", error);
    return fallback;
  }
}

/**
 * 8. Cover Letter Generator
 */
export async function generateCoverLetterText(
  companyName: string,
  role: string,
  jobDescription: string,
  tone: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `
    Write a highly tailored Cover Letter for a job application.
    Company Name: ${companyName}
    Target Role: ${role}
    Job Description: ${jobDescription}
    Tone: ${tone} (e.g. Professional, Formal, Confident, Friendly)
    
    Write the letter with:
    - An engaging introduction stating interest in the role and company.
    - A strong body paragraph highlighting relevant project achievements and matching skills.
    - A polite closing calling for an interview opportunity.
    
    Use a clean letter layout. Do not include template placeholders like [Insert Name Here] unless absolutely necessary; use natural placeholders or write a ready-to-use professional letter.
    Return ONLY the cover letter text, with no extra conversational preambles.
  `;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Error in generateCoverLetterText:", error);
    return `Dear Hiring Manager,\n\nI am writing to express my enthusiastic interest in the ${role} position at ${companyName}. With a strong background in software engineering and hands-on project experience, I am confident in my ability to deliver substantial value to your team.\n\nThank you for your time and consideration.\n\nSincerely,\n[Your Name]`;
  }
}

/**
 * 9. LinkedIn Optimizer
 */
interface LinkedInOptimizationResult {
  headline: string;
  aboutSection: string;
  skills: string[];
  recommendations: string[];
  score: number;
}

export async function optimizeLinkedInProfile(profileData: {
  headline: string;
  about: string;
  experience: string;
  skills: string;
  targetRole: string;
}): Promise<LinkedInOptimizationResult> {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });
  const prompt = `
    Analyze the current LinkedIn profile details and provide optimizations for a target role.
    
    Current Headline: ${profileData.headline}
    Current About Section: ${profileData.about}
    Current Experience Details: ${profileData.experience}
    Current Skills: ${profileData.skills}
    Target Role: ${profileData.targetRole}
    
    Output a JSON object containing:
    1. "headline": An optimized headline following industry best practices (e.g., "Role | Key Technology | Impact Statement").
    2. "aboutSection": A fully written, engaging "About" section summary (150-250 words) written in the first person, highlighting value proposition and core skills.
    3. "skills": A JSON array of 5 recommended skills to add to the profile.
    4. "recommendations": A JSON array of 3-4 suggestions (e.g. "Expand experience descriptions using bullet points", "Include links to projects").
    5. "score": An optimization score between 0 and 100.
  `;

  const fallback: LinkedInOptimizationResult = {
    headline: `${profileData.targetRole || "Software Engineer"} | TypeScript | React | Node.js | Building Scalable Solutions`,
    aboutSection: `Passionate engineer focused on crafting efficient and user-centered digital solutions. Experienced in developing applications using JavaScript, TypeScript, and modern web frameworks. Strong problem solver committed to continuous learning and technical innovation.`,
    skills: ["TypeScript", "System Design", "Cloud Infrastructure"],
    recommendations: ["Add media links to your experience cards", "Optimize your About section with target role keywords"],
    score: 70,
  };

  try {
    const result = await model.generateContent(prompt);
    return parseGeminiJson<LinkedInOptimizationResult>(result.response.text(), fallback);
  } catch (error) {
    console.error("Error in optimizeLinkedInProfile:", error);
    return fallback;
  }
}
