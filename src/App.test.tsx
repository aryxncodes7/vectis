import "global-jsdom/register";
import test from "node:test";
import assert from "node:assert";
import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";

// Initialize JSDOM globally
(globalThis as any).requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(() => cb(0), 0);
(globalThis as any).cancelAnimationFrame = (id: number) => clearTimeout(id);
(globalThis as any).IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
(globalThis as any).cancelAnimationFrame = (id: number) => clearTimeout(id);

import App from "./App";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

test("SCOPE App Main Orchestrator Integration Suite", async (t) => {
  await t.test("App component exports and is instantiable", () => {
    assert.strictEqual(typeof App, "function");
    const element = React.createElement(App);
    assert.strictEqual(element.type, App);
  });
  
  await t.test("App triggers evaluations and displays 'TELEMETRY LINK DEGRADED' banner on 503", async (t) => {
    // Inject scoped mock to prevent test pollution and securely mock the API
    t.mock.method(globalThis, 'fetch', async (url: RequestInfo | URL, init?: RequestInit) => {
      await delay(10); // Simulate network latency
      
      // Mock health check
      if (url === "/api/health") {
        return { ok: true, json: async () => ({ status: "healthy", mode: "LIVE_CORE" }) } as any;
      }
      
      // Mock failure for the main orchestration call to trigger DEGRADED state
      if (url === "/api/multilingual-incident" || url === "/api/crowd-decongestion" || url === "/api/predictive-transport") {
        return { 
          ok: false, 
          status: 503,
          json: async () => ({ error: "TELEMETRY LINK DEGRADED" }) 
        } as any;
      }
      
      return { ok: true, json: async () => ({}) } as any;
    });

    // Mount the Application
    render(<App />);
    
    // Find and click the 'FORCE TELEMETRY REBALANCING' button
    const evaluateButton = await screen.findByText("FORCE TELEMETRY REBALANCING");
    assert.ok(evaluateButton);
    
    await act(async () => {
      evaluateButton.click();
    });

    // Wait for the asynchronous fetch calls to fail and the UI to update to DEGRADED
    await waitFor(() => {
      const errorBanner = screen.getByText("TELEMETRY LINK DEGRADED");
      assert.ok(errorBanner, "The DEGRADED error banner should be visible after a 503 API response");
    }, { timeout: 1000 });
  });
});
