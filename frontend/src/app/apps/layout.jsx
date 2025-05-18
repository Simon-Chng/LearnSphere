"use client";

import { usePathname } from "next/navigation";
import Header from "../components/layout/Header";
import AppsSidebar from "../components/sidebar/AppsSidebar";
import { useAppNavigation } from "../hooks/useAppNavigation";
import "../styles/app.css";
import "../styles/sidebar.css";

/**
 * Layout component for the Apps section of the site.
 * Includes a header, sidebar for category navigation, and main content area.
 *
 * Uses `useAppNavigation` to manage sidebar state and selected category.
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The main content to be displayed within the layout
 * @returns {JSX.Element} The rendered layout with sidebar and header
 */
export default function AppsLayout({ children }) {
  const pathname = usePathname();
  const category = pathname === '/apps' ? 'all' : pathname.split('/').pop();

  const {
    isSidebarOpen,
    setIsSidebarOpen,
    selectedCategory,
    categories,
    handleCategorySelect,
    onShowAllFeatures
  } = useAppNavigation(category);

  return (
    <div className="app-container" data-path={pathname}>
      <Header onToggleSidebar={() => setIsSidebarOpen(prev => !prev)} />
      <AppsSidebar
        isOpen={isSidebarOpen}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
        onShowAllFeatures={onShowAllFeatures}
      />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
}
