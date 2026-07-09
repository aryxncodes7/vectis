import { test, describe } from "node:test";
import assert from "node:assert";
import handler from "./health.js";

describe("API: /api/health", () => {
  test("returns 405 for non-GET/POST requests", async () => {
    let statusCode = 200;
    let responseData: any = null;

    const req = { method: "PUT" } as any;
    const res = {
      status: (code: number) => {
        statusCode = code;
        return { json: (data: any) => { responseData = data; } };
      }
    } as any;

    await handler(req, res);
    assert.strictEqual(statusCode, 405);
    assert.deepStrictEqual(responseData, { error: "Method not allowed" });
  });

  test("returns simulation fallback when GEMINI_API_KEY is not set", async () => {
    // Ensure API key is missing
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    let statusCode = 200;
    let responseData: any = null;

    const req = { method: "GET" } as any;
    const res = {
      status: (code: number) => {
        statusCode = code;
        return { json: (data: any) => { responseData = data; } };
      },
      json: (data: any) => { responseData = data; }
    } as any;

    await handler(req, res);
    
    assert.strictEqual(responseData.mode, "UNCONFIGURED");

    // Restore API key
    if (originalKey) process.env.GEMINI_API_KEY = originalKey;
  });
});
