"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json() as { accessToken?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Login failed");
        return;
      }
      localStorage.setItem("accessToken", data.accessToken ?? "");
      router.push("/admin-dashboard");
    } catch {
      setError("Cannot reach the server. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen bg-canvas flex items-center justify-center"
      style={{ padding: "var(--w-s-5)" }}
    >
      <div
        className="bg-plate border border-border"
        style={{ width: "100%", maxWidth: "360px", padding: "var(--w-s-6)" }}
      >
        <div className="mb-5">
          <span
            className="font-head font-semibold"
            style={{ fontSize: "22px", color: "var(--w-brand)", letterSpacing: "0.04em" }}
          >
            WELFO
          </span>
          <p
            className="mt-1"
            style={{ fontSize: "var(--w-fs-caption)", color: "var(--w-text-2)" }}
          >
            Operations Platform — Admin
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="email"
              className="font-head font-medium uppercase"
              style={{ fontSize: "var(--w-fs-label)", color: "var(--w-text-2)", letterSpacing: "0.06em" }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                height: "var(--w-control-h)",
                padding: "0 var(--w-s-2)",
                fontSize: "var(--w-fs-body)",
                fontFamily: "var(--w-font-body)",
                border: "1px solid var(--w-border)",
                background: "var(--w-sunken)",
                color: "var(--w-text-1)",
                borderRadius: "var(--w-radius)",
                outline: "none",
                width: "100%",
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="password"
              className="font-head font-medium uppercase"
              style={{ fontSize: "var(--w-fs-label)", color: "var(--w-text-2)", letterSpacing: "0.06em" }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                height: "var(--w-control-h)",
                padding: "0 var(--w-s-2)",
                fontSize: "var(--w-fs-body)",
                fontFamily: "var(--w-font-body)",
                border: "1px solid var(--w-border)",
                background: "var(--w-sunken)",
                color: "var(--w-text-1)",
                borderRadius: "var(--w-radius)",
                outline: "none",
                width: "100%",
              }}
            />
          </div>

          {error && (
            <p
              style={{
                fontSize: "var(--w-fs-caption)",
                color: "var(--w-attention-fg)",
                background: "var(--w-attention-tint)",
                border: "1px solid var(--w-attention-edge)",
                padding: "var(--w-s-2) var(--w-s-3)",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="font-head font-semibold uppercase"
            style={{
              height: "var(--w-control-h)",
              background: loading ? "var(--w-text-mute)" : "var(--w-accent-strong)",
              color: "#fff",
              border: "none",
              fontSize: "var(--w-fs-label)",
              letterSpacing: "0.08em",
              cursor: loading ? "not-allowed" : "pointer",
              borderRadius: "var(--w-radius)",
              transition: "background var(--w-dur-fast)",
            }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
