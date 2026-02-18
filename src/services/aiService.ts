import { GoogleGenerativeAI } from "@google/generative-ai";
import { query } from "../db/connection";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// --- 1. THE MANAGER (Summary) ---
export const generateWeeklyChangelog = async () => {
  console.log(" AI Service: Generating Weekly Summary...");

  const sql = `
    SELECT payload->'commits' as commits 
    FROM github_events 
    WHERE event_type = 'push' 
    AND created_at > NOW() - INTERVAL '3 months' 
    ORDER BY created_at ASC
  `;

  try {
    const result = await query(sql);
    const allCommits = result.rows.flatMap((row: any) => row.commits || []);

    if (allCommits.length === 0) {
      console.log("📭 No commits found this week.");
      return null;
    }

    const commitMessages = allCommits
      .map((commit: any) => `- ${commit.message} (by ${commit.author.name})`)
      .join("\n");

    console.log(`🔍 Analyzed ${allCommits.length} commits.`);

    const prompt = `
      You are a Senior Tech Lead. 
      Here is a list of commit messages from this week:
      ${commitMessages}
      
      Write a professional but fun "Weekly Changelog" for the team. 
      Group into: ✨ Features, 🐛 Fixes, 🔧 Chores.
      Use less emojis. Keep it under 200 words.
    `;

    const aiResult = await model.generateContent(prompt);
    const text = aiResult.response.text();

    console.log("✅ Summary Generated.");

    return text;
  } catch (error) {
    console.error("❌ Summary Generation Failed:", error);
    return null;
  }
};

// --- 2. THE AUDITOR (Code Review) ---
export const generateCodeAudit = async () => {
  console.log(" AI Service: Starting Code Audit...");

  const sql = `
    SELECT payload->'commits' as commits 
    FROM github_events 
    WHERE event_type = 'push' 
    AND created_at > NOW() - INTERVAL '3 months'
  `;

  try {
    const result = await query(sql);
    const allCommits = result.rows.flatMap((row: any) => row.commits || []);

    if (allCommits.length === 0) return null;

    const prompt = `
      You are a Strict Senior Staff Engineer.
      Review these commit messages:
      ${JSON.stringify(allCommits)}
      
      Identify:
      1. 🚩 **Red Flags:** Vague messages (e.g. "fix"), rapid hotfixes, or late-night commits.
      2. ♻️ **Refactor Targets:** Areas of the code that seem to be "churning" (edited repeatedly).
      3. 🏆 **Kudos:** Any specifically complex engineering work.
      
      Tone: Constructive but strict. Keep it short.
    `;

    const aiResult = await model.generateContent(prompt);
    const text = aiResult.response.text();

    console.log("✅ Audit Generated.");
    return text;
  } catch (error) {
    console.error("❌ Audit Failed:", error);
    return null;
  }
};
