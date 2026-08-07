import React from "react";
import Sidebar from "./Sidebar";

type Props = {
  children: React.ReactNode;
};

export default function AdminLayout({ children }: Props) {
  return (
    <div className="flex min-h-[calc(100vh-72px)]">
      <Sidebar />

      <main className="ml-60 flex-1 overflow-y-auto ">
        {children}
      </main>
    </div>
  );
}