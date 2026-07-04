import React from "react";

type Props = {
  children: React.ReactNode;
};

export function AdminLayout({ children }: Props): React.ReactElement {
  return (
    <div className="grid grid-cols-[240px_1fr] grid-rows-[64px_1fr] min-h-screen bg-slate-50 md:grid-cols-1 md:grid-rows-[64px_56px_1fr]">
      <main className="col-start-2 row-start-2 p-6 overflow-auto md:col-start-1 md:row-start-3">
        {children}
      </main>
    </div>
  );
}

export default AdminLayout;

