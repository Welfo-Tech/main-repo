import Header from "./Header";
import Sidebar from "./Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <Sidebar />
      <main
        className="min-h-screen bg-canvas"
        style={{ marginLeft: "var(--w-sidebar-w)", paddingTop: "48px" }}
      >
        {children}
      </main>
    </>
  );
}
