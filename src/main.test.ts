import test from "node:test";
import assert from "node:assert";

test("SCOPE Bootstrap Entry Verification Suite", async (t) => {
  await t.test("main.tsx initializes and mounts into the DOM successfully", async () => {
    // 1. Setup the DOM target
    document.body.innerHTML = '<div id="root"></div>';
    
    // 2. Import main.tsx directly. The CSS imports are intercepted by css-loader.mjs
    await import("./main.tsx");
    
    // 3. Assert that the DOM was successfully modified by React
    const rootElement = document.getElementById("root");
    assert.ok(rootElement, "Root element must exist");
    
    await new Promise((resolve) => setTimeout(resolve, 50)); // wait for React mount tick
    
    assert.ok(rootElement.innerHTML.length > 0, "React should have rendered the App component into the root element");
    assert.ok(rootElement.innerHTML.includes("SCOPE"), "App text should be present in the mounted DOM");
  });
});
