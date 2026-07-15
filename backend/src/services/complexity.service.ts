import { prisma as masterPrisma } from "../config/prisma";
import { generateJSON, MODELS } from "../lib/ai/openrouter";

export interface ComplexityAnalysisOutput {
  time_complexity: string;
  space_complexity: string;
  best_possible_time: string;
  best_possible_space: string;
  optimization_score: number;
  efficiency_score: number;
  analysis: string;
  complexity_breakdown: Array<{
    code_segment: string;
    explanation: string;
    complexity: string;
  }>;
  suggestions: Array<{
    current_approach: string;
    current_complexity: string;
    suggested_approach: string;
    suggested_complexity: string;
    explanation: string;
  }>;
  scalability_analysis: Array<{
    input_size: number;
    expected_runtime: string;
    expected_memory: string;
  }>;
  data_structure_analysis: {
    evaluated: Array<{
      name: string;
      status: "Used" | "Recommended" | "Not Needed" | "Inefficient";
      feedback: string;
    }>;
  };
  interview_analysis: {
    interview_rating: number;
    accepted_in_interview: boolean;
    feedback: string;
    follow_up_questions: string[];
  };
  algorithm_pattern: {
    detected_pattern: string;
    pattern_used: string;
    pattern_missing: string;
    alternative_pattern: string;
    recommended_next_topic: string;
  };
}

export class ComplexityService {
  static async generateAnalysis(
    userPrisma: any,
    userId: string,
    questionId: string,
    code: string,
    language: string
  ): Promise<ComplexityAnalysisOutput> {
    // 1. Fetch the question details
    const question = await masterPrisma.codingQuestion.findUnique({
      where: { id: questionId }
    });

    if (!question) {
      throw new Error(`Coding question with ID ${questionId} not found.`);
    }

    // 2. Fetch the last execution history of the user for context
    const lastExecution = await userPrisma.codeExecution.findFirst({
      where: { userId, questionId },
      orderBy: { createdAt: "desc" }
    });

    // 3. Fetch the last review for additional context
    const lastReview = await userPrisma.codeReview.findFirst({
      where: { userId, questionId },
      orderBy: { generatedAt: "desc" }
    });

    // 4. Define fallback structure for safety
    const fallback: ComplexityAnalysisOutput = {
      time_complexity: "O(n²)",
      space_complexity: "O(1)",
      best_possible_time: "O(n)",
      best_possible_space: "O(n)",
      optimization_score: 50,
      efficiency_score: 50,
      analysis: "We detected nested loops in the solution which results in quadratic time growth. Consider using a hash map to reduce complexity.",
      complexity_breakdown: [
        {
          code_segment: "nested iteration block",
          explanation: "Nested loop iterates through inputs repeatedly",
          complexity: "O(n²)"
        }
      ],
      suggestions: [
        {
          current_approach: "Brute Force",
          current_complexity: "O(n²)",
          suggested_approach: "Hashing",
          suggested_complexity: "O(n)",
          explanation: "Using a hash map allows single-pass element lookup."
        }
      ],
      scalability_analysis: [
        { input_size: 100, expected_runtime: "0.01ms", expected_memory: "0.1MB" },
        { input_size: 1000, expected_runtime: "1.00ms", expected_memory: "0.1MB" },
        { input_size: 10000, expected_runtime: "100.00ms", expected_memory: "0.2MB" },
        { input_size: 100000, expected_runtime: "10.00s", expected_memory: "1.2MB" },
        { input_size: 1000000, expected_runtime: "16.67m", expected_memory: "11.2MB" }
      ],
      data_structure_analysis: {
        evaluated: [
          {
            name: "Array",
            status: "Used",
            feedback: "Simple traversal is correct but slow."
          },
          {
            name: "HashMap",
            status: "Recommended",
            feedback: "Use HashMap to reduce lookup time from O(n) to O(1)."
          }
        ]
      },
      interview_analysis: {
        interview_rating: 60,
        accepted_in_interview: false,
        feedback: "Your solution passes the initial test cases, but most FAANG interviewers would reject it due to O(n²) time complexity. Optimizing to linear time is expected.",
        follow_up_questions: [
          "Can you optimize this solution to run in linear time?",
          "How would you handle duplicate elements in the input?"
        ]
      },
      algorithm_pattern: {
        detected_pattern: "Brute Force",
        pattern_used: "None",
        pattern_missing: "Hashing",
        alternative_pattern: "Two Pointers",
        recommended_next_topic: "Learn Sliding Window"
      }
    };

    // 5. Build context descriptions
    let executionContext = "No code executions found yet.";
    if (lastExecution) {
      executionContext = `
Execution Status: ${lastExecution.status}
Execution Time: ${lastExecution.executionTime}s
STDOUT: ${lastExecution.stdout || "(empty)"}
STDERR/Compilation Logs: ${lastExecution.stderr || "(empty)"}
`;
    }

    let reviewContext = "No prior code reviews found.";
    if (lastReview && lastReview.reviewJson) {
      try {
        const parsed = typeof lastReview.reviewJson === "string" 
          ? JSON.parse(lastReview.reviewJson) 
          : lastReview.reviewJson;
        reviewContext = `
Previous Code Review Strengths: ${JSON.stringify(parsed.strengths || [])}
Previous Code Review Issues: ${JSON.stringify(parsed.issues || [])}
Previous Code Review Optimizations Suggested: ${JSON.stringify(parsed.optimizations || [])}
`;
      } catch (e) {
        // Safe fallback
      }
    }

    const systemPrompt = `You are a Senior Algorithms Engineer, FAANG Technical Interviewer, and Competitive Programming Coach.
Analyze the provided code, language, and problem statement to determine the time and space complexity.
Teach the student. Do not only provide complexity values. Explain the reasoning and provide educational feedback.

You MUST respond with valid JSON matching this schema:
{
  "time_complexity": "O(...) for current solution",
  "space_complexity": "O(...) for current solution",
  "best_possible_time": "O(...) representing optimal time complexity",
  "best_possible_space": "O(...) representing optimal space complexity",
  "optimization_score": 85, // integer 0-100 evaluating the optimization gap (100 if optimal)
  "efficiency_score": 85, // integer 0-100 based on time complexity, space complexity, scalability, algorithm choice, and data structure choice
  "analysis": "Detailed description explaining the complexity of the current solution, where the complexity originates, and why it is efficient/inefficient.",
  "complexity_breakdown": [
    {
      "code_segment": "exact code lines, e.g., nested for loops",
      "explanation": "why this line/block creates the complexity",
      "complexity": "O(n^2)"
    }
  ],
  "suggestions": [
    {
      "current_approach": "e.g., Nested Loop",
      "current_complexity": "e.g., O(n^2)",
      "suggested_approach": "e.g., HashMap / Hashing",
      "suggested_complexity": "e.g., O(n)",
      "explanation": "HashMap would reduce lookup time from O(n) to O(1)."
    }
  ],
  "scalability_analysis": [
    {
      "input_size": 100,
      "expected_runtime": "estimated runtime, e.g. 0.01ms",
      "expected_memory": "estimated memory, e.g. 0.1MB"
    },
    { "input_size": 1000, "expected_runtime": "...", "expected_memory": "..." },
    { "input_size": 10000, "expected_runtime": "...", "expected_memory": "..." },
    { "input_size": 100000, "expected_runtime": "...", "expected_memory": "..." },
    { "input_size": 1000000, "expected_runtime": "...", "expected_memory": "..." }
  ],
  "data_structure_analysis": {
    "evaluated": [
      {
        "name": "e.g. HashMap",
        "status": "Used | Recommended | Not Needed | Inefficient",
        "feedback": "e.g. Using a HashMap is recommended here to achieve O(n) time."
      }
    ]
  },
  "interview_analysis": {
    "interview_rating": 85, // integer 0-100 representing readiness
    "accepted_in_interview": true, // boolean
    "feedback": "FAANG style feedback. Focus on what most interviewers would expect.",
    "follow_up_questions": [
      "list of follow up questions they might ask during the interview"
    ]
  },
  "algorithm_pattern": {
    "detected_pattern": "detected algorithm pattern, e.g. Sliding Window, Two Pointers, DP, Greedy, Graph Traversal, Backtracking, Binary Search, Recursion, Hashing, etc.",
    "pattern_used": "e.g., Two Pointers",
    "pattern_missing": "e.g., Hashing",
    "alternative_pattern": "e.g., Sliding Window",
    "recommended_next_topic": "e.g., Learn Sliding Window"
  }
}
`;

    const userPrompt = `
Problem Details:
Title: ${question.title}
Topic: ${question.topic}
Difficulty: ${question.difficulty}
Tags: ${JSON.stringify(question.tagsJson)}

Student Code (${language}):
\`\`\`${language}
${code}
\`\`\`

Last Code Execution Details:
${executionContext}

Code Review context:
${reviewContext}

Please analyze this solution, calculate the complexities, and generate the final complexity analysis in the requested JSON format.
`;

    try {
      const generated = await generateJSON<ComplexityAnalysisOutput>(
        systemPrompt,
        userPrompt,
        { model: MODELS.CODE, temperature: 0.6, maxTokens: 4000 },
        fallback
      );

      // Clean up score bounds and ensure values match expectations
      if (generated.optimization_score !== undefined) {
        generated.optimization_score = Math.max(0, Math.min(100, Math.round(Number(generated.optimization_score) || 50)));
      }
      if (generated.efficiency_score !== undefined) {
        generated.efficiency_score = Math.max(0, Math.min(100, Math.round(Number(generated.efficiency_score) || 50)));
      }

      return generated;
    } catch (err: any) {
      console.error("[ComplexityService] Error generating complexity analysis:", err.message || err);
      return fallback;
    }
  }
}
