import "dotenv/config";
import { generateJSON } from "./src/lib/ai/openrouter";

async function test() {
  console.log("Gemini key:", process.env.GEMINI_API_KEY ? "SET" : "MISSING");
  console.log("Groq key:", process.env.GROQ_API_KEY ? "SET" : "MISSING");
  console.log("OpenRouter key:", process.env.OPENROUTER_API_KEY ? "SET" : "MISSING");
  
  const result = await generateJSON(
    "You are a resume parser. Extract structured data.",
    "Name: John Doe\nEmail: john@test.com\nPhone: 555-1234\nSkills: JavaScript, Python, React\nExperience: 3 years at Google as Software Engineer",
    { model: "google/gemini-2.5-flash" },
    { name: "", email: "", phone: "", skills: [], experience: [] }
  );
  console.log("RESULT:", JSON.stringify(result, null, 2));
}

test().catch(e => console.error("ERROR:", e.message));
