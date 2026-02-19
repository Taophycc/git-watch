import { GoogleGenerativeAI } from "@google/generative-ai";
import { query } from "../db/connection";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// --- Function to Fetch and sort All GitHub events ---
const fetchProjectData = async (interval: string) => {
  const sql = `
    SELECT event_type, payload 
    FROM github_events 
    WHERE event_type IN ('push', 'issues', 'pull_request', 'star', 'watch') 
    AND created_at > NOW() - INTERVAL '${interval}'
    ORDER BY created_at ASC
  `;

  const result = await query(sql);

  const commits: string[] = [];
  const issues: string[] = [];
  const prs: string[] = [];
  // For stars and watches
  const engagement: string[] = [];

  result.rows.forEach((row: any) => {
    const { event_type, payload } = row;

    if (event_type === "push" && payload.commits) {
      payload.commits.forEach((commit: any) => {
        commits.push(
          `- ${commit.message} (by ${commit.author?.name || "unknown"})`,
        );
      });
    } else if (event_type === "issues" && payload.issue) {
      issues.push(
        `- [${payload.action}] Issue #${payload.issue.number}: ${payload.issue.title}`,
      );
    } else if (event_type === "pull_request" && payload.pull_request) {
      prs.push(
        `- [${payload.action}] PR #${payload.pull_request.number}: ${payload.pull_request.title}`,
      );
    } else if (event_type === "star") {
      const action = payload.action === "created" ? "Starred" : "Unstarred";
      engagement.push(`- ${action} by ${payload.sender?.login}`);
    } else if (event_type === "watch") {
      engagement.push(`- Watched by ${payload.sender?.login}`);
    }
  });

  return { commits, issues, prs, engagement };
};

// --- 1. THE MANAGER (Summary) ---
export const generateWeeklyChangelog = async () => {
  console.log("🤖 AI Service: Generating Full Project Summary...");

  try {
    const { commits, issues, prs, engagement } =
      await fetchProjectData("3 months");

    if (
      commits.length === 0 &&
      issues.length === 0 &&
      prs.length === 0 &&
      engagement.length === 0
    ) {
      console.log("📭 No project activity found this week.");
      return null;
    }

    const prompt = `
      You are an enthusiastic Tech Lead. 
      
      Here is the engineering work from this week:
      Commits: ${commits.length > 0 ? commits.join("\n") : "None."}
      Issues: ${issues.length > 0 ? issues.join("\n") : "None."}
      Pull Requests: ${prs.length > 0 ? prs.join("\n") : "None."}
      
      Here is the community engagement for the week:
      ${engagement.length > 0 ? engagement.join("\n") : "No new stars or watchers."}
      
      Write a professional but fun "Weekly Changelog" for the team. 
      Group into: ✨ Features, 🐛 Fixes, 📋 Project Updates.
      If there are new stars or watchers, include a 🎉 Community shoutout section!
      Keep it under 200 words.
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
  console.log("🕵️ AI Service: Starting Full Project Audit...");

  try {
    const { commits, issues, prs } = await fetchProjectData("7 days");

    if (commits.length === 0 && issues.length === 0 && prs.length === 0)
      return null;

    const prompt = `
      You are a Strict Senior Staff Engineer auditing a developer's weekly workflow.
      
      Here are their Commits:
      ${commits.length > 0 ? commits.join("\n") : "No commits."}
      
      Here are their Issues:
      ${issues.length > 0 ? issues.join("\n") : "No issues."}
      
      Here are their Pull Requests:
      ${prs.length > 0 ? prs.join("\n") : "No PRs."}
      
      Review their workflow and identify:
      1. 🚩 **Red Flags (Code):** Vague commit/PR messages, rapid hotfixes, or bad version control habits.
      2. 📋 **Project Management:** Are they writing clear issue titles? Are they opening PRs blindly?
      3. 🏆 **Kudos:** Praise specific complex engineering work or excellent planning.
      
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
