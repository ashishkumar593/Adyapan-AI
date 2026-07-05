import Groq from "groq-sdk";
import { env } from "../../config/env";

const groq = new Groq({ apiKey: env.groqApiKey });

async function chat(prompt: string): Promise<string> {
  const res = await groq.chat.completions.create({
    model: "llama3-70b-8192",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });
  return res.choices[0]?.message?.content?.trim() ?? "";
}

async function chatJson<T>(prompt: string, fallback: T): Promise<T> {
  try {
    const res = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant. Always respond with valid JSON only, no markdown, no explanation.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
    });
    const text = res.choices[0]?.message?.content?.trim() ?? "";
    const cleaned = text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return fallback;
  }
}

export async function groqGenerateResumeSummary(
  personalInfo: object,
  education: object[],
  experience: object[],
  skills: string[]
): Promise<string> {
  const prompt = `Generate a professional resume summary (3-4 sentences, 50-80 words) for this candidate:
Personal: ${JSON.stringify(personalInfo)}
Education: ${JSON.stringify(education)}
Experience: ${JSON.stringify(experience)}
Skills: ${skills.join(", ")}
Return ONLY the summary text, nothing else.`;
  try {
    return await chat(prompt);
  } catch {
    return "Results-driven professional seeking to leverage technical skills and academic excellence to contribute to organizational success.";
  }
}

export async function groqEnhanceProjectDescription(
  name: string,
  techStack: string,
  description: string
): Promise<string> {
  const prompt = `Write 3 professional resume bullet points for this project.
Project: ${name}
Tech: ${techStack}
Context: ${description}
Use action verbs. Return 3 plain text lines separated by newlines, no bullets or numbers.`;
  try {
    return await chat(prompt);
  } catch {
    return `Built ${name} using ${techStack}.\nImplemented core features and optimized performance.\nDeployed and maintained production-ready solution.`;
  }
}

export async function groqEnhanceExperienceDescription(
  role: string,
  company: string,
  description: string
): Promise<string> {
  const prompt = `Write 3 professional resume bullet points for this work experience.
Role: ${role} at ${company}
Context: ${description}
Use action verbs. Return 3 plain text lines separated by newlines, no bullets or numbers.`;
  try {
    return await chat(prompt);
  } catch {
    return `Led key initiatives as ${role} at ${company}.\nCollaborated with cross-functional teams to deliver results.\nImproved processes and contributed to business growth.`;
  }
}

export async function groqOptimizeResumeContent(
  resumeJson: object,
  targetCompany: string
): Promise<object> {
  const prompt = `Optimize this resume JSON for a job at ${targetCompany}. 
Resume: ${JSON.stringify(resumeJson)}
Return the same JSON structure with improved summary, experience bullet points, and skills. Return ONLY valid JSON.`;
  try {
    return await chatJson(prompt, resumeJson);
  } catch {
    return resumeJson;
  }
}

export async function groqResumeAIChat(
  resumeData: object,
  message: string
): Promise<{ summary?: string; experience?: object[]; projects?: object[]; skills?: string[] }> {
  const prompt = `You are a resume assistant. The user has this resume:
${JSON.stringify(resumeData)}

User request: "${message}"

Update the relevant sections based on the request. Return a JSON object with only the fields that changed: summary, experience, projects, skills.`;
  return chatJson(prompt, {});
}
