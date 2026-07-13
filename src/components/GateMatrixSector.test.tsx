import test from "node:test";
import assert from "node:assert";
import React from "react";
import { render, screen } from "@testing-library/react";
import { GateMatrixSector } from "./GateMatrixSector";



test('GateMatrixSector Component renders correctly', () => {
  
  const mockGates = [
    { id: 'GATE_A', name: 'Gate A', loadPercentage: 50, queueLength: 10, status: 'NORMAL' as const }
  ];
  const mockProps = {
    gates: mockGates,
    acknowledgedAlarms: [],
    setAcknowledgedAlarms: () => {},
    generateSparklinePath: () => '',
    updateGateLoad: () => {},
    setCameraVisionLogs: () => {},
    addLog: () => {},
    isSystemEvaluating: false,
    cameraVisionLogs: '',
    runCrowdEvaluation: async () => {}
  };

  render(<GateMatrixSector {...mockProps} />);
  assert.ok(screen.getByText(/Gate A/i));
});
