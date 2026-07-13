import test from "node:test";
import assert from "node:assert";
import React from "react";
import { render, screen } from "@testing-library/react";
import { TelemetryGrid } from "./TelemetryGrid";



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
