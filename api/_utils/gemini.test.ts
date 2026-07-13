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

  test("generateContentWithRetry implements exponential backoff on 503 UNAVAILABLE", async () => {
    let attempts = 0;
    const mockClient = {
      models: {
        generateContent: async () => {
          attempts++;
          if (attempts === 1) {
            const error = new Error("503 Service Unavailable");
            (error as any).status = 503;
            throw error;
          }
          return { text: "Success after retry" };
        }
      }
    };
    
    const result = await generateContentWithRetry(mockClient, {}, 3);
    assert.strictEqual(attempts, 2, "Should have retried exactly once");
    assert.strictEqual(result.text, "Success after retry");
  });
});
