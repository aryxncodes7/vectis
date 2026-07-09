import test from "node:test";
import assert from "node:assert";
import { app } from "./server";
import { Server } from "http";

function startTestServer(appInstance: any): Promise<{ server: Server; baseUrl: string }> {
  return new Promise((resolve) => {
    // Bind to 0 to automatically pick any free available port
    const server = appInstance.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      resolve({ server, baseUrl: `http://127.0.0.1:${port}` });
    });
  });
}

test("VECTIS Stadium Operations Center Endpoint Integration Suite", async (t) => {
  let serverInstance: Server;
  let baseUrl: string;

  t.before(async () => {
    process.env.NODE_ENV = "test";
    const res = await startTestServer(app);
    serverInstance = res.server;
    baseUrl = res.baseUrl;
  });

  t.after(() => {
    serverInstance.close();
  });

  await t.test("GET /api/health should return structural metadata", async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(res.status, 200);
    
    const body = await res.json();
    assert.strictEqual(body.status, "healthy");
    assert.ok(body.mode === "LIVE_CORE" || body.mode === "SIMULATION_FALLBACK");
    assert.ok(typeof body.timestamp === "string");
  });

  await t.test("POST /api/crowd-decongestion - Input Validation Block", async () => {
    const res = await fetch(`${baseUrl}/api/crowd-decongestion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gatesData: null }) // Missing arrays
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.match(body.error, /Invalid payload/);
  });

  await t.test("POST /api/crowd-decongestion - Valid Structural Routing Payload", async () => {
    const testPayload = {
      gatesData: [
        { id: "GATE_A", name: "Gate A", loadPercentage: 90, queueLength: 350, status: "CRITICAL" }
      ],
      physicalSignage: [
        { id: "SIGN_GATE_A", location: "North Entrance", text: "WELCOME TO MATCH DAY" }
      ],
      cameraVisionLogs: "Heavy backup on Sector 4 pathways."
    };

    const res = await fetch(`${baseUrl}/api/crowd-decongestion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testPayload)
    });

    assert.strictEqual(res.status, 200);
    const result = await res.json();
    assert.ok(result.mode === "LIVE_CORE" || result.mode === "SIMULATION_FALLBACK");
    
    const data = result.data;
    assert.ok(data.status === "NORMAL" || data.status === "WARNING" || data.status === "CRITICAL");
    assert.ok(typeof data.analysis === "string");
    assert.ok(Array.isArray(data.updatedSignage));
    assert.ok(typeof data.volunteerDispatch === "object");
    assert.ok(Array.isArray(data.fanAppRoutings));
  });

  await t.test("POST /api/multilingual-incident - Input Validation Block", async () => {
    const res = await fetch(`${baseUrl}/api/multilingual-incident`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}) // Empty body
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.match(body.error, /Invalid payload/);
  });

  await t.test("POST /api/multilingual-incident - Valid Emergency Log Structuring", async () => {
    const testPayload = {
      rawReports: [
        { id: "1", reporter: "Juan", role: "VOLUNTEER", lang: "es", text: "Fila muy larga en puerta G." }
      ]
    };

    const res = await fetch(`${baseUrl}/api/multilingual-incident`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testPayload)
    });

    assert.strictEqual(res.status, 200);
    const result = await res.json();
    assert.ok(result.mode === "LIVE_CORE" || result.mode === "SIMULATION_FALLBACK");
    
    const data = result.data;
    assert.ok(typeof data.incidentDetected === "string");
    assert.ok(Array.isArray(data.originalLanguages));
    assert.ok(typeof data.unifiedSummary === "string");
    assert.ok(Array.isArray(data.sopChecks));
    assert.ok(Array.isArray(data.recommendedActions));
    assert.ok(typeof data.dispatchAlert === "object");
  });

  await t.test("POST /api/predictive-transport - Input Validation Block", async () => {
    const res = await fetch(`${baseUrl}/api/predictive-transport`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchMinute: "75", currentScore: "1-1" }) // matchMinute is string (invalid)
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.match(body.error, /Invalid payload/);
  });

  await t.test("POST /api/predictive-transport - Valid Dynamic Shuttle Dispatching", async () => {
    const testPayload = {
      matchMinute: 88,
      currentScore: "2-1",
      extraTimePredicted: false,
      transitGridLoad: "Normal"
    };

    const res = await fetch(`${baseUrl}/api/predictive-transport`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testPayload)
    });

    assert.strictEqual(res.status, 200);
    const result = await res.json();
    assert.ok(result.mode === "LIVE_CORE" || result.mode === "SIMULATION_FALLBACK");
    
    const data = result.data;
    assert.ok(typeof data.matchTimelineStatus === "string");
    assert.ok(typeof data.egressPeakTimeUtc === "string");
    assert.ok(typeof data.estimatedExitDurationMinutes === "number");
    assert.ok(Array.isArray(data.exitGateConfiguration));
    assert.ok(typeof data.ecoShuttleDispatch === "object");
    assert.ok(typeof data.publicAddressSignageScript === "string");
  });
});
