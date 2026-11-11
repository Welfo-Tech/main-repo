import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isMailConfigured, queueMail, sendMail } from "./mailer.js";
import { config } from "../config.js";

const original = { key: config.RESEND_API_KEY, from: config.MAIL_FROM };

const mail = {
  to: "tech@welfo.local",
  subject: "New case assigned",
  heading: "WFC-2026-0001 assigned to you",
  lines: ["Hello Ravi,", "A case has been assigned."],
  action: { label: "Open the case", url: "https://tech.welfo.local/cases/1" },
};

beforeEach(() => {
  vi.restoreAllMocks();
  (config as { RESEND_API_KEY?: string }).RESEND_API_KEY = "re_test_key";
});

afterEach(() => {
  (config as { RESEND_API_KEY?: string }).RESEND_API_KEY = original.key;
  (config as { MAIL_FROM: string }).MAIL_FROM = original.from;
});

describe("isMailConfigured", () => {
  it("is false without a key", () => {
    (config as { RESEND_API_KEY?: string }).RESEND_API_KEY = undefined;
    expect(isMailConfigured()).toBe(false);
  });
});

describe("sendMail", () => {
  it("posts to resend and reports success", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: "abc" }), { status: 200 }),
    );

    await expect(sendMail(mail)).resolves.toBe(true);

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://api.resend.com/emails");
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.to).toEqual(["tech@welfo.local"]);
    expect(body.html).toContain("WFC-2026-0001");
  });

  it("skips entirely when no key is configured", async () => {
    (config as { RESEND_API_KEY?: string }).RESEND_API_KEY = undefined;
    const fetchMock = vi.spyOn(globalThis, "fetch");

    await expect(sendMail(mail)).resolves.toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns false rather than throwing on a 403 unverified domain", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: "verify a domain" }), { status: 403 }),
    );
    await expect(sendMail(mail)).resolves.toBe(false);
  });

  it("swallows a network failure", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("ECONNREFUSED"));
    await expect(sendMail(mail)).resolves.toBe(false);
  });
});

describe("queueMail", () => {
  it("never throws, even when the send rejects", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("down"));
    expect(() => queueMail(mail)).not.toThrow();
    await new Promise(r => setImmediate(r));
  });
});
