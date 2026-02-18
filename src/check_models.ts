import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const testModels = async () => {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log(
    "🔑 Using API Key:",
    apiKey ? apiKey.slice(0, 8) + "..." : "UNDEFINED",
  );
  if (!apiKey) {
    console.error("❌ No API Key found.");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const candidates = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-1.0-pro",
    "gemini-2.0-flash",
  ];

  console.log("🚀 Testing models to see which one works for you...\n");

  for (const modelName of candidates) {
    try {
      process.stdout.write(`Testing "${modelName}"... `);
      const model = genAI.getGenerativeModel({ model: modelName });

      await model.generateContent("Hi");

      console.log("✅ SUCCESS");
      console.log(`\n UPDATE YOUR CODE TO USE: "${modelName}"\n`);
      return;
    } catch (err: any) {
      if (err.message.includes("404") || err.message.includes("not found")) {
        console.log("❌ Not Found");
      } else {
        console.log(`❌ Error: ${err.message.split("[")[0]}`);
      }
    }
  }

  console.log(
    "\n No models worked. Check your API Key or Google Cloud project settings.",
  );
};

testModels();
