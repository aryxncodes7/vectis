import test from "node:test";
import assert from "node:assert";
import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";



import App from "./App";

const server = setupServer(
  http.get("/api/health", () => {
    return HttpResponse.json({ status: "healthy", mode: "LIVE_CORE" });
  }),
  http.post("/api/multilingual-incident", () => {
    return HttpResponse.json({ error: "TELEMETRY LINK DEGRADED" }, { status: 503 });
  }),
  http.post("/api/crowd-decongestion", () => {
    return HttpResponse.json({ error: "TELEMETRY LINK DEGRADED" }, { status: 503 });
  }),
  http.post("/api/predictive-transport", () => {
    return HttpResponse.json({ error: "TELEMETRY LINK DEGRADED" }, { status: 503 });
  })
);

test("SCOPE App Main Orchestrator Integration Suite", async (t) => {
  t.before(() => server.listen({ onUnhandledRequest: "bypass" }));
  t.afterEach(() => server.resetHandlers());
  t.after(() => server.close());

  await t.test("App component exports and is instantiable", () => {
    assert.strictEqual(typeof App, "function");
    const element = React.createElement(App);
    assert.strictEqual(element.type, App);
  });
  
  await t.test("App triggers evaluations and displays 'TELEMETRY LINK DEGRADED' banner on 503", async (t) => {
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
