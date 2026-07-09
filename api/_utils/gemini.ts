import { GoogleGenAI } from "@google/genai";

let aiClient: any = null;

export function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      console.warn("No valid GEMINI_API_KEY found. Engine degrading to Simulator Fallback Mode.");
      return null;
    }
    try {
      aiClient = new GoogleGenAI({ apiKey });
    } catch (error) {
      console.error("Failed to initialize GoogleGenAI client:", error);
      return null;
    }
  }
  return aiClient;
}
