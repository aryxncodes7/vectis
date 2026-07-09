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

export async function generateContentWithRetry(client: any, options: any, maxRetries = 2) {
  let attempts = 0;
  while (attempts <= maxRetries) {
    try {
      return await client.models.generateContent(options);
    } catch (error: any) {
      const errString = error?.message || String(error);
      const isUnavailable = error?.status === 503 || errString.includes("503") || errString.includes("UNAVAILABLE");
      
      if (isUnavailable && attempts < maxRetries) {
        attempts++;
        const delayMs = attempts === 1 ? 1500 : 3000;
        console.warn(`Gemini API 503 UNAVAILABLE. Retrying attempt ${attempts}/${maxRetries} in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        throw error;
      }
    }
  }
}
