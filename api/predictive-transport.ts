import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getGeminiClient, generateContentWithRetry } from "./_utils/gemini.js";
import { Type } from "@google/genai";

/**
 * Vercel Serverless Endpoint: Predictive Transport Dispatch
 * 
 * Aligns transit logistics with match-day reality. Analyzes live match scores 
 * and progression to predict egress bottlenecks and allocate eco-shuttles.
 * 
 * @param {VercelRequest} req - The incoming HTTP request. `req.body.matchState` and `req.body.transitGrid` are required.
 * @param {VercelResponse} res - The outgoing HTTP response containing the AI JSON output.
 * @returns {Promise<void>}
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { matchMinute, currentScore, extraTimePredicted, transitGridLoad } = req.body;

  if (typeof matchMinute !== "number" || typeof currentScore !== "string" || typeof extraTimePredicted !== "boolean") {
    return res.status(400).json({ error: "Invalid payload: matchMinute (number), currentScore (string), and extraTimePredicted (boolean) are required." });
  }

  const client = getGeminiClient();

  if (!client) {
    // Simulator mock data fallback
    const totalEcoFleet = Math.round(extraTimePredicted ? 80 : 50);
    const mockResponse = {
      matchTimelineStatus: extraTimePredicted ? "EXTRA_TIME_LOCKED" : "REGULAR_PLAY",
      egressPeakTimeUtc: extraTimePredicted ? "20:45 UTC (Delayed by 35m)" : "20:10 UTC",
      estimatedExitDurationMinutes: extraTimePredicted ? 50 : 35,
      exitGateConfiguration: [
        { gateId: "GATE_ALPHA_1", status: "OPEN_MAX", flowRateTargetPerMin: 350 },
        { gateId: "GATE_BRAVO_2", status: "OPEN_MAX", flowRateTargetPerMin: 350 },
        { gateId: "GATE_CHARLIE_3", status: "REGULAR", flowRateTargetPerMin: 180 },
        { gateId: "GATE_DELTA_4", status: "RECOVERY_ONLY", flowRateTargetPerMin: 100 },
      ],
      ecoShuttleDispatch: {
        fleetSizeToDeploy: totalEcoFleet,
        routeAAllocation: Math.round(totalEcoFleet * 0.4),
        routeBAllocation: Math.round(totalEcoFleet * 0.4),
        routeCAllocation: Math.round(totalEcoFleet * 0.2),
        co2SavedKgEst: Number((totalEcoFleet * 12.4).toFixed(1)),
        chargingInstructions: "Ensure all EV chargers at East depot are on peak discharge grid configuration.",
      },
      publicAddressSignageScript: extraTimePredicted
        ? "Match extended to extra-time. Eco-shuttles pre-allocation shifted to peak egress cycle: 20:45 UTC."
        : "Standard match duration. Eco-shuttle routes A and B fully deployed for fast transit hub transfer.",
    };
    return res.status(200).json({ mode: "SIMULATION_FALLBACK", data: mockResponse });
  }

  try {
    const prompt = `
      You are the background central optimization core "StadiumOps-Nexus" for FIFA World Cup 2026.
      Ingest live stadium match parameters and coordinate the predictive transportation dispatch to match physical egress.

      MATCH PROGRESS DATA:
      - Match Minute: ${matchMinute}
      - Current Score: ${currentScore}
      - Extra Time/Penalties Likely: ${extraTimePredicted ? "Yes (Locked/Highly Likely)" : "No"}
      - Local Transit Grid Load: ${transitGridLoad || "Normal"}

      Task:
      1. Calculate dynamic spectator exit duration.
      2. Configure exit gate status ("OPEN_MAX", "REGULAR", "RECOVERY_ONLY").
      3. Allocate eco-friendly electric shuttle fleet distribution dynamically across Route A (Metro link), Route B (Main Park & Ride), and Route C (Local Hotel Loop).
      4. Output standard PA/Signage scripts.
      Return purely JSON matching the schema.
    `;

    const response = await generateContentWithRetry(client, {
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a centralized transport planning optimization engine. Output structured system JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchTimelineStatus: { type: Type.STRING },
            egressPeakTimeUtc: { type: Type.STRING },
            estimatedExitDurationMinutes: { type: Type.INTEGER },
            exitGateConfiguration: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  gateId: { type: Type.STRING },
                  status: { type: Type.STRING }, // "OPEN_MAX", "REGULAR", "RECOVERY_ONLY"
                  flowRateTargetPerMin: { type: Type.INTEGER },
                },
                required: ["gateId", "status", "flowRateTargetPerMin"],
              },
            },
            ecoShuttleDispatch: {
              type: Type.OBJECT,
              properties: {
                fleetSizeToDeploy: { type: Type.INTEGER },
                routeAAllocation: { type: Type.INTEGER },
                routeBAllocation: { type: Type.INTEGER },
                routeCAllocation: { type: Type.INTEGER },
                co2SavedKgEst: { type: Type.NUMBER },
                chargingInstructions: { type: Type.STRING },
              },
              required: [
                "fleetSizeToDeploy",
                "routeAAllocation",
                "routeBAllocation",
                "routeCAllocation",
                "co2SavedKgEst",
                "chargingInstructions",
              ],
            },
            publicAddressSignageScript: { type: Type.STRING },
          },
          required: [
            "matchTimelineStatus",
            "egressPeakTimeUtc",
            "estimatedExitDurationMinutes",
            "exitGateConfiguration",
            "ecoShuttleDispatch",
            "publicAddressSignageScript",
          ],
        },
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    return res.status(200).json({ mode: "LIVE_CORE", data: parsedData });
  } catch (error: any) {
    console.warn("Gemini Transport Planner Error:", error);
    return res.status(503).json({ error: "TELEMETRY LINK DEGRADED" });
  }
}
