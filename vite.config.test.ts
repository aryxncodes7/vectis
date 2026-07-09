import test from "node:test";
import assert from "node:assert";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
(globalThis as any).__dirname = __dirname;

test("VECTIS Vite Build Configuration Test Suite", async (t) => {
  await t.test("Vite configuration function resolves correctly with standard options", async () => {
    // Dynamically import to ensure globalThis.__dirname is defined first
    const viteConfigModule = await import("./vite.config");
    const viteConfigFn = viteConfigModule.default;
    
    assert.strictEqual(typeof viteConfigFn, "function");
    
    // Call config function as defined in vite.config.ts
    const config = (viteConfigFn as any)();
    
    assert.ok(Array.isArray(config.plugins));
    assert.strictEqual(config.plugins.length, 2); // react() + tailwindcss()
    
    assert.ok(config.resolve);
    assert.ok(config.resolve.alias);
    assert.ok(config.resolve.alias["@"]);
    
    assert.ok(config.server);
    assert.ok("hmr" in config.server);
  });
});
