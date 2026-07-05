import { generateJSON, MODELS } from "./openrouter";

const CODING_SYSTEM = "You are an expert Senior Software Engineer. Provide production-ready code solutions.";

export async function generateCode(prompt: string) {
  return generateJSON(
    CODING_SYSTEM,
    `Generate complete, production-ready code for: "${prompt}"

Return JSON matching:
{
  "setupGuide": "Step by step instructions to run this code (markdown)",
  "folderStructure": "Visual tree of folder structure (markdown)",
  "code": "Complete source code implementation (markdown with codeblocks)"
}`,
    { model: MODELS.CODE },
    {
      setupGuide: "An error occurred generating the setup guide.",
      folderStructure: "Error",
      code: "Error generating code.",
    }
  );
}

export async function debugCode(errorMsg: string, codeSnippet: string) {
  return generateJSON(
    CODING_SYSTEM,
    `Debug this code:

Error: ${errorMsg}

Code:
${codeSnippet}

Return JSON matching:
{
  "issue": "Short summary of the issue",
  "rootCause": "Detailed explanation of why the error occurred",
  "fixedCode": "Corrected code (markdown with codeblocks)"
}`,
    { model: MODELS.CODE },
    {
      issue: "Could not parse issue",
      rootCause: "Could not parse root cause",
      fixedCode: "Could not generate fixed code",
    }
  );
}

export async function explainCode(codeSnippet: string) {
  return generateJSON(
    CODING_SYSTEM,
    `Explain this code in detail:

Code:
${codeSnippet}

Return JSON matching:
{
  "explanation": "Detailed line-by-line explanation (markdown)",
  "complexity": "Time and Space complexity"
}`,
    { model: MODELS.CODE },
    {
      explanation: "Could not generate explanation.",
      complexity: "Unknown",
    }
  );
}

export async function generateProject(projectName: string) {
  return generateJSON(
    CODING_SYSTEM,
    `Design a comprehensive project plan for: "${projectName}"

Return JSON matching:
{
  "architecture": "High level system architecture (markdown)",
  "techStack": ["list", "of", "technologies"],
  "folderStructure": "Project structure tree (markdown)",
  "features": ["list", "of", "core", "features"],
  "roadmap": ["Step 1", "Step 2", "Step 3"]
}`,
    { model: MODELS.CODE },
    {
      architecture: "Error generating architecture",
      techStack: [],
      folderStructure: "Error",
      features: [],
      roadmap: [],
    }
  );
}
