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
