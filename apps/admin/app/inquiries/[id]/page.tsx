"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../../../components/layout/AdminLayout";
import StatusBadge from "../../../components/common/StatusBadge";
import { api } from "../../../lib/api";
import type { CasePriority, ConvertResult, WebInquiry } from "../../../types/inquiry";
import { ALL_PRIORITIES, URGENCY_LABELS } from "../../../types/inquiry";
import type { Organization } from "../../../types/organization";

const STORAGE_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}/storage/v1/object/public/${process.env.NEXT_PUBLIC_SUPABASE_BUCKET ?? "repair-images"}`;

const labelStyle: React.CSSProperties = {
  fontSize: "var(--w-fs-label)",
  fontFamily: "var(--w-font-head)",
  fontWeight: 500,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "var(--w-text-2)",
  display: "block",
  marginBottom: "var(--w-s-1)",
};

const inputStyle: React.CSSProperties = {
  height: "var(--w-control-h)",
  padding: "0 var(--w-s-2)",
  fontSize: "var(--w-fs-body)",
  fontFamily: "var(--w-font-body)",
  border: "1px solid var(--w-border)",
  background: "var(--w-sunken)",
  color: "var(--w-text-1)",
  width: "100%",
  outline: "none",
};

const panelStyle: React.CSSProperties = {
  background: "var(--w-plate)",
  border: "1px solid var(--w-border)",
  padding: "var(--w-s-5)",
  marginBottom: "var(--w-s-4)",
};

const sectionHead: React.CSSProperties = {
  fontSize: "var(--w-fs-eyebrow)",
  fontFamily: "var(--w-font-head)",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.09em",
  color: "var(--w-text-2)",
  marginBottom: "var(--w-s-3)",
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(130px, 200px) 1fr", gap: "var(--w-s-4)", padding: "var(--w-s-2) 0", borderBottom: "1px solid var(--w-border-soft)" }}>
      <span style={{ ...labelStyle, marginBottom: 0 }}>{label}</span>
      <span style={{ fontSize: "var(--w-fs-body)", color: "var(--w-text-1)" }}>{value}</span>
    </div>
  );
}

export default function InquiryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [inquiry, setInquiry] = useState<WebInquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [orgOverride, setOrgOverride] = useState("");
  const [orgOptions, setOrgOptions] = useState<Organization[]>([]);
  const [createContact, setCreateContact] = useState(true);
  const [priority, setPriority] = useState<CasePriority>("NORMAL");
  const [intakeCondition, setIntakeCondition] = useState("");
  const [converting, setConverting] = useState(false);
  const [result, setResult] = useState<ConvertResult | null>(null);

  const fetchInquiry = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get<WebInquiry>(`/api/v1/inquiries/${id}`);
      setInquiry(data);
      const mapped: Record<string, CasePriority> = { LOW: "LOW", NORMAL: "NORMAL", HIGH: "HIGH", CRITICAL: "CRITICAL" };
      setPriority(mapped[data.urgency] ?? "NORMAL");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load inquiry");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchInquiry(); }, [fetchInquiry]);

  const needsOrg = inquiry !== null && inquiry.product.ownerOrgId === null;

  useEffect(() => {
    if (!needsOrg) return;
    api.get<Organization[]>("/api/v1/organizations")
      .then(setOrgOptions)
      .catch(() => setOrgOptions([]));
  }, [needsOrg]);

  async function handleConvert() {
    setConverting(true);
    setError("");
    try {
      const payload = {
        createContactFromSubmitter: createContact,
        priority,
        ...(orgOverride && { organizationId: orgOverride }),
        ...(intakeCondition.trim() && { intakeCondition: intakeCondition.trim() }),
      };
      setResult(await api.post<ConvertResult>(`/api/v1/inquiries/${id}/convert`, payload));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion failed");
    } finally {
      setConverting(false);
    }
  }

  if (loading) {
    return <AdminLayout><div style={{ padding: "var(--w-s-5) var(--w-s-6)" }}><p style={{ color: "var(--w-text-mute)" }}>Loading…</p></div></AdminLayout>;
  }

  if (!inquiry) {
    return (
      <AdminLayout>
        <div style={{ padding: "var(--w-s-5) var(--w-s-6)" }}>
          <p style={{ color: "var(--w-attention-fg)" }}>{error || "Inquiry not found."}</p>
          <Link href="/inquiries" style={{ color: "var(--w-link)", fontSize: "var(--w-fs-body)" }}>&larr; Back to inquiries</Link>
        </div>
      </AdminLayout>
    );
  }

  const alreadyConverted = inquiry.status === "CONVERTED";

  return (
    <AdminLayout>
      <div style={{ padding: "var(--w-s-5) var(--w-s-6)", maxWidth: "900px" }}>
        <Link href="/inquiries" style={{ color: "var(--w-link)", fontSize: "var(--w-fs-caption)", fontFamily: "var(--w-font-head)", fontWeight: 600 }}>
          &larr; Web Inquiries
        </Link>

        <div className="flex items-center justify-between" style={{ marginTop: "var(--w-s-3)", marginBottom: "var(--w-s-5)" }}>
          <h1 className="font-head font-semibold" style={{ fontSize: "var(--w-fs-page)", color: "var(--w-text-1)" }}>
            {inquiry.inquiryNumber}
          </h1>
          <StatusBadge status={inquiry.status} />
        </div>

        {result && (
          <div style={{ ...panelStyle, background: "var(--w-success-tint)", border: "1px solid var(--w-success-edge)" }}>
            <p style={{ ...sectionHead, color: "var(--w-success-fg)" }}>Converted</p>
            <p style={{ fontSize: "var(--w-fs-body)", color: "var(--w-success-fg)", marginBottom: "var(--w-s-3)" }}>
              Ticket {result.ticket.ticketNumber} and service case {result.serviceCase.caseNumber} created.
            </p>
            <button
              onClick={() => router.push(`/service-cases/${result.serviceCase.id}`)}
              className="font-head font-semibold uppercase"
              style={{
                height: "var(--w-control-h)", paddingInline: "var(--w-s-4)",
                fontSize: "var(--w-fs-label)", letterSpacing: "0.06em",
                background: "var(--w-accent-strong)", color: "#fff", border: "none", cursor: "pointer",
              }}
            >
              Open service case
            </button>
          </div>
        )}

        <div style={panelStyle}>
          <p style={sectionHead}>Verified instrument</p>
          <Row label="Serial number" value={<span style={{ fontFamily: "monospace", fontWeight: 600 }}>{inquiry.serialNumber}</span>} />
          <Row label="Model" value={inquiry.product.model?.name ?? "Unregistered model"} />
          <Row label="Manufacturer" value={inquiry.product.model?.manufacturer ?? "—"} />
          <Row label="Product status" value={<StatusBadge status={inquiry.product.status} variant="row" />} />
          <Row
            label="Owner on record"
            value={
              inquiry.product.ownerOrg
                ? <Link href={`/organizations`} style={{ color: "var(--w-link)" }}>{inquiry.product.ownerOrg.name}</Link>
                : <span style={{ color: "var(--w-attention-fg)" }}>No owner organization on record</span>
            }
          />
        </div>

        <div style={panelStyle}>
          <p style={sectionHead}>Submitted by</p>
          <Row label="Name" value={inquiry.submitterName} />
          <Row label="Email" value={<a href={`mailto:${inquiry.submitterEmail}`} style={{ color: "var(--w-link)" }}>{inquiry.submitterEmail}</a>} />
          <Row label="Phone" value={inquiry.submitterPhone ?? "—"} />
          <Row label="Claims to be from" value={inquiry.organizationName} />
          <Row label="City" value={inquiry.city ?? "—"} />
          <Row label="Urgency" value={URGENCY_LABELS[inquiry.urgency]} />
          <Row label="Received" value={new Date(inquiry.submittedAt).toLocaleString("en-IN")} />
          <div style={{ paddingTop: "var(--w-s-3)" }}>
            <span style={labelStyle}>Reported problem</span>
            <p style={{ fontSize: "var(--w-fs-body)", lineHeight: 1.6, color: "var(--w-text-1)" }}>
              {inquiry.reportedProblem}
            </p>
          </div>

          {inquiry.photoPaths.length > 0 && (
            <div style={{ paddingTop: "var(--w-s-4)" }}>
              <span style={labelStyle}>Photos from the customer ({inquiry.photoPaths.length})</span>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                  gap: "var(--w-s-3)",
                }}
              >
                {inquiry.photoPaths.map(path => {
                  const url = `${STORAGE_BASE}/${path}`;
                  return (
                    <a key={path} href={url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={url}
                        alt="Reported fault"
                        style={{
                          width: "100%",
                          aspectRatio: "1",
                          objectFit: "cover",
                          border: "1px solid var(--w-border)",
                          display: "block",
                        }}
                      />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {inquiry.product.ownerOrg && inquiry.organizationName.trim().toLowerCase() !== inquiry.product.ownerOrg.name.trim().toLowerCase() && (
          <div style={{ ...panelStyle, background: "var(--w-waiting-tint)", border: "1px solid var(--w-waiting-edge)" }}>
            <p style={{ ...sectionHead, color: "var(--w-waiting-fg)", marginBottom: "var(--w-s-2)" }}>Check before converting</p>
            <p style={{ fontSize: "var(--w-fs-body)", color: "var(--w-waiting-fg)", lineHeight: 1.6 }}>
              The submitter says they are from <strong>{inquiry.organizationName}</strong>, but this
              instrument is registered to <strong>{inquiry.product.ownerOrg.name}</strong>. Confirm
              who owns it before opening a case.
            </p>
          </div>
        )}

        {!alreadyConverted && !result && (
          <div style={panelStyle}>
            <p style={sectionHead}>Open service case</p>

            {needsOrg && (
              <div style={{ marginBottom: "var(--w-s-4)" }}>
                <label style={labelStyle}>Organization *</label>
                <select style={inputStyle} value={orgOverride} onChange={e => setOrgOverride(e.target.value)}>
                  <option value="">Select an organization…</option>
                  {orgOptions.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
                <span style={{ fontSize: "var(--w-fs-caption)", color: "var(--w-text-mute)", marginTop: "4px", display: "block" }}>
                  This product has no owner on record, so the case needs one.
                </span>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--w-s-4)", marginBottom: "var(--w-s-4)" }}>
              <div>
                <label style={labelStyle}>Case priority</label>
                <select style={inputStyle} value={priority} onChange={e => setPriority(e.target.value as CasePriority)}>
                  {ALL_PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Intake condition</label>
                <input
                  style={inputStyle}
                  value={intakeCondition}
                  onChange={e => setIntakeCondition(e.target.value)}
                  placeholder="Noted on arrival"
                />
              </div>
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: "var(--w-s-2)", marginBottom: "var(--w-s-4)", cursor: "pointer" }}>
              <input type="checkbox" checked={createContact} onChange={e => setCreateContact(e.target.checked)} />
              <span style={{ fontSize: "var(--w-fs-body)", color: "var(--w-text-1)" }}>
                Add {inquiry.submitterName} as a contact on the organization
              </span>
            </label>

            {error && (
              <p style={{ color: "var(--w-attention-fg)", background: "var(--w-attention-tint)", border: "1px solid var(--w-attention-edge)", padding: "var(--w-s-2) var(--w-s-3)", fontSize: "var(--w-fs-body)", marginBottom: "var(--w-s-4)" }}>
                {error}
              </p>
            )}

            <button
              onClick={handleConvert}
              disabled={converting || (needsOrg && !orgOverride)}
              className="font-head font-semibold uppercase"
              style={{
                height: "var(--w-control-h)",
                paddingInline: "var(--w-s-5)",
                fontSize: "var(--w-fs-label)",
                letterSpacing: "0.06em",
                background: "var(--w-accent-strong)",
                color: "#fff",
                border: "none",
                cursor: converting || (needsOrg && !orgOverride) ? "not-allowed" : "pointer",
                opacity: converting || (needsOrg && !orgOverride) ? 0.6 : 1,
              }}
            >
              {converting ? "Converting…" : "Create ticket and service case"}
            </button>
          </div>
        )}

        {alreadyConverted && !result && (
          <div style={panelStyle}>
            <p style={{ fontSize: "var(--w-fs-body)", color: "var(--w-text-2)" }}>
              This inquiry has already been converted.{" "}
              {inquiry.convertedCaseId && (
                <Link href={`/service-cases/${inquiry.convertedCaseId}`} style={{ color: "var(--w-link)", fontWeight: 500 }}>
                  Open the service case
                </Link>
              )}
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
