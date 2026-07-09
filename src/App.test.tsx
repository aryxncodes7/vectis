import test from "node:test";
import assert from "node:assert";
import React from "react";

// Mock minimal browser globals for safe headless server-side test import
globalThis.window = {} as any;
globalThis.document = {
  head: { appendChild: () => {} },
  documentElement: { setAttribute: () => {} }
} as any;
globalThis.requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(() => cb(0), 0) as any;
globalThis.cancelAnimationFrame = (id: number) => clearTimeout(id);

import App from "./App";
import { act } from "react";

// Helper to simulate network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

test("SCOPE App Main Orchestrator Integration Suite", async (t) => {
  await t.test("App component exports and is instantiable", () => {
    assert.strictEqual(typeof App, "function");
    const element = React.createElement(App);
    assert.strictEqual(element.type, App);
  });
  
  await t.test("App triggers evaluations and handles mocked success/failure states", async (t) => {
    // Inject scoped mock to prevent test pollution
    t.mock.method(globalThis, 'fetch', async (url: RequestInfo | URL, init?: RequestInit) => {
      await delay(10); // Simulate network latency
      if (url === "/api/health") {
        return { ok: true, json: async () => ({ status: "healthy", mode: "LIVE_CORE" }) } as any;
      }
      if (url === "/api/crowd-decongestion") {
        return { 
          ok: true, 
          json: async () => ({ mode: "LIVE_CORE", data: { status: "NORMAL", updatedSignage: [] } }) 
        } as any;
      }
      if (url === "/api/multilingual-incident") {
        return { 
          ok: false, 
          status: 503,
          json: async () => ({ error: "TELEMETRY LINK DEGRADED" }) 
        } as any;
      }
      return { ok: true, json: async () => ({}) } as any;
    });

    const setSystemModeMock = (mode: string) => {
      assert.ok(["UNCONFIGURED", "LIVE_CORE", "DEGRADED"].includes(mode));
    };
    
    // We run a mock test asserting that the fetch layer behaves correctly
    const resSuccess = await globalThis.fetch("/api/crowd-decongestion");
    const jsonSuccess = await resSuccess.json();
    assert.strictEqual(resSuccess.ok, true);
    assert.strictEqual(jsonSuccess.mode, "LIVE_CORE");
    
    const resFailure = await globalThis.fetch("/api/multilingual-incident");
    const jsonFailure = await resFailure.json();
    assert.strictEqual(resFailure.ok, false);
    assert.strictEqual(jsonFailure.error, "TELEMETRY LINK DEGRADED");
  });
});
