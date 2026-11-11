"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import TopBar from "../../../components/TopBar";
import {
  type CaseDetail,
  type CasePhotos,
  type RepairEvent,
  api,
  getToken,
  uploadPhoto,
} from "../../../lib/api";
import {
  ACTION_LABEL,
  EVENT_TYPES,
  IRREPARABLE_LABEL,
  STATUS_LABEL,
  TECH_TRANSITIONS,
  statusStyle,
} from "../../../lib/status";

const MAX_PHOTOS = 8;

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [sc, setCase] = useState<CaseDetail | null>(null);
  const [events, setEvents] = useState<RepairEvent[]>([]);
  const [photos, setPhotos] = useState<CasePhotos>({ customer: [], technician: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");

  const [eventType, setEventType] = useState("OBSERVATION");
  const [eventText, setEventText] = useState("");
  const [holdReason, setHoldReason] = useState("");
  const [showHold, setShowHold] = useState(false);
  const [irreparableReason, setIrreparableReason] = useState("");
  const [showIrreparable, setShowIrreparable] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const [detail, evs, pics] = await Promise.all([
        api.get<CaseDetail>(`/api/v1/service-cases/${id}`),
        api.get<RepairEvent[]>(`/api/v1/service-cases/${id}/repair-events`),
        api.get<CasePhotos>(`/api/v1/service-cases/${id}/photos`),
      ]);
      setCase(detail);
      setEvents(evs);
      setPhotos(pics);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load this case");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!getToken()) { router.replace("/login"); return; }
    load();
  }, [load, router]);

  async function run(label: string, fn: () => Promise<void>) {
    setBusy(label);
    setError("");
    setNotice("");
    try {
      await fn();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That did not work");
    } finally {
      setBusy("");
    }
  }

  function advance(next: string, note?: string) {
    return run(next, async () => {
      await api.patch(`/api/v1/service-cases/${id}/progress`, { status: next, ...(note ? { note } : {}) });
      setShowHold(false);
      setHoldReason("");
      setNotice(`Moved to ${STATUS_LABEL[next] ?? next}.`);
    });
  }

  function addEvent() {
    return run("event", async () => {
      await api.post(`/api/v1/service-cases/${id}/repair-events`, {
        eventType,
        description: eventText.trim(),
      });
      setEventText("");
      setNotice("Entry added to the repair log.");
    });
  }

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, MAX_PHOTOS);
    e.target.value = "";
    if (files.length === 0) return;

    await run("photos", async () => {
      const { uploads } = await api.post<{ uploads: { path: string; uploadUrl: string }[] }>(
        `/api/v1/service-cases/${id}/photos`,
        { fileNames: files.map(f => f.name), category: "DIAGNOSIS_PHOTO" },
      );
      const results = await Promise.allSettled(
        uploads.map((u, i) => uploadPhoto(u.uploadUrl, files[i]!)),
      );
      const failed = results.filter(r => r.status === "rejected").length;
      setNotice(
        failed > 0
          ? `${uploads.length - failed} of ${uploads.length} photos uploaded.`
          : `${uploads.length} photo${uploads.length > 1 ? "s" : ""} uploaded.`,
      );
    });
  }

  function proposeIrreparable() {
    return run("irreparable", async () => {
      await api.post(`/api/v1/service-cases/${id}/irreparable`, {
        reason: irreparableReason.trim(),
      });
      setShowIrreparable(false);
      setIrreparableReason("");
      setNotice("Sent to the office for a verdict.");
    });
  }

  if (loading) {
    return (
      <>
        <TopBar />
        <main className="shell" style={{ paddingBlock: "var(--w-s-5)" }}>
          <p className="hint">Loading…</p>
        </main>
      </>
    );
  }

  if (!sc) {
    return (
      <>
        <TopBar />
        <main className="shell" style={{ paddingBlock: "var(--w-s-5)" }}>
          <p className="alert alert--danger">{error || "This case is not available to you."}</p>
          <Link href="/" className="btn btn--outline btn--block" style={{ marginTop: "var(--w-s-4)" }}>
            Back to my cases
          </Link>
        </main>
      </>
    );
  }

  const s = statusStyle(sc.status);
  const nextStates = TECH_TRANSITIONS[sc.status] ?? [];
  const flagOpen = sc.irreparableState === "PROPOSED" || sc.irreparableState === "SECOND_CHANCE";
  const canFlag = !flagOpen && sc.irreparableState !== "CONFIRMED" && nextStates.length > 0;

  return (
    <>
      <TopBar subtitle={sc.caseNumber} />

      <main className="shell" style={{ paddingBlock: "var(--w-s-4)", display: "grid", gap: "var(--w-s-4)" }}>
        <Link href="/" className="hint">&larr; My cases</Link>

        {notice && <p className="alert alert--ok">{notice}</p>}
        {error && <p role="alert" className="alert alert--danger">{error}</p>}

        <section className="card">
          <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--w-s-3)", marginBottom: "var(--w-s-3)" }}>
            <h1 style={{ fontSize: "20px", color: "var(--w-ink)" }}>{sc.caseNumber}</h1>
            <span className="pill" style={s}>{STATUS_LABEL[sc.status] ?? sc.status}</span>
          </div>

          <p style={{ fontSize: "16px", fontWeight: 500 }}>{sc.product.model?.name ?? "Instrument"}</p>
          <p className="hint" style={{ fontFamily: "monospace" }}>{sc.product.serialNumber}</p>
          <p className="hint" style={{ marginTop: "var(--w-s-1)" }}>{sc.organization.name}</p>

          {sc.intakeCondition && (
            <div style={{ marginTop: "var(--w-s-3)", paddingTop: "var(--w-s-3)", borderTop: "1px solid var(--w-border-soft)" }}>
              <p className="eyebrow">Reported fault</p>
              <p style={{ marginTop: "4px" }}>{sc.intakeCondition}</p>
            </div>
          )}

          {sc.status === "ON_HOLD" && sc.holdReason && (
            <p className="alert alert--warn" style={{ marginTop: "var(--w-s-3)" }}>
              <strong>On hold:</strong> {sc.holdReason}
            </p>
          )}

          {flagOpen && (
            <div className="alert alert--danger" style={{ marginTop: "var(--w-s-3)" }}>
              <strong>{IRREPARABLE_LABEL[sc.irreparableState!]}</strong>
              {sc.irreparableReason && <p style={{ marginTop: "4px" }}>{sc.irreparableReason}</p>}
              {sc.irreparableVerdictNote && (
                <p style={{ marginTop: "6px" }}><strong>Office:</strong> {sc.irreparableVerdictNote}</p>
              )}
            </div>
          )}
        </section>

        {nextStates.length > 0 && (
          <section className="card">
            <p className="eyebrow" style={{ marginBottom: "var(--w-s-3)" }}>Update progress</p>
            <div style={{ display: "grid", gap: "var(--w-s-2)" }}>
              {nextStates.map(next =>
                next === "ON_HOLD" ? (
                  <button key={next} className="btn btn--outline btn--block" onClick={() => setShowHold(v => !v)}>
                    {ACTION_LABEL[next] ?? next}
                  </button>
                ) : (
                  <button
                    key={next}
                    className="btn btn--primary btn--block"
                    disabled={busy !== ""}
                    onClick={() => advance(next)}
                  >
                    {busy === next ? "Working…" : ACTION_LABEL[next] ?? STATUS_LABEL[next] ?? next}
                  </button>
                ),
              )}
            </div>

            {showHold && (
              <div style={{ marginTop: "var(--w-s-3)" }}>
                <label className="label" htmlFor="hold">Why is it on hold?</label>
                <textarea
                  id="hold"
                  className="textarea"
                  value={holdReason}
                  onChange={e => setHoldReason(e.target.value)}
                  placeholder="Waiting on a replacement rod lens"
                />
                <button
                  className="btn btn--dark btn--block"
                  style={{ marginTop: "var(--w-s-2)" }}
                  disabled={busy !== "" || holdReason.trim() === ""}
                  onClick={() => advance("ON_HOLD", holdReason.trim())}
                >
                  Put on hold
                </button>
              </div>
            )}
          </section>
        )}

        <section className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--w-s-3)" }}>
            <p className="eyebrow">Photos</p>
            <span className="hint">{photos.technician.length} yours · {photos.customer.length} customer</span>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            onChange={handleFiles}
            style={{ display: "none" }}
          />
          <button
            className="btn btn--dark btn--block"
            disabled={busy !== ""}
            onClick={() => fileRef.current?.click()}
          >
            {busy === "photos" ? "Uploading…" : "Take or add diagnosis photos"}
          </button>

          {photos.technician.length > 0 && (
            <div style={{ marginTop: "var(--w-s-4)" }}>
              <p className="eyebrow" style={{ marginBottom: "var(--w-s-2)" }}>Your diagnosis photos</p>
              <div className="grid-photos">
                {photos.technician.map(p => (
                  <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={p.url}
                      alt={p.fileName}
                      style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--w-border)" }}
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: "var(--w-s-4)" }}>
            <p className="eyebrow" style={{ marginBottom: "var(--w-s-2)" }}>From the customer</p>
            {photos.customer.length === 0 ? (
              <p className="hint">The customer did not send any photos.</p>
            ) : (
              <div className="grid-photos">
                {photos.customer.map(p => (
                  <a key={p.url} href={p.url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={p.url}
                      alt="Reported by the customer"
                      style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--w-border)" }}
                    />
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="card">
          <p className="eyebrow" style={{ marginBottom: "var(--w-s-3)" }}>Add to the repair log</p>

          <label className="label" htmlFor="etype">Entry type</label>
          <select id="etype" className="select" value={eventType} onChange={e => setEventType(e.target.value)}>
            {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>

          <label className="label" htmlFor="etext" style={{ marginTop: "var(--w-s-3)" }}>What happened?</label>
          <textarea
            id="etext"
            className="textarea"
            value={eventText}
            onChange={e => setEventText(e.target.value)}
            placeholder="Stripped the distal end, confirmed seal failure at the objective window"
          />

          <button
            className="btn btn--primary btn--block"
            style={{ marginTop: "var(--w-s-3)" }}
            disabled={busy !== "" || eventText.trim().length < 3}
            onClick={addEvent}
          >
            {busy === "event" ? "Saving…" : "Add entry"}
          </button>

          {events.length > 0 && (
            <ul style={{ listStyle: "none", marginTop: "var(--w-s-5)", display: "grid", gap: "var(--w-s-3)" }}>
              {events.map(ev => (
                <li key={ev.id} style={{ borderLeft: "2px solid var(--w-accent)", paddingLeft: "var(--w-s-3)" }}>
                  <p className="eyebrow">
                    {EVENT_TYPES.find(t => t.value === ev.eventType)?.label ?? ev.eventType}
                    {" · "}
                    {new Date(ev.eventAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                  <p style={{ fontSize: "15px", marginTop: "2px" }}>{ev.description}</p>
                  <p className="hint">{ev.technician.user.name}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {canFlag && (
          <section className="card" style={{ borderColor: "var(--w-danger-edge)" }}>
            <p className="eyebrow" style={{ marginBottom: "var(--w-s-2)" }}>Beyond repair?</p>
            <p className="hint" style={{ marginBottom: "var(--w-s-3)" }}>
              Add your diagnosis photos first. The office reviews the evidence and either
              confirms it or asks you to try once more.
            </p>

            {!showIrreparable ? (
              <button className="btn btn--outline btn--block" onClick={() => setShowIrreparable(true)}>
                Flag as irreparable
              </button>
            ) : (
              <>
                <label className="label" htmlFor="irr">Why can it not be repaired?</label>
                <textarea
                  id="irr"
                  className="textarea"
                  value={irreparableReason}
                  onChange={e => setIrreparableReason(e.target.value)}
                  placeholder="Objective lens assembly shattered; housing is cracked through the weld line"
                />
                <p className="hint" style={{ marginTop: "4px" }}>
                  {irreparableReason.trim().length < 10
                    ? `At least 10 characters (${irreparableReason.trim().length} so far).`
                    : photos.technician.length === 0
                      ? "Add at least one diagnosis photo before sending."
                      : "Ready to send."}
                </p>
                <div style={{ display: "grid", gap: "var(--w-s-2)", marginTop: "var(--w-s-3)" }}>
                  <button
                    className="btn btn--danger btn--block"
                    disabled={busy !== "" || irreparableReason.trim().length < 10 || photos.technician.length === 0}
                    onClick={proposeIrreparable}
                  >
                    {busy === "irreparable" ? "Sending…" : "Send to the office"}
                  </button>
                  <button className="btn btn--outline btn--block" onClick={() => setShowIrreparable(false)}>
                    Cancel
                  </button>
                </div>
              </>
            )}
          </section>
        )}
      </main>
    </>
  );
}
