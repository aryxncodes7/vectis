import test from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test("SCOPE Bootstrap Entry Verification Suite", async (t) => {
  await t.test("main.tsx structure, styles and React strict mounting checks", () => {
    const mainPath = path.resolve(__dirname, "main.tsx");
    assert.ok(fs.existsSync(mainPath), "main.tsx file must exist");
    
    const content = fs.readFileSync(mainPath, "utf8");
    
    // Check key imports and structure
    assert.ok(content.includes("react"), "React import is required");
    assert.ok(content.includes("react-dom/client"), "react-dom/client is required for mounting");
    assert.ok(content.includes("App.tsx") || content.includes("App"), "App component must be imported");
    assert.ok(content.includes("index.css"), "index.css stylesheet must be imported");
    
    // Verify mounting target
    assert.ok(content.includes("document.getElementById('root')!"), "Mounting target root must be specified");
    assert.ok(content.includes("StrictMode"), "App should be wrapped in StrictMode");
  });
});
