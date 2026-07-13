import "global-jsdom/register";
import test from "node:test";
import assert from "node:assert";
import React from "react";
import { render, screen } from "@testing-library/react";
import { CommunicationLog } from "./CommunicationLog";

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

test('CommunicationLog Component renders correctly', () => {
  
  const mockReports = [
    { id: '1', reporter: 'Test', role: 'Staff', lang: 'English (EN)', text: 'Hello' }
  ];
  const mockProps = {
    incidentReports: mockReports,
    removeIncidentReport: () => {},
    handleAddCustomReport: () => {},
    newReporterName: '',
    setNewReporterName: () => {},
    newReporterLang: '',
    setNewReporterLang: () => {},
    newReportText: '',
    setNewReportText: () => {},
    isSystemEvaluating: false,
    runIncidentEvaluation: async () => {}
  };

  render(<CommunicationLog {...mockProps} />);
  assert.ok(screen.getByText(/Hello/i));
});
