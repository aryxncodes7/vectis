import "global-jsdom/register";
import test from "node:test";
import assert from "node:assert";
import React from "react";
import { render, screen, act } from "@testing-library/react";

// Initialize JSDOM globally
(globalThis as any).requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(() => cb(0), 0);
(globalThis as any).cancelAnimationFrame = (id: number) => clearTimeout(id);
(globalThis as any).IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
(globalThis as any).cancelAnimationFrame = (id: number) => clearTimeout(id);

import { AnimatedNumber, GlowPanel, ScrollReveal, MagneticButton } from "./HelperComponents";

test("SCOPE Helper Component Interface Validation Suite", async (t) => {
  await t.test("AnimatedNumber - component exports and initializes", () => {
    assert.strictEqual(typeof AnimatedNumber, "function");
    render(<AnimatedNumber value={100} duration={200} />);
    const animatedSpan = screen.getByText("100");
    assert.ok(animatedSpan);
  });

  await t.test("GlowPanel - container structure and customization props", () => {
    assert.strictEqual(typeof GlowPanel, "function");
    render(
      <GlowPanel dominant={true} className="custom-grid">
        <div data-testid="test-child">Telemetry</div>
      </GlowPanel>
    );
    
    // Assert structural classes
    const child = screen.getByTestId("test-child");
    const glowPanelContainer = child.parentElement?.parentElement;
    assert.ok(glowPanelContainer);
    assert.ok(glowPanelContainer.className.includes("custom-grid"));
    assert.ok(glowPanelContainer.className.includes("backdrop-blur-md"));
  });

  await t.test("ScrollReveal - reveal delay and layout positioning", () => {
    assert.strictEqual(typeof ScrollReveal, "function");
    render(
      <ScrollReveal delay={0.15} className="test-reveal-class">
        <span>Smooth Ingress</span>
      </ScrollReveal>
    );

    const child = screen.getByText("Smooth Ingress");
    const container = child.parentElement;
    assert.ok(container);
    assert.ok(container.className.includes("test-reveal-class"));
  });

  await t.test("MagneticButton - button states and interaction props", () => {
    assert.strictEqual(typeof MagneticButton, "function");
    let clicked = false;
    const clickHandler = () => { clicked = true; };
    
    render(
      <MagneticButton onClick={clickHandler} disabled={true}>
        Submit
      </MagneticButton>
    );

    const btn = screen.getByText("Submit");
    assert.ok(btn.hasAttribute("disabled"));
    
    // Attempt click on disabled button
    act(() => {
      btn.click();
    });
    
    assert.strictEqual(clicked, false, "Disabled button should not fire click handler");
  });
});
