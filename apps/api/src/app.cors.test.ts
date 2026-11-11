import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ALLOWED = "https://welfoendovision.com,https://admin.welfoendovision.com";
const original = process.env.CORS_ORIGINS;

/**
 * The allowlist is read once at module load, so each case has to set the
 * environment and then force app.js and config.js to be evaluated again.
 */
async function loadResolver(value: string | undefined) {
  if (value === undefined) delete process.env.CORS_ORIGINS;
  else process.env.CORS_ORIGINS = value;
  vi.resetModules();
  const mod = await import("./app.js");
  return mod.resolveCorsOrigin;
}

beforeEach(() => vi.resetModules());
afterEach(() => {
  if (original === undefined) delete process.env.CORS_ORIGINS;
  else process.env.CORS_ORIGINS = original;
});

describe("CORS origin allowlist", () => {
  it("allows a configured origin", async () => {
    const resolve = await loadResolver(ALLOWED);
    expect(resolve("https://welfoendovision.com")).toBe("https://welfoendovision.com");
    expect(resolve("https://admin.welfoendovision.com")).toBe("https://admin.welfoendovision.com");
  });

  it("refuses an origin that is not configured", async () => {
    const resolve = await loadResolver(ALLOWED);
    expect(resolve("https://evil.example")).toBeNull();
  });

  it("refuses a lookalike subdomain", async () => {
    const resolve = await loadResolver(ALLOWED);
    expect(resolve("https://welfoendovision.com.evil.example")).toBeNull();
    expect(resolve("https://notwelfoendovision.com")).toBeNull();
  });

  it("ignores a trailing slash in configuration", async () => {
    const resolve = await loadResolver("https://welfoendovision.com/");
    expect(resolve("https://welfoendovision.com")).toBe("https://welfoendovision.com");
  });

  it("falls back to open when unset, for local work", async () => {
    const resolve = await loadResolver(undefined);
    expect(resolve("http://localhost:3002")).toBe("http://localhost:3002");
  });
});
