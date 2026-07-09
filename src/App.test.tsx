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

test("VECTIS App Main Orchestrator Integration Suite", async (t) => {
  await t.test("App component exports and is instantiable", () => {
    assert.strictEqual(typeof App, "function");
    const element = React.createElement(App);
    assert.strictEqual(element.type, App);
  });
});
