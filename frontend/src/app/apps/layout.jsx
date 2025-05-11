"use client";

import { usePathname } from "next/navigation";
import Header from "../components/layout/Header";
import AppsSidebar from "../components/sidebar/AppsSidebar";
import { useAppNavigation } from "../hooks/useAppNavigation";
import "../styles/app.css";
import "../styles/sidebar.css";

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
