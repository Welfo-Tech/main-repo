import AdminLayout from "../../components/layout/AdminLayout";

export default function TechnicianPortalPage() {
  return (
    <AdminLayout>
      <div style={{ padding: "var(--w-s-5) var(--w-s-6)" }}>
        <h1
          className="font-head font-semibold"
          style={{ fontSize: "var(--w-fs-page)", color: "var(--w-text-1)", marginBottom: "var(--w-s-4)" }}
        >
          Technician Portal
        </h1>
        <p style={{ fontSize: "var(--w-fs-body)", color: "var(--w-text-2)" }}>
          Technician-facing features coming soon.
        </p>
      </div>
    </AdminLayout>
  );
}
