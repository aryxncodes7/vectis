import test from "node:test";
import assert from "node:assert";
import React from "react";
import { render, screen } from "@testing-library/react";
import { FleetStreamPanel } from "./FleetStreamPanel";



test('FleetStreamPanel Component renders correctly', () => {
  
  const mockProps = {
    matchMinute: 90,
    setMatchMinute: () => {},
    scoreHome: 0,
    setScoreHome: () => {},
    scoreAway: 0,
    setScoreAway: () => {},
    extraTimePredicted: false,
    transitGridLoad: 'High',
    setTransitGridLoad: () => {},
    runTransportEvaluation: async () => {},
    isSystemEvaluating: false,
    transportAIResponse: null
  };

  render(<FleetStreamPanel {...mockProps} />);
  assert.ok(screen.getByText(/Transit Network/i));
});
