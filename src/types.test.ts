import test from "node:test";
import assert from "node:assert";
import { CrowdAIResponse, IncidentAIResponse, TransportAIResponse } from "./types";

test("SCOPE Data Structure Interface Contract Validation", async (t) => {
  await t.test("CrowdAIResponse - conforming to structure properties", () => {
    const mockResponse: CrowdAIResponse = {
      status: "WARNING",
      analysis: "High density accumulation near Sector B ticket gates.",
      updatedSignage: [
        {
          signId: "SIGN_01",
          recommendedText: "REROUTE TO GATE C - NO QUEUE",
          reasoning: "Mitigate gate G overload."
        }
      ],
      volunteerDispatch: {
        dispatchNeeded: true,
        targetZone: "Gate G Plaza",
        staffCount: 15,
        actionInstructions: "Redirect pedestrian flows using portable crowd barricades."
      },
      fanAppRoutings: [
        {
          sourceArea: "North Transit Hub",
          recommendedGate: "Gate C",
          estimatedWaitMinutes: 5
        }
      ]
    };

    assert.strictEqual(mockResponse.status, "WARNING");
    assert.ok(mockResponse.analysis.includes("Sector B"));
    assert.strictEqual(mockResponse.updatedSignage.length, 1);
    assert.strictEqual(mockResponse.volunteerDispatch.staffCount, 15);
    assert.strictEqual(mockResponse.fanAppRoutings[0].recommendedGate, "Gate C");
  });

  await t.test("IncidentAIResponse - conforming to structure properties", () => {
    const mockResponse: IncidentAIResponse = {
      incidentDetected: "Water conduit leak on concourse level 2",
      originalLanguages: ["es", "fr"],
      severity: "MEDIUM",
      unifiedSummary: "A minor leak near concession stand 4 has made floor tiles slippery.",
      sopChecks: [
        {
          step: "Isolate main valve",
          completed: true,
          actionRequired: "Contact plumbing unit dispatch."
        }
      ],
      recommendedActions: [
        "Deploy bilingual warning signage around sector 120",
        "Instruct cleaning crew to deploy absorbent pads"
      ],
      dispatchAlert: {
        dispatchTarget: "LOGISTICS_AND_SAFETY",
        priority: "MEDIUM",
        messagePayload: "Water hazard reported near Section 120 Concourse. Clean-up underway."
      }
    };

    assert.strictEqual(mockResponse.severity, "MEDIUM");
    assert.strictEqual(mockResponse.originalLanguages.length, 2);
    assert.strictEqual(mockResponse.sopChecks[0].completed, true);
    assert.strictEqual(mockResponse.dispatchAlert.dispatchTarget, "LOGISTICS_AND_SAFETY");
  });

  await t.test("TransportAIResponse - conforming to structure properties", () => {
    const mockResponse: TransportAIResponse = {
      matchTimelineStatus: "REGULAR_PLAY",
      egressPeakTimeUtc: "20:10 UTC",
      estimatedExitDurationMinutes: 35,
      exitGateConfiguration: [
        { gateId: "GATE_ALPHA_1", status: "OPEN_MAX", flowRateTargetPerMin: 350 }
      ],
      ecoShuttleDispatch: {
        fleetSizeToDeploy: 40,
        routeAAllocation: 15,
        routeBAllocation: 15,
        routeCAllocation: 10,
        co2SavedKgEst: 496.2,
        chargingInstructions: "East terminal chargers must operate in peak balance configuration."
      },
      publicAddressSignageScript: "Egress cycle under normal parameters. Fast shuttles active at east dock."
    };

    assert.strictEqual(mockResponse.matchTimelineStatus, "REGULAR_PLAY");
    assert.strictEqual(mockResponse.ecoShuttleDispatch.co2SavedKgEst, 496.2);
    assert.strictEqual(mockResponse.exitGateConfiguration[0].gateId, "GATE_ALPHA_1");
  });
});
