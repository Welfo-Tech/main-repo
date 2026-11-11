import { describe, expect, it } from "vitest";
import { app } from "../app.js";

describe("GET /health", () => {
  it("returns 200 with ok status", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body["status"]).toBe("ok");
    expect(typeof body["uptime"]).toBe("number");
    expect(typeof body["timestamp"]).toBe("string");
  });
});

describe("GET /metrics", () => {
  it("returns prometheus text format", async () => {
    const res = await app.request("/metrics");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/plain");
  });
});

describe("unknown routes", () => {
  it("returns 404 for unmatched paths", async () => {
    const res = await app.request("/does-not-exist");
    expect(res.status).toBe(404);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body["error"]).toBe("not found");
  });
});
