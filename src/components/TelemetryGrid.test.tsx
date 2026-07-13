import test from "node:test";
import assert from "node:assert";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { TelemetryGrid } from "./TelemetryGrid";



test('TelemetryGrid Component renders correctly', (t) => {
  
  let activeSegment = 'crowd';
  const mockSetActiveSimSegment = t.mock.fn((val) => { activeSegment = val; });

  const mockProps = {
    avgGateInflow: 45,
    gates: [],
    acknowledgedAlarms: [],
    activeAlarmsCount: 0,
    ingressQueueAccumulation: 0,
    flowDelayMetric: 0,
    transportAIResponse: null,
    activeSimSegment: 'crowd',
    setActiveSimSegment: mockSetActiveSimSegment,
    lastEvaluationTime: '12:00:00'
  };

  render(<TelemetryGrid {...mockProps} />);
  assert.ok(screen.getByText(/AVG GATE INFLOW INDEX/i));

  const transportBtn = screen.getByText('FLEET STREAM');
  fireEvent.click(transportBtn);
  assert.strictEqual(mockSetActiveSimSegment.mock.calls.length, 1);
  assert.strictEqual(mockSetActiveSimSegment.mock.calls[0].arguments[0], 'transport');
});
