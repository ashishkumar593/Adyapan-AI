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

// ============================================================================
// LEARNING HUB AI SERVICES
// ============================================================================

/**
 * 10. Study Assistant Chat Response
 */
export async function generateStudyResponse(
  context: string,
  query: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `
    You are an expert academic tutor. Provide a clear, educational, and helpful response to the student's query.
    Context from uploaded documents:
    """
    ${context}
    """
    
    Student's Query: ${query}
    
    Answer clearly using markdown. If the query asks to explain a concept or formula, break it down simply.
  `;
  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Error in generateStudyResponse:", error);
    return "I am currently unable to process your query due to a system error. Please try again later.";
  }
}

/**
 * 11. Notes Generator
 */
export async function generateNotes(
  topic: string,
  difficulty: string,
  type: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  const prompt = `
    Generate comprehensive study notes on the topic: "${topic}".
    Target difficulty level: ${difficulty}
    Format style: ${type} (e.g., detailed, short, revision, formula, exam)
    
    Guidelines:
    - Use clear headings, bullet points, and markdown styling.
    - Highlight key definitions or formulas.
    - Structure logically from basics to advanced.
    - Return ONLY valid markdown text.
  `;
  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Error in generateNotes:", error);
    return "# Notes Generation Failed\nPlease try again.";
  }
}

/**
 * 12. Quiz Generator
 */
export interface QuizGenerationResult {
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  }>;
  flashcards: Array<{
    front: string;
    back: string;
  }>;
}

export async function generateQuiz(
  topic: string,
  count: number,
  difficulty: string
): Promise<QuizGenerationResult> {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });
  const prompt = `
    Generate an educational quiz and study flashcards for the topic: "${topic}".
    Difficulty: ${difficulty}
    Number of questions: ${count}
    
    Output a JSON object containing:
    1. "questions": An array of ${count} objects, each with "question", "options" (array of 4 strings), "correctAnswer" (must match one of the options), and "explanation".
    2. "flashcards": An array of ${Math.ceil(count / 2)} objects, each with "front" (a key term or concept) and "back" (the definition).
  `;
  const fallback: QuizGenerationResult = { questions: [], flashcards: [] };
  try {
    const result = await model.generateContent(prompt);
    return parseGeminiJson<QuizGenerationResult>(result.response.text(), fallback);
  } catch (error) {
    console.error("Error in generateQuiz:", error);
    return fallback;
  }
}

/**
 * 13. Assignment Generator
 */
export interface AssignmentResult {
  introduction: string;
  body: string;
  conclusion: string;
  references: string[];
}

export async function generateAssignment(
  topic: string,
  level: string,
  wordCount: number
): Promise<AssignmentResult> {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    generationConfig: { responseMimeType: "application/json" },
  });
  const prompt = `
    Write an academic assignment on the topic: "${topic}".
    Academic Level: ${level}
    Target Word Count: ${wordCount}
    
    Output a JSON object containing:
    1. "introduction": The introductory text using markdown.
    2. "body": The main body content using markdown headings and paragraphs.
    3. "conclusion": The concluding text using markdown.
    4. "references": An array of 3-5 APA format reference strings.
  `;
  const fallback: AssignmentResult = { introduction: "", body: "", conclusion: "", references: [] };
  try {
    const result = await model.generateContent(prompt);
    return parseGeminiJson<AssignmentResult>(result.response.text(), fallback);
  } catch (error) {
    console.error("Error in generateAssignment:", error);
    return fallback;
  }
}

/**
 * 14. PPT Generator
 */
export interface PptSlide {
  title: string;
  bullets: string[];
  notes: string;
}

export async function generatePPTContent(
  topic: string,
  slideCount: number
): Promise<PptSlide[]> {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });
  const prompt = `
    Create a presentation structure on the topic: "${topic}".
    Number of slides: ${slideCount}
    
    Output a JSON array of objects. Each object must contain:
    1. "title": The slide title.
    2. "bullets": An array of 3-5 string bullet points.
    3. "notes": Speaker notes for the slide.
  `;
  try {
    const result = await model.generateContent(prompt);
    return parseGeminiJson<PptSlide[]>(result.response.text(), []);
  } catch (error) {
    console.error("Error in generatePPTContent:", error);
    return [];
  }
}

/**
 * 15. Mind Map Generator (React Flow Schema)
 */
export interface MindMapResult {
  nodes: Array<{ id: string; type: string; data: { label: string }; position: { x: number; y: number } }>;
  edges: Array<{ id: string; source: string; target: string }>;
}

export async function generateMindMapSchema(topic: string): Promise<MindMapResult> {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });
  const prompt = `
    Create a mind map structure for the topic: "${topic}".
    
    Output a JSON object containing:
    1. "nodes": An array of objects for React Flow. Each must have "id" (string), "type" ("default"), "data" ({ "label": string }), and "position" ({ "x": number, "y": number }). The root node should be at x: 250, y: 50. Distribute child nodes cleanly.
    2. "edges": An array of objects to connect nodes. Each must have "id" (string), "source" (node id), and "target" (node id).
  `;
  const fallback: MindMapResult = { nodes: [], edges: [] };
  try {
    const result = await model.generateContent(prompt);
    return parseGeminiJson<MindMapResult>(result.response.text(), fallback);
  } catch (error) {
    console.error("Error in generateMindMapSchema:", error);
    return fallback;
  }
}

/**
 * 16. Enhance Project Description
 */
export async function enhanceProjectDescription(
  projectName: string,
  techStack: string,
  description: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `
    You are an expert technical resume reviewer. 
    Optimize the description for the project: "${projectName}" built using "${techStack}".
    Raw Description: "${description}"

    Rewrite this description to be extremely professional, action-oriented, and highlight impact/metrics if possible.
    Use strong bullet points (limit to 2-3 points). Do not write introduction or outro, just return the optimized description.
  `;
  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Error in enhanceProjectDescription:", error);
    return description;
  }
}

/**
 * 17. Enhance Experience Bullet-points
 */
export async function enhanceExperienceDescription(
  role: string,
  company: string,
  description: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `
    You are an expert recruiter. 
    Optimize the job description for the role: "${role}" at "${company}".
    Raw Job Description: "${description}"

    Rewrite this description using the STAR method (Situation, Task, Action, Result). Focus on achievements, technical contributions, and metrics.
    Output 3-4 professional bullet points starting with strong action verbs (e.g. Architected, Orchestrated, Optimized).
    Return ONLY the bullet points, nothing else.
  `;
  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Error in enhanceExperienceDescription:", error);
    return description;
  }
}

/**
 * 18. Optimize Entire Resume for Target Company
 */
export async function optimizeResumeContent(
  resumeJson: any,
  targetCompany: string
): Promise<any> {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  const companyValues: Record<string, string> = {
    Google: "Innovation, technical complexity, algorithmic optimization, scalable design, Googley leadership.",
    Amazon: "Ownership, customer obsession, Bias for Action, frugality, Leadership Principles.",
    Microsoft: "Engineering excellence, collaborative alignment, security, cloud scale, accessibility.",
    Meta: "Scale, rapid iteration, impact, Move Fast, focus on business value, system performance.",
    Apple: "Detail orientation, premium quality, design integration, hardware-software synergy.",
    Startup: "Versatility, high impact, end-to-end execution, rapid MVP creation, speed.",
  };

  const values = companyValues[targetCompany] || "General professional excellence.";

  const prompt = `
    You are an elite career coach. Optimize the following resume data to stand out at "${targetCompany}".
    The key characteristics and leadership values highly prized at ${targetCompany} are:
    "${values}"

    Carefully review and refine the professional summary, experience bullet points, project details, and skills in the resume JSON.
    Align the wording, technologies, and achievements to emphasize alignment with those values.

    Input Resume JSON:
    ${JSON.stringify(resumeJson)}

    You MUST output a valid JSON object matching the input schema:
    {
      "personalInfo": { "fullName": "", "email": "", "phone": "", "linkedin": "", "github": "", "portfolio": "", "location": "", "summary": "" },
      "summary": "Optimized professional summary",
      "education": [ { "institution": "", "degree": "", "fieldOfStudy": "", "startDate": "", "endDate": "", "grade": "" } ],
      "experience": [ { "company": "", "role": "", "startDate": "", "endDate": "", "description": "optimized description" } ],
      "projects": [ { "name": "", "techStack": "", "description": "optimized description" } ],
      "skills": ["optimized", "skills", "list"],
      "certifications": [ { "name": "", "issuer": "", "date": "" } ],
      "achievements": ["achievement 1", "achievement 2"],
      "languages": ["language 1", "language 2"]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    return parseGeminiJson<any>(result.response.text(), resumeJson);
  } catch (error) {
    console.error("Error in optimizeResumeContent:", error);
    return resumeJson;
  }
}

