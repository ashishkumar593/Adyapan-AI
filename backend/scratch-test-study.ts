import { masterPrisma } from "./src/utils/prisma";
import jwt from "jsonwebtoken";
import { env } from "./src/config/env";

async function testProductionAnalyze() {
  // Get a real user token
  const user = await masterPrisma.user.findFirst({ where: { email: "ashish@adyapan.ai" } });
  if (!user) {
    console.error("User not found!");
    return;
  }
  const token = jwt.sign({ userId: user.id }, env.jwtSecret, { algorithm: "HS256" });

  const docText = `ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING UNIT-I Introduction: AI problems, Agents and Environments, Structure of Agents, Problem Solving Agents Basic Search Strategies: Problem Spaces, Uninformed Search (Breadth-First, Depth-First Search), Heuristic Search (Hill Climbing, A*). UNIT-II Advanced Search: Constructing Search Trees, Stochastic Search, AO* Search Implementation, Minimax Search, Alpha-Beta Pruning. Basic Knowledge Representation: Propositional Logic, First-Order Logic, Forward and Backward Chaining. UNIT-III Machine Learning: Introduction, Supervised and Unsupervised Learning, Reinforcement Learning. Data Preparation, training versus testing. UNIT-IV Supervised Learning: Regression (Linear, Polynomial, Logistic), Support Vector Machines, Naive Bayes classification. UNIT-V Unsupervised Learning: K-means clustering, hierarchical clustering, k-d trees. Reinforcement learning example: Getting Lost.`;

  console.log("Testing /api/study/analyze endpoint on Railway...");
  const RAILWAY_URL = "https://adyapan-ai-backend.up.railway.app";
  
  try {
    const res = await fetch(`${RAILWAY_URL}/api/study/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ documentText: docText }),
    });
    console.log("Status:", res.status);
    const data = await res.json() as any;
    if (res.ok) {
      console.log("SUCCESS! Title:", data.analysis?.title);
      console.log("Topics:", data.analysis?.topics?.map((t: any) => t.name));
    } else {
      console.error("FAILED:", JSON.stringify(data, null, 2));
    }
  } catch (err: any) {
    console.error("Fetch error:", err.message);
  }

  // Also test local endpoint
  console.log("\n\nTesting /api/study/analyze endpoint on localhost...");
  try {
    const res = await fetch(`http://localhost:5000/api/study/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ documentText: docText }),
    });
    console.log("Status:", res.status);
    const data = await res.json() as any;
    if (res.ok) {
      console.log("SUCCESS! Title:", data.analysis?.title);
      console.log("Topics found:", data.analysis?.topics?.length);
      console.log("Topics:", data.analysis?.topics?.map((t: any) => t.name));
      const firstTopic = data.analysis?.topics?.[0];
      if (firstTopic) {
        console.log("\nFirst topic details:");
        console.log("  Name:", firstTopic.name);
        console.log("  Overview length:", firstTopic.overview?.length || 0);
        console.log("  Subtopics:", firstTopic.subtopics?.length || 0);
        console.log("  KeyConcepts:", firstTopic.keyConcepts?.length || 0);
      }
    } else {
      console.error("FAILED:", JSON.stringify(data, null, 2));
    }
  } catch (err: any) {
    console.error("Fetch error:", err.message);
  }
}

testProductionAnalyze().finally(() => process.exit(0));
