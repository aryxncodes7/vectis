import { test, describe } from "node:test";
import assert from "node:assert";
import handler from "./crowd-decongestion.js";

describe("API: /api/crowd-decongestion", () => {
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
    assert.deepStrictEqual(responseData, { error: "Method not allowed" });
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
    assert.strictEqual(responseData.error, "Invalid payload: gatesData and physicalSignage must be arrays.");
  });

  test("returns simulation fallback when GEMINI_API_KEY is not set", async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    let statusCode = 200;
    let responseData: any = null;

    const req = { 
      method: "POST", 
      body: { gatesData: [{ loadPercentage: 90 }], physicalSignage: [] } 
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
    assert.strictEqual(responseData.data.status, "WARNING");

    if (originalKey) process.env.GEMINI_API_KEY = originalKey;
  });
});
