import { useEffect, useState } from "react";
import {
  type Application,
  getApplications,
  supabase,
  updateApplicationStatus,
} from "../lib/supabase.js";

type Session = Awaited<
  ReturnType<typeof supabase.auth.getSession>
>["data"]["session"];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:    { label: "Pending",    color: "#94a3b8" },
  reviewing:  { label: "Reviewing",  color: "#f59e0b" },
  selected:   { label: "Selected",   color: "#22c55e" },
  rejected:   { label: "Rejected",   color: "#ef4444" },
};

const STATUS_ORDER = ["pending", "reviewing", "selected", "rejected"];

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_LABELS[status] ?? { label: status, color: "#94a3b8" };
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 12,
        fontWeight: 600,
        color: "#fff",
        background: s.color,
        padding: "2px 10px",
        borderRadius: 20,
        letterSpacing: ".3px",
      }}
    >
      {s.label}
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="adm-detail-row">
      <span className="adm-detail-label">{label}</span>
      <span className="adm-detail-value">{value}</span>
    </div>
  );
}

function DetailLink({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="adm-detail-row">
      <span className="adm-detail-label">{label}</span>
      <a href={value} target="_blank" rel="noopener noreferrer" className="adm-detail-link">
        {value}
      </a>
    </div>
  );
}

function DetailBlock({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="adm-detail-block">
      <span className="adm-detail-label">{label}</span>
      <p className="adm-detail-text">{value}</p>
    </div>
  );
}

interface PanelProps {
  app: Application;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
}

function ApplicationPanel({ app, onClose, onStatusChange }: PanelProps) {
  const [saving, setSaving] = useState(false);

  async function changeStatus(status: string) {
    setSaving(true);
    try {
      await updateApplicationStatus(app.id, status);
      onStatusChange(app.id, status);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="adm-overlay" onClick={onClose} />
      <div className="adm-panel">
        <div className="adm-panel-header">
          <div>
            <h2 className="adm-panel-name">{app.full_name}</h2>
            <p className="adm-panel-meta">
              {app.email} · {app.phone} · Applied {new Date(app.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
          <button className="adm-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="adm-panel-status-row">
          <StatusBadge status={app.status} />
          <div className="adm-status-actions">
            {STATUS_ORDER.filter((s) => s !== app.status).map((s) => (
              <button
                key={s}
                className="adm-status-btn"
                style={{ borderColor: STATUS_LABELS[s]?.color, color: STATUS_LABELS[s]?.color }}
                disabled={saving}
                onClick={() => changeStatus(s)}
              >
                {saving ? "..." : `Mark ${STATUS_LABELS[s]?.label}`}
              </button>
            ))}
          </div>
        </div>

        <div className="adm-panel-body">
          <div className="adm-section-label">Personal</div>
          <DetailRow label="College" value={app.college} />
          <DetailRow label="Degree" value={`${app.degree}, ${app.field_of_study}`} />
          <DetailRow label="Graduation" value={app.graduation_year} />
          <DetailLink label="LinkedIn" value={app.linkedin_url} />
          <DetailLink label="GitHub" value={app.github_url} />
          <DetailLink label="Portfolio" value={app.portfolio_url} />

          <div className="adm-section-label">Role</div>
          <DetailRow label="Available from" value={app.available_from} />
          <DetailRow label="Duration" value={app.duration} />
          <DetailRow label="Work preference" value={app.work_preference} />
          <DetailLink label="Resume" value={app.resume_link} />

          <div className="adm-section-label">Technical</div>
          <DetailBlock label="Frontend skills" value={app.frontend_skills} />
          <DetailBlock label="Backend skills" value={app.backend_skills} />
          <DetailBlock label="Database experience" value={app.db_experience} />
          <DetailBlock label="Notable projects" value={app.notable_projects} />

          <div className="adm-section-label">About this role</div>
          <DetailBlock label="Why Welfo?" value={app.why_welfo} />
          <DetailBlock label="Additional notes" value={app.additional_notes} />
        </div>
      </div>
    </>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) setError(err.message);
    setLoading(false);
  }

  return (
    <div className="adm-login-wrap">
      <div className="adm-login-box">
        <div className="nav-logo" style={{ marginBottom: 28, justifyContent: "center" }}>
          <span className="nav-logo-dot" />
          Welfo Admin
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-field" style={{ marginBottom: 16 }}>
            <label htmlFor="adm-email">Email</label>
            <input
              id="adm-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div className="form-field" style={{ marginBottom: 24 }}>
            <label htmlFor="adm-password">Password</label>
            <input
              id="adm-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          {error && <p className="submit-error" style={{ marginBottom: 16 }}>{error}</p>}
          <button type="submit" className="btn-submit" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
            {loading ? <><span className="spinner" /> Signing in...</> : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [session, setSession] = useState<Session>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [selected, setSelected] = useState<Application | null>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoadingAuth(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    setLoadingApps(true);
    getApplications()
      .then(setApplications)
      .finally(() => setLoadingApps(false));
  }, [session]);

  function handleStatusChange(id: string, status: string) {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a)),
    );
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, status } : prev);
  }

  if (loadingAuth) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <span className="spinner" style={{ width: 28, height: 28, borderColor: "rgba(15,76,129,.2)", borderTopColor: "var(--navy)" }} />
      </div>
    );
  }

  if (!session) return <LoginForm />;

  const filtered = filter === "all"
    ? applications
    : applications.filter((a) => a.status === filter);

  const counts = STATUS_ORDER.reduce<Record<string, number>>((acc, s) => {
    acc[s] = applications.filter((a) => a.status === s).length;
    return acc;
  }, {});

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <a href="/" className="nav-logo">
            <span className="nav-logo-dot" />
            Welfo Fiber Optics
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span className="nav-badge">Admin</span>
            <button
              onClick={() => supabase.auth.signOut()}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--grey-500)" }}
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <div className="adm-wrap">
        <div className="adm-toolbar">
          <div>
            <h1 className="adm-title">Applications</h1>
            <p className="adm-subtitle">{applications.length} total</p>
          </div>
          <div className="adm-filters">
            <button
              className={`adm-filter${filter === "all" ? " active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All ({applications.length})
            </button>
            {STATUS_ORDER.map((s) => (
              <button
                key={s}
                className={`adm-filter${filter === s ? " active" : ""}`}
                onClick={() => setFilter(s)}
              >
                {STATUS_LABELS[s]?.label} ({counts[s] ?? 0})
              </button>
            ))}
          </div>
        </div>

        {loadingApps ? (
          <div style={{ textAlign: "center", padding: 80 }}>
            <span className="spinner" style={{ width: 28, height: 28, borderColor: "rgba(15,76,129,.15)", borderTopColor: "var(--navy)", display: "inline-block" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="adm-empty">No applications {filter !== "all" ? `with status "${filter}"` : "yet"}.</div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>College</th>
                  <th>Preference</th>
                  <th>Duration</th>
                  <th>Applied</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => setSelected(app)}
                    className={selected?.id === app.id ? "selected" : ""}
                  >
                    <td className="adm-name-cell">{app.full_name}</td>
                    <td>{app.email}</td>
                    <td>{app.college}</td>
                    <td>{app.work_preference}</td>
                    <td>{app.duration}</td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {new Date(app.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </td>
                    <td><StatusBadge status={app.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <ApplicationPanel
          app={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </>
  );
}
