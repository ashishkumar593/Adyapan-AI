import { generateJSON, MODELS } from "./openrouter";

const DSA_SYSTEM = "You are an expert Competitive Programmer mentoring a student in Data Structures and Algorithms.";

export async function generateDsaHint(problemContext: string, currentCode: string) {
  return generateJSON(
    DSA_SYSTEM,
    `The student is stuck on a DSA problem and needs a hint.

Problem:
${problemContext}

Student's Current Code:
${currentCode}

DO NOT give the full solution. Provide 2 progressively helpful hints and a high-level approach.

Return JSON matching:
{
  "hint1": "A subtle hint to point them in the right direction",
  "hint2": "A more direct hint if still stuck",
  "approach": "High-level optimal algorithm explanation (no code)"
}`,
    { model: MODELS.BALANCED },
    {
      hint1: "Error generating hint 1",
      hint2: "Error generating hint 2",
      approach: "Error generating approach",
    }
  );
}

export async function reviewDsaSolution(problemContext: string, code: string) {
  return generateJSON(
    DSA_SYSTEM,
    `Review this DSA solution submission.

Problem:
${problemContext}

Submitted Code:
${code}

Analyze for correctness, time complexity, and space complexity.

Return JSON matching:
{
  "timeComplexity": "e.g., O(n log n) with explanation",
  "spaceComplexity": "e.g., O(n) with explanation",
  "optimizationTips": ["Tip 1", "Tip 2", "Tip 3"]
}`,
    { model: MODELS.BALANCED },
    {
      timeComplexity: "Unknown",
      spaceComplexity: "Unknown",
      optimizationTips: [],
    }
  );
}
