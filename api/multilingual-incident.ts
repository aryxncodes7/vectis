import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getGeminiClient, generateContentWithRetry } from "./_utils/gemini.js";
import { Type } from "@google/genai";

/**
 * Vercel Serverless Endpoint: Multilingual Incident Coordination
 * 
 * Ingests raw heterogenous multilingual radio communication logs and
 * returns a unified English Situational Report (SitRep) with standard operating procedures.
 * 
 * @param {VercelRequest} req - The incoming HTTP request. `req.body.rawReports` is required.
 * @param {VercelResponse} res - The outgoing HTTP response containing the AI JSON output.
 * @returns {Promise<void>}
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { rawReports } = req.body;

  if (!rawReports || !Array.isArray(rawReports)) {
    return res.status(400).json({ error: "Invalid payload: rawReports must be an array." });
  }

  const client = getGeminiClient();

  if (!client) {
    // Simulator mock data fallback
    const mockResponse = {
      incidentDetected: "Security Gate Congestion & Medical Support Requirement",
      originalLanguages: rawReports.map((r: any) => r.lang),
      severity: "MEDIUM",
      unifiedSummary: `Localized telemetry indicates scanner hardware offline at Gate G. Incident dispatch priority: MEDIUM. Red Cross squad 2 dispatched to Sector B7.`,
      sopChecks: [
        { step: "Deploy replacement tickets scanners to Gate G", completed: true, actionRequired: "Logistics to send 3 manual handhelds." },
        { step: "Activate triage response for sector B7", completed: true, actionRequired: "Red Cross squad 2 dispatched." },
        { step: "Broaden peripheral signs alerting of gate delays", completed: false, actionRequired: "Trigger sign update via Concourse API." },
      ],
      recommendedActions: [
        "Deploy 5 bilingual volunteers to North Plaza to re-route incoming fans.",
        "Ensure stadium entrance ticket counters are synced with emergency manual mode.",
      ],
      dispatchAlert: {
        dispatchTarget: "LOGISTICS_AND_MEDICAL",
        priority: "MEDIUM",
        messagePayload: "Triage Alert: Medical personnel needed at Sector B7. Ticket Scanner Team dispatched to Gate G.",
      },
    };
    return res.status(200).json({ mode: "SIMULATION_FALLBACK", data: mockResponse });
  }

  try {
    const prompt = `
      You are the silent background optimization core "StadiumOps-Nexus".
      Injest the following heterogeneous multilingual emergency/operational reports from field volunteers and staff:

      RAW MULTILINGUAL REPORTS:
      ${JSON.stringify(rawReports, null, 2)}

      Task:
      1. Unify and translate these multi-source reports into a structured Situational Report (SitRep).
      2. Determine unified incident severity (LOW, MEDIUM, HIGH, CRITICAL).
      3. Cross-reference them against standard Stadium Operating Procedures (SOPs).
      4. Formulate actionable dispatch alert payloads and recommend strict operational steps.
      Output strictly structured JSON.
    `;

    const response = await generateContentWithRetry(client, {
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a centralized incident coordinator. Output purely structured system command JSON payloads.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            incidentDetected: { type: Type.STRING },
            originalLanguages: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            severity: { type: Type.STRING }, // "LOW", "MEDIUM", "HIGH", "CRITICAL"
            unifiedSummary: { type: Type.STRING },
            sopChecks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  step: { type: Type.STRING },
                  completed: { type: Type.BOOLEAN },
                  actionRequired: { type: Type.STRING },
                },
                required: ["step", "completed", "actionRequired"],
              },
            },
            recommendedActions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            dispatchAlert: {
              type: Type.OBJECT,
              properties: {
                dispatchTarget: { type: Type.STRING },
                priority: { type: Type.STRING },
                messagePayload: { type: Type.STRING },
              },
              required: ["dispatchTarget", "priority", "messagePayload"],
            },
          },
          required: [
            "incidentDetected",
            "originalLanguages",
            "severity",
            "unifiedSummary",
            "sopChecks",
            "recommendedActions",
            "dispatchAlert",
          ],
        },
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    return res.status(200).json({ mode: "LIVE_CORE", data: parsedData });
  } catch (error: any) {
    console.warn("Gemini Incident Coordinator Error:", error);
    return res.status(503).json({ error: "TELEMETRY LINK DEGRADED" });
  }
}
