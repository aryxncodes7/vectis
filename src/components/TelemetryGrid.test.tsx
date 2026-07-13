import "global-jsdom/register";
import test from "node:test";
import assert from "node:assert";
import React from "react";
import { render, screen } from "@testing-library/react";
import { TelemetryGrid } from "./TelemetryGrid";

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

test('TelemetryGrid Component renders correctly', () => {
  
  const mockProps = {
    avgGateInflow: 45,
    gates: [],
    acknowledgedAlarms: [],
    activeAlarmsCount: 0,
    ingressQueueAccumulation: 0,
    flowDelayMetric: 0,
    transportAIResponse: null,
    activeSimSegment: 'crowd',
    setActiveSimSegment: () => {},
    lastEvaluationTime: '12:00:00'
  };

  render(<TelemetryGrid {...mockProps} />);
  assert.ok(screen.getByText(/AVG GATE INFLOW INDEX/i));
});
