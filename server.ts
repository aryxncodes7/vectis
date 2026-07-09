import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

// Lazy initialization helper for Gemini
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      console.warn("GEMINI_API_KEY is not configured or using placeholder. Running in Simulator Fallback Mode.");
      return null;
    }
    try {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } catch (error) {
      console.error("Failed to initialize GoogleGenAI client:", error);
      return null;
    }
  }
  return aiClient;
}

const app = express();
app.use(express.json());

// Strict Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https:;"
  );
  next();
});

// API route to check system status
app.get("/api/health", (req, res) => {
  const client = getGeminiClient();
  let mode = "UNCONFIGURED";
  if (client) {
    if (lastCallStatus === "error") {
      mode = "DEGRADED";
    } else {
      mode = "LIVE_CORE";
    }
  }

  res.json({
    status: "healthy",
    mode: mode,
    timestamp: new Date().toISOString(),
    lastCallStatus,
    lastCallTimestamp
  });
});

// --- USE CASE 1: CROWD DE-CONGESTION & SMART ROUTING ---
app.post("/api/crowd-decongestion", async (req, res) => {
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
    return res.json({ mode: "SIMULATION_FALLBACK", data: mockResponse });
  }

  try {
    const prompt = `
      You are the silent background GenAI intelligence layer "StadiumOps-Nexus" for the FIFA World Cup 2026.
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

    const response = await client.models.generateContent({
      model: "gemini-1.5-flash",
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
    lastCallStatus = "success";
    lastCallTimestamp = new Date().toISOString();
    res.json({ mode: "LIVE_CORE", data: parsedData });
  } catch (error: any) {
    console.warn("Gemini Crowd Ingestion Error:", error);
    lastCallStatus = "error";
    lastCallTimestamp = new Date().toISOString();
    res.status(503).json({ error: "TELEMETRY LINK DEGRADED" });
  }
});

// --- USE CASE 2: MULTILINGUAL INCIDENT COORDINATION ---
app.post("/api/multilingual-incident", async (req, res) => {
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
    return res.json({ mode: "SIMULATION_FALLBACK", data: mockResponse });
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

    const response = await client.models.generateContent({
      model: "gemini-1.5-flash",
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
    lastCallStatus = "success";
    lastCallTimestamp = new Date().toISOString();
    res.json({ mode: "LIVE_CORE", data: parsedData });
  } catch (error: any) {
    console.warn("Gemini Incident Coordinator Error:", error);
    lastCallStatus = "error";
    lastCallTimestamp = new Date().toISOString();
    res.status(503).json({ error: "TELEMETRY LINK DEGRADED" });
  }
});

// --- USE CASE 3: PREDICTIVE TRANSPORT & SUSTAINABILITY DISPATCH ---
app.post("/api/predictive-transport", async (req, res) => {
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
    return res.json({ mode: "SIMULATION_FALLBACK", data: mockResponse });
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

    const response = await client.models.generateContent({
      model: "gemini-1.5-flash",
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
    lastCallStatus = "success";
    lastCallTimestamp = new Date().toISOString();
    res.json({ mode: "LIVE_CORE", data: parsedData });
  } catch (error: any) {
    console.warn("Gemini Transport Planner Error:", error);
    lastCallStatus = "error";
    lastCallTimestamp = new Date().toISOString();
    res.status(503).json({ error: "TELEMETRY LINK DEGRADED" });
  }
});

// Serve Vite-compiled assets or mount Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`StadiumOps-Nexus Server successfully running on http://0.0.0.0:${PORT}`);
  });
}

export { app };

if (process.env.NODE_ENV !== "test") {
  startServer();
}
