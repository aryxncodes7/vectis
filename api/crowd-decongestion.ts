import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getGeminiClient, generateContentWithRetry } from "./_utils/gemini.js";
import { Type } from "@google/genai";
import { CrowdAIResponseSchema } from "../src/types.js";

/**
 * Vercel Serverless Endpoint: Dynamic Crowd De-congestion
 * 
 * Ingests live IoT gate loads and camera analytics to dynamically reroute
 * stadium traffic and generate physical digital signage instructions.
 * 
 * @param {VercelRequest} req - The incoming HTTP request. `req.body.gatesData` and `req.body.physicalSignage` are required.
 * @param {VercelResponse} res - The outgoing HTTP response containing the AI JSON output.
 * @returns {Promise<void>}
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { gatesData, physicalSignage, cameraVisionLogs } = req.body;

  if (!gatesData || !Array.isArray(gatesData) || !physicalSignage || !Array.isArray(physicalSignage)) {
    return res.status(400).json({ error: "Invalid payload: gatesData and physicalSignage must be arrays." });
  }

  const client = getGeminiClient();

  if (!client) {
    // Simulator mock data fallback (high-fidelity)
    const isCritical = gatesData.some((g: any) => g.loadPercentage > 85);
    const mockResponse = {
      status: isCritical ? "WARNING" : "NORMAL",
      analysis: `Grid load imbalance detected. Localized telemetry matrix indicates Gate A at 95% capacity. Recommended action: Force active telemetry rebalancing. Distribute flow to peripheral Gate C to achieve optimal system balance.`,
      updatedSignage: physicalSignage.map((sign: any) => {
        let recommendedText = "WELCOME TO MATCH DAY - STADIUM ENTRY VIA ALL OPEN GATES";
        let reasoning = "Standard entry scenario.";
        if (isCritical) {
          if (sign.id === "SIGN_GATE_A" || sign.id === "SIGN_NORTH_PLAZA") {
            recommendedText = "GATE A OVERLOADED - REROUTE TO GATE C (4 MIN WALK)";
            reasoning = "Mitigate 90%+ overload at Gate A by pushing traffic to Gate C.";
          } else if (sign.id === "SIGN_MAIN_DRIVE") {
            recommendedText = "USE SOUTHWEST CONCOURSE FOR SECTORS 100-250";
            reasoning = "Bypass northern gate choke points entirely.";
          }
        }
        return {
          signId: sign.id,
          currentText: sign.text,
          recommendedText,
          reasoning,
        };
      }),
      volunteerDispatch: {
        dispatchNeeded: isCritical,
        targetZone: isCritical ? "North Plaza Outer Concourse" : "None",
        staffCount: isCritical ? 25 : 0,
        actionInstructions: isCritical
          ? "Form visual human-barrier lines at Sector 4 pathways. Verbally guide fans to the southwest concourse bypass lane."
          : "Maintain standard perimeter monitoring.",
      },
      fanAppRoutings: [
        { sourceArea: "North Transit Hub", recommendedGate: "Gate C", estimatedWaitMinutes: isCritical ? 6 : 2 },
        { sourceArea: "West Car Park", recommendedGate: "Gate E", estimatedWaitMinutes: 3 },
        { sourceArea: "South Concourse", recommendedGate: "Gate K", estimatedWaitMinutes: 2 },
      ],
    };
    return res.status(200).json({ mode: "SIMULATION_FALLBACK", data: mockResponse });
  }

  try {
    const prompt = `
      You are the silent background GenAI intelligence layer "SCOPE" for the FIFA World Cup 2026.
      Injest the following live stadium crowd IoT data streams and generate a deterministic structured JSON routing and infrastructure dispatch package.

      STADIUM GATE IoT LOAD DATA:
      ${JSON.stringify(gatesData, null, 2)}

      PHYSICAL DIGITAL SIGNAGE CURRENT STATE:
      ${JSON.stringify(physicalSignage, null, 2)}

      VISION CAMERA SCENE DESCRIPTIONS (Outer plazas):
      ${cameraVisionLogs || "No vision warnings registered."}

      Task:
      Evaluate gate bottlenecks. If any gate load is over 80%, identify optimal routing alternatives (e.g. redirecting from Gate A to Gate C or K).
      Generate optimal recommended physical sign texts, volunteer squad dispatch requirements, and App routing updates.
      Output strictly JSON fitting the requested schema.
    `;

    const response = await generateContentWithRetry(client, {
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a centralized stadium logistics optimization engine. You output exclusively structured system control payloads. No chat-like conversational prose.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING }, // "NORMAL", "WARNING", "CRITICAL"
            analysis: { type: Type.STRING },
            updatedSignage: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  signId: { type: Type.STRING },
                  recommendedText: { type: Type.STRING },
                  reasoning: { type: Type.STRING },
                },
                required: ["signId", "recommendedText", "reasoning"],
              },
            },
            volunteerDispatch: {
              type: Type.OBJECT,
              properties: {
                dispatchNeeded: { type: Type.BOOLEAN },
                targetZone: { type: Type.STRING },
                staffCount: { type: Type.INTEGER },
                actionInstructions: { type: Type.STRING },
              },
              required: ["dispatchNeeded", "targetZone", "staffCount", "actionInstructions"],
            },
            fanAppRoutings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sourceArea: { type: Type.STRING },
                  recommendedGate: { type: Type.STRING },
                  estimatedWaitMinutes: { type: Type.INTEGER },
                },
                required: ["sourceArea", "recommendedGate", "estimatedWaitMinutes"],
              },
            },
          },
          required: ["status", "analysis", "updatedSignage", "volunteerDispatch", "fanAppRoutings"],
        },
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    const validatedData = CrowdAIResponseSchema.parse(parsedData);
    return res.status(200).json({ mode: "LIVE_CORE", data: validatedData });
  } catch (error: any) {
    console.warn("Gemini Crowd Ingestion Error:", error);
    return res.status(503).json({ error: "TELEMETRY LINK DEGRADED" });
  }
}
