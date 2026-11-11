import React from "react";
import CustomerSidebar from "./CustomerSidebar";

type Props = {
  children: React.ReactNode;
};

export default function CustomerLayout({ children }: Props) {
  return (
    <div className="flex min-h-[calc(100vh-72px)]">
      <CustomerSidebar />

      <main className="flex-1 bg-slate-50 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}