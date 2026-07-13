import "global-jsdom/register";
import test from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Polyfill import.meta.env
if (!import.meta.env) {
  (import.meta as any).env = { BASE_URL: '/' };
}

// Mock InterSectionObserver and animation frames
(globalThis as any).requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(() => cb(0), 0);
(globalThis as any).cancelAnimationFrame = (id: number) => clearTimeout(id);
(globalThis as any).IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

test("SCOPE Bootstrap Entry Verification Suite", async (t) => {
  await t.test("main.tsx initializes and mounts into the DOM successfully", async () => {
    // 1. Setup the DOM target
    document.body.innerHTML = '<div id="root"></div>';
    
    // 2. To avoid Node.js ESM loader crashing on Vite's CSS imports, we'll execute a clean temp version
    const mainPath = path.resolve(__dirname, "main.tsx");
    const tempPath = path.resolve(__dirname, "main_test_temp.tsx");
    const content = fs.readFileSync(mainPath, "utf8");
    const noCssContent = content.replace(/import\s+['"].*\.css['"];?/g, '');
    fs.writeFileSync(tempPath, noCssContent);
    
    try {
      // 3. Import the clean main.tsx, which executes the createRoot logic
      // @ts-ignore - The file is generated dynamically at runtime to strip CSS for testing
      await import("./main_test_temp.tsx");
      
      // 4. Assert that the DOM was successfully modified by React
      const rootElement = document.getElementById("root");
      assert.ok(rootElement, "Root element must exist");
      
      await new Promise((resolve) => setTimeout(resolve, 50)); // wait for React mount tick
      
      assert.ok(rootElement.innerHTML.length > 0, "React should have rendered the App component into the root element");
      assert.ok(rootElement.innerHTML.includes("SCOPE"), "App text should be present in the mounted DOM");
    } finally {
      // 5. Cleanup
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    }
  });
});
