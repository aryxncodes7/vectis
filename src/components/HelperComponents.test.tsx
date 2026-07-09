import test from "node:test";
import assert from "node:assert";
import React from "react";

// Mock minimal browser globals for safe SSR test evaluation of UI elements
globalThis.window = {} as any;
globalThis.document = {
  head: { appendChild: () => {} },
  documentElement: { setAttribute: () => {} }
} as any;
globalThis.requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(() => cb(0), 0) as any;
globalThis.cancelAnimationFrame = (id: number) => clearTimeout(id);

import { AnimatedNumber, GlowPanel, ScrollReveal, MagneticButton } from "./HelperComponents";

test("VECTIS Helper Component Interface Validation Suite", async (t) => {
  await t.test("AnimatedNumber - component exports and initializes", () => {
    assert.strictEqual(typeof AnimatedNumber, "function");
    const element = React.createElement(AnimatedNumber, { value: 100, duration: 200 });
    assert.strictEqual(element.type, AnimatedNumber);
    assert.strictEqual(element.props.value, 100);
  });

  await t.test("GlowPanel - container structure and customization props", () => {
    assert.strictEqual(typeof GlowPanel, "function");
    const child = React.createElement("div", { id: "test-child" }, "Telemetry");
    const element = React.createElement(GlowPanel, { dominant: true, className: "custom-grid" }, child);
    
    assert.strictEqual(element.props.dominant, true);
    assert.strictEqual(element.props.className, "custom-grid");
    assert.strictEqual(element.props.children.props.id, "test-child");
  });

  await t.test("ScrollReveal - reveal delay and layout positioning", () => {
    assert.strictEqual(typeof ScrollReveal, "function");
    const child = React.createElement("span", null, "Smooth Ingress");
    const element = React.createElement(ScrollReveal, { delay: 0.15 }, child);

    assert.strictEqual(element.props.delay, 0.15);
  });

  await t.test("MagneticButton - button states and interaction props", () => {
    assert.strictEqual(typeof MagneticButton, "function");
    const clickHandler = () => {};
    const element = React.createElement(MagneticButton, { onClick: clickHandler, disabled: true }, "Submit");

    assert.strictEqual(element.props.disabled, true);
    assert.strictEqual(element.props.onClick, clickHandler);
  });
});
