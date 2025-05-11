"use client";

import Header from "../components/layout/Header";
import "../styles/app.css";
import "../styles/admin.css";

export default function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      <Header onToggleSidebar={() => {}} />
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
