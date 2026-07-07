import React from "react";
import Sidebar from "./Sidebar";

type Props = {
  children: React.ReactNode;
};

export default function AdminLayout({ children }: Props) {
  return (
    <div className="flex min-h-[calc(100vh-72px)]">
      <Sidebar />

      <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
        {children}
      </main>
    </div>
  );
}