import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getGeminiClient } from "./_utils/gemini.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only accept GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const client = getGeminiClient();

  // Honest Fallback State: Since serverless environments are isolated per invocation,
  // we cannot reliably return lastCallStatus. We verify the presence of the key.
  const mode = client ? "LIVE_CORE" : "UNCONFIGURED";

  res.json({
    status: "healthy",
    mode: mode,
    timestamp: new Date().toISOString(),
    systemCaveat: "Serverless isolated instance. 'LIVE_CORE' reflects key presence. Runtime degradations will bubble as 503 errors on execution.",
  });
}
