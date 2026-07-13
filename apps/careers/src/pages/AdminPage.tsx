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
  pending:   { label: "Pending",   color: "#94a3b8" },
  reviewing: { label: "Reviewing", color: "#f59e0b" },
  selected:  { label: "Selected",  color: "#22c55e" },
  rejected:  { label: "Rejected",  color: "#ef4444" },
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
        padding: "3px 12px",
        borderRadius: 20,
        letterSpacing: ".3px",
      }}
    >
      {s.label}
    </span>
  );
}

function AdminNav({ onBack }: { onBack?: () => void }) {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <a href="/" className="nav-logo">
          <span className="nav-logo-dot" />
          Welfo Fiber Optics
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {onBack && (
            <button className="adm-back-btn" onClick={onBack}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Applications
            </button>
          )}
          <span className="nav-badge">Vansh</span>
          <button
            onClick={() => supabase.auth.signOut()}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--grey-500)" }}
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}

interface DetailProps {
  app: Application;
  onBack: () => void;
  onStatusChange: (id: string, status: string) => void;
}

function ApplicationDetail({ app, onBack, onStatusChange }: DetailProps) {
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(app.status);

  async function changeStatus(next: string) {
    setSaving(true);
    try {
      await updateApplicationStatus(app.id, next);
      setStatus(next);
      onStatusChange(app.id, next);
    } finally {
      setSaving(false);
    }
  }

  const appliedDate = new Date(app.created_at).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <>
      <AdminNav onBack={onBack} />
      <div className="adm-detail-wrap">
        <div className="adm-detail-header">
          <div className="adm-detail-title-row">
            <div>
              <h1 className="adm-detail-name">{app.full_name}</h1>
              <p className="adm-detail-meta">
                {app.email} &middot; {app.phone} &middot; Applied {appliedDate}
              </p>
            </div>
            <div className="adm-detail-status-row">
              <StatusBadge status={status} />
              <div className="adm-status-actions">
                {STATUS_ORDER.filter((s) => s !== status).map((s) => (
                  <button
                    key={s}
                    className="adm-status-btn"
                    style={{ borderColor: STATUS_LABELS[s]?.color, color: STATUS_LABELS[s]?.color }}
                    disabled={saving}
                    onClick={() => changeStatus(s)}
                  >
                    {saving ? "Saving..." : `Mark ${STATUS_LABELS[s]?.label}`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="adm-detail-body">
          <div className="adm-detail-grid">
            <div className="adm-detail-col">
              <div className="adm-card">
                <div className="adm-card-label">Personal</div>
                <div className="adm-card-rows">
                  <div className="adm-row"><span>College</span><span>{app.college}</span></div>
                  <div className="adm-row"><span>Degree</span><span>{app.degree}, {app.field_of_study}</span></div>
                  <div className="adm-row"><span>Graduation</span><span>{app.graduation_year}</span></div>
                  {app.linkedin_url && (
                    <div className="adm-row">
                      <span>LinkedIn</span>
                      <a href={app.linkedin_url} target="_blank" rel="noopener noreferrer">{app.linkedin_url}</a>
                    </div>
                  )}
                  {app.github_url && (
                    <div className="adm-row">
                      <span>GitHub</span>
                      <a href={app.github_url} target="_blank" rel="noopener noreferrer">{app.github_url}</a>
                    </div>
                  )}
                  {app.portfolio_url && (
                    <div className="adm-row">
                      <span>Portfolio</span>
                      <a href={app.portfolio_url} target="_blank" rel="noopener noreferrer">{app.portfolio_url}</a>
                    </div>
                  )}
                </div>
              </div>

              <div className="adm-card">
                <div className="adm-card-label">Role</div>
                <div className="adm-card-rows">
                  <div className="adm-row"><span>Available from</span><span>{app.available_from}</span></div>
                  <div className="adm-row"><span>Duration</span><span>{app.duration}</span></div>
                  <div className="adm-row"><span>Work preference</span><span>{app.work_preference}</span></div>
                  <div className="adm-row">
                    <span>Resume</span>
                    <a href={app.resume_link} target="_blank" rel="noopener noreferrer">Open resume</a>
                  </div>
                </div>
              </div>
            </div>

            <div className="adm-detail-col">
              <div className="adm-card">
                <div className="adm-card-label">Technical skills</div>
                <div className="adm-text-section">
                  <p className="adm-text-label">Frontend</p>
                  <p className="adm-text-body">{app.frontend_skills}</p>
                </div>
                <div className="adm-text-section">
                  <p className="adm-text-label">Backend</p>
                  <p className="adm-text-body">{app.backend_skills}</p>
                </div>
                <div className="adm-text-section">
                  <p className="adm-text-label">Databases</p>
                  <p className="adm-text-body">{app.db_experience}</p>
                </div>
              </div>

              <div className="adm-card">
                <div className="adm-card-label">Notable projects</div>
                <p className="adm-text-body" style={{ marginTop: 4 }}>{app.notable_projects}</p>
              </div>
            </div>
          </div>

          <div className="adm-card adm-card-full">
            <div className="adm-card-label">Why Welfo?</div>
            <p className="adm-text-body" style={{ marginTop: 4 }}>{app.why_welfo}</p>
          </div>

          {app.additional_notes && (
            <div className="adm-card adm-card-full">
              <div className="adm-card-label">Additional notes</div>
              <p className="adm-text-body" style={{ marginTop: 4 }}>{app.additional_notes}</p>
            </div>
          )}
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
  }

  if (loadingAuth) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <span className="spinner" style={{ width: 28, height: 28, borderColor: "rgba(15,76,129,.2)", borderTopColor: "var(--navy)" }} />
      </div>
    );
  }

  if (!session) return <LoginForm />;

  if (selected) {
    return (
      <ApplicationDetail
        app={selected}
        onBack={() => setSelected(null)}
        onStatusChange={handleStatusChange}
      />
    );
  }

  const filtered = filter === "all"
    ? applications
    : applications.filter((a) => a.status === filter);

  const counts = STATUS_ORDER.reduce<Record<string, number>>((acc, s) => {
    acc[s] = applications.filter((a) => a.status === s).length;
    return acc;
  }, {});

  return (
    <>
      <AdminNav />
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
                  <tr key={app.id} onClick={() => setSelected(app)}>
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
    </>
  );
}
