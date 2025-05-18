"use client";

import Header from "../components/layout/Header";
import "../styles/app.css";
import "../styles/admin.css";

/**
 * Admin layout component for wrapping admin pages.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {React.ReactNode} props.children - The content to be rendered inside the layout.
 * @returns {JSX.Element} The layout with a header and main content area.
 */
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
