import { test, describe } from "node:test";
import assert from "node:assert";
import { getGeminiClient, generateContentWithRetry } from "./gemini.js";

describe("API Utils: gemini.ts", () => {
  test("getGeminiClient returns null when API key is missing", () => {
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    
    const client = getGeminiClient();
    assert.strictEqual(client, null);
    
    if (originalKey) process.env.GEMINI_API_KEY = originalKey;
  });

  test("generateContentWithRetry handles successful call", async () => {
    const mockClient = {
      models: {
        generateContent: async () => ({ text: "Success" })
      }
    };
    
    const result = await generateContentWithRetry(mockClient, {});
    assert.strictEqual(result.text, "Success");
  });

  test("generateContentWithRetry throws non-503 errors immediately", async () => {
    const mockClient = {
      models: {
        generateContent: async () => { throw new Error("403 Forbidden"); }
      }
    };
    
    try {
      await generateContentWithRetry(mockClient, {});
      assert.fail("Should have thrown");
    } catch (e: any) {
      assert.strictEqual(e.message, "403 Forbidden");
    }
  });
});
