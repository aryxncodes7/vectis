import { GoogleGenAI } from "@google/genai";

/**
 * Global singleton reference for the Google Gemini client.
 * Ensures the API key is read and instantiated only once per Vercel edge/node instance.
 */
let aiClient: any = null;

/**
 * Retrieves or instantiates the Google Gemini client.
 * Will warn and return null if the API key is missing or equal to the default fallback.
 * 
 * @returns {GoogleGenAI | null} The initialized client or null if in simulation fallback mode.
 */
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

/**
 * Robust wrapper around Gemini's generateContent that implements exponential backoff retries
 * for transient 503 UNAVAILABLE errors resulting from model demand spikes.
 * 
 * @param {any} client - The GoogleGenAI instantiated client.
 * @param {any} options - The generateContent configuration object (model, contents, schema, etc).
 * @param {number} maxRetries - The maximum number of retry attempts allowed.
 * @returns {Promise<any>} The generated content response from Google.
 * @throws {Error} Throws if the error is not a 503, or if maximum retries are exhausted.
 */
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
