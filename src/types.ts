export interface GateData {
  id: string;
  name: string;
  loadPercentage: number;
  queueLength: number;
  status: "NORMAL" | "WARNING" | "CRITICAL";
}

export interface Signage {
  id: string;
  location: string;
  text: string;
}

export interface MultilingualReport {
  id: string;
  reporter: string;
  role: string;
  lang: string;
  text: string;
}

export interface CrowdAIResponse {
  status: "NORMAL" | "WARNING" | "CRITICAL";
  analysis: string;
  updatedSignage: Array<{
    signId: string;
    currentText?: string;
    recommendedText: string;
    reasoning: string;
  }>;
  volunteerDispatch: {
    dispatchNeeded: boolean;
    targetZone: string;
    staffCount: number;
    actionInstructions: string;
  };
  fanAppRoutings: Array<{
    sourceArea: string;
    recommendedGate: string;
    estimatedWaitMinutes: number;
  }>;
}

export interface IncidentAIResponse {
  incidentDetected: string;
  originalLanguages: string[];
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  unifiedSummary: string;
  sopChecks: Array<{
    step: string;
    completed: boolean;
    actionRequired: string;
  }>;
  recommendedActions: string[];
  dispatchAlert: {
    dispatchTarget: string;
    priority: string;
    messagePayload: string;
  };
}

export interface TransportAIResponse {
  matchTimelineStatus: string;
  egressPeakTimeUtc: string;
  estimatedExitDurationMinutes: number;
  exitGateConfiguration: Array<{
    gateId: string;
    status: string;
    flowRateTargetPerMin: number;
  }>;
  ecoShuttleDispatch: {
    fleetSizeToDeploy: number;
    routeAAllocation: number;
    routeBAllocation: number;
    routeCAllocation: number;
    co2SavedKgEst: number;
    chargingInstructions: string;
  };
  publicAddressSignageScript: string;
}

import { z } from "zod";

export const CrowdAIResponseSchema = z.object({
  status: z.enum(["NORMAL", "WARNING", "CRITICAL"]),
  analysis: z.string(),
  updatedSignage: z.array(z.object({
    signId: z.string(),
    currentText: z.string().optional(),
    recommendedText: z.string(),
    reasoning: z.string(),
  })),
  volunteerDispatch: z.object({
    dispatchNeeded: z.boolean(),
    targetZone: z.string(),
    staffCount: z.number(),
    actionInstructions: z.string(),
  }),
  fanAppRoutings: z.array(z.object({
    sourceArea: z.string(),
    recommendedGate: z.string(),
    estimatedWaitMinutes: z.number(),
  })),
});

export const IncidentAIResponseSchema = z.object({
  incidentDetected: z.string(),
  originalLanguages: z.array(z.string()),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  unifiedSummary: z.string(),
  sopChecks: z.array(z.object({
    step: z.string(),
    completed: z.boolean(),
    actionRequired: z.string(),
  })),
  recommendedActions: z.array(z.string()),
  dispatchAlert: z.object({
    dispatchTarget: z.string(),
    priority: z.string(),
    messagePayload: z.string(),
  }),
});

export const TransportAIResponseSchema = z.object({
  matchTimelineStatus: z.string(),
  egressPeakTimeUtc: z.string(),
  estimatedExitDurationMinutes: z.number(),
  exitGateConfiguration: z.array(z.object({
    gateId: z.string(),
    status: z.string(),
    flowRateTargetPerMin: z.number(),
  })),
  ecoShuttleDispatch: z.object({
    fleetSizeToDeploy: z.number(),
    routeAAllocation: z.number(),
    routeBAllocation: z.number(),
    routeCAllocation: z.number(),
    co2SavedKgEst: z.number(),
    chargingInstructions: z.string(),
  }),
  publicAddressSignageScript: z.string(),
});
