"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { login } from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email.trim().toLowerCase(), password);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        background: "var(--w-ink-gradient)",
        paddingBlock: "var(--w-s-6)",
      }}
    >
      <div className="shell" style={{ maxWidth: "420px", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: "var(--w-s-5)" }}>
          <div
            style={{
              background: "#fff",
              borderRadius: "var(--w-radius)",
              padding: "var(--w-s-3) var(--w-s-4)",
              display: "inline-block",
            }}
          >
            <Image src="/logo.png" alt="Welfo Endovision" width={666} height={259} priority style={{ height: "40px", width: "auto" }} />
          </div>
          <p style={{ color: "var(--w-text-invert-2)", marginTop: "var(--w-s-3)", fontSize: "15px" }}>
            Technician portal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card" style={{ padding: "var(--w-s-5)" }}>
          <h1 style={{ fontSize: "20px", marginBottom: "var(--w-s-4)", color: "var(--w-ink)" }}>
            Sign in
          </h1>

          <div style={{ marginBottom: "var(--w-s-4)" }}>
            <label className="label" htmlFor="email">Email</label>
            <input
              id="email"
              className="input"
              type="email"
              inputMode="email"
              autoComplete="username"
              autoCapitalize="none"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@welfo.local"
              required
            />
          </div>

          <div style={{ marginBottom: "var(--w-s-5)" }}>
            <label className="label" htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p role="alert" className="alert alert--danger" style={{ marginBottom: "var(--w-s-4)" }}>
              {error}
            </p>
          )}

          <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>

          <p className="hint" style={{ marginTop: "var(--w-s-4)", textAlign: "center" }}>
            Credentials are issued by the office. Contact them if you cannot get in.
          </p>
        </form>
      </div>
    </main>
  );
}
