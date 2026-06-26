import React from "react";
// import Sidebar from "./Sidebar";
import styles from "./AdminLayout.module.css";

type Props = {
  children: React.ReactNode;
};

export function AdminLayout({ children }: Props): React.ReactElement {
  return (
    <div className={styles.root}>
      <main className={styles.main}>{children}</main>
    </div>
  );
}

export default AdminLayout;
