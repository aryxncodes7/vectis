import "global-jsdom/register";
import test from "node:test";
import assert from "node:assert";
import React from "react";
import { render, screen } from "@testing-library/react";
import { FleetStreamPanel } from "./FleetStreamPanel";

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
