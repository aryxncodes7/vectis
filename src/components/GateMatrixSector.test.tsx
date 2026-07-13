import "global-jsdom/register";
import test from "node:test";
import assert from "node:assert";
import React from "react";
import { render, screen } from "@testing-library/react";
import { GateMatrixSector } from "./GateMatrixSector";

// Polyfill
if (typeof import.meta === 'undefined') {
  (global as any).import = { meta: { env: { BASE_URL: '/' } } };
} else if (!import.meta.env) {
  (import.meta as any).env = { BASE_URL: "/" };
}

(globalThis as any).requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(() => cb(0), 0);
(globalThis as any).cancelAnimationFrame = (id: number) => clearTimeout(id);
(globalThis as any).IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
if (typeof window !== 'undefined') {
  (window as any).IntersectionObserver = (globalThis as any).IntersectionObserver;
}

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
