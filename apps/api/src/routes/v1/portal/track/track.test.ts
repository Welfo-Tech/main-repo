import { beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../../../../app.js";
import * as tracking from "../../../../services/tracking.service.js";
import { resetRateLimits } from "../../../../middleware/rate-limit.js";

vi.mock("../../../../services/tracking.service.js");

const found = {
  found: true as const,
  reference: "WFI-2026-0001",
  instrument: "Welfo Laparoscope 10mm 30deg",
  serialNumber: "WF-2024-00002",
  submittedAt: new Date("2026-09-30"),
  caseNumber: "WFC-2026-0001",
  headline: "Your instrument is with our service team.",
  timeline: [],
};

beforeEach(() => {
  vi.clearAllMocks();
  resetRateLimits();
});

describe("GET /api/v1/portal/track", () => {
  it("returns the timeline for a matching reference and email", async () => {
    vi.mocked(tracking.trackRequest).mockResolvedValue(found);

    const res = await app.request(
      "/api/v1/portal/track?ref=WFI-2026-0001&email=anand%40apollodelhi.com",
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as { found: boolean; caseNumber: string };
    expect(body.found).toBe(true);
    expect(body.caseNumber).toBe("WFC-2026-0001");
  });

  it("needs no auth", async () => {
    vi.mocked(tracking.trackRequest).mockResolvedValue({ found: false });
    const res = await app.request("/api/v1/portal/track?ref=WFI-2026-0001&email=a%40b.com");
    expect(res.status).toBe(200);
  });

  it("returns found false rather than 404, so a wrong email cannot confirm a reference exists", async () => {
    vi.mocked(tracking.trackRequest).mockResolvedValue({ found: false });

    const res = await app.request(
      "/api/v1/portal/track?ref=WFI-2026-0001&email=wrong%40person.com",
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as { found: boolean };
    expect(body.found).toBe(false);
    expect(JSON.stringify(body)).not.toContain("WFC-");
  });

  it("returns 400 when email is missing", async () => {
    const res = await app.request("/api/v1/portal/track?ref=WFI-2026-0001");
    expect(res.status).toBe(400);
  });

  it("returns 400 when email is malformed", async () => {
    const res = await app.request("/api/v1/portal/track?ref=WFI-2026-0001&email=nope");
    expect(res.status).toBe(400);
  });

  it("rate limits lookups to slow down guessing", async () => {
    vi.mocked(tracking.trackRequest).mockResolvedValue({ found: false });

    const statuses: number[] = [];
    for (let i = 0; i < 17; i += 1) {
      const res = await app.request(
        `/api/v1/portal/track?ref=WFI-2026-${String(i).padStart(4, "0")}&email=a%40b.com`,
        { headers: { "x-forwarded-for": "198.51.100.7" } },
      );
      statuses.push(res.status);
    }

    expect(statuses.filter(s => s === 200)).toHaveLength(15);
    expect(statuses.filter(s => s === 429)).toHaveLength(2);
  });
});
