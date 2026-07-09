import { test, describe } from "node:test";
import assert from "node:assert";
import handler from "./multilingual-incident.js";

describe("API: /api/multilingual-incident", () => {
  test("returns 405 for non-POST requests", async () => {
    let statusCode = 200;
    let responseData: any = null;

    const req = { method: "GET" } as any;
    const res = {
      status: (code: number) => {
        statusCode = code;
        return { json: (data: any) => { responseData = data; } };
      }
    } as any;

    await handler(req, res);
    assert.strictEqual(statusCode, 405);
  });

  test("returns 400 for invalid payload", async () => {
    let statusCode = 200;
    let responseData: any = null;

    const req = { method: "POST", body: {} } as any;
    const res = {
      status: (code: number) => {
        statusCode = code;
        return { json: (data: any) => { responseData = data; } };
      }
    } as any;

    await handler(req, res);
    assert.strictEqual(statusCode, 400);
    assert.strictEqual(responseData.error, "Invalid payload: rawReports must be an array.");
  });

  test("returns simulation fallback when GEMINI_API_KEY is not set", async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    let statusCode = 200;
    let responseData: any = null;

    const req = { 
      method: "POST", 
      body: { rawReports: [{ lang: "Spanish (ES)" }] } 
    } as any;
    const res = {
      status: (code: number) => {
        statusCode = code;
        return { json: (data: any) => { responseData = data; } };
      }
    } as any;

    await handler(req, res);
    
    assert.strictEqual(statusCode, 200);
    assert.strictEqual(responseData.mode, "SIMULATION_FALLBACK");
    assert.strictEqual(responseData.data.severity, "MEDIUM");

    if (originalKey) process.env.GEMINI_API_KEY = originalKey;
  });
});
